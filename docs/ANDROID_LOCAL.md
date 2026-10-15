# Local Android build and verification

The local toolchain is isolated to `E:\Campaign`. It uses no Expo/EAS account, external hosting, paid services, global SDK installation, or production signing credentials.

**Current October 16 work:** the redesigned source and targeted native correction checks are recorded in [UI_REDESIGN_PROGRESS.md](../UI_REDESIGN_PROGRESS.md). The latest user directive authorizes a local embedded-JavaScript INTERNAL-TEST build. Its build/install/Metro-independent status and commands live in [RELEASE_READINESS.md](../RELEASE_READINESS.md). The debug build results and earlier stopped-emulator records below remain historical evidence; they do not establish acceptance of the new artifact.

## Current INTERNAL-TEST artifacts

Both current APK files were rehashed against adjacent metadata. They use the generated release variant with the **Android Debug certificate**, not production signing, and share a 1,993,336-byte embedded Hermes bundle, six exact fonts and both full OFL license texts. The final build also compiles the existing internal-only backend connection controls.

| Target | Current artifact | Bytes / SHA-256 | Installed evidence |
| --- | --- | --- | --- |
| x86_64 | [APK](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk), [metadata](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk.json) | 38,414,397; `638807B4095BB537574E719A5EB537E428735C3100BAE683F54BE92B5B4C6EA4` | Final Metro-off launch, internal connection controls, offline save/recovery and compact/font-scale checks pass on the owned AVD |
| ARM64 | [APK](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk), [metadata](../artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk.json) | 37,126,539; `4B7ACD6F0D7EFA4F7C43E81C427CBA3EB932805BA257243172832774F537B94C` | Physical-device install/launch unverified; emulator host alias is not a phone backend |

The [final native report](../artifacts/android/internal-acceptance/final-build/NATIVE_RESULTS.md) binds its checks to the exact x86_64 hash, not every earlier screenshot. Compiled API default is `http://10.0.2.2:8787`, suitable for the owned emulator. A phone needs a reachable LAN/hosted API selected through the internal connection settings or a separately configured build. Embedded JavaScript does not supply a hosted backend.

The earlier internal x86_64 `B15ECFF1…` build and its evidence are preserved under [initial-build](../artifacts/android/internal-acceptance/initial-build). Its session/privacy/non-success-payment checks remain separately scoped. The [complete 22-scene film](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) uses the accepted `638807B4…` artifact with Metro off throughout capture. [Native capture](../artifacts/demo/NATIVE_RESULTS.md), [full muted playback](../artifacts/demo/PLAYBACK_RESULTS.json) and [bounded frame review](../artifacts/demo/VIDEO_REVIEW.md) pass in their stated scopes. Normal logout/guest privacy and [owned AVD/ADB cleanup](../artifacts/demo/cleanup/README.md) are complete; the API and restored local web preview remain available.

For an internal rebuild, use the documented PowerShell invocation with `scripts/android-local.ps1 -Mode InternalTest -Architecture x86_64 -ApiUrl http://10.0.2.2:8787`, or the ARM64 equivalent. Follow RELEASE_READINESS.md for acceptance. The emulator launcher's `Install` action below installs the preserved **debug** APK and adds a Metro reverse; do not use it to accept the internal artifact.

The [demo checklist](../DEMO_CHECKLIST.md) and [film metadata](../artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4.json) record exact hashes, timing and limits. Human listening, every-frame privacy inspection, physical ARM64 use, public hosting and external submission remain unverified. Share only the final MP4 and intended APKs; raw captures and local helper/credential directories stay local.

## Rebuild a debug APK

From the project root in PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Architecture arm64-v8a
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Architecture x86_64
```

The first architecture targets common Android phones; the second targets the local emulator. To include both, use `-Architecture 'arm64-v8a,x86_64'`. Two Gradle workers are the default; `-Workers 1` reduces concurrency.

The launcher selects compatible Node (or `CAMPAIGN_NODE`), sets SDK/JDK/Gradle variables only for its process, restores them afterward, and invokes Expo prebuild only if `apps/mobile/android` is absent. Native files are generated; do not edit them by hand. Regenerate through Expo after changing native configuration or modules. Build output, logs, and caches remain inside the project. Successful APKs and JSON build metadata are copied into `artifacts/android`.

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
- Prebuild changed only package scripts (`expo run:android` / `expo run:ios`); dependency versions were preserved. It reported an optional `expo-system-ui` warning for `userInterfaceStyle`; this was not a native compilation failure.
