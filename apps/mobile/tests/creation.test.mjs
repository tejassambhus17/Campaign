import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Exercise the app's actual TypeScript validators without adding a second test runtime.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const previousLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { blankDraft, validateStep, normalizeDraft, campaignBody, isPublicUrl } = require('../src/features/creation/model.ts');
const { submissionIssues } = require('../src/features/creation/readiness.ts');
const { accountDraftToken, localDraftToken, draftSaveLabel, writeLocalSnapshot, mergeAccountSaved } = require('../src/features/creation/persistence.ts');
if (previousLoader) require.extensions['.ts'] = previousLoader;
else delete require.extensions['.ts'];

const basics = { ...blankDraft(), title: 'A message worth sharing', category: 'Community', creatorName: 'Local voices' };

test('new drafts have no generated funding goal and supported channels', () => {
  const draft = blankDraft();
  assert.equal(draft.goal, 0);
  assert.deepEqual(draft.channels, ['Instagram', 'Facebook']);
});

test('Basics requires title/category/creator and enforces the PDF title maximum', () => {
  assert.deepEqual(Object.keys(validateStep(blankDraft(), 0)).sort(), ['category', 'creatorName', 'title']);
  assert.deepEqual(validateStep(basics, 0), {});
  assert.ok(validateStep({ ...basics, title: 'x'.repeat(61) }, 0).title);
});

test('sources remain optional but added sources require safe public URLs', () => {
  assert.deepEqual(validateStep(basics, 1), {});
  assert.ok(validateStep({ ...basics, sources: [{ id: 'a', title: 'Source', url: 'javascript:alert(1)' }] }, 1).sources);
  assert.deepEqual(validateStep({ ...basics, sources: [{ id: 'a', title: 'Source', url: 'https://example.com/context' }] }, 1), {});
  assert.equal(isPublicUrl('https://user:secret@example.com/context'), false);
});

test('Reach requires a complete percentage allocation and supported demo duration', () => {
  assert.deepEqual(validateStep({ ...basics, geography: 'Pune' }, 3), {});
  assert.ok(validateStep({ ...basics, geography: 'Pune', allocation: { Instagram: 60, Facebook: 30 } }, 3).allocation);
  assert.ok(validateStep({ ...basics, geography: 'Pune', durationDays: 0 }, 3).durationDays);
  assert.ok(validateStep({ ...basics, geography: 'Pune', durationDays: 91 }, 3).durationDays);
});

test('Submit requires explicit valid goal and confirmation without rounding creator input', () => {
  assert.ok(validateStep(basics, 4, '', true).goal);
  assert.ok(validateStep({ ...basics, goal: 10 }, 4, '10', false).rules);
  assert.deepEqual(validateStep({ ...basics, goal: 1.1 }, 4, '1.10', true), {});
  assert.ok(validateStep({ ...basics, goal: 1.001 }, 4, '1.001', true).goal);
  assert.ok(validateStep({ ...basics, goal: 100001 }, 4, '100001', true).goal);
});

test('resumption preserves current step and ordered story blocks', () => {
  const sections = [{ id: 'one', kind: 'text', text: 'one', format: 'bold' }, { id: 'two', kind: 'statistic', text: 'two', caption: 'context' }];
  const normalized = normalizeDraft({ ...basics, currentStep: 3, sections });
  assert.equal(normalized.step, 3);
  assert.deepEqual(normalized.sections.map(section => section.id), ['one', 'two']);
});

test('edit requests exclude privileged lifecycle, ownership, and funding totals', () => {
  const body = campaignBody({ ...basics, status: 'Approved', ownerId: 'private', raised: 100 }, 3);
  assert.equal('status' in body, false);
  assert.equal('ownerId' in body, false);
  assert.equal('raised' in body, false);
  assert.equal(body.currentStep, 3);
});

