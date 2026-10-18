import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)(name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, module, module.exports);
  return module.exports;
}
function expand(tree) {
  if (Array.isArray(tree)) return tree.map(expand);
  if (!tree || typeof tree !== 'object') return tree;
  if (typeof tree.type === 'function') return expand(tree.type(tree.props));
  return { ...tree, props: { ...tree.props, children: expand(tree.props?.children) } };
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function text(tree) {
  const content = item => Array.isArray(item) ? item.map(content).join('') : item && typeof item === 'object' ? ` ${content(item.props?.children)} ` : String(item ?? '');
  return content(tree).replace(/\s+/g, ' ').trim();
}
const styles = { body: {}, muted: {}, h2: {} }, colors = new Proxy({}, { get: () => '#121212' });
const ui = { Text: 'Text', Button: 'Button', IconButton: 'IconButton', Progress: 'Progress', Screen: 'Screen', Notice: 'Notice', ErrorState: 'ErrorState', Loading: 'Loading', ConnectionHint: 'ConnectionHint', fonts: { bold: 'ManropeBold', semibold: 'ManropeSemibold' }, useTheme: () => ({ colors, styles }) };
const information = { SummaryLink: 'SummaryLink', InfoAction: 'InfoAction' };
const currency = load('../src/lib/currency.ts');
const reportModel = load('../src/lib/report.ts', { './currency': currency });
const assessmentModel = load('../src/lib/assessments.ts');
const creation = load('../src/features/creation/model.ts', { '../../lib/types': load('../src/lib/types.ts') });
const report = load('../src/features/reports/ReportContent.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' }, '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../../components/ui': ui, '../../components/Information': information, '../../lib/currency': currency });
const usd = { currency: 'USD', rate: null, unavailable: false };
// Disposable in-memory snapshot. Its7.5% policy deliberately differs from the
// image so UI tests catch hardcoded presentation, without changing any service.
function snapshot() {
  return { reportSchemaVersion: 'campaign-report-v1', reportSnapshotId: 'a'.repeat(64), campaignId: 'fixture',
    campaign: { id: 'fixture', title: 'Fictional source accuracy', creatorName: 'Fictional collective', category: 'Science', goal: 100, hasPublicSnapshot: true, contentHash: 'b'.repeat(64), status: 'Refund Pending' },
    status: 'Refund Pending', final: false, simulated: true, shareable: true, available: true,
    generatedAt: '2026-10-18T10:00:00Z', dataUpdatedAt: '2026-10-18T09:00:00Z', dataTimeNote: 'Recorded ledger timestamp.', fundingPercentage: 100,
    raised: 100, fees: 7.5, allocated: 92.5, spent: 80, retainedFees: 7.5, refunded: 3, refundedAdvertising: 3, refundedFees: 0, remainingAdvertisingBudget: 9.5, unspentBeforeRefund: 12.5, refundPendingAmount: 2, refundStatus: 'Refund awaiting completion', contributionCount: 4,
    estimatedReach: 2000, simulatedReach: 1900, measuredReach: null, impressions: 2500, clicks: 12,
    nextStep: { title: 'Review pending refunds', body: 'Pending money remains in the remaining budget.' },
    lifecycleEvents: [{ type: 'seed', state: 'Available for Funding', occurredAt: '2026-10-17T10:00:00Z', seeded: true, simulated: true }],
    reportingPeriod: { startedAt: '2026-10-17T10:00:00Z', completedAt: null },
    distribution: { state: 'paused', proposed: { geography: 'India', interests: 'Research', channels: ['Instagram'], allocation: { Instagram: 100 }, durationDays: 7 }, finalized: { geography: 'Global', interests: 'Public learning', channels: ['Display'], allocation: { Display: 100 }, durationDays: 5 }, finalizationNote: 'Separate authorization recorded.' },
    policy: { currency: 'USD', feeRate: .075, purpose: 'Funds advertising, never direct donations.', fees: '7.5% included; no added transaction fee.', allocation: 'Net contributions form the advertising budget.', refunds: 'REFUND_POLICY', unspent: 'UNSPENT_POLICY', reach: 'REACH_POLICY', privacy: 'PRIVATE_BACKERS_POLICY', delivery: 'No live provider.' },
    definitions: { raised: 'Original successful payments.', fees: 'Original included fees.', allocated: 'Original allocation before spend.', spent: 'Recorded simulated spend.', retainedFees: 'Fees after completed refunds.', refunded: 'Completed refunds only.', remainingAdvertisingBudget: 'Not a second allocation.', estimatedReach: 'Planning estimate.', simulatedReach: 'Modelled demonstration.', measuredReach: 'Not supplied, not zero.', impressions: 'Simulated displays.', clicks: 'Simulated interactions.' },
    metricAvailability: { estimatedReach: 'estimated', simulatedReach: 'simulated', measuredReach: 'unavailable', impressions: 'simulated', clicks: 'simulated' } };
}
const document = preference => reportModel.createReportDocument(snapshot(), preference || usd);

