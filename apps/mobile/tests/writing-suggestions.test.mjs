import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', source)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name];
  }, module.exports, module);
  return module.exports;
}
const { newDraft } = load('../src/lib/types.ts');
const engine = load('../src/features/creation/suggestions.ts');
const { writingSuggestions, applyWritingSuggestion, visibleWritingSuggestions, dismissWritingSuggestion } = engine;
const fixture = overrides => ({ ...newDraft(), title: 'Cleaner coastlines for everyone', category: 'Environment', creatorName: 'Local voices', ...overrides });
const byRule = (draft, step, rule) => writingSuggestions(draft, step).find(suggestion => suggestion.rule === rule);

test('writing rules are deterministic, on-device and do not mutate the draft or its goal', () => {
  const draft = fixture({ goal: 475, intro: 'Coastal waste affects our shared shoreline.' });
  const before = JSON.stringify(draft);
  assert.deepEqual(writingSuggestions(draft, 0), writingSuggestions(draft, 0));
  assert.equal(JSON.stringify(draft), before);
  for (const suggestion of writingSuggestions(draft, 0)) {
    assert.equal('patch' in suggestion, false, 'UI receives no reusable stale patch');
    const patch = applyWritingSuggestion(draft, suggestion);
    assert.equal(patch && 'goal' in patch, false);
    assert.equal(patch && 'sources' in patch, false);
  }
});

test('Basics can reuse a supplied headline within the mandatory 60-character title limit', () => {
  const draft = fixture({ title: '', storyHeadline: 'Learn about our local coastline' });
  const suggestion = byRule(draft, 0, 'reuse-story-headline');
  assert.ok(suggestion); assert.equal(suggestion.preview, draft.storyHeadline);
  assert.deepEqual(applyWritingSuggestion(draft, suggestion), { title: draft.storyHeadline });
  assert.equal(byRule({ ...draft, storyHeadline: 'x'.repeat(61) }, 0, 'reuse-story-headline'), undefined);
});

test('tidying a title changes only whitespace and preserves case, punctuation and factual content', () => {
  const draft = fixture({ title: '  Protect   12 km of Coast!  ', summary: 'Keep my summary.' });
  const suggestion = byRule(draft, 0, 'tidy-title');
  assert.deepEqual(applyWritingSuggestion(draft, suggestion), { title: 'Protect 12 km of Coast!' });
  assert.equal(draft.title, '  Protect   12 km of Coast!  ');
});

test('summary suggestions copy a complete existing sentence with its caption/source content untouched', () => {
  const draft = fixture({ intro: 'Our shoreline matters to local families. This is a second sentence.', sections: [{ id: 'photo', kind: 'image', text: '', url: '/media/owned.jpg', caption: 'Original caption', credit: 'Original credit' }] });
  const suggestion = byRule(draft, 0, 'introduce-message');
  assert.equal(suggestion.preview, 'Our shoreline matters to local families.');
  assert.deepEqual(applyWritingSuggestion(draft, suggestion), { summary: suggestion.preview });
  assert.equal(draft.sections[0].caption, 'Original caption');
  assert.equal(draft.sections[0].credit, 'Original credit');
});

test('a summary can reuse the first existing paragraph, never image captions or fabricated text', () => {
  const draft = fixture({ sections: [{ id: 'photo', kind: 'image', text: '', caption: 'Not a summary' }, { id: 'paragraph', kind: 'text', text: 'A documented local message without terminal punctuation' }] });
  assert.equal(byRule(draft, 0, 'introduce-message').preview, 'A documented local message without terminal punctuation');
  const empty = byRule(fixture(), 0, 'introduce-message');
  assert.equal(empty.preview, undefined); assert.equal(applyWritingSuggestion(fixture(), empty), null);
});

test('an overlong opening sentence produces guidance rather than cutting a claim in half', () => {
  const draft = fixture({ intro: 'word '.repeat(200) });
  const suggestion = byRule(draft, 0, 'introduce-message');
  assert.equal(suggestion.preview, undefined); assert.equal(suggestion.action, 'Write summary');
  assert.equal(applyWritingSuggestion(draft, suggestion), null);
});

