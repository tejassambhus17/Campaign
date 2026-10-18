import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, BackHandler, Platform, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Button, ErrorState, fonts, IconButton, Notice, Screen, Text, useTheme } from "../../../../components/ui";
import { useCurrency } from "../../../../lib/CurrencyProvider";
import { captureApiSession } from "../../../../lib/api";
import { canShareReport, createReportDocument, ReportDocument } from "../../../../lib/report";
import { useCampaignReport } from "../../../../features/reports/useCampaignReport";
import { ReportLoading } from "../../../../features/reports/ImpactDashboard";
import { ReportDetails, reportSection, ReportSection, ReportSectionDetails, ReportStatus } from "../../../../features/reports/ReportContent";
import { ReportMetrics } from "../../../../features/reports/ReportMetrics";
import { pruneReportCache, shareReport } from "../../../../features/reports/shareReport";

export default function Report() {
  const { id, section: requestedSection } = useLocalSearchParams<{ id: string; section?: string }>();
  const { colors } = useTheme(), { snapshot } = useCurrency();
  const query = useCampaignReport(id), mounted = useRef(true), exporting = useRef(false);
  const focused = useRef(false), focusGeneration = useRef(0);
  const [sharing, setSharing] = useState<ReportDocument | null>(null), [error, setError] = useState("");
  const [section, setSection] = useState<ReportSection>(() => reportSection(requestedSection));
  const hasLocalParent = section !== reportSection(requestedSection);
  const title = section === "delivery" ? "Distribution & results" : section === "journey" ? "Journey & report context" : "Campaign report";
  const latest = useMemo(() => query.data ? createReportDocument(query.data, snapshot) : null, [query.data, snapshot]);
  const document = sharing || latest;
  useEffect(() => { mounted.current = true; pruneReportCache(); return () => { mounted.current = false; }; }, []);
  useFocusEffect(useCallback(() => { focused.current = true; ++focusGeneration.current; return () => { focused.current = false; ++focusGeneration.current; }; }, []));
  useEffect(() => { setSection(reportSection(requestedSection)); }, [id, requestedSection]);
  useEffect(() => { if (section !== "overview") AccessibilityInfo.announceForAccessibility(title); }, [section, title]);
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!hasLocalParent) return false;
      setSection(reportSection(requestedSection)); return true;
    });
    return () => subscription.remove();
  }, [hasLocalParent, requestedSection]));
  function back() {
    if (hasLocalParent) setSection(reportSection(requestedSection));
    else if (router.canGoBack()) router.back();
    else router.replace(`/explore/${id}`);
  }
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
  return <Screen compact key={`${id}:${section}`}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginHorizontal: -8 }}>
      <IconButton label={hasLocalParent ? "Back to campaign report" : "Back"} icon="arrow-back" onPress={back} />
      <Text accessibilityRole="header" style={{ flex: 1, fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, color: colors.ink }}>{title}</Text>
      <IconButton label="Refresh campaign report" icon="refresh-outline" loading={query.isFetching || !!sharing} onPress={() => { if (!sharing) void query.refetch(); }} />
    </View>
    {query.isPending ? <ReportLoading /> : query.isError ? <ErrorState error={query.error} retry={() => { void query.refetch(); }} /> : document && <View style={{ gap: 14 }}>
      {section === "overview" ? <>
        <ReportMetrics document={document} />
        <Text style={{ fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: colors.ink }}>{document.title}</Text>
        <ReportStatus document={document} />
        <ReportDetails document={document} onOpen={setSection} onFunding={() => router.push(`/explore/${id}/funding`)} />
        {Platform.OS === "web" ? <Notice>PDF sharing is available in the Campaign Android app.</Notice> : canShareReport(document.snapshot) ? <Button title={sharing ? "Preparing report…" : "Share report"} icon="share-outline" loading={!!sharing} onPress={() => { void share(); }} /> : <Notice>A report can be shared after an approved public campaign is available. Private drafts are not exported.</Notice>}
      </> : <ReportSectionDetails document={document} section={section} />}
      {!!error && <Notice tone="error">{error}</Notice>}
    </View>}
  </Screen>;
}
