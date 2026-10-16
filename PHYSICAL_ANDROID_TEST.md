# Physical Android test

Updated October 16, 2026 (Asia/Calcutta).

**Completed on the actual authorized POCO phone.** The existing ARM64 APK was installed, cold-launched without Metro, connected to the local backend over USB, and tested through the requested core workflows. Two layout issues and measurable frame jank remain. This is bounded physical-device evidence, not whole-product, production or human accessibility approval.

The [native execution record](artifacts/physical-android/20261016/NATIVE_RESULTS.md), [final diagnostics](artifacts/physical-android/20261016/FINAL_DIAGNOSTICS.json) and [independent screenshot review](artifacts/physical-android/20261016/VISUAL_REVIEW.md) retain the performed steps and limits. The emulator was not substituted for the phone. Recording remained off.

## Scope and preservation

- Project root: `E:\Campaign`, resolved and verified before this task.
- Only the connected phone explicitly authorized by the user may be targeted. Every device operation must select its exact serial; unrelated ADB servers, devices and emulator sessions remain untouched.
- Preserve application data. Use an update installation when compatible; do not uninstall, clear storage, bypass an incompatible signer or reset the phone. Any incompatible replacement/data-deleting action requires user approval.
- No backend business-logic changes, ERP access, external account/hosting setup or recording. Screenshot capture is authorized; recording/media production remains held.
- Use project-owned fictional QA records for ordinary functional tests. No lifecycle/payment API or database injection and no deletion of user campaigns.

## Artifact preflight

The latest documented corrected artifact is [quality-addendum-pass2 ARM64 APK](artifacts/android/quality-addendum-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk). Its actual file SHA-256 was rechecked in this task.

| Property | Confirmed artifact fact |
| --- | --- |
| APK bytes | 37,171,783 |
| SHA-256 | `24348DD939CC174C0B5C72716E015CE5519DE78091E7BA5B7C4489836B6B096A` |
| Package/version | `com.campaignamplification.mobile`, versionCode 1 / versionName 1.0.0 |
| Native ABI | `arm64-v8a` only; matches the detected phone |
| Minimum SDK | 24 (Android 7.0+), checked from the APK using project-local `aapt2` |
| Target SDK | 36 |
| Signing | Android Debug certificate; SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c` |
| Build | Release variant labelled INTERNAL-TEST; not a production-signed release |
| JavaScript | Embedded 2,039,780-byte Hermes; source/binary evidence does not establish a phone launch |
| Current baked API | Emulator-only `http://10.0.2.2:8787`; must be replaced by a phone-reachable connection for this task |
| Source checkpoint | 54 inputs, digest `a302e8c14b3706e92efc4eb54c1f7c7e11ac53476ca007fde9ad07b76c5c44a9` |

[Artifact metadata](artifacts/android/quality-addendum-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk.json) and [independent inspection](artifacts/product-quality/pass2/BUILD_INSPECTION.json) record the prior binary checks. ARM64 was uninstalled before this task; this report adds separate actual physical installation and Metro-independent launch evidence below. Source/binary inspection alone does not establish those results.

The existing native configuration path is **Profile → Information & help → Demo connection settings → Backend address → Save connection & reconnect**. It persists the selected device address and verifies `/health`, showing “Backend connection verified.” A changed backend address intentionally signs out; saved device drafts remain. Use a reachable LAN address or a deliberately scoped USB reverse connection, with the actual method recorded below. Never treat `10.0.2.2` as a physical-device host.

## Device and installation evidence

