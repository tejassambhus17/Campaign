import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const previousLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { quote } = require('../src/lib/types.ts');
if (previousLoader) require.extensions['.ts'] = previousLoader;
else delete require.extensions['.ts'];

test('included platform fees round in cents before computing the ad budget', () => {
  assert.deepEqual(quote(1.10), { amount: 1.10, total: 1.10, fee: 0.06, adBudget: 1.04, reach: 28 });
  assert.deepEqual(quote(25), { amount: 25, total: 25, fee: 1.25, adBudget: 23.75, reach: 641 });
});
test('configurable delivery assumptions are used consistently', () => {
  assert.deepEqual(quote(100, {feeRate: 0.10, peoplePerAdDollar: 12}), {amount:100,total:100,fee:10,adBudget:90,reach:1080});
});
test('fee and ad budget reconcile to the total for cent-valued contributions', () => {
  for (let cents=100;cents<=100000;cents+=17) {
    const q = quote(cents/100);
    assert.equal(Math.round(q.fee*100)+Math.round(q.adBudget*100), cents);
    assert.equal(q.total,q.amount);
    assert.ok(q.reach >= 0);
  }
});
