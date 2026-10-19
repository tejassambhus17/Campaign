# Local Android build and verification

## Current final release —1.5.1 / code 12

[Campaign.apk](../artifacts/final-submission-20261019/Campaign.apk) is the latest local dedicated-signed ARM64+x86_64 artifact,68,616,866 bytes; SHA-256 `928e6690df3f40198dcbd4f4cb3bbeb2cfdb195b2becc2902185a2c6f6006e60`. Tag `final-submission-confirmed-20261019` is used; never overwrite it. The existing Release workflow completed with normal vital lint and28 package checks;149 inputs match. Same-key owned API 36 emulator update/cold launch 1888ms occurred without Metro/reverse. Preserve the incompatible Debug-signed POCO; do not uninstall/clear its data. [Current QA scope](FINAL_SUBMISSION_CHECK.md). No SDK/key/backend change is needed. APK release upload is separate from source push.

## Latest creator assistance release — 1.5.0/code 11

[Signed APK and scoped evidence](../artifacts/creator-studio-20261019/README.md).
The existing Release build command produced the dedicated same-key ARM64+x86_64
APK with normal vital lint, embedded Hermes and unchanged HTTPS. Tag
`creator-studio-delivery-20261019` already exists; use a fresh tag for any later
build. No dependency, backend or signing change is required for these features.

After the authorized cleanup, one fresh owned `Campaign_Studio_36` API36 x86_64
AVD was recreated under task-local `tmp/creator-studio-20261019/avd`, serial
`emulator-5574`, dedicated ADB5039. Do not confuse it with the previously retired
AVD or touch default ADB/other devices. The final APK's compatible update,
1517ms cold launch, focused native checks and source/package checks have separate
receipts. The Debug-signed POCO remains incompatible: never clear or uninstall
its data to force a Release update. Physical/human acceptance remains pending.

## Current hierarchy release — 1.4.0/code10

[Current signed APK and evidence](../artifacts/dropdown-hierarchy-20261018/README.md). Use the established Release ARM64+x86_64 command and verified HTTPS endpoint with a fresh artifact tag; both dropdown-hierarchy-20261018 and dropdown-hierarchy-confirmed-20261018 already exist. Dedicated signing, normal vital lint and pinned native Print/core patches remain. Compilation, package inspection and installed interaction checks have distinct receipts. Never clear/uninstall the Debug-signed POCO to force a release update.

## Current release — 1.3.0/code8 final UI simplification

Current universal ARM64+x86_64 release and exact evidence are in
[release readiness](../RELEASE_READINESS.md). Build with the existing dedicated
key and unchanged HTTPS endpoint, using a new artifact tag:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/android-local.ps1 -Mode Release -Architecture 'arm64-v8a,x86_64' -ApiUrl 'https://campaign-api-cw8y.onrender.com' -ArtifactTag 'final-ui-accepted-20261018'
```

This named tag already exists; preserve it and use a fresh tag for future builds.
Normal vital lint and pinned Print/core patches remain enabled. Do not remove
buildFromSource or signer guards. A same-key update was checked on the owned
emulator; the Debug-signed POCO cannot accept this dedicated release without a
separately approved data/signing plan. Never uninstall/clear it to force install.

<!-- current-code6-evidence -->
## Historical release — 1.2.3 / code6

Use the existing commands below with a fresh artifact tag. Current ARM64
Campaign.apk is49,470,159bytes, SHA256
`19E7A02C19956A08CD2DD4896006A4C23A418AADAD132822EC384E08CB0FA75A`.
See [release readiness](../RELEASE_READINESS.md) for current exact x86/native,
signature, tests and pending physical acceptance. No Metro/reverse was needed.
The pinned Print/core source patches are reproducible through CNG/postinstall
and build guards; exact `buildFromSource` configuration prevents precompiled
AAR substitution. Source2 passed normal vital lint and actual SDK36 compilation.
Do not edit generated native files or bypass signer checks.
<!-- /current-code6-evidence -->

## Historical dedicated release — 1.2.2 / code 5, October18

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| [ARM64](../artifacts/android/final-completion-lifecycle-20261017/campaign-1.2.2-RELEASE-arm64.apk) | 49,453,767 | `BB7E889F4299E0534B8EF95F349CF1E8474FA7CA0877BEFDB4F5C14BE1BB65DF` |
| [x86_64 QA](../artifacts/android/final-completion-lifecycle-20261017/campaign-1.2.2-RELEASE-x86_64.apk) | 50,872,694 | `11755A1675CCD0264ADB661DD4D3EF916B220CA686599333891414AD02A2BC9A` |

Package remains `com.campaignamplification.mobile`, minimum API 24 / target 36,
display name Campaign, approved transparent launcher/splash and dedicated certificate
`ef0d218676ed3fa4f81033ebd9ec0c6d825017b60505c89f675b31ee6188db07`.
Both ABIs embed identical 2,417,328-byte Hermes and the verified HTTPS endpoint
`https://campaign-api-cw8y.onrender.com`; no Metro or USB backend forwarding is
required by this cloud configuration. Independent physical reachability remains untested.

