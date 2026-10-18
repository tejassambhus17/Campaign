import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules, globals = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', ...Object.keys(globals), source)(name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name];
  }, loaded.exports, loaded, ...Object.values(globals));
  return loaded.exports;
}
const types = load('../src/lib/types.ts', {});
const model = load('../src/features/creation/model.ts', { '../../lib/types': types });
const persistence = load('../src/features/creation/persistence.ts', { './model': model });
const media = load('../src/features/creation/media.ts', {});
const draftDeletion = load('../src/features/creation/draftDeletion.ts', {});
const jsx = (type, props, key) => ({ type, props: props || {}, key: key ?? null });
const theme = { colors: new Proxy({}, { get: () => '#121212' }), styles: new Proxy({}, { get: () => ({}) }) };
const modules = {
  react: {}, 'react/jsx-runtime': { jsx, jsxs: jsx },
  'react-native': { View: 'View', Pressable: 'Pressable', ActivityIndicator: 'ActivityIndicator', useWindowDimensions: () => ({ width: 393, fontScale: 1.17 }) },
  '@expo/vector-icons/Ionicons': { default: 'Icon' },
  '../../components/ui': { Accordion: 'Accordion', Button: 'Button', Picture: 'Picture', Text: 'Text', useTheme: () => theme },
  '../../components/Information': { InfoAction: 'InfoAction', InfoSheet: 'InfoSheet', SummaryLink: 'SummaryLink', SelectionSheet: 'SelectionSheet' },
  './CreationUi': { CreationButton: 'CreationButton', MediaThumb: 'MediaThumb', UploadArea: 'UploadArea' },
  './model': model, './persistence': persistence, './media': media, './draftDeletion': draftDeletion,
};
const { CreationOverview } = load('../src/features/creation/CreationOverview.tsx', modules);
modules['./CreationOverview'] = { CreationOverview };
const { CreationEntry } = load('../src/features/creation/CreationEntry.tsx', modules);
const { CampaignMediaSections } = load('../src/features/creation/CampaignMedia.tsx', modules);
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  if (typeof tree.type === 'function') return nodes(tree.type(tree.props));
  return [tree, ...nodes(tree.props?.children)];
}
const text = tree => nodes(tree).filter(n => n.type === 'Text').flatMap(n => n.props.children).filter(v => typeof v === 'string').join(' ');
const fixture = (id = 'local-one') => ({ localId: id, step: 2, goalInput: '17.50', updatedAt: '2026-10-17T09:30:00Z', draft: { ...model.blankDraft(), title: 'Existing original title', coverImage: '/media/original-cover.jpg', adImages: ['/media/original-ad.jpg'], sections: [{ id: 'story-one', kind: 'image', text: '', url: '/media/story.jpg', caption: 'Original caption' }] } });
function entry(overrides = {}) {
  return CreationEntry({ signedIn: false, localDrafts: [], accountDrafts: [], accountLoading: false, accountError: false, disabled: false, onManual: () => {}, onGuided: () => {}, onResumeLocal: () => {}, onResumeAccount: () => {}, onRetryAccount: () => {}, ...overrides });
}

test('Create entry puts the sole manual and labelled guided actions ahead of compact existing drafts without creating anything', () => {
  const existing = [fixture(), fixture('local-two')], before = JSON.stringify(existing), calls = [];
  const tree = entry({ localDrafts: existing, onManual: () => calls.push('manual'), onGuided: () => calls.push('guided'), onResumeLocal: value => calls.push(value) });
  const all = nodes(tree), actions = all.filter(n => n.type === 'CreationButton');
  assert.deepEqual(actions.map(n => n.props.title), ['Create manually', 'Guided creation · demo']);
  assert.equal(actions[0].props.secondary, undefined); assert.equal(actions[1].props.secondary, true);
  assert.ok(all.indexOf(actions[1]) < all.findIndex(n => n.props.accessibilityLabel?.startsWith('Resume ')));
  assert.match(text(tree), /Guided creation uses an editable template/); assert.match(text(tree), /live speech and AI are not connected/);
  assert.deepEqual(calls, []); assert.equal(JSON.stringify(existing), before);
  actions[0].props.onPress(); actions[1].props.onPress();
  assert.deepEqual(calls, ['manual', 'guided']);
  const resumes = all.filter(n => n.props.accessibilityLabel?.startsWith('Resume '));
  assert.equal(resumes.length, 2); resumes[1].props.onPress();
  assert.equal(calls[2], existing[1]); assert.equal(calls[2].localId, 'local-two'); assert.equal(calls[2].step, 2);
  assert.match(text(tree), /Step 3 of 5/); assert.match(text(tree), /Saved /); assert.match(text(tree), /This device/);
});

test('Create entry keeps a compact five-step overview after the clear entry actions and before drafts', () => {
  const tree = entry(), all = nodes(tree);
  const overview = all.find(n => n.props.accessibilityLabel === 'Five campaign creation steps');
  assert.ok(overview);
  const headings = nodes(overview).filter(n => n.props.accessibilityRole === 'header');
  assert.deepEqual(headings.map(n => n.props.children), model.STEPS);
  assert.ok(all.findIndex(n => n.props.title === 'Guided creation · demo') < all.indexOf(overview));
  assert.ok(all.indexOf(headings[4]) < all.findIndex(n => n.props.children === 'Your drafts'));
  assert.equal(nodes(overview).some(n => n.type === 'Accordion'), false, 'steps stay visible; secondary help may expand');
  const copy = text(overview);
  assert.match(copy, /Give your campaign a clear identity/);
  assert.match(copy, /Set your goal and send for review/);
  const rows = overview.props.children;
  assert.equal(rows.length, 5);
  assert.equal(rows[0].props.children[1].props.style.backgroundColor, undefined, 'no oversized first-step card');
  assert.equal(rows.every(row => row.props.style.minHeight === undefined), true, 'height follows content');
  assert.equal(rows.every(row => row.props.style.height === undefined), true, 'rows reflow with native font scaling');
});

