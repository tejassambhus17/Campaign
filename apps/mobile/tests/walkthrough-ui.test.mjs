import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
function pureModule(path) {
  const loaded = { exports: {} };
  new Function('exports', 'module', compile(path))(loaded.exports, loaded);
  return loaded.exports;
}
const walkthrough = pureModule('../src/lib/walkthrough.ts');
const layout = pureModule('../src/features/walkthrough/layout.ts');
const overlayCode = `${compile('../src/features/walkthrough/Walkthrough.tsx')}\nmodule.exports.TestTourOverlay = TourOverlay;`;
const settle = () => new Promise(resolve => setImmediate(resolve));
const dark = { paper: '#121212', ink: '#ffffff', text: '#eeeeee', muted: '#aaaaaa', green: '#8ef4c5', outline: '#444444', line: '#333333', red: '#ff7777' };

// The real TourOverlay function, store and layout run here. This is a bounded
// hook/native-element adapter; it does not establish Android pixels, TalkBack
// focus delivery or native responder behavior.
async function harness({ missingTarget = false } = {}) {
  const values = new Map([
    ['campaign-creation-v1:guest', 'unchanged draft at Story'],
    ['fixture:payment', 'unchanged pending contribution'],
    ['fixture:notification', 'unchanged unread notification'],
  ]);
  const originalPrivateValues = new Map(values);
  const storageWrites = [];
  const store = walkthrough.createWalkthroughStore({
    getItem: async key => values.get(key) ?? null,
    setItem: async (key, value) => { storageWrites.push(key); values.set(key, value); },
  });
  await store.restore(); await store.offer(); await store.start();
  const slots = [], effects = [], frames = new Map(), backListeners = new Set(), focusEvents = [];
  let cursor = 0, nextFrame = 1, dirty = false, theme = dark, tree;
  let backAdds = 0, backRemoves = 0, forbiddenCalls = 0;
  const dimensions = { width: 390, height: 844, fontScale: 1 };
  const equalDependencies = (before, after) => before && after && before.length === after.length && before.every((value, index) => Object.is(value, after[index]));
  const hooks = {
    createContext: () => ({ Provider: 'ContextProvider' }),
    useContext: () => { throw Error('TourOverlay must not change provider/session context'); },
    useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
    useState: initial => {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, next => {
        const value = typeof next === 'function' ? next(slots[index].value) : next;
        if (!Object.is(slots[index].value, value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef: initial => {
      const index = cursor++;
      if (!slots[index]) slots[index] = { current: initial };
      return slots[index];
    },
    useMemo: (factory, dependencies) => {
      const index = cursor++;
      if (!slots[index] || !equalDependencies(slots[index].dependencies, dependencies))
        slots[index] = { value: factory(), dependencies };
      return slots[index].value;
    },
    useEffect: (effect, dependencies) => {
      const index = cursor++;
      if (!slots[index] || !equalDependencies(slots[index].dependencies, dependencies)) {
        const prior = slots[index];
        slots[index] = { dependencies, cleanup: prior?.cleanup };
        effects.push(() => { prior?.cleanup?.(); slots[index].cleanup = effect(); });
      }
    },
  };
  hooks.useCallback = (callback, dependencies) => hooks.useMemo(() => callback, dependencies);
  const jsx = (type, props) => {
    if (props?.ref && typeof props.ref === 'object') props.ref.current = {
      nodeHandle: props.accessibilityRole === 'header' ? 42 : 41,
      measureInWindow: callback => callback(0, 24, dimensions.width, dimensions.height - 24),
    };
    return { type, props: props || {} };
  };
  const unexpected = () => { forbiddenCalls++; throw Error('The informational tour cannot navigate or mutate session/business data'); };
  const modules = {
    react: hooks,
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@react-native-async-storage/async-storage': {},
    '@react-navigation/elements': { PlatformPressable: 'PlatformPressable' },
    'expo-router': { usePathname: unexpected, router: { push: unexpected, replace: unexpected } },
    'react-native': {
      View: 'View', Pressable: 'Pressable', ScrollView: 'ScrollView', Platform: { OS: 'android', Version: 35 },
      StyleSheet: { absoluteFill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 } },
      useWindowDimensions: () => dimensions,
      AccessibilityInfo: { setAccessibilityFocus: handle => focusEvents.push(handle) },
      findNodeHandle: node => node?.nodeHandle ?? null,
      BackHandler: { addEventListener: (event, callback) => {
        assert.equal(event, 'hardwareBackPress'); backAdds++; backListeners.add(callback);
        return { remove: () => { if (backListeners.delete(callback)) backRemoves++; } };
      } },
    },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 24, left: 0, right: 0 }) },
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../../components/ui': { Button: 'Button', Text: 'Text', useTheme: () => ({ colors: theme }) },
    '../../lib/session': { useSession: unexpected },
    '../../lib/walkthrough': walkthrough,
    './layout': layout,
  };
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', 'requestAnimationFrame', 'cancelAnimationFrame', overlayCode)(
    name => { assert.ok(name in modules, `Unexpected module ${name}`); return modules[name]; }, loaded.exports, loaded,
    callback => { const id = nextFrame++; frames.set(id, callback); return id; }, id => frames.delete(id),
  );
  const measure = (target, callback) => callback(missingTarget ? null : {
    x: target === 'search' ? 16 : 150, y: target === 'search' ? 130 : 750,
    width: target === 'search' ? 340 : 60, height: 48,
  });
  function render() {
    for (let pass = 0; pass < 8; pass++) {
      dirty = false; cursor = 0;
      tree = loaded.exports.TestTourOverlay({ store, measure, targetRevision: 0 });
      while (effects.length) effects.shift()();
      const pendingFrames = [...frames.values()]; frames.clear(); pendingFrames.forEach(callback => callback());
      if (!dirty) return tree;
    }
    throw Error('Overlay hook adapter did not settle');
  }
  const nodes = () => {
    const result = [];
    const walk = node => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== 'object') return;
      result.push(node); walk(node.props?.children);
    };
    walk(tree); return result;
  };
  const control = label => {
    const found = nodes().find(node => node.props.title === label || node.props.accessibilityLabel === label);
    assert.ok(found, `Rendered control ${label}`); return found;
  };
  const press = async label => { control(label).props.onPress(); await settle(); render(); };
  const heading = () => nodes().find(node => node.props.accessibilityRole === 'header').props.accessibilityLabel;
  const unmount = () => { slots.forEach(slot => slot.cleanup?.()); frames.clear(); tree = null; };
  render();
  return {
    store, values, storageWrites, originalPrivateValues, render, nodes, control, press, heading, unmount,
    theme: next => { theme = next; render(); }, fontScale: next => { dimensions.fontScale = next; render(); },
    back: () => [...backListeners].map(callback => callback()),
    lifecycle: () => ({ backAdds, backRemoves, listeners: backListeners.size, forbiddenCalls, focusEvents: [...focusEvents] }),
  };
}

