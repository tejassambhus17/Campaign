import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Exercise the app's actual TypeScript validators without adding a second test runtime.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const previousLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { blankDraft, validateStep, normalizeDraft, campaignBody, isPublicUrl } = require('../src/features/creation/model.ts');
if (previousLoader) require.extensions['.ts'] = previousLoader;
else delete require.extensions['.ts'];

const basics = { ...blankDraft(), title: 'A message worth sharing', category: 'Community', creatorName: 'Local voices' };

test('new drafts have no generated funding goal and supported channels', () => {
  const draft = blankDraft();
  assert.equal(draft.goal, 0);
  assert.deepEqual(draft.channels, ['Instagram', 'Facebook']);
});

test('Basics requires title/category/creator and enforces the PDF title maximum', () => {
  assert.deepEqual(Object.keys(validateStep(blankDraft(), 0)).sort(), ['category', 'creatorName', 'title']);
  assert.deepEqual(validateStep(basics, 0), {});
  assert.ok(validateStep({ ...basics, title: 'x'.repeat(61) }, 0).title);
});

test('sources remain optional but added sources require safe public URLs', () => {
  assert.deepEqual(validateStep(basics, 1), {});
  assert.ok(validateStep({ ...basics, sources: [{ id: 'a', title: 'Source', url: 'javascript:alert(1)' }] }, 1).sources);
  assert.deepEqual(validateStep({ ...basics, sources: [{ id: 'a', title: 'Source', url: 'https://example.com/context' }] }, 1), {});
  assert.equal(isPublicUrl('https://user:secret@example.com/context'), false);
});

test('Reach requires a complete percentage allocation and supported demo duration', () => {
  assert.deepEqual(validateStep({ ...basics, geography: 'Pune' }, 3), {});
  assert.ok(validateStep({ ...basics, geography: 'Pune', allocation: { Instagram: 60, Facebook: 30 } }, 3).allocation);
  assert.ok(validateStep({ ...basics, geography: 'Pune', durationDays: 0 }, 3).durationDays);
  assert.ok(validateStep({ ...basics, geography: 'Pune', durationDays: 91 }, 3).durationDays);
});

test('Submit requires explicit valid goal and confirmation without rounding creator input', () => {
  assert.ok(validateStep(basics, 4, '', true).goal);
  assert.ok(validateStep({ ...basics, goal: 10 }, 4, '10', false).rules);
  assert.deepEqual(validateStep({ ...basics, goal: 1.1 }, 4, '1.10', true), {});
  assert.ok(validateStep({ ...basics, goal: 1.001 }, 4, '1.001', true).goal);
  assert.ok(validateStep({ ...basics, goal: 100001 }, 4, '100001', true).goal);
});

test('resumption preserves current step and ordered story blocks', () => {
  const sections = [{ id: 'one', kind: 'text', text: 'one', format: 'bold' }, { id: 'two', kind: 'statistic', text: 'two', caption: 'context' }];
  const normalized = normalizeDraft({ ...basics, currentStep: 3, sections });
  assert.equal(normalized.step, 3);
  assert.deepEqual(normalized.sections.map(section => section.id), ['one', 'two']);
});

test('edit requests exclude privileged lifecycle, ownership, and funding totals', () => {
  const body = campaignBody({ ...basics, status: 'Approved', ownerId: 'private', raised: 100 }, 3);
  assert.equal('status' in body, false);
  assert.equal('ownerId' in body, false);
  assert.equal('raised' in body, false);
  assert.equal(body.currentStep, 3);
});
