# Android delivery readiness

The PDF requires an Android APK and a complete demo video (pp. 23-24). Both final local INTERNAL-TEST APKs now exist with embedded JavaScript. The exact final x86_64 artifact passes its installed Metro-off launch/API-recovery gate. The complete native normal core journey and full 22-scene film now pass their recorded local checks, including uninterrupted muted playback and bounded encoded privacy review. External delivery and broader human/device acceptance remain separate. No Expo/EAS account, cloud deployment, production signing key or external submission was used.

## Current artifacts

| Artifact | Bytes | SHA-256 | Acceptance |
| --- | ---: | --- | --- |
| [Final x86_64 APK](artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk) | 38,414,397 | `638807B4095BB537574E719A5EB537E428735C3100BAE683F54BE92B5B4C6EA4` | Installed Metro-off cold launch, connection controls, offline save/recovery and scaled payment docks pass; complete native core journey and film/full muted playback pass; human/physical/external limits retained. |
| [Final ARM64 APK](artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk) | 37,126,539 | `4B7ACD6F0D7EFA4F7C43E81C427CBA3EB932805BA257243172832774F537B94C` | Compile/binary inspection only; no physical ARM64 device tested. |
| [Full native demo MP4](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) | 28,581,318 | `63D6DAA6823BCEC6E1F8E166977C0880E043BDD5A2A57612EBC30D57730F1358` | 580.121354s/22 scenes; full muted playback and bounded encoded-frame privacy/readability review pass. |

Adjacent [x86_64 metadata](artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk.json) and [ARM64 metadata](artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk.json) record actual checks. Each replacement APK build passed in 38 seconds, 359 Gradle tasks (x86_64: 30 executed; ARM64: 28 executed). Both are non-debuggable release variants signed with the **Android Debug certificate**, labelled INTERNAL-TEST. They are not production/Play Store signing.

## Reproduce the local builds

Run from `E:\Campaign` after source freeze:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode InternalTest -Architecture x86_64 -ApiUrl http://10.0.2.2:8787
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode InternalTest -Architecture arm64-v8a -ApiUrl http://10.0.2.2:8787
```

The x86_64 command targets the local Android emulator. The `10.0.2.2` host alias does not work on a physical phone. In explicitly flagged internal builds, Profile exposes the existing **Demo connection settings** so a reachable local API can be selected. Alternatively, pass its actual reachable address at build time. A physical device and organizer connectivity still require separate checks; a local backend is not an organizer-accessible hosted service. Never put account passwords, API secrets or receipt capabilities in `EXPO_PUBLIC_API_URL`.

Use `-Architecture 'arm64-v8a,x86_64'` for a combined APK. Omitting `-Mode InternalTest` retains the existing debug mode and artifact names. The launcher uses process-local `CAMPAIGN_INTERNAL_TEST=1`, `EXPO_PUBLIC_INTERNAL_TEST=1` and the explicit API URL for internal builds; both flags are `0` in normal/debug mode. It restores prior environment values on exit and changes no global Java, Node, SDK, Gradle or PowerShell settings.

`app.config.ts` consumes Expo's static ConfigContext and preserves `app.json` metadata/plugins. The gated CNG plugin sets the main-manifest HTTP allowance only in InternalTest mode and removes it in normal mode. CNG copies both full font licenses into native assets in either mode. Native generation is configuration-driven; generated sources are not hand-edited. Mode/config/plugin/license fingerprints under `tmp/android-build` prevent reuse of the wrong generated policy. Only the release JavaScript bundle task is explicitly rerun before release assembly so changed API/flag values cannot silently reuse stale JavaScript while native compilation benefits from cache.

PowerShell/plugin parsing and normal/internal Expo introspection passed, preserving all original static values and four existing plugins. The initial static/dynamic-config Doctor warning and required-name TypeScript error were corrected. Current TypeScript, lint and Expo Doctor 20/20 pass after the packaging plugin; the final Profile guard change also passed TypeScript/lint and normal web/Android exports. Normal export hashes were unchanged because that internal-only branch is removed in normal mode. The existing 34 frontend and 30 backend behavioral tests passed in this run. These checks do not stand in for installed final-artifact acceptance.

## Independent binary inspection

Both final APKs contain package `com.campaignamplification.mobile`, version1.0.0, compile/target SDK36 and the requested actual native ABI. No debuggable marker, Camera or Record Audio permission is present. The merged main manifest permits the expressly local demo HTTP API. Actual signature verification reports `CN=Android Debug` and certificate SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.

Both contain byte-identical **1,993,336-byte Hermes bytecode**, SHA-256 `6a5f7073b8c245bf7e126bcea316b3b565debe75ebfdc126160ad93ca1db98a9`, at `assets/index.android.bundle`. Inspection verifies its Hermes magic, compiled `http://10.0.2.2:8787` address and **Demo connection settings** text. All six bundled Manrope/Newsreader TTFs match exact source bytes/SHA-256 despite optimized resource names. Both full OFLs match exact source bytes at `assets/licenses/Manrope-OFL.txt` and `assets/licenses/Newsreader-OFL.txt`. Font bytes are unmodified; missing/mismatched fonts/licenses fail the launcher.

