import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', source)(name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, module.exports, module);
  return module.exports;
}
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
const jsx = (type, props) => {
  if (props?.ref && typeof props.ref === 'object') props.ref.current = { handle: 17 };
  return { type, props: props || {} };
};
function harness() {
  let draft = { sort: 'Featured', funding: false }, visible = true, closes = 0, applies = 0, dismisses = 0, reduced = false;
  const focus = [], dimensions = { width: 393, height: 850, fontScale: 1.17 }, insets = { top: 32, bottom: 24 };
  const component = load('../src/features/explore/FilterOverlay.tsx', {
    react: { useRef: initial => ({ current: initial }) }, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { AccessibilityInfo: { setAccessibilityFocus: handle => focus.push(handle) }, findNodeHandle: node => node?.handle,
      Keyboard: { dismiss: () => dismisses++ }, Modal: 'Modal', Pressable: 'Pressable', ScrollView: 'ScrollView', Switch: 'Switch', View: 'View', useWindowDimensions: () => dimensions },
    'react-native-safe-area-context': { useSafeAreaInsets: () => insets }, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../../components/ui': { Button: 'Button', IconButton: 'IconButton', Text: 'Text', fonts: {}, useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }) }) },
  });
  const render = () => component.FilterOverlay({ visible, draft, reduceMotion: reduced, onChange: value => { draft = value; }, onClose: () => { closes++; visible = false; }, onApply: () => { applies++; visible = false; } });
  return { render, nodes: () => nodes(render()), draft: () => draft, closes: () => closes, applies: () => applies, focus, dismisses: () => dismisses,
    open: () => { visible = true; }, reduced: value => { reduced = value; }, dimensions, insets };
}

test('filter presentation is a transparent bounded floating card with scrollable controls and accessible focus', () => {
  const h = harness(), tree = h.render(), all = nodes(tree);
  assert.equal(tree.type, 'Modal'); assert.equal(tree.props.transparent, true);
  assert.equal(tree.props.animationType, 'fade');
  tree.props.onShow(); assert.deepEqual(h.focus, [17]); assert.equal(h.dismisses(), 1);
  const card = all.find(node => node.props.accessibilityViewIsModal);
  assert.equal(card.props.style.width, '100%'); assert.equal(card.props.style.maxWidth, 420);
  assert.ok(card.props.style.maxHeight < h.dimensions.height - h.insets.top - h.insets.bottom);
  assert.ok(all.some(node => node.type === 'ScrollView' && node.props.style.flexShrink === 1));
  assert.deepEqual(all.filter(node => node.props.accessibilityRole === 'radio').map(node => node.props.accessibilityLabel), ['Featured', 'Newest', 'Most funded', 'Closest to goal']);
  assert.ok(all.filter(node => node.props.accessibilityRole === 'radio').every(node => node.props.style({}).minHeight >= 48));
  assert.equal(all.some(node => node.props.allowFontScaling === false), false);
  h.dimensions.height = 430; h.dimensions.fontScale = 1.5; h.reduced(true);
  assert.equal(h.render().props.animationType, 'none');
  assert.ok(h.nodes().find(node => node.props.accessibilityViewIsModal).props.style.maxHeight <= 430 - 32 - 24 - 32);
});

test('sort, funding and Clear only edit the staged options, with one explicit Apply action', () => {
  const h = harness();
  h.nodes().find(node => node.props.accessibilityLabel === 'Newest').props.onPress();
  assert.deepEqual(h.draft(), { sort: 'Newest', funding: false });
  h.nodes().find(node => node.type === 'Switch').props.onValueChange(true);
  assert.deepEqual(h.draft(), { sort: 'Newest', funding: true });
  h.nodes().find(node => node.props.title === 'Clear').props.onPress();
  assert.deepEqual(h.draft(), { sort: 'Featured', funding: false });
  assert.equal(h.closes(), 0); assert.equal(h.applies(), 0);
  h.nodes().find(node => node.props.title === 'Apply filters').props.onPress();
  assert.equal(h.applies(), 1); assert.equal(h.render(), null, 'no invisible blocking overlay remains');
});

