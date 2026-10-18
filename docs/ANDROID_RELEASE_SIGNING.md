# Dedicated Campaign Android release signing

<!-- current-code6-evidence -->
## Current release — 1.2.3 / code6

The same dedicated certificate signs the current [Campaign.apk](../artifacts/delivery/Campaign-1.2.3/Campaign.apk).
ARM64 hash19E7A02C19956A08CD2DD4896006A4C23A418AADAD132822EC384E08CB0FA75A,
49,470,159bytes; package/minimum API24/target36 unchanged. The actual public
certificate extracted from this APK is in the local delivery folder; no private
key is included.69/69 package checks pass. See [readiness](../RELEASE_READINESS.md).
Historical signing instructions below still apply. Secure encrypted off-device
backup and physical ARM acceptance remain pending. Signing does not remove
standard Android sideload/Play Protect checks or permit an incompatible update.
<!-- /current-code6-evidence -->

This is a local APK signing pipeline. It does not enroll the app in Google Play,
claim store verification or remove Android unknown-source/Play Protect warnings.
The existing package stays `com.campaignamplification.mobile`, name **Campaign**.
The first dedicated release uses version **1.1.0**, Android versionCode **2**.

The existing `CloudTest`/`InternalTest` modes retain their historical Android
Debug certificate. The new **Release** mode requires the dedicated Campaign
certificate and explicitly rejects missing credentials or a Debug-signed output.
The config plugin reproduces signing through Expo CNG; generated Android files
must not be edited manually. Runtime HTTPS/Hermes checks still run on the actual
packaged bundle. Compilation, signature validity, installation and functionality
are separate acceptance results.

## Historical October17 visual-final dedicated release

[Campaign-1.1.0-release-arm64.apk](../Campaign-1.1.0-release-arm64.apk) is
**49,393,005 bytes (47.10 MiB)**, SHA256
`2BC46C23E395C8BA5DEFC72EC1B92C09EFBFDEF6767A7AAAB1B5518D7485DAB9`.
Package/version/minimumSDK remain unchanged: `com.campaignamplification.mobile`,
1.1.0 / code 2, ARM64 / minimum API 24 / target 36, Campaign name and approved icon/splash.
The established dedicated certificate remains
`ef0d218676ed3fa4f81033ebd9ec0c6d825017b60505c89f675b31ee6188db07`.
No key rotation occurred. Original Debug Campaign.apk 966E…F47D and the prior
signed E555/D8EB artifacts/evidence remain preserved; earlier acceptance is not
reused as proof for the corrected binary.

One reference correction replaces the oversized heavy shield glyph and label
crossing with the licensed Lucide native vector, fine stroke, bounded wrapping
and enlarged-text flow. Dependencies are pinned `lucide-react-native` 1.59.0 /
Expo55-compatible `react-native-svg` 15.15.3, not a screenshot or handmade shield.
Full ISC/MIT texts are bundled through CNG and byte-matched to installed licenses.
Fresh Dark/Light/font scale 1.3 [visual confirmation](../artifacts/trust-release-20261017/VISUAL_REVIEW.final.md)
resolves P1/P2 within the supplied native states. Whole-app/physical acceptance
does not follow from this visual result.

ARM64/x86 builds pass 1m16s / 2m17s with normal vital lint. [44/44 package checks](../artifacts/trust-release-20261017/RELEASE_BUILD_VERIFICATION.visual-final.json)
bind 111 runtime / 33 test / 6 build-script inputs, 77 exact compiled app modules,
the installed shield module, native SVG libraries, dedicated signatures,
non-debuggable HTTPS-only configuration, 16KB ZIP alignment and intended ABIs.
Both contain 2,374,232-byte Hermes, SHA256
`A340EA0C42C37EBBCBE1A845E189037C594E03BE37FB068BE79A827C42D2DC35`.
Six fonts/four full license texts and 25 branding pixel / 15 launcher byte checks
pass. [Known-secret checks](../artifacts/trust-release-20261017/RELEASE_SECRET_SCAN.visual-final.json)
compare 10 actual Campaign server/signing values against 1244 members per APK with
0 matches. This remains bounded evidence, not a general security certification.