test('draft rows preserve untitled content, input order and truthful local/account synchronization status', () => {
  const first = fixture('first'), second = fixture('second'); first.draft.title = ''; second.accountSavedToken = persistence.accountDraftToken(second);
  const tree = entry({ signedIn: true, localDrafts: [first, second] });
  const resumes = nodes(tree).filter(n => n.props.accessibilityLabel?.startsWith('Resume '));
  assert.equal(resumes[0].props.accessibilityLabel, 'Resume Untitled campaign');
  assert.match(text(tree), /Account save needed/); assert.match(text(tree), /Device \+ account saved/);
  assert.equal(first.draft.title, ''); assert.deepEqual([first.localId, second.localId], ['first', 'second']);
});

test('Create entry distinguishes empty, loading and unavailable account states and retries only on explicit action', () => {
  assert.match(text(entry()), /No saved drafts yet/);
  assert.doesNotMatch(text(entry({ signedIn: true, accountLoading: true })), /No saved drafts yet/);
  let retries = 0;
  const error = entry({ signedIn: true, accountError: true, localDrafts: [fixture()], onRetryAccount: () => retries++ });
  assert.match(text(error), /Device drafts are still available/); assert.doesNotMatch(text(error), /No saved drafts yet/);
  assert.equal(retries, 0); nodes(error).find(n => n.props.title === 'Retry account drafts').props.onPress(); assert.equal(retries, 1);
});

test('account-only drafts resume their stable ID and current step without invented save timestamps', () => {
  const calls = [], account = { ...fixture().draft, id: 'account-owned', currentStep: 3, status: 'Changes Requested' };
  const tree = entry({ signedIn: true, accountDrafts: [account], onResumeAccount: id => calls.push(id) });
  assert.match(text(tree), /Step 4 of 5/); assert.match(text(tree), /Last saved time unavailable/);
  nodes(tree).find(n => n.props.accessibilityLabel?.startsWith('Resume ')).props.onPress();
  assert.deepEqual(calls, ['account-owned']);
});

test('eligible Delete draft shares a compact action row with Resume, uses its own touch target and never invokes Resume', () => {
  const calls = [], disposable = fixture(), submitted = { ...fixture('submitted'), draft: { ...fixture().draft, status: 'Submitted for Review' } };
  const tree = entry({ localDrafts: [disposable, submitted], deletion: { busy: false, requestLocal: draft => calls.push(['confirm', draft]), requestAccount: () => assert.fail('local action') }, onResumeLocal: draft => calls.push(['resume', draft]) });
  const all = nodes(tree), destroy = all.find(n => n.props.accessibilityLabel === `Delete draft ${disposable.draft.title}`);
  assert.ok(destroy);
  const row = all.find(n => n.type === 'View' && Array.isArray(n.props.children) && n.props.children.includes(destroy));
  const resume = row.props.children[0];
  assert.equal(resume.props.accessibilityLabel, `Resume ${disposable.draft.title}`);
  assert.equal(destroy.props.style({ pressed: false }).minHeight, 48);
  assert.equal(all.filter(n => n.props.accessibilityLabel?.startsWith('Delete draft ')).length, 1);
  destroy.props.onPress(); assert.deepEqual(calls, [['confirm', disposable]]);
  resume.props.onPress(); assert.deepEqual(calls[1], ['resume', disposable]);
});

test('Visuals empty state has separate optional cover and ad upload actions with no mutually-exclusive wording', () => {
  const calls = [], draft = model.blankDraft();
  const tree = CampaignMediaSections({ draft, disabled: false, onUpload: purpose => calls.push(purpose), onChange: () => assert.fail('render must not change assets') });
  const all = nodes(tree); assert.match(text(tree), /Campaign cover/); assert.match(text(tree), /Optional/); assert.match(text(tree), /Advertising images/);
  assert.doesNotMatch(text(tree), /instead/i); assert.match(text(tree), /Story images stay in Story/);
  all.find(n => n.type === 'UploadArea').props.onPress(); all.find(n => n.props.title === 'Add ad image').props.onPress();
  assert.deepEqual(calls, ['cover', 'advertising']); assert.equal(draft.coverImage, ''); assert.deepEqual(draft.adImages, []);
});

