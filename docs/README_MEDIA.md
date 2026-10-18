# README media and release handoff

Prepared October 19, 2026. This task changes the repository homepage and its documentation/image assets only. No app code, backend, deployment, database, APK, signing material, or user data was changed. Nothing was pushed, published, or submitted.

## Android download

The README uses the GitHub-root-relative route `/tejassambhus17/Campaign/releases` while the latest release download is awaiting confirmation. It reaches this repository's release index without inventing a release tag or asset. Repository access is required while the repository is private. GitHub CLI is signed out on this machine, so existing releases and recipient access could not be authenticated.

The prepared local artifact is `artifacts/dropdown-hierarchy-20261018/Campaign.apk`, version **1.4.0 / code 10**, **68,811,090 bytes**, ARM64 and x86_64, signed with the dedicated Campaign release certificate. It was not rebuilt or modified.

SHA-256:

```text
cb08edf303ba6eb7b9720f21be4e2879c8179cdb7d19eccfac91024908953397
```

After the owner publishes or confirms the release with an asset named `Campaign.apk`, change the README download button and installation link to `/tejassambhus17/Campaign/releases/latest/download/Campaign.apk`. A release page link can use `/tejassambhus17/Campaign/releases/latest`. Test access as the intended recipient; private GitHub assets are not public judge downloads. No publication or repository visibility change is authorized by this README task.

## Demo video

A public/shareable video URL is still needed. The existing local film is `artifacts/delivery/Campaign-1.2.3/Campaign-demo.mp4`, duration **248.433333 seconds**, 12,780,503 bytes. It predates the current 1.4.0 interface refinements. No new video was generated, recorded, uploaded, or described as current-build footage.

SHA-256:

```text
8d9a30295aa1eb36394964249888e320cf92c263997cbf69109c0356ef83d9bc
```

Provide a recipient-accessible video URL when ready. The README deliberately has no empty video link, invented hosting address, or link to an ignored local MP4. Keep the earlier-build qualification if using this film.

## Screenshot evidence

The homepage has **16 actual native Android captures** in four galleries, plus the approved logo. All published image paths are relative and live in [screenshots](screenshots/README.md), outside the ignored `artifacts/` tree. Screenshot content, values, names, notifications, and UI were not retouched.

- Seven captures are from the exact final 1.4.0 APK.
- Eight are from its same-version initial QA candidate before the shared information-sheet keyboard fix. Their captions carry `²`.
- Welcome is an earlier verified 1.2.2 capture, clearly marked `¹`; no 1.4.0 Welcome capture exists in the final evidence packet. Its auth/carousel source and associated brand/photo assets are unchanged in the preserved 1.2.3-to-1.4.0 source comparison. This does not establish new runtime verification.

The current packet lacks a final-binary Welcome capture and exact-final normal-text editor/checkout/trust captures. Existing verified evidence is used transparently; no screenshots were fabricated and no device was accessed. A fresh capture pass, if requested later, can replace those assets without changing gallery paths.

## Verification and reproduction

- [Asset provenance](screenshots/manifest.json) records original paths, source/output hashes, dimensions, sizes, and APK identity.
- [Validation results](screenshots/verification.json) distinguish local link/image/source checks from network access limitations.
- `screenshots/prepare_assets.py` reproduces resized images from preserved local evidence with Pillow.
- `screenshots/validate_readme.py` checks local paths, anchors, gallery structure, image hashes/dimensions, and frozen app source. It uses the bundled `markdown_it` parser for the static review HTML. Optional `--check-network` checks only the README's public badge/documentation URLs.

The Impeccable typography/hierarchy and craft-floor references were followed manually. Its context engine could not run because the installed engine/cache was unavailable; no engine audit or Product Design workflow execution is claimed.

## Owner-provided links still needed

1. Confirmed latest GitHub Release containing `Campaign.apk`, with recipient download access.
2. Shareable demo-video URL, clearly identifying the recorded build.

Only documentation and supporting image assets are prepared here. Commit/push, release upload, video publication, and organizer submission remain separate actions.
