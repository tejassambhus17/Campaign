import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/walkthrough.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = { exports: {} };
new Function('module', 'exports', compiled)(loaded, loaded.exports);
const { WALKTHROUGH_KEY, WALKTHROUGH_STEPS, createWalkthroughStore, canOfferWalkthrough } = loaded.exports;
const settle = () => new Promise(resolve => setImmediate(resolve));
const record = (status, step = 0) => JSON.stringify({ version: 1, status, step });
const idleHome = { isHome: true, homeReady: true, startupReady: true, hasPendingNavigation: false, interactionBusy: false };

function fixture({ saved = null, read, write } = {}) {
  const values = new Map(saved === null ? [] : [[WALKTHROUGH_KEY, saved]]);
  const calls = [];
  const storage = {
    getItem: async key => { calls.push(['get', key]); return read ? read(key) : values.get(key) ?? null; },
    setItem: async (key, value) => { calls.push(['set', key, value]); if (write) await write(key, value); values.set(key, value); },
  };
  return { values, calls, create: () => createWalkthroughStore(storage) };
}
async function begin(store) { await store.restore(); assert.equal(await store.offer(), true); assert.equal(await store.start(), true); }
async function lastStep(store) { for (let i = 1; i < WALKTHROUGH_STEPS; i++) assert.equal(await store.next(), true); }

test('missing preference invites only on settled idle Home without waiting for campaigns or authentication', async () => {
  const f = fixture(); const store = f.create();
  assert.equal(canOfferWalkthrough(store.getSnapshot(), idleHome), false);
  await store.restore();
  assert.equal(store.getSnapshot().record, null);
  assert.equal(canOfferWalkthrough(store.getSnapshot(), idleHome), true);
  for (const [key, value] of Object.entries({ isHome: false, homeReady: false, startupReady: false, hasPendingNavigation: true, interactionBusy: true }))
    assert.equal(canOfferWalkthrough(store.getSnapshot(), { ...idleHome, [key]: value }), false, key);
  assert.deepEqual(f.calls, [['get', WALKTHROUGH_KEY]]);
});

test('offered is durable and never auto-reoffered after a process closes', async () => {
  const f = fixture(); const store = f.create(); await store.restore();
  assert.equal(await store.offer(), true);
  assert.equal(store.getSnapshot().record.status, 'offered');
  assert.equal(store.getSnapshot().active, false);
  assert.equal(await store.offer(), false);
  const restarted = f.create(); await restarted.restore();
  assert.equal(canOfferWalkthrough(restarted.getSnapshot(), idleHome), false);
  assert.equal(restarted.getSnapshot().active, false);
});

test('skip survives restart and displaying step one does not count as completion', async () => {
  const f = fixture(); const store = f.create(); await begin(store);
  assert.equal(store.getSnapshot().record.status, 'in_progress');
  await store.dismiss();
  assert.equal(store.getSnapshot().active, false);
  assert.equal(store.getSnapshot().record.status, 'skipped');
  const restarted = f.create(); await restarted.restore();
  assert.equal(restarted.getSnapshot().record.status, 'skipped');
  assert.equal(canOfferWalkthrough(restarted.getSnapshot(), idleHome), false);
});

test('four bounded steps preserve Back/Next state and complete only through explicit final action', async () => {
  const f = fixture(); const store = f.create(); await begin(store);
  assert.equal(await store.back(), false);
  assert.equal(await store.complete(), false);
  await store.next(); await store.next();
  assert.equal(store.getSnapshot().step, 2);
  await store.back(); assert.equal(store.getSnapshot().step, 1);
  await store.next(); await store.next();
  assert.equal(await store.next(), false);
  assert.equal(store.getSnapshot().record.status, 'in_progress');
  assert.equal(await store.complete(), true);
  assert.equal(store.getSnapshot().record.status, 'completed');
  assert.equal(store.getSnapshot().active, false);
  assert.equal(await store.next(), false);
  const restarted = f.create(); await restarted.restore();
  assert.equal(restarted.getSnapshot().record.status, 'completed');
  assert.equal(restarted.getSnapshot().active, false);
});

