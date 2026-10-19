# Development progress

## October19 — final submission QA and signed 1.5.1

The final pass fixes queued editor/goal/consent changes during asynchronous account writes, rejects child-field buffering when the parent refuses a busy edit, and uses truthful saving/account-draft labels. The four new creator features and the HQ Profile artwork/Light/large-text fixes remain. No backend, provider, schema, account data or business rule changed.

Current [Campaign.apk](artifacts/final-submission-20261019/Campaign.apk) is **1.5.1 / code 12**, 68,616,866 bytes, dedicated same-key ARM64+x86_64 Release. SHA-256 `928e6690df3f40198dcbd4f4cb3bbeb2cfdb195b2becc2902185a2c6f6006e60`. **439 frontend / 74 isolated SQLite API tests**, TypeScript, full ESLint and **28/28 package checks** pass; all 149 frozen source inputs match. Normal Release build succeeded in 1m 40s. Its compatible owned-emulator update cold-launched in 1888ms without Metro/reverse forwarding and retained the QA session/device draft. Earlier candidate 8b40 and 1.5.0 evidence keep their historical scope.

Twenty fresh screenshots from this exact APK now populate the optimized README gallery; all 21 media/README checks pass. Real Welcome paging/dot selection, blank auth forms, correct guest Profile, detail/Explore paging, filter dismissal, contribution amounts and native report share chooser passed on isolated emulators. Both owned emulators were stopped with data preserved. Native findings, package receipts, final scope and pending physical/human checks are recorded in [the final check](docs/FINAL_SUBMISSION_CHECK.md). Software-emulator frame samples contain jank and do not establish phone smoothness. The POCO's incompatible Debug signer remains untouched. No commit/push/release upload/submission or recording occurred. Source/README/media can share one owner commit; the APK must be uploaded separately as a Release asset. The published 1.4 link stays truthful until the owner publishes the new build.

Automatic approval review blocked the optional hosted Save Draft test before execution because it would mutate remote account data beyond this local QA boundary. No hosted draft was saved. Disposable local tests and read-only HTTPS/native checks continued.

## October19 — Creator assistance and premium Profile/Studio delivered

Implemented validator-derived readiness with completed/missing/recommended rows
and exact field targets; local writing suggestions with explicit apply/dismiss
and stale-edit protection; visible live preview across all five manual-editor
steps; and the reference-led grouped Profile/Creator Studio using existing
account data and scoped device drafts. The connected five-step rail remains and
tracks the active step at increased text sizes. Empty editorial blocks no longer
imply completed story content. Backend/cloud/accounting rules are unchanged.

434 frontend tests pass; TypeScript and full src/plugins ESLint pass. Product
Design reference/context preflight and Impeccable context/craft guidance were
used; the mechanical detector returned an empty finding list. The design
sidecar is reported stale; no unrelated token repair was performed. Recoverable
source checkpoint: `refs/checkpoints/creator-studio-20261019` (`d3a16d32`).

The linked-device metadata finding is corrected: current server review/funding
metadata informs Studio while local edits and resume state remain intact. Native
inspection and the user's follow-up also corrected the low-resolution artwork,
Light header strip, art/copy collision and large-text feature-label wrapping.
The new transparent 1254px asset has no baked rectangular background; Light's
identity header is plain. At larger text sizes the image yields reading space
and feature labels use two columns.

Final [Campaign.apk](artifacts/creator-studio-20261019/Campaign.apk): **1.5.0 /
code 11**, dedicated signed ARM64+x86_64, 68,616,686 bytes. SHA-256
`1D641F7126AF94962A7DA89CF8F06ADBA3247D4B359CE2417AFC6F7C606420C4`.
Normal Release build succeeded in 2m 17s; 28/28 package checks and all 149 frozen
input hashes pass. Existing logo, package, Hermes, native patches and HTTPS
configuration remain. The prior 1.4.0 APK is unchanged.

Exact final APK received a compatible update/cold launch 1517 ms on the fresh
owned API36 emulator, ADB5039/emulator-5574, without Metro or reverse forwarding.
QA session/device draft persisted. Final native evidence covers Profile in
Dark/Light and 130%/200% text, clean header/HQ art, lower actions, Studio actual
counts/draft goal/resume, readiness, preview/Android Back and direct Story-source
navigation. A bounded 400-line current-process log sample had no failure markers.
The broader first-candidate five-step previews/suggestion apply-dismiss/required
field checks retain their own binary scope; all 18 creation inputs are unchanged.
[Full evidence and screenshots](artifacts/creator-studio-20261019/README.md),
[visual comparison](artifacts/creator-studio-20261019/COMPARE.profile-delivery.jpg),
[implementation](docs/CREATOR_STUDIO.md).

Physical release testing remains pending because the POCO's existing Debug
signer is incompatible; no phone/default ADB action, uninstall or data clear
occurred. Human testing remains pending because no unfamiliar tester is
available. These focused checks do not establish whole-app acceptance. No
backend/cloud deployment, AI API, migration/seed, billing, recording or push.

## October19 — Emulator cleanup and future-build preservation

The owner authorized removal of remaining virtual-device storage after its
purpose and saved-state consequences were explained. Eight Campaign AVDs and 75
isolated Metro cache folders were deleted: 105,042 files, 40.153 GiB logical
contents, 39.931 GiB observed extra free space,0 failed targets. Workspace now
measures 13.893 GiB. Only the verified Campaign_Release_36 / emulator-5574 was
gracefully stopped using dedicated ADB5039; no default ADB, phone or unrelated
device was touched. Small device configurations were retained as local metadata.

All 274 preservation hashes and 15 README checks pass. SDK/JDK/Gradle/build helpers,
dependencies, dedicated signing keys/backups, source, current APK/screenshots,
server/phone data and Git remain. Future compilation remains supported by the
existing workflow; caches regenerate and may need network downloads. A fresh AVD
must be created for the next emulator QA. No new APK build/runtime test, cloud
change or push occurred. [Cleanup details](docs/WORKSPACE_CLEANUP.md).

## October19 — Local artifact cleanup completed

At the owner's explicit request, removed 49,875 obsolete/generated files across
7,441 targets with 0 deletion failures: superseded/duplicate builds, historical
captures/raw footage, redundant installer archives, Android build/C++ output,
Gradle cache and generated exports. 16.219 GiB logical contents removed; observed
E: free space increased 15.126 GiB. 249 retained-file hashes passed, including all 203
frozen application inputs, current signed APK, README assets/source captures,
final demo/report files and original requirements PDF. 15 README checks pass.

The canonical APK remains `artifacts/dropdown-hierarchy-20261018/Campaign.apk`,
1.4.0 / code 10, 68,811,090 bytes, SHA-256 CB08…3397. Final native screenshots and same-version
candidate provenance remain alongside 16 optimized README images. Source, Git,
keys/secrets/backups, all emulator/user/server data and installed tools remain.
No app build/runtime check, new network probe, cloud/device action, push or branch
deletion occurred. Historical artifact links may have been pruned. See
[retained files and cleanup evidence](docs/WORKSPACE_CLEANUP.md).

## October18 — app-wide information hierarchy / 1.4.0 / code10

Implemented the latest Before/After brief across every source-reviewed dropdown, accordion, sheet and selector:98 prior controls reconciled with105 current source instances. Campaign transparency has Audience & Reach, Funding & Spending and Trust & Verification destinations; short context uses native sheets, while genuine FAQs/functional editor groups retain compact inline expansion. Creation exposes required fields and editable Submit summaries; actual input options, drafts, separate media, public evidence, financial/policy/privacy/simulation information and parent Back remain. No backend change was needed.

Final [Campaign.apk](artifacts/dropdown-hierarchy-20261018/Campaign.apk): **1.4.0/code10**, 68,811,090 bytes; dedicated signed ARM64+x86_64. SHA-256 `CB08EDF303BA6EB7B9720F21BE4E2879C8179CDB7D19ECCFAC91024908953397`. **398 tests**, TypeScript/full ESLint,20 package checks pass. Exact corrected emulator cold launch1241ms without Metro/reverse; native assertion totals by binary are in [delivery](artifacts/dropdown-hierarchy-20261018/DELIVERY.json). The first public/creator matrix is FF9E; the corrected final CB08 has separate shared-sheet/keyboard/theme/font/support/navigation/scroll/PDF-cancel checks. One actual keyboard-occlusion finding was fixed and visually confirmed. [Complete evidence, inventory and limits](artifacts/dropdown-hierarchy-20261018/README.md).

Physical release testing remains pending because the POCO has an incompatible Debug signer; no phone command, uninstall or data clear occurred. Human testing remains pending because no unfamiliar tester is available. This pass did not repeat new-account/authentication, complete upload/payment/review lifecycle, TalkBack, every historical assessment, every editor/media state or sustained physical performance tests. Conditional Following/overflow states not present in the account were not fabricated. No cloud service, backend, migration, seed, billing, push, recording or submission changed.

## October18 — Compact discovery trust, proper Home actions and render work

Home Featured places the compact shield/number/Trust Score tile at the top right.
Discover and Explore share it without a visible Demo suffix or classification.
Campaign demo provenance and full reviews remain. Proper Back/View buttons
replace the old footer; creator stays in compact metadata because PDF page 6
requires it. Public GET-only checks passed for all 20
existing built-in assessments. No score or record changed.

Home feed/cards are memoized. Explore initially materializes 2 of 11 category
lists, prewarms neighbors/jump paths and retains visited reading positions.
Valid embedded counts avoid unnecessary report requests. The first native batch
found one P2 mismatch: the 68 dp badge stretched when its label wrapped at font
scale 1.17. One correction to 74 dp and a regression test closed it; the final APK
was installed and inspected separately in Dark, Light and larger text.

Final checks: 358/358 tests; TypeScript and full src/plugins ESLint exit 0;
20/20 package checks; 11 targeted
native checks. Broader paging/read-position/far-page/filter checks remain bound
to the first candidate in NATIVE_MAIN/VARIANTS. A stale test mock needed useMemo
support; its failure log remains. Native harness assumptions about cross-tab Back
and retained Home/card scroll positions were corrected, with prior receipts
kept; no app navigation or records changed to satisfy the harness.

The performance comparison belongs to first candidate `b79dfc23b491848fa21b245de18a56a3e49faac182a3957ba16097a1b0a32a36`
against the 1.3.0 baseline, not the final binary. Three matched warmed Home-scroll
trials used the owned API 36 emulator, Dark, font scale 1.0, the same measured
viewport and 12 gestures of 420 ms per trial. Janky-frame rates were 22.727%,
5.013%, 7.945% before and 3.621%, 4.255%, 2.926% after; the medians were
7.945% and 3.621%. No counters were
reset or UI dumps run inside timed gestures. Ring-buffer p95 samples do not
cover an entire trial. The final binary only widens the badge to 74 dp and updates
its regression test; it was not benchmarked again. This is emulator observation,
not a phone or whole-app smoothness guarantee.

[Campaign.apk](artifacts/home-trust-polish-20261018/Campaign.apk) is version
1.3.1 / code 9, signed by the dedicated Campaign key, with ARM64 and x86_64 native
libraries. It is 68,787,214 bytes; SHA-256 `C8CC281D802AA0FC5671A61B2B8D31ED8ABB9C77D98AF1BF44716F4DD1C5A3EC`.
Package identity, approved installer/splash logo, embedded Hermes, native patches
and HTTPS backend remain. Final source passes 358 tests, TypeScript and full
src/plugins ESLint; 20/20 package checks pass. The exact
final APK received a same-key update and cold launch in 1118 ms on the owned
API 36 emulator without Metro or reverse forwarding. [Evidence and limits](artifacts/home-trust-polish-20261018/README.md).

The POCO was not touched. Physical release verification remains pending because
its installed Debug signer differs from the dedicated release key. No phone
uninstall, storage clear or security bypass, backend change, migration, seed,
provider change, billing, push, recording or submission occurred. Human testing
remains pending because no unfamiliar tester is available. Whole-app, TalkBack,
all-device/font/network and sustained physical performance acceptance is separate.

## October18 — Final UI simplification implemented and confirmation checked

The ten-screen reference now guides concise Explore/detail, action-first Create
entry with compact five-step overview and real Resume/Delete drafts, clean fields
and separate media, audience-first Reach, editable Submit, concise contribution
review, reference-style Trust, three-metric reports, compact Activity and Profile.
[Required-information map](artifacts/final-ui-simplification-20261018/INFORMATION_MAP.md)
records where mandatory details remain available. No backend change was needed.

The first native batch found three P2s: wrapping Explore actions, retained scroll
after creator transitions and weak Trust proportions. The
[confirmation comparison](artifacts/final-ui-simplification-20261018/visual-review/VISUAL_REVIEW.accepted.md)
closed these within inspected states. Native validation then exposed allocation
field remount/focus loss; stable disclosure identity/reveal fixes it. The latest
user also restored the connected five-icon progress rail; fresh native evidence
checks that requested composition in Dark/Light/font1.3. Harness label/scroll assumptions are kept
in separate interruption receipts, not described as application failures.

| Check | Actual evidence |
| --- | --- |
| Source checks |349/349 frontend tests;0 failed/skipped; TypeScript/full src/plugins ESLint exit0 |
| Package |20/20 official-tool/source checks;193 frozen inputs unchanged;86 critical backend/payment/persistence/native/PDF inputs unchanged |
| Signing/branding |Dedicated signer retained;27 mapped icon/splash resources match; bounded8-known-value/1,265-member scan has no match |
| Confirmation Android |Exact SHA installed same-key `-r` on Campaign_Release_36/emulator-5574/API36 x86_64, ADB5039; cold1141ms, no Metro/reverse |
| Confirmation interactions |View/Back, amount review without Pay, assessment, report metrics/native share cancellation, Activity swipe, Profile parent Back, all five creator steps, local draft preservation and validation-target reveal |
| Visual variants |Current corrected Explore/Trust Light and font1.3; first-candidate seven Light compositions/four font samples remain separately bound |
| Native evidence |`NATIVE_ACCEPTANCE.*.json`, `native/*-accepted.png/xml`; final app-specific log sample in `NATIVE_LOGS.accepted.json` |

[Campaign.apk](artifacts/final-ui-simplification-20261018/Campaign.apk): **1.3.0/code8**, dedicated-signed universal
**ARM64+x86_64**, 68,786,382 bytes, SHA256 `9F3DF3FF0B12743154B5B443A4A487D9047C184B5991CF33B96F0E2888922022`.
Package, approved installer/splash logo, minAPI24/target36, embedded Hermes,
current HTTPS backend and dedicated certificate are preserved.

[Complete handoff](artifacts/final-ui-simplification-20261018/README.md) includes changed files, exact commands, screenshots,
source checkpoints, failure history and practical reference deviations. Product
Design image-to-code/design QA and Impeccable documented fallback were used;
the Impeccable engine could not load, and no engine verdict is claimed.

Physical release testing remains pending: the authorized POCO retains an
incompatible Debug signer. No phone update, uninstall, storage clear or bypass
occurred. Unfamiliar-user testing remains pending because no tester is available.
TalkBack, every device/font/network state, sustained performance and a full new
account/payment/upload journey were not tested in this UI pass. Earlier video,
payment, cloud and PDF-delivery evidence retains its exact build scope; no new
video or external submission occurred.

## October18 — Reference-led Home implemented and bounded native checks passed

The newest Home reference is implemented with an integrated search/filter field,
icon topics, image-led Featured card and two-column Discover cards. Actual public
campaigns, assessment provenance, funding and deadlines replace the image's
illustrative facts. View, Back, assessment, See all, saved-campaign controls and
current notification/tour paths retain real destinations. Home filtering stays in
place; See all explicitly hands current selections to Explore. Mandatory Home
metadata and the advertising/review/estimated-reach explanation remain. No new
dependency or backend/cloud change was needed.

One genuine native P2 was corrected: a bright Education photo reduced caption
contrast after font1.3 single-column reflow. The measured caption-aligned scrim
fix passed the independent [current visual review](artifacts/home-reference-20261018/VISUAL_REVIEW.readable.md).
Earlier candidates and the rejected contrast evidence are preserved. Actual
reference comparison is [comparison-readable.png](artifacts/home-reference-20261018/comparison-readable.png),
not a generated mock. Practical fidelity preserves Android chrome, 48dp targets,
truthful data and required metadata; exact pixel identity is not claimed.

| Check | Actual result |
| --- | --- |
| Frontend suite | 330/330 pass, 0 failed/skipped; `frontend-readable.log` |
| TypeScript and full src/plugins ESLint | Both observed exit0; silent logs retained |
| Official-tool / source / APK checks | 20/20; 190 frozen inputs unchanged; 27 branding resources match; bounded 8-known-value/1,265-member secret scan has no match |
| Exact-APK native checks | 13/13: filters5, View/assessment/Back links3, Light/font1.3 reflow3, search/clear2 |
| Native installation/launch | Same-key `-r` on owned Campaign_Release_36, emulator-5574/API36; current installed SHA matches; Activity launch978ms; no Metro8081/reverse |
| App logs | Current PID sample672 lines; no named app crash/JS exception markers; no buffer clear |
| Visual review | 18 new readable PNG/XML states; inspected Dark/Light/font1.3 samples pass within Home scope |

[Final APK](artifacts/home-reference-20261018/Campaign.apk): Campaign1.2.4/code7,
**ARM64+x86_64 universal dedicated release**, 68,780,494 bytes, SHA256
`57BAD27E911883F9F4254EEC1EED555D83A76BA3AAF001E566787463D81D577A`.
Label/logo/splash, package, minAPI24/target36, signing identity and embedded Hermes
HTTPS configuration are preserved. [Complete handoff](artifacts/home-reference-20261018/README.md)
lists source files, skills, commands, receipts and screenshots.

Product Design image-to-code/design QA and Impeccable's documented fallback were
used. Product context preflight found no saved context; the installed Impeccable
engine could not load, so existing project design/context was read directly.
No unavailable engine execution or whole-app acceptance is claimed.

The before checkpoint is `refs/checkpoints/home-reference-before-20261018`
(`58875e3ee9b6a417ebe0a0b1cbd730d04f0aa0c5`). The after checkpoint receipt is
[home-reference-after-20261018.json](artifacts/home-reference-20261018/home-reference-after-20261018.json).
Normal HEAD/index and prior APKs remain; no push, deploy, migration, seed,
new video or external submission occurred. The old submission video remains
historical for 1.2.3 and does not show this new Home.

**Remaining limits:** no physical release installation (POCO has incompatible
Debug signer; no wipe attempted), native bookmark mutation/guest handoff,
TalkBack, exhaustive font/device/network coverage, sustained performance or full
app regression in this pass. Human unfamiliar-user testing remains pending.


<!-- current-code6-evidence -->
## Historical October18 — 1.2.3 fixes verified; local delivery prepared