test('Visuals populated controls remove or replace only their explicit asset category', () => {
  let draft = fixture().draft;
  const patches = [], uploads = [];
  const tree = CampaignMediaSections({ draft, disabled: false, onUpload: p => uploads.push(p), onChange: patch => patches.push(patch) });
  nodes(tree).find(n => n.props.title === 'Change cover').props.onPress();
  nodes(tree).find(n => n.props.title === 'Remove cover').props.onPress();
  nodes(tree).find(n => n.type === 'MediaThumb').props.onRemove();
  assert.deepEqual(uploads, ['cover']); assert.deepEqual(patches, [{ coverImage: '' }, { adImages: [] }]);
  const withAd = { ...draft, ...media.uploadedMediaPatch(draft, 'advertising', '/media/new-ad.jpg') };
  assert.equal(withAd.coverImage, draft.coverImage); assert.deepEqual(withAd.adImages, ['/media/original-ad.jpg', '/media/new-ad.jpg']); assert.equal(withAd.sections, draft.sections);
  const withCover = { ...withAd, ...media.uploadedMediaPatch(withAd, 'cover', '/media/new-cover.jpg') };
  assert.equal(withCover.coverImage, '/media/new-cover.jpg'); assert.equal(withCover.adImages, withAd.adImages); assert.equal(withCover.sections, draft.sections);
  const withStory = { ...withCover, ...media.uploadedMediaPatch(withCover, 'story', '/media/new-story.jpg', 'story-one') };
  assert.equal(withStory.coverImage, withCover.coverImage); assert.equal(withStory.adImages, withCover.adImages); assert.equal(withStory.sections[0].caption, 'Original caption');
  assert.equal(withStory.sections[0].url, '/media/new-story.jpg');
  const restored = JSON.parse(JSON.stringify({ ...fixture(), draft: withStory }));
  assert.equal(restored.step, 2); assert.equal(restored.goalInput, '17.50'); assert.deepEqual(model.normalizeDraft(restored.draft).adImages, withStory.adImages);
});

test('picker validation and upload disclosure use the same existing formats and size boundary', () => {
  assert.equal(media.validatePickedImage({ fileName: 'photo.PNG', fileSize: media.IMAGE_UPLOAD_MAX_BYTES }), 'image/png');
  assert.equal(media.validatePickedImage({ mimeType: 'image/webp' }), 'image/webp');
  assert.throws(() => media.validatePickedImage({ mimeType: 'image/gif' }), /JPEG, PNG, or WebP/);
  assert.throws(() => media.validatePickedImage({ mimeType: 'image/jpeg', fileSize: media.IMAGE_UPLOAD_MAX_BYTES + 1 }), /larger than 8 MB/);
  assert.match(media.IMAGE_UPLOAD_HINT, /JPEG, PNG or WebP.*8 MB/);
});

// Actual CreateScreen event closures, with a native-element/hook adapter. This
// checks picker cancellation/auth handoff and current draft updates; Android
// picker gestures and layout remain separate native acceptance.
function screenHarness({ signedIn = true, picker = { canceled: true }, startInEditor = true, localDrafts = [fixture()] } = {}) {
  const slots = [], refs = [], apiCalls = [], saved = [], navigation = [], scopes = [];
  const frames = [], nativeScrolls = [], announcements = [];
  let stateCursor = 0, refCursor = 0, pickerCalls = 0;
  const user = signedIn ? { id: 'fixture-account', name: 'Fixture Owner', email: 'owner@example.test', role: 'member' } : null;
  const active = { ...fixture(), scope: user?.id || 'guest' };
  const react = {
    useCallback: callback => callback, useEffect: () => {},
    useState: initial => {
      const index = stateCursor++;
      if (!(index in slots)) slots[index] = index === 1 && startInEditor ? active : index === 3 && startInEditor ? 'edit' : typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef: value => { const index = refCursor++; if (!(index in refs)) refs[index] = { current: value }; return refs[index]; },
  };
  const ui = Object.fromEntries(['Accordion', 'Button', 'Empty', 'Field', 'Loading', 'Notice', 'Picture', 'Pill', 'Screen', 'Text'].map(name => [name, name]));
  const preview = Object.fromEntries(['AdPreview', 'CampaignPreview', 'FundingPolicies', 'StoryPreview'].map(name => [name, name]));
  const creation = Object.fromEntries(['CampaignReviewSummary', 'CategorySelect', 'CreationActionDock', 'CreationButton', 'CreationProgress', 'CreationTip', 'StoryComposer', 'StoryFormatting'].map(name => [name, name]));
  const { submissionIssues } = load('../src/features/creation/readiness.ts', { './model': model });
  const component = load('../src/app/(tabs)/create.tsx', {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { View: 'View', Image: 'Image', Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: value => value }, useWindowDimensions: () => ({ width: 393, fontScale: 1.17 }), Platform: { OS: 'android' }, AccessibilityInfo: { announceForAccessibility: value => announcements.push(value), setAccessibilityFocus: () => {} }, findNodeHandle: () => 1 },
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    'expo-router': { router: { push: value => navigation.push(value), setParams: () => {}, replace: () => {} }, useFocusEffect: () => {}, useLocalSearchParams: () => ({}) },
    'expo-image-picker': { launchImageLibraryAsync: async () => { pickerCalls++; return picker; } },
    '../../components/ui': { ...ui, useTheme: () => theme },
    '../../components/Information': { InfoAction: 'InfoAction', InfoSheet: 'InfoSheet', SummaryLink: 'SummaryLink' },
    '../../lib/api': { api: async (path, options) => { apiCalls.push({ path, options }); return { url: '/media/new-upload.jpg' }; } },
    '../../features/campaign': { detailPath: id => `/explore/${id}` },
    '../../lib/session': { useSession: () => ({ user, ready: true }), useConfig: () => ({ data: undefined, isLoading: false, isError: false }), useMe: () => ({ data: { campaigns: [] }, isLoading: false, isError: false }), refresh: () => {} },
    '../../lib/types': types,
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: types.money }) },
    '../../features/creation/GoalAmountField': { GoalAmountField: 'GoalAmountField' },
    '../../features/creation/Preview': preview,
    '../../features/creation/model': model,
    '../../features/creation/useDraftLibrary': { useDraftLibrary: scope => { scopes.push(scope); return { entries: localDrafts, loading: false, error: '', canSave: () => true, save: async entry => saved.push(entry), remove: () => assert.fail('must not remove draft'), retry: () => {} }; } },
    '../../features/creation/DraftDeleteDialog': { useDraftDeletion: () => ({ target: null, busy: false }), DraftDeleteDialog: 'DraftDeleteDialog' },
    '../../features/creation/draftDeletion': draftDeletion,
    '../../features/creation/FieldTarget': { CreationTargets: { Provider: 'CreationTargets' }, TargetField: 'TargetField', TargetGroup: 'TargetGroup' },
    '../../features/creation/CreationUi': creation,
    '../../features/creation/CreationEntry': { CreationEntry: 'CreationEntry' },
    '../../features/creation/CampaignMedia': { CampaignMediaSections: 'CampaignMediaSections', CampaignCoverControls: 'CampaignCoverControls' },
    '../../features/creation/media': media,
    '../../features/creation/readiness': { submissionIssues },
    '../../features/creation/SubmissionChecklist': { SubmissionChecklist: 'SubmissionChecklist' },
    '../../features/creation/persistence': persistence,
  }, { requestAnimationFrame: callback => { frames.push(callback); return frames.length; }, FormData: class { values = []; append(...value) { this.values.push(value); } } });
  const render = () => { stateCursor = 0; refCursor = 0; return nodes(component.default()); };
  return { render, active: () => slots[1], saved, navigation, scopes, apiCalls, pickerCalls: () => pickerCalls, nativeScrolls, announcements,
    attachNative: () => { refs[0].current = { scrollTo: value => nativeScrolls.push(value) }; refs[1].current = {}; },
    flushFrames: () => { while (frames.length) frames.shift()(); },
  };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('real CreateScreen opening does not create a draft; explicit manual and guided actions use the existing distinct paths', () => {
  const h = screenHarness({ startInEditor: false, signedIn: false });
  const entry = h.render().find(n => n.type === 'CreationEntry');
  assert.equal(h.active(), null); assert.deepEqual(h.saved, []); assert.deepEqual(h.apiCalls, []); assert.deepEqual(h.scopes, ['guest']);
  entry.props.onManual(); h.render(); assert.equal(h.active().step, 0); assert.equal(h.active().scope, 'guest'); assert.equal(h.active().entryMode, 'edit');
  const guided = screenHarness({ startInEditor: false });
  guided.render().find(n => n.type === 'CreationEntry').props.onGuided();
  guided.render(); assert.equal(guided.active().entryMode, 'voice'); assert.equal(guided.active().scope, 'fixture-account'); assert.equal(guided.active().draft.goal, 0);
});

