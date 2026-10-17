import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
function load(path, modules, append = '') {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', '__DEV__', `${source}\n${append}`)(
    name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; },
    loaded.exports, loaded, false,
  );
  return loaded.exports;
}
const onboarding = load('../src/lib/onboarding.ts', {
  '@react-native-async-storage/async-storage': {}, 'expo-application': {},
  'react-native': { Platform: { OS: 'web' } }, './appearance': { APPEARANCE_KEY: 'campaign:appearance:v1' },
});
const jsx = (type, props) => ({ type, props: props || {} });
const jsxRuntime = { jsx, jsxs: jsx };
const theme = {
  colors: new Proxy({}, { get: () => '#121212' }), styles: new Proxy({}, { get: () => ({}) }),
  scheme: 'dark', preference: 'dark', ready: true, appearanceError: '',
};
const settle = () => new Promise(resolve => setImmediate(resolve));
function hooks() {
  const states = []; let cursor = 0;
  return {
    reset: () => { cursor = 0; },
    react: {
      useCallback: callback => callback, useEffect: () => undefined,
      useState: initial => {
        const index = cursor++;
        if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
        return [states[index], next => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
      },
    },
  };
}
function descendants(tree) {
  if (Array.isArray(tree)) return tree.flatMap(descendants);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...descendants(tree.props?.children)];
}

test('the real tab layout exposes all five destinations after a fresh campaign link and keeps ordinary Welcome gated', () => {
  function mounted() {
    const state = hooks();
    let segments = ['(tabs)', 'explore', '[id]'], params = { id: 'fixture-campaign' };
    const session = { user: null, ready: true, onboarding: 'welcome', onboardingError: '' };
    const component = load('../src/app/(tabs)/_layout.tsx', {
      react: state.react, 'react/jsx-runtime': jsxRuntime, 'react-native': { View: 'View' },
      'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 24 }) },
      'expo-router': { Redirect: 'Redirect', Tabs: Object.assign('Tabs', { Screen: 'TabScreen' }), useSegments: () => segments, useGlobalSearchParams: () => params },
      '@expo/vector-icons/Ionicons': { default: 'Icon' },
      '../../components/ui': { useTheme: () => theme, fonts: { semibold: 'Manrope' } },
      '../../lib/session': { useActivity: () => ({ data: [] }), useSession: () => session },
      '../../components/UnreadBadge': { UnreadBadge: 'UnreadBadge' },
      '../../lib/onboarding': onboarding,
      '../../features/walkthrough/Walkthrough': { WalkthroughProvider: 'WalkthroughProvider', WalkthroughTabButton: 'WalkthroughTabButton' },
    }, 'module.exports.TestTabNavigation = TabNavigation;');
    return { render: next => { if (next) { segments = next; params = {}; } state.reset(); return component.TestTabNavigation(); } };
  }
  const entry = mounted();
  let tree = entry.render();
  const tabs = descendants(tree).filter(node => node.props.name);
  assert.deepEqual(tabs.map(node => node.props.name), ['index', 'explore', 'create', 'activity', 'profile']);
  for (const name of ['index', 'explore', 'create', 'activity']) {
    assert.equal(tree.props.screenOptions({ route: { name } }).tabBarStyle.display, 'flex');
    tree = entry.render(['(tabs)', name]);
    assert.notEqual(tree.type, 'Redirect', `linked guest can subsequently use ${name}`);
  }
  assert.equal(tree.props.screenOptions({ route: { name: 'profile' } }).tabBarStyle.display, 'none', 'guest Auth remains dedicated');
  const ordinary = mounted().render(['(tabs)']);
  assert.equal(ordinary.type, 'Redirect');
  assert.equal(ordinary.props.href, '/profile');
});

