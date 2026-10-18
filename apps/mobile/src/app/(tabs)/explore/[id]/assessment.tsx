import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo, BackHandler, Linking, Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button, ErrorState, fonts, IconButton, Loading, Notice, Screen, Text, useTheme } from "../../../../components/ui";
import { SummaryLink } from "../../../../components/Information";
import { api } from "../../../../lib/api";
import { AssessmentCriterion, AssessmentRecord, AssessmentRubric, assessmentPresentation, PublicAssessment } from "../../../../lib/assessments";
import { useRefreshOnFocus, useSession } from "../../../../lib/session";
import { isPublicUrl } from "../../../../features/creation/model";
import { TrustScore } from "../../../../features/transparency/TrustScore";

type AssessmentView = { kind: "overview" | "methodology" | "history" } | { kind: "criterion"; criterionId: string; recordId?: string } | { kind: "context"; recordId?: string } | { kind: "record"; recordId: string };
const criterionIcons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = { sources: "link-outline", clarity: "chatbubble-ellipses-outline", creator: "person-outline", funding: "wallet-outline", policy: "shield-checkmark-outline" };
function historicalAssessment(record: AssessmentRecord, disclaimer: string): PublicAssessment {
  return { state: "completed", contentHash: record.contentHash, assessedVersion: record.assessedVersion, rubricVersion: record.rubricVersion, assessment: record, history: [], disclaimer };
}
function publishedHistory(data: PublicAssessment) {
  // A historical public record remains inspectable even if this client cannot
  // safely present its score. Private assessment drafts never enter this list.
  return data.history.filter(record => record.status === "published");
}
function AssessmentHeading({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text accessibilityRole="header" style={{ fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: colors.ink }}>{children}</Text>;
}

export default function CampaignAssessment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession(), { colors, styles } = useTheme();
  const [views, setViews] = useState<AssessmentView[]>([{ kind: "overview" }]);
  const view = views[views.length - 1];
  const q = useQuery({ queryKey: ["assessment", id, user?.id], queryFn: () => api<PublicAssessment>(`/campaigns/${id}/assessment`) });
  const rubric = useQuery({ queryKey: ["assessment-rubric"], queryFn: () => api<AssessmentRubric>("/assessment-rubric"), enabled: view.kind === "methodology" });
  useRefreshOnFocus(q.refetch);
  useEffect(() => { setViews([{ kind: "overview" }]); }, [id, user?.id]);
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (views.length <= 1) return false;
      setViews(previous => previous.slice(0, -1)); return true;
    });
    return () => subscription.remove();
  }, [views.length]));
  const open = (next: AssessmentView) => setViews(previous => [...previous, next]);
  const methodologyLink = <SummaryLink testID="assessment-methodology" title="Review methodology" summary="Campaign's prototype rubric" description="Point weights, check definitions and coverage bands." icon="document-text-outline" onPress={() => open({ kind: "methodology" })} />;
  const history = q.data ? publishedHistory(q.data) : [];
  const current = q.data && assessmentPresentation(q.data).score !== null ? q.data.assessment : null;
  const recordId = "recordId" in view ? view.recordId : undefined;
  const record = recordId ? history.find(value => value.id === recordId) : current;
  const criterion = view.kind === "criterion" ? record?.criteria.find(value => value.id === view.criterionId) : undefined;
  const title = view.kind === "criterion" ? criterion?.title || "Assessment detail" : view.kind === "context" ? "Context & limitations" : view.kind === "history" ? "Assessment history" : view.kind === "record" ? "Earlier assessment" : view.kind === "methodology" ? "Review methodology" : "Trust & verification";
  const viewKey = `${view.kind}:${recordId || "current"}:${view.kind === "criterion" ? view.criterionId : ""}`;
  useEffect(() => { if (view.kind !== "overview") AccessibilityInfo.announceForAccessibility(title); }, [viewKey, title, view.kind]);
  function back() {
    if (views.length > 1) setViews(previous => previous.slice(0, -1));
    else if (router.canGoBack()) router.back();
    else router.replace(`/explore/${id}`);
  }
  return <Screen compact key={`${id}:${viewKey}`}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginHorizontal: -8 }}>
      <IconButton label={views.length > 1 ? "Back to assessment" : "Back"} icon="arrow-back" onPress={back} />
      <Text accessibilityRole="header" style={{ flex: 1, fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, color: colors.ink }}>{title}</Text>
    </View>
    {view.kind === "methodology" ? (rubric.isPending ? <Loading /> : rubric.isError ? <ErrorState error={rubric.error} retry={() => { void rubric.refetch(); }} /> : <AssessmentMethodology rubric={rubric.data} />)
      : q.isPending ? <><Loading />{methodologyLink}</> : q.isError ? <><ErrorState error={q.error} retry={() => { void q.refetch(); }} />{methodologyLink}</> : <>
      {view.kind === "overview" && <>
        <View style={{ backgroundColor: colors.paper, borderRadius: 12, padding: 12 }}><TrustScore compact data={q.data} loading={false} error={false} onRetry={() => { void q.refetch(); }} /></View>
        {current ? <AssessmentOverview record={current} open={open} /> : <Notice>{q.data.state === "in_progress" ? "A review is being documented. Draft notes and provisional scores stay private until completed and published." : q.data.state === "superseded" ? "The published content needs a new assessment. Historical scores apply only to their earlier version." : "No completed assessment is recorded for the current content. No score does not mean zero or rejection."}</Notice>}
        {methodologyLink}
        {!!history.length && <SummaryLink testID="assessment-history" title="Assessment history" summary={`${history.length} earlier ${history.length === 1 ? "record" : "records"}`} description="Previous versions, kept separate from this assessment." icon="time-outline" onPress={() => open({ kind: "history" })} />}
        <Button title="Audience & distribution plan" variant="ghost" icon="people-outline" onPress={() => router.push(`/explore/${id}/audience`)} />
      </>}
      {view.kind === "criterion" && (criterion ? <AssessmentCriterionContent key={`${record?.id}:${criterion.id}`} criterion={criterion} /> : <Notice>This criterion is no longer available in this assessment. Use Back to return to the overview.</Notice>)}
      {view.kind === "context" && (record ? <AssessmentContext record={record} /> : <Notice>This assessment is unavailable. Use Back to return to the overview.</Notice>)}
      {view.kind === "history" && <View style={{ gap: 8 }}>
        <Text style={styles.muted}>Historical scores assess earlier content. They do not replace the current assessment or rubric.</Text>
        {history.length ? history.map(item => {
          const state = assessmentPresentation(historicalAssessment(item, q.data.disclaimer));
          return <SummaryLink key={item.id} title={`Version ${item.assessedVersion} · ${state.score !== null ? `${state.score}/100` : "Score unavailable"}`} summary={state.label} description={`Published · ${item.assessmentType === "demo" ? "Illustrative demo assessment" : "Recorded reviewer assessment"}`} icon="document-text-outline" onPress={() => open({ kind: "record", recordId: item.id })} />;
        }) : <Notice>No published historical assessments are available.</Notice>}
      </View>}
      {view.kind === "record" && (record ? <>
        <Notice>Earlier content · version {record.assessedVersion}. This recorded assessment does not assess the current published content.</Notice>
        <View style={{ backgroundColor: colors.paper, borderRadius: 12, padding: 12 }}><TrustScore compact data={historicalAssessment(record, q.data.disclaimer)} loading={false} error={false} onRetry={() => { void q.refetch(); }} /></View>
        <AssessmentOverview record={record} recordId={record.id} open={open} />
      </> : <Notice>This historical assessment is no longer available. Use Back to return to history.</Notice>)}
    </>}
  </Screen>;
}

