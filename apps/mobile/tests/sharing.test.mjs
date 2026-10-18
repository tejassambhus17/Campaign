import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const shared = [];
const publicModule = { exports: {} };
const publicSource = ts.transpileModule(
  readFileSync(new URL('../src/lib/public-campaign.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
new Function('module', 'exports', publicSource)(publicModule, publicModule.exports);
const module = { exports: {} };
const source = ts.transpileModule(
  readFileSync(new URL('../src/features/campaign.tsx', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } },
).outputText;
new Function('require', 'module', 'exports', source)(
  (name) => name === 'react-native'
    ? { Platform: { OS: 'android' }, Share: { share: async (value) => { shared.push(value); } } }
    : name === 'react' ? { default: { memo: component => component } }
    : name === '../lib/public-campaign' ? publicModule.exports : {},
  module,
  module.exports,
);
const { detailPath, shareCampaign } = module.exports;
const published = { id: 'campaign-public', title: 'The approved public message', publishedAt: '2026-10-15T12:00:00Z', status: 'Available for Funding', campaignState: 'Available for Funding' };

test('campaign detail destinations resolve to an existing Expo Router screen', () => {
  const root = fileURLToPath(new URL('../src/app/', import.meta.url));
  const screenSegments = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name.endsWith('.tsx') && !entry.name.startsWith('_') && !entry.name.startsWith('+')) {
        screenSegments.push(relative(root, path).replace(/\.tsx$/, '').split(sep).filter((part) => !/^\(.+\)$/.test(part) && part !== 'index'));
      }
    }
  };
  visit(root);
  const destination = detailPath(published.id).split('/').filter(Boolean);
  assert.ok(screenSegments.some((screen) => screen.length === destination.length && screen.every((part, index) => /^\[[^\]]+\]$/.test(part) || part === destination[index])), `No Expo screen resolves ${detailPath(published.id)}`);
});

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

test('a managed revision with an approved snapshot shares the approved title, never the private draft', async () => {
  await shareCampaign({
    ...published, title: 'Private draft title', status: 'Submitted for Review', revisionPending: true,
    publishedVersion: { title: published.title, goal: 100, sources: [], sections: [] },
  });
  assert.equal(shared.at(-1).title, published.title);
  assert.equal(JSON.stringify(shared.at(-1)).includes('Private draft'), false);
});
