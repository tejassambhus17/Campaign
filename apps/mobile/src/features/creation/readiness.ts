import { Campaign } from "../../lib/types";
import { DraftErrors, isMediaUrl, isPublicUrl, STEPS, validateStep } from "./model";

export type DraftIssue = {
  id: string;
  step: number;
  field: string;
  title: string;
  message: string;
  required: boolean;
};

const fields: Record<string, { field: string; title: string }> = {
  title: { field: "title", title: "Campaign title" },
  category: { field: "category", title: "Category" },
  creatorName: { field: "creatorName", title: "Creator identity" },
  geography: { field: "geography", title: "Target locations" },
  channels: { field: "channels", title: "Distribution channels" },
  durationDays: { field: "durationDays", title: "Campaign duration" },
  goal: { field: "goal", title: "Funding goal" },
  rules: { field: "rules", title: "Rules and funding policies" },
};

// The checklist explains the existing validator. It never adds a submission rule.
export function submissionIssues(draft: Campaign, goalInput: string, accepted: boolean): DraftIssue[] {
  const issues: DraftIssue[] = [];
  for (let step = 0; step < STEPS.length; step++) {
    const errors: DraftErrors = validateStep(draft, step, goalInput, accepted);
    for (const [key, message] of Object.entries(errors)) {
      if (key === "sources") {
        draft.sources.forEach((source, index) => {
          if (!source.title.trim()) issues.push({ id: `source-title:${source.id}`, step, field: `source-title:${source.id}`, title: `Source ${index + 1} title`, message: "Add a title for this source, or remove the unused source row.", required: true });
          if (!isPublicUrl(source.url)) issues.push({ id: `source-url:${source.id}`, step, field: `source-url:${source.id}`, title: `Source ${index + 1} link`, message: "Use a public http:// or https:// source URL without embedded credentials, or remove this row.", required: true });
        });
      } else if (key === "sections") {
        draft.sections.forEach((section, index) => {
          if (section.kind === "image" && !isMediaUrl(section.url || "")) issues.push({ id: `section:${section.id}`, step, field: `section:${section.id}`, title: `Story image · section ${index + 1}`, message, required: true });
        });
      } else if (key === "visuals") {
        if (!isMediaUrl(draft.coverImage)) issues.push({ id: "coverImage", step, field: "coverImage", title: "Campaign cover URL", message, required: true });
        draft.adImages.forEach((image, index) => {
          if (!image || !isMediaUrl(image)) issues.push({ id: `ad-image:${index}`, step, field: `ad-image:${index}`, title: `Advertising image ${index + 1}`, message: "Upload an image or use a public image URL. Remove an unused advertising-image row.", required: true });
        });
      } else if (key === "allocation") {
        const channel = draft.channels.find((name) => !Number.isFinite(draft.allocation[name]) || draft.allocation[name] < 0 || draft.allocation[name] > 100) || draft.channels[0];
        issues.push({ id: key, step, field: channel ? `allocation:${channel}` : "channels", title: "Advertising allocation", message, required: true });
      } else {
        issues.push({ id: key, step, ...(fields[key] || { field: key, title: key }), message, required: true });
      }
    }
  }
  const optional = (id: string, step: number, field: string, title: string, message: string) => issues.push({ id, step, field, title, message, required: false });
  if (!draft.summary.trim()) optional("summary", 0, "summary", "Introduce your message", "A short summary helps readers decide to explore your campaign. This is optional.");
  if (!draft.storyHeadline.trim() && !draft.intro.trim() && !draft.sections.some(section => section.kind === "image" ? !!section.url?.trim() : !!section.text.trim())) optional("story", 1, "storyHeadline", "Add story context", "A headline, introduction or story section can explain why the message matters. This is optional.");
  if (!draft.sources.length) optional("sources", 1, "sources", "Add supporting sources", "Public sources help readers explore factual claims. No source is required to submit; include relevant evidence when available.");
  if (!draft.coverImage) optional("cover", 2, "coverImage", "Choose a campaign cover", "An optional cover helps readers recognize the campaign. It stays separate from advertising creative.");
  if (!draft.adImages.some(Boolean)) optional("advertising", 2, "advertising", "Prepare advertising imagery", "Advertising images are optional at submission. A reviewer may request suitable creative before distribution.");
  draft.sections.forEach((section, index) => {
    if (section.kind === "image" && !section.url) optional(`empty-image:${section.id}`, 1, `section:${section.id}`, `Story image · section ${index + 1}`, "This optional image section is empty. Add a photograph or remove the unused section before sharing a polished story.");
  });
  return issues;
}

export type ReadinessItem = {
  id: string;
  title: string;
  status: "complete" | "missing" | "recommended";
  summary: string;
  target: DraftIssue;
  issues: DraftIssue[];
};

/** Presentation of the existing validator, never a second submission policy. */
export function campaignReadiness(draft: Campaign, goalInput: string, accepted: boolean) {
  const issues = submissionIssues(draft, goalInput, accepted);
  const groups = [
    { id: "basics", title: "Campaign basics", step: 0, field: "title", match: (issue: DraftIssue) => issue.step === 0 },
    { id: "story", title: "Story & message", step: 1, field: "storyHeadline", match: (issue: DraftIssue) => issue.step === 1 && !issue.field.startsWith("source") },
    { id: "sources", title: "Supporting sources", step: 1, field: "sources", match: (issue: DraftIssue) => issue.step === 1 && issue.field.startsWith("source") },
    { id: "visuals", title: "Campaign & ad visuals", step: 2, field: "coverImage", match: (issue: DraftIssue) => issue.step === 2 },
    { id: "reach", title: "Audience & distribution", step: 3, field: "geography", match: (issue: DraftIssue) => issue.step === 3 },
    { id: "goal", title: "Funding goal", step: 4, field: "goal", match: (issue: DraftIssue) => issue.field === "goal" },
    { id: "policies", title: "Rules & funding policies", step: 4, field: "rules", match: (issue: DraftIssue) => issue.field === "rules" },
  ];
  const items: ReadinessItem[] = groups.map(group => {
    const matched = issues.filter(group.match);
    const required = matched.filter(issue => issue.required);
    const target = required[0] || matched[0] || { id: `ready:${group.id}`, step: group.step, field: group.field, title: group.title, message: "Review this part of your campaign.", required: false };
    return {
      id: group.id, title: group.title,
      status: required.length ? "missing" : matched.length ? "recommended" : "complete",
      summary: required.length ? `${required.length} required ${required.length === 1 ? "item" : "items"} to complete` : matched.length ? "Optional improvements available" : "Ready for review",
      target, issues: matched,
    };
  });
  const completed = items.filter(item => item.status === "complete").length;
  return { items, completed, total: items.length, percent: Math.round(completed / items.length * 100), missing: issues.filter(issue => issue.required).length, recommended: issues.filter(issue => !issue.required).length };
}
