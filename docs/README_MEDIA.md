# README media and release handoff

Prepared October 19, 2026. This document covers the repository homepage and its supporting screenshot assets. It does not publish a release, upload a video, change repository visibility, or submit the project.

## Android download

The owner supplied the published [1.4.0 release](https://github.com/tejassambhus17/Campaign/releases/tag/1.4.0). The README button uses `https://github.com/tejassambhus17/Campaign/releases/latest` so it opens the latest published release without guessing an asset filename. Private repository downloads require access. This media pass has not authenticated the release's assets or recipient permissions.

**1.5.1 / code 12 is the new prepared local build**, separate from the published 1.4.0 release. The final handoff is `artifacts/final-submission-20261019/Campaign.apk`, **68,616,866 bytes**. SHA256:

```text
928e6690df3f40198dcbd4f4cb3bbeb2cfdb195b2becc2902185a2c6f6006e60
```

Its build receipt is beside `artifacts/android/final-submission-confirmed-20261019/campaign-1.5.1-RELEASE-arm64-x86_64.apk`. The gallery manifest records the exact APK, dedicated signing fingerprint, build receipt, and source freeze. Source and README changes can be reviewed together; the ignored APK must be uploaded separately as a GitHub Release asset when the owner authorizes publication.

The APK retains package `com.campaignamplification.mobile`, Campaign branding, ARM64+x86_64 support, embedded Hermes, and the configured HTTPS backend. Release signing does not imply Google Play certification. Preserve installed app data if Android reports an incompatible signing certificate; do not uninstall or clear storage to force an update.

For a direct download, use `https://github.com/tejassambhus17/Campaign/releases/latest/download/Campaign.apk` only when the uploaded asset is named exactly `Campaign.apk`. Otherwise copy the actual asset URL. A private GitHub release is not a public judge download. No new release upload or visibility change is included in this handoff.

## Demo video

A shareable video URL is still needed. The existing local film is `artifacts/delivery/Campaign-1.2.3/Campaign-demo.mp4`, duration 248.433333 seconds, 12,780,503 bytes, SHA256 `8d9a30295aa1eb36394964249888e320cf92c263997cbf69109c0356ef83d9bc`.

That film predates the 1.5.1 interface and Creator Studio/readiness/suggestion improvements. The README qualifies it as earlier footage and has no invented video-hosting link. No recording or upload was performed by this media pass.

## Screenshot gallery

The homepage uses **20 actual native Android screenshots** in five galleries of four, plus the unchanged approved logo. All screenshot image paths are relative under `docs/screenshots/`, outside the ignored artifact tree.

The final capture set covers Welcome, Home, Explore, campaign details, five creation steps, Readiness Assistant, rule-based suggestions, instant preview, Trust & Verification, simulated contribution, reports, Activity, Creator Studio, and Profile in Dark/Light. All gallery captures are attributed to the exact same signed 1.5.1/code 12 APK; previous1.4.0 and earlier Welcome images are replaced. Nineteen use `Campaign_Studio_36` (`emulator-5574`); fresh Welcome uses `Campaign_Submission_Auth_36` (`emulator-5578`). Both are owned isolated Android 16 / API 36 x86_64 emulators. These captures do not establish physical-device or unfamiliar-user acceptance. Screenshot appearance alone does not prove swipes, saving, submission, or every workflow.

Values, notification content, names, and UI are preserved as captured from isolated QA/demo data. Screenshots are proportionally resized, not cropped or retouched. The polished Creator Studio illustration is a bundled decorative asset visible in the actual app, not a generated screenshot or invented dashboard statistic.

The 20 optimized JPEGs total **1,699,089 bytes** versus **9,478,219 bytes** of original PNGs, about 82% smaller. All have been visually opened for gallery review. Documentation validation passes 21/21 checks, including all 149 frozen application inputs with zero drift. All 13 public badge/documentation URL requests pass; private GitHub release assets and recipient access remain unauthenticated by this media check.

## Reproduction and checks

- [Capture provenance](screenshots/manifest.json): exact PNG/XML paths and hashes, output dimensions/sizes, APK identity, source freeze and build receipt.
- [Screenshot guide](screenshots/README.md): processing rules and verification scope.
- [Validation results](screenshots/verification.json): local links, anchors, gallery structure, output/source hashes, EXIF removal, build/source binding and optional public URL requests.
- `screenshots/prepare_assets.py`: generates the 20 JPEGs only after every final PNG/XML and matching release receipt exist. It requires explicit confirmed APK hash; no app/device/cloud action.
- `screenshots/validate_readme.py`: renders a local GitHub-style review HTML and checks documentation/assets. Optional `--check-network` checks public badges/documentation URLs; private release access stays a separate authenticated check.

A normal Git clone includes the optimized gallery. Reproduction needs the ignored original capture/build evidence preserved on this workstation. Static preview validation does not replace GitHub's own renderer, native QA, physical testing, or release download acceptance.

## Publication items still pending

1. Owner-authorized upload of the new `Campaign.apk` as a release asset, then recipient download/access verification.
2. A recipient-accessible demo-video URL with the recorded build clearly identified.
3. External organizer submission approval and destination.

No commit, push, release upload, video publication, repository visibility change, or organizer submission is performed by this media pass.
