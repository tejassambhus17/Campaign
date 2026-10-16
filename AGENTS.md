# Campaign Amplification Hackathon: agent instructions

## Project boundary

- The authoritative project root is `E:\Campaign`, explicitly confirmed by the user on October 15, 2026. The macOS project path in the initialization request is superseded; do not create or use it.
- Before every task, verify the working directory and its resolved absolute path. Keep project implementation, tests, configuration, documentation, and generated project artifacts inside this root. Stop and request workspace correction if the active root differs, unless the user explicitly authorizes a new location.
- This project is independent of the Prakash Glass Enterprise ERP. Never access, read, reuse, or modify ERP source code, databases, containers, services, credentials, resources, environment variables, or configuration. Never start, stop, or alter ERP containers.
- The supplied ERP location, `/Users/tejas/Downloads/facade-erp`, is an exclusion reference, not a directory to inspect. Do not discover alternate ERP locations.
- Never access another project without explicit user authorization. Never clean up or execute destructive commands outside the project. Verify resolved paths before project cleanup; do not follow links outside the root.
- Reading the user-supplied attachment and requirements references is authorized for context; that does not authorize access to unrelated projects or reuse of their resources.

## Startup protocol for every development task

1. Read this `AGENTS.md`.
2. Read `INIT.md`.
3. Read `PROJECT_CONTEXT.md`.
4. Read the relevant original requirements in `Hackathon_Requirements.pdf`. Review the entire PDF before regenerating the requirements baseline. It has 25 pages; page references in project context use the printed PDF page numbers, 1-25.
5. Inspect the existing implementation, configuration, tests, and available progress documentation, including `PROGRESS.md` when it exists.
6. Understand the current architecture and verify that documented claims match the actual files.
7. Identify the exact requested scope and its acceptance criteria.
8. Preserve existing working functionality and identify affected workflows.
9. Implement only after understanding this context; verify the change and update appropriate documentation.

The actual source filename is `Hackathon_Requirements.pdf`; the user's `HACKATHON_REQUIREMENTS.pdf` refers to the same supplied document. Use the actual case in paths so future case-sensitive environments work. If the source is absent or unreadable, stop requirements-based work and request it; never invent specifications.

## Source precedence

- **Product requirements:** the original PDF is authoritative, including when a user prompt, reference website, or project summary conflicts with it. Preserve every mandatory requirement and the specified workflows. Record ambiguities explicitly rather than silently resolving them into new official requirements.
- **Product understanding:** use <https://campaign-one-pearl.vercel.app/> as a secondary reference. Interpret the product for mobile; do not reproduce desktop screens. If inaccessible, record the limitation and continue with the PDF.
- **Implementation decisions:** follow the confirmed decisions in `PROJECT_CONTEXT.md` unless a new explicit user instruction changes a decision consistently with the PDF. Proposed decisions are not confirmed architecture.
- **Progress evidence:** inspect actual code and test results. Outdated documentation does not outweigh implementation evidence; correct the documentation and investigate differences from required behavior.
- **Deadline:** keep Monday, October 19, 2026 as the submission target. The user's October 16 organizer-video summary reports a maximum of Tuesday, October 20 at 11:59 AM; its timezone and current Telegram confirmation remain unverified. The PDF supplies no separate cutoff. Do not treat the reported maximum as independently confirmed or move the target later without evidence.

## Permanent development rules

- Use React Native with Expo; prefer TypeScript. Maintain a clear backend architecture, server validation, role permissions, and data integrity.
- Preserve the five bottom tabs: Home, Explore, Create, Activity, Profile.
- Preserve the exact creation order: Basics -> Story -> Campaign & Ad Visuals -> Reach -> Submit. Keep the five-step indicator visible, preserve backward navigation state, autosave drafts, and support resumption. Do not insert unnecessary setup screens between steps.
- Allow guest campaign browsing. Contributions pay for message distribution, not direct donations to the cause. Explain fees, allocation, refund policies, unspent funds, and estimated reach transparently.
- The creator sets the funding goal at Submit; AI must not generate it automatically or silently overwrite it.
- Keep story sources public and editorial structure intact. Keep story assets separate from advertising creative.
- Respect expressly allowed dummy data, simulated checkout, and labelled voice/AI demo or manual fallbacks. Never present simulations or estimates as verified real-world results.
- Separate approval, funding completion, distribution preparation, advertising delivery, and completion. Never publish or distribute before required approvals; reaching a funding goal does not launch ads automatically.
- Demonstrate review logic with a minimal role-restricted review view or admin screen. The PDF calls the broader admin system conceptual while also requiring this minimum (pp. 19-20); do not silently omit the minimum or expand the full admin system into mandatory scope.
- Keep public backer names private by default. Protect payment records, secrets, and private user data. Never hardcode secrets.
- Prioritize premium, calm, readable mobile UI/UX, accessibility, meaningful feedback, and consistent state across connected workflows.
- Distinguish mandatory, conditional, optional, conceptual, and recommended scope. Do not silently omit requirements to fit the schedule. Identify risks explicitly.
- Use maintainable code and sensible names. Reuse existing components, design tokens, utilities, models, APIs, and services where appropriate. Avoid duplicate implementations, unnecessary dependencies, and overengineering.
- Do not repeatedly redesign the application, introduce conflicting architectures, or replace existing implementations without a justified technical reason. Record the reason and impact for significant changes.
- Avoid dead buttons and disconnected screens. Every visible action must perform its stated behavior or clearly explain its unavailable state.
- Never claim untested features work, fabricate test results, or invent completed functionality.

