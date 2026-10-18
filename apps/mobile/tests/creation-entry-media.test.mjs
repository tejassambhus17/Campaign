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
const jsx = (type, props) => ({ type, props: props || {} });
const theme = { colors: new Proxy({}, { get: () => '#121212' }), styles: new Proxy({}, { get: () => ({}) }) };
const modules = {
  react: {}, 'react/jsx-runtime': { jsx, jsxs: jsx },
  'react-native': { View: 'View', Pressable: 'Pressable', ActivityIndicator: 'ActivityIndicator', useWindowDimensions: () => ({ width: 393, fontScale: 1.17 }) },
  '@expo/vector-icons/Ionicons': { default: 'Icon' },
  '../../components/ui': { Accordion: 'Accordion', Button: 'Button', Picture: 'Picture', Text: 'Text', useTheme: () => theme },
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
  const all = nodes(tree), actions = all.filter(n => n.type === 'Button');
  assert.deepEqual(actions.map(n => n.props.title), ['Create Manually', 'Create with Your Voice']);
  assert.equal(actions[0].props.variant, undefined); assert.equal(actions[1].props.variant, 'ghost');
  assert.ok(all.indexOf(actions[1]) < all.findIndex(n => n.props.accessibilityLabel?.startsWith('Resume ')));
  assert.match(text(tree), /Voice-guided demo/); assert.match(text(tree), /Live speech and AI are not connected/);
  assert.deepEqual(calls, []); assert.equal(JSON.stringify(existing), before);
  actions[0].props.onPress(); actions[1].props.onPress();
  assert.deepEqual(calls, ['manual', 'guided']);
  const resumes = all.filter(n => n.props.accessibilityLabel?.startsWith('Resume '));
  assert.equal(resumes.length, 2); resumes[1].props.onPress();
  assert.equal(calls[2], existing[1]); assert.equal(calls[2].localId, 'local-two'); assert.equal(calls[2].step, 2);
  assert.match(text(tree), /Step 3 of 5/); assert.match(text(tree), /Saved /); assert.match(text(tree), /On this device/);
});

test('Create entry restores the visible five-step reference overview before actions without hiding it in an accordion', () => {
  const tree = entry(), all = nodes(tree);
  const overview = all.find(n => n.props.accessibilityLabel === 'Five campaign creation steps');
  assert.ok(overview);
  const headings = nodes(overview).filter(n => n.props.accessibilityRole === 'header');
  assert.deepEqual(headings.map(n => n.props.children), model.STEPS);
  assert.ok(all.indexOf(headings[4]) < all.findIndex(n => n.props.title === 'Create Manually'));
  assert.equal(all.some(n => n.type === 'Accordion'), false);
  const copy = text(overview);
  assert.match(copy, /Give your campaign a clear identity/);
  assert.match(copy, /Set your goal and check the details before review/);
  const rows = overview.props.children;
  assert.equal(rows.length, 5);
  assert.equal(rows[0].props.children[1].props.style.backgroundColor, theme.colors.mint);
  assert.equal(rows[1].props.children[1].props.style.backgroundColor, 'transparent');
  assert.equal(rows.every(row => row.props.style.height === undefined), true, 'rows reflow with native font scaling');
});

test('draft rows preserve untitled content, input order and truthful local/account synchronization status', () => {
  const first = fixture('first'), second = fixture('second'); first.draft.title = ''; second.accountSavedToken = persistence.accountDraftToken(second);
  const tree = entry({ signedIn: true, localDrafts: [first, second] });
  const resumes = nodes(tree).filter(n => n.props.accessibilityLabel?.startsWith('Resume '));
  assert.equal(resumes[0].props.accessibilityLabel, 'Resume Untitled campaign');
  assert.match(text(tree), /Account copy needs saving/); assert.match(text(tree), /Device \+ account copy saved/);
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

test('eligible Delete draft is directly below Resume, uses its own touch target and never invokes Resume', () => {
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
    'react-native': { View: 'View', Image: 'Image', Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: value => value }, useWindowDimensions: () => ({ width: 393, fontScale: 1.17 }), Platform: { OS: 'android' } },
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    'expo-router': { router: { push: value => navigation.push(value), setParams: () => {}, replace: () => {} }, useFocusEffect: () => {}, useLocalSearchParams: () => ({}) },
    'expo-image-picker': { launchImageLibraryAsync: async () => { pickerCalls++; return picker; } },
    '../../components/ui': { ...ui, useTheme: () => theme },
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
    '../../features/creation/CampaignMedia': { CampaignMediaSections: 'CampaignMediaSections' },
    '../../features/creation/media': media,
    '../../features/creation/readiness': { submissionIssues },
    '../../features/creation/SubmissionChecklist': { SubmissionChecklist: 'SubmissionChecklist' },
    '../../features/creation/persistence': persistence,
  }, { FormData: class { values = []; append(...value) { this.values.push(value); } } });
  const render = () => { stateCursor = 0; refCursor = 0; return nodes(component.default()); };
  return { render, active: () => slots[1], saved, navigation, scopes, apiCalls, pickerCalls: () => pickerCalls };
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
