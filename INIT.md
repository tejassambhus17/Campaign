# Campaign Amplification Hackathon: initialization guide

**Current resume note:** The October 16 Product Quality Addendum is implemented within the existing Light/black Dark design. Current artifacts use tag `quality-addendum-pass2-20261016`. Its ARM64 APK is now installed on the user-authorized POCO Android 15 phone; actual USB-backed API access and Metro-off cold launch pass. [PHYSICAL_ANDROID_TEST.md](PHYSICAL_ANDROID_TEST.md) records completed core phone workflows, two layout findings and bounded launch/frame-performance concerns; TalkBack and human acceptance remain open. The existing in-app connection override is `http://127.0.0.1:8787` through only that phone's USB reverse8787; this requires USB and the local API and does not establish LAN/hosted access. First-candidate and corrected-emulator evidence retain their exact scopes. Follow [PROGRESS.md](PROGRESS.md), [RELEASE_READINESS.md](RELEASE_READINESS.md) and [docs/ANDROID_LOCAL.md](docs/ANDROID_LOCAL.md) for current setup and remaining gates. Older checkpoints below are historical. Recording and media production remain held until explicit human authorization.

Initialized October 15, 2026. Development was subsequently authorized and the connected local prototype now exists. Read [AGENTS.md](AGENTS.md) first, [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) section 18 for the implemented architecture, and [PROGRESS.md](PROGRESS.md) for current evidence. Sections C/D/H retain the original initialization snapshot for history; section J and README contain current run guidance.

## A. Project overview

Build a polished, functioning mobile prototype for community-funded message amplification. Creators prepare stories and evidence; the platform reviews campaigns; backers pool money for advertising and distribution beyond the creator's existing network. Contributions do **not** directly fund the cause, person, or organization described in the message (PDF pp. 1-3).

- **Project:** Campaign Amplification Hackathon.
- **Primary development agent:** OpenAI Codex.
- **Submission target:** Monday, October 19, 2026 (Asia/Calcutta planning timezone). The user's October 16 organizer-video summary reports a maximum Tuesday, October 20 at 11:59 AM. Current Telegram posts and that cutoff's timezone remain unverified; keep Monday as the working target. The PDF supplies no deadline.
- **Required delivery:** Android APK and a demo video of the complete journey. iOS TestFlight is conditional if requested for the final stage and otherwise encouraged if possible. Code submission is not required; the team must be able to explain the architecture and demonstrate the implementation (pp. 23-24).
- **Priorities:** clear product meaning, premium mobile usability, connected end-to-end behavior, durable drafts, coherent lifecycle and payment states, backend validation, privacy, and truthful verification. Optional extras must not displace required flows.

## B. Project references

| Reference | Purpose |
| --- | --- |
| [Hackathon_Requirements.pdf](Hackathon_Requirements.pdf) | Original, authoritative 25-page product brief. The uppercase filename in the request is a reference to this actual file. |
| <https://campaign-one-pearl.vercel.app/> | Secondary product/workflow reference; use a mobile-first interpretation. |
| [AGENTS.md](AGENTS.md) | Startup protocol, isolation, precedence, development and completion rules. |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Detailed flows, page traceability, proposed data model, requirement statuses, roadmap, and decisions. |
| [PROGRESS.md](PROGRESS.md) | Current implementation progress and evidence; the initialization-only absence is historical. |

All 25 PDF pages were read on October 15, 2026, including source links and submission instructions; page renders were also inspected during the preceding PDF review. See context section 2 for the document fingerprint and source limitations. The reference homepage was accessible in Chrome during the earlier review, although the web text reader could not load it. No claim is made that every website flow was audited.

To find requirements, use the context page map and traceability IDs, then read the corresponding original PDF pages. Do not rely on a prior chat summary when the original is available. If the PDF changes, re-review it and reconcile the context before relying on the old matrix.

## C. Development environment: original initialization snapshot

**Authoritative project root:** `E:\Campaign`, verified as the resolved current directory and confirmed by the user. The original macOS project location is superseded. Current shell: PowerShell on Windows.

