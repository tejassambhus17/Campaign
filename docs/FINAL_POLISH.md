# October17 final product polish — build-only report

## Scope and status

The user's attached final unattended directive authorizes implementation and
local Android packaging only. No phone connection is needed or accessed.
The approved mint/neutral-charcoal design and deployed HTTPS architecture are
preserved. The previous working CloudTest APK remains under
`artifacts/android/cloud-render-20261017/`.

Source corrections are IMPLEMENTED. TypeScript compilation in the packaging
pipeline passed and Gradle completed `BUILD SUCCESSFUL in 2m 5s`. No changed
workflow is marked runtime-verified or submission-ready. The new APK was not
installed or executed.

| Package fact | Build-only result |
| --- | --- |
| APK | `E:\Campaign\artifacts\android\final-polish-20261017\campaign-1.0.0-FINAL-POLISH-CLOUD-TEST-arm64.apk` |
| Size | 48,654,523 bytes (46.40 MiB). |
| SHA-256 | `701E3A1A5AA9EB2E886D7BB195B4B7A5AB00148B19E77A5EA1241BAB6169D7F5` |
| Package / version | `com.campaignamplification.mobile` / 1.0.0, unchanged. |
| Architecture / variant | `arm64-v8a` / non-debuggable release variant, CloudTest. |
| Signing | Existing Android Debug certificate; SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. |
| JavaScript | Embedded Hermes, 2,130,080 bytes; no Metro expected by build configuration. Installed launch untested. |
| Backend | Packaged Hermes API assignment is `https://campaign-api-cw8y.onrender.com`; cleartext and local connection controls disabled. |
| Native dependency | Generated Expo module map includes `expo.modules.application.ApplicationModule`. |
| Evidence | `artifacts/final-polish/BUILD_ONLY.json` and adjacent APK JSON metadata. |

## Onboarding

`campaign:onboarding:v1` is a device-level AsyncStorage marker, separate from
account sessions and backend-scoped drafts. `welcome` and `complete` are
persisted; `restoring` is an in-memory state. Tabs wait for restoration, so Home
cannot render before a fresh-install Welcome decision. The approved Profile
Welcome/Auth flow remains the single implementation. Get Started opens
registration; Sign In opens login. Explicit Continue as guest persists
completion and opens public Home; successful first authentication also
completes onboarding. Remember, session expiry, logout and cloud identity
isolation keep their existing contracts.

For a missing marker on an older installation, saved session/draft/preference
evidence migrates existing users. Android additionally reads package install
and update times using SDK55 `expo-application` 55.0.19; a legacy in-place
update can skip Welcome even for a prior guest with no saved activity. An
existing explicit `welcome` marker always wins, including after updates.
Unavailable package metadata falls back to local evidence, then Welcome.
Storage failure holds the existing error/retry treatment. Serialized storage,
single-flight restoration and revision guards prevent late migration results
from overwriting explicit completion. This behavior has source/compiler
evidence only in this pass.

## Creator actions

All five steps share `CreationActionDock`, also reused for preview/manual
continuation. It has no rectangular background panel, shadow or overlay.
A compact transparent-outline Save & Exit/Back sits beside a wider mint
Next/Continue/Submit. Horizontal inset is 18 units, gap/padding 12, minimum
button height 48. Below 260 units of effective width after font scaling,
actions reflow vertically. The dock consumes normal flex layout space below
the scroll view; existing Screen keyboard avoidance and tab-bar system insets
continue to own those concerns. Existing save, validation, step, loading and
review handlers remain connected. Actual keyboard/layout acceptance is pending.

## Other source-confirmed corrections

- Explore now matches Home's font-scaled search/filter height and constrains
  input width; the short placeholder remains.
- Home's secondary feed heading can shrink/wrap beside See all.
- Preview allocation/fee rows wrap constrained text; preview-tab text centers.
- Profile payment history reflows title/amount at narrow widths; Help surfaces
  external-reference launch failure through its existing error notice.
- The quick notification unread/action header can wrap with larger text.