function AssessmentOverview({ record, recordId, open }: { record: AssessmentRecord; recordId?: string; open: (view: AssessmentView) => void }) {
  return <View style={{ gap: 8 }}>
    {record.criteria.map(criterion => <SummaryLink key={criterion.id} testID={`assessment-criterion-${criterion.id}`} title={criterion.title} summary={`${criterion.points}/${criterion.maximum} review points`} icon={criterionIcons[criterion.id] || "checkmark-circle-outline"} onPress={() => open({ kind: "criterion", criterionId: criterion.id, recordId })} />)}
    <SummaryLink testID="assessment-context" title="Context & limitations" summary={record.provenance.label} description="Review scope, content version and recorded limitations." icon="information-circle-outline" onPress={() => open({ kind: "context", recordId })} />
  </View>;
}

export function AssessmentCriterionContent({ criterion }: { criterion: AssessmentCriterion }) {
  const { colors, styles } = useTheme(), [error, setError] = useState("");
  async function open(reference: string) {
    if (!isPublicUrl(reference)) return;
    try { await Linking.openURL(reference); setError(""); }
    catch { setError("Could not open the evidence link. Check your connection and try again."); }
  }
  return <View style={{ gap: 18 }}>
    <Text style={{ fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, color: colors.primary }}>{criterion.points}/{criterion.maximum} review points</Text>
    {criterion.checks.map(check => <View key={check.id} style={{ gap: 7 }}>
      <AssessmentHeading>{check.title} · {check.points}/{check.maximum}</AssessmentHeading>
      <Text style={styles.muted}>{check.performed ? "Check performed" : "Not performed / unverified"}</Text><Text style={styles.body}>{check.reason}</Text>
      {check.evidence.filter(evidence => evidence.visibility !== "private").map((evidence, index) => <View key={index} style={{ gap: 4 }}>
        <Text style={styles.body}>{evidence.note}</Text><Text selectable style={styles.muted}>Reference: {evidence.reference}</Text>
        {isPublicUrl(evidence.reference) && <Pressable accessibilityRole="link" accessibilityLabel={`Open evidence: ${evidence.reference}`} onPress={() => { void open(evidence.reference); }} style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 7, alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}><Ionicons name="open-outline" size={17} color={colors.primary} accessible={false} /><Text style={{ fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: colors.primary }}>Open evidence</Text></Pressable>}
      </View>)}
      {(check.privateEvidenceWithheld || check.evidence.some(evidence => evidence.visibility === "private")) && <Text style={styles.muted}>Additional reviewer evidence is private; it is not disclosed here.</Text>}
      {!!check.missing.length && <Text style={styles.muted}>Missing or unverified: {check.missing.join(" · ")}</Text>}
    </View>)}
    {!!error && <Notice tone="error">{error}</Notice>}
  </View>;
}