test('real CreateScreen local Resume preserves ID, step, media and explicit goal within its current scope', () => {
  const existing = fixture('existing-draft'), before = JSON.stringify(existing);
  const h = screenHarness({ startInEditor: false, localDrafts: [existing], signedIn: false });
  h.render().find(n => n.type === 'CreationEntry').props.onResumeLocal(existing); h.render();
  assert.equal(h.active().localId, 'existing-draft'); assert.equal(h.active().step, 2); assert.equal(h.active().goalInput, '17.50'); assert.equal(h.active().scope, 'guest');
  assert.deepEqual(h.active().draft.adImages, existing.draft.adImages); assert.equal(JSON.stringify(existing), before);
});

test('simplified Basics retains the PDF title limit, required creator and existing summary capacity', () => {
  const h = screenHarness(); h.render(); h.active().step = 0;
  const all = h.render();
  const title = all.find(n => n.type === 'TargetField' && n.props.target === 'title');
  assert.equal(title.props.maxLength, 60); assert.match(title.props.hint, /\/60/); assert.match(title.props.hint, /ad headline/);
  assert.ok(all.find(n => n.type === 'TargetField' && n.props.target === 'creatorName').props.label.endsWith('*'));
  assert.equal(all.find(n => n.type === 'TargetField' && n.props.target === 'summary').props.maxLength, 2000);
  assert.equal(all.some(n => n.type === 'GoalAmountField'), false, 'funding goal remains at Submit');
});