The exact final x86 B199…0D5C accepted a compatible same-key update on main 5574,
cold launch 2106ms/wait2109ms. Separate [fresh 5576 verification](../artifacts/trust-release-20261017/FRESH_VISUAL_RELEASE_NATIVE.json)
passes 16 bounded install/hash/Welcome/carousel checks without Metro/reverse or
cloud mutations. Its first launch 5908ms/wait6004ms encountered a **System UI ANR**
overlay, recovered by one observed Wait; 450 app-process lines have 0 listed
fatal/JS/native-view or skipped-frame markers. All three fresh Welcome captures
were inspected. 5576 was stopped gracefully with userdata preserved and no
5574/phone/server changes. Do not turn this limited recovery into a broad
smoothness or crash-free claim.

Root's separate [243/243 cloud acceptance](../artifacts/trust-release-20261017/cloud-rollout/CLOUD_ACCEPTANCE.json)
verifies 20 built-ins / 22 public campaigns at rollout and original 13-table records
preserved on existing Free backend cbd4f90…; no additional deployment was required
for this frontend correction. Full native workflow evidence belongs to the root
report. Physical ARM64 release installation remains pending because the existing
phone Debug signer differs. Manual off-device key backup also remains pending.

## Historical first dedicated release candidate

[Preserved first ARM64 candidate](../artifacts/android/trust-release-final-20261017/campaign-1.1.0-RELEASE-arm64.apk) was the
distinct **47,750,918-byte (45.54 MiB)** ARM64 build, SHA256
`E555F8FA55077AB76F222AF4E5368AF344E67D049AC1DD9EE48387EED1069A9C`.
Its dedicated Campaign certificate SHA256 is
`ef0d218676ed3fa4f81033ebd9ec0c6d825017b60505c89f675b31ee6188db07`.
Minimum Android API24/target36, version1.1.0/code2, package identity unchanged.
The previous Debug-signed `Campaign.apk` remains unchanged at SHA966E…F47D.

ARM64/x86_64 compile in48s/50s with normal vital lint. The [39/39 package/source
audit](../artifacts/trust-release-20261017/RELEASE_BUILD_VERIFICATION.json) verifies
dedicated v2 signatures, non-debuggable/HTTPS-only manifests, intended ABIs,
16KB ZIP alignment, exact packaged API getter assignment, compiled sources and
zero drift in109runtime/33test/6build-script inputs. Both packages embed identical
2,241,980-byte Hermes, SHA256
`5F856ABE7578AC3ACA5CE371A5A02852E39403965BC84EBB2E71340838A336C3`.
The [branding receipt](../artifacts/trust-release-20261017/release-package-audit/trust-release-final-20261017/branding/ICON_BINDING.json)
verifies25native image-pixel and15launcher-byte matches; the packaged approved
transparent mark/splash were visually opened. [Known-secret scans](../artifacts/trust-release-20261017/RELEASE_SECRET_SCAN.json)
compare10actual Campaign server/signing byte values against1241members perAPK,
with no matches; this bounded check is not a comprehensive security audit.

The exact x86_64 release hashD8EB…26CC was installed on a **fresh isolated**
`Campaign_Release_36` emulator only. [First-launch proof](../artifacts/trust-release-20261017/RELEASE_EMULATOR_FIRST_LAUNCH.json)
matches the installed hash and shows cold launch1027ms/wait1039ms, Metro8081
absent/no USB reverse, complete Welcome actions and186current-process log lines
with0listed error markers. The first receipt hit Windows log encoding after
installation/launch; its repeated-launch receipt was recovered without reinstall.
The Welcome screenshot and packaged icon/splash were visually inspected.
No phone install, account/campaign/payment mutation or broader native acceptance
is inferred here. Root deployment/native QA reports separately establish current
cloud endpoint and workflow acceptance; signing/build success alone does not.

## Local key setup and build

