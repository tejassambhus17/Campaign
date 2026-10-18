import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { patchSource, patchInstalled, patch } = require('../plugins/campaignPrintPatch.cjs');
const withPdfRendering = require('../plugins/withCampaignPdfRendering.cjs');
const mobile = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(mobile, '../..');
const directory = path.join(mobile, 'native-patches/expo-print-55.0.19');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const upstream = file => readFileSync(path.join(directory, 'upstream', file.patchedFile));
const reviewed = file => readFileSync(path.join(directory, file.patchedFile));

test('both pinned Expo print sources transform byte-exactly and remain idempotent', () => {
  for (const file of patch.files) {
    assert.equal(sha(upstream(file)), file.upstreamSha256);
    assert.equal(sha(reviewed(file)), file.patchedSha256);
    const first = patchSource(upstream(file), patch.version, file.source);
    assert.equal(first.changed, true);
    assert.deepEqual(first.bytes, reviewed(file));
    const again = patchSource(first.bytes, patch.version, file.source);
    assert.equal(again.changed, false);
    assert.equal(again.sha256, file.patchedSha256);
  }
  assert.equal(patchInstalled(mobile).files.every(file => !file.changed), true);
});

test('unreviewed versions, targets and modified or truncated native bytes fail closed', () => {
  for (const file of patch.files) {
    assert.throws(() => patchSource(upstream(file), '55.0.20', file.source), /requires expo-print 55.0.19/);
    assert.throws(() => patchSource(Buffer.concat([upstream(file), Buffer.from('\n')]), patch.version, file.source), /failed closed/);
    assert.throws(() => patchSource(reviewed(file).subarray(1), patch.version, file.source), /failed closed/);
  }
  assert.throws(() => patchSource(Buffer.from('source'), patch.version, 'another.kt'), /Unreviewed/);
});

function fixture(bytesForFile) {
  const project = mkdtempSync(path.join(root, 'tmp/print-patch-mod-'));
  const dependency = path.join(project, 'node_modules/expo-print');
  mkdirSync(dependency, { recursive: true });
  writeFileSync(path.join(project, 'package.json'), JSON.stringify({
    expo: { autolinking: { android: { buildFromSource: ['expo-modules-core', 'expo-print'] } } },
  }));
  writeFileSync(path.join(dependency, 'package.json'), JSON.stringify({ name: patch.package, version: patch.version }));
  for (const [index, file] of patch.files.entries()) {
    const target = path.join(dependency, file.source);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, bytesForFile(file, index));
  }
  return { project, dependency };
}
async function apply(project) {
  const config = withPdfRendering({ name: 'Campaign', slug: 'campaign-amplification' });
  return config.mods.android.dangerous({ modRequest: { platform: 'android', projectRoot: project } });
}

test('CNG validates every file before any write and refuses an unknown second file', async () => {
  const unknown = Buffer.from('unreviewed module implementation');
  const { project, dependency } = fixture((file, index) => index ? unknown : upstream(file));
  await assert.rejects(apply(project), /failed closed/);
  assert.deepEqual(readFileSync(path.join(dependency, patch.files[0].source)), upstream(patch.files[0]));
  assert.deepEqual(readFileSync(path.join(dependency, patch.files[1].source)), unknown);
});

test('actual CNG mod repairs only recognized mixed states and is idempotent', async () => {
  const { project, dependency } = fixture((file, index) => index ? reviewed(file) : upstream(file));
  await apply(project);
  for (const file of patch.files) assert.deepEqual(readFileSync(path.join(dependency, file.source)), reviewed(file));
  await apply(project);
  assert.equal(patchInstalled(project).files.every(file => !file.changed), true);
});

test('source-patched modules refuse prebuilt fallback before any native write', () => {
  const { project, dependency } = fixture(upstream);
  writeFileSync(path.join(project, 'package.json'), JSON.stringify({ expo: { autolinking: { android: { buildFromSource: ['expo-modules-core'] } } } }));
  assert.throws(() => patchInstalled(project), /must explicitly build from source/);
  for (const file of patch.files) assert.deepEqual(readFileSync(path.join(dependency, file.source)), upstream(file));
});

test('installed Expo resolver publishes explicit source-build configuration for both patched modules', () => {
  const cli = path.join(path.dirname(require.resolve('expo-modules-autolinking/package.json')), 'bin/expo-modules-autolinking.js');
  const result = spawnSync(process.execPath, [cli, 'resolve', '--platform', 'android', '--json'], {
    cwd: mobile, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  const config = JSON.parse(result.stdout);
  assert.deepEqual(config.configuration.buildFromSource, ['expo-modules-core', 'expo-print']);
  const print = config.modules.find(module => module.packageName === 'expo-print');
  assert.equal(print.packageVersion, '55.0.19');
  assert.equal(print.projects.some(project => project.name === 'expo-print'), true);
});

test('install, CNG, local Android builds and existing APK license copy preserve the guarded patch', () => {
  const { expo } = JSON.parse(readFileSync(path.join(mobile, 'app.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(path.join(mobile, 'package.json'), 'utf8'));
  assert.equal(expo.plugins.filter(value => value === './plugins/withCampaignPdfRendering.cjs').length, 1);
  assert.equal(pkg.scripts.postinstall, 'node plugins/campaignActivityResultsPatch.cjs && node plugins/campaignPrintPatch.cjs');
  const build = readFileSync(path.join(root, 'scripts/android-local.ps1'), 'utf8');
  assert.match(build, /& \$campaignNode 'plugins\/campaignPrintPatch\.cjs'/);
  assert.match(build, /native-patches/);
  const licensePlugin = readFileSync(path.join(mobile, 'plugins/withInternalTestAndroid.cjs'), 'utf8');
  assert.match(licensePlugin, /Expo-MIT\.txt/);
  assert.deepEqual(readFileSync(path.join(directory, 'LICENSE-MIT.txt')), readFileSync(path.join(mobile, 'assets/licenses/Expo-MIT.txt')));
});
