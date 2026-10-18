# Campaign Amplification Hackathon: initialization guide

## Current startup — information hierarchy / 1.4.0 / code 10

Continue in `E:\Campaign` using the existing Expo/native toolchain, dedicated key,
package identity and verified HTTPS configuration. This frontend hierarchy pass
adds no dependency, migration, provider setup or backend rollout. Preserve older
APKs, public/user data and pinned native/PDF patches; use a fresh artifact tag.

Current artifact: [artifacts/dropdown-hierarchy-20261018/Campaign.apk](artifacts/dropdown-hierarchy-20261018/Campaign.apk), 68811090 bytes,
SHA-256 `CB08EDF303BA6EB7B9720F21BE4E2879C8179CDB7D19ECCFAC91024908953397`. Source: 398 frontend tests,
398 passed,0 failed/skipped; TypeScript exit0; ESLint exit0,0 warnings.
Package inspection: 20/20 pass. Native scope: owned API36 x86_64 emulator, with per-binary scopes;
result: named checks pass; physical/human/full-app acceptance pending. [Evidence](artifacts/dropdown-hierarchy-20261018/README.md) and
[screenshots](artifacts/dropdown-hierarchy-20261018/native-confirmed) record exact artifact binding and limits.
No unperformed physical/human/full-app check is inferred.

## Historical startup — compact discovery / 1.3.1 / code 9

Continue in E:\Campaign with the existing setup, key and toolchain. These frontend
corrections need no dependency, cloud setup or migration. Preserve previous APKs
and pinned native patches; future builds require a fresh tag.

[Campaign.apk](artifacts/home-trust-polish-20261018/Campaign.apk) is version
1.3.1 / code 9, signed by the dedicated Campaign key, with ARM64 and x86_64 native
libraries. It is 68,787,214 bytes; SHA-256 `C8CC281D802AA0FC5671A61B2B8D31ED8ABB9C77D98AF1BF44716F4DD1C5A3EC`.
Package identity, approved installer/splash logo, embedded Hermes, native patches
and HTTPS backend remain. Final source passes 358 tests, TypeScript and full
src/plugins ESLint; 20/20 package checks pass. The exact
final APK received a same-key update and cold launch in 1118 ms on the owned
API 36 emulator without Metro or reverse forwarding. [Evidence and limits](artifacts/home-trust-polish-20261018/README.md).

Performance receipts use the first candidate. The final 74 dp badge correction
has separate exact-binary confirmation and was not benchmarked again.

The POCO was not touched. Physical release verification remains pending because
its installed Debug signer differs from the dedicated release key. No phone
uninstall, storage clear or security bypass, backend change, migration, seed,
provider change, billing, push, recording or submission occurred. Human testing
remains pending because no unfamiliar tester is available. Whole-app, TalkBack,
all-device/font/network and sustained physical performance acceptance is separate.

## Historical startup — final UI simplification / 1.3.0 / code8

Continue in `E:\Campaign` with the existing Expo/FastAPI setup and dedicated
release workflow. No new dependency, migration, seed, provider or deployment is
needed. Preserve pinned Print/core patches and build guards.

[Campaign.apk](artifacts/final-ui-simplification-20261018/Campaign.apk): **1.3.0/code8**, dedicated-signed universal
**ARM64+x86_64**, 68,786,382 bytes, SHA256 `9F3DF3FF0B12743154B5B443A4A487D9047C184B5991CF33B96F0E2888922022`.
Package, approved installer/splash logo, minAPI24/target36, embedded Hermes,
current HTTPS backend and dedicated certificate are preserved.

349 frontend tests, TypeScript/full-source ESLint,20 package checks and the named
confirmation emulator checks pass. [Evidence/commands/limits](artifacts/final-ui-simplification-20261018/README.md) distinguish
the initial candidate from the corrected installed APK. Prior APKs remain.
Physical release testing remains pending: the authorized POCO retains an
incompatible Debug signer. No phone update, uninstall, storage clear or bypass
occurred. Unfamiliar-user testing remains pending because no tester is available.
TalkBack, every device/font/network state, sustained performance and a full new
account/payment/upload journey were not tested in this UI pass. Earlier video,
payment, cloud and PDF-delivery evidence retains its exact build scope; no new
video or external submission occurred.

## Historical startup — Home reference / 1.2.4 / code7

Continue in `E:\Campaign` with the existing Expo/FastAPI architecture. The newest
[Campaign.apk](artifacts/home-reference-20261018/Campaign.apk) contains ARM64 and
x86_64, the unchanged dedicated signer, embedded Hermes and current HTTPS backend.
No new dependencies, cloud deployment, migration or seed was needed. Existing
Print/core source patches and release build guards remain mandatory.

[Handoff and commands](artifacts/home-reference-20261018/README.md) record the
330 frontend tests, TypeScript/ESLint, 20 package checks and 13 focused native
Home checks. The API36 owned emulator ran the exact accepted universal APK.
Current screenshots are `*readable.png` in the task's native folder; earlier
candidate screenshots are retained as history. Phone installation remains
pending because its existing Debug certificate differs. Never uninstall/clear
phone data to make this release install. The older 1.2.3 package and video are
preserved and do not demonstrate the new Home.


<!-- current-code6-evidence -->
## Historical startup — 1.2.3 / code6

Continue in E:\Campaign; no reset, new provider or migration is needed. Current
signed APK and evidence: [RELEASE_READINESS.md](RELEASE_READINESS.md).
Run the established release workflow with a fresh artifact tag. Pinned native
Print/core patches and `buildFromSource` autolinking are mandatory; do not use
an unchecked prebuilt AAR or remove the version/byte guards. The same HTTPS
backend and dedicated key remain. No physical Debug-to-release update is safe
without a separate approved migration; preserve the phone and older APKs.
<!-- /current-code6-evidence -->

## Historical October18 startup — release 1.2.2 / code 5

Continue the existing Expo 55 / React Native / TypeScript application and FastAPI
backend in `E:\Campaign`. The backend remains commit
`04e206a177a2450ec68bb3dae20f487b75847493` on the same Render Free HTTPS service,
with existing Neon/psycopg and Cloudinary configuration, auto-deploy off. This
frontend/native correction required no new deployment, migration or seed.

| Current dedicated release artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| [ARM64](artifacts/android/final-completion-lifecycle-20261017/campaign-1.2.2-RELEASE-arm64.apk) | 49,453,767 | `BB7E889F4299E0534B8EF95F349CF1E8474FA7CA0877BEFDB4F5C14BE1BB65DF` |
| [x86_64 QA](artifacts/android/final-completion-lifecycle-20261017/campaign-1.2.2-RELEASE-x86_64.apk) | 50,872,694 | `11755A1675CCD0264ADB661DD4D3EF916B220CA686599333891414AD02A2BC9A` |