| Check | Status | Actual result/evidence |
| --- | --- | --- |
| USB physical phone discovered | VERIFIED | [Device baseline](artifacts/physical-android/20261016/DEVICE_BASELINE.json), detected October 16 at 07:54:05 UTC; Xiaomi/POCO model `2312FRAFDI`, non-emulator |
| USB debugging authorized | VERIFIED | State `device` through project-local ADB on existing Campaign server port 5039, including after reconnection; every phone command is scoped to its exact serial. This does not establish permission to inject touch input |
| Exact target, model, Android/API and CPU ABI | VERIFIED | Android 15 / API 35; `arm64-v8a` primary ABI, also reports 32-bit ARM support. Display 1080×2400, density 440, original font scale 1.17; exact serial retained in the local baseline |
| Existing Campaign/signature compatibility | VERIFIED | No installed Campaign package path was returned in the selected device profile. ARM64 APK minimum API 24 is compatible with API 35 and matching ABI; no installed Campaign signer conflict was found. Storage is not cleared |
| Exact APK installed with app data preserved | VERIFIED | [Installation record](artifacts/physical-android/20261016/INSTALLATION.json): `adb install -r` returned `Success`, first install 13:26:01 local October 16; current ARM64 hash `24348DD9…B096A`, version 1.0.0. No previous Campaign package was present; no uninstall, storage clear or other app replacement was used |
| Initial native launch | VERIFIED | Explicit Campaign `MainActivity` launch opened the actual app; [initial physical screenshot](artifacts/physical-android/20261016/01-installed-initial.png) shows Black Home, five tabs and loading placeholders. This image was also opened by the report reviewer |
| Cold launch without Metro | VERIFIED | Exact ARM64 hash `24348DD9…B096A`: [host Metro pause](artifacts/physical-android/20261016/METRO_INDEPENDENCE.json) confirms 8081 absent/API healthy, and [actual physical cold launch](artifacts/physical-android/20261016/COLD_LAUNCH.json) reports `COLD`, `Status: ok`, 1,285ms total / 1,323ms wait. [Settled API Home](artifacts/physical-android/20261016/12-metro-off-api-home.png) shows forest photo/funding and configured estimate. Capture 11 is transient loading and excluded from settled API acceptance |
| Existing backend reached by phone | VERIFIED for USB connection | [Saved phone address](artifacts/physical-android/20261016/06-backend-verified-USB.png) is `http://127.0.0.1:8787`, through only the selected phone's USB reverse `tcp:8787 → tcp:8787`. [Loaded Black Home](artifacts/physical-android/20261016/07-home-backend-loaded-BLACK.png) renders API photography, configured fee/reach illustration and actual funding. Earlier capture 05's emulator address is superseded. This is USB connectivity, not LAN/hosted acceptance |

## Functional and native checks

The original PDF's five tabs, exact creation order and contribution meaning remain the acceptance criteria (pp. 3–5, 8–16, 21–23). Prior emulator results remain historical evidence and are not copied as phone passes.

