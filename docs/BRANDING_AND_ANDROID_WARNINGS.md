# October17 launcher, opening logo and installation warnings

## Later physical evidence

The user subsequently authorized phone checks. The corrected final411 APK is
installed on the actual POCO by compatible update; [physical results](../PHYSICAL_ANDROID_TEST.md)
supersede pending runtime status only for their named checks. Its black splash
shows the approved cutout, the real launcher shows the same mint mark and taps
open Campaign. The POCO launcher adds a decorative backplate absent from the
generated packaged icon; cause remains unconfirmed and no launcher/theme
preference was changed. Preloading the existing Ionicons font in the root font
gate corrects the initial F126 missing-icon frame. Profile/cover picker uploads
worked on F126 and persisted through the final update.

ADB installation returned Success; **Files/Play Protect warning removal was
not tested or proven**. The existing Debug certificate was preserved, and the
artifact remains internal-test rather than production-signed/Play-recognized.
No security controls were disabled or user data deleted. The original build-only
scope and official-warning discussion below retain their historical meaning.

## Scope

The user asked to use the previously approved background-removed logo for
the APK icon and opening screen, refine these details, and address Android
installation warnings where possible. This continues the build-only pass:
no tests, app launch, device/ADB access, screenshots, cloud/API probes,
deployment or recording. Lint is excluded from the corrected final pipeline.
Package inspection is not runtime acceptance.

## Implemented

- The Android launcher and native splash now use the existing transparent
  mint megaphone, rather than the complete poster with tiny wordmark/tagline.
  The original and approved extraction are unchanged. Extraction SHA-256:
  `F6DA62459FD81DD47DA127B3FA2892CE0855A703A2A76652FC5642EF0F2F6395`.
- Adaptive icons have a pure-black background and 16% native foreground
  insets. The visible mark fits approximately within Android's 66/108 safe
  zone. Round and other launcher masks share the same composition. A
  monochrome layer reuses its alpha silhouette for supported themed icons.
  `withCampaignBranding.cjs` runs after Expo's generated resource mods; no
  generated Android file is manually maintained or bitmap redrawn.
- The centered splash is 144 units wide on black in both OS appearances.
  The initial native background is black, matching the new-user Dark
  default. Saved appearance restoration and Welcome/auth branding are
  unchanged. The web favicon uses the mark. The existing iOS icon is
  explicitly preserved; this is an Android build, not iOS acceptance.
- Blocked unused `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE` and
  `WRITE_EXTERNAL_STORAGE`. Camera and microphone remain blocked by the
  existing image-picker configuration. The current profile and campaign
  upload paths use `launchImageLibraryAsync`, selected-URI access and app
  cache, with no camera or broad-library permission request. Expo55's
  installed Android picker implementation and documentation support this
  approach; native photo selection/cropping remains untested in this pass.
- The local build's native fingerprint now includes brand asset hashes,
  so changing an icon file without renaming it regenerates native resources.
  No dependency, backend, schema, cloud service, session or workflow changed.

## Installation warnings: what is and is not established

The exact warning text was not supplied and the phone was not inspected.
There is no evidence identifying a particular Play Protect classification.

| Warning | Appropriate next action |
| --- | --- |
| Unknown app / scan recommended | Allow the normal Google security scan. A local build cannot guarantee Google recognition. |
| Harmful app / installation blocked | Preserve the exact warning and APK hash, investigate that classification, then appeal a false positive through Google's documented process if warranted. Do not bypass protection. |
| Built for older Android | This package already targets API36; package inspection records the actual target. |
| Unknown installation source | This is a sideloaded test APK; source trust is controlled by Android/the installer, not an app setting. |

The permission reduction removes unnecessary requested access. It does **not**
prove that any reported warning has disappeared or that the app is security
certified. The package remains a non-debuggable release variant signed by the
existing **Android Debug certificate**, preserving compatible in-place updates.
Changing only the certificate does not establish Play Protect trust; a new key
would break ordinary updates to the existing install. Production signing and
distribution need a separately planned transition. Nothing was uploaded for
review, no account or paid resource was created, and security protection was
not disabled.

