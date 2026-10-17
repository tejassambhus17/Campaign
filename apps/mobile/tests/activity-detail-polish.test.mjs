import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules, globals = {}) {
  const output = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', ...Object.keys(globals), output)(name => {
    assert.ok(name in modules, name); return modules[name];
  }, module.exports, module, ...Object.values(globals));
  return module.exports;
}
const model = load('../src/features/detail-sections.ts', {});
const flush = () => new Promise(resolve => setImmediate(resolve));

test('native campaign page order and contextual section parsing remain exact', () => {
  assert.deepEqual(model.detailSections, ['Story', 'Updates', 'Impact', 'Sources']);
  assert.equal(model.requestedDetailSection('sources'), 'Sources');
  assert.equal(model.requestedDetailSection(['Updates', 'Impact']), 'Updates');
  assert.equal(model.requestedDetailSection('invalid'), 'Story');
  assert.equal(model.requestedDetailSection(), 'Story');
});

/** Executes the native pager controller with imperative pager calls observed.
 * Callback delivery is isolated; these are not physical gesture tests.
 */
function navigationHarness({ deferred = false, reject = false, reduced = false } = {}) {
  const slots = [], listeners = new Set(), pagerCalls = [], offsets = [];
  let pointer = 0, effects = [], mounted = true, answer, fail, currentId = 'one', currentRequested;
  const query = deferred ? new Promise((resolve, reject) => { answer = resolve; fail = reject; }) : reject ? Promise.reject(new Error('isolated motion query failure')) : Promise.resolve(reduced);
  const depsEqual = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useState: initial => { const i = pointer++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { assert.equal(mounted, true, 'No state write after controller unmount'); slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef: value => { const i = pointer++; return slots[i] ||= { current: value }; },
    useEffect: (fn, deps) => { const i = pointer++, before = slots[i]; if (!before || !depsEqual(before.deps, deps)) { slots[i] = { deps, cleanup: before?.cleanup }; effects.push(() => { before?.cleanup?.(); slots[i].cleanup = fn(); }); } },
  };
  const scroll = { current: { scrollTo: value => offsets.push(value) } };
  const native = { setPage: index => pagerCalls.push(['animated', index]), setPageWithoutAnimation: index => pagerCalls.push(['immediate', index]) };
  const { useDetailSections } = load('../src/features/useDetailSections.ts', {
    react, '../components/NativePager': { default: 'PagerView' }, '../../../../components/NativePager': { default: 'PagerView' }, './detail-sections': model,
    'react-native': { AccessibilityInfo: { isReduceMotionEnabled: () => query, addEventListener: (_event, fn) => { listeners.add(fn); return { remove: () => listeners.delete(fn) }; } } },
  });
  const render = (id = currentId, requested = currentRequested) => {
    currentId = id; currentRequested = requested; pointer = 0; effects = [];
    const result = useDetailSections(id, requested, scroll); result.pager.current = native;
    effects.forEach(fn => fn()); return result;
  };
  return { render, pagerCalls, offsets, resolveMotion: value => answer(value), rejectMotion: () => fail(new Error('isolated motion query failure')), motion: value => listeners.forEach(fn => fn(value)), listenerCount: () => listeners.size,
    async ready(id = 'one', requested) { render(id, requested); await flush(); return render(); },
    unmount: () => { mounted = false; slots.forEach(slot => slot?.cleanup?.()); },
  };
}

test('actual native controller uses setPage for tabs and keeps native selected callbacks synchronized', async () => {
  const h = navigationHarness(); let state = await h.ready();
  assert.equal(state.section, 'Story'); assert.equal(state.initialPage, 0); assert.deepEqual(h.pagerCalls, [['immediate', 0]]);
  state.onPageSelected(0); state.selectSection('Updates'); state = h.render();
  assert.equal(state.section, 'Updates'); assert.deepEqual(h.pagerCalls.at(-1), ['animated', 1]);
  state.onPageSelected(0); assert.equal(h.render().section, 'Updates', 'Older settling selection cannot override latest tap');
  state.onPageSelected(1); state = h.render();
  state.onPageScrollStateChanged('dragging'); state.onPageSelected(2); state = h.render(); assert.equal(state.section, 'Impact');
  state.onPageScrollStateChanged('dragging'); state.onPageSelected(3); state = h.render(); assert.equal(state.section, 'Sources');
  state.onPageScrollStateChanged('dragging'); state.onPageSelected(2); assert.equal(h.render().section, 'Impact');
});

test('actual native controller rejects out-of-range selections and preserves first/last pages without wrapping', async () => {
  const h = navigationHarness(); let state = await h.ready(); state.onPageSelected(0);
  for (const index of [-1, 4, 1.5, NaN]) state.onPageSelected(index);
  assert.equal(h.render().section, 'Story'); const calls = h.pagerCalls.length;
  state.selectSection('Not a section'); assert.equal(h.pagerCalls.length, calls);
  state.selectSection('Sources'); state.onPageSelected(3); state = h.render();
  for (const index of [4, -1]) state.onPageSelected(index);
  assert.equal(h.render().section, 'Sources');
});

test('latest tab and contextual route request win over prior native settle callbacks', async () => {
  const h = navigationHarness(); let state = await h.ready(); state.onPageSelected(0);
  state.selectSection('Updates'); state.selectSection('Sources'); state = h.render();
  state.onPageSelected(1); assert.equal(h.render().section, 'Sources');
  state.onPageSelected(3); state = h.render(); assert.equal(state.section, 'Sources');
  h.render('one', 'Impact'); state = h.render(); assert.equal(state.section, 'Impact');
  assert.deepEqual(h.pagerCalls.at(-1), ['immediate', 2]);
  state.onPageSelected(3); assert.equal(h.render().section, 'Impact'); state.onPageSelected(2);
  state = h.render(); state.onPageScrollStateChanged('dragging'); state.onPageSelected(1); assert.equal(h.render().section, 'Updates', 'A new real native drag is allowed to replace the prior request');
});

test('measured header collapse gates inner vertical scrolling and tab changes never reset native reading offsets', async () => {
  const h = navigationHarness(); let state = await h.ready(); state.onPageSelected(0);
  state.recordViewport(800); state.recordTabs(70); state.recordHeader(1000); state.recordScroll(995);
  state = h.render(); assert.equal(state.pageHeight, 730); assert.equal(state.contentScrollEnabled, false);
  state.recordScroll(998); state = h.render(); assert.equal(state.contentScrollEnabled, true);
  state.selectSection('Updates'); state.onPageSelected(1); state = h.render();
  assert.equal(state.contentScrollEnabled, true); assert.deepEqual(h.offsets, [], 'Section selection must not scroll/reset shared overview or native per-page scroll views');
  state.recordScroll(400); state = h.render(); assert.equal(state.contentScrollEnabled, false);
  state.recordHeader(300); state = h.render(); assert.equal(state.contentScrollEnabled, true, 'A measured header change recalculates collapse against current offset');
  state.recordViewport(200); state.recordTabs(80); assert.equal(h.render().pageHeight, 120, 'Pager must fit the measured viewport even with keyboard or large text');
});

test('campaign identity change resets only shared overview and native requested page', async () => {
  const h = navigationHarness(); let state = await h.ready(); state.recordHeader(1000); state.recordScroll(1000);
  assert.equal(h.render().contentScrollEnabled, true);
  h.render('two', 'Sources'); state = h.render(); assert.equal(state.section, 'Sources'); assert.equal(state.contentScrollEnabled, false);
  assert.deepEqual(h.offsets, [{ y: 0, animated: false }]); assert.deepEqual(h.pagerCalls.at(-1), ['immediate', 3]);
  const count = h.pagerCalls.length; h.render('two', 'sources'); assert.equal(h.pagerCalls.length, count, 'Equivalent contextual casing must not reset the native page');
  state.onPageSelected(1); assert.equal(h.render().section, 'Sources'); state.onPageSelected(3);
});

test('reduced-motion tabs use immediate native page commands and latest accessibility event beats startup query', async () => {
  const h = navigationHarness({ deferred: true }); let state = h.render();
  state.selectSection('Updates'); assert.deepEqual(h.pagerCalls.at(-1), ['immediate', 1], 'Unknown initial preference is conservative');
  h.motion(true); h.resolveMotion(false); await flush(); state = h.render();
  state.selectSection('Impact'); assert.deepEqual(h.pagerCalls.at(-1), ['immediate', 2]);
  h.motion(false); state = h.render(); state.selectSection('Sources'); assert.deepEqual(h.pagerCalls.at(-1), ['animated', 3]);
});

test('failed native motion query retains safe default; cleanup rejects late query state writes', async () => {
  const failed = navigationHarness({ reject: true }); const state = await failed.ready(); state.selectSection('Impact');
  assert.deepEqual(failed.pagerCalls.at(-1), ['immediate', 2]);
  const late = navigationHarness({ deferred: true }); late.render(); assert.equal(late.listenerCount(), 1); late.unmount();
  assert.equal(late.listenerCount(), 0); late.resolveMotion(false); await flush();
});

function nativeDetailComposition(selected = 'Story', enabled = false) {
  const jsx = (type, props, key) => ({ type, props: props || {}, key });
  const events = [], pager = { current: null };
  const navigation = { section: selected, pager, initialPage: 0, pageHeight: 650, contentScrollEnabled: enabled,
    selectSection: value => events.push(['tab', value]), onPageSelected: value => events.push(['selected', value]), onPageScrollStateChanged: value => events.push(['state', value]), recordViewport() {}, recordHeader() {}, recordScroll() {}, recordTabs() {} };
  const campaign = { id: 'qa-native-detail', title: 'Native QA', creatorName: 'Campaign QA', category: 'Environment', createdAt: '2026-10-17T00:00:00Z', goal: 100, raised: 25, summary: 'Isolated render fixture', status: 'Available for Funding', sources: [] };
  const ui = Object.fromEntries(['Text', 'Button', 'ErrorState', 'Loading', 'Notice', 'Progress', 'Screen'].map(name => [name, name]));
  const { default: Detail } = load('../src/app/(tabs)/explore/[id]/index.tsx', {
    react: { useRef: initial => ({ current: initial }), useState: initial => [initial, () => {}] }, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { View: 'View', ScrollView: 'ScrollView', Pressable: 'Pressable', Linking: {}, useWindowDimensions: () => ({ width: 393, fontScale: 1 }) },
    '../components/NativePager': { default: 'PagerView' }, '../../../../components/NativePager': { default: 'PagerView' }, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    'expo-router': { router: {}, useLocalSearchParams: () => ({ id: campaign.id }) }, '@tanstack/react-query': { useQuery: () => ({ data: campaign }) },
    '../../../../lib/api': {}, '../../../../lib/types': {}, '../../../../lib/CurrencyProvider': { useCurrency: () => ({ money: value => `$${value}` }) }, '../../../../components/CurrencyNote': { CurrencyNote: 'CurrencyNote' },
    '../../../../features/detail-sections': model, '../../../../features/useDetailSections': { useDetailSections: () => navigation }, '../../../../lib/public-campaign': { audienceCampaign: c => c },
    '../../../../lib/session': { useRefreshOnFocus() {}, useSession: () => ({}), useConfig: () => ({}), useMe: () => ({}) }, '../../../../features/creation/model': {},
    '../../../../features/updates': { CampaignUpdates: 'CampaignUpdates' }, '../../../../components/ui': { ...ui, fonts: {}, useTheme: () => ({ colors: {} }) },
    '../../../../features/campaign': Object.fromEntries(['CampaignCover', 'CampaignStats', 'Disclosures', 'ShareButton', 'Story', 'CampaignJourney'].map(name => [name, name])),
  });
  return { tree: Detail(), events, pager };
}

test('actual detail composition uses persistent four-page LTR native hierarchy with sticky labels outside the pager', () => {
  const first = nativeDetailComposition(), tree = nodes(first.tree), pager = tree.find(node => node.type === 'PagerView');
  assert.equal(pager.key, 'qa-native-detail'); assert.equal(pager.props.orientation, 'horizontal'); assert.equal(pager.props.layoutDirection, 'ltr');
  assert.equal(pager.props.offscreenPageLimit, 3); assert.equal(pager.props.overScrollMode, 'never');
  assert.deepEqual(pager.props.children.map(page => page.key), model.detailSections);
  for (const page of pager.props.children) { assert.equal(page.type, 'View'); assert.equal(page.props.collapsable, false); const body = page.props.children; assert.equal(body.type, 'ScrollView'); assert.equal(body.props.nestedScrollEnabled, true); assert.equal(body.props.scrollEnabled, false); assert.equal(page.props.style.display, undefined); }
  const outer = tree.find(node => node.type === 'ScrollView'); assert.deepEqual(outer.props.stickyHeaderIndices, [1]); assert.equal(outer.props.nestedScrollEnabled, true);
  assert.equal(nodes(pager).some(node => node.props.accessibilityRole === 'tab'), false);
  const selected = tree.filter(node => node.props.accessibilityRole === 'tab' && node.props.accessibilityState.selected); assert.equal(selected.length, 1); assert.equal(selected[0].props.accessibilityLabel, 'Story');
  const changed = nativeDetailComposition('Impact', true), changedPager = nodes(changed.tree).find(node => node.type === 'PagerView');
  assert.equal(changedPager.key, pager.key); assert.deepEqual(changedPager.props.children.map(page => page.key), pager.props.children.map(page => page.key));
  assert.ok(changedPager.props.children.every(page => page.props.children.props.scrollEnabled));
  pager.props.onPageSelected({ nativeEvent: { position: 2 } }); pager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: 'dragging' } });
  tree.find(node => node.props.accessibilityRole === 'tab' && node.props.accessibilityLabel === 'Sources').props.onPress();
  assert.deepEqual(first.events, [['selected', 2], ['state', 'dragging'], ['tab', 'Sources']]);
});

