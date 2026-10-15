import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const source=ts.transpileModule(readFileSync(new URL('../src/lib/discovery.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const model={exports:{}};
new Function('exports','module',source)(model.exports,model);
const {discoverCampaigns}=model.exports;
const rows=[
  {id:'forest',title:'A growing forest',summary:'Shade for every street',creatorName:'Canopy team',category:'Environment',status:'Available for Funding',raised:50,goal:100,createdAt:'2026-10-10',featured:false},
  {id:'books',title:'Books for everyone',summary:'Bring people together',creatorName:'Open Chapter',category:'Education',status:'Completed',raised:20,goal:20,createdAt:'2026-10-11',publishedAt:'2026-10-13',featured:true},
  {id:'ocean',title:'Our shared coast',summary:'The ocean connects us',creatorName:'Blue Collective',category:'Environment',status:'Available for Funding',raised:80,goal:200,createdAt:'2026-10-12'},
];
const filters={search:'',category:'All',sort:'Featured',funding:false};
test('search matches message, creator and category without case or surrounding-space surprises',()=>{
  assert.deepEqual(discoverCampaigns(rows,{...filters,search:' OCEAN '}).map(c=>c.id),['ocean']);
  assert.deepEqual(discoverCampaigns(rows,{...filters,search:'canopy'}).map(c=>c.id),['forest']);
  assert.deepEqual(discoverCampaigns(rows,{...filters,search:'education'}).map(c=>c.id),['books']);
});
test('category and open-for-backing filters compose and no-results is a real empty set',()=>{
  assert.deepEqual(discoverCampaigns(rows,{...filters,category:'Environment',funding:true}).map(c=>c.id),['forest','ocean']);
  assert.deepEqual(discoverCampaigns(rows,{...filters,category:'Education',funding:true}),[]);
  assert.deepEqual(discoverCampaigns(rows,{...filters,search:'no matching message'}),[]);
});
test('all displayed sort options change order, using publication date for newest',()=>{
  assert.deepEqual(discoverCampaigns(rows,filters).map(c=>c.id),['books','forest','ocean']);
  assert.deepEqual(discoverCampaigns(rows,{...filters,sort:'Newest'}).map(c=>c.id),['books','ocean','forest']);
  assert.deepEqual(discoverCampaigns(rows,{...filters,sort:'Most funded'}).map(c=>c.id),['ocean','forest','books']);
  assert.deepEqual(discoverCampaigns(rows,{...filters,sort:'Closest to goal'}).map(c=>c.id),['books','forest','ocean']);
  assert.deepEqual(rows.map(c=>c.id),['forest','books','ocean']);
});