Official references consulted for this implementation and explanation:

- [Expo55 app configuration: blocked permissions and adaptive icons](https://docs.expo.dev/versions/v55.0.0/config/app/).
- [Expo55 splash screen configuration](https://docs.expo.dev/versions/v55.0.0/sdk/splash-screen/).
- [Expo55 ImagePicker](https://docs.expo.dev/versions/v55.0.0/sdk/imagepicker/).
- [Android adaptive icon guidelines and safe zone](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).
- [Android signing and update compatibility](https://developer.android.com/studio/publish/app-signing).
- [Google's guidance for Play Protect warnings](https://developers.google.com/android/play-protect/warning-dev-guidance).

## Build evidence

TypeScript compilation in the packaging pipeline passed (exit0). The first
assembly succeeded in3m43s but implicitly ran Gradle's bundled vital lint,
contrary to the intended boundary. This was an execution mistake, not a
requested QA pass. Its APK and log remain under `brand-polish-20261017` with
SHA-256 `F126815C4A32A41DAA6C0392B2872AA41AD69E744E81A9BBFC09749F90087F81`.
The script now has an explicit `-SkipLint` option excluding all three app
vital-lint tasks. The corrected incremental build completed `BUILD SUCCESSFUL
in 49s` (247 tasks:8 executed,239 up-to-date); no lint tasks appear in its log.
It reused the unchanged compiled native package, so both attempt hashes are
identical. Earlier APKs are preserved. No automated test suite or standalone
linter was invoked.

| Final package fact | Result |
| --- | --- |
| APK | `E:\Campaign\artifacts\android\brand-polish-buildonly-20261017\campaign-1.0.0-BRAND-POLISH-CLOUD-TEST-arm64.apk` |
| Size | 47,540,424 bytes (45.34 MiB). |
| SHA-256 | `F126815C4A32A41DAA6C0392B2872AA41AD69E744E81A9BBFC09749F90087F81` |
| Identity | `com.campaignamplification.mobile`,1.0.0/versionCode1,ARM64,API24 minimum/API36 target. |
| Signing | Non-debuggable release variant; existing Android Debug certificate SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. |
| Native resources | Both compiled adaptive XMLs contain the foreground/monochrome insets. All15 launcher WebPs match exact generated bytes; all10 compiled splash PNGs match generated RGBA pixels after AAPT optimization. Icon, splash and initial background colors compile as black. |
| Permissions | Overlay, legacy read/write storage, camera and microphone are absent from the compiled APK. No SMS, accessibility-service or notification-listener permissions. Normal dependency permissions remain; see package evidence. |
| JavaScript/backend | 2,130,080-byte embedded Hermes bundle; exact Render HTTPS assignment verified statically, cleartext/local overrides disabled. No live API request was made. |
| Evidence | `artifacts/brand-polish-20261017/PACKAGE_ONLY.json`, aapt dumps, adjacent final APK JSON, and `tmp/android-build/assemble-CLOUD-TEST-arm64-brand-polish-buildonly-20261017.log`. |

Command: `scripts/android-local.ps1 -Mode CloudTest -Architecture arm64-v8a
-ApiUrl https://campaign-api-cw8y.onrender.com
-ArtifactTag brand-polish-buildonly-20261017 -SkipLint`. The final APK has a
distinct descriptive filename; the original build metadata is retained beside
the updated metadata. No installer, application, device or backend was run.
Recoverable source snapshot: `refs/checkpoints/brand-polish-built-20261017`.
The ordinary Git index, main HEAD and deployed cloud branch are preserved;
there is no push or deployment in this pass.

Remaining acceptance: install/update, launcher appearance under actual masks,
native splash/cold launch, themed icon and native image picking/cropping.
These require a later authorized device pass. No submission-ready or
warning-free claim is made.
