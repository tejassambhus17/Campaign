# Development progress

## October17: free provider account connection resumed — IN PROGRESS

The user now requests guided Render/Neon/Cloudinary account connection, strictly
free with no credit card. The earlier deferral is superseded. Official Free
terms were rechecked; actual account eligibility and resources remain unverified.
Start with Neon login/project setup, then Cloudinary, then Render using the
existing private Campaign repository only. Login/verification/provider terms
are completed directly by the human; no secrets belong in chat. No provider
account/resource or public backend is claimed created yet. Recording remains held.

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
