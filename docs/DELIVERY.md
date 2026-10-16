# Delivery and Android release

## Active reference replacement

The latest candidate is the targeted product-quality pass, preserving Light and pure-black Dark. Corrected APKs are under `artifacts/android/quality-addendum-pass2-20261016/`; [release readiness](../RELEASE_READINESS.md) identifies their exact hashes and installed evidence. Cloud setup and a judge-reachable backend remain deferred; the emulator API default is not an external release arrangement. Functional QA screenshots do not constitute a new demo film.

The latest candidate is the targeted product-quality pass, preserving Light and pure-black Dark. Corrected APKs are under `artifacts/android/quality-addendum-pass2-20261016/`; [release readiness](../RELEASE_READINESS.md) identifies their exact hashes and installed evidence. Cloud setup and a judge-reachable backend remain deferred; the emulator API default is not an external release arrangement. Functional QA screenshots do not constitute a new demo film.

**USER HOLD — recording and demo production stopped.** Further application
changes are forthcoming. Partial footage and the saved Story draft are preserved;
the replacement film is incomplete. Resume production only on explicit human
authorization. Black-pass2 x86_64 and ARM64 APKs exist, with scoped installed x86
checks and uninstalled ARM64. These are checkpoint snapshots before forthcoming
changes. See [PROGRESS.md](../PROGRESS.md) and
[RELEASE_READINESS.md](../RELEASE_READINESS.md). Earlier artifact tables and video
acceptance below retain their historical scope. No external submission occurred.

## Historical delivery preparation

Updated October 16, 2026. Workspace: `E:\Campaign`. Working target: Monday, October 19. User-reported organizer maximum: Tuesday, October 20 at 11:59 AM; timezone and current Telegram confirmation remain unverified. Asia/Calcutta is the planning timezone, not a confirmed organizer cutoff timezone.

This is a delivery checklist with separate current INTERNAL-TEST and historical debug evidence. Original product/submission source: [Hackathon_Requirements.pdf](../Hackathon_Requirements.pdf), pp. 23-24. Requirement evidence is maintained in [REQUIREMENTS.md](../REQUIREMENTS.md).

The authorized local delivery now includes embedded-JavaScript INTERNAL-TEST APKs and a complete native demo. Cloud accounts and hosting remain deferred. Current evidence is maintained in [RELEASE_READINESS.md](../RELEASE_READINESS.md) and [DEMO_CHECKLIST.md](../DEMO_CHECKLIST.md); historical debug/toolchain results retain their original scope. The Android Debug certificate is disclosed; production signing is not claimed. Organizer backend reachability and external submission remain separate delivery work.

## Required artifacts and current state

| Deliverable | Current state | Evidence needed |
| --- | --- | --- |
| Android APK | Final local INTERNAL-TEST x86_64/ARM64 built, embedded assets/signatures inspected and actual hashes rechecked; previous debug APKs preserved | Exact accepted artifact, connectivity arrangement and clearly disclosed internal signing |
| Installed Android verification | Final x86_64 Metro-off launch, connection controls, offline save/recovery, compact/font-scale checks and complete UI-created campaign-to-report capture pass on Android 16/API 36 | Physical ARM64 and broader accessibility checks remain unverified; historical branch tests keep their own build scope |
| Full demo video | VERIFIED local 22-scene [MP4](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4): full decode, continuous muted playback and independent bounded frame review pass | Human listening and every-frame privacy inspection are unverified; external submission unperformed |
| iOS TestFlight | NOT STARTED; conditional | Final-stage request/feasibility and actual build/access if applicable |
| Architecture explanation | Documented in [README](../README.md), [API contract](../services/api/README.md) and [demo talking points](DEMO.md) | Live presentation/Q&A not performed |
| Telegram submission | NOT STARTED | Actual submission outcome; preparation is not submission |

PDF destination: <https://t.me/+brkDpS8rYfBjNzll>. Source code submission is not required. Sending messages/files externally is a separate action; no submission has occurred.

## Complete local demo

