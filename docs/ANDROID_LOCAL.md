# Local Android build and verification

## October17 live CloudTest result

The verified Render Free API is `https://campaign-api-cw8y.onrender.com`.
The original five-step/review/contribution/media API flow and same-record
restart persistence passed independently of Android; see the
[cloud runbook](CLOUD_DEPLOYMENT.md). Build a separate ARM64 CloudTest package
with `-Mode CloudTest -ApiUrl 'https://campaign-api-cw8y.onrender.com'` and a
new `-ArtifactTag`. The actual `cloud-render-20261017` ARM64 build succeeded;
the authorized phone accepted `install -r` and its base.apk hash matches the
artifact. The packaged Hermes URL, HTTPS-only manifest, no-Metro launch and
hosted phone workflow are recorded in the
[physical report](../PHYSICAL_ANDROID_TEST.md). The Debug certificate and
package match the prior local build. Use only authorized serial
`tkkrlvqklzydbuh6` with ADB port 5039; do not target the emulator in the
device list. Metro-off and no-USB-reverse connectivity passed; cable-unplugged
and laptop-off acceptance remain open. The older pending statements below are
historical checkpoints.

## CloudTest preparation

`scripts/android-local.ps1 -Mode CloudTest -ApiUrl <actual-public-HTTPS> -ArtifactTag <new-tag>`
uses embedded Hermes, the existing package and Debug certificate/INTERNAL-TEST
label. It rejects local/non-HTTPS URLs, disables cleartext/connection editing and
isolates cloud sessions/drafts. See [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md).
No cloud APK was built: verified public HTTPS/account access is pending. Preserve
data/fallback and never present older USB-local tests as disconnected acceptance.

## Current premium pass12 — VERIFIED within recorded local scope

**Current premium pass12 — VERIFIED within the recorded local scope:** [Fresh source gates](../artifacts/premium-quality/pass12/SOURCE_CHECKS.json) pass **91/91 in 1044.901ms**, TypeScript/full-source ESLint/diff/public Expo config. [Strict inspection](../artifacts/premium-quality/pass12/BUILD_INSPECTION.json) binds **86 inputs / 45 compiled modules / six artworks / 15 native branding resources** to the **48,623,759-byte APK**, SHA `DF4C95CB9F6555DE6E5637DCF18989B7E41042E0D978F7F908EFA0697FDAEDF9`. The installed package hash matches. [Actual Metro-off launch](../artifacts/premium-quality/pass12/METRO_OFF.json) is **COLD 1,418ms / wait 1,431ms**, with preserved data and a separately healthy USB-local API. [Independent finish review](../artifacts/premium-quality/FINISH_REVIEW.md) closes the opened Home/Auth/keyboard findings. Earlier matrices retain [their exact scopes](../artifacts/premium-quality/CANDIDATE_SCOPES.json); no whole-app final-hash rerun or human/production acceptance is inferred. Recording/external release stay held.

[Frozen source](../artifacts/premium-quality/pass12/SOURCE_INPUTS.json) digest: `6e92c273b2ca5ddea4a99119d7a8357b8cfab54d54bf365c9f31b5697cf47726`. [Final source verification](../artifacts/premium-quality/pass12/SOURCE_VERIFICATION.json) and strict inspection bind the same 86 mobile/13 backend inputs; original 25-page PDF SHA remains `6A5443253C33997A7361BA91BFF4C04DAF02743ADF23CB47F7E4F1C3789E3290`.

Android Auth keeps the guest Screen’s extra height avoidance disabled and measures only native IME overlap at the stable AuthBackdrop outer view. The bottom inset is the maximum of safe-area padding and actual overlap; an already-resized window adds no duplicate height. Frame revisions and focus/active guards reject stale async measurements, hide/blur clears overlap and layout changes remeasure. Android drags/taps keep the keyboard open while the form scrolls; Help explicitly dismisses it and restores the usual Screen avoidance for Help fields. iOS keeps its existing behavior. Actual pass12 screenshots/AUTH_FUNCTIONAL.json verify focused fields and complete primary actions with IME, including compact Login/Register in both themes.

The unchanged 13-input backend digest `622e55ee66c0872fb4a6e0a7d1f48b873e9ad0dd145fc6693b4a3d2eaa8bdecf` retains this task’s [35/35 isolated tests in 14.300s](../artifacts/premium-quality/pass1/BACKEND_CHECKS.json). Unchanged dependencies retain pass1 online Expo/Doctor 20/20 evidence; the later offline dependency check warns its validation is unreliable. No unnecessary API/online-metadata rerun, dependency, migration or build-command change is claimed. Binary inspection verifies Hermes, real USB-local API assignment, ARM64-only, Debug-v2/non-debuggable, assets/fonts/licenses and pre-build freezes; it does not establish installed behavior.

[Candidate scopes](../artifacts/premium-quality/CANDIDATE_SCOPES.json) retain every freeze, exact diff, build and physical matrix under its own hash. Pass1 covers creation; pass2 connected discovery/backing/Activity/report workflows; pass6 closes Home/compact Stats; pass7 proves optional Remember restart; pass9 captures the transparent-brand Auth composition; pass10 proves actual registration/isolation/restart; pass11 retains System/form checks. Pass3 was built but neither installed nor strictly inspected; pass5 built/inspected but never installed; pass8 was superseded unbuilt. Nine Create files remain source-identical from pass1, Home/Spotlight/Stats/Explore from pass6 and Session/writer from pass7, while later Screen/Auth/Profile keyboard changes are explicitly listed. This is source binding and bounded native evidence, not a wholesale final-hash rerun.

