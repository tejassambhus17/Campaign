import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
function load(path, modules = {}) {
  const module = { exports: {} }, source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', source)(name => { assert.ok(name in modules, 'Unexpected import ' + name); return modules[name]; }, module, module.exports);
  return module.exports;
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree && typeof tree === 'object' ? text(tree.props?.children) : String(tree ?? ''); }
const colors = new Proxy({}, { get: () => '#121212' });
const ui = { Accordion: 'Accordion', Button: 'Button', Text: 'Text', fonts: {}, useTheme: () => ({ colors, styles: {} }) };
const model = load('../src/lib/assessments.ts');
const base = { state: 'completed', contentHash: 'same', rubricVersion: 'campaign-review-v1', history: [], assessment: { status: 'published', total: 56, classification: 'Moderate review coverage', contentHash: 'same', rubricVersion: 'campaign-review-v1', assessmentType: 'demo', publishedAt: '2026-10-17T10:00:00Z' } };

test('reference-style shield uses native vector icon and separate scalable score/demo text', () => {
  let scale = 1, opened = 0;
  const { TrustScore } = load('../src/features/transparency/TrustScore.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', useWindowDimensions: () => ({ width: 393, fontScale: scale }) }, 'lucide-react-native/icons/shield': { default: 'Shield' }, '../../components/ui': ui, '../../lib/assessments': model });
  const render = () => TrustScore({ data: base, loading: false, error: false, onRetry() {}, onOpen: () => opened++ });
  const all = nodes(render());
  const shield = all.find(n => n.type === 'Shield');
  assert.ok(shield.props.size >= 164 && shield.props.size <= 216, 'The shield stays within the current reference proportion');
  assert.ok(shield.props.strokeWidth > .32, 'The reference outline remains clearly visible at its smaller size');
  assert.equal(shield.props.style?.transform, undefined, 'The approved reference retains the native shield width');
  assert.ok(all.some(n => n.props.testID === 'demo-assessment-label'));
  assert.equal(all.find(n => n.props.testID === 'assessment-score').props.children, 56);
  assert.ok(all.filter(n => n.type === 'Text').every(n => n.props.allowFontScaling !== false));
  all.find(n => n.props.title === 'See how we reviewed the campaign').props.onPress(); assert.equal(opened, 1);
  scale = 1.8; const enlarged = nodes(render());
  assert.ok(enlarged.some(n => n.props.testID === 'assessment-score'));
  assert.ok(text(render()).includes('Moderate review coverage'));
});

test('unavailable service has retry; missing or draft assessment shows no fabricated score', () => {
  let retry = 0;
  const { TrustScore } = load('../src/features/transparency/TrustScore.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', useWindowDimensions: () => ({ width: 360, fontScale: 1 }) }, 'lucide-react-native/icons/shield': { default: 'Shield' }, '../../components/ui': ui, '../../lib/assessments': model });
  const error = TrustScore({ loading: false, error: true, onRetry: () => retry++ });
  nodes(error).find(n => n.props.title === 'Retry assessment').props.onPress(); assert.equal(retry, 1);
  for (const state of ['not_assessed', 'in_progress', 'superseded']) assert.equal(nodes(TrustScore({ data: { ...base, state }, loading: false, error: false, onRetry() {} })).some(n => n.props.testID === 'assessment-score'), false);
  assert.equal(nodes(TrustScore({ data: base, loading: false, error: false, onRetry() {} })).some(n => n.props.title === 'See how we reviewed the campaign'), false); // details screen has no misleading self-link
});

test('campaign transparency has three accurate destinations without legacy information accordions or duplicate review actions', () => {
  const routes = [], config = { feeRate: .05, peoplePerAdDollar: 27 };
  const { CampaignTransparency } = load('../src/features/transparency/CampaignTransparency.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' }, 'expo-router': { router: { push: path => routes.push(path) } }, '../../components/ui': ui, '../../components/Information': { SummaryLink: 'SummaryLink' }, '../../lib/CurrencyProvider': { useCurrency: () => ({ money: x => `USD ${x}` }) }, '../../lib/types': { number: x => String(x), estimate: (amount, c) => Math.floor(amount*(1-c.feeRate)*c.peoplePerAdDollar) }, '../../lib/assessments': model, './TrustScore': { TrustScore: 'TrustScore' } });
  const tree = CampaignTransparency({ campaign: { id: 'demo_1', publicContentHash: 'same', goal: 100, raised: 25, status: 'Available for Funding', channels: ['Instagram'], durationDays: 14, geography: 'India' }, config, assessment: base, loading: false, error: false, retry() {} });
  const score = nodes(tree).find(n => n.type === 'TrustScore');
  assert.equal(score.props.data, base);
  assert.equal(score.props.compact, true); assert.equal(score.props.onOpen, undefined);
  const links = nodes(tree).filter(n => n.type === 'SummaryLink');
  assert.deepEqual(links.map(n => n.props.title), ['Audience & Reach', 'Funding & Spending', 'Trust & Verification']);
  assert.equal(links[0].props.summary, 'Est. 2565 people at the goal');
  assert.equal(links[1].props.summary, 'USD 25 of USD 100 raised'); assert.match(links[2].props.summary, /56\/100/);
  assert.equal(nodes(tree).some(n => n.type === 'Accordion'), false);
  links.forEach(n => n.props.onPress());
  assert.deepEqual(routes, ['/explore/demo_1/audience', '/explore/demo_1/funding', '/explore/demo_1/assessment']);
});

test('compact assessment summary keeps the real score inside its shield, state and truthful provenance', () => {
  const { TrustScore } = load('../src/features/transparency/TrustScore.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', useWindowDimensions: () => ({ width: 393, fontScale: 1 }) }, 'lucide-react-native/icons/shield': { default: 'Shield' }, '../../components/ui': ui, '../../lib/assessments': model });
  const completed = TrustScore({ compact: true, data: base, loading: false, error: false, onRetry() {} });
  assert.equal(completed.props.testID, 'trust-score-summary');
  assert.equal(nodes(completed).find(n => n.props.testID === 'assessment-summary-score').props.children, 56);
  assert.ok(nodes(completed).some(n => n.props.accessibilityLabel === '56/100 · Moderate review coverage'));
  assert.match(text(completed), /Moderate review coverage/);
  assert.match(text(completed), /Illustrative assessment.*Demo campaign/);
  const stale = TrustScore({ compact: true, data: { ...base, state: 'superseded' }, loading: false, error: false, onRetry() {} });
  assert.match(text(stale), /New assessment needed/);
  assert.equal(nodes(stale).some(n => n.props.testID === 'assessment-summary-score'), false);
});