test('Basics keeps the optional cover in its own cancellable sheet without skipping Story or changing the draft', () => {
  const h = screenHarness(); h.render(); h.active().step = 0;
  const before = structuredClone(h.active());
  let all = h.render(), cover = all.find(n => n.props.testID === 'creation-basics-cover-sheet');
  assert.equal(cover.props.visible, false);
  all.find(n => n.props.testID === 'creation-basics-cover').props.onPress(); all = h.render();
  cover = all.find(n => n.props.testID === 'creation-basics-cover-sheet');
  assert.equal(cover.props.visible, true); assert.ok(nodes(cover).find(n => n.type === 'CampaignCoverControls'));
  cover.props.onClose(); all = h.render();
  assert.equal(all.find(n => n.props.testID === 'creation-basics-cover-sheet').props.visible, false);
  assert.deepEqual(h.active(), before); assert.equal(h.pickerCalls(), 0); assert.deepEqual(h.apiCalls, []);
});
test('Basics cover upload closes its sheet before the native picker and cancellation preserves all existing media', async () => {
  const h = screenHarness(); h.render(); h.active().step = 0;
  const before = structuredClone(h.active());
  let all = h.render(); all.find(n => n.props.testID === 'creation-basics-cover').props.onPress(); all = h.render();
  all.find(n => n.type === 'CampaignCoverControls').props.onUpload(); all = h.render();
  assert.equal(all.find(n => n.props.testID === 'creation-basics-cover-sheet').props.visible, false);
  assert.equal(h.pickerCalls(), 0, 'native launch waits until the close has committed');
  h.flushFrames(); await settle(); h.render();
  assert.equal(h.pickerCalls(), 1); assert.deepEqual(h.apiCalls, []); assert.deepEqual(h.active(), before);
});
test('Basics guided help uses the existing editable mode, preserves entered content and returns manually', () => {
  const h = screenHarness(); h.render(); h.active().step = 0;
  const before = structuredClone(h.active().draft), localId = h.active().localId;
  let all = h.render(); all.find(n => n.props.testID === 'creation-guided-destination').props.onPress(); all = h.render();
  assert.equal(h.active().entryMode, 'voice'); assert.equal(h.active().localId, localId); assert.deepEqual(h.active().draft, before);
  assert.equal(all.find(n => n.type === 'CreationActionDock').props.primary.props.title, 'Continue manually');
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress(); all = h.render();
  assert.equal(h.active().entryMode, 'edit'); assert.ok(all.find(n => n.props.testID === 'creation-basics-cover'));
  assert.deepEqual(h.active().draft, before); assert.deepEqual(h.apiCalls, []);
});

test('Story keeps headline and introduction immediately editable and its preview returns to the same draft and step', () => {
  const h = screenHarness(); h.render(); h.active().step = 1;
  let all = h.render();
  const heading = all.find(n => n.props.testID === 'creation-story-heading');
  assert.equal(heading.type, 'View'); assert.ok(nodes(heading).find(n => n.props.target === 'storyHeadline'));
  assert.ok(nodes(heading).find(n => n.props.label === 'Introduction'));
  const before = structuredClone(h.active());
  all.find(n => n.props.testID === 'creation-story-preview').props.onPress(); all = h.render();
  const preview = all.find(n => n.type === 'CampaignPreview');
  assert.equal(preview.props.draft, h.active().draft);
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress(); all = h.render();
  assert.ok(all.find(n => n.props.testID === 'creation-story-heading'));
  assert.deepEqual(h.active(), before); assert.deepEqual(h.apiCalls, []);
});

test('media URL validation reveals its stable contextual editor and focuses the native sheet input directly', () => {
  const h = screenHarness(); h.render(); h.attachNative();
  h.active().draft.coverImage = 'file:///invalid-cover';
  let all = h.render();
  const key = all.find(n => n.props.testID === 'creation-image-urls').key;
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress(); all = h.render();
  const editor = all.find(n => n.props.testID === 'creation-image-urls');
  assert.equal(editor.props.reveal.field, 'coverImage'); assert.equal(editor.props.keepMounted, true);
  assert.equal(all.find(n => n.props.target === 'coverImage').props.sheet, true);
  let focused = 0;
  all.find(n => n.type === 'CreationTargets').props.value.register('coverImage', { measureLayout: () => assert.fail('sheet must not measure against underlying editor') }, { focus: () => focused++ }, null, true);
  h.flushFrames(); assert.equal(focused, 1);
  all.find(n => n.props.target === 'coverImage').props.onChangeText('https://example.org/cover.jpg'); all = h.render();
  assert.equal(all.find(n => n.props.testID === 'creation-image-urls').key, key);
  assert.equal(all.find(n => n.props.testID === 'creation-image-urls').props.reveal, false);
  assert.equal(h.active().draft.coverImage, 'https://example.org/cover.jpg');
  assert.deepEqual(h.apiCalls, []);
});

test('Category selection preserves the complete configured option set and only commits its explicit callback', () => {
  const changes = [], options = ['Environment', 'Community', 'Unusual actual category'];
  const { CategorySelect } = load('../src/features/creation/CreationUi.tsx', {
    ...modules, react: {}, '../../lib/CurrencyProvider': { useCurrency: () => ({ money: types.money }) },
  });
  const tree = CategorySelect({ value: 'Community', options, onChange: value => changes.push(value) });
  assert.equal(tree.type, 'SelectionSheet'); assert.equal(tree.props.value, 'Community');
  assert.deepEqual(tree.props.options, options.map(value => ({ value, label: value })));
  assert.deepEqual(changes, []); tree.props.onSelect(options[2]); assert.deepEqual(changes, [options[2]]);
});

test('Submit edit rows remain visible with actual values and exact five-step edit destinations', () => {
  const edits = [], draft = { ...fixture().draft, title: 'Actual title', category: 'Actual category', creatorName: 'Actual creator', geography: 'Actual locations', interests: 'Actual audience', goal: 19.5 };
  const before = structuredClone(draft);
  const { CampaignReviewSummary } = load('../src/features/creation/CreationUi.tsx', {
    ...modules, react: {}, '../../lib/CurrencyProvider': { useCurrency: () => ({ money: value => `$${value}` }) },
  });
  const all = nodes(CampaignReviewSummary({ draft, onEdit: step => edits.push(step) }));
  assert.ok(all.find(n => n.props.testID === 'creation-edit-summary'));
  const rows = all.filter(n => n.props.accessibilityLabel?.startsWith('Edit ') && n.props.accessibilityLabel !== 'Edit campaign basics');
  assert.equal(rows.length, 8); rows.forEach(row => row.props.onPress());
  assert.deepEqual(edits, [0, 0, 3, 4, 3, 3, 1, 2]); assert.deepEqual(draft, before);
  assert.match(text(all), /Actual category.*Actual creator.*Actual locations.*\$19.5/s);
  assert.equal(all.some(n => n.type === 'Accordion'), false);
});

