import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules = {}) {
  const output = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', output)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name];
  }, module.exports, module);
  return module.exports;
}
const flush = () => new Promise(resolve => setImmediate(resolve));

/** Execute actual selection logic; native movement/smoothness is checked on
 * Android separately. No fake drag threshold or animation stands in for it.
 */
function pagerHarness({ deferred = false, rejected = false } = {}) {
  const slots = [], listeners = new Set(), commands = [], chipScrolls = [];
  let pointer = 0, effects = [], identity = 'qa-one', resolveMotion, mounted = true;
  const motion = deferred ? new Promise(resolve => { resolveMotion = resolve; }) : rejected ? Promise.reject(new Error('motion unavailable')) : Promise.resolve(false);
  const equal = (a, b) => a?.length === b?.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useState: initial => { const i = pointer++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { assert.ok(mounted, 'No state write after unmount'); slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef: initial => { const i = pointer++; return slots[i] ||= { current: initial }; },
    useCallback: fn => { pointer++; return fn; },
    useEffect: (fn, deps) => { const i = pointer++, before = slots[i]; if (!before || !equal(before.deps, deps)) { slots[i] = { deps, cleanup: before?.cleanup }; effects.push(() => { before?.cleanup?.(); slots[i].cleanup = fn(); }); } },
  };
  const model = load('../src/features/notifications/useActivityPages.ts', {
    react, '../../components/NativePager': { default: 'PagerView' },
    'react-native': { ScrollView: 'ScrollView', useWindowDimensions: () => ({ fontScale: 1.3 }), AccessibilityInfo: {
      isReduceMotionEnabled: () => motion,
      addEventListener: (_type, fn) => { listeners.add(fn); return { remove: () => listeners.delete(fn) }; },
    } },
  });
  function render(nextIdentity = identity) {
    identity = nextIdentity; pointer = 0; effects = [];
    const state = model.useActivityPages(identity);
    state.pager.current = { setPage: index => commands.push(['animated', index]), setPageWithoutAnimation: index => commands.push(['immediate', index]) };
    state.strip.current = { scrollTo: value => chipScrolls.push(value) };
    effects.forEach(fn => fn()); return state;
  }
  return { render, commands, chipScrolls, pages: model.activityPages,
    motion: value => listeners.forEach(fn => fn(value)), resolveMotion: value => resolveMotion(value), listenerCount: () => listeners.size,
    ready: async () => { render(); await flush(); return render(); },
    unmount: () => { mounted = false; slots.forEach(slot => slot?.cleanup?.()); },
  };
}

test('Activity pages keep the established visual order with native left-next/right-previous selection and bounds', async () => {
  const h = pagerHarness(); let state = await h.ready();
  assert.deepEqual(h.pages.map(page => [page.value, page.title]), [['All', 'All'], ['Campaigns', 'Updates'], ['Payments', 'Contributions'], ['Unread', 'Unread'], ['Account', 'Account']]);
  assert.equal(state.filter, 'All'); assert.deepEqual(h.commands, [['immediate', 0]]);
  state.onPageSelected(0);
  for (const index of [1, 2, 3, 4, 3, 2, 1, 0]) {
    state.onPageScrollStateChanged('dragging'); state.onPageSelected(index); state = h.render();
    assert.equal(state.selectedIndex, index); assert.equal(state.filter, h.pages[index].value);
  }
  for (const index of [-1, 5, 1.5, NaN]) state.onPageSelected(index);
  assert.equal(h.render().filter, 'All');
  state.selectFilter('Not a filter'); assert.equal(h.commands.length, 1);
});

test('Activity pill commands, interrupted settling and account reset keep selected state coherent', async () => {
  const h = pagerHarness(); let state = await h.ready(); state.onPageSelected(0);
  state.selectFilter('Campaigns'); state.selectFilter('Account'); state = h.render();
  assert.deepEqual(h.commands.slice(-2), [['animated', 1], ['animated', 4]]);
  state.onPageSelected(1); assert.equal(h.render().filter, 'Account', 'An obsolete settling event must not replace the latest tap');
  state.onPageSelected(4); state = h.render();
  state.onPageScrollStateChanged('dragging'); state.onPageSelected(3); assert.equal(h.render().filter, 'Unread');
  h.render('qa-two'); state = h.render();
  assert.equal(state.filter, 'All'); assert.deepEqual(h.commands.at(-1), ['immediate', 0]);
  state.onPageSelected(3); assert.equal(h.render().filter, 'All', 'Old account settling must not select a different new-account page');
  state.onPageSelected(0); state.selectFilter('Payments'); assert.deepEqual(h.commands.at(-1), ['animated', 2]);
});

test('Activity native taps respect reduced motion, startup races and unmount cleanup', async () => {
  const h = pagerHarness({ deferred: true }); let state = h.render();
  state.selectFilter('Campaigns'); assert.deepEqual(h.commands.at(-1), ['immediate', 1]);
  h.motion(true); h.resolveMotion(false); await flush(); state = h.render();
  state.selectFilter('Payments'); assert.deepEqual(h.commands.at(-1), ['immediate', 2]);
  h.motion(false); state = h.render(); state.selectFilter('Account'); assert.deepEqual(h.commands.at(-1), ['animated', 4]);
  const failed = pagerHarness({ rejected: true }); state = await failed.ready();
  state.selectFilter('Unread'); assert.deepEqual(failed.commands.at(-1), ['immediate', 3]);
  const late = pagerHarness({ deferred: true }); late.render(); assert.equal(late.listenerCount(), 1); late.unmount();
  assert.equal(late.listenerCount(), 0); late.resolveMotion(false); await flush();
});

test('Activity reveals selected filter from measured bounds, including reverse swipes and viewport changes', async () => {
  const h = pagerHarness(); let state = await h.ready(); state.onPageSelected(0);
  state.recordStrip(180); state.recordContent(500);
  h.pages.forEach((page, index) => state.recordFilter(page.value, index * 100, 90));
  state.onPageScrollStateChanged('dragging'); state.onPageSelected(4); state = h.render();
  assert.deepEqual(h.chipScrolls.at(-1), { x: 310, animated: false });
  state.recordStrip(120); assert.deepEqual(h.chipScrolls.at(-1), { x: 370, animated: false });
  state.onPageScrollStateChanged('dragging'); state.onPageSelected(0); h.render();
  assert.deepEqual(h.chipScrolls.at(-1), { x: 0, animated: false });
});

const jsx = (type, props, key) => ({ type, props: props || {}, key });
const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : !tree || typeof tree !== 'object' ? [] : [tree, ...nodes(tree.props?.children)];
const activityModel = load('../src/lib/activity.ts');
const pages = pagerHarness().pages;
function activityFixture({ selected = 'All', user = { id: 'fictional-owner' }, pending = false, error = false, cached = true } = {}) {
  const events = [], counters = { activityQueries: 0, read: 0, refetch: 0 }, now = new Date().toISOString();
  const records = [
    { id: 'update', category: 'campaigns', read: false, createdAt: now, campaignId: 'one' },
    { id: 'contribution', category: 'payments', read: true, createdAt: now },
    { id: 'account', category: 'security', read: false, createdAt: now },
  ];
  const query = { data: cached ? records : undefined, isPending: pending, isError: error, error: new Error('isolated query fixture'), refetch: () => counters.refetch++ };
  const navigation = { filter: selected, selectedIndex: pages.findIndex(page => page.value === selected), pager: { current: null }, strip: { current: null },
    selectFilter: value => events.push(['pill', value]), onPageSelected: value => events.push(['page', value]), onPageScrollStateChanged: value => events.push(['state', value]),
    recordStrip() {}, recordContent() {}, recordOffset() {}, recordFilter() {} };
  const component = load('../src/app/(tabs)/activity.tsx', {
    react: { useMemo: fn => fn(), useEffect() {}, useRef: initial => ({ current: initial }), useState: initial => [initial, () => undefined] }, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { Platform: { OS: 'android' }, Pressable: 'Pressable', RefreshControl: 'RefreshControl', ScrollView: 'ScrollView', SectionList: 'SectionList', View: 'View' },
    'expo-router': { router: { push: value => events.push(['route', value]) } }, '@tanstack/react-query': { useQuery: () => ({ data: [], refetch: () => counters.refetch++ }) },
    '../../components/NativePager': { default: 'PagerView' }, '../../lib/api': {}, '../../lib/activity': activityModel,
    '../../components/Information': { InfoSheet: 'InfoSheet', SummaryLink: 'SummaryLink' },
    '../../lib/session': { useSession: () => ({ user }), useMe: () => ({ data: { followed: [], campaigns: [] }, refetch: () => counters.refetch++ }),
      useActivity: () => { counters.activityQueries++; return query; }, useRefreshOnFocus() {} },
    '../../features/notifications/NotificationRow': { NotificationRow: 'NotificationRow' },
    '../../features/notifications/useNotificationActions': { useNotificationActions: () => ({ pendingIds: new Set(), clearError() {}, markRead: () => counters.read++, markAllRead: () => counters.read++ }) },
    '../../features/notifications/useActivityPages': { activityPages: pages, useActivityPages: () => navigation },
    '../../components/ui': { ...Object.fromEntries(['Text', 'Accordion', 'Button', 'IconButton', 'Empty', 'ErrorState', 'Notice', 'Pill', 'Progress', 'Screen'].map(name => [name, name])), useTheme: () => ({ colors: {} }) },
  }).default;
  return { tree: component(), events, counters, records };
}

test('Activity renders five real adjacent native lists with shared controls and no read/fetch mutations on page selection', () => {
  const h = activityFixture(), all = nodes(h.tree), pager = all.find(node => node.type === 'PagerView');
  assert.equal(pager.key, 'fictional-owner'); assert.equal(pager.props.orientation, 'horizontal'); assert.equal(pager.props.layoutDirection, 'ltr');
  assert.equal(pager.props.overdrag, false); assert.equal(pager.props.overScrollMode, 'never'); assert.equal(pager.props.offscreenPageLimit, 4);
  assert.deepEqual(pager.props.children.map(page => page.key), pages.map(page => page.value));
  const lists = pager.props.children.map(page => page.props.children);
  assert.deepEqual(lists.map(list => list.props.sections.flatMap(section => section.data.map(item => item.id))), [['update', 'contribution', 'account'], ['update'], ['contribution'], ['update', 'account'], ['account']]);
  assert.equal(all.filter(node => node.type === 'Pill').length, 5, 'One shared filter strip, not a copy inside every list');
  for (const [index, page] of pager.props.children.entries()) {
    assert.equal(page.type, 'View'); assert.equal(page.props.collapsable, false); assert.equal(page.props.importantForAccessibility, index === 0 ? 'auto' : 'no-hide-descendants');
    assert.equal(page.props.children.type, 'SectionList'); assert.equal(page.props.children.props.nestedScrollEnabled, true);
    assert.equal(page.props.children.props.onScroll, undefined, 'Native list owns its reading position');
    assert.equal(page.props.children.props.ListHeaderComponent, undefined);
  }
  pager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: 'dragging' } });
  pager.props.onPageSelected({ nativeEvent: { position: 1 } });
  all.find(node => node.type === 'Pill' && node.props.title === 'Contributions').props.onPress();
  assert.deepEqual(h.events, [['state', 'dragging'], ['page', 1], ['pill', 'Payments']]);
  assert.equal(h.counters.activityQueries, 1); assert.equal(h.counters.read, 0); assert.equal(h.counters.refetch, 0);
  const row = lists[0].props.renderItem({ item: h.records[0] }); row.props.onRead(); assert.equal(h.counters.read, 1, 'Only an explicit existing read action marks a notification');
  row.props.onOpen(); assert.equal(h.counters.read, 2); assert.deepEqual(h.events.at(-1), ['route', '/explore/one']);
});