Both retain `com.campaignamplification.mobile`, the dedicated Campaign certificate,
approved icon/splash, embedded Hermes and `https://campaign-api-cw8y.onrender.com`.
Use the existing Release commands in [ANDROID_LOCAL.md](docs/ANDROID_LOCAL.md)
with a new artifact tag; never fall back to Debug signing or overwrite old APKs.
The POCO still has a different Debug signer: physical ARM64 release installation
is pending, with no uninstall, storage clear, incompatible update or bypass allowed.

The guarded `expo-modules-core` 55.0.26 patch rebinds Activity results when the weak
host identity changes. It replaces the rejected code 4 `fontScale` configuration
override; Android font-change recreation/scaling remains enabled. In the tested
path recreation returns Create to its entry, then actual Resume restores the
saved Visuals step. Do not claim an ephemeral editor route remained mounted.

[314 frontend tests](artifacts/final-completion-20261017/activity-lifecycle-fix/frontend-supported-node.log),
TypeScript/full-source lint, [60 package checks](artifacts/final-completion-20261017/activity-lifecycle-fix/RELEASE_BUILD_VERIFICATION.json),
25 branding-pixel/15 launcher-byte comparisons and bounded known-secret scans pass.
The [current freeze](artifacts/final-completion-20261017/activity-lifecycle-fix/RELEASE_SOURCE_INPUTS.inspection-final2.json)
binds 123 runtime, 36 test, 6 build, 161 native dependency and 9 inspection inputs,
with zero recorded drift. These source/package results are distinct from runtime QA.

Exact x86 evidence now includes scoped section scroll/paging/font 1.3/picker
recreation checks, [24 fresh-install Welcome/guest checks](artifacts/final-completion-20261017/activity-lifecycle-fix/fresh-native/FINAL_FRESH_QA_SUMMARY.json),
and the actual resumed fictional campaign journey through submission, restricted
review, separate funding opening, one simulated $25 payment and controlled demo
completion. Native [USD](artifacts/final-completion-20261017/activity-lifecycle-fix/pdf/render-usd/PDF_REVIEW.md)
and [INR](artifacts/final-completion-20261017/activity-lifecycle-fix/pdf/render-inr/PDF_REVIEW.md)
reports reached the local QA recipient; all four pages of each have bounded review.
This does not verify the entire application, physical hardware or an external recipient.

App-only demo production is authorized by the latest brief and remains in progress;
raw captures do not establish an accepted edited film. Human usability/listening,
physical ARM64/disconnected mobile-data checks, encrypted off-device key recovery
and final package/destination approval remain open. No unfamiliar tester is available.
Earlier version, recording-hold and hosting-deferral paragraphs below are dated
history, not the current setup. See PROGRESS.md and RELEASE_READINESS.md for the
operator's changing delivery status; this guide does not submit or publish anything.

**Historical October17 trust/library and dedicated release setup:** Read
[D39](PROJECT_CONTEXT.md), [rubric](docs/TRUST_RUBRIC.md),
[library](docs/DEMO_LIBRARY.md), [rollout](docs/TRUST_ROLLOUT.md) and
[signing runbook](docs/ANDROID_RELEASE_SIGNING.md) before extending this work.
The architecture remains Expo55/React Native/TypeScript plus existing FastAPI,
Neon/psycopg and Cloudinary. Additive migration 007 stores version-bound
assessments/seed registration. Exact `publicContentHash` matching prevents cached
cross-version scores; reviewer inspection uses its authorized workspace snapshot.
Policy approval, rubric coverage, ad readiness and delivery remain independent.
The explicit stable-ID demo manifest targets 20 app-owned examples (2 per category),
not automatic per-launch seeding or user-campaign auto-scoring. Existing Free
backend commit `cbd4f90d5108f40beb8474813cc42d475f095354` is live with reviewed
seeding: 243/243 cloud checks, 20 built-in demos / 22 public campaigns at verification
and original rows across 13 tables preserved. Read the separate cloud acceptance
receipt; a frontend rebuild alone does not establish this result.

The reference correction uses pinned `react-native-svg` 15.15.3 and
`lucide-react-native` 1.59.0 with full bundled MIT/ISC licenses. Install from the
existing mobile lockfile and regenerate with the local CNG build; an older native
binary cannot provide the new SVG module. Fresh review confirms the prior
heavy/oversized shield and outline-crossing label are resolved in both themes
and font scale 1.3, within the captured states. No palette/navigation redesign occurred.

