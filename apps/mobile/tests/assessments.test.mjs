import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const code = ts.transpileModule(readFileSync(new URL('../src/lib/assessments.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const model = { exports: {} }; new Function('exports', 'module', code)(model.exports, model);
const { assessmentPresentation, assessmentDraftPayload, distributionPresentation, assessmentMatchesCampaign } = model.exports;
const record = () => ({ id: 'a1', campaignId: 'c1', contentHash: 'abc', assessedVersion: 3, rubricVersion: 'campaign-review-v1', assessmentType: 'reviewer', status: 'published', total: 0, classification: 'Limited review coverage', publishedAt: '2026-10-17T10:00:00Z', revision: 2, criteria: [], limitations: [] });
const value = () => ({ state: 'completed', contentHash: 'abc', rubricVersion: 'campaign-review-v1', assessment: record(), history: [] });

test('unassessed and incomplete never become a numeric zero; a documented published zero is valid', () => {
  for (const state of ['not_assessed', 'in_progress', 'superseded']) {
    const presentation = assessmentPresentation({ ...value(), state });
    assert.equal(presentation.score, null);
  }
  assert.equal(assessmentPresentation({ ...value(), state: 'not_assessed' }).label, 'Not yet assessed');
  assert.equal(assessmentPresentation({ ...value(), state: 'in_progress' }).label, 'Assessment in progress');
  assert.equal(assessmentPresentation(value()).score, 0);
});

test('demo and recorded reviewer headings are distinct and demo designation is explicit', () => {
  const actual = value(); actual.assessment.total = 56;
  assert.equal(assessmentPresentation(actual).title, 'Reviewed with a Trust Score of');
  actual.assessment.assessmentType = 'demo';
  assert.equal(assessmentPresentation(actual).title, 'Illustrative Trust Score');
  assert.equal(assessmentPresentation(actual).demo, true);
});

test('unpublished, stale, old-method and malformed completed records cannot show a score', () => {
  for (const patch of [{ status: 'draft' }, { contentHash: 'old' }, { rubricVersion: 'old' }, { publishedAt: null }, { total: 101 }, { total: -1 }, { total: NaN }, { total: null }, { assessmentType: 'independent' }, { classification: '' }]) {
    assert.equal(assessmentPresentation({ ...value(), assessment: { ...record(), ...patch } }).score, null);
  }
  assert.equal(assessmentPresentation({ ...value(), assessment: null }).label, 'Assessment unavailable');
  assert.equal(assessmentPresentation({ ...value(), state: 'unknown' }).label, 'Assessment unavailable');
});

test('independently cached campaign/assessment responses match only by the exact public content hash', () => {
  assert.equal(assessmentMatchesCampaign({ publicContentHash: 'abc' }, value()), true);
  assert.equal(assessmentMatchesCampaign({ publicContentHash: 'new' }, value()), false, 'new story cannot carry cached old assessment');
  assert.equal(assessmentMatchesCampaign({ publicContentHash: 'abc' }, { ...value(), contentHash: 'new' }), false, 'new assessment cannot appear on cached old story');
  for (const hash of [null, undefined, '']) assert.equal(assessmentMatchesCampaign({ publicContentHash: hash }, value()), false);
  assert.equal(assessmentMatchesCampaign({ publicContentHash: 'abc' }), false);
});

test('draft writes carry only editable evidence, exact binding and concurrency version', () => {
  const draft = { ...record(), actorId: 'secret-actor', snapshot: { title: 'private' }, provenance: { kind: 'demo' }, total: 100,
    criteria: [{ id: 'sources', points: 30, maximum: 30, checks: [{ id: 'support', title: 'Support', maximum: 10, points: 10, result: 'partial', performed: true, reason: 'Background only', evidence: [{ reference: ' https://example.org/source ', note: ' Supports background ', visibility: 'private' }, { reference: 'campaign:summary', note: 'Compared summary', visibility: 'public' }], missing: [' ', ' No outcomes inspected ', ''] }] }], limitations: [' No independent identity check ', ''] };
  const payload = assessmentDraftPayload(draft);
  assert.deepEqual(Object.keys(payload).sort(), ['contentHash', 'criteria', 'expectedRevision', 'limitations', 'rubricVersion']);
  assert.deepEqual(payload.criteria[0].checks[0].missing, ['No outcomes inspected']);
  assert.deepEqual(payload.limitations, ['No independent identity check']);
  assert.equal(payload.criteria[0].checks[0].evidence.length, 2);
  assert.equal(payload.criteria[0].checks[0].evidence[0].visibility, 'private');
  assert.equal(payload.expectedRevision, 2);
  for (const key of ['total', 'actorId', 'snapshot', 'provenance', 'assessmentType', 'publishedAt']) assert.equal(key in payload, false);
  assert.equal(draft.criteria[0].checks[0].missing[0], ' '); // serialization must not mutate edits
});

test('approval or funding does not imply advertising readiness or actual delivery', () => {
  for (const state of ['Approved', 'Available for Funding', 'Funding Goal Reached', 'Funding Period Ends']) assert.equal(distributionPresentation(state, true).title, 'Proposed distribution plan');
  assert.equal(distributionPresentation('Distribution Preparation', true).title, 'Prepared for simulated distribution');
  assert.equal(distributionPresentation('Promoting', true).title, 'Simulated promotion');
  assert.equal(distributionPresentation('Completed', true).title, 'Completed simulation');
  assert.equal(distributionPresentation('Refund Pending', false).title, 'Distribution paused or closed');
});
