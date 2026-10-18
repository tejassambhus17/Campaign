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
const profileNavigation = load('../src/lib/profile-navigation.ts', {});
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
      useRef: initial => {
        const index = cursor++;
        if (!(index in states)) states[index] = { current: initial };
        return states[index];
      },
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
      '../../lib/profile-navigation': profileNavigation,
      '../../features/walkthrough/Walkthrough': { WalkthroughProvider: 'WalkthroughProvider', WalkthroughTabButton: 'WalkthroughTabButton' },
    }, 'module.exports.TestTabNavigation = TabNavigation;');
    return {
      complete: () => { session.onboarding = 'complete'; },
      auth: value => { params = { auth: value }; },
      render: next => { if (next) { segments = next; params = {}; } state.reset(); return component.TestTabNavigation(); },
    };
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
  entry.complete(); tree = entry.render(['(tabs)', 'profile']);
  assert.equal(tree.props.screenOptions({ route: { name: 'profile' } }).tabBarStyle.display, 'flex', 'completed guest has a normal Profile tab');
  entry.auth('login'); tree = entry.render();
  assert.equal(tree.props.screenOptions({ route: { name: 'profile' } }).tabBarStyle.display, 'none', 'only explicit authentication hides tabs');
  const ordinary = mounted().render(['(tabs)']);
  assert.equal(ordinary.type, 'Redirect');
  assert.equal(ordinary.props.href, '/profile');
});

function profileHarness({ user = { id: 'fixture-owner', name: 'Fixture Owner', email: 'owner@example.test', role: 'member' }, onboardingState = 'welcome', error = '', complete, params = {}, logout } = {}) {
  const state = hooks(), navigation = [];
  const session = { user, ready: true, onboarding: onboardingState, onboardingError: error, completeOnboarding: complete, logout: async () => { if (logout) await logout(); session.user = null; } };
  const ui = Object.fromEntries(['Accordion', 'Button', 'Empty', 'ErrorState', 'Field', 'IconButton', 'Loading', 'Notice', 'Pill', 'Picture', 'Progress', 'Screen', 'Text'].map(name => [name, name]));
  const component = load('../src/app/(tabs)/profile.tsx', {
    react: state.react, 'react/jsx-runtime': jsxRuntime,
    'react-native': { View: 'View', Pressable: 'Pressable', ScrollView: 'ScrollView', Switch: 'Switch' },
    'expo-router': { router: { replace: value => navigation.push(value), push: value => navigation.push(value), setParams: next => { for (const [key, value] of Object.entries(next)) { if (value === undefined) delete params[key]; else params[key] = value; } } }, useFocusEffect: () => undefined, useLocalSearchParams: () => params },
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, '@react-native-async-storage/async-storage': {},
    '../../lib/api': { getApiUrl: () => 'https://api.example.test', isCloudBuild: true },
    '../../lib/types': { number: String }, '@tanstack/react-query': {},
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: String, description: 'USD accounting' }) },
    '../../lib/currency': { formatNativeMoney: String },
    '../../features/profile/CurrencySettings': { CurrencySettings: 'CurrencySettings' },
    '../../features/profile/MyCampaigns': { MyCampaigns: 'MyCampaigns' },
    '../../lib/profile-navigation': profileNavigation,
    '../../lib/session': { useSession: () => session, useMe: () => ({ data: { user: session.user, payments: [], campaigns: [], saved: [] }, refetch: async () => undefined }), useCampaigns: () => ({}), useConfig: () => ({}), refresh: async () => assert.fail('sign-out must not run a stale profile refresh') },
    '../../components/ui': { ...ui, fonts: {}, useTheme: () => theme },
    '../../features/auth': { AuthForm: 'AuthForm' }, '../../features/reviewer': { Reviewer: 'Reviewer' },
    '../../features/profile/Photo': { ProfilePhoto: 'ProfilePhoto', ProfilePhotoEditor: 'ProfilePhotoEditor' },
    '../../features/walkthrough/Walkthrough': { useWalkthrough: () => ({}) },
  });
  const render = () => { state.reset(); return descendants(component.default()); };
  return { render, navigation, session, params, button: () => render().find(node => node.props.title === 'Continue to Campaign') };
}

