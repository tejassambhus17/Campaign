import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
function load(path, modules = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', source)(name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, module, module.exports);
  return module.exports;
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree && typeof tree === 'object' ? text(tree.props?.children) : String(tree ?? ''); }
function expand(tree) {
  if (Array.isArray(tree)) return tree.map(expand);
  if (!tree || typeof tree !== 'object') return tree;
  if (typeof tree.type === 'function') return expand(tree.type(tree.props));
  return { ...tree, props: { ...tree.props, children: expand(tree.props?.children) } };
}
const assessments = load('../src/lib/assessments.ts');
const types = load('../src/lib/types.ts');
const publicCampaign = load('../src/lib/public-campaign.ts');
const campaign = { id: 'demo_ocean', title: 'The actual ocean message', creatorName: 'Actual community', summary: 'An actual public summary', category: 'Environment', publicContentHash: 'public-1', publishedAt: '2026-10-17T12:00:00Z', durationDays: 14, raised: 25, goal: 100, status: 'Available for Funding' };
const assessment = { state: 'completed', contentHash: 'public-1', rubricVersion: 'campaign-review-v1', history: [], assessment: { status: 'published', contentHash: 'public-1', rubricVersion: 'campaign-review-v1', publishedAt: '2026-10-17T13:00:00Z', total: 56, classification: 'Moderate review coverage', assessmentType: 'demo' } };
const colors = { primary: '#8EF4C5', onPrimary: '#08271D', onImage: '#FFFFFF' };
const native = scale => ({ View: 'View', Pressable: 'Pressable', useWindowDimensions: () => ({ width: 393, fontScale: scale }) });

function trustHarness({ scale = 1, response = { data: assessment, isPending: false, isError: false }, user = { id: 'user-1' } } = {}) {
  const routes = [], queries = [], apiCalls = [];
  const feature = load('../src/features/transparency/DiscoveryTrustBadge.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': native(scale),
    'expo-router': { router: { push: path => routes.push(path) } },
    '@tanstack/react-query': { useQuery: options => { queries.push(options); return response; } },
    'lucide-react-native/icons/shield': { default: 'Shield' }, '../../components/ui': { Text: 'Text' },
    '../../lib/api': { api: path => { apiCalls.push(path); return Promise.resolve(assessment); } },
    '../../lib/assessments': assessments, '../../lib/session': { useSession: () => ({ user }) },
  });
  return { feature, routes, queries, apiCalls };
}

test('small photo score tile shows actual shield/number and Trust Score without a visible demo or classification suffix', () => {
  const { feature, routes } = trustHarness();
  const tile = feature.DiscoveryTrustBadge({ campaign, data: assessment, loading: false, error: false, testID: 'score' });
  assert.match(text(tile), /56.*Trust Score/);
  assert.equal(/demo|Moderate|review coverage/i.test(text(tile)), false);
  assert.match(tile.props.accessibilityLabel, /Illustrative demo assessment.*56 out of 100.*Moderate review coverage/);
  const style = tile.props.style({ pressed: false });
  assert.equal(style.width, 74); assert.equal(style.minHeight, 74); assert.equal(style.flexShrink, 0);
  assert.ok(nodes(tile).some(n => n.type === 'Shield'));
  tile.props.onPress(); assert.deepEqual(routes, ['/explore/demo_ocean/assessment']);
  assert.ok(nodes(tile).every(n => n.props.allowFontScaling !== false));
  const phoneTile = trustHarness({ scale: 1.17 }).feature.DiscoveryTrustBadge({ campaign, data: assessment, loading: false, error: false, testID: 'score' });
  const phoneStyle = phoneTile.props.style({ pressed: false });
  assert.equal(phoneStyle.width, phoneStyle.minHeight); assert.equal(phoneStyle.width, 74);
  assert.ok(nodes(phoneTile).every(n => n.props.allowFontScaling !== false && n.props.numberOfLines === undefined));
});

