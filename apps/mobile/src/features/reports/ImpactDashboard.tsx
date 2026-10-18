import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { ConnectionHint, ErrorState, fonts, Text, useTheme } from "../../components/ui";
import { SummaryLink } from "../../components/Information";
import { useCurrency } from "../../lib/CurrencyProvider";
import { createReportDocument } from "../../lib/report";
import { useCampaignReport } from "./useCampaignReport";
import { ReportMetrics } from "./ReportMetrics";

export function ReportLoading() {
  const { colors } = useTheme();
  return <View accessibilityLabel="Loading campaign report" style={{ gap: 14 }}><View style={{ height: 24, width: "65%", borderRadius: 6, backgroundColor: colors.line }} /><View style={{ height: 70, borderRadius: 10, backgroundColor: colors.paper }} /><View style={{ height: 140, borderRadius: 10, backgroundColor: colors.paper }} /><ActivityIndicator color={colors.primary} /><ConnectionHint active /></View>;
}
export function ImpactDashboard({ id, active }: { id: string; active: boolean }) {
  const { colors } = useTheme();
  const query = useCampaignReport(id, active), { snapshot } = useCurrency();
  const document = useMemo(() => query.data ? createReportDocument(query.data, snapshot) : null, [query.data, snapshot]);
  if (query.isPending) return <ReportLoading />;
  if (query.isError) return <ErrorState error={query.error} retry={() => { void query.refetch(); }} />;
  if (!document) return null;
  return <View style={{ gap: 14 }}>
    <ReportMetrics document={document} />
    <View style={{ gap: 4 }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21, color: colors.primary }}>{document.snapshot.status}</Text>
      <Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>{document.snapshot.nextStep.title}</Text>
    </View>
    <SummaryLink title="Campaign report" summary="Results, funding and the recorded journey" description="Open the complete report or share its PDF." icon="document-text-outline" onPress={() => router.push(`/explore/${id}/report`)} />
  </View>;
}
