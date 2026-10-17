import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = ts.transpileModule(readFileSync(new URL('../src/lib/api.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const server = 'https://campaign-demo.onrender.com'; // No network requests in these tests.
function load(env = {}, timers = {}) {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', '__DEV__', 'process', 'setTimeout', 'clearTimeout', source)(
    name => { assert.equal(name, 'react-native'); return { Platform: { OS: 'android' } }; },
    module, module.exports, false, { env }, timers.setTimeout || setTimeout, timers.clearTimeout || clearTimeout,
  );
  return module.exports;
}
const cloud = (url = server, timers = {}) => load({ EXPO_PUBLIC_CLOUD_BUILD: '1', EXPO_PUBLIC_API_URL: url }, timers);
const invalid = ['', 'http://campaign-demo.onrender.com', 'https://127.0.0.1:8787', 'https://10.0.2.2', 'https://192.168.1.2', 'https://[::1]', 'https://localhost', 'https://campaign.local', 'https://host.internal', 'https://host.invalid', 'https://host.test', 'https://host.lan', 'https://host.home.arpa', 'https://example.com', 'https://api.example.org', 'https://one', 'https://user:secret@campaign-demo.onrender.com', `${server}?key=value`, `${server}#fragment`, `${server}?`, `${server}#`];

test('cloud configuration rejects local/HTTP/unsafe hosts before any request and cannot switch servers', () => {
  for (const value of invalid) assert.throws(() => cloud(value), /public HTTPS/);
  const api = cloud();
  assert.equal(api.getApiUrl(), server);
  assert.equal(api.normalizeCloudApiUrl(` ${server}/api/ `), `${server}/api`);
  assert.throws(() => api.setApiUrl('https://other.onrender.com'), /configured Campaign/);
  assert.throws(() => api.setApiUrl('http://127.0.0.1:8787'), /public HTTPS/);
  api.setApiUrl(`${server}/`);
  assert.equal(api.getApiUrl(), server);
});

test('direct cloud environment initialization canonicalizes case, port and trailing slash before requests or storage keys', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const api = cloud(' HTTPS://CAMPAIGN-DEMO.ONRENDER.COM:443/api/ ');
  const canonical = cloud(`${server}/api`);
  assert.equal(api.getApiUrl(), `${server}/api`);
  assert.equal(api.getSessionStorageKey(), canonical.getSessionStorageKey());
  assert.equal(api.draftStorageKey('owner'), canonical.draftStorageKey('owner'));
  globalThis.fetch = async url => {
    assert.equal(url, `${server}/api/health`);
    return Response.json({ ok: true });
  };
  assert.deepEqual(await api.api('/health'), { ok: true });
});

test('cloud session and draft keys isolate origins and base paths while preserving local keys', () => {
  const local = load();
  assert.equal(local.getSessionStorageKey(), 'campaign-session');
  assert.equal(local.draftStorageKey('same-owner'), 'campaign-creation-v1:same-owner');
  const first = cloud();
  const other = cloud('https://other.onrender.com');
  const path = cloud(`${server}/api`);
  assert.match(first.getSessionStorageKey(), /^[\w.-]+$/);
  assert.notEqual(first.getSessionStorageKey(), local.getSessionStorageKey());
  assert.equal(first.getSessionStorageKey(), cloud().getSessionStorageKey());
  assert.equal(new Set([first, other, path].map(api => api.getSessionStorageKey())).size, 3);
  assert.equal(new Set([first, other, path].map(api => api.draftStorageKey('same-owner'))).size, 3);
  assert.notEqual(first.draftStorageKey('same-owner'), local.draftStorageKey('same-owner'));
  assert.notEqual(first.draftStorageKey('guest'), local.draftStorageKey('guest'));
});

test('the real cloud draft library reads and claims only its environment, keeping legacy account/guest drafts intact', async () => {
  const api = cloud(), owner = 'same-seeded-owner';
  const draft = id => ({ localId: id, draft: { sections: [], sources: [], title: id } });
  const localGuest = JSON.stringify([draft('local-guest')]), localOwn = JSON.stringify([draft('local-account')]);
  const values = new Map([
    ['campaign-creation-v1:guest', localGuest], ['campaign-creation-v1:' + owner, localOwn],
    [api.draftStorageKey('guest'), JSON.stringify([draft('cloud-guest')])],
    [api.draftStorageKey(owner), JSON.stringify([draft('cloud-account')])],
  ]);
  const states = [], effects = [];
  const deletionModule = { exports: {} };
  const deletionSource = ts.transpileModule(readFileSync(new URL('../src/features/creation/draftDeletion.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('require', 'module', 'exports', deletionSource)(name => assert.fail(`Unexpected deletion helper dependency ${name}`), deletionModule, deletionModule.exports);
  const adapters = {
    react: { useCallback: value => value, useRef: value => ({ current: value }),
      useState: initial => { const index = states.length; states.push(initial); return [initial, value => { states[index] = value; }]; },
      useEffect: effect => effects.push(effect) },
    '@react-native-async-storage/async-storage': { default: { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } } },
    '../../lib/api': api,
    './draftDeletion': deletionModule.exports,
  };
  const compiled = ts.transpileModule(readFileSync(new URL('../src/features/creation/useDraftLibrary.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(name => { assert.ok(name in adapters, name); return adapters[name]; }, module, module.exports);
  const library = module.exports.useDraftLibrary(owner, true);
  effects.forEach(effect => effect());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(states[0][0].localId, 'cloud-account');
  await library.claimGuest(draft('cloud-guest'));
  assert.deepEqual(JSON.parse(values.get(api.draftStorageKey(owner))).map(entry => entry.localId), ['cloud-guest', 'cloud-account']);
  assert.deepEqual(JSON.parse(values.get(api.draftStorageKey('guest'))), []);
  assert.equal(values.get('campaign-creation-v1:guest'), localGuest);
  assert.equal(values.get('campaign-creation-v1:' + owner), localOwn);
});

function clock() {
  let now = 0, next = 0;
  const tasks = new Map();
  return {
    setTimeout: (fn, delay) => { const id = ++next; tasks.set(id, { fn, at: now + delay }); return id; },
    clearTimeout: id => tasks.delete(id),
    advance: ms => { now += ms; for (const [id, task] of [...tasks]) if (task.at <= now) { tasks.delete(id); task.fn(); } },
    get pending() { return tasks.size; },
  };
}
test('a sleeping backend can reply after 60 seconds within the bounded 90-second budget', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const timers = clock(), api = cloud(server, timers);
  let respond, signal, calls = 0;
  globalThis.fetch = async (_url, options) => { calls++; signal = options.signal; return new Promise(resolve => { respond = resolve; }); };
  const result = api.api('/campaigns');
  timers.advance(60_000);
  assert.equal(signal.aborted, false);
  respond(Response.json([{ id: 'awake' }]));
  assert.deepEqual(await result, [{ id: 'awake' }]);
  assert.equal(calls, 1);
  assert.equal(timers.pending, 0);
  assert.equal(api.requestTimeoutMs, 90_000);
  assert.equal(load().requestTimeoutMs, 15_000);
});

test('cloud timeout preserves identity, never replays writes and permits an explicit safe read retry', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const timers = clock(), api = cloud(server, timers);
  api.setToken('fictional-test-token');
  let calls = 0, expired = 0;
  api.onSessionExpired(async () => { expired++; });
  globalThis.fetch = async (_url, options) => {
    calls++;
    assert.equal(options.headers.Authorization, 'Bearer fictional-test-token');
    return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  };
  for (const path of ['/contributions', '/campaigns/fictional/submit']) {
    const result = api.api(path, { method: 'POST', body: { idempotencyKey: 'same-manual-attempt' } });
    timers.advance(89_999);
    assert.equal(timers.pending, 1);
    timers.advance(1);
    await assert.rejects(result, /result may still be pending/);
    assert.equal(timers.pending, 0);
  }
  assert.equal(calls, 2, 'one request per explicit write; no automatic replay');
  assert.equal(expired, 0);
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer fictional-test-token');
    return Response.json({ ok: true });
  };
  assert.deepEqual(await api.api('/health'), { ok: true });
});

test('media bearers go only to the exact API-owned image proxy, including an API base path', () => {
  const api = cloud(`${server}/v1`);
  api.setToken('private-image-test-token');
  const image = `/media/img_${'a'.repeat(24)}.jpg`;
  for (const value of [image, `${server}/v1${image}`]) {
    const result = api.mediaImageSource(value);
    assert.equal(new URL(result.uri).origin, server);
    assert.equal(new URL(result.uri).pathname, `/v1${image}`);
    assert.ok(new URL(result.uri).searchParams.has('view'));
    assert.equal(result.headers.Authorization, 'Bearer private-image-test-token');
    assert.equal(result.cache, 'reload');
  }
  for (const value of [
    `https://images.example.org${image}`, `https://campaign-demo.onrender.com.evil.org/v1${image}`,
    `https://user@campaign-demo.onrender.com/v1${image}`, `https://@campaign-demo.onrender.com/v1${image}`, `http://campaign-demo.onrender.com/v1${image}`,
    `${server}${image}`, `${server}/v10${image}`, `${server}/v1${image}?token=other`, `${server}/v1${image}#fragment`, `${server}/v1${image}?`, `${server}/v1${image}#`,
    `/media/img_${'a'.repeat(23)}.jpg`, `/media/img_${'a'.repeat(24)}.png`, `/media/img_${'A'.repeat(24)}.jpg`,
    `file:///private${image}`, 'data:image/jpeg;base64,abc',
  ]) assert.equal(api.mediaImageSource(value).headers, undefined, value);
});

test('image subscriptions and native cache URIs change on logout and account replacement without exposing tokens', () => {
  const api = cloud(), image = `/media/img_${'b'.repeat(24)}.jpg`;
  let changes = 0;
  const unsubscribe = api.subscribeApiSession(() => changes++);
  api.setToken('account-a-secret');
  const a = api.mediaImageSource(image);
  api.setToken(null);
  const guest = api.mediaImageSource(image);
  api.setToken('account-b-secret');
  const b = api.mediaImageSource(image);
  assert.equal(new Set([a.uri, guest.uri, b.uri]).size, 3);
  assert.equal(guest.headers, undefined);
  assert.equal(b.headers.Authorization, 'Bearer account-b-secret');
  assert.equal(changes, 3);
  for (const value of [a.uri, guest.uri, b.uri]) assert.doesNotMatch(value, /secret|Bearer/);
  unsubscribe(); api.setToken(null);
  assert.equal(changes, 3);
});

test('browser private image loading uses a guarded bearer fetch and a revocable blob, never a token URL', async t => {
  const original = globalThis.fetch, oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL;
  t.after(() => { globalThis.fetch = original; URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke; });
  const api = cloud(), image = `/media/img_${'c'.repeat(24)}.jpg`;
  api.setToken('private-browser-token');
  const revoked = [];
  URL.createObjectURL = blob => { assert.equal(blob.type, 'image/jpeg'); return 'blob:private-test-image'; };
  URL.revokeObjectURL = uri => revoked.push(uri);
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.doesNotMatch(url, /private-browser-token/);
    assert.equal(options.headers.Authorization, 'Bearer private-browser-token');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    return new Response(new Blob(['fictional pixels'], { type: 'image/jpeg' }));
  };
  const loaded = await api.loadPrivateWebImage(image, new AbortController().signal);
  assert.equal(loaded.uri, 'blob:private-test-image');
  loaded.dispose(); loaded.dispose();
  assert.deepEqual(revoked, ['blob:private-test-image']);
  await assert.rejects(api.loadPrivateWebImage(`https://third-party.example.org${image}`, new AbortController().signal), /unavailable/);
  assert.equal(calls, 1, 'third-party image must not receive a guarded fetch or bearer');
  URL.createObjectURL = undefined;
  await assert.rejects(api.loadPrivateWebImage(image, new AbortController().signal), /unavailable/);
  assert.equal(calls, 1, 'a native runtime without browser blob support is never invoked');
});

test('a cancelled or old-account browser image cannot allocate a blob after its response arrives', async t => {
  const original = globalThis.fetch, oldCreate = URL.createObjectURL;
  t.after(() => { globalThis.fetch = original; URL.createObjectURL = oldCreate; });
  const api = cloud(), image = `/media/img_${'d'.repeat(24)}.jpg`;
  let respond, receivedSignal, allocations = 0;
  URL.createObjectURL = () => { allocations++; return 'blob:must-not-create'; };
  globalThis.fetch = async (_url, options) => { receivedSignal = options.signal; return new Promise(resolve => { respond = resolve; }); };
  for (const cancel of ['unmount', 'logout']) {
    api.setToken('old-account');
    const controller = new AbortController();
    const pending = api.loadPrivateWebImage(image, controller.signal);
    if (cancel === 'unmount') controller.abort(); else api.setToken(null);
    assert.equal(receivedSignal.aborted, cancel === 'unmount');
    respond(new Response(new Blob(['old private pixels'], { type: 'image/jpeg' })));
    await assert.rejects(pending, /request changed/);
  }
  assert.equal(allocations, 0);
});

test('the actual web Picture cleanup revokes the loaded private blob when the account signs out', async t => {
  const original = globalThis.fetch, oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL;
  t.after(() => { globalThis.fetch = original; URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke; });
  const api = cloud(), slots = [], cleanups = new Map();
  let position = 0, queued = [], revoked = [];
  URL.createObjectURL = () => 'blob:picture-private';
  URL.revokeObjectURL = uri => revoked.push(uri);
  globalThis.fetch = async () => new Response(new Blob(['pixels'], { type: 'image/jpeg' }));
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState: initial => { const index = position++; if (!(index in slots)) slots[index] = initial; return [slots[index], value => { slots[index] = value; }]; },
    useRef: initial => { const index = position++; return slots[index] ||= { current: initial }; },
    useSyncExternalStore: (_subscribe, read) => { position++; return read(); },
    useEffect: (effect, dependencies) => {
      const index = position++, old = slots[index];
      if (!old || old.some((value, offset) => value !== dependencies[offset])) {
        slots[index] = dependencies;
        queued.push(() => { cleanups.get(index)?.(); cleanups.set(index, effect()); });
      }
    },
  };
  const adapters = {
    react: { ...react, default: react },
    'react-native': { Platform: { OS: 'web' }, Image: 'Image', View: 'View' },
    'react-native-safe-area-context': {}, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../lib/theme': { useTheme: () => ({ colors: { mint: '#121212', green: '#99ffcc' } }) },
    '../lib/appearance': { fonts: {} }, '../lib/api': api,
  };
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(new URL('../src/components/ui.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
  }).outputText;
  new Function('require', 'module', 'exports', compiled)(name => { assert.ok(name in adapters, name); return adapters[name]; }, module, module.exports);
  const render = () => { position = 0; queued = []; const result = module.exports.Picture({ uri: `/media/img_${'e'.repeat(24)}.jpg` }); queued.forEach(effect => effect()); return result; };
  api.setToken('signed-in-account');
  render();
  let loaded;
  for (let tick = 0; tick < 8; tick++) {
    await new Promise(resolve => setImmediate(resolve));
    loaded = render();
    if (loaded.props.source?.uri === 'blob:picture-private') break;
  }
  assert.equal(loaded.props.source?.uri, 'blob:picture-private');
  api.setToken(null);
  const guest = render();
  assert.deepEqual(revoked, ['blob:picture-private']);
  assert.notEqual(guest.props.source?.uri, 'blob:picture-private');
  assert.equal(guest.props.source?.headers, undefined);
  let pendingSignal;
  globalThis.fetch = async (_url, options) => {
    pendingSignal = options.signal;
    return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  };
  api.setToken('new-account'); render();
  assert.equal(pendingSignal.aborted, false);
  api.setToken(null); render();
  assert.equal(pendingSignal.aborted, true, 'the real Picture effect aborts its pending fetch on logout');
  await new Promise(resolve => setImmediate(resolve));
  for (const cleanup of cleanups.values()) cleanup?.();
});

test('the PowerShell CloudTest URL gate enforces the same public HTTPS boundary without invoking a build', { skip: process.platform !== 'win32' }, () => {
  const helper = fileURLToPath(new URL('../../../scripts/android-cloud-url.ps1', import.meta.url));
  const command = `& { . '${helper.replaceAll("'", "''")}'; $values = '${Buffer.from(JSON.stringify(invalid)).toString('base64')}'; $list = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($values)) | ConvertFrom-Json; foreach ($value in $list) { $rejected=$false; try { ConvertTo-CampaignCloudApiUrl -Value $value | Out-Null } catch { $rejected=$true }; if (!$rejected) { throw 'An unsafe URL was accepted.' } }; if ((ConvertTo-CampaignCloudApiUrl -Value ' ${server}/api/ ') -ne '${server}/api') { throw 'Normalization mismatch.' }; 'URL_GATES_PASS' }`;
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], { encoding: 'utf8', windowsHide: true, timeout: 15000 });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  assert.match(result.stdout, /URL_GATES_PASS/);
});

