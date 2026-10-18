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
const ui = { Button: 'Button', Text: 'Text', fonts: {}, useTheme: () => ({ colors, styles: {} }) };
const model = load('../src/lib/assessments.ts');
const base = { state: 'completed', contentHash: 'same', rubricVersion: 'campaign-review-v1', history: [], assessment: { status: 'published', total: 56, classification: 'Moderate review coverage', contentHash: 'same', rubricVersion: 'campaign-review-v1', assessmentType: 'demo', publishedAt: '2026-10-17T10:00:00Z' } };

test('reference-style shield uses native vector icon and separate scalable score/demo text', () => {
  let scale = 1, opened = 0;
  const { TrustScore } = load('../src/features/transparency/TrustScore.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', useWindowDimensions: () => ({ width: 393, fontScale: scale }) }, 'lucide-react-native/icons/shield': { default: 'Shield' }, '../../components/ui': ui, '../../lib/assessments': model });
  const render = () => TrustScore({ data: base, loading: false, error: false, onRetry() {}, onOpen: () => opened++ });
  const all = nodes(render());
  assert.equal(all.find(n => n.type === 'Shield').props.size, 220);
  assert.equal(all.find(n => n.type === 'Shield').props.strokeWidth, .32);
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

test('campaign sequence is estimate then Trust then audience, with real useful destinations and net USD estimate', () => {
  const routes = [], config = { feeRate: .05, peoplePerAdDollar: 27 };
  const { CampaignTransparency } = load('../src/features/transparency/CampaignTransparency.tsx', { 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' }, 'expo-router': { router: { push: path => routes.push(path) } }, '../../components/ui': ui, '../../lib/CurrencyProvider': { useCurrency: () => ({ money: x => `USD ${x}` }) }, '../../lib/types': { number: x => String(x), quote: (amount, c) => ({ reach: Math.floor(amount * (1-c.feeRate)*c.peoplePerAdDollar) }), estimate: (amount, c) => Math.floor(amount*(1-c.feeRate)*c.peoplePerAdDollar) }, '../../lib/assessments': model, './TrustScore': { TrustScore: 'TrustScore' } });
  const tree = CampaignTransparency({ campaign: { id: 'demo_1', publicContentHash: 'same', goal: 100, status: 'Available for Funding', channels: ['Instagram'], durationDays: 14, geography: 'India' }, config, assessment: base, loading: false, error: false, retry() {} });
  assert.ok(text(tree.props.children[0]).startsWith('Estimated reach'));
  assert.equal(tree.props.children[1].type, 'TrustScore');
  assert.equal(tree.props.children[1].props.data, base);
  assert.ok(text(tree.props.children[2]).includes('Audience & distribution'));
  assert.match(text(tree), /25\s+people after the included\s+5\s*% fee/);
  assert.match(text(tree), /2565\s+people at the goal/);
  tree.props.children[1].props.onOpen();
  nodes(tree).find(n => n.props.title === 'See the audience and distribution plan').props.onPress();
  nodes(tree).find(n => n.props.title === 'See funds, spend and refunds').props.onPress();
  assert.deepEqual(routes, ['/explore/demo_1/assessment', '/explore/demo_1/audience', '/explore/demo_1/report']);
});