The campaign-section cutoff is fixed. Exact code6 x86 native testing passes
18 named cases: all four section bottoms, three left-next and three right-back
transitions, Story reading-position retention, first boundary, long/short
downward return to overview and Story/Impact reach at font1.3. Nine fresh
PNG/XML states were independently opened. [Scroll review](artifacts/final-completion-20261017/pdf-render-fix/SCROLL_VISUAL_REVIEW.md).

The later repeated-PDF-export defect is corrected by a guarded expo-print
55.0.19 native patch: main-thread once-only completion, resource cleanup,
renderer/load/layout/write failures, cancellation ownership and a45-second
watchdog. Expo Print and core are explicitly built from source; an initial
prebuilt-AAR candidate that omitted the patch was rejected before installation.
Source2 compiles against Android36, and actual APK DEX inspection verifies it.

Six actual PDF deliveries (repeat USD, INR and after Activity recreation) plus
displayed-chooser cancellation pass in one app process; the next share recovers.
All eight pages of representative USD/INR reports were opened, with all six
documents parsed and compared. A seventh public PDF was received off-camera
after the actual demo capture. [PDF review](artifacts/final-completion-20261017/pdf-render-fix/pdf/review-current/PDF_REVIEW.md).
Real forced renderer-death/watchdog/mid-render interruption is not claimed;
those terminal paths have bounded native fixture/SDK tests.

324/324 frontend tests, TypeScript/full-source ESLint,24 renderer scenario groups,
14 module/coroutine groups and actual SDK compile controls pass. Both release
ABIs pass69/69 package/source checks with no drift, approved branding, HTTPS,
Hermes and the unchanged dedicated certificate. ARM64 is49,470,159bytes,
SHA256 `19E7A02C19956A08CD2DD4896006A4C23A418AADAD132822EC384E08CB0FA75A`.
[Package handoff](artifacts/final-completion-20261017/pdf-render-fix/FINAL_PACKAGE_HANDOFF.json).

Exact x86 was installed with `-r`, cold-launched in2136ms without Metro/reverse,
and tested on the isolated API36 emulator. Current-process542-line log sample
has zero listed fatal/JS/print errors and no renderer-exit line. This is bounded
evidence, not a whole-app crash-free or performance claim.

The code5 connected fictional creator/reviewer/backer journey retains its build
identity. Its108 UI source/assets and actual Hermes bytes match code6 exactly;
the changed native PDF flow was retested and recaptured on code6. No cloud
redeployment, seed, migration or record cleanup was needed. Existing15-table
read-only preservation audit and backend135 SQLite/76 PostgreSQL results stand.

Current local APK: [Campaign.apk](artifacts/delivery/Campaign-1.2.3/Campaign.apk).
The actual 4m08.43 narrated MP4 passed full decode, bounded frame/privacy
review and continuous muted 1× playback. Final source/package evidence is in
[the local delivery guide](artifacts/delivery/Campaign-1.2.3/README.md) and
[video acceptance](artifacts/final-completion-20261017/demo/FINAL_VIDEO_ACCEPTANCE.json).
Physical ARM64/mobile-data, unfamiliar-human usability, final human listening,
encrypted off-device key backup, recipient downloads and exact submission
approval remain pending. The phone's Debug installation/data were preserved.
<!-- /current-code6-evidence -->

## Historical October18 — Connected journey passed on code5; repeat PDF export needs recovery

Exact 1.2.2/code5 completed the designated fictional native journey for
**Small questions, shared discoveries** (`cmp_1d8c15bbfb1f9b32513ab5c5`). The
ordinary account used all five creation steps, distinct cover/ad uploads,
save/restart/resume and a deliberate $25 Submit goal. A separate reviewer
approved it, then opened funding. One native simulated $25 payment produced
receipt `pay_808f99b234c84c2df6556baa` and Activity. Separate reviewer actions
prepared distribution, started promotion, recorded demo progress and completed
it. No lifecycle/payment API or database injection was used.

The user's four-section cutoff correction retains its bounded code5 scroll/font
evidence below. The [20-check connected-journey receipt](artifacts/final-completion-20261017/activity-lifecycle-fix/NATIVE_CONNECTED_JOURNEY.json)
passes its recorded build/text/hash checks. Independent [additional screenshot review](artifacts/final-completion-20261017/activity-lifecycle-fix/NATIVE_JOURNEY_VISUAL_REVIEW.md)
opened eight more Light report/accounting, submission/receipt and Trust/rubric/
audience states, finding no new blocking visible layout defect. Prior Impact
and report states remain separately linked in the PDF reviews. Static pixels
do not establish every scroll range, gesture smoothness or whole-app acceptance.

Impact records $22.56 simulated spend + $1.25 fees + $1.19 completed simulated
refund + $0 remaining = $25. Estimated reach 641 is distinct from simulated
reach 548, impressions 822, clicks 18 and unavailable measured reach. Actual
Android USD/INR PDFs reached the isolated local receiver through the native
chooser. All eight rendered pages were independently inspected; figures,
snapshot and simulation labels agree. INR has a disclosed ₹0.01 component
rounding difference. [USD review](artifacts/final-completion-20261017/activity-lifecycle-fix/pdf/render-usd/PDF_REVIEW.md),
[INR review](artifacts/final-completion-20261017/activity-lifecycle-fix/pdf/render-inr/PDF_REVIEW.md).
The final [read-only preservation audit](artifacts/final-completion-20261017/backend/cloud-rollout/FINAL_NATIVE_PRESERVATION.json)
passed: all original rows across 15 tables match; every addition belongs to the
designated QA journey, and its single payment/contribution/refund ledger agrees.
No new assessment or migration was added.

**New release blocker:** a third repeat export stayed on “Preparing report…”
through a 39.99-second capture. Android Back left the report; no late chooser
was observed. App-only logs have two earlier Chromium renderer-exit entries
and no listed fatal/JS/Activity-result errors, without establishing causation.
Installed expo-print 55.0.19 lacks renderer-exit/watchdog handling and file-render
WebView/descriptor cleanup. A narrow guarded native correction and replacement
build are in progress. Final video/package acceptance is held for this fix and
affected retesting; two successful exports do not close repeat reliability.
[Finding](artifacts/final-completion-20261017/activity-lifecycle-fix/native/REPEAT_EXPORT_FINDING.json),
[source investigation](artifacts/final-completion-20261017/activity-lifecycle-fix/PDF_REPEAT_EXPORT_REVIEW.md).

Reviewer Inspect opens Explore, so a test expecting one Android Back to return
to Review was incorrect; testing resumed through Profile. One automated Home
query missed input while its keyboard opened; verifying settled “ocean” text
before Enter passed the Home-to-Explore handoff. These findings do not justify
unrelated navigation changes. Failed raw clips remain preserved and excluded
from success evidence. No phone data clearing or additional deployment occurred.

## Historical October18 build checkpoint — 1.2.2 bounded font reflow passed

The user's four-section vertical-cutoff correction now passes its named current
native matrix. Exact 1.2.2/code5
x86_64 SHA256 `11755A1675CCD0264ADB661DD4D3EF916B220CA686599333891414AD02A2BC9A`
now resolves the prior code4 P1 in six independently opened font 1.3 PNG/XML
states: complete section labels/Story text, proposal and finance actions, full
review-card heading/disclaimer, Impact metrics/caveat and resumed Create Visuals
guidance/actions/Back/Next. Story/Impact final actions have 50/49px dock clearance.
[Bounded actual-pixel review](artifacts/final-completion-20261017/activity-lifecycle-fix/FONT_SCALE_VISUAL_REVIEW.md).
This closes the named visual clipping examples, not every paragraph/device or
the complete application. The normal-size rerun now passes all four final-action
bottoms, three left-next/three right-previous transitions, retained Story offset,
boundary and long/short downward returns. Independent actual PNG/XML review
confirms all four bottoms clear of the dock and the short Updates full-top return
with Back to Explore starting at 94px. [Capture acceptance](artifacts/final-completion-20261017/activity-lifecycle-fix/FINAL_RELEASE_FOR_CAPTURE.json)
permits continued exact-build QA/demo capture within that scope; it is not a
completed connected journey or whole-product approval.

The replacement uses a guarded Expo Activity-result rebind for a replaced host
and removes the rejected MainActivity `fontScale` override, retaining ordinary
Android font-change recreation/scaling. Current native receipts record cover/ad
picker opening and cancellation after normal recreation and actual saved-draft
resume, with empty media collections preserved. Create may return to its entry
on recreation; the real Resume path was used. A helper's assumption of the same
mounted editor and its alternate assessment-label locator were corrected test
expectations, not evidence of missing app controls/content. These named results
do not establish every lifecycle/media/upload path.

Both same-key 1.2.2/code5 candidates are built:
ARM64 is 49,453,767 bytes/SHA256
`BB7E889F4299E0534B8EF95F349CF1E8474FA7CA0877BEFDB4F5C14BE1BB65DF`;
x86_64 is 50,872,694 bytes. [60/60 package/source checks](artifacts/final-completion-20261017/activity-lifecycle-fix/RELEASE_BUILD_VERIFICATION.json)
pass with no frozen-source drift, including actual packaged weak-host rebind,
normal font-scale recreation flags, unchanged certificate/HTTPS/Hermes and a
passing bounded known-secret scan. [314/314 frontend tests](artifacts/final-completion-20261017/activity-lifecycle-fix/frontend-supported-node.log)
pass on supported Node, plus the documented focused native-patch/signing cases;
TypeScript and corrected full-source lint pass. Earlier failed tooling runs and
rejected code4 evidence remain historical. Source/package checks are not whole
native acceptance.

The existing Free backend/records/provider configuration remain unchanged.
Earlier code4 idle-host evidence (zero instances→new RUNNING instance, API data
visible by 30.891 seconds) and its fresh 24/24 Welcome/guest checks retain that
exact-binary scope below; they are not new code5 measurements. BF6D USD/INR PDFs
also remain pre-final until repeated on the accepted build.

**Final delivery remains IN PROGRESS:** finish exact-binary connected
creation/review/backing/distribution/report/PDF checks, actual complete
demo/full playback/privacy/audio review, package/manifest and recipient access.
Physical ARM64/disconnected mobile data, human usability/listening (no unfamiliar
tester available), encrypted off-device key recovery and exact package/destination
approval remain separate. No phone wipe/incompatible update, public upload or
organizer submission is authorized by these bounded checks.

## Historical October18 — 1.2.1 rejected for larger-text clipping

**Current checkpoint: release BLOCKED by a reproduced P1.** The latest user's
Story/Updates/Impact/Sources vertical-cutoff concern has current native evidence
on exact1.2.1/code4 x86 SHA256
`8DE64E6E6B500B7A042C75A89FF54276969F0E43B482DB459FFE83F7722C0515`:
all four final actions are reachable at font1.0, with clear dock/safe areas.
Native left-next/right-previous paging, retained Story position and long/short
downward handoffs pass the named geometry/navigation cases. The short return
capture is partial expansion, not proof of full-top return. Font1.3 Story/Impact
final controls remain reachable, but **multiple labels and paragraphs clip
inside retained smaller text bounds**. Independent actual PNG/XML review
separates these results in
[FONT_SCALE_SCROLL_REVIEW](artifacts/final-completion-20261017/fontscale-fix/FONT_SCALE_SCROLL_REVIEW.md).
Reachable footers do not establish complete readable content.

The same P1 is visible in Create → Visuals after the live font change: step
labels, media guidance/actions and Back/Next text truncate at1.3, while the
font1.0 captures show their full strings. Six performed picker/open/cancel
checks pass without process restart and preserve the empty separate cover/ad
collections, but the `fontScale` manifest workaround is insufficient for
release because typography/layout regresses. Code4 is held. A direct Expo
Activity-result registration correction and removal of that override are under
investigation; no replacement implementation or native acceptance is claimed.
Final connected-journey filming is held until this blocker is resolved.

The code4 candidate has
[58/58 package/source checks](artifacts/final-completion-20261017/fontscale-fix/RELEASE_BUILD_VERIFICATION.json),
no recorded frozen-source drift and a passing bounded known-secret scan.
ARM64 is49,453,763bytes/SHA256
`F69E2D9DD0ADD6A38ABD4CA0F425AD4AE075682D8E551A9DB9319E4DF1B6AB52`;
the package and dedicated signer remain unchanged. Source checks record
[312/312 frontend tests](artifacts/final-completion-20261017/fontscale-fix/frontend-tests.log),
including five targeted manifest-mod tests, with TypeScript/full-source lint
passing. These automated checks did not catch the native font clipping.

One actual idle-host case completed on exactcode4:1,102.7seconds without agent
application traffic, cold Android Activity launch1,217ms, and server-fed Ocean
data visible by30.891seconds. Saved read-only provider snapshots show zero
instances before launch and a new RUNNING instance created20:00:12Z afterward
on the same Free service with auto-deploy off. See
[native observation](artifacts/final-completion-20261017/fontscale-fix/HOST_IDLE_NATIVE.json),
[before](artifacts/final-completion-20261017/fontscale-fix/PROVIDER_before-cold-open.json)
and [after](artifacts/final-completion-20261017/fontscale-fix/PROVIDER_after-cold-open.json).
The API-ready value is a sampled upper bound, separate from Activity launch;
third-party traffic cannot be excluded. This is not universal latency or
physical/mobile-data acceptance.

A separate fresh API36 emulator accepted exactcode4 and passes
[24/24 installation/Welcome/carousel/Guest Home/Profile checks](artifacts/final-completion-20261017/fontscale-fix/fresh-native/FINAL_FRESH_QA_SUMMARY.json).
Its1,597ms first Activity launch and264-line/zero-listed-error-marker sample are
bounded evidence. The short silent discovery clip and all code4 captures are
historical candidate evidence once the replacement changes; they are not the
complete final demo or a font-scale pass. Earlier BF6D USD/INR native PDFs and
connected-workflow evidence below remain pre-final, not replacement-build proof.

The same approved backend remains live;135SQLite/76isolated PostgreSQL and
12HTTPS/15-table preservation receipts retain their existing scope. No migration,
seed, provider, secret or billing change is part of this blocker investigation.
Still pending: corrected exact-binary font/recreation/picker and connected
journey/PDF checks, final film/full playback/privacy/audio review, package/manifest
and recipient access, physical ARM64/disconnected mobile data, human usability
(no unfamiliar tester available), encrypted off-device key recovery and exact
package/destination approval before submission. No phone wipe/incompatible
update or whole-app verification claim.

## Historical October18 — release1.2.0 built; bounded scroll and PDF checks passed

Final1.2.0/code3 candidates are built with the same dedicated release key:
ARM64 is49,453,755 bytes, SHA256
`FAF23F19D375BF6B78B3F2706DFCBFED5F4CAD1312D26E3F47CA9710C0696F69`;
x86_64 is50,872,682 bytes,
`BF6DA803F43721A4380336A622D8943CB880730D591CC1BFB3904456979C04E4`.
[56/56 package/source checks](artifacts/final-completion-20261017/RELEASE_BUILD_VERIFICATION.json)
and the bounded known-secret scan pass with no frozen-source drift. Both contain
identical2,417,328-byte Hermes, the current HTTPS API and native report modules.

The B199 vertical-scroll failure is corrected on exact BF6D. The owned release
emulator passes18 named scrolling checks: all four final actions reachable,
three left-next/three right-previous transitions, retained Story reading offset,
long/short downward returns and Story/Impact bottom reach at font1.3. Independent
PNG/XML review confirms unobscured actions/dock/safe areas in those cases.
[Scroll evidence](artifacts/final-completion-20261017/SCROLL_REVIEW.md).
The compatible emulator update preserved data; cold Activity launch1271ms had
no Metro or USB reverse. That timing is not a hosted-API wakeup measurement.

Actual native Print→Android chooser→local QA-recipient read grants produced two
public Completed/science PDFs. All four pages of each were rendered/opened;
USD/INR amounts, reference2026-10-17 at₹94.94, canonical USD and snapshot/content
hashes agree with the public cloud response and visible native funding samples.
[USD review](artifacts/final-completion-20261017/pdf/completed-science-inspection/PDF_REVIEW.md),
[INR review](artifacts/final-completion-20261017/pdf/completed-science-inr-inspection/PDF_REVIEW.md).
No clipping/blank page/missing currency/financial mismatch was demonstrated.
Sparse continuation pages and explicit seed-state chronology remain nonblocking
documented limits; the seed date is not the actual period-completion timestamp.

Current checks: 299/299 frontend tests plus 8/8 focused report-sharing tests,
TypeScript and full-source ESLint pass. Backend checks pass 135 SQLite and 76
actual isolated PostgreSQL cases, without failures/skips. The compatible
four-file report update `04e206a177a2450ec68bb3dae20f487b75847493` is live on the
same Render Free service, auto-deploy off. A fresh protected backup was restored
locally and compared across all 15 tables; post-deployment fingerprints are
unchanged and all 12 HTTPS/compatibility checks pass. No migrations, seeds,
provider settings or billing changed.

The broader final connected creation/review/backing/distribution/report journey,
other report/failure variants, final demo/playback/package/recipient access and
actual idle-host wakeup remain pending. The brief authorizes Campaign-only
recording; external submission still needs exact package/destination approval.
Human usability remains unverified because no unfamiliar tester is available.
Physical ARM64/USB-disconnected mobile-data acceptance remains pending: the
POCO's preserved historical Debug installation cannot accept the different
dedicated release signer as a data-preserving update. No phone wipe or signing
bypass; existing APKs/data remain preserved. These bounded emulator/PDF checks
do not establish whole-app, physical, screen-reader or human acceptance.

## October17 Trust, expanded demos and dedicated release 1.1.0 — delivered

**IMPLEMENTED, TESTED LOCALLY, DEPLOYED and VERIFIED ON CLOUD within this scope.**
The approved rollout uses the same Render Free service and current HTTPS origin,
commit `cbd4f90d5108f40beb8474813cc42d475f095354`, deploy
`dep-db9q15ijnfac73d7gu1g`, with auto-deploy off. Additive migration 007, fourteen
new $0 demos and twenty individually documented illustrative assessments passed
243/243 HTTPS checks. The library grew from six to twenty built-ins: two in each
of the ten existing topics. Public campaigns were 22 at rollout and 23 after
publication of the isolated QA campaign. No provider, billing or secret change.

The protected production backup restored exactly to an isolated local database.
After both native QA writers stopped, a final SQL-only read transaction at
17:59:08 UTC found every original row across all thirteen baseline tables exact.
All twenty demo assessment IDs, hashes, scores and publication times remained
unchanged. Seed rerun: zero inserts, conflicts or skipped edits; deadlines were
not extended. Actual final counts and QA attribution are in
[POST_NATIVE_READ_ONLY.json](artifacts/trust-release-20261017/cloud-rollout/POST_NATIVE_READ_ONLY.json).
Two fictional QA accounts/campaigns and four uploaded assets are distinct from
the library. The main QA record has one reconciled simulated $5 contribution.
A separate guest $25 Ocean contribution during the window is **unattributed** and
preserved: derived Ocean funding increased $2,465 → $2,490 (two → three payments),
while original rows, content and assessment stayed exact. It is not labelled as
our QA or deleted; all new payments cannot be attributed to our test actors.

