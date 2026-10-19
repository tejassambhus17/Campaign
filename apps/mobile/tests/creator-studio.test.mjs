import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
function load(path, modules = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', source)(name => { assert.ok(name in modules, `Unexpected dependency ${name}`); return modules[name]; }, loaded.exports, loaded);
  return loaded.exports;
}
const types = load('../src/lib/types.ts');
const model = load('../src/features/creation/model.ts', { '../../lib/types': types });
const persistence = load('../src/features/creation/persistence.ts', { './model': model });
const studio = load('../src/features/profile/studio.ts');
const campaign = (id, status = 'Draft', changes = {}) => ({ ...model.blankDraft(), id, ownerId: 'owner-one', title: id, status, goal: 100, raised: 23.45, ...changes });
const draft = (id, linkedId = '', changes = {}) => ({ localId: id, step: 2, goalInput: '100', updatedAt: '2026-10-19T09:00:00Z', draft: campaign(linkedId, 'Draft', { title: `Device ${id}`, ...changes }) });

test('Studio combines only scoped owned work, deduplicates local/account IDs, and preserves original input data/order', () => {
  const campaigns = [campaign('linked'), campaign('review', 'Submitted for Review'), campaign('foreign', 'Draft', { ownerId: 'another-owner' })];
  const drafts = [draft('local', 'linked'), draft('unsynced'), draft('foreign-device', '', { ownerId: 'another-owner' }), draft('duplicate', 'linked')];
  const before = JSON.stringify({ campaigns, drafts });
  const result = studio.creatorStudioItems('owner-one', campaigns, drafts);
  assert.deepEqual(result.map(item => item.key), ['account:linked', 'device:unsynced', 'account:review']);
  assert.equal(result[0].local, drafts[0]);
  assert.deepEqual(studio.studioCounts(result), { All: 3, Drafts: 2, Review: 1, Funding: 0 });
  assert.equal(JSON.stringify({ campaigns, drafts }), before);
});

test('a submitted account version suppresses a stale editable local copy, while changes requested stays editable', () => {
  const submitted = campaign('submitted', 'Submitted for Review');
  const corrected = campaign('corrections', 'Changes Requested');
  const result = studio.creatorStudioItems('owner-one', [submitted, corrected], [draft('stale', 'submitted')]);
  assert.equal(result.length, 2);
  assert.equal(result[0].campaign, submitted);
  assert.equal(result[0].local, undefined);
  assert.equal(result[0].group, 'Review');
  assert.equal(result[1].group, 'Drafts');
});

test('current linked review and funding metadata overlays the presentation without changing saved local editorial work', () => {
  const local = draft('saved', 'linked', { title: 'Latest unsaved title', summary: 'Latest local summary', goal: 123, status: 'Draft', feedback: 'Old feedback', raised: 1 });
  const account = campaign('linked', 'Changes Requested', { title: 'Older account title', goal: 200, feedback: 'Add the source citation', raised: 87.65, campaignState: 'Available for Funding', revisionPending: true, deadline: '2026-11-01', setupReady: true, publishedAt: '2026-10-18' });
  const before = JSON.stringify({ local, account });
  const [item] = studio.creatorStudioItems('owner-one', [account], [local]);
  assert.equal(item.local, local); assert.equal(item.account, account); assert.equal(item.group, 'Drafts');
  assert.equal(item.campaign.title, local.draft.title); assert.equal(item.campaign.summary, local.draft.summary); assert.equal(item.campaign.goal, 123);
  for (const key of ['status', 'feedback', 'raised', 'campaignState', 'revisionPending', 'deadline', 'setupReady', 'publishedAt']) assert.equal(item.campaign[key], account[key]);
  assert.equal(studio.studioStep(item.campaign, item.local), local.step);
  assert.equal(JSON.stringify({ local, account }), before);
  const cleared = studio.creatorStudioItems('owner-one', [campaign('linked', 'Draft', { raised: 0 })], [local])[0];
  assert.equal(cleared.campaign.feedback, undefined, 'old local reviewer feedback is not retained after the server clears it');
});

test('Studio preserves review, funding, distribution and exception statuses without calling funding live ads', () => {
  assert.equal(studio.studioGroup(campaign('approved', 'Approved')), 'Review');
  assert.equal(studio.studioGroup(campaign('review', 'Submitted for Review')), 'Review');
  for (const status of ['Available for Funding', 'Funding Goal Reached', 'Funding Period Ends', 'Distribution Preparation', 'Promoting']) assert.equal(studio.studioGroup(campaign(status, status)), 'Funding');
  for (const status of ['Completed', 'Rejected', 'Cancelled', 'Failed', 'Refund Pending']) assert.equal(studio.studioGroup(campaign(status, status)), 'Other');
  assert.equal(studio.studioGroup(campaign('rev', 'Submitted for Review', { campaignState: 'Promoting', revisionPending: true })), 'Review');
});