function profileHarness({ user = { id: 'fixture-owner', name: 'Fixture Owner', email: 'owner@example.test', role: 'member' }, onboardingState = 'welcome', error = '', complete }) {
  const state = hooks(), navigation = [];
  const session = { user, ready: true, onboarding: onboardingState, onboardingError: error, completeOnboarding: complete };
  const ui = Object.fromEntries(['Accordion', 'Button', 'Empty', 'ErrorState', 'Field', 'IconButton', 'Loading', 'Notice', 'Pill', 'Picture', 'Progress', 'Screen', 'Text'].map(name => [name, name]));
  const component = load('../src/app/(tabs)/profile.tsx', {
    react: state.react, 'react/jsx-runtime': jsxRuntime,
    'react-native': { View: 'View', Pressable: 'Pressable', ScrollView: 'ScrollView', Switch: 'Switch' },
    'expo-router': { router: { replace: value => navigation.push(value) }, useFocusEffect: () => undefined, useLocalSearchParams: () => ({}) },
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, '@react-native-async-storage/async-storage': {},
    '../../lib/api': { getApiUrl: () => 'https://api.example.test', isCloudBuild: true },
    '../../lib/types': { number: String }, '@tanstack/react-query': {},
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: String, description: 'USD accounting' }) },
    '../../lib/currency': { formatNativeMoney: String },
    '../../features/profile/CurrencySettings': { CurrencySettings: 'CurrencySettings' },
    '../../lib/session': { useSession: () => session, useMe: () => ({ data: { user, payments: [], campaigns: [], saved: [] } }), useCampaigns: () => ({}), useConfig: () => ({}) },
    '../../components/ui': { ...ui, fonts: {}, useTheme: () => theme },
    '../../features/auth': { AuthForm: 'AuthForm' }, '../../features/reviewer': { Reviewer: 'Reviewer' },
    '../../features/profile/Photo': { ProfilePhoto: 'ProfilePhoto', ProfilePhotoEditor: 'ProfilePhotoEditor' },
    '../../features/walkthrough/Walkthrough': { useWalkthrough: () => ({}) },
  });
  const render = () => { state.reset(); return descendants(component.default()); };
  return { render, navigation, session, button: () => render().find(node => node.props.title === 'Continue to Campaign') };
}

test('guest auth stays free of Settings controls while Help preserves device Settings without changing Welcome', () => {
  const h = profileHarness({ user: null, onboardingState: 'completed', complete: async () => assert.fail('Settings must not complete Welcome') });
  const before = JSON.stringify(h.session);
  const entry = h.render();
  assert.equal(entry.some(node => node.props.title === 'Settings'), false, 'Welcome and every AuthForm mode have no separate Settings footer');
  assert.equal(entry.find(node => node.type === 'AuthForm').props.active, true);
  entry.find(node => node.type === 'AuthForm').props.onHelp();
  const help = h.render();
  assert.equal(help.find(node => node.type === 'AuthForm').props.active, false);
  help.find(node => node.props.title === 'Settings').props.onPress();
  const tree = h.render();
  assert.ok(tree.some(node => node.type === 'CurrencySettings'));
  assert.equal(tree.find(node => node.type === 'AuthForm').props.active, false);
  tree.find(node => node.props.label === 'Back to Profile').props.onPress();
  assert.equal(h.render().find(node => node.type === 'AuthForm').props.active, true);
  assert.equal(h.render().some(node => node.props.title === 'Settings'), false);
  assert.deepEqual(h.navigation, []); assert.equal(JSON.stringify(h.session), before);
});

test('the actual signed-in Profile recovery waits for saved Welcome completion before navigating', async () => {
  let finish, calls = 0;
  const h = profileHarness({ complete: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
  assert.ok(h.button(), 'saved welcome remains recoverable after restart even without a transient error');
  h.button().props.onPress(); await settle();
  assert.equal(calls, 1); assert.deepEqual(h.navigation, []);
  finish(); await settle();
  assert.deepEqual(h.navigation, ['/']);
  assert.equal(h.session.user.id, 'fixture-owner');
});

test('Profile recovery shows storage errors without navigation and is absent from ordinary completed or guest profiles', async () => {
  const h = profileHarness({ complete: async () => { throw Error('Welcome storage is full.'); } });
  h.button().props.onPress(); await settle();
  assert.deepEqual(h.navigation, []);
  assert.ok(h.render().some(node => node.type === 'Notice' && node.props.children === 'Welcome storage is full.'));
  assert.equal(profileHarness({ onboardingState: 'complete' }).button(), undefined);
  assert.equal(profileHarness({ user: null }).button(), undefined);
  assert.ok(profileHarness({ onboardingState: 'complete', error: 'Preference was not saved.' }).button());
});