[Pass12 native actions](../artifacts/premium-quality/pass12/AUTH_FUNCTIONAL.json) verify full Login/Register buttons while the IME remains open in all four compact Light/Dark combinations, plus normal Dark Login; measured targets are 49.82–50.18dp. The native Register button surfaces invalid-email feedback. Guest browsing opens the five-tab public app and hides private notifications. Unchecked login returns to guest after process restart; checked login restores the original account/photo and 10/3/1 private counts. Inline mode links, hardware/header Back, Help/form preservation and saved draft-library access work. The held Ocean awareness preview QA draft was viewed without editing/submission. System preference and account restore through restart; Dark/original display are restored afterward. Exact captures 00–33 remain under pass12, with registration/isolation and live System follow-up also retaining their earlier pass10/11 scopes.

[Final diagnostics](../artifacts/premium-quality/pass12/FINAL_DIAGNOSTICS.json) record 46 current-PID log lines with no matching fatal/JS error markers and confirm the installed APK hash. Package-specific exit/memory/frame captures remain bounded observations, not crash-free or sustained-performance guarantees. Original 1080×2400/density 440/font 1.17/IME 1/night mode and animation 0.5 values are restored. [Service restoration](../artifacts/premium-quality/pass12/SERVICES_RESTORED.json) confirms the same Campaign API healthy and owned Metro 8081 running again, with only the selected phone’s USB 8787 reverse; an initial bounded health timeout resolved without duplicate restart. No unrelated device/service or recording action is implied.

The final review is bounded to actual opened captures and recorded interactions. Compact submission confirmation remains explicitly unverified. Human/TalkBack, additional hardware/orientations, fresh-install default behavior and sustained smoothness remain separate; preserved existing Light/System preferences are verified without clearing user data. Password recovery is truthfully unavailable locally. Production signing/hosting, current Telegram cutoff confirmation, the held video and external submission remain open or held. USB-local backend reachability is not hosted availability; no score or fictional engine verdict is used.

Use only the explicitly authorized physical POCO and compatible `install -r` updates without data reset. Root owns its project-local ADB/device/services. The embedded API is `http://127.0.0.1:8787` through that phone’s existing scoped USB reverse; keep the separate Campaign backend running. Do not use 10.0.2.2, an emulator substitute, unrelated ADB sessions or external hosting. The build/SDK/USB commands below remain unchanged.

## Historical quick notifications INTERNAL-TEST artifact — VERIFIED within recorded local scope

[Final notification pass5 ARM64 APK](../artifacts/android/notifications-pass5-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk) is installed without data reset on the authorized POCO Android 15/ARM64. Size **45,050,500 bytes**; SHA-256 `430E65719BA17029B8C62B9AE4D6707D1EB502E9336A0B5B27738468322BDEB3`. [Source verification](../artifacts/notification-center/pass5/SOURCE_VERIFICATION.json): 78 inputs, digest `4ce5ef5d69ec022ec40ffe5e4eb29ea0af3e8ee02cd51d05a06fd8dff1d06535`, 81/81 tests in 898.5777ms, TS/ESLint/diff 0. [Independent inspection](../artifacts/notification-center/pass5/BUILD_INSPECTION.json) passes 40 exact compiled modules, assets/fonts/licenses, embedded Hermes, ARM64, Debug signing and actual `http://127.0.0.1:8787` initialization. Backend 13-input digest remains unchanged; [35/35 tests in 13.391s](../artifacts/notification-center/checks/backend.log) are saved from this task's isolated run.

[Exact final launch](../artifacts/notification-center/pass5/METRO_OFF.json): compatible update without reset, COLD **1,189ms/wait 1,211ms**, Metro 8081 absent, API 8787 healthy and selected-phone USB 8787. The API remains a separate process reached through USB; no LAN/hosting or fresh-install claim follows.

The bounded phone matrix includes pass2 read sync 22→21→20, receipt/View all/filter/preferences and compact Light; pass3 real partial mark-all failure 19→16→0, compact Dark and guest/B privacy; final pass5 content-sized one-event/error at 360dp/font 1.3, actual singular read failure/retry, Light/Dark five-event scrolling, A recovery and Activity. [Final interactions](../artifacts/notification-center/pass5/FINAL_INTERACTIONS.json) verify Close/swipe/short-drag/Back/backdrop/reopen, clean contextual navigation, Home position, reduced-motion setting/restoration and checked 48dp controls. [Independent review](../artifacts/notification-center/FINISH_REVIEW.md) closes the historical swipe, verbose error and oversized short-feed findings. Earlier matrices were not repeated wholesale on each final hash.

[Diagnostics](../artifacts/notification-center/pass5/FINAL_DIAGNOSTICS.json): 208 current-PID lines/no matching fatal, mixed 243/3,904 janky 6.22%, p95 17ms/p99 65ms; limited samples do not guarantee stability/sustained smoothness. [Services/settings restored](../artifacts/notification-center/pass5/SERVICES_RESTORED.json): preview running, API healthy, selected USB 8787; original 1080×2400/density 440/font 1.17/keyboard 1/transition 0.5; final Dark Home, ordinary fictional A and one genuine new-sign-in unread.

The existing scoped USB/build workflow below is unchanged; no new native dependency/backend endpoint was required. [Physical report](../PHYSICAL_ANDROID_TEST.md), [release gates](../RELEASE_READINESS.md) and [native results](../artifacts/notification-center/NATIVE_RESULTS.md) retain exact limits. Recording, hosting/accounts and production signing stay held/deferred. TalkBack/human, wider devices/orientations and sustained performance remain open. Earlier Create/Showcase artifacts below are historical.

## Historical Create and profile-photo INTERNAL-TEST artifact