The supported `expo-modules-core` 55.0.26 patch uses weak Activity identity to
rebind Activity results after host replacement. The rejected code 4 `fontScale`
configuration override is removed; ordinary Android font-change recreation and
scaling remain enabled. After recreation, Create can return to its entry: actual
Resume restores the saved Visuals step. Do not claim the editor route stayed mounted.
Cover/ad native pickers and cancellation, font 1.3 reflow, four section bottoms,
forward/reverse paging and reading retention have bounded current x86 evidence.

Build from `E:\Campaign` with the existing locked dependencies/project toolchain:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode Release -Architecture x86_64 -ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag <new-reviewed-tag>
powershell -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode Release -Architecture arm64-v8a -ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag <same-new-reviewed-tag>
```

Retain normal vital lint for current authorized QA. Reuse the dedicated protected
key through the established signing runbook; missing credentials must fail, never
fall back to Debug. Preserve all previous artifacts. The manual encrypted
off-device key backup remains pending; do not rotate the key to bypass recovery.

[60 package/source checks](../artifacts/final-completion-20261017/activity-lifecycle-fix/RELEASE_BUILD_VERIFICATION.json),
25 branding-pixel/15 launcher-byte matches, [bounded secret scan](../artifacts/final-completion-20261017/activity-lifecycle-fix/RELEASE_SECRET_SCAN.json),
314 frontend tests and TypeScript/full-source lint pass. [Current freeze](../artifacts/final-completion-20261017/activity-lifecycle-fix/RELEASE_SOURCE_INPUTS.inspection-final2.json)
has 123 runtime / 36 test / 6 build / 161 native dependency / 9 inspection inputs,
with zero recorded drift. These are recorded checks, not a new run by this documentation task.

The main `Campaign_Release_36` / emulator-5574 and fresh
`Campaign_Final_122_Fresh_36` / emulator-5582 use the existing ADB 5039. The [fresh receipt](../artifacts/final-completion-20261017/activity-lifecycle-fix/fresh-native/FINAL_FRESH_QA_SUMMARY.json)
passes 24/24 installation, Welcome/carousel, Guest/Home/Profile checks, with
2,602 ms cold Activity launch, no Metro/reverse and 265 sampled app-process lines
with zero listed error markers. This is not idle-host latency or crash-free proof.
The fresh AVD was gracefully stopped with userdata preserved; do not treat this
runbook as an instruction to start/stop a device or reset shared ADB.

The exact x86 native journey and local QA-received [USD](../artifacts/final-completion-20261017/activity-lifecycle-fix/pdf/render-usd/PDF_REVIEW.md)/[INR](../artifacts/final-completion-20261017/activity-lifecycle-fix/pdf/render-inr/PDF_REVIEW.md)
PDFs now have their separate bounded evidence. Final film/playback/privacy/audio
acceptance, physical ARM64/disconnected mobile data, human usability and external
recipient/submission acceptance remain open. The preserved POCO Debug installation
cannot accept the dedicated signer as an update: no uninstall, storage clear,
package rename or security bypass is authorized. Release signing alone cannot
remove Android unknown-source or Play Protect warnings.

Backend commit `04e206a177a2450ec68bb3dae20f487b75847493`, existing Free providers
and auto-deploy-off remain unchanged. No new backend deployment is needed for this
native correction. Earlier APK/QA/hold paragraphs below retain historical scope.

## Historical dedicated release build — October17, version 1.1.0

The current distinct artifact is
[Campaign-1.1.0-release-arm64.apk](../Campaign-1.1.0-release-arm64.apk),
49,393,005 bytes (47.10 MiB), SHA256
`2BC46C23E395C8BA5DEFC72EC1B92C09EFBFDEF6767A7AAAB1B5518D7485DAB9`.
It is genuinely signed by the dedicated Campaign certificate, not Android Debug:
SHA256 `ef0d218676ed3fa4f81033ebd9ec0c6d825017b60505c89f675b31ee6188db07`,
RSA3072/`CN=Campaign`, valid through 2054-03-04. Identity remains
`com.campaignamplification.mobile`, version 1.1.0 / code 2, Campaign display name,
approved transparent icon/splash, minimum API 24 / target 36 and ARM64 only. The
separate x86_64 QA build uses the same version/key and identical Hermes.
Original Debug-signed [Campaign.apk](../Campaign.apk), 47,718,998 bytes / SHA966E…F47D,
is preserved unchanged.

The earlier dedicated E555 ARM64/D8EB x86 candidates remain preserved under
`artifacts/android/trust-release-final-20261017/`; their original39-check,
109-input and startup reports are historical. New-binary acceptance uses the
visual-final tag/freeze and receipts below, not those earlier results.

This correction adds pinned Expo55-compatible `react-native-svg` 15.15.3 and
`lucide-react-native` 1.59.0. Install the existing locked dependencies before CNG
regeneration; the native SVG module requires rebuilding the APK. The licensed
Lucide shield replaces the heavy square font glyph, with a fine stroke, wrapped
classification and normal-flow large-text fallback. Full Lucide ISC and SVG MIT
licenses are copied by the source-controlled plugin and matched to installed
package license bytes. [Fresh visual confirmation](../artifacts/trust-release-20261017/VISUAL_REVIEW.final.md)
resolves the earlier P1 proportions/stroke and P2 outline-crossing label in
Dark/Light and font scale 1.3. This is bounded screenshot acceptance, not every state.

Use project-local tools and a fresh artifact tag from E:\Campaign:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\configure-android-release-signing.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode Release -Architecture x86_64 -ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag <fresh-reviewed-tag>
powershell -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode Release -Architecture arm64-v8a -ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag <same-reviewed-tag>
```

