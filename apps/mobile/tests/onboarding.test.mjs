import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/onboarding.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const ONBOARDING_KEY = 'campaign:onboarding:v1';
const APPEARANCE_KEY = 'campaign:appearance:v1';
const settle = () => new Promise(resolve => setImmediate(resolve));

// Execute the actual module with isolated storage/native metadata. These tests
// cover its local decisions, not real sign-in requests or rendered navigation.
function fixture({ saved, entries = {}, os = 'android', installed = 1_000, updated = 1_000, read, write, metadataError } = {}) {
  const values = new Map(Object.entries(entries));
  if (saved !== undefined) values.set(ONBOARDING_KEY, saved);
  const calls = [];
  const storage = {
    getItem: async key => {
      calls.push(['get', key]);
      return read ? read(key, values) : values.get(key) ?? null;
    },
    getAllKeys: async () => { calls.push(['keys']); return [...values.keys()]; },
    setItem: async (key, value) => {
      calls.push(['set', key, value]);
      if (write) await write(key, value);
      values.set(key, value);
    },
  };
  const application = {
    getInstallationTimeAsync: async () => {
      calls.push(['installed']);
      if (metadataError) throw metadataError;
      return new Date(installed);
    },
    getLastUpdateTimeAsync: async () => {
      calls.push(['updated']);
      if (metadataError) throw metadataError;
      return new Date(updated);
    },
  };
  const load = () => {
    const loaded = { exports: {} };
    new Function('require', 'exports', 'module', compiled)(name => {
      if (name === '@react-native-async-storage/async-storage') return { default: storage };
      if (name === 'expo-application') return application;
      if (name === 'react-native') return { Platform: { OS: os } };
      if (name === './appearance') return { APPEARANCE_KEY };
      throw new Error(`Unexpected dependency: ${name}`);
    }, loaded.exports, loaded);
    return loaded.exports;
  };
  return { ...load(), load, values, calls };
}

const gate = (module, overrides = {}) => module.getOnboardingGate({
  ready: true, onboarding: 'welcome', segments: ['(tabs)'], ...overrides,
});

test('fresh local state persists Welcome before ordinary Home may mount', async () => {
  const f = fixture();
  assert.equal(gate(f, { ready: false, onboarding: 'restoring' }), 'loading');
  assert.equal(await f.restoreOnboarding(false, async () => false), 'welcome');
  assert.equal(f.values.get(ONBOARDING_KEY), 'welcome');
  assert.equal(gate(f), 'welcome');
  assert.deepEqual(f.calls.filter(([kind]) => kind === 'set'), [['set', ONBOARDING_KEY, 'welcome']]);
});

test('an explicit incomplete Welcome survives an app update and remembered identity', async () => {
  const f = fixture({ saved: 'welcome', installed: 1_000, updated: 2_000 });
  assert.equal(await f.restoreOnboarding(true, async () => true), 'welcome');
  assert.deepEqual(f.calls, [['get', ONBOARDING_KEY]]);
});

test('completed Welcome restores without consulting or rewriting other preferences', async () => {
  const f = fixture({ saved: 'complete' });
  assert.equal(await f.restoreOnboarding(false, async () => { throw Error('must not run'); }), 'complete');
  assert.deepEqual(f.calls, [['get', ONBOARDING_KEY]]);
  for (const segments of [['(tabs)'], ['(tabs)', 'profile'], ['(tabs)', 'create']]) {
    assert.equal(gate(f, { onboarding: 'complete', segments }), 'content');
  }
});

test('legacy session, draft, saved appearance and configured server evidence migrate independently', async () => {
  for (const evidence of [
    { remembered: true },
    { entries: { 'campaign-creation-v1:guest': 'fixture-draft' } },
    ...['light', 'dark', 'system'].map(appearance => ({ entries: { [APPEARANCE_KEY]: appearance } })),
    { entries: { 'campaign-api-url': 'https://api.example.test' } },
    { legacy: true },
  ]) {
    const f = fixture(evidence);
    assert.equal(await f.restoreOnboarding(!!evidence.remembered, async () => !!evidence.legacy), 'complete');
    assert.equal(f.values.get(ONBOARDING_KEY), 'complete');
  }
});

test('legacy browsing-only Android updates migrate while fresh or invalid metadata does not', async () => {
  assert.equal(await fixture({ updated: 2_000 }).restoreOnboarding(false, async () => false), 'complete');
  for (const metadata of [
    {}, { installed: 0, updated: 2_000 }, { installed: NaN, updated: 2_000 },
    { updated: NaN }, { updated: 500 }, { metadataError: Error('metadata unavailable') },
    { os: 'web', updated: 2_000 },
  ]) {
    assert.equal(await fixture(metadata).restoreOnboarding(false, async () => false), 'welcome');
  }
});

test('corrupt marker and unrelated records never become completion evidence or get cleared', async () => {
  for (const saved of ['', 'true', '{"complete":true}', 'restoring', '__proto__']) {
    const entries = {
      'campaign-creation-v1:guest': 'retained draft',
      'selected-contribution': 'retained payment',
      'campaign:walkthrough:v1': 'retained tour',
      [APPEARANCE_KEY]: 'light',
    };
    const f = fixture({ saved, entries, updated: 2_000 });
    assert.equal(await f.restoreOnboarding(true, async () => true), 'welcome');
    assert.deepEqual(Object.fromEntries([...f.values].filter(([key]) => key !== ONBOARDING_KEY)), entries);
    assert.deepEqual(f.calls, [['get', ONBOARDING_KEY], ['set', ONBOARDING_KEY, 'welcome']]);
  }
});