test('the actual overlay wires Back/Next and final completion without navigation or business mutations', async t => {
  const h = await harness(); t.after(h.unmount);
  assert.match(h.heading(), /^Step 1 of 4\. Discover messages$/);
  assert.equal(h.nodes().some(node => node.props.title === 'Back'), false);
  await h.press('Next'); assert.match(h.heading(), /^Step 2 of 4\. Create your campaign$/);
  await h.press('Back'); assert.match(h.heading(), /^Step 1 of 4/);
  await h.press('Next'); await h.press('Next');
  assert.match(h.heading(), /^Step 3 of 4\. Fund the message, not the cause$/);
  await h.press('Next'); assert.match(h.heading(), /^Step 4 of 4\. Follow what happens$/);
  assert.equal(h.nodes().some(node => node.props.title === 'Next'), false);
  await h.press('Start exploring');
  assert.equal(h.store.getSnapshot().active, false);
  assert.equal(JSON.parse(h.values.get(walkthrough.WALKTHROUGH_KEY)).status, 'completed');
  assert.equal(h.lifecycle().forbiddenCalls, 0);
  assert.ok(h.storageWrites.every(key => key === walkthrough.WALKTHROUGH_KEY));
  for (const [key, value] of h.originalPrivateValues) assert.equal(h.values.get(key), value);
});

