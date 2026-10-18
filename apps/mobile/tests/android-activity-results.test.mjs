import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { patchSource, patchInstalled, patch } = require('../plugins/campaignActivityResultsPatch.cjs');
const withActivityResults = require('../plugins/withCampaignActivityResults.cjs');
const mobile = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(mobile, '../..');
const installed = readFileSync(path.join(mobile, 'node_modules/expo-modules-core', patch.source));
let upstream = installed.toString('utf8');
if (upstream.includes('private var lastResumedActivity:')) {
  for (const { before, after } of [...patch.replacements].reverse()) upstream = upstream.replace(after, before);
}
const patched = patchSource(Buffer.from(upstream), patch.version).bytes;

test('reviewed pinned native patch is byte-exact and idempotent', () => {
  assert.equal(patchSource(Buffer.from(upstream), patch.version).changed, true);
  const again = patchSource(patched, patch.version);
  assert.equal(again.changed, false);
  assert.equal(again.bytes.equals(patched), true);
  assert.equal(again.sha256, patch.patchedSha256);
  assert.equal(patchInstalled(mobile).sha256, patch.patchedSha256);
});

test('upgraded, externally modified or truncated Expo native source fails closed', () => {
  assert.throws(() => patchSource(Buffer.from(upstream), '55.0.27'), /requires expo-modules-core 55.0.26/);
  assert.throws(() => patchSource(Buffer.from(`${upstream}\n`), patch.version), /failed closed/);
  assert.throws(() => patchSource(patched.subarray(1), patch.version), /failed closed/);
});

const priorChanges = 'keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|smallestScreenSize';
function manifest(changes) {
  return { manifest: { application: [{ $: { 'android:label': 'Campaign', 'android:usesCleartextTraffic': 'false' },
    activity: [{ $: { 'android:name': '.MainActivity', 'android:configChanges': changes, 'android:launchMode': 'singleTask' } },
      { $: { 'android:name': '.OtherActivity', 'android:configChanges': 'fontScale|orientation' } }],
  }] } };
}
async function apply(value) {
  const config = withActivityResults({ name: 'Campaign', slug: 'campaign-amplification' });
  return (await config.mods.android.manifest({ modResults: value, modRequest: { platform: 'android' } })).modResults;
}

test('CNG removes only the rejected MainActivity fontScale override and remains idempotent', async () => {
  const input = manifest(`${priorChanges}|fontScale`), expected = manifest(priorChanges);
  assert.deepEqual(await apply(input), expected);
  assert.deepEqual(await apply(input), expected);
  assert.deepEqual(await apply(manifest(priorChanges)), expected);
});

test('CNG fails when MainActivity is missing and does not invent other manifest policy', async () => {
  await assert.rejects(apply({ manifest: {} }), /missing the required MainActivity/);
  const input = manifest(undefined), original = structuredClone(input);
  assert.deepEqual(await apply(input), original);
});

test('actual CNG native-source mod fails closed on unexpected dependency bytes', async () => {
  const project = mkdtempSync(path.join(root, 'tmp/activity-result-mod-'));
  const dependency = path.join(project, 'node_modules/expo-modules-core');
  mkdirSync(path.dirname(path.join(dependency, patch.source)), { recursive: true });
  writeFileSync(path.join(dependency, 'package.json'), JSON.stringify({ name: patch.package, version: patch.version }));
  const unexpected = Buffer.from('unreviewed native source');
  writeFileSync(path.join(dependency, patch.source), unexpected);
  const config = withActivityResults({ name: 'Campaign', slug: 'campaign-amplification' });
  await assert.rejects(config.mods.android.dangerous({ modRequest: { platform: 'android', projectRoot: project } }), /failed closed/);
  assert.deepEqual(readFileSync(path.join(dependency, patch.source)), unexpected);
});

test('install, CNG and every local Android build use the same guarded patch', () => {
  const { expo } = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(expo.plugins.filter(p => p === './plugins/withCampaignActivityResults.cjs').length, 1);
  assert.equal(expo.plugins.filter(p => p === './plugins/withCampaignFontScale.cjs').length, 0);
  assert.equal(pkg.scripts.postinstall, 'node plugins/campaignActivityResultsPatch.cjs && node plugins/campaignPrintPatch.cjs');
  const build = readFileSync(path.join(root, 'scripts/android-local.ps1'), 'utf8');
  assert.match(build, /& \$campaignNode 'plugins\/campaignActivityResultsPatch\.cjs'/);
  assert.match(build, /native-patches/);
});

