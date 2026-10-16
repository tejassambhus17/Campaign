# Demo recording checklist

## Active reference redesign

The latest product-quality pass has separate [source/native evidence](docs/PRODUCT_QUALITY.md) and corrected tagged APKs. None of these functional tests or screenshots resumes recording or verifies a current video. See [release readiness](RELEASE_READINESS.md) for the actual installed-build scope.

The latest product-quality pass has separate [source/native evidence](docs/PRODUCT_QUALITY.md) and corrected tagged APKs. None of these functional tests or screenshots resumes recording or verifies a current video. See [release readiness](RELEASE_READINESS.md) for the actual installed-build scope.

**USER HOLD — recording and demo production stopped.** The user has further
application changes planned. No recording, narration, encoding, assembly or demo
campaign mutations may resume until explicit human authorization. Preserve the
partial files under `artifacts/reference-redesign/` and saved Story draft. The
replacement film is incomplete. Current scoped black-pass2 Android evidence is
in [PROGRESS.md](PROGRESS.md); existing artifacts predate the forthcoming changes.
The completed checks below belong to the historical civic build and unchanged
MP4, and do not verify the current design.

## Historical 22-scene checklist

Completed October 16, 2026 for the redesigned local prototype. The original PDF pp. 23–24 requires a complete demo; the user's section 19 supplies the 22-step sequence below. See [journey and evidence](docs/DEMO.md) and [release readiness](RELEASE_READINESS.md).

**Current status: VERIFIED local film within the stated review scopes.** The [final MP4](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) covers all 22 scenes, 580.121354 seconds (9:40), 28,581,318 bytes, H.264 720×1520 / AAC 48kHz mono. SHA-256: `63D6DAA6823BCEC6E1F8E166977C0880E043BDD5A2A57612EBC30D57730F1358`. The stable file is byte-identical to the timestamped assembly. [Metadata](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4.json), [proof](artifacts/demo/campaign-native-demo-INTERNAL-TEST.proof.json) and [chapters](artifacts/demo/campaign-native-demo-INTERNAL-TEST.chapters.txt) retain exact provenance.

[Continuous muted Chrome playback](artifacts/demo/PLAYBACK_RESULTS.json) reached ended=true/error=null without a seek or restart. [Independent bounded review](artifacts/demo/VIDEO_REVIEW.md) inspected all 22 contact middle frames plus 52 individual PNGs, including all eight Profile cut boundaries; all 124 manifested frame hashes match. Human listening/pronunciation and every-frame privacy inspection remain unverified.

The final x86_64 internal APK passed [installed Metro-off acceptance](artifacts/android/internal-acceptance/final-build/NATIVE_RESULTS.md). [Actual native actions](artifacts/demo/NATIVE_RESULTS.md) bind the film to that exact build, with Metro off throughout capture. The separate 19.972389-second recorder smoke remains historical. [Normal logout, guest privacy and owned native cleanup](artifacts/demo/cleanup/README.md) completed afterward; the API and restored local preview remain available.

An ordinary fictional recording account is prepared through normal localhost registration; its temporary session was revoked. Credentials exist only in ignored tmp/qa/demo-credentials.json and were handed to the device owner privately. No campaign, payment or lifecycle state was prepared through the API.

## One coherent scenario

Use one fictional campaign, **Open doors to local learning**, under one ordinary creator/backer account. The same account browses, creates and backs; a separate permission-restricted reviewer makes review/lifecycle decisions. Say when the role changes. Keep sign-in credentials off-camera.

The ready [scene manifest and narration script](artifacts/demo/preparation/scenes.json) contains all 22 spoken passages and fixture content: Education; Open Chapter Demo; Pune; Instagram 60% / Facebook 40%; 14 days; goal USD 10, entered only at Submit. The public UN source offers general context and does not verify the fictional campaign. Use an agreed local illustrative photo with caption/credit, and upload ad assets separately from editorial assets.

The actual recorded campaign has exactly one successful simulated USD 10 contribution: USD 0.50 included fee, USD 9.50 allocation and 256 estimated people. Completed reporting shows USD 9.02 simulated spend, USD 0.48 unspent/refunded, 219 simulated reach, 328 impressions and 7 clicks; measured reach is unavailable. Native frames and the independent [public funding](artifacts/demo/public-funding-root-check.json) / [completion](artifacts/demo/public-completion-root-check.json) reads agree. Refund and unspent describe the same residual budget. No real money or advertising is involved.

## Completed capture preflight