Other inspected detail/back/report/reviewer/update/photo paths did not justify
unrelated behavior or styling changes. Existing contribution docks already
occupy layout space beside their scrolling content; they were retained.

## Changed files and purpose

| File relative to `E:\Campaign` | Purpose |
| --- | --- |
| `apps/mobile/src/lib/onboarding.ts` | Single persisted introduction state and legacy migration. |
| `apps/mobile/src/lib/session.tsx` | Restore/completion sequencing without duplicate authentication state. |
| `apps/mobile/src/app/(tabs)/_layout.tsx` | Hold tab mounting and route incomplete users to Welcome. |
| `apps/mobile/src/features/auth.tsx` | Explicit guest/Home completion and first successful authentication route. |
| `apps/mobile/src/features/creation/CreationUi.tsx` | Shared responsive editor action dock. |
| `apps/mobile/src/app/(tabs)/create.tsx` | Use dock for five steps and preview without changing handlers. |
| `apps/mobile/src/app/(tabs)/index.tsx` | Constrain secondary section-heading width. |
| `apps/mobile/src/app/(tabs)/explore/index.tsx` | Search/filter size and input-width constraints. |
| `apps/mobile/src/features/creation/Preview.tsx` | Wrap financial/allocation text and center tab labels. |
| `apps/mobile/src/app/(tabs)/profile.tsx` | Payment row reflow and external-link failure feedback. |
| `apps/mobile/src/features/notifications/NotificationSheet.tsx` | Scaled-text header wrapping. |
| `apps/mobile/package.json`, `apps/mobile/package-lock.json` | SDK-compatible Expo Application dependency. |
| `scripts/android-local.ps1` | Include dependency manifests in native-generation fingerprint. |
| `AGENTS.md`, `INIT.md`, `PROJECT_CONTEXT.md`, `PROGRESS.md` | Current build-only boundary, setup and decisions. |
| `RELEASE_READINESS.md`, `REQUIREMENTS.md`, `DESIGN.md`, `docs/ANDROID_LOCAL.md`, this report | Candidate scope, design and remaining acceptance. |

## Build and source preservation

Pre-change checkpoint: `refs/checkpoints/final-polish-20261017`, commit
`660c69b4f341df8558b9a78d1cbdd1e8f4508cc1`. It includes the existing uncommitted
source; normal main HEAD and index were preserved. No branch was switched,
no force-push performed and no deployment triggered.
The final source is retained under `refs/checkpoints/final-polish-built-20261017`;
the exact commit is recorded in the local `SOURCE_COMMIT.json` build artifact.
Neither checkpoint was pushed, and existing deployment/main branches were not
moved. The working source remains available without discarding prior changes.

Packaging uses the existing local pipeline, Node24.19, SDK36/JDK17/Gradle9,
ARM64 only, CloudTest release variant with embedded Hermes and the existing
Android Debug certificate. The configured origin remains
`https://campaign-api-cw8y.onrender.com`. Server credentials are not build
inputs. Dependency resolution added only Expo Application; npm emitted system
Node20.9 engine notices while installing, while compilation explicitly uses
Node24.19. No automatic dependency-fix upgrade was run.

## Explicitly not performed

No automated test suite, standalone lint/quality scan, UI/browser/emulator or
physical test, ADB, APK installation/execution, new screenshot, performance
benchmark, live API/cloud smoke/probe, database migration, production-data
mutation, backend restart/deploy, EAS build, video or external submission was
performed. TypeScript and mandatory Gradle compilation/package checks are
build steps, not functional acceptance.

## Remaining acceptance

The user must inspect this new candidate's first installation versus normal
update, returning guest and valid/expired session behavior, Welcome actions,
all five dock states, keyboard and large-text/compact layouts, and the revised
rows/error states. Package-metadata-unavailable migration falls back to saved
evidence or Welcome. No new visual, accessibility, performance or stability
guarantee follows from compilation. The earlier human report of unplugged
and fresh-install success applies only to the previous cloud APK. Production
signing, held recording and submission remain separate.