[campaign-native-demo-INTERNAL-TEST.mp4](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) is **580.121354 seconds (9:40)**, 28,581,318 bytes, H.264 720×1520 / AAC 48kHz mono. SHA-256: `63D6DAA6823BCEC6E1F8E166977C0880E043BDD5A2A57612EBC30D57730F1358`.

[Metadata](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4.json), [proof](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.proof.json), [chapters](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.chapters.txt), [native actions](../artifacts/demo/NATIVE_RESULTS.md), [continuous playback](../artifacts/demo/PLAYBACK_RESULTS.json) and [independent review](../artifacts/demo/VIDEO_REVIEW.md) bind this exact hash. The stable file is byte-identical to the reviewed timestamped assembly. Generic offline narration is timed to the actual creation, checkout and distribution actions; encoded audio measures -16.28 LUFS / -1.74dBTP, below clipping.

**Share the final MP4 and intended INTERNAL-TEST APKs only.** Raw captures, private navigation intervals, credentials, logs and helper directories stay local. Human listening/pronunciation, every-frame privacy, physical ARM64-device acceptance, public hosting and external submission remain unverified.

## Current local internal candidates

| Target | Artifact / metadata | Bytes / SHA-256 | Acceptance boundary |
| --- | --- | --- | --- |
| x86_64 | [APK](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk), [JSON](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk.json) | 38,414,397; `638807B4095BB537574E719A5EB537E428735C3100BAE683F54BE92B5B4C6EA4` | Exact installed [Metro-off checks](../artifacts/android/internal-acceptance/final-build/NATIVE_RESULTS.md) and [complete native capture](../artifacts/demo/NATIVE_RESULTS.md) pass in their stated scopes |
| ARM64 | [APK](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk), [JSON](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk.json) | 37,126,539; `4B7ACD6F0D7EFA4F7C43E81C427CBA3EB932805BA257243172832774F537B94C` | Compiled/inspected, not installed on a physical phone |

Both use Android Debug signing on a non-debuggable release variant; embedded Hermes, six fonts and full OFL licenses are verified. They share the final frozen inputs and compiled emulator API default `http://10.0.2.2:8787`. A physical phone requires a reachable LAN/hosted backend, selected in the compiled internal connection settings or configured during a new build. No public backend or production release is claimed. The earlier B15 internal build is archived with its own evidence, not relabelled.

Metro stayed off throughout recording. After no-retake confirmation, normal sign-out, guest privacy checks and [owned AVD/dedicated ADB shutdown](../artifacts/demo/cleanup/README.md) completed. The API remains healthy and the local web preview was restored by its owner. See [release readiness](../RELEASE_READINESS.md) for current runtime details.

## Historical toolchain evidence

Initial read-only checks on October 15, before the project-local toolchain was installed:

- Project manifest selects Expo SDK 55, React Native and TypeScript, with Expo Router entry.
- Default system Node 20.9.0 is below the selected SDK's supported floor; a bundled Node 24.21.0 was identified by the main implementation agent. Use the compatible runtime when executing project tools.
- Java reports 21.0.2. `adb` is available at `C:\Android\adb.exe`.
- `adb devices -l` returned no attached devices. At that point, no Android app installation or device test had occurred.
- `sdkmanager` and `gradle` were not found on PATH. The inspected `C:\Android` directory contains platform-tools-style binaries and metadata; its `build-tools`, `platforms`, `cmdline-tools/latest/bin/sdkmanager.bat` and `emulator/emulator.exe` paths were absent. The standard user-profile SDK path could not be checked because access was denied. A full SDK is therefore unconfirmed; no unrelated projects were searched.
- Later local setup installed an isolated SDK/JDK17 under `tools/android-sdk` and Gradle caches under `tmp/android-build`. ARM64 and x86_64 native compilation succeeded; official emulator WHPX acceleration and targeted installed Android 16/API 36 checks passed. The owned AVD/dedicated ADB were stopped after QA, preserving API/Metro. These project-local tools do not change the earlier system/PATH findings. See [ANDROID_LOCAL.md](ANDROID_LOCAL.md) for actual artifacts, checksums and reproduction commands.
- EAS reports signed out. No Expo/cloud account, project linkage, signing or successful cloud build was configured. External hosting/release setup remains deferred by the user; no cloud resource was created.

