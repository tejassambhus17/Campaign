import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', source)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name];
  }, loaded.exports, loaded);
  return loaded.exports;
}
const { categories } = load('../src/lib/types.ts');
const discovery = load('../src/lib/discovery.ts');
const jsx = (type, props, key) => ({ type, props: props || {}, key });
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
const forest = { id: 'forest', title: 'Forest message', summary: 'More shade', creatorName: 'Canopy', category: 'Environment', status: 'Available for Funding', raised: 2, goal: 10 };
const books = { ...forest, id: 'books', title: 'Shared books', category: 'Education', status: 'Completed' };

// Execute the actual Explore screen while adapting native elements and hooks.
// Native drag/settle smoothness and each FlatList's real scroll offset still
// require Android verification; these cases check page wiring and UI state.
function harness({ campaigns = [forest, books], pending = false, error = false } = {}) {
  const slots = [], refs = [], effects = [], commands = [], chipScrolls = [];
  let stateCursor = 0, refCursor = 0, effectCursor = 0, refetches = 0, params = {}, motionListener;
  const react = {
    useState: initial => {
      const index = stateCursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef: initial => {
      const index = refCursor++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useCallback: callback => callback,
    useMemo: callback => callback(),
    useEffect: (callback, deps) => {
      const index = effectCursor++, previous = effects[index];
      effects[index] = { deps, callback, changed: !previous || deps.some((value, i) => value !== previous.deps[i]) };
    },
  };
  const component = load('../src/app/(tabs)/explore/index.tsx', {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': {
      AccessibilityInfo: { isReduceMotionEnabled: () => ({ then: callback => { callback(false); return { catch: () => {} }; } }), addEventListener: (_name, listener) => { motionListener = listener; return { remove: () => {} }; } },
      FlatList: 'FlatList', Keyboard: { dismiss: () => {} }, Pressable: 'Pressable', ScrollView: 'ScrollView', Switch: 'Switch', TextInput: 'TextInput', View: 'View', useWindowDimensions: () => ({ width: 393, height: 850, fontScale: 1.17 }),
    },
    '../../../components/NativePager': { default: 'PagerView' },
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    'expo-router': { useLocalSearchParams: () => params },
    '../../../lib/discovery': discovery,
    '../../../lib/types': { categories },
    '../../../lib/session': { useCampaigns: () => ({ data: campaigns, isPending: pending, isError: error, error: new Error('fixture unavailable'), refetch: () => refetches++ }), useConfig: () => ({ data: { fixture: true } }) },
    '../../../features/campaign': { CampaignCard: 'CampaignCard' },
    '../../../components/ui': { Text: 'Text', Button: 'Button', Empty: 'Empty', ErrorState: 'ErrorState', Loading: 'Loading', Pill: 'Pill', Screen: 'Screen', fonts: { sans: 'Manrope' }, useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }), styles: { row: {}, muted: {}, body: {}, title: {} }, scheme: 'dark' }) },
  }).default;
  let currentTree, currentPager, currentHeader;
  function render() {
    stateCursor = 0; refCursor = 0; effectCursor = 0;
    currentTree = component();
    currentPager = nodes(currentTree).find(node => node.type === 'PagerView');
    currentHeader = nodes(currentTree).find(node => node.type === 'ScrollView' && !node.props.horizontal);
    currentPager.props.ref.current = { setPage: index => commands.push(['animated', index]), setPageWithoutAnimation: index => commands.push(['instant', index]) };
    const strip = nodes(currentHeader).find(node => node.type === 'ScrollView' && node.props.horizontal);
    strip.props.ref.current = { scrollTo: options => chipScrolls.push(options) };
    effects.filter(effect => effect.changed).forEach(effect => effect.callback());
    return currentPager;
  }
  return { render, header: () => nodes(currentHeader), pager: () => currentPager, pages: () => currentPager.props.children,
    list: index => nodes(currentPager.props.children[index]).find(node => node.type === 'FlatList'),
    selected: () => nodes(currentHeader).find(node => node.type === 'Pill' && node.props.selected)?.props.title,
    swipe: index => currentPager.props.onPageSelected({ nativeEvent: { position: index } }),
    drag: () => currentPager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: 'dragging' } }),
    commands, chipScrolls, refetches: () => refetches, route: values => { params = values; }, motion: value => motionListener(value) };
}

test('Explore uses native horizontal pages in exact category order with real adjacent filtered lists and no fade/drag simulation', () => {
  const h = harness(), pager = h.render();
  assert.equal(pager.props.orientation, 'horizontal'); assert.equal(pager.props.layoutDirection, 'ltr');
  assert.equal(pager.props.overdrag, false); assert.equal(pager.props.overScrollMode, 'never');
  assert.deepEqual(pager.props.style, { flex: 1 });
  assert.deepEqual(h.pages().map(page => page.key), ['All', ...categories]);
  assert.equal(h.pages().every(page => page.type === 'View' && page.props.collapsable === false), true);
  assert.deepEqual(h.list(0).props.data.map(campaign => campaign.id), ['forest', 'books']);
  assert.deepEqual(h.list(1).props.data.map(campaign => campaign.id), ['forest']);
  assert.deepEqual(h.list(4).props.data.map(campaign => campaign.id), ['books']);
  assert.deepEqual(h.list(2).props.data, []);
  const card = h.list(1).props.renderItem({ item: forest });
  assert.equal(card.type, 'CampaignCard'); assert.equal(card.props.campaign, forest);
  assert.equal(h.header().some(node => node.type === 'FlatList'), false);
  assert.equal(h.header().find(node => node.type === 'TextInput').props.accessibilityLabel, 'Search campaigns');
});