test('Resume uses the real local/account ID and saved step, while published rows open the campaign', () => {
  const local = draft('a & b'), [item] = studio.creatorStudioItems('owner-one', [], [local]);
  assert.equal(studio.studioDestination(item), '/create?localDraft=a%20%26%20b');
  assert.equal(studio.studioStep(item.campaign, local), 2);
  const cloud = studio.creatorStudioItems('owner-one', [campaign('x / y')], [])[0];
  assert.equal(studio.studioDestination(cloud), '/create?draft=x%20%2F%20y');
  const review = studio.creatorStudioItems('owner-one', [campaign('under-review', 'Submitted for Review')], [])[0];
  assert.equal(studio.studioDestination(review), '/explore/under-review');
  assert.equal(studio.studioStep(campaign('bad', 'Draft', { currentStep: 40 })), 4);
  assert.equal(studio.studioStep(campaign('bad', 'Draft', { currentStep: NaN })), 0);
});

const jsx = (type, props) => ({ type, props: props || {} });
const theme = { colors: new Proxy({}, { get: () => '#121212' }), styles: new Proxy({}, { get: () => ({}) }), scheme: 'dark' };
const ui = { fonts: {}, useTheme: () => theme, ...Object.fromEntries(['Button', 'Empty', 'ErrorState', 'Loading', 'Picture', 'Progress', 'Text'].map(key => [key, key])) };
function descendants(tree) {
  if (Array.isArray(tree)) return tree.flatMap(descendants);
  if (!tree || typeof tree !== 'object') return [];
  if (typeof tree.type === 'function') return descendants(tree.type(tree.props));
  return [tree, ...descendants(tree.props?.children)];
}
const copy = tree => descendants(tree).filter(node => node.type === 'Text').flatMap(node => node.props.children).filter(value => typeof value === 'string').join(' ');
function harness({ entries = [], campaigns = [], loading = false, error = null } = {}) {
  let selected = 'All', focus, reloads = 0; const pushes = [], scopes = [], library = { entries, loading, error: '', retry: () => { reloads++; } };
  const component = load('../src/features/profile/CreatorStudio.tsx', {
    react: { useMemo: fn => fn(), useCallback: fn => fn, useRef: initial => ({ current: initial }), useState: () => [selected, next => { selected = next; }] }, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { Pressable: 'Pressable', ScrollView: 'ScrollView', View: 'View' }, 'expo-router': { router: { push: path => pushes.push(path) }, useFocusEffect: callback => { focus = callback; } },
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../../components/ui': ui,
    '../../lib/CurrencyProvider': { useCurrency: () => ({ money: value => `$${value}` }) }, '../../lib/types': types,
    '../creation/model': model, '../creation/persistence': persistence,
    '../creation/useDraftLibrary': { useDraftLibrary: (scope, ready) => { scopes.push([scope, ready]); return library; } }, './studio': studio,
  });
  const props = { userId: 'owner-one', campaigns, accountLoading: loading, accountError: error, onRetry: () => {}, onMyCampaigns: () => {} };
  return { render: () => component.CreatorStudio(props), card: item => component.StudioCampaign({ item }), pushes, scopes, library, focus: () => focus(), reloads: () => reloads };
}

test('Studio uses the established owner library read-only; filter taps change visible work without routing or mutations', () => {
  const entries = [draft('saved')], campaigns = [campaign('funded', 'Available for Funding'), campaign('pending', 'Submitted for Review')], before = JSON.stringify({ entries, campaigns });
  const h = harness({ entries, campaigns });
  let tree = h.render();
  assert.deepEqual(h.scopes, [['owner-one', true]]);
  assert.equal(descendants(tree).filter(node => node.props.testID?.startsWith('studio-item-')).length, 3);
  descendants(tree).find(node => node.props.accessibilityRole === 'tab' && node.props.accessibilityLabel === 'Review, 1').props.onPress();
  assert.ok(descendants(tree).filter(node => node.props.accessibilityRole === 'tab').every(node => node.props.style({ pressed: false }).minHeight >= 48));
  tree = h.render();
  assert.equal(descendants(tree).filter(node => node.props.testID?.startsWith('studio-item-')).length, 1);
  assert.match(copy(tree), /Submitted for review/);
  assert.deepEqual(h.pushes, []); assert.equal(JSON.stringify({ entries, campaigns }), before);
});