An Android JavaScript export does not produce an APK. A web browser walkthrough does not verify Android installation or native interactions.

## Existing local commands

Run from `E:\Campaign`. The launcher starts or reuses the verified Campaign API on port 8787 and Expo preview on 8081; owned process logs are under `tmp/run`:

```powershell
.\start-local.cmd
```

The mobile wrapper resolves the compatible Node runtime, avoiding the old runtime hardcoded by the system npm launcher. Use the per-process invocation below: direct `.ps1` execution was blocked by this machine's script policy. This does not change global execution policy. Execution status is recorded separately in progress/evidence.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 typecheck
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 test
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 lint
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 export:web
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 export:android
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 start
```

`export:android` only checks/bundles Android JavaScript. `start` opens the Expo development server. Neither command is an APK build. The wrapper can be pointed at a supported executable with `CAMPAIGN_NODE`.

The actual backend entry point, pinned dependency manifest and test module now exist. From `E:\Campaign\services\api`, after the project-local virtual environment/dependencies have been installed:

```powershell
.venv\Scripts\python.exe run.py
.venv\Scripts\python.exe -m unittest -v test_api
```

The root API wrapper also exists:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api.ps1 run
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api.ps1 test
```

See [the API README](../services/api/README.md) for setup, API contracts, demo policies and precise support boundaries. `run.py` now defaults to **8787**; `CAMPAIGN_PORT` can override it. Browser rehearsals used this API and frontend **8081**. Verify the app and server agree after overrides. Local rehearsal does not establish a publicly reachable release backend or phone connectivity.

Latest checks: backend 30 tests pass; frontend 34 tests pass; TypeScript/ESLint pass; Expo doctor 20/20; web export 1.4 MB and Android Hermes export 3.2 MB pass. ARM64/x86_64 native debug compilation and scoped Android API 36 emulator checks are separately recorded in [ANDROID_LOCAL.md](ANDROID_LOCAL.md). Full scopes/history are in REQUIREMENTS.md. These do not establish full installed standalone-release acceptance.

## Saved browser evidence

Independent QA created and reviewed fictional campaigns through the actual UI, including correction/resubmission, rejection, private material revision, explicit setup reconfirmation and completion. A peer separately checked guest offline draft recovery and visible network errors. See E-WEB1-5 in the requirements matrix for limits.

These screenshots are inspected **1536 x 639 desktop browser** captures saved directly from CUA screenshot bytes. They are supplementary evidence, not a recorded demo or native Android verification:

- [Rejected campaign and disabled backing](../artifacts/qa/rejected-campaign.jpg).
- [Final report overview](../artifacts/qa/final-report-overview.jpg).
- [Labelled simulated report metrics](../artifacts/qa/final-report-metrics.jpg).

## Historical verified debug artifacts

| Field | Actual local evidence |
| --- | --- |
| ARM64 APK | [campaign-1.0.0-debug-arm64.apk](../artifacts/android/campaign-1.0.0-debug-arm64.apk), 51,135,312 bytes; physical installation unverified |
| x86_64 APK | [campaign-1.0.0-debug-x86_64.apk](../artifacts/android/campaign-1.0.0-debug-x86_64.apk), 51,718,658 bytes; installed and launched |
| Identity | Campaign 1.0.0; com.campaignamplification.mobile; SDK 36; debug certificate; Metro required |
| Checksums/build results | Successful Gradle builds and independently rechecked SHA-256 values in [ANDROID_LOCAL.md](ANDROID_LOCAL.md) and adjacent artifact metadata |
| Native environment | Android 16/API 36 Google APIs x86_64, Pixel 4 AVD, 1080x2280/density 440; detail also checked at 360/411 logical widths |
| Native journey | Five tabs/images; keyboard/system Back; guest draft restart/resume; SecureStore session restart/scoping/logout; separate PNG Story/ad picker uploads; five-step preview/explicit goal/rules/submission; Profile Under Review; $5 simulated guest success/private receipt; share chooser/deep-link VIEW routing |
| Cleanup and limits | Owned emulator/ADB stopped, API/Metro healthy. No physical-device/screen-reader/native-review-branch/every-native-payment or standalone-release claim. Screenshots/log scope in Android guide |

