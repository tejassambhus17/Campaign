# Native print boundary tests

`android-print-rendering.test.mjs` compiles the complete tracked
`PrintPDFRenderTask.kt` candidate and the installed Expo print exceptions with
the existing project-local Java 17/Kotlin 2.2 compiler. Its 24 scenario groups
execute the actual renderer lifecycle and ownership logic. Android events,
WebView, adapters and descriptors are deterministic boundary doubles. Two
callback scenarios use real worker threads and drain a controlled Main queue.
The WebView boundary matches Android 36's non-null client contract; terminal
cleanup must replace the task-owned client before destroying its view.

The same test file also compiles the complete exact task against the existing
**actual Android 36 `android.jar`** and the installed Expo package-local Kotlin
callback bridges. Android types are not doubled in that compile check. A
disposable negative control restores the original illegal null-client cleanup
and must fail compilation, proving the SDK annotation check is active. This
additional check compiles only; it executes no SDK stub or Android runtime.

`android-print-module.test.mjs` extracts the exact adjacent `printToFile` and
`createPrintToFileCallbacks` methods from tracked `PrintModule.kt`, preserving
their text unchanged inside a small compilation wrapper. It compiles those
methods with the whole actual renderer and **real kotlinx-coroutines 1.10.2**.
The service-loaded test Main dispatcher runs through the controlled queue;
`Dispatchers.IO` uses real coroutine worker threads. File helper boundaries
operate only on newly generated disposable files. The expected 14 scenario
groups cover successful/repeated exports, both IO failure boundaries,
cancellation at ownership transitions, optional base64 success/failure,
renderer rejection, undelivered-result cancellation, and duplicate/late
callback ownership.

Run from `E:\Campaign` using the existing Node runtime:

```powershell
node --test apps/mobile/tests/android-print-rendering.test.mjs apps/mobile/tests/android-print-module.test.mjs
```

Each run creates a unique `tmp/print-{renderer,module}-harness-*` folder with
compiler/execution logs, generated classes, disposable output and a success
receipt binding source and fixture hashes. Missing local tools produce an
explicit skipped test, never a passing native-execution claim. Production
sources are read only and checked for drift during the run. No SDK downloads,
device, emulator, cloud, account, real report or existing application data are
used.

These tests establish JVM behavior against Android boundaries. They do not
establish Android/WebView rendering fidelity, PDF validity, native chooser
delivery, physical-device compatibility or full application acceptance. Those
require separate actual Android checks. The generic printer path is covered
only by the renderer handoff scenario; unrelated Expo module DSL/printing
integration is outside the extracted-method harness.