[Final Create pass6 ARM64 APK](../artifacts/android/create-polish-pass6-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk) is update-installed without data reset on the authorized physical POCO Android 15/ARM64. Size **45,035,820 bytes**; SHA-256 `383F23C2945B052AE4E8DA6482632AADF0146DB08D3702D4959C180322D69184`. [Source verification](../artifacts/create-polish/pass6/SOURCE_VERIFICATION.json): 72 inputs, digest `aaf7b4df0713749a7ff5c7ea0997ce7f05760e49ed53f592f1e3992283436a4b`, zero drift, TypeScript/ESLint 0 and 64/64 frontend tests (898.9374ms). [Binary inspection](../artifacts/create-polish/pass6/BUILD_INSPECTION.json) binds 36 compiled modules, five images/fonts/licenses, embedded Hermes, ARM64, Debug signing and the actual `http://127.0.0.1:8787` assignment. Unchanged backend 35/35 remains separately observed tool output, with no saved final backend log or pass6 rerun claimed.

[Exact final launch](../artifacts/create-polish/pass6/METRO_OFF.json) records **COLD 1,483ms/wait 1,490ms**, Metro 8081 absent, API 8787 healthy and only the authorized phone's USB 8787 mapping. Pass3/pass5 editor/photo workflows retain their candidate scopes. Pass5's valid 13.25 submission exposed a nonexistent View Campaign route; pass6 fixes the shared detailPath, resumes a separate 2.50 QA draft, submits and opens its actual Under Review/closed-backing detail. [Physical results](../PHYSICAL_ANDROID_TEST.md) and [independent review](../artifacts/create-polish/FINISH_REVIEW.md) document the bounded acceptance and retained minor visual differences.

[Final diagnostics](../artifacts/create-polish/pass6/FINAL_DIAGNOSTICS.json) have two log lines/vendor observer warning, no fatal match and package exits from updates/intentional stops. Mixed jank 2.88% and separate eight-tab 6.79% are bounded samples, not controlled comparisons or sustained benchmarks. [Services restored](../artifacts/create-polish/pass6/SERVICES_RESTORED.json): Campaign packager running, API healthy; phone font 1.17, 1080×2400,density 440,keyboard 1 restored/retained and final Dark Create entry. No recording or unrelated ADB/device/service changes.

The backend remains separate and USB-local; the existing connection commands below remain applicable. Debug signing is not production release, and human/TalkBack/wider-device/performance acceptance is open. Recording and external account/hosting setup remain held. Pass5 `269AD255…907B85` and older Showcase/quality artifacts below retain historical scopes.

**Historical Showcase physical test — VERIFIED within recorded scope:** final pass5 ARM64 `6D3598B3…5ECC2` is update-installed on the authorized POCO Android15 phone. Independent source/binary/API assignment and exact Metro-off/API launch pass; [native results](../artifacts/showcase-redesign/NATIVE_RESULTS.md) retain pass3/pass4 workflow and pass5 focused follow-up scopes. [Physical report](../PHYSICAL_ANDROID_TEST.md) records completed bounded checks plus performance/accessibility limits. No emulator substitutes for the phone; no whole-device/human/smoothness approval is claimed.

For this USB-only local test, the existing in-app Demo connection settings use `http://127.0.0.1:8787`, supported by a reverse of `tcp:8787` to the host's `tcp:8787` on the selected authorized phone only. No Metro reverse is added. This is a reachable phone address through USB; the host API must remain running and the USB mapping must be restored after disconnect/reboot. It is separate from LAN/hosting and does not provide a judge-reachable backend. Never use `10.0.2.2` on the phone. Existing ADB servers/devices must not be stopped to add this mapping.

To restore this test's USB connection, first identify the same authorized physical serial on the existing Campaign ADB server. Select it explicitly in every command; do not rely on a default device or operate another connected device. Then run from `E:\Campaign`:

```powershell
& .\tools\android-sdk\platform-tools\adb.exe -P 5039 -s '<authorized-serial>' reverse --no-rebind tcp:8787 tcp:8787
```

Use **Profile → Help & Support → Demo connection settings** to save `http://127.0.0.1:8787` if needed. Switching the saved backend intentionally signs out, so do this before testing signed-in flows. The installed INTERNAL-TEST APK supplies its own JavaScript; USB reverse on port 8787 supplies only access to the existing API. Do not add a port 8081 reverse to demonstrate Metro independence.

POCO initially allowed installation/screenshots but rejected touch injection with `INJECT_EVENTS`. The user enabled the separate debugging security setting and restarted the phone; actual low uptime and successful UI taps verified recovery. No security setting was bypassed or changed programmatically. Exact phone/model/ABI/display/setting baselines and artifact binding are in the physical report.

**Previous quality-pass note:** The later October 16 Product Quality Addendum changes source within the existing Light/black Dark design. Earlier pass2 APKs and installed checks below are historical checkpoint evidence. Use [PROGRESS.md](../PROGRESS.md) and [RELEASE_READINESS.md](../RELEASE_READINESS.md) for current tagged artifacts and exact performed tests. Demo recording and production remain held until explicit human authorization.

The local toolchain is isolated to `E:\Campaign`. It uses no Expo/EAS account, external hosting, paid services, global SDK installation, or production signing credentials.

**Previous October 16 reference iteration:** the compact mint-and-charcoal reference redesign replaces the rejected civic-publication visual result, adding device-persisted System/Light/Dark appearance through one semantic provider. Expo system UI/navigation bar and automatic/dark splash configuration are generated with CNG; native files are not hand-edited. Source and fresh acceptance are recorded in [UI_REDESIGN_PROGRESS.md](../UI_REDESIGN_PROGRESS.md) and [RELEASE_READINESS.md](../RELEASE_READINESS.md). Old APK, video and stopped-emulator records below retain historical scope and do not accept the replacement UI.

