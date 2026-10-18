import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/features/reports/shareReport.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
function setup(options = {}) {
  const calls = [], files = [], document = { snapshot: { shareable: options.public !== false } };
  let active = true;
  class File {
    constructor(parent, name) {
      this.uri = name ? `${parent.uri}/${name}` : parent;
      this.name = this.uri.split('/').pop(); this.exists = true; this.size = options.bytes ?? 100;
      this.modificationTime = Date.now(); files.push(this);
    }
    delete() { calls.push(['delete', this.uri]); this.exists = false; }
    move(target) { calls.push(['move', target.uri]); this.uri = target.uri; this.name = target.name; }
  }
  class Directory {
    constructor(parent, name) { this.uri = `${parent}/${name}`; this.exists = true; }
    create(value) { calls.push(['mkdir', this.uri, value]); }
    list() { return options.cachedFiles || []; }
  }
  const deps = {
    'react-native': { Platform: { OS: options.web ? 'web' : 'android' } },
    'expo-print': { printToFileAsync: async value => {
      calls.push(['print', value]); if (options.afterPrint) active = false;
      if (options.printFailure) throw new Error('Renderer failed');
      return { uri: 'file://cache/print.pdf', numberOfPages: options.pages ?? 2 };
    } },
    'expo-sharing': {
      isAvailableAsync: async () => { calls.push(['available']); if (options.afterAvailable) active = false; return options.available !== false; },
      shareAsync: async (...values) => { calls.push(['share', ...values]); if (options.shareFailure) throw new Error('Chooser failed'); },
    },
    'expo-file-system': { File, Directory, Paths: { cache: 'file://cache' } },
    '../../lib/report': {
      canShareReport: snapshot => snapshot.shareable,
      reportHtml: value => { assert.equal(value, document); return '<html>Frozen public snapshot</html>'; },
      reportFilename: () => 'Campaign-public-snapshot.pdf',
    },
  };
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(name => { assert.ok(name in deps); return deps[name]; }, module, module.exports);
  return { ...module.exports, document, calls, files, File, current: () => active, deactivate: () => { active = false; } };
}
test('native sharing renders one frozen PDF then grants the local file to the native chooser', async () => {
  const h = setup(); await h.shareReport(h.document, h.current);
  assert.deepEqual(h.calls.filter(c => ['available', 'print', 'move', 'share'].includes(c[0])).map(c => c[0]), ['available', 'print', 'move', 'share']);
  const print = h.calls.find(c => c[0] === 'print')[1];
  assert.equal(print.html, '<html>Frozen public snapshot</html>'); assert.equal(print.textZoom, 100);
  const share = h.calls.find(c => c[0] === 'share');
  assert.match(share[1], /^file:\/\/cache\/campaign-public-reports-v1\/Campaign-public-snapshot-[a-z0-9]+\.pdf$/);
  assert.equal(share[2].mimeType, 'application/pdf');
  assert.equal(h.calls.some(c => c[0] === 'delete'), false, 'recipient must retain access after chooser resolves');
});
test('private reports and unsupported web sharing fail before file creation', async () => {
  for (const options of [{ public: false }, { web: true }]) {
    const h = setup(options); await assert.rejects(h.shareReport(h.document, h.current));
    assert.equal(h.calls.some(c => ['print', 'share', 'mkdir'].includes(c[0])), false);
  }
});
test('unavailable share service produces a recoverable error without rendering', async () => {
  const h = setup({ available: false }); await assert.rejects(h.shareReport(h.document, h.current), /Sharing is unavailable/);
  assert.deepEqual(h.calls.map(c => c[0]), ['available']);
});
test('route/session invalidation before or during availability cannot open a chooser', async () => {
  for (const timing of ['before', 'afterAvailable']) {
    const h = setup({ [timing]: true }); if (timing === 'before') h.deactivate();
    await h.shareReport(h.document, h.current);
    assert.equal(h.calls.some(c => ['print', 'share'].includes(c[0])), false);
  }
});
test('route/session invalidation during native rendering deletes only the generated file', async () => {
  const h = setup({ afterPrint: true }); await h.shareReport(h.document, h.current);
  assert.deepEqual(h.calls.filter(c => c[0] === 'delete'), [['delete', 'file://cache/print.pdf']]);
  assert.equal(h.calls.some(c => ['move', 'share'].includes(c[0])), false);
});
test('empty or zero-page native outputs are rejected and cleaned up', async () => {
  for (const options of [{ bytes: 0 }, { pages: 0 }]) {
    const h = setup(options); await assert.rejects(h.shareReport(h.document, h.current), /could not be rendered/);
    assert.equal(h.calls.some(c => c[0] === 'share'), false);
    assert.equal(h.files[0].exists, false);
  }
});
test('native rendering and sharing failures remain visible with scoped cleanup', async () => {
  for (const options of [{ printFailure: true }, { shareFailure: true }]) {
    const h = setup(options); await assert.rejects(h.shareReport(h.document, h.current), /failed/);
    if (options.shareFailure) assert.equal(h.files[0].exists, false);
  }
});
test('cache cleanup excludes recent reports, unrelated files and unknown modification times', () => {
  const cachedFiles = [], h = setup({ cachedFiles });
  for (const [name, time] of [['Campaign-old.pdf', Date.now() - 25 * 3600000], ['Campaign-recent.pdf', Date.now()], ['draft.json', 1], ['Campaign-unknown.pdf', null]]) {
    const file = new h.File(`file://cache/campaign-public-reports-v1/${name}`); file.modificationTime = time; cachedFiles.push(file);
  }
  h.pruneReportCache();
  assert.deepEqual(h.calls.filter(c => c[0] === 'delete').map(c => c[1]), ['file://cache/campaign-public-reports-v1/Campaign-old.pdf']);
});