| Test | Status | Actual result/evidence |
| --- | --- | --- |
| Home: images, funding and message-distribution explanation | VERIFIED for exercised views | Captures 07/12 show API forest photography, $1,845 of $2,400 (77%), amplification explanation and the configured demo-fee estimate. Final capture 67 returns to Black Home after the tests |
| Explore: search/category/sort and return-state retention | VERIFIED for search/filter/return | [Filtered discovery](artifacts/physical-android/20261016/10-explore-search-filter.png) and [detail return](artifacts/physical-android/20261016/17-explore-return-preserved.png) retain `forest`, Environment and Featured with one matching campaign. Cycling through every sort/filter is not inferred |
| Campaign detail: story, progress and use-of-funds | VERIFIED for exercised content | [Header/funding](artifacts/physical-android/20261016/14-guest-detail.png) and [scrolled story](artifacts/physical-android/20261016/16-detail-story-scroll.png) show status, editorial text/photo/credit and persistent funding/backing action. Backing policy/privacy explanations were read in checkout. Public source-page loading and every expandable detail disclosure were not tested |
| Create Basics → Story → Campaign & Ad Visuals → Reach → Submit | VERIFIED for new QA creation/submission | The sole phone owner exercised the exact five-step order on the new fictional “Physical phone QA - shared pages demo” draft. At [Submit before goal entry](artifacts/physical-android/20261016/32-submit-empty-goal.png), goal and rules remain required; the creator then entered 12.34 only at Submit. [Saved Submit](artifacts/physical-android/20261016/34-submit-saved.png) shows $0.62 included fee, $11.72 advertising budget and 316 estimated people. After save/resume and rule confirmation, [actual submission](artifacts/physical-android/20261016/51-submission-confirmation.png) entered review and explicitly remained unpublished with no advertising started. Reviewer decisions are not implied |
| Back navigation, automatic local saving and restart/resume | VERIFIED for exercised draft | [Back to Reach](artifacts/physical-android/20261016/35-back-reach-retained.png) preserves fictional Pune targeting/interests. Capture 34 explicitly reports device/account saved. Actual force-stop/COLD launch (1,051ms) retained Light/font 1.3, account and draft library; captures 45–47 resume the same Submit draft with 12.34 goal / $0.62 fee / $11.72 budget / 316 estimate. Existing drafts remained untouched |
| Preview and submission checklist navigation/focus | VERIFIED for exercised targets | Required Funding goal and Rules targets reach their existing fields; actual numeric entry and policy confirmation precede submission. Optional missing advertising-image guidance stays optional. Distinct [Campaign page](artifacts/physical-android/20261016/36-campaign-page-preview.png) and [Advertisement](artifacts/physical-android/20261016/37-advertisement-preview.png) views use the same live QA draft |
| Simulated contribution: amount, fee, net advertising, estimate, confirmation | VERIFIED for one Pending and one Success | On the existing fictional forest campaign, [review](artifacts/physical-android/20261016/55-checkout-review-one-dollar.png) shows $1 total / $0.05 included fee / $0.95 advertising / $0 extra transaction fee. [Pending](artifacts/physical-android/20261016/57-payment-pending.png) adds no funds. One later [Success](artifacts/physical-android/20261016/58-payment-success.png) shows $1,846 raised; [private receipt](artifacts/physical-android/20261016/61-activity-exact-payment.png) and [enlarged receipt values](artifacts/physical-android/20261016/65-black-enlarged-receipt-values.png) match $1 / $0.05 / $0.95 / 25 estimated audience / $0 completed refund. [Independent ledger reconciliation](artifacts/physical-android/20261016/PAYMENT_RECONCILIATION.json) confirms exactly one successful contribution. All money/delivery is simulated |
| Activity: contextual campaign/update/payment destinations | VERIFIED for exercised events | Submission notification/action reaches the correct owned unpublished campaign (52–53); Payments filter shows the new Pending/Success records (60), Success opens its exact private Profile receipt (61), and [receipt-to-report](artifacts/physical-android/20261016/63-receipt-report-destination.png) reaches the forest campaign report. Other event categories/reviewer branches are not inferred |
| Profile: account, drafts/history, private payment receipt and settings | VERIFIED for exercised sections | Actual guest Profile/connection controls, ordinary fictional account restore, Created draft/submission, Payments exact private receipt, Backed view and appearance settings are exercised. Existing account records remain preserved; negative ownership/privacy branches and every dashboard filter were not repeated on the phone |
| Light and neutral-black Dark; state preserved on appearance change | VERIFIED for exercised draft | Native owner changed to Light, resumed the same explicit-goal draft, cold-restored Light/account/draft at font 1.3, then restored original font 1.17 and selected Dark. [Enlarged Light editor](artifacts/physical-android/20261016/44-light-enlarged-keyboard.png) and [Black library after restoration](artifacts/physical-android/20261016/49-black-library-restored-font.png) retain their stated scopes. Live System-mode OS switching is not inferred |
| Real phone keyboard, scrolling and action visibility | VERIFIED for pictured editor cases | [Black focused summary](artifacts/physical-android/20261016/25-basics-keyboard-black.png), [Black numeric goal](artifacts/physical-android/20261016/33-submit-goal-keyboard.png) and [Light enlarged numeric goal](artifacts/physical-android/20261016/44-light-enlarged-keyboard.png) show real Gboard, visible focused content, pinned five-step indicator and complete actions. Black uses original font 1.17; Light uses 1.3. Capture 34 shows complete rounded footer after dismissal. Other route/theme/font combinations are not inferred |
| Touch targets, safe areas and selected enlarged-font screens | VERIFIED within sampled cases | Actual tabs, editor actions and primary controls have approximately 48 dp or larger sampled bounds; five tabs, keyboard/footer and three-button system navigation remain separate. Light editor and Black receipt at font 1.3 remain readable, including [complete receipt values](artifacts/physical-android/20261016/65-black-enlarged-receipt-values.png). Original font 1.17 was restored. This does not certify every control or screen |
| Launch/navigation performance measurement | VERIFIED measurements; follow-up remains | First post-boot cold start: 10,027 ms. Exact Metro-off launch: 1,285 ms total / 1,323 ms wait. Later Light/draft restart: 1,051 ms. Final gfxinfo: 3,975 frames, 275 janky (6.92%), p50 8 ms / p95 20 ms / p99 69 ms. These are bounded Activity/frame measurements, not API-ready time, sustained FPS or an all-smooth claim |
| Application-specific crash/log inspection | VERIFIED within collected scope | [Final diagnostics](artifacts/physical-android/20261016/FINAL_DIAGNOSTICS.json) inspect Campaign PIDs 24316 and prior 20037 with application-specific tags: zero matched fatal/JavaScript error patterns. Package exit info records only two deliberate USER REQUESTED / FORCE STOP exits, with no recorded crash or ANR. No global log clear or unrelated app-log collection |