**Historical black-pass2 checkpoint:** the user's correction preserved Light and rejected green-tinted Dark surfaces. That source used pure black `#000000` background, neutral `#121212` surfaces, `#1C1C1C` raised surfaces, `#151515` header and `#1E1E1E` contextual containers, with restrained mint accents/actions; these are that checkpoint's palette values. Current Showcase tokens are recorded in DESIGN.md. Its 50/50 frontend, TypeScript/lint/exports, backend 30/30, online Expo compatibility and Doctor 20/20 checks retain that snapshot's scope. Green-Dark captures remain rejected visual evidence. The [independent finish review](../artifacts/reference-redesign/FINISH_REVIEW.md) returned `ship` only for its 12 supplied core phone surfaces; it does not approve the later quality pass.

## Historical Showcase INTERNAL-TEST artifact and build correction

Final [pass5 ARM64 APK](../artifacts/android/showcase-pass5-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk): **41,742,348 bytes**, SHA-256 `6D3598B3EA23CCA610CE98D161DA4EC0C4854F56F3B0672D62D4CEFDCE35ECC2`. [Independent inspection](../artifacts/showcase-redesign/pass5/BUILD_INSPECTION.json) verifies 59 inputs with digest `eff7a76aae7fdcbaa7f5612e0911ef08e6100b70b6c1ff0266486525eff454c1`, zero drift, 34 compiled modules, all images/fonts/licenses, ARM64-only ABI, embedded Hermes and Android Debug signing. This is a non-debuggable INTERNAL-TEST release variant, not production signing.

Pass3 retained an incorrect emulator API despite the intended phone build argument. Expo's CI export suppresses cache reset; the wrapper now gives each build attempt a fresh project-local TEMP/TMP under `tmp/android-build/metro-<artifact-tag>/<unique-id>`, restores process variables and keeps CI enabled. No global/shared cache is deleted. Pass4 and final pass5 actually execute bundling; raw Hermes module instructions verify the default `http://127.0.0.1:8787`, with no old 10.0.2.2. Metadata or string presence alone is insufficient. [Failed pass3 inspection](../artifacts/showcase-redesign/pass3/BUILD_INSPECTION.json) remains historical.

Final compatible update preserves app data. [Exact pass5 proof](../artifacts/showcase-redesign/pass5/METRO_OFF.json) records cold 1,344ms/wait 1,355ms with Metro 8081 unavailable, API 8787 healthy and selected-phone USB reverse 8787. Preserved saved address agrees with baked default; this is not a data-reset/fresh-account test. [Restoration record](../artifacts/showcase-redesign/pass5/SERVICES_RESTORED.json) confirms Campaign packager running and API healthy afterward. The API remains separate and USB is required; no LAN/organizer hosting is established.

[Native results](../artifacts/showcase-redesign/NATIVE_RESULTS.md) and [reference review](../artifacts/showcase-redesign/FINISH_REVIEW.md) record completed bounded verification. Pass5 changes only Preview.tsx's fixed white creative inside the themed frame; pass4 submission/payment/account workflows keep their original hash. Performance jank, TalkBack/human and broader-device acceptance remain open. Phone font 1.17/display/density/keyboard are preserved/restored and the app is left at Dark Home. No uninstall/data wipe, external account setup, global cache clear, recording, commit or push is part of this verification.

## Historical quality-pass INTERNAL-TEST artifacts

The targeted addendum preserves the existing design and architecture. Corrected artifacts are under `artifacts/android/quality-addendum-pass2-20261016/`:

| Target | APK | Bytes / SHA-256 |
| --- | --- | --- |
| x86_64 | [APK](../artifacts/android/quality-addendum-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-x86_64.apk) | 38,459,641; `4B9B6535F8A2B4F6DB6B42BE5151DCA19987288B6FABD6A1C9CB272E9478EACA` |
| ARM64 | [APK](../artifacts/android/quality-addendum-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk) | 37,171,783; `24348DD939CC174C0B5C72716E015CE5519DE78091E7BA5B7C4489836B6B096A` |

[Independent binary inspection](../artifacts/product-quality/pass2/BUILD_INSPECTION.json) passes both APKs: 54 frozen inputs match, both include byte-identical 2,039,780-byte Hermes, correct ABIs, exact fonts/licenses and valid Android Debug signatures. The API remains separately required at the emulator-only default `http://10.0.2.2:8787`. Final-source tests pass 62/62 plus TypeScript/lint/web and Android exports; unchanged backend tests pass 31/31. Exact installed checks are maintained in [release readiness](../RELEASE_READINESS.md); ARM64 was subsequently installed and exercised in the earlier physical checkpoint documented in PHYSICAL_ANDROID_TEST.md. Binary inspection does not establish runtime acceptance.

The corrected x86_64 is update-installed on the owned Android16/API36 emulator. [Focused native confirmation](../artifacts/product-quality/pass2/NATIVE_RESULTS.md) passes actual keyboard/full-footer checks in both themes at normal/enlarged text, enlarged private receipt values and exact Metro-off cold launch with Black/ordinary identity/drafts plus API content and the same Completed report. [Process proof](../artifacts/product-quality/pass2/metro-pause-proof.json) records absent8081 during that test, healthy API 8787 and subsequent preview/API restoration. These checks preserve first-candidate lifecycle evidence separately; no physical-device, whole-device-matrix or human acceptance is inferred. Recording remains held.

## Historical black-pass2 INTERNAL-TEST artifacts

Both final black pass2 APKs are under `artifacts/android/black-theme-pass2-20261016/`:

