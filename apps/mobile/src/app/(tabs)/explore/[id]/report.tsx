import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Button, ErrorState, fonts, IconButton, Notice, PageHeader, Screen, Text, useTheme } from "../../../../components/ui";
import { useCurrency } from "../../../../lib/CurrencyProvider";
import { captureApiSession } from "../../../../lib/api";
import { canShareReport, createReportDocument, ReportDocument } from "../../../../lib/report";
import { useCampaignReport } from "../../../../features/reports/useCampaignReport";
import { ReportLoading } from "../../../../features/reports/ImpactDashboard";
import { ReportDistribution, ReportFunding, ReportResults, ReportStatus, ReportTimeline } from "../../../../features/reports/ReportContent";
import { pruneReportCache, shareReport } from "../../../../features/reports/shareReport";

export default function Report() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, styles } = useTheme(), { snapshot } = useCurrency();
  const query = useCampaignReport(id), mounted = useRef(true), exporting = useRef(false);
  const focused = useRef(false), focusGeneration = useRef(0);
  const [sharing, setSharing] = useState<ReportDocument | null>(null), [error, setError] = useState("");
  const latest = useMemo(() => query.data ? createReportDocument(query.data, snapshot) : null, [query.data, snapshot]);
  const document = sharing || latest;
  useEffect(() => { mounted.current = true; pruneReportCache(); return () => { mounted.current = false; }; }, []);
  useFocusEffect(useCallback(() => { focused.current = true; ++focusGeneration.current; return () => { focused.current = false; ++focusGeneration.current; }; }, []));
  async function share() {
    if (!document || query.isError || exporting.current) return;
    exporting.current = true;
    const sessionCurrent = captureApiSession();
    const generation = focusGeneration.current;
    const current = () => mounted.current && focused.current && focusGeneration.current === generation && sessionCurrent();
    setSharing(document); setError("");
    try { await shareReport(document, current); }
    catch (failure) { if (current()) setError(failure instanceof Error ? failure.message : "The report could not be shared. Please try again."); }
    finally { exporting.current = false; if (mounted.current) setSharing(null); }
  }
  return <Screen>
    <View style={{ gap: 2 }}><Button title="Back to campaign" variant="ghost" icon="arrow-back" onPress={() => router.dismissTo(`/explore/${id}`)} style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} />
      <PageHeader title="Campaign report" action={<IconButton label="Refresh campaign report" icon="refresh-outline" loading={query.isFetching || !!sharing} onPress={() => { if (!sharing) void query.refetch(); }} />} />
    </View>
    {query.isPending ? <ReportLoading /> : query.isError ? <ErrorState error={query.error} retry={() => { void query.refetch(); }} /> : document && <View style={{ gap: 24 }}>
      <View style={{ gap: 6 }}><Text style={{ fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, color: colors.ink }}>{document.title}</Text><Text style={styles.muted}>{document.kind} · {document.snapshot.campaign.category || "Unpublished"}</Text><Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Generated {document.generated}</Text></View>
      <Notice>Payments and delivery are simulated. No live advertising results are verified.</Notice>
      {Platform.OS === "web" ? <Notice>PDF sharing is available in the Campaign Android app.</Notice> : canShareReport(document.snapshot) ? <Button title={sharing ? "Preparing report…" : "Share report"} icon="share-outline" loading={!!sharing} onPress={() => { void share(); }} /> : <Notice>A report can be shared after an approved public campaign is available. Private drafts are not exported.</Notice>}
      {!!error && <Notice tone="error">{error}</Notice>}
      <ReportStatus document={document} />
      <ReportFunding document={document} details />
      <ReportTimeline document={document} />
      <ReportDistribution document={document} />
      <ReportResults document={document} details />
      <View style={{ gap: 8 }}><Text accessibilityRole="header" style={styles.h2}>Current outcome</Text><Text style={styles.body}>{document.outcome}</Text><Text style={styles.muted}>{document.snapshot.policy.reach}</Text><Text style={styles.muted}>{document.snapshot.policy.privacy}</Text></View>
      <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>{document.snapshot.dataTimeNote}{"\n"}Public report snapshot · {document.snapshot.reportSnapshotId.slice(0, 16)}. The shared PDF uses the same figures and dated currency reference shown here.</Text>
    </View>}
  </Screen>;
}