| Area | Confirmed requirement / current fact | Proposed approach | Undecided or pending |
| --- | --- | --- | --- |
| Mobile | React Native with Expo is required (pp. 2, 22); no app initialized | Expo mobile app with reusable UI | Version, project scaffold, supported device baseline |
| Language | TypeScript strongly recommended by PDF | Prefer TypeScript across app and any Node backend | Final configuration; no compiler installed/configured for the app |
| Navigation | Stable five-tab bottom navigation; consistent contextual back behavior | Expo Router or React Navigation with nested detail/editor flows | Library choice and route layout |
| Backend | Clear API architecture, server validation, role permissions | Node/Express or Python/FastAPI; managed alternatives can be evaluated | Framework, hosting, API contracts |
| Database | PostgreSQL is suggested; Supabase/managed alternatives acceptable | Relational persistence for campaigns, reviews, payments, states | Provider, schema, migrations, backup/reset strategy |
| Authentication | Guest browsing; protected ownership/reviewer actions | Small demonstrable account/session flow with enforced roles | Provider, guest checkout identity/receipt rules |
| Storage | Campaign/story/ad asset uploads and previews required | Project-isolated asset storage with validation | Provider, supported media, size/type limits |
| Payments | Dummy provider; clearly labelled simulation if no credentials | Deterministic simulated outcomes verified server-side | Adapter and receipt implementation; no real payment integration selected |
| AI / voice | Editable drafts and labelled demo/manual fallback permitted | Provider adapter with transparent fallback | Provider, speech support, image-generation capability |
| Build | Installable Android APK required | Expo build workflow; EAS internal/APK profile or suitable local Android build | Build method, accounts, SDKs, signing, credentials, configuration |
| Testing | Common mobile sizes; required behavior verified | Domain/API checks plus Android end-to-end walkthrough and visual checks | Tools, scripts, devices/emulator, coverage plan |

These are requirements and recommendations, not installed technologies. No package manifests, backend, database, authentication, storage, app build configuration, or test suite exists at initialization. Earlier read-only PDF review left `tmp/pdf-deps/` and `tmp/pdfs/`; these are review helpers/artifacts, not app dependencies or product code. This initialization task installs nothing.

## D. Project structure: original and planned baseline

Actual baseline after this task:

```text
E:\Campaign\
  AGENTS.md
  INIT.md
  PROJECT_CONTEXT.md
  Hackathon_Requirements.pdf
  tmp\
    pdf-deps\       # PDF reader dependency from the earlier review
    pdfs\           # earlier page renders/contact sheets
```

Proposed future layout, subject to architecture confirmation; directories below have **not** been created:

```text
apps/mobile/         Expo app, navigation, screens, shared UI and feature state
services/api/        backend API, validation, permissions, lifecycle/payment logic
packages/contracts/ shared schemas/types if useful for the selected stack
database/           schema/migrations/seed data if needed
tests/              meaningful integration and journey checks
docs/               demo, architecture, delivery notes when needed
artifacts/          project-owned build/demo outputs, excluded appropriately later
PROGRESS.md         active implementation status and verification evidence
```

Avoid a monorepo/package split if its overhead outweighs its value. Confirm the layout before scaffolding and update this section to match the real codebase. No directory here implies a locked-in framework or implemented service.

## E. Initialization workflow

1. Verify the resolved root is `E:\Campaign`; read persistent instructions.
2. Load the current context, decisions, requirements, and later progress notes.
3. Identify actual implementation state from files, configuration, and test evidence.
4. Review the original PDF requirements relevant to the requested change.
5. Inspect affected files, reusable components, models, APIs, and architecture.
6. Plan a targeted change with acceptance criteria, dependencies, and explicit assumptions.
7. Implement only work authorized by the current task, preserving working functionality.
8. Verify behavior with appropriate checks; report failures and untested limits accurately.
9. Update context for durable decisions, this guide for setup changes, and progress notes for changing status/evidence.

During this initialization, only the three root Markdown files are created. Application development awaits the user's next instruction.

## F. Development phases

The detailed dated roadmap and risks are in context section 13. Work in dependency order:

