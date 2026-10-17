import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const compiledCarousel = compile('../src/features/auth/WelcomeCarousel.tsx');
const descendants = tree => {
  if (Array.isArray(tree)) return tree.flatMap(descendants);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...descendants(tree.props?.children)];
};

// Executes the actual carousel's hooks and native-element callbacks. Responder
// arbitration, native snapping and TalkBack delivery still require Android QA.
function fixture() {
  const slots = [], effects = [], scrolls = [], requestedModules = [];
  let cursor = 0, dirty = false, tree, theme = { paper: '#121212', green: '#8ef4c5', outline: '#7d8982' };
  const equal = (before, after) => before?.length === after?.length && before?.every((value, index) => Object.is(value, after[index]));
  const hooks = {
    useState: initial => {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, next => {
        const value = typeof next === 'function' ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef: initial => {
      const index = cursor++;
      if (!slots[index]) slots[index] = { current: initial };
      return slots[index];
    },
    useLayoutEffect: (effect, dependencies) => {
      const index = cursor++;
      if (!slots[index] || !equal(slots[index].dependencies, dependencies)) {
        slots[index] = { dependencies }; effects.push(effect);
      }
    },
  };
  const nativeScroll = { scrollTo: options => scrolls.push(options) };
  const jsx = (type, props) => {
    if (props?.ref) props.ref.current = nativeScroll;
    return { type, props: props || {} };
  };
  const modules = {
    react: hooks, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { Image: 'Image', Pressable: 'Pressable', ScrollView: 'ScrollView', View: 'View' },
    '../../components/ui': { fonts: { semibold: 'ManropeSemiBold' }, Text: 'Text', useTheme: () => ({ colors: theme }) },
  };
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', compiledCarousel)(name => {
    requestedModules.push(name);
    if (name.endsWith('.png')) return name;
    assert.ok(name in modules, `Unexpected carousel dependency: ${name}`);
    return modules[name];
  }, loaded.exports, loaded);
  const render = (height = 176) => {
    for (let pass = 0; pass < 8; pass++) {
      cursor = 0; dirty = false; tree = loaded.exports.WelcomeCarousel({ height });
      while (effects.length) effects.shift()();
      if (!dirty) return tree;
    }
    throw Error('Carousel did not settle');
  };
  const nodes = () => descendants(tree);
  const find = testID => nodes().find(node => node.props.testID === testID);
  const dots = () => nodes().filter(node => node.type === 'Pressable');
  const selected = () => dots().findIndex(dot => dot.props.accessibilityState.selected);
  const layout = width => { find('welcome-photo-viewport').props.onLayout({ nativeEvent: { layout: { width } } }); render(); };
  const event = (x, width = 320) => ({ nativeEvent: { contentOffset: { x, y: 0 }, layoutMeasurement: { width, height: 176 } } });
  const swipe = (x, width = 320) => {
    find('welcome-photo-pager').props.onScrollBeginDrag();
    find('welcome-photo-pager').props.onScroll(event(x, width)); render();
    find('welcome-photo-pager').props.onMomentumScrollEnd(event(x, width)); render();
  };
  render();
  return {
    render, nodes, find, dots, selected, layout, swipe, event, scrolls, requestedModules,
    pressDot: index => { dots()[index].props.onPress(); render(); },
    theme: next => { theme = next; render(); },
  };
}

test('Welcome has exact B → C → A order with bundled image/caption identity preserved', () => {
  const h = fixture(); h.layout(320);
  const pages = h.nodes().filter(node => node.props.testID?.startsWith('welcome-photo-') && !['welcome-photo-viewport', 'welcome-photo-pager'].includes(node.props.testID));
  assert.deepEqual(pages.map(page => page.props.testID), ['welcome-photo-story-mountains', 'welcome-photo-confirmation-coast', 'welcome-photo-ocean-turtle']);
  const identity = pages.map(page => {
    const children = descendants(page);
    return [children.find(node => node.type === 'Image').props.source, children.filter(node => node.type === 'Text').map(node => node.props.children).join('')];
  });
  assert.deepEqual(identity, [
    ['../../../assets/images/create/story-mountains.png', 'Every big change\nstarts with a story.'],
    ['../../../assets/images/create/confirmation-coast.png', 'Small ideas.\nBigger possibilities.'],
    ['../../../assets/images/showcase/ocean-turtle.png', 'A brighter tomorrow\nis a shared effort.'],
  ]);
  for (const image of h.nodes().filter(node => node.type === 'Image')) {
    assert.deepEqual(image.props.style, { width: '100%', height: '100%' });
    assert.equal(image.props.resizeMode, 'cover');
  }
  assert.equal(h.selected(), 0);
});

test('native page callbacks advance and return with synchronized dot states and bounded ends', () => {
  const h = fixture(); h.layout(320);
  h.swipe(320); assert.equal(h.selected(), 1);
  h.swipe(640); assert.equal(h.selected(), 2);
  h.swipe(320); assert.equal(h.selected(), 1);
  h.swipe(0); assert.equal(h.selected(), 0);
  h.swipe(-100); assert.equal(h.selected(), 0);
  h.swipe(2000); assert.equal(h.selected(), 2);
  h.swipe(Number.NaN); assert.equal(h.selected(), 2);
  const pager = h.find('welcome-photo-pager').props;
  assert.equal(pager.horizontal, true); assert.equal(pager.pagingEnabled, true);
  assert.equal(pager.bounces, false); assert.equal(pager.overScrollMode, 'never');
});