test('submission checklist preserves existing validation and separates optional improvements', () => {
  const draft = { ...basics, geography: 'Pune', goal: 10 };
  const before = JSON.stringify(draft);
  const issues = submissionIssues(draft, '10', true);
  assert.equal(issues.some(issue => issue.required), false);
  assert.ok(issues.find(issue => issue.id === 'sources' && !issue.required));
  assert.ok(issues.find(issue => issue.id === 'advertising' && !issue.required));
  assert.equal(JSON.stringify(draft), before);
  const required = submissionIssues(blankDraft(), '', false).filter(issue => issue.required);
  assert.deepEqual(required.map(issue => [issue.step, issue.field]), [[0,'title'],[0,'category'],[0,'creatorName'],[3,'geography'],[4,'goal'],[4,'rules']]);
});

test('added invalid source rows have precise stable title and URL targets', () => {
  const draft = { ...basics, sources: [{ id: 'source-b', title: '', url: 'javascript:bad' }, { id: 'source-a', title: 'Context', url: 'https://example.org/context' }] };
  const sourceIssues = submissionIssues(draft, '', false).filter(issue => issue.required && issue.step === 1);
  assert.deepEqual(sourceIssues.map(issue => issue.field), ['source-title:source-b', 'source-url:source-b']);
  assert.ok(sourceIssues.every(issue => issue.message.includes('source') || issue.message.includes('Source')));
  assert.equal(submissionIssues({ ...draft, sources: draft.sources.slice().reverse() }, '', false).find(issue => issue.id === 'source-url:source-b').field, 'source-url:source-b');
});

test('conditional media and allocation errors target the specific existing control', () => {
  const draft = { ...basics, coverImage: 'file://bad', adImages: ['https://example.org/ad.jpg', ''], sections: [{ id:'photo',kind:'image',text:'',url:'javascript:bad' }], geography:'Pune', allocation:{Instagram:101,Facebook:40} };
  const required = submissionIssues(draft,'',false).filter(issue => issue.required);
  assert.ok(required.some(issue => issue.step === 1 && issue.field === 'section:photo'));
  assert.ok(required.some(issue => issue.step === 2 && issue.field === 'coverImage'));
  assert.ok(required.some(issue => issue.step === 2 && issue.field === 'ad-image:1'));
  assert.ok(required.some(issue => issue.step === 3 && issue.field === 'allocation:Instagram'));
  assert.equal(draft.goal, 0);
});

const deviceEntry = () => ({localId:'local-one',draft:{...basics,id:'campaign-one',geography:'Pune',goal:7.5},step:4,goalInput:'7.50',updatedAt:'2026-10-16T00:00:00Z'});
test('save feedback never claims success for unsaved, saving or failed device writes', () => {
  const entry = deviceEntry();
  const token = localDraftToken(entry);
  assert.equal(draftSaveLabel(entry,null,'idle',true),'Unsaved changes');
  assert.match(draftSaveLabel(entry,{token,phase:'saving'},'idle',true),/^Saving on this device/);
  assert.match(draftSaveLabel(entry,{token,phase:'failed'},'idle',true),/^Device save failed/);
  assert.equal(draftSaveLabel({...entry,goalInput:'8.00'}, {token,phase:'saved'},'idle',true),'Unsaved changes');
});

test('local success, account sync and confirmed account save remain distinct', () => {
  const entry=deviceEntry();
  const saved={token:localDraftToken(entry),phase:'saved'};
  assert.equal(draftSaveLabel(entry,saved,'idle',false),'Saved on this device');
  assert.equal(draftSaveLabel(entry,saved,'idle',true),'Saved on device · account copy needs saving');
  assert.equal(draftSaveLabel(entry,saved,'saving',true),'Saved on device · syncing account…');
  assert.equal(draftSaveLabel(entry,saved,'failed',true),'Saved on device · account sync failed');
  entry.accountSavedToken=accountDraftToken(entry);
  assert.equal(draftSaveLabel(entry,{token:localDraftToken(entry),phase:'saved'},'idle',true),'Saved on device and account');
  const edited={...entry,draft:{...entry.draft,summary:'A newer local edit'}};
  assert.equal(draftSaveLabel(edited,{token:localDraftToken(edited),phase:'saved'},'idle',true),'Saved on device · account copy needs saving');
});

