import { discoverCampaigns } from "../../lib/discovery";
import { audienceCampaign } from "../../lib/public-campaign";
import type { Campaign } from "../../lib/types";

export type HomeFilters = { search: string; category: string; sort: string; funding: boolean };

/** Filtering operates on approved public snapshots and never edits campaigns. */
export function selectHomeCampaigns(campaigns: Campaign[], filters: HomeFilters) {
  const publicCampaigns = campaigns.map(audienceCampaign).filter((campaign): campaign is Campaign => !!campaign);
  const matches = discoverCampaigns(publicCampaigns, filters);
  const featured = filters.sort === "Featured" ? matches.find((campaign) => campaign.id === "demo_ocean") || matches[0] : matches[0];
  return { featured, discover: matches.filter((campaign) => campaign.id !== featured?.id).slice(0, 4), total: matches.length };
}
