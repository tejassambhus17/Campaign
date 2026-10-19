import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : [];
function load(path, modules, append = '') {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', '__DEV__', source + '\n' + append)(name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, module.exports, module, false);
  return module.exports;
}
function hooks() {
  const values = []; let cursor = 0;
  return { reset: () => { cursor = 0; }, react: {
    useState: initial => { const i = cursor++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], next => { values[i] = typeof next === 'function' ? next(values[i]) : next; }]; },
    useRef: initial => { const i = cursor++; return values[i] ||= { current: initial }; },
    useEffect() {}, useMemo: fn => fn(), useCallback: fn => fn(),
  } };
}
const theme = { colors: new Proxy({}, { get: () => '#121212' }), styles: new Proxy({}, { get: () => ({}) }) };
const ui = { ...Object.fromEntries(['Accordion', 'Button', 'Empty', 'ErrorState', 'Field', 'IconButton', 'Loading', 'Notice', 'Picture', 'Progress', 'Screen', 'Text', 'Pill'].map(value => [value, value])), fonts: { semibold: 'Manrope' }, useTheme: () => theme };
const info = { InfoAction: 'InfoAction', InfoSheet: 'InfoSheet', SummaryLink: 'SummaryLink' };
function supportHarness(config) {
  const state = hooks();
  const component = load('../src/app/(tabs)/profile.tsx', {
    react: state.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': {}, 'expo-router': {}, '@expo/vector-icons/Ionicons': {}, '@react-native-async-storage/async-storage': {},
    '../../lib/CurrencyProvider': {}, '../../lib/currency': {}, '../../features/profile/CurrencySettings': {}, '../../lib/api': {}, '../../lib/types': {}, '@tanstack/react-query': {}, '../../lib/session': {},
    '../../components/ui': ui, '../../components/Information': info, '../../features/auth': {}, '../../features/reviewer': {}, '../../features/profile/Photo': {}, '../../features/walkthrough/Walkthrough': {}, '../../features/profile/MyCampaigns': {}, '../../features/profile/CreatorStudio': {}, '../../features/profile/ProfileOverview': {}, '../../lib/profile-navigation': {},
  }, 'module.exports.HelpInformation = HelpInformation; module.exports.NotificationPreferences = NotificationPreferences;');
  return { component, render: () => { state.reset(); return nodes(component.HelpInformation({ config })); } };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('Help replaces the nine legacy topic accordions with compact destinations and cancellable local sheets', () => {
  const h = supportHarness();
  const expected = ['How It Works', 'FAQs', 'Help', 'Contact', 'About', 'Partners', 'Terms', 'Privacy', 'Community Guidelines'];
  assert.deepEqual(h.render().filter(node => node.type === 'SummaryLink').map(node => node.props.title), expected);
  assert.equal(h.render().filter(node => node.type === 'Accordion').length, 0);
  assert.equal(h.render().find(node => node.type === 'InfoSheet').props.visible, false);
  const preserved = {
    'How It Works': /reviewer checks.*Funding is followed by distribution preparation/s,
    Help: /Guest drafts save automatically.*Sign in.*upload media or submit/s,
    Contact: /No support mailbox is configured/,
    About: /not direct donations/,
    Partners: /no live advertising distribution partners/,
    Terms: /fees and contribution limits are unavailable.*final contribution review.*refunded proportionally.*Partial funding/s,
    Privacy: /private by default.*receipt capability.*securely.*browser storage/s,
    'Community Guidelines': /relevant sources.*private information.*material changes/s,
  };
  for (const [topic, copy] of Object.entries(preserved)) {
    const link = h.render().find(node => node.type === 'SummaryLink' && node.props.title === topic);
    assert.equal(link.props.compact, true); link.props.onPress();
    const sheet = h.render().find(node => node.type === 'InfoSheet');
    assert.equal(sheet.props.visible, true); assert.equal(sheet.props.title, topic);
    assert.match(nodes(sheet).filter(node => node.type === 'Text').map(node => node.props.children).join('\n'), copy);
    if (topic === 'Terms') {
      const terms = nodes(sheet).filter(node => node.type === 'Text').map(node => node.props.children).join('\n');
      assert.doesNotMatch(terms, /5%|10,000|\$1/);
    }
    sheet.props.onClose(); assert.equal(h.render().find(node => node.type === 'InfoSheet').props.visible, false);
  }
});

test('funding terms retain every actual loaded policy instead of replacing the backend values with mock figures', () => {
  const policies = Object.fromEntries(['purpose', 'fees', 'allocation', 'refunds', 'unspent', 'partialFunding'].map(key => [key, `Actual fixture policy: ${key}`]));
  const h = supportHarness({ policies });
  h.render().find(node => node.type === 'SummaryLink' && node.props.title === 'Terms').props.onPress();
  const text = h.render().filter(node => node.type === 'Text').map(node => node.props.children);
  for (const value of Object.values(policies)) assert.ok(text.includes(value));
  assert.equal(text.some(value => typeof value === 'string' && value.includes('5% included')), false, 'fallback does not override actual configuration');
});

test('FAQs alone retain three short inline expansions with the required financial and estimate qualifications', () => {
  const h = supportHarness();
  h.render().find(node => node.type === 'SummaryLink' && node.props.title === 'FAQs').props.onPress();
  const faqs = h.render().filter(node => node.type === 'Accordion');
  assert.equal(faqs.length, 3); assert.ok(faqs.every(node => node.props.compact));
  const text = faqs.flatMap(nodes).filter(node => node.type === 'Text').map(node => node.props.children).join('\n');
  assert.match(text, /not direct donations/); assert.match(text, /No\. Reach is an estimate/); assert.match(text, /No real money is charged or advertising purchased/);
});

test('notification preferences keep actual Switch keys and explicit updates while using compact rows', async () => {
  const h = supportHarness(), writes = [];
  // A separate load gives this explicit action an isolated API, never a service.
  const source = readFileSync(new URL('../src/app/(tabs)/profile.tsx', import.meta.url), 'utf8');
  const start = source.indexOf('function NotificationPreferences('), end = source.indexOf('\nfunction PrivatePayment', start);
  const output = ts.transpileModule(source.slice(start, end), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', 'useTheme', 'View', 'Switch', 'Text', 'fonts', 'api', output + ';module.exports.render=NotificationPreferences')(
    () => ({ jsx, jsxs: jsx }), module.exports, module, () => theme, 'View', 'Switch', 'Text', {}, async (path, options) => writes.push([path, options]));
  const tree = module.exports.render({ me: { preferences: { categories: { campaigns: false, payments: true } } }, busy: false, run: async fn => fn() });
  const switches = nodes(tree).filter(node => node.type === 'Switch');
  assert.deepEqual(switches.map(node => [node.props.accessibilityLabel, node.props.value]), [['Campaign updates', false], ['Payment updates', true]]);
  assert.equal(writes.length, 0); switches[0].props.onValueChange(true); await settle();
  assert.deepEqual(writes, [['/me/preferences', { method: 'PUT', body: { categories: { campaigns: true } } }]]);
  assert.ok(nodes(tree).filter(node => node.props.style?.minHeight).every(node => node.props.style.minHeight <= 64));
  assert.ok(h.component, 'no app service is loaded');
});

test('Currency keeps both native radio choices and exposes full dated reference details through contextual help', async () => {
  const state = hooks(), writes = [], refreshes = [];
  const currency = { preference: 'USD', ready: true, rate: { date: '2026-10-17', rate: 83.25 }, loading: false, error: '', setPreference: async value => { writes.push(value); currency.preference = value; }, refreshRate: async force => refreshes.push(force) };
  const component = load('../src/features/profile/CurrencySettings.tsx', { react: state.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { Pressable: 'Pressable', View: 'View' }, '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../../components/ui': ui, '../../components/Information': info, '../../lib/CurrencyProvider': { useCurrency: () => currency }, '../../lib/currency': { rateUsable: () => true, rateStale: () => false, formatNativeMoney: () => '₹83.25' } });
  const render = () => { state.reset(); return nodes(component.CurrencySettings()); };
  let all = render(), radios = all.filter(node => node.props.accessibilityRole === 'radio');
  assert.equal(radios.length, 2); assert.deepEqual(radios.map(node => node.props.accessibilityState.checked), [true, false]);
  assert.equal(all.some(node => node.type === 'Accordion'), false);
  assert.equal(all.find(node => node.type === 'InfoAction').props.title, 'Exchange rate details');
  assert.match(all.filter(node => node.type === 'Text').map(node => node.props.children).join(' '), /2026-10-17.*₹83.25.*Not a live payment quote/);
  radios[1].props.onPress(); await settle();
  all = render(); assert.deepEqual(writes, ['INR']);
  assert.deepEqual(all.filter(node => node.props.accessibilityRole === 'radio').map(node => node.props.accessibilityState.checked), [false, true]);
  all.find(node => node.props.title === 'Refresh reference rate').props.onPress(); await settle(); assert.deepEqual(refreshes, [true]);
});

test('Activity has one controlled Following sheet, preserves real records and closes before guarded campaign navigation', () => {
  const state = hooks(), frames = [], routes = [], mutations = [], current = { value: true };
  const previous = globalThis.requestAnimationFrame; globalThis.requestAnimationFrame = fn => { frames.push(fn); return frames.length; };
  try {
    const campaign = { id: 'fixture-followed', title: 'Existing followed message', status: 'Promoting', raised: 37, goal: 100 };
    const pages = [{ value: 'All', title: 'All' }, { value: 'Campaigns', title: 'Updates' }];
    const component = load('../src/app/(tabs)/activity.tsx', {
      react: state.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { Platform: { OS: 'android' }, Pressable: 'Pressable', RefreshControl: 'RefreshControl', ScrollView: 'ScrollView', SectionList: 'SectionList', View: 'View' },
      'expo-router': { router: { push: value => routes.push(value) } }, '@tanstack/react-query': { useQuery: () => ({ data: [campaign] }) }, '../../components/NativePager': { default: 'PagerView' },
      '../../lib/api': { captureApiSession: () => () => current.value }, '../../lib/activity': { activitySections: () => [], notificationAction: () => assert.fail('no notification action') },
      '../../lib/session': { useSession: () => ({ user: { id: 'fixture-owner' } }), useMe: () => ({ data: { followed: ['fixture-followed', 'fixture-unavailable'], campaigns: [] } }), useActivity: () => ({ data: [] }), useRefreshOnFocus() {} },
      '../../features/notifications/NotificationRow': {}, '../../features/notifications/useNotificationActions': { useNotificationActions: () => ({ pendingIds: new Set(), markRead: () => mutations.push('read'), markAllRead: () => mutations.push('readAll') }) },
      '../../features/notifications/useActivityPages': { activityPages: pages, useActivityPages: () => ({ selectedIndex: 0, filter: 'All' }) }, '../../components/ui': ui, '../../components/Information': info,
    });
    const render = () => { state.reset(); return nodes(component.default()); };
    let all = render();
    assert.equal(all.filter(node => node.type === 'InfoSheet').length, 1);
    const lists = all.filter(node => node.type === 'SectionList');
    const footer = nodes(lists[0].props.ListFooterComponent).find(node => node.type === 'SummaryLink');
    assert.equal(footer.props.title, 'Following 2 campaigns'); footer.props.onPress();
    all = render(); let sheet = all.find(node => node.type === 'InfoSheet'); assert.equal(sheet.props.visible, true);
    assert.ok(nodes(sheet).some(node => node.props.children === campaign.title));
    assert.ok(nodes(sheet).some(node => node.props.children === 'A followed campaign is no longer available.'));
    assert.equal(nodes(sheet).find(node => node.type === 'Progress').props.raised, 37);
    nodes(sheet).find(node => node.props.title === 'Read campaign').props.onPress();
    assert.equal(render().find(node => node.type === 'InfoSheet').props.visible, false); assert.deepEqual(routes, []);
    frames.shift()(); assert.deepEqual(routes, ['/explore/fixture-followed']); assert.deepEqual(mutations, []);
    footer.props.onPress(); sheet = render().find(node => node.type === 'InfoSheet');
    nodes(sheet).find(node => node.props.title === 'Read campaign').props.onPress(); current.value = false; frames.shift()(); assert.equal(routes.length, 1, 'a changed session cannot navigate from the old sheet');
  } finally { globalThis.requestAnimationFrame = previous; }
});
