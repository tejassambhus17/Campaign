import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Accordion, fonts, Notice, Progress, Text, useTheme } from "../../components/ui";
import { budgetParts, ReportDocument, ReportRow } from "../../lib/report";
import { formatMoney } from "../../lib/currency";

export function ReportStatus({ document: d }: { document: ReportDocument }) {
  const { colors, styles } = useTheme();
  return <View style={{ gap: 8 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Ionicons name={d.snapshot.status === "Completed" ? "checkmark-circle-outline" : "time-outline"} color={colors.primary} size={21} /><Text style={{ color: colors.primary, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21, flex: 1 }}>{d.snapshot.status}</Text></View>
    <Text accessibilityRole="header" style={styles.h2}>{d.snapshot.nextStep.title}</Text>
    <Text style={styles.body}>{d.snapshot.nextStep.body}</Text>
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Last recorded update · {d.updated}</Text>
  </View>;
}
export function ReportRows({ rows, details = false }: { rows: ReportRow[]; details?: boolean }) {
  const { colors, styles } = useTheme();
  return <View>{rows.map(row => <View key={row.key} style={{ paddingVertical: details ? 12 : 10, borderBottomWidth: 1, borderColor: colors.line, gap: 4 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
      <Text style={[styles.body, { flexShrink: 1 }]}>{row.label}</Text><Text style={{ fontFamily: fonts.bold, fontSize: 16, lineHeight: 23, color: colors.ink, fontVariant: ["tabular-nums"] }}>{row.value}</Text>
    </View>
    {!!row.canonical && <Text style={[styles.muted, { textAlign: "right", fontSize: 11, lineHeight: 17 }]}>{row.canonical}</Text>}
    {details && <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>{row.definition}</Text>}
  </View>)}</View>;
}
export function ReportFunding({ document: d, details = false }: { document: ReportDocument; details?: boolean }) {
  const { colors, styles } = useTheme();
  const r = d.snapshot, parts = budgetParts(r);
  const barColors = [colors.primary, colors.outline, colors.warning, colors.progressTrack];
  return <View style={{ gap: 10 }}>
    <Text accessibilityRole="header" style={styles.h2}>Funding & use of funds</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, color: colors.ink, fontVariant: ["tabular-nums"] }}>{d.raised} <Text style={[styles.muted, { fontSize: 13 }]}>of {d.goal}</Text></Text>
      <Text style={styles.body}>{r.fundingPercentage === null ? "Goal unavailable" : `${r.fundingPercentage}% funded`}</Text>
    </View>
    {r.campaign.goal !== null && <Progress raised={r.raised} goal={r.campaign.goal} />}
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>{d.currencyNote}</Text>
    {details ? <ReportRows rows={d.funding} details /> : <View style={{ gap: 3 }}><Text style={styles.body}>{d.funding[2].value} originally allocated to advertising</Text><Text style={styles.muted}>{d.funding[1].value} included platform fees</Text></View>}
    {!!parts.length && <View accessible={false} importantForAccessibility="no" style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 8 }}>{parts.filter(p => p.fraction > 0).map(p => <View key={p.key} style={{ flex: p.fraction, backgroundColor: barColors[parts.indexOf(p)] }} />)}</View>}
    <ReportRows rows={d.balance} details={details} />
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>Allocation is a budget. Spend is money used from that budget; these are not added together.</Text>
    <Accordion title="Refunds & accounting details">
      <Text style={styles.body}>{r.refundStatus}</Text>
      <Text style={styles.muted}>Pending simulated refund: {formatMoney(r.refundPendingAmount, d.currency)}. Pending refunds have not been deducted yet.</Text>
      <Text style={styles.muted}>Completed refunds include {formatMoney(r.refundedAdvertising, d.currency)} from advertising and {formatMoney(r.refundedFees, d.currency)} from fees.</Text>
      <Text style={styles.muted}>{formatMoney(r.unspentBeforeRefund, d.currency)} was unspent before refunds. This historical amount includes money already refunded; it is not an additional balance.</Text>
      <Text style={styles.muted}>{r.contributionCount} successful contribution records. Backer identities remain private; guest uniqueness is not measured.</Text>
      <Text style={styles.muted}>{r.policy.refunds}</Text><Text style={styles.muted}>{r.policy.unspent}</Text>
    </Accordion>
  </View>;
}
export function ReportTimeline({ document: d }: { document: ReportDocument }) {
  const { colors, styles } = useTheme();
  return <Accordion title={`Recorded journey · ${d.events.length} ${d.events.length === 1 ? "event" : "events"}`}>
    <Text style={styles.muted}>Actual recorded events only. Earlier stages are not inferred from funding or the current status.</Text>
    {d.events.length ? d.events.map((event, index) => <View key={`${event.type}-${event.occurredAt}-${index}`} style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ width: 20, alignItems: "center" }}><Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />{index < d.events.length - 1 && <View style={{ width: 1, flex: 1, minHeight: 18, backgroundColor: colors.line }} />}</View>
      <View style={{ flex: 1, paddingBottom: 14, gap: 3 }}><Text style={[styles.body, { fontFamily: fonts.semibold }]}>{event.state}</Text><Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>{event.date}</Text>{event.seeded && <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Illustrative seed state. Earlier milestone dates were not recorded.</Text>}</View>
    </View>) : <Text style={styles.muted}>No public lifecycle events have been recorded.</Text>}
    <Text style={styles.muted}>Workflow: Draft → Submitted for Review → Changes Requested or Approved → Available for Funding → Funding Goal Reached or Funding Period Ends → Distribution Preparation → Promoting → Completed.</Text>
    <Text style={styles.muted}>Rejection, cancellation, failure and pending refunds are shown when recorded. Funding never starts advertising automatically.</Text>
  </Accordion>;
}
export function ReportDistribution({ document: d }: { document: ReportDocument }) {
  const { colors, styles } = useTheme();
  const plan = d.snapshot.distribution.proposed;
  return <View style={{ gap: 10 }}>
    <Text accessibilityRole="header" style={styles.h2}>Distribution plan</Text>
    <Text style={styles.body}>{d.period}</Text>
    {plan ? <>
      <Text style={styles.muted}>Creator-proposed audience</Text><Text style={styles.body}>{plan.geography}{plan.interests ? ` · ${plan.interests}` : ""}</Text>
      <View style={{ gap: 6 }}>{plan.channels.map(channel => <View key={channel} style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}><Text style={styles.body}>{channel}</Text><Text style={{ ...styles.body, fontFamily: fonts.semibold, color: colors.primary }}>{plan.allocation[channel] ?? "Unavailable"}% allocation</Text></View>)}</View>
      <Text style={styles.muted}>{plan.durationDays} days proposed duration</Text>
    </> : <Text style={styles.muted}>An approved public distribution plan is not available.</Text>}
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>{d.snapshot.distribution.finalizationNote}</Text>
    {!d.snapshot.distribution.finalized && <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>Finalized channel settings and channel-level results are not recorded.</Text>}
  </View>;
}
export function ReportResults({ document: d, details = false }: { document: ReportDocument; details?: boolean }) {
  const { styles } = useTheme();
  return <View style={{ gap: 8 }}><Text accessibilityRole="header" style={styles.h2}>{d.snapshot.final ? "Delivery results" : "Results so far"}</Text>
    <Notice>{d.snapshot.available ? "Simulated delivery. These are modelled results, not measured advertising performance." : "Delivery has not started. The reach estimate is a planning figure, not a result."}</Notice>
    <ReportRows rows={d.results} details={details} />
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>Unavailable measured reach is not zero reach. Reach and clicks do not establish a change in belief or real-world impact.</Text>
    {!details && <Accordion title="Metric definitions">{d.results.map(row => <View key={row.key} style={{ gap: 4 }}><Text style={styles.body}>{row.label}</Text><Text style={styles.muted}>{row.definition}</Text></View>)}<Text style={styles.muted}>{d.snapshot.policy.reach}</Text></Accordion>}
  </View>;
}