| Target | Artifact / metadata | Bytes / SHA-256 | Installed evidence |
| --- | --- | --- | --- |
| x86_64 | [APK](../artifacts/android/black-theme-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-x86_64.apk), [metadata](../artifacts/android/black-theme-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-x86_64.apk.json) | 38,437,869; `45F0D82B23CD9B6C3DAD56E029E56B7F3CAF3CD91F18CF4FC6A8DED7DE7AE187` | Installed on owned Android 16 / API 36 AVD; exact Metro-off/API-backed cold launch, saved Black and ordinary identity restore pass |
| ARM64 | [APK](../artifacts/android/black-theme-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk), [metadata](../artifacts/android/black-theme-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk.json) | 37,150,011; `CE69B6139356A578E1E4E9FC80EE01960B8E90F26C4BD7B000C5210DBB8DC166` | Uninstalled; no physical-device proof |

[Independent build inspection](../artifacts/reference-redesign/BUILD_INSPECTION.json) verifies byte-identical 2,018,008-byte Hermes, six exact fonts and both full licenses, intended ABIs/API, Android Debug signatures and all 50 frozen app inputs. Frozen digest: `31def764edeefb1d1d3a03cdecfadb9353e2ae5992b03fe0cbf8969d8376d543`. These are internal test release variants, not production-signed releases. The API default remains `http://10.0.2.2:8787`; the backend is a separately required service.

[Native results](../artifacts/reference-redesign/after-pass2/NATIVE_RESULTS.md) record all four targeted P1 corrections: Home identity/funding above the first fold at 393dp in both schemes; 360dp/font 1.3 detail funding and checkout action labels; and focused summary/cursor plus Back/Continue above actual Gboard. Selected 411dp/font 1.6 Submit/detail/checkout screens also pass. The ordinary-account Submit goal of $7.50 survived preview, theme flip, cold launch and Home Continue. Changing only the internal client address to unused port 8788 intentionally signed out and showed a retryable failure; the guest draft's $9.99 goal remained separate/offline and restoring port 8787 recovered API content. This is not a physical network-outage check. System followed actual Android night yes/no to Black/Light.

[Exact-build cold-launch proof](../artifacts/reference-redesign/after-pass2/cold-launch.json) records port 8081 absent, a healthy API on port 8787, restored Black/ordinary identity and rendered API photo/funding. Metro was restored afterward; other captures must not all be described as Metro-off. These selected checks do not verify every state, viewport or primary workflow. The new demo is incomplete and held at the user's request pending further changes. Do not resume recording/production or demo campaign mutations without explicit human authorization; uninterrupted Dark capture and final video review/playback remain unfinished. Previous video is historical. Physical ARM64, screen-reader/human/listening and external backend/signing/submission gates remain unverified or deferred as recorded in release readiness.

Build a distinct candidate without overwriting previous artifacts:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode InternalTest -Architecture x86_64 -ApiUrl http://10.0.2.2:8787 -ArtifactTag black-theme-next
```

The example tag must be replaced with an unused value for any further rebuild; do not overwrite accepted artifacts. `-ArtifactTag` accepts a short lowercase alphanumeric/hyphen name and writes `artifacts/android/<tag>/` plus a tagged Gradle log under `tmp/android-build`. The default untagged behavior remains available for existing workflows. The wrapper verifies bundle/fonts/licenses/signing at build time; actual installed Metro independence must be recorded separately while retaining API reachability. During parallel work, the designated native QA agent alone operates the owned Campaign AVD/ADB. The current source requires no further cosmetic correction within the reviewed scope.

## Historical INTERNAL-TEST artifacts

The first reference [mint pass1 APK](../artifacts/android/mint-theme-pass1-20261016/campaign-1.0.0-INTERNAL-TEST-x86_64.apk) and its [metadata](../artifacts/android/mint-theme-pass1-20261016/campaign-1.0.0-INTERNAL-TEST-x86_64.apk.json) remain preserved. Its scoped persistence/cold-launch evidence applies only to that build; the green-Dark visual result was rejected and all four demonstrated P1 layout issues were corrected in black pass2 above.

The prior two flat-path files were rehashed against adjacent metadata in the earlier iteration. They use the generated release variant with the **Android Debug certificate**, not production signing, and share a 1,993,336-byte embedded Hermes bundle, six exact fonts and both full OFL license texts. Their acceptance belongs to the previous visual direction.

| Target | Historical artifact | Bytes / SHA-256 | Historical installed evidence |
| --- | --- | --- | --- |
| x86_64 | [APK](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk), [metadata](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk.json) | 38,414,397; `638807B4095BB537574E719A5EB537E428735C3100BAE683F54BE92B5B4C6EA4` | Final Metro-off launch, internal connection controls, offline save/recovery and compact/font-scale checks pass on the owned AVD |
| ARM64 | [APK](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk), [metadata](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk.json) | 37,126,539; `4B7ACD6F0D7EFA4F7C43E81C427CBA3EB932805BA257243172832774F537B94C` | Physical-device install/launch unverified; emulator host alias is not a phone backend |

The prior [final native report](../artifacts/android/internal-acceptance/final-build/NATIVE_RESULTS.md) binds its checks to the historical x86_64 hash, not current source or every earlier screenshot. Compiled API default is `http://10.0.2.2:8787`, suitable for the owned emulator. A phone needs a reachable LAN/hosted API selected through the internal connection settings or a separately configured build. Embedded JavaScript does not supply a hosted backend.

The earlier internal x86_64 `B15ECFF1…` build and its evidence are preserved under [initial-build](../artifacts/android/internal-acceptance/initial-build). Its session/privacy/non-success-payment checks remain separately scoped. The historical [22-scene film](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) uses the previously accepted `638807B4…` artifact with Metro off throughout that capture. Prior [native capture](../artifacts/demo/NATIVE_RESULTS.md), [full muted playback](../artifacts/demo/PLAYBACK_RESULTS.json), [bounded frame review](../artifacts/demo/VIDEO_REVIEW.md) and [owned AVD/ADB cleanup](../artifacts/demo/cleanup/README.md) retain their stated former scopes. Consult current progress for active device/service state; none of these records verifies the replacement theme or UI.