## Current authorized development scope

On October17 the user resumed account connection and requested step-by-step
guidance for Render, Neon and Cloudinary with no credit card. This supersedes
the account-connection deferral below. Guide one provider at a time; the human
completes login, verification and provider terms directly. Provision only
confirmed Free resources, keep secrets out of chat/Git/APK and grant access only
to the existing Campaign repository. A card/billing requirement blocks that
provider; do not bypass it. Recording and organizer submission remain held.

The October16 zero-cost cloud directive authorizes minimal deployment engineering
for the existing Expo/FastAPI product. The user then chose “Prepare everything;
I'll connect accounts later.” Finish independent implementation/testing/runbooks;
do not provision accounts/resources while connection is deferred. Budget is ₹0:
no card, paid trial, billing, automatic upgrade or chargeable CI. Account-confirm
Free eligibility before provisioning. `docs/CLOUD_DEPLOYMENT.md` records evidence
and remaining gates. Checkpoint: `refs/checkpoints/cloud-deployment-20261016`.
Preserve private local SQLite/data and fallback APK; never migrate private
records automatically. Cloud APKs require verified public HTTPS, disabled local
overrides and separate sessions/drafts. Local tests do not prove cloud persistence
or disconnected phone access. Recording/submission remain held. This supersedes
the older blanket cloud-deferral statements below only for preparation.

The final premium UI/UX correction brief approves the existing visual identity and authorizes evidence-based refinements across current screens, shared controls and native performance. Preserve the palette, architecture and workflows; do not redesign again. Capture current and corrected Android states, verify scrolling before claiming footer clipping, and compare performance under repeatable conditions. The recoverable local Git checkpoint is `refs/checkpoints/premium-quality-20261016`; the normal index and existing work were preserved. This task permits local QA/builds, not hosting, deployment or recording. Keep prior candidate evidence historical and distinguish source checks from installed visual/functional acceptance.

The later premium-notifications directive gives the Home bell and Activity tab distinct roles: bell opens a native quick sheet with the latest five authorized notifications; Activity remains the complete existing history. Both must use the same recipient-scoped query, read actions, badges and safe destinations. Preserve category preferences, guest privacy and session cleanup; do not create a second notification backend/store or alter business rules. Close/back/swipe/overlay dismissal, reduced motion, safe areas and larger text require native verification. Recording and external release holds remain in force.

The subsequent Create reference (`artifacts/create-polish/reference.png`) now governs the creation editor's composition, compact controls, icon progress, media layout and confirmation treatment. Preserve five steps, the 60-character title limit, funding goal at Submit, and submission for review: the image's six-step caption, 80-character limit, goal at Reach and immediate-live wording do not override the PDF. Match its visual proportions while retaining black/neutral Dark, native Android chrome and all required fields. The user also explicitly requests a working persistent profile-photo option; implement add/change/remove with account isolation and validate it on the authorized phone. Screenshot QA remains authorized; recording stays held.

The latest approved visual source is `Campaign App UI Showcase.png` (preserved under `artifacts/showcase-redesign/reference.png`). Match its screen compositions, image treatments, compact typography, spacing, navigation and light/black-Dark appearance closely; login and Profile must be complete. Verify fidelity using actual screenshots from the explicitly authorized physical Android device, and fix visible discrepancies before declaring completion. This supersedes earlier composition choices, while pure-black Dark surfaces, mandatory PDF requirements, existing functional workflows and the recording hold remain in force. Illustration data is not authoritative financial, identity or verification data.

The latest October 16 reference-driven directive rejects the preceding civic-publication result and replaces its ultramarine/large-serif direction with a compact mint-and-charcoal consumer mobile composition. Use the supplied reference for hierarchy, proportions and image-led discovery, while retaining Campaign's amplification meaning and every mandatory PDF workflow. Do not copy donation/banking claims, people or photographs from the reference. Routine design choices, local dependency/tooling work, tests, Android QA, embedded-JavaScript INTERNAL-TEST APK preparation and complete demo production are authorized; do not ask for routine design approval. Preserve the existing Expo/FastAPI architecture and working business rules.