The versioned `campaign-review-v1` prototype rubric has 30/20/20/15/15 weights and
thirteen anchored checks with recorded evidence, reasons, gaps and limitations.
Server totals, reviewer authorization, public/private content hashes and immutable
publication preserve separate assessment, policy approval, funding and delivery.
Story order is reach → Trust → audience, using the existing net-ad-budget model.
New user campaigns remain unassessed; demo provenance is prominent. The exact
reviewer snapshot, cache-race guard and unsaved-editor preservation are included.

**Source and package checks:** 279 frontend, 126 SQLite and 67 actual isolated
PostgreSQL tests pass; TypeScript/ESLint exit 0 with no warnings. ARM64/x86 Release
builds pass in 1m16s/2m17s with normal vital lint. The current 44/44 package audit
binds 77 compiled modules, 111 runtime inputs, 33 tests and six scripts with zero
drift, approved brand assets, embedded Hermes, HTTPS, permissions and signatures.
Ten known server/signing values had zero matches across every APK member. This
is bounded package evidence, not comprehensive security certification.

**Exact final x86 native checks:** 27 main cases, 16 fresh Welcome/carousel cases
and 21 effective fresh registration/create/media/save-resume cases pass. Two
incorrect fresh-workflow harness assumptions remain preserved and superseded.
Both native media uploads, picker cancellation, five creation steps, creator goal
at Submit, account resume and submission passed. Reviewer save, incomplete-publication
rejection and an honest thirteen-check 0/100 publication passed; that campaign
remained submitted until separate approval and funding actions. Simulated $5
checkout ($0.25 fee/$4.75 ads/~128 estimated people), actual receipt, Activity and
offline → retry → live HTTPS recovery passed. Original network settings restored;
main emulator ended Guest/Dark/font 1.0. Only task-owned emulators were stopped,
with userdata retained. Main/fresh process logs: 661/702 lines and zero listed
fatal, JS, native SVG or skipped-frame markers; main crash buffer empty.

Independent visual confirmation passed Dark, Light, font 1.3 and Story context
after one correction batch: licensed Lucide/SVG replaced the heavy shield and
fixed classification fit. Product Design and Impeccable guidance were applied;
the unavailable Impeccable context engine used its documented native/manual
fallback. Neon/Postgres guidance preserved psycopg. The initial fresh launch had
a System UI ANR recovered with Wait; its cause is unestablished. Later fresh
startup had no observed ANR. No universal smoothness/crash-free claim follows.
Older D8EB checks remain historical and are not promoted to the final build.

**Delivery:** [Campaign-1.1.0-release-arm64.apk](Campaign-1.1.0-release-arm64.apk),
49,393,005 bytes (47.10 MiB), SHA256
`2BC46C23E395C8BA5DEFC72EC1B92C09EFBFDEF6767A7AAAB1B5518D7485DAB9`.
Campaign / com.campaignamplification.mobile, version 1.1.0/code 2, ARM64,
min API 24/target 36. Dedicated certificate SHA256:
`ef0d218676ed3fa4f81033ebd9ec0c6d825017b60505c89f675b31ee6188db07`.
Original Debug Campaign.apk and prior signed candidates remain preserved.
Physical release testing is pending because the POCO's Debug signer differs;
no phone command, installation, uninstall or clear was performed. Human-operated
encrypted off-device key backup is pending; the protected same-PC backup does
not protect against disk loss. Signing does not eliminate sideload warnings.

**Local-only credential incident:** the initial isolated seed test omitted its
reviewer fixture environment and legacy code replaced ignored
services/api/.demo-credentials.json. No existing local reviewer DB hash or cloud
credential changed. The replacement does not authenticate the old local reviewer;
no matching prior password backup was found and no reset/rotation was attempted.
Tests now explicitly isolate credentials and guard the shared writer. Cloud
reviewer login passed; default-local credential recovery remains pending.

[Full completion report](artifacts/trust-release-20261017/COMPLETION_REPORT.md)
contains all requested fifteen deliverables, screenshots and remaining limits.
Source ref: `refs/checkpoints/trust-release-complete-20261017`; normal HEAD/index
preserved. No paid resources, recording, Play publication or organizer submission.

## October17 Profile, paging, contribution and discovery corrections — delivered

**VERIFIED within the scoped native checks; updated APK delivered.** The latest user
correction supersedes D37's retained Help/Profile Settings screen. Completed
guests now get a real Guest profile with Sign in/Create account and the five
tabs; fresh ordinary entry still shows Welcome. Explicit private-action sign-in
uses `/profile?auth=login`, preserving the existing saved-draft handoff. Settings
is removed; Appearance and Currency are direct Profile sections, Notifications
has one destination, and Sign out follows all account rows. The top appearance
selector and signed-out success strip are removed. Section history returns Back
to the actual parent; old `section=Settings` links resolve safely to Profile.

Activity has five mounted native pages (All, Updates, Contributions, Unread,
Account); My Campaigns has its six existing status groups. Left advances/right
returns, with synchronized pills, measured strip reveal, reduced-motion taps,
per-page vertical lists and existing privacy/read/business rules preserved.
Contribution presets measure complete USD/INR labels and reflow into four, two
or one columns without shrinking text; canonical amounts and checkout snapshots
are unchanged. Home's filter shortcut is removed. Explore's transparent floating
filter card keeps its page visible and mounted, stages sorting/funding until
Apply, and retains pending choices when Cancel/close/outside/Back dismiss it.

**Source checks pass:** [259/259 frontend tests](artifacts/profile-flow-fixes-20261017/frontend.log)
in 6,179.7936 ms; TypeScript/full-source ESLint exit 0. The [source freeze](artifacts/profile-flow-fixes-20261017/SOURCE_INPUTS.json)
contains 100 runtime inputs and 28 test files, based on checkpoint
`5e327fa88a5f1c2b0f675faff1ed925fab164d73`. These are source-level checks, not
new native gesture, appearance, installed-package or performance acceptance.

**Build/package verification:** ARM64/x86_64 Gradle builds pass in 47s/1m31s
with normal vital lint. The [ARM64 candidate](artifacts/android/profile-flow-fixes-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk)
is 47,718,998 bytes, SHA256
`966E629B902555102A490816DDB1932330E8E41BADC1B23DC20894BF21F1F47D`.
Both ABIs embed identical 2,210,024-byte Hermes. Independent [30/30 source/package
checks](artifacts/profile-flow-fixes-20261017/BUILD_VERIFICATION.json) verify zero
source drift, compiled modules, Campaign label/approved icons/splash, existing
Debug certificate, ABI and current HTTPS initialization. These checks do not
establish native behavior or production signing.

**Current delivery:** [Campaign.apk](Campaign.apk), **47,718,998 bytes (45.51 MiB)**,
SHA256 `966E629B902555102A490816DDB1932330E8E41BADC1B23DC20894BF21F1F47D`.
[Delivery receipt](artifacts/profile-flow-fixes-20261017/CAMPAIGN_APK.json) binds
the root file to the built/installed ARM64 candidate. Prior1D36 remains preserved
in its auth-clean artifact folder. Campaign name, approved logo, compatible
Android Debug certificate, embedded Hermes and current HTTPS remain.
The owned emulator passes **73/73 effective native checks**; two invalid QA
assertions are explicitly superseded (below-fold Help content and an incorrectly
encoded expected INR label). Guest/auth Back, consolidated Profile, clean QA
logout, both native pager directions/bounds/taps, unchanged seven unread events,
staged Explore filters and complete INR labels at font1.0/1.3 are covered.
[Receipt](artifacts/profile-flow-fixes-20261017/NATIVE_EMULATOR.json) records31
screenshots; [independent visual review](artifacts/profile-flow-fixes-20261017/VISUAL_REVIEW.md)
opened27 and found no material visual blocker in those states. Initial install
tooling required one targeted userdata-preserving emulator reboot. A later
unclassified emulator/UI-automation stall leaves final UI/font readback and
post-QA guest-draft reread pending. Its119PID lines show0fatal/JS markers but46
Choreographer warnings, largest546skipped frames; no crash-free/smoothness claim.

**Physical verification:** [55/55 checks](artifacts/profile-flow-fixes-20261017/NATIVE_PHYSICAL.json)
pass on authorized POCO `tkkrlvqklzydbuh6`, Android15/API35/ARM64, through its
existing ADB5039 transport. Compatible install-r Success updates old1D36 to the
exact966E candidate, no uninstall/clear/server changes. Cold launch without Metro
took977ms/wait1017ms, no USB reverse. Actual checks cover guest/auth/Back/nested
Help, Home filter absence, Explore floating Cancel/Back/Clear→Apply/category
swipes, full INR2×2 labels and first/last selection, all6My Campaigns and5Activity
forward/reverse pages, and bottom Sign out→clean Guest profile. Existing fictional
QA login/sign-out only; its eight unread remain eight, with no read/campaign/
draft/payment mutations. Original guest/Dark/USD/font1.17/density440 restored.
19phone screenshots are registered;35images were independently reviewed overall
(27emulator+8phone), with additional root inspection of phone Activity/sign-out
states.152current-PID lines show0fatal/JS or skipped-frame markers, a bounded
sample. No whole-app or performance guarantee follows.
See the [current scoped report](artifacts/profile-flow-fixes-20261017/COMPLETION_REPORT.md).
Recoverable source ref: `refs/checkpoints/profile-flow-fixes-20261017`;
[SOURCE_CHECKPOINT.json](artifacts/profile-flow-fixes-20261017/SOURCE_CHECKPOINT.json)
stores the generated commit and preservation proof. No backend,
dependency, provider, signing or theme redesign change; no redeploy
is needed. The existing HTTPS backend stays live on Free services. Existing
data, five-step creation and approved branding remain. No recording/publication/
submission, paid resource or phone-data reset is authorized by these corrections.

## Historical October17 final delivery: deployed backend and Campaign.apk

**Previous delivery:** [auth-clean APK](artifacts/android/final-campaign-auth-clean-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk), **47,705,118 bytes (45.50 MiB)**,
SHA256 `1D36B4C1BF8BDAEB1E5D773FF8E20641499561FB323D0A793366F856E672344C`.
The later screenshot correction removes only the standalone Settings footer
below guest Welcome/Login/Register; Settings remains inside Help and signed-in
Profile. Dead auth appearance callbacks were removed; routes/forms/preferences
remain. Fresh `final-campaign-auth-clean-20261017` ARM64/x86_64 CloudTest builds
passed in 1m57s/1m56s with normal vital lint and identical 2,196,144-byte Hermes.
Package `com.campaignamplification.mobile`,1.0.0/code1, embedded Hermes, HTTPS-only
configuration and existing Android Debug certificate are preserved. This is a
non-debuggable release variant for internal testing, not production/Play signing.
Independent package inspection verifies the name **Campaign**, the approved
transparent mint megaphone in normal/round/adaptive icons and native splash,
25/25 branding-image pixels and 15/15 launcher bytes. Actual current-build POCO
Welcome/Login/Register, scrolled lower Register and Back-return states pass
**10/10 no-Settings-footer/no-tab-bar UI checks**; Dark screenshots were opened.
No login/registration was submitted. Read-only pre-install checks found Campaign
absent from active user0, so successful install-r was a fresh install, not an
update; no agent uninstall/data wipe. [Phone proof](artifacts/final-delivery-20261017/AUTH_CLEAN_PHYSICAL.json).
The exact new APK's [installer card](artifacts/final-delivery-20261017/phone/auth-clean-installer.png)
shows **Campaign** and the approved mint logo; [preview receipt](artifacts/final-delivery-20261017/AUTH_CLEAN_INSTALLER_PREVIEW.json)
records Cancel, no Update/security/data changes and return to Welcome. Earlier
7C APK/evidence remain preserved. Final isolated emulator checks also pass
**10/10**: clean auth tops/bottoms, Help→Settings with saved System/Light/INR,
Back/mode routes and retention of actual unsent fictional email across Help.
[Native receipt](artifacts/final-delivery-20261017/AUTH_CLEAN_NATIVE_EMULATOR.json)
registers17screenshots/XML; no auth submission, guest completion, draft or
preference mutation. Current-PID samples show0listed fatal/JS markers in19phone
and172emulator lines, bounded diagnostics only. Phone remains Dark/font1.17/
density440 on Android15/API35; emulator ends Welcome/System-Light/INR/font1.0.
Android/Play Protect warning-free and whole-app acceptance are not claimed.

The necessary two-file backend update is live on the existing **Render Free**
service at `https://campaign-api-cw8y.onrender.com`, commit
`e599f984d43b8b109dff63504937c946400cbbad`, deploy
`dep-db9n37e1egvs73fsumfg` (live October17,13:02:41 UTC). Auto-deploy remains off;
Neon schema, Cloudinary configuration, environment and stable secrets were not
changed. The former hosted account-delete deployment hold is superseded.

Fresh auth-clean checks: **230/230 frontend** (3,457.1435ms), TypeScript and
full-source ESLint pass. The earlier unchanged backend's **93/93 isolated tests**
and **13/13 post-deploy HTTPS checks** preserve the existing
health/config/campaign/profile/receipt responses and original Cloudinary image
bytes. **32/32 live draft-delete checks** pass with two new fictional QA accounts,
including ownership, repeat deletion, hidden tombstones and delayed-save guards;
public IDs/financial snapshots remain unchanged. The retained fictional draft's
native emulator Cancel/Confirm deletion and HTTPS absence pass **7/7 checks**;
QA owner signed out and older guest draft retained. That interaction used the
pre-auth-clean binary, not a newly repeated final-build flow. No existing user
records, payments or media were changed. This frontend-only correction needs
no further backend deployment.

See [bounded completion report](artifacts/final-delivery-20261017/COMPLETION_REPORT.md)
and [deployment review](artifacts/final-delivery-20261017/PREDEPLOY_REVIEW.md).
Recoverable source reference: `refs/checkpoints/final-campaign-auth-clean-20261017`;
the [checkpoint receipt](artifacts/final-delivery-20261017/SOURCE_CHECKPOINT.json)
records the actual commit and preserved normal HEAD/index. Independent final
audits pass [51 source/package/phone checks](artifacts/final-delivery-20261017/AUTH_CLEAN_FINAL_AUDIT.json)
and [19 emulator-evidence checks](artifacts/final-delivery-20261017/AUTH_CLEAN_EMULATOR_AUDIT.json).
Live concurrent Postgres writers, the full native matrix, TalkBack, sustained
performance, unplugged/laptop-off acceptance and warning-free consumer install
remain unverified. Rollback must retain tombstone-aware read/create guards.
No paid resource, recording, publication or organizer submission occurred.

## Historical October17: Activity, native paging, draft safety and currency — bounded verification

Source checkpoint: `refs/checkpoints/activity-native-complete-20261017` (separate
index; normal HEAD/index and cloud branch preserved).

Current [ARM64 CloudTest APK](artifacts/android/native-pager-final-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk)
**47,705,774 bytes**, SHA256
`7C1682A1975DB888E2D84F05517B9491F3B3FCA48E0B24EB15DB93C6A44F0329`.
Existing package1.0.0/code1, Debug certificate, embedded Hermes and Render HTTPS
are preserved. Native PagerView8.0.0 replaces the user-rejected simulated motion;
LEFT advances campaign sections and Explore categories, RIGHT returns. Mounted
native pages retain their own vertical lists, tabs/pills stay synchronized and
the campaign overview/tabs stay shared. Restored the requested vertical Create
five-step overview before manual/voice actions. Activity rows are unboxed; USD
(default)/INR display and entry remain canonical USD; eligible draft deletion is
confirmed and scope-safe. No cloud deployment/migration or data wipe.

230/230 final frontend tests, TypeScript/full-source ESLint and web export pass.
9new+77existing isolated backend tests pass. Gradle ARM64 BUILD SUCCESSFUL1m2s,
normal vital lint; final cross-ABI Hermes identical,94source inputs/zero drift.
Final APK installed/launched on authorized POCO tkkrlvqklzydbuh6 without Metro
(1486ms/wait1491ms), hash matched, no USB reverse and0filtered current-PID errors.
Real phone section swipes/taps/boundaries/nested vertical return and Explore
All/Environment/Health forward/back pass; all11categories/both ends pass on
isolated emulator. Selected Light/INR and Dark/USD screenshots inspected, native
font1.3 Explore checked on emulator; phone restored Dark/USD/font1.17/density440.

**Pending:** Hosted account deletion requires the new endpoint and tombstone-aware
read/write code deployed together; deployment remains held. Live Postgres races,
complete receipt/media/device matrix, TalkBack/API24–27 and quantitative motion
benchmarks are unverified. Existing drafts/records were preserved; ambiguous
phone Untitled entries were left untouched after automatic review rejected that
resume target. A new blank local phone draft remains; only deliberately created
emulator QA was deleted. Recording/push/submission remain held. See the
[full scoped report](artifacts/activity-currency-polish-20261017/COMPLETION_REPORT.md)
and [physical evidence](PHYSICAL_ANDROID_TEST.md). Earlier candidates below are
historical evidence, not current whole-app acceptance.

## October17: Welcome carousel and four-area polish — implemented, bounded QA complete

**IMPLEMENTED:** Four targeted frontend corrections preserve the approved
Light/neutral-black Dark palette, branding, five tabs, authentication and exact
Basics → Story → Campaign & Ad Visuals → Reach → Submit workflow. Funding goal
remains at Submit; submission remains for review. No dependency/backend change.

Welcome's old array had no explicit IDs. The existing image/caption pairs now
have stable filename IDs and this deterministic Welcome-only mapping:

| Previous position | New position / stable ID | Bundled image and unchanged caption |
| --- | --- | --- |
| B / second | 1 / `story-mountains` | `create/story-mountains.png` — Every big change / starts with a story. |
| C / third | 2 / `confirmation-coast` | `create/confirmation-coast.png` — Small ideas. / Bigger possibilities. |
| A / first | 3 / `ocean-turtle` | `showcase/ocean-turtle.png` — A brighter tomorrow / is a shared effort. |

Measured horizontal native paging, clamped indices and 48dp dot touch areas
keep image/caption/selected indicator together. Caption overlays pass gestures
through; only the photo area pages. There is no autoplay, loop, remote asset
dependency or Welcome/session/tour persistence callback. Mounted theme/width
changes retain the selected ID; a genuinely new Welcome starts B.