test('Studio shows truthful loading/error/empty states rather than invented zero totals', () => {
  assert.ok(descendants(harness({ loading: true }).render()).some(node => node.type === 'Loading'));
  assert.equal(descendants(harness({ loading: true }).render()).some(node => node.type === 'Empty'), false);
  assert.ok(descendants(harness({ error: Error('offline') }).render()).some(node => node.type === 'ErrorState'));
  assert.ok(descendants(harness().render()).some(node => node.type === 'Empty'));
});

test('returning to the Studio tab reloads the established draft library after edits elsewhere', () => {
  const h = harness(); h.render();
  assert.equal(h.reloads(), 0, 'opening the render creates no draft or storage write');
  h.focus(); assert.equal(h.reloads(), 1);
  h.library.entries.push(draft('newly-saved'));
  const tree = h.render();
  assert.equal(descendants(tree).filter(node => node.props.testID?.startsWith('studio-item-')).length, 1);
  assert.deepEqual(h.pushes, []);
});

test('Studio preserves canonical financial values and opens real resume/report destinations only on explicit actions', () => {
  const saved = draft('original'), h = harness({ entries: [saved] });
  const [item] = studio.creatorStudioItems('owner-one', [], [saved]);
  let tree = h.card(item);
  assert.match(copy(tree), /Account save needed/);
  assert.match(copy(tree), /Draft goal/);
  assert.match(copy(tree), /\$100/);
  assert.equal(descendants(tree).find(node => node.type === 'Progress'), undefined, 'a draft goal is not presented as live funding');
  assert.deepEqual(h.pushes, []);
  descendants(tree).find(node => node.props.accessibilityLabel === 'Resume Device original').props.onPress();
  assert.deepEqual(h.pushes, ['/create?localDraft=original']);
  const linked = { ...saved, accountSavedToken: persistence.accountDraftToken(saved) };
  tree = h.card({ ...item, local: linked }); assert.match(copy(tree), /Device \+ account saved/);
  const funded = studio.creatorStudioItems('owner-one', [campaign('actual', 'Available for Funding')], [])[0];
  tree = h.card(funded);
  assert.equal(descendants(tree).find(node => node.type === 'Progress').props.raised, 23.45);
  descendants(tree).find(node => node.props.accessibilityLabel === 'Report for actual').props.onPress();
  assert.equal(h.pushes.at(-1), '/explore/actual/report');
});

test('an active public campaign private revision shows qualified server funding rather than a changed local goal', () => {
  const local = draft('revision', 'published', { goal: 345 });
  const account = campaign('published', 'Changes Requested', { goal: 200, raised: 87.65, campaignState: 'Available for Funding', revisionPending: true, publishedAt: '2026-10-18', feedback: 'Clarify the opening' });
  const [item] = studio.creatorStudioItems('owner-one', [account], [local]);
  const tree = harness().card(item), progress = descendants(tree).find(node => node.type === 'Progress');
  assert.match(copy(tree), /Account campaign funding/); assert.match(copy(tree), /private revision/); assert.match(copy(tree), /Clarify the opening/);
  assert.equal(progress.props.raised, 87.65); assert.equal(progress.props.goal, 200); assert.equal(local.draft.goal, 345);
  const draftOnly = studio.creatorStudioItems('owner-one', [campaign('published', 'Draft', { goal: 200 })], [{ ...local, draft: { ...local.draft, goal: 0 } }])[0];
  assert.equal(descendants(harness().card(draftOnly)).find(node => node.type === 'Progress'), undefined, 'clearing an ordinary draft goal cannot show account funding instead');
});

test('Profile reference composition keeps real identity, editing, metrics and Studio as working accessible actions', () => {
  const calls = [];
  const component = load('../src/features/profile/ProfileOverview.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { Image: 'Image', Pressable: 'Pressable', View: 'View', useWindowDimensions: () => ({ width: 393, fontScale: 1 }) },
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../../components/ui': ui, '../../lib/types': types, './Photo': { ProfilePhoto: 'ProfilePhoto' },
    '../../../assets/images/create/story-mountains.png': 'mountains', '../../../assets/images/profile/creator-studio-hq.png': 'studio-image',
  });
  const user = { id: 'owner-one', name: 'Real Owner Name', role: 'member' };
  const identity = component.ProfileIdentity({ user, onEdit: () => calls.push('edit') });
  assert.match(copy(identity), /Real Owner Name/);
  descendants(identity).find(node => node.props.accessibilityLabel === 'Edit profile photo').props.onPress();
  const card = component.StudioInvitation({ onPress: () => calls.push('studio') });
  descendants(card).find(node => node.props.testID === 'creator-studio-entry').props.onPress();
  assert.match(copy(card), /Bring your ideas/); assert.match(copy(card), /Manage campaigns/);
  assert.equal(descendants(card).find(node => node.type === 'Image').props.accessible, false);
  assert.deepEqual(calls, ['edit', 'studio']);
  const metrics = component.ProfileMetrics({ loaded: true, metrics: [{ label: 'Campaigns', value: 17, icon: 'document-text-outline', onPress: () => calls.push('created') }] });
  descendants(metrics).find(node => node.props.accessibilityLabel === 'View campaigns, 17').props.onPress();
  assert.equal(calls.at(-1), 'created');
});