test('report overview replaces six disclosure stacks with three working, real-value destinations', () => {
  const opened = [], d = document(), tree = expand(report.ReportDetails({ document: d, onOpen: section => opened.push(section), onFunding: () => opened.push('funding') }));
  const links = nodes(tree).filter(node => node.type === 'SummaryLink');
  assert.equal(links.length, 3); assert.equal(nodes(tree).some(node => node.type === 'Accordion'), false);
  assert.equal(links[0].props.summary, '$100 raised · $80 spent');
  links.forEach(node => node.props.onPress()); assert.deepEqual(opened, ['funding', 'delivery', 'journey']);
  assert.equal(report.reportSection('delivery'), 'delivery'); assert.equal(report.reportSection('journey'), 'journey');
  for (const value of ['fees', '../private', [], null, undefined]) assert.equal(report.reportSection(value), 'overview');
});

test('full Funding accounting preserves snapshot policy/refunds/definitions and frozen INR without nested disclosure', () => {
  const preference = { currency: 'INR', unavailable: false, rate: { rate: 80, date: '2026-10-17', source: 'Frankfurter', fetchedAt: '2026-10-18T10:00:00Z' } };
  const d = document(preference), before = JSON.stringify(d), tree = expand(report.ReportFunding({ document: d, details: true })), all = text(tree);
  assert.match(all, /Platform fee \(7\.5% included\)/); assert.match(all, /₹600/); assert.match(all, /\$7\.50 USD/);
  assert.match(all, /₹160.*Pending refunds have not been deducted/); assert.match(all, /₹1,000.*historical amount includes money already refunded/);
  for (const copy of ['REFUND_POLICY', 'UNSPENT_POLICY', 'Funds advertising, never direct donations.', 'Original successful payments.', 'Original allocation before spend.', 'Backer identities remain private', 'accounting remains in USD']) assert.ok(all.includes(copy), copy);
  assert.equal(nodes(tree).some(node => ['Accordion', 'InfoAction'].includes(node.type)), false);
  assert.equal(JSON.stringify(d), before, 'UI cannot change a frozen report');
  const compact = text(expand(report.ReportFunding({ document: d })));
  assert.ok(compact.includes('Amount for ads')); assert.equal(compact.includes('REFUND_POLICY'), false, 'full policy has its dedicated Funding view');
});

test('report delivery detail preserves proposed/finalized plans, null metrics and all definitions', () => {
  const d = document(), tree = expand(report.ReportSectionDetails({ document: d, section: 'delivery' })), all = text(tree);
  for (const copy of ['Creator-proposed audience', 'India', 'Instagram', 'Finalized distribution', 'Global', 'Display', '5 days recorded duration', 'Not supplied, not zero.', 'Unavailable measured reach is not zero reach', 'REACH_POLICY', 'No live provider.']) assert.ok(all.includes(copy), copy);
  assert.equal(nodes(tree).some(node => node.type === 'Accordion'), false);
  assert.match(all, /Measured unique reach\s+Unavailable/); assert.match(all, /Simulated reach\s+1,900/);
  const short = expand(report.ReportResults({ document: d }));
  assert.equal(nodes(short).filter(node => node.type === 'InfoAction').length, 1);
  assert.ok(text(short).includes('Planning estimate.'));
});