test('manual replay preserves completed/skipped choices and cannot reenable automatic invitations', async () => {
  for (const status of ['completed', 'skipped']) {
    const f = fixture({ saved: record(status, status === 'completed' ? 3 : 0) });
    const store = f.create(); await store.restore();
    assert.equal(await store.start(), false);
    assert.equal(await store.start({ replay: true }), true);
    await store.next(); await store.back(); await store.interrupt();
    assert.equal(store.getSnapshot().record.status, status);
    assert.equal(store.getSnapshot().active, false);
    assert.equal(f.calls.filter(([operation]) => operation === 'set').length, 0);
    const restarted = f.create(); await restarted.restore();
    assert.equal(canOfferWalkthrough(restarted.getSnapshot(), idleHome), false);
  }
});

test('explicit replay can complete an earlier skipped tour', async () => {
  const f = fixture({ saved: record('skipped') }); const store = f.create(); await store.restore();
  await store.start({ replay: true }); await lastStep(store); await store.complete();
  assert.equal(store.getSnapshot().record.status, 'completed');
  assert.equal(JSON.parse(f.values.get(WALKTHROUGH_KEY)).status, 'completed');
});

test('manual replay before any invitation consumes automatic eligibility', async () => {
  const f = fixture(); const store = f.create(); await store.restore();
  await store.start({ replay: true }); await store.interrupt();
  const restarted = f.create(); await restarted.restore();
  assert.equal(restarted.getSnapshot().record.status, 'interrupted');
  assert.equal(canOfferWalkthrough(restarted.getSnapshot(), idleHome), false);
});

test('interrupted in-progress record restores without any overlay and replay starts from step one', async () => {
  const f = fixture({ saved: record('in_progress', 2) }); const store = f.create(); await store.restore();
  assert.equal(store.getSnapshot().record.status, 'interrupted');
  assert.equal(store.getSnapshot().active, false);
  assert.equal(store.getSnapshot().step, 0);
  assert.equal(canOfferWalkthrough(store.getSnapshot(), idleHome), false);
  assert.equal(await store.start(), false);
  assert.equal(await store.start({ replay: true }), true);
  assert.equal(store.getSnapshot().step, 0);
});

test('corrupt and unsupported preferences do not clear data or invite repeatedly', async () => {
  for (const saved of ['', '{', 'null', '[]', record('unknown'), record('completed', 99), record('completed', 0), record('offered', 2), '{"version":2,"status":"completed","step":3}']) {
    const f = fixture({ saved }); const store = f.create(); await store.restore();
    assert.equal(store.getSnapshot().ready, true);
    assert.equal(store.getSnapshot().record.status, 'interrupted');
    assert.equal(store.getSnapshot().active, false);
    assert.equal(canOfferWalkthrough(store.getSnapshot(), idleHome), false);
    assert.equal(f.values.get(WALKTHROUGH_KEY), saved);
    assert.equal(f.calls.length, 1);
    assert.equal(await store.start({ replay: true }), true);
  }
});

test('read failure fails closed for automatic invitation but explicit replay can recover', async () => {
  const f = fixture({ read: async () => { throw Error('unavailable'); } }); const store = f.create();
  await store.restore();
  assert.equal(store.getSnapshot().ready, true);
  assert.match(store.getSnapshot().storageError, /restored/);
  assert.equal(canOfferWalkthrough(store.getSnapshot(), idleHome), false);
  assert.equal(await store.start({ replay: true }), true);
  assert.equal(store.getSnapshot().storageError, '');
});

test('synchronous storage bridge failures also settle restoration safely', async () => {
  const store = createWalkthroughStore({ getItem: () => { throw Error('bridge unavailable'); }, setItem: async () => undefined });
  await store.restore();
  assert.equal(store.getSnapshot().ready, true);
  assert.equal(store.getSnapshot().active, false);
  assert.match(store.getSnapshot().storageError, /restored/);
  assert.equal(canOfferWalkthrough(store.getSnapshot(), idleHome), false);
});

test('failed offer is not repeatedly attempted during the current session', async () => {
  const f = fixture({ write: async () => { throw Error('full'); } }); const store = f.create(); await store.restore();
  assert.equal(await store.offer(), false);
  assert.equal(store.getSnapshot().record, null);
  assert.equal(store.getSnapshot().invitationEligible, false);
  assert.match(store.getSnapshot().storageError, /could not be saved/);
});

test('failed completion never publishes a false completed choice and can be retried', async () => {
  let fail = false; const f = fixture({ write: async () => { if (fail) throw Error('full'); } });
  const store = f.create(); await begin(store); await lastStep(store); fail = true;
  assert.equal(await store.complete(), false);
  assert.equal(store.getSnapshot().active, true);
  assert.equal(store.getSnapshot().record.status, 'in_progress');
  assert.equal(JSON.parse(f.values.get(WALKTHROUGH_KEY)).status, 'in_progress');
  fail = false; assert.equal(await store.complete(), true);
  assert.equal(store.getSnapshot().storageError, '');
});

