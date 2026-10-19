import type { Campaign } from "../../lib/types";
import type { LocalDraft } from "../creation/model";

export const STUDIO_FILTERS = ["All", "Drafts", "Review", "Funding"] as const;
export type StudioFilter = typeof STUDIO_FILTERS[number];
export type StudioItem = { key: string; campaign: Campaign; local?: LocalDraft; account?: Campaign; group: Exclude<StudioFilter, "All"> | "Other" };
const editable = ["Draft", "Changes Requested"];
const funding = ["Available for Funding", "Funding Goal Reached", "Funding Period Ends", "Distribution Preparation", "Promoting"];

export function studioGroup(campaign: Campaign): StudioItem["group"] {
  if (editable.includes(campaign.status)) return "Drafts";
  if (["Submitted for Review", "Approved"].includes(campaign.status)) return "Review";
  if (funding.includes(campaign.campaignState || campaign.status)) return "Funding";
  return "Other";
}

/** Combine the existing scoped device library with /me, never another account's
 * public campaigns. A local copy is one campaign, not an additional campaign.
 * A submitted account record wins over a stale editable device snapshot.
 */
export function creatorStudioItems(userId: string, campaigns: readonly Campaign[], drafts: readonly LocalDraft[]): StudioItem[] {
  const owned = campaigns.filter(campaign => campaign.ownerId === userId);
  const account = new Map(owned.map(campaign => [campaign.id, campaign]));
  const used = new Set<string>();
  const result: StudioItem[] = [];
  for (const local of drafts) {
    if (!local.localId || (local.draft.ownerId && local.draft.ownerId !== userId)) continue;
    const linked = local.draft.id ? account.get(local.draft.id) : undefined;
    if (linked && !editable.includes(linked.status)) continue;
    if (!editable.includes(local.draft.status)) continue;
    const key = local.draft.id ? `account:${local.draft.id}` : `device:${local.localId}`;
    if (used.has(key)) continue;
    used.add(key);
    // Local editorial edits and goal stay local. Review/lifecycle/funding
    // metadata comes from the current account response, not an old snapshot.
    const campaign = linked ? { ...local.draft,
      status: linked.status, campaignState: linked.campaignState,
      revisionPending: linked.revisionPending, feedback: linked.feedback,
      raised: linked.raised, deadline: linked.deadline, setupReady: linked.setupReady,
      publishedAt: linked.publishedAt, submittedAt: linked.submittedAt,
    } : local.draft;
    result.push({ key, campaign, local, ...(linked ? { account: linked } : {}), group: "Drafts" });
  }
  for (const campaign of owned) {
    const key = `account:${campaign.id}`;
    if (used.has(key)) continue;
    used.add(key);
    result.push({ key, campaign, group: studioGroup(campaign) });
  }
  return result;
}

export function studioCounts(items: readonly StudioItem[]) {
  return { All: items.length, Drafts: items.filter(item => item.group === "Drafts").length,
    Review: items.filter(item => item.group === "Review").length, Funding: items.filter(item => item.group === "Funding").length };
}

export function studioDestination(item: StudioItem): string {
  if (item.local) return `/create?localDraft=${encodeURIComponent(item.local.localId)}`;
  return item.group === "Drafts" ? `/create?draft=${encodeURIComponent(item.campaign.id)}` : `/explore/${encodeURIComponent(item.campaign.id)}`;
}

export function studioStep(campaign: Campaign, local?: LocalDraft): number {
  const step = local?.step ?? campaign.currentStep ?? campaign.step ?? 0;
  return Math.max(0, Math.min(4, Number.isFinite(step) ? Math.floor(step) : 0));
}
