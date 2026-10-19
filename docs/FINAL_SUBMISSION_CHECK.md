# Final submission check — October 19

**Current status:** source checks, the same-key **1.5.1 / code 12** Android
build/package checks and the named exact-binary native checks below pass.
Twenty fresh gallery captures are available. Physical, human and hosted
QA-write acceptance remain pending; the entire app is not declared fully
verified.

## Fixes included

- **Queued keyboard events during account writes:** saving/submitting dismisses
  the keyboard and synchronously locks draft changes before awaited work begins.
  Delayed text, goal and policy-consent events cannot change the accepted request
  snapshot while the write is running. Editing resumes after success or failure.
- **Goal child-state rejection:** the amount field respects an explicit rejected
  parent change, retaining its visible amount and frozen currency reference
  rather than displaying a value the draft did not accept. This also applies to
  changing the currency preference while busy.
- **Truthful busy hint:** a saving goal field says “Saving your draft…” rather
  than describing a temporary write lock as a permanently published goal.
- **Truthful draft storage label:** account draft rows say “Account”, replacing
  the hardcoded “Connect to resume” wording that also appeared while online.
  Draft IDs, content, order, dates and actions are unchanged.
- **Prior Profile corrections retained:** transparent HQ Studio artwork, clean
  Light header, no text/art collision, decorative artwork omitted at increased
  text sizes, and two-column feature labels in the adaptive layout. Five tabs,
  the moving five-step editor rail, account/guest isolation and existing cloud
  business rules remain.

## Automated results

| Check | Result | Evidence |
| --- | --- | --- |
| Frontend | **439 passed**, 0 failed/skipped | [Full log](../artifacts/final-submission-20261019/frontend-tests-confirmed.log) |
| TypeScript | Exit 0 | [Log](../artifacts/final-submission-20261019/typecheck-confirmed.log) |
| Full source/plugin ESLint | Exit 0, no warnings | [Log](../artifacts/final-submission-20261019/eslint-confirmed.log) |
| Focused input-lock regressions | Passed | [Focused log](../artifacts/final-submission-20261019/creation-input-lock-tests.log) |
| Isolated backend regression | **74 passed** in 30.520 s | [Result](../artifacts/final-submission-20261019/SQLITE_REGRESSION.json), [log](../artifacts/final-submission-20261019/sqlite-regressions.log) |
| Android Release | Built in **1 min 40 s**; **28/28 package checks**; 0 drift across 149 frozen inputs | [Build log](../artifacts/final-submission-20261019/android-build-confirmed.log), [package checks](../artifacts/final-submission-20261019/PACKAGE_VERIFICATION.confirmed.json) |

The updated [Campaign.apk](../artifacts/final-submission-20261019/Campaign.apk)
is **1.5.1 / code 12**, 68,616,866 bytes, ARM64+x86_64, signed with the existing
dedicated Campaign key. SHA-256:
`928e6690df3f40198dcbd4f4cb3bbeb2cfdb195b2becc2902185a2c6f6006e60`.
The package retains its Campaign installer identity, embedded JavaScript/Hermes
and configured HTTPS backend. Successful compilation/package inspection does
not substitute for native interaction acceptance.
The earlier `8b40…481d5` 1.5.1 package is a preserved first candidate, not the
confirmed delivery binary. Its `candidate-final-*` captures retain that scope.

The 74 backend cases used disposable SQLite files under Campaign's test-data
directory and in-process HTTP. The guarded runner removed provider environment
settings in its child process and blocked external connections. These tests
cover existing API, reporting, draft deletion and assessments; they neither
changed production records nor prove the live Neon/Render/Cloudinary services.
No backend source, deployment, migration, seed or provider configuration changed.

A separate [public HTTPS sanity check](../artifacts/final-submission-20261019/PUBLIC_HTTPS_SANITY.json)
used GET only: `/health`, `/config` and `/campaigns` each returned HTTP 200. It
observed 24 public campaigns and the existing USD configuration: 5% platform fee,
0 transaction fee, 27 estimated people per net advertising dollar, simulated
payments/delivery, and live AI/voice disabled. No credentials or private account
records were requested, and these reads did not change the services or data.

## Native and performance scope

Earlier 1.5.0 native checks established the Profile artwork/Light/text-layout
corrections and bounded creation/Studio behavior. Their screenshot and
interaction evidence keeps its original binary scope. The confirmed 1.5.1 APK
received a compatible data-preserving update and cold launch in 1888 ms on the
owned `emulator-5574` / ADB5039, without Metro or backend USB forwarding;
[receipt](../artifacts/final-submission-20261019/INSTALL.confirmed.json).
Fresh exact-binary `final-*` PNG/XML captures cover Home, Explore, campaign
details, Trust, contribution, reports, Create steps, readiness, suggestions,
preview, Activity and Profile/Studio. Main-route inspection found no visual
blocker. Light and 130% text retain the clean header, crisp Studio illustration
and readable reflow without art overlap; decorative artwork yields space at the
increased text size. Twenty fresh gallery PNG/XML pairs are available, alongside
additional font-audit evidence. The fresh isolated auth AVD `emulator-5578` on
dedicated ADB5039 installed the same confirmed APK and cold-launched in 2342 ms;
[auth receipt](../artifacts/final-submission-20261019/AUTH_INSTALL.confirmed.json).
Its Welcome capture shows the expected first mountain slide and clean footer
without Settings, preserving the main emulator's session/drafts without account
sign-out or data clearing. Additional auth/carousel checks are recorded
separately as actually completed; no credential submission or account write is
implied by these screenshots.