Use the existing compatible bundled Node and project SDK/JDK. From E:\Campaign:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\configure-android-release-signing.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode Release -Architecture arm64-v8a -ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag <fresh-reviewed-tag>
# For clean isolated release QA, build the same frozen source with -Architecture x86_64.
```

Setup reuses the established dedicated key and never overwrites existing material.
Release mode fails if credentials/key are unavailable; there is no Debug fallback.
Protected ignored `tmp/android-signing/` contains `campaign-release.jks`, DPAPI
CurrentUser `release-signing.clixml`, public certificate receipt and verified
same-machine backups. No password is printed or passed in command arguments.
Keep this directory out of Git/APK/cloud. Human-operated
`scripts/backup-android-release-signing.ps1` can export the same key to a hidden-
password-protected PKCS12; execution and an encrypted off-device copy remain
manual pending steps. DPAPI copying alone does not support another machine.

Current distinct [Campaign-1.1.0-release-arm64.apk](Campaign-1.1.0-release-arm64.apk)
is 49,393,005 bytes / 47.10 MiB, SHA256
`2BC46C23E395C8BA5DEFC72EC1B92C09EFBFDEF6767A7AAAB1B5518D7485DAB9`;
package `com.campaignamplification.mobile`, version 1.1.0 / code 2, ARM64 / minimum API 24,
target 36, approved Campaign icon/splash and current HTTPS/Hermes. Dedicated
certificate SHA256
`ef0d218676ed3fa4f81033ebd9ec0c6d825017b60505c89f675b31ee6188db07`.
Prior Campaign.apk 47,718,998 bytes / SHA966E…F47D remains preserved. Do not replace it
with this different signer as an automatic phone update or clear/uninstall the
POCO. Physical ARM64 release installation remains pending. Main isolated
Campaign_Release_36/5574 accepted the same-key visual update; separate fresh
Campaign_Release_Fresh_36/5576 has completed its bounded clean-install QA and
was gracefully stopped, preserving userdata. These recorded checks refer only
to the exact installed B199…0D5C x86 binary.

[Final freeze](artifacts/trust-release-20261017/RELEASE_SOURCE_INPUTS.visual-final.json)
binds 111 runtime / 33 test / 6 build-script inputs, zero drift. 279 frontend tests,
TypeScript/full-source lint and both ABI builds pass; [44 package/source checks](artifacts/trust-release-20261017/RELEASE_BUILD_VERIFICATION.visual-final.json)
verify signatures, 77 compiled modules, packaged HTTPS/Hermes/branding and scoped
secret/permission checks, packaged native SVG libraries and full library-license bytes.
Main 5574 cold launch is 2106ms. [Fresh 5576 QA](artifacts/trust-release-20261017/FRESH_VISUAL_RELEASE_NATIVE.json)
passes 16 bounded Welcome/swipe/dot checks after a 5908ms first launch and a
documented System UI ANR overlay resolved with one Wait. Screenshots and 450
app-process lines / 0 listed error markers support only this limited scope, not
whole-app smoothness or physical acceptance. E555/D8EB and the pre-correction
build/launch reports remain historical and are not reused as new-binary proof.
Recording, paid resources, Play/organizer publication stay held.

**Historical October17 Profile correction — delivered, scoped native verification:**
Settings is removed. Completed guests now use Guest profile with explicit
Sign in/Create account; ordinary first launch retains Welcome. Appearance and
Currency open directly from Profile, Notifications has one destination, Sign
out follows the rows and does not add an auth success strip. Nested Profile
Back uses its actual parent. Activity/My Campaigns reuse the installed native
pager for 5/6 pages. Contribution presets reflow measured monetary labels; Home
has no filter shortcut, while Explore has a floating staged filter card over
its mounted results. The exact creator workflow and existing saved data remain.

[259 frontend tests](artifacts/profile-flow-fixes-20261017/frontend.log), TypeScript
and full-source ESLint pass; [freeze](artifacts/profile-flow-fixes-20261017/SOURCE_INPUTS.json)
binds 100 runtime/28 test files. No dependency/setup/backend/provider/signing/theme
redesign change or cloud redeploy is required. Existing Android commands and
current HTTPS configuration remain. ARM64/x86_64 builds pass47s/1m31s with vital
lint; [30/30 independent package/source checks](artifacts/profile-flow-fixes-20261017/BUILD_VERIFICATION.json)
pass. ARM64 candidate47,718,998bytes/SHA966E…F47D; both ABIs embed identical
2,210,024-byte Hermes and retain Campaign branding/compatible Debug signing.
Emulator73/73effective native checks pass, with2superseded QA assertions,
31captures and27independently reviewed states. Its late unclassified automation
stall leaves final UI/font/draft reread pending;119PID lines include46skipped-
frame warnings(max546), despite0fatal/JS markers. No smoothness/crash-free claim.
Authorized POCO now passes55/55checks on existingADB5039, compatible old1D36→new
966E install-r, Metro-free977ms launch/no reverse, guest/auth/Back/Help/filter,
full INR presets, My Campaigns/Activity page directions and clean QA sign-out.
Original guest/Dark/USD/font1.17/density440 restored; no campaign/draft/payment/
read mutations.19registered phone screenshots,35independently opened images
overall; phone152PID lines/0fatalJS/0skipped-frame warnings. No unrelated
device/ADB reset or whole-app/performance inference.

Delivered [Campaign.apk](Campaign.apk):47,718,998bytes(45.51MiB), SHA256
`966E629B902555102A490816DDB1932330E8E41BADC1B23DC20894BF21F1F47D`.
Read [delivery receipt](artifacts/profile-flow-fixes-20261017/CAMPAIGN_APK.json)
and [current report](artifacts/profile-flow-fixes-20261017/COMPLETION_REPORT.md).
Previous1D36 APK is preserved; no redeploy or push was necessary/performed.
Recoverable source ref: `refs/checkpoints/profile-flow-fixes-20261017`;
[SOURCE_CHECKPOINT.json](artifacts/profile-flow-fixes-20261017/SOURCE_CHECKPOINT.json)
stores the generated commit and preservation proof. D37 evidence remains historical.

**Previous October17 delivery:** [auth-clean APK](artifacts/android/final-campaign-auth-clean-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk), ARM64 CloudTest,
47,705,118 bytes, SHA256
`1D36B4C1BF8BDAEB1E5D773FF8E20641499561FB323D0A793366F856E672344C`.
Build source is `artifacts/android/final-campaign-auth-clean-20261017/`;
ARM64/x86_64 compilation passes in1m57s/1m56s with vital lint and identical Hermes.
The standalone guest Welcome/auth Settings footer is removed; Settings remains
inside Help and signed-in Profile. Existing package/signing,
embedded Hermes and HTTPS-only endpoint remain. The Campaign label and approved
transparent megaphone launcher/splash are package-verified. Actual current-build
POCO Welcome/Login/Register and scrolled/Back states pass10/10 clean-auth UI
checks; no form submitted. [Phone proof](artifacts/final-delivery-20261017/AUTH_CLEAN_PHYSICAL.json)
records fresh install-r after finding the package absent, without agent uninstall
or data wipe. Exact-hash [installer preview](artifacts/final-delivery-20261017/AUTH_CLEAN_INSTALLER_PREVIEW.json)
verifies Campaign name/logo; Cancel pressed, no Update/security/data change.
This remains Debug-signed internal testing, not production signing or a warning-
free sideload. Earlier APKs remain preserved. Final emulator10/10 checks pass
for clean auth, Help→Settings, saved System/Light/INR, Back/mode routes and actual
unsent fictional email retention; no auth/onboarding/draft/preference mutation.
[Native receipt](artifacts/final-delivery-20261017/AUTH_CLEAN_NATIVE_EMULATOR.json)
registers17captures and bounded172-line clean process diagnostics; phone19-line
sample has0listed error markers, Android15/API35/Dark/font1.17/density440.
The minimal reviewed draft-delete backend is now live on existing Render Free,
commit `e599f984d43b8b109dff63504937c946400cbbad`; no migration/environment/provider
changes, auto-deploy off. Fresh230 auth-clean frontend/TS/lint and prior93 isolated backend,
13 existing-record HTTPS preservation and 32 live disposable-account deletion
checks pass. Fictional-account native Cancel/Confirm deletion additionally passed
7/7 on the prior binary; QA owner signed out, older guest draft retained. No
further backend deployment is needed for this auth-only frontend correction.
Read [current report](artifacts/final-delivery-20261017/COMPLETION_REPORT.md) and
[cloud runbook](docs/CLOUD_DEPLOYMENT.md) before deployment/rollback; tombstone-
aware read/create guards must survive rollback. Use the existing locked Expo55
package and CloudTest build command below; preserve older APKs and compatible
`install -r`, never clear/uninstall phone data. Whole-app, broader-device and
production acceptance remain separate. Older hold text is historical.

**Historical October17 candidate:** [native-pager ARM64 CloudTest](artifacts/android/native-pager-final-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk),
47,705,774bytes, SHA7C1682A1…44F0329. Expo55-compatible pager8.0.0 is now a native
dependency; install using the locked mobile package and regenerate via the
existing android-local.ps1 CloudTest process. Use compatible install-r only.
230frontend/86isolated backend checks, TS/lint/web export and bounded actual POCO
native swipe checks pass; read PROGRESS.md/PHYSICAL_ANDROID_TEST.md for limits.
Cloud endpoint/signing/data preserved. Account draft deletion is source-tested
but not deployed. Prior four-area evidence below remains historical.


**October17 four-area polish — VERIFIED within bounded native scope:** Current
[ARM64 CloudTest APK](artifacts/android/four-area-polish-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk)
is **47,565,328 bytes**, SHA-256
`CD7E775787FEAB1473C9198492A7A65F045D09B068E0C97C0B63F9ACE988B5BC`.
179/179 frontend tests, TypeScript and full-source ESLint pass; Gradle succeeded
in 1m45s including normal vital lint. Existing compatible Android Debug signing,
embedded Hermes and the current Render HTTPS configuration remain. The authorized
POCO `tkkrlvqklzydbuh6` reconnected after the initial emulator packet and accepted
compatible `install -r` without resetting its signed-in session or existing draft.
Dark/font1.17 and selected Light/font1.3 captures cover all four compact tour
cards, manual-first Create entry and separate optional-cover/ad controls. A new
fictional **Four Area Phone QA** draft stayed local; URL previews, picker cancel
and Activity-recreation/resume checks preserved its separate fields. No cloud
save, submission, media upload, signup or logout was performed.

Welcome paging remains **physical-phone UNVERIFIED** to preserve that session.
The isolated API36/x86_64 `Campaign_FourArea_36` emulator supplies mountains →
coast → turtle, both swipe directions, captions/dots/boundaries, vertical scroll
and no-implicit-completion evidence. A mounted System→Light change retained the
turtle; font-scale changes recreated the Activity and a fresh Welcome began at
mountains, not an observed same-mounted reset. The [independent visual review](artifacts/four-area-polish-20261017/VISUAL_REVIEW.md)
returns bounded `ship` for its emulator packet and fourteen phone captures.
[Final device proof](artifacts/four-area-polish-20261017/FINAL_DEVICE_STATE.json)
matches each installed ABI package to its own artifact, confirms identical
cross-ABI Hermes and 81 frozen inputs with zero drift. Phone ends at signed-in
Dark Home, original font1.17/density440/OS night=yes, unchanged 3 unread, with
Metro8081 absent and no USB reverse. The 108-line phone/58-line emulator current-
process log samples have no matching fatal/uncaught-JS markers; these are bounded
diagnostics, not crash-free/performance proof. [Physical report](PHYSICAL_ANDROID_TEST.md)
owns exact interactions/restoration;
whole-app, TalkBack, upload/cloud, performance and production acceptance remain
separate. Existing source start checkpoint `refs/checkpoints/four-area-start-20261017`
is `6f5f2e22b020464e97cb1cc97b649796b631bfe5`. Earlier candidate sections below
retain their history. No backend/provider change, recording or external release.

**October17 optional walkthrough / normal QA:** This latest brief supersedes
the historical build-only restriction below for the tour task. Source tests,
typecheck/lint, local Android compilation, isolated emulator cases and bounded
checks on the authorized POCO are permitted; never clear/uninstall the user's
phone. Current result: [walkthrough ARM64 APK](artifacts/android/walkthrough-final2-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk),
47,560,608 bytes, SHA `15BABC54…DD8E8B7`, compatible Debug signing and embedded
HTTPS/Hermes. Use existing commands `scripts/mobile.ps1 test`, `typecheck`,
`lint`, `doctor`; final ARM64 compilation included normal vital lint. Build with
`scripts/android-local.ps1 -Mode CloudTest -Architecture arm64-v8a -ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag <new-tag>`.
Previous APKs stay preserved. Help → Take the app tour replays without resetting
Welcome, session, appearance or drafts. See [actual candidate-specific results](PHYSICAL_ANDROID_TEST.md).
No recording, cloud restart/deployment, migration, billing or submission.

**October17 physical-test continuation:** The user's later explicit phone-test
instruction supersedes the historical build-only restriction for this task.
Only POCO `tkkrlvqklzydbuh6` was selected, on its existing **ADB5037** transport.
The corrected approved-logo [CloudTest APK](artifacts/android/native-icons-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk),
SHA `41103294…6AE338`, is installed by compatible update and has scoped native
workflow/Metro-off/HTTPS evidence in [PHYSICAL_ANDROID_TEST.md](PHYSICAL_ANDROID_TEST.md).
Its existing icon font now loads through the root splash gate. Phone ends at
Dark guest Home with original font1.17/density440, no USB reverse and no Metro
listener. No reset/uninstall/security bypass, deployment or recording occurred.
Debug signing, installation warnings, fresh install and broader acceptance
remain separate. Do not restart unrelated ADB servers to follow older5039 text.

**October17 branding build:** The approved transparent mark now supplies Android
launcher/splash resources; use a fresh artifact tag and `-SkipLint` for the
restricted compilation-only release pipeline. This explicitly excludes the
vital-lint tasks otherwise scheduled by Gradle. The first branding attempt ran
those tasks inadvertently; the corrected build and remaining warning/native
acceptance limits are recorded in [the branding report](docs/BRANDING_AND_ANDROID_WARNINGS.md).

**October17 final polish:** The latest pass is source implementation and local
ARM64 CloudTest compilation only. Do not run tests, lint, ADB, new captures,
app/browser/emulator checks or live cloud probes for this pass. Read
[FINAL_POLISH.md](docs/FINAL_POLISH.md) for the build artifact and exact limits.
The added SDK55 `expo-application` dependency supplies local Android package
install/update metadata for one-time onboarding migration; no new account,
permission, provider config or backend migration is required. Preserve the
previous working APK. Recording/deployment remain held.

**October17 live cloud backend:** The Campaign FastAPI service is deployed on
Render Free at `https://campaign-api-cw8y.onrender.com`, backed by the existing
Neon Free production Postgres and Cloudinary Free authenticated media. The
private source branch is `codex/cloud-deployment`, manual deploy only. See
[cloud runbook](docs/CLOUD_DEPLOYMENT.md) and [live evidence](PROGRESS.md).
Keep Neon/Cloudinary/Render credentials in ignored local files or server-side
environment only; no secrets belong in the APK. CloudTest ARM64 was built and
installed compatibly on the authorized POCO; Metro-off and no-USB-reverse
hosted workflows passed. Cable-unplugged/laptop-off acceptance remains open.
Recording is held. Older pending/deferral text below is historical.