Tour cards now size to content with reduced local padding/gaps, compact existing
type, Skip in the step header and one accessible Back/Next row. The final action
remains Start exploring. Existing measured spotlight/fallback, safe areas,
touch shield, Android Back, Help replay and separate preferences are retained.
Creation entry puts primary Create manually and the labelled voice-guided demo
before compact existing draft rows; actual titles, order, step, local save time,
storage status and one Resume remain. Account-only drafts without a server save
timestamp say it is unavailable. Context is an accordion; entry does not create
a draft. Visuals separates optional cover from Advertising images/Add ad image,
with independent controls and previews, compact upload area, shared existing
JPEG/PNG/WebP 8MB validation and one explanation of cover/ad/story purposes.

**VERIFIED — source:** [179/179 frontend tests](artifacts/four-area-polish-20261017/frontend-final.log),
0 failures, 2,324.6537ms; TypeScript and full-source ESLint exit0. Twenty new
focused cases cover the actual carousel callbacks, stable image/caption order,
resize/theme/boundaries, compact tour controls/placement, manual/guided/resume
handlers, picker cancellation, independent media changes and persistence.
Existing scope/session/replay cases remain. Initial one new layout assertion
used window rather than overlay coordinates; corrected expectation matches the
existing origin conversion. No backend/Doctor rerun is claimed for this pass.

**VERIFIED — native, within scope:** A fresh isolated Android16/API36/x86_64
`Campaign_FourArea_36` AVD exercised actual left/right swipes, swipes over the
caption, dot selection, both boundaries, synchronized indicators, vertical
Welcome scrolling and restart without completing Welcome. B → C → A and back
passed. Mounted System-theme change to Light retained turtle A. Font-scale
changes recreated MainActivity (recorded lifecycle events), so its fresh B is
not described as same-mounted selection retention. Guest local draft save,
restart/resume, cover removal/replacement with ad retained, all tour steps,
touch shielding and selected Light/font1.3 states also passed.

The POCO was initially unavailable, then reconnected. Compatible `install -r`
succeeded on **tkkrlvqklzydbuh6**, model2312FRAFDI, Android15/API35/ARM64. Actual
phone checks cover all four tour cards in Dark/font1.17 and Light/font1.3,
Help replay, final action, blocked underlying Create tap and Android Back
cleanup. Existing Untitled draft was preserved. An explicitly created fictional
**Four Area Phone QA local draft** resumed Step3 after Activity recreation with
cover/ad previews intact. Empty/populated Visuals, native picker cancellation
and enlarged scrolling to Add ad image passed. It remains local-only and was
not account-saved, uploaded or submitted. No real draft was edited/deleted.
Saved Dark/font1.17/density440/OSnight=yes are restored or unchanged; signed-in
session and 3 unread notifications are preserved. Physical Welcome paging is
**UNVERIFIED** because that session was not signed out for testing.

[38 app-only PNGs and gesture/UI evidence](artifacts/four-area-polish-20261017/NATIVE_RESULTS.json)
separate emulator/phone results. Canonical captures are in the `emulator/` and
`phone/` directories beside that file: Welcome `welcome-b-first`,
`welcome-c-swipe-left`, `welcome-a-turtle-swipe-left`; compact tour
`tour-search-dark`, `tour-create-dark`; Create `create-entry-existing` (phone)
or `create-entry-empty` (emulator); Visuals `visuals-empty-dark`,
`visuals-populated-dark`. Both targets add Light/font1.3 captures. UIAutomator
could not reach idle on the emulator's enlarged funding card; direct native
capture and observed Next tap verified continuation, and the equivalent phone
XML succeeded. This tool limitation was not an app crash.

**Build and runtime:** [ARM64 CloudTest APK](artifacts/android/four-area-polish-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk),
**47,565,328 bytes**, SHA256
`CD7E775787FEAB1473C9198492A7A65F045D09B068E0C97C0B63F9ACE988B5BC`,
artifact ID `four-area-polish-20261017`, version1.0.0/code1. Gradle succeeded
in1m45s,359 tasks, normal vital lint included. Non-debuggable release variant,
existing Android Debug signing, embedded Hermes and current Render HTTPS-only
configuration are retained. The installed phone hash matches. Actual cold
launch1,736ms/wait1,744ms is one observation, not a benchmark. Metro listener0
and no USB reverse; USB remained connected. Matching x86 APK is48,853,186 bytes,
SHA `1E0DAE9BB453703C07E9EA279FB33AAB8B14ED183AD42318AED6BDAB703A1345`.
[Final evidence](artifacts/four-area-polish-20261017/FINAL_DEVICE_STATE.json)
confirms both installed hashes, identical cross-ABI Hermes,81 frozen inputs
with zero drift, and108 phone/58 emulator current-PID log lines with zero
matching fatal/uncaught-JS markers. This is a bounded sample.

**Skills/review:** Product Design routing/context instructions and Impeccable
polish/native craft guidance were actually read and applied. Product Design's
context engine failed earlier in this session; the documented direct-context
and native-inspection fallback was used. No unavailable engine execution is
claimed. [Independent visual review](artifacts/four-area-polish-20261017/VISUAL_REVIEW.md)
returns bounded `ship` for the four areas, including fourteen physical
Dark/Light/enlarged captures; it does not approve the whole app.

Changed files: `AGENTS.md`, `DESIGN.md`, `INIT.md`, `PHYSICAL_ANDROID_TEST.md`,
`PRODUCT.md`, `PROGRESS.md`, `PROJECT_CONTEXT.md`, `RELEASE_READINESS.md`,
`REQUIREMENTS.md`, `docs/ANDROID_LOCAL.md`; mobile `features/auth.tsx`,
`features/auth/WelcomeCarousel.tsx`, `features/walkthrough/Walkthrough.tsx`,
`app/(tabs)/create.tsx`, `features/creation/CreationUi.tsx`,
`features/creation/CreationEntry.tsx`, `features/creation/CampaignMedia.tsx`,
`features/creation/media.ts`; tests `welcome-carousel.test.mjs`,
`creation-entry-media.test.mjs`, `walkthrough-ui.test.mjs`.

Start checkpoint `refs/checkpoints/four-area-start-20261017` preserves prior
uncommitted source and APKs; source-only completion ref is
`refs/checkpoints/four-area-built-20261017`. Normal Git HEAD/index/cloud branch
remain unchanged; no push. No recording, backend/provider redeployment,
restart, migration, billing, media deletion or submission was performed.

**IMPLEMENTED BUT NOT FULLY VERIFIED / remaining gates:** Physical Welcome
gestures/dots, native TalkBack, other hardware/orientations, full font/error/
live-upload/account-sync matrices, sustained performance and unplugged/laptop-off
operation. Production signing and warning-free consumer installation remain
unresolved; this is an internal test APK. Whole-app, human demo and organizer
acceptance are not inferred from these four fixes. Recording/submission remain
held. See [physical report](PHYSICAL_ANDROID_TEST.md) and [release readiness](RELEASE_READINESS.md).

## October17: optional walkthrough — implementation and bounded QA complete

**IMPLEMENTED AND VERIFIED:** The optional four-step native tour uses the real
Home search, Create/Activity tabs and eligible visible backing CTA, with safe
unanchored fallback. One nonblocking idle-Home invitation, Back/Next/Skip/finish,
guest/account Help replay and versioned device-local offer/progress persistence
remain separate from Welcome/session/drafts/appearance. It never creates a
campaign/payment or marks Activity read. Android Back removes the touch shield;
interrupted tours do not automatically resume. No redesign/backend/dependency.

Startup now resolves from local hydration without waiting on `/me`, preserves
legitimate campaign/pending links and their tab navigation, prevents obsolete
bootstrap identity replacement and premature Welcome completion after failed
session storage, and offers truthful preference-save recovery. The exact five
creation steps and funding/review rules remain unchanged. A new fictional local
guest draft passed required-field validation, all five action docks, keyboard
clearance, Save & Exit and persistence through update/replay/theme restoration.
It was not submitted; existing account drafts were not edited.

Checks: **159/159 frontend**, **68/68 isolated backend**, TypeScript and
full-source ESLint exit0, **Expo Doctor20/20**, ARM64 Gradle success47s including
normal vital lint. [Current ARM64 CloudTest APK](artifacts/android/walkthrough-final2-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk)
is47,560,608 bytes, SHA
`15BABC5418570A69654737DAAA9D2A705BFD4A9AD830E8BA255125212DD8E8B7`.
Existing compatible Android Debug signing/embedded Hermes/Render HTTPS retained.
Installed hash matches authorized POCO Android15/ARM64; cold launch1,243ms /
wait1,251ms with Metro absent/no USB reverse.384 current-PID log lines have zero
matching fatal/uncaught-JS markers, a bounded sample rather than crash-free proof.

[Actual native report](PHYSICAL_ANDROID_TEST.md) separates pass1 startup/offline/
sign-in evidence, corrected6F6F Dark/Light/font1.3 screenshots, and final15BABC
phone replay/draft checks and source-identical x86 fresh-link/Guest/Skip/restart
cases. Product Design sequencing review and Impeccable native review were used;
the context engine failed and its documented direct-context fallback was used.
Independent finish review found target-coordinate and mask-corner defects;
both were corrected and the scored fixes passed on eight phone states, with a
final2 four-state Dark spot-check. No whole-app release verdict is inferred.

**IMPLEMENTED BUT NOT FULLY VERIFIED:** Native TalkBack focus/announcements,
API24–27 rectangular aperture fallback, other hardware/orientations, complete
font/keyboard/editor/error matrices, hardware storage fault injection, successful
new registration and sustained performance. USB remained connected; unplugged/
laptop-off proof is not inferred. Phone ends at guest Home with saved Dark,
originalfont1.17/density440 and OSnight=yes. No user-phone data reset/uninstall.

**BLOCKED / NOT IMPLEMENTED:** Production signing/distribution and Play Protect
warning removal remain unresolved; this is an internal test APK. Recording,
cloud restart/deployment, migration, billing, publishing and submission remain
held. No mandatory PDF feature was removed. Start checkpoint
`refs/checkpoints/walkthrough-start-20261017` preserves prior source/411APK;
the source-only completion checkpoint is `refs/checkpoints/walkthrough-built-20261017`.
Normal Git index/HEAD/cloud branch stay unchanged; no push.

## October17: approved-logo physical test — VERIFIED within recorded scope

The authorized POCO `tkkrlvqklzydbuh6` (Android15/API35/ARM64) accepted two
compatible data-preserving updates over its existing ADB5037 transport. Initial
BRAND-POLISH F126 evidence covers registration, system-picker avatar/cover
uploads and initial draft creation. Missing icons in its first React Native
frame prompted one source correction: preload the existing Ionicons font in
the existing root font/splash gate. No dependency or backend change was needed.

The corrected [ARM64 CloudTest APK](artifacts/android/native-icons-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk)
is **47,540,480bytes**, SHA-256
`41103294718087AD471BF341CA6BC75F6169D0E171D645B0B051BD527C6AE338`.
TypeScript compilation exited0; Gradle succeeded in2m3s with lint excluded.
Install returned Success and the final installed hash matches. Cold launch
was1,259ms/wait1,283ms with Metro absent and no USB reverse. Hosted campaigns,
images, login and uploads used the existing Render HTTPS service; the cable
remained connected, so unplugged/laptop-off proof is not inferred.

Final411 verified preserved QA identity/avatar/draft through update/restart,
all five editor steps/backward state, $25 creator-set goal at Submit, both
previews, required policy consent and native submission for review. The
matching detail kept backing closed. A separate $5 simulated contribution
showed $0.25fee/$4.75advertising, receipt/history and settled funding refresh.
Quick-sheet/Activity shared unread3→2→0, filters and destinations worked;
the same account showed1Campaign/1Backed. Remembered sign-in survived restart;
final sign-out removed private guest history/badges. Light/System/Dark and
selected keyboard/scroll/font1.3 states were exercised. The final46-line
current-PID sample has no specified fatal/uncaught-JS matches, not a crash-free
guarantee. See [actual physical report](PHYSICAL_ANDROID_TEST.md) and
[structured result](artifacts/physical-brand-polish-20261017/PHYSICAL_RESULT.json).

The approved cutout is visible on the black splash and actual launcher.
Remaining: POCO's extra launcher backplate, P3 Save & Exit wrapping at font1.3,
optional Welcome spacing/caption refinements, and unverified Files/Play Protect
warnings. Existing Debug signing remains; production/warning-free acceptance,
fresh install, TalkBack, broader devices and sustained performance are open.
Phone restored to font1.17/density440, Dark guest Home. Only the pushed fixture
image was removed; QA records/data and unrelated devices/services remain intact.
No recording, deployment, paid resource or submission occurred. Earlier
build-only sections below retain their historical boundaries.

## October17: approved launcher/splash logo — IMPLEMENTED; APK built, runtime untested

The existing transparent megaphone replaces the poster in Android launcher
and opening-screen configuration. Adaptive-mask padding, a themed-icon layer
and black initial background refine native branding. Unused overlay and broad
storage permissions are blocked; the existing system photo picker remains.
TypeScript compilation passed in the Android packaging pipeline. The separate
[BRAND-POLISH ARM64 CloudTest APK](artifacts/android/brand-polish-buildonly-20261017/campaign-1.0.0-BRAND-POLISH-CLOUD-TEST-arm64.apk)
is built:47,540,424 bytes, SHA-256
`F126815C4A32A41DAA6C0392B2872AA41AD69E744E81A9BBFC09749F90087F81`.
The corrected incremental build succeeded in49s with lint tasks excluded.
Compiled package checks confirm15 exact generated launcher bitmaps, both
adaptive/theme XMLs,10 pixel-identical generated splash images, black native
colors, permission removal, existing signing and embedded HTTPS Hermes.
No runtime or warning-removal claim is made.
The original assets, signing identity, working APKs and cloud backend remain
preserved. [Branding and warnings report](docs/BRANDING_AND_ANDROID_WARNINGS.md)
records the scope, official guidance and remaining acceptance. No tests,
phone/ADB, screenshots, app execution, cloud checks, deployment or recording.
The first assembly implicitly ran Gradle vital lint despite the build-only
boundary; the mistake is documented, and the corrected build excludes those
tasks through the new explicit `-SkipLint` option.
Recoverable source: `refs/checkpoints/brand-polish-built-20261017`. No branch
move, normal-index replacement, push or deployment is part of this snapshot.

## October17: unattended final polish — IMPLEMENTED; APK compiled, runtime untested

The attached final-polish directive authorizes source changes and one local
cloud-connected ARM64 build, explicitly prohibiting tests, ADB/phone access,
screenshots, app execution, live cloud/API checks, production mutation,
deployment and recording. No such verification is part of this pass. The user
reports that the previous cloud APK worked unplugged and after a fresh install;
that is human-reported evidence for the previous binary only.

Recoverable source checkpoint: `refs/checkpoints/final-polish-20261017`, commit
`660c69b4f341df8558b9a78d1cbdd1e8f4508cc1`. Main HEAD/index, prior source,
cloud configuration and the working `cloud-render-20261017` APK were preserved.

Implemented a separate device onboarding marker (`welcome`/`complete`) through
existing AsyncStorage. Tab mounting waits for session and introduction restore;
Welcome reuses Profile's approved Auth flow. Explicit guest choice enters Home;
successful first authentication completes onboarding. Serial storage and a
single in-flight restore protect choices from late migration/retry writes.
Existing marker state wins on updates. Missing-marker legacy users migrate
using saved activity/session evidence or Android install/update timestamps from
SDK-compatible `expo-application`; unavailable metadata falls back to saved
evidence, then Welcome. No identity, session permission or draft key changed.

The editor now uses one shared, minimally surfaced action dock across all five
steps and preview: compact transparent-outline Save & Exit/Back, wider mint
Next/Continue/Submit, 48dp minimum controls, and stacked reflow for constrained
effective width. The dock consumes normal layout space beside the scroll view;
it adds no overlay or panel and keeps existing keyboard/tab inset ownership.
Save, validation, backward state and review handlers remain the same.

Source-confirmed overflow fixes cover Explore's scalable search/filter sizing,
Home's secondary feed heading, preview finance/allocation rows, Profile payment
history rows and quick-notification header wrapping. Help's external-reference
link now surfaces launch failure. Approved cards/branding/colors, backend code,
schema, provider settings, credentials and production records were untouched.

TypeScript compilation passed in the build pipeline. Gradle reported
`BUILD SUCCESSFUL in 2m 5s`; the separately named
[FINAL-POLISH CloudTest ARM64 APK](artifacts/android/final-polish-20261017/campaign-1.0.0-FINAL-POLISH-CLOUD-TEST-arm64.apk)
exists at 48,654,523 bytes, SHA-256
`701E3A1A5AA9EB2E886D7BB195B4B7A5AB00148B19E77A5EA1241BAB6169D7F5`.
Packaging confirms an embedded 2,130,080-byte Hermes bundle, the Render HTTPS
URL, cleartext off and the existing Android Debug certificate. The generated
native module map includes Expo Application. These are compiler/package facts,
not execution evidence. The APK was not installed or run. Build-only details and the complete changed-file list are in
[FINAL_POLISH.md](docs/FINAL_POLISH.md). Fresh/returning/expired onboarding,
native dock/keyboard/large-text behavior and all revised screens still require
human acceptance or later explicitly authorized testing. Compilation alone
does not close those gates.

## October17: Free cloud backend — VERIFIED within live HTTPS and restart scope

The existing FastAPI application is live at
`https://campaign-api-cw8y.onrender.com` from the existing private Campaign
repository's `codex/cloud-deployment` branch. Render reports `plan: free`, manual
deploy `dep-db985hopd3as73ba6j9g` live, and auto-deploy off. The Cloudinary
account reports Free; one fictional QA image passed authenticated upload,
signed read, direct unsigned-delivery denial and deletion. Neon production
remains the existing Free project; its migration was not rerun. No card or paid
resource was selected in this task. Secrets are server-side and absent from Git.

Actual HTTPS `/health`, `/config` and `/campaigns` return 200. The deployed
fictional workflow passed [27 checks](artifacts/cloud-deployment/cloud-probe-create.json),
including all five draft steps, review/publication separation, private and
approved-public Cloudinary media, a $1 simulated contribution, receipt,
funding, Activity and Profile. After an explicit restart of only the Campaign
Render service (PID 64→46 in service logs), [14 comparisons](artifacts/cloud-deployment/cloud-probe-verify.json)
passed with the original session, image, receipt capability and funding total;
see [restart evidence](artifacts/cloud-deployment/RENDER_RESTART.json). The
gzip response handling in the test harness was repaired and its focused
regression test passed. The first pre-mutation probe attempt was archived in
ignored private state and made no account/campaign/payment mutation.