test('required Submit issues are directly visible while optional suggestions retain their nonblocking disclosure', () => {
  const selected = [];
  const { SubmissionChecklist } = load('../src/features/creation/SubmissionChecklist.tsx', { ...modules, react: {} });
  const required = { id: 'goal', step: 4, field: 'goal', title: 'Funding goal', message: 'Choose your goal.', required: true };
  const optional = { id: 'sources', step: 1, field: 'sources', title: 'Sources', message: 'Include supporting context.', required: false };
  const all = nodes(SubmissionChecklist({ issues: [required, optional], onSelect: issue => selected.push(issue) }));
  const visible = all.find(n => n.props.testID === 'creation-required-issues'); assert.ok(visible);
  nodes(visible).find(n => n.type === 'Pressable').props.onPress(); assert.equal(selected[0], required);
  const disclosure = all.find(n => n.type === 'Accordion'); assert.equal(disclosure.props.title, 'Optional improvements · 1');
  assert.match(text(disclosure), /do not block submission/);
  nodes(disclosure).find(n => n.type === 'Pressable').props.onPress(); assert.equal(selected[1], optional);
});

test('preview policies retain every actual policy and source references remain readable without nested disclosure controls', async () => {
  const opened = [];
  const preview = load('../src/features/creation/Preview.tsx', {
    ...modules,
    react: { useState: value => [value, () => {}] },
    'react-native': { View: 'View', Pressable: 'Pressable', Linking: { openURL: async value => opened.push(value) } },
    '../../components/ui': { ...modules['../../components/ui'], Notice: 'Notice', fonts: {} },
    '../../lib/types': types, '../../lib/appearance': { lightColors: {} },
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: types.money, description: 'Actual currency reference' }) },
  });
  const config = { feeRate: .05, peoplePerAdDollar: 27, policies: { refunds: 'Actual refund policy', unspent: 'Actual remaining-funds policy', partialFunding: 'Actual partial-funding policy', extraConfiguredPolicy: 'Actual extra configured rule' } };
  const policies = preview.FundingPolicies({ config });
  assert.equal(policies.type, 'InfoAction');
  assert.match(text(policies), /Actual refund policy.*Actual remaining-funds policy.*Actual partial-funding policy.*Actual extra configured rule/s);
  assert.match(text(policies), /No real payments or advertisements.*never paid directly.*approval is required.*does not.*automatically/s);
  assert.equal(nodes(policies).some(n => n.type === 'Accordion'), false);
  const sources = [{ id: 'evidence-one', title: 'Actual public source', url: 'https://example.org/context' }];
  const sourceTree = preview.StoryPreview({ draft: { storyHeadline: '', intro: '', sections: [], sources } });
  assert.equal(nodes(sourceTree).some(n => n.type === 'Accordion'), false);
  assert.match(text(sourceTree), /Sources & evidence.*do not establish independent verification.*Actual public source.*example.org/s);
  await nodes(sourceTree).find(n => n.props.accessibilityRole === 'link').props.onPress();
  assert.deepEqual(opened, ['https://example.org/context']); assert.equal(sources[0].id, 'evidence-one');
});

test('Reach keeps targeting and duration visible, exposes allocation validation and never invents an unsaved reach', () => {
  const h = screenHarness(); h.render(); h.active().step = 3;
  h.active().draft.geography = 'Global'; h.active().draft.durationDays = 30;
  h.active().draft.allocation = { Instagram: 20, Facebook: 20 };
  let all = h.render();
  assert.ok(all.find(n => n.type === 'TargetField' && n.props.target === 'geography'));
  assert.ok(all.find(n => n.type === 'TargetField' && n.props.target === 'durationDays'));
  assert.match(text(all), /Choose your funding goal at Submit to see an estimate/);
  const allocation = all.find(n => n.props.testID === 'creation-budget-allocation');
  assert.ok(allocation); assert.equal(allocation.type, 'View');
  assert.ok(nodes(allocation).find(n => n.props.target === 'allocation:Instagram'));
  assert.equal(all.some(n => n.type === 'Accordion' && n.props.title?.startsWith('Budget allocation')), false);
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress();
  all = h.render();
  const revealed = all.find(n => n.type === 'CreationTargets').props.value.issue;
  assert.ok(revealed); assert.match(revealed.message, /Allocate exactly 100%/);
  assert.deepEqual(h.apiCalls, []); assert.equal(h.active().draft.goal, 0);
});

test('Submit retains the explicit goal, editable summary, complete preview, policy entry and consent', () => {
  const h = screenHarness(); h.render(); h.active().step = 4;
  const all = h.render();
  assert.ok(all.find(n => n.type === 'GoalAmountField'));
  assert.ok(all.find(n => n.type === 'CampaignReviewSummary'));
  assert.ok(all.find(n => n.props.testID === 'creation-complete-preview'));
  assert.ok(all.find(n => n.type === 'FundingPolicies'));
  assert.ok(all.find(n => n.props.accessibilityRole === 'checkbox'));
  assert.equal(all.find(n => n.type === 'CreationActionDock').props.primary.props.title, 'Submit for Review');
  assert.deepEqual(h.apiCalls, []);
});

