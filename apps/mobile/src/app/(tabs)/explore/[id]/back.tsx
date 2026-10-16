import { useCallback, useRef, useState } from "react";
import { BackHandler, Keyboard, Pressable, ScrollView, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { Campaign, quote, money, number, Payment } from "../../../../lib/types";
import { refresh, useConfig } from "../../../../lib/session";
import { audienceCampaign } from "../../../../lib/public-campaign";
import { Text, Button, IconButton, PageHeader, fonts, ErrorState, Loading, Notice, Pill, Screen, useTheme } from "../../../../components/ui";
import { CampaignCover, Disclosures, Funding, ShareButton } from "../../../../features/campaign";

export default function BackCampaign() {
  const { colors, styles, scheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({ queryKey: ["campaign", id], queryFn: () => api<Campaign>(`/campaigns/${id}`) });
  const config = useConfig();
  const [amount, setAmount] = useState("25");
  const [stage, setStage] = useState<"choose" | "review" | "result">("choose");
  const [outcome, setOutcome] = useState("successful");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const scroll = useRef<ScrollView>(null);
  const policyPosition = useRef(0);
  const scrollToPolicies = useRef(false);
  const key = useRef("");
  const paying = useRef(false);
  const value = Number(amount);
  const valid = Number.isFinite(value) && value >= 1 && value <= 10000 && /^\d+(\.\d{1,2})?$/.test(amount);
  const currentQuote = quote(valid ? value : 0, config.data);
  const feeRate = Number(((config.data?.feeRate ?? 0) * 100).toFixed(2));
  const goBack = useCallback(() => {
    if (paying.current) return;
    Keyboard.dismiss();
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
    paying.current = true;
    setBusy(true);
    setError("");
    if (!key.current) key.current = `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const result = await api<Payment>("/contributions", {
        method: "POST",
        body: { campaignId: id, amount: value, outcome, idempotencyKey: key.current },
      });
      setPayment(result);
      setStage("result");
      await refresh();
    } catch (err) { setError((err as Error).message); }
    finally { paying.current = false; setBusy(false); }
  }
  function openPolicies() {
    Keyboard.dismiss();
    if (showPolicies) {
      scroll.current?.scrollTo({ y: policyPosition.current, animated: true });
      return;
    }
    scrollToPolicies.current = true;
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
      <ScrollView ref={scroll} key={stage} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: -10 }}>
            <IconButton label={stage === "review" ? "Back to contribution amount" : "Back to campaign"} icon="chevron-back" disabled={busy} onPress={goBack} />
            {stage === "choose" && <IconButton label="Funding policies and refunds" icon="ellipsis-horizontal" onPress={openPolicies} />}
          </View>
          <View style={{ gap: 8 }}>
            <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 25, lineHeight: 33, letterSpacing: -0.5, color: colors.ink }}>
              {stage === "choose" ? "Make an impact" : stage === "review" ? "Review contribution" : success ? "Contribution confirmed" : `Payment ${payment?.status}`}
            </Text>
            {stage === "choose" && <Text style={{ fontSize: 14, lineHeight: 22, color: colors.muted }}>Your contribution helps amplify this message to more people.</Text>}
          </View>
          {stage !== "choose" && <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 4 }}>
            <View style={{ width: 58, height: 58, borderRadius: 12, overflow: "hidden" }}><CampaignCover campaign={c} height={58} /></View>
            <View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 14, lineHeight: 21, fontWeight: "700", color: colors.ink }}>{c.title}</Text><Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>by {c.creatorName}</Text></View>
          </View>}
          {q.isError && !!q.data && <View style={{ gap: 8 }}><Notice tone="error">Campaign progress could not refresh. {payment ? "Your recorded payment result is preserved below; do not pay again to refresh it." : "Review the current campaign status before paying."}</Notice><Button title="Retry campaign refresh" variant="secondary" onPress={() => { void q.refetch(); }} /></View>}
          {publicState !== "Available for Funding" && stage !== "result" && <Notice>This campaign is {publicState.toLowerCase()} and is not accepting contributions.</Notice>}
          {stage === "choose" ? (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {[5, 10, 25, 50].map((preset) => <Pressable
                  key={preset}
                  accessibilityRole="button"
                  accessibilityLabel={`${money(preset)} contribution`}
                  accessibilityState={{ selected: value === preset, disabled: busy }}
                  disabled={busy}
                  onPress={() => { setAmount(String(preset)); key.current = ""; }}
                  style={({ pressed }) => ({ flex: 1, minHeight: 48, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: value === preset ? colors.primary : colors.line, backgroundColor: value === preset ? colors.primary : colors.paper, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ fontSize: 15, lineHeight: 22, fontWeight: "700", color: value === preset ? colors.onPrimary : colors.ink }}>{money(preset)}</Text>
                </Pressable>)}
              </View>
              <View style={{ gap: 7 }}>
                <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Custom amount · USD</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: !valid ? colors.red : amountFocused ? colors.focus : colors.line, backgroundColor: colors.paper, borderRadius: 12, paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 21, color: colors.muted }}>$</Text>
                  <TextInput accessibilityLabel="Custom amount (USD)" value={amount} keyboardType="decimal-pad" keyboardAppearance={scheme} editable={!busy} onFocus={() => setAmountFocused(true)} onBlur={() => setAmountFocused(false)} onChangeText={(text) => { setAmount(text); key.current = ""; }} selectionColor={colors.primary} style={{ flex: 1, minHeight: 58, paddingVertical: 12, paddingHorizontal: 0, color: colors.ink, fontFamily: fonts.medium, fontSize: 21, lineHeight: 28 }} />
                </View>
                {!valid && <Text accessibilityRole="alert" style={styles.error}>Enter $1–$10,000 with up to two decimal places (demo limits).</Text>}
              </View>
              <View style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: 12, padding: 16, gap: 12 }}>
                {detailRows.map(([label, value]) => <View key={label} style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                  <Text style={{ flex: 1, fontSize: 12, lineHeight: 19, color: colors.muted }}>{label}</Text>
                  <Text style={{ flexShrink: 1, textAlign: "right", fontSize: 13, lineHeight: 19, fontWeight: "700", color: colors.ink }}>{value}</Text>
                </View>)}
              </View>
              <View style={{ borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.mint, borderRadius: 14, padding: 16, flexDirection: "row", gap: 13, alignItems: "center" }}>
                <Ionicons name="trending-up" size={30} color={colors.primary} />
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={{ fontSize: 12, lineHeight: 19, color: colors.text }}>Your {money(currentQuote.amount)} could show this message to around {number(currentQuote.reach)} people.</Text>
                  <Text style={{ fontSize: 10, lineHeight: 16, color: colors.muted }}>Illustrative estimate. Actual results vary.</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>Backing “{c.title}”. Funds pay for advertising, not a direct donation.</Text>
              <Button title={showPolicies ? "Hide funding policies" : "Fees, refunds & funding policies"} variant="ghost" icon={showPolicies ? "chevron-up" : "chevron-down"} onPress={() => setShowPolicies(!showPolicies)} style={{ paddingHorizontal: 0, minHeight: 44 }} />
              {showPolicies && <View onLayout={(event) => {
                policyPosition.current = event.nativeEvent.layout.y;
                if (scrollToPolicies.current) {
                  scrollToPolicies.current = false;
                  scroll.current?.scrollTo({ y: policyPosition.current, animated: true });
                }
              }}><Disclosures campaign={c} config={config.data} /></View>}
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
              <View style={{ gap: 11 }}>
                <Text style={{ ...styles.body, fontSize: 14, lineHeight: 22 }}>Your contribution pays for distribution of this message, not direct charitable support for the cause.</Text>
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
                {receipt && <Notice>Simulated receipt · {payment?.receipt?.id}{"\n"}{money(payment?.total || 0)} paid for campaign amplification. Platform fee {money(payment?.fee || 0)}, advertising budget {money(payment?.adBudget || 0)}. This is not a charitable donation receipt.</Notice>}
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
          <Button title={stage === "choose" ? "Continue to payment" : `Pay ${money(valid ? value : 0)} · demo`} loading={busy} disabled={!valid || q.isError || publicState !== "Available for Funding"} onPress={stage === "choose" ? () => { Keyboard.dismiss(); setError(""); setStage("review"); } : pay} style={{ minHeight: 48, paddingVertical: 10 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}><Ionicons name="shield-checkmark-outline" size={13} color={colors.muted} /><Text style={{ fontSize: 10, lineHeight: 16, color: colors.muted }}>Simulated checkout · no real money</Text></View>
        </View>
      </View>}
    </Screen>
  );
}
