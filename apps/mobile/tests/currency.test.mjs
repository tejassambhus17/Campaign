import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const m = { exports: {} }; new Function('require', 'module', 'exports', source)(name => { assert.ok(name in modules, `Unexpected ${name}`); return modules[name]; }, m, m.exports); return m.exports;
}
const fx = load('../src/lib/currency.ts'), types = load('../src/lib/types.ts');
// Deliberately fixed fixture, not the moving public response or an application default.
const now = Date.parse('2026-10-17T12:00:00Z');
const rate = fx.parseReferenceRate({ base: 'USD', quote: 'INR', rate: 83.25, date: '2026-10-16' }, '2026-10-17T09:00:00Z', now);
const inr = fx.freezeMoneySnapshot('INR', rate, now), usd = fx.freezeMoneySnapshot('USD', null, now);
function memory(initial = {}) { const data = new Map(Object.entries(initial)), reads = [], writes = []; return { data, reads, writes, async getItem(key) { reads.push(key); return data.get(key) ?? null; }, async setItem(key, value) { writes.push(key); data.set(key, value); } }; }
const tick = () => new Promise(resolve => setImmediate(resolve));

test('missing/invalid currency is USD, never selected from locale, and USD needs no rate request', async () => {
  for (const value of [undefined, null, '', 'usd', 'EUR', 'bad']) assert.equal(fx.normalizeCurrency(value), 'USD');
  const storage = memory({ [fx.CURRENCY_KEY]: 'invalid' });
  const store = fx.createCurrencyStore(storage, async () => assert.fail('USD makes no FX request'), () => now);
  await store.restore(); assert.equal(store.getSnapshot().preference, 'USD'); assert.equal(store.getSnapshot().ready, true);
  assert.deepEqual(storage.reads, [fx.CURRENCY_KEY, fx.RATE_KEY]);
});
test('INR preference and actual reference date survive restart, isolated from appearance/account/drafts', async () => {
  const storage = memory({ [fx.RATE_KEY]: JSON.stringify(rate), unrelated: 'original' }); let requests = 0;
  const fetch = async () => { requests++; assert.fail('fresh cache should not refetch'); };
  const store = fx.createCurrencyStore(storage, fetch, () => now); await store.restore(); await store.setPreference('INR');
  const restarted = fx.createCurrencyStore(storage, fetch, () => now); await restarted.restore();
  assert.equal(restarted.getSnapshot().preference, 'INR'); assert.equal(restarted.getSnapshot().rate.date, '2026-10-16'); assert.equal(restarted.getSnapshot().rate.cached, true); assert.equal(requests, 0);
  await restarted.setPreference('USD'); assert.equal(storage.data.get('unrelated'), 'original'); assert.ok(storage.writes.every(key => key === fx.CURRENCY_KEY));
});
test('concurrent rate requests deduplicate and send only a static currency-pair URL', async () => {
  let resolve, calls = 0;
  const pending = new Promise(r => { resolve = r; }); const storage = memory();
  const store = fx.createCurrencyStore(storage, async url => { calls++; assert.equal(url, 'https://api.frankfurter.dev/v2/rate/USD/INR'); return pending; }, () => now);
  await store.restore(); const first = store.refreshRate(), second = store.refreshRate(true);
  assert.equal(first, second); assert.equal(calls, 1);
  resolve({ ok: true, json: async () => ({ base: 'USD', quote: 'INR', rate: 83.25, date: '2026-10-16' }) }); await first;
  assert.equal(store.getSnapshot().rate.fetchedAt, '2026-10-17T12:00:00.000Z'); assert.equal(store.getSnapshot().rate.date, '2026-10-16');
  await store.refreshRate(); assert.equal(calls, 1);
});
test('invalid, reversed, fabricated and future rates fail closed', () => {
  for (const patch of [{ quote: 'USD' }, { base: 'INR' }, { rate: -1 }, { rate: Infinity }, { rate: '83' }, { date: '2026-02-30' }, { date: '2099-01-01' }]) assert.equal(fx.parseReferenceRate({ ...rate, ...patch }, rate.fetchedAt, now), null);
});
test('stale and unavailable references preserve observation dates and never label raw USD as rupees', async () => {
  const old = { ...rate, date: '2026-10-12', fetchedAt: '2026-10-12T12:00:00Z' };
  const storage = memory({ [fx.RATE_KEY]: JSON.stringify(old), [fx.CURRENCY_KEY]: 'INR' });
  const store = fx.createCurrencyStore(storage, async () => { throw new Error('offline'); }, () => now);
  await store.restore(); await tick(); assert.equal(store.getSnapshot().rate.date, old.date);
  assert.equal(fx.rateStale(store.getSnapshot().rate, now), true); assert.match(store.getSnapshot().error, /dated cached/);
  assert.match(fx.referenceDescription(fx.freezeMoneySnapshot('INR', old, now), now), /2026-10-12.*cached\/stale/);
  const expired = fx.freezeMoneySnapshot('INR', { ...old, date: '2026-09-01' }, now);
  assert.equal(expired.unavailable, true); assert.equal(fx.formatMoney(25, expired), '$25 USD'); assert.doesNotMatch(fx.formatMoney(25, expired), /₹/); assert.match(fx.referenceDescription(expired), /unavailable/);
});
test('integer minor-unit conversion has correct direction, zero, fractional, negative and Indian grouping', () => {
  assert.equal(fx.convertMinor(2500, 83.25, 'toINR'), 208125);
  assert.equal(fx.convertMinor(208125, 83.25, 'toUSD'), 2500);
  assert.equal(fx.formatMoney(0, inr), '₹0'); assert.equal(fx.formatMoney(1.23, inr), '₹102.40');
  assert.equal(fx.formatMoney(100000, inr), '₹83,25,000'); assert.equal(fx.formatMoney(100000, usd), '$100,000');
  assert.equal(fx.formatMoney(-5, inr), '-₹416.25');
  assert.ok(Number.isNaN(fx.convertMinor(Number.MAX_SAFE_INTEGER + 1, 83.25, 'toINR')));
});
test('entry accepts selected currency once, rejects invalid inputs, and preserves canonical limits', () => {
  assert.equal(fx.usdFromInput('2081.25', inr), 25); assert.equal(fx.inputForUsd(25, inr), '2081.25');
  assert.equal(fx.usdFromInput('83.25', inr), 1); assert.equal(fx.usdFromInput('832500', inr), 10000);
  assert.equal(fx.usdFromInput('0.83', inr), 0.01); assert.equal(fx.inputForUsd(0, inr), '');
  assert.equal(fx.moneyInputWithinLimits('83.24', inr, 1, 10000), false); assert.equal(fx.moneyInputWithinLimits('83.25', inr, 1, 10000), true);
  assert.equal(fx.moneyInputWithinLimits('832500.01', inr, 1, 10000), false);
  for (const value of ['', '-', '1,000', 'NaN', '1.234', '1e3', '1.']) assert.equal(fx.usdFromInput(value, inr), null);
});
test('preference round trips never convert the ledger or change reach, counts or percentages', () => {
  const campaign = { goal: 100, raised: 25, contributionCount: 1, days: 14, status: 'Available for Funding' }; const before = JSON.stringify(campaign);
  const q = types.quote(25, { feeRate: 0.05, peoplePerAdDollar: 27 });
  for (let i = 0; i < 50; i++) { fx.formatMoney(campaign.goal, inr); fx.formatMoney(campaign.raised, usd); fx.formatMoney(q.fee, inr); }
  assert.equal(JSON.stringify(campaign), before); assert.equal(q.reach, 641); assert.equal(q.adBudget, 23.75); assert.equal(q.fee, 1.25);
  assert.equal(fx.formatMoney(q.fee, inr), '₹104.06'); assert.equal(fx.formatMoney(q.total, inr), '₹2,081.25');
});
test('frozen entry/payment reference is copied and cannot silently refresh or reinterpret an amount', () => {
  const source = { ...rate }, snapshot = fx.freezeMoneySnapshot('INR', source, now), text = fx.inputForUsd(25, snapshot);
  source.rate = 99; const newPreference = fx.freezeMoneySnapshot('USD', null, now);
  assert.equal(fx.usdFromInput(text, snapshot), 25); assert.equal(fx.formatMoney(25, snapshot), '₹2,081.25'); assert.equal(fx.formatMoney(25, newPreference), '$25'); assert.equal(snapshot.rate.rate, 83.25);
});
test('device goal entry preserves original INR text/rate on resume and rejects inconsistent metadata', () => {
  const entry = { raw: '2081.25', canonicalUsd: 25, snapshot: inr };
  const resumed = fx.restoreMoneyEntry(JSON.parse(JSON.stringify(entry)), 25, usd);
  assert.equal(resumed.raw, entry.raw); assert.equal(resumed.snapshot.currency, 'INR'); assert.equal(resumed.snapshot.rate.rate, 83.25); assert.equal(resumed.snapshot.rate.date, '2026-10-16');
  assert.equal(fx.restoreMoneyEntry({ ...entry, canonicalUsd: 999 }, 25, usd).snapshot.currency, 'USD');
  assert.equal(fx.restoreMoneyEntry({ ...entry, raw: '100000' }, 25, usd).raw, '25');
});
test('failed preference persistence remains honest and ordered writes retain latest choice', async () => {
  const storage = memory({ [fx.RATE_KEY]: JSON.stringify(rate) }); const store = fx.createCurrencyStore(storage, async () => assert.fail('fresh cache'), () => now);
  await store.restore(); await Promise.all([store.setPreference('INR'), store.setPreference('USD')]); assert.equal(storage.data.get(fx.CURRENCY_KEY), 'USD');
  const broken = fx.createCurrencyStore({ getItem: async () => null, setItem: async () => { throw new Error('disk'); } }, async () => { throw new Error('network'); }, () => now);
  await broken.restore(); await assert.rejects(broken.setPreference('INR')); assert.match(broken.getSnapshot().error, /could not be saved/);
});