**October17 Neon setup:** production PostgreSQL is connected in the user's
specified Free Campaign project. Root`npm run build` and explicit`npm start`
are now available; Neon API uses loopback8879, while existing local SQLite API8787
remains separate. Read [NEON_SETUP.md](docs/NEON_SETUP.md) for ignored server env,
direct migrations/pooled traffic and current proof. Render/Cloudinary/public API,
cloud APK/native acceptance remain pending; older blanket deferrals are historical.
After `npm start`, use `npm run preview:neon` in another terminal to serve an
isolated Web preview at `http://localhost:19006`, connected to API8879. This
preview does not establish installed Android acceptance.

**Current cloud task:** preparation is implemented; public deployment is BLOCKED
on user-deferred account connection. Read [CLOUD_DEPLOYMENT.md](docs/CLOUD_DEPLOYMENT.md)
for PostgreSQL/media/configuration, CloudTest builds, provider terms, commands and
evidence boundaries. No public backend or cloud APK exists. Older hosting-hold
text retains its historical scope. Recording/submission remain held.

**Current premium pass12 — VERIFIED within the recorded local scope:** [Fresh source gates](artifacts/premium-quality/pass12/SOURCE_CHECKS.json) pass **91/91 in 1044.901ms**, TypeScript/full-source ESLint/diff/public Expo config. [Strict inspection](artifacts/premium-quality/pass12/BUILD_INSPECTION.json) binds **86 inputs / 45 compiled modules / six artworks / 15 native branding resources** to the **48,623,759-byte APK**, SHA `DF4C95CB9F6555DE6E5637DCF18989B7E41042E0D978F7F908EFA0697FDAEDF9`. The installed package hash matches. [Actual Metro-off launch](artifacts/premium-quality/pass12/METRO_OFF.json) is **COLD 1,418ms / wait 1,431ms**, with preserved data and a separately healthy USB-local API. [Independent finish review](artifacts/premium-quality/FINISH_REVIEW.md) closes the opened Home/Auth/keyboard findings. Earlier matrices retain [their exact scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json); no whole-app final-hash rerun or human/production acceptance is inferred. Recording/external release stay held.

