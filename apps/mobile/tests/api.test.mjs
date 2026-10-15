import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = ts.transpileModule(
  readFileSync(new URL('../src/lib/api.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const loaded = { exports: {} };
new Function('require', 'module', 'exports', '__DEV__', 'process', source)(
  (name) => {
    assert.equal(name, 'react-native');
    return { Platform: { OS: 'web' } };
  },
  loaded,
  loaded.exports,
  true,
  { env: {} },
);
const { api, ApiError, getApiUrl, setApiUrl, normalizeApiUrl, setToken, mediaUrl, onSessionExpired } = loaded.exports;
const local = 'http://127.0.0.1:8787';

function mockFetch(t, implementation) {
  const original = globalThis.fetch;
  globalThis.fetch = implementation;
  t.after(() => { globalThis.fetch = original; setApiUrl(local); setToken(null); });
}

test('authenticated JSON requests and relative media use the configured server', async (t) => {
  setApiUrl(local);
  setToken('private-test-token');
  mockFetch(t, async (url, options) => {
    assert.equal(url, `${local}/campaigns`);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer private-test-token');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), { title: 'A message' });
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ id: 'campaign-test' });
  });
  assert.deepEqual(await api('/campaigns', { method: 'POST', body: { title: 'A message' } }), { id: 'campaign-test' });
  assert.equal(mediaUrl('/media/cover.jpg'), `${local}/media/cover.jpg`);
  assert.equal(mediaUrl('https://images.example/cover.jpg'), 'https://images.example/cover.jpg');
});

test('changing the backend drops its bearer token and rejects unsafe addresses', async (t) => {
  setApiUrl(local);
  setToken('old-server-token');
  assert.equal(normalizeApiUrl(' https://api.example.test/api/ '), 'https://api.example.test/api');
  for (const address of ['not a URL', 'file:///tmp/data', 'https://name:secret@example.test', `${local}?key=secret`, `${local}#fragment`]) {
    assert.throws(() => setApiUrl(address));
    assert.equal(getApiUrl(), local);
  }
  mockFetch(t, async (_url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return Response.json({ ok: true });
  });
  setApiUrl('https://api.example.test');
  await api('/health');
});

test('a trailing slash does not discard the current server session', async (t) => {
  setApiUrl(local);
  setToken('same-server-token');
  setApiUrl(`${local}/`);
  mockFetch(t, async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer same-server-token');
    return Response.json({ ok: true });
  });
  await api('/health');
});

test('server validation and authorization preserve actionable messages and status', async (t) => {
  mockFetch(t, async () => Response.json({ detail: [{ loc: ['body', 'title'], msg: 'Required' }] }, { status: 422 }));
  await assert.rejects(api('/campaigns'), (error) => error instanceof ApiError && error.status === 422 && error.message === 'title: Required');
  globalThis.fetch = async () => Response.json({ detail: 'Sign in again.' }, { status: 401 });
  await assert.rejects(api('/me'), (error) => error instanceof ApiError && error.status === 401 && error.message === 'Sign in again.');
});

test('unreadable and offline responses allow a successful retry', async (t) => {
  mockFetch(t, async () => new Response('<html>Unavailable</html>', { status: 503 }));
  await assert.rejects(api('/campaigns'), (error) => error instanceof ApiError && error.status === 503 && /unreadable/.test(error.message));
  for (const error of [new TypeError('Failed to fetch'), new TypeError('Network request failed'), new DOMException('Aborted', 'AbortError')]) {
    globalThis.fetch = async () => { throw error; };
    await assert.rejects(api('/campaigns'), /Your saved work is safe/);
  }
  globalThis.fetch = async () => Response.json([{ id: 'reconnected' }]);
  assert.deepEqual(await api('/campaigns'), [{ id: 'reconnected' }]);
});

test('image uploads leave multipart content boundaries to the runtime', async (t) => {
  const form = new FormData();
  form.append('purpose', 'story');
  mockFetch(t, async (_url, options) => {
    assert.equal(options.headers['Content-Type'], undefined);
    assert.equal(options.body, form);
    return Response.json({ url: '/media/upload.jpg' });
  });
  assert.deepEqual(await api('/uploads', { method: 'POST', form }), { url: '/media/upload.jpg' });
});