All 46 frozen source/asset/plugin/config/lockfile records still match [the final input manifest](tmp/android-build/internal-test-frozen-inputs.json), digest `09ddd08ecd34798b00654db8192e690aa3565bdf446c657e16a0b3a3431f370a`. Relative to the preceding packaged snapshot, only the existing Profile guard changed to enable connection controls under the explicit internal flag. Build logs are [x86_64](tmp/android-build/assemble-INTERNAL-TEST-x86_64.log) and [ARM64](tmp/android-build/assemble-INTERNAL-TEST-arm64.log).

## Historical initial internal acceptance

The [initial-build archive](artifacts/android/internal-acceptance/initial-build/ARCHIVE.json) preserves the prior APKs, metadata, logs, source snapshot and native captures. Their root artifact paths were replaced only after safe archival. The initial x86_64 build was 38,413,537 bytes, SHA-256 `B15ECFF1F9A3BA713DDB7D54A123F6A0889C9487279176B4F6B87F4AD1BAB998`; initial ARM64 was 37,125,679 bytes, SHA-256 `75BACC147245E801412992A153516C09F659038F7775E569C21331E9AE3D0F8A`. Archived metadata retains original build-time path strings; ARCHIVE.json maps those to the preserved copies.

The [initial native results](artifacts/android/internal-acceptance/initial-build/INITIAL_BUILD_RESULTS.md) belong exclusively to that B15 x86_64 hash. On the owned Android 16 / API 36 emulator, cold launch with Metro stopped and an empty device reverse list rendered bundled fonts/photography and real API-backed discovery. SecureStore session restoration, restricted Review access, normal logout/private-feed/badge removal, separate guest drafts, Save/Back/process-restart/Resume and four native non-success $5 payment outcomes passed. Forest funding stayed $1,845 after each outcome. Root's [scoped Metro-stop proof](artifacts/android/internal-acceptance/initial-build/internal-metro-off.json) records the verified Campaign listener only; API/device were preserved.

That initial build hid Demo connection settings in release mode. The replacement builds fix the actual configuration gap with the explicit internal flag; fresh final-x86 launch/control checks now pass below. The archived proof is not automatically attributed to a replacement hash. The initial restricted-network attempt stopped before APK production on an uncached declared official Maven dependency; the approved-network retry passed. No builder stopped API, Metro, AVD or ADB.

## Final x86_64 installed acceptance

The [final native record](artifacts/android/internal-acceptance/final-build/NATIVE_RESULTS.md) binds all eight inspected captures to the exact 638807 replacement hash. A [fresh launch gate](artifacts/android/internal-acceptance/final-build/metro-off-before-launch.json) proves no Metro8081 listener and healthy API8787 before cold launch. Home rendered bundled fonts/photography and all five tabs. Native Demo connection controls were visible; switching only the client to 10.0.2.2:8788 produced an honest Explore error/Try again. The guest draft explicitly saved offline with unchanged title; restoring 10.0.2.2:8787 automatically recovered nine campaigns/photos.

At 360 logical pixels/font scale1.3 the choose/review docks wrapped into complete two/three-line actions without clipping/overlap; no payment was made in these scaled checks. Density 440/font 1.0 was restored. The final-process-only log has zero matches for the documented fatal/ReactNativeJS/type/invariant patterns; ordinary platform renderer messages are not an exhaustive zero-warning claim. Device reverse list remained empty. At that acceptance checkpoint the AVD/dedicated ADB remained active for capture and Metro stayed off. Final cleanup and later restored preview are recorded below.

Only final x86 metadata is now `requiresMetro:false`, `metroIndependentLaunchVerified:true` and `internalTestConnectionControlsVerified:true`, backed by exact-hash runtime proof. ARM64 remains unknown/uninstalled. Initial B15 authentication/logout/payment evidence retains its own hash. Final ordinary-account persistence, actual media uploads and successful lifecycle now pass the separately recorded core journey below; the completed film/player checks are recorded below.

## Final native core journey captured

The [native capture record](artifacts/demo/NATIVE_RESULTS.md) documents all 22 prescribed scenes on the exact final x86_64 APK with Metro off. The ordinary **Open Chapter Demo** account actually created and backed the same fictional **Open doors to local learning**, `cmp_5ad91d8cd9fd4f26505d9d23`. Its SecureStore session survived an off-camera force-stop/cold launch. Credentials were entered only while recording was stopped; the selected film later passed bounded privacy review, including critical cut boundaries.

Native actions include manual Basics/explicit save/library/resume/Back, all five steps, actual licensed Story/cover/ad picker uploads with separate identities, caption/credit/Bold/article/public contextual source, ad preview/Reach and full preview. The goal remained unset through Reach and was entered10 only at Submit, followed by consent/submission. A separate reviewer inspected, approved, then separately published. The same ordinary creator/backer made one successful simulated10 payment (`pay_0fb60def0596700682343cdc`), saw the private inline receipt,10/10 funding with spend0, Created/Backed/Saved/Payments and named Activity/read/filter states.