export function AssessmentContext({ record }: { record: AssessmentRecord }) {
  const { styles } = useTheme();
  const published = record.publishedAt && Number.isFinite(Date.parse(record.publishedAt)) ? new Date(record.publishedAt).toLocaleString() : "Publication time unavailable";
  return <View style={{ gap: 18 }}>
    <View style={{ gap: 7 }}><AssessmentHeading>Limitations</AssessmentHeading>{record.limitations.length ? record.limitations.map((item, index) => <Text key={index} style={styles.body}>{item}</Text>) : <Text style={styles.muted}>No additional limitations were recorded. This is not independent verification or a guarantee of the claims.</Text>}</View>
    <View style={{ gap: 7 }}><AssessmentHeading>Assessment provenance</AssessmentHeading><Text style={styles.body}>{record.provenance.label}</Text><Text style={styles.muted}>{record.provenance.description}</Text><Text style={styles.muted}>Version {record.assessedVersion} · {record.rubricVersion}{"\n"}Published {published}</Text><Text style={styles.muted}>Policy approval, evidence coverage, ad readiness and delivery are separate checks.</Text></View>
    <View style={{ gap: 7 }}><AssessmentHeading>Assessed content reference</AssessmentHeading><Text selectable style={styles.muted}>Version {record.assessedVersion} · {record.contentHash}</Text><Text style={styles.muted}>The server binds this assessment to that exact content. A private draft does not replace the unchanged approved public version.</Text></View>
  </View>;
}

export function AssessmentMethodology({ rubric }: { rubric: AssessmentRubric }) {
  const { styles } = useTheme();
  return <View style={{ gap: 20 }}>
    <View style={{ gap: 7 }}><AssessmentHeading>{rubric.title} · {rubric.version}</AssessmentHeading><Text style={styles.muted}>{rubric.limitations} These weights and bands are Campaign&apos;s prototype method, not an organizer-provided algorithm.</Text><Text style={styles.muted}>{rubric.disclaimer}</Text></View>
    {rubric.criteria.map(criterion => <View key={criterion.id} style={{ gap: 12 }}><AssessmentHeading>{criterion.title} · {criterion.maximum} points</AssessmentHeading>
      {criterion.checks.map(check => <View key={check.id} style={{ gap: 7 }}><Text style={styles.body}>{check.title}</Text>{(["none", "partial", "met"] as const).map(anchor => <Text key={anchor} style={styles.muted}>{check.anchors[anchor].points} points — {check.anchors[anchor].rule}</Text>)}</View>)}
    </View>)}
    <View style={{ gap: 7 }}><AssessmentHeading>Review coverage bands</AssessmentHeading>{rubric.bands.map(band => <Text key={band.minimum} style={styles.body}>{band.minimum}–{band.maximum}: {band.label}</Text>)}<Text style={styles.muted}>Bands describe documented review coverage. They are not calibrated probabilities of truth and do not create a funding eligibility threshold. Earlier assessments retain their recorded rubric version.</Text></View>
  </View>;
}