- [x] Exact installed x86_64 APK accepted; artifact version, SHA256 and embedded JavaScript recorded in the linked native evidence. Metro remained off throughout capture.
- [x] Exact app reached the separate local API and images at 10.0.2.2:8787. Physical-phone reachability remains unverified and needs a reachable configured address.
- [x] Local API environment and APK identity retained in the film metadata. No cloud deployment is claimed.
- [x] Ordinary demo account and existing reviewer login prepared privately; credential entry happened with recording stopped. Selected frames and cut boundaries passed bounded privacy review.
- [x] Story, public source, caption/credit, cover and separate ad image entered through supported UI; real save/resume, preview and submission retained.
- [x] New campaign started without successful contributions. Goal USD 10 was entered only at Submit; no state injection or live-data reset forced the figures.
- [x] Final-build font, safe-area, keyboard and readability acceptance completed; real portrait native capture used.
- [x] Real native frames only; cuts remove typing, waits and private login, with role changes explicit. No synthetic screens replace required steps.
- [x] Owned device/ADB operations were performed by the native capture owner; assembly helpers did not control devices or services.

## Capture 22 required steps

"Audio" is the selected narration-track duration, including timed quiet gaps in scenes 11, 16 and 21. All checked rows have real footage in the accepted film; the exact source ranges remain in its cut manifest.

| Done | Step | Actual screen/action | Audio |
| --- | --- | --- | --- |
| [x] | 1. Launch as guest | Launch accepted installed APK; five bottom tabs visible. | 9.5s |
| [x] | 2. Home | Redesigned Home explanation and featured campaign. | 8.9s |
| [x] | 3. Explore | Open Explore and scan results. | 3.8s |
| [x] | 4. Search and filter | Search learning; change category, funding filter and sort; reset controls while the search remains learning. | 9.0s |
| [x] | 5. Read a campaign | Public title, creator, status, image and editorial paragraphs. | 6.0s |
| [x] | 6. Inspect sources | Inspect the visible supporting source title and public UN URL. | 8.5s |
| [x] | 7. Funding and reach | Open full funding policies and audience disclosures. | 12.2s |
| [x] | 8. Start a campaign | Ordinary account sign-in off-camera; manual entry and labelled voice fallback; begin Basics. | 9.7s |
| [x] | 9. Save draft | Enter Basics; explicit save and visible account/device confirmation. | 8.4s |
| [x] | 10. Exit and resume | Return to the library; resume the same draft with retained values. | 4.8s |
| [x] | 11. Complete the five steps | Basics, Story, Campaign & Ad Visuals, Reach, Submit in order; formatting/source/caption, separate assets and preserved Back state. | 127.0s (62.4s speech) |
| [x] | 12. Preview | Set USD 10 only at Submit; full preview, source, creative, audience and policies. | 13.4s |
| [x] | 13. Submit for review | Accept rules; actual submission, confirmation, timeline and Submitted for Review. | 6.1s |
| [x] | 14. Reviewer approval | Explicit reviewer role; off-camera sign-in; inspect exact submission and approve. | 11.2s |
| [x] | 15. Publish approved campaign | Separate Make available for funding action; Available for Funding hold with no advertising launch. | 7.4s |
| [x] | 16. Simulated checkout | Return to same ordinary account off-camera; find campaign, save/follow, choose USD 10 and review fee/total/reach before successful dummy checkout. | 43.0s (13.2s speech) |
| [x] | 17. Confirmation and receipt | Successful confirmation and readable private receipt; capability URL excluded. | 8.9s |
| [x] | 18. Funding update | Goal-reached report: USD 10 raised, USD 0.50 fee, USD 9.50 allocated and zero spend before promotion. | 6.8s |
| [x] | 19. Creator dashboard | Clean Created, Backed, Saved and Payments views; private Profile header excluded. | 7.0s |
| [x] | 20. Activity | Named payment/milestone events; mark one read (8 to 7 unread), Campaigns filter and expanded named Following row. | 11.4s |
| [x] | 21. Controlled promotion | Explicit reviewer role; prepare, confirm setup/start, record delivery progress, deliberately complete; intermediate states visible. | 45.5s (28.9s speech) |
| [x] | 22. Final report and boundaries | Ordinary account return off-camera; exact final money/reach/delivery report and truthful internal-build/backend boundaries. | 24.6s |

Actual recording blocks: guest discovery 1–7; creator draft 8–13; reviewer 14–15; ordinary checkout/dashboard/Activity 16–20; reviewer progress 21; ordinary final report 22. Clips split at safe boundaries; typing and idle holds were trimmed while meaningful transitions remain.

The [efficient native capture plan](artifacts/demo/preparation/capture-plan.md) groups these into role-based raw blocks, gives UI-only identity/content setup, verified photo provenance and the clip handoff fields. It also describes several actual cut ranges within one scene, so typing and media waits can be removed without replacing required interactions.

## Prepared audio and tools