1. **Foundation:** choose justified stack/services, app and backend boundaries, design tokens, navigation, persistent state, validation/permissions, isolated seeded data, configurable estimation/fees, and early APK feasibility.
2. **Discovery and reading:** guest Home/Explore, functioning search/filter/sort, shared cards, full editorial detail, public sources, funding/trust/audience disclosures, states and secondary information destinations.
3. **Creation:** manual/voice entry with fallback, five steps, story sections/assets/sources, creative previews, reach settings, creator-controlled funding goal at Submit, autosave/resume/back behavior, complete preview and submission timeline.
4. **Lifecycle and creator management:** restricted review demonstration, feedback/resubmission, approval/funding/distribution guards, dashboard filters, controlled material edits, lifecycle history and exceptional outcomes.
5. **Contributions and tracking:** guest support where permitted, presets/custom amounts, estimation and fee review, simulated outcomes, verified success/receipt/funding updates, privacy, follows/saves/activity and profile history.
6. **Distribution and reports:** deliberate distribution preparation, promotion/completion progression, reports distinguishing raised/allocated/spent/estimated/measured metrics; labelled demo delivery data and full notification event coverage.
7. **Verification and delivery:** Android journey and responsive/a11y checks, error/empty/pending scenarios, persistence and permission tests, APK build/install verification, complete demo video, architecture explanation and submission checks.

Do not remove mandatory features to meet the deadline. Use permitted simulations and prioritize complete, polished core flows; surface any at-risk requirement in progress notes.

## G. Development safety

Never access or modify the Prakash Glass Enterprise ERP, including its code, databases, containers, services, secrets, environment, or configuration. Do not inspect its supplied path or search for it. Do not reuse ERP resources. Do not access unrelated projects or clean outside `E:\Campaign`. All project implementation, testing, configuration, and output stay isolated here. See `AGENTS.md` for the full boundary.

## H. Build and testing: original unconfigured plan

All execution commands are **PENDING / UNCONFIGURED**. No application dependencies, scripts, build profile, service or database have been configured for this project. Host build tools, credentials and test-device availability have not been evaluated; do not infer working commands or device readiness from this guide.

| Workflow | Intended procedure | Evidence to retain later |
| --- | --- | --- |
| Run Expo | After authorized scaffolding, inspect the actual manifest and Expo configuration; install selected project dependencies and document the verified start command | Exact command, environment/version, successful launch and known limits |
| Test Android | Select an available Android emulator/device; run the real app and test common screen sizes, navigation, keyboard, touch targets, offline/error feedback and persisted drafts | Device/OS, app version, tested journeys, screenshots/defects |
| Test backend | Configure project-isolated persistence and environment; run actual API tests for validation, ownership/reviewer permissions, lifecycle guards and payment reconciliation | Commands/results; no private data or secrets in logs |
| Build APK | Select EAS or local Android approach; configure an installable APK profile/signing as appropriate. Verify output is an APK rather than assuming a default store artifact is sufficient | Build configuration, command/job, output path, checksum/version |
| Verify final APK | Install the generated APK on Android, launch it, and repeat the complete core journey against the intended demo backend/data | Install/launch result, end-to-end results, residual limitations |
| Prepare demo | Show guest discovery/story/sources, creation/draft/resume/preview/submission, review outcome, backing/payment outcomes, progress/dashboard/activity and final report | Playable video of actual behavior and working delivery files/links |
| Submit | Check APK/video availability and Telegram destination with the user; no external submission is authorized by this initialization | Final artifact checklist and actual submission status when separately authorized |

Add exact commands only after their prerequisites and behavior exist and have been checked. Do not claim a build or demo works without inspecting the produced artifact.

## I. Returning in a future session

Treat these files as persistent context, not the conversation history. Follow the startup protocol, inspect actual code and evidence, and continue the existing architecture. Preserve the requirement IDs and decision history. If older context disagrees with the implementation, establish what actually works and update the documentation while preserving the PDF requirements. The application, current black pass2 internal APKs and historical artifacts exist; do not scaffold another project or restart cosmetic work. The stable source has scoped native acceptance; the updated demo is incomplete and now held at the user's request pending further changes. No recording or demo campaign mutation may resume until the human user explicitly authorizes it. Section J and the active evidence describe current state. External release work remains deferred until the user resumes it.

## J. Current local development startup

The user authorized implementation after initialization. The latest October 16 reference-driven directive authorizes a compact mint-and-charcoal native redesign, complete System/Light/Dark appearance, local INTERNAL-TEST APKs with embedded JavaScript and updated actual demo production. It supersedes the rejected civic-publication visual result while preserving existing architecture and business workflows. Expo/EAS accounts and external hosting remain deferred. Continue routine local work autonomously; document actual blockers and keep progressing independently. The earlier initialization-only stop instruction is historical.