Native reviewer preparation, explicit setup/start, progress and completion were distinct actions. The ordinary final report agrees with root's read-only [funding](artifacts/demo/public-funding-root-check.json) and [completion/accounting](artifacts/demo/public-completion-root-check.json) checks: raised10, fee0.50, allocated9.50, simulated spend9.02, refund/unspent0.48, one contribution, estimated256 versus simulated219, measured unavailable,328 impressions,7 clicks and14 days. The five Story/report proof PNGs were opened and visually inspected during reconciliation. No API/SQL state injection or real money/advertising is claimed.

This closes the exercised normal native core journey for this hash. Native assistance/non-success cases retain their earlier scopes; native correction/rejection/revision variants, physical devices and human/screen-reader acceptance are not implied. Captured scenes alone did not verify an edited video; actual assembled-film checks and final logout/cleanup subsequently passed as recorded below. Final x86 metadata separates performed native actions, film checks and cleanup; ARM64 has no installed proof.

## Complete film acceptance and final cleanup

The [stable final MP4](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) is byte-identical to the reviewed assembly, SHA-256 `63D6DAA6823BCEC6E1F8E166977C0880E043BDD5A2A57612EBC30D57730F1358`. It is 580.121354 seconds, 720x1520/30fps H.264 with AAC narration. [Metadata](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4.json), [chapters](artifacts/demo/campaign-native-demo-INTERNAL-TEST.chapters.txt) and [transcript](artifacts/demo/campaign-native-demo-INTERNAL-TEST.narration.txt) accompany the actual 22-scene film. Full decode passes; objective audio checks are distinct from listening.

Root's [full Chrome playback](artifacts/demo/PLAYBACK_RESULTS.json) ran continuously from 0.015998 to 580.121354/ended, no media error or seek/restart, over 589.163 wall seconds. Playback was muted: human listening/intelligibility and exact synchronization remain unverified. The [independent encoded-frame review](artifacts/demo/VIDEO_REVIEW.md) inspected all 22 scene-middle frames plus 52 full-size/critical-boundary frames and verified 124 image hashes. No critical contradiction, unreadable required state or exposed credential/capability was found within inspected frames. The raw Profile/email interval was excluded by checked cuts; every-frame privacy was not claimed. These are actual accepted local film checks, not a general privacy/usability certification.

The [final cleanup](artifacts/demo/cleanup/README.md) used normal ordinary-account Sign out. Guest Profile is blank with no private dashboard/Review; Activity has no private feed/badge; the separate Native Community Library guest draft remains without the account's campaign. All four cleanup PNGs were inspected by the executing native agent; reconciliation also opened Profile/Activity/drafts. Current-process PID14899's checksum-bound 763-line B-F/cleanup log has zero listed error patterns; earlier guest A/overwritten lines/all branches are excluded. Density 440/font 1.0 remained restored.

Only the verified owned AVD/dedicated ADB5039 were stopped. [Proof](artifacts/demo/cleanup/after-shutdown.json) shows 5039/5560/5561 closed, API8787/PID9996 healthy and the unrelated default5037 listener unchanged/no commands. Metro was off throughout native capture/cleanup. Root later [restored preview8081](artifacts/demo/LOCAL_RUNTIME.json) with HTTP200 and API healthy, and stopped the temporary player8791. No unrelated service was stopped.

The local APK/video production requirement is verified within these scopes. Final files are the intended APKs/MP4 and their relevant companion metadata; local raw captures, private credentials, logs and tooling directories are not submission attachments.

## Remaining acceptance and delivery

- Final ARM64: binary inspection passes; physical-device launch/backend reachability remain unverified even though JavaScript is byte-identical to x86_64.
- Human audio listening/intelligibility/synchronization and every-frame privacy remain unverified. The full film exists and passes the scoped player/frame checks above; the earlier 45-second Activity rehearsal remains historical.
- Final delivery: local hashes/files/links are checked; resolve the organizer's backend-access arrangement and obtain/observe authorization for actual submission. No Telegram join/upload/send has occurred. Hosting/EAS/accounts remain deferred; TestFlight is conditional.
- Existing production review items remain open: uploaded draft images have unlisted public media URLs, and previously recorded upstream SDK/toolchain audit findings remain unresolved after compatible remediation. No new dependency/security audit was run for this documentation pass.
- Human comprehension, screen readers, physical devices, every native review/failure branch and broader interruption testing remain explicit limits. Existing browser/API/native evidence retains its individual scope; no full-compliance or production-readiness declaration is made.

Technical references: [Expo release variants](https://docs.expo.dev/more/expo-cli/#release-variant), [Expo config plugins](https://docs.expo.dev/config-plugins/plugins/), [Android HTTP opt-in](https://developer.android.com/privacy-and-security/security-config#CleartextTrafficPermitted).