Normal vital lint remains enabled. Release mode uses the source-controlled
`withCampaignReleaseSigning.cjs` CNG plugin, clears the generated Debug release
binding, requires the dedicated credentials and verifies the output's exact
certificate. Missing/unreadable signing material fails before a release artifact
is published; no Debug fallback is allowed. InternalTest/CloudTest remain their
historical test-signing modes, not aliases for the dedicated release.

Ignored `E:\Campaign\tmp\android-signing\` holds the JKS, Windows DPAPI
CurrentUser CLIXML credentials, public receipt and verified same-machine backups,
with owner/SYSTEM-only directory ACLs. Do not move these into generated Android
source, Git, server configuration or the APK. The human-operated hidden-password
PKCS12 export and encrypted off-device backup remain pending. Follow
[ANDROID_RELEASE_SIGNING.md](ANDROID_RELEASE_SIGNING.md) for the concrete
backup/recovery procedure; copying DPAPI credentials to another computer is
insufficient and must not trigger replacement-key generation.

The [final freeze](../artifacts/trust-release-20261017/RELEASE_SOURCE_INPUTS.visual-final.json)
contains 111 runtime / 33 test / 6 build-script inputs and remains byte-identical after
both builds. 279 frontend tests, TypeScript/full-source lint, ARM64/x86 builds
(1m16s / 2m17s) and [44/44 package/source checks](../artifacts/trust-release-20261017/RELEASE_BUILD_VERIFICATION.visual-final.json)
pass. Both bundles are 2,374,232 bytes, SHA256
`A340EA0C42C37EBBCBE1A845E189037C594E03BE37FB068BE79A827C42D2DC35`;
77 compiled modules, actual packaged HTTPS assignment, dedicated v2 signatures,
native SVG libraries, exact compiled licensed shield module, 16KB ZIP alignment,
six fonts/four full license texts and 25 branding pixel / 15 launcher byte matches
are checked. Every 1244-member APK was compared against 10 known Campaign server/
signing values with 0 matches. These are bounded
checks, not a comprehensive security or performance audit.
The merged manifest requests Internet, network-state and the app-owned signature
receiver permission. Unused camera/audio/storage/overlay, vibration, biometric/
fingerprint and install-referrer capabilities are not requested by this APK.

The final B199…0D5C x86 release accepted a same-key, data-preserving update on
`Campaign_Release_36`,
Android 16 / API 36 / x86_64, serial **emulator-5574**, console 5574 / transport 5575,
existing ADB5039, cold launch 2106ms/wait2109ms. The
[update receipt](../artifacts/trust-release-20261017/RELEASE_EMULATOR_UPDATE.json)
binds its old D8EB and new B199 hashes without uninstall/storage clear. Root owns
the broader workflow QA; this startup does not establish whole-app acceptance.

A second genuinely fresh `Campaign_Release_Fresh_36` used **emulator-5576**,
console 5576 / transport 5577, project-owned userdata under
`tmp/trust-release-20261017/fresh-release/`, and the same existing ADB5039.
[Its 16/16 checks](../artifacts/trust-release-20261017/FRESH_VISUAL_RELEASE_NATIVE.json)
verify package absence before clean install, exact installed B199 hash, no Metro/
USB reverse, Welcome buttons/logo and real mountains→coast→turtle swipes,
reverse swipe and indicator selection. The initial cold launch was 5908ms/
wait6004ms and an Android **System UI** ANR overlay blocked capture. Campaign
remained top-resumed with an empty crash buffer; one observed Wait recovered the
overlay without restart/reinstall/data clear. Three app-only images were opened;
450 app-process log lines contain 0 listed fatal/JS/native-view or skipped-frame
markers. The ANR remains a documented environment limitation, not a hidden pass
or a claim of general smoothness. 5576 was gracefully stopped with userdata
preserved; 5574, phone and shared ADB server were unchanged. Host process/TCP
inspection needs the established elevated context because the sandbox can hide
real listeners. Always verify server version; never replace a hidden server.

The earlier [first-release launch](../artifacts/trust-release-20261017/RELEASE_EMULATOR_FIRST_LAUNCH.json)
is D8EB-only historical evidence, not proof of the final visual binary. Current Free backend
`cbd4f90d5108f40beb8474813cc42d475f095354` is live with additive migration 007;
[243/243 cloud checks](../artifacts/trust-release-20261017/cloud-rollout/CLOUD_ACCEPTANCE.json)
verify explicit 20-demo / 22-public rollout coverage and original rows across 13
tables preserved, Free plan/auto-deploy off and public HTTPS. The shield-only
frontend rebuild required no additional backend deployment. See
[TRUST_ROLLOUT.md](TRUST_ROLLOUT.md) for scope/rollback; native and physical release
acceptance remain separate.

**Do not install this release over the phone's existing Debug-signed package.**
The certificates differ; normal Android update compatibility is absent. Do not
uninstall, clear storage, rename the final package or bypass verification.
Physical release installation remains pending separate explicit migration/fresh-
install authorization. Account data does not prove device-only drafts are safe.
Release signing does not eliminate unknown-source/Play Protect warnings.
Recording, paid resources and Play/organizer submission remain held.

## Historical Profile/paging/filter deliverable — October17

Current [Campaign.apk](../Campaign.apk) is the ARM64 build from
[profile-flow-fixes-20261017](../artifacts/android/profile-flow-fixes-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk):
47,718,998 bytes, SHA256
`966E629B902555102A490816DDB1932330E8E41BADC1B23DC20894BF21F1F47D`.
Use `scripts/android-local.ps1 -Mode CloudTest -Architecture arm64-v8a
-ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag profile-flow-fixes-20261017`
with the existing bundled Node/SDK/JDK. x86_64 was also built with the same tag.
Both builds pass normal vital lint and embed identical Hermes; the independent
30/30 audit verifies current source, HTTPS binding, signing, name and logo.
Frontend259/259, TypeScript and full-source ESLint pass.

Actual POCO checks pass55/55 after compatible install-r and exact installed-hash
verification. Android15/API35/ARM64 uses original Dark/USD/font1.17/density440,
with the prior guest session restored. Guest/auth/Back, native Activity/My
Campaigns swipes, staged floating filters and full INR presets were checked.
Cold launch977ms has no USB reverse;152current-PID lines contain0listed fatal/JS
or skipped-frame warnings. Exact authorized serial `tkkrlvqklzydbuh6` was found
on the existing5039 server;5037's version guard prevented a restart. Select only
the authorized serial after a read-only server-version/transport check; server
port is observed runtime state, not permission to stop or replace a shared ADB.

The matching installed x86_64 emulator passes73/73effective checks, including
font1.0/1.3 labels. A late unclassified emulator/automation stall remains:46
skipped-frame warnings/0fatal-JS markers, optional enlarged overlay/finalfont/UI
readback pending. The phone result does not resolve that emulator limitation.
The old APK is preserved and the new root Campaign.apk hash is verified. See
[the task report](../artifacts/profile-flow-fixes-20261017/COMPLETION_REPORT.md)
and [physical-test record](../PHYSICAL_ANDROID_TEST.md) for exact limits.
No backend redeployment, data reset, signing rotation or cloud change is needed.

## Historical final Campaign / clean auth — October17

[Prior auth-clean APK](../artifacts/android/final-campaign-auth-clean-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk) was the previous ARM64 deliverable:
47,705,118 bytes, SHA256
`1D36B4C1BF8BDAEB1E5D773FF8E20641499561FB323D0A793366F856E672344C`.
Build with the existing CloudTest command/current HTTPS URL and artifact tag
`final-campaign-auth-clean-20261017`. Normal vital lint passed; final ARM64 and
x86_64 embed identical Hermes. The guest Profile no longer appends Settings below
Welcome/Login/Register; Help and signed-in Profile retain device Settings.
Actual POCO installation/hash/cold launch, clean auth screens and installer
name/logo are recorded in [the final report](../artifacts/final-delivery-20261017/COMPLETION_REPORT.md).
Campaign was absent for its active Android user before the final standard
install-r; no agent uninstall/storage clear occurred. Existing debug signing
remains internal-test signing. Preserve prior APKs and use the exact authorized
transport/server guard described below. No further backend deployment is needed
for this auth-only correction.

## Historical native-pager candidate — October17

Current [ARM64 CloudTest](../artifacts/android/native-pager-final-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk)
is47,705,774bytes, SHA7C1682A1975DB888E2D84F05517B9491F3B3FCA48E0B24EB15DB93C6A44F0329.
New Expo55-compatible native pager8.0.0 is locked in mobile dependencies. Existing
android-local.ps1 regenerates CNG when package/lock fingerprint changes; do not
reuse old APK/native binaries for the new pager source. Build with CloudTest,
arm64-v8a, current HTTPS URL and a fresh ArtifactTag. No signing rotation.

Both final ABIs contain identical embeddedHermes; source freeze94/zero drift,
normal ARM64 vital lint passed. Actual authorized POCO install-r/hash/cold launch
without Metro and native section/Explore gestures passed. Separate emulator covers
all categories/font1.3. PHYSICAL_ANDROID_TEST.md and the scoped completion report
separate these bounds from unverified matrices. Use existing ADB only after a
read-only host:version guard (SDK41 requires0029); abort on mismatch to avoid
adb's implicit server restart. Never kill shared ADB or clear/uninstall phone data.
Older four-area candidate below is historical.


## October17 four-area candidate — bounded phone and emulator verification

Current [ARM64 CloudTest APK](../artifacts/android/four-area-polish-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk):
**47,565,328 bytes**, SHA-256
`CD7E775787FEAB1473C9198492A7A65F045D09B068E0C97C0B63F9ACE988B5BC`.
179/179 frontend tests, TypeScript/full-source ESLint exit 0 and Gradle success
in 1m45s including normal vital lint. Package identity, existing Android Debug
certificate, embedded Hermes and current Render HTTPS configuration remain.
Use the existing CloudTest command with `-Architecture arm64-v8a` and a fresh
artifact tag for a later authorized build; prior APKs remain preserved.

The authorized POCO `tkkrlvqklzydbuh6` (2312FRAFDI, Android15/API35/ARM64)
reconnected after initial emulator QA. On its existing **ADB5037** transport,
compatible [install -r](../artifacts/four-area-polish-20261017/INSTALL-phone.log)
returned Success, preserving the signed-in session and existing Untitled draft.
Selected Dark/font1.17 and Light/font1.3 checks cover all four compact tour cards,
blocked underlying Create, Android Back dismissal, manual-first entry and
separate optional-cover/ad controls. A fictional **Four Area Phone QA** draft
remained local: distinct ocean-cover/forest-ad URL previews survived picker
cancel and Activity recreation/resumption. Enlarged-text scrolling reached Add
ad image and existing public-URL/manual-generation controls. No signup/logout,
account save, submit or actual media upload was performed.

Do not sign out or reset phone storage to force Welcome. Its physical gestures
remain UNVERIFIED; fresh isolated Android16/API36/x86_64 `Campaign_FourArea_36`
supplies the complete mountains→coast→turtle swipe/caption/dot/boundary/vertical
scroll/no-completion evidence. Mounted Welcome retained turtle through a
System→Light change. Font-scale changes recreated Activity and fresh Welcome
started mountains; no same-mounted reset is inferred. An emulator UIAutomator
idle failure on the enlarged funding tour card was worked around using direct native capture
and observed taps; it was not an observed Campaign crash.

The [independent visual review](../artifacts/four-area-polish-20261017/VISUAL_REVIEW.md)
returns bounded `ship` for the emulator packet and fourteen physical captures.
[Final device proof](../artifacts/four-area-polish-20261017/FINAL_DEVICE_STATE.json)
at 11:06 UTC matches each installed ABI package to its artifact. Cross-ABI Hermes
is identical, SHA `6A28E5229EF810DB805179320944B183D2FA614849D489164D0B94DBD964C041`;
81 frozen inputs have zero drift. The signed-in phone ends at Dark Home,
font1.17/density440/OS night=yes with unchanged 3 unread. Metro8081 listener count
is 0 and both reverse lists are empty. Current-process samples include 108 phone/
58 emulator log lines and no matching fatal/uncaught-JS markers; this is not
crash-free or sustained-performance proof. [Native results](../artifacts/four-area-polish-20261017/NATIVE_RESULTS.json)
register 38 PNGs and 10 actual carousel cases, including −30px vertical photo movement.
[Physical report](../PHYSICAL_ANDROID_TEST.md) owns exact interactions. Earlier unavailable-phone records are historical initial scope,
not the final result. Physical Welcome, TalkBack, other devices/orientations,
upload/cloud, sustained-performance and production acceptance remain separate.
No cloud restart/deployment, migration, billing, recording, publish or submission.
Existing source start ref `refs/checkpoints/four-area-start-20261017` is
`6f5f2e22b020464e97cb1cc97b649796b631bfe5`; older candidate sections below retain
their original scope and do not override the current ADB5037 instruction.

## October17 optional walkthrough candidate — normal QA resumed

The latest user brief explicitly supersedes the older compile-only restriction
below for this task. Tests, native builds, isolated emulator fresh-state cases
and bounded checks on POCO `tkkrlvqklzydbuh6` using its existing ADB5037 are
authorized. Never clear/uninstall phone data or restart unrelated ADB servers.

Current [ARM64 CloudTest APK](../artifacts/android/walkthrough-final2-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk):
47,560,608 bytes, SHA `15BABC5418570A69654737DAAA9D2A705BFD4A9AD830E8BA255125212DD8E8B7`.
Gradle succeeded in47s including normal vital lint; package identity and Android
Debug certificate remain compatible. Embedded Hermes and existing Render HTTPS
are checked, with cleartext and saved local overrides disabled. Earlier APKs
remain preserved. See [candidate-specific phone/emulator evidence](../PHYSICAL_ANDROID_TEST.md)
and [current readiness limits](../RELEASE_READINESS.md). Do not reinterpret
historical localhost/emulator-only/Metro instructions below as current cloud setup.

The optional tour is replayed through Help → Take the app tour. Its single
versioned device-local record is independent of Welcome, session and drafts.
Do not reset phone storage to reproduce first-run behavior; use an isolated AVD.
No cloud deployment/restart, migration, billing, recording or submission.

## October17 actual phone continuation

The latest explicitly authorized physical pass used the existing **5037**
transport for POCO `tkkrlvqklzydbuh6` only. Do not stop/restart other ADB servers
or use an emulator to reproduce its evidence. The final corrected artifact is
`artifacts/android/native-icons-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk`,
SHA `41103294718087AD471BF341CA6BC75F6169D0E171D645B0B051BD527C6AE338`.
The same pipeline used `-ArtifactTag native-icons-20261017 -SkipLint`;
TypeScript/Gradle compilation passed. The existing root font gate additionally
preloads Ionicons to avoid the observed first-frame missing icons.

Actual compatible `install -r` succeeded and installed/source hashes match.
Cold launch worked without Metro8081 or USB reverse and loaded the existing
Render HTTPS backend. Do not use emulator-only10.0.2.2. The cable was attached;
this is not disconnected/laptop-off proof. [Physical report](../PHYSICAL_ANDROID_TEST.md)
and [final device state](../artifacts/physical-brand-polish-20261017/FINAL_DEVICE_STATE.json)
record workflow evidence, restored font1.17/density440 and remaining acceptance.
No uninstall/data wipe, signing change, security bypass, backend change,
deployment or recording occurred. Older build-only prohibitions and5039
instructions below apply to their historical passes, not this resumed test.

## October17 launcher/splash follow-up

Use the same CloudTest pipeline with `-ArtifactTag brand-polish-buildonly-20261017 -SkipLint` for
the new approved-logo candidate. Native regeneration now fingerprints brand
files as well as config/plugins/packages. Adaptive icon insets are owned by
`withCampaignBranding.cjs`, not manual Android resource edits. The existing
Debug signing key and HTTPS-only configuration remain; unused overlay and
legacy storage permissions are blocked. `-SkipLint` explicitly excludes the
three vital-lint tasks that Gradle normally schedules with release assembly.
The earlier first attempt ran those implicit tasks; see
[branding/package report](BRANDING_AND_ANDROID_WARNINGS.md). This pass remains
build-only; do not infer warning removal, installed appearance or runtime
acceptance from compilation. No device access is needed or authorized here.

## October17 unattended final-polish build

The current task permits only source changes and compiler/package checks.
Do not use ADB, install/execute the new APK, capture screenshots, run tests or
probe/restart/deploy the backend for this pass. The build keeps the Render
HTTPS URL, package, assets and Debug signing material. See
[FINAL_POLISH.md](FINAL_POLISH.md) for its artifact path/status and the
separate pending human-acceptance gate. Older physical evidence below applies
to its own earlier APK.

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
