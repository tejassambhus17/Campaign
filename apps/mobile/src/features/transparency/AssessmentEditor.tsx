import { useState } from "react";
import { Switch, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Accordion, Button, Field, Loading, ErrorState, Notice, Pill, Text, useTheme } from "../../components/ui";
import { api } from "../../lib/api";
import { AssessmentCheck, AssessmentRecord, AssessmentWorkspace, assessmentDraftPayload, CheckAnchor } from "../../lib/assessments";
import { AssessmentSnapshot } from "./AssessmentSnapshot";

export function AssessmentEditor({ campaignId, published, revisionPending }: { campaignId: string; published: boolean; revisionPending: boolean }) {
  const { styles } = useTheme();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<"public" | "working">(published ? "public" : "working");
  const [record, setRecord] = useState<AssessmentRecord | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const workspace = useQuery({ queryKey: ["assessment-workspace", campaignId, target], queryFn: () => api<AssessmentWorkspace>(`/campaigns/${campaignId}/assessment-workspace?target=${target}`), enabled: open });

  function choose(next: "public" | "working") {
    if (dirty || busy) return;
    setTarget(next); setRecord(null); setFeedback("");
  }
  async function prepare() {
    if (!workspace.data || busy) return;
    setBusy(true); setFeedback(""); setFailed(false);
    try {
      const draft = workspace.data.completed || workspace.data.draft || await api<AssessmentRecord>(`/campaigns/${campaignId}/assessments`, { method: "POST", body: { target: workspace.data.target, contentHash: workspace.data.contentHash } });
      const criteria = workspace.data.rubric.criteria.map(definition => {
        const existing = draft.criteria.find(value => value.id === definition.id);
        return { id: definition.id, title: definition.title, maximum: definition.maximum, points: existing?.points || 0,
          checks: definition.checks.map(check => existing?.checks.find(value => value.id === check.id) || {
            id: check.id, title: check.title, maximum: check.maximum, points: 0,
            result: "none" as const, performed: false, reason: "", evidence: [], missing: [],
          }) };
      });
      setRecord({ ...draft, criteria }); setDirty(draft.status !== "published" && JSON.stringify(criteria) !== JSON.stringify(draft.criteria));
    } catch (error) { setFailed(true); setFeedback((error as Error).message); }
    finally { setBusy(false); }
  }
  function update(criterionId: string, checkId: string, patch: Partial<AssessmentCheck>) {
    setRecord(previous => previous ? { ...previous, criteria: previous.criteria.map(criterion => criterion.id === criterionId ? { ...criterion, checks: criterion.checks.map(check => check.id === checkId ? { ...check, ...patch } : check) } : criterion) } : previous);
    setDirty(true); setFeedback("");
  }
  async function save(publish: boolean) {
    if (!record || busy) return;
    setBusy(true); setFailed(false); setFeedback("");
    try {
      let saved = record;
      if (dirty || !publish) saved = await api<AssessmentRecord>(`/campaigns/${campaignId}/assessments/${record.id}`, { method: "PUT", body: assessmentDraftPayload(record) });
      setRecord(saved); setDirty(false);
      if (publish) {
        saved = await api<AssessmentRecord>(`/campaigns/${campaignId}/assessments/${saved.id}/publish`, { method: "POST", body: { contentHash: saved.contentHash, expectedRevision: saved.revision } });
        setRecord(saved);
      }
      await client.invalidateQueries({ queryKey: ["assessment", campaignId] });
      await client.invalidateQueries({ queryKey: ["assessment-workspace", campaignId] });
      setFeedback(publish ? "Assessment published. Campaign approval, funding and advertising state are unchanged." : "Assessment draft saved. Its provisional points remain private.");
    } catch (error) { setFailed(true); setFeedback((error as Error).message); }
    finally { setBusy(false); }
  }
  return <View style={{ gap: 12 }}>
    <Button title={open ? "Close assessment workspace" : "Document an evidence assessment"} variant="secondary" disabled={busy || dirty} onPress={() => setOpen(!open)} />
    {open && <>
      <Text style={styles.h2}>Evidence & transparency assessment</Text>
      <Text style={styles.muted}>Separate from the approval decision. Record checks actually performed; an unopened source remains unverified. Save a private draft, then publish the completed assessment.</Text>
      {published && revisionPending && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pill title="Published version" selected={target === "public"} disabled={dirty || busy} onPress={() => choose("public")} />
        <Pill title="Working revision" selected={target === "working"} disabled={dirty || busy} onPress={() => choose("working")} />
      </View>}
      {workspace.isPending ? <Loading /> : workspace.isError ? <ErrorState error={workspace.error} retry={() => workspace.refetch()} /> : <>
        <Text style={styles.body}>Assessing {workspace.data.target === "public" ? "published content" : "working content"}, version {workspace.data.assessedVersion} · {workspace.data.rubric.version}</Text>
        <AssessmentSnapshot workspace={workspace.data} />
        {workspace.data.target === "working" && <Notice>A working-revision assessment stays private until that exact content is approved and published. Publishing an assessment does not publish the campaign.</Notice>}
        {record && record.contentHash !== workspace.data.contentHash ? <>
          <Notice>The campaign content changed while this workspace was open. These assessment edits belong to an earlier version and cannot be published for the snapshot above.</Notice>
          <Button title="Discard unsaved edits and reload current assessment" variant="secondary" disabled={busy} onPress={() => { setRecord(null); setDirty(false); setFeedback(""); }} />
        </> : !record ? <Button title={workspace.data.completed ? "View recorded assessment" : workspace.data.draft ? "Resume assessment draft" : "Start assessment draft"} loading={busy} onPress={() => { void prepare(); }} /> : record.status === "published" ? <>
          <Notice>Assessment published · {record.total}/100 · {record.classification}. Published records are immutable.</Notice>
          {record.criteria.map(criterion => <Accordion key={criterion.id} title={`${criterion.title} · ${criterion.points}/${criterion.maximum}`}>
            {criterion.checks.map(check => <View key={check.id} style={{ gap: 6 }}><Text style={styles.h2}>{check.title}</Text><Text style={styles.body}>{check.reason}</Text>{check.evidence.map((evidence, index) => <Text key={index} style={styles.muted}>{evidence.visibility === "private" ? "Private reviewer evidence: " : "Public evidence: "}{evidence.reference} — {evidence.note}</Text>)}{!!check.missing.length && <Text style={styles.muted}>Missing: {check.missing.join(" · ")}</Text>}</View>)}
          </Accordion>)}
        </> : <>
          <Text style={styles.muted}>Public explanation, missing information and limitations are visible when published. Put confidential material only in evidence explicitly marked private.</Text>
          {record.criteria.map(criterion => <Accordion key={criterion.id} title={`${criterion.title} · maximum ${criterion.maximum}`}>
            {criterion.checks.map(check => {
              const definition = workspace.data.rubric.criteria.find(value => value.id === criterion.id)!.checks.find(value => value.id === check.id)!;
              const evidence = check.evidence[0];
              return <View key={check.id} style={{ gap: 10, paddingBottom: 18 }}>
                <Text style={styles.h2}>{check.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><Text style={{ flex: 1 }}>Check actually performed</Text><Switch accessibilityLabel={`${check.title}: check performed`} value={check.performed} disabled={busy} onValueChange={performed => update(criterion.id, check.id, { performed, result: performed ? check.result : "none" })} /></View>
                <View accessibilityRole="radiogroup" accessibilityLabel={`${check.title} result`} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {(["none", "partial", "met"] as CheckAnchor[]).map(anchor => <Pill key={anchor} title={`${anchor === "none" ? "No credit" : anchor === "partial" ? "Partial" : "Meets"} · ${definition.anchors[anchor].points}`} selected={check.result === anchor} disabled={busy || (!check.performed && anchor !== "none")} onPress={() => update(criterion.id, check.id, { result: anchor })} />)}
                </View>
                <Text style={styles.muted}>{definition.anchors[check.result].rule}</Text>
                <Field label="Public reason for this result" value={check.reason} editable={!busy} multiline onChangeText={reason => update(criterion.id, check.id, { reason })} />
                <Field label="Evidence reference or source URL" value={evidence?.reference || ""} editable={!busy} autoCapitalize="none" onChangeText={reference => update(criterion.id, check.id, { evidence: reference || evidence?.note ? [{ reference, note: evidence?.note || "", visibility: evidence?.visibility || "public" }, ...check.evidence.slice(1)] : [] })} />
                <Field label="What this evidence supports" value={evidence?.note || ""} editable={!busy} multiline onChangeText={note => update(criterion.id, check.id, { evidence: note || evidence?.reference ? [{ reference: evidence?.reference || "", note, visibility: evidence?.visibility || "public" }, ...check.evidence.slice(1)] : [] })} />
                {!!evidence && <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><Text style={{ flex: 1 }}>Keep this evidence private</Text><Switch accessibilityLabel={`${check.title}: evidence private`} value={evidence.visibility === "private"} disabled={busy} onValueChange={privateValue => update(criterion.id, check.id, { evidence: [{ ...evidence, visibility: privateValue ? "private" : "public" }, ...check.evidence.slice(1)] })} /></View>}
                {check.evidence.length > 1 && <Text style={styles.muted}>{check.evidence.length - 1} additional saved evidence references are preserved.</Text>}
                <Field label="Public missing or unverified information (one per line)" value={check.missing.join("\n")} editable={!busy} multiline onChangeText={value => update(criterion.id, check.id, { missing: value.split("\n") })} />
              </View>;
            })}
          </Accordion>)}
          <Field label="Public overall limitations (one per line)" value={record.limitations.join("\n")} editable={!busy} multiline onChangeText={value => { setRecord({ ...record, limitations: value.split("\n") }); setDirty(true); }} />
          <Text style={styles.muted}>The server calculates totals and review-coverage bands. No credit is inferred from the presence of fields or the appearance of images.</Text>
          <Button title="Save assessment draft" loading={busy} onPress={() => { void save(false); }} />
          <Button title="Publish completed assessment" variant="secondary" disabled={busy} onPress={() => { void save(true); }} />
          {dirty && <Button title="Discard unsaved edits; keep saved draft" variant="ghost" disabled={busy} onPress={() => { setRecord(null); setDirty(false); setOpen(false); setFeedback(""); }} />}
        </>}
      </>}
      {!!feedback && <Notice tone={failed ? "error" : "success"}>{feedback}</Notice>}
    </>}
  </View>;
}
