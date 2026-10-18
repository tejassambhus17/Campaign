# Campaign Android file-render lifecycle correction

This is a local, reviewed patch to the MIT-licensed `expo-print` **55.0.19** Android implementation. It is not an upstream Expo release. `upstream/` contains the original npm source bytes; `patch.json` pins the original and replacement SHA-256 for each file. The adjacent unified diffs show the change, and `LICENSE-MIT.txt` retains the upstream license. The APK already includes that same Expo MIT license through the existing license-copy plugin.

The change addresses a repeat PDF-export hang observed after successful exports and Chromium renderer-exit messages. Those observations establish a reliability defect, not a proven cause of memory exhaustion.

## Scope and ownership

Only the HTML-to-file path receives the new lifecycle. It waits for actual layout completion before writing, serializes callback work and resource cleanup on Android's Main thread, and settles once. Layout/write failure or cancellation, main-frame load failure, renderer loss, and a 45-second watchdog produce a retryable error. Terminal cleanup closes the file descriptor, finishes the adapter, removes and destroys only this task's WebView, clears references, and deletes only this invocation's unsuccessful output. Success retains its PDF.

Cleanup detaches the task-capturing WebView client by replacing it with a plain client before destruction. SDK 36 requires a non-null client; assigning null is invalid. An additional full-task compile test uses the actual Android 36 SDK and includes a disposable null-assignment negative control, alongside the behavioral boundary tests.

The coroutine wrapper owns output created before the task starts. It also deletes output when cancellation wins after resume but before delivery, and handles URI/base64 conversion errors. An atomic callback gate ignores duplicate and late terminal callbacks without deleting a successfully delivered PDF. Cancellation requests task cleanup on Main. These rules do not change the generic `PrintManager` adapter handoff; its adapter and WebView remain usable by the system printer.

Android documents that a WebView affected by renderer loss cannot be reused and that applications must clean up the specific view passed to the callback: [WebViewClient.onRenderProcessGone](https://developer.android.com/reference/android/webkit/WebViewClient#onRenderProcessGone(android.webkit.WebView,%20android.webkit.RenderProcessGoneDetail)). File writes wait for [LayoutResultCallback.onLayoutFinished](https://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback). API 24–25 lack the renderer-loss callback; the same timeout still bounds file rendering.

## Reproducibility and verification

`npm ci`/`npm install` runs `plugins/campaignPrintPatch.cjs` from `postinstall`. Android CNG invokes the same guard through `withCampaignPdfRendering.cjs`, and every local Android build checks it again before compiling. The guard validates both source files before either write. It accepts only this pinned package version and exact upstream or reviewed replacement bytes, remains idempotent, and refuses linked or out-of-project dependency sources. Unknown dependency versions or bytes fail closed; an upgrade requires an explicit source review and new tests rather than a best-effort replacement.

Android's `expo.autolinking.android.buildFromSource` in `package.json` explicitly lists `expo-modules-core` and `expo-print`. The patch guard refuses its prebuilt fallback. Expo's [documented source-build option](https://docs.expo.dev/guides/prebuilt-expo-modules/) is necessary because a source edit does not modify a precompiled AAR. The first code6 candidate was rejected by actual DEX inspection when it still resolved the original print AAR; that APK was never installed. Final package acceptance checks the compiled watchdog, cleanup, renderer callback and coroutine ownership methods, alongside the existing Activity-results fix.

Focused tests execute the complete replacement renderer and the exact changed module methods with deterministic Android boundary doubles and real Kotlin coroutines. They cover worker-thread callbacks, cancellation races, duplicate terminal events, watchdogs, cleanup exceptions and generic-print handoff. JVM boundary tests do not establish actual Android WebView rendering, share-sheet behavior, or repeat-export acceptance. Those require the installed signed APK's separate native evidence.

There are no report HTML, JavaScript, backend, storage-service, credential, or business-rule changes in this patch.