test('all dots are 48dp controls and select their measured page without animation', () => {
  const h = fixture(); h.layout(333);
  for (const index of [2, 0, 1]) {
    h.pressDot(index);
    assert.equal(h.selected(), index);
    assert.deepEqual(h.scrolls.at(-1), { x: index * 333, y: 0, animated: false });
    assert.equal(h.dots()[index].props.style.width, 48);
    assert.equal(h.dots()[index].props.style.height, 48);
    assert.match(h.dots()[index].props.accessibilityLabel, new RegExp(`Show illustration ${index + 1} of 3:`));
  }
});

test('rerender, theme and height changes keep the selected stable photo; a fresh mount starts B', () => {
  const h = fixture(); h.layout(320); h.swipe(640);
  h.render(); h.render(190); h.theme({ paper: '#ffffff', green: '#103c31', outline: '#7c898c' });
  assert.equal(h.selected(), 2);
  assert.equal(h.find('welcome-photo-ocean-turtle').props.accessibilityElementsHidden, false);
  assert.equal(h.find('welcome-photo-story-mountains').props.accessibilityElementsHidden, true);
  const fresh = fixture(); fresh.layout(320); assert.equal(fresh.selected(), 0);
});

test('layout changes realign the selected photo and reject stale native offsets', () => {
  const h = fixture(); h.layout(320); h.swipe(640); h.layout(400);
  assert.deepEqual(h.scrolls.at(-1), { x: 800, y: 0, animated: false });
  h.find('welcome-photo-pager').props.onScroll(h.event(640, 320)); h.render();
  assert.equal(h.selected(), 2);
  h.find('welcome-photo-pager').props.onScroll(h.event(0, 400)); h.render();
  assert.equal(h.selected(), 2, 'resize must not select a stale first-page event');
  h.find('welcome-photo-pager').props.onContentSizeChange();
  assert.deepEqual(h.scrolls.at(-1), { x: 800, y: 0, animated: false });
  h.swipe(400, 400); assert.equal(h.selected(), 1, 'new drag after reflow remains usable');
});

test('captions pass through gestures and carousel interactions cannot access onboarding, session, tour, navigation or storage', () => {
  const h = fixture(); h.layout(320);
  const captions = h.nodes().filter(node => node.props.pointerEvents === 'none');
  assert.equal(captions.length, 3);
  h.swipe(320); h.pressDot(2); h.render();
  assert.ok(h.requestedModules.every(name => name.endsWith('.png') || ['react', 'react/jsx-runtime', 'react-native', '../../components/ui'].includes(name)));
  assert.equal(h.find('welcome-photo-pager').props.onStartShouldSetResponderCapture, undefined, 'native horizontal pager does not capture vertical parent gestures');
});

test('Auth retains explicit Welcome actions while mounting the informational carousel without completion callbacks', () => {
  const jsx = (type, props) => ({ type, props: props || {} });
  const forbidden = () => { throw Error('Photo presentation must not complete onboarding or mutate a session'); };
  const modules = {
    react: { useState: value => [value, forbidden], useCallback: callback => callback, useRef: value => ({ current: value }) },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { BackHandler: {}, Keyboard: {}, Platform: { OS: 'android' }, Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', View: 'View', useWindowDimensions: () => ({ width: 390, height: 844, fontScale: 1 }) },
    'expo-router': { router: { replace: forbidden }, useFocusEffect: () => undefined },
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../components/ui': { ConnectionHint: 'ConnectionHint', fonts: {}, IconButton: 'IconButton', Notice: 'Notice', Text: 'Text', useTheme: () => ({ colors: {} }) },
    '../lib/session': { useSession: () => ({ completeOnboarding: forbidden, login: forbidden, register: forbidden }) },
    './Brand': { CampaignAuthBrand: 'CampaignAuthBrand' },
    './auth/AuthControls': Object.fromEntries(['AuthAction', 'AuthBackdrop', 'AuthDivider', 'AuthField'].map(name => [name, name])),
    './auth/WelcomeCarousel': { WelcomeCarousel: 'WelcomeCarousel' },
  };
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', compile('../src/features/auth.tsx'))(name => {
    assert.ok(name in modules, `Unexpected Auth dependency ${name}`); return modules[name];
  }, loaded.exports, loaded);
  const nodes = descendants(loaded.exports.AuthForm({}));
  assert.deepEqual(nodes.filter(node => node.type === 'AuthAction').map(node => node.props.title), ['Get Started', 'Sign In', 'Continue as guest']);
  assert.deepEqual(nodes.find(node => node.type === 'WelcomeCarousel').props, { height: 176 });
  const outerScroll = nodes.find(node => node.type === 'ScrollView');
  assert.notEqual(outerScroll.props.scrollEnabled, false);
  assert.notEqual(outerScroll.props.horizontal, true);
});