From `E:\Campaign` in the original Windows account:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\configure-android-release-signing.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\android-local.ps1 -Mode Release -Architecture arm64-v8a -ApiUrl https://campaign-api-cw8y.onrender.com -ArtifactTag <new-reviewed-tag>
```

The setup script never overwrites existing key material. With no established
dedicated key present it creates RSA3072/SHA256withRSA, 10,000-day validity and
minimal public subject `CN=Campaign`. A cryptographically random 256-bit password
is passed to project-local JDK keytool through process variables, never command
arguments or console output. Credential values are protected by Windows DPAPI
CurrentUser in CLIXML. Gradle receives values only through temporary process
variables restored after the build; they are not written into app config,
`gradle.properties`, JavaScript, build arguments or public artifact metadata.

Storage is ignored `E:\Campaign\tmp\android-signing\`:

- `campaign-release.jks`: encrypted private release keystore.
- `release-signing.clixml`: Windows-user/machine-protected credentials.
- `public-certificate.json`: public subject/fingerprint/validity and storage paths.
- `backups\<timestamp-id>\`: exact copies of those three files, checked by SHA256.

The directory ACL allows only the current Windows identity and Local System,
with inheritance removed. Do not upload any keystore/credential/backup to Git,
Render, Cloudinary, the APK or chat. Source `.gitignore` excludes all `tmp/`
contents and keystore extensions. The local backup protects against accidentally
losing one working file; it does **not** protect against losing this disk or
Windows identity.

## Human-controlled backup and recovery

An encrypted **off-device** backup remains a manual follow-up. No such external
location has been authorized or written by the agent. Preserve the keystore and
its alias/password together in an encrypted offline archive or removable disk;
keep the archive decryption secret independently in the owner's password manager.
Run this human-operated export from the original Windows account:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-android-release-signing.ps1
```

It prompts twice for a strong password generated/stored by the owner's password
manager (at least 20 characters), then uses JDK keytool to export the **same**
private key into a password-protected PKCS12 recovery file under ignored,
restricted `tmp/android-signing/portable-backup/<timestamp-id>/`. It verifies
the certificate fingerprint matches and saves only a public hash/size receipt.
No recovery password is saved or printed. Copy that P12 and receipt directly to
the owner's encrypted offline storage, verify its file SHA256, and preserve the
password independently. This interactive export/off-device copy has not been
executed by the agent; do it before relying on this disk as the only key copy.
Merely
copying the DPAPI CLIXML file onto another computer will not make it decryptable.
The original Windows user/machine can load that file; a replacement environment
also needs the original keystore password retained securely by the owner.

For same-machine recovery, retain the damaged files under a new protected name,
verify the chosen backup's hashes against its original receipt, restore the exact
JKS and CLIXML to their documented original paths, and rerun setup to validate
the existing certificate. Never regenerate a replacement key to make a failure
disappear. Compare the restored certificate SHA256 to the delivered APK's public
receipt before another build. Off-device recovery can use keytool
`-importkeystore` to restore that PKCS12's same private key/alias into JKS, with
passwords entered locally and hidden, then save new DPAPI credentials. It needs
a reviewed local import on the new machine; do not overwrite an existing release
key or change the signing key.

## Installation safety

Current phone test builds use Android Debug certificate SHA256
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
The dedicated release certificate differs. Android will reject a normal update
over that installed package. Do not force it, uninstall, clear storage, rename
the final package or bypass signature checks. Device-only drafts and preferences
may not be backed up just because account records exist on the server.

Use a fresh, isolated authorized emulator/device for clean installation. The
current POCO installation remains intact; any data-affecting migration/fresh
phone installation needs separate explicit human authorization. A valid release
signature does not establish Play Store reputation or warning-free sideloading.

## Permission scope

The current app uses native image selection, no broad photo-library, camera or
microphone permissions, no haptic calls, no biometric SecureStore option and no
install-referrer API calls. Their unused library-declared permissions are
blocked at source config. Internet/network-state and the app-owned signature
receiver permission remain. Revisit the configuration only if an explicitly
requested feature actually needs another capability; verify the final merged
APK manifest rather than assuming config inputs are the result.

References: [Android app signing](https://developer.android.com/studio/publish/app-signing),
[Android command-line signing](https://developer.android.com/build/building-cmdline),
[Expo config plugin mods](https://docs.expo.dev/config-plugins/mods/).
