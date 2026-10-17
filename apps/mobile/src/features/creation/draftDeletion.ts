import type { Campaign } from "../../lib/types";
import type { LocalDraft } from "./model";

export type DraftDeletionTarget = { scope: string; title: string; localId?: string; campaignId?: string };
export type DraftDeletionMarkers = { localIds: string[]; campaignIds: string[] };
export const emptyDeletionMarkers = (): DraftDeletionMarkers => ({ localIds: [], campaignIds: [] });
export const deletionKey = (target: DraftDeletionTarget) => target.campaignId ? `account:${target.campaignId}` : `device:${target.localId}`;
export const isUnpublishedDraft = (campaign: Campaign) => campaign.status === "Draft" &&
  (!campaign.campaignState || campaign.campaignState === "Draft") && !campaign.revisionPending && !campaign.publishedAt;
export function localDeletionTarget(entry: LocalDraft, scope: string): DraftDeletionTarget | null {
  if (!entry.localId || !isUnpublishedDraft(entry.draft)) return null;
  if (entry.draft.id && (scope === "guest" || entry.draft.ownerId !== scope)) return null;
  return { scope, title: entry.draft.title || "Untitled campaign", localId: entry.localId, ...(entry.draft.id ? { campaignId: entry.draft.id } : {}) };
}
export function accountDeletionTarget(campaign: Campaign, scope: string): DraftDeletionTarget | null {
  return scope !== "guest" && campaign.id && campaign.ownerId === scope && isUnpublishedDraft(campaign)
    ? { scope, title: campaign.title || "Untitled campaign", campaignId: campaign.id } : null;
}
export function matchesDeletion(entry: LocalDraft, target: DraftDeletionTarget): boolean {
  return !!((target.localId && entry.localId === target.localId) || (target.campaignId && entry.draft.id === target.campaignId));
}
export function isDeletedDraft(entry: LocalDraft, markers: DraftDeletionMarkers): boolean {
  return markers.localIds.includes(entry.localId) || !!(entry.draft.id && markers.campaignIds.includes(entry.draft.id));
}
export function addDeletionMarkers(markers: DraftDeletionMarkers, target: DraftDeletionTarget, entries: LocalDraft[]): DraftDeletionMarkers {
  return {
    localIds: [...new Set([...markers.localIds, ...(target.localId ? [target.localId] : []), ...entries.filter(entry => matchesDeletion(entry, target)).map(entry => entry.localId)])],
    campaignIds: [...new Set([...markers.campaignIds, ...(target.campaignId ? [target.campaignId] : [])])],
  };
}
export function parseDeletionMarkers(raw: string | null): DraftDeletionMarkers {
  if (!raw) return emptyDeletionMarkers();
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.localIds) || !Array.isArray(parsed.campaignIds) ||
    [...parsed.localIds, ...parsed.campaignIds].some(value => typeof value !== "string")) throw new Error("Draft deletion markers could not be read.");
  return parsed;
}
