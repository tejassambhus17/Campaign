import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props, key) => ({ type, props: props || {}, key });
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}

// Execute Home's own hooks and native-event closures. This measures redundant
// selection work/prop identity, not Android frame timing or native memo behavior.
function harness() {
  const states = [], refs = [], memos = [];
  let stateIndex = 0, refIndex = 0, memoIndex = 0, selections = 0, tree;
  const campaign = { id: 'fictional', title: 'A fictional public message', category: 'Environment' };
  const data = [campaign];
  const react = {
    useState: initial => {
      const index = stateIndex++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], next => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
    },
    useRef: initial => {
      const index = refIndex++;
      return refs[index] ||= { current: initial };
    },
    useMemo: (factory, dependencies) => {
      const index = memoIndex++, previous = memos[index];
      if (!previous || dependencies.some((dependency, i) => !Object.is(dependency, previous.dependencies[i])))
        memos[index] = { dependencies, value: factory() };
      return memos[index].value;
    },
    useEffect: () => {}, useCallback: callback => callback,
  };
  const colors = new Proxy({}, { get: () => '#121212' });
  const modules = {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    'react-native': { AccessibilityInfo: {}, findNodeHandle: () => null, Keyboard: { dismiss: () => {} }, Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', View: 'View', useWindowDimensions: () => ({ width: 393, fontScale: 1 }) },
    'expo-router': { router: { push: () => {} }, useFocusEffect: () => {}, useLocalSearchParams: () => ({}) },
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: value => `$${value}` }) },
    '../../components/ui': { Text: 'Text', Button: 'Button', Empty: 'Empty', ErrorState: 'ErrorState', Loading: 'Loading', Notice: 'Notice', Screen: 'Screen', fonts: {}, useTheme: () => ({ colors, styles: {}, scheme: 'dark' }) },
    '../../lib/session': { useActivity: () => ({}), useCampaigns: () => ({ data }), useConfig: () => ({}), useSession: () => ({ user: null, ready: true, completeOnboarding: () => {} }) },
    '../../lib/types': { categories: ['Environment', 'Health', 'Education'], estimate: () => 1, number: String },
    '../../features/home/HomeDiscoveryCard': { HomeDiscoveryCard: 'HomeDiscoveryCard' },
    '../../features/home/model': { selectHomeCampaigns: (_data, filters) => { selections++; return { featured: { ...campaign }, discover: [], total: filters.search === 'missing' ? 0 : 1 }; } },
    '../../features/explore/FilterOverlay': { FilterOverlay: 'FilterOverlay' },
    '../../features/creation/model': { STEPS: ['Basics'] },
    '../../features/creation/useDraftLibrary': { useDraftLibrary: () => ({ entries: [] }) },
    '../../features/notifications/NotificationSheet': { NotificationSheet: 'NotificationSheet' },
    '../../lib/api': { captureApiSession: () => () => true },
    '../../components/UnreadBadge': { UnreadBadge: 'UnreadBadge' },
    '../../features/home/SpotlightCard': { SpotlightCard: 'SpotlightCard' },
    '../../features/walkthrough/Walkthrough': { useWalkthrough: () => ({ setHome: () => {} }), useWalkthroughTarget: () => null, WalkthroughInvitation: 'WalkthroughInvitation' },
  };
  const code = ts.transpileModule(readFileSync(new URL('../src/app/(tabs)/index.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', 'requestAnimationFrame', code)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name];
  }, loaded.exports, loaded, callback => { callback(); return 1; });
  const render = () => { stateIndex = 0; refIndex = 0; memoIndex = 0; tree = loaded.exports.default(); return nodes(tree); };
  return { render, selections: () => selections, nodes: () => nodes(tree) };
}

test('Home retains selected card identity through drag/tour and filter overlay-only state; real filters recompute', () => {
  const h = harness(); h.render();
  const featured = () => h.nodes().find(node => node.type === 'SpotlightCard').props.campaign;
  const original = featured();
  const scroll = () => h.nodes().find(node => node.type === 'ScrollView' && node.props.onScrollBeginDrag);
  scroll().props.onScrollBeginDrag(); h.render();
  scroll().props.onMomentumScrollBegin(); h.render();
  scroll().props.onScrollEndDrag(); h.render();
  scroll().props.onMomentumScrollEnd(); h.render();
  assert.equal(h.selections(), 1, 'native gesture edge state does not refilter the whole feed');
  assert.equal(featured(), original, 'memoized expensive cards keep stable campaign props');
  h.nodes().find(node => node.props.accessibilityLabel === 'Home campaign filters and sort').props.onPress(); h.render();
  const overlay = () => h.nodes().find(node => node.type === 'FilterOverlay');
  overlay().props.onChange({ sort: 'Newest', funding: true }); h.render();
  overlay().props.onClose(); h.render();
  assert.equal(h.selections(), 1, 'staged or dismissed filters do not change mounted campaign props');
  h.nodes().find(node => node.type === 'TextInput').props.onChangeText('ocean'); h.render();
  assert.equal(h.selections(), 2, 'search edits still update discovery immediately');
  h.nodes().find(node => node.props.accessibilityLabel === 'Health campaigns').props.onPress(); h.render();
  assert.equal(h.selections(), 3, 'topic changes still update discovery immediately');
});