test('returning guest Profile offers explicit sign-in, device preferences and no Welcome or Settings screen', () => {
  const h = profileHarness({ user: null, onboardingState: 'complete', complete: async () => assert.fail('Profile must not change Welcome') });
  const before = JSON.stringify(h.session);
  const entry = h.render();
  assert.ok(entry.some(node => node.props.children === 'Guest profile'));
  assert.equal(entry.some(node => node.type === 'AuthForm'), false);
  entry.find(node => node.props.title === 'Currency').props.onPress();
  assert.ok(h.render().some(node => node.type === 'CurrencySettings'));
  h.render().find(node => node.props.label === 'Back to Profile').props.onPress();
  assert.equal(h.render().some(node => node.props.title === 'Settings'), false);
  assert.deepEqual(h.navigation, []); assert.equal(JSON.stringify(h.session), before);
  h.render().find(node => node.props.title === 'Sign in').props.onPress();
  assert.equal(h.params.auth, 'login');
  assert.equal(h.render().find(node => node.type === 'AuthForm').props.initialMode, 'login');
  h.render().find(node => node.type === 'AuthForm').props.onExit();
  assert.equal(h.render().some(node => node.type === 'AuthForm'), false);
});

test('fresh Welcome remains dedicated and nested Help preferences return to their actual parent', () => {
  const h = profileHarness({ user: null });
  assert.equal(h.render().find(node => node.type === 'AuthForm').props.initialMode, 'welcome');
  assert.equal(h.render().some(node => node.props.title === 'Settings'), false);
  h.render().find(node => node.type === 'AuthForm').props.onHelp();
  h.render().find(node => node.props.title === 'Currency').props.onPress();
  h.render().find(node => node.props.label === 'Back to Help & Support').props.onPress();
  assert.equal(h.render().some(node => node.type === 'CurrencySettings'), false);
  assert.equal(h.render().find(node => node.type === 'AuthForm').props.active, false);
  h.render().find(node => node.props.label === 'Back to Profile').props.onPress();
  assert.equal(h.render().find(node => node.type === 'AuthForm').props.active, true);
});

test('Profile has one Notifications destination, direct Appearance/Currency and sign-out after all rows', async () => {
  const h = profileHarness({ onboardingState: 'complete' });
  let nodes = h.render();
  assert.equal(nodes.filter(node => node.props.title === 'Notifications').length, 1);
  assert.equal(nodes.some(node => node.props.title === 'Settings' || node.props.accessibilityLabel?.startsWith('Appearance settings,')), false);
  assert.ok(nodes.findIndex(node => node.props.title === 'Sign out') > nodes.findIndex(node => node.props.title === 'Help & Support'));
  nodes.find(node => node.props.title === 'Appearance').props.onPress();
  h.render().find(node => node.props.label === 'Back to Profile').props.onPress();
  nodes = h.render(); nodes.find(node => node.props.title === 'Sign out').props.onPress(); await settle();
  assert.equal(h.session.user, null);
  nodes = h.render();
  assert.ok(nodes.some(node => node.props.children === 'Guest profile'));
  assert.equal(nodes.some(node => node.type === 'AuthForm' || node.type === 'Notice'), false, 'logout leaves no auth screen or success strip');
});

test('profile entry distinguishes completed guests and explicit/private authentication without resetting Welcome', () => {
  const entry = profileNavigation.profileEntry;
  assert.equal(entry({ signedIn: false, onboarding: 'complete' }), 'profile');
  assert.equal(entry({ signedIn: false, onboarding: 'welcome' }), 'welcome');
  assert.equal(entry({ signedIn: false, onboarding: 'complete', auth: 'register' }), 'register');
  assert.equal(entry({ signedIn: false, onboarding: 'complete', section: 'Payments' }), 'login');
  assert.equal(entry({ signedIn: false, onboarding: 'complete', section: 'Currency' }), 'profile');
  assert.equal(entry({ signedIn: true, onboarding: 'complete', auth: 'login' }), 'profile');
  assert.equal(profileNavigation.profileSection('Settings'), 'Overview');
  assert.equal(profileNavigation.profileSection('unknown'), null);
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
