import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const { QueryClient } = require('@tanstack/react-query');
const compiled = ts.transpileModule(
  readFileSync(new URL('../src/features/notifications/state.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const loaded = { exports: {} };
new Function('exports', 'module', compiled)(loaded.exports, loaded);
const { createNotificationActions, notificationActionsFor, NOTIFICATION_READ_CONCURRENCY } = loaded.exports;
const key = ['activity', 'account-one'];
const row = (id, read = false) => ({ id, title: `Update ${id}`, body: 'A campaign update.', category: 'campaigns', createdAt: '2026-10-16T12:00:00Z', read });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
const unread = client => client.getQueryData(key)?.filter(item => !item.read).map(item => item.id);

test('the quick sheet and Activity share deduplicated requests, pending status and the existing read-count cache', async t => {
  const client = new QueryClient(); t.after(() => client.clear());
  client.setQueryData(key, [row('one'), row('already', true)]);
  client.setQueryData(['activity', 'other-account'], [row('one')]);
  const request = deferred(); const calls = [];
  const capture = () => () => true;
  const send = id => { calls.push(id); return request.promise; };
  const sheet = notificationActionsFor(client, 'account-one', capture, send);
  const activity = notificationActionsFor(client, 'account-one', capture, send);
  assert.equal(sheet, activity);
  const previousSnapshot = sheet.getSnapshot();
  const first = sheet.markRead(row('one'));
  const duplicate = activity.markRead(row('one'));
  assert.deepEqual(calls, ['one']);
  assert.equal(activity.getSnapshot().pendingIds.has('one'), true);
  assert.equal(previousSnapshot.pendingIds.size, 0, 'external-store snapshots stay immutable');
  request.resolve({ ok: true }); await Promise.all([first, duplicate]);
  assert.deepEqual(unread(client), []);
  assert.equal(activity.getSnapshot().pendingIds.size, 0);
  assert.equal(client.getQueryData(['activity', 'other-account'])[0].read, false);
  await sheet.markRead(row('already'));
  await sheet.markRead(row('not-in-authorized-cache'));
  assert.deepEqual(calls, ['one'], 'already read or absent IDs never generate a request');
});

test('mark all snapshots unread IDs, bounds all concurrent requests, deduplicates presses and retains partial failures', async t => {
  const client = new QueryClient(); t.after(() => client.clear());
  client.setQueryData(key, ['one', 'two', 'three', 'four', 'five', 'six'].map(id => row(id)));
  const requests = new Map(); let active = 0, maximum = 0;
  const calls = [];
  const actions = createNotificationActions({ client, userId: 'account-one', isCurrent: () => true, requestRead: id => {
    calls.push(id); active += 1; maximum = Math.max(maximum, active);
    const pending = deferred(); requests.set(id, pending);
    return pending.promise.finally(() => { active -= 1; });
  } });
  const individual = actions.markRead(row('one'));
  const all = actions.markAllRead();
  const sameAll = actions.markAllRead();
  assert.equal(all, sameAll);
  assert.equal(actions.getSnapshot().markingAll, true);
  assert.equal(calls.length, NOTIFICATION_READ_CONCURRENCY);
  client.setQueryData(key, current => [row('arrived-during-batch'), ...current]);
  requests.get('one').resolve({}); requests.get('two').reject(new Error('Offline.')); requests.get('three').resolve({});
  await flush(); await flush();
  for (const id of ['four', 'five', 'six']) {
    assert.ok(requests.has(id)); requests.get(id).resolve({});
  }
  await Promise.all([individual, all]);
  assert.equal(maximum, NOTIFICATION_READ_CONCURRENCY);
  assert.deepEqual(calls, ['one', 'two', 'three', 'four', 'five', 'six']);
  assert.deepEqual(unread(client), ['arrived-during-batch', 'two']);
  assert.match(actions.getSnapshot().error, /^1 update is still unread\. Saved changes are kept\. Refresh and try again\.$/);
  assert.doesNotMatch(actions.getSnapshot().error, /Offline/);
  assert.equal(actions.getSnapshot().markingAll, false);
  assert.equal(actions.getSnapshot().pendingIds.size, 0);
  const retry = actions.markRead(row('two'));
  requests.get('two').resolve({}); await retry;
  assert.equal(actions.getSnapshot().error, '');
  assert.deepEqual(unread(client), ['arrived-during-batch']);
});

test('offline individual reads keep notifications unread and a real retry saves them', async t => {
  const client = new QueryClient(); t.after(() => client.clear()); client.setQueryData(key, [row('one')]);
  let offline = true;
  const actions = createNotificationActions({ client, userId: 'account-one', isCurrent: () => true, requestRead: async () => {
    if (offline) throw new Error('No connection.');
  } });
  await actions.markRead(row('one'));
  assert.deepEqual(unread(client), ['one']);
  assert.match(actions.getSnapshot().error, /This update is still unread.*Refresh and try again/);
  assert.doesNotMatch(actions.getSnapshot().error, /No connection/);
  actions.clearError(); assert.equal(actions.getSnapshot().error, '');
  offline = false; await actions.markRead(row('one'));
  assert.deepEqual(unread(client), []);
});

test('a partially failed batch reports the exact unread failure count with compact recovery copy', async t => {
  const client = new QueryClient(); t.after(() => client.clear());
  client.setQueryData(key, ['first', 'second', 'saved'].map(id => row(id)));
  const transportDetail = 'A lengthy transport-specific explanation that should not crowd the sheet. '.repeat(8);
  const actions = createNotificationActions({ client, userId: 'account-one', isCurrent: () => true, requestRead: async id => {
    if (id !== 'saved') throw new Error(transportDetail);
  } });
  await actions.markAllRead();
  assert.deepEqual(unread(client), ['first', 'second']);
  assert.match(actions.getSnapshot().error, /^2 updates are still unread\. Saved changes are kept\. Refresh and try again\.$/);
  assert.ok(actions.getSnapshot().error.length < 100);
  assert.equal(actions.getSnapshot().error.includes(transportDetail), false);
  assert.equal(client.getQueryData(key).find(item => item.id === 'saved').read, true);
});

for (const change of ['sign-out', 'account-switch', 'same-account reauthentication', 'backend-switch']) {
  test(`${change} invalidates running and queued reads without repopulating or changing private caches`, async t => {
    const client = new QueryClient(); t.after(() => client.clear());
    client.setQueryData(key, ['one', 'two', 'three', 'four', 'five'].map(id => row(id)));
    let epoch = 0;
    const capture = () => { const started = epoch; return () => epoch === started; };
    const gates = []; const calls = [];
    const old = notificationActionsFor(client, 'account-one', capture, id => {
      calls.push(id); const gate = deferred(); gates.push(gate); return gate.promise;
    });
    const pending = old.markAllRead();
    assert.equal(calls.length, 3);
    epoch += 1; client.clear();
    const nextUser = change === 'sign-out' ? undefined : change === 'account-switch' ? 'other-account' : 'account-one';
    if (nextUser) client.setQueryData(['activity', nextUser], [row('one')]);
    const next = notificationActionsFor(client, nextUser, capture, async () => undefined);
    assert.notEqual(next, old);
    gates[0].resolve({}); gates[1].reject(new Error('Old private failure.')); gates[2].resolve({});
    await pending;
    assert.deepEqual(calls, ['one', 'two', 'three'], 'old queued IDs are never sent with the new session');
    assert.equal(next.getSnapshot().error, '');
    assert.equal(next.getSnapshot().pendingIds.size, 0);
    assert.equal(next.getSnapshot().markingAll, false);
    if (nextUser) assert.equal(client.getQueryData(['activity', nextUser])[0].read, false);
    if (nextUser !== 'account-one') assert.equal(client.getQueryData(key), undefined);
  });
}

test('a removed private query is never recreated by an otherwise-current request completion', async t => {
  const client = new QueryClient(); t.after(() => client.clear()); client.setQueryData(key, [row('one')]);
  const gate = deferred();
  const actions = createNotificationActions({ client, userId: 'account-one', isCurrent: () => true, requestRead: () => gate.promise });
  const pending = actions.markRead(row('one'));
  client.removeQueries({ queryKey: key, exact: true });
  gate.resolve({}); await pending;
  assert.equal(client.getQueryData(key), undefined);
  assert.equal(client.getQueryCache().find({ queryKey: key, exact: true }), undefined);
});

test('guests have no private action requests, pending state or notification cache access', async t => {
  const client = new QueryClient(); t.after(() => client.clear());
  client.setQueryData(key, [row('private')]);
  let requests = 0, captures = 0;
  const guest = notificationActionsFor(client, undefined, () => { captures += 1; return () => true; }, async () => { requests += 1; });
  await guest.markRead(row('private')); await guest.markAllRead(); guest.clearError();
  assert.equal(requests, 0); assert.equal(captures, 0);
  assert.equal(guest.getSnapshot().pendingIds.size, 0);
  assert.equal(guest.getSnapshot().error, '');
  assert.equal(client.getQueryData(key)[0].read, false);
});