test('Activity pages retain per-filter empty/retry/refresh states and guests do not get a private pager', () => {
  for (const fixture of [{ pending: true, cached: false }, { error: true, cached: false }, { cached: false }]) {
    const h = activityFixture(fixture), pager = nodes(h.tree).find(node => node.type === 'PagerView');
    const all = pager.props.children[0].props.children, updates = pager.props.children[1].props.children;
    if (fixture.pending) assert.equal(all.props.ListEmptyComponent.type.name, 'ActivityLoading');
    else if (fixture.error) { assert.equal(all.props.ListEmptyComponent.type, 'ErrorState'); all.props.ListEmptyComponent.props.retry(); assert.equal(h.counters.refetch, 1); }
    else {
      const empty = nodes(updates.props.ListEmptyComponent).find(node => node.type === 'Empty'); assert.equal(empty.props.title, 'No campaign updates yet');
      empty.props.action.props.onPress(); assert.deepEqual(h.events, [['pill', 'All']]);
    }
    all.props.refreshControl.props.onRefresh(); assert.ok(h.counters.refetch >= 2);
  }
  const guest = activityFixture({ user: null }); assert.equal(nodes(guest.tree).some(node => node.type === 'PagerView'), false);
  const empty = nodes(guest.tree).find(node => node.type === 'Empty'); assert.match(empty.props.body, /private campaign updates/);
  empty.props.action.props.onPress(); assert.deepEqual(guest.events, [['route', '/profile?auth=login']]);
  const account = activityFixture({ selected: 'Account' }), pager = nodes(account.tree).find(node => node.type === 'PagerView');
  assert.equal(pager.props.children[4].props.importantForAccessibility, 'auto'); assert.equal(pager.props.children[0].props.pointerEvents, 'none');
});
