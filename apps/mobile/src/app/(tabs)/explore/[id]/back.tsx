import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import {
  Campaign,
  estimate,
  quote,
  money,
  number,
  Payment,
} from "../../../../lib/types";
import { refresh, useConfig } from "../../../../lib/session";
import { audienceCampaign } from "../../../../lib/public-campaign";
import {
  Text,
  Button,
  PageHeader,
  Picture,
  ErrorState,
  Field,
  Loading,
  Notice,
  Pill,
  Screen,
  useTheme,
} from "../../../../components/ui";
import {
  Disclosures,
  Funding,
  ShareButton,
} from "../../../../features/campaign";
export default function BackCampaign() {
  const { colors, styles } = useTheme();
  const { fontScale, width } = useWindowDimensions();
  const stackDock = fontScale > 1.15 || width < 350;
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api<Campaign>(`/campaigns/${id}`),
  });
  const config = useConfig();
  const [amount, setAmount] = useState("25");
  const [stage, setStage] = useState<"choose" | "review" | "result">("choose");
  const [outcome, setOutcome] = useState("successful");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const key = useRef("");
  const paying = useRef(false);
  const value = Number(amount);
  const valid =
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 10000 &&
    /^\d+(\.\d{1,2})?$/.test(amount);
  const currentQuote = quote(valid ? value : 0, config.data);
  const fee = currentQuote.fee;
  async function pay() {
    if (paying.current || !valid || !config.data || config.isError || q.isError) return;
    paying.current = true;
    setBusy(true);
    setError("");
    if (!key.current)
      key.current = `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const result = await api<Payment>("/contributions", {
        method: "POST",
        body: {
          campaignId: id,
          amount: value,
          outcome,
          idempotencyKey: key.current,
        },
      });
      setPayment(result);
      setStage("result");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      paying.current = false;
      setBusy(false);
    }
  }
  if (q.isPending)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (q.isError && !q.data)
    return (
      <Screen>
        <ErrorState error={q.error} retry={() => q.refetch()} />
      </Screen>
    );
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
  return (
    <Screen scroll={false}>
      <ScrollView
        key={stage}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 640,
            alignSelf: "center",
            padding: 18,
            paddingBottom: 28,
            gap: 16,
          }}
        >
          <Button
            title="Campaign"
            icon="arrow-back"
            variant="ghost"
            disabled={busy}
            onPress={() => router.dismissTo(`/explore/${id}`)}
          />
          <PageHeader
            title={
              stage === "result"
                ? success
                  ? "Contribution confirmed"
                  : `Payment ${payment?.status}`
                : stage === "review"
                  ? "Review contribution"
                  : "Back a message"
            }
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 14,
              borderRadius: 14,
              backgroundColor: colors.header,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <Picture uri={c.coverImage} height={64} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ ...styles.body, fontWeight: "700", color: colors.headerText }}>
                {c.title}
              </Text>
              <Text style={{ ...styles.muted, fontSize: 12, color: colors.onHeaderMuted }}>
                By {c.creatorName}
              </Text>
            </View>
          </View>
          <View style={{ ...styles.row, alignItems: "flex-start", gap: 8 }}><Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} /><Text style={{ ...styles.muted, flex: 1 }}>Demo checkout · no real money. Your contribution promotes this message; it is not a direct donation.</Text></View>
          {q.isError && !!q.data && <View style={{ gap: 8 }}><Notice tone="error">Campaign progress could not refresh. {payment ? "Your recorded payment result is preserved below; do not pay again to refresh it." : "Review the current campaign status before paying."}</Notice><Button title="Retry campaign refresh" variant="secondary" onPress={() => { void q.refetch(); }} /></View>}
          {publicState !== "Available for Funding" && stage !== "result" && <Notice>This campaign is {publicState.toLowerCase()} and is not accepting contributions.</Notice>}
          {stage === "choose" ? (
            <>
              <Text style={styles.h2}>Contribution amount</Text>
              <View style={{ ...styles.row, flexWrap: "wrap" }}>
                {[5, 10, 25, 50, 100].map((n) => (
                  <Pill
                    title={money(n)}
                    key={n}
                    selected={value === n}
                    disabled={busy}
                    onPress={() => {
                      setAmount(String(n));
                      key.current = "";
                    }}
                  />
                ))}
              </View>
              <Field
                label="Custom amount (USD)"
                value={amount}
                keyboardType="decimal-pad"
                editable={!busy}
                onChangeText={(t) => {
                  setAmount(t);
                  key.current = "";
                }}
                error={
                  !valid
                    ? "Enter $1–$10,000 with up to two decimal places (demo limits)."
                    : undefined
                }
              />
              <View
                style={{
                  backgroundColor: colors.header,
                  borderRadius: 12,
                  padding: 16,
                  gap: 5,
                }}
              >
                <Text style={{ ...styles.muted, color: colors.onHeaderMuted }}>Estimated audience reach</Text>
                <Text style={{ ...styles.title, color: colors.headerText }}>
                  ≈ {number(valid ? estimate(value, config.data) : 0)} people
                </Text>
                <Text style={{ ...styles.muted, color: colors.onHeaderMuted }}>
                  Illustrative estimate after the demo platform fee. Actual
                  results vary; no guarantee.
                </Text>
                <View style={{ gap: 5, borderTopWidth: 1, borderColor: colors.onHeaderMuted, paddingTop: 10, marginTop: 4 }}>
                  {[["Your contribution", money(currentQuote.amount)], ["Platform fee · included", money(currentQuote.fee)], ["Advertising budget", money(currentQuote.adBudget)]].map(([label, amount]) => <View key={label} style={{ ...styles.row, alignItems: "flex-start", justifyContent: "space-between" }}><Text style={{ color: colors.onHeaderMuted, fontSize: 13, lineHeight: 19, flex: 1 }}>{label}</Text><Text style={{ color: colors.headerText, fontSize: 14, lineHeight: 20, fontWeight: "700" }}>{amount}</Text></View>)}
                </View>
              </View>
              <Funding campaign={c} config={config.data} />
              <Disclosures campaign={c} config={config.data} />
            </>
          ) : stage === "review" ? (
            <>
              <Funding campaign={c} config={config.data} />
              <View
                style={{
                  backgroundColor: colors.paper,
                  borderRadius: 12,
                  padding: 16,
                  gap: 12,
                  borderWidth: 1,
                  borderColor: colors.line,
                }}
              >
                {[
                  ["Your contribution", money(value)],
                  ["Platform fee (included)", money(fee)],
                  ["Available for advertising", money(currentQuote.adBudget)],
                  ["Additional transaction fee", money(0)],
                  ["Total simulated payment", money(currentQuote.total)],
                  [
                    "Estimated reach",
                    `≈ ${number(estimate(value, config.data))} people`,
                  ],
                ].map(([l, v]) => (
                  <View
                    key={l}
                    style={{ ...styles.row, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", paddingTop: l === "Total simulated payment" ? 12 : 0, borderTopWidth: l === "Total simulated payment" ? 1 : 0, borderColor: colors.line }}
                  >
                    <Text style={{ ...styles.muted, flex: 1, fontWeight: l === "Total simulated payment" ? "700" : "400", color: l === "Total simulated payment" ? colors.ink : colors.muted }}>{l}</Text>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        color: colors.ink,
                      }}
                    >
                      {v}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.body}>
                {config.data?.policies.refunds ||
                  "Demo refund policy: full simulated refund before promotion. After promotion, unspent net advertising funds are refunded proportionally; the platform fee is retained."}
              </Text>
              <Text style={styles.body}>
                {config.data?.policies.unspent}{" "}
                {config.data?.policies.partialFunding}
              </Text>
              <Text style={styles.muted}>
                Selecting “Pay · demo” acknowledges these
                prototype funding terms. Your name stays private by default. No
                card information is needed.
              </Text>
              <Text style={{ ...styles.body, fontWeight: "600" }}>
                Simulate a payment outcome
              </Text>
              <View style={{ ...styles.row, flexWrap: "wrap" }}>
                {[
                  "successful",
                  "pending",
                  "rejected",
                  "cancelled",
                  "failed",
                ].map((o) => (
                  <Pill
                    key={o}
                    title={o[0].toUpperCase() + o.slice(1)}
                    selected={outcome === o}
                    disabled={busy}
                    onPress={() => {
                      setOutcome(o);
                      key.current = "";
                    }}
                  />
                ))}
              </View>
              {!!error && <Notice tone="error">{error}</Notice>}
              <Button
                title="Change amount"
                variant="ghost"
                disabled={busy}
                onPress={() => setStage("choose")}
              />
            </>
          ) : (
            <>
              {payment && (
                <View
                  style={{
                    backgroundColor: colors.mint,
                    borderRadius: 12,
                    padding: 18,
                    gap: 10,
                  }}
                >
                  <Text style={styles.h2}>
                    {success
                      ? "Payment confirmed"
                      : `Simulated payment ${payment.status}`}
                  </Text>
                  <Text style={styles.body}>
                    {money(payment.amount)} · {payment.title}
                  </Text>
                  <Text style={styles.muted}>Reference {payment.id}</Text>
                  <Text style={styles.muted}>
                    {success
                      ? "The server confirmed this simulated transaction. Funding has been updated."
                      : payment.status === "pending"
                        ? "This transaction is still pending. No funds have been added."
                        : "No funds were added. You can choose a new contribution to try again."}
                  </Text>
                </View>
              )}
              {success ? (
                <>
                  <Funding campaign={c} config={config.data} />
                  <Button
                    title="Open receipt"
                    variant="secondary"
                    loading={busy}
                    onPress={async () => {
                      if (!payment?.receipt) return;
                      setBusy(true);
                      try {
                        setReceipt(
                          await api<Record<string, unknown>>(
                            payment.receipt.url,
                          ),
                        );
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                  {receipt && (
                    <Notice>
                      Simulated receipt · {payment?.receipt?.id}
                      {"\n"}
                      {money(payment?.total || 0)} paid for campaign
                      amplification. Platform fee {money(payment?.fee || 0)},
                      advertising budget {money(payment?.adBudget || 0)}. This
                      is not a charitable donation receipt.
                    </Notice>
                  )}
                  <ShareButton campaign={c} />
                </>
              ) : (
                <Button
                  title="Choose another contribution"
                  variant="secondary"
                  onPress={() => {
                    key.current = "";
                    setPayment(null);
                    setStage("choose");
                  }}
                />
              )}
              {!!error && <Notice tone="error">{error}</Notice>}
              <Button
                title="Track campaign progress"
                onPress={() => router.replace(`/explore/${id}/report`)}
              />
              <Button
                title="View activity"
                variant="ghost"
                onPress={() => router.push("/activity")}
              />
            </>
          )}
        </View>
      </ScrollView>
      {stage !== "result" && (
        <View
          style={{
            borderTopWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.paper,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 640,
              alignSelf: "center",
              paddingHorizontal: 20,
              paddingVertical: 10,
              gap: 12,
              flexDirection: stackDock ? "column" : "row",
              alignItems: "stretch",
            }}
          >
            <View style={{ minWidth: 72, gap: 2 }}>
              <Text style={{ ...styles.muted, fontSize: 11, lineHeight: 16 }}>
                Simulated total
              </Text>
              <Text style={{ ...styles.body, fontWeight: "700" }}>
                {money(valid ? value : 0)}
              </Text>
            </View>
            <Button
              title={
                stage === "choose"
                  ? "Review"
                  : `Pay ${money(valid ? value : 0)} · demo`
              }
              style={stackDock ? { alignSelf: "stretch" } : { flex: 1 }}
              loading={busy}
              disabled={!valid || q.isError || publicState !== "Available for Funding"}
              onPress={
                stage === "choose"
                  ? () => {
                      setError("");
                      setStage("review");
                    }
                  : pay
              }
            />
          </View>
        </View>
      )}
    </Screen>
  );
}
