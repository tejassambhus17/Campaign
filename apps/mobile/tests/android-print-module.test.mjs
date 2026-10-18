import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const mobile = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(mobile, '../..');
const lib = path.join(root, 'tmp/android-build/gradle-dist/gradle-9.0.0/lib');
const java = path.join(root, 'tools/android-sdk/jdk17/bin/java.exe');
const moduleSource = path.join(mobile, 'native-patches/expo-print-55.0.19/PrintModule.kt');
const taskSource = path.join(mobile, 'native-patches/expo-print-55.0.19/PrintPDFRenderTask.kt');
const fixtures = fileURLToPath(new URL('./native-print/', import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');

test('exact PrintModule file methods execute with real coroutine ownership and cancellation', {
  skip: !existsSync(java) || !existsSync(path.join(lib, 'kotlinx-coroutines-core-jvm-1.10.2.jar'))
    ? 'Project-local Java/Kotlin/coroutines unavailable; native module execution remains unverified' : false,
  timeout: 120000,
}, () => {
  const original = readFileSync(moduleSource);
  const taskBefore = readFileSync(taskSource);
  const text = original.toString('utf8');
  const start = text.indexOf('  private suspend fun printToFile(');
  const end = text.indexOf('  private fun createPrintCallbacks(', start);
  assert.ok(start >= 0 && end > start, 'Exact source extraction boundaries must exist');
  const methods = text.slice(start, end);
  assert.equal((methods.match(/private suspend fun printToFile\(/g) ?? []).length, 1);
  assert.equal((methods.match(/private fun createPrintToFileCallbacks\(/g) ?? []).length, 1);
  const output = mkdtempSync(path.join(root, 'tmp/print-module-harness-'));
  const wrapper = path.join(output, 'PrintModuleUnderTest.kt');
  writeFileSync(wrapper, `package expo.modules.print
import android.content.Context
import android.os.ParcelFileDescriptor
import android.print.PrintDocumentAdapter
import expo.modules.kotlin.exception.CodedException
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.resumeWithException
internal class PrintModuleUnderTest {
  val context: Context get() { ModuleBoundary.onContext?.invoke(); return Context() }
  suspend fun execute(options: PrintOptions) = printToFile(options)
  fun callbacks(options: PrintOptions, continuation: CancellableContinuation<FilePrintResult>) = createPrintToFileCallbacks(options, continuation)
${methods}
}
`);
  const inputs = [taskSource, path.join(mobile, 'node_modules/expo-print/android/src/main/java/expo/modules/print/PrintExceptions.kt'), wrapper,
    ...readdirSync(fixtures).filter(name => name.endsWith('.kt') && name !== 'PrintRenderingHarness.kt').map(name => path.join(fixtures, name)),
    ...readdirSync(path.join(fixtures, 'module')).filter(name => name.endsWith('.kt')).map(name => path.join(fixtures, 'module', name))];
  const classes = path.join(output, 'classes');
  const files = path.join(output, 'disposable-output'); mkdirSync(files);
  const classpath = ['kotlin-stdlib-2.2.0.jar', 'annotations-24.0.1.jar', 'kotlinx-coroutines-core-jvm-1.10.2.jar'].map(name => path.join(lib, name)).join(path.delimiter);
  const run = args => spawnSync(java, args, { encoding: 'utf8', timeout: 90000, maxBuffer: 4 * 1024 * 1024 });
  const compile = run(['-Xmx384m', '-cp', path.join(lib, '*'), 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler', '-no-stdlib', '-no-reflect', '-classpath', classpath, '-d', classes, ...inputs]);
  writeFileSync(path.join(output, 'compile.log'), `${compile.stdout ?? ''}${compile.stderr ?? ''}`);
  assert.equal(compile.status, 0, compile.error?.message || compile.stderr);
  const services = path.join(classes, 'META-INF/services'); mkdirSync(services, { recursive: true });
  writeFileSync(path.join(services, 'kotlinx.coroutines.internal.MainDispatcherFactory'), 'expo.modules.print.HarnessMainDispatcherFactory\n');
  const execution = run(['-cp', `${classes}${path.delimiter}${classpath}`, 'expo.modules.print.PrintModuleHarnessKt', files]);
  writeFileSync(path.join(output, 'execution.log'), `${execution.stdout ?? ''}${execution.stderr ?? ''}`);
  assert.equal(execution.status, 0, execution.error?.message || execution.stderr);
  assert.match(execution.stdout, /14 executable native module scenarios passed/);
  assert.deepEqual(readFileSync(moduleSource), original);
  assert.deepEqual(readFileSync(taskSource), taskBefore);
  writeFileSync(path.join(output, 'EVIDENCE.json'), JSON.stringify({
    scope: 'Unchanged exact two PrintModule methods plus whole exact renderer, actual coroutines1.10.2; Android/Expo/file helpers doubled, no Android runtime claim',
    moduleSource: path.relative(root, moduleSource), moduleSha256: sha(original), extractedMethodsSha256: sha(methods),
    taskSha256: sha(taskBefore), inputSha256: Object.fromEntries(inputs.map(file => [path.relative(root, file), sha(readFileSync(file))])),
    compileExitCode: compile.status, executionExitCode: execution.status, executableScenarios: 14, sourceUnchanged: true, deviceOrCloudAccess: false,
  }, null, 2));
});