test('native page selection synchronizes category pills and a11y while pill taps invoke the native pager', () => {
  const h = harness(); h.render(); h.render();
  h.drag(); h.swipe(1); h.render();
  assert.equal(h.selected(), 'Environment');
  assert.equal(h.pages()[0].props.importantForAccessibility, 'no-hide-descendants');
  assert.equal(h.pages()[1].props.importantForAccessibility, 'auto');
  assert.equal(h.pages()[0].props.accessibilityElementsHidden, true);
  assert.equal(h.pages()[1].props.pointerEvents, 'auto');
  h.header().find(node => node.type === 'Pill' && node.props.title === 'Education').props.onPress(); h.render();
  assert.deepEqual(h.commands.at(-1), ['animated', 4]); assert.equal(h.selected(), 'Education');
  h.swipe(4); h.render();
  h.motion(true); h.render();
  h.header().find(node => node.type === 'Pill' && node.props.title === 'All').props.onPress(); h.render();
  assert.deepEqual(h.commands.at(-1), ['instant', 0]); assert.equal(h.selected(), 'All');
  h.swipe(-1); h.swipe(99); h.render(); assert.equal(h.selected(), 'All');
});

test('all native category pages share search/sort/funding settings and remain mounted without manual scroll resets', () => {
  const h = harness(); h.render(); h.render(); const keys = h.pages().map(page => page.key);
  h.header().find(node => node.type === 'TextInput').props.onChangeText('forest');
  h.header().find(node => node.props.accessibilityLabel === 'Campaign filters and sort').props.onPress(); h.render();
  h.header().find(node => node.type === 'Switch').props.onValueChange(true); h.render();
  h.drag(); h.swipe(1); h.render();
  assert.equal(h.header().find(node => node.type === 'TextInput').props.value, 'forest');
  assert.equal(h.header().find(node => node.type === 'Switch').props.value, true);
  assert.deepEqual(h.list(0).props.data.map(campaign => campaign.id), ['forest']);
  assert.deepEqual(h.list(1).props.data.map(campaign => campaign.id), ['forest']); assert.deepEqual(h.list(4).props.data, []);
  assert.deepEqual(h.pages().map(page => page.key), keys);
  for (let i = 0; i < keys.length; i++) {
    assert.equal(h.list(i).props.keyboardDismissMode, 'on-drag');
    assert.equal(h.list(i).props.onScroll, undefined); assert.equal(h.list(i).props.onContentSizeChange, undefined);
  }
  h.header().find(node => node.props.title === 'Reset').props.onPress(); h.render();
  assert.equal(h.selected(), 'All'); assert.deepEqual(h.list(0).props.data.map(campaign => campaign.id), ['forest', 'books']);
});

test('selected native page pills auto-reveal from measured bounds in either direction and after layout changes', () => {
  const h = harness(); h.render();
  const strip = h.header().find(node => node.type === 'ScrollView' && node.props.horizontal);
  strip.props.onLayout({ nativeEvent: { layout: { width: 240 } } }); strip.props.onContentSizeChange(1000);
  const wrappers = h.header().filter(node => node.type === 'View' && node.props.onLayout);
  wrappers.forEach((node, index) => node.props.onLayout({ nativeEvent: { layout: { x: index * 90, width: 80 } } }));
  h.drag(); h.swipe(4); h.render(); assert.deepEqual(h.chipScrolls.at(-1), { x: 200, animated: false });
  h.drag(); h.swipe(0); h.render(); assert.deepEqual(h.chipScrolls.at(-1), { x: 0, animated: false });
  h.drag(); h.swipe(10); h.render(); assert.deepEqual(h.chipScrolls.at(-1), { x: 740, animated: false });
  h.header().find(node => node.type === 'ScrollView' && node.props.horizontal).props.onLayout({ nativeEvent: { layout: { width: 180 } } });
  assert.deepEqual(h.chipScrolls.at(-1), { x: 800, animated: false });
});

test('route changes pin the native page and reject obsolete selection events while loading/error/empty states remain available', () => {
  const h = harness(); h.render(); h.drag(); h.swipe(1); h.render();
  h.route({ q: 'forest' }); h.render();
  assert.deepEqual(h.commands.at(-1), ['instant', 1]);
  h.swipe(2); h.render(); assert.equal(h.selected(), 'Environment');
  h.swipe(1); h.render();
  h.route({ category: 'Environment' }); h.render();
  h.swipe(2); h.render(); assert.equal(h.selected(), 'Environment');
  h.route({ q: 'books', category: 'Education' }); h.render();
  assert.deepEqual(h.commands.at(-1), ['instant', 4]);
  h.swipe(2); h.render(); assert.equal(h.selected(), 'Education');
  h.swipe(4); h.render(); assert.equal(h.header().find(node => node.type === 'TextInput').props.value, 'books');
  const empty = harness({ campaigns: [] }); empty.render(); assert.equal(empty.list(0).props.ListEmptyComponent.type, 'Empty');
  const pending = harness({ pending: true }); pending.render(); assert.equal(pending.list(0).props.ListEmptyComponent.type, 'Loading');
  const error = harness({ error: true }); error.render(); error.list(0).props.ListEmptyComponent.props.retry(); assert.equal(error.refetches(), 1);
});
