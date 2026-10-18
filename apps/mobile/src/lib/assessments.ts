import type { Campaign } from "./types";

export type CheckAnchor = "none" | "partial" | "met";
export type AssessmentEvidence = { reference: string; note: string; visibility: "public" | "private" };
export type AssessmentCheck = {
  id: string; title: string; maximum: number; points: number; result: CheckAnchor;
  performed: boolean; reason: string; evidence: AssessmentEvidence[]; missing: string[];
  privateEvidenceWithheld?: boolean;
};
export type AssessmentCriterion = { id: string; title: string; maximum: number; points: number; checks: AssessmentCheck[] };
export type AssessmentRecord = {
  id: string; campaignId: string; contentHash: string; assessedVersion: number;
  rubricVersion: string; assessmentType: "demo" | "reviewer"; status: "draft" | "published";
  total: number | null; classification: string | null; criteria: AssessmentCriterion[];
  limitations: string[]; policyContext: Record<string, unknown>;
  provenance: { kind: string; label: string; description: string };
  createdAt: string; updatedAt: string; publishedAt: string | null; revision: number;
};
export type PublicAssessment = {
  state: "not_assessed" | "in_progress" | "completed" | "superseded";
  contentHash: string; assessedVersion: number; rubricVersion: string;
  assessment: AssessmentRecord | null; history: AssessmentRecord[]; disclaimer: string;
};
export type AssessmentRubric = {
  version: string; title: string; maximum: number; disclaimer: string; limitations: string;
  criteria: { id: string; title: string; maximum: number; checks: {
    id: string; title: string; maximum: number; anchors: Record<CheckAnchor, { points: number; rule: string }>;
  }[] }[];
  bands: { minimum: number; maximum: number; label: string }[];
};
export type AssessmentContent = Pick<Campaign, "title" | "category" | "creatorName" | "summary" | "coverImage" | "storyHeadline" | "intro" | "sections" | "sources" | "adImages" | "adHeadline" | "adDescription" | "cta" | "geography" | "interests" | "channels" | "allocation" | "durationDays" | "goal">;
export type AssessmentWorkspace = {
  rubric: AssessmentRubric; target: "public" | "working"; contentHash: string;
  assessedVersion: number; content: AssessmentContent; policyContext: Record<string, unknown>;
  draft: AssessmentRecord | null; completed?: AssessmentRecord | null; published: PublicAssessment;
};
export const assessmentDisclaimer = "This reflects the documented review rubric, not a guarantee that every claim is correct.";

/** Separate caches may settle in either order; only exact public content can share a score. */
export function assessmentMatchesCampaign(campaign: Pick<Campaign, "publicContentHash">, assessment?: PublicAssessment) {
  return !!campaign.publicContentHash && assessment?.contentHash === campaign.publicContentHash;
}

/** Public scores require a published record bound to the exact public content. */
export function assessmentPresentation(value: PublicAssessment) {
  const record = value.assessment;
  if (value.state === "completed") {
    if (!record || record.status !== "published" || record.contentHash !== value.contentHash ||
        !record.publishedAt || record.rubricVersion !== value.rubricVersion || !Number.isInteger(record.total) || record.total! < 0 || record.total! > 100 ||
        !record.classification || !["demo", "reviewer"].includes(record.assessmentType)) {
      return { title: "Campaign assessment", label: "Assessment unavailable", score: null, demo: false };
    }
    return { title: record.assessmentType === "demo" ? "Illustrative Trust Score" : "Reviewed with a Trust Score of",
      label: record.classification, score: record.total, demo: record.assessmentType === "demo" };
  }
  return { title: "Campaign assessment", label: value.state === "in_progress" ? "Assessment in progress" :
    value.state === "superseded" ? "New assessment needed" : value.state === "not_assessed" ? "Not yet assessed" : "Assessment unavailable", score: null, demo: false };
}

export function assessmentDraftPayload(record: AssessmentRecord) {
  return { contentHash: record.contentHash, rubricVersion: record.rubricVersion, expectedRevision: record.revision,
    criteria: record.criteria.map(criterion => ({ id: criterion.id, checks: criterion.checks.map(check => ({
      id: check.id, result: check.result, performed: check.performed, reason: check.reason,
      evidence: check.evidence.map(({ reference, note, visibility }) => ({ reference: reference.trim(), note: note.trim(), visibility })), missing: lines(check.missing.join("\n")),
    })) })), limitations: lines(record.limitations.join("\n")) };
}

export function lines(value: string): string[] { return value.split("\n").map(line => line.trim()).filter(Boolean); }

export function distributionPresentation(status: string, ready: boolean) {
  if (status === "Completed") return { title: "Completed simulation", body: "The report records simulated delivery. No live advertising audience was measured." };
  if (status === "Promoting") return { title: "Simulated promotion", body: "This prototype models delivery; no advertising provider is connected." };
  if (["Cancelled", "Failed", "Refund Pending"].includes(status)) return { title: "Distribution paused or closed", body: "Check the current campaign report for status, recorded spend and any refunds." };
  if (ready && status === "Distribution Preparation") return { title: "Prepared for simulated distribution", body: "Setup is recorded, but promotion still needs its separate authorized transition." };
  return { title: "Proposed distribution plan", body: "Creator selections are proposals. The platform may finalize eligible targeting, placements and allocation during review. Approval or funding does not start advertising." };
}
