# Campaign workspace cleanup — October 19, 2026

The owner explicitly requested deletion of unnecessary builds, screenshots, and generated clutter while retaining required source, the latest build, and current screenshots. This supersedes older instructions to retain every historical APK, only for the local generated artifacts identified in this cleanup.

## Follow-up: emulator cleanup, with future builds preserved

After the owner was shown the remaining storage breakdown and told that deleting emulator environments removes their saved sessions, the owner authorized this follow-up cleanup and asked whether future builds remain possible.

- Removed **eight Campaign emulator environments and 75 isolated Metro build-cache folders**:105,042 files, 0 failed targets.
- Removed **40.153 GiB logical contents**; observed free space increased by **39.931 GiB**.
- Workspace logical size decreased from **54.046 GiB to 13.893 GiB**.
- **274 preservation hashes passed**, including the 203 frozen application inputs, current APK/screenshots, SDK/JDK/Gradle components, build helpers, dependency locks, and all dedicated signing files/backups.
- The sole running `Campaign_Release_36` / `emulator-5574` was identified and gracefully closed using the existing dedicated ADB5039 transport. No ADB server was stopped; default ADB, phones, and unrelated devices were not touched.
- All 15 README checks pass. These are filesystem/documentation checks, not a new build or Android runtime test.

**Future APK compilation remains supported.** The Android SDK, platform/build tools, JDK 17 compiler, NDK/CMake, Gradle distribution/wrapper, installed dependencies, source/build configuration, dedicated signing keys and protected credentials remain. Java and aapt2 version commands worked before deletion; the relevant file hashes remained unchanged afterward. No new APK was compiled during this cleanup. The next build regenerates removed intermediates/caches and may need internet to restore Gradle dependencies. Same-key updates can continue through the existing Release workflow.

**Future emulator testing needs a fresh AVD.** Old virtual disks, snapshots, emulator sessions and local emulator-only QA drafts were deliberately removed. Small device-configuration files were copied into the ignored audit folder as setup references; this does not preserve user-data disks. SDK system images and emulator software remain installed. Phone-local drafts, actual server/cloud records, production preservation backups, signing material, environment configuration, current APK/screenshots and Git history were excluded.

Exact scoped targets, retained hashes and post-checks are in `artifacts/emulator-cleanup-20261019/PLAN.json`, `RESULT.json` and `POST_CHECK.json`. The helper is `scripts/cleanup-campaign-emulators.ps1`; it requires a dry-run manifest, checks root/explicit targets and reparse paths, refuses deletion while a Campaign emulator is still running, and verifies retained files before and after deletion. No cloud, backend, Git or phone change occurred.

## First cleanup result

- **49,875 files / 7,441 targets removed**, with no failed targets.
- **16.219 GiB of logical file contents removed**; observed free space on E: increased by **15.126 GiB**. Logical sizes and filesystem space differ.
- **249 preserved-file hash checks passed** after deletion, including the 203 frozen application inputs, latest APK, README assets and their source captures, final demo/report files, and original requirements PDF.
- All **15 README validation checks** still pass. No new public-network probe or app/runtime test was performed by cleanup; the 13 successful public URL checks in the README receipt are retained earlier evidence.

Deleted categories: superseded/duplicate APKs and signing sidecars, historical screenshots/renders/raw demo media, redundant downloaded installer archives, generated web exports, Android app build/C++ intermediates, and the project-local Gradle dependency/transform cache. Installed toolchains and dependencies remain; a future Android build will regenerate removed output and may need to download Gradle cache dependencies again.

## Retained files

| Item | Canonical local path |
| --- | --- |
| Current signed APK | `artifacts/dropdown-hierarchy-20261018/Campaign.apk` |
| Final-build native screenshots | `artifacts/dropdown-hierarchy-20261018/native-confirmed/` |
| Same-version QA captures needed for coverage/provenance | `artifacts/dropdown-hierarchy-20261018/native-candidate/` |
| Optimized README gallery and approved logo | `docs/screenshots/` |
| Final narrated demo, recorded before 1.4.0 | `artifacts/delivery/Campaign-1.2.3/Campaign-demo.mp4` |
| Public USD/INR sample report PDFs | `artifacts/delivery/Campaign-1.2.3/Campaign-report.pdf` and `Campaign-report-INR.pdf` |
| Original brief | `Hackathon_Requirements.pdf` |
| Cleanup inventory and deletion receipt | `artifacts/cleanup-20261019/PLAN.json` and `RESULT.json` |

The current APK remains **1.4.0 / code 10**, **68,811,090 bytes**, with SHA-256:

```text
cb08edf303ba6eb7b9720f21be4e2879c8179cdb7d19eccfac91024908953397
```

It is the only APK remaining under `artifacts/`. Stale root APKs and duplicate native build-output copies were removed. No APK was rebuilt, re-signed, uploaded, or replaced.

All 16 gallery source PNGs remain at their manifest paths, including the clearly labelled older Welcome capture of the unchanged screen. Approved reference images, current comparison images, textual QA/build receipts, source checkpoints and original Git metadata remain. Historical documentation can still reference APKs/media that were deliberately pruned; those paths are historical evidence descriptions, not currently available deliverables. Do not silently reconstruct them or treat metadata as a new runtime test.

## Protected boundaries

During the first cleanup, no source/application/backend changes, Git history reset, commit/push, branch deletion, deployment, cloud request, phone/ADB action, emulator-state deletion, or database/media/user-record deletion occurred. Signing keys and backups, environment/provider configuration, production preservation snapshots, server data/uploads, all AVD/userdata, source/dependency locks, installed SDK/JDK/CLI/runtime tools, and the user's pending README changes were excluded. The separately authorized follow-up above then removed only the reviewed Campaign AVD environments and build caches.

The scoped helper is `scripts/cleanup-campaign-artifacts.ps1`. It wrote a dry-run manifest first, checked absolute workspace boundaries, rejected protected/reparse paths, checked tracked-file overlap in generated directories, verified retained hashes, then deleted only the reviewed manifest targets using native PowerShell. It refuses to silently overwrite or repeat this completed cleanup's plan/result. The ignored local JSON receipts are not GitHub-hosted download links.