The [48,629,443-byte CloudTest ARM64 APK](artifacts/android/cloud-render-20261017/campaign-1.0.0-CLOUD-TEST-arm64.apk)
(`8FCBD997…973A2`) built successfully with an exact packaged Hermes URL
assignment, HTTPS-only manifest and matching Debug certificate. Compatible
`install -r` succeeded on the authorized POCO without data reset; pulling its
installed base.apk matched the artifact SHA-256. With Campaign Metro off and
the selected phone's USB-local `tcp:8787` reverse temporarily removed, a
physical cold launch returned 878ms/883ms and live Home/Explore/detail/media
loaded. A new fictional account completed native registration, all five
creation screens, account draft save and process-restart resumption at Submit
(goal still $0). A $5 **simulated** native contribution showed a $0.25 fee,
$4.75 ad budget, confirmation, private receipt, Activity and Profile counts.
Light/Dark, guest behavior and the Edit Profile photo control were inspected.
The current process had 27 sampled log lines and zero matched fatal/JS errors.
[Physical evidence](artifacts/cloud-deployment/PHYSICAL_CLOUDTEST.json) and
[screenshots](artifacts/cloud-deployment/physical-no-reverse-explore-loaded.png)
record the scope. Campaign Metro and only the selected phone's original
reverse were restored afterward; the CloudTest app remains installed. The USB
cable stayed attached for ADB: disconnected/laptop-off acceptance, native media
picker/upload, native submission/reviewer, broader devices, sustained
performance and human/TalkBack checks remain open. Recording remains held.
Historical account
deferrals below are superseded by this live result; their prior evidence
boundaries remain valid.

## October17: Neon PostgreSQL setup — VERIFIED within recorded service scope

The user specified organization`org-patient-sound-11803564`, project
`dawn-lab-92471358` (Campaign), branch`production`, Postgres only. Browser login
succeeded; the organization reports Free; deploy applied a no-change policy and
pulled the three server variables into ignored`.env.local`. No card/paid plan,
new project or additional Neon service was enabled. [Setup](docs/NEON_SETUP.md)
records runtime/env wiring, diagnostics and exact evidence boundaries.

Root`npm run build` passes TypeScript, Android export and FastAPI compilation.
Final local tests pass83backend/107mobile/3environment adapter checks. Live QA
workflows and actual Neon compute restart persistence pass. Production migrations
were applied only after QA, to a previously empty database;20 real HTTP assertions
cover registration, all five steps, review/publication, contributions/receipts,
funding, Activity/Profile/photo. All8 production API-restart comparisons and all3
focused live-Neon concurrency/startup tests pass. The QA compute truly restarted
(server start time changed); its original state survived. The temporary branch
was deleted and organization Free rechecked. Source-only export does not imply
native/cloud APK acceptance. Exact server-secret values were absent from all53
Android export files and178 candidate source files in the targeted scan.
Existing API8787/Metro8081/phone remain untouched; new Neon API uses8879.
Final host-side checks return HTTP200 on all existing/new local services.
The separate Expo Web preview at`http://localhost:19006` serves a compiled bundle
configured for API8879, with the expected CORS response. Browser automation could
not initialize; this is bundle/network evidence only, not visual or native QA.
Use`npm run preview:neon` after`npm start`; see`PREVIEW.json` in Neon evidence.
The final scoped branch list contains only production; the temporary QA branch
is independently confirmed absent.

## October17: free provider account connection resumed — historical intake

The user now requests guided Render/Neon/Cloudinary account connection, strictly
free with no credit card. The earlier deferral is superseded. Official Free
terms were rechecked; actual account eligibility and resources remain unverified.
Start with Neon login/project setup, then Cloudinary, then Render using the
existing private Campaign repository only. Login/verification/provider terms
are completed directly by the human; no secrets belong in chat. No provider
account/resource or public backend was claimed created at this intake. The newer
Neon verification above supersedes that database status; Cloudinary and Render
remain pending. Recording remains held.

## October16 preparation checkpoint: account connection was deferred

The user authorized deployment engineering, then chose **“Prepare everything;
I'll connect accounts later.”** Source preparation retains Expo/FastAPI, approved
UI, five steps and financial/lifecycle rules. No account/resource/card/billing
was activated, and no private local data was migrated. Public deployment is
**BLOCKED**: there is no HTTPS backend URL or cloud APK. The
[runbook](docs/CLOUD_DEPLOYMENT.md) and [provider checks](docs/CLOUD_PROVIDERS.md)
give exact continuation steps; do not repeat the deferred account request.

[Checkpoint](artifacts/cloud-deployment/CHECKPOINT.json)
`2882721fa3b0b83125bab9d195a6a8aeb9f5f3fe` preserves source/HEAD/index. Implemented:
versioned PostgreSQL migrations/serialized transactions, authenticated persistent
media adapter, ownership/approved-snapshot image access, private profile bytes,
stable server secrets/reviewer bootstrap, request limits, restricted docs/hosts/CORS
and sanitized cloud startup/request errors. Local SQLite remains the default.

[Database evidence](artifacts/cloud-deployment/database): **40/40 SQLite tests**
and **45/45 actual isolated PostgreSQL tests**, no skips/source drift. Real owned
PG stop/start preserves sessions, drafts, receipts, funding/report/Activity/photo.
This is local PG evidence, not Neon or remote-media persistence. Cloudinary HTTP
checks are mocked; the saved-state HTTPS probe is prepared for later verification.

Final consolidated [backend checks](artifacts/cloud-deployment/BACKEND_FINAL.json)
pass **82/82**, zero failures/skips/source drift, in18.343s. Final mobile checks
pass **107/107**, TypeScript/full ESLint/PowerShell syntax/diff. Cloudinary and
probe HTTP remain isolated/mock-provider evidence, not hosted results. The
existing fallback APK hash is unchanged. All original PDF requirement rows remain.

Cloud mobile mode ignores localhost overrides, isolates sessions/drafts by
backend, protects image requests and allows bounded 90-second cold starts without
write replay. CloudTest embeds Hermes, disables cleartext/connection editing and
uses the existing Debug certificate with INTERNAL-TEST labeling. No placeholder
APK was built. [Mobile checks](artifacts/cloud-deployment/mobile/MOBILE_CHECKS.json)
record final source-only tests/type/lint/build guards; online Expo Doctor passes
**20/20** ([log](artifacts/cloud-deployment/expo-doctor.log)).

[POCO detection](artifacts/cloud-deployment/PHYSICAL_AVAILABILITY.json) confirms
the authorized Android15/API35/ARM64 phone. Only read-only detection occurred;
no new install/disconnected/mobile-data/laptop-off test. The pass12 fallback still
needs the laptop/USB backend, though no Metro. Historical native proof does not
verify changed cloud source. Recording, submission, production signing and
human/broader-device acceptance remain separate.

## Historical local result — Home and Auth polish VERIFIED within recorded native scope

The approved Home and authentication references are implemented and compared with actual screenshots from the authorized POCO Android 15/ARM64. Welcome, Sign In and Create Account now use a transparent approved megaphone, reusable live wordmark/tagline, calmer spacing and responsive image proportions. Auth has no theme picker or main tab bar. The shared appearance default is Dark for missing/invalid preferences; saved Light/System choices remain intact. Unsupported password recovery is plainly unavailable with no dead reset link.

The exact final [INTERNAL-TEST APK](artifacts/android/premium-quality-pass12-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk) is **48,623,759 bytes**, SHA256 DF4C95CB9F6555DE6E5637DCF18989B7E41042E0D978F7F908EFA0697FDAEDF9. Compatible install preserved phone data; the pulled installed APK has the identical hash. Actual Metro-off COLD launch is 1,418 ms / wait 1,431 ms with healthy USB-local API. Source gates pass 91 tests, TypeScript/full ESLint/diff/public Expo config; strict inspection binds 86 inputs, 45 modules, six artworks and 15 native resources. Backend/PDF are unchanged.

Final pass12 native checks verify both themes at 360 dp/font 1.3, complete Password and primary-action exposure while IME stays open, guest privacy/navigation, real mode/Back links, unchecked/checked Remember restart behavior, System preference restart, persistent photo and the held draft library. Real registration/isolation retains pass10 evidence; live OS-following form preservation retains pass11 evidence. [Native results](artifacts/premium-quality/NATIVE_RESULTS.md), [independent finish review](artifacts/premium-quality/FINISH_REVIEW.md) and [candidate scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json) state exact evidence and carry-forward boundaries. The original five-step/submission/contribution/report workflows retain their actual pass1/pass2 scopes; no blanket final-hash rerun is claimed.

Current-process diagnostics contain 46 lines and zero matched fatal/JS-error/ANR markers; package exit/memory/frame data are saved. Phone 1080×2400/density 440/font 1.17/IME 1/night Yes/animations 0.5 and final remembered Dark Home are restored. Campaign Metro 8081/API 8787 are healthy with only selected-phone USB 8787. [Diagnostics](artifacts/premium-quality/pass12/FINAL_DIAGNOSTICS.json) and [services](artifacts/premium-quality/pass12/SERVICES_RESTORED.json) are bounded evidence, not crash-free/performance guarantees.

[Initial checkpoint](artifacts/premium-quality/CHECKPOINT.json) and [pre-Auth-polish checkpoint](artifacts/premium-quality/AUTH_POLISH_CHECKPOINT.json) preserve working changes with HEAD/normal index intact. All 248 PDF baseline rows remain unchanged. Compact confirmation, sustained performance, TalkBack/human/broader-device/fresh-install acceptance remain explicit limits. Password recovery, accounts/hosting/deployment, recording and submission remain unavailable or held as documented. No ERP or unrelated project was accessed.

## Historical quick notifications and Activity refinement — VERIFIED within recorded local scope

The Home bell opens a native quick sheet with the latest five authorized notifications; Activity remains the full existing chronological feed with filters, following and preferences. Both use one recipient-scoped query and shared read actions/badges. Mark-all reuses the existing owner-authorized individual endpoint with at most three concurrent requests. No second notification store/backend or business-rule change was introduced.

- **Final source and tests:** [pass5 verification](artifacts/notification-center/pass5/SOURCE_VERIFICATION.json), 78 inputs, digest `4ce5ef5d69ec022ec40ffe5e4eb29ea0af3e8ee02cd51d05a06fd8dff1d06535`, zero drift; **81/81 frontend tests in 898.5777ms**, TypeScript/ESLint/diff exit 0. The unchanged 13-input backend digest is `622e55ee66c0872fb4a6e0a7d1f48b873e9ad0dd145fc6693b4a3d2eaa8bdecf`; [35/35 API tests in 13.391s](artifacts/notification-center/checks/backend.log) ran against isolated temporary databases. The original PDF fingerprint remains unchanged.
- **Final artifact and phone:** [ARM64 APK](artifacts/android/notifications-pass5-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk), **45,050,500 bytes**, SHA-256 `430E65719BA17029B8C62B9AE4D6707D1EB502E9336A0B5B27738468322BDEB3`. [Independent inspection](artifacts/notification-center/pass5/BUILD_INSPECTION.json) binds 40 compiled modules, assets/fonts/licenses, ARM64/Hermes/Debug signature and actual `http://127.0.0.1:8787` initialization. [Exact final Metro-off launch](artifacts/notification-center/pass5/METRO_OFF.json) records compatible update without reset on the authorized POCO Android 15/ARM64, cold **1,189ms/wait 1,211ms**, Metro absent, healthy API and selected-phone USB 8787. This is USB-local connectivity, not hosted access.
- **Shared state and destinations:** pass2 read actions synchronize **22→21** from the sheet, then **21→20** from Activity, with the other view/badges updated. Its private receipt, View all activity, Contributions and preferences checks retain that candidate scope. Pass3's genuine interrupted batch saves three of 19 reads and retains 16 unread; healthy refresh confirms 16, retry reaches zero in both views. Bridge removal on pass2 allowed a pooled POST success, so it is not labelled a failed mutation test. Final pass5 demonstrates an actual singular offline read failure with retained unread, concise copy, healthy retry and Activity count zero.
- **Final native behavior:** [interaction checks](artifacts/notification-center/pass5/FINAL_INTERACTIONS.json) pass Close, long swipe, short-drag return, Android Back, backdrop and reopening, contextual campaign navigation with clean dismissal, unchanged Home search bounds and reduced-motion setting zero with restoration. Checked refresh/close/mark-all/footer targets are at least 48dp. Pass5 includes content-sized one-event and five-event sheets, Dark/Light scrolling and Activity; selected compact 360dp/font 1.3 evidence is retained with exact candidate scopes.
- **Privacy and review:** [account recovery](artifacts/notification-center/pass5/ACCOUNT_RECOVERY_CHECK.json) records B's own event/read retry, guest cleanup and normal UI restoration of A's own campaign/read history without B's recent event; A has one genuine new-sign-in unread. This is sequential native evidence, supplemented by stale-session/race unit tests. [Independent finish review](artifacts/notification-center/FINISH_REVIEW.md) returns bounded `ship`, closing the header-swipe P1 and two P2 findings: excessive failure copy and an oversized one-event sheet. No actionable material finding remains in its matrix; human approval or exhaustive acceptance is not inferred.
- **Diagnostics and restoration:** [current-process sample](artifacts/notification-center/pass5/FINAL_DIAGNOSTICS.json) has 208 log lines and no matching fatal entries. Mixed QA frames are 243/3,904 janky (**6.22%**), p95 17ms/p99 65ms; a separate [eight Home↔Activity transition sample](artifacts/notification-center/pass5/NAVIGATION_FRAME_SAMPLE.json) adds 22/390 janky frames (**5.64%**). Neither sample is a sustained benchmark or crash-free guarantee. [Services/settings restored](artifacts/notification-center/pass5/SERVICES_RESTORED.json): Campaign preview running, API healthy, scoped USB 8787, original 1080×2400/density 440/font 1.17/keyboard 1/transition 0.5 and final Dark Home under ordinary fictional A.

[Native results](artifacts/notification-center/NATIVE_RESULTS.md) preserve pass2/pass3 workflow scopes and final pass5 follow-ups; the full earlier matrix was not repeated wholesale on every hash. The existing API returns at most 300 history rows; no unlimited-history claim is made. Native zero-record inbox was not manufactured: cleared Unread is the actual empty check; zero-record and initial loading/failure layouts are implemented and source-inspected, without exhaustive native rendering checks. TalkBack, unassisted human comprehension, other devices/orientations and sustained performance remain open. Recording, external accounts/hosting, production signing and organizer submission remain held/deferred. Earlier Create/Showcase records below retain historical scope.

## Historical Create reference and profile photo — VERIFIED within recorded local scope

The later [Create reference](artifacts/create-polish/reference.png) is implemented while preserving five steps, the 60-character title limit, separate story/ad media, creator-set goal at Submit and submission for review. Private account photos support native add/crop/change/remove/cancel and persistence. The [independent native review](artifacts/create-polish/FINISH_REVIEW.md) returns `ship` for the bounded matrix, with no open P0/P1/P2. Straight progress connectors, plain decorative quote lettering and spare keyboard/footer space remain minor P3 differences; this is not pixel-identical or human acceptance.

- **Final source/package:** [pass6 verification](artifacts/create-polish/pass6/SOURCE_VERIFICATION.json), 72 inputs digest `aaf7b4df0713749a7ff5c7ea0997ce7f05760e49ed53f592f1e3992283436a4b`, zero drift; TypeScript/ESLint exit 0, **64/64 frontend tests in 898.9374ms**. [Binary inspection](artifacts/create-polish/pass6/BUILD_INSPECTION.json) binds 36 compiled modules, five artwork assets, fonts/licenses, ARM64/Hermes/Debug signature and actual `http://127.0.0.1:8787` initialization. [Final APK](artifacts/android/create-polish-pass6-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk): **45,035,820 bytes**, SHA-256 `383F23C2945B052AE4E8DA6482632AADF0146DB08D3702D4959C180322D69184`. Backend 13-file freeze is unchanged; 35/35 backend tests were observed separately in tool output, with no saved final log or new rerun claimed.
- **Actual phone:** compatible update without data reset on the authorized POCO Android 15/ARM64. [Exact pass6 Metro-off launch](artifacts/create-polish/pass6/METRO_OFF.json) is cold **1,483ms/wait 1,490ms**, API healthy, 8081 absent and selected-phone USB 8787. Pass3 covers Story format/order/sources, separate native cover/ad uploads, Reach and goal 13.25; photos 23–28 cover full add/crop/change/remove/cancel. Pass5 retained story/media/13.25 through update/cold start and submitted for review, but its confirmation CTA exposed a P1 nonexistent route. Pass6 fixes that route using `detailPath`: a separate fictional 2.50 draft saved on pass5 resumes on final pass6, submits in 03 and the actual CTA opens its matching Under Review detail with backing closed in 04.
- **Final follow-up:** pass6 Explore 05, contribution quote 06 (no new payment), Activity 07→contextual detail 08 and persistent photo 09 pass. Pass5 preview/policies, compact feedback clearing, [measured 48dp summary controls](artifacts/create-polish/pass5/SUMMARY_TOUCH_TARGETS.json), Basics Dark 1.3 and Profile Light 1.3 retain their exact scopes. The complete photo/editor matrix was not repeated wholesale under pass6.
- **Diagnostics/restoration:** [final diagnostics](artifacts/create-polish/pass6/FINAL_DIAGNOSTICS.json) record two log lines including a vendor FramePredict observer failure, no fatal match, and 11 package exits explained by updates/intentional stops. Frames 84/2,920 janky (2.88%), p95 17ms/p99 34ms; [eight-tab sample](artifacts/create-polish/pass6/NAVIGATION_FRAME_SAMPLE.json) 18/265 (6.79%). These are bounded observations, not a controlled comparison or sustained performance guarantee. [Campaign services restored](artifacts/create-polish/pass6/SERVICES_RESTORED.json); final Dark Create entry 10, original font 1.17/display 1080×2400/density 440/keyboard 1 retained/restored.

TalkBack, unassisted human comprehension, wider devices and sustained performance remain open. The APK is Debug-signed INTERNAL-TEST with a USB-local API; hosting/accounts, production signing and organizer delivery remain deferred. Recording stays held. Historical pass5 `269AD255…907B85` had63 tests and source `ee98cf68…4b0f1`; its proven 1197ms launch and valid submission are retained, while its broken CTA is explicitly superseded by pass6. Prior Showcase evidence below keeps its original scope.

**Historical Showcase local verification — VERIFIED within recorded scope:** The approved native redesign is implemented and tested on the authorized physical POCO phone. Final pass5 source checks, independent binary inspection and exact Metro-off/API launch pass. The independent reference review closes its sole material preview-color finding, retaining the bounded pass4 surface matrix. No further redesign correction is open in that review. Current evidence does not imply human approval, sustained smoothness, every device/branch or external release readiness. Performance follow-up, TalkBack/human testing, deferred hosting/signing and the held video remain separate.

Updated October 16, 2026 (Asia/Calcutta).

**Recording hold remains in force.** No recording, narration, encoding or assembly until explicit human authorization. Partial files and drafts are preserved. The later quality addendum authorizes application changes and functional testing; it does not resume demo production.

## Historical Showcase: local source, binary and physical checks complete within recorded scope