- [Selected V5 combined narration WAV](artifacts/demo/preparation/narration-normalized-delivery-final/narration-all-scenes.wav): 414.052625 seconds, PCM 16-bit, 48,000 Hz mono, including timed pauses and 21 one-second inter-scene pauses. The actual film uses each scene track with additional quiet UI holds. Voice: installed **Microsoft Zira Desktop - English (United States)**, a generic synthetic voice; no person is impersonated.
- [Selected audio metadata and exact script hash](artifacts/demo/preparation/narration-normalized-delivery-final/normalized-metadata.json) records per-scene durations/hashes and zero clipped PCM samples. [Creation](artifacts/demo/preparation/narration-scene11-timed/mix-metadata.json), [checkout](artifacts/demo/preparation/narration-scene16-timed/mix-metadata.json) and [distribution](artifacts/demo/preparation/narration-scene21-timed/mix-metadata.json) timing preserves the actual action pacing. New scene 16/21 tracks were normalized individually; the other 20, including accepted timed scene 11, were copied byte-for-byte. Original WAVs and previous versions remain preserved.
- Original V3 narration measured -20.24 LUFS / -2.23dBTP. Selected prepared narration measures -16.25 LUFS / -1.97dBTP. The [actual encoded AAC measurement](artifacts/demo/preparation/assembly-20261016-041349/campaign-local-demo-draft.audio-qa.json) is -16.28 LUFS / -1.74dBTP, below clipping. Full WAV/MP4 decode checks pass. These are objective checks; human listening/pronunciation is not claimed.
- File-only SAPI synthesis initially returned sandbox access denied; the explicitly approved elevated retry produced all 22 clips. No microphone, cloud speech service or audible playback was used. System.Speech voice enumeration failed; SAPI succeeded.
- FFmpeg/ffprobe **9.0.2 essentials** are under tools/ffmpeg with LICENSE/README. No global installation or PATH modification. The 109 MB ZIP and published checksum are retained under tmp/demo-tools. Verified archive SHA256: 60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba.
- Tool source: [FFmpeg official Windows links](https://ffmpeg.org/download.html) → [Gyan builds](https://www.gyan.dev/ffmpeg/builds/). File synthesis follows Microsoft’s [SpFileStream documentation](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ms722562(v=vs.85)).
- [Installer/verifier](artifacts/demo/preparation/install-ffmpeg.ps1), [SAPI generator](artifacts/demo/preparation/generate-narration.ps1), [audio verifier/joiner](artifacts/demo/preparation/verify-narration.py) and [assembly helper](artifacts/demo/preparation/assemble-demo.ps1) remain project-local.

## Reproduce the assembly

Copy [assembly.example.json](artifacts/demo/preparation/assembly.example.json) to a new file inside preparation. Set each scene’s clip to its actual project-local MP4 path and startSeconds/endSeconds to the real capture range, or supply a segments array of actual ranges as shown in the capture plan. All 22 scenes are required. The helper rejects missing/overlapping ranges, invalid video, insufficient narration time and paths outside Campaign. It expands the recorded variable-frame-rate presentation timeline to 30fps before trimming, preserving the actual frames and holds. It adds no new screen state or video hold beyond a selected source interval, and supplies silent audio padding only. It normalizes portrait geometry to 720×1520, encodes H.264/AAC and concatenates the real clips.

From E:\Campaign:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File artifacts/demo/preparation/assemble-demo.ps1 -Manifest artifacts/demo/preparation/assembly.actual.json -ValidateOnly
powershell -NoProfile -ExecutionPolicy Bypass -File artifacts/demo/preparation/assemble-demo.ps1 -Manifest artifacts/demo/preparation/assembly.actual.json
```

The accepted run is retained in [assembly-20261016-041349](artifacts/demo/preparation/assembly-20261016-041349/assembly-proof.json), with exact input cuts, source hashes and selected narration. Outputs use new timestamped preparation/assembly-* directories; existing files are not overwritten. The final MP4 uses generic narration in place of captured audio. Do not re-encode or replace the accepted stable artifact. Any later edit requires a new hash, decode/audio checks, frame review and full playback before acceptance.

## Playback and handoff

- [x] Real native footage covers all 22 steps and the same campaign through submission, review, publication, backing, controlled promotion and report.
- [x] Bounded encoded-frame/privacy review completed, including all eight Profile cut boundaries; no retake requested. Credential entry was off-camera. Every-frame privacy inspection is not claimed.
- [x] Entire film played continuously to ended=true/error=null in Chrome, muted, without seeking or restarting. Full decode and objective audio checks passed separately.
- [x] Report/fee/reach totals and lifecycle states match actual native UI and independent read-only public evidence. Other outcomes remain separately scoped native/backend evidence, not additional payments in this film.
- [x] Estimates and simulated delivery remain explicitly distinct from unavailable measured reach.
- [x] Final MP4 path, codec/dimensions/duration/size/SHA256, cuts and coverage retained in the linked sidecars.
- [x] Exact APK identity, embedded JavaScript, Metro-off capture and local API reachability recorded.
- [x] Internal-test signing, separate backend, physical ARM64, hosting and submission limits remain explicit.
- [ ] Human listening/pronunciation verification and every-frame privacy inspection: not performed.
- [ ] External submission: deferred and requires separate user authorization; no file was sent externally by this task.

Share only the final MP4 and intended INTERNAL-TEST APKs. Local raw captures, credentials, logs and preparation/helper directories are not delivery files.
