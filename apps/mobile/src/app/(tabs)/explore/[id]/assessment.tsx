import { useState } from "react";
import { Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Accordion, Button, ErrorState, fonts, Loading, Notice, Screen, Text, useTheme } from "../../../../components/ui";
import { api } from "../../../../lib/api";
import { AssessmentRecord, AssessmentRubric, PublicAssessment } from "../../../../lib/assessments";
import { useRefreshOnFocus, useSession } from "../../../../lib/session";
import { isPublicUrl } from "../../../../features/creation/model";
import { TrustScore } from "../../../../features/transparency/TrustScore";

export default function CampaignAssessment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { styles } = useTheme();
  const q = useQuery({ queryKey: ["assessment", id, user?.id], queryFn: () => api<PublicAssessment>(`/campaigns/${id}/assessment`) });
  const rubric = useQuery({ queryKey: ["assessment-rubric"], queryFn: () => api<AssessmentRubric>("/assessment-rubric") });
  useRefreshOnFocus(q.refetch);
  return <Screen>
    <Button title="Back to campaign" variant="ghost" icon="arrow-back" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => router.dismissTo(`/explore/${id}`)} />
    <Text accessibilityRole="header" style={styles.title}>Review & transparency</Text>
    <Text style={styles.muted}>Policy approval, evidence coverage, ad readiness and delivery are separate checks.</Text>
    {q.isPending ? <Loading /> : q.isError ? <ErrorState error={q.error} retry={() => q.refetch()} /> : <>
      <TrustScore data={q.data} loading={false} error={false} onRetry={() => { void q.refetch(); }} />
      {q.data.assessment && q.data.state === "completed" ? <AssessmentDetails record={q.data.assessment} /> : <Notice>
        {q.data.state === "in_progress" ? "A review is being documented. Draft notes and provisional scores are private until the assessment is completed and published." :
          q.data.state === "superseded" ? "This published content needs a new assessment. Previous scores below apply only to their older version." :
            "No completed assessment is recorded for the current published content. Absence of a score is not a score of zero or a rejection."}
      </Notice>}
      {!!q.data.history.length && <Accordion title="Previous assessment history">
        <Text style={styles.muted}>Historical scores do not assess changed content or replace the current rubric.</Text>
        {q.data.history.map(record => <View key={record.id} style={{ gap: 8 }}>
          <Text style={styles.h2}>Earlier version {record.assessedVersion} · {record.total}/100</Text>
          <Text style={styles.muted}>{record.assessmentType === "demo" ? "Demo assessment" : "Recorded reviewer assessment"} · {record.classification}</Text>
          <AssessmentDetails record={record} />
        </View>)}
      </Accordion>}
    </>}
    <Accordion title="Campaign's prototype rubric">
      {rubric.isPending ? <Loading /> : rubric.isError ? <ErrorState error={rubric.error} retry={() => rubric.refetch()} /> : <>
        <Text style={styles.body}>{rubric.data.title} · {rubric.data.version}</Text>
        <Text style={styles.muted}>{rubric.data.limitations} These weights and bands are Campaign&apos;s prototype method, not an organizer-provided algorithm.</Text>
        {rubric.data.criteria.map(criterion => <Accordion key={criterion.id} title={`${criterion.title} · ${criterion.maximum} points`}>
          {criterion.checks.map(check => <View key={check.id} style={{ gap: 7 }}>
            <Text style={styles.h2}>{check.title}</Text>
            {(["none", "partial", "met"] as const).map(key => <Text key={key} style={styles.body}>{check.anchors[key].points} points — {check.anchors[key].rule}</Text>)}
          </View>)}
        </Accordion>)}
        {rubric.data.bands.map(band => <Text key={band.minimum} style={styles.body}>{band.minimum}–{band.maximum}: {band.label}</Text>)}
        <Text style={styles.muted}>Bands describe documented review coverage. They are not calibrated probabilities of truth and do not create a funding eligibility threshold.</Text>
      </>}
    </Accordion>
    <Button title="See the audience and distribution plan" variant="secondary" onPress={() => router.push(`/explore/${id}/audience`)} />
  </Screen>;
}

function AssessmentDetails({ record }: { record: AssessmentRecord }) {
  const { colors, styles } = useTheme();
  const [error, setError] = useState("");
  const published = record.publishedAt && Number.isFinite(Date.parse(record.publishedAt)) ? new Date(record.publishedAt).toLocaleString() : "Publication time unavailable";
  async function open(reference: string) {
    if (!isPublicUrl(reference)) return;
    try { await Linking.openURL(reference); setError(""); }
    catch { setError("Could not open the evidence link. Check your connection and try again."); }
  }
  return <View style={{ gap: 14 }}>
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 13, lineHeight: 20 }}>{record.provenance.label}</Text>
      <Text style={styles.muted}>{record.provenance.description}</Text>
      <Text style={[styles.muted, { fontSize: 11, lineHeight: 18 }]}>Version {record.assessedVersion} · {record.rubricVersion}{"\n"}Published {published}</Text>
    </View>
    {record.criteria.map(criterion => <Accordion key={criterion.id} title={`${criterion.title} · ${criterion.points}/${criterion.maximum}`}>
      {criterion.checks.map(check => <View key={check.id} style={{ gap: 6, paddingBottom: 12 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21, color: colors.ink }}>{check.title} · {check.points}/{check.maximum}</Text>
        <Text style={styles.muted}>{check.performed ? "Check performed" : "Not performed / unverified"}</Text>
        <Text style={styles.body}>{check.reason}</Text>
        {check.evidence.map((evidence, index) => <View key={index} style={{ gap: 4 }}>
          <Text style={styles.body}>{evidence.note}</Text>
          {isPublicUrl(evidence.reference) ? <Button title={`Open evidence: ${evidence.reference}`} variant="ghost" icon="open-outline" onPress={() => { void open(evidence.reference); }} style={{ paddingHorizontal: 0 }} /> : <Text style={styles.muted}>Reference: {evidence.reference}</Text>}
        </View>)}
        {check.privateEvidenceWithheld && <Text style={styles.muted}>Additional reviewer evidence is private; it is not disclosed here.</Text>}
        {!!check.missing.length && <Text style={styles.muted}>Missing or unverified: {check.missing.join(" · ")}</Text>}
      </View>)}
    </Accordion>)}
    <View style={{ gap: 7 }}>
      <Text accessibilityRole="header" style={styles.h2}>Limitations</Text>
      {record.limitations.map((limitation, index) => <Text key={index} style={styles.body}>• {limitation}</Text>)}
    </View>
    <Accordion title="Assessed content reference"><Text style={styles.muted}>Version {record.assessedVersion} · {record.contentHash}</Text><Text style={styles.muted}>The server binds this assessment to that exact content. A private draft does not replace the unchanged approved public version.</Text></Accordion>
    {!!error && <Notice tone="error">{error}</Notice>}
  </View>;
}