The approved composition is implemented across discovery/detail/backing, the five-step editor/previews, journey, Activity, welcome/auth and focused Profile. Compact Manrope, image-led hierarchy and neutral-black Dark preserve the Expo/FastAPI architecture, five tabs, exact steps, scoped drafts, creator-set goal, configured fees and review/privacy rules. Actual identity and Campaigns/Backed/Saved replace the reference's illustrative portrait/followers. [Design contract](DESIGN.md), [generated-art provenance](artifacts/showcase-redesign/ASSETS.md), [native results](artifacts/showcase-redesign/NATIVE_RESULTS.md) and [independent reference review](artifacts/showcase-redesign/FINISH_REVIEW.md) record implementation and limits.

- **Final source — VERIFIED:** [59-input manifest](artifacts/showcase-redesign/pass5/SOURCE_INPUTS.json), digest `eff7a76aae7fdcbaa7f5612e0911ef08e6100b70b6c1ff0266486525eff454c1`; TypeScript/lint exit 0; [frontend tests](artifacts/showcase-redesign/pass5/frontend.log) 62/62, zero failures, 552.7398ms. No backend business logic changed; historical backend tests are not claimed as a new run.
- **Final binary — VERIFIED:** [pass5 inspection](artifacts/showcase-redesign/pass5/BUILD_INSPECTION.json) verifies all 59 frozen inputs/zero drift, 34 compiled modules, three art assets, six fonts/two licenses, ARM64 ABI, Hermes and Debug signature. [APK](artifacts/android/showcase-pass5-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk): 41,742,348 bytes, SHA-256 `6D3598B3EA23CCA610CE98D161DA4EC0C4854F56F3B0672D62D4CEFDCE35ECC2`. Actual bytecode assigns `http://127.0.0.1:8787`; the old emulator endpoint is absent.
- **Final phone launch — VERIFIED:** compatible update installation preserved data on the authorized POCO Android15/API35. [Exact pass5 proof](artifacts/showcase-redesign/pass5/METRO_OFF.json) records cold launch 1,344ms/wait 1,355ms, Metro 8081 absent, healthy API 8787 and selected-phone USB reverse 8787. This is embedded-JavaScript/local-API proof, not hosted connectivity or a sustained performance guarantee.
- **Connected workflow — VERIFIED in its exact candidate scopes:** pass3 manual entry covered all five steps; pass4 resumed the account/device draft after update/cold launch, retained the explicit $7.50 goal through Back/theme/previews, and submitted for review without publication or ad delivery. Pass4 also verified real UI login, auth-mode retention across appearance, Profile name save/restore, contribution and contextual Activity/private receipt. Pass5 adds editable guided/template fallback with account save, corrected preview in both themes, Explore search/funding filter/Reset and selected enlarged-text checks. Pass5 changes only Preview.tsx from pass4; the pass4 journey is not relabelled as a complete pass5 rerun.
- **Simulated payment — VERIFIED:** [public/native reconciliation](artifacts/showcase-redesign/PAYMENT_RECONCILIATION.json) ties one pass4 UI-created $1.00 success to $0.05 fee + $0.95 ads, raised $2,461.10 → $2,462.10, successful count +1 and estimated reach +25. Dedicated receipt 23 matches the exact payment; Activity read count changes 21→20. No real money, measured reach or advertising is implied.
- **Reference comparison — VERIFIED only within the review:** [finish review](artifacts/showcase-redesign/FINISH_REVIEW.md) manually compares actual pass4 physical surfaces and closes the sole material finding with pass5 captures 05/06: white ad-creative paper, dark text and deep-green CTA remain fixed inside the themed frame. Its `ship` applies to the scored fix and bounded matrix, not all surfaces, automated similarity, human approval or a production release.

**Performance/accessibility limits:** [final diagnostics](artifacts/showcase-redesign/pass5/FINAL_DIAGNOSTICS.json) show an empty current-PID log capture and no matching fatal entries; seven package exits are updates/intentional stops. This limited log sample cannot establish crash-free operation. Android reports 281/1,714 janky frames (16.39%), p95 19ms/p99 61ms; [eight ordinary tab switches](artifacts/showcase-redesign/pass5/NAVIGATION_FRAME_SAMPLE.json) add 26/322 janky frames (8.07%). Performance follow-up remains open. Font1.3 captures cover Light/Dark Profile and Create overview, not enlarged preview; [font settings](artifacts/showcase-redesign/pass5/FONT_SCALE_CHECK.json) restore 1.17. TalkBack, real-person comprehension, landscape/additional devices and long-duration stability remain unverified.

**Preservation and remaining release gates:** phone ends on [Dark Home](artifacts/showcase-redesign/pass5/12-final-home-dark.png), original display/density/font/keyboard settings retained/restored, with six account campaigns including the two new fictional QA records (one Submitted, one assisted Draft). No existing records were deleted/reset; no backend business logic, unrelated device or ERP was touched. [Final services](artifacts/showcase-redesign/pass5/SERVICES_RESTORED.json) confirm the Campaign packager is running and API is healthy after verification. Recording remains held, and accounts/hosting stay deferred/free-only. Current APK uses Debug signing and a USB-local API; iOS/TestFlight, production signing, organizer access/deadline confirmation and actual submission remain separate. Preserve this source and evidence; no further code change is planned for the completed bounded redesign review.

**Resolved build history:** pass3 `B59825C6…` launched only because its saved override masked stale baked `10.0.2.2`. Per-attempt project TEMP/TMP isolation, with CI retained and no global cache deletion, fixed this in pass4 `D72EABAD…` and final pass5. Pass4 compacted preview proportions; pass5 only corrected the inner creative's fixed Light colors. Earlier manifests, binary failures, captures and complete quality-pass phone results remain preserved.

## Previous physical checkpoint: quality-addendum-pass2 with recorded issues

The user-authorized POCO `2312FRAFDI` runs Android 15/API35, ARM64. At this previous checkpoint, APK `24348DD9…B096A` was installed on the actual phone with no uninstall or storage clear; no Campaign app was previously installed. The existing connection override `http://127.0.0.1:8787` and a reverse on port 8787 scoped to this phone provide real local API content. The user resolved the input-security restriction by restarting the phone. Exact Metro-off cold launch passed at 1,285ms with API content rendered afterward; a later draft-recovery launch took 1,051ms. The first post-boot sample was slower at 10,027ms. Metro and API are running again.

The phone walkthrough covered Home, guest Explore/search/category/detail/return, all five manual creation steps, distinct previews, explicit $12.34 goal, local/account save, backward navigation, process restart/resume, submission, contextual Activity, exact private receipt, Profile Backed, Light/black Dark, real keyboards, scrolling and selected font scale 1.3 screens. [Independent payment reconciliation](artifacts/physical-android/20261016/PAYMENT_RECONCILIATION.json) confirms a pending $1 adds no funds and exactly one successful $1 adds $0.05 fees + $0.95 advertising and one successful record. All payments are simulated; no lifecycle/payment API or database injection was used.

[PHYSICAL_ANDROID_TEST.md](PHYSICAL_ANDROID_TEST.md), [native results](artifacts/physical-android/20261016/NATIVE_RESULTS.md), [screenshot review](artifacts/physical-android/20261016/VISUAL_REVIEW.md) and [scoped diagnostics](artifacts/physical-android/20261016/FINAL_DIAGNOSTICS.json) retain exact evidence and limits. No matching fatal/JavaScript error was found in the checked Campaign process logs; package exit information records intentional stops. **Remaining findings:** the unpublished campaign's disabled Share explanation clips at the right edge; a compact campaign-journey label wraps awkwardly; Android reports 275/3,975 janky frames (6.92%, p95 20ms/p99 69ms). The slow first post-boot launch and frame sample need follow-up; this is not a sustained smoothness benchmark or crash-free guarantee.

At the end of that previous test, the phone was left at Black Home in the ordinary fictional QA account, with original font scale 1.17, physical size/density and keyboard setting restored/preserved. Its new submitted QA campaign and two simulated payment attempts remain; older records were not deleted. Only its port 8787 USB bridge is retained. Other devices and ADB servers were not modified. Source, backend logic, APK and PDF remain unchanged ([integrity](artifacts/physical-android/20261016/SOURCE_VERIFICATION.json)); no recording occurred. TalkBack, first-time human comprehension, additional devices/orientations, public judging connectivity, production signing and the held video remain separate gates. Hosting/accounts stay deferred and free-only.

## Previous checkpoint: quality source and selected emulator gates verified

The bounded Product Quality Addendum pass is implemented and its local verification gates are finished. The current Light and pure-black Dark design, Expo/FastAPI architecture, five tabs and exact five-step editor remain intact. No further source change is justified by the findings in this batch. Work remains local and uncommitted; no account setup, hosting, submission or new film occurred.

- **Source — VERIFIED:** final 54-input digest `a302e8c14b3706e92efc4eb54c1f7c7e11ac53476ca007fde9ad07b76c5c44a9`; frontend 62/62 in 749.9405ms, TypeScript/lint and web/Android-Hermes exports pass. Unchanged backend 31/31 in 12.262s. [Checks](artifacts/product-quality/pass2/CHECKS.json), [manifest](artifacts/product-quality/pass2/SOURCE_INPUTS.json) and [independent binary inspection](artifacts/product-quality/pass2/BUILD_INSPECTION.json) retain exact inputs and logs.
- **Connected native fixture — VERIFIED within recorded scope:** first addendum APK `35974413…` exercised checklist/field focus, live previews, explicit 7.50 goal retention, local-save/account-sync failure and recovery, filter return, correction/edit/resubmission, separate approval/publication, pending versus one successful payment, private Activity receipt, deliberate distribution and completion Activity to report. See [58-capture workflow record](artifacts/product-quality/after/NATIVE_RESULTS.md). The same fictional record was used throughout; held and other existing drafts were preserved.
- **Corrected installed x86_64 — VERIFIED within recorded scope:** current APK `4B9B6535…8EACA` updates without data reset. Actual Gboard show/hide and complete footer pass at 393dp/font1.0 and 360dp/font 1.3 in both themes. Existing separate QA text remains unchanged, enlarged private receipt rows are readable, and exact Metro-off cold launch restores Black/ordinary identity/drafts plus API content and the same Completed report. [Fourteen-capture confirmation](artifacts/product-quality/pass2/NATIVE_RESULTS.md) and [pause/restoration proof](artifacts/product-quality/pass2/metro-pause-proof.json) bind this exact build. Full lifecycle evidence keeps its first-candidate hash; the corrected source differs only in keyboard layout and sentence spacing.
- **Financial reconciliation — VERIFIED for the simulated fixture:** [read-only public ledger check](artifacts/product-quality/LEDGER_RECONCILIATION.json) confirms one 7.50 contribution = 0.38 retained fee + 6.76 simulated spend + 0.36 completed ad refund + 0 remaining. Pending refund is zero; original unspent includes the same refunded 0.36. Modelled reach is 164 and measured reach unavailable. No API/DB lifecycle injection was used.
- **Visual confirmation — VERIFIED only for opened pictures:** [independent flow review](artifacts/product-quality/FLOW_REVIEW.md) finds no new material defect in its stated groups and confirms the pictured editor footer correction. It makes no whole-app, human, physical-device or video approval claim.

Both corrected INTERNAL-TEST APKs are preserved in [quality-addendum-pass2-20261016](artifacts/android/quality-addendum-pass2-20261016/): x86_64 38,459,641 bytes, ARM64 37,171,783 bytes, with shared embedded Hermes and Android Debug signatures. ARM64 is built/inspected and remains uninstalled. API 8787 is healthy; preview8081 was restored to HTTP200 after the exact cold-launch proof. The owned emulator is left at ordinary Mint Reach Demo, Black Home, 393dp/font1.0. No recording or media production was started.

**Remaining gates and blockers:** physical Android/ARM64 and a clean authorized device/profile install are NOT STARTED; real-person comprehension and TalkBack remain unverified ([test plan](docs/FIRST_TIME_USER_TEST.md)). The emulator API alias is unsuitable for judges; judge-reachable hosting/account setup is BLOCKED by the user's explicit deferral, with free-only preference retained. Source-link handoff/return passes, but Chrome first-run onboarding prevented target-page loading; no terms were accepted. Pending-refund calculations pass backend tests without a native pending-state picture. Current video stays IN PROGRESS under USER HOLD. Actual organizer recording/transcript, current Telegram maximum/timezone, conditional TestFlight and external submission remain separate evidence/release gates. No production-readiness claim is made.

**Next action:** preserve this source, tagged APKs, evidence and held footage. Perform physical/fresh-install and real-person checks when those resources are available. Configure a judge-reachable free backend only when release setup is resumed. Recording/production requires explicit human authorization. Earlier checkpoints below retain their own hashes and limits.

## Implementation record: initial addendum and focused correction

The October 16 addendum preserves the current Light/pure-black Dark design and Expo/FastAPI architecture. Highest-impact gaps identified in actual source: Submit lacked a complete actionable readiness checklist; save feedback conflated local/account persistence; editorial/ad previews needed clearer separation; payment Activity discarded the specific private payment destination; report presentation could double-count unspent/refunded money; detail return recreated Explore rather than preserving filters. No new mandatory fields or submission rules are authorized.

Work is split by file ownership: creation/editor/preview; Activity/Profile receipts/report; requirements/release documentation; root shared controls, discovery/checkout and backend accounting. Root alone owns shared theme components; no palette or typography direction change. The original PDF baseline stays unchanged, and organizer guidance remains a user-supplied summary because no original recording/transcript is available.

Fresh pre-change Android Story/Submit captures are in [artifacts/product-quality/before](artifacts/product-quality/before/). Both were personally opened by the native owner and root. They show the existing 45F0 pass2 build, not current source acceptance. Product Design index/audit/user-context and Impeccable Operate/clarify/craft-floor/Android instructions were read. Impeccable context executed with exit 0; Product Design preflight executed and found no saved context. Browser capture startup failed because kernel assets were unavailable, so flow capture uses the owned Android emulator. No browser audit, HTML detector or new automated design approval is claimed.

Backend changes expose ledger-derived original allocation, refunded advertising/fees, retained fees, remaining advertising balance and pending-refund status/amount without altering accounting entries. Completed refunds cannot re-enter a zero-value pending state. Funding milestones link to reports; completion/final-report facts produce one contextual notification. Current backend regression: **31/31 PASS in 12.262s**, [log](artifacts/product-quality/checks/backend.log). This includes idempotent concurrent checkout, private receipts, review/resubmission, cancellation/full refunds and failed-promotion/net-refund conservation. The Campaign API was restarted without resetting data; health and the public completed seed report were checked.

Current frontend verification: **62/62 tests PASS in 628.494ms**, TypeScript/lint and web/Android-Hermes exports pass. [CHECKS.json](artifacts/product-quality/CHECKS.json) links exact logs. The [54-input manifest](artifacts/product-quality/SOURCE_INPUTS.json) has digest `980ac9108bdc727fcabeff8768bc7b0660b71dd28bd4fd27cb9f9273b993f76e`. Pure async persistence tests cover slow/failed writes and stale results; an account-save merge preserves newer local fields, explicit goal and editor step rather than overwriting them with an older response.

Both new INTERNAL-TEST APKs are built under [quality-addendum-20261016](artifacts/android/quality-addendum-20261016/): x86_64 38,459,341 bytes SHA256 `35974413C158C4452DD82973D6CCB7F214BFF1697BB4BECD6C2F327AFDE1F8BB`; ARM64 37,171,483 bytes SHA256 `10716DFA4DAE6C3D5ACD41B0C586F4FA9931816251E58B64870C3F6ACDE71612`. [Independent binary inspection](artifacts/product-quality/BUILD_INSPECTION.json) verifies zero source drift, byte-identical 2,039,480-byte Hermes, configured local API, correct ABIs, fonts/full licenses and executed Debug-signature checks. ARM64 remains uninstalled. Successful packaging does not establish runtime or backend reachability.

The new x86 APK is installed as an update with account/drafts preserved. The first actual native cases pass: required Rules checklist jump, optional Sources jump, precise invalid-source input focus with real Gboard avoidance, retained 7.50 goal, Reach and distinct current-draft Campaign page/Advertisement views. Root personally opened screenshots 01/04 in [after](artifacts/product-quality/after/). Native state/restart/sync-failure, review, receipt/report and increased-text checks remain in progress; Metro is still running at this point, so no current Metro-independent claim is made yet.

Subsequent candidate evidence: signed-in local edits survive a controlled Campaign-API outage and process restart without a URL/identity change; account-sync failure is explicit and retry after service restoration confirms both copies. Exact359744 also passes forced cold launch with Metro absent and API healthy (captures18–20; [pause/restoration proof](artifacts/product-quality/metro-pause-proof.json)). Later checks run with Metro restored. At360dp/font 1.3, Explore search/filter return and both-theme checklist/Rules remain readable. Native owner and [fresh screenshot review](artifacts/product-quality/FLOW_REVIEW.md) identify one minor post-IME footer-corner clipping defect; no primary labels/actions are lost. Screenshot14 is loading/identity evidence, not stable error-layout acceptance.

One focused correction batch is now open: Android keyboard avoidance uses height only while the keyboard is visible, returning to ordinary flex layout when hidden without remounting children; the saved-draft helper sentence gets its missing space. TypeScript passes this candidate correction. The first addendum APKs/54-input digest above remain the exact pre-correction snapshot; a new tagged rebuild and targeted confirmation are required before claiming the footer is fixed. Remaining native review/receipt/report checks continue on the unchanged installed359744.

Earlier pass2 APKs, 12-surface verdict and all previous videos remain checkpoint history. No physical-device, first-time human test or judge-reachable backend is claimed. Live voice remains optional and unavailable through existing configured services; the honest editable/manual fallback is retained.

## Historical checkpoint: reference-driven design and black pass2

The new user request rejects the preceding visual result and replaces its
ultramarine/editorial direction with the attached compact mint-and-charcoal mobile
reference. The PDF still governs functionality. This iteration preserves the
existing Expo/FastAPI architecture, all five tabs/creation steps and working
financial, privacy and lifecycle rules. Nothing is published automatically.

Before edits, the clean root source at `b300d55` was preserved in
`artifacts/checkpoints/before-reference-redesign-20261016-101133`: 102 files,
source ZIP SHA256 `4d37a5b048be45f3f055c346d6f468f4598fb83dc48228ce515debd8936b959b`.
All 25 PDF pages were reread. The actual organizer recording/transcript is absent;
documented user-supplied organizer clarifications remain the secondary evidence.

The reference was opened directly. Fresh incumbent Android captures are under
`artifacts/reference-redesign/before/`, tied to installed historical APK
`638807B4…`. Root inspected Home, Detail and Checkout; the native owner inspected
all seven captures. These show the oversized intro and distant funding information
that the new structural composition addresses.