test('generated Android HTTP policy reverses prior local configuration for a cloud artifact', () => {
  const module = { exports: {} };
  const plugin = readFileSync(new URL('../plugins/withInternalTestAndroid.cjs', import.meta.url), 'utf8');
  const configPlugins = {
    withAndroidManifest: (config, apply) => apply(config),
    withDangerousMod: config => config,
  };
  new Function('require', 'module', 'exports', plugin)(name => name === 'expo/config-plugins' ? configPlugins : require(name), module, module.exports);
  const state = { modResults: { manifest: { application: [{ $: {} }] } } };
  module.exports(state, { enabled: true });
  assert.equal(state.modResults.manifest.application[0].$['android:usesCleartextTraffic'], 'true');
  module.exports(state, { cloud: true });
  assert.equal(state.modResults.manifest.application[0].$['android:usesCleartextTraffic'], 'false');
  module.exports(state, {});
  assert.equal(state.modResults.manifest.application[0].$['android:usesCleartextTraffic'], undefined);
  assert.throws(() => module.exports(state, { cloud: true, enabled: true }), /must not enable/);
});

test('packaged API proof rejects mere URL presence or a getter reading a different slot', { skip: process.platform !== 'win32' }, () => {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const script = String.raw`import importlib.util
from pathlib import Path
import sys
spec=importlib.util.spec_from_file_location('android_api', Path(sys.argv[1])/'scripts/verify-android-api.py')
module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
raw='''s800[ASCII, 1..50]: https://campaign-demo.onrender.com
NCFunction<module>(1 params, 5 registers, 0 symbols):
[@ 0] LoadConstString 4<Reg8>, 800<UInt16>
[@ 4] StoreToEnvironment 2<Reg8>, 8<UInt8>, 4<Reg8>
[@ 8] CreateClosure 4<Reg8>, 2<Reg8>, 11067<UInt16>
NCFunction<getApiUrl>(1 params, 1 registers, 0 symbols):
[@ 0] GetEnvironment 0<Reg8>, 0<UInt8>
[@ 3] LoadFromEnvironment 0<Reg8>, 0<Reg8>, 8<UInt8>
[@ 7] Ret 0<Reg8>
'''
pretty='''NCFunction<module>(1 params, 5 registers, 0 symbols):
    CreateClosure r4, r2, NCFunction<getApiUrl>
NCFunction<getApiUrl>(1 params, 1 registers, 0 symbols):
'''
expected='https://campaign-demo.onrender.com'
assert module.inspect_assignment(raw,pretty,expected)['verifiedAssignment']
assert not module.inspect_assignment(raw.replace('8<UInt8>','9<UInt8>',1),pretty,expected)['verifiedAssignment']
assert not module.inspect_assignment(raw,pretty.replace('r4, r2,','r4, r3,'),expected)['verifiedAssignment']
assert not module.inspect_assignment(raw,pretty,'https://different.onrender.com')['verifiedAssignment']
assert not module.inspect_assignment(raw.replace('StoreToEnvironment','LoadFromEnvironment',1),pretty,expected)['verifiedAssignment']
print('ASSIGNMENT_PROOF_TESTS_PASS')`;
  const result = spawnSync(root + 'services/api/.venv/Scripts/python.exe', ['-c', script, root], { encoding: 'utf8', windowsHide: true, timeout: 15000 });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  assert.match(result.stdout, /ASSIGNMENT_PROOF_TESTS_PASS/);
});