test('Skip and Android Back invoke dismissal and the mounted Back handler is removed on unmount', async t => {
  const skipped = await harness(); t.after(skipped.unmount);
  await skipped.press('Skip tour');
  assert.equal(skipped.store.getSnapshot().active, false);
  assert.equal(JSON.parse(skipped.values.get(walkthrough.WALKTHROUGH_KEY)).status, 'skipped');
  const back = await harness();
  assert.deepEqual(back.back(), [true], 'Android Back is consumed by the tour');
  await settle();
  assert.equal(back.store.getSnapshot().active, false);
  back.unmount();
  assert.deepEqual(back.lifecycle(), { backAdds: 1, backRemoves: 1, listeners: 0, forbiddenCalls: 0, focusEvents: [42] });
});

test('missing targets retain readable controls and theme/font rerenders preserve the current step', async t => {
  const h = await harness({ missingTarget: true }); t.after(h.unmount);
  await h.press('Next'); await h.press('Next');
  const before = h.heading();
  h.theme({ ...dark, paper: '#ffffff', ink: '#121212', text: '#222222' });
  h.fontScale(1.5);
  assert.equal(h.heading(), before);
  h.control('Back'); h.control('Next'); h.control('Skip tour');
  const card = h.nodes().find(node => node.props.accessibilityViewIsModal);
  assert.equal(card.props.style.backgroundColor, '#ffffff');
  assert.ok(Number.isFinite(card.props.style.top));
  assert.ok(h.nodes().some(node => node.type === 'ScrollView'), 'explanation can scroll at enlarged text');
  const absorber = h.nodes().find(node => node.props.onStartShouldSetResponder);
  assert.equal(absorber.props.onStartShouldSetResponder(), true);
  assert.equal(h.lifecycle().backAdds, 1, 'theme changes do not create repeated Back subscriptions');
  assert.equal(h.lifecycle().focusEvents.length, 3, 'focus is requested once per step, not on theme rerender');
  await h.press('Back'); assert.match(h.heading(), /^Step 2 of 4/);
  await h.press('Skip tour'); assert.equal(h.store.getSnapshot().active, false);
});

test('the compact card keeps Skip in its header, content-driven size and safe target placement', async t => {
  const h = await harness(); t.after(h.unmount);
  const card = h.nodes().find(node => node.props.accessibilityViewIsModal);
  assert.equal(card.props.style.height, undefined, 'no fixed card height');
  assert.equal(card.props.style.minHeight, undefined, 'no forced minimum card height');
  const scroll = h.nodes().find(node => node.type === 'ScrollView');
  const children = scroll.props.children.filter(Boolean);
  assert.equal(children.length, 4, 'header, title, explanation and navigation have no separate Skip footer');
  const skip = children[0].props.children.find(node => node.props?.accessibilityLabel === 'Skip tour');
  assert.ok(skip, 'Skip shares the counter header');
  const skipStyle = skip.props.style({ pressed: false });
  assert.ok(skipStyle.minHeight >= 48 && skipStyle.minWidth >= 48, 'compact presentation preserves touch area');
  assert.equal(h.nodes().filter(node => node.props.accessibilityLabel === 'Skip tour').length, 1);
  card.props.onLayout({ nativeEvent: { layout: { height: 192 } } }); h.render();
  const placed = h.nodes().find(node => node.props.accessibilityViewIsModal);
  assert.ok(placed.props.style.top >= 130 - 24 + 48 + 4 + 12, 'card clears Search after converting window coordinates to the overlay origin');
  await h.press('Next'); await h.press('Next');
  const copy = h.nodes().filter(node => node.type === 'Text').map(node => node.props.children).join(' ');
  assert.match(copy, /fund advertising, not direct donations/);
  assert.match(copy, /simulated; no real money is charged/);
  h.fontScale(1.6);
  assert.ok(h.nodes().some(node => node.type === 'ScrollView'), 'large text retains internal scrolling');
  await h.press('Skip tour');
  assert.equal(h.store.getSnapshot().active, false);
});