Impeccable context **ran successfully** using its documented `IMPECCABLE_HOME`
override under ignored `tools/impeccable-cache`; its earlier missing-engine/cache
blocker is resolved. Actual Product Design preflight found no saved context.
Product Design reference translation and screenshot audit plus Impeccable
Operate/Android/craft-floor guidance are applied. No alternate scaffold or image
mockup is needed for this explicit reference and existing native target. The web
text reader could not load the reference website; prior product understanding and
the PDF remain available. No direct organizer-video review is claimed.

The subsequent user correction rejects the first dark palette as green-tinted. Current correction uses pure black #000000 with neutral charcoal #121212/#1C1C1C, neutral header/containers and mint limited to accents/actions. Light mode stays unchanged. Fresh black-theme installed evidence is pending; earlier green-dark captures are rejected appearance evidence, although their OS/persistence behavior checks retain their exact scope.

Initial source pass: shared semantic Light/Dark palettes, device-level
System/Light/Dark store and native appearance support; all app-owned components
consume the same context. The theme provider sits above the existing session,
query and navigation providers. Home/discovery/detail/checkout, creation/preview,
Activity/Profile/review and reports use the new system and compact layouts.
Profile Appearance is available to guests and offline signed-in Settings.

Current source checks: **50/50 frontend tests** (appearance, contrast, approved
public revision projection and sharing regressions included), **30/30 backend
tests in 12.032s**, TypeScript and lint pass. Online Expo compatibility and Doctor
**20/20** pass. Web and Android/Hermes exports pass; Android export required a
process-local project temporary directory after the sandbox temp path denied
Hermes output. The initial restricted TestClient stall was resolved by rerunning
with local socket access. No product-code workaround was needed for either.

The tagged first x86_64 candidate is
`artifacts/android/mint-theme-pass1-20261016/campaign-1.0.0-INTERNAL-TEST-x86_64.apk`,
38,440,277 bytes, SHA256
`C451DDE417D17A20B79547496E64E30DC5D9AE3AD9E0BE24922286AEC44EA197`.
It contains embedded Hermes, the configured local API address, six byte-verified
fonts and two licenses, and uses the Android Debug certificate. All 50 frozen app
inputs match `tmp/reference-redesign/pass1-frozen-inputs.json`.

Installed pass1 proof: an actual force-stop/cold launch with port 8081 confirmed
absent loaded API campaign photography and funding, and restored the saved Dark
preference. Captures 05/06 under `artifacts/reference-redesign/after-pass1/` and
`tmp/reference-redesign/metro-pause-proof.json` record this scope. Metro was then
restored; subsequent captures must not be described as Metro-off. Initial native
inspection found a material Home issue: the large header pushes featured funding
below the first viewport at 393dp. The remaining batched inspection and one
focused correction/confirmation pass are in progress. New ARM64/video and complete
native theme/workflow acceptance remain pending. Tagged builds preserve all old
APKs and logs. The old APK/video results below are historical and do not verify
this new UI.

The completed [first inspection packet](artifacts/reference-redesign/after-pass1/NATIVE_RESULTS.md)
records four P1 findings: Home funding below the first viewport, clipped enlarged
checkout labels, collapsed enlarged detail funding dock and a focused creation
field obscured by actual Gboard. One consolidated source correction compacts Home
without removing the PDF headline/explanation/actions/estimate; removes row-only
flex from stacked docks; and enables Android KeyboardAvoidingView height handling
with the safe-area top offset. The same batch incorporates the user's pure-black
Dark correction and black native splash. New source review found no material
regression in this scope. All 50 frontend tests, TypeScript and lint pass after the
correction. The 50 app inputs are frozen in
`tmp/reference-redesign/pass2-frozen-inputs.json`, digest
`31def764edeefb1d1d3a03cdecfadb9353e2ae5992b03fe0cbf8969d8376d543`.
Both corrected APKs are now built under `artifacts/android/black-theme-pass2-20261016/`:
x86_64 SHA256 `45F0D82B23CD9B6C3DAD56E029E56B7F3CAF3CD91F18CF4FC6A8DED7DE7AE187`
(38,437,869 bytes), ARM64
`CE69B6139356A578E1E4E9FC80EE01960B8E90F26C4BD7B000C5210DBB8DC166`
(37,150,011 bytes). Independent
[binary inspection](artifacts/reference-redesign/BUILD_INSPECTION.json) verifies
identical 2,018,008-byte Hermes, correct ABIs/API, fonts/licenses and signatures.
ARM64 remains uninstalled. Final frontend rerun passes 50/50 in 499.9563ms.

The installed corrected x86 passes Home first-viewport funding at 393dp in both
Light and Black. All four P1 fixes pass their targeted native confirmation:
360dp/font 1.3 detail funding and checkout labels remain complete; focused summary,
cursor and Back/Continue are visible above actual Gboard. Root personally opened
01/06/08/10 in the [new capture folder](artifacts/reference-redesign/after-pass2/).
Exact corrected-build Metro-off cold launch restores Black and ordinary identity
while rendering API photography/funding; its
[proof](artifacts/reference-redesign/after-pass2/cold-launch.json) is linked from
APK metadata. Metro was restored afterward. A fresh independent visual reviewer
returned **ship** for all 12 supplied core captures, with no material fixes in
that visual scope: [review](artifacts/reference-redesign/FINISH_REVIEW.md).
DESIGN.md and its sidecar have been
re-extracted from current source and compared with new Home/Detail captures.
Broader state continuity, full new native journey and updated actual demo remain
in progress; these targeted checks do not certify all workflows.

## Completed GitHub source backup

The earlier October 16 source-backup instruction authorized connecting this project to the
already-created **private Campaign** repository, with no application development,
force-push, history reset, new repository, deployment or service interruption.
The confirmed working directory remains `E:\Campaign`.

Root Git was absent; the nested mobile repository had one original scaffold
commit and no remote. Root `main` now retains that exact commit
`ae7271ee5da01adf0bafdfd2f13f706638aaa644`; the original Git metadata is preserved
under ignored `tmp/github-backup/mobile-original.git`. GitHub CLI was absent, so
an official portable CLI was installed and checksum-verified under ignored `tools/`.
Existing Git Credential Manager authentication verifies owner `tejassambhus17`
and <https://github.com/tejassambhus17/Campaign> as **private**. Before the initial
push, the repository had no branches or remote references, so there was no remote
history to reconcile.
The redundant device-login flow was cancelled; no new login or global Git change
was needed. `origin` points to the verified existing repository and the source
push succeeded. Local `main` tracks `origin/main`; Git remote references and the
GitHub API both verified source commit
`42b7edbe953b0c6b9f9faa3c11d14d1ffd68b9b0`, whose parent is the exact original
scaffold commit. The repository remains private. A follow-up documentation commit
records this completed milestone; the latest local/remote hash is available with
`git rev-parse HEAD` and `git ls-remote --heads origin main`.

The source-only ignore rules exclude credentials, database/uploads, toolchains,
generated native/build/test artifacts, APKs, video and the organizer PDF. Local
copies remain intact. README now documents fresh-clone setup and known omitted
evidence links; the mobile environment example has only commented, nonsecret
URLs. Independent review of all 102 staged source files and the original 13
history blobs found no live secrets. The index matches the audited working files,
with only normal Git CRLF normalization, no gitlinks and no missing/extra source.
Normal author email metadata remains in the preserved original commit. All 46
frozen application inputs still match their accepted hashes;
TypeScript and ESLint pass for this backup preparation. No app logic, UI, APIs,
database records, services or unrelated projects were changed. API and preview
health checks pass without restarting either service. No GitHub Actions,
deployment, new repository or hackathon submission was created. There is no
remaining GitHub backup blocker. Security/staging and remote verification are
tracked in [the backup guide](docs/GITHUB_BACKUP.md); detailed audit and remote
proofs remain local under ignored `tmp/github-backup/`.

## Completed local milestone: native redesign and delivery preparation

The latest attached user directive authorizes the complete UI overhaul, bounded fixes, local embedded-JavaScript INTERNAL-TEST APK preparation, Android verification and complete demo production. Expo/EAS accounts and external hosting remain deferred. Work stays in `E:\Campaign`; ERP and unrelated projects are untouched. All 25 original PDF pages were reread before this redesign; the PDF remains authoritative and unchanged.

The selected direction is a contemporary civic publication: licensed campaign photography, bundled Manrope/Newsreader, ultramarine actions, warm paper and compact functional screens. Home, Explore, campaign cards/detail, all five creation steps and previews, checkout, Activity, Profile/auth/dashboard/preferences/help, restricted review, updates and reports received intentional treatments. See [DESIGN.md](DESIGN.md), [DESIGN_AUDIT.md](DESIGN_AUDIT.md) and [UI_REDESIGN_PROGRESS.md](UI_REDESIGN_PROGRESS.md).

Recoverable checkpoint: `artifacts/checkpoints/before-redesign-20261016-014052` preserves 73 source/config/document files, hashes, original mobile Git HEAD/status and binary diff. No reset, clean or replacement project was used.

### Current evidence

- Backend **30/30 pass**, 12.712s, this run; no API business logic changed for the redesign. Frontend **34/34 pass**, 0.924s in the final post-packaging run. TypeScript and ESLint pass.
- Expo dependency compatibility is current and Doctor **20/20 pass** this run. Final correction source exports pass for web (1.4MB) and Android/Hermes (3.2MB), including all six bundled fonts. Exports are not native APK acceptance.
- Native first pass: 41 numbered Android 16/API 36 captures, five-step edit/save/resume/preview/resubmission, public contextual source, successful $5 simulated backing/private receipt and coherent Completed report. Restricted browser actions separately approved, published, prepared, started and completed the same fictional campaign. See [native first-pass results](artifacts/redesign/after-pass1/NATIVE_RESULTS.md).
- An independent fresh-context Impeccable finish review found seven material issues. All seven corrections passed targeted native recapture and independent scoring: [finish review](artifacts/redesign/FINISH_REVIEW.md), [13 native retest captures and results](artifacts/redesign/after-pass2/NATIVE_RESULTS.md). Its `ship` disposition applies only to those fixes. Actual guided fallback produced an editable draft with goal blank until Submit. A fresh submission entered confirmation at the top. Profile header Refresh passed without remount/reload: the open review queue changed from 0 awaiting/9 campaigns to 1 awaiting/10 after that native submission.
- Final INTERNAL-TEST APKs are built and structurally verified: x86_64 **38,414,397 bytes**, SHA256 `638807B4095BB537574E719A5EB537E428735C3100BAE683F54BE92B5B4C6EA4`; ARM64 **37,126,539 bytes**, SHA256 `4B7ACD6F0D7EFA4F7C43E81C427CBA3EB932805BA257243172832774F537B94C`. Both contain identical 1,993,336-byte Hermes, all six exact fonts/two full OFLs, non-debuggable release variants and Android Debug signing. Final x86_64 installed and cold-launched with Metro off, API-backed campaigns/photos, visible internal connection controls, actual unavailable-endpoint recovery/offline draft save and 360dp/font 1.3 docks. See [final acceptance](artifacts/android/internal-acceptance/final-build), [release readiness](RELEASE_READINESS.md) and adjacent artifact metadata. ARM64 remains uninstalled/runtime unverified.
- The initial B15 build and its precise proof are archived separately. It passed session restoration/logout, guest draft restart and all four non-success native guest payment outcomes without changing forest funding. The final build only adds existing connection controls behind an explicit internal flag; no payment logic changed. Root stopped only verified Campaign Metro PID14156 and left API 8787 healthy; [stop proof](artifacts/android/internal-metro-off.json), [final launch gate](artifacts/android/internal-acceptance/final-build/metro-off-before-launch.json).
- The [complete 22-scene native video](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) now exists and passes full decode, objective audio checks, [independent bounded frame/privacy review](artifacts/demo/VIDEO_REVIEW.md) and [continuous Chrome playback](artifacts/demo/PLAYBACK_RESULTS.json): 580.121354 seconds, ended=true, no media error, no seek/restart. It is 28,581,318 bytes, H.264 720×1520/AAC 48kHz mono, SHA256 `63D6DAA6823BCEC6E1F8E166977C0880E043BDD5A2A57612EBC30D57730F1358`. Encoded audio measures −16.28 LUFS/−1.74 dBTP. Playback was muted; human listening and every-frame privacy inspection are not claimed. The [native journey record](artifacts/demo/NATIVE_RESULTS.md) covers one ordinary creator/backer account through cold-restart session restoration, draft save/resume, all five steps/media/source/preview, explicit $10 goal at Submit, submission, separate reviewer approval/publication, one successful simulated backing/private receipt, Created/Backed/Saved/Payments/Activity and deliberate preparation/promotion/completion. The same campaign's final report agrees with [root's public accounting check](artifacts/demo/public-completion-root-check.json): $10 raised, $0.50 fee, $9.50 allocated, $9.02 spent, $0.48 refunded/unspent, 256 estimated/219 simulated reach, 328 impressions/7 clicks and measured reach unavailable. Raw captures/private helpers remain local; share only the reviewed delivery artifacts.
- [Final cleanup](artifacts/demo/cleanup/README.md) passed normal logout, guest private-feed/badge removal and draft isolation. The retained main-process B–F/cleanup log has 763 lines and zero documented fatal/JavaScript/type/invariant matches; the earlier guest process and overwritten lines are outside that scan. Only the owned AVD/ADB on 5039 stopped. API on 8787 and the restored preview on 8081 are healthy; owned device/player ports 5039/5560/5561/8791 are clear. [Runtime proof](artifacts/demo/LOCAL_RUNTIME.json) records the post-capture Metro restart; the optional DevTools updater used its built-in fallback. Browser preview is left on guest Home.

### Remaining acceptance and external blockers

The available local implementation, artifact, native-journey and video gates have passed in their recorded scopes. Physical Android/ARM64 runtime, screen-reader use, independent first-time human comprehension and human narration listening remain unverified. Public judging still needs an explicitly reachable backend arrangement and production signing; accounts/hosting remain user-deferred and no hosted URL was invented. TestFlight is conditional/unproduced. Telegram submission requires separate explicit direction; nothing was sent. The reported maximum October 20 at 11:59 AM and its timezone remain unconfirmed because accessible official Telegram content exposed no posts.

Existing production review items remain open: uploaded draft images have unlisted public media URLs, and the recorded SDK/toolchain dependency audit has unresolved upstream findings. A compatible remediation was previously attempted; forcing incompatible Expo/React Native versions was not applied. These boundaries were not changed or presented as resolved by the redesign. Private campaign metadata, sessions, payment records and receipt capabilities retain the tested server protections.

The sections below preserve the earlier Activity milestone and historical tests. They do not override the current redesign/build/video status above.

## Historical milestone: organizer Activity alignment

Organizer-video alignment: targeted Activity/Notifications usability, contextual navigation, reliability and native acceptance. Preserve the implemented prototype and PDF workflows. Expo/EAS accounts, external hosting and release setup remain deferred. Continue independent local work without unnecessary questions. Root is `E:\Campaign`; ERP and unrelated projects remain untouched. All 25 original PDF pages were read before development; relevant pp. 4/6/12/18-24 reread for this audit.

## Organizer alignment audit

The user's 13-point reviewed-video summary supplements the PDF. No actual video/transcript was supplied or independently watched in this session. Existing Expo/React Native APKs, one audience/creator/backer account model, five-step/manual/voice-fallback creation, transparent dummy backing and minimal restricted review already align. No restart, broad redesign, live advertising or expanded admin platform was needed.

Concrete gaps found: Activity lacked campaign context, followed links had identical labels, payments used the wrong singular category for their icon, and all campaign notifications led to generic detail while an awaited read write could delay navigation. The refinement adds a virtualized chronological native list, explicit unread/category controls and shared tab count, named followed campaigns, safe server-resolved report/edit/payment/account destinations and independent nonblocking read state. Profile consumes contextual section intents and sends only the changed preference category. Server fixes serialize partial-preference merges and order tied notifications deterministically. Source tests pass (30 API / 34 frontend); live migration, browser context routes and targeted native acceptance passed in the scopes below. Repeated editor navigation was fixed and retested before final source checks.