test('a nonempty title, summary or introduction is never replaced by a reuse suggestion', () => {
  const draft = fixture({ summary: 'This is my own full summary for this campaign.', storyHeadline: 'My own story headline', intro: 'My own introduction.' });
  assert.equal(byRule(draft, 0, 'reuse-story-headline'), undefined);
  assert.equal(byRule(draft, 0, 'introduce-message'), undefined);
  assert.equal(byRule(draft, 1, 'reuse-campaign-title'), undefined);
  assert.equal(byRule(draft, 1, 'reuse-summary'), undefined);
});

test('a stale suggestion cannot replace a newly typed destination or changed source', () => {
  const draft = fixture({ summary: 'A summary I wrote for a clearer story.' });
  const suggestion = byRule(draft, 1, 'reuse-summary');
  assert.ok(suggestion);
  assert.equal(applyWritingSuggestion({ ...draft, intro: 'A newer introduction' }, suggestion), null);
  assert.equal(applyWritingSuggestion({ ...draft, summary: 'A different source summary' }, suggestion), null);
  assert.deepEqual(applyWritingSuggestion({ ...draft, geography: 'Pune', goal: 900 }, suggestion), { intro: draft.summary });
});

test('applying a forged preview still uses the current engine text and cannot inject unrelated fields', () => {
  const draft = fixture({ summary: 'An existing message worth explaining.' });
  const suggestion = byRule(draft, 1, 'reuse-summary');
  assert.deepEqual(applyWritingSuggestion(draft, { ...suggestion, preview: 'Invented facts', patch: { goal: 9000 } }), { intro: draft.summary });
});

test('audience action is an explicit append that preserves every existing story block and media reference', () => {
  const draft = fixture({ intro: 'This shoreline matters.', sections: [{ id: 'paragraph', kind: 'text', text: 'Context from our community.', format: 'italic' }, { id: 'image', kind: 'image', text: '', url: '/media/story.jpg', caption: 'Caption' }], coverImage: '/media/cover.jpg', adImages: ['/media/ad.jpg'] });
  const before = JSON.stringify(draft), suggestion = byRule(draft, 1, 'audience-action');
  const patch = applyWritingSuggestion(draft, suggestion);
  assert.deepEqual(patch.sections.slice(0, -1), draft.sections);
  assert.deepEqual(Object.keys(patch), ['sections']);
  assert.equal(patch.sections.at(-1).kind, 'action');
  assert.match(patch.sections.at(-1).text, /Learn more/);
  assert.doesNotMatch(patch.sections.at(-1).text, /donate|verified|\d/);
  assert.equal(JSON.stringify(draft), before);
  assert.equal(byRule({ ...draft, ...patch }, 1, 'audience-action'), undefined);
  assert.equal(applyWritingSuggestion({ ...draft, sections: [...draft.sections, { id: 'new', kind: 'text', text: 'Newest words' }] }, suggestion), null);
});

test('existing action sections or action wording suppress redundant action suggestions', () => {
  assert.equal(byRule(fixture({ intro: 'Please share this message.' }), 1, 'audience-action'), undefined);
  assert.equal(byRule(fixture({ intro: 'This matters.', sections: [{ id: 'my-action', kind: 'action', text: 'Explore the evidence.' }] }), 1, 'audience-action'), undefined);
});

test('sources guidance never fabricates, inserts or rewrites a source', () => {
  const draft = fixture({ intro: 'A specific claim needs context.' });
  const suggestion = byRule(draft, 1, 'supporting-source');
  assert.equal(suggestion.target.field, 'sources');
  assert.equal(suggestion.preview, undefined); assert.equal(applyWritingSuggestion(draft, suggestion), null);
  assert.equal(byRule({ ...draft, sources: [{ id: 'existing', title: 'A source the creator chose', url: 'https://example.org/context' }] }, 1, 'supporting-source'), undefined);
});

test('dismissed tips remain hidden through rerenders, unrelated edits, theme and step navigation', () => {
  const draft = fixture({ title: 'Coast' }), suggestion = byRule(draft, 0, 'specific-title');
  const dismissed = dismissWritingSuggestion({ draftKey: 'draft-a', ids: [] }, 'draft-a', suggestion.id);
  assert.equal(visibleWritingSuggestions(draft, 0, 'draft-a', dismissed).some(item => item.id === suggestion.id), false);
  assert.equal(visibleWritingSuggestions({ ...draft, geography: 'Another place' }, 0, 'draft-a', dismissed).some(item => item.id === suggestion.id), false);
  writingSuggestions(draft, 1);
  assert.equal(visibleWritingSuggestions(draft, 0, 'draft-a', dismissed).some(item => item.id === suggestion.id), false);
  assert.deepEqual(dismissWritingSuggestion(dismissed, 'draft-a', suggestion.id), dismissed);
});