[Frozen source](artifacts/premium-quality/pass12/SOURCE_INPUTS.json) digest: `6e92c273b2ca5ddea4a99119d7a8357b8cfab54d54bf365c9f31b5697cf47726`. [Final source verification](artifacts/premium-quality/pass12/SOURCE_VERIFICATION.json) and strict inspection bind the same 86 mobile/13 backend inputs; original 25-page PDF SHA remains `6A5443253C33997A7361BA91BFF4C04DAF02743ADF23CB47F7E4F1C3789E3290`.

**Historical quick notifications and Activity — VERIFIED within recorded local scope:** Home's bell opens the native latest-five sheet; Activity retains the complete existing feed, filters/preferences and followed campaigns over the same recipient-scoped data/read actions/badges. Final pass5 source, strict binary inspection, compatible physical installation and Metro-off/USB-local API launch pass. Actual final error/retry, account/guest recovery, Light/Dark content sizing, contextual navigation and dismissal checks are recorded; [bounded finish review](artifacts/notification-center/FINISH_REVIEW.md) has no actionable P0/P1/P2. Prior pass2/pass3 matrices retain their exact scopes. No whole-app, human/TalkBack, sustained-smoothness or production-release approval is implied. Recording and external release remain held.

**Historical Create + profile-photo work — VERIFIED within recorded local scope:** The later [Create reference](artifacts/create-polish/reference.png) is implemented with the PDF five-step flow, 60-character title, creator-set goal at Submit and review before publication intact. Private photo add/crop/change/remove/cancel and persistence are exercised on the authorized POCO. Final pass6 source checks, independent binary inspection, compatible installation and exact Metro-off/USB-local API launch pass. The [bounded reference review](artifacts/create-polish/FINISH_REVIEW.md) closes all reported P0/P1/P2 findings; P3 ornament/keyboard-spacing notes remain. This does not claim human acceptance, every branch/device, sustained smoothness or external release readiness.

**Resume:** Read current [PROGRESS.md](PROGRESS.md), [RELEASE_READINESS.md](RELEASE_READINESS.md), [PHYSICAL_ANDROID_TEST.md](PHYSICAL_ANDROID_TEST.md), [pass12 checks](artifacts/premium-quality/pass12/CHECKS.md) and [candidate scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json). D25/D26 and section24 record the implemented refinement, optional session persistence, transparent Auth mark and Dark fallback preserving saved Light/System. Root owns actual phone/services; preserve recording, accounts/hosting and submission holds.

Initialized October 15, 2026. Development was subsequently authorized and the connected local prototype now exists. Read [AGENTS.md](AGENTS.md) first, [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) sections 18, 22–24 for the implemented architecture, and [PROGRESS.md](PROGRESS.md) for current evidence. Sections C/D/H retain the original initialization snapshot for history; section J and README contain current run guidance.

## A. Project overview

Build a polished, functioning mobile prototype for community-funded message amplification. Creators prepare stories and evidence; the platform reviews campaigns; backers pool money for advertising and distribution beyond the creator's existing network. Contributions do **not** directly fund the cause, person, or organization described in the message (PDF pp. 1-3).

- **Project:** Campaign Amplification Hackathon.
- **Primary development agent:** OpenAI Codex.
- **Submission target:** Monday, October 19, 2026 (Asia/Calcutta planning timezone). The user's October 16 organizer-video summary reports a maximum Tuesday, October 20 at 11:59 AM. Current Telegram posts and that cutoff's timezone remain unverified; keep Monday as the working target. The PDF supplies no deadline.
- **Required delivery:** Android APK and a demo video of the complete journey. iOS TestFlight is conditional if requested for the final stage and otherwise encouraged if possible. Code submission is not required; the team must be able to explain the architecture and demonstrate the implementation (pp. 23-24).
- **Priorities:** clear product meaning, premium mobile usability, connected end-to-end behavior, durable drafts, coherent lifecycle and payment states, backend validation, privacy, and truthful verification. Optional extras must not displace required flows.

## B. Project references

| Reference | Purpose |
| --- | --- |
| [Hackathon_Requirements.pdf](Hackathon_Requirements.pdf) | Original, authoritative 25-page product brief. The uppercase filename in the request is a reference to this actual file. |
| <https://campaign-one-pearl.vercel.app/> | Secondary product/workflow reference; use a mobile-first interpretation. |
| [AGENTS.md](AGENTS.md) | Startup protocol, isolation, precedence, development and completion rules. |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Detailed flows, page traceability, proposed data model, requirement statuses, roadmap, and decisions. |
| [PROGRESS.md](PROGRESS.md) | Current implementation progress and evidence; the initialization-only absence is historical. |

All 25 PDF pages were read on October 15, 2026, including source links and submission instructions; page renders were also inspected during the preceding PDF review. See context section 2 for the document fingerprint and source limitations. The reference homepage was accessible in Chrome during the earlier review, although the web text reader could not load it. No claim is made that every website flow was audited.

