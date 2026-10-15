import type { Campaign } from './types';

export function discoverCampaigns(campaigns: Campaign[], filters: {search:string;category:string;sort:string;funding:boolean}) {
  const query = filters.search.trim().toLocaleLowerCase();
  const rows = campaigns.filter(c =>
    (filters.category === 'All' || c.category === filters.category) &&
    (!filters.funding || c.status === 'Available for Funding') &&
    `${c.title} ${c.summary} ${c.creatorName} ${c.category}`.toLocaleLowerCase().includes(query)
  );
  const progress = (c:Campaign) => c.goal > 0 ? c.raised / c.goal : 0;
  const date = (c:Campaign) => Date.parse(c.publishedAt || c.submittedAt || c.createdAt) || 0;
  if (filters.sort === 'Most funded') rows.sort((a,b) => b.raised-a.raised);
  else if (filters.sort === 'Newest') rows.sort((a,b) => date(b)-date(a));
  else if (filters.sort === 'Closest to goal') rows.sort((a,b) => progress(b)-progress(a));
  else rows.sort((a,b) => Number(Boolean(b.featured))-Number(Boolean(a.featured)));
  return rows;
}