## Evidence and limitations

The [read-only source integrity record](artifacts/physical-android/20261016/SOURCE_VERIFICATION.json) confirms all 54 frozen app inputs match, no backend drift, and unchanged APK/PDF hashes. API health and restored preview HTTP 200 pass. This physical task did not rerun source suites or modify application/backend logic.

The [payment reconciliation](artifacts/physical-android/20261016/PAYMENT_RECONCILIATION.json) uses only independent public report GETs after actual native UI checkout:

| Field | Before | After $1 Pending | After one $1 Success |
| --- | ---: | ---: | ---: |
| Raised | $1,845.00 | $1,845.00 | $1,846.00 |
| Included fees | $92.25 | $92.25 | $92.30 |
| Advertising allocation | $1,752.75 | $1,752.75 | $1,753.70 |
| Successful contribution records | 2 | 2 | 3 |

The successful delta is exactly $1.00 = $0.05 fee + $0.95 advertising, counted once. The Pending attempt remains distinct and does not fund the campaign. No API/database payment write or real payment was used.

## Actual remaining issues

**P2 — unpublished campaign Share header clips horizontally.** [Capture 53](artifacts/physical-android/20261016/53-activity-submission-destination.png) shows the disabled Share group and its explanatory text extending beyond the right edge in Black at original font 1.17 after Activity opens the creator's submitted/unpublished QA campaign. Explore Back, submitted status, funding and disabled “Not open” action remain intact; the primary workflow is not blocked. Root and the report reviewer both opened this actual frame. Read-only source inspection points to the unconstrained `ShareButton` helper wrapper in [campaign.tsx](apps/mobile/src/features/campaign.tsx) beside the compact detail-header return action in [detail route](apps/mobile/src/app/(tabs)/explore/[id]/index.tsx) as the likely layout cause. No fix or rebuilt-APK acceptance is claimed; current source/APK were deliberately preserved during this existing-app test.

**P3 — report journey label wraps awkwardly.** [Capture 63](artifacts/physical-android/20261016/63-receipt-report-destination.png) splits the final “n” of “Preparation” onto a second line at original font 1.17 in Black. The stage remains identifiable and report actions work. No correction or retest is claimed.

**Performance follow-up.** The first post-boot launch was slow, and the collected frame sample has 6.92% janky frames and a 69 ms p99. Mixed scrolling, keyboard and configuration changes are included; the frame counters were not reset for a controlled benchmark. The separate legacy jank counter uses a different definition (866 frames / 21.79%) and is not combined with the primary counter. Further profiling is warranted; no sustained smoothness, battery or memory-endurance acceptance is claimed.

## Setup history and acceptance limits

The first attempted native Profile tap failed with Android `SecurityException` / `INJECT_EVENTS` permission denial. The user then enabled POCO Developer options **USB debugging (Security settings)** and reconnected the phone. It reappeared authorized on port 5039, but the second and third precisely targeted Profile taps still returned the same permission exception. No Profile navigation occurred during those failed taps. This was a device permission blocker, not evidence of an application crash. No failed tap is counted as screen coverage.