function accordionHarness() {
  const state = [], priorEffects = [], pendingEffects = [];
  let cursor = 0, effectCursor = 0;
  const react = {
    useState: initial => { const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; },
    useEffect: (effect, deps) => { const index = effectCursor++; const changed = !priorEffects[index] || deps.some((value, position) => value !== priorEffects[index][position]); priorEffects[index] = deps; if (changed) pendingEffects.push(effect); },
  };
  const { Accordion } = load('../src/components/ui.tsx', {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { View: 'View', Pressable: 'Pressable', Text: 'NativeText', StyleSheet: { flatten: value => value } },
    'react-native-safe-area-context': {}, '@expo/vector-icons/Ionicons': { default: 'Icon' },
    '../lib/theme': { useTheme: () => theme }, '../lib/appearance': { fonts: {} }, '../lib/api': {},
  });
  return props => { cursor = 0; effectCursor = 0; const tree = Accordion(props); while (pendingEffects.length) pendingEffects.shift()(); return nodes(tree); };
}

test('visible allocation retains the same mounted field identity through validation and empty-to-valid edits', () => {
  const h = screenHarness(); h.render(); h.active().step = 3;
  h.active().draft.geography = 'Global'; h.active().draft.durationDays = 14;
  h.active().draft.allocation = { Instagram: 20, Facebook: 20 };
  let all = h.render();
  const group = () => all.find(n => n.props.testID === 'creation-budget-allocation');
  const input = () => all.find(n => n.type === 'TargetField' && n.props.target === 'allocation:Instagram');
  const initialKey = group().key, retainedType = input().type, retainedKey = input().key;
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress(); all = h.render();
  assert.equal(group().key, initialKey); assert.equal(input().type, retainedType);
  input().props.onChangeText(''); all = h.render();
  assert.equal(group().key, initialKey); assert.equal(input().key, retainedKey);
  assert.ok(nodes(group()).find(n => n.props.target === 'allocation:Instagram'));
  input().props.onChangeText('6'); all = h.render();
  assert.equal(input().type, retainedType); assert.equal(input().key, retainedKey);
  input().props.onChangeText('60'); all = h.render();
  all.find(n => n.type === 'TargetField' && n.props.target === 'allocation:Facebook').props.onChangeText('40'); all = h.render();
  assert.match(text(group()), /Total:/); assert.equal(h.active().draft.allocation.Instagram, 60);
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress(); h.render();
  assert.equal(h.active().step, 4); assert.deepEqual(h.apiCalls, []);
});

test('optional Accordion reveal opens on each new validation request and clearing it never closes content', () => {
  const render = accordionHarness();
  const props = { title: 'Allocation', children: jsx('Input', { identity: 'retained' }), reveal: false };
  let all = render(props); assert.equal(all.find(n => n.type === 'Pressable').props.accessibilityState.expanded, false);
  props.reveal = { field: 'allocation:Instagram' }; render(props); all = render(props);
  assert.equal(all.find(n => n.type === 'Pressable').props.accessibilityState.expanded, true);
  props.reveal = false; all = render(props);
  assert.equal(all.find(n => n.type === 'Pressable').props.accessibilityState.expanded, true);
  all.find(n => n.type === 'Pressable').props.onPress(); all = render(props);
  assert.equal(all.find(n => n.type === 'Pressable').props.accessibilityState.expanded, false, 'explicit collapse still works');
  props.reveal = { field: 'allocation:Instagram' }; render(props); all = render(props);
  assert.equal(all.find(n => n.type === 'Pressable').props.accessibilityState.expanded, true, 'a repeated validation event can reveal the same field again');
});

test('connected creation progress preserves five icons/labels, full Visuals name and scaled access without navigation controls', () => {
  let dimensions = { width: 393, fontScale: 1 };
  const { CreationProgress } = load('../src/features/creation/CreationUi.tsx', {
    ...modules, react: {},
    'react-native': { View: 'View', ScrollView: 'ScrollView', useWindowDimensions: () => dimensions },
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: types.money }) },
  });
  const all = nodes(CreationProgress({ step: 0 }));
  assert.deepEqual(all.filter(n => n.type === 'Text').map(n => n.props.children), ['Basics', 'Story', 'Visuals', 'Reach', 'Submit']);
  assert.deepEqual(all.filter(n => n.type === 'Icon').map(n => n.props.name), ['reader-outline', 'create-outline', 'images-outline', 'people-outline', 'lock-closed-outline']);
  const progress = all.find(n => n.props.accessibilityRole === 'progressbar');
  assert.match(progress.props.accessibilityHint, /Campaign & Ad Visuals/); assert.equal(progress.props.accessibilityValue.now, 1);
  assert.equal(all.some(n => n.type === 'Pressable'), false, 'progress cannot jump past validation');
  dimensions = { width: 320, fontScale: 2 };
  const large = nodes(CreationProgress({ step: 4 }));
  assert.equal(large.find(n => n.props.accessibilityRole === 'progressbar').props.accessibilityValue.now, 5);
  assert.ok(large.find(n => n.props.accessibilityRole === 'progressbar').props.style.width > dimensions.width);
  assert.equal(large.find(n => n.type === 'ScrollView').props.horizontal, true);
  assert.equal(large.filter(n => n.type === 'Text').length, 5);
  assert.equal(large.some(n => n.props.allowFontScaling === false), false);
});