test('explicit shared Welcome completion survives restart without changing account-scoped records', async () => {
  const entries = {
    'campaign-creation-v1:guest': 'guest draft',
    'campaign-creation-v1:fixture-account': 'account draft',
    'campaign:walkthrough:v1': 'independent tour preference',
  };
  // An explicit welcome marker takes priority over migration evidence.
  const f = fixture({ saved: 'welcome', entries });
  await f.restoreOnboarding(false, async () => false);
  assert.equal(f.values.get(ONBOARDING_KEY), 'welcome');
  // Guest choice and successful auth share this local completion operation;
  // their UI/API wiring is outside this isolated module test.
  await f.persistOnboardingComplete();
  assert.equal(await f.load().restoreOnboarding(false, async () => false), 'complete');
  assert.deepEqual(Object.fromEntries([...f.values].filter(([key]) => key !== ONBOARDING_KEY)), entries);
});

test('a slow restoration cannot overwrite a later explicit completion', async () => {
  let release;
  const f = fixture({ read: (key, values) => key === ONBOARDING_KEY && !values.has(key)
    ? new Promise(resolve => { release = resolve; }) : values.get(key) ?? null });
  const restoring = f.restoreOnboarding(false, async () => false);
  await settle();
  const complete = f.persistOnboardingComplete();
  release(null);
  assert.equal(await restoring, 'welcome');
  await complete;
  assert.equal(f.values.get(ONBOARDING_KEY), 'complete');
  assert.deepEqual(f.calls.filter(([kind]) => kind === 'set'), [
    ['set', ONBOARDING_KEY, 'welcome'], ['set', ONBOARDING_KEY, 'complete'],
  ]);
});

test('read failure rejects restoration and permits a real retry without false completion', async () => {
  let fail = true;
  const f = fixture({ read: (key, values) => {
    if (fail) throw Error('read failed');
    return values.get(key) ?? null;
  } });
  await assert.rejects(f.restoreOnboarding(false, async () => false), /read failed/);
  assert.equal(f.values.has(ONBOARDING_KEY), false);
  fail = false;
  assert.equal(await f.restoreOnboarding(false, async () => false), 'welcome');
});

test('failed completion is not stored as successful and the serialized writer recovers', async () => {
  let fail = true;
  const f = fixture({ saved: 'welcome', write: async () => { if (fail) throw Error('storage full'); } });
  await assert.rejects(f.persistOnboardingComplete(), /storage full/);
  assert.equal(f.values.get(ONBOARDING_KEY), 'welcome');
  assert.equal(await f.restoreOnboarding(false, async () => false), 'welcome');
  fail = false;
  await f.persistOnboardingComplete();
  assert.equal(await f.load().restoreOnboarding(false, async () => false), 'complete');
});

test('startup gate waits for local hydration and presents a retry for a failed restore', () => {
  const f = fixture();
  assert.equal(gate(f, { ready: false }), 'loading');
  assert.equal(gate(f, { onboarding: 'restoring' }), 'loading');
  assert.equal(gate(f, { onboarding: 'restoring', onboardingError: 'read failed' }), 'retry');
  assert.equal(gate(f, { ready: false, onboardingError: 'read failed' }), 'loading');
});

test('fresh entry retains Welcome/Auth while legitimate campaign links and pending tasks retain their destination', () => {
  const f = fixture();
  assert.equal(gate(f, { segments: ['(tabs)', 'profile'] }), 'content');
  for (const segments of [
    ['(tabs)', 'explore', '[id]'], ['(tabs)', 'explore', '[id]', 'back'],
    ['(tabs)', 'explore', '[id]', 'report'],
  ]) assert.equal(gate(f, { segments }), 'content');
  for (const segments of [['(tabs)'], ['(tabs)', 'explore'], ['(tabs)', 'create']]) {
    assert.equal(gate(f, { segments }), 'welcome');
    assert.equal(gate(f, { segments, hasPendingDestination: true }), 'content');
  }
  assert.equal(f.calls.length, 0, 'routing decisions never mutate Welcome, drafts, payments or tour state');
});

test('a linked entry keeps public tabs reachable for one mount without completing Welcome', () => {
  const f = fixture({ saved: 'welcome' });
  const entry = f.createOnboardingEntryGate();
  const input = { ready: true, onboarding: 'welcome', segments: ['(tabs)', 'explore', '[id]'] };
  assert.equal(entry(input), 'content');
  for (const segments of [['(tabs)', 'explore'], ['(tabs)'], ['(tabs)', 'create'], ['(tabs)', 'activity']])
    assert.equal(entry({ ...input, segments }), 'content');
  assert.equal(f.values.get(ONBOARDING_KEY), 'welcome');
  assert.equal(f.calls.length, 0);
  assert.equal(f.createOnboardingEntryGate()({ ...input, segments: ['(tabs)'] }), 'welcome', 'a new ordinary launch still follows Welcome');
});

test('pending-task admission waits for hydration and visiting Profile alone does not bypass Welcome', () => {
  const f = fixture();
  const entry = f.createOnboardingEntryGate();
  const input = { ready: false, onboarding: 'welcome', segments: ['(tabs)', 'create'], hasPendingDestination: true };
  assert.equal(entry(input), 'loading');
  assert.equal(entry({ ...input, ready: true, segments: ['(tabs)'], hasPendingDestination: false }), 'welcome');
  assert.equal(entry({ ...input, ready: true }), 'content');
  assert.equal(entry({ ...input, ready: true, segments: ['(tabs)'], hasPendingDestination: false }), 'content');
  const ordinary = f.createOnboardingEntryGate();
  assert.equal(ordinary({ ready: true, onboarding: 'welcome', segments: ['(tabs)', 'profile'] }), 'content');
  assert.equal(ordinary({ ready: true, onboarding: 'welcome', segments: ['(tabs)'] }), 'welcome');
});