test('Android Back, outside, close, Cancel and accessibility escape dismiss without losing draft choices or applying', () => {
  const h = harness();
  h.nodes().find(node => node.props.accessibilityLabel === 'Most funded').props.onPress();
  const dismissals = [tree => tree.props.onRequestClose(), tree => nodes(tree).find(node => node.props.accessibilityLabel === 'Dismiss campaign filters').props.onPress(),
    tree => nodes(tree).find(node => node.props.label === 'Close campaign filters').props.onPress(), tree => nodes(tree).find(node => node.props.title === 'Cancel').props.onPress(),
    tree => nodes(tree).find(node => node.props.accessibilityViewIsModal).props.onAccessibilityEscape()];
  for (const dismiss of dismissals) {
    h.open(); dismiss(h.render()); assert.equal(h.render(), null);
    assert.deepEqual(h.draft(), { sort: 'Most funded', funding: false });
  }
  assert.equal(h.closes(), 5); assert.equal(h.applies(), 0);
});

test('Home filters its mounted campaign cards, stages floating options and carries current filters through See all', t => {
  const state = [], navigation = [], focus = []; let cursor = 0, keyboardDismissals = 0;
  const priorFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = callback => { callback(); return 1; };
  t.after(() => { if (priorFrame === undefined) delete globalThis.requestAnimationFrame; else globalThis.requestAnimationFrame = priorFrame; });
  const react = { useCallback: callback => callback, useMemo: factory => factory(), useEffect: () => {}, useRef: initial => ({ current: initial }), useState: initial => {
    const index = cursor++; if (!(index in state)) state[index] = initial;
    return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
  } };
  const publicModel = load('../src/lib/public-campaign.ts', {});
  const discovery = load('../src/lib/discovery.ts', {});
  const homeModel = load('../src/features/home/model.ts', { '../../lib/discovery': discovery, '../../lib/public-campaign': publicModel });
  const campaign = (id, overrides = {}) => ({ id, title: `${id} reach`, category: 'Environment', creatorName: 'Fictional creator', summary: 'Community research', status: 'Available for Funding', raised: 20, goal: 100, createdAt: '2026-10-01T00:00:00Z', ...overrides });
  const rows = [campaign('forest', { publishedAt: '2026-10-15T00:00:00Z' }), campaign('demo_ocean', { featured: true, raised: 80 }), campaign('books', { category: 'Education', status: 'Completed', raised: 100 }), campaign('health', { category: 'Health' }), campaign('community', { category: 'Community' })];
  const ui = Object.fromEntries(['Text', 'Button', 'Empty', 'ErrorState', 'Loading', 'Notice', 'Screen'].map(name => [name, name]));
  const component = load('../src/app/(tabs)/index.tsx', {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { AccessibilityInfo: { setAccessibilityFocus: handle => focus.push(handle) }, findNodeHandle: node => node?.handle, Keyboard: { dismiss: () => keyboardDismissals++ }, Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', View: 'View', useWindowDimensions: () => ({ width: 393, height: 850, fontScale: 1.17 }) },
    'expo-router': { router: { push: href => navigation.push(href) }, useFocusEffect: () => {}, useLocalSearchParams: () => ({}) },
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: String }) }, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../../components/ui': { ...ui, fonts: {}, useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }), styles: { row: {}, body: {}, muted: {} }, scheme: 'dark' }) },
    '../../lib/session': { useSession: () => ({ user: null, ready: true, onboardingError: '' }), useActivity: () => ({ data: [] }), useCampaigns: () => ({ data: rows }), useConfig: () => ({}) },
    '../../lib/types': { categories: ['Environment', 'Health', 'Education', 'Community', 'Public Policy'], number: String },
    '../../features/home/HomeDiscoveryCard': { HomeDiscoveryCard: 'HomeDiscoveryCard' }, '../../features/home/model': homeModel,
    '../../features/explore/FilterOverlay': { FilterOverlay: 'FilterOverlay' }, '../../features/creation/model': { STEPS: [] }, '../../features/creation/useDraftLibrary': {},
    '../../features/notifications/NotificationSheet': { NotificationSheet: 'NotificationSheet' }, '../../lib/api': {}, '../../components/UnreadBadge': { UnreadBadge: 'UnreadBadge' },
    '../../features/home/SpotlightCard': { SpotlightCard: 'SpotlightCard' },
    '../../features/walkthrough/Walkthrough': { useWalkthrough: () => ({}), useWalkthroughTarget: () => null, WalkthroughInvitation: 'WalkthroughInvitation' },
  }).default;
  const render = () => { cursor = 0; return nodes(component()); };
  const overlay = all => all.find(node => node.type === 'FilterOverlay');
  const featured = all => all.find(node => node.type === 'SpotlightCard')?.props.campaign.id;
  const input = all => all.find(node => node.type === 'TextInput');
  const category = (all, value) => all.find(node => node.props.accessibilityLabel === `${value} campaigns`);
  const openFilters = all => all.find(node => node.props.accessibilityLabel === 'Home campaign filters and sort').props.onPress();
  let all = render();
  assert.equal(overlay(all).props.visible, false);
  assert.equal(featured(all), 'demo_ocean');
  input(all).props.onChangeText(' reach '); all = render();
  input(all).props.onSubmitEditing();
  category(all, 'Environment').props.onPress(); all = render();
  assert.equal(input(all).props.value, ' reach ');
  assert.equal(category(all, 'Environment').props.accessibilityState.selected, true);
  assert.deepEqual(all.filter(node => node.type === 'HomeDiscoveryCard').map(node => node.props.campaign.id), ['forest']);
  assert.deepEqual(navigation, [], 'search submission and category changes stay on Home');

  openFilters(all); all = render();
  assert.equal(overlay(all).props.visible, true);
  assert.equal(all.find(node => node.type === 'ScrollView').props.importantForAccessibility, 'no-hide-descendants');
  overlay(all).props.onChange({ sort: 'Newest', funding: true }); all = render();
  assert.equal(featured(all), 'demo_ocean', 'staged sort does not alter mounted results');
  overlay(all).props.onClose(); all = render();
  assert.equal(overlay(all).props.visible, false);
  assert.equal(featured(all), 'demo_ocean', 'Cancel leaves applied choices unchanged');
  openFilters(all); all = render();
  assert.deepEqual(overlay(all).props.draft, { sort: 'Featured', funding: false }, 'opening again starts from applied options');
  overlay(all).props.onChange({ sort: 'Newest', funding: true }); all = render();
  overlay(all).props.onApply(); all = render();
  assert.equal(overlay(all).props.visible, false);
  assert.equal(featured(all), 'forest', 'Apply changes the actual filtered and sorted cards');
  assert.equal(all.find(node => node.type === 'ScrollView').props.importantForAccessibility, 'auto');
  assert.ok(focus.length >= 2 && focus.every(handle => handle === 17), 'closing restores focus to the mounted filter control');
  assert.deepEqual(navigation, [], 'opening, changing, cancelling and applying filters never redirect');
  all.find(node => node.props.accessibilityLabel === 'See all featured campaign').props.onPress();
  assert.deepEqual(navigation.at(-1), { pathname: '/explore', params: { q: 'reach', category: 'Environment', sort: 'Newest', funding: '1' } });

  category(all, 'Community').props.onPress(); all = render();
  assert.equal(featured(all), 'community', 'Communities uses the actual canonical Community category');
  input(all).props.onChangeText('no matching message'); all = render();
  assert.equal(all.find(node => node.type === 'Empty').props.title, 'No campaigns match');
  const emptyAction = all.find(node => node.type === 'Empty').props.action;
  assert.equal(emptyAction.props.title, 'Clear filters');
  emptyAction.props.onPress(); all = render();
  assert.equal(input(all).props.value, '');
  assert.equal(category(all, 'All').props.accessibilityState.selected, true);
  assert.equal(featured(all), 'demo_ocean');
  all.find(node => node.type === 'Button' && node.props.title === 'Start a campaign').props.onPress();
  assert.equal(navigation.at(-1), '/create');
  assert.ok(keyboardDismissals > 0);
  assert.equal(rows[0].id, 'forest', 'Home filtering leaves server order intact');
});
