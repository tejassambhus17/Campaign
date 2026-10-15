import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
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
import {
  Text,
  Button,
  PageHeader,
  Picture,
  colors,
  ErrorState,
  Field,
  Loading,
  Notice,
  Pill,
  Screen,
  styles,
} from "../../../../components/ui";
import {
  Disclosures,
  Funding,
  ShareButton,
} from "../../../../features/campaign";
export default function BackCampaign() {
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
  const value = Number(amount);
  const valid =
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 10000 &&
    /^\d+(\.\d{1,2})?$/.test(amount);
  const fee = quote(value, config.data).fee;
  async function pay() {
    if (busy) return;
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
      setBusy(false);
    }
  }
  if (q.isPending)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (q.isError)
    return (
      <Screen>
        <ErrorState error={q.error} retry={() => q.refetch()} />
      </Screen>
    );
  const c = q.data;
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
            padding: 20,
            paddingBottom: 28,
            gap: 16,
          }}
        >
          <Button
            title="Back to campaign"
            icon="arrow-back"
            variant="ghost"
            onPress={() => router.replace(`/explore/${id}`)}
          />
          <PageHeader
            title={
              stage === "result"
                ? success
                  ? "Contribution confirmed"
                  : `Payment ${payment?.status}`
                : stage === "review"
                  ? "Review contribution"
                  : "Back this campaign"
            }
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderColor: colors.line,
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
              <Text style={{ ...styles.body, fontWeight: "700" }}>
                {c.title}
              </Text>
              <Text style={{ ...styles.muted, fontSize: 12 }}>
                By {c.creatorName}
              </Text>
            </View>
          </View>
          <Text style={styles.muted}>
            Simulated checkout · no real charge. Funds pay for advertising, not
            a direct donation.
          </Text>
          {stage === "choose" ? (
            <>
              <Text style={styles.h2}>Contribution amount</Text>
              <View style={{ ...styles.row, flexWrap: "wrap" }}>
                {[5, 10, 25, 50, 100].map((n) => (
                  <Pill
                    title={money(n)}
                    key={n}
                    selected={value === n}
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
                  backgroundColor: colors.mint,
                  borderRadius: 12,
                  padding: 16,
                  gap: 5,
                }}
              >
                <Text style={styles.muted}>Estimated audience reach</Text>
                <Text style={styles.title}>
                  ≈ {number(valid ? estimate(value, config.data) : 0)} people
                </Text>
                <Text style={styles.muted}>
                  Illustrative estimate after the demo platform fee. Actual
                  results vary; no guarantee.
                </Text>
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
                  gap: 14,
                }}
              >
                {[
                  ["Your contribution", money(value)],
                  ["Platform fee (included)", money(fee)],
                  ["Available for advertising", money(value - fee)],
                  ["Additional transaction fee", money(0)],
                  ["Total simulated payment", money(value)],
                  [
                    "Estimated reach",
                    `≈ ${number(estimate(value, config.data))} people`,
                  ],
                ].map(([l, v]) => (
                  <View
                    key={l}
                    style={{ ...styles.row, justifyContent: "space-between" }}
                  >
                    <Text style={{ ...styles.muted, flex: 1 }}>{l}</Text>
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
                Selecting “Complete simulated payment” acknowledges these
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
                  <Funding campaign={q.data} config={config.data} />
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
              flexDirection: "row",
              alignItems: "center",
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
                  ? "Review contribution"
                  : "Complete simulated payment"
              }
              style={{ flex: 1 }}
              loading={busy}
              disabled={!valid || c.status !== "Available for Funding"}
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