The native owner consulted the [official scrcpy prerequisites](https://github.com/Genymobile/scrcpy#prerequisites), which document that Xiaomi devices may require a reboot after enabling the extra security setting, and asked the user to reboot/unlock the phone or choose manual navigation. scrcpy was not installed or used; only its documentation was consulted. Read-only probes for `adb_input_enabled` in all three Android settings namespaces returned `null`; these unrecognized/unavailable keys are not proof that a switch is disabled. The user completed the phone reboot; no agent reset or permission bypass was used. The updated [restart observation](artifacts/physical-android/20261016/RESTART_OBSERVATION.json) records boot complete and uptime 156.68 seconds at 08:07:05 UTC. Subsequent actual Profile and connection-control captures show interaction resumed; initial failures are resolved historical setup issues, not application defects.

The initial screenshot verifies an actual phone launch but shows loading placeholders, not loaded API campaigns. The [blocked-input Home snapshot](artifacts/physical-android/20261016/02-input-blocked-home.png), renamed from an initial misleading Profile filename, is not Profile coverage. Actual Profile coverage begins at capture 03, configured USB backend at 06, loaded Home at 07 and exact Metro-off settled Home at 12. Capture 11 is deliberately excluded as a transient loading frame. The report reviewer personally opened 01, 03, 05, 06, 07, 10, 12, 14, 16, 17, 25, 27, 28, 32–35, 37, 38, 44, 47, 51, 53, 55, 57, 58, 61, 63 and 65; functional action results remain attributed to the sole phone owner.

The actual authorized phone, binary compatibility, installation and initial app launch are confirmed. The phone had no installed Campaign path or reverse mappings in its baseline. The only added mapping is the selected phone's backend 8787 reverse, restored after reconnection; no Metro reverse was added. The separate `emulator-5560` was not used. During reconnect diagnosis, device inventories were read on ports 5039 and 5037 without modifying either ADB server; no unrelated device command was issued. No backend business logic, app source or other phone apps/data were changed, and no device storage was cleared.

Only capture 12 and its preceding transient 11 are in the exact physical Metro-off interval. The verified Campaign preview was restored to HTTP 200 at 08:14:03.900 UTC and API health remained OK; later screenshots must not be described as Metro-off. The host proof preserves a precise limit: the owned listener command/path was verified before stopping it, but its numeric child PID was not persisted; a parent cleanup identity guard then halted and no unverified wrapper was terminated.

The [bounded startup log](artifacts/physical-android/20261016/APP_STARTUP_LOG.txt) and [initial exit-info output](artifacts/physical-android/20261016/APP_EXIT_INFO_STARTUP.txt) remain startup-only history. Final [current-process log](artifacts/physical-android/20261016/CAMPAIGN_PROCESS_LOG.txt), [prior tested-process log](artifacts/physical-android/20261016/CAMPAIGN_PRIOR_PROCESS_LOG.txt), [package exit info](artifacts/physical-android/20261016/CAMPAIGN_EXIT_INFO.txt) and [gfxinfo](artifacts/physical-android/20261016/CAMPAIGN_GFXINFO.txt) support the final bounded diagnostics above. Empty filtered log buffers do not imply every device warning or untested branch is clean.

Capture number 19 is excluded: an unexpected OS-owned password-save prompt appeared during QA sign-in and was dismissed without saving a password or changing an account. Only that generated PNG/XML pair was removed by the native owner; root independently confirmed zero remaining capture-19 files without reading their contents. No user or application record was deleted. The report reviewer did not open that excluded pair, and it is not acceptance evidence. Subsequent app-only Profile evidence is tracked separately.

There are 65 preserved PNG/XML pairs: 01–18 and 21–67. Capture 20 was never created. Capture 38 is accurately named `38-preview-audience-funding`, 41 is `41-create-entry-light-enlarged`, and 59 is `59-checkout-receipt-requested-confirmation`; they are not source-row, Submit or visible-receipt proof respectively. No password-entry capture is used.

Final phone state is Black Home under the ordinary fictional Mint Reach Demo account. Original 1080 × 2400 display, density 440, font scale 1.17 and IME setting 1 are verified; only the selected phone's backend reverse remains. The submitted QA campaign, distinct Pending/Success attempts and all prior records are preserved. No further device action is required for this test.

The working backend connection requires this USB cable, debugging authorization, project ADB and the running local API. It does not verify LAN/firewall behavior, organizer/public hosting or a bundled offline backend. Hosting/EAS setup remains deferred. Source-page loading, photo-picker uploads, live voice, every payment/error/offline/reviewer/distribution/refund branch, live System-mode OS changes, landscape/gesture navigation, TalkBack and first-time human comprehension remain unverified on this phone. Production signing, current video acceptance and submission are separate; recording remains held.
