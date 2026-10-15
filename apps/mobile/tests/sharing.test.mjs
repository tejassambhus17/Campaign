import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const shared = [];
const module = { exports: {} };
const source = ts.transpileModule(
  readFileSync(new URL('../src/features/campaign.tsx', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } },
).outputText;
new Function('require', 'module', 'exports', source)(
  (name) => name === 'react-native'
    ? { Platform: { OS: 'android' }, Share: { share: async (value) => { shared.push(value); } } }
    : {},
  module,
  module.exports,
);
const { shareCampaign } = module.exports;
const published = { id: 'campaign-public', title: 'The approved public message', publishedAt: '2026-10-15T12:00:00Z', status: 'Available for Funding' };

test('published Android shares include the public message and working app route', async () => {
  await shareCampaign(published);
  assert.equal(shared.at(-1).url, 'amplify://explore/campaign-public');
  assert.equal(shared.at(-1).title, published.title);
  assert.match(shared.at(-1).message, /Demo campaign:/);
});

test('unpublished campaign sharing stops before opening the system share sheet', async () => {
  const before = shared.length;
  await assert.rejects(shareCampaign({ ...published, publishedAt: undefined, status: 'Rejected' }), /after review and publication/);
  assert.equal(shared.length, before);
});

test('sharing a private revision excludes its unapproved title and keeps the approved public route', async () => {
  const privateTitle = 'Private title awaiting review';
  for (const status of ['Draft', 'Submitted for Review', 'Changes Requested', 'Approved']) {
    await shareCampaign({ ...published, status, revisionPending: true, title: privateTitle });
    assert.ok(!JSON.stringify(shared.at(-1)).includes(privateTitle));
    assert.equal(shared.at(-1).url, 'amplify://explore/campaign-public');
  }
  // The same pending revision does not hide the already approved title from a public reader.
  await shareCampaign({ ...published, revisionPending: true });
  assert.equal(shared.at(-1).title, published.title);
});