[Actual gesture results](../artifacts/final-submission-20261019/NATIVE_GESTURES.confirmed.json)
confirm finger-left Story → Updates and finger-right back to Story; Explore
All → Environment and back to All; filter overlay Cancel/Android Back preserves
the mounted list. An initial harness assertion ran before the starting tab's
selection animation settled; verifying Story as the start and then repeating
the gestures passed without an app change.

[Native PDF sharing](../artifacts/final-submission-20261019/PDF_SHARE.confirmed.json)
opened Android's real chooser and was cancelled without selecting a recipient.
No report was sent. A bounded 500-line current-process
[log sample](../artifacts/final-submission-20261019/APP_LOG.confirmed.txt) contained
no failure markers. This is neither a full-session crash proof nor a hosted
account-save test; the async write/IME rejection has isolated source regression
evidence, while live hosted Save Draft remains unperformed.

The following **pre-build software-emulator baselines** are actual Android
`gfxinfo` samples on the task-owned API 36 x86_64 emulator using SwiftShader.
They are diagnostic observations, not physical-phone measurements or a claim of
zero jank. Modern and legacy Android counters use different classifications and
must not be combined.

| Surface | Frames | Modern jank | Legacy jank | p95 / p99 | Raw sample |
| --- | ---: | ---: | ---: | ---: | --- |
| Home | 317 | 7 / 2.21% | 312 / 98.42% | 38 / 48 ms | [Home](../artifacts/final-submission-20261019/PERF.home.baseline.txt) |
| Explore | 249 | 13 / 5.22% | 30 / 12.05% | 26 / 31 ms | [Explore](../artifacts/final-submission-20261019/PERF.explore.baseline.txt) |
| Campaign detail | 240 | 18 / 7.50% | 118 / 49.17% | 31 / 34 ms | [Valid detail](../artifacts/final-submission-20261019/PERF.detail.valid-baseline.txt) |
| Activity | 229 | 13 / 5.68% | 98 / 42.79% | 28 / 32 ms | [Activity](../artifacts/final-submission-20261019/PERF.activity.baseline.txt) |
| My Campaigns | 211 | 17 / 8.06% | 15 / 7.11% | 24 / 34 ms | [My Campaigns](../artifacts/final-submission-20261019/PERF.my-campaigns.baseline.txt) |

The earlier `PERF.detail.baseline.txt` is retained as diagnostic history; the
table uses the explicitly valid detail sample. Software rendering, host load,
emulator timing and Android counter differences limit comparison. No sustained
physical-device smoothness or performance improvement is inferred from this
baseline. Final native results and any later samples must state their exact
APK, environment and interaction scope separately.

The exact confirmed 1.5.1 Home sample rendered **309 frames**, with **21 modern
janky frames (6.80%)**, **306 legacy janky frames (99.03%)**, p95 **42 ms** and
p99 **57 ms**; [raw sample](../artifacts/final-submission-20261019/PERF.home.confirmed.txt).
This software-SwiftShader result does not support a zero-jank claim or establish
a physical-device regression/improvement against the different baseline sample.

## Fresh first-launch and guest checks

The same confirmed APK was installed into a new isolated `Campaign_Submission_Auth_36` / `emulator-5578` on dedicated ADB5039. Welcome opened with the new first mountain slide. Real photo-area gestures advanced mountain → coast → turtle and returned to coast; tapping the first indicator selected the mountain. Matching captions and indicators were observed. Blank Sign in and Register forms were inspected without credentials or submission. Guest entry showed the optional tour invitation; skipping it only affected this new local emulator. Profile then showed **Guest profile**, Sign in/Create account and device drafts/preferences, rather than Welcome. [Recorded assertions](../artifacts/final-submission-20261019/AUTH_NATIVE_CHECKS.confirmed.json), [guest capture](../artifacts/final-submission-20261019/native/audit-final-guest-profile.png).

Both task-owned emulators were gracefully stopped with their data preserved; no phone/default ADB operation, cloud account write, app reset or uninstall occurred. Twenty exact-build gallery images are now optimized to **1,699,089 bytes**;21/21 local documentation/media checks and13/13 recorded public badge/documentation requests pass. Private release access and APK upload remain separate.

## Remaining acceptance and delivery

- **Final APK:** build/package/signature/hash checks and named exact-binary
  native checks pass within the scope above. Twenty fresh gallery captures are
  prepared; optimized-image validation is recorded in the media documentation.
  Previous 1.5.0 and 1.4.0 APKs remain preserved.
- **Physical release:** pending. The authorized POCO's existing Debug signer is
  incompatible with the dedicated release key. No uninstall, data clear or
  incompatible replacement is authorized by these checks.
- **Human usability:** pending; the owner says no unfamiliar tester is available.
- **Submission/publication:** not performed. No cloud rollout, paid resource,
  recording, organizer submission, Git commit or push was part of this QA pass.

Source, README, current galleries and supporting documentation are ready for
one owner-reviewed source commit. **The APK is a separate GitHub
Release asset:** committing source does not upload or update the downloadable
application. Generated APKs, toolchains, credentials, environment files, signing
material and private data remain outside the source commit. Keep the repository
private and publish/attach a release asset only through the separately authorized
release process.

Automatic approval review rejected the optional hosted **Save Draft** test
because it would mutate remote account data outside this task's no-account-save
boundary. The command was blocked before the action; no hosted QA draft was
saved. Safer device-local persistence checks, isolated backend tests and public
read-only HTTPS checks completed. Hosted QA-write acceptance remains unverified.