function rowFixture(read, presentation, scheme = 'dark') {
  const jsx = (type, props) => ({ type, props: props || {} });
  const colors = { paper: scheme === 'dark' ? '#121212' : '#FFFFFF', bg: scheme === 'dark' ? '#000000' : '#FAFBFC', line: '#2C302E', ink: '#EEE', muted: '#AAA', text: '#DDD', mint: '#1E1E1E', surfaceRaised: '#1C1C1C', green: '#8EF4C5', progress: '#8EF4C5' };
  const activity = load('../src/lib/activity.ts', {}), calls = [];
  const { NotificationRow } = load('../src/features/notifications/NotificationRow.tsx', {
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    react: { useRef: value => ({ current: value }), useState: value => [value, () => {}] },
    'react-native': { ActivityIndicator: 'Spinner', Pressable: 'Pressable', View: 'View', useWindowDimensions: () => ({ fontScale: 1.3 }) },
    'react/jsx-runtime': { jsx, jsxs: jsx }, '../../components/ui': { Text: 'Text', useTheme: () => ({ colors, scheme }) },
    '../../lib/activity': activity,
  });
  const item = { id: 'one', title: 'Contribution confirmed', body: 'Original $5.00 USD receipt.', category: 'payments', createdAt: '2026-10-17T10:00:00Z', read, destination: { type: 'payment', paymentId: 'private-payment' } };
  return { tree: NotificationRow({ item, presentation, onOpen: () => calls.push('open'), onRead: () => calls.push('read') }), calls };
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : !tree || typeof tree !== 'object' ? [] : [tree, ...nodes(tree.props?.children)]; }

test('Activity read and unread rows remain unboxed in both themes, without changing quick-sheet treatment', () => {
  for (const scheme of ['dark', 'light']) for (const read of [true, false]) {
    const { tree, calls } = rowFixture(read, 'history', scheme);
    assert.equal(tree.props.style.backgroundColor, 'transparent'); assert.equal(tree.props.style.borderBottomWidth, 0);
    assert.deepEqual(calls, []);
    const press = nodes(tree).find(n => n.props.accessibilityHint === "Opens this update's relevant destination.");
    assert.match(press.props.accessibilityLabel, /Original \$5.00 USD receipt/);
    press.props.onPress(); assert.deepEqual(calls, ['open']);
    if (!read) {
      const mark = nodes(tree).find(n => n.props.accessibilityLabel === 'Mark Contribution confirmed as read');
      mark.props.onPress(); assert.deepEqual(calls, ['open', 'read']);
    }
  }
  assert.equal(rowFixture(false).tree.props.style.backgroundColor, '#121212');
  assert.equal(rowFixture(false).tree.props.style.borderBottomWidth, 1);
});