test('Studio invitation separates regular artwork from copy and gives enlarged/compact text the full unobstructed area', () => {
  let dimensions = { width: 393, fontScale: 1 };
  const component = load('../src/features/profile/ProfileOverview.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { Image: 'Image', Pressable: 'Pressable', View: 'View', useWindowDimensions: () => dimensions },
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../../components/ui': ui, '../../lib/types': types, './Photo': { ProfilePhoto: 'ProfilePhoto' },
    '../../../assets/images/create/story-mountains.png': 'mountains', '../../../assets/images/profile/creator-studio-hq.png': 'studio-image',
  });
  let tree = component.StudioInvitation({ onPress() {} }), hero = tree.props.children[0];
  const artwork = descendants(hero).find(node => node.type === 'Image');
  assert.equal(artwork.props.source, 'studio-image');
  assert.equal(hero.props.children[0].props.style.width, '36%');
  assert.equal(hero.props.children[1].props.style.width, '56%');
  assert.equal(artwork.props.resizeMode, 'contain');
  assert.equal(artwork.props.style.opacity, undefined, 'original asset is not washed out in Light');
  assert.equal(hero.props.children[0].props.style.backgroundColor, undefined, 'no charcoal decorative rectangle in Light');
  assert.equal(hero.props.style.paddingRight, 16);
  const regularFeatures = tree.props.children[1];
  assert.equal(regularFeatures.props.style.flexWrap, 'nowrap');
  assert.ok(regularFeatures.props.children.every(node => node.props.style.flex === 1 && node.props.style.width === undefined));
  for (const next of [{ width: 393, fontScale: 1.3 }, { width: 393, fontScale: 2 }, { width: 280, fontScale: 1 }]) {
    dimensions = next; tree = component.StudioInvitation({ onPress() {} }); hero = tree.props.children[0];
    assert.equal(descendants(hero).some(node => node.type === 'Image'), false, 'decorative art yields to readable text');
    assert.equal(hero.props.children[1].props.style.width, '100%');
    assert.equal(hero.props.style.paddingRight, 58, 'copy reserves room for the 35dp chevron plus right inset');
    assert.match(copy(tree), /Create, manage and track your/);
    assert.match(copy(tree), /campaigns, all in one place/);
    assert.equal(tree.props.accessibilityRole, 'button');
    const features = tree.props.children[1];
    assert.equal(features.props.style.flexWrap, 'wrap');
    assert.ok(features.props.children.every(node => node.props.style.width === '50%'), 'large-font feature labels get two columns rather than splitting inside narrow cells');
    assert.deepEqual(features.props.children.map(node => node.props.style.borderLeftWidth), [0, 1, 0, 1]);
  }
});

test('Profile header uses clean Light theme background and keeps the subtle mountain image only in Dark', () => {
  let scheme = 'light';
  const component = load('../src/features/profile/ProfileOverview.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { Image: 'Image', Pressable: 'Pressable', View: 'View', useWindowDimensions: () => ({ width: 393, fontScale: 1 }) },
    '@expo/vector-icons/Ionicons': { default: 'Icon' }, '../../components/ui': { ...ui, useTheme: () => ({ ...theme, scheme }) }, '../../lib/types': types, './Photo': { ProfilePhoto: 'ProfilePhoto' },
    '../../../assets/images/create/story-mountains.png': 'mountains', '../../../assets/images/profile/creator-studio-hq.png': 'studio-image',
  });
  const props = { user: { name: 'Actual QA identity', role: 'member' }, onEdit() {} };
  assert.equal(descendants(component.ProfileIdentity(props)).some(node => node.type === 'Image'), false);
  scheme = 'dark';
  assert.equal(descendants(component.ProfileIdentity(props)).find(node => node.type === 'Image').props.source, 'mountains');
});