const jsx = (type, props) => ({ type, props: props || {} });
function flatten(tree) { if (Array.isArray(tree)) return tree.flatMap(flatten); if (!tree || typeof tree !== 'object') return []; return [tree, ...flatten(tree.props.children)]; }
function hooks() { let cursor = 0; const slots = []; return { reset: () => { cursor = 0; }, useState: initial => { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; } }; }
test('actual Submit goal field retains text/rate through preference rerender and converts only its explicit edit', () => {
  const state = hooks(), updates = []; let selected = { snapshot: inr, preference: 'INR', rate, loading: false };
  const component = load('../src/features/creation/GoalAmountField.tsx', { react: { useState: state.useState }, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' }, '../../components/ui': { Button: 'Button', Text: 'Text', useTheme: () => ({ styles: {} }) }, '../../lib/CurrencyProvider': { useCurrency: () => selected }, '../../lib/currency': fx, './FieldTarget': { TargetField: 'TargetField' }, '../../components/Information': { InfoAction: 'InfoAction' } });
  const render = () => { state.reset(); return flatten(component.GoalAmountField({ value: 25, editable: true, onChange: value => updates.push(value) })); };
  assert.equal(render().find(n => n.type === 'TargetField').props.value, '2081.25');
  selected = { ...selected, snapshot: usd, preference: 'USD', rate: null };
  let field = render().find(n => n.type === 'TargetField'); assert.equal(field.props.value, '2081.25'); assert.match(field.props.label, /INR/);
  field.props.onChangeText('4162.50'); assert.deepEqual(updates, ['50.00']); assert.equal(render().find(n => n.type === 'TargetField').props.value, '4162.50');
});

function goalHarness() {
  const state = hooks(), updates = [];
  let rejectChanges = false;
  let props = { value: 25, entry: undefined, editable: true }, preference = { snapshot: inr, preference: 'INR', rate, loading: false };
  let theme = { styles: { muted: { color: '#aaa' } }, scheme: 'dark' };
  const component = load('../src/features/creation/GoalAmountField.tsx', { react: { useState: state.useState }, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' }, '../../components/ui': { Button: 'Button', Text: 'Text', useTheme: () => theme }, '../../lib/CurrencyProvider': { useCurrency: () => preference }, '../../lib/currency': fx, './FieldTarget': { TargetField: 'TargetField' }, '../../components/Information': { InfoAction: 'InfoAction' } });
  const render = () => { state.reset(); return flatten(component.GoalAmountField({ ...props, onChange: (canonical, entry) => { if (rejectChanges) return false; updates.push({ canonical, entry }); } })); };
  return { render, updates, replace: next => { props = { ...props, ...next }; }, rejectChanges: value => { rejectChanges = value; }, preference: next => { preference = next; }, theme: next => { theme = next; } };
}
test('actual goal field immediately reconciles an external account-version goal replacement on the same mounted editor', () => {
  const h = goalHarness(); assert.equal(h.render().find(n => n.type === 'TargetField').props.value, '2081.25');
  h.replace({ value: 50, entry: undefined });
  let tree = h.render(); assert.equal(tree.find(n => n.type === 'TargetField').props.value, '4162.50');
  assert.match(tree.filter(n => n.type === 'Text').flatMap(n => n.props.children).join(' '), /\$50 USD/);
  assert.equal(h.render().find(n => n.type === 'TargetField').props.value, '4162.50');
  h.replace({ value: 0, entry: undefined }); tree = h.render(); assert.equal(tree.find(n => n.type === 'TargetField').props.value, '');
  assert.deepEqual(h.updates, [], 'Loading an external version must never emit a new goal edit');
});
test('own goal edit acknowledgements preserve exact valid/invalid text and frozen FX across currency and theme rerenders', () => {
  const h = goalHarness(); h.render().find(n => n.type === 'TargetField').props.onChangeText('0004162.50');
  const acknowledged = h.updates.at(-1); assert.equal(acknowledged.canonical, '50.00');
  h.preference({ snapshot: usd, preference: 'USD', rate: null, loading: false });
  h.replace({ value: 50, entry: structuredClone(acknowledged.entry) });
  let field = h.render().find(n => n.type === 'TargetField'); assert.equal(field.props.value, '0004162.50'); assert.match(field.props.label, /INR/);
  h.theme({ styles: { muted: { color: '#444' } }, scheme: 'light' });
  field = h.render().find(n => n.type === 'TargetField'); assert.equal(field.props.value, '0004162.50'); assert.match(field.props.label, /INR/);
  field.props.onChangeText('4162.'); const invalid = h.updates.at(-1); assert.equal(invalid.canonical, '');
  h.replace({ value: 0, entry: structuredClone(invalid.entry) });
  field = h.render().find(n => n.type === 'TargetField'); assert.equal(field.props.value, '4162.'); assert.match(field.props.label, /INR/);
  assert.equal(h.render().find(n => n.type === 'TargetField').props.value, '4162.');
  assert.equal(invalid.entry.snapshot.rate.rate, 83.25); assert.equal(invalid.entry.snapshot.rate.date, '2026-10-16');
});

test('a rejected queued goal input never buffers local text and failed-save unlock restores the same amount/reference', () => {
  const h = goalHarness(), before = h.render().find(node => node.type === 'TargetField');
  const queuedNativeChange = before.props.onChangeText;
  h.rejectChanges(true); h.replace({ editable: false, saving: true });
  queuedNativeChange('99999.00');
  let field = h.render().find(node => node.type === 'TargetField');
  assert.equal(field.props.value, '2081.25'); assert.equal(field.props.editable, false);
  assert.match(field.props.hint, /Saving your draft/); assert.doesNotMatch(field.props.hint, /Published/);
  field.props.onChangeText('88888.00');
  h.rejectChanges(false); h.replace({ editable: true, saving: false });
  field = h.render().find(node => node.type === 'TargetField');
  assert.equal(field.props.value, '2081.25'); assert.match(field.props.label, /INR/);
  assert.deepEqual(h.updates, [], 'neither queued nor currently disabled input reaches the draft');
  field.props.onChangeText('4162.50');
  assert.equal(h.updates.at(-1).canonical, '50.00');
  assert.equal(h.render().find(node => node.type === 'TargetField').props.value, '4162.50');
  h.replace({ editable: false, saving: false });
  assert.match(h.render().find(node => node.type === 'TargetField').props.hint, /Published goal locked/);
});

test('a rejected queued currency-reference action cannot change goal text or its frozen reference', () => {
  const h = goalHarness(); h.render();
  h.preference({ snapshot: usd, preference: 'USD', rate: null, loading: false });
  const queuedPreference = h.render().find(node => node.props.title === 'Use current USD preference').props.onPress;
  h.rejectChanges(true); h.replace({ editable: false, saving: true });
  queuedPreference();
  let field = h.render().find(node => node.type === 'TargetField');
  assert.equal(field.props.value, '2081.25'); assert.match(field.props.label, /INR/); assert.deepEqual(h.updates, []);
  h.rejectChanges(false); h.replace({ editable: true, saving: false });
  h.render().find(node => node.props.title === 'Use current USD preference').props.onPress();
  field = h.render().find(node => node.type === 'TargetField');
  assert.equal(field.props.value, '25'); assert.match(field.props.label, /USD/);
  assert.equal(h.updates.at(-1).canonical, '25.00');
});

function checkoutHarness() {
  const state = hooks(), refs = []; let refIndex = 0, calls = [], resolvePayment, refreshes = 0;
  let preference = { snapshot: inr, preference: 'INR', rate, loading: false };
  const config = { data: { feeRate: 0.05, peoplePerAdDollar: 27, policies: {} }, isError: false };
  const campaign = { id: 'qa-campaign', title: 'Disposable QA', creatorName: 'QA', campaignState: 'Available for Funding', goal: 100, raised: 0 };
  const ui = Object.fromEntries(['Text', 'Button', 'IconButton', 'PageHeader', 'ErrorState', 'Loading', 'Notice', 'Pill', 'Screen'].map(name => [name, name]));
  const presetState = hooks(), presetRefs = []; let presetRefIndex = 0;
  const { ContributionPresets } = load('../src/features/contributions/ContributionPresets.tsx', {
    react: { useState: presetState.useState, useRef: initial => { const i = presetRefIndex++; if (!(i in presetRefs)) presetRefs[i] = { current: initial }; return presetRefs[i]; } },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { View: 'View', ScrollView: 'ScrollView', Pressable: 'Pressable', useWindowDimensions: () => ({ width: 393, fontScale: 1.17 }) },
    '../../components/ui': { Text: 'Text', fonts: { bold: 'ManropeBold' }, useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }) }) },
    './presetLayout': load('../src/features/contributions/presetLayout.ts'),
  });
  const component = load('../src/app/(tabs)/explore/[id]/back.tsx', {
    react: { useState: state.useState, useCallback: fn => fn, useRef: initial => { const i = refIndex++; if (!(i in refs)) refs[i] = { current: initial }; return refs[i]; } },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', ScrollView: 'ScrollView', TextInput: 'TextInput', Pressable: 'Pressable', Keyboard: { dismiss() {} } },
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, 'expo-router': { router: {}, useFocusEffect() {}, useLocalSearchParams: () => ({ id: 'qa-campaign' }) },
    '@tanstack/react-query': { useQuery: () => ({ data: campaign, isPending: false, isError: false }) },
    '../../../../lib/api': { api: async (path, options) => { calls.push({ path, options }); if (path === '/contributions') return new Promise(resolve => { resolvePayment = resolve; }); return {}; } },
    '../../../../lib/types': types, '../../../../lib/session': { useConfig: () => config, refresh: async () => { refreshes++; } }, '../../../../lib/public-campaign': { audienceCampaign: c => c },
    '../../../../components/Information': { InfoSheet: 'InfoSheet', SummaryLink: 'SummaryLink' },
    '../../../../components/ui': { ...ui, fonts: {}, useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }), styles: {}, scheme: 'dark' }) },
    '../../../../features/campaign': { CampaignCover: 'CampaignCover', Disclosures: 'Disclosures', Funding: 'Funding', ShareButton: 'ShareButton' },
    '../../../../features/contributions/ContributionPresets': { ContributionPresets },
    '../../../../lib/CurrencyProvider': { useCurrency: () => preference }, '../../../../lib/currency': fx,
  });
  const render = () => {
    state.reset(); refIndex = 0; presetState.reset(); presetRefIndex = 0;
    return flatten(component.default()).flatMap(node => node.type === ContributionPresets ? flatten(ContributionPresets(node.props)) : [node]);
  };
  const text = tree => tree.filter(n => n.type === 'Text' || n.type === 'Notice').flatMap(n => n.props.children).filter(v => typeof v === 'string').join(' ');
  return { render, text, calls, config, refreshes: () => refreshes, resolvePayment: payment => resolvePayment(payment), preference: value => { preference = value; } };
}
test('actual checkout converts presets and custom INR once, freezes reference/fees through Review, and blocks duplicate in-flight payments', async () => {
  const h = checkoutHarness(); let tree = h.render();
  assert.equal(tree.find(n => n.type === 'TextInput').props.value, '2081.25'); assert.match(tree.find(n => n.type === 'TextInput').props.accessibilityLabel, /INR/);
  assert.ok(tree.some(n => n.props.accessibilityLabel === '₹416.25 contribution'));
  tree.find(n => n.props.accessibilityLabel === '₹416.25 contribution').props.onPress();
  tree = h.render(); assert.equal(tree.find(n => n.type === 'TextInput').props.value, '416.25');
  tree.find(n => n.props.accessibilityLabel === '₹2,081.25 contribution').props.onPress();
  tree = h.render(); assert.equal(tree.find(n => n.type === 'TextInput').props.value, '2081.25');
  tree.find(n => n.props.title === 'Continue to payment').props.onPress();
  h.preference({ snapshot: usd, preference: 'USD', rate: null });
  tree = h.render(); assert.match(h.text(tree), /₹2,081.25/); assert.match(h.text(tree), /Platform fee \(5% included\)/); assert.match(h.text(tree), /641 people/);
  const pay = tree.find(n => n.props.title === 'Pay ₹2,081.25 · demo'); assert.ok(pay);
  const first = pay.props.onPress(), duplicate = pay.props.onPress(); await tick();
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0].options.body.amount, 25); assert.equal(h.calls[0].options.body.outcome, 'successful'); assert.ok(h.calls[0].options.body.idempotencyKey);
  h.resolvePayment({ id: 'qa-payment', campaignId: 'qa-campaign', title: 'Disposable QA', status: 'successful', amount: 25, total: 25, fee: 1.25, adBudget: 23.75, reach: 641, receipt: { id: 'qa-receipt', url: '/receipts/qa-payment' } }); await Promise.all([first, duplicate]);
  assert.equal(h.refreshes(), 1); assert.match(h.text(h.render()), /Original recorded contribution:.*\$25.*USD/);
  h.render().find(n => n.props.title === 'Open receipt').props.onPress(); await tick();
  assert.match(h.text(h.render()), /\$25.*USD recorded.*\$1.25.*USD.*\$23.75.*USD/);
});
test('actual checkout invalid custom input disables confirmation and preserves existing USD validation', () => {
  const h = checkoutHarness(); let tree = h.render();
  tree.find(n => n.type === 'TextInput').props.onChangeText('1.234'); tree = h.render();
  assert.equal(tree.find(n => n.props.title === 'Continue to payment').props.disabled, true); assert.match(h.text(tree), /USD \$1–\$10,000/);
  tree.find(n => n.type === 'TextInput').props.onChangeText('83.25'); tree = h.render(); assert.equal(tree.find(n => n.props.title === 'Continue to payment').props.disabled, false);
  assert.equal(h.calls.length, 0);
});
test('checkout policy sheet cancellation preserves the selected amount, frozen currency and Choose stage', () => {
  const h = checkoutHarness(); let tree = h.render();
  const before = tree.find(n => n.type === 'TextInput').props.value;
  assert.equal(tree.find(n => n.type === 'InfoSheet').props.visible, false);
  tree.find(n => n.props.testID === 'contribution-funding-help').props.onPress(); tree = h.render();
  assert.equal(tree.find(n => n.type === 'InfoSheet').props.visible, true);
  tree.find(n => n.type === 'InfoSheet').props.onClose(); tree = h.render();
  assert.equal(tree.find(n => n.type === 'InfoSheet').props.visible, false);
  assert.equal(tree.find(n => n.type === 'TextInput').props.value, before);
  assert.ok(tree.find(n => n.props.title === 'Continue to payment')); assert.deepEqual(h.calls, []);
  tree.find(n => n.props.testID === 'contribution-funding-help').props.onPress(); tree = h.render();
  tree.find(n => n.props.title === 'Continue to payment').props.onPress(); tree = h.render();
  assert.equal(tree.find(n => n.type === 'InfoSheet').props.visible, false);
  assert.ok(tree.find(n => n.props.title === 'Pay ₹2,081.25 · demo')); assert.deepEqual(h.calls, []);
});
test('known funding-policy changes stop confirmation and require a visible second review, without silently refreshing the FX snapshot', async () => {
  const h = checkoutHarness(); h.render().find(n => n.props.title === 'Continue to payment').props.onPress();
  h.config.data = { ...h.config.data, feeRate: 0.20, peoplePerAdDollar: 99 };
  await h.render().find(n => n.props.title === 'Pay ₹2,081.25 · demo').props.onPress();
  assert.equal(h.calls.length, 0); const tree = h.render(); assert.match(h.text(tree), /Funding settings changed/); assert.match(h.text(tree), /Platform fee \(20% included\)/); assert.match(h.text(tree), /₹2,081.25/);
});
