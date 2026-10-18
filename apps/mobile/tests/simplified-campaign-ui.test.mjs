import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props, key) => ({ type, props: props || {}, key });
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name];
  }, module, module.exports);
  return module.exports;
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree && typeof tree === 'object' ? text(tree.props?.children) : String(tree ?? ''); }
const publicModel = load('../src/lib/public-campaign.ts');
const types = load('../src/lib/types.ts');
const colors = new Proxy({}, { get: () => '#121212' });
const campaign = { id: 'demo_ui', title: 'Actual campaign title', creatorName: 'Actual creator', category: 'Environment', summary: 'Actual public message', featured: true, raised: 123, goal: 500, status: 'Available for Funding', storyHeadline: 'A real story heading', intro: 'Actual creator introduction', sections: [{ id: 's1', kind: 'text', text: 'Actual full story' }], sources: [{ id: 'ref', title: 'A public reference', url: 'https://example.org/evidence' }] };
function harness({ width = 393, scale = 1 } = {}) {
  const routes = []; let expanded = false;
  const feature = load('../src/features/campaign.tsx', {
    react: { default: { memo: component => component }, useState: initial => [typeof initial === 'boolean' ? expanded : initial, value => { expanded = value; }] },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    'react-native': { View: 'View', Pressable: 'Pressable', Platform: { OS: 'android' }, Share: {}, useWindowDimensions: () => ({ width, fontScale: scale }) },
    'expo-router': { router: { push: path => routes.push(path) } }, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../components/CurrencyNote': { CurrencyNote: 'CurrencyNote' }, '../lib/CurrencyProvider': { useCurrency: () => ({ money: value => `$${value}` }) },
    './creation/Preview': { StoryPreview: 'StoryPreview' }, '../lib/types': types, '../lib/public-campaign': publicModel,
    '../components/ui': { Text: 'Text', Accordion: 'Accordion', Button: 'Button', Notice: 'Notice', Progress: 'Progress', useTheme: () => ({ colors, styles: { body: {}, muted: {} } }) },
    './transparency/DiscoveryTrustBadge': { CampaignTrustBadge: 'CampaignTrustBadge' },
    './showcase': { CampaignCover: 'CampaignCover', CampaignStats: 'CampaignStats' }, './CampaignJourney': { CampaignJourney: 'CampaignJourney' },
  });
  return { feature, routes };
}

test('Explore photo card preserves actual public metadata, funding, estimate/time stats and separate View/Back destinations', () => {
  const { feature, routes } = harness(), config = { feeRate: .05, peoplePerAdDollar: 27 };
  const tree = feature.CampaignCard({ campaign, config, compact: true, presentation: 'explore' }), all = nodes(tree);
  assert.equal(tree.props.testID, 'explore-campaign-card');
  assert.match(text(tree), /Actual campaign title.*Environment.*Actual creator.*Actual public message/s);
  assert.match(text(tree), /Featured.*Demo/);
  const funding = all.find(node => node.type === feature.Funding);
  assert.equal(funding.props.campaign, campaign); assert.equal(funding.props.config, config);
  const stats = all.find(node => node.type === 'CampaignStats');
  assert.equal(stats.props.campaign, campaign); assert.equal(stats.props.showTime, true);
  all.find(node => node.props.title === 'View campaign').props.onPress();
  all.find(node => node.props.accessibilityLabel === 'Back Actual campaign title').props.onPress();
  assert.deepEqual(routes, ['/explore/demo_ui', '/explore/demo_ui/back']);
  assert.equal(all.some(node => node.props.allowFontScaling === false), false);
  const closed = feature.CampaignCard({ campaign: { ...campaign, id: 'user-created', featured: false, status: 'Completed' }, presentation: 'explore' });
  assert.equal(nodes(closed).some(node => node.props.accessibilityLabel === 'Back Actual campaign title'), false);
  assert.equal(text(closed).includes('Featured'), false);
  assert.equal(text(closed).includes('Demo'), false);
});

test('Explore places a public assessment tile at the photo top right for featured and nonfeatured built-in campaigns', () => {
  const { feature } = harness();
  for (const id of ['demo_ocean', 'demo_forest', 'demo_education', 'user-created']) {
    const current = { ...campaign, id, featured: id === 'demo_ocean' };
    const tree = feature.CampaignCard({ campaign: current, presentation: 'explore' });
    const tile = nodes(tree).find(node => node.type === 'CampaignTrustBadge');
    assert.equal(tile.props.campaign, current); assert.equal(tile.props.testID, `explore-assessment-${id}`);
    const rail = nodes(tree).find(node => node.props.pointerEvents === 'box-none');
    assert.equal(rail.props.style.right, 10); assert.equal(rail.props.style.top, 10);
    assert.equal(rail.props.children.at(-1), tile); assert.equal(rail.props.style.flexWrap, undefined);
    assert.equal(text(tree).includes('Demo campaign'), id.startsWith('demo_') && !current.featured);
  }
});

test('Explore compact actions reflow for enlarged text without modifying user content or private revisions', () => {
  const { feature } = harness({ scale: 1.8 });
  const approved = { ...campaign, title: 'Approved public title' }, original = { ...campaign, title: 'Private draft title', status: 'Draft', campaignState: 'Available for Funding', revisionPending: true, publishedVersion: approved };
  const before = structuredClone(original), tree = feature.CampaignCard({ campaign: original, presentation: 'explore' });
  assert.match(text(tree), /Approved public title/); assert.equal(text(tree).includes('Private draft title'), false);
  const buttons = nodes(tree).find(node => node.type === 'View' && Array.isArray(node.props.children) && node.props.children[0]?.props?.title === 'View campaign');
  assert.equal(buttons.props.style.flexDirection, 'column');
  assert.deepEqual(original, before);
});

test('Story starts concise and Read full story reveals the original editorial blocks and public source references', () => {
  const { feature } = harness(), first = feature.Story({ campaign });
  assert.match(text(first), /A real story heading.*Actual creator introduction/s);
  assert.equal(nodes(first).some(node => node.type === 'StoryPreview'), false);
  nodes(first).find(node => node.props.title === 'Read full story').props.onPress();
  const opened = feature.Story({ campaign }), preview = nodes(opened).find(node => node.type === 'StoryPreview');
  assert.equal(preview.props.draft, campaign); assert.equal(preview.props.draft.sources, campaign.sources);
  assert.deepEqual(preview.props.draft.sections, campaign.sections);
  nodes(opened).find(node => node.props.title === 'Show less').props.onPress();
  assert.equal(nodes(feature.Story({ campaign })).some(node => node.type === 'StoryPreview'), false);
});

test('checkout policy sheet content keeps complete fees/refunds/review/estimates without nested accordions', () => {
  const { feature } = harness(), config = { feeRate: .05, peoplePerAdDollar: 27, policies: { refunds: 'Actual refund policy', unspent: 'Actual unspent policy', partialFunding: 'Actual partial-funding policy' } };
  const tree = feature.Disclosures({ campaign, config }), all = nodes(tree);
  assert.equal(all.some(node => node.type === 'Accordion'), false);
  for (const heading of ['Where your contribution goes', 'Intended audience & distribution', 'How review works', 'How estimated reach is calculated']) assert.ok(text(tree).includes(heading), heading);
  assert.match(text(tree), /not a direct donation.*Actual refund policy.*Actual unspent policy.*Actual partial-funding policy/s);
  assert.match(text(tree), /platform fee/);
  assert.match(text(tree), /27 people per advertising dollar/);
  assert.match(text(tree), /not independent fact-checking/);
});