test('an expired current session clears once and public reads retry without its bearer', async (t) => {
  let expired = 0;
  const unsubscribe = onSessionExpired(async () => { expired += 1; });
  t.after(unsubscribe);
  let calls = 0;
  mockFetch(t, async (_url, options) => {
    calls += 1;
    if (calls % 2 === 1) {
      assert.equal(options.headers.Authorization, 'Bearer expired-session');
      return Response.json({ detail: 'Your session expired. Sign in again.' }, { status: 401 });
    }
    assert.equal(options.headers.Authorization, undefined);
    return Response.json({ public: true });
  });
  for (const path of ['/campaigns', '/campaigns/example', '/campaigns/example/report', '/campaigns/example/updates', `/receipts/example?token=${'a'.repeat(64)}`]) {
    setToken('expired-session');
    assert.deepEqual(await api(path), { public: true });
  }
  assert.equal(expired, 5);
  assert.equal(calls, 10);
});

test('private reads and all writes keep 401; invalid login does not expire a session', async (t) => {
  let expired = 0;
  const unsubscribe = onSessionExpired(async () => { expired += 1; });
  t.after(unsubscribe);
  let calls = 0;
  mockFetch(t, async () => {
    calls += 1;
    return Response.json({ detail: 'Sign in again.' }, { status: 401 });
  });
  for (const [path, options, shouldExpire] of [
    ['/me', {}, true],
    ['/activity', {}, true],
    ['/review-queue', {}, true],
    ['/campaigns/example/history', {}, true],
    ['/receipts/example', {}, true],
    ['/receipts/example?token=invalid', {}, true],
    ['/campaigns', { method: 'POST', body: { title: 'Never replay' } }, true],
    ['/campaigns/example', { method: 'PUT', body: { title: 'Never replay' } }, true],
    ['/contributions', { method: 'POST', body: { amount: 5 } }, true],
    ['/auth/login', { method: 'POST', body: { email: 'invalid@example.test' } }, false],
    ['/auth/register', { method: 'POST', body: {} }, false],
  ]) {
    setToken('current-session');
    const before = expired;
    const requestsBefore = calls;
    await assert.rejects(api(path, options), (error) => error instanceof ApiError && error.status === 401);
    assert.equal(calls, requestsBefore + 1, `${path} must not replay`);
    assert.equal(expired, before + Number(shouldExpire), path);
  }
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer current-session');
    return Response.json({ ok: true });
  };
  await api('/health');
});

test('a late 401 from an older token cannot clear or retry over a new sign-in', async (t) => {
  let expired = 0;
  const unsubscribe = onSessionExpired(async () => { expired += 1; });
  t.after(unsubscribe);
  let reply;
  let calls = 0;
  mockFetch(t, async () => {
    calls += 1;
    return new Promise((resolve) => { reply = resolve; });
  });
  setToken('old-session');
  const oldRequest = api('/campaigns/example');
  setToken('new-session');
  reply(Response.json({ detail: 'Old session expired.' }, { status: 401 }));
  await assert.rejects(oldRequest, (error) => error instanceof ApiError && error.status === 401);
  assert.equal(expired, 0);
  assert.equal(calls, 1);
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer new-session');
    return Response.json({ ok: true });
  };
  await api('/health');
});

test('concurrent expired public reads clear one session and each retry at most once', async (t) => {
  let expired = 0;
  const unsubscribe = onSessionExpired(async () => { expired += 1; });
  t.after(unsubscribe);
  let guestCalls = 0;
  mockFetch(t, async (_url, options) => {
    if (options.headers.Authorization) return Response.json({ detail: 'Expired.' }, { status: 401 });
    guestCalls += 1;
    return Response.json({ public: true });
  });
  setToken('expired-session');
  assert.deepEqual(await Promise.all([api('/campaigns/first'), api('/campaigns/second/report')]), [{ public: true }, { public: true }]);
  assert.equal(expired, 1);
  assert.equal(guestCalls, 2);
  setToken('expired-again');
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json({ detail: 'Still unauthorized.' }, { status: 401 }); };
  await assert.rejects(api('/campaigns/third'), (error) => error instanceof ApiError && error.status === 401);
  assert.equal(calls, 2);
  assert.equal(expired, 2);
});

test('network failures and permission denials preserve the signed-in token', async (t) => {
  let expired = 0;
  const unsubscribe = onSessionExpired(async () => { expired += 1; });
  t.after(unsubscribe);
  setToken('valid-offline-session');
  mockFetch(t, async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(api('/me'), /saved work is safe/);
  globalThis.fetch = async () => Response.json({ detail: 'Not your campaign.' }, { status: 403 });
  await assert.rejects(api('/campaigns/private'), (error) => error.status === 403);
  assert.equal(expired, 0);
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer valid-offline-session');
    return Response.json({ ok: true });
  };
  await api('/health');
});

