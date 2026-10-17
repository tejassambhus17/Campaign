import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/components/NativePager.web.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
function fixture(initialPage = 0) {
  const slots = [], effects = [], commands = [], selected = [], progress = [], states = [], dependencies = [], timers = new Map();
  let cursor = 0, serial = 0, props = { initialPage, children: [0, 1, 2, 3].map(key => ({ key: `p${key}` })) }, tree;
  const handle = { current: null }, scroll = { scrollTo: value => commands.push(value) };
  const react = {
    Children: { toArray: value => value }, forwardRef: component => component,
    useState: initial => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef: initial => { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
    useImperativeHandle: (ref, create) => { ref.current = create(); },
    useEffect: (callback, deps) => {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
        previous?.cleanup?.();
        slots[index] = { deps };
        effects.push(() => { slots[index].cleanup = callback(); });
      }
    },
  };
  const jsx = (type, value, key) => { if (value?.ref) value.ref.current = scroll; return { type, props: value || {}, key }; };
  const loaded = { exports: {} }, modules = { react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { ScrollView: 'ScrollView', View: 'View' } };
  new Function('require', 'exports', 'module', 'setTimeout', 'clearTimeout', compiled)(name => {
    dependencies.push(name); assert.ok(name in modules, `Unexpected runtime module: ${name}`); return modules[name];
  }, loaded.exports, loaded, callback => { const id = ++serial; timers.set(id, callback); return id; }, id => timers.delete(id));
  function render(next = {}) {
    props = { ...props, ...next }; cursor = 0;
    tree = loaded.exports.default({ ...props,
      onPageSelected: event => selected.push(event.nativeEvent.position),
      onPageScroll: event => progress.push(event.nativeEvent),
      onPageScrollStateChanged: event => states.push(event.nativeEvent.pageScrollState),
    }, handle);
    while (effects.length) effects.shift()();
    return tree;
  }
  const event = (x, width = 320) => ({ nativeEvent: { contentOffset: { x, y: 0 }, layoutMeasurement: { width, height: 600 } } });
  const layout = (width = 320) => { tree.props.onLayout({ nativeEvent: { layout: { width, height: 600 } } }); render(); };
  const settle = () => { for (const [id, callback] of [...timers]) { timers.delete(id); callback(); } render(); };
  render();
  return { render, layout, event, settle, handle, commands, selected, progress, states, dependencies,
    tree: () => tree, timers, cleanup: () => slots.forEach(slot => slot?.cleanup?.()) };
}

test('web resolves without native codegen and keeps all measured pages mounted with inactive accessibility hidden', () => {
  const h = fixture(2); h.layout();
  assert.equal(h.dependencies.includes('react-native-pager-view'), false);
  assert.equal(h.tree().props.horizontal, true); assert.equal(h.tree().props.pagingEnabled, true);
  assert.deepEqual(h.commands.at(-1), { x: 640, y: 0, animated: false });
  assert.deepEqual(h.selected, [2]);
  assert.equal(h.tree().props.children.length, 4);
  const pages = h.tree().props.children;
  assert.deepEqual(pages.map(page => page.key), ['p0', 'p1', 'p2', 'p3']);
  assert.deepEqual(pages[2].props.style, { width: 320, height: 600, flexShrink: 0, overflow: 'hidden' });
  assert.equal(pages[2].props.accessibilityElementsHidden, false);
  assert.equal(pages[1].props.importantForAccessibility, 'no-hide-descendants');
});

test('imperative commands emit compatible selected/scroll/state events after measured snapping and ignore invalid indices', () => {
  const h = fixture(); h.layout();
  const before = h.commands.length;
  for (const invalid of [-1, 4, 1.5, NaN]) h.handle.current.setPage(invalid);
  assert.equal(h.commands.length, before);
  h.handle.current.setPage(3);
  assert.deepEqual(h.commands.at(-1), { x: 960, y: 0, animated: true });
  assert.equal(h.states.at(-1), 'settling');
  h.tree().props.onScroll(h.event(480));
  assert.deepEqual(h.progress.at(-1), { position: 1, offset: 0.5 });
  h.tree().props.onScroll(h.event(960)); h.settle();
  assert.deepEqual(h.selected, [0, 3]); assert.equal(h.states.at(-1), 'idle');
  h.handle.current.setPageWithoutAnimation(1); h.render();
  assert.deepEqual(h.commands.at(-1), { x: 320, y: 0, animated: false });
  assert.deepEqual(h.selected, [0, 3, 1]);
});

test('web gesture callbacks preserve boundaries and synchronize selected page without wrapping', () => {
  const h = fixture(); h.layout();
  h.tree().props.onScrollBeginDrag();
  assert.equal(h.states.at(-1), 'dragging');
  h.tree().props.onScroll(h.event(320)); h.settle();
  assert.equal(h.selected.at(-1), 1);
  h.tree().props.onScrollBeginDrag(); h.tree().props.onMomentumScrollEnd(h.event(99999)); h.render();
  assert.equal(h.selected.at(-1), 3);
  h.tree().props.onScrollBeginDrag(); h.tree().props.onMomentumScrollEnd(h.event(-200)); h.render();
  assert.equal(h.selected.at(-1), 0);
});

test('resize and unrelated renders preserve the selected page and ignore stale geometry events', () => {
  const h = fixture(2); h.layout(); h.render();
  assert.equal(h.tree().props.children[2].props.accessibilityElementsHidden, false);
  h.layout(360);
  assert.deepEqual(h.commands.at(-1), { x: 720, y: 0, animated: false });
  h.tree().props.onScroll(h.event(320, 320)); h.settle();
  assert.deepEqual(h.selected, [2]);
  h.tree().props.onScroll(h.event(720, 360)); h.settle();
  assert.equal(h.tree().props.children[2].props.accessibilityElementsHidden, false);
});

test('commands queued before layout select the requested initial page and scroll-enabled remains controllable', () => {
  const h = fixture(); h.handle.current.setPageWithoutAnimation(3); h.layout();
  assert.deepEqual(h.selected, [3]);
  assert.deepEqual(h.commands.at(-1), { x: 960, y: 0, animated: false });
  h.handle.current.setScrollEnabled(false); h.render();
  assert.equal(h.tree().props.scrollEnabled, false);
  h.render({ scrollEnabled: false }); h.render({ scrollEnabled: true }); h.render();
  assert.equal(h.tree().props.scrollEnabled, true);
});

test('settle timers are removed on unmount', () => {
  const h = fixture(); h.layout(); h.tree().props.onScrollBeginDrag(); h.tree().props.onScroll(h.event(320));
  assert.equal(h.timers.size, 1); h.cleanup(); assert.equal(h.timers.size, 0);
});