test('save confirmation survives process serialization but is not borrowed by a separate campaign', () => {
  const entry=deviceEntry();
  entry.accountSavedToken=accountDraftToken(entry);
  const restored=JSON.parse(JSON.stringify(entry));
  assert.equal(restored.goalInput,'7.50');
  assert.equal(restored.step,4);
  assert.equal(draftSaveLabel(restored,{token:localDraftToken(restored),phase:'saved'},'idle',true),'Saved on device and account');
  const separate={...restored,localId:'new-local',draft:{...restored.draft,id:''}};
  assert.equal(draftSaveLabel(separate,{token:localDraftToken(separate),phase:'saved'},'idle',true),'Saved on device · account copy needs saving');
});

test('a slow device write announces saved only after persistence resolves', async () => {
  const entry=deviceEntry();
  let finish;
  const phases=[];
  const pending=writeLocalSnapshot(entry,()=>new Promise(resolve=>{finish=resolve;}),()=>true,state=>phases.push(state.phase));
  assert.deepEqual(phases,['saving']);
  await Promise.resolve();
  assert.deepEqual(phases,['saving']);
  finish();
  await pending;
  assert.deepEqual(phases,['saving','saved']);
});

test('failed device persistence exposes failure, never saved', async () => {
  const phases=[];
  await assert.rejects(writeLocalSnapshot(deviceEntry(),async()=>{throw new Error('disk unavailable');},()=>true,state=>phases.push(state.phase)),/disk unavailable/);
  assert.deepEqual(phases,['saving','failed']);
});

test('an older slow save cannot mark newer unsaved content successful', async () => {
  const entry=deviceEntry();
  let currentToken=localDraftToken(entry);
  let finish;
  const phases=[];
  const old=writeLocalSnapshot(entry,()=>new Promise(resolve=>{finish=resolve;}),()=>currentToken===localDraftToken(entry),state=>phases.push(state));
  const newer={...entry,draft:{...entry.draft,summary:'Newer text'}};
  currentToken=localDraftToken(newer);
  finish();
  await old;
  assert.deepEqual(phases.map(state=>state.phase),['saving']);
  assert.equal(draftSaveLabel(newer,phases.at(-1),'idle',true),'Unsaved changes');
});

test('a stale failed save cannot overwrite a newer successful snapshot status', async () => {
  const first=deviceEntry();
  let current=localDraftToken(first);
  let rejectOld;
  let feedback=null;
  const old=writeLocalSnapshot(first,()=>new Promise((_resolve,reject)=>{rejectOld=reject;}),()=>current===localDraftToken(first),state=>{feedback=state;});
  const second={...first,draft:{...first.draft,summary:'Latest text'}};
  current=localDraftToken(second);
  await writeLocalSnapshot(second,async()=>{},()=>current===localDraftToken(second),state=>{feedback=state;});
  rejectOld(new Error('old write failed'));
  await assert.rejects(old,/old write failed/);
  assert.deepEqual(feedback,{token:localDraftToken(second),phase:'saved'});
});

test('late account save merges server metadata while preserving newer local content and explicit goal', () => {
  const snapshot=deviceEntry();
  snapshot.draft.version=3;
  const current={...snapshot,step:3,goalInput:'8.25',draft:{...snapshot.draft,title:'Newer title',goal:8.25,sections:[{id:'latest',kind:'text',text:'Newer story'}]}};
  const saved={...snapshot.draft,version:4,ownerId:'owner',status:'Draft'};
  const merged=mergeAccountSaved(snapshot,current,saved);
  assert.equal(merged.draft.title,'Newer title');
  assert.equal(merged.draft.sections[0].text,'Newer story');
  assert.equal(merged.goalInput,'8.25');
  assert.equal(merged.draft.goal,8.25);
  assert.equal(merged.step,3);
  assert.equal(merged.draft.version,4);
  assert.equal(merged.draft.ownerId,'owner');
  assert.equal(merged.accountSavedToken,accountDraftToken({...snapshot,draft:saved}));
  assert.equal(draftSaveLabel(merged,{token:localDraftToken(merged),phase:'saved'},'idle',true),'Saved on device · account copy needs saving');
  assert.equal(mergeAccountSaved(snapshot,{...current,localId:'different-draft'},saved),null);
});