To find requirements, use the context page map and traceability IDs, then read the corresponding original PDF pages. Do not rely on a prior chat summary when the original is available. If the PDF changes, re-review it and reconcile the context before relying on the old matrix.

## C. Development environment: original initialization snapshot

**Authoritative project root:** `E:\Campaign`, verified as the resolved current directory and confirmed by the user. The original macOS project location is superseded. Current shell: PowerShell on Windows.

| Area | Confirmed requirement / current fact | Proposed approach | Undecided or pending |
| --- | --- | --- | --- |
| Mobile | React Native with Expo is required (pp. 2, 22); no app initialized | Expo mobile app with reusable UI | Version, project scaffold, supported device baseline |
| Language | TypeScript strongly recommended by PDF | Prefer TypeScript across app and any Node backend | Final configuration; no compiler installed/configured for the app |
| Navigation | Stable five-tab bottom navigation; consistent contextual back behavior | Expo Router or React Navigation with nested detail/editor flows | Library choice and route layout |
| Backend | Clear API architecture, server validation, role permissions | Node/Express or Python/FastAPI; managed alternatives can be evaluated | Framework, hosting, API contracts |
| Database | PostgreSQL is suggested; Supabase/managed alternatives acceptable | Relational persistence for campaigns, reviews, payments, states | Provider, schema, migrations, backup/reset strategy |
| Authentication | Guest browsing; protected ownership/reviewer actions | Small demonstrable account/session flow with enforced roles | Provider, guest checkout identity/receipt rules |
| Storage | Campaign/story/ad asset uploads and previews required | Project-isolated asset storage with validation | Provider, supported media, size/type limits |
| Payments | Dummy provider; clearly labelled simulation if no credentials | Deterministic simulated outcomes verified server-side | Adapter and receipt implementation; no real payment integration selected |
| AI / voice | Editable drafts and labelled demo/manual fallback permitted | Provider adapter with transparent fallback | Provider, speech support, image-generation capability |
| Build | Installable Android APK required | Expo build workflow; EAS internal/APK profile or suitable local Android build | Build method, accounts, SDKs, signing, credentials, configuration |
| Testing | Common mobile sizes; required behavior verified | Domain/API checks plus Android end-to-end walkthrough and visual checks | Tools, scripts, devices/emulator, coverage plan |

These are requirements and recommendations, not installed technologies. No package manifests, backend, database, authentication, storage, app build configuration, or test suite exists at initialization. Earlier read-only PDF review left `tmp/pdf-deps/` and `tmp/pdfs/`; these are review helpers/artifacts, not app dependencies or product code. This initialization task installs nothing.

## D. Project structure: original and planned baseline

Actual baseline after this task:

```text
E:\Campaign\
  AGENTS.md
  INIT.md
  PROJECT_CONTEXT.md
  Hackathon_Requirements.pdf
  tmp\
    pdf-deps\       # PDF reader dependency from the earlier review
    pdfs\           # earlier page renders/contact sheets
```

Proposed future layout, subject to architecture confirmation; directories below have **not** been created:

```text
apps/mobile/         Expo app, navigation, screens, shared UI and feature state
services/api/        backend API, validation, permissions, lifecycle/payment logic
packages/contracts/ shared schemas/types if useful for the selected stack
database/           schema/migrations/seed data if needed
tests/              meaningful integration and journey checks
docs/               demo, architecture, delivery notes when needed
artifacts/          project-owned build/demo outputs, excluded appropriately later
PROGRESS.md         active implementation status and verification evidence
```

Avoid a monorepo/package split if its overhead outweighs its value. Confirm the layout before scaffolding and update this section to match the real codebase. No directory here implies a locked-in framework or implemented service.

## E. Initialization workflow

1. Verify the resolved root is `E:\Campaign`; read persistent instructions.
2. Load the current context, decisions, requirements, and later progress notes.
3. Identify actual implementation state from files, configuration, and test evidence.
4. Review the original PDF requirements relevant to the requested change.
5. Inspect affected files, reusable components, models, APIs, and architecture.
6. Plan a targeted change with acceptance criteria, dependencies, and explicit assumptions.
7. Implement only work authorized by the current task, preserving working functionality.
8. Verify behavior with appropriate checks; report failures and untested limits accurately.
9. Update context for durable decisions, this guide for setup changes, and progress notes for changing status/evidence.

During this initialization, only the three root Markdown files are created. Application development awaits the user's next instruction.

## F. Development phases

The detailed dated roadmap and risks are in context section 13. Work in dependency order:

1. **Foundation:** choose justified stack/services, app and backend boundaries, design tokens, navigation, persistent state, validation/permissions, isolated seeded data, configurable estimation/fees, and early APK feasibility.
2. **Discovery and reading:** guest Home/Explore, functioning search/filter/sort, shared cards, full editorial detail, public sources, funding/trust/audience disclosures, states and secondary information destinations.
3. **Creation:** manual/voice entry with fallback, five steps, story sections/assets/sources, creative previews, reach settings, creator-controlled funding goal at Submit, autosave/resume/back behavior, complete preview and submission timeline.
4. **Lifecycle and creator management:** restricted review demonstration, feedback/resubmission, approval/funding/distribution guards, dashboard filters, controlled material edits, lifecycle history and exceptional outcomes.
5. **Contributions and tracking:** guest support where permitted, presets/custom amounts, estimation and fee review, simulated outcomes, verified success/receipt/funding updates, privacy, follows/saves/activity and profile history.
6. **Distribution and reports:** deliberate distribution preparation, promotion/completion progression, reports distinguishing raised/allocated/spent/estimated/measured metrics; labelled demo delivery data and full notification event coverage.
7. **Verification and delivery:** Android journey and responsive/a11y checks, error/empty/pending scenarios, persistence and permission tests, APK build/install verification, complete demo video, architecture explanation and submission checks.

Do not remove mandatory features to meet the deadline. Use permitted simulations and prioritize complete, polished core flows; surface any at-risk requirement in progress notes.

## G. Development safety

Never access or modify the Prakash Glass Enterprise ERP, including its code, databases, containers, services, secrets, environment, or configuration. Do not inspect its supplied path or search for it. Do not reuse ERP resources. Do not access unrelated projects or clean outside `E:\Campaign`. All project implementation, testing, configuration, and output stay isolated here. See `AGENTS.md` for the full boundary.

## H. Build and testing: original unconfigured plan

All execution commands are **PENDING / UNCONFIGURED**. No application dependencies, scripts, build profile, service or database have been configured for this project. Host build tools, credentials and test-device availability have not been evaluated; do not infer working commands or device readiness from this guide.

