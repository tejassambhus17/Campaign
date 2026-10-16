import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = ts.transpileModule(readFileSync(new URL('../src/lib/public-campaign.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const model = { exports: {} };
new Function('exports', 'module', source)(model.exports, model);
const { audienceCampaign, campaignJourneyDates } = model.exports;

const approved = {
  title: 'Approved public message', category: 'Education', creatorName: 'Public creator',
  summary: 'Approved summary', coverImage: '/media/public-cover.jpg',
  storyHeadline: 'Approved headline', intro: 'Approved introduction',
  sections: [{ id: 'section', kind: 'text', text: 'Approved story' }],
  sources: [{ id: 'source', title: 'Public source', url: 'https://example.org' }],
  adImages: ['/media/public-ad.jpg'], adHeadline: 'Approved ad', adDescription: 'Public creative',
  cta: 'Learn more', geography: 'Pune', interests: 'Reading', channels: ['Instagram'],
  allocation: { Instagram: 100 }, durationDays: 14, goal: 100,
};
const ledger = {
  id: 'cmp-public', ownerId: 'owner-one', raised: 75, status: 'Available for Funding',
  campaignState: 'Available for Funding', createdAt: '2026-10-01T08:00:00Z',
  publishedAt: '2026-10-02T09:00:00Z', deadline: '2026-10-16T09:00:00Z',
};

test('ordinary audience responses keep their approved content and ledger without mutating the cache', () => {
  const response = Object.freeze({ ...approved, ...ledger });
  assert.equal(audienceCampaign(response), response);
  assert.equal(response.title, 'Approved public message');
});

test('a managed pending revision contributes only to the approved message and approved goal', () => {
  const response = {
    ...approved, ...ledger, title: 'PRIVATE draft title', summary: 'PRIVATE summary',
    intro: 'PRIVATE introduction', coverImage: '/media/private.jpg',
    sections: [{ id: 'private', kind: 'text', text: 'PRIVATE story' }],
    adImages: ['/media/private-ad.jpg'], geography: 'PRIVATE targeting', goal: 9999,
    status: 'Submitted for Review', revisionPending: true,
    publishedVersion: { ...approved, history: ['snapshot extra must not leak'] },
    estimatedReach: 9999999, feedback: 'PRIVATE review notes', history: ['PRIVATE audit'],
    clientDraftId: 'PRIVATE device identifier', submittedAt: '2026-10-15T10:00:00Z', version: 12,
    report: { raised: 75, fees: 3.75, startedAt: null, completedAt: null },
  };
  const before = JSON.stringify(response);
  const result = audienceCampaign(response);
  for (const key of Object.keys(approved)) assert.deepEqual(result[key], approved[key], key);
  for (const key of Object.keys(ledger)) assert.deepEqual(result[key], ledger[key], key);
  assert.equal(result.revisionPending, true);
  assert.equal(result.report, response.report);
  for (const key of ['feedback', 'history', 'clientDraftId', 'submittedAt', 'version', 'publishedVersion', 'estimatedReach']) {
    assert.equal(Object.hasOwn(result, key), false, key);
  }
  assert.equal(JSON.stringify(result).includes('PRIVATE'), false);
  assert.equal(JSON.stringify(response), before, 'creator/reviewer cache stays unchanged');
});

test('missing or malformed approved snapshots fail closed for managed private revisions', () => {
  const managed = { ...approved, ...ledger, status: 'Draft', revisionPending: true };
  assert.equal(audienceCampaign(managed), null);
  assert.equal(audienceCampaign({ ...managed, publishedVersion: { ...approved, goal: NaN } }), null);
  assert.equal(audienceCampaign({ ...managed, publishedVersion: { ...approved, sources: null } }), null);
  assert.equal(audienceCampaign({ ...managed, campaignState: 'Draft', publishedVersion: approved }), null);
});

test('guest public responses remain usable while a separate private revision is pending', () => {
  const response = Object.freeze({ ...approved, ...ledger, revisionPending: true });
  assert.equal(audienceCampaign(response), response);
  assert.equal(audienceCampaign(response).status, 'Available for Funding');
});

test('journey dates use actual public funding and delivery dates, never private submission or history', () => {
  const campaign = {
    ...approved, ...ledger, submittedAt: '2026-10-15T10:00:00Z',
    history: [{ newState: 'Approved', created_at: 'PRIVATE' }],
    report: { startedAt: '2026-10-05T10:30:00Z', completedAt: '2026-10-07T11:00:00Z' },
  };
  assert.deepEqual(campaignJourneyDates(campaign), [
    { label: 'Backing opened', date: ledger.publishedAt },
    { label: 'Promotion began', date: '2026-10-05T10:30:00Z' },
    { label: 'Completed', date: '2026-10-07T11:00:00Z' },
  ]);
  assert.deepEqual(campaignJourneyDates({ ...campaign, publishedAt: undefined }, { startedAt: null, completedAt: 'invalid' }), []);
  assert.deepEqual(campaignJourneyDates(campaign, { startedAt: '2026-10-06T12:00:00Z' }), [
    { label: 'Backing opened', date: ledger.publishedAt },
    { label: 'Promotion began', date: '2026-10-06T12:00:00Z' },
  ]);
});
