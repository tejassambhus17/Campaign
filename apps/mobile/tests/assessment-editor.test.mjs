import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props: props || {} });
function load(path, modules = {}) {
  const module = { exports: {} }, source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', source)(name => { assert.ok(name in modules, 'Unexpected import ' + name); return modules[name]; }, module, module.exports);
  return module.exports;
}
const model = load('../src/lib/assessments.ts');
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };
function harness({ completed = false, lostPublish = false } = {}) {
  const values = [], calls = [], invalidations = [], queryOptions = [];
  let cursor = 0, publishCalls = 0;
  const rubric = { version: 'campaign-review-v1', criteria: [{ id: 'sources', title: 'Sources', maximum: 30, checks: [{ id: 'support', title: 'Source support', maximum: 10, anchors: { none: { points: 0, rule: 'Not inspected' }, partial: { points: 5, rule: 'Background only' }, met: { points: 10, rule: 'All claims mapped' } } }] }] };
  let saved = { id: 'a1', campaignId: 'c1', contentHash: 'same', assessedVersion: 3, rubricVersion: rubric.version, revision: 1, status: completed ? 'published' : 'draft', criteria: [], limitations: [], assessmentType: 'reviewer', total: completed ? 0 : null, classification: completed ? 'Limited review coverage' : null };
  const workspace = { rubric, target: 'public', contentHash: 'same', assessedVersion: 3, draft: null, completed: completed ? saved : null };
  const api = async (path, options) => {
    calls.push({ path, ...options });
    if (path.endsWith('/publish')) {
      publishCalls++;
      if (lostPublish && publishCalls === 1) throw new Error('Response lost; retry');
      return { ...saved, status: 'published', total: 5, classification: 'Limited review coverage' };
    }
    if (options.method === 'PUT') {
      saved = { ...saved, ...options.body, revision: saved.revision + 1,
        criteria: options.body.criteria.map(c => ({ ...c, title: 'Sources', maximum: 30, points: 5, checks: c.checks.map(check => ({ ...check, title: 'Source support', maximum: 10, points: 5 })) })) };
      return saved;
    }
    return saved;
  };
  const { AssessmentEditor } = load('../src/features/transparency/AssessmentEditor.tsx', {
    react: { useState: initial => { const index = cursor++; if (!(index in values)) values[index] = initial; return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next; }]; } },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { View: 'View', Switch: 'Switch' },
    '@tanstack/react-query': { useQuery: options => { queryOptions.push(options); return { data: workspace, isPending: false, isError: false }; }, useQueryClient: () => ({ invalidateQueries: async value => invalidations.push(value) }) },
    '../../components/ui': { Accordion: 'Accordion', Button: 'Button', Field: 'Field', Loading: 'Loading', ErrorState: 'ErrorState', Notice: 'Notice', Pill: 'Pill', Text: 'Text', useTheme: () => ({ styles: {} }) },
    '../../lib/api': { api }, '../../lib/assessments': model,
    './AssessmentSnapshot': { AssessmentSnapshot: 'AssessmentSnapshot' },
  });
  const render = () => { cursor = 0; return AssessmentEditor({ campaignId: 'c1', published: true, revisionPending: true }); };
  const get = (key, value) => nodes(render()).find(n => n.props[key] === value);
  return { render, get, calls, invalidations, queryOptions, workspace,
    open: async () => { get('title', 'Document an evidence assessment').props.onPress(); render(); },
    prepare: async () => { get('title', completed ? 'View recorded assessment' : 'Start assessment draft').props.onPress(); await settle(); render(); },
  };
}

test('opening review UI never creates an assessment; explicit start and exact content binding are required', async () => {
  const h = harness(); h.render(); assert.equal(h.queryOptions.at(-1).enabled, false);
  await h.open(); assert.equal(h.queryOptions.at(-1).enabled, true); assert.equal(h.calls.length, 0);
  await h.prepare(); assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].body, { target: 'public', contentHash: 'same' });
  assert.equal(h.get('title', 'Published version').props.disabled, true); // unsaved hydration cannot be silently discarded by changing target
});

test('save retains explicit evidence/privacy/missing fields and never writes campaign state or client score', async () => {
  const h = harness(); await h.open(); await h.prepare();
  h.get('accessibilityLabel', 'Source support: check performed').props.onValueChange(true);
  h.get('title', 'Partial · 5').props.onPress();
  h.get('label', 'Public reason for this result').props.onChangeText('Only background was inspected.');
  h.get('label', 'Evidence reference or source URL').props.onChangeText('campaign:summary');
  h.get('label', 'What this evidence supports').props.onChangeText('Compared the summary.');
  h.get('accessibilityLabel', 'Source support: evidence private').props.onValueChange(true);
  h.get('label', 'Public missing or unverified information (one per line)').props.onChangeText('No outcome evidence\n');
  h.get('label', 'Public overall limitations (one per line)').props.onChangeText('No independent identity check\n');
  h.get('title', 'Save assessment draft').props.onPress(); await settle();
  const put = h.calls.find(call => call.method === 'PUT');
  assert.equal(put.path, '/campaigns/c1/assessments/a1');
  assert.equal(put.body.criteria[0].checks[0].evidence[0].visibility, 'private');
  assert.deepEqual(put.body.criteria[0].checks[0].missing, ['No outcome evidence']);
  assert.deepEqual(put.body.limitations, ['No independent identity check']);
  assert.equal(put.body.expectedRevision, 1); assert.equal('total' in put.body, false); assert.equal('assessmentType' in put.body, false);
  assert.equal(h.calls.some(call => /review|transition|contribution/.test(call.path)), false);
  assert.equal(h.invalidations.length, 2);
});

test('lost publication response can be retried idempotently without a conflicting draft write', async () => {
  const h = harness({ lostPublish: true }); await h.open(); await h.prepare();
  h.get('title', 'Save assessment draft').props.onPress(); await settle();
  h.get('title', 'Publish completed assessment').props.onPress(); await settle();
  assert.ok(nodes(h.render()).some(n => n.type === 'Notice' && n.props.tone === 'error'));
  h.get('title', 'Publish completed assessment').props.onPress(); await settle();
  assert.equal(h.calls.filter(call => call.method === 'PUT').length, 1);
  const publishes = h.calls.filter(call => call.path.endsWith('/publish'));
  assert.equal(publishes.length, 2); assert.deepEqual(publishes[0].body, publishes[1].body);
  assert.equal(h.get('title', 'Publish completed assessment'), undefined);
});

test('already published exact working/public record is read-only and does not create a duplicate draft', async () => {
  const h = harness({ completed: true }); await h.open(); await h.prepare();
  assert.equal(h.calls.length, 0); assert.equal(h.get('title', 'Save assessment draft'), undefined);
  assert.ok(nodes(h.render()).some(n => n.type === 'Notice'));
});

test('a workspace refresh cannot relabel an earlier bound record as the new snapshot', async () => {
  const h = harness(); await h.open(); await h.prepare();
  h.workspace.contentHash = 'new-content';
  assert.equal(h.get('title', 'Save assessment draft'), undefined);
  assert.equal(h.get('title', 'Publish completed assessment'), undefined);
  const reload = h.get('title', 'Discard unsaved edits and reload current assessment');
  assert.ok(reload); reload.props.onPress();
  assert.ok(h.get('title', 'Start assessment draft'));
});
