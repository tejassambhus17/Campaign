import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const modules = new Map();
function load(relative) {
  const url = new URL(relative, import.meta.url);
  if (modules.has(url.href)) return modules.get(url.href).exports;
  const module = { exports: {} };
  modules.set(url.href, module);
  const code = ts.transpileModule(readFileSync(url, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    assert.ok(name.startsWith('.'), `Home model must remain a pure local model: ${name}`);
    return load(new URL(`${name}.ts`, url).href);
  }, module, module.exports);
  return module.exports;
}

const { selectHomeCampaigns } = load('../src/features/home/model.ts');
const { assessmentMatchesCampaign, assessmentPresentation } = load('../src/lib/assessments.ts');
const filters = { search: '', category: 'All', sort: 'Featured', funding: false };
const campaign = (id, overrides = {}) => ({
  id, ownerId: `owner-${id}`, title: `${id} message`, category: 'Environment',
  creatorName: 'Fictional community', summary: 'A message for everyone.',
  coverImage: '', storyHeadline: '', intro: '', sections: [], sources: [],
  adImages: [], adHeadline: '', adDescription: '', cta: 'Learn more',
  geography: '', interests: '', channels: ['Instagram'], allocation: { Instagram: 100 },
  durationDays: 14, goal: 100, raised: 0, status: 'Available for Funding',
  createdAt: '2026-10-01T00:00:00Z', publicContentHash: `public-${id}`,
  ...overrides,
});
const ocean = campaign('demo_ocean', { title: 'Our shared ocean', featured: true, raised: 82 });
const forest = campaign('forest', { title: 'Growing a canopy', creatorName: 'Canopy team', raised: 50, publishedAt: '2026-10-12T00:00:00Z' });
const books = campaign('books', { category: 'Education', title: 'Books for everyone', status: 'Completed', raised: 20, goal: 20, publishedAt: '2026-10-13T00:00:00Z' });
const coast = campaign('coast', { title: 'Listen to the coastline', raised: 90, goal: 200, publishedAt: '2026-10-14T00:00:00Z' });

test('Home default spotlight pins the existing ocean only within the matching campaign set', () => {
  const selected = selectHomeCampaigns([forest, books, ocean, coast], filters);
  assert.equal(selected.featured.id, 'demo_ocean');
  assert.deepEqual(selected.discover.map(c => c.id), ['forest', 'books', 'coast']);
  assert.equal(selected.total, 4);
  assert.equal(selected.discover.some(c => c.id === selected.featured.id), false);

  const education = selectHomeCampaigns([forest, books, ocean, coast], { ...filters, category: 'Education' });
  assert.equal(education.featured.id, 'books');
  assert.deepEqual(education.discover, []);
  assert.equal(education.total, 1);
});

test('Home search, category and open-backing controls compose on actual public campaign fields', () => {
  const rows = [forest, books, ocean, coast];
  const matching = selectHomeCampaigns(rows, { ...filters, search: ' CANOPY ', category: 'Environment', funding: true });
  assert.equal(matching.featured.id, 'forest');
  assert.equal(matching.total, 1);
  for (const next of [
    { ...filters, search: 'canopy', category: 'Education' },
    { ...filters, category: 'Education', funding: true },
    { ...filters, search: 'a message that does not exist' },
  ]) {
    assert.deepEqual(selectHomeCampaigns(rows, next), { featured: undefined, discover: [], total: 0 });
  }
});

test('explicit Home sort choices govern the featured card rather than an unconditional demo pin', () => {
  const rows = [forest, books, ocean, coast];
  const expected = { Newest: 'coast', 'Most funded': 'coast', 'Closest to goal': 'books' };
  for (const [sort, id] of Object.entries(expected)) {
    const selected = selectHomeCampaigns(rows, { ...filters, sort });
    assert.equal(selected.featured.id, id, sort);
    assert.equal(selected.discover.some(c => c.id === id), false, sort);
  }
});

test('discovery keeps a stable four-card limit without mutating, duplicating or inventing campaign facts', () => {
  const rows = [forest, books, ocean, coast, campaign('health', { category: 'Health' }), campaign('arts', { category: 'Arts & Culture' }), campaign('community', { category: 'Community' })];
  const before = structuredClone(rows);
  const first = selectHomeCampaigns(rows, filters);
  const repeated = selectHomeCampaigns(rows, filters);
  assert.equal(first.total, 7);
  assert.deepEqual(first.discover.map(c => c.id), ['forest', 'books', 'coast', 'health']);
  assert.deepEqual(repeated, first);
  assert.deepEqual(rows, before);
  for (const selected of [first.featured, ...first.discover]) {
    assert.deepEqual(selected, before.find(c => c.id === selected.id));
    for (const unsupported of ['supporters', 'supporterCount', 'backerNames', 'creatorVerified', 'trustScore']) {
      assert.equal(Object.hasOwn(selected, unsupported), false, unsupported);
    }
  }
});

test('Home filters and cards use the approved public snapshot, never an unpublished managed revision', () => {
  const approved = campaign('revision', { title: 'The approved public forest', summary: 'Public canopy research', goal: 400, category: 'Environment' });
  const managed = campaign('revision', {
    title: 'Private working health edit', summary: 'Unpublished change', category: 'Health', goal: 9000,
    status: 'Changes Requested', campaignState: 'Available for Funding', revisionPending: true,
    publicContentHash: 'approved-hash', raised: 125, publishedVersion: approved,
  });
  const before = structuredClone(managed);
  const selected = selectHomeCampaigns([managed], { ...filters, search: 'canopy', category: 'Environment', funding: true });
  assert.equal(selected.total, 1);
  assert.equal(selected.featured.title, approved.title);
  assert.equal(selected.featured.goal, 400);
  assert.equal(selected.featured.raised, 125);
  assert.equal(selected.featured.status, 'Available for Funding');
  assert.equal(selected.featured.publicContentHash, 'approved-hash');
  assert.equal(selectHomeCampaigns([managed], { ...filters, search: 'Private working' }).total, 0);
  assert.equal(selectHomeCampaigns([{ ...managed, publishedVersion: undefined }], filters).total, 0);
  assert.deepEqual(managed, before);
});

test('the selected public Home content admits only its exact published assessment and keeps demo provenance', () => {
  const selected = selectHomeCampaigns([ocean], filters).featured;
  const value = {
    state: 'completed', contentHash: selected.publicContentHash, rubricVersion: 'campaign-review-v1',
    assessment: { status: 'published', contentHash: selected.publicContentHash, rubricVersion: 'campaign-review-v1', publishedAt: '2026-10-17T10:00:00Z', total: 76, classification: 'Moderate review coverage', assessmentType: 'demo' },
    history: [],
  };
  assert.equal(assessmentMatchesCampaign(selected, value), true);
  assert.equal(assessmentPresentation(value).score, 76);
  assert.equal(assessmentPresentation(value).demo, true);
  assert.equal(assessmentMatchesCampaign({ ...selected, publicContentHash: 'new-public-content' }, value), false);
  assert.equal(assessmentPresentation({ ...value, assessment: { ...value.assessment, contentHash: 'older-content' } }).score, null);
  assert.equal(assessmentPresentation({ ...value, state: 'not_assessed' }).score, null);
  assert.equal(assessmentPresentation({ ...value, assessment: { ...value.assessment, status: 'draft' } }).score, null);
});