For an internal rebuild, use the documented PowerShell invocation with `scripts/android-local.ps1 -Mode InternalTest -Architecture x86_64 -ApiUrl http://10.0.2.2:8787`, or the ARM64 equivalent. Follow RELEASE_READINESS.md for acceptance. The emulator launcher's `Install` action below installs the preserved **debug** APK and adds a Metro reverse; do not use it to accept the internal artifact.

The [demo checklist](../DEMO_CHECKLIST.md) and [film metadata](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4.json) record exact hashes, timing and limits. Human listening, every-frame privacy inspection, physical ARM64 use, public hosting and external submission remain unverified. Share only the final MP4 and intended APKs; raw captures and local helper/credential directories stay local.

## Rebuild a debug APK

From the project root in PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Architecture arm64-v8a
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Architecture x86_64
```

The first architecture targets common Android phones; the second targets the local emulator. To include both, use `-Architecture 'arm64-v8a,x86_64'`. Two Gradle workers are the default; `-Workers 1` reduces concurrency.

The launcher selects compatible Node (or process-only `CAMPAIGN_NODE`), sets SDK/JDK/Gradle variables only for its process and restores them afterward. Under a restricted shell identity, explicitly select the compatible Node 24 executable if automatic discovery cannot find it; this machine's system Node 20.9 is too old. Expo prebuild runs when native generation is absent or the build-mode configuration requires regeneration. Native files are generated; do not edit them by hand. Regenerate through Expo after changing native configuration or modules. Build output, logs, caches and the JVM temporary directory remain inside the project. Successful APKs and JSON metadata are copied into `artifacts/android` or its optional tagged subdirectory.

These are **debug development APKs**. They require Metro (`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\mobile.ps1 start`) and a reachable development API. The execution-policy override applies only to that PowerShell process. Android emulators use `http://10.0.2.2:8787`; physical phones need a reachable host address selected in the app's Demo connection settings. This does not replace the standalone release APK or its installation verification.

## Installed toolchain

| Component | Project-local version/location |
| --- | --- |
| Node | Compatible runtime selected by the launcher; verified Node 24.21.0 |
| Java | Temurin 17.0.20.1, `tools/android-sdk/jdk17` |
| Android SDK | API 36 revision 2, `tools/android-sdk/platforms/android-36` |
| Build tools | 36.0.0 |
| Android NDK | 27.1.12297006 (r27b) |
| CMake | 3.22.1 |
| Gradle | Generated wrapper pins 9.0.0; isolated cache `tmp/android-build/gradle` |
| Emulator | Official SDK emulator; WHPX acceleration check passed |

Toolchain packages were downloaded from official Android/Gradle/Adoptium sources. Android packages were installed with `sdkmanager --sdk_root=E:/Campaign/tools/android-sdk`. Standard SDK package licenses were accepted during the authorized local toolchain installation. On a fresh machine, install the versions above inside the same project paths before running the launcher; the script fails clearly when components are missing.

Download integrity evidence:

| Official archive | SHA-256 |
| --- | --- |
| [Android command-line tools for Windows](https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip) | `90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a` |
| [Gradle 9.0.0](https://services.gradle.org/distributions/gradle-9.0.0-bin.zip) | `8fad3d78296ca518113f3d29016617c7f9367dc005f932bd9d93bf45ba46072b` |
| [Temurin JDK 17.0.20.1](https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_x64_windows_hotspot_17.0.20.1_1.zip) | `e53a79c3c3d86865bd7e787903884331068e71321714ffd44f145785affc7cb0` |

## Historical debug build evidence

An ARM64 debug build completed successfully: **302 tasks, 274 executed, 28 up to date, 10 minutes 15 seconds**. The artifact is [campaign-1.0.0-debug-arm64.apk](../artifacts/android/campaign-1.0.0-debug-arm64.apk), 51,135,312 bytes, SHA-256 `84EAB6ED8B51AFBF0BADEF36E12384A73BBECD80F27270819D132B00BB2B3BF9`.

`aapt2 dump badging` confirmed package `com.campaignamplification.mobile`, label `Campaign`, version `1.0.0`, target/compile SDK 36, and ARM64 native code. Merged APK inspection found neither Camera nor Record Audio permission. `apksigner verify --print-certs` passed with an Android Debug certificate. The generated manifest configures portrait orientation, the `amplify` scheme, and keyboard `adjustResize`; cleartext traffic is enabled only in the generated debug manifest for local development.

A second **x86_64 debug build** passed through the durable launcher: **302 tasks, 20 executed, 282 up to date, 2 minutes 54 seconds**. [campaign-1.0.0-debug-x86_64.apk](../artifacts/android/campaign-1.0.0-debug-x86_64.apk) is 51,718,658 bytes, SHA-256 `89E36224679B5DDFB212E00CEE1B55F58F84ADEC64932FEB10BAD30749F93AAC`. Its adjacent `.apk.json` records build versions, timing, size, and checksum.

## Isolated emulator

The installed AVD is `Campaign_API_36`: Android 16 / API 36 Google APIs x86_64 revision 7, Pixel 4 display (1080 × 2280, density 440), 2 GB RAM, two cores, WHPX acceleration, and SwiftShader graphics. Its files remain under `tmp/android-build/avd`. SDK emulator version is 37.2.12.0; SDK platform-tools version is 37.0.1.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-emulator.ps1 -Action Start
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-emulator.ps1 -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-emulator.ps1 -Action Install
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-emulator.ps1 -Action Stop
```

Start the API and Metro using the existing project launchers first. `Start` runs headless and returns immediately; wait for `Status` to report boot completed before `Install`. The initial cold boot took about 93 seconds. `Install` first checks the Campaign Metro status and preview on port 8081, installs the preserved x86_64 debug APK, adds a device-specific Metro reverse on 8081, and opens Campaign. It fails before installation if the expected Metro is unavailable. The launcher verifies the SDK ADB executable on dedicated port **5039**, and checks that serial **emulator-5560** belongs to `Campaign_API_36` before operating on it. Listener inspection uses a focused `netstat` fallback when the managed shell denies the network CIM provider; an unverified executable or occupied emulator port fails clearly. It uses no default ADB port or physical device. `Stop` leaves Metro and the API running. Its environment changes are process-local and restored afterward.

## Historical debug native interaction evidence

Actual APK installation and native app launch passed on the AVD above. Guest Home/Explore loaded local API campaigns and remote images, and all five tabs remained clear of the system bars. Basics title/category/creator entry, Android keyboard resizing, Save as Draft, Continue to Story, and actual app force-stop/relaunch/resume passed. A focused Android Back handler was added after QA found that system Back skipped the wizard step: Story now returns to Basics, preview closes to editing, Basics returns to saved drafts, and unfocused Create does not intercept Explore navigation. The saved title and character count were retained after restart.

Native campaign detail retained its funding amount/goal/progress/estimated reach, backing action, and tabs while scrolling through the story; its final controls could scroll above the footer. Its footer also remained readable at **360 and approximately 411 logical pixels** (emulator density temporarily 480 and 420, restored to 440). A **$5 guest simulated contribution** passed, including the **$0.25 fee / $4.75 advertising allocation / approximately 128 estimated people**, server-confirmed success, funding total changing from $1,840 to $1,845, and private inline receipt. The Android share chooser opened with the campaign deep link and was dismissed without sending. A targeted VIEW intent to the observed `amplify://explore/demo_forest` link opened the correct forest detail and backing action.

An existing local seeded reviewer signed in through the native form. After actual app force-stop/relaunch, Profile retained the reviewer session and Review control through the native SecureStore integration. The reviewer account's draft library did not contain the guest draft. After sign-out, Review was absent, Profile returned to sign-in, and Activity required sign-in. Native Activity/Profile headline separators were corrected after the Android font displayed a literal Unicode line separator as a missing glyph; explicit newlines were verified in refreshed screenshots.

The existing reviewer created a fictional **Native Media QA** campaign through all five steps. Real Android photo-picker selection and React Native FormData uploads passed for separate Story and advertising assets; both stored images rendered in the editor. The first selection accidentally chose an Android-indexed QA screenshot rather than the pushed brand PNG. This was a fixture selection error, not an uploader defect; both assets were replaced through the picker with the visually confirmed project megaphone PNG before submission. `native-ad-preview-initial-fixture.png` preserves the initial selection; `native-story-upload.png` and `native-ad-upload.png` show the corrected assets.

Story text, ad copy/CTA, and Reach settings survived backward navigation. Native Reach showed **Pune demo / Public libraries / Instagram 60% / Facebook 40% / 14 days**. Submit initially showed an empty funding-goal input and zero estimates; the creator explicitly entered **$5**, producing a $0.25 fee, $4.75 ad budget, approximately 128 estimated people, and channel budgets $2.85/$1.90. The complete preview and funding policies were scrolled, the rules checkbox confirmed, and **Submit for Review succeeded**. Profile's Under Review view independently showed **Submitted for Review**, $0 of $5, 14 days, and estimated goal reach 128. The campaign remains unpublished and no advertising was started.

Screenshots are under [artifacts/android](../artifacts/android), including `native-home.png`, `native-explore.png`, `native-basics-resumed.png`, `native-detail-story.png`, `native-detail-360.png`, `native-detail-411.png`, `native-payment-success.png`, `native-receipt.png`, `native-story-upload.png`, `native-ad-upload.png`, `native-submit-budget.png`, `native-submit-preview.png`, and `native-submitted.png`. First-boot emulator System UI / Google Play ANRs and a UIAutomator timeout settled before the tested app interactions; they are retained in ignored local logs. No Campaign fatal exception was observed in that initial log capture. These are targeted native checks, not exhaustive regression testing: native reviewer approval/rejection/revision paths and every payment outcome were not repeated here. No physical-device, iOS, standalone-release, performance, or production-delivery claim is made here.

After QA, density was restored to 440, the reviewer was signed out, and the verified Campaign AVD / dedicated ADB server were stopped using the launcher. Ports 5039/5560/5561 had no remaining listener; API `/config` and Metro `/status` still returned HTTP 200. The final Campaign-process-only log scan found no `FATAL EXCEPTION`, ReactNativeJS Error/Warning, TypeError, or Invariant Violation matches. The build launcher was exercised for the successful x86_64 build. Emulator launcher Start, Status, Install, and Stop were all exercised, including reinstall with `-r` while retaining application data.

## Historical Activity follow-up on the debug APK

The upgraded Activity inbox was tested on the same API 36 AVD and installed x86_64 debug APK with current Metro JavaScript; no native rebuild or account creation was needed. The existing local reviewer signed in through the actual native form. The live API used migration 4 and recipient-only notification metadata. These checks are targeted native acceptance, not an exhaustive regression or a standalone-release claim.

- The explicit inbox count and shared tab badge initially both showed 29 unread. Independent **Mark read** changed both to 28 and labelled the item Read. Refresh retained that state; the same Read label remained after an actual Campaign force-stop/relaunch. Other testing with the same account created/read events concurrently, so later totals were not treated as a fixed fixture.
- All, Unread, Campaigns, Payments, and Account filters were exercised. Unread displayed no Read cards; category filters displayed their corresponding cards. Account was reached by scrolling the horizontal filter strip. Today/Yesterday grouping, campaign title, reviewer feedback, payment context, and named actions were visible. Refresh button and native pull-to-refresh completed without losing the inbox. Empty filters and failed-network recovery were not repeated in this native follow-up.
- **Payment history** opened Profile Payments. **Account settings** and Preferences opened Profile Settings. Campaign notification **Review & edit** opened the existing fictional Native Media QA draft with exact correction feedback, goal $5, story, separate uploaded story/ad PNGs, ad copy/CTA, and saved Reach data intact. The reviewer had requested a public contextual source; the campaign remains **Changes Requested**, unpublished, and was not resubmitted in this follow-up.
- QA reproduced a repeat-navigation defect: after leaving the editor for saved drafts, opening the same notification stayed at entry. The fix consumes each focused draft route intent and preserves the live local draft before loading another campaign. After one clean process initialization to discard pre-fix HMR refs, **notification → editor → saved-drafts entry → same notification → editor** passed with no restart between visits. Submit, goal $5, and exact feedback were retained. Opening a separate blank local Basics draft and then using the notification restored the original campaign at its saved Reach step with `Pune demo`. No campaign content was changed. The extra blank draft remains local to that signed-in account.
- Campaign notifications were turned Off through native Settings, survived a real force-stop/relaunch with the SecureStore session restored, and were returned On. Payment notifications stayed On. Native copy states that essential security stays on and push/email are not connected. Backend preference suppression and merge-concurrency tests are separate evidence; this native check verifies UI persistence/restoration.
- Following the existing forest campaign exposed **Following 1 campaign**, its title, funding progress, status, and specifically named Read action. That action opened the forest detail. The account was returned to its original unfollowed state.
- Final sign-out removed the private Activity feed and unread badge, hid Review, and returned Profile to its sign-in form. The original guest **Native Community Library** draft remained in the separate guest library; the signed-in Native Media QA campaign did not appear there. The final Campaign-process-only log scan found no fatal exception, ReactNativeJS Error/Warning, TypeError, or Invariant Violation matches.

Follow-up screenshots in [artifacts/android](../artifacts/android) include `native-activity-final-all.png`, `native-activity-final-unread.png`, `native-activity-campaigns.png`, `native-activity-payments.png`, `native-activity-account-read-persisted.png`, `native-activity-edit-destination.png`, `native-activity-repeat-edit-before-fix.png`, `native-activity-repeat-edit-fixed.png`, `native-activity-edit-preview-retained.png`, `native-activity-payment-destination.png`, `native-activity-preferences-off.png`, `native-activity-preferences-restored.png`, `native-activity-following.png`, `native-activity-final-guest.png`, and `native-activity-final-guest-drafts.png`.

The optional [Activity native rehearsal](../artifacts/android/activity-native-rehearsal.mp4) is a credential-free **45.36-second, 540 × 1140 partial local debug recording** of the inbox/filter interaction before the editor-handoff fix. The MP4 container parsed completely (`ftyp`, `moov`, `free`, `mdat`), and browser playback reached the end without a media error. The temporary loopback preview was closed and stopped afterward. It is not the required complete final demonstration video and does not document the later fix.

Start/Install readiness and ownership checks were exercised during this follow-up. The network-CIM fallback was additionally tested by simulating a denied `Get-NetTCPConnection` call: actual focused `netstat` discovery identified the project SDK ADB listener, whose executable path matched. Under the default managed shell, SDK ADB itself can fail looking up `\\.android` with Permission denied before connecting. The same scoped operation succeeds with approved sandbox escalation. Project SDK/AVD/ADB keys/logs/temp paths remain inside `E:\Campaign`; no global home setting or default/unrelated ADB service was changed. An initial emulator System UI ANR and debug Metro startup retry settled before acceptance checks; after Metro was warm, force-stop/relaunch loaded Campaign without clearing data. No arbitrary startup delay or global network setting was added to the launcher.

The follow-up ended signed out at Home, density 440. The verified AVD and dedicated ADB server were stopped with the launcher. After shutdown settled, focused listener inspection found **zero** listeners on 5039/5560/5561, while API `/config` and Metro `/status` both remained HTTP 200.

## Resolved local setup issues

- Host JDK 21 triggered the known React Native 0.83/Gradle 9 Foojay `IBM_SEMERU` error while provisioning Java 17. Installing the required local Java 17 resolved it without changing application dependencies or generated native files. [Upstream issue](https://github.com/reactwg/react-native-releases/issues/1349).
- The inherited machine `ANDROID_SDK_HOME` conflicted with the project `ANDROID_USER_HOME`. The launcher sets consistent process-local preference paths (`tmp/android-build` and its `.android` child), then restores the original environment.
- Java's initial Gradle-wrapper download timed out at the upstream redirect. The official Gradle archive was downloaded with curl, checksum verified, and placed in the generated wrapper's isolated cache. The unchanged Gradle wrapper now runs successfully with project-local Java 17.
- Historical prebuild changed only package scripts (`expo run:android` / `expo run:ios`) and reported an optional `expo-system-ui` warning. The current theme iteration installs SDK55-compatible `expo-system-ui`/`expo-navigation-bar` and regenerates their native configuration through CNG; that earlier warning is not the current setup.
- Java 17's Windows selector failed with `Unable to establish loopback connection` when its Unix-domain socket temporary path resolved through the host's aliased user directory. An isolated Selector probe reproduced the failure and passed with project-local temporary paths. The build launcher now sets process-only `JAVA_TOOL_OPTIONS` properties `-Djava.io.tmpdir=E:/Campaign/tmp/java` and `-Djdk.net.unixdomain.tmpdir=E:/Campaign/tmp/java`, and restores the original value afterward. No global Java, network or security setting is changed.