test('failed dismissal releases the overlay immediately without pretending the choice was saved', async () => {
  let fail = false; const f = fixture({ write: async () => { if (fail) throw Error('full'); } });
  const store = f.create(); await begin(store); fail = true;
  const closing = store.dismiss();
  assert.equal(store.getSnapshot().active, false);
  assert.equal(await closing, false);
  assert.equal(store.getSnapshot().record.status, 'in_progress');
  assert.equal(canOfferWalkthrough(store.getSnapshot(), idleHome), false);
  const restarted = f.create(); await restarted.restore();
  assert.equal(restarted.getSnapshot().record.status, 'interrupted');
  assert.equal(restarted.getSnapshot().active, false);
});

test('a delayed restoration cannot overwrite a later explicit skip', async () => {
  let finish; const f = fixture({ read: () => new Promise(resolve => { finish = resolve; }) });
  const store = f.create(); const restoring = store.restore(); const skipping = store.dismiss();
  await settle();
  finish(null); await restoring; await skipping;
  assert.equal(store.getSnapshot().record.status, 'skipped');
  assert.equal(JSON.parse(f.values.get(WALKTHROUGH_KEY)).status, 'skipped');
});

test('serialized offer and skip preserve the newest durable decision', async () => {
  const finishes = []; const f = fixture({ write: () => new Promise(resolve => finishes.push(resolve)) });
  const store = f.create(); await store.restore();
  const offer = store.offer(); await settle(); const skip = store.dismiss();
  assert.equal(finishes.length, 1); finishes[0](); await offer; await settle();
  assert.equal(finishes.length, 2); finishes[1](); await skip;
  assert.equal(store.getSnapshot().record.status, 'skipped');
  assert.equal(JSON.parse(f.values.get(WALKTHROUGH_KEY)).status, 'skipped');
});

test('dismissal during a slow start cannot reopen a late overlay', async () => {
  let block = false, finish; const f = fixture({ write: async () => { if (block) await new Promise(resolve => { finish = resolve; }); } });
  const store = f.create(); await store.restore(); await store.offer(); block = true;
  const starting = store.start(); await settle(); const closing = store.dismiss();
  block = false; finish(); assert.equal(await starting, false); await closing;
  assert.equal(store.getSnapshot().active, false);
  assert.equal(store.getSnapshot().record.status, 'skipped');
});

test('guest/account/theme continuity never touches sessions, drafts, contributions or read state', async () => {
  const f = fixture();
  const unrelated = new Map([
    ['campaign:onboarding:v1', 'complete'], ['campaign:appearance:v1', 'light'],
    ['campaign-session', '{"user":"fixture"}'], ['campaign-creation-v1:guest', '{"step":2,"title":"Keep"}'],
    ['selected-contribution', '{"amount":"5","status":"pending"}'], ['notification-read-state', '["fixture"]'],
  ]);
  unrelated.forEach((value, key) => f.values.set(key, value));
  const store = f.create(); await begin(store); await store.next(); await store.dismiss();
  f.values.set('campaign-session', '{"user":"another-fixture"}');
  f.values.set('campaign:appearance:v1', 'dark');
  const replay = f.create(); await replay.restore(); await replay.start({ replay: true }); await replay.interrupt();
  assert.equal(canOfferWalkthrough(replay.getSnapshot(), idleHome), false);
  for (const [key, value] of unrelated) if (!['campaign-session', 'campaign:appearance:v1'].includes(key)) assert.equal(f.values.get(key), value);
  assert.equal(f.values.get('campaign-session'), '{"user":"another-fixture"}');
  assert.equal(f.values.get('campaign:appearance:v1'), 'dark');
  assert.ok(f.calls.every(([, key]) => key === WALKTHROUGH_KEY));
});

test('snapshots stay referentially stable without changes and unsubscribe removes listeners', async () => {
  const f = fixture(); const store = f.create(); await store.restore();
  const initial = store.getSnapshot(); assert.equal(store.getSnapshot(), initial);
  let events = 0; const stop = store.subscribe(() => events++);
  await store.restore(); assert.equal(events, 0);
  await store.offer(); assert.ok(events > 0); stop();
  const before = events; await store.start(); await store.dismiss(); assert.equal(events, before);
});