| Workflow | Intended procedure | Evidence to retain later |
| --- | --- | --- |
| Run Expo | After authorized scaffolding, inspect the actual manifest and Expo configuration; install selected project dependencies and document the verified start command | Exact command, environment/version, successful launch and known limits |
| Test Android | Select an available Android emulator/device; run the real app and test common screen sizes, navigation, keyboard, touch targets, offline/error feedback and persisted drafts | Device/OS, app version, tested journeys, screenshots/defects |
| Test backend | Configure project-isolated persistence and environment; run actual API tests for validation, ownership/reviewer permissions, lifecycle guards and payment reconciliation | Commands/results; no private data or secrets in logs |
| Build APK | Select EAS or local Android approach; configure an installable APK profile/signing as appropriate. Verify output is an APK rather than assuming a default store artifact is sufficient | Build configuration, command/job, output path, checksum/version |
| Verify final APK | Install the generated APK on Android, launch it, and repeat the complete core journey against the intended demo backend/data | Install/launch result, end-to-end results, residual limitations |
| Prepare demo | Show guest discovery/story/sources, creation/draft/resume/preview/submission, review outcome, backing/payment outcomes, progress/dashboard/activity and final report | Playable video of actual behavior and working delivery files/links |
| Submit | Check APK/video availability and Telegram destination with the user; no external submission is authorized by this initialization | Final artifact checklist and actual submission status when separately authorized |

Add exact commands only after their prerequisites and behavior exist and have been checked. Do not claim a build or demo works without inspecting the produced artifact.

## I. Returning in a future session

Treat these files as persistent context, not the conversation history. Follow the startup protocol, inspect actual code and current evidence, and preserve requirement IDs and decision history. Do not scaffold a replacement application. The final premium-correction directive reopens source after the bounded notification pass5 checkpoint, preserves the approved identity and adds the user-supplied logo/Home estimate relocation. Old APKs, screenshots and video retain their historical scopes. Create/photo pass6 closes bounded local verification; the pass3/pass5 matrix and pass6 focused route correction retain their exact scopes. Remaining P3 details, sustained performance, TalkBack/human testing and release work are separate follow-ups. Recording/production and demo campaign mutations require explicit human resumption; ordinary authorized screenshot and functional QA may continue. External release setup remains deferred.

## J. Current local development startup

The user authorized implementation after initialization. Continue routine local work under the existing architecture. Current visual sources are the [Showcase](artifacts/showcase-redesign/reference.png) for the app and the later [Create reference](artifacts/create-polish/reference.png) for creation; PDF workflows take precedence over conflicting illustration labels. Preserve compact Manrope, near-white Light, black/neutral-charcoal Dark and restrained mint. `DESIGN.md` and its sidecar describe the implementation. The earlier initialization-only stop is historical; recording and external release setup remain held.

The stack is Expo 55 / React Native 0.83 / React 19.2 / TypeScript / Expo Router / TanStack Query, plus FastAPI and local SQLite. Native sessions use SecureStore; scoped drafts and the separate `campaign:appearance:v1` device preference use AsyncStorage. ThemeProvider stays above session/query/navigation and preserves navigation/forms through changes. The later Auth-polish instruction changes only missing/invalid-preference fallback to Dark; saved Light/System values and all shared settings remain. Cloud services are not configured.

Start/reuse the local prototype from `E:\Campaign` with `start-local.cmd`; preview is http://localhost:8081, health http://127.0.0.1:8787/health and API schemas /docs. See [README.md](README.md) and [API setup](services/api/README.md) for dependency/run commands. `scripts/mobile.ps1` selects compatible Node; the system Node 20.9 is too old and bundled Node 24.21.0 is available. If discovery is blocked, set process-only `CAMPAIGN_NODE`. Use documented per-process PowerShell invocation rather than altering global execution policy.

**Profile-photo setup:** no new package or external account is required; existing `expo-image-picker` provides user-selected images. Restart only the project-owned API when applying the new code so the standard migration runner applies `005_profile_avatars.sql`. It adds a private image table without modifying existing accounts/campaigns/payments. Authenticated GET/POST/DELETE `/me/avatar` handles retrieval, normalized replacement and removal. Native app source lives in `features/profile/Photo.tsx`; never use public campaign uploads for account photos. Updated app configuration describes photo selection for both campaign and profile images.

[Pass12 native actions](artifacts/premium-quality/pass12/AUTH_FUNCTIONAL.json) verify full Login/Register buttons while the IME remains open in all four compact Light/Dark combinations, plus normal Dark Login; measured targets are 49.82–50.18dp. The native Register button surfaces invalid-email feedback. Guest browsing opens the five-tab public app and hides private notifications. Unchecked login returns to guest after process restart; checked login restores the original account/photo and 10/3/1 private counts. Inline mode links, hardware/header Back, Help/form preservation and saved draft-library access work. The held Ocean awareness preview QA draft was viewed without editing/submission. System preference and account restore through restart; Dark/original display are restored afterward. Exact captures 00–33 remain under pass12, with registration/isolation and live System follow-up also retaining their earlier pass10/11 scopes.

[Final diagnostics](artifacts/premium-quality/pass12/FINAL_DIAGNOSTICS.json) record 46 current-PID log lines with no matching fatal/JS error markers and confirm the installed APK hash. Package-specific exit/memory/frame captures remain bounded observations, not crash-free or sustained-performance guarantees. Original 1080×2400/density 440/font 1.17/IME 1/night mode and animation 0.5 values are restored. [Service restoration](artifacts/premium-quality/pass12/SERVICES_RESTORED.json) confirms the same Campaign API healthy and owned Metro 8081 running again, with only the selected phone’s USB 8787 reverse; an initial bounded health timeout resolved without duplicate restart. No unrelated device/service or recording action is implied.

The final review is bounded to actual opened captures and recorded interactions. Compact submission confirmation remains explicitly unverified. Human/TalkBack, additional hardware/orientations, fresh-install default behavior and sustained smoothness remain separate; preserved existing Light/System preferences are verified without clearing user data. Password recovery is truthfully unavailable locally. Production signing/hosting, current Telegram cutoff confirmation, the held video and external submission remain open or held. USB-local backend reachability is not hosted availability; no score or fictional engine verdict is used.

**Current premium setup:** Existing framework, commands and project-local SDK/USB workflow are unchanged. Use the pass12 gates/strict inspection and actual native records above; recording/external release remain held.

[Candidate scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json) retain every freeze, exact diff, build and physical matrix under its own hash. Pass1 covers creation; pass2 connected discovery/backing/Activity/report workflows; pass6 closes Home/compact Stats; pass7 proves optional Remember restart; pass9 captures the transparent-brand Auth composition; pass10 proves actual registration/isolation/restart; pass11 retains System/form checks. Pass3 was built but neither installed nor strictly inspected; pass5 built/inspected but never installed; pass8 was superseded unbuilt. Nine Create files remain source-identical from pass1, Home/Spotlight/Stats/Explore from pass6 and Session/writer from pass7, while later Screen/Auth/Profile keyboard changes are explicitly listed. This is source binding and bounded native evidence, not a wholesale final-hash rerun.

