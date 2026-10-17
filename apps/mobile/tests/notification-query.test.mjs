import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const query = require('@tanstack/react-query');
function compiled(path) {
  return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
}
const activity = { exports: {} };
new Function('exports', 'module', compiled('../src/lib/activity.ts'))(activity.exports, activity);
const sessionStorage = { exports: {} };
new Function('exports', 'module', compiled('../src/lib/session-storage.ts'))(sessionStorage.exports, sessionStorage);

// Exercise the actual useActivity query functions. React's hook boundary is a
// small deterministic adapter; private transport and the real QueryClient are
// preserved rather than replacing their cache behavior with hand-written maps.
function harness() {
  let session = { user: { id: 'one' }, ready: true };
  let options, epoch = 0, requests = 0;
  let response = async () => [];
  const loaded = { exports: {} };
  const request = async () => { requests += 1; return response(); };
  const values = new Map();
  const deviceStorage = {
    getItem: async key => values.get(key) ?? null,
    getAllKeys: async () => [...values.keys()],
    setItem: async (key, value) => { values.set(key, value); },
    removeItem: async key => { values.delete(key); },
  };
  const onboardingDependencies = {
    '@react-native-async-storage/async-storage': { default: deviceStorage },
    'expo-application': {
      getInstallationTimeAsync: async () => new Date(1_000),
      getLastUpdateTimeAsync: async () => new Date(1_000),
    },
    'react-native': { Platform: { OS: 'web' } },
    './appearance': { APPEARANCE_KEY: 'campaign:appearance:v1' },
  };
  const onboarding = { exports: {} };
  new Function('require', 'exports', 'module', compiled('../src/lib/onboarding.ts'))(
    name => { assert.ok(name in onboardingDependencies, name); return onboardingDependencies[name]; }, onboarding.exports, onboarding,
  );
  const modules = {
    react: { createContext: () => ({}), useContext: () => session, useCallback: callback => callback },
    'react/jsx-runtime': {},
    'expo-router': {},
    'react-native': { Platform: { OS: 'web' } },
    '@react-native-async-storage/async-storage': { default: deviceStorage },
    'expo-secure-store': {},
    '@tanstack/react-query': { ...query, useQuery: next => { options = next; return { data: loaded.exports.queryClient.getQueryData(next.queryKey) }; } },
    './api': { api: request, captureApiSession: () => { const start = epoch; return () => start === epoch; } },
    './activity': activity.exports,
    './session-storage': sessionStorage.exports,
    './onboarding': onboarding.exports,
  };
  new Function('require', 'exports', 'module', compiled('../src/lib/session.tsx'))(
    name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, loaded.exports, loaded,
  );
  return {
    client: loaded.exports.queryClient,
    render: () => { const result = loaded.exports.useActivity(); return { result, options }; },
    setSession: value => { session = value; epoch += 1; },
    respond: handler => { response = handler; },
    requests: () => requests,
  };
}

test('the actual activity query makes zero guest requests, redacts cached data and rejects an old signed-in refresh callback', async t => {
  const h = harness(); t.after(() => h.client.clear());
  const signedIn = h.render();
  assert.deepEqual(signedIn.options.queryKey, ['activity', 'one']);
  h.setSession({ user: null, ready: true });
  h.client.setQueryData(['activity', undefined], [{ id: 'must-not-show' }]);
  const guest = h.render();
  assert.equal(guest.options.enabled, false);
  assert.equal(guest.result.data, undefined);
  assert.deepEqual(await guest.options.queryFn(), []);
  await assert.rejects(signedIn.options.queryFn(), error => query.isCancelledError(error));
  assert.equal(h.requests(), 0);
});

test('the actual activity query discards a completed old-session response and guards before readiness', async t => {
  const h = harness(); t.after(() => h.client.clear());
  let finish;
  h.respond(() => new Promise(resolve => { finish = resolve; }));
  const signedIn = h.render();
  const pending = signedIn.options.queryFn();
  h.setSession({ user: { id: 'other' }, ready: true });
  finish([{ id: 'old-private' }]);
  await assert.rejects(pending, error => query.isCancelledError(error));
  assert.equal(h.requests(), 1);
  h.setSession({ user: { id: 'other' }, ready: false });
  const loading = h.render();
  assert.equal(loading.options.enabled, false);
  assert.deepEqual(await loading.options.queryFn(), []);
  assert.equal(h.requests(), 1);
});

test('the actual activity query merges a concurrent read success with an older GET and sorts current data', async t => {
  const h = harness(); t.after(() => h.client.clear());
  let finish;
  h.respond(() => new Promise(resolve => { finish = resolve; }));
  const signedIn = h.render();
  const pending = signedIn.options.queryFn();
  h.client.setQueryData(['activity', 'one'], [{ id: 'just-read', read: true }]);
  finish([
    { id: 'just-read', createdAt: '2026-10-15T12:00:00Z', read: false },
    { id: 'new-event', createdAt: '2026-10-16T12:00:00Z', read: false },
  ]);
  assert.deepEqual(await pending, [
    { id: 'new-event', createdAt: '2026-10-16T12:00:00Z', read: false },
    { id: 'just-read', createdAt: '2026-10-15T12:00:00Z', read: true },
  ]);
});