test('step navigation waits for the new native page layout and resets once without resetting later reading', () => {
  const h = screenHarness(); let all = h.render(); h.attachNative();
  const previousLayout = all.find(n => n.type === 'View' && n.props.onLayout);
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress();
  assert.deepEqual(h.nativeScrolls, [], 'the old Visuals page must not receive a pre-commit reset');
  previousLayout.props.onLayout(); h.flushFrames();
  assert.deepEqual(h.nativeScrolls, [], 'an old page layout cannot commit the new Reach reset');
  all = h.render();
  const viewport = all.find(n => n.type === 'ScrollView');
  viewport.props.onContentSizeChange(393, 1800); h.flushFrames();
  assert.deepEqual(h.nativeScrolls, [], 'size notifications alone cannot identify the committed new page');
  const committed = all.find(n => n.type === 'View' && n.props.onLayout);
  committed.props.onLayout();
  assert.deepEqual(h.nativeScrolls, [], 'native layout settles before the animation-frame reset');
  h.flushFrames();
  assert.deepEqual(h.nativeScrolls, [{ y: 0, animated: false }]);
  // Later theme/text/input reflow on this same page must preserve reading.
  committed.props.onLayout(); viewport.props.onContentSizeChange(393, 2200); h.render(); h.flushFrames();
  assert.deepEqual(h.nativeScrolls, [{ y: 0, animated: false }]);
});

test('equal-height step commits reset after layout even without a new content-size notification', () => {
  const h = screenHarness(); let all = h.render(); h.attachNative();
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress();
  all = h.render(); all.find(n => n.type === 'View' && n.props.onLayout).props.onLayout(); h.flushFrames();
  assert.deepEqual(h.nativeScrolls, [{ y: 0, animated: false }]);
});

test('validation reveal wins over a later step-layout frame and cannot be pulled back to the top', async () => {
  const h = screenHarness(); h.render(); h.active().step = 4;
  h.active().draft.category = 'Environment'; h.active().draft.creatorName = 'Fixture creator';
  let all = h.render(); h.attachNative();
  all.find(n => n.type === 'CreationActionDock').props.primary.props.onPress();
  all = h.render(); assert.equal(h.active().step, 3);
  let focused = 0;
  all.find(n => n.type === 'CreationTargets').props.value.register('geography', { measureLayout: (_root, success) => success(0, 420) }, { focus: () => focused++ });
  all.find(n => n.type === 'View' && n.props.onLayout).props.onLayout();
  all.find(n => n.type === 'ScrollView').props.onContentSizeChange(393, 2100);
  h.flushFrames();
  assert.deepEqual(h.nativeScrolls, [{ y: 424, animated: false }], 'the focused invalid field stays revealed; there is no trailing y=0');
  await new Promise(resolve => setTimeout(resolve, 135));
  assert.equal(focused, 1); assert.match(h.announcements[0], /Target locations/);
});

test('real picker cancellation leaves every media collection and draft identity unchanged with no upload', async () => {
  const h = screenHarness(); const before = JSON.stringify(h.active());
  const mediaControl = h.render().find(n => n.type === 'CampaignMediaSections'); const snapshot = JSON.stringify(h.active());
  mediaControl.props.onUpload('advertising'); await settle(); h.render();
  assert.equal(h.pickerCalls(), 1); assert.deepEqual(h.apiCalls, []); assert.deepEqual(h.saved, []); assert.equal(JSON.stringify(h.active()), snapshot);
  assert.equal(before, undefined, 'fixture initializes only when screen mounts');
});

test('real uploads keep cover, advertising and story media distinct and preserve request purposes', async () => {
  const picker = { canceled: false, assets: [{ uri: 'file:///fixture.jpg', fileName: 'fixture.jpg', mimeType: 'image/jpeg', fileSize: 1234 }] };
  const h = screenHarness({ picker });
  h.render().find(n => n.type === 'CampaignMediaSections').props.onUpload('advertising'); await settle(); h.render();
  assert.equal(h.active().draft.coverImage, '/media/original-cover.jpg'); assert.deepEqual(h.active().draft.adImages, ['/media/original-ad.jpg', '/media/new-upload.jpg']);
  assert.equal(h.active().draft.sections[0].url, '/media/story.jpg'); assert.deepEqual(h.apiCalls[0].options.form.values.at(-1), ['purpose', 'advertising']);
  h.render().find(n => n.type === 'CampaignMediaSections').props.onUpload('cover'); await settle(); h.render();
  assert.equal(h.active().draft.coverImage, '/media/new-upload.jpg'); assert.equal(h.active().draft.adImages.length, 2); assert.equal(h.active().draft.sections[0].url, '/media/story.jpg');
  assert.deepEqual(h.apiCalls[1].options.form.values.at(-1), ['purpose', 'cover']);
});

test('guest upload uses existing durable sign-in handoff without opening picker or changing media', async () => {
  const h = screenHarness({ signedIn: false });
  h.render().find(n => n.type === 'CampaignMediaSections').props.onUpload('cover'); await settle(); h.render();
  assert.equal(h.pickerCalls(), 0); assert.deepEqual(h.apiCalls, []); assert.deepEqual(h.navigation, ['/profile?auth=login']);
  assert.equal(h.saved.length, 1); assert.equal(h.saved[0].localId, 'local-one'); assert.equal(h.saved[0].step, 2); assert.equal(h.saved[0].draft.coverImage, '/media/original-cover.jpg');
});