**Historical premium pass2 setup/checks:** no dependency, endpoint, migration, architecture or command change. The [81-input freeze](artifacts/premium-quality/pass2/SOURCE_INPUTS.json), digest `53c225eeb0a21e6e99f73001d42879dfd2b27773253c9cc9aefa7a1748016f42`, has zero drift; 82/82 frontend tests pass in 1130.3435ms with TypeScript/full ESLint/diff/public Expo config exit 0. Unchanged 13-input backend `622e55ee66c0872fb4a6e0a7d1f48b873e9ad0dd145fc6693b4a3d2eaa8bdecf` retains the current task's [35/35 isolated run in 14.300s](artifacts/premium-quality/pass1/BACKEND_CHECKS.json). Pass1's online Expo compatibility/Doctor 20/20 checks remain unchanged-dependency evidence. Pass2's offline compatibility check reports current dependencies but warns validation is unreliable offline; no new online Doctor run is claimed.

**Historical premium pass2 candidate:** [pass2 ARM64 APK](artifacts/android/premium-quality-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk), 48,099,087 bytes, SHA-256 `39CCA69AB9DFD634DF7F1F2F104ECC11520363CD1EB9C69EA4CC6D2B83EBD4CF`. [Inspection](artifacts/premium-quality/pass2/BUILD_INSPECTION.json) passes 42 exact compiled modules, five active artworks, fonts/licenses, ARM64/Hermes/Debug signing and actual `http://127.0.0.1:8787` initialization. [Brand binding](artifacts/premium-quality/pass2/BRAND_BINDING_SUMMARY.json) verifies the exact supplied source artwork, five byte-identical generated launcher WebPs and ten splash PNGs with exact decoded pixels. AAPT re-encodes PNG compression; packaged PNG byte identity is not claimed. Native appearance/workflow acceptance remains IN PROGRESS; USB-local access and Debug signing remain internal-test limits.

**Historical notification setup/checks:** no dependency, migration, endpoint or external account was added. Native `NotificationSheet.tsx` and shared `NotificationRow.tsx` use the existing `useActivity` recipient Query; `state.ts`/`useNotificationActions.ts` coordinate guarded read requests. [Pass5 checks](artifacts/notification-center/pass5/CHECKS.json) bind 81/81 mobile tests in 898.5777ms, TypeScript/ESLint/diff exit 0 and 78-input digest `4ce5ef5d…06535`. The unchanged 13-input backend `622e55ee…8bdecf` has a saved current-task [35/35 API run in 13.391s](artifacts/notification-center/checks/backend.log). [Final ARM64 APK](artifacts/android/notifications-pass5-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk) is 45,050,500 bytes/SHA-256 `430E65719BA17029B8C62B9AE4D6707D1EB502E9336A0B5B27738468322BDEB3`; strict binary inspection passes 40 compiled modules/assets/fonts/licenses/ABI/Hermes/Debug signing and actual `http://127.0.0.1:8787` initialization. [Actual launch](artifacts/notification-center/pass5/METRO_OFF.json) is cold 1,189ms/wait 1,211ms with Metro absent and a healthy selected-phone USB-local API, installed compatibly without data reset. Pass3's wider matrix and pass4's 1,104ms cold launch are not relabelled as wholesale pass5 reruns.

**Historical notification native evidence/restoration:** final pass5 checks the compact one-event sheet, actual failed read with unread retained, successful retry, B→guest→A identity recovery, five-event scrolling in Light/Dark, contextual campaign and all dismissal paths. Earlier pass2 compact Light and pass3 compact Dark/font 1.3, shared counts 22→21→20 and partial-batch 19→16→0 retain their scopes. [Current-PID diagnostics](artifacts/notification-center/pass5/FINAL_DIAGNOSTICS.json) contain 208 lines with no matching fatal; mixed QA frames 243/3,904 janky (6.22%), p95=17ms/p99=65ms are bounded observations. A separate [eight-transition Home↔Activity sample](artifacts/notification-center/pass5/NAVIGATION_FRAME_SAMPLE.json) adds 22/390 janky frames (5.64%); neither sample establishes sustained smoothness. [Restoration](artifacts/notification-center/pass5/SERVICES_RESTORED.json) confirms API healthy, Metro running, selected USB 8787, original 1080×2400/density 440/font 1.17/keyboard 1/transition 0.5 and Dark Home. No recording occurred. TalkBack/human testing, more hardware/orientations, sustained performance and external release remain open or held.

**Historical Create checks:** final pass6 has 64/64 mobile tests in 898.9374ms and TypeScript/ESLint exit 0 ([checks](artifacts/create-polish/pass6/CHECKS.json), [test log](artifacts/create-polish/pass6/frontend.log)). The unchanged 13-input backend snapshot retains 35/35 API tests in 13.323s, including four avatar cases. That API output was observed only in its completed tool session; no saved log or new backend rerun is claimed. The Windows sandbox stalled local event-loop socket creation before the first request, while the bounded isolated run outside it passed. Independent binary checks and actual phone results are separate evidence, not inferred from tests.

Use `scripts/android-local.ps1 -Mode InternalTest -ArtifactTag <new-tag>` with a new tag and the required ARM64 selection; follow [docs/ANDROID_LOCAL.md](docs/ANDROID_LOCAL.md). CNG generates native sources. Project-local SDK/JDK17/Gradle, per-process JVM temp paths and per-attempt TEMP/TMP isolation preserve earlier artifacts and avoid stale transforms without global cache deletion. The authorized POCO uses its scoped USB reverse on 8787 and `http://127.0.0.1:8787`; `10.0.2.2` is only for an emulator. Only the designated QA owner operates the explicitly authorized device. Require independent source/binary checks and actual Metro-off launch for each final candidate. USB proof does not verify LAN or hosted access.

Current directories include `apps/mobile/src` and `tests`, generated `apps/mobile/android`, `services/api` source/tests/migrations/local data/assets, `scripts`, `docs`, `tools/android-sdk`, `tmp` and ignored evidence under `artifacts`. Preserve locks, local data, existing drafts/accounts, prior APKs and the held footage. Performance, TalkBack/human testing, iOS/TestFlight, production signing and organizer connectivity remain separate gates.

Historical Create [pass6 Metro-off proof](artifacts/create-polish/pass6/METRO_OFF.json) records cold launch 1,483ms/wait 1,490ms with the API healthy and USB bridge scoped to the authorized phone. [Service restoration](artifacts/create-polish/pass6/SERVICES_RESTORED.json) confirms Campaign preview/API running again, original font scale 1.17 and final Dark Create entry. The Debug-signed APK and USB-local API remain internal-test delivery, not production hosting or signing.
