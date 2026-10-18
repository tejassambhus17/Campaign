import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`);
    return modules[name];
  }, module, module.exports);
  return module.exports;
}
const currency = load('../src/lib/currency.ts');
const { isReportSnapshot, canShareReport, createReportDocument, budgetParts,
  escapeReportHtml, reportFilename, reportHtml, reportDate } = load('../src/lib/report.ts', { './currency': currency });
const { reportSummary } = load('../src/features/reports/summary.ts');

// Fixed public contract fixture, based on the actual isolated HTTP completed
// example in final-completion-20261017/backend. Tests never read production or
// depend on generated/ignored artifacts. Dollars and dates are deliberate data.
const generatedAt = '2026-10-17T12:00:00.000Z';
const fixture = () => ({
  reportSchemaVersion: 'campaign-report-v1', reportSnapshotId: 'a'.repeat(64),
  campaignId: 'cmp_report_fixture', status: 'Completed', final: true,
  simulated: true, shareable: true, available: true,
  campaign: { id: 'cmp_report_fixture', title: 'Neighbourhood reading awareness',
    creatorName: 'Fictional Reading Collective', category: 'Education', coverImage: '',
    goal: 100, durationDays: 7, version: 1, contentHash: 'b'.repeat(64),
    hasPublicSnapshot: true, status: 'Completed' },
  generatedAt, dataUpdatedAt: '2026-10-17T11:45:00Z',
  dataTimeNote: 'Latest recorded public lifecycle, ledger, payment or delivery timestamp.',
  fundingPercentage: 100, raised: 100, fees: 5, allocated: 95, spent: 90.25,
  retainedFees: 5, refunded: 4.75, refundedFees: 0, refundedAdvertising: 4.75,
  remainingAdvertisingBudget: 0, unspentBeforeRefund: 4.75, refundPendingAmount: 0,
  refundState: 'completed', refundStatus: 'Simulated refund complete', contributionCount: 2,
  estimatedReach: 2565, simulatedReach: 2193, measuredReach: null, impressions: 3289, clicks: 72,
  nextStep: { title: 'Read the accounting outcome',
    body: 'Controlled simulated distribution has finished. Review spend and completed refunds.', action: 'report' },
  lifecycleEvents: [
    { type: 'submission', state: 'Submitted for Review', occurredAt: '2026-10-15T10:00:00Z', version: 1, simulated: true, seeded: false },
    { type: 'review', state: 'Approved', occurredAt: '2026-10-15T11:00:00Z', version: 1, simulated: true, seeded: false },
    { type: 'transition', state: 'Available for Funding', occurredAt: '2026-10-15T11:30:00Z', version: 1, simulated: true, seeded: false },
    { type: 'transition', state: 'Promoting', occurredAt: '2026-10-16T10:00:00Z', version: 1, simulated: true, seeded: false },
    { type: 'transition', state: 'Completed', occurredAt: '2026-10-17T11:45:00Z', version: 1, simulated: true, seeded: false },
  ],
  reportingPeriod: { startedAt: '2026-10-16T10:00:00Z', completedAt: '2026-10-17T11:45:00Z', durationDays: 7 },
  distribution: { state: 'completed', proposed: { geography: 'India', interests: 'Reading',
    channels: ['Instagram', 'Facebook'], allocation: { Instagram: 60, Facebook: 40 }, durationDays: 7 },
    finalized: null, finalizationNote: 'Separate finalized audience and channel settings are not recorded.',
    startedAt: '2026-10-16T10:00:00Z', completedAt: '2026-10-17T11:45:00Z' },
  policy: { currency: 'USD', feeRate: 0.05, peoplePerNetAdDollar: 27,
    purpose: 'Contributions fund distribution, not direct donations.',
    fees: 'The 5% platform fee is included; no added transaction fee.',
    allocation: 'Net contributions form the advertising budget.',
    refunds: 'Before promotion, cancellation refunds the full contribution. After promotion, unspent net advertising funds are refunded.',
    unspent: 'Unspent advertising funds are proportionally refunded in the completion simulation.',
    reach: 'Net advertising dollars × 27. This is an estimate, not a guaranteed audience.',
    delivery: 'No live advertising provider is connected.',
    privacy: 'Backer identities and receipts are private.' },
  metricAvailability: { estimatedReach: 'estimated', simulatedReach: 'simulated',
    measuredReach: 'unavailable', impressions: 'simulated', clicks: 'simulated' },
  definitions: { raised: 'Original successful contributions, before fees and refunds.',
    fees: 'Original included fees, not an extra charge.',
    allocated: 'Original contributions less included fees, before spend and refunds.',
    spent: 'Simulated advertising spend, never verified live delivery.',
    retainedFees: 'Original fees less completed fee refunds.',
    refunded: 'Completed simulated refunds, not an additional available balance.',
    refundedAdvertising: 'The advertising portion of completed refunds.',
    refundedFees: 'The fee portion of completed refunds.',
    remainingAdvertisingBudget: 'Allocation less spend and completed advertising refunds.',
    unspentBeforeRefund: 'Historical unspent allocation; includes already-refunded money.',
    refundPendingAmount: 'Pending funds have not been deducted yet.',
    estimatedReach: 'Estimated audience based on the original net advertising allocation.',
    simulatedReach: 'Modelled demonstration audience, not measured people.',
    measuredReach: 'Unavailable because no live advertising provider is connected.',
    impressions: 'Simulated displays; a person may see more than one.',
    clicks: 'Simulated interactions, not verified visits or belief change.' },
});
const usd = () => ({ currency: 'USD', rate: null, unavailable: false });
const inr = () => ({ currency: 'INR', unavailable: false, rate: { base: 'USD', quote: 'INR',
  rate: 83.25, date: '2026-10-16', fetchedAt: '2026-10-17T09:00:00Z', source: 'Frankfurter' } });
function fundingFixture() {
  const r = fixture();
  Object.assign(r, { status: 'Available for Funding', final: false, available: false,
    spent: 0, refunded: 0, refundedAdvertising: 0, remainingAdvertisingBudget: 95,
    unspentBeforeRefund: 95, refundState: 'not_started', refundStatus: 'Calculated on completion or cancellation',
    measuredReach: null, simulatedReach: null, impressions: null, clicks: null });
  r.campaign.status = r.status;
  r.nextStep = { title: 'Community backing is open', body: 'Funding does not launch ads automatically.', action: 'back' };
  r.lifecycleEvents = r.lifecycleEvents.slice(0, 3);
  r.reportingPeriod = { startedAt: null, completedAt: null, durationDays: 7 };
  Object.assign(r.distribution, { state: 'proposed', startedAt: null, completedAt: null });
  Object.assign(r.metricAvailability, { simulatedReach: 'unavailable', impressions: 'unavailable', clicks: 'unavailable' });
  return r;
}

test('three report metrics use recorded funds and spending, with planning reach before delivery', () => {
  const document = createReportDocument(fundingFixture(), usd());
  const before = structuredClone(document), rows = reportSummary(document);
  assert.deepEqual(rows.map(row => [row.label, row.value]), [
    ['Funds raised', '$100'], ['Ad spending', '$0'], ['Est. reach', '2,565'],
  ]);
  assert.deepEqual(document, before, 'presentation must not change the frozen accounting snapshot');
});

test('report summary distinguishes simulated delivery from explicitly classified measured reach, including true zero', () => {
  const r = fixture();
  assert.equal(reportSummary(createReportDocument(r, usd()))[2].label, 'Simulated reach');
  assert.equal(reportSummary(createReportDocument(r, usd()))[2].value, '2,193');
  r.measuredReach = 0;
  assert.equal(reportSummary(createReportDocument(r, usd()))[2].label, 'Simulated reach', 'an unclassified number cannot claim measured delivery');
  r.metricAvailability.measuredReach = 'measured';
  const measured = reportSummary(createReportDocument(r, usd()))[2];
  assert.equal(measured.label, 'Measured reach'); assert.equal(measured.value, '0');
});

test('missing or unavailable reach stays unavailable instead of becoming a zero or fabricated estimate', () => {
  const r = fixture();
  r.measuredReach = null; r.simulatedReach = null; r.estimatedReach = null;
  assert.equal(reportSummary(createReportDocument(r, usd()))[2].value, 'Unavailable');
  r.estimatedReach = 987; r.metricAvailability.estimatedReach = 'unavailable';
  assert.equal(reportSummary(createReportDocument(r, usd()))[2].value, 'Unavailable');
});

test('report summary carries the exact frozen INR equivalents and canonical USD amounts', () => {
  const document = createReportDocument(fixture(), inr());
  const rows = reportSummary(document);
  assert.equal(rows[0].value, '₹8,325'); assert.equal(rows[0].canonical, '$100 USD');
  assert.equal(rows[1].value, '₹7,513.31'); assert.equal(rows[1].canonical, '$90.25 USD');
  assert.equal(rows[2].value, '2,193', 'currency changes must not convert reach');
});

test('public completed and pre-delivery report contracts are accepted without requiring live metrics', () => {
  for (const r of [fixture(), fundingFixture()]) {
    assert.equal(isReportSnapshot(r, r.campaignId), true);
    assert.equal(canShareReport(r), true);
  }
});

test('old schema, mismatched campaign identity, invalid snapshot ID and invalid generation date fail closed', () => {
  for (const [name, change] of [
    ['old schema', r => { r.reportSchemaVersion = 'campaign-report-v0'; }],
    ['different response identity', r => { r.campaignId = 'another-campaign'; }],
    ['different editorial identity', r => { r.campaign.id = 'another-campaign'; }],
    ['missing snapshot identity', r => { delete r.reportSnapshotId; }],
    ['malformed snapshot identity', r => { r.reportSnapshotId = 'not-a-content-digest'; }],
    ['invalid generation date', r => { r.generatedAt = 'yesterday'; }],
  ]) {
    const r = fixture(); change(r);
    assert.equal(isReportSnapshot(r, 'cmp_report_fixture'), false, name);
  }
  for (const value of [undefined, null, 0, '', [], {}]) assert.equal(isReportSnapshot(value, 'cmp_report_fixture'), false);
});

test('report guard rejects malformed nested structures before rendering can dereference them', () => {
  const cases = [
    ['missing reporting period', r => { delete r.reportingPeriod; }],
    ['null reporting period', r => { r.reportingPeriod = null; }],
    ['invalid period date', r => { r.reportingPeriod.startedAt = 'not-a-date'; }],
    ['invalid data timestamp', r => { r.dataUpdatedAt = 'not-a-date'; }],
    ['null event', r => { r.lifecycleEvents = [null]; }],
    ['invalid event date', r => { r.lifecycleEvents[0].occurredAt = 'not-a-date'; }],
    ['invalid action', r => { r.nextStep.action = 'launch-ads-now'; }],
    ['missing next-step explanation', r => { delete r.nextStep.body; }],
    ['non-array channels', r => { r.distribution.proposed.channels = 'Instagram'; }],
    ['negative allocation', r => { r.distribution.proposed.allocation.Instagram = -60; }],
    ['missing definition map', r => { delete r.definitions; }],
    ['object definition', r => { r.definitions.raised = { private: 'not text' }; }],
    ['missing refund policy', r => { delete r.policy.refunds; }],
    ['nonboolean shareability', r => { r.shareable = 'true'; }],
    ['nonboolean public flag', r => { r.campaign.hasPublicSnapshot = 'true'; }],
    ['object campaign title', r => { r.campaign.title = { private: 'not text' }; }],
    ['inconsistent campaign status', r => { r.campaign.status = 'Available for Funding'; }],
  ];
  for (const [name, change] of cases) {
    const r = fixture(); change(r);
    assert.equal(isReportSnapshot(r, r.campaignId), false, name);
  }
});

test('negative, nonfinite and numeric-string financial/metric values are never accepted as report data', () => {
  for (const key of ['raised', 'fees', 'allocated', 'spent', 'retainedFees', 'refunded',
    'refundedFees', 'refundedAdvertising', 'remainingAdvertisingBudget', 'unspentBeforeRefund',
    'refundPendingAmount', 'contributionCount', 'estimatedReach', 'simulatedReach', 'measuredReach', 'impressions', 'clicks']) {
    for (const value of [-1, NaN, Infinity, '100']) {
      const r = fixture(); r[key] = value;
      assert.equal(isReportSnapshot(r, r.campaignId), false, `${key}=${String(value)}`);
    }
  }
});

test('a frozen document keeps its source snapshot, currency reference and HTML identical after later mutations', () => {
  const r = fixture(), preference = inr();
  const original = structuredClone(r), originalPreference = structuredClone(preference);
  const doc = createReportDocument(r, preference), html = reportHtml(doc);
  r.raised = 99999; r.campaign.title = 'Later title'; r.definitions.raised = 'Later explanation';
  r.distribution.proposed.channels.push('Later channel'); r.lifecycleEvents[0].state = 'Later state';
  preference.currency = 'USD'; preference.rate.rate = 999; preference.rate.date = '2030-01-01';
  assert.deepEqual(doc.snapshot, original);
  assert.deepEqual(doc.currency, originalPreference);
  assert.equal(reportHtml(doc), html);
  assert.equal(doc.raised, '₹8,325');
  assert.notEqual(doc.snapshot, r); assert.notEqual(doc.currency.rate, preference.rate);
});

test('USD and INR reports keep the same canonical accounting and dated conversion context', () => {
  const r = fixture(), original = structuredClone(r);
  const dollar = createReportDocument(r, usd()), rupee = createReportDocument(r, inr());
  assert.equal(dollar.raised, '$100'); assert.equal(dollar.goal, '$100');
  assert.equal(rupee.raised, '₹8,325'); assert.equal(rupee.goal, '₹8,325');
  assert.equal(rupee.funding.find(row => row.key === 'fees').value, '₹416.25');
  assert.equal(rupee.balance.find(row => row.key === 'refunded').value, '₹395.44');
  assert.equal(rupee.funding.find(row => row.key === 'raised').canonical, '$100 USD');
  assert.equal(rupee.balance.find(row => row.key === 'refunded').canonical, '$4.75 USD');
  assert.match(rupee.currencyNote, /2026-10-16/);
  assert.match(rupee.currencyNote, /\$1 USD = ₹83\.25/);
  assert.match(rupee.currencyNote, /not a live payment quote/i);
  assert.deepEqual(dollar.snapshot, rupee.snapshot);
  assert.deepEqual(r, original, 'display/export must not update the ledger model');
  assert.match(reportHtml(rupee), /Accounting is canonical USD/);
});

test('unavailable INR conversion is explicitly USD and never invents rupee figures', () => {
  const doc = createReportDocument(fixture(), { currency: 'USD', rate: null, unavailable: true });
  assert.equal(doc.raised, '$100 USD');
  assert.match(doc.currencyNote, /INR conversion unavailable/);
  assert.doesNotMatch(reportHtml(doc), /₹/);
});

test('a campaign is final only when both completion state and final data agree', () => {
  assert.equal(createReportDocument(fixture(), usd()).kind, 'Final campaign report');
  for (const [state, final] of [['Available for Funding', false], ['Promoting', false], ['Promoting', true], ['Completed', false]]) {
    const r = fixture(); r.status = state; r.campaign.status = state; r.final = final;
    assert.equal(createReportDocument(r, usd()).kind, 'Campaign progress report', `${state}/${final}`);
  }
});

test('unavailable measured results stay distinct from a genuine numeric zero', () => {
  const r = fixture(), missing = createReportDocument(r, usd());
  assert.equal(missing.results.find(row => row.key === 'measuredReach').value, 'Unavailable');
  r.measuredReach = 0; r.metricAvailability.measuredReach = 'measured';
  r.definitions.measuredReach = 'Recorded measurement, with its source supplied separately.';
  const zero = createReportDocument(r, usd());
  assert.equal(zero.results.find(row => row.key === 'measuredReach').value, '0');
  assert.equal(missing.results.find(row => row.key === 'measuredReach').value, 'Unavailable');
  const before = createReportDocument(fundingFixture(), usd());
  for (const key of ['simulatedReach', 'measuredReach', 'impressions', 'clicks']) {
    assert.equal(before.results.find(row => row.key === key).value, 'Unavailable', key);
  }
});

test('budget fractions partition raised funds without adding allocation, pending or historical unspent again', () => {
  const r = fixture(), parts = budgetParts(r);
  assert.deepEqual(parts.map(part => part.key), ['spent', 'retainedFees', 'refunded', 'remainingAdvertisingBudget']);
  assert.deepEqual(parts.map(part => part.fraction), [0.9025, 0.05, 0.0475, 0]);
  assert.ok(Math.abs(parts.reduce((sum, part) => sum + part.fraction, 0) - 1) < 1e-12);
  for (const disallowed of ['allocated', 'fees', 'unspentBeforeRefund', 'refundPendingAmount']) {
    assert.equal(parts.some(part => part.key === disallowed), false, disallowed);
  }
});

test('pending refunds remain within the existing balance and full refunds leave no spendable advertising funds', () => {
  const pending = fundingFixture();
  Object.assign(pending, { status: 'Refund Pending', refundState: 'pending', refundPendingAmount: 100 });
  pending.campaign.status = pending.status;
  assert.deepEqual(budgetParts(pending).map(part => part.fraction), [0, 0.05, 0, 0.95]);
  const full = structuredClone(pending);
  Object.assign(full, { status: 'Cancelled', refunded: 100, refundedAdvertising: 95,
    refundedFees: 5, retainedFees: 0, remainingAdvertisingBudget: 0, refundPendingAmount: 0, refundState: 'completed' });
  full.campaign.status = full.status;
  assert.deepEqual(budgetParts(full).map(part => part.fraction), [0, 0, 1, 0]);
  const doc = createReportDocument(full, usd()), html = reportHtml(doc);
  assert.equal(doc.balance.find(row => row.key === 'remainingAdvertisingBudget').value, '$0');
  assert.match(html, /historical amount includes funds already refunded; do not add it/i);
  assert.match(html, /Pending funds have not been deducted and are not an additional balance/i);
});

test('invalid or unreconciled budget values produce no chart fractions', () => {
  for (const patch of [{ raised: 0 }, { raised: -1 }, { raised: NaN }, { raised: Infinity },
    { raised: '100' }, { spent: -1 }, { refunded: NaN }, { remainingAdvertisingBudget: 20 }]) {
    assert.deepEqual(budgetParts({ ...fixture(), ...patch }), [], JSON.stringify(patch));
  }
});

test('unpublished or nonshareable reports cannot be exported even if a caller constructs a document directly', () => {
  const privateReport = fixture();
  Object.assign(privateReport, { shareable: false, lifecycleEvents: [] });
  Object.assign(privateReport.campaign, { title: null, creatorName: null, category: null, goal: null,
    durationDays: null, version: null, contentHash: null, hasPublicSnapshot: false });
  assert.equal(canShareReport(privateReport), false);
  assert.throws(() => reportHtml(createReportDocument(privateReport, usd())), /approved public campaign/i);
  for (const patch of [
    r => { r.shareable = false; }, r => { r.campaign.hasPublicSnapshot = false; },
    r => { r.campaign.contentHash = null; }, r => { r.campaign.contentHash = 'old-or-invalid'; },
    r => { r.campaign.title = null; },
  ]) {
    const r = fixture(); patch(r);
    assert.equal(canShareReport(r), false);
    assert.throws(() => reportHtml(createReportDocument(r, usd())), /approved public campaign/i);
  }
});

test('hostile public text is escaped in title, creator, policies, definitions, channel and lifecycle fields', () => {
  const hostile = '<img src="https://host.invalid/track" onerror="steal()"> & \'quote\' <script>alert(1)</script>';
  const r = fixture();
  r.campaign.title = `Title ${hostile}`; r.campaign.creatorName = `Creator ${hostile}`;
  r.campaign.category = `Category ${hostile}`; r.nextStep.title = `Next ${hostile}`;
  r.nextStep.body = `Outcome ${hostile}`; r.dataTimeNote = `Data ${hostile}`;
  r.policy.refunds = `Refund policy ${hostile}`; r.policy.privacy = `Privacy ${hostile}`;
  r.definitions.raised = `Definition ${hostile}`;
  r.distribution.proposed.channels = [hostile]; r.distribution.proposed.allocation = { [hostile]: 100 };
  r.distribution.proposed.geography = `Place ${hostile}`;
  r.distribution.finalizationNote = `Setup ${hostile}`;
  r.lifecycleEvents[0].state = `Event ${hostile}`;
  const html = reportHtml(createReportDocument(r, usd()));
  assert.doesNotMatch(html, /<(?:img|script|iframe|object|embed)\b/i);
  assert.ok(html.includes('Title &lt;img src=&quot;https://host.invalid/track&quot;'));
  for (const prefix of ['Creator', 'Refund policy', 'Privacy', 'Definition', 'Place', 'Setup', 'Event']) {
    assert.ok(html.includes(`${prefix} &lt;img`), prefix);
  }
  assert.ok(html.includes('&amp; &#39;quote&#39; &lt;script&gt;'));
  assert.equal(escapeReportHtml('<>&"\''), '&lt;&gt;&amp;&quot;&#39;');
});

test('export has no external resource loaders or unexpected private fields', () => {
  const r = fixture();
  Object.assign(r, { token: 'SENSITIVE_BEARER', privateEvidence: 'SENSITIVE_REVIEW_NOTE',
    backers: [{ name: 'SENSITIVE_BACKER', email: 'private@example.invalid' }],
    receipt: { token: 'SENSITIVE_RECEIPT_CAPABILITY', url: 'https://private.invalid/secret' } });
  r.campaign.coverImage = 'https://untrusted.invalid/resource?token=IMAGE_CAPABILITY';
  r.campaign.privateRevision = { title: 'SENSITIVE_PRIVATE_DRAFT' };
  const html = reportHtml(createReportDocument(r, usd()));
  for (const value of ['SENSITIVE_BEARER', 'SENSITIVE_REVIEW_NOTE', 'SENSITIVE_BACKER',
    'private@example.invalid', 'SENSITIVE_RECEIPT_CAPABILITY', 'private.invalid/secret',
    'IMAGE_CAPABILITY', 'SENSITIVE_PRIVATE_DRAFT']) assert.equal(html.includes(value), false, value);
  assert.doesNotMatch(html, /<(?:img|script|iframe|object|embed|link|a|video|audio)\b/i);
  assert.doesNotMatch(html, /url\s*\(|@import/i);
  assert.match(html, /default-src 'none'/);
  assert.match(html, /img-src 'none'/);
  assert.match(html, /connect-src 'none'/);
});

test('safe filenames cannot introduce directories, query tokens or arbitrary extensions', () => {
  for (const id of ['../../secret?token=capability', '..\\..\\evil.exe', '<bad>:*"|name', '', 'a'.repeat(500)]) {
    const r = fixture(); r.campaignId = id; r.campaign.id = id;
    const name = reportFilename(createReportDocument(r, usd()));
    assert.match(name, /^Campaign-[A-Za-z0-9_-]+\.pdf$/);
    assert.ok(name.length < 128);
    assert.doesNotMatch(name, /[\\/?:"*<>|]/);
  }
});

test('recorded dates stay explicit UTC; missing dates do not become manufactured milestones', () => {
  assert.match(reportDate('2026-10-17T12:00:00Z'), /17 Oct 2026, 12:00 UTC/);
  for (const value of [undefined, null, '', 'not-a-date']) assert.equal(reportDate(value), 'Not recorded');
  const funding = fundingFixture(), doc = createReportDocument(funding, usd());
  assert.equal(doc.period, 'Delivery has not started.');
  assert.deepEqual(doc.events.map(event => event.state), ['Submitted for Review', 'Approved', 'Available for Funding']);
  assert.equal(doc.events.some(event => event.state === 'Promoting' || event.state === 'Completed'), false);
  const html = reportHtml(doc);
  assert.match(html, /recorded events, not milestones inferred from funding/i);
  assert.match(html, /Funding does not automatically start advertising/);
  assert.match(html, /Separate finalized channel results are unavailable/);
  assert.doesNotMatch(html, /Final campaign report/);
});
