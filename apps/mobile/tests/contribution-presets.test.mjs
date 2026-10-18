import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', source)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name];
  }, loaded, loaded.exports);
  return loaded.exports;
}
const model = load('../src/features/contributions/presetLayout.ts');
const fx = load('../src/lib/currency.ts');
const now = Date.parse('2026-10-17T12:00:00Z');
const usd = fx.freezeMoneySnapshot('USD', null, now);
const inr = fx.freezeMoneySnapshot('INR', fx.parseReferenceRate({ base: 'USD', quote: 'INR', rate: 94.94, date: '2026-10-17' }, '2026-10-17T11:00:00Z', now), now);
const jsx = (type, props) => ({ type, props: props || {} });
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
function fixture(snapshot = inr) {
  const values = [], calls = [];
  let cursor = 0, tree, window = { width: 360, fontScale: 1.17 };
  let theme = { colors: { primary: 'mint', onPrimary: 'black', line: 'line', paper: 'charcoal', ink: 'white' } };
  let props = { selectedUsd: 25, formatAmount: value => fx.formatMoney(value, snapshot), disabled: false, onSelect: value => calls.push(value) };
  const react = {
    useState: initial => {
      const index = cursor++;
      if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial;
      return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next; }];
    },
    useRef: initial => {
      const index = cursor++;
      if (!(index in values)) values[index] = { current: initial };
      return values[index];
    },
  };
  const { ContributionPresets } = load('../src/features/contributions/ContributionPresets.tsx', {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { View: 'View', ScrollView: 'ScrollView', Pressable: 'Pressable', useWindowDimensions: () => window },
    '../../components/ui': { Text: 'Text', fonts: { bold: 'ManropeBold' }, useTheme: () => theme },
    './presetLayout': model,
  });
  const render = () => { cursor = 0; tree = ContributionPresets(props); return tree; };
  const all = () => nodes(tree);
  const find = id => all().find(node => node.props.testID === id);
  const layout = width => { find('contribution-presets').props.onLayout({ nativeEvent: { layout: { width } } }); render(); };
  const measure = widths => {
    widths.forEach((width, index) => { find(`contribution-preset-measure-${model.CONTRIBUTION_PRESETS[index]}`).props.onLayout({ nativeEvent: { layout: { width } } }); render(); });
  };
  render();
  return {
    all, find, render, layout, measure, calls,
    buttons: () => all().filter(node => node.type === 'Pressable'),
    update: patch => { props = { ...props, ...patch }; render(); },
    scale: fontScale => { window = { ...window, fontScale }; render(); },
    theme: colors => { theme = { colors }; render(); },
  };
}

test('measured INR labels reflow into two equal columns instead of splitting digits across four boxes', () => {
  const h = fixture(); h.layout(320); h.measure([67, 67, 80, 55]);
  assert.deepEqual(h.buttons().map(node => node.props.children.props.children), ['₹474.70', '₹949.40', '₹2,373.50', '₹4,747']);
  const widths = h.buttons().map(node => node.props.style({ pressed: false }).width);
  assert.deepEqual(widths, [155, 155, 155, 155]);
  assert.ok(widths.every(width => width >= 80 + model.PRESET_HORIZONTAL_PADDING * 2 + 4));
});

test('short USD labels can use four columns and layout remeasures after width changes', () => {
  const h = fixture(usd); h.layout(320); h.measure([19, 28, 28, 28]);
  assert.deepEqual(h.buttons().map(node => node.props.style({ pressed: false }).width), [72.5, 72.5, 72.5, 72.5]);
  h.layout(240);
  assert.deepEqual(h.buttons().map(node => node.props.style({ pressed: false }).width), [115, 115, 115, 115]);
  h.layout(600);
  assert.deepEqual(h.buttons().map(node => node.props.style({ pressed: false }).width), [142.5, 142.5, 142.5, 142.5]);
});

