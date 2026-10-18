import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
function load(path, modules = {}) {
  const module = { exports: {} }, source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', source)(name => { assert.ok(name in modules, name); return modules[name]; }, module, module.exports); return module.exports;
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree && typeof tree === 'object' ? text(tree.props?.children) : String(tree ?? ''); }
const ui = { Screen: 'Screen', Text: 'Text', Progress: 'Progress', ErrorState: 'ErrorState', Loading: 'Loading', Notice: 'Notice', IconButton: 'IconButton', Pill: 'Pill', fonts: {}, useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }), styles: {} }) };
function stateHarness() {
  const state = [], focus = [], back = [], routes = []; let index = 0;
  const react = { useMemo: fn => fn(), useCallback: fn => fn, useState(initial) { const i = index++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; } };
  return { react, focus, back, routes, render(fn) { index = 0; focus.length = 0; return fn(); } };
}

test('funding overview uses the authorized snapshot fee/allocation and preserves local details/Back without changing records', () => {
  const h = stateHarness(), document = { raised: '$100', goal: '$200', currency: { currency: 'USD', rate: null, unavailable: false }, funding: [{ key: 'raised', value: '$100' }, { key: 'fees', value: '$7' }, { key: 'allocated', value: '$93' }], balance: [{ key: 'spent', value: '$10' }, { key: 'refunded', value: '$4' }, { key: 'remainingAdvertisingBudget', value: '$79' }], snapshot: { raised: 100, fundingPercentage: 50, campaign: { goal: 200 }, policy: { feeRate: .07, delivery: 'Snapshot simulation policy', refunds: 'Snapshot refund policy', unspent: 'Snapshot unspent policy' }, refundState: 'pending', refundStatus: 'Pending recorded refund', refundPendingAmount: 2, refundedAdvertising: 4, refundedFees: 0, unspentBeforeRefund: 83, nextStep: { title: 'Review recorded funds' } } };
  const snapshot = { currency: 'USD', rate: null, unavailable: false }, seen = [];
  const { default: Funding } = load('../src/app/(tabs)/explore/[id]/funding.tsx', {
    react: h.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', BackHandler: { addEventListener: (_, fn) => { h.back.push(fn); return { remove() {} }; } } },
    'expo-router': { router: { push: path => h.routes.push(path) }, useFocusEffect: fn => h.focus.push(fn), useLocalSearchParams: () => ({ id: 'fixture' }) },
    '../../../../components/ui': ui, '../../../../components/Information': { SummaryLink: 'SummaryLink' }, '../../../../features/transparency/PageHeading': { PageHeading: 'PageHeading' },
    '../../../../lib/CurrencyProvider': { useCurrency: () => ({ snapshot }) }, '../../../../lib/report': { createReportDocument: (data, rate) => { seen.push([data, rate]); return data; } }, '../../../../lib/currency': { formatMoney: n => '$' + n },
    '../../../../features/reports/useCampaignReport': { useCampaignReport: () => ({ data: document }) }, '../../../../features/reports/ImpactDashboard': { ReportLoading: 'ReportLoading' }, '../../../../features/reports/ReportContent': { ReportFunding: 'ReportFunding', ReportRows: 'ReportRows' },
  });
  let tree = h.render(Funding); assert.deepEqual(seen[0], [document, snapshot]);
  const rows = nodes(tree).find(n => n.type === 'ReportRows').props.rows; assert.deepEqual(rows.map(r => r.value), ['$93', '$7', '$100']); assert.match(rows[1].label, /7%/);
  nodes(tree).find(n => n.props.testID === 'funding-spending-results').props.onPress(); assert.deepEqual(h.routes, ['/explore/fixture/report?section=delivery']);
  nodes(tree).find(n => n.props.testID === 'funding-accounting').props.onPress(); tree = h.render(Funding); assert.equal(nodes(tree).find(n => n.type === 'ReportFunding').props.details, true);
  h.focus.forEach(fn => fn()); assert.equal(h.back.at(-1)(), true); tree = h.render(Funding); assert.equal(nodes(tree).some(n => n.props.testID === 'funding-refunds'), true);
  nodes(tree).find(n => n.props.testID === 'funding-refunds').props.onPress(); tree = h.render(Funding); assert.match(text(tree), /Snapshot refund policy.*Snapshot unspent policy/); assert.match(text(tree), /not deducted until completed/); assert.match(text(tree), /not another available balance/);
  nodes(tree).find(n => n.type === 'PageHeading').props.onBack(); assert.ok(nodes(h.render(Funding)).some(n => n.props.testID === 'funding-accounting'));
  assert.equal(document.snapshot.refundPendingAmount, 2); assert.equal(document.snapshot.policy.feeRate, .07);
});

test('audience page preserves actual interests, channels, allocation and configurable estimate without inventing a range', () => {
  const types = load('../src/lib/types.ts'), h = stateHarness(), campaign = { id: 'fixture', goal: 100, interests: 'Climate, Wildlife', geography: 'India', channels: ['Instagram', 'Facebook'], allocation: { Instagram: 60, Facebook: 40 }, durationDays: 17, adImages: [], status: 'Available for Funding' }, config = { feeRate: .07, peoplePerAdDollar: 29 };
  const { default: Audience } = load('../src/app/(tabs)/explore/[id]/audience.tsx', {
    react: h.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' }, '@expo/vector-icons/Ionicons': { default: 'Icon' }, 'expo-router': { useLocalSearchParams: () => ({ id: 'fixture' }) }, '@tanstack/react-query': { useQuery: () => ({ data: campaign, refetch() {} }) },
    '../../../../components/ui': ui, '../../../../components/Information': { InfoAction: 'InfoAction' }, '../../../../features/transparency/PageHeading': { PageHeading: 'PageHeading' },
    '../../../../lib/api': { api() { throw Error('No requests in isolated UI fixture'); } }, '../../../../lib/types': types, '../../../../lib/CurrencyProvider': { useCurrency: () => ({ money: n => '$' + n }) }, '../../../../lib/public-campaign': { audienceCampaign: c => c }, '../../../../lib/assessments': { distributionPresentation: () => ({ title: 'Proposed distribution plan', body: 'Actual proposal qualification' }) }, '../../../../lib/session': { useConfig: () => ({ data: config }), useRefreshOnFocus() {}, useSession: () => ({ user: null }) }, '../../../../features/creation/Preview': { AdPreview: 'AdPreview' },
  });
  const tree = h.render(Audience), body = text(tree); assert.match(body, /2,697/); assert.equal(body.includes('63,000'), false);
  for (const value of ['Climate', 'Wildlife', 'India', 'Instagram', 'Facebook', '60%', '40%', '17']) assert.ok(body.includes(value), value);
  const details = nodes(tree).filter(n => n.type === 'InfoAction'); assert.deepEqual(details.map(n => n.props.title), ['How is this estimated?', 'Key assumptions', 'Advertising creative']);
  assert.match(text(details[0]), /29.*7.*%/); assert.match(text(details[1]), /Private backer identities/); assert.match(text(details[2]), /cover is separate.*not been substituted/);
});

test('dedicated page Back returns to actual parent and deep-link fallback stays in the same campaign', () => {
  const routes = []; let canGoBack = true;
  const { returnToCampaign } = load('../src/features/transparency/PageHeading.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' }, 'expo-router': { router: { canGoBack: () => canGoBack, back: () => routes.push('back'), replace: path => routes.push(path) } }, '../../components/ui': ui });
  returnToCampaign('fixture'); canGoBack = false; returnToCampaign('fixture'); assert.deepEqual(routes, ['back', '/explore/fixture']);
});
