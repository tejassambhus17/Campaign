import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', source)(name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, module.exports, module);
  return module.exports;
}
const deletion = load('../src/features/creation/draftDeletion.ts', {});
const fixture = (localId = 'qa-one', campaignId = '') => ({ localId, step: 2, goalInput: '', updatedAt: '2026-10-17T13:00:00Z', draft: { id: campaignId, ownerId: campaignId ? 'owner-a' : '', title: `Disposable ${localId}`, status: 'Draft', sections: [], sources: [], adImages: ['https://example.org/keep.jpg'] } });
const flush = async () => { for (let n = 0; n < 5; n++) await new Promise(resolve => setImmediate(resolve)); };
function hooks() {
  const slots = [], refs = [], effects = [];
  let stateIndex, refIndex, effectIndex, staged;
  return {
    react: {
      useCallback: callback => callback,
      useState: initial => { const i = stateIndex++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
      useRef: initial => { const i = refIndex++; if (!(i in refs)) refs[i] = { current: initial }; return refs[i]; },
      useEffect: (callback, deps) => { const i = effectIndex++, before = effects[i]; if (!before || deps.some((v, n) => v !== before.deps[n])) staged.push(() => { before?.cleanup?.(); effects[i] = { deps, cleanup: callback() }; }); },
    },
    render(fn) { stateIndex = refIndex = effectIndex = 0; staged = []; const result = fn(); staged.forEach(fn => fn()); return result; },
  };
}
function libraryHarness({ scope = 'guest', entries = [fixture(), fixture('qa-other')], data = new Map(), storageSet } = {}) {
  const engine = hooks(), writes = [];
  if (!data.has(`drafts:${scope}`)) data.set(`drafts:${scope}`, JSON.stringify(entries));
  const storage = { getItem: async key => data.get(key) || null, setItem: async (key, value) => { writes.push([key, value]); if (storageSet) await storageSet(key, value); data.set(key, value); } };
  const { useDraftLibrary } = load('../src/features/creation/useDraftLibrary.ts', { react: engine.react, '@react-native-async-storage/async-storage': { default: storage }, '../../lib/api': { draftStorageKey: scope => `drafts:${scope}` }, './draftDeletion': deletion });
  return { data, writes, render(nextScope = scope) { scope = nextScope; return engine.render(() => useDraftLibrary(scope, true)); } };
}

test('eligibility rejects submitted, public/private revisions, wrong accounts and guest account copies', () => {
  const local = fixture(), saved = fixture('qa-account', 'campaign-one');
  assert.equal(deletion.localDeletionTarget(local, 'guest').localId, local.localId);
  assert.equal(deletion.accountDeletionTarget(saved.draft, 'owner-a').campaignId, 'campaign-one');
  assert.equal(deletion.localDeletionTarget(saved, 'guest'), null);
  assert.equal(deletion.localDeletionTarget(saved, 'owner-b'), null);
  assert.equal(deletion.accountDeletionTarget(saved.draft, 'owner-b'), null);
  for (const patch of [{ status: 'Submitted for Review' }, { status: 'Changes Requested' }, { campaignState: 'Available for Funding' }, { revisionPending: true }, { publishedAt: '2026-10-16' }]) {
    assert.equal(deletion.localDeletionTarget({ ...saved, draft: { ...saved.draft, ...patch } }, 'owner-a'), null);
    assert.equal(deletion.accountDeletionTarget({ ...saved.draft, ...patch }, 'owner-a'), null);
  }
});

test('confirmed device deletion persists across restart, rejects late autosave and preserves other drafts/media', async () => {
  const harness = libraryHarness(); harness.render(); await flush(); let library = harness.render();
  const doomed = library.entries[0], other = structuredClone(library.entries[1]);
  await library.deleteDraft(deletion.localDeletionTarget(doomed, 'guest'));
  library = harness.render(); assert.deepEqual(library.entries, [other]); assert.equal(library.canSave(doomed), false);
  await assert.rejects(library.save(doomed), /deleted/);
  const restarted = libraryHarness({ data: harness.data }); restarted.render(); await flush();
  assert.deepEqual(restarted.render().entries, [other]);
  assert.deepEqual(other.draft.adImages, ['https://example.org/keep.jpg']);
});

test('account failure keeps every local copy and requires explicit retry instead of queuing deletion', async () => {
  const copies = [fixture('qa-one', 'campaign-one'), fixture('qa-copy', 'campaign-one'), fixture('qa-other')];
  const harness = libraryHarness({ scope: 'owner-a', entries: copies }); harness.render(); await flush(); const library = harness.render();
  const target = deletion.localDeletionTarget(copies[0], 'owner-a'); let calls = 0;
  await assert.rejects(library.deleteDraft(target, async () => { calls++; throw new Error('offline fixture'); }), /offline/);
  assert.equal(calls, 1); assert.equal(harness.writes.length, 0); assert.deepEqual(harness.render().entries, copies); assert.equal(library.canSave(copies[0]), true);
  await assert.rejects(library.deleteDraft(target), /confirmed server/);
});

test('confirmed account deletion removes all corresponding device copies and not unrelated content', async () => {
  const copies = [fixture('qa-one', 'campaign-one'), fixture('qa-copy', 'campaign-one'), fixture('qa-other')];
  const harness = libraryHarness({ scope: 'owner-a', entries: copies }); harness.render(); await flush(); const library = harness.render();
  let remote = 0; await library.deleteDraft(deletion.accountDeletionTarget(copies[0].draft, 'owner-a'), async () => { remote++; });
  assert.equal(remote, 1); assert.deepEqual(harness.render().entries, [copies[2]]);
  await assert.rejects(library.save(copies[1]), /deleted/);
  const restarted = libraryHarness({ scope: 'owner-a', data: harness.data }); restarted.render(); await flush();
  assert.deepEqual(restarted.render().entries, [copies[2]]);
});

test('pending deletion blocks a delayed autosave while an earlier device write finishes', async () => {
  let release; const gate = new Promise(resolve => release = resolve); let held = false;
  const harness = libraryHarness({ storageSet: async key => { if (!held && key === 'drafts:guest') { held = true; await gate; } } });
  harness.render(); await flush(); const library = harness.render(), doomed = library.entries[0];
  const priorSave = library.save({ ...doomed, updatedAt: '2026-10-17T13:01:00Z' }); await flush();
  const deleting = library.deleteDraft(deletion.localDeletionTarget(doomed, 'guest'));
  assert.equal(library.canSave(doomed), false); await assert.rejects(library.save(doomed), /being deleted/);
  release(); await priorSave; await deleting;
  assert.equal(harness.render().entries.some(entry => entry.localId === doomed.localId), false);
  assert.equal(JSON.parse(harness.data.get('drafts:guest')).some(entry => entry.localId === doomed.localId), false);
});

test('durable deletion marker prevents resurrection if final array cleanup fails', async () => {
  const harness = libraryHarness({ storageSet: async key => { if (key === 'drafts:guest') throw new Error('fixture storage failure'); } });
  harness.render(); await flush(); const library = harness.render(), doomed = library.entries[0];
  await assert.rejects(library.deleteDraft(deletion.localDeletionTarget(doomed, 'guest')), /storage failure/);
  assert.equal(library.canSave(doomed), false);
  const restarted = libraryHarness({ data: harness.data }); restarted.render(); await flush();
  assert.equal(restarted.render().entries.some(entry => entry.localId === doomed.localId), false);
});

test('workspace change rejects old save/delete closures and keeps guest/account storage separate', async () => {
  const harness = libraryHarness(); harness.render(); await flush(); const guest = harness.render(), draft = guest.entries[0];
  harness.data.set('drafts:owner-b', JSON.stringify([fixture('qa-owner-b')]));
  harness.render('owner-b'); await flush(); const account = harness.render();
  await assert.rejects(guest.save(draft), /deleted|workspace/);
  await assert.rejects(guest.deleteDraft(deletion.localDeletionTarget(draft, 'guest')), /workspace/);
  assert.deepEqual(account.entries.map(entry => entry.localId), ['qa-owner-b']);
  assert.equal(JSON.parse(harness.data.get('drafts:guest')).length, 2);
});

function deletionHarness({ fail, entries = [fixture()], scope = 'guest' } = {}) {
  const engine = hooks(), events = [], apiCalls = [], lib = libraryHarness({ scope, entries });
  let library; lib.render();
  class ApiError extends Error { constructor(message, status) { super(message); this.status = status; } }
  const api = async (path, options) => { apiCalls.push([path, options]); if (fail) throw fail === 'missing' ? new ApiError('not deployed', 405) : new Error('offline fixture'); return { deleted: true, scope: 'account', campaignId: entries[0].draft.id }; };
  const jsx = (type, props) => ({ type, props: props || {} });
  const modules = {
    react: engine.react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { AccessibilityInfo: { announceForAccessibility: message => events.push(['announce', message]) }, useWindowDimensions: () => ({ height: 800 }), View: 'View', Modal: 'Modal', ScrollView: 'ScrollView', Pressable: 'Pressable', ActivityIndicator: 'ActivityIndicator' },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 28, bottom: 24 }) },
    '../../components/ui': { Text: 'Text', useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }) }) },
    '../../lib/api': { api, ApiError }, '../../lib/session': { queryClient: { cancelQueries: async (...args) => events.push(['cancel stale cache', ...args]), removeQueries: (...args) => events.push(['remove detail cache', ...args]), setQueryData: (...args) => events.push(['cache', ...args]) }, refresh: async () => events.push(['refresh']) }, './draftDeletion': deletion,
  };
  const { useDraftDeletion, DraftDeleteDialog } = load('../src/features/creation/DraftDeleteDialog.tsx', modules);
  return { events, apiCalls, lib, dialog: controls => engine.render(() => DraftDeleteDialog({ deletion: controls })), async ready() { await flush(); library = lib.render(); }, render() { return engine.render(() => useDraftDeletion({ scope, library, disabled: false, onDeleted: target => events.push(['deleted', target]) })); } };
}
const flatten = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(flatten) : [tree, ...flatten(tree.props?.children)];
test('confirmation uses actual title/scope; Cancel does not delete or activate Resume', async () => {
  const harness = deletionHarness(); await harness.ready(); let controls = harness.render();
  controls.requestLocal(harness.lib.render().entries[0]); controls = harness.render();
  assert.equal(controls.target.title, 'Disposable qa-one');
  const dialog = harness.dialog(controls), labels = flatten(dialog).filter(n => n.type === 'Text').flatMap(n => n.props.children).join(' ');
  assert.match(labels, /device-only draft/); assert.match(labels, /Account drafts and uploaded media are kept/);
  flatten(dialog).find(n => n.props.accessibilityLabel === 'Cancel draft deletion').props.onPress();
  controls = harness.render(); assert.equal(controls.target, null); assert.equal(harness.apiCalls.length, 0); assert.equal(harness.events.length, 0);
  assert.equal(harness.lib.render().entries.length, 1);
});
test('account confirmation failure is honest and never calls success or removes the device copy', async () => {
  const harness = deletionHarness({ fail: 'missing', scope: 'owner-a', entries: [fixture('qa-one', 'campaign-one')] }); await harness.ready();
  let controls = harness.render(); controls.requestLocal(harness.lib.render().entries[0]); controls = harness.render();
  const a = controls.confirm(), b = controls.confirm(); await Promise.all([a, b]);
  controls = harness.render(); assert.equal(harness.apiCalls.length, 1); assert.match(controls.error, /unavailable on this server/); assert.match(controls.error, /Device copies were kept/);
  assert.equal(controls.busy, false); assert.equal(harness.lib.render().entries.length, 1); assert.equal(harness.events.some(([name]) => name === 'deleted'), false);
});
test('account success updates recipient cache and calls editor cleanup only after server/device success', async () => {
  const harness = deletionHarness({ scope: 'owner-a', entries: [fixture('qa-one', 'campaign-one')] }); await harness.ready();
  let controls = harness.render(); controls.requestLocal(harness.lib.render().entries[0]); controls = harness.render();
  await controls.confirm(); controls = harness.render(); assert.equal(controls.target, null); assert.equal(controls.busy, false);
  assert.equal(harness.apiCalls[0][0], '/campaigns/campaign-one/draft'); assert.equal(harness.apiCalls[0][1].method, 'DELETE');
  assert.equal(harness.lib.render().entries.length, 0); assert.equal(harness.events.filter(([name]) => name === 'deleted').length, 1);
  const cache = harness.events.find(([name]) => name === 'cache'); assert.deepEqual(cache[1], ['me', 'owner-a']);
  assert.deepEqual(cache[2]({ campaigns: [{ id: 'campaign-one' }, { id: 'other' }] }).campaigns, [{ id: 'other' }]);
});