test('larger native text measurements choose one column without reducing or disabling font scaling', () => {
  const h = fixture(); h.layout(280); h.scale(2); h.measure([132, 132, 159, 111]);
  for (const button of h.buttons()) {
    assert.equal(button.props.style({ pressed: false }).width, 280);
    assert.equal(button.props.style({ pressed: false }).minHeight, 48);
    const label = button.props.children;
    assert.equal(label.props.style[0].fontSize, 15);
    assert.equal(label.props.allowFontScaling, undefined);
    assert.equal(label.props.adjustsFontSizeToFit, undefined);
    assert.equal(label.props.numberOfLines, undefined, 'never hide part of a monetary amount');
  }
});

test('preset selection passes original canonical USD values and retains the frozen conversion', () => {
  const h = fixture(), original = JSON.stringify(inr);
  for (const button of h.buttons()) button.props.onPress();
  assert.deepEqual(h.calls, [5, 10, 25, 50]);
  assert.equal(JSON.stringify(inr), original);
  for (const preset of model.CONTRIBUTION_PRESETS) assert.equal(fx.usdFromInput(fx.inputForUsd(preset, inr), inr), preset);
  h.update({ selectedUsd: 50 });
  assert.deepEqual(h.buttons().map(node => node.props.accessibilityState.selected), [false, false, false, true]);
  assert.equal(h.buttons()[3].props.children.props.children, '₹4,747');
});

test('busy selection is disabled, announced and cannot invoke amount changes', () => {
  const h = fixture(); h.update({ disabled: true });
  for (const button of h.buttons()) {
    assert.equal(button.props.disabled, true);
    assert.equal(button.props.accessibilityState.disabled, true);
    assert.equal(button.props.accessibilityRole, 'button');
    assert.match(button.props.accessibilityLabel, /contribution$/);
    assert.equal(button.props.style({ pressed: false }).opacity, 0.5);
    button.props.onPress();
  }
  assert.deepEqual(h.calls, []);
});

test('native label measurement is hidden from accessibility and theme changes preserve layout and selection', () => {
  const h = fixture(); h.layout(320); h.measure([67, 67, 80, 55]);
  const measurement = h.all().find(node => node.type === 'ScrollView');
  assert.equal(measurement.props.horizontal, true);
  assert.equal(measurement.props.pointerEvents, 'none');
  assert.equal(measurement.props.accessibilityElementsHidden, true);
  assert.equal(measurement.props.importantForAccessibility, 'no-hide-descendants');
  h.theme({ primary: 'darkGreen', onPrimary: 'white', paper: 'white', ink: 'black', line: 'gray' });
  assert.equal(h.buttons()[2].props.style({ pressed: false }).width, 155);
  assert.equal(h.buttons()[2].props.style({ pressed: false }).backgroundColor, 'darkGreen');
  assert.equal(h.buttons()[2].props.children.props.style[1].color, 'white');
  assert.equal(h.buttons()[0].props.children.props.style[1].color, 'black');
  assert.equal(h.buttons()[2].props.accessibilityState.selected, true);
});

test('a changed currency or font scale invalidates old native widths before measurement', () => {
  const h = fixture(usd); h.layout(320); h.measure([19, 28, 28, 28]);
  assert.equal(h.buttons()[0].props.style({ pressed: false }).width, 72.5);
  h.update({ formatAmount: value => fx.formatMoney(value, inr) });
  assert.equal(h.buttons()[0].props.style({ pressed: false }).width, 155);
  h.measure([67, 67, 80, 55]); h.scale(2);
  assert.equal(h.buttons()[0].props.style({ pressed: false }).width, 320);
});

test('layout packs complete measured amounts with adequate padding across native viewport sizes', () => {
  for (const width of [240, 280, 320, 353, 400, 600]) for (const labelWidth of [28, 67, 80, 132, 159]) {
    const result = model.contributionPresetLayout(width, [labelWidth]);
    assert.ok([1, 2, 4].includes(result.columns));
    assert.ok(Math.abs(result.itemWidth * result.columns + model.PRESET_GAP * (result.columns - 1) - width) < 0.001);
    assert.ok(result.itemWidth >= Math.ceil(labelWidth) + model.PRESET_HORIZONTAL_PADDING * 2 + 4);
    assert.ok(result.itemWidth >= 48);
  }
});