test('dismissals follow relevant text revisions and never leak between guest/account drafts', () => {
  const draft = fixture({ title: 'Coast' }), suggestion = byRule(draft, 0, 'specific-title');
  const dismissed = dismissWritingSuggestion({ draftKey: 'guest:draft-a', ids: [] }, 'guest:draft-a', suggestion.id);
  assert.ok(visibleWritingSuggestions(draft, 0, 'account:draft-a', dismissed).some(item => item.id === suggestion.id));
  const changed = byRule({ ...draft, title: 'Rivers' }, 0, 'specific-title');
  assert.notEqual(changed.id, suggestion.id);
  assert.ok(visibleWritingSuggestions({ ...draft, title: 'Rivers' }, 0, 'guest:draft-a', dismissed).some(item => item.id === changed.id));
});

const jsx = (type, props, key) => ({ type, props: props || {}, key });
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
let expanded = null;
const announcements = [];
const { WritingSuggestions } = load('../src/features/creation/WritingSuggestions.tsx', {
  react: { useState: initial => [expanded ?? initial, value => { expanded = typeof value === 'function' ? value(expanded) : value; }] },
  'react/jsx-runtime': { jsx, jsxs: jsx },
  'react-native': { View: 'View', Pressable: 'Pressable', ScrollView: 'ScrollView', AccessibilityInfo: { announceForAccessibility: value => announcements.push(value) } },
  '@expo/vector-icons/Ionicons': { default: 'Icon' },
  '../../components/ui': { Text: 'Text', useTheme: () => ({ colors: new Proxy({}, { get: () => '#121212' }) }) },
  './suggestions': engine,
});

test('suggestion UI applies only an explicitly reviewed proposal, with separate dismissal and no render mutations', () => {
  expanded = null; announcements.length = 0;
  const calls = [], draft = fixture({ summary: 'Our own campaign summary.' }), suggestion = byRule(draft, 1, 'reuse-summary');
  const props = { draft, step: 1, draftKey: 'guest:owned', dismissed: { draftKey: 'guest:owned', ids: [] }, onDismiss: id => calls.push(['dismiss', id]), onApply: patch => calls.push(['apply', patch]), onNavigate: target => calls.push(['navigate', target]) };
  let tree = WritingSuggestions(props);
  assert.deepEqual(calls, []);
  nodes(tree).find(node => node.props.accessibilityLabel === suggestion.title).props.onPress();
  tree = WritingSuggestions(props);
  assert.ok(nodes(tree).find(node => node.props.accessibilityLabel === 'Proposed text'));
  nodes(tree).find(node => node.props.accessibilityLabel === suggestion.action).props.onPress();
  assert.deepEqual(calls, [['apply', { intro: draft.summary }]]);
  assert.match(announcements[0], /Suggestion applied/);
  assert.equal(nodes(tree).some(node => node.props.allowFontScaling === false), false);
  const dismiss = nodes(tree).find(node => node.props.accessibilityLabel === `Dismiss suggestion: ${suggestion.title}`);
  assert.equal(dismiss.props.style({ pressed: false }).minHeight, 48); dismiss.props.onPress();
  assert.deepEqual(calls[1], ['dismiss', suggestion.id]);
});

test('guidance actions navigate without content mutation and locked review drafts hide suggestions', () => {
  expanded = null;
  const calls = [], draft = fixture({ title: 'Coast' }), suggestion = byRule(draft, 0, 'specific-title');
  const props = { draft, step: 0, draftKey: 'owned', dismissed: { draftKey: 'owned', ids: [] }, onDismiss: () => {}, onApply: () => assert.fail('Guidance must not insert prose'), onNavigate: target => calls.push(target) };
  nodes(WritingSuggestions(props)).find(node => node.props.accessibilityLabel === suggestion.title).props.onPress();
  nodes(WritingSuggestions(props)).find(node => node.props.accessibilityLabel === suggestion.action).props.onPress();
  assert.deepEqual(calls, [{ step: 0, field: 'title' }]);
  assert.equal(WritingSuggestions({ ...props, disabled: true }), null);
});
