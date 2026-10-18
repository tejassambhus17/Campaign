import type { Campaign } from "./types";

type ManagedCampaign = Campaign & {
  publishedVersion?: Campaign;
  report?: Record<string, unknown>;
};

const publicStates = new Set([
  "Available for Funding", "Funding Goal Reached", "Funding Period Ends",
  "Distribution Preparation", "Promoting", "Completed", "Cancelled",
  "Refund Pending", "Failed",
]);

/** Audience/backing screens must describe the approved message being funded.
 * Managed API responses can additionally contain an unpublished private revision.
 * Keep editing/reviewer screens on the original response; never mutate that cache.
 */
export function audienceCampaign(campaign: Campaign): Campaign | null {
  const managed = campaign as ManagedCampaign;
  if (!campaign.revisionPending) return campaign;
  const approved = managed.publishedVersion;
  if (!approved) {
    // Public API responses already contain the approved content and public state.
    // A managed private response without its snapshot cannot safely offer backing.
    return campaign.status === campaign.campaignState && publicStates.has(campaign.status)
      ? campaign
      : null;
  }
  if (!campaign.campaignState || !publicStates.has(campaign.campaignState) ||
      typeof approved.title !== "string" || !Number.isFinite(approved.goal) ||
      approved.goal < 0 || !Array.isArray(approved.sections) ||
      !Array.isArray(approved.sources)) return null;
  return {
    title: approved.title,
    category: approved.category,
    creatorName: approved.creatorName,
    summary: approved.summary,
    coverImage: approved.coverImage,
    storyHeadline: approved.storyHeadline,
    intro: approved.intro,
    sections: approved.sections,
    sources: approved.sources,
    adImages: approved.adImages,
    adHeadline: approved.adHeadline,
    adDescription: approved.adDescription,
    cta: approved.cta,
    geography: approved.geography,
    interests: approved.interests,
    channels: approved.channels,
    allocation: approved.allocation,
    durationDays: approved.durationDays,
    goal: approved.goal,
    id: campaign.id,
    ownerId: campaign.ownerId,
    raised: campaign.raised,
    status: campaign.campaignState,
    campaignState: campaign.campaignState,
    createdAt: campaign.createdAt,
    publishedAt: campaign.publishedAt,
    publicContentHash: campaign.publicContentHash,
    deadline: campaign.deadline,
    featured: campaign.featured,
    revisionPending: true,
    // The report is server-produced public accounting, not revision content.
    ...(managed.report ? { report: managed.report } : {}),
  };
}

/** Only real public dates. Never infer dates from a stage or read private history. */
export function campaignJourneyDates(campaign: Campaign, report?: Record<string, unknown>) {
  const delivery = report || (campaign as ManagedCampaign).report || {};
  return [
    { label: "Backing opened", date: campaign.publishedAt },
    { label: "Promotion began", date: delivery.startedAt },
    { label: "Completed", date: delivery.completedAt },
  ].filter((entry): entry is { label: string; date: string } =>
    typeof entry.date === "string" && Number.isFinite(Date.parse(entry.date)),
  );
}
