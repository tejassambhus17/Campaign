import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = ts.transpileModule(
  readFileSync(new URL('../src/lib/activity.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const model = { exports: {} };
new Function('exports', 'module', source)(model.exports, model);
const { activitySections, notificationAction, activityCategory, activityTime } = model.exports;
const now = new Date(2026, 9, 16, 12);
const rows = [
  { id: 'newer', category: 'payments', read: false, createdAt: new Date(2026, 9, 16, 10).toISOString() },
  { id: 'tied', category: 'campaigns', read: true, createdAt: new Date(2026, 9, 16, 10).toISOString() },
  { id: 'yesterday', category: 'security', read: false, createdAt: new Date(2026, 9, 15, 23).toISOString() },
  { id: 'older', category: 'campaigns', read: false, createdAt: new Date(2026, 9, 13).toISOString() },
];
const ids = (filter) => activitySections(rows, filter, now).flatMap(s => s.data.map(n => n.id));

test('activity groups by local calendar day, preserves server tie order and does not mutate records', () => {
  const original = structuredClone(rows);
  assert.deepEqual(activitySections(rows, 'All', now).map(s => [s.title, s.data.length]), [['Today', 2], ['Yesterday', 1], ['Earlier', 1]]);
  assert.deepEqual(ids('All'), ['newer', 'tied', 'yesterday', 'older']);
  assert.deepEqual(rows, original);
  assert.deepEqual(activitySections([], 'All', now), []);
});

test('unread and category filters reflect actual events and supported plural categories', () => {
  assert.deepEqual(ids('Unread'), ['newer', 'yesterday', 'older']);
  assert.deepEqual(ids('Campaigns'), ['tied', 'older']);
  assert.deepEqual(ids('Payments'), ['newer']);
  assert.deepEqual(ids('Account'), ['yesterday']);
  assert.equal(activityCategory('payments'), 'Payment');
  assert.equal(activityCategory('security'), 'Account');
});

test('resolved server destinations open the editor, report, payments or account context', () => {
  for (const [type, title, href] of [
    ['creator', 'Review & edit', '/create?draft=campaign-one&context=review'],
    ['report', 'View progress & report', '/explore/campaign-one/report'],
    ['campaign', 'Read campaign', '/explore/campaign-one'],
    ['payments', 'Payment history', '/profile?section=Payments'],
    ['profile', 'Account settings', '/profile?section=Settings'],
  ]) {
    assert.deepEqual(notificationAction({ destination: { type, campaignId: 'campaign-one' } }), { title, href });
  }
});

test('owned payment destinations retain the exact private receipt context without a capability token', () => {
  assert.deepEqual(notificationAction({
    category: 'payments', campaignId: 'campaign-one',
    destination: { type: 'payments', paymentId: 'pay-one' },
  }), { title: 'View payment & receipt', href: '/profile?section=Payments&payment=pay-one' });
  assert.equal(notificationAction({ destination: { type: 'payments', paymentId: 'one?token=secret&section=Settings' } }).href,
    '/profile?section=Payments&payment=one%3Ftoken%3Dsecret%26section%3DSettings');
  assert.equal(notificationAction({ destination: { type: 'profile', paymentId: 'not-owned' } }).href,
    '/profile?section=Settings');
});

test('safe server fallbacks override stale IDs and legacy notifications have useful destinations', () => {
  assert.equal(notificationAction({ campaignId: 'old-private', category: 'payments', destination: { type: 'profile' } }).href, '/profile?section=Settings');
  assert.equal(notificationAction({ campaignId: 'old-public', category: 'payments' }).href, '/profile?section=Payments');
  assert.equal(notificationAction({ campaignId: 'old-public' }).href, '/explore/old-public');
  assert.equal(notificationAction({ category: 'security' }).href, '/profile?section=Settings');
  assert.equal(notificationAction({ destination: { type: 'creator' } }).href, '/profile?section=Settings');
  assert.equal(notificationAction({ campaignId: 'one?section=Settings' }).href, '/explore/one%3Fsection%3DSettings');
});

test('invalid historical timestamps remain readable without crashing the inbox', () => {
  assert.equal(activityTime('broken timestamp'), 'Date unavailable');
  assert.equal(activitySections([{ ...rows[0], createdAt: 'broken' }], 'All', now)[0].title, 'Earlier');
  assert.match(activityTime(rows[0].createdAt), /Oct 16/);
});
