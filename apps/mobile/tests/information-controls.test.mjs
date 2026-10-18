import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function harness({ height = 800, keyboardTop = null } = {}) {
  const states = [], effects = [], focus = [], closed = [], refs = [];
  let cursor = 0, refCursor = 0;
  const react = { useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial; return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }]; }, useRef(value) { const i = refCursor++; return refs[i] ||= { current: value }; }, useEffect(fn) { effects.push(fn); } };
  const colors = { line: '#2C302E', paper: '#121212', ink: '#F5F7F6', primary: '#8EF4C5', text: '#E1E6E3', muted: '#AEB8B3' };
  const modules = { react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', Pressable: 'Pressable', Modal: 'Modal', ScrollView: 'ScrollView', KeyboardAvoidingView: 'KeyboardAvoidingView', Platform: { OS: 'android' }, useWindowDimensions: () => ({ height: 800 }), findNodeHandle: ref => ref?.id || null, AccessibilityInfo: { isReduceMotionEnabled: async () => true, addEventListener: () => ({ remove() {} }), setAccessibilityFocus: id => focus.push(id) } }, 'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 24 }) }, '@expo/vector-icons/Ionicons': { default: 'Icon' }, './ui': { Text: 'Text', fonts: {}, useTheme: () => ({ colors }) } };
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL('../src/components/Information.tsx', import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const keyboardEvents = new Map();
  modules['react-native'].useWindowDimensions = () => ({ height });
  modules['react-native'].Keyboard = { dismiss() {}, metrics: () => keyboardTop === null ? undefined : { screenY: keyboardTop }, addListener(name, callback) { keyboardEvents.set(name, callback); return { remove() { keyboardEvents.delete(name); } }; } };
  new Function('require', 'module', 'exports', 'requestAnimationFrame', source)(name => { assert.ok(name in modules, name); return modules[name]; }, module, module.exports, callback => callback());
  return { ui: module.exports, states, effects, focus, closed, keyboardEvents, render(fn, props) { cursor = refCursor = 0; effects.length = 0; const tree = fn(props); for (const effect of effects) effect(); return tree; } };
}

test('focused sheet stays above an existing or changing keyboard and restores its viewport on dismissal', () => {
  const h = harness({ keyboardTop: 420 });
  const props = { visible: true, title: 'Image URLs', onClose() {}, children: 'Editable image reference' };
  const render = () => h.render(h.ui.InfoSheet, props);
  const sheet = tree => nodes(tree).find(n => n.props.accessibilityViewIsModal);
  let tree = render();
  assert.equal(nodes(tree).find(n => n.type === 'KeyboardAvoidingView').props.behavior, 'padding');
  assert.ok(sheet(tree).props.style.maxHeight <= 420 - 24, 'content and Close fit above the real keyboard');
  h.keyboardEvents.get('keyboardDidShow')({ endCoordinates: { screenY: 300 } }); tree = render();
  assert.ok(sheet(tree).props.style.maxHeight <= 300 - 24);
  h.keyboardEvents.get('keyboardDidHide')(); tree = render();
  assert.ok(sheet(tree).props.style.maxHeight > 700, 'closing the keyboard restores the ordinary scrolling viewport');
  assert.equal(nodes(tree).filter(n => n.type === 'ScrollView').length, 1);
});

test('already resized Android window bounds the sheet without subtracting keyboard height twice', () => {
  const h = harness({ height: 400, keyboardTop: 420 });
  const tree = h.render(h.ui.InfoSheet, { visible: true, title: 'Category', onClose() {}, children: 'Options' });
  const sheet = nodes(tree).find(n => n.props.accessibilityViewIsModal);
  assert.ok(sheet.props.style.maxHeight > 300 && sheet.props.style.maxHeight < 400);
  assert.equal(nodes(tree).find(n => n.props.accessibilityLabel === 'Close Category').props.style.height, 48);
});