test('journey/context retain recorded events, seed qualification, workflow, privacy and snapshot without inferred events', () => {
  const d = document(), all = text(expand(report.ReportSectionDetails({ document: d, section: 'journey' })));
  for (const copy of ['1 event', 'Illustrative seed state', 'Funding never starts advertising automatically', 'PRIVATE_BACKERS_POLICY', d.snapshot.reportSnapshotId, 'Generated', 'same figures and dated currency reference']) assert.ok(all.includes(copy), copy);
  assert.ok(text(expand(report.ReportStatus({ document: d }))).includes('Refund Pending'), 'current status leads the report overview');
  assert.equal(d.events.length, 1); assert.equal(d.events[0].state, 'Available for Funding');
});

function hooks() {
  const values = [], effects = []; let cursor = 0, pending = [];
  const react = {
    useState(initial) { const index = cursor++; if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial; return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next; }]; },
    useRef(initial) { const index = cursor++; if (!(index in values)) values[index] = { current: initial }; return values[index]; },
    useEffect(fn, deps) { const index = cursor++; if (!effects[index] || deps.some((value, i) => value !== effects[index][i])) { effects[index] = deps; pending.push(fn); } },
    useMemo: fn => fn(), useCallback: fn => fn,
  };
  return { react, render(fn) { cursor = 0; pending = []; const tree = expand(fn()); for (const fn of pending) fn(); return tree; } };
}
function routeEnvironment(runtime) {
  let backHandler = () => false;
  const routes = [], announcements = [];
  return { routes, announcements, back: () => backHandler(),
    native: { View: 'View', Pressable: 'Pressable', Platform: { OS: 'android' }, Linking: { openURL: async () => {} }, AccessibilityInfo: { announceForAccessibility: text => announcements.push(text) }, BackHandler: { addEventListener: (_, handler) => { backHandler = handler; return { remove() {} }; } } },
    router: { push: path => routes.push(path), canGoBack: () => true, back: () => routes.push('back'), replace: path => routes.push(path) },
    focus: fn => { fn(); }, react: runtime.react };
}
function reportHarness(requestedSection) {
  const runtime = hooks(), env = routeEnvironment(runtime), d = document();
  const Page = load('../src/app/(tabs)/explore/[id]/report.tsx', {
    react: env.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': env.native,
    'expo-router': { router: env.router, useFocusEffect: env.focus, useLocalSearchParams: () => ({ id: 'fixture', section: requestedSection }) },
    '../../../../components/ui': ui, '../../../../lib/CurrencyProvider': { useCurrency: () => ({ snapshot: usd }) }, '../../../../lib/api': { captureApiSession: () => () => true },
    '../../../../lib/report': reportModel, '../../../../features/reports/useCampaignReport': { useCampaignReport: () => ({ data: d.snapshot, isPending: false, isError: false, refetch() {} }) },
    '../../../../features/reports/ImpactDashboard': { ReportLoading: 'ReportLoading' }, '../../../../features/reports/ReportContent': report,
    '../../../../features/reports/ReportMetrics': { ReportMetrics: 'ReportMetrics' }, '../../../../features/reports/shareReport': { pruneReportCache() {}, shareReport: async () => {} },
  }).default;
  const render = () => runtime.render(Page), get = id => nodes(render()).find(n => n.props.testID === id);
  return { ...env, render, get };
}
test('report local details use header/Android Back before leaving and preserve actual Funding parent navigation', () => {
  const env = reportHarness(), { render, get } = env;
  get('report-delivery').props.onPress(); assert.ok(text(render()).includes('Finalized distribution'));
  assert.equal(env.back(), true); assert.ok(get('report-funding')); assert.deepEqual(env.routes, []);
  get('report-journey').props.onPress(); const detail = render();
  nodes(detail).find(n => n.props.label === 'Back to campaign report').props.onPress(); assert.ok(get('report-funding'));
  get('report-funding').props.onPress(); assert.deepEqual(env.routes, ['/explore/fixture/funding']);
  nodes(render()).find(n => n.props.label === 'Back').props.onPress(); assert.equal(env.routes.at(-1), 'back');
  assert.equal(env.back(), false, 'overview allows native navigation to its actual parent');
});
test('report opened directly at delivery returns to its actual Funding parent without an inserted overview', () => {
  const env = reportHarness('delivery'), tree = env.render();
  assert.ok(text(tree).includes('Finalized distribution')); assert.equal(nodes(tree).some(n => n.props.testID === 'report-funding'), false);
  assert.equal(env.back(), false, 'native Back reaches the previous Funding route');
  nodes(env.render()).find(n => n.props.label === 'Back').props.onPress(); assert.deepEqual(env.routes, ['back']);
});