test('score tiles reflow enlarged text and never display stale, draft, missing or unavailable scores as reviewed', () => {
  const { feature } = trustHarness({ scale: 1.8 });
  const render = (data, error = false) => feature.DiscoveryTrustBadge({ campaign, data, loading: false, error, testID: 'score' });
  assert.equal(render(assessment).props.style({ pressed: false }).width, 104);
  assert.match(text(render(assessment)), /56.*Trust Score/);
  for (const data of [undefined, { ...assessment, contentHash: 'old' }, { ...assessment, state: 'not_assessed' }, { ...assessment, assessment: { ...assessment.assessment, status: 'draft' } }]) {
    assert.equal(text(render(data)).includes('56'), false);
  }
  assert.equal(text(render(assessment, true)).includes('56'), false);
});

test('Explore and Home assessment hook preserves recipient cache key, existing API and exact public-content binding', async () => {
  const { feature, queries, apiCalls } = trustHarness();
  const actual = feature.useCampaignAssessment(campaign);
  assert.equal(actual.data, assessment); assert.equal(actual.error, false);
  assert.deepEqual(queries[0].queryKey, ['assessment', 'demo_ocean', 'user-1']);
  assert.equal(queries[0].enabled, true); await queries[0].queryFn();
  assert.deepEqual(apiCalls, ['/campaigns/demo_ocean/assessment']);
  feature.useCampaignAssessment({ ...campaign, publishedAt: undefined }); assert.equal(queries[1].enabled, false);
  const stale = trustHarness({ response: { data: { ...assessment, contentHash: 'stale' }, isPending: false, isError: false } }).feature.useCampaignAssessment(campaign);
  assert.equal(stale.data, undefined); assert.equal(stale.error, true);
  const notAssessed = trustHarness({ response: { data: { ...assessment, state: 'not_assessed', assessment: null }, isPending: false, isError: false } });
  assert.equal(assessments.assessmentPresentation(notAssessed.feature.useCampaignAssessment(campaign).data).score, null);
});

function homeHarness(scale = 1) {
  const routes = [];
  const homeParts = {
    HomeCardArtwork: 'Artwork', HomeCardCaption: 'Caption', HomeFundingProgress: 'FundingProgress', HomeMetric: 'Metric', HomeTrustBadge: 'TrustBadge', imageAccent: '#8EF4C5', imageMuted: '#D2DAD6',
    useHomeCardData: () => ({ count: 7, assessment, assessmentLoading: false, assessmentError: false, percentage: 25, time: { value: '14', label: 'days left' } }),
  };
  const { SpotlightCard } = load('../src/features/home/SpotlightCard.tsx', {
    react: { default: { memo: component => component } }, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': native(scale), 'expo-router': { router: { push: path => routes.push(path) } }, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../../components/ui': { Text: 'Text', useTheme: () => ({ colors }) }, '../../lib/types': types, '../../lib/CurrencyProvider': { useCurrency: () => ({ money: n => `$${n}` }) }, '../../lib/public-campaign': publicCampaign,
    '../campaign': { detailPath: id => `/explore/${id}` }, './HomeCardParts': homeParts,
  });
  return { render: c => expand(SpotlightCard({ campaign: c })), routes };
}

test('featured card keeps score at the top right, preserves creator in metadata and gives Back/View proper separate buttons', () => {
  const { render, routes } = homeHarness(), tree = render(campaign), all = nodes(tree);
  const rail = all.find(n => n.props.testID === 'home-featured-photo-badges');
  assert.equal(rail.props.style.flexDirection, 'row'); assert.equal(rail.props.style.flexWrap, undefined);
  assert.equal(rail.props.children.at(-1).type, 'TrustBadge');
  const actions = all.find(n => n.props.testID === 'home-featured-actions');
  assert.equal(text(actions).includes('Actual community'), false);
  assert.equal(text(tree).includes('Actual community'), true); assert.equal(text(tree).includes('By Actual community'), false);
  const buttons = nodes(actions).filter(n => n.type === 'Pressable'); assert.equal(buttons.length, 2);
  assert.deepEqual(buttons.map(n => n.props.accessibilityLabel), ['Back campaign: The actual ocean message', 'View campaign: The actual ocean message']);
  assert.ok(buttons.every(n => n.props.style({ pressed: false }).minHeight >= 48));
  assert.equal(buttons[0].props.style({ pressed: false }).borderWidth, 1);
  for (const button of buttons) button.props.onPress();
  assert.deepEqual(routes, ['/explore/demo_ocean/back', '/explore/demo_ocean']);
  assert.match(text(tree), /FEATURED · DEMO/);
  assert.equal(nodes(render({ ...campaign, status: 'Completed' })).some(n => n.props.accessibilityLabel?.startsWith('Back campaign:')), false);
  const phone = nodes(homeHarness(1.17).render(campaign)).find(n => n.props.testID === 'home-featured-actions');
  assert.equal(phone.props.style.flexDirection, 'row');
  const large = nodes(homeHarness(1.8).render(campaign)).find(n => n.props.testID === 'home-featured-actions');
  assert.equal(large.props.style.flexDirection, 'column');
});