test('selection sheet preserves all real options and cancelling never commits a value', () => {
  const h = harness(), commits = [], options = [{ value: 'Environment', label: 'Environment' }, { value: 'Public Policy', label: 'Public Policy' }, { value: 'Other', label: 'Other' }];
  const props = { label: 'Category', value: 'Public Policy', options, onSelect: value => commits.push(value) };
  const render = () => h.render(h.ui.SelectionSheet, props);
  let tree = render(); const link = nodes(tree).find(n => n.type === h.ui.SummaryLink); assert.equal(link.props.title, 'Public Policy');
  link.props.onPress(); tree = render(); let sheet = nodes(tree).find(n => n.type === h.ui.InfoSheet); assert.equal(sheet.props.visible, true);
  const radios = nodes(tree).filter(n => n.props.accessibilityRole === 'radio'); assert.deepEqual(radios.map(n => n.props.accessibilityLabel), options.map(x => x.label));
  assert.deepEqual(radios.map(n => n.props.accessibilityState.checked), [false, true, false]);
  sheet.props.onClose(); assert.deepEqual(commits, []); tree = render(); assert.equal(nodes(tree).find(n => n.type === h.ui.InfoSheet).props.visible, false);
  nodes(tree).find(n => n.type === h.ui.SummaryLink).props.onPress(); tree = render(); nodes(tree).find(n => n.props.accessibilityLabel === 'Environment').props.onPress();
  assert.deepEqual(commits, ['Environment']); assert.equal(nodes(render()).find(n => n.type === h.ui.InfoSheet).props.visible, false);
});

test('disabled selection cannot commit and information reveal does not discard edited content', () => {
  const h = harness(), commits = [];
  let tree = h.render(h.ui.SelectionSheet, { label: 'Category', value: 'A', options: [{ value: 'A', label: 'A' }], onSelect: v => commits.push(v), disabled: true });
  const option = nodes(tree).find(n => n.props.accessibilityRole === 'radio'); assert.equal(option.props.disabled, true); option.props.onPress(); assert.deepEqual(commits, []);
  const action = harness(), child = { type: 'Input', props: { value: 'Preserved draft URL' } };
  const props = { title: 'Public image URLs', children: child, reveal: {}, keepMounted: true };
  action.render(action.ui.InfoAction, props); tree = action.render(action.ui.InfoAction, { ...props, reveal: false });
  const sheet = nodes(tree).find(n => n.type === action.ui.InfoSheet); assert.equal(sheet.props.visible, true); assert.equal(sheet.props.children, child);
  sheet.props.onClose(); tree = action.render(action.ui.InfoAction, { ...props, reveal: false });
  assert.equal(nodes(tree).find(n => n.type === action.ui.InfoSheet).props.visible, false); assert.equal(nodes(tree).find(n => n.type === action.ui.InfoSheet).props.children, child);
});

test('context sheet has explicit Android Back, outside, close and accessibility escape dismissals', () => {
  const h = harness(); let dismissed = 0;
  const tree = h.render(h.ui.InfoSheet, { visible: true, title: 'Reach assumptions', onClose: () => dismissed++, children: 'Actual model details' });
  assert.equal(tree.type, 'Modal'); tree.props.onRequestClose();
  nodes(tree).find(n => n.props.accessibilityLabel === 'Dismiss Reach assumptions').props.onPress();
  const close = nodes(tree).find(n => n.props.accessibilityLabel === 'Close Reach assumptions'); close.props.onPress(); assert.ok(close.props.style.width >= 48);
  nodes(tree).find(n => n.props.accessibilityViewIsModal).props.onAccessibilityEscape(); assert.equal(dismissed, 4);
  const area = nodes(tree).find(n => n.type === 'ScrollView'); assert.equal(area.props.style.flexGrow, 0);
  assert.ok(nodes(tree).every(n => n.props.allowFontScaling !== false));
  assert.equal(tree.props.animationType, 'none', 'reduced motion is the safe initial presentation');
});

test('summary destination exposes complete readable copy and one deliberate action', () => {
  const h = harness(); let opened = 0;
  const tree = h.render(h.ui.SummaryLink, { title: 'Funding & Spending', summary: '$25 of $100 raised', description: 'Fees, allocation and refunds', icon: 'wallet-outline', onPress: () => opened++ });
  assert.equal(tree.props.accessibilityRole, 'button'); assert.match(tree.props.accessibilityLabel, /Funding & Spending.*\$25 of \$100.*Fees, allocation and refunds/);
  assert.ok(tree.props.style({ pressed: false }).minHeight >= 48); tree.props.onPress(); assert.equal(opened, 1);
  assert.ok(nodes(tree).every(n => n.props.numberOfLines === undefined && n.props.allowFontScaling !== false));
});
