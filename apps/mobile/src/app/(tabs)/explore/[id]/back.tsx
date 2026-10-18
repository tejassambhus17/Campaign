import { useCurrency } from "../../../../lib/CurrencyProvider";
import { formatMoney, formatNativeMoney, inputForUsd, moneyInputWithinLimits, referenceDescription, usdFromInput } from "../../../../lib/currency";
import { useCallback, useRef, useState } from "react";
import { BackHandler, Keyboard, ScrollView, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { Campaign, quote, number, Payment } from "../../../../lib/types";
import { refresh, useConfig } from "../../../../lib/session";
import { audienceCampaign } from "../../../../lib/public-campaign";
import { Text, Button, IconButton, PageHeader, fonts, ErrorState, Loading, Notice, Pill, Screen, useTheme } from "../../../../components/ui";
import { CampaignCover, Disclosures, Funding, ShareButton } from "../../../../features/campaign";
import { ContributionPresets } from "../../../../features/contributions/ContributionPresets";
import { InfoSheet, SummaryLink } from "../../../../components/Information";

export default function BackCampaign() {
  const { colors, styles, scheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({ queryKey: ["campaign", id], queryFn: () => api<Campaign>(`/campaigns/${id}`) });
  const config = useConfig();
  const currency = useCurrency();
  const [moneySnapshot, setMoneySnapshot] = useState(() => currency.snapshot);
  const money = (usd: number) => formatMoney(usd, moneySnapshot);
  const [reviewQuote, setReviewQuote] = useState<ReturnType<typeof quote> | null>(null);
  const [reviewFeeRate, setReviewFeeRate] = useState(0);
  const [amount, setAmount] = useState(() => inputForUsd(25, currency.snapshot));
  const [stage, setStage] = useState<"choose" | "review" | "result">("choose");
  const [outcome, setOutcome] = useState("successful");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const scroll = useRef<ScrollView>(null);
  const key = useRef("");
  const paying = useRef(false);
  const value = usdFromInput(amount, moneySnapshot) ?? NaN;
  const valid = Number.isFinite(value) && value >= 1 && value <= 10000 && moneyInputWithinLimits(amount, moneySnapshot, 1, 10000);
  const currentQuote = stage === "review" && reviewQuote ? reviewQuote : quote(valid ? value : 0, config.data);
  const feeRate = stage === "review" ? reviewFeeRate : Number(((config.data?.feeRate ?? 0) * 100).toFixed(2));
  const goBack = useCallback(() => {
    if (paying.current) return;
    Keyboard.dismiss();
    setShowPolicies(false);
    if (stage === "review") setStage("choose");
    else router.dismissTo(`/explore/${id}`);
  }, [id, stage]);
  useFocusEffect(useCallback(() => {
    if (stage !== "review") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      // Review is a local stage, so Back must match its visible back action.
      // Keep a submitted request on screen until its server result is known.
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack, stage]));
  async function pay() {
    if (paying.current || !valid || !config.data || config.isError || q.isError) return;
    const latest = quote(currentQuote.amount, config.data);
    if (latest.fee !== currentQuote.fee || latest.adBudget !== currentQuote.adBudget || latest.reach !== currentQuote.reach) {
      setReviewQuote(latest);
      setReviewFeeRate(Number((config.data.feeRate * 100).toFixed(2)));
      setError("Funding settings changed. Review the updated USD breakdown and estimate before confirming again. Your currency reference is unchanged; no payment was sent.");
      return;
    }
    paying.current = true;
    setBusy(true);
    setError("");
    if (!key.current) key.current = `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const result = await api<Payment>("/contributions", {
        method: "POST",
        body: { campaignId: id, amount: currentQuote.amount, outcome, idempotencyKey: key.current },
      });
      setPayment(result);
      setStage("result");
      await refresh();
    } catch (err) { setError((err as Error).message); }
    finally { paying.current = false; setBusy(false); }
  }
  function openPolicies() {
    Keyboard.dismiss();
    setShowPolicies(true);
  }
  if (q.isPending) return <Screen><Loading /></Screen>;
  if (q.isError && !q.data) return <Screen><Button title="Back to campaign" icon="arrow-back" variant="ghost" onPress={() => router.dismissTo(`/explore/${id}`)} /><ErrorState error={q.error} retry={() => q.refetch()} /></Screen>;
  if ((!config.data || config.isError) && stage !== "result") return (
    <Screen>
      <Button title="Back to campaign" icon="arrow-back" variant="ghost" onPress={() => router.dismissTo(`/explore/${id}`)} />
      <PageHeader title="Contribution settings" description="Load the current fees and audience model before reviewing a payment." />
      {config.isError ? <ErrorState error={config.error} retry={() => config.refetch()} /> : <Loading />}
    </Screen>
  );
  const c = audienceCampaign(q.data);
  if (!c) return <Screen><Button title="Back to campaign" icon="arrow-back" variant="ghost" onPress={() => router.dismissTo(`/explore/${id}`)} /><Notice>The approved public campaign could not be loaded. Private revisions cannot receive contributions.</Notice></Screen>;
  const publicState = c.campaignState || c.status;
  const success = payment?.status === "successful";
  const detailRows = stage === "choose" ? [
    [`Platform fee (${feeRate}%)`, money(currentQuote.fee)],
    ["Amount for ads", money(currentQuote.adBudget)],
    ["Estimated reach", `~${number(currentQuote.reach)} people`],
  ] : [
    ["Your contribution", money(currentQuote.amount)],
    [`Platform fee (${feeRate}% included)`, money(currentQuote.fee)],
    ["Available for advertising", money(currentQuote.adBudget)],
    ["Additional transaction fee", money(0)],
    ["Total simulated payment", money(currentQuote.total)],
    ["Estimated reach", `~${number(currentQuote.reach)} people`],
  ];
  return (
    <Screen scroll={false}>
      <InfoSheet visible={showPolicies && stage !== "result"} title="Funding & currency details" onClose={() => setShowPolicies(false)} testID="contribution-funding-details">
        <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>Backing “{c.title}”. {referenceDescription(moneySnapshot)}</Text>
        {moneySnapshot.currency === "INR" && <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>Canonical contribution: {formatNativeMoney(valid ? value : 0)} USD. Conversion rounds once to USD cents.</Text>}
        <Disclosures campaign={c} config={config.data} />
      </InfoSheet>
      <ScrollView ref={scroll} key={stage} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 18, paddingTop: 0, paddingBottom: 20, gap: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: -10 }}>
            <IconButton label={stage === "review" ? "Back to contribution amount" : "Back to campaign"} icon="chevron-back" disabled={busy} onPress={goBack} />
            {stage === "choose" && <IconButton label="Funding policies and refunds" icon="ellipsis-horizontal" onPress={openPolicies} />}
          </View>
          <View style={{ gap: 6 }}>
            <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 24, lineHeight: 32, letterSpacing: -0.5, color: colors.ink }}>
              {stage === "choose" ? "Make an impact" : stage === "review" ? "Review contribution" : success ? "Contribution confirmed" : `Payment ${payment?.status}`}
            </Text>
            {stage === "choose" && <Text style={{ fontSize: 13, lineHeight: 20, color: colors.muted }}>Your contribution helps amplify this message to more people.</Text>}
          </View>
          {stage !== "choose" && <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 4 }}>
            <View style={{ width: 58, height: 58, borderRadius: 12, overflow: "hidden" }}><CampaignCover campaign={c} height={58} /></View>
            <View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 14, lineHeight: 21, fontWeight: "700", color: colors.ink }}>{c.title}</Text><Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>by {c.creatorName}</Text></View>
          </View>}
          {q.isError && !!q.data && <View style={{ gap: 8 }}><Notice tone="error">Campaign progress could not refresh. {payment ? "Your recorded payment result is preserved below; do not pay again to refresh it." : "Review the current campaign status before paying."}</Notice><Button title="Retry campaign refresh" variant="secondary" onPress={() => { void q.refetch(); }} /></View>}
          {publicState !== "Available for Funding" && stage !== "result" && <Notice>This campaign is {publicState.toLowerCase()} and is not accepting contributions.</Notice>}
          {stage === "choose" ? (
            <>
              <ContributionPresets selectedUsd={value} formatAmount={money} disabled={busy} onSelect={preset => { setAmount(inputForUsd(preset, moneySnapshot)); key.current = ""; }} />
              <View style={{ gap: 7 }}>
                <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Custom amount · {moneySnapshot.currency}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: !valid ? colors.red : amountFocused ? colors.focus : colors.line, backgroundColor: colors.paper, borderRadius: 12, paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 18, color: colors.muted }}>{moneySnapshot.currency === "INR" ? "₹" : "$"}</Text>
                  <TextInput accessibilityLabel={`Custom amount (${moneySnapshot.currency})`} value={amount} keyboardType="decimal-pad" keyboardAppearance={scheme} editable={!busy} onFocus={() => setAmountFocused(true)} onBlur={() => setAmountFocused(false)} onChangeText={(text) => { setAmount(text); key.current = ""; }} selectionColor={colors.primary} style={{ flex: 1, minHeight: 52, paddingVertical: 10, paddingHorizontal: 0, color: colors.ink, fontFamily: fonts.medium, fontSize: 18, lineHeight: 25 }} />
                </View>
                {!valid && <Text accessibilityRole="alert" style={styles.error}>Enter {money(1)}–{money(10000)} with up to two decimal places (canonical demo limits: USD $1–$10,000).</Text>}
              </View>
              {(currency.preference !== moneySnapshot.currency || currency.rate?.date !== moneySnapshot.rate?.date) && <Button title={`Use current ${currency.preference} preference`} variant="ghost" disabled={busy || currency.loading || currency.snapshot.unavailable} onPress={() => { setAmount(inputForUsd(valid ? value : 25, currency.snapshot)); setMoneySnapshot(currency.snapshot); key.current = ""; }} />}
              <View style={{ backgroundColor: colors.paper, borderRadius: 12, padding: 14, gap: 10 }}>
                {detailRows.map(([label, value]) => <View key={label} style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                  <Text style={{ flex: 1, fontSize: 12, lineHeight: 19, color: colors.muted }}>{label}</Text>
                  <Text style={{ flexShrink: 1, textAlign: "right", fontSize: 13, lineHeight: 19, fontWeight: "700", color: colors.ink }}>{value}</Text>
                </View>)}
              </View>
              <View style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: 12, padding: 12, flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Ionicons name="trending-up" size={22} color={colors.primary} />
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={{ fontSize: 12, lineHeight: 19, color: colors.text }}>Your {money(currentQuote.amount)} could show this message to around {number(currentQuote.reach)} people.</Text>
                  <Text style={{ fontSize: 10, lineHeight: 16, color: colors.muted }}>Illustrative estimate. Actual results vary.</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, lineHeight: 18, color: colors.muted }}>Funds pay for advertising, not a direct donation.</Text>
              <SummaryLink compact title="Funding & currency details" summary="Refunds, remaining funds and the exchange-rate reference" icon="information-circle-outline" onPress={openPolicies} testID="contribution-funding-help" />
            </>
          ) : stage === "review" ? (
            <>
              <Funding campaign={c} config={config.data} compact />
              <View style={{ backgroundColor: colors.paper, borderRadius: 14, padding: 16, gap: 13, borderWidth: 1, borderColor: colors.line }}>
                {detailRows.map(([label, value]) => <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 14, paddingTop: label === "Total simulated payment" ? 12 : 0, borderTopWidth: label === "Total simulated payment" ? 1 : 0, borderColor: colors.line }}>
                  <Text style={{ flex: 1, fontSize: 13, lineHeight: 20, fontWeight: label === "Total simulated payment" ? "700" : "400", color: label === "Total simulated payment" ? colors.ink : colors.muted }}>{label}</Text>
                  <Text style={{ flexShrink: 1, textAlign: "right", fontWeight: "700", fontSize: 14, lineHeight: 20, color: colors.ink }}>{value}</Text>
                </View>)}
              </View>
              <Text style={[styles.muted, { fontSize: 11, lineHeight: 18 }]}>Recorded total: {formatNativeMoney(currentQuote.total)} USD. {referenceDescription(moneySnapshot)} Each equivalent is rounded independently; the USD breakdown is authoritative.</Text>
              <View style={{ gap: 8 }}>
                <Text style={{ ...styles.body, fontSize: 13, lineHeight: 20 }}>Contributions fund advertising, not direct donations.</Text>
                <Text style={{ ...styles.muted, fontSize: 12, lineHeight: 20 }}>{config.data?.policies.refunds || "Demo refund policy: full simulated refund before promotion. After promotion, unspent net advertising funds are refunded proportionally; the platform fee is retained."}</Text>
                <Text style={{ ...styles.muted, fontSize: 12, lineHeight: 20 }}>{config.data?.policies.unspent}{" "}{config.data?.policies.partialFunding}</Text>
                <Text style={{ ...styles.muted, fontSize: 12, lineHeight: 20 }}>Selecting “Pay · demo” acknowledges these prototype funding terms. Your name stays private by default. No card information is needed.</Text>
              </View>
              <Text style={{ fontSize: 14, lineHeight: 21, fontWeight: "600", color: colors.ink }}>Simulate a payment outcome</Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {["successful", "pending", "rejected", "cancelled", "failed"].map((result) => <Pill key={result} title={result[0].toUpperCase() + result.slice(1)} selected={outcome === result} disabled={busy} onPress={() => { setOutcome(result); key.current = ""; }} />)}
              </View>
              {!!error && <Notice tone="error">{error}</Notice>}
              <Button title="Change amount" variant="ghost" disabled={busy} onPress={goBack} />
            </>
          ) : (
            <>
              {payment && <View style={{ backgroundColor: colors.mint, borderRadius: 16, padding: 20, gap: 12 }}>
                <Ionicons name={success ? "checkmark-circle-outline" : payment.status === "pending" ? "time-outline" : "information-circle-outline"} size={38} color={colors.primary} />
                <Text style={styles.h2}>{success ? "Payment confirmed" : `Simulated payment ${payment.status}`}</Text>
                <Text style={styles.body}>{money(payment.amount)} · {payment.title}</Text>
                <Text style={styles.muted}>Original recorded contribution: {formatNativeMoney(payment.amount)} USD. {referenceDescription(moneySnapshot)}</Text>
                <Text style={styles.muted}>Reference {payment.id}</Text>
                <Text style={styles.muted}>{success ? "The server confirmed this simulated transaction. Funding has been updated." : payment.status === "pending" ? "This transaction is still pending. No funds have been added." : "No funds were added. You can choose a new contribution to try again."}</Text>
              </View>}
              {success ? <>
                <Funding campaign={c} config={config.data} />
                <Button title="Open receipt" variant="secondary" loading={busy} onPress={async () => {
                  if (!payment?.receipt) return;
                  setBusy(true);
                  setError("");
                  try { setReceipt(await api<Record<string, unknown>>(payment.receipt.url)); }
                  catch (err) { setError((err as Error).message); }
                  finally { setBusy(false); }
                }} />
                {receipt && <Notice>Simulated receipt · {payment?.receipt?.id}{"\n"}{formatNativeMoney(payment?.total || 0)} USD recorded for campaign amplification. Platform fee {formatNativeMoney(payment?.fee || 0)} USD, advertising budget {formatNativeMoney(payment?.adBudget || 0)} USD. This is not a charitable donation receipt.</Notice>}
                <ShareButton campaign={c} />
              </> : <Button title="Choose another contribution" variant="secondary" onPress={() => { key.current = ""; setPayment(null); setReceipt(null); setError(""); setStage("choose"); }} />}
              {!!error && <Notice tone="error">{error}</Notice>}
              <Button title="Track campaign progress" onPress={() => router.replace(`/explore/${id}/report`)} />
              <Button title="View activity" variant="ghost" onPress={() => router.push("/activity")} />
            </>
          )}
        </View>
      </ScrollView>
      {stage !== "result" && <View style={{ backgroundColor: colors.bg, borderTopWidth: 1, borderColor: colors.line }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 6 }}>
          <Button title={stage === "choose" ? "Continue to payment" : `Pay ${money(currentQuote.total)} · demo`} loading={busy} disabled={!valid || q.isError || publicState !== "Available for Funding"} onPress={stage === "choose" ? () => { Keyboard.dismiss(); setShowPolicies(false); setError(""); setReviewQuote(currentQuote); setReviewFeeRate(feeRate); setStage("review"); } : pay} style={{ minHeight: 48, paddingVertical: 10 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}><Ionicons name="shield-checkmark-outline" size={13} color={colors.muted} /><Text style={{ fontSize: 10, lineHeight: 16, color: colors.muted }}>Simulated checkout · no real money</Text></View>
        </View>
      </View>}
    </Screen>
  );
}
