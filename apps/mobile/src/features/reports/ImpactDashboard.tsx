import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { Button, ConnectionHint, ErrorState, Text, useTheme } from "../../components/ui";
import { useCurrency } from "../../lib/CurrencyProvider";
import { createReportDocument } from "../../lib/report";
import { useCampaignReport } from "./useCampaignReport";
import { ReportDistribution, ReportFunding, ReportResults, ReportStatus, ReportTimeline } from "./ReportContent";

export function ReportLoading() {
  const { colors } = useTheme();
  return <View accessibilityLabel="Loading campaign report" style={{ gap: 14 }}><View style={{ height: 24, width: "65%", borderRadius: 6, backgroundColor: colors.line }} /><View style={{ height: 70, borderRadius: 10, backgroundColor: colors.paper }} /><View style={{ height: 140, borderRadius: 10, backgroundColor: colors.paper }} /><ActivityIndicator color={colors.primary} /><ConnectionHint active /></View>;
}
export function ImpactDashboard({ id, active }: { id: string; active: boolean }) {
  const query = useCampaignReport(id, active), { snapshot } = useCurrency(), { styles } = useTheme();
  const document = useMemo(() => query.data ? createReportDocument(query.data, snapshot) : null, [query.data, snapshot]);
  if (query.isPending) return <ReportLoading />;
  if (query.isError) return <ErrorState error={query.error} retry={() => { void query.refetch(); }} />;
  if (!document) return null;
  return <View style={{ gap: 24 }}>
    <ReportStatus document={document} />
    <Button title="View & share report" icon="document-text-outline" variant="secondary" onPress={() => router.push(`/explore/${id}/report`)} />
    <ReportFunding document={document} />
    <ReportTimeline document={document} />
    <ReportDistribution document={document} />
    <ReportResults document={document} />
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>One report snapshot · Generated {document.generated}. Payments and delivery are simulated.</Text>
  </View>;
}
