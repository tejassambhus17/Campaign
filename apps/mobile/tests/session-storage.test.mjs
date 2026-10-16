import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/session-storage.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = { exports: {} };
new Function('exports', 'module', compiled)(loaded.exports, loaded);
const { createSessionWriter } = loaded.exports;
const settle = () => new Promise(resolve => setImmediate(resolve));

test('remembered sessions save before identity publication; memory-only sessions remove instead of save', async () => {
  const operations = [];
  const write = createSessionWriter({ set: async value => operations.push(['save', value]), remove: async () => operations.push(['remove']) });
  assert.equal(await write('remembered', () => true, () => operations.push(['publish', 'remembered'])), true);
  assert.equal(await write(null, () => true, () => operations.push(['publish', 'memory-only'])), true);
  assert.deepEqual(operations, [['save', 'remembered'], ['publish', 'remembered'], ['remove'], ['publish', 'memory-only']]);
});

test('a failed storage operation does not publish identity and the queue accepts the next attempt', async () => {
  let failed = true, published = 0;
  const write = createSessionWriter({ set: async () => { if (failed) throw new Error('storage unavailable'); }, remove: async () => undefined });
  await assert.rejects(write('first', () => true, () => published++), /storage unavailable/);
  assert.equal(published, 0);
  failed = false;
  assert.equal(await write('retry', () => true, () => published++), true);
  assert.equal(published, 1);
});

test('an obsolete queued authentication never writes or publishes', async () => {
  let writes = 0, published = 0;
  const write = createSessionWriter({ set: async () => writes++, remove: async () => writes++ });
  assert.equal(await write('obsolete', () => false, () => published++), false);
  assert.equal(writes, 0);
  assert.equal(published, 0);
});

test('an obsolete in-flight save is removed before a newer remembered identity can persist', async () => {
  let current = true, finishSave, stored = null;
  const published = [], operations = [];
  const write = createSessionWriter({
    set: async value => {
      operations.push(`save:${value}`);
      if (value === 'old') await new Promise(resolve => { finishSave = resolve; });
      stored = value;
    },
    remove: async () => { operations.push('remove'); stored = null; },
  });
  const old = write('old', () => current, () => published.push('old'));
  await settle();
  current = false;
  const newer = write('new', () => true, () => published.push('new'));
  finishSave();
  assert.equal(await old, false);
  assert.equal(await newer, true);
  assert.deepEqual(operations, ['save:old', 'remove', 'save:new']);
  assert.deepEqual(published, ['new']);
  assert.equal(stored, 'new');
});
