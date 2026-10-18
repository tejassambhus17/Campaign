import { formatMoney, MoneySnapshot, referenceDescription } from "./currency";

export type ReportEvent = { type: string; state: string; occurredAt: string; version: number | null; simulated: boolean; seeded: boolean };
export type DistributionPlan = { geography: string; interests: string; channels: string[]; allocation: Record<string, number>; durationDays: number };
export type CampaignReport = {
  reportSchemaVersion: "campaign-report-v1";
  reportSnapshotId: string;
  campaignId: string;
  campaign: { id: string; title: string | null; creatorName: string | null; category: string | null; coverImage: string | null; goal: number | null; durationDays: number | null; version: number | null; contentHash: string | null; hasPublicSnapshot: boolean; status: string };
  generatedAt: string; dataUpdatedAt: string | null; dataTimeNote: string;
  status: string; final: boolean; simulated: boolean; shareable: boolean; available: boolean;
  fundingPercentage: number | null;
  raised: number; fees: number; allocated: number; spent: number;
  retainedFees: number; refunded: number; refundedFees: number; refundedAdvertising: number;
  remainingAdvertisingBudget: number; unspentBeforeRefund: number; refundPendingAmount: number;
  refundState: string; refundStatus: string; contributionCount: number;
  estimatedReach: number | null; simulatedReach: number | null; measuredReach: number | null;
  impressions: number | null; clicks: number | null;
  nextStep: { title: string; body: string; action: "back" | "report" | "manage" | "none" };
  lifecycleEvents: ReportEvent[];
  reportingPeriod: { startedAt: string | null; completedAt: string | null; durationDays: number | null };
  distribution: { state: string; proposed: DistributionPlan | null; finalized: DistributionPlan | null; finalizationNote: string; startedAt: string | null; completedAt: string | null };
  policy: { currency: "USD"; feeRate: number; peoplePerNetAdDollar: number; purpose: string; fees: string; allocation: string; refunds: string; unspent: string; reach: string; delivery: string; privacy: string };
  metricAvailability: Record<string, string>;
  definitions: Record<string, string>;
  summary?: string; message?: string;
};
export type ReportRow = { key: string; label: string; value: string; definition: string; canonical?: string };
export type ReportDocument = {
  snapshot: CampaignReport; title: string; kind: string; generated: string; updated: string;
  currency: MoneySnapshot; currencyNote: string; goal: string; raised: string;
  funding: ReportRow[]; balance: ReportRow[]; results: ReportRow[];
  events: (ReportEvent & { date: string })[]; period: string; outcome: string;
};
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;
const timestamp = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));
const nullableTime = (value: unknown) => value === null || timestamp(value);
const strings = (value: unknown): value is Record<string, string> => !!value && typeof value === "object" && !Array.isArray(value) && Object.values(value).every(v => typeof v === "string");
const validPlan = (plan: DistributionPlan | null) => plan === null || (!!plan && typeof plan.geography === "string" && typeof plan.interests === "string" && Array.isArray(plan.channels) && plan.channels.every(c => typeof c === "string") && !!plan.allocation && typeof plan.allocation === "object" && Object.values(plan.allocation).every(finite) && finite(plan.durationDays));
export function isReportSnapshot(value: unknown, id: string): value is CampaignReport {
  if (!value || typeof value !== "object") return false;
  const r = value as CampaignReport;
  return r.reportSchemaVersion === "campaign-report-v1" && r.campaignId === id && r.campaign?.id === id &&
    /^[a-f0-9]{64}$/.test(r.reportSnapshotId || "") && Number.isFinite(Date.parse(r.generatedAt)) &&
    typeof r.status === "string" && r.campaign.status === r.status && typeof r.final === "boolean" && typeof r.shareable === "boolean" && typeof r.simulated === "boolean" && typeof r.available === "boolean" &&
    typeof r.campaign.hasPublicSnapshot === "boolean" && [r.campaign.title, r.campaign.creatorName, r.campaign.category, r.campaign.coverImage].every(v => v === null || typeof v === "string") &&
    (r.campaign.goal === null || finite(r.campaign.goal)) && (r.fundingPercentage === null || finite(r.fundingPercentage)) &&
    nullableTime(r.dataUpdatedAt) && typeof r.dataTimeNote === "string" && typeof r.refundState === "string" && typeof r.refundStatus === "string" &&
    Array.isArray(r.lifecycleEvents) && r.lifecycleEvents.every(e => !!e && typeof e.state === "string" && typeof e.type === "string" && timestamp(e.occurredAt) && typeof e.seeded === "boolean" && typeof e.simulated === "boolean") &&
    !!r.reportingPeriod && nullableTime(r.reportingPeriod.startedAt) && nullableTime(r.reportingPeriod.completedAt) && (r.reportingPeriod.durationDays === null || finite(r.reportingPeriod.durationDays)) &&
    !!r.distribution && typeof r.distribution.state === "string" && typeof r.distribution.finalizationNote === "string" && validPlan(r.distribution.proposed) && validPlan(r.distribution.finalized) &&
    !!r.nextStep && typeof r.nextStep.title === "string" && typeof r.nextStep.body === "string" && ["back", "report", "manage", "none"].includes(r.nextStep.action) &&
    !!r.policy && r.policy.currency === "USD" && ["purpose", "fees", "allocation", "refunds", "unspent", "reach", "delivery", "privacy"].every(key => typeof r.policy[key as keyof typeof r.policy] === "string") &&
    strings(r.definitions) && strings(r.metricAvailability) && [r.estimatedReach, r.simulatedReach, r.measuredReach, r.impressions, r.clicks].every(v => v === null || finite(v)) &&
    [r.raised, r.fees, r.allocated, r.spent, r.retainedFees, r.refunded, r.refundedFees, r.refundedAdvertising,
      r.remainingAdvertisingBudget, r.unspentBeforeRefund, r.refundPendingAmount, r.contributionCount].every(finite);
}
export function canShareReport(r: CampaignReport) {
  return r.shareable === true && r.campaign.hasPublicSnapshot === true && !!r.campaign.title &&
    /^[a-f0-9]{64}$/.test(r.campaign.contentHash || "");
}
export function reportDate(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not recorded";
  return new Date(value).toLocaleString("en-GB", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
}
export function createReportDocument(report: CampaignReport, preference: MoneySnapshot): ReportDocument {
  // Capture the entire authorized response and exchange reference once. A later
  // refetch or rate update cannot change the document being rendered/shared.
  const r: CampaignReport = JSON.parse(JSON.stringify(report));
  const currency: MoneySnapshot = JSON.parse(JSON.stringify(preference));
  const money = (amount: number | null) => finite(amount) ? formatMoney(amount, currency) : "Unavailable";
  const row = (key: keyof CampaignReport, label: string, fallback: string): ReportRow => ({ key,
    label, value: money(r[key] as number), definition: r.definitions[key] || fallback,
    canonical: currency.currency === "INR" && finite(r[key]) ? `${formatMoney(r[key] as number, { currency: "USD", rate: null, unavailable: false })} USD` : undefined });
  const metric = (key: "estimatedReach" | "simulatedReach" | "measuredReach" | "impressions" | "clicks", label: string): ReportRow => ({ key, label,
    value: finite(r[key]) ? new Intl.NumberFormat("en-US").format(r[key]!) : "Unavailable",
    definition: r.definitions[key] || "This metric has not been supplied." });
  return { snapshot: r, title: r.campaign.title || "Unpublished campaign", kind: r.final && r.status === "Completed" ? "Final campaign report" : "Campaign progress report",
    generated: reportDate(r.generatedAt), updated: reportDate(r.dataUpdatedAt), currency,
    currencyNote: referenceDescription(currency), goal: money(r.campaign.goal), raised: money(r.raised),
    funding: [row("raised", "Successful contributions", "Original contributions before fees and refunds."),
      row("fees", "Original included platform fees", "Included in contributions; not an extra payment."),
      row("allocated", "Original advertising allocation", "Original contributions less included fees, before spend or refunds.")],
    balance: [row("spent", "Simulated advertising spend", "No live advertising was purchased."),
      row("retainedFees", "Platform fees retained", "Original fees less completed fee refunds."),
      row("refunded", "Completed simulated refunds", "Refunds already completed; not another available balance."),
      row("remainingAdvertisingBudget", "Advertising budget remaining", "Original allocation less spend and completed advertising refunds.")],
    results: [metric("estimatedReach", "Estimated reach"), metric("simulatedReach", "Simulated reach"),
      metric("measuredReach", "Measured unique reach"), metric("impressions", "Simulated impressions"), metric("clicks", "Simulated clicks")],
    events: r.lifecycleEvents.filter(e => Number.isFinite(Date.parse(e.occurredAt))).map(e => ({ ...e, date: reportDate(e.occurredAt) })),
    period: r.reportingPeriod.startedAt ? `${reportDate(r.reportingPeriod.startedAt)} to ${r.reportingPeriod.completedAt ? reportDate(r.reportingPeriod.completedAt) : "in progress"}` : "Delivery has not started.",
    outcome: r.summary || r.message || r.nextStep.body };
}
/** A partition of ledger funds, never allocation plus spend counted twice. */
export function budgetParts(r: CampaignReport) {
  const values = [r.spent, r.retainedFees, r.refunded, r.remainingAdvertisingBudget];
  if (!finite(r.raised) || !values.every(finite) || Math.abs(values.reduce((a, b) => a + Math.round(b * 100), 0) - Math.round(r.raised * 100)) > 1 || r.raised <= 0) return [];
  return values.map((value, index) => ({ key: ["spent", "retainedFees", "refunded", "remainingAdvertisingBudget"][index], fraction: value / r.raised }));
}
export const escapeReportHtml = (text: unknown) => String(text ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export function reportFilename(doc: ReportDocument) {
  const id = doc.snapshot.campaignId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60) || "campaign";
  return `Campaign-${id}-${doc.snapshot.generatedAt.replace(/[^0-9]/g, "").slice(0, 17)}-${doc.snapshot.reportSnapshotId.slice(0, 12)}.pdf`;
}
export function reportHtml(doc: ReportDocument) {
  if (!canShareReport(doc.snapshot)) throw new Error("Only approved public campaign reports can be shared.");
  const e = escapeReportHtml, r = doc.snapshot, money = (value: number) => formatMoney(value, doc.currency);
  const rows = (items: ReportRow[]) => `<table><thead><tr><th>Metric</th><th class="amount">Amount / result</th></tr></thead><tbody>${items.map(row => `<tr><td><strong>${e(row.label)}</strong><small>${e(row.definition)}</small></td><td class="amount">${e(row.value)}${row.canonical ? `<small>${e(row.canonical)}</small>` : ""}</td></tr>`).join("")}</tbody></table>`;
  const plan = (value: DistributionPlan | null) => value ? `<p><strong>Audience:</strong> ${e(value.geography)}${value.interests ? ` · ${e(value.interests)}` : ""}</p><p><strong>Channels:</strong> ${value.channels.map(c => `${e(c)} (${e(value.allocation[c] ?? "Unavailable")}%)`).join(" · ")}</p><p><strong>Proposed duration:</strong> ${e(value.durationDays)} days</p>` : "<p>Not recorded.</p>";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(doc.kind)} · ${e(doc.title)}</title><style>
    @page{size:A4;margin:28pt 30pt}*{box-sizing:border-box}body{font-family:sans-serif;color:#17231e;font-size:10pt;line-height:1.45;margin:0}h1{font-size:23pt;line-height:1.2;margin:9pt 0}h2{font-size:14pt;margin:20pt 0 8pt;break-after:avoid}h3{font-size:11pt;margin:12pt 0 5pt;break-after:avoid}p{margin:5pt 0}small{display:block;font-size:8.5pt;color:#4e5a54;margin-top:3pt;font-weight:normal}header{border-bottom:2pt solid #176541;padding-bottom:13pt}.brand{font-size:15pt;color:#103c31;font-weight:bold}.notice{padding:10pt 12pt;background:#e9faf2;border:1pt solid #bedaca;border-radius:7pt;margin:12pt 0;break-inside:avoid}.meta{color:#4e5a54;font-size:8.5pt}table{width:100%;border-collapse:collapse;table-layout:fixed;margin:8pt 0}th,td{text-align:left;padding:8pt 5pt;border-bottom:0.5pt solid #dce3df;vertical-align:top}th{font-size:8.5pt;color:#4e5a54}td:first-child,th:first-child{width:68%}.amount{text-align:right;font-weight:bold}thead{display:table-header-group}tr{break-inside:avoid}section{margin-top:10pt}ul{padding-left:16pt}li{margin-bottom:6pt;break-inside:avoid}footer{margin-top:22pt;border-top:0.5pt solid #dce3df;padding-top:9pt;color:#4e5a54;font-size:8pt;overflow-wrap:anywhere}.keep{break-inside:avoid}.newpage{break-before:page}.id{overflow-wrap:anywhere}
    </style></head><body><header><div class="brand">Campaign</div><p>${e(doc.kind)}</p><h1>${e(doc.title)}</h1><p>${e(r.campaign.category)} · By ${e(r.campaign.creatorName)}</p><p><strong>${e(r.status)}</strong></p><p class="meta">Generated ${e(doc.generated)}<br>Data updated ${e(doc.updated)}</p></header>
    <div class="notice"><strong>Simulated payments and delivery.</strong> No live advertising results are verified. Contributions fund message distribution, not direct donations.</div>
    <section class="keep"><h2>${e(r.nextStep.title)}</h2><p>${e(doc.outcome)}</p><p><strong>Funding:</strong> ${e(doc.raised)} of ${e(doc.goal)}${r.fundingPercentage === null ? "" : ` · ${e(r.fundingPercentage)}%`}</p><p class="meta">${e(doc.currencyNote)}</p></section>
    <h2>Original contribution allocation</h2>${rows(doc.funding)}<h2>Where the funds stand</h2>${rows(doc.balance)}
    <section class="keep"><h3>Refund status</h3><p>${e(r.refundStatus)}</p><p>Pending simulated refund: ${e(money(r.refundPendingAmount))}. Pending funds have not been deducted and are not an additional balance.</p><p>Completed refund includes ${e(money(r.refundedAdvertising))} from advertising and ${e(money(r.refundedFees))} from fees.</p><p>${e(money(r.unspentBeforeRefund))} was unspent before refunds. This historical amount includes funds already refunded; do not add it to the remaining budget.</p><p>${e(r.contributionCount)} successful contribution records. Backer identities are private; guest uniqueness is not measured.</p></section>
    <section class="newpage"><h2>Distribution & results</h2><p>${e(doc.period)}</p><p>Proposed campaign duration: ${e(r.reportingPeriod.durationDays ?? "Unavailable")} days.</p>${rows(doc.results)}<p>Reach and clicks do not establish a change in belief or real-world impact. Overlapping audiences are not added together.</p>
    <h3>Creator-proposed distribution</h3>${plan(r.distribution.proposed)}<h3>Finalized distribution</h3>${r.distribution.finalized ? plan(r.distribution.finalized) : `<p>${e(r.distribution.finalizationNote)}</p><p>Separate finalized channel results are unavailable.</p>`}</section>
    <h2>Recorded campaign journey</h2><p>These are recorded events, not milestones inferred from funding. Funding does not automatically start advertising.</p>${doc.events.length ? `<ul>${doc.events.map(event => `<li><strong>${e(event.state)}</strong> · ${e(event.date)}${event.seeded ? "<small>Illustrative seed state; earlier milestone dates were not recorded.</small>" : ""}</li>`).join("")}</ul>` : "<p>No public lifecycle events are recorded.</p>"}
    <h2>Policies & definitions</h2><p>${e(r.policy.refunds)}</p><p>${e(r.policy.unspent)}</p><p>${e(r.policy.reach)}</p><p>${e(r.policy.privacy)}</p><p class="meta">${e(r.dataTimeNote)}</p><footer>Campaign ID: ${e(r.campaignId)} · Approved version: ${e(r.campaign.version)}<br>Report snapshot: ${e(r.reportSnapshotId)}<br>Public campaign hash: ${e(r.campaign.contentHash)}<br>Accounting is canonical USD. Converted values are dated display estimates; they do not alter historical payments. This document contains public campaign information only.</footer></body></html>`;
}
