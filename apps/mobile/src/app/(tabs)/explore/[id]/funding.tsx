import { useCallback, useMemo, useState } from "react";
import { BackHandler, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ErrorState, fonts, Notice, Progress, Screen, Text, useTheme } from "../../../../components/ui";
import { SummaryLink } from "../../../../components/Information";
import { PageHeading } from "../../../../features/transparency/PageHeading";
import { useCurrency } from "../../../../lib/CurrencyProvider";
import { createReportDocument } from "../../../../lib/report";
import { formatMoney } from "../../../../lib/currency";
import { useCampaignReport } from "../../../../features/reports/useCampaignReport";
import { ReportLoading } from "../../../../features/reports/ImpactDashboard";
import { ReportFunding, ReportRows } from "../../../../features/reports/ReportContent";

/** Public, read-only funding overview. Every value comes from one report snapshot. */
export default function FundingAndSpending() {
  const { id } = useLocalSearchParams<{ id: string }>(), { colors, styles } = useTheme();
  const query = useCampaignReport(id), { snapshot } = useCurrency();
  const document = useMemo(() => query.data ? createReportDocument(query.data, snapshot) : null, [query.data, snapshot]);
  const [view, setView] = useState<"overview" | "accounting" | "refunds">("overview");
  useFocusEffect(useCallback(() => {
    if (view === "overview") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { setView("overview"); return true; });
    return () => subscription.remove();
  }, [view]));
  const r = document?.snapshot;
  return <Screen compact key={view}>
    <PageHeading title={view === "accounting" ? "Funding details" : view === "refunds" ? "Refunds & remaining funds" : "Funding & Spending"} id={id} onBack={view === "overview" ? undefined : () => setView("overview")} />
    {query.isPending ? <ReportLoading /> : query.isError ? <ErrorState error={query.error} retry={() => { void query.refetch(); }} /> : !document || !r ? <Notice>The public funding snapshot is unavailable.</Notice> : view === "accounting" ? <ReportFunding document={document} details /> : view === "refunds" ? <View style={{ gap: 13 }}>
      <Text style={styles.body}>{r.refundStatus}</Text>
      <ReportRows rows={document.balance.filter(row => ["refunded", "remainingAdvertisingBudget"].includes(row.key))} details />
      <Text style={styles.body}>{r.policy.refunds}</Text><Text style={styles.body}>{r.policy.unspent}</Text>
      <Text style={styles.muted}>Pending simulated refunds: {formatMoney(r.refundPendingAmount, document.currency)}. These are not deducted until completed.</Text>
      <Text style={styles.muted}>Completed refunds include {formatMoney(r.refundedAdvertising, document.currency)} from advertising and {formatMoney(r.refundedFees, document.currency)} from fees.</Text>
      <Text style={styles.muted}>Unspent before refunds: {formatMoney(r.unspentBeforeRefund, document.currency)}. This historical amount includes money already refunded; it is not another available balance.</Text>
    </View> : <>
      <View style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: 14, padding: 14, gap: 9 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 22, lineHeight: 29, color: colors.ink }}>{document.raised} <Text style={{ fontSize: 13, color: colors.muted }}>of {document.goal}</Text></Text>
          <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{r.fundingPercentage === null ? "Goal unavailable" : `${r.fundingPercentage}% funded`}</Text>
        </View>
        {r.campaign.goal !== null && <Progress raised={r.raised} goal={r.campaign.goal} />}
        <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Funds message advertising, not direct donations.</Text>
      </View>
      <View style={{ gap: 5 }}>
        <Text accessibilityRole="header" style={{ fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23, color: colors.ink }}>Where contributions go</Text>
        <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Original allocation before spending or refunds.</Text>
        <ReportRows rows={[{ ...document.funding[2], label: "Amount for ads" }, { ...document.funding[1], label: `Included platform fee (${Number((r.policy.feeRate * 100).toFixed(2))}%)` }, { ...document.funding[0], label: "Total contributions" }]} />
      </View>
      <SummaryLink testID="funding-spending-results" icon="bar-chart-outline" title="Spending & results" summary={`${document.balance[0].value} simulated ad spending`} description={r.nextStep.title} onPress={() => router.push(`/explore/${encodeURIComponent(id)}/report?section=delivery`)} />
      <SummaryLink testID="funding-refunds" icon="return-down-back-outline" title="Refunds" summary={r.refundState === "none" ? "When refunds apply" : r.refundStatus} onPress={() => setView("refunds")} />
      <SummaryLink testID="funding-accounting" icon="receipt-outline" title="Detailed funding breakdown" summary="Remaining funds, accounting and currency" onPress={() => setView("accounting")} />
      <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{r.policy.delivery}</Text>
      <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Reaching the goal does not start advertising. Partial funding requires explicit reviewer approval after the deadline; otherwise the campaign is cancelled and simulated refunds apply.</Text>
    </>}
  </Screen>;
}
