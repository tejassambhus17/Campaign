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
const source = path.join(mobile, 'native-patches/expo-print-55.0.19/PrintPDFRenderTask.kt');
const exceptions = path.join(mobile, 'node_modules/expo-print/android/src/main/java/expo/modules/print/PrintExceptions.kt');
const fixtures = fileURLToPath(new URL('./native-print/', import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');

test('exact expo-print native renderer executes terminal, cancellation and resource-lifetime cases', {
  skip: !existsSync(java) || !existsSync(path.join(lib, 'kotlin-compiler-embeddable-2.2.0.jar'))
    ? 'Project-local Java17/Kotlin2.2 compiler is unavailable; native execution remains unverified' : false,
  timeout: 120000,
}, () => {
  // Compile the entire actual patch candidate used by the guarded installer. Android
  // and Expo option/exception boundaries are doubled; rendering policy is not.
  const before = readFileSync(source);
  const output = mkdtempSync(path.join(root, 'tmp/print-renderer-harness-'));
  const inputs = [source, exceptions, ...readdirSync(fixtures).filter(name => name.endsWith('.kt')).map(name => path.join(fixtures, name))];
  const classes = path.join(output, 'classes');
  const files = path.join(output, 'disposable-output');
  mkdirSync(files);
  const classpath = ['kotlin-stdlib-2.2.0.jar', 'annotations-24.0.1.jar', 'kotlinx-coroutines-core-jvm-1.10.2.jar']
    .map(name => path.join(lib, name)).join(path.delimiter);
  const run = args => spawnSync(java, args, { encoding: 'utf8', timeout: 90000, maxBuffer: 4 * 1024 * 1024 });
  const compile = run(['-Xmx384m', '-cp', path.join(lib, '*'), 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler',
    '-no-stdlib', '-no-reflect', '-classpath', classpath, '-d', classes, ...inputs]);
  writeFileSync(path.join(output, 'compile.log'), `${compile.stdout ?? ''}${compile.stderr ?? ''}`);
  assert.equal(compile.status, 0, compile.error?.message || compile.stderr);
  const execution = run(['-cp', `${classes}${path.delimiter}${classpath}`, 'expo.modules.print.PrintRenderingHarnessKt', files]);
  writeFileSync(path.join(output, 'execution.log'), `${execution.stdout ?? ''}${execution.stderr ?? ''}`);
  assert.equal(execution.status, 0, execution.error?.message || execution.stderr);
  assert.match(execution.stdout, /24 executable native renderer scenarios passed/);
  assert.deepEqual(readFileSync(source), before, 'Harness must never modify the native renderer');
  writeFileSync(path.join(output, 'EVIDENCE.json'), JSON.stringify({
    scope: 'JVM execution of complete actual Kotlin renderer using deterministic Android boundary doubles; not Android/WebView runtime QA',
    source: path.relative(root, source), sourceSha256: sha(before),
    inputSha256: Object.fromEntries(inputs.map(file => [path.relative(root, file), sha(readFileSync(file))])),
    compileExitCode: compile.status, executionExitCode: execution.status,
    executableScenarios: 24, sourceUnchanged: true, deviceOrCloudAccess: false,
  }, null, 2));
});

test('whole renderer compiles against actual Android36 annotations and rejects null WebView clients', {
  skip: !existsSync(java) || !existsSync(path.join(root, 'tools/android-sdk/platforms/android-36/android.jar'))
    || !existsSync(path.join(lib, 'kotlin-compiler-embeddable-2.2.0.jar'))
    ? 'Project-local Android36/Java/Kotlin unavailable; actual SDK binding compilation remains unverified' : false,
  timeout: 120000,
}, () => {
  const before = readFileSync(source);
  const androidJar = path.join(root, 'tools/android-sdk/platforms/android-36/android.jar');
  const upstream = path.join(mobile, 'node_modules/expo-print/android/src/main/java/expo/modules/print');
  // Compile the complete production task, the real installed package-local
  // callback bridges, and actual SDK Android types. Only Expo options and the
  // unrelated exception/UiThread boundaries remain minimal compilation stubs.
  const inputs = [source, exceptions,
    path.join(upstream, 'PrintDocumentAdapterLayoutCallback.kt'), path.join(upstream, 'PrintDocumentAdapterWriteCallback.kt'),
    ...['PrintOptions.kt', 'CodedException.kt', 'UiThread.kt'].map(name => path.join(fixtures, name))];
  const output = mkdtempSync(path.join(root, 'tmp/print-android36-compile-'));
  const classpath = [androidJar, ...['kotlin-stdlib-2.2.0.jar', 'annotations-24.0.1.jar'].map(name => path.join(lib, name))].join(path.delimiter);
  const compiler = ['-Xmx384m', '-cp', path.join(lib, '*'), 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler',
    '-no-stdlib', '-no-reflect', '-classpath', classpath];
  const compile = (files, destination) => spawnSync(java, [...compiler, '-d', destination, ...files], {
    encoding: 'utf8', timeout: 90000, maxBuffer: 4 * 1024 * 1024,
  });
  const positive = compile(inputs, path.join(output, 'classes'));
  writeFileSync(path.join(output, 'actual-sdk-compile.log'), `${positive.stdout ?? ''}${positive.stderr ?? ''}`);
  assert.equal(positive.status, 0, positive.error?.message || positive.stderr);
  const originalText = before.toString('utf8');
  const validCleanup = 'finishedView?.webViewClient = WebViewClient()';
  assert.equal(originalText.split(validCleanup).length - 1, 1, 'Exactly one legal client-detach cleanup expected');
  // A disposable negative control establishes that these real SDK annotations
  // catch the original illegal-null expression, rather than silently erasing it.
  const illegal = path.join(output, 'IllegalNullPrintPDFRenderTask.kt');
  writeFileSync(illegal, originalText.replace(validCleanup, 'finishedView?.webViewClient = null'));
  const negative = compile([illegal, ...inputs.slice(1)], path.join(output, 'negative-classes'));
  writeFileSync(path.join(output, 'negative-null-client-compile.log'), `${negative.stdout ?? ''}${negative.stderr ?? ''}`);
  assert.notEqual(negative.status, 0, 'Actual Android36 must reject the original null assignment');
  assert.match(negative.stderr, /null.*non-null|null.*WebViewClient|Null.*non-null/i);
  assert.deepEqual(readFileSync(source), before);
  writeFileSync(path.join(output, 'EVIDENCE.json'), JSON.stringify({
    scope: 'Complete exact Kotlin task plus actual installed callback bridges compiled against actual Android36 android.jar; no Android execution',
    sourceSha256: sha(before), androidJar: path.relative(root, androidJar), androidJarSha256: sha(readFileSync(androidJar)),
    inputSha256: Object.fromEntries(inputs.map(file => [path.relative(root, file), sha(readFileSync(file))])),
    actualSdkCompileExitCode: positive.status, illegalNullNegativeControlExitCode: negative.status,
    sourceUnchanged: true, deviceOrCloudAccess: false,
  }, null, 2));
});