Current stack: Expo 55 / React Native 0.83 / React 19.2 / TypeScript / Expo Router / TanStack Query; one FastAPI API with local SQLite, migrations and validated asset storage. Native sessions use SecureStore, local drafts use scoped AsyncStorage, and the browser preview uses browser storage. Cloud services are not configured. Compact Manrope typography, image-led campaign discovery, mint surfaces and charcoal actions replace the previous ultramarine/serif direction. `lib/appearance.ts` owns the separate `campaign:appearance:v1` device preference and semantic palettes; `lib/theme.tsx` provides shared live theme context without remounting session, queries or navigation; `lib/theme-styles.ts` derives styles. Guests and signed-in users can choose System (default), Light or Dark in Profile Settings. AsyncStorage persistence survives sign-out; invalid/missing values fall back to System. Expo system UI, navigation bar and splash configuration support native appearance. Source checks are distinct from installed acceptance: [PROGRESS.md](PROGRESS.md) and [RELEASE_READINESS.md](RELEASE_READINESS.md) are authoritative for current results.

The later user correction leaves Light unchanged and requires pure black/neutral-charcoal Dark surfaces, replacing the first pass's rejected green tint. Current source uses background `#000000`, surface `#121212`, raised `#1C1C1C`, header `#151515` and contextual container `#1E1E1E`, retaining small mint accents/actions. The focused pass2 source is now frozen. Its four targeted native corrections and 12-surface independent visual review pass in their recorded scopes; [DESIGN.md](DESIGN.md) and its sidecar have been re-extracted and validated against current source. Earlier green-Dark captures remain rejected visual evidence.

Start/reuse the local prototype from E:\Campaign with `start-local.cmd`, then open http://localhost:8081. API health is http://127.0.0.1:8787/health; API docs are at /docs. For foreground commands and dependency setup use [README.md](README.md) and [services/api/README.md](services/api/README.md). `scripts/mobile.ps1` selects compatible Node; the system Node 20.9 is too old, while bundled Node 24.21.0 is available. If sandbox identity prevents automatic discovery, set the process-only `CAMPAIGN_NODE` to the compatible executable before invoking a wrapper. Use the documented per-process PowerShell invocation where the machine blocks direct .ps1 execution; no global script policy needs to change.

Verification commands exist for API behavioral tests, frontend business/theme tests, TypeScript, lint, Expo diagnostics and web/Android JS exports. Final-source frontend tests pass 50/50 in 499.9563ms; TypeScript, lint and web/Android exports pass. Backend 30/30 remains valid for unchanged API source; online Expo dependency compatibility and Doctor 20/20 pass. Both black pass2 INTERNAL-TEST APKs are built under `artifacts/android/black-theme-pass2-20261016/`. Independent [binary inspection](artifacts/reference-redesign/BUILD_INSPECTION.json) verifies the 50 frozen app inputs, byte-identical Hermes, fonts/licenses, correct ABIs/API and Android Debug signatures. ARM64 remains uninstalled. [Native evidence](artifacts/reference-redesign/after-pass2/NATIVE_RESULTS.md) records corrected Home funding visibility in both schemes, 360dp/font 1.3 funding/checkout docks and real Gboard avoidance, exact x86_64 Metro-off/API-backed cold launch with Black and ordinary identity restored, theme/draft continuity, selected 411dp/font 1.6 screens and actual Android System appearance changes. The client-address failure check used unused port 8788; it was not a physical outage. Metro was restored after cold-launch proof. The new demo remains incomplete and user-held; recording, production and demo campaign mutations require explicit human authorization to resume. Old video is historical.

Native SDK/JDK17/Gradle tooling remains project-isolated. Use `scripts/android-local.ps1 -Mode InternalTest -ArtifactTag <new-tag>` with an unused tag to preserve earlier artifacts; its process-only JVM temporary paths resolve the Windows selector issue. Follow [docs/ANDROID_LOCAL.md](docs/ANDROID_LOCAL.md); the emulator helper's default Install still targets the preserved Metro-dependent debug APK, so select the exact internal artifact for acceptance. During parallel native work, only the designated QA owner operates Campaign_API_36 on ADB5039/emulator-5560. No EAS/hosting/production-signing, physical-device, screen-reader or human-listening success is implied.

Current directories: `apps/mobile/src`, `apps/mobile/tests`, generated `apps/mobile/android`, `services/api` (source/tests/migrations/local data/assets), `scripts`, `docs`, project-local `tools/android-sdk`, and intermediates in `tmp`. Dependency locks and native generation should be preserved. Start a future session by checking actual files and current evidence, not re-scaffolding the application.