Appearance is a device-level Dark (new-user default), System or Light preference, available to guests and signed-in users through Profile/Help settings. The latest explicit instruction removes the appearance picker from Welcome and authentication; preserve valid saved Light/System/Dark choices rather than resetting them on entry. Maintain the shared semantic theme mechanism above the existing session/query/navigation providers; never reset navigation, drafts, forms, filters, checkout or identity to change appearance. Persist it separately from account data, follow live OS changes in System mode, and retain it through sign-out. Use compact Manrope typography, readable contrast and consistent app-owned surfaces. `DESIGN.md` and `.impeccable/design.json` document the current implemented contract; if either still describes the superseded civic direction, reconcile it with current code and evidence. Use `PROGRESS.md` and `RELEASE_READINESS.md` for current acceptance. Old APKs, screenshots and videos retain their historical scope and do not verify the replacement design.

The user's later October 16 correction rejects green-tinted Dark surfaces. Preserve the existing Light design; Dark must use pure black/neutral-charcoal backgrounds and containers, with mint limited to restrained accents/actions. The corrected target is background `#000000`, surface `#121212`, raised `#1C1C1C`, header `#151515` and neutral contextual container `#1E1E1E`. Earlier green-Dark captures are rejected visual evidence. Their separately demonstrated appearance persistence or state behavior remains valid only for the exact tested build and must not be described as black-Dark acceptance.

The black pass2 checkpoint and its independent 12-surface `ship` review are historical, bounded evidence. The later Product Quality and Hackathon Alignment Addendum explicitly reopens source for targeted creation guidance, truthful persistence, coherent previews, sources/finance/report clarity, actionable Activity and native interaction fixes. Preserve the established Light and pure-black Dark design, existing architecture and business rules; do not interpret the earlier automated verdict as current appearance approval. Keep source checks, binary inspection, installed behavior, human acceptance and video acceptance separate.

The user has now stopped demo recording because further changes are forthcoming. The replacement demo is incomplete and held at the user's request. Do not start or resume recording/production, or make new campaign mutations for a demo, until the human user explicitly authorizes resumption. Preserve existing partial captures and historical artifacts.

The subsequent quality addendum authorizes ordinary functional QA and screenshots, including review/correction/resubmission and simulated backing through the installed UI using project-owned fictional QA records. This does not resume filming or media production, authorize deleting user campaigns, or permit API/DB injection of campaign/payment lifecycle state for visual evidence.

Cloud accounts, paid resources and external hosting remain deferred. An INTERNAL-TEST artifact signed with the Android Debug certificate is not a production release. Verify its installed Metro-independent launch and separate backend reachability before claiming either. This authorization does not include Telegram messages or submission.

The later October 16 source-backup task established root Git on `main`, tracking `origin/main` in the existing private `tejassambhus17/Campaign` repository. The original mobile scaffold remains in its ancestry; old nested Git metadata is preserved under ignored `tmp/github-backup/mobile-original.git`. Use root Git for future commits. Keep organizer PDF/video, credentials, local databases/uploads, toolchains and generated artifacts excluded as documented in `docs/GITHUB_BACKUP.md`. No application behavior, global Git setting, hosting or deployment was changed by the backup; preserve history and never force-push.

## Documentation and completion

- `AGENTS.md` holds durable behavioral instructions; `INIT.md` holds startup and environment guidance; `PROJECT_CONTEXT.md` holds product knowledge, requirements, architecture, and the decision log.
- Update `PROJECT_CONTEXT.md` when architecture, technologies, important implementation decisions, core workflows, material limitations, or project structure change. Update `INIT.md` when actual setup, commands, or structure become available.
- Keep documentation accurate and concise. Preserve important historical decisions and record why they changed; do not erase them when a new session begins.
- Create `PROGRESS.md` during implementation for changing task status, milestones, bugs, evidence, and immediate next steps. Do not turn project context into a daily log.
- Requirements tracking uses `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED`, `VERIFIED`, or `BLOCKED`. `IMPLEMENTED` requires code; `VERIFIED` requires actual evidence. State what was checked and its limits.
- A feature is complete only after its required behavior has been implemented and verified. No application feature exists merely because its requirements or design are documented.

## Initialization boundary

The October 15, 2026 initialization task authorizes only creation of `AGENTS.md`, `INIT.md`, and `PROJECT_CONTEXT.md`. Do not initialize an app, install dependencies, create services or databases, start Docker, generate application code, or modify unrelated files for that task. Stop after verifying these documents and wait for the user's next development instruction. A later explicit development task may authorize implementation within the boundaries above.
