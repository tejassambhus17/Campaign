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

The October 16 attached autonomous redesign directive supersedes the earlier visual direction and authorizes a complete native UI redesign, local dependency/tooling work, tests, Android QA, embedded-JavaScript INTERNAL-TEST APK preparation and complete demo production. Routine design choices are delegated; do not ask for their approval. Preserve the existing Expo/FastAPI architecture and working business rules. `DESIGN.md` records the implemented civic-publication system and `.impeccable/design.json` its documentation sidecar. Use the current evidence in `PROGRESS.md`, not older green-theme screenshots, to resume.

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
