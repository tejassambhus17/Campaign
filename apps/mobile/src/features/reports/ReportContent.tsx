import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fonts, Progress, Text, useTheme } from "../../components/ui";
import { InfoAction, SummaryLink } from "../../components/Information";
import { DistributionPlan, ReportDocument, ReportRow } from "../../lib/report";
import { formatMoney } from "../../lib/currency";

export type ReportSection = "overview" | "delivery" | "journey";
export function reportSection(value: unknown): ReportSection {
  return value === "delivery" || value === "journey" ? value : "overview";
}
export function ReportHeading({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text accessibilityRole="header" style={{ fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: colors.ink }}>{children}</Text>;
}
export function ReportStatus({ document: d }: { document: ReportDocument }) {
  const { colors, styles } = useTheme();
  return <View style={{ gap: 6 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Ionicons name={d.snapshot.status === "Completed" ? "checkmark-circle-outline" : "time-outline"} color={colors.primary} size={21} /><Text style={{ color: colors.primary, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21, flex: 1 }}>{d.snapshot.status}</Text></View>
    <Text accessibilityRole="header" style={[styles.body, { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21 }]}>{d.snapshot.nextStep.title}</Text>
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>{d.outcome}</Text>
    {d.outcome !== d.snapshot.nextStep.body && <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>{d.snapshot.nextStep.body}</Text>}
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Last recorded update · {d.updated}</Text>
  </View>;
}
export function ReportRows({ rows, details = false }: { rows: ReportRow[]; details?: boolean }) {
  const { colors, styles } = useTheme();
  return <View>{rows.map(row => <View key={row.key} style={{ paddingVertical: details ? 9 : 7, gap: 3 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
      <Text style={[styles.muted, { flexShrink: 1, fontSize: 12, lineHeight: 19 }]}>{row.label}</Text><Text style={{ fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: colors.ink, fontVariant: ["tabular-nums"] }}>{row.value}</Text>
    </View>
    {!!row.canonical && <Text style={[styles.muted, { textAlign: "right", fontSize: 11, lineHeight: 17 }]}>{row.canonical}</Text>}
    {details && <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>{row.definition}</Text>}
  </View>)}</View>;
}
/** Full accounting belongs in the Funding detail, using this frozen document. */
export function ReportFunding({ document: d, details = false }: { document: ReportDocument; details?: boolean }) {
  const { colors, styles } = useTheme();
  const r = d.snapshot;
  return <View style={{ gap: 10 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}><ReportHeading>Funding & use of funds</ReportHeading><Text style={[styles.muted, { fontSize: 11, lineHeight: 18 }]}>{r.fundingPercentage === null ? "Goal unavailable" : `${r.fundingPercentage}% funded`}</Text></View>
    {r.campaign.goal !== null && <Progress raised={r.raised} goal={r.campaign.goal} />}
    <View style={{ backgroundColor: colors.paper, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 }}><ReportRows rows={d.funding.map(row => ({ ...row, label: row.key === "raised" ? "Total contributions" : row.key === "fees" ? `Platform fee (${Number((r.policy.feeRate * 100).toFixed(2))}% included)` : "Amount for ads" }))} /></View>
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Goal {d.goal} · Advertising allocation is a budget, not money already spent.</Text>
    {details && <>
      <View style={{ paddingTop: 8, gap: 4 }}><ReportHeading>Spending & remaining balance</ReportHeading><ReportRows rows={d.balance} details /></View>
      <View style={{ gap: 7 }}><ReportHeading>Refunds</ReportHeading><Text style={styles.body}>{r.refundStatus}</Text>
        <Text style={styles.muted}>Pending simulated refund: {formatMoney(r.refundPendingAmount, d.currency)}. Pending refunds have not been deducted yet.</Text>
        <Text style={styles.muted}>Completed refunds include {formatMoney(r.refundedAdvertising, d.currency)} from advertising and {formatMoney(r.refundedFees, d.currency)} from fees.</Text>
        <Text style={styles.muted}>{formatMoney(r.unspentBeforeRefund, d.currency)} was unspent before refunds. This historical amount includes money already refunded; it is not an additional balance.</Text>
        <Text style={styles.muted}>{r.policy.refunds}</Text><Text style={styles.muted}>{r.policy.unspent}</Text>
      </View>
      <View style={{ paddingTop: 8, gap: 7 }}><ReportHeading>Accounting & policy</ReportHeading>
        <Text style={styles.muted}>{r.policy.purpose}</Text><Text style={styles.muted}>{r.policy.fees}</Text><Text style={styles.muted}>{r.policy.allocation}</Text>
        <Text style={styles.muted}>{r.contributionCount} successful contribution records. Backer identities remain private; guest uniqueness is not measured.</Text>
        <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>{d.currencyNote} Each equivalent is rounded independently; accounting remains in USD.</Text>
        <ReportRows rows={d.funding} details />
      </View>
    </>}
  </View>;
}
export function ReportTimeline({ document: d }: { document: ReportDocument }) {
  const { colors, styles } = useTheme();
  return <View style={{ gap: 10 }}><ReportHeading>Recorded journey · {d.events.length} {d.events.length === 1 ? "event" : "events"}</ReportHeading>
    <Text style={styles.muted}>Actual recorded events only. Earlier stages are not inferred from funding or the current status.</Text>
    {d.events.length ? d.events.map((event, index) => <View key={`${event.type}-${event.occurredAt}-${index}`} style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ width: 20, alignItems: "center" }}><Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />{index < d.events.length - 1 && <View style={{ width: 1, flex: 1, minHeight: 18, backgroundColor: colors.line }} />}</View>
      <View style={{ flex: 1, paddingBottom: 10, gap: 3 }}><Text style={[styles.body, { fontFamily: fonts.semibold }]}>{event.state}</Text><Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>{event.date}</Text>{event.seeded && <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Illustrative seed state. Earlier milestone dates were not recorded.</Text>}</View>
    </View>) : <Text style={styles.muted}>No public lifecycle events have been recorded.</Text>}
    <Text style={styles.muted}>Workflow: Draft → Submitted for Review → Changes Requested or Approved → Available for Funding → Funding Goal Reached or Funding Period Ends → Distribution Preparation → Promoting → Completed.</Text>
    <Text style={styles.muted}>Rejection, cancellation, failure and pending refunds are shown when recorded. Funding never starts advertising automatically.</Text>
  </View>;
}
function DistributionSettings({ plan, title, proposed }: { plan: DistributionPlan; title: string; proposed: boolean }) {
  const { colors, styles } = useTheme();
  return <View style={{ gap: 7 }}><ReportHeading>{title}</ReportHeading><Text style={styles.body}>{plan.geography}{plan.interests ? ` · ${plan.interests}` : ""}</Text>
    {plan.channels.map(channel => <View key={channel} style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}><Text style={styles.body}>{channel}</Text><Text style={{ ...styles.body, fontFamily: fonts.semibold, color: colors.primary }}>{plan.allocation[channel] === undefined ? "Allocation unavailable" : `${plan.allocation[channel]}% allocation`}</Text></View>)}
    <Text style={styles.muted}>{plan.durationDays} days {proposed ? "proposed duration" : "recorded duration"}</Text>
  </View>;
}
export function ReportDistribution({ document: d }: { document: ReportDocument }) {
  const { styles } = useTheme();
  const { proposed, finalized, finalizationNote } = d.snapshot.distribution;
  return <View style={{ gap: 14 }}><Text style={styles.body}>{d.period}</Text>
    {proposed ? <DistributionSettings plan={proposed} title="Creator-proposed audience" proposed /> : <Text style={styles.muted}>An approved public distribution plan is not available.</Text>}
    {finalized && <DistributionSettings plan={finalized} title="Finalized distribution" proposed={false} />}
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>{finalizationNote}</Text>
    {!finalized && <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>Finalized channel settings and channel-level results are not recorded.</Text>}
    <Text style={styles.muted}>{d.snapshot.policy.delivery}</Text>
  </View>;
}
export function ReportResults({ document: d, details = false }: { document: ReportDocument; details?: boolean }) {
  const { styles } = useTheme();
  return <View style={{ gap: 8 }}>
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>{d.snapshot.available ? "Modelled demonstration results, not measured advertising performance." : "Delivery has not started. Estimated reach is a planning figure."}</Text>
    <ReportRows rows={d.results} details={details} />
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>Unavailable measured reach is not zero reach. Reach and clicks do not establish a change in belief or real-world impact.</Text>
    {details ? <Text style={styles.muted}>{d.snapshot.policy.reach}</Text> : <InfoAction title="About these metrics" summary="Estimates, simulation and measured results" icon="information-circle-outline">{d.results.map(row => <View key={row.key} style={{ gap: 4 }}><ReportHeading>{row.label}</ReportHeading><Text style={styles.muted}>{row.definition}</Text></View>)}<Text style={styles.muted}>{d.snapshot.policy.reach}</Text></InfoAction>}
  </View>;
}
export function ReportContext({ document: d }: { document: ReportDocument }) {
  const { styles } = useTheme();
  return <View style={{ gap: 8 }}><ReportHeading>Report context</ReportHeading>
    <Text style={styles.muted}>{d.kind} · {d.snapshot.campaign.category || "Unpublished"}</Text><Text style={styles.muted}>Generated {d.generated}. {d.snapshot.dataTimeNote}</Text>
    <Text style={styles.muted}>{d.snapshot.policy.reach}</Text><Text style={styles.muted}>{d.snapshot.policy.privacy}</Text><Text style={styles.muted}>{d.currencyNote} Accounting remains in USD.</Text>
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Public snapshot · {d.snapshot.reportSnapshotId}. The shared PDF uses the same figures and dated currency reference.</Text>
  </View>;
}
/** Three intentional destinations replace the duplicated stack of six disclosures. */
export function ReportDetails({ document: d, onOpen, onFunding }: { document: ReportDocument; onOpen: (section: ReportSection) => void; onFunding: () => void }) {
  return <View style={{ gap: 8 }}>
    <SummaryLink testID="report-funding" title="Funding & spending" summary={`${d.raised} raised · ${d.balance[0].value} spent`} description="Fees, remaining balance and refunds." icon="wallet-outline" onPress={onFunding} />
    <SummaryLink testID="report-delivery" title="Distribution & results" summary={d.snapshot.distribution.state} description="Audience, delivery and metric definitions." icon="stats-chart-outline" onPress={() => onOpen("delivery")} />
    <SummaryLink testID="report-journey" title="Journey & report context" summary={`${d.events.length} recorded ${d.events.length === 1 ? "event" : "events"}`} description="Status history, dates and public snapshot." icon="time-outline" onPress={() => onOpen("journey")} />
  </View>;
}
export function ReportSectionDetails({ document, section }: { document: ReportDocument; section: Exclude<ReportSection, "overview"> }) {
  return section === "delivery" ? <View style={{ gap: 22 }}><View style={{ gap: 8 }}><ReportHeading>{document.snapshot.final ? "Delivery results" : "Results so far"}</ReportHeading><ReportResults document={document} details /></View><ReportDistribution document={document} /></View>
    : <View style={{ gap: 22 }}><ReportTimeline document={document} /><ReportContext document={document} /></View>;
}
