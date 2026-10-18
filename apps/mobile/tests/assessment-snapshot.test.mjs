import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
function load(path, modules) {
  const module = { exports: {} }, code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', code)(name => { assert.ok(name in modules, name); return modules[name]; }, module, module.exports);
  return module.exports;
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree && typeof tree === 'object' ? text(tree.props?.children) : String(tree ?? ''); }

test('reviewer snapshot displays exact working content, sources, ad images, targeting and goal without a public-cache substitution', () => {
  const { AssessmentSnapshot } = load('../src/features/transparency/AssessmentSnapshot.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View' },
    '../../components/ui': { Accordion: 'Accordion', Picture: 'Picture', Text: 'Text', useTheme: () => ({ styles: {} }) },
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: x => `USD ${x}` }) },
    '../creation/Preview': { AdPreview: 'AdPreview', StoryPreview: 'StoryPreview' },
  });
  const content = { title: 'Private H2 title', category: 'Science', creatorName: 'Fictional QA', summary: 'Private summary', coverImage: '/media/private-cover.jpg', storyHeadline: 'Private headline', intro: 'Private intro', sections: [{ kind: 'text', text: 'Private story' }], sources: [{ title: 'Private source', url: 'https://example.org/working' }], adImages: ['/media/ad-one.jpg', '/media/ad-two.jpg'], adHeadline: 'H2 advertising', adDescription: 'H2 ad text', cta: 'Learn more', geography: 'Pune', interests: 'Night sky', channels: ['Display'], allocation: { Display: 100 }, durationDays: 14, goal: 700 };
  const workspace = { target: 'working', assessedVersion: 2, contentHash: 'hash-h2', content };
  const tree = AssessmentSnapshot({ workspace }), all = nodes(tree);
  assert.match(tree.props.title, /exact working content · version 2/);
  for (const value of ['Private H2 title', 'Private summary', 'H2 advertising', 'H2 ad text', 'Pune', 'Night sky', 'USD 700', 'hash-h2']) assert.ok(text(tree).includes(value), value);
  assert.equal(all.find(n => n.type === 'StoryPreview').props.draft, content);
  assert.deepEqual(all.filter(n => n.type === 'AdPreview').map(n => n.props.draft.adImages), [['/media/ad-one.jpg'], ['/media/ad-two.jpg']]);
  assert.equal(all.find(n => n.type === 'Picture').props.uri, '/media/private-cover.jpg');
});

test('scoped keep-mounted accordion hides collapsed controls from layout and accessibility without discarding child state', () => {
  let open = true;
  const { Accordion } = load('../src/components/ui.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, react: { useState: () => [open, next => { open = next; }] },
    'react-native': { View: 'View', Pressable: 'Pressable' }, 'react-native-safe-area-context': {},
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../lib/theme': { useTheme: () => ({ colors: {}, styles: {} }) }, '../lib/appearance': { fonts: {} }, '../lib/api': {},
  });
  const child = { type: 'UnsavedEditor', props: { value: 'typed evidence' } };
  let tree = Accordion({ title: 'Campaign', keepMounted: true, initiallyOpen: true, children: child });
  nodes(tree).find(n => n.type === 'Pressable').props.onPress();
  tree = Accordion({ title: 'Campaign', keepMounted: true, children: child });
  const hidden = nodes(tree).find(n => n.props.children === child);
  assert.equal(hidden.props.style.display, 'none');
  assert.equal(hidden.props.importantForAccessibility, 'no-hide-descendants');
  assert.equal(hidden.props.children, child);
  assert.equal(nodes(Accordion({ title: 'Ordinary', children: child })).some(n => n.props.children === child), false, 'other accordions retain existing unmount behavior');
  const reviewer = readFileSync(new URL('../src/features/reviewer.tsx', import.meta.url), 'utf8');
  assert.match(reviewer, /initiallyOpen=\{c.status === "Submitted for Review"\}\s+keepMounted/);
});
