import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/appearance.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
new Function('module', 'exports', compiled)(module, module.exports);
const { APPEARANCE_KEY, createAppearanceStore, normalizeAppearance, resolveAppearance, lightColors, darkColors } = module.exports;

function fixture({ saved = null, os = 'light', read, write } = {}) {
  const values = new Map(saved == null ? [] : [[APPEARANCE_KEY, saved]]);
  const calls = [];
  const events = new Set();
  let override = 'system';
  const system = {
    getColorScheme: () => override === 'system' ? os : override,
    setOverride: (value) => { override = value; events.forEach((fn) => fn()); },
    subscribe: (fn) => { events.add(fn); return () => events.delete(fn); },
  };
  const storage = {
    getItem: async (key) => { calls.push(['get', key]); return read ? read(key) : values.get(key) ?? null; },
    setItem: async (key, value) => { calls.push(['set', key, value]); if (write) await write(key, value); values.set(key, value); },
  };
  const create = () => createAppearanceStore(storage, system);
  return { create, values, calls, setOS: (value) => { os = value; events.forEach((fn) => fn()); } };
}

test('missing and invalid saved values default to Dark even on a Light device', async () => {
  for (const saved of [null, '', 'unexpected', '{"theme":"dark"}', '__proto__']) {
    const f = fixture({ saved, os: 'light' });
    const store = f.create();
    assert.equal(store.getSnapshot().ready, false);
    await store.restore();
    assert.deepEqual(store.getSnapshot(), { preference: 'dark', scheme: 'dark', ready: true, appearanceError: '' });
  }
  for (const value of [undefined, {}, [], 0, false]) assert.equal(normalizeAppearance(value), 'dark');
  assert.equal(resolveAppearance('system', null), 'light');
});

test('System follows live OS changes; unsubscribe stops receiving OS events', async () => {
  const f = fixture({ saved: 'system' }); const store = f.create(); const stop = store.start(); await store.restore();
  f.setOS('dark'); assert.equal(store.getSnapshot().scheme, 'dark');
  f.setOS('light'); assert.equal(store.getSnapshot().scheme, 'light');
  stop(); f.setOS('dark'); assert.equal(store.getSnapshot().scheme, 'light');
});

test('existing explicit Light, Dark and System choices survive the new Dark default', async () => {
  for (const preference of ['light', 'dark', 'system']) {
    const f = fixture({ saved: preference, os: 'light' }); const store = f.create();
    await store.restore();
    assert.equal(store.getSnapshot().preference, preference);
    assert.equal(store.getSnapshot().scheme, preference === 'dark' ? 'dark' : 'light');
    assert.equal(f.calls.filter(([operation]) => operation === 'set').length, 0);
  }
});

test('explicit Light and Dark override the OS; returning to System reads the current OS immediately', async () => {
  const f = fixture({ os: 'dark' }); const store = f.create(); const stop = store.start(); await store.restore();
  await store.setPreference('light'); f.setOS('dark'); assert.equal(store.getSnapshot().scheme, 'light');
  await store.setPreference('dark'); f.setOS('light'); assert.equal(store.getSnapshot().scheme, 'dark');
  await store.setPreference('system'); assert.equal(store.getSnapshot().scheme, 'light');
  f.setOS('dark'); assert.equal(store.getSnapshot().scheme, 'dark'); stop();
});

test('the selected device preference restores in a new store after a cold start', async () => {
  const f = fixture(); const first = f.create(); await first.restore(); await first.setPreference('dark');
  const restarted = f.create(); await restarted.restore();
  assert.equal(restarted.getSnapshot().preference, 'dark'); assert.equal(restarted.getSnapshot().scheme, 'dark');
  assert.equal(f.values.get(APPEARANCE_KEY), 'dark');
});

test('slow restoration cannot overwrite a newer user choice', async () => {
  let finish; const f = fixture({ read: () => new Promise((resolve) => { finish = resolve; }) });
  const store = f.create(); const pending = store.restore(); await store.setPreference('dark');
  finish('light'); await pending; assert.equal(store.getSnapshot().preference, 'dark');
});