The demo video is the first evaluation stage per the supplied organizer summary. docs/DEMO.md now prioritizes the complete native journey and corrects stale rehearsal statuses; no finished video is claimed. Monday, October 19 remains the working target. Reported maximum Tuesday, October 20 at 11:59 AM and its timezone are **unverified**: web lookup could not read the private group, and the official [Telegram invitation](https://t.me/+brkDpS8rYfBjNzll) in Chrome exposed only group name/member information and Join Group, without posts. No group was joined, account configured or message sent. Current deadline verification needs an accessible organizer post; implementation continues independently.

## Current decisions

Expo SDK 55.0.31 / React Native 0.83.10 / React 19.2 / TypeScript / Expo Router. TanStack Query owns server caching; a small session context and scoped AsyncStorage draft library own client persistence. Native bearer sessions use SecureStore; browser preview uses browser storage. One FastAPI backend with project-local SQLite transactions/migrations, validated image storage and cached seed photos. SQLite substitutes for suggested PostgreSQL for the credential-free local prototype. No cloud adapter or competing backend was added.

Design: warm neutral background, forest-green actions, restrained coral accents, editorial headings, shared UI states and controls. Brand choices are project decisions, not organizer specifications. Dummy checkout, delivery and voice/AI manual assistance are clearly labelled. Demo policy: USD, included 5% platform fee, no extra transaction fee, 27 estimated people per net advertising dollar; values come from server configuration. Guest browsing and guest payments work without account creation. Public backer names are private by default.

## Implementation status

Implemented local flows:

- Five stable bottom tabs with contextual navigation and guest Home/Explore/detail reading.
- Shared campaign data, functioning search/category/sort/funding filters, loading/no-results/error states, editorial stories and public sources.
- Manual and guided voice/AI demo creation, exact five-step sequence, title validation, persistent scoped drafts and explicit guest-to-account transfer, story formatting/reordering/images/statistics/actions/sources, media validation, ad placement previews, targeting/allocation/duration, explicit goal at Submit, policy confirmation, full preview and submission timeline.
- Hashed-password accounts and expiring bearer sessions, ownership checks and restricted reviewer controls. Approval, public funding, preparation, promotion and completion are separate server-guarded stages. Material revisions preserve the approved public version and require review/setup reconfirmation.
- Atomic/idempotent simulated contributions, all five payment outcomes, private receipts/history, synchronized funding, milestones and proportional simulated refunds.
- Creator dashboard with all six status filters, saved/backed/followed campaigns, recipient-scoped notifications/preferences, creator updates and audience-readable updates.
- Progress/final reports distinguishing funds raised, allocated budget, spend, refunds, estimated reach, simulated impressions/clicks and unavailable measured reach.
- Root local startup/test wrappers, branded app metadata, EAS APK profile prepared (not executed as a release), Android-native generation and successful local ARM64/x86_64 debug APK builds. Android 16/API 36 emulator checks pass for all five creation steps, real Story/ad PNG uploads, explicit goal/rules/submission, draft process restoration, hardware Back, SecureStore session restoration, logout privacy, guest backing/receipt, sharing/deep-link routing and compact detail layouts. Standalone release remains deferred.

The active detailed coverage matrix is [REQUIREMENTS.md](REQUIREMENTS.md). Initialization-context requirement rows are historical baseline snapshots; they are not current completion claims.

## Actual verification evidence

| Check | Command / observation | Result and scope |
| --- | --- | --- |
| Backend behavioral suite | `services/api/.venv/Scripts/python.exe -m unittest -v test_api`, working directory `services/api` | Latest full run: **30 tests pass**, 11.895s. Covers auth, ownership/reviewer gates, persisted/ordered/formatted drafts, idempotent draft creation, submission validation, private receipts/history, all payment outcomes, concurrent duplicate/unique payments, lifecycle, underfunded deadline approval, material revisions/setup reconfirmation, timestamps, deduplicated milestones, updates, proportional refunds including 130 small backers, private cache headers, malformed receipt/feedback validation, safe contextual Activity destinations/public titles, stable ordering/read persistence, concurrent preference merging and multi-role notification deduplication. |
| Frontend business/transport/session/sharing tests | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 test` | **34 tests pass**, latest root run 0.598s: 7 creation (24 assertions), 3 money, 3 discovery, 13 transport/provider, 3 sharing and 5 Activity cases. Covers draft normalization, cent-level reconciliation, filters/sorts, backend switching, invalid addresses, offline/multipart handling, public-only expiry recovery, private/write no-replay, late401/storage races, unpublished-share blocking and private-revision title exclusion, Activity filtering/calendar groups, contextual destinations, safe fallbacks and malformed dates. |
| TypeScript | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 typecheck` | Pass after Activity/navigation/preference refinements. |
| ESLint | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 lint` | Pass, zero errors/warnings at latest check. |
| Expo compatibility | SDK-compatible dependency check plus `expo-doctor` | **20/20 doctor checks pass**; dependency check reports up to date. Offline dependency check alone was not relied on as proof. |
| Web export | Expo `export --platform web --max-workers 2` | Final source pass after Activity/navigation/preference refinements, 1.4MB JS bundle. |
| Android JS/Hermes export | Expo `export --platform android --output-dir dist-android --max-workers 2` | Final source pass after Activity/navigation/preference refinements, 3.2MB Hermes bundle. This is **not** a native build, APK installation or Android interaction test. |
| Real API HTTP smoke | Health, campaign list/images, auth/reviewer queue, CORS, private receipt, updates/history, logout | Port 8787 returns healthy API responses; seed images are served locally. Receipt capability tokens are absent from HTTP logs after access logging was disabled. |
| Local native compile | Project-isolated Gradle/JDK17, ARM64 `assembleDebug` | **BUILD SUCCESSFUL**, 10m15s, 302 tasks. Development APK 51,135,312 bytes, SHA256 `84EAB6ED8B51AFBF0BADEF36E12384A73BBECD80F27270819D132B00BB2B3BF9`. Requires Metro; ARM64 physical-device installation is unverified. |
| Emulator native build/launch | Durable launcher x86_64; Android 16/API 36 isolated AVD | **BUILD SUCCESSFUL**, 2m54s; APK 51,718,658 bytes, SHA256 `89E36224679B5DDFB212E00CEE1B55F58F84ADEC64932FEB10BAD30749F93AAC`. Installed and launched. Guest Explore loaded campaigns/images from 10.0.2.2:8787; five tabs clear system bars. Targeted native journeys below passed. |
| Native creation and persistence | Actual x86_64 APK plus final Metro source; E-ANDROID2 | Keyboard resize, explicit save, guest draft force-stop/relaunch/resume, contextual system Back and backward-state preservation passed. Separate real Android photo-picker PNG uploads rendered in Story/ad editors. All five steps completed with Pune demo/Public libraries, Instagram 60%/Facebook 40%, 14 days. Goal stayed empty until explicitly entered as $5; policies/preview/rules/submission passed. Profile independently showed Submitted for Review, $0/$5 and estimated reach 128. Initial wrong-image fixture selection was corrected before submission, as documented in ANDROID_LOCAL.md. |
| Native backing, identity and sharing | Actual Android 16/API 36 interaction; E-ANDROID2 | $5 guest simulated success showed $0.25 fee/$4.75 ad budget/reach 128, funding rose exactly once from $1,840 to $1,845 and private receipt opened. Existing reviewer sign-in survived force-stop/relaunch through SecureStore; account drafts excluded guest drafts. Logout removed Review/private Activity. Share chooser opened then was dismissed; targeted amplify VIEW intent opened the correct public detail. No message was sent. |
| Native layout/logs/cleanup | 393 default plus 360/411 logical widths | Three-line Home hero, keyboard and reserved funding/CTA/tab footer inspected. Final Campaign-PID log scan found no fatal/JS error/type/invariant matches in its checked scope. Density restored to 440; only the project AVD and dedicated ADB 5039 stopped, with no 5039/5560/5561 listeners remaining. API and Metro remain healthy. |
| Guest discovery/backing browser | Root, 390x844 browser viewport | Search `ocean` reduces six seeded campaigns to one; detail/source/funding views load. A $1.10 simulated payment showed $0.06 fee/$1.04 ad budget/28 estimated reach, funding rose exactly once, private guest receipt opened and report totals synchronized. No real money moved. |
| Creation browser journey | QA agent, desktop web 1536x639 | Guest draft save/reload/resume and autosave; required Basics/title maximum; story formatting/statistic caption/action/source/reorder/back preservation; story/cover/ad uploads; placement switching; 80% allocation validation; goal empty until Submit, consent/goal validation, full preview and successful review submission. Dashboard status/goal/reach matched. Guided editable assistance fallback exercised honestly. |
| Reviewer-to-report browser | Creation agent; final report visual check at 390x844 | Inspected story/sources/assets/targeting; approved then separately published; simulated $125 payment -> goal reached without ad launch; explicit preparation/setup/start/progress/completion. Final report: $125 raised, $6.25 fee, $118.75 allocated, $112.81 spent, $5.94 refunded, 4,111 simulated impressions and 90 simulated clicks; measured reach unavailable. Receipt/activity/logout privacy checked; final browser warning/error logs empty. |
| Review branches/revisions browser | QA agent, E-WEB4 | Requested changes -> creator feedback/editor -> resubmission; separate rejection -> Requires Action and absent from discovery. Material edit kept old approved content public, private draft could not be approved, submitted revision required review, promotion required setup reconfirmation before completion. Cross-actor dashboard state refreshed without browser reload. Screenshots under `artifacts/qa`. |
| Offline recovery browser | Root, E-WEB5, 390x844 | Switched only the test client's backend to unavailable 8788. Profile showed a connection error; Explore offered Try again. Guest draft title/creator/summary survived edit/save/reload/resume offline. Restored 8787, verified connection and discovery search recovered. Live API was never stopped for this test. |
| Non-success checkout browser | Root, E-WEB6 | Forest campaign $5 Pending/Rejected/Cancelled/Failed each showed the accurate result and recovery actions. Its progress report remained $1,840/$2,400 with one successful seeded contribution after all four attempts. No real funds moved. |
| Expired-session browser | QA agent, E-WEB7 | Two owned tabs restored the same QA account. Normal Sign out in one revoked the session; public ocean detail recovered as guest in the other, whose Profile showed sign-in with no private dashboard/Review. No browser storage injection or SQL mutation; checked warning/error logs empty. |
| Supporting information browser | Root, E-WEB9 | Guest Profile opened and closed About, Partners, How It Works, FAQs, Help, Contact, Terms, Privacy and Community Guidelines. Each displayed the relevant content and honest support/policy boundaries. Screenshot saved under artifacts/qa; preview restored to Home. Native ancillary sections and screen-reader behavior were not repeated. |
| Organizer Activity browser | Root, E-WEB10, 360x780 | Unread/category states, campaign identity, plural-payment icon, grouped cards and no horizontal overflow verified. Payment history and Preferences opened the correct Profile context; legacy final-report action opened the actual completed report. A real correction request appeared with feedback and owner edit action. Checked warn/error logs empty; screenshots under artifacts/qa. Native handoff/read/preferences checks recorded separately. |
| Partial native recording | Local Activity rehearsal only | A 45-second 540x1140 credential-free Activity/filter clip is retained at artifacts/android/activity-native-rehearsal.mp4. MP4 container/duration checked; root played it through 45.361856 seconds in Chrome over a temporary loopback-only preview, inspected frames, reached ended=true with no media error, then closed the preview. This predates the editor-link fix and is not the full PDF demo video or final-build acceptance. |
| Live organizer migration | Root, API 8787 | Consistent SQLite backup made, only verified Campaign server restarted, migration 004 applied with all existing counts preserved. Health 200; actual authenticated Activity returns safe title/destination metadata and no-store without capability tokens. Smoke session logged out. |
| Native Activity follow-up | Actual installed x86_64 APK/current Metro source; E-ANDROID3 | Unread count/badge/independent read and filters pass; read state and campaign preference Off survive force-stop/relaunch. Restored preferences On. Payment/account/settings routes, named Following/progress/detail action and refresh/pull refresh pass. Repeated correction links reopen the editor after saved-draft entry and after another local draft, preserving goal/feedback/story/ad/Reach. No content edit/resubmission. Logout removes private feed/badge/Review and preserves separate guest drafts. Final scoped Campaign log clean; owned AVD/ADB stopped with API/Metro healthy. Native empty/offline filters, report action and every review/payment branch were not repeated here. |
| Color contrast calculation | Relative-luminance calculation of shared tokens | Main text/background11.13:1, primary button8.67:1. Muted text now5.11:1 on background,5.43:1 on white,4.81:1 on mint and4.74:1 on peach (the previous mint/peach pair fell below4.5). Small coral labels improved from4.40:1 to4.66:1 on the app background. These are token-pair checks; full screen-reader/accessibility testing remains pending. |
| Compact phone browser layout | 360x780 and 390x844 | No horizontal document overflow; compact-width hero sizing keeps its intended three lines and visible primary action. Five tabs remain visible. Saved screenshots `artifacts/qa/home-mobile.jpg` and `home-compact.jpg`; browser viewport reset afterward. |
| Startup wrapper | `start-local.cmd` | Verified existing Campaign API and Expo preview and reused them; starts owned hidden processes if absent. A direct `.ps1` invocation was blocked by the machine's script policy; the `.cmd`/documented per-process invocation avoids changing global policy. |
| Final evidence integrity | Matrix/document/link/artifact checks | 248 unique requirement rows with eight columns and valid statuses; active local document links resolve. Original PDF SHA-256 unchanged. Both preserved debug APK sizes/hashes independently match the Android guide. |

No first-time human usability study or screen-reader test is claimed. Browser evidence is distinct from Android-native evidence.

## Toolchain findings

System Node 20.9.0 is below SDK 55 minimum 20.19.4. `scripts/mobile.ps1` selects bundled Node 24.21.0 or an explicit `CAMPAIGN_NODE`; no global installation changed. A project-isolated Android SDK/Gradle/JDK17 toolchain is installed under `tools/android-sdk` and `tmp/android-build`. JDK17 resolved an upstream Foojay resolver/JDK21 vendor-constant failure; process-local Android home variables resolved an inherited SDK-home conflict. ARM64 and x86_64 compilation succeeded. Official emulator acceleration passed (WHPX); the Android 16/API 36 x86_64 system image/isolated AVD supported the targeted native checks above. Existing shared ADB was left untouched; testing used dedicated port 5039, now stopped with the owned AVD. Reproduction and precise limits are in [docs/ANDROID_LOCAL.md](docs/ANDROID_LOCAL.md).

Expo prebuild generated `apps/mobile/android` through CNG, without changing dependency versions. Generated metadata confirms package `com.campaignamplification.mobile`, app name Campaign, portrait orientation, `amplify` scheme, keyboard `adjustResize`, and blocked camera/audio permissions. Native sources are generated and must not be hand-edited. The expected prebuild script change (`android`/`ios` use Expo run commands) is retained; root wrappers remain the documented entry points.

## Fixed integration issues

- System npm's `.cmd` shim used older Node despite PATH changes; verified commands invoke compatible Node directly and the wrapper handles selection.
- SDK peer font/splash dependencies are now explicit after dependency reconciliation exposed a missing font runtime module. Browser rendering and doctor checks pass afterward.
- Restoring a valid session during a network failure no longer silently deletes it; only an explicit unauthorized response clears it.
- Client/server channel names, formatting persistence, preference shape and money rounding now agree.
- Story preview/published rendering share the same component; metadata, captions, credits and formatting survive publication.
- Empty-string/stray-whitespace children caused React Native View warnings; corrected. Funding progress remains visible at contribution review.
- Reports do not represent unavailable impressions/clicks/unspent calculations as verified zero delivery. Policies render current server refund conditions, including retention of the platform fee after promotion.
- Creation/publication timestamps, closed-funding time copy, explicit partial-budget approval and post-revision setup reconfirmation are handled distinctly.
- Goal-reaching contributions emit only the highest newly crossed funding milestone, avoiding four repetitive notifications.
- Windows Metro crashed when native generation replaced directories. `metro.config.js` excludes only generated native directories; a check confirmed Android is excluded and source remains included. Restarted only the verified Campaign Metro child, applying this configuration; API and other services were left running.
- Development backend switching validates the address, clears the previous login/cache and preserves local drafts. Invalid/unsafe URLs are rejected before switching. Connection feedback now appears for guests as well as signed-in users.
- API JSON responses now prevent caching private drafts, revisions and feedback; media keeps its public image cache. Malformed receipt capability/feedback inputs produce validation failures rather than server errors. Simulated progress pauses while a material revision is pending or distribution setup needs reconfirmation.
- An explicit expired-session401 clears the current identity, durable session and private cache. Only an allowlisted public GET can retry as a guest; writes/private reads are never replayed. Token generations and serialized storage writes prevent a late401/cleanup from erasing a newer sign-in. Network failures retain the saved identity.
- PDF p14 accessibility review added the shared compact funding summary to the reserved detail footer. Raised/goal/progress/reach remain visible while sources/story scroll; header sharing follows p13. Unpublished public links are blocked and private revision titles do not enter share payloads.
- Actual Android checks corrected system Back to mirror the wizard's contextual Back, refined native serif sizing to three headline lines, and replaced unsupported Unicode line separators in Activity/Profile with explicit newlines. Shared draft state survives process restart. Help copy now distinguishes guest device drafts from account-saved copies.
- Activity now provides real campaign context and direct report/edit/payment/settings actions. Read persistence no longer blocks navigation, and successful updates modify only the existing recipient cache. Profile navigation intents reset scroll/context and clear after use; preference controls patch only the changed category. Shared unread count/badge and native list virtualization preserve the existing five-tab architecture.
- Targeted native testing found a repeat correction-link bug: after leaving the editor for saved drafts, the same notification could return to entry because Create remembered an already-opened campaign parameter. Create now consumes each intent while focused, saves the current device snapshot before switching, and preserves that snapshot for same-campaign reopening with the existing version-conflict safeguards. Submitted drafts are not reinserted by this save. Exact before/after native evidence is tracked in E-ANDROID3.
- Partial notification preferences now merge under the database write transaction, preventing concurrent updates from erasing each other. Timestamp ties use insertion order. Legacy notifications retain safe destinations; current permissions prevent owner editor actions/private revision titles reaching followers.
- The Windows startup helper now checks occupied ports with focused netstat because managed Get-NetTCPConnection access can be denied. The actual helper correctly identified owned 8787/8081 and free 8788; startup reused the healthy project listeners. No unrelated process is stopped by the launcher.

## Current runtime

- App preview: <http://localhost:8081> (also 127.0.0.1 origin for isolated browser QA).
- API/health: <http://127.0.0.1:8787/health>.
- API reference: <http://127.0.0.1:8787/docs>.
- Launch/reuse: `start-local.cmd`; logs for launcher-owned processes are under `tmp/run`.
- Seed and test campaign records are local fictional demonstration data, not real organizer submissions. Private reviewer credentials stay in ignored `services/api/.demo-credentials.json`.
- Latest Campaign API restart uses owned server PID 9996 / launcher 18004; logs/PID are under tmp/run. Ownership was verified through health, own startup log, exact Python paths and focused netstat. Normal termination was denied by the managed environment; sandbox escalation approved stopping only the verified old PID 35424. Migration 4 preserved 3 users/10 campaigns/14 payments/59 notifications before smoke login; a consistent SQLite backup is in tmp/qa. New Activity metadata/no-store and smoke logout passed. Other services were not stopped.

## Known limits and deferred work

- Both debug architectures compile; x86_64 installation and targeted native creation/media/persistence/auth/backing/share/layout checks pass. Native reviewer branches and every payment outcome were not repeated; browser/API evidence covers those branches. Physical devices, broader device/font scaling, screen-reader use, first-time human comprehension and complete standalone-release acceptance remain unverified. Debug APKs need Metro; the isolated emulator is stopped after testing.
- Voice transcription, live AI/image generation, video creatives and advertising networks are not connected. The permitted clearly labelled manual/demo boundaries are shown. Push/email delivery and optional comments are not enabled.
- Uploaded images use unlisted random public URIs so native image rendering works; draft assets are not authenticated media. Metadata and draft content remain permission-protected. This is documented in the API README and needs reassessment before production use.
- Dependency audit reports 36 upstream findings (21 high, 15 moderate) in the selected SDK/toolchain dependency graph. Compatible `npm audit fix` was attempted; force remediation proposes incompatible SDK/RN changes (including an Expo downgrade), so it was not applied. This remains an explicit dependency review item; no claim of production security readiness is made.
- External setup is deferred by the user: EAS reports signed out; no new Expo, Supabase, Render or GitHub account/resource was created or connected. No cloud adapter/deployment changes were made. A free-only preference is retained for later hosting. A standalone release needs a durable reachable HTTPS backend rather than development localhost.
- Standalone signed release APK, TestFlight and external submission are incomplete; account/hosting/release setup remains deferred. The full mandatory demo video is pending and is the first evaluation stage per the organizer summary. A 45-second Activity rehearsal plays through without a media error, but does not cover the complete journey or final build. No release success, full-video completion or submission is claimed.

## Next actions

The organizer alignment fixes and targeted browser/native checks are complete within the scopes above. 30 API tests, 34 frontend tests, TypeScript, lint and final-source web/Android exports pass after the repeat-editor/Profile fixes. Keep the local preview/API available; owned emulator/ADB and temporary video-preview helper are stopped. The full native submission video and final standalone-build acceptance remain delivery priorities; the partial Activity rehearsal is not a substitute. Account/hosting/release setup remains user-deferred; no external resource should be created while that direction remains active. Obtain an accessible current Telegram organizer post/timezone to verify the reported maximum deadline; keep Monday as the target meanwhile.