test('campaign statistics use valid public embedded counts and load the report only as a guarded fallback', async () => {
  let queried = [], response = { data: { contributionCount: 8 } };
  const { CampaignStats } = load('../src/features/showcase.tsx', {
    react: { default: {} }, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { Image: 'Image', View: 'View' }, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '@tanstack/react-query': { useQuery: options => { queried.push(options); return response; } }, '../lib/api': { api: () => Promise.resolve({ contributionCount: 8 }) }, '../lib/types': types,
    '../components/ui': { Picture: 'Picture', Text: 'Text', useTheme: () => ({ colors }) },
  });
  for (const count of [0, 7]) {
    const rendered = CampaignStats({ campaign: { ...campaign, report: { contributionCount: count } } });
    assert.equal(queried.at(-1).enabled, false); assert.match(text(rendered), new RegExp(`\\b${count}\\b`));
  }
  for (const count of [undefined, -1, 1.5, '9']) {
    const rendered = CampaignStats({ campaign: { ...campaign, report: { contributionCount: count } } });
    assert.equal(queried.at(-1).enabled, true); assert.match(text(rendered), /8/);
  }
  assert.deepEqual(queried.at(-1).queryKey, ['report', 'demo_ocean']);
  response = { data: { contributionCount: -7 } };
  assert.equal(text(CampaignStats({ campaign })).includes('-7'), false);
  CampaignStats({ campaign: { ...campaign, publishedAt: undefined } }); assert.equal(queried.at(-1).enabled, false);
});


test('Discover keeps visible campaign provenance separate from its compact score badge', () => {
  const { HomeDiscoveryCard } = load('../src/features/home/HomeDiscoveryCard.tsx', {
    react: { default: { memo: component => component }, useEffect() {}, useRef: value => ({ current: value }), useState: value => [value, () => {}] },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': native(1), 'expo-router': { router: { push() {} } }, '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../../components/ui': { Text: 'Text' },
    '../../lib/api': { api() {}, captureApiSession: () => () => true }, '../../lib/public-campaign': publicCampaign, '../../lib/session': { refresh() {}, useMe: () => ({ data: {} }), useSession: () => ({ user: null }) },
    '../../lib/types': types, '../../lib/CurrencyProvider': { useCurrency: () => ({ money: n => `$${n}` }) }, '../campaign': { detailPath: id => `/explore/${id}` },
    './HomeCardParts': { compactHomeCount: String, HomeCardArtwork: 'Artwork', HomeCardCaption: 'Caption', HomeFundingProgress: 'FundingProgress', HomeTrustBadge: 'TrustBadge', imageAccent: '#8EF4C5', imageMuted: '#D2DAD6', useHomeCardData: () => ({ count: 7, assessment, assessmentLoading: false, assessmentError: false, percentage: 25, time: { value: '14', label: 'days left' } }) },
  });
  const tree = expand(HomeDiscoveryCard({ campaign }));
  assert.match(text(tree), /Environment.*Actual community.*Demo campaign/);
  const badge = nodes(tree).find(n => n.type === 'TrustBadge'); assert.equal(badge.props.compact, true); assert.equal(badge.props.data, assessment);
  const real = expand(HomeDiscoveryCard({ campaign: { ...campaign, id: 'actual-user-campaign' } }));
  assert.equal(text(real).includes('Demo campaign'), false);
});