test('Impact keeps the three metrics and one report destination instead of duplicating the full information tree', () => {
  const routes = [], d = document();
  const { ImpactDashboard } = load('../src/features/reports/ImpactDashboard.tsx', { react: { useMemo: fn => fn() }, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', ActivityIndicator: 'ActivityIndicator' }, 'expo-router': { router: { push: path => routes.push(path) } }, '../../components/ui': ui, '../../components/Information': information, '../../lib/CurrencyProvider': { useCurrency: () => ({ snapshot: usd }) }, '../../lib/report': { createReportDocument: () => d }, './useCampaignReport': { useCampaignReport: () => ({ data: d.snapshot }) }, './ReportMetrics': { ReportMetrics: 'ReportMetrics' } });
  const all = nodes(expand(ImpactDashboard({ id: 'fixture', active: true })));
  assert.equal(all.filter(n => n.type === 'ReportMetrics').length, 1); const links = all.filter(n => n.type === 'SummaryLink'); assert.equal(links.length, 1);
  links[0].props.onPress(); assert.deepEqual(routes, ['/explore/fixture/report']); assert.equal(all.some(n => ['Accordion', 'ReportDetails'].includes(n.type)), false);
});

const criterion = () => ({ id: 'sources', title: 'Supporting sources', points: 15, maximum: 30, checks: [{ id: 'mapping', title: 'Claim mapping', points: 5, maximum: 10, performed: true, reason: 'Only background evidence supplied.', missing: ['Primary data'], privateEvidenceWithheld: true, evidence: [{ reference: 'https://example.com/paper', note: 'Public background source.', visibility: 'public' }, { reference: 'javascript:alert(1)', note: 'Unopenable reference.', visibility: 'public' }, { reference: 'https://private.example/secret', note: 'SECRET PRIVATE NOTE', visibility: 'private' }] }] });
const record = (id = 'current', score = 56, version = 2) => ({ id, campaignId: 'fixture', contentHash: id, assessedVersion: version, rubricVersion: 'rubric-v1', assessmentType: 'demo', status: 'published', total: score, classification: 'Moderate review coverage', publishedAt: '2026-10-17T10:00:00Z', criteria: [criterion()], limitations: ['Not independently fact checked.'], provenance: { label: 'Illustrative demo assessment', description: 'Recorded example evidence only.' } });
const assessment = () => ({ state: 'completed', contentHash: 'current', rubricVersion: 'rubric-v1', disclaimer: 'Prototype disclaimer.', assessment: record(), history: [record('old', 0, 1)] });
const rubric = { title: 'Prototype method', version: 'rubric-v1', disclaimer: 'RUBRIC_DISCLAIMER', limitations: 'RUBRIC_LIMITATIONS', criteria: [{ id: 'sources', title: 'Supporting sources', maximum: 30, checks: [{ id: 'mapping', title: 'Claim mapping', anchors: { none: { points: 0, rule: 'Uninspected.' }, partial: { points: 5, rule: 'Background only.' }, met: { points: 10, rule: 'Mapped primary data.' } } }] }], bands: [{ minimum: 0, maximum: 100, label: 'Coverage band' }] };
function assessmentHarness({ response = assessment(), failLink = false, queryError = false } = {}) {
  const runtime = hooks(), env = routeEnvironment(runtime), queries = [], links = [];
  env.native.Linking.openURL = async reference => { links.push(reference); if (failLink) throw new Error('No browser'); };
  const exports = load('../src/app/(tabs)/explore/[id]/assessment.tsx', { react: env.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': env.native, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    'expo-router': { router: env.router, useFocusEffect: env.focus, useLocalSearchParams: () => ({ id: 'fixture' }) }, '@tanstack/react-query': { useQuery: options => { queries.push(options); const method = options.queryKey[0] === 'assessment-rubric'; return { data: method ? rubric : response, isPending: false, isError: !method && queryError, error: queryError ? new Error('Assessment unavailable') : undefined, refetch() {} }; } }, '../../../../components/ui': ui, '../../../../components/Information': information, '../../../../lib/api': { api() { throw new Error('UI cannot mutate records'); } }, '../../../../lib/assessments': assessmentModel, '../../../../lib/session': { useRefreshOnFocus() {}, useSession: () => ({ user: { id: 'user' } }) }, '../../../../features/creation/model': creation, '../../../../features/transparency/TrustScore': { TrustScore: 'TrustScore' },
  });
  const render = () => runtime.render(exports.default), get = id => nodes(render()).find(n => n.props.testID === id);
  return { ...env, exports, runtime, render, get, queries, links };
}
test('assessment overview leads with actual state and every criterion has a local detail with working Back', () => {
  const h = assessmentHarness(); const first = h.render();
  assert.equal(nodes(first).find(n => n.type === 'TrustScore').props.data.assessment.total, 56);
  assert.equal(nodes(first).some(n => n.type === 'Accordion'), false); assert.equal(h.queries.at(-1).enabled, false);
  h.get('assessment-criterion-sources').props.onPress(); const detail = h.render();
  assert.ok(text(detail).includes('Only background evidence supplied.')); assert.ok(text(detail).includes('Primary data'));
  assert.equal(h.back(), true); assert.ok(h.get('assessment-criterion-sources')); assert.deepEqual(h.routes, []);
  h.get('assessment-context').props.onPress(); const context = text(h.render());
  for (const copy of ['Not independently fact checked.', 'Recorded example evidence only.', 'Version 2', 'rubric-v1', 'current', 'private draft does not replace']) assert.ok(context.includes(copy), copy);
  nodes(h.render()).find(n => n.props.label === 'Back to assessment').props.onPress(); assert.ok(h.get('assessment-methodology'));
});
test('assessment history keeps its0 score and local Back returns criterion→record→history→current overview', () => {
  const h = assessmentHarness(); h.render(); h.get('assessment-history').props.onPress();
  nodes(h.render()).find(n => n.type === 'SummaryLink' && n.props.title === 'Version 1 · 0/100').props.onPress();
  let tree = h.render(); assert.ok(text(tree).includes('does not assess the current published content')); assert.equal(nodes(tree).find(n => n.type === 'TrustScore').props.data.assessment.id, 'old');
  h.get('assessment-criterion-sources').props.onPress(); h.render(); h.back(); tree = h.render(); assert.equal(nodes(tree).find(n => n.type === 'TrustScore').props.data.assessment.id, 'old');
  h.back(); assert.ok(nodes(h.render()).some(n => n.props.title === 'Version 1 · 0/100'));
  h.back(); tree = h.render(); assert.equal(nodes(tree).find(n => n.type === 'TrustScore').props.data.assessment.id, 'current'); assert.equal(h.back(), false);
});
test('published history remains inspectable when its score is unsupported, while private drafts stay excluded', () => {
  const response = assessment();
  response.history.push({ ...record('older-method', 123, 7), rubricVersion: 'legacy-method', classification: 'Legacy classification' });
  response.history.push({ ...record('private-draft', 100, 8), status: 'draft' });
  const h = assessmentHarness({ response }); h.render();
  assert.equal(h.get('assessment-history').props.summary, '2 earlier records');
  h.get('assessment-history').props.onPress(); const tree = h.render();
  const retained = nodes(tree).find(n => n.type === 'SummaryLink' && n.props.title === 'Version 7 · Score unavailable');
  assert.ok(retained); assert.equal(retained.props.summary, 'Assessment unavailable'); assert.match(retained.props.description, /^Published/);
  assert.equal(nodes(tree).some(n => n.type === 'SummaryLink' && /123|Version 8/.test(n.props.title)), false);
  retained.props.onPress(); const details = h.render();
  assert.ok(text(details).includes('version 7')); assert.ok(h.get('assessment-context'));
  h.get('assessment-context').props.onPress(); assert.ok(text(h.render()).includes('legacy-method'));
});
test('methodology loads on demand and retains every actual anchor, band and qualification without nested accordions', () => {
  const h = assessmentHarness(); h.render(); h.get('assessment-methodology').props.onPress(); const tree = h.render(), all = text(tree);
  assert.equal(h.queries.at(-1).enabled, true); assert.equal(nodes(tree).some(n => n.type === 'Accordion'), false);
  for (const copy of ['RUBRIC_DISCLAIMER', 'RUBRIC_LIMITATIONS', '0 points — Uninspected.', '5 points — Background only.', '10 points — Mapped primary data.', '0–100', 'not an organizer-provided algorithm', 'do not create a funding eligibility threshold']) assert.ok(all.includes(copy), copy);
});
test('public methodology remains reachable when the campaign assessment request fails', () => {
  const h = assessmentHarness({ queryError: true }); h.render(); h.get('assessment-methodology').props.onPress();
  assert.ok(text(h.render()).includes('RUBRIC_DISCLAIMER')); assert.equal(h.back(), true);
  assert.ok(nodes(h.render()).some(n => n.type === 'ErrorState'));
});
test('criterion evidence retains public content, refuses unsafe/private links and exposes open failures', async () => {
  const h = assessmentHarness({ failLink: true });
  const render = () => h.runtime.render(() => h.exports.AssessmentCriterionContent({ criterion: criterion() }));
  let tree = render(), all = text(tree); assert.equal(all.includes('SECRET PRIVATE NOTE'), false); assert.equal(all.includes('private.example'), false);
  assert.ok(all.includes('Unopenable reference.')); assert.ok(all.includes('Additional reviewer evidence is private'));
  const buttons = nodes(tree).filter(n => n.type === 'Pressable'); assert.equal(buttons.length, 1); assert.match(buttons[0].props.accessibilityLabel, /https:\/\/example.com\/paper/);
  buttons[0].props.onPress(); await new Promise(resolve => setImmediate(resolve)); tree = render();
  assert.deepEqual(h.links, ['https://example.com/paper']); assert.ok(text(tree).includes('Could not open the evidence link'));
});
test('unassessed, stale and provisional states cannot expose a fabricated current score or criterion', () => {
  for (const state of ['not_assessed', 'in_progress', 'superseded']) {
    const value = assessment(); value.state = state;
    const h = assessmentHarness({ response: value }); const tree = h.render();
    assert.equal(nodes(tree).some(n => n.props.testID === 'assessment-criterion-sources'), false);
    assert.ok(nodes(tree).some(n => n.props.testID === 'assessment-methodology'));
  }
});