test('rapid preference writes are serialized and the final choice survives restart', async () => {
  const finishes = []; const f = fixture({ write: () => new Promise((resolve) => finishes.push(resolve)) });
  const store = f.create(); await store.restore();
  const first = store.setPreference('dark'); const last = store.setPreference('light');
  await new Promise((resolve) => setImmediate(resolve)); assert.equal(finishes.length, 1);
  finishes[0](); await first; await new Promise((resolve) => setImmediate(resolve));
  assert.equal(finishes.length, 2); finishes[1](); await last;
  const restarted = f.create(); await restarted.restore(); assert.equal(restarted.getSnapshot().scheme, 'light');
});

test('failed reads use Dark and failed writes keep the visible choice with actionable error', async () => {
  const f = fixture({ os: 'dark', read: async () => { throw Error('unavailable'); } });
  const store = f.create(); await store.restore(); assert.equal(store.getSnapshot().ready, true);
  assert.equal(store.getSnapshot().preference, 'dark'); assert.match(store.getSnapshot().appearanceError, /restored/);
  let fail = true; const g = fixture({ write: async () => { if (fail) throw Error('full'); } });
  const other = g.create(); await other.restore(); await assert.rejects(other.setPreference('dark'));
  assert.equal(other.getSnapshot().scheme, 'dark'); assert.match(other.getSnapshot().appearanceError, /Try again/);
  fail = false; await other.setPreference('dark'); assert.equal(other.getSnapshot().appearanceError, '');
});

test('appearance storage never reads, clears or mutates draft, payment or session records', async () => {
  const f = fixture();
  const privateValues = {
    'campaign-creation-v1:guest': JSON.stringify([{ localId: 'draft-fixture', draft: { title: 'Kept', currentStep: 2 } }]),
    'campaign-session': JSON.stringify({ token: 'test-session-only', user: { id: 'user-fixture' } }),
    'selected-contribution': JSON.stringify({ amount: '10', outcome: 'pending', idempotencyKey: 'test-idempotency-fixture' }),
  };
  Object.entries(privateValues).forEach(([key, value]) => f.values.set(key, value));
  const store = f.create(); const stop = store.start(); await store.restore();
  for (const value of ['dark', 'light', 'system']) await store.setPreference(value);
  f.setOS('dark'); stop();
  Object.entries(privateValues).forEach(([key, value]) => assert.equal(f.values.get(key), value));
  assert.ok(f.calls.every(([, key]) => key === APPEARANCE_KEY));
});

test('snapshots remain stable without changes and notify subscribers only for actual changes', async () => {
  const f = fixture(); const store = f.create(); await store.restore();
  let notifications = 0; const stop = store.subscribe(() => notifications++);
  const snapshot = store.getSnapshot(); assert.equal(store.getSnapshot(), snapshot);
  await store.setPreference('dark'); assert.equal(notifications, 0);
  await store.setPreference('system'); assert.ok(notifications > 0); stop();
  const count = notifications; await store.setPreference('light'); assert.equal(notifications, count);
});

function contrast(a, b) {
  const luminance = (hex) => hex.slice(1).match(/../g).map((v) => parseInt(v, 16) / 255)
    .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test('semantic text, control and progress pairs retain measured contrast in both themes', () => {
  for (const colors of [lightColors, darkColors]) {
    for (const [foreground, background] of [['text', 'bg'], ['muted', 'paper'], ['onPrimary', 'primary'], ['headerText', 'header'], ['onHeaderMuted', 'header'], ['red', 'errorSurface'], ['ink', 'mint']])
      assert.ok(contrast(colors[foreground], colors[background]) >= 4.5, `${foreground}/${background}`);
    for (const [foreground, background] of [['outline', 'paper'], ['focus', 'paper'], ['progress', 'progressTrack']])
      assert.ok(contrast(colors[foreground], colors[background]) >= 3, `${foreground}/${background}`);
  }
});