const lib = path.join(root, 'tmp/android-build/gradle-dist/gradle-9.0.0/lib');
const java = path.join(root, 'tools/android-sdk/jdk17/bin/java.exe');
const compiler = path.join(lib, 'kotlin-compiler-embeddable-2.2.0.jar');
test('actual patched Kotlin resume method handles replacement hosts and ordinary resumes', {
  skip: !existsSync(compiler) || !existsSync(java) ? 'Project-local Android JDK/Kotlin compiler unavailable; native lifecycle execution remains unverified' : false,
  timeout: 120000,
}, () => {
  const native = patched.toString('utf8');
  const method = native.slice(native.indexOf('  internal fun onHostResume() {'), native.indexOf('  internal fun onHostPause() {'));
  const identityField = native.match(/^  private var lastResumedActivity:.*$/m)?.[0];
  assert.ok(method.startsWith('  internal fun onHostResume() {') && identityField);
  const output = mkdtempSync(path.join(root, 'tmp/activity-result-lifecycle-'));
  const source = path.join(output, 'ActivityResultLifecycleHarness.kt');
  // Compile the exact patched upstream method and identity field, using tiny
  // Activity/registry doubles only at its Android boundary. No JS policy copy.
  writeFileSync(source, `import java.lang.ref.WeakReference
open class Activity { val localClassName = "TestActivity" }
class AppCompatActivity : Activity()
enum class EventName { ACTIVITY_ENTERS_FOREGROUND }
class AppContext {
  var currentActivity: Activity? = null
  private var hostWasDestroyed = false
${identityField}
  var registrations = 0
  val ordering = mutableListOf<String>()
  inner class Manager {
    var activity: AppCompatActivity? = null
    fun onHostResume(value: AppCompatActivity) { activity = value; ordering.add("host") }
  }
  val activityResultsManager = Manager()
  inner class Registry {
    fun registerActivityContracts() {
      check(activityResultsManager.activity === currentActivity) { "Contracts observed stale host" }
      registrations++; ordering.add("contracts")
    }
    fun post(event: EventName) { check(event == EventName.ACTIVITY_ENTERS_FOREGROUND); ordering.add("foreground") }
  }
  val registry = Registry()
  fun destroyed() { hostWasDestroyed = true }
${method}
}
fun main() {
  val context = AppContext(); val first = AppCompatActivity(); val second = AppCompatActivity()
  context.onHostResume(); check(context.registrations == 0 && context.ordering.isEmpty())
  context.currentActivity = first; context.onHostResume()
  check(context.registrations == 0 && context.ordering == listOf("host", "foreground"))
  context.ordering.clear(); context.onHostResume()
  check(context.registrations == 0 && context.ordering == listOf("host", "foreground"))
  context.ordering.clear(); context.currentActivity = second; context.onHostResume()
  check(context.registrations == 1 && context.ordering == listOf("host", "contracts", "foreground"))
  context.ordering.clear(); context.onHostResume(); check(context.registrations == 1)
  context.ordering.clear(); context.destroyed(); context.onHostResume()
  check(context.registrations == 2 && context.ordering == listOf("host", "contracts", "foreground"))
  context.onHostResume(); check(context.registrations == 2)
  val weakField = AppContext::class.java.getDeclaredField("lastResumedActivity")
  weakField.isAccessible = true
  (weakField.get(context) as WeakReference<*>).clear()
  context.ordering.clear(); context.onHostResume()
  check(context.registrations == 3 && context.ordering == listOf("host", "contracts", "foreground"))
  context.currentActivity = Activity()
  try { context.onHostResume(); error("Wrong Activity type accepted") } catch (_: IllegalStateException) { }
  check(context.registrations == 3)
  println("9 native lifecycle scenarios passed: null/first/same/changed/repeat/destroy/reset/clearedWeak/type")
}
`, 'utf8');
  const run = args => spawnSync(java, args, { encoding: 'utf8', timeout: 90000, maxBuffer: 4 * 1024 * 1024 });
  const compile = run(['-Xmx384m', '-cp', path.join(lib, '*'), 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler',
    '-no-stdlib', '-no-reflect', '-classpath', `${path.join(lib, 'kotlin-stdlib-2.2.0.jar')};${path.join(lib, 'annotations-24.0.1.jar')}`,
    '-d', path.join(output, 'classes'), source]);
  writeFileSync(path.join(output, 'compile.log'), `${compile.stdout ?? ''}${compile.stderr ?? ''}`);
  assert.equal(compile.status, 0, compile.error?.message || compile.stderr);
  const actual = run(['-cp', `${path.join(output, 'classes')};${path.join(lib, 'kotlin-stdlib-2.2.0.jar')}`, 'ActivityResultLifecycleHarnessKt']);
  writeFileSync(path.join(output, 'execution.log'), `${actual.stdout ?? ''}${actual.stderr ?? ''}`);
  assert.equal(actual.status, 0, actual.error?.message || actual.stderr);
  assert.match(actual.stdout, /9 native lifecycle scenarios passed/);
});