## Standalone APK preparation gates

1. Inspect the final app configuration: human-facing name, unique Android package, app version, icon, splash and supported native modules. Keep implementation/build artifacts within the workspace.
2. Configure a reachable backend URL in the app's supported public API setting. The standalone phone cannot use the development computer's `localhost`. An emulator, physical device and public distribution may require different addresses. Verify the exact final URL from the installed APK.
3. The selected local InternalTest workflow already produces APKs without an Expo account. If EAS is chosen later, confirm its profile explicitly produces APK/internal distribution; EAS account setup remains deferred.
4. Use the selected build/signing workflow and retain the result. EAS cloud builds require an Expo account; local builds require a complete compatible Android toolchain. Do not fabricate a successful job or artifact.
5. Download the actual APK into a project-owned artifacts directory. Record path, application version, package identifier, build job/link and checksum.
6. Attach a device or start a configured emulator. Install the produced APK, launch it and run the acceptance sequence below. Retain the actual device/OS and results.
7. Record the complete demo from the delivered version, verify playback and keep known limitations visible.
8. Verify artifact/link access and record the actual external submission only when performed.

Official build guidance reviewed October 15, 2026: [Expo APK profiles and installation](https://docs.expo.dev/build-reference/apk/), [EAS prerequisites and setup](https://docs.expo.dev/build/setup/). These explain configuration, not this project's build result.

## Final standalone installed-build acceptance

Repeat this sequence against the final delivered standalone APK and its intended backend. Local debug evidence above covers only its stated scope:

- Guest launch; five tabs and predictable back; search/category/filter/sort; images and public sources.
- Creation entry/manual and labelled assistance fallback; all five steps; keyboard and scroll behavior; validation; media files; full preview; explicit goal at Submit.
- Backward navigation, autosave, explicit save, exit/reopen/resume and recovery from failed save/network requests.
- Restricted review approve/request changes/reject; review feedback/resubmission; no guest/creator privilege bypass.
- Published discovery eligibility; amount/fees/reach calculation; each simulated payment outcome; private receipt; synchronized funding/history.
- Creator status filters and moderation feedback; saved/followed/backed lists; relevant Activity events/preferences.
- Separate funding completion, distribution preparation, promotion and completion; guarded prerequisites; final labelled demo report.
- No critical crashes; readable contrast/targets; small and larger screens; sticky controls and keyboard do not cover content; useful loading/empty/error/pending states.

## Current local delivery evidence record

| Field | Result |
| --- | --- |
| APK path / download link | Local INTERNAL-TEST candidates linked above; no public download/hosting arrangement yet |
| Build job / result | Local Gradle release-variant builds and package verification pass; no cloud build used |
| App version / Android package | Campaign 1.0.0 / com.campaignamplification.mobile |
| APK SHA-256 | Current candidate hashes rechecked and listed above; bind final video to its actual artifact |
| Device / Android version | Owned Campaign_API_36 x86_64, Android 16/API 36; physical ARM64 unverified |
| Install / launch / journey | Final x86_64 Metro-off cold launch/offline/recovery and complete native creation-to-report capture pass in their documented scopes |
| Intended backend / connectivity | Separate local API 8787 via emulator 10.0.2.2; public/physical-device connectivity not established |
| Demo video path / playback | Final MP4 linked above; full decode and uninterrupted muted Chrome playback reach ended=true/error=null; bounded frame review clean |
| Remaining boundaries | Human listening/every-frame privacy unverified; physical ARM64, public backend/hosting and external submission unperformed; see REQUIREMENTS.md for exact scope |
| TestFlight condition / outcome | PENDING |
| Actual Telegram submission | NOT PERFORMED |

This record distinguishes local internal acceptance from organizer-accessible delivery. It does not erase historical debug evidence or imply production signing, public hosting or submission.
