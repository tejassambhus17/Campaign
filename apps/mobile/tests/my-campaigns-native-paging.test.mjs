import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
const output = ts.transpileModule(readFileSync(new URL('../src/features/profile/MyCampaigns.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const jsx = (type, props, key) => ({ type, props: props || {}, key });
const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : !tree || typeof tree !== 'object' ? [] : [tree, ...nodes(tree.props?.children)];
const flush = () => new Promise(resolve => setImmediate(resolve));

// Execute the actual component, adapting native host views and hook scheduling.
// Android gesture direction/frame smoothness remain separate native checks.
function harness({ deferred = false, reject = false, campaigns = [] } = {}) {
  const slots = [], listeners = new Set(), commands = [], chipScrolls = [], actions = [];
  let pointer = 0, effects = [], currentTree, currentPager, currentCampaigns = campaigns, fontScale = 1, scheme = 'dark', resolveMotion, mounted = true;
  const motion = deferred ? new Promise(resolve => { resolveMotion = resolve; }) : reject ? Promise.reject(new Error('motion unavailable')) : Promise.resolve(false);
  const equal = (a, b) => a?.length === b?.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useState: initial => { const i = pointer++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { assert.ok(mounted, 'No component state write after unmount'); slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef: initial => { const i = pointer++; return slots[i] ||= { current: initial }; },
    useMemo: fn => { pointer++; return fn(); }, useCallback: fn => { pointer++; return fn; },
    useEffect: (fn, deps) => { const i = pointer++, before = slots[i]; if (!before || !equal(before.deps, deps)) { slots[i] = { deps, cleanup: before?.cleanup }; effects.push(() => { before?.cleanup?.(); slots[i].cleanup = fn(); }); } },
  };
  const modules = {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { FlatList: 'FlatList', ScrollView: 'ScrollView', View: 'View', useWindowDimensions: () => ({ fontScale }), AccessibilityInfo: {
      isReduceMotionEnabled: () => motion, addEventListener: (_type, fn) => { listeners.add(fn); return { remove: () => listeners.delete(fn) }; },
    } },
    '../../components/NativePager': { default: 'PagerView' },
    '../../components/ui': { Button: 'Button', Empty: 'Empty', Pill: 'Pill', Text: 'Text', useTheme: () => ({ colors: { bg: scheme === 'dark' ? '#000000' : '#FAFBFC' }, styles: { muted: {} } }) },
  };
  const module = { exports: {} };
  new Function('require', 'exports', 'module', output)(name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, module.exports, module);
  function render(nextCampaigns = currentCampaigns) {
    currentCampaigns = nextCampaigns; pointer = 0; effects = [];
    currentTree = module.exports.MyCampaigns({ campaigns: currentCampaigns, onCreate: () => actions.push('create'), renderCampaign: campaign => { actions.push(['render', campaign.id]); return { type: 'DashboardCard', props: { campaign } }; } });
    currentPager = nodes(currentTree).find(node => node.type === 'PagerView');
    currentPager.props.ref.current = { setPage: index => commands.push(['animated', index]), setPageWithoutAnimation: index => commands.push(['immediate', index]) };
    const strip = nodes(currentTree).find(node => node.type === 'ScrollView' && node.props.horizontal);
    strip.props.ref.current = { scrollTo: options => chipScrolls.push(options) };
    effects.forEach(fn => fn()); return currentTree;
  }
  return { render, groups: module.exports.myCampaignGroups, commands, chipScrolls, actions,
    pager: () => currentPager, pages: () => currentPager.props.children,
    pills: () => nodes(currentTree).filter(node => node.type === 'Pill'),
    selected: () => nodes(currentTree).find(node => node.type === 'Pill' && node.props.selected)?.props.title,
    allNodes: () => nodes(currentTree), list: index => currentPager.props.children[index].props.children,
    drag: () => currentPager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: 'dragging' } }),
    page: index => currentPager.props.onPageSelected({ nativeEvent: { position: index } }),
    motion: value => listeners.forEach(fn => fn(value)), resolveMotion: value => resolveMotion(value),
    font: value => { fontScale = value; }, theme: value => { scheme = value; }, listenerCount: () => listeners.size,
    ready: async () => { render(); await flush(); return render(); },
    unmount: () => { mounted = false; slots.forEach(slot => slot?.cleanup?.()); },
  };
}

test('My Campaigns uses genuine persistent native pages in the exact existing group/status order', async () => {
  const h = harness();
  const expected = [
    ['Drafts', ['Draft']], ['Under Review', ['Submitted for Review', 'Approved']],
    ['Published / Funding', ['Available for Funding', 'Funding Goal Reached', 'Funding Period Ends']],
    ['Promoting', ['Distribution Preparation', 'Promoting']], ['Completed', ['Completed']],
    ['Requires Action', ['Changes Requested', 'Rejected', 'Cancelled', 'Refund Pending', 'Failed']],
  ];
  assert.deepEqual(h.groups.map(group => [group.title, group.statuses]), expected);
  const campaigns = expected.flatMap(([group, statuses]) => statuses.map((status, index) => Object.freeze({ id: `${group}-${index}`, title: status, status, campaignState: 'Completed' })));
  const original = structuredClone(campaigns); h.render(campaigns); await flush(); h.render();
  const pager = h.pager();
  assert.equal(pager.props.orientation, 'horizontal'); assert.equal(pager.props.layoutDirection, 'ltr');
  assert.equal(pager.props.overdrag, false); assert.equal(pager.props.overScrollMode, 'never'); assert.equal(pager.props.offscreenPageLimit, 5);
  assert.deepEqual(h.pages().map(page => page.key), expected.map(group => group[0]));
  for (const [index, page] of h.pages().entries()) {
    assert.equal(page.type, 'View'); assert.equal(page.props.collapsable, false);
    const list = page.props.children; assert.equal(list.type, 'FlatList'); assert.equal(list.props.nestedScrollEnabled, true);
    assert.deepEqual(list.props.data.map(campaign => campaign.status), expected[index][1]);
    assert.equal(list.props.onScroll, undefined); assert.equal(list.props.onContentSizeChange, undefined);
    assert.equal(list.props.removeClippedSubviews, false);
  }
  assert.deepEqual(campaigns, original); assert.deepEqual(h.actions, [], 'Paging does not invoke renderer actions or creation');
  const row = h.list(0).props.renderItem({ item: campaigns[0] }); assert.equal(row.props.children.type, 'DashboardCard'); assert.equal(row.props.children.props.campaign, campaigns[0]);
  assert.deepEqual(h.actions, [['render', 'Drafts-0']]);
});

test('My Campaigns swipes and pills stay synchronized, reject obsolete callbacks and never wrap', async () => {
  const h = harness(); await h.ready();
  for (const index of [1, 2, 3, 4, 5, 4, 3, 2, 1, 0]) {
    h.drag(); h.page(index); h.render(); assert.equal(h.selected(), h.groups[index].title);
    assert.equal(h.pages()[index].props.importantForAccessibility, 'auto');
    assert.equal(h.pages()[(index + 1) % 6].props.pointerEvents, 'none');
  }
  for (const index of [-1, 6, 1.5, NaN]) h.page(index);
  h.render(); assert.equal(h.selected(), 'Drafts');
  h.pills()[1].props.onPress(); h.pills()[5].props.onPress(); h.render();
  assert.deepEqual(h.commands.slice(-2), [['animated', 1], ['animated', 5]]);
  h.page(1); h.render(); assert.equal(h.selected(), 'Requires Action');
  h.page(5); h.render(); h.drag(); h.page(4); h.render(); assert.equal(h.selected(), 'Completed');
  assert.deepEqual(h.actions, []);
});

test('My Campaigns preserves selection and mounted page identities across data, theme and text-size rerenders', async () => {
  const h = harness({ campaigns: [{ id: 'one', status: 'Draft' }] }); await h.ready();
  h.drag(); h.page(2); h.render(); const keys = h.pages().map(page => page.key);
  h.theme('light'); h.font(1.5); h.render([{ id: 'two', status: 'Draft' }, { id: 'three', status: 'Funding Goal Reached' }]);
  assert.equal(h.selected(), 'Published / Funding'); assert.deepEqual(h.pages().map(page => page.key), keys);
  assert.deepEqual(h.list(2).props.data.map(campaign => campaign.id), ['three']); assert.equal(h.list(2).props.style.backgroundColor, '#FAFBFC');
  assert.deepEqual(h.commands, [], 'Unrelated rerenders never jump or reset native reading positions');
});

test('My Campaigns reveal uses measured strip bounds in both directions and after viewport changes', async () => {
  const h = harness(); await h.ready();
  const strip = h.allNodes().find(node => node.type === 'ScrollView' && node.props.horizontal);
  strip.props.onLayout({ nativeEvent: { layout: { width: 180 } } }); strip.props.onContentSizeChange(600);
  h.allNodes().filter(node => node.type === 'View' && node.props.onLayout).forEach((node, index) => node.props.onLayout({ nativeEvent: { layout: { x: index * 100, width: 90 } } }));
  h.drag(); h.page(5); h.render(); assert.deepEqual(h.chipScrolls.at(-1), { x: 410, animated: false });
  h.allNodes().find(node => node.type === 'ScrollView' && node.props.horizontal).props.onLayout({ nativeEvent: { layout: { width: 120 } } });
  assert.deepEqual(h.chipScrolls.at(-1), { x: 470, animated: false });
  h.drag(); h.page(0); h.render(); assert.deepEqual(h.chipScrolls.at(-1), { x: 0, animated: false });
});

test('My Campaigns reduced-motion taps, failed preference reads and cleanup stay safe', async () => {
  const h = harness({ deferred: true }); h.render(); h.pills()[1].props.onPress(); assert.deepEqual(h.commands.at(-1), ['immediate', 1]);
  h.motion(true); h.resolveMotion(false); await flush(); h.render(); h.pills()[2].props.onPress(); assert.deepEqual(h.commands.at(-1), ['immediate', 2]);
  h.motion(false); h.render(); h.pills()[4].props.onPress(); assert.deepEqual(h.commands.at(-1), ['animated', 4]);
  const failed = harness({ reject: true }); await failed.ready(); failed.pills()[3].props.onPress(); assert.deepEqual(failed.commands.at(-1), ['immediate', 3]);
  const late = harness({ deferred: true }); late.render(); assert.equal(late.listenerCount(), 1); late.unmount();
  assert.equal(late.listenerCount(), 0); late.resolveMotion(false); await flush();
});

test('My Campaigns keeps existing empty copy and only the explicit Create action invokes creation', async () => {
  const h = harness(); await h.ready();
  assert.deepEqual(h.groups.map(group => group.empty), ['No drafts yet', 'No campaigns under review', 'No published campaigns', 'No campaigns in distribution', 'No completed campaigns', 'No campaigns need your attention']);
  h.groups.forEach((group, index) => {
    const empty = h.list(index).props.ListEmptyComponent;
    assert.equal(empty.props.title, group.empty);
    assert.equal(empty.props.body, 'Give your next idea a bigger audience. Your saved drafts will be here when you return.');
    assert.equal(empty.props.action.props.title, 'Create a campaign');
  });
  h.drag(); h.page(3); h.render(); assert.deepEqual(h.actions, []);
  h.list(3).props.ListEmptyComponent.props.action.props.onPress(); assert.deepEqual(h.actions, ['create']);
});