// Execute the real provider effect with small platform/hook adapters, so the
// transport callback is verified against persisted storage and real query data.
function providerHarness(t, savedSession, removeSession) {
  const values = new Map([['campaign-session', JSON.stringify(savedSession)]]);
  const states = [];
  const effects = [];
  const react = {
    createContext: () => ({ Provider: 'ContextProvider' }),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState: (initial) => {
      const index = states.length;
      states.push(initial);
      return [initial, (value) => { states[index] = value; }];
    },
    useEffect: (effect) => { effects.push(effect); },
    useCallback: (callback) => callback,
  };
  const { QueryClient } = require('@tanstack/react-query');
  const adapters = {
    react: { ...react, default: react },
    'react-native': { Platform: { OS: 'web' } },
    'expo-router': { useFocusEffect: () => undefined },
    '@react-native-async-storage/async-storage': { default: {
      getItem: async (key) => values.get(key) ?? null,
      setItem: async (key, value) => { values.set(key, value); },
      removeItem: async (key) => { if (removeSession) await removeSession(); values.delete(key); },
    } },
    'expo-secure-store': {},
    '@tanstack/react-query': { QueryClient, QueryClientProvider: 'QueryClientProvider' },
    './api': loaded.exports,
  };
  const providerSource = ts.transpileModule(
    readFileSync(new URL('../src/lib/session.tsx', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } },
  ).outputText;
  const providerModule = { exports: {} };
  new Function('require', 'module', 'exports', providerSource)(
    (name) => { assert.ok(name in adapters, name); return adapters[name]; },
    providerModule,
    providerModule.exports,
  );
  const tree = providerModule.exports.Providers({ children: null });
  for (const effect of effects) {
    const cleanup = effect();
    if (cleanup) t.after(cleanup);
  }
  return { values, states, queryClient: providerModule.exports.queryClient, session: tree.props.children[0].props.value };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test('the provider preserves an offline restored identity, then removes it and private cache on 401', async (t) => {
  const user = { id: 'offline-owner', name: 'Offline Creator', role: 'member' };
  mockFetch(t, async () => { throw new TypeError('Failed to fetch'); });
  const provider = providerHarness(t, { token: 'saved-session', user });
  await settle();
  assert.equal(provider.states[1], true);
  assert.deepEqual(provider.states[0], user);
  assert.ok(provider.values.has('campaign-session'));
  provider.queryClient.setQueryData(['me', user.id], { user, private: true });
  globalThis.fetch = async () => Response.json({ detail: 'Your session expired. Sign in again.' }, { status: 401 });
  await assert.rejects(api('/me'), (error) => error.status === 401);
  assert.equal(provider.states[0], null);
  assert.equal(provider.values.has('campaign-session'), false);
  assert.equal(provider.queryClient.getQueryData(['me', user.id]), undefined);
});

test('a sign-in during expiry cleanup keeps its newer identity and durable session', async (t) => {
  const oldUser = { id: 'old-owner', name: 'Old Creator', role: 'member' };
  const newUser = { id: 'new-owner', name: 'New Creator', role: 'member' };
  mockFetch(t, async () => Response.json({ user: oldUser }));
  let finishRemoval;
  const provider = providerHarness(t, { token: 'old-session', user: oldUser }, () => new Promise((resolve) => { finishRemoval = resolve; }));
  await settle();
  globalThis.fetch = async (url) => url.endsWith('/auth/login')
    ? Response.json({ token: 'new-session', user: newUser })
    : Response.json({ detail: 'Expired.' }, { status: 401 });
  const expiredRead = api('/campaigns/example');
  await settle();
  assert.equal(provider.states[0], null);
  const signIn = provider.session.login('new@example.test', 'fictional-test-password');
  await settle();
  assert.deepEqual(provider.states[0], newUser);
  finishRemoval();
  await signIn;
  await assert.rejects(expiredRead, (error) => error.status === 401);
  assert.deepEqual(provider.states[0], newUser);
  assert.deepEqual(JSON.parse(provider.values.get('campaign-session')), { token: 'new-session', user: newUser });
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer new-session');
    return Response.json({ ok: true });
  };
  await api('/health');
});
