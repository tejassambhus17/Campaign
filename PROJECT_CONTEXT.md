# Campaign Amplification Hackathon: project context

**D28 / October17 — connect existing Neon:** user selected
`org-patient-sound-11803564` / `dawn-lab-92471358` / `production`, PostgreSQL only.
Keep Expo/FastAPI and`psycopg`; root tooling maps ignored pulled URLs to pooled
app traffic and direct migrations. Transaction-local timeout settings replace
startup options rejected by real Neon. Root build delegates to existing tooling;
explicit Neon startup uses port8879 and preserves local-default SQLite startup.
Existing receipt/reviewer secrets must persist into future Render configuration.
[NEON_SETUP.md](docs/NEON_SETUP.md) separates live database proof from still-local
API/media and pending independent Android delivery. No paid resource/card added.

**Latest decision D27 — zero-cost cloud preparation:** the October16 directive
authorizes minimal PostgreSQL, persistent media, security/configuration,
cold-start and HTTPS Android support while preserving UI/business rules. The
user then chose “Prepare everything; I'll connect accounts later.” Actual cloud
provisioning, HTTPS/persistence and disconnected-phone acceptance remain BLOCKED.
No account/charge/private-data migration exists. The
[runbook](docs/CLOUD_DEPLOYMENT.md) supersedes older blanket hosting holds only
within preparation. Recording, paid resources and organizer submission stay held.

**Current premium pass12 — VERIFIED within the recorded local scope:** [Fresh source gates](artifacts/premium-quality/pass12/SOURCE_CHECKS.json) pass **91/91 in 1044.901ms**, TypeScript/full-source ESLint/diff/public Expo config. [Strict inspection](artifacts/premium-quality/pass12/BUILD_INSPECTION.json) binds **86 inputs / 45 compiled modules / six artworks / 15 native branding resources** to the **48,623,759-byte APK**, SHA `DF4C95CB9F6555DE6E5637DCF18989B7E41042E0D978F7F908EFA0697FDAEDF9`. The installed package hash matches. [Actual Metro-off launch](artifacts/premium-quality/pass12/METRO_OFF.json) is **COLD 1,418ms / wait 1,431ms**, with preserved data and a separately healthy USB-local API. [Independent finish review](artifacts/premium-quality/FINISH_REVIEW.md) closes the opened Home/Auth/keyboard findings. Earlier matrices retain [their exact scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json); no whole-app final-hash rerun or human/production acceptance is inferred. Recording/external release stay held.

[Frozen source](artifacts/premium-quality/pass12/SOURCE_INPUTS.json) digest: `6e92c273b2ca5ddea4a99119d7a8357b8cfab54d54bf365c9f31b5697cf47726`. [Final source verification](artifacts/premium-quality/pass12/SOURCE_VERIFICATION.json) and strict inspection bind the same 86 mobile/13 backend inputs; original 25-page PDF SHA remains `6A5443253C33997A7361BA91BFF4C04DAF02743ADF23CB47F7E4F1C3789E3290`.

**Historical quick notifications and complete Activity — VERIFIED within recorded local scope:** Home's bell and Activity now have distinct quick-sheet/full-history roles over shared authorized data/read state. Final pass5 source, strict binary, compatible physical install and Metro-off/API launch pass; actual compact failure/retry, guest/account recovery, Light/Dark content sizing, contextual destination and dismissal checks close its local matrix. The [bounded native finish review](artifacts/notification-center/FINISH_REVIEW.md) has no open actionable P0/P1/P2. D24/section 23 retains earlier candidate scopes and limits; no whole-app/human/TalkBack/sustained-performance or production release claim follows. Recording/external release remain held.

**Historical Create + private profile photo — VERIFIED within recorded local scope:** Final pass6 source, binary and physical Metro-off/API checks pass. The pass3/pass5 editor/photo matrix and pass6 submission-route correction close the bounded native verification and reference review. No open P0/P1/P2 remains in that review; retained P3 style/keyboard-space notes, human/accessibility, sustained performance and external release gates remain separate. Prior Showcase evidence retains its historical scope.

Initialization baseline: October 15, 2026. Primary agent: OpenAI Codex. Root: `E:\Campaign`. Current scope preserves Expo/FastAPI, mandatory PDF workflows and black/neutral Dark while applying the targeted premium-correction directive and exact supplied branding under D25. Sections 18–24 describe architecture/design decisions; [PROGRESS.md](PROGRESS.md), [REQUIREMENTS.md](REQUIREMENTS.md) and [RELEASE_READINESS.md](RELEASE_READINESS.md) hold current evidence. Recording/production, accounts/hosting and external submission remain held. Historical APKs and checks retain their exact scopes.

Read [AGENTS.md](AGENTS.md) and [INIT.md](INIT.md) before development. Product requirements below come from [Hackathon_Requirements.pdf](Hackathon_Requirements.pdf), unless explicitly labelled otherwise. All PDF page references use the document's printed pages, 1-25. Proposed designs describe future work, not existing functionality.

**Historical Create physical evidence boundary:** The authorized POCO had Create pass6 `383F23C2…69184` installed without data reset; exact Metro-off cold launch is 1,483ms with healthy USB-local API. Pass3/pass5 record complete checked creation/photo controls and $13.25 draft submission; pass6 fixes View Campaign and opens a separate $2.50 submitted fixture correctly, with backing closed. Pass6 also checks Explore, contribution quote, Activity destination and persistent photo. Full prior matrices were not rerun wholesale under pass6. The [reference review](artifacts/create-polish/FINISH_REVIEW.md) is bounded; no human approval, fresh-install, other-device or sustained-performance claim follows.

**Source-backup checkpoint:** source-only GitHub backup to the user's existing private [tejassambhus17/Campaign](https://github.com/tejassambhus17/Campaign) repository. Root `main` tracks `origin/main`; the 102-file source upload and preserved mobile scaffold ancestor were verified against GitHub. This is independent of deferred hosting/release work. No application changes, new repository, history replacement, force-push or automated deployment occurred in that backup task. [Backup boundaries](docs/GITHUB_BACKUP.md) and [PROGRESS.md](PROGRESS.md) record exact source commit and verification. Organizer material, credentials, local data and generated artifacts remain local.

## 1. Project overview

**Objective (PDF pp. 1-3):** deliver a polished, functional React Native with Expo mobile prototype that helps people create, review, fund, and amplify campaign messages beyond their existing networks. It must behave as one connected product, with clear UI/UX, coherent backend logic, and smooth execution; a landing page or disconnected mock screens are insufficient. Production-scale advertising infrastructure is not the goal.

**Product concept:** individuals, creators, influencers, nonprofits, organizations, businesses, and community groups create messages. The platform reviews eligible campaigns and prepares distribution. Backers pool contributions toward advertising/distribution costs. Approved funds are managed for message amplification rather than simply transferred to creators. Contributions are **not direct donations** to the cause, person, or organization described in a campaign (pp. 1-2, 5-6).

**Audience and journeys:** guests discover campaigns, read stories and sources, understand audiences, and share/offer feedback. Creators draft manually or with voice/AI assistance, save/resume, preview, submit, address review feedback, monitor funding, and inspect distribution reports. Backers understand fees and allocation, choose contributions, complete a dummy/simulated payment, receive receipts after verified success, and follow progress/results. Review logic links these journeys without automatic publication or ad launch.

**Evaluation expectations (pp. 20-23):** premium mobile usability, clear product thinking, maintainable code, end-to-end behavior, complete state handling, server validation, privacy and role permissions, scope discipline, and accurate demonstration. AI development tools are allowed, but generated work must be reviewed and owned by the team. Collaboration, consistency, respectful communication, and follow-through are also noted.

**User deadline:** Monday evening, October 19, 2026; planning timezone Asia/Calcutta. No exact hour or separate organizer deadline is given. **Delivery:** Android APK and complete demo video; iOS TestFlight if requested in the final stage / if possible. Code submission is not required, but the team should explain its architecture and demonstrate the implementation (pp. 23-24). See section 16.

## 2. Requirement sources and boundaries

### 2.1 Confirmed source evidence

- **Primary:** `E:\Campaign\Hackathon_Requirements.pdf`, 25 pages, 7,834,427 bytes. SHA-256: `6A5443253C33997A7361BA91BFF4C04DAF02743ADF23CB47F7E4F1C3789E3290`.
- The user's `HACKATHON_REQUIREMENTS.pdf` refers to this actual mixed-case filename. Preserve the actual filename for portable links; no source file was renamed.
- All 25 pages were reread from the original during initialization on October 15, 2026. The preceding review also inspected rendered pages/contact sheets. The last pages contain delivery, opportunities, and closing notes; they were included in the review.
- **Secondary reference:** <https://campaign-one-pearl.vercel.app/> (PDF p. 3). The web text reader could not access it; Chrome successfully displayed its public homepage during the preceding review. Inspected content included the product explanation, sample campaign feed, guest/backer positioning, and Create -> Review -> Amplify explanation. The complete website creation/payment workflows were not audited.
- The website illustrates about 27 people per dollar and mentions a trust score. Neither is an official prototype requirement: the PDF requires configurable, labelled reach estimates and prohibits invented trust scores or unsupported verification claims (pp. 6, 14). Do not carry these website claims into implementation as authoritative facts.

### 2.2 Source categories and precedence

| Category | Established meaning |
| --- | --- |
| Confirmed PDF requirements | Product behavior and submission scope below, with page references. PDF overrides website interpretations and conflicting prompt details about product requirements. |
| User decisions | Initialization completed, then development was authorized. The latest October16 reference directive replaces the rejected civic visual direction with compact mint-and-charcoal mobile composition and device-level System/Light/Dark appearance, retaining architecture/workflows. Local embedded-JS INTERNAL-TEST builds and updated actual demo production are authorized, with routine choices delegated. Expo/EAS accounts and hosting remain deferred; free-only preference retained. Monday October19 target, strict ERP separation and `E:\Campaign` remain confirmed. |
| Technical recommendations | TypeScript preference, candidate frameworks/providers, proposed schema, implementation guards and verification strategies. These are labelled recommendations/proposals until selected and implemented. |
| Unresolved questions | Exact fees/policies/estimation parameters, backend/provider choices, media capabilities, build setup, and internal PDF review-scope ambiguity. See below and sections 10/14/15. |

Inspect code and actual test evidence for implementation progress. Do not let stale documentation override either observed implementation facts or the original product requirements.

### 2.3 PDF page map

| Pages | Topics |
| --- | --- |
| 1-2 | Product concept, core challenge, required connected mobile prototype |
| 3-4 | Five tabs, creation order, guest browsing, secondary destinations |
| 5-6 | Roles, privacy, platform responsibility; Home begins |
| 6-8 | Home/cards/how it works, discovery and result states; creation entry |
| 8-12 | Manual/voice creation, every five-step requirement, draft and submission behavior |
| 12-15 | Campaign editorial detail, progress, funds, audience, trust and optional feedback |
| 15-16 | Six-stage backing journey, dummy payment, receipts, tracking and reports |
| 16-18 | Creator dashboard, management, controlled edits and analytics |
| 18-19 | Activity/notifications; conceptual admin section and minimum review demonstration |
| 19-20 | Reviewer concept, approval gates, lifecycle and exceptional states |
| 20-21 | Mobile UX and visual quality |
| 22-23 | Technology expectations, security, evaluation, deliverables, no code submission |
| 24-25 | Delivery channel, opportunities and closing information |

### 2.4 Ambiguities and unspecified policy

- **Admin scope (pp. 19-20):** the heading and opening paragraph explicitly say admin/review implementation is not part of the assignment, but the same section says to demonstrate review logic through an admin screen or role-restricted view. The initialization request also explicitly requires demonstrating review logic. Working interpretation: build a minimal restricted demonstration and enforce review-dependent states; retain the wider reviewer capability list as conceptual rather than a mandatory full internal system. Record this conflict for possible organizer clarification; do not claim the PDF is unambiguous.
- **Policy/model gaps:** no numeric platform/transaction fees, contribution limits, allocation percentages, refund conditions, treatment formula for unspent funds, reach formula, media size limits, verification method, currency policy, or exact campaign duration limits are specified. These need explicit, visible demo policies/configuration later, never invented as organizer rules.
- **Conditional features:** preserve wording such as "where supported," "where applicable," and "where permitted." Document the actual support boundary and fallback rather than implying unsupported capabilities are implemented.
- **Deadline:** the date is a user instruction, not a PDF deadline; an exact cutoff remains unspecified.

## 3. Application structure

**Required (pp. 3-4):** a stable bottom navigation bar with exactly these five primary destinations. Keep primary navigation consistent throughout the app, with contextual actions and clear back navigation instead of deep menus.

| Tab | Responsibilities |
| --- | --- |
| Home | Product introduction, featured campaigns, campaign feed, concise explanation of how the platform works |
| Explore | Search, categories, sorting/filters, and campaign discovery |
| Create | Start a new campaign or resume a saved draft; manual and voice entry lead into the prescribed five steps |
| Activity | Notifications, funding milestones, campaign updates, followed campaigns, and relevant campaign progress |
| Profile | Account details, created/backed/saved campaigns, payment history, settings and help |

Secondary destinations, where appropriate: Partners, About, How It Works, FAQs, Help, Contact, Terms, Privacy, Community Guidelines (p. 4). Do not add a sixth primary reviewer tab. A separate internal responsive interface is permitted but not required for the minimum review demonstration (p. 19). Navigation library and route structure remain undecided.

## 4. User roles

| Role | Required capabilities / boundaries | Source |
| --- | --- | --- |
| Audience | Discover, read stories, inspect sources, understand target audience, share and provide feedback; guest browsing must work without account creation | pp. 3, 5 |
| Campaign Creator | Manual creation, AI-assisted drafting, voice-based description, editable drafts, review submission, funding monitoring and distribution reports; may be an individual, influencer, nonprofit, organization, business or group | p. 5 |
| Backer | Understand message/story, sources, use of funds, estimated reach, fees and progress before paying; contribute toward promotion costs, follow progress and view reports; public name private by default | pp. 5-6, 15-16 |
| Administrator / Reviewer | Conceptually inspect content/sources/creatives/targeting/budget, approve/request changes/reject, prepare/authorize distribution, track delivery, handle complaints/moderation, review completion/reporting and retain decision/change history | pp. 6, 19-20 |

One account can act as audience, creator and backer (p. 6). Reviewer permissions must be restricted and enforced on the backend; a UI role switch alone is not authorization (pp. 22-23). A full admin system is conceptual; the minimal review demonstration and approval gates remain in planned scope under section 2.4. Guest contribution support is required where permitted; unnecessary profile fields must not be requested (p. 16).

**Proposed permission model:** public read access only to publishable campaign content; creators manage their own drafts and revision submissions; backers access their own payment/receipt history; reviewers make authorized review decisions; payment and lifecycle mutations are server-controlled. Exact session/provider implementation is undecided. Never expose another backer's private identity or payment details.

## 5. Core functional flows

Each flow below separates PDF behavior from proposed validation/verification detail. This is the product specification; implementation status is tracked in REQUIREMENTS.md rather than inferred from this text. Shared baseline: readable mobile layouts, consistent cross-screen data, appropriate loading/empty/error/success/pending/validation states, useful feedback, and meaningful next actions (pp. 8, 20-23).

### 5.1 Home (pp. 3, 6-7)

- **Purpose/screens:** introduce the amplification model immediately, then featured campaigns/feed and a plain-language visual How It Works sequence.
- **Fields/content:** headline, short community-funded reach explanation, configurable illustrative estimate per dollar labelled as an estimate rather than guarantee. Each realistic card has cover/creative, category, title, creator/organization, editorial summary, amount raised/goal, progress indicator and estimated reach at goal. Show multiple categories and creator types.
- **Actions:** Explore Campaigns, Start a Campaign, Back This Campaign; explain Create -> Review -> Amplify (creator prepares; platform reviews/prepares distribution; backers fund reach).
- **Validation/data:** shared campaign/progress data and estimate configuration. Proposed checks keep goal/progress/estimate calculations valid and consistent with detail/dashboard; no official numeric assumptions specified.
- **State/feedback/errors:** guest-readable feed; understandable loading, empty and load-error recovery states. Navigation leads to the real next flow, with no account wall for browsing.
- **Acceptance:** a first-time user can explain the product and what money pays for; cards show all required metadata, estimates disclose uncertainty, and both hero actions and backing actions reach functioning flows.

### 5.2 Campaign discovery (pp. 3-4, 7-8)

- **Purpose/screens:** Explore with featured campaigns, search, category browsing, useful filters/sorting and results/cards.
- **Fields/actions:** search query, selected categories/filters and sort order; view campaign and back it. Suggested categories: Environment, Health, Science, Education, Public Policy, Economic Policy, Community, Arts & Culture, Business, Other. This list is suggested, not an immutable official taxonomy.
- **Validation/data:** shared discoverable campaign dataset, metadata and estimate model. Proposed safe query normalization/filter combinations; exact search rules and sort options are not prescribed.
- **State/feedback/errors:** search and filters must actually change results, even with seeded data. Show loading, empty dataset, no matches and errors distinctly, with useful recovery. Provide clear selection feedback.
- **Acceptance:** guest search/filter/category/sort interactions produce appropriate visible results; cards remain readable and consistent with Home/detail; no-results is distinguishable from a failed load.

### 5.3 Campaign creation (pp. 5, 8-12)

- **Purpose/screens:** creation entry (manual/voice), exact five-step editor, full/live preview, submission confirmation and next-step timeline. See section 6 for every field and capability.
- **Actions:** create, edit/correct/delete AI suggestions, add/reorder sections, manage sources/assets, save/resume, navigate back/continue, preview and submit for review.
- **Validation/data:** enforce the PDF's explicit required Basics fields/title maximum, file validation and final rules/policies confirmation; label other requirements clearly. Draft, story, sources, assets, targeting, goal and policy configuration must remain coherent. Server validation is required; other content/media limits are design decisions to document.
- **State/feedback/errors:** persistent five-step indicator, backward-state preservation, autosave/resume, clear editing/preview/submitting states, field errors, saved status and submission confirmation. Proposed handling: retain recoverable edits on save/upload/network errors and prevent duplicate submissions; these support required data integrity rather than add official fields.
- **Acceptance:** a manual or labelled fallback-assisted draft survives backward navigation and later resumption; every step and preview is editable; the creator explicitly sets the goal at Submit; valid confirmed submission enters review, never immediate public funding/distribution.

### 5.4 Campaign details (pp. 12-15)

- **Purpose/screens:** a readable editorial campaign page with accessible progress/backing controls and expandable supporting information.
- **Header fields/actions:** back to Explore, cover, category, title, creator/organization, publication/submission date, share and relevant status. Funding displays amount raised, goal, percentage, remaining time when applicable, estimated reach, Back This Campaign and Share Campaign. Keep funding accessible while scrolling without obscuring the story.
- **Story/content:** render original ordered headings, paragraphs, contextual photographs, captions, statistics and source references; sources remain public. Use comfortable line lengths/spacing rather than a separate gallery for all images.
- **Expandable information:** funds (fees, advertising portion, allocation, refunds and unspent funds); audience/targeting/placements/distribution with privacy/ad disclosures; review process, supporting sources, relevant verification information and distribution partners when applicable. Explain amplification rather than direct charitable support. Label sample figures/demo estimates.
- **Optional/conditional feedback:** where appropriate, ask if visuals encouraged continued reading and if the message changed the reader's mind, with No/Somewhat/Yes choices. Comments/replies are optional only with moderation, reporting and privacy controls (p. 15). Never invent trust scores or independent verification.
- **Validation/data/state:** consistent approved/published campaign version, story/source/asset data, lifecycle/progress, estimation config and funding policies; propose safe source links and unavailable-campaign recovery. Sharing, expansions and optional feedback need meaningful results and appropriate loading/error states.
- **Acceptance:** all mandatory information and visible sources are accessible on a phone; story structure survives publication; funds/estimates are transparent; primary actions work; controls do not cover text or misrepresent campaign eligibility.

### 5.5 Contributions (pp. 15-16)

- **Purpose/screens:** inspect campaign -> choose amount -> review contribution -> dummy/simulated checkout -> verified success/receipt -> track progress/report.
- **Fields/actions:** preset and custom amount, dynamic estimated reach, fee breakdown, total payment, funding progress, terms/refund information; confirm payment, inspect receipt, share/follow campaign. No unnecessary profile data; guest support where permitted.
- **Validation/data:** server-valid amounts and eligible campaign, configured fees/estimate/policies, payment outcome and funding ledger. The PDF supplies no minimum/maximum or fee numbers. Proposed controls: monetary precision, duplicate-payment protection and server reconciliation before incrementing funding.
- **States/feedback/errors:** visibly simulated checkout, accurate pending/rejected/cancelled/failed outcomes, success only after verified transaction result; successful confirmation shows amount/title/receipt/updated funding/share. Preserve truthful outcome and recovery if a response is interrupted.
- **Acceptance:** changing amount updates reach/review consistently; every simulated outcome is demonstrable; unsuccessful/pending outcomes do not masquerade as success; a successful payment updates all relevant campaign views and private history accurately. See section 8.

### 5.6 Creator dashboard (pp. 4, 16-18)

- **Purpose/screens:** Profile's created campaigns overview, status-filtered management, moderation feedback/revision, promotion progress and reports.
- **Fields/actions:** title/thumbnail, status, funding progress, goal, deadline, estimated reach. Filters/tabs: Drafts, Under Review, Published / Funding, Promoting, Completed, Requires Action. Edit draft, preview, view feedback/respond to change requests, share, view milestones/updates, inspect promotion and open final report.
- **Analytics:** amount raised, progress, contributions/backer activity, advertising allocated/spent, estimated/measured reach, impressions/clicks where available, duration and final results. Define metrics; preserve backer privacy.
- **Validation/data/state:** creator ownership, saved drafts and submitted/published revisions, reviews/lifecycle, payments and distribution records. Material published changes return to review before ads update (p. 18); exact revision mechanism is proposed, not prescribed. Filters and actions reflect actual state; empty groups, loading and management errors require feedback.
- **Acceptance:** creators resume the correct draft, see accurate status/progress across filters, address feedback and access reports; a material edit cannot bypass review or silently change approved advertising.

### 5.7 Activity and notifications (pp. 4, 18-19)

- **Purpose/screens:** in-app notification center and relevant followed-campaign progress/updates; preferences where supported.
- **Events:** submission received; approved/rejected/returned for edits; available for backing; funding milestone; approaching deadline; contribution successful/unsuccessful; promotion begins; meaningful distribution progress; completed; final report available; new comments or campaign updates; account security events.
- **Actions/data:** inspect relevant campaign/progress/update/payment outcome; configure categories and delivery preferences where supported. Source data: persisted user-relevant domain events, follows and campaign updates. Comment notifications are conditional on comments existing. Push/email are optional if time/infrastructure allow.
- **Validation/state/feedback/errors:** backend recipient isolation; do not expose private details. Avoid repetitive low-value events. Proposed read/unread handling, deduplication and clear navigation; exact implementation not mandated. Show loading/empty/error and supported preference-save feedback.
- **Acceptance:** each supported required domain event produces a relevant, accurate in-app notification, opening the appropriate destination; preferences accurately describe available channels and do not imply live push/email if absent.

### 5.8 Campaign reporting (pp. 2, 5, 16-19)

- **Purpose/screens:** progress and final distribution reports accessible to creators and backers, linked from dashboard/tracking/activity.
- **Fields/actions:** funds raised, advertising budget allocated/spent, contributions/backer activity, impressions, estimated versus measured reach, clicks and other available metrics, duration and final results; view report and campaign updates. Use metric definitions and distinguish funding from delivery.
- **Validation/data:** report must correspond to the correct campaign/delivery period and state; figures come from coherent distribution/demo records, not random independent numbers. No unsupported measured/verified claim; mark demonstration data clearly. Exact report format and metrics absent from a provider are not specified by the PDF.
- **State/feedback/errors:** distinguish not-yet-available report, unavailable metrics, loading, failed load and actual final report; notify on availability. Proposed versioned snapshots preserve consistency and provenance.
- **Acceptance:** a backer/creator can find progress and a final report; raised, allocated, spent, impressions, reach and clicks have distinct meanings; estimates and simulated results cannot be mistaken for verified live ad delivery.

## 6. Complete campaign creation specification

**Mandatory order:** Basics -> Story -> Campaign & Ad Visuals -> Reach -> Submit (pp. 3, 8-12). These five steps must remain identifiable with a persistent five-step progress indicator. No unnecessary setup screens may be inserted between them.

### 6.1 Entry and assistance (pp. 5, 8-9)

- Offer **Create Manually**: guided step-by-step form, instructions, full preview before submission.
- Offer **Create with Your Voice**: creator describes the idea aloud and answers guided questions; speech-to-text/AI can populate fields. Always land on an editable draft before submission.
- Let the creator edit, correct or delete every AI suggestion. AI/voice service unavailability requires a clearly labelled demo mode or manual fallback. Do not present typed/demo transcription as live speech processing.
- On request, AI may suggest a title, summary, category, creator description and relevant draft fields. It must never automatically set the funding goal.
- Provider choice, audio handling/retention and image-generation support remain undecided; explain actual support and protect privacy.

### 6.2 Step 1: Basics (p. 9)

Let the creator explain what the campaign is about, who it should reach, why it matters and what evidence supports it. The PDF lists these prompts but does not prescribe separate mandatory inputs for all four.

| Field / control | Requirement |
| --- | --- |
| Campaign title | Required; maximum 60 characters; visible character counter |
| Category | Required selection |
| Creator or organization name | Required |
| Short summary | Include an input; the PDF does not explicitly mark it required |
| Cover image | Optional here; support selection/preview and preserve it for later visual handling |
| Save as Draft | Explicit action alongside automatic saving |
| Continue | Proceed after clear validation |

Explain that the beginning of the title may be used as an ad headline if the creator does not supply a custom one. Do not silently invent additional required fields. Proposed validation: trimmed nonempty required text, legitimate category and server-side length enforcement; exact whitespace/Unicode counting behavior should be selected consistently later.

### 6.3 Step 2: Story (pp. 9-10)

Build an editorial composer that feels like writing a clear article. Include all of:

- Headline and introductory text; story sections.
- Rich-text editing **or** a simplified formatting toolbar.
- Add and rearrange content sections.
- Image upload and preview, captions and image credits.
- Statistics and supporting evidence.
- Source management with source title and URL.
- Suggested audience actions.
- Live campaign preview and draft saving.

Preserve this structure when publishing; keep sources visible to audiences, not only creators. Proposed model: ordered typed blocks referencing assets and sources, so preview and published rendering share structure. Required field minima, formatting subset, source URL rules and evidence quantity are unspecified; choose explicit validation without inventing official organizer thresholds.

### 6.4 Step 3: Campaign & Ad Visuals (pp. 10-11)

Keep the editorial story separate from assets used to advertise it. Include:

- Campaign cover image and advertising images.
- Video creatives **where supported**.
- Ad headline, ad description and call-to-action text.
- Previews for supported advertising placements.
- Uploading existing assets and supported image-generation tools.
- Basic file validation and warnings for missing assets.
- Optional creative-quality feedback prompt where appropriate.

The optional Basics cover must not be misrepresented as a universally mandatory upload; the PDF requires visual handling and missing-asset warnings without prescribing exact asset counts/required formats. File types, size/aspect/duration limits and actual placement/generation providers remain to be decided. Preserve generation support as an explicit planned capability or labelled service/fallback boundary; do not silently omit it or invent a real provider. Preview supported placements accurately without claiming an ad has launched.

### 6.5 Step 4: Reach (p. 11)

Explain how the campaign intends to find an audience. Include:

- Target geographic locations.
- Audience characteristics/interests where supported.
- Available distribution channels.
- Advertising budget allocation.
- Campaign duration.
- Audience preview: who the message intends to reach and how it may appear.

Distinguish **user-selected proposals** from settings the platform may finalize during review. Never promise a fixed audience: actual reach depends on inventory, prices, targeting, delivery and performance. No geographic taxonomy, supported channels, allocation formula or duration constraints are specified. Proposed design: configure intended channel allocation here and calculate absolute budget only from the creator's explicit goal at Submit; do not generate or overwrite that goal in Reach.

### 6.6 Step 5: Submit (pp. 11-12)

The creator sets the **funding goal at this stage**. AI must not generate it automatically and earlier steps must not silently overwrite it.

Before submission, show a complete campaign preview containing:

1. Campaign title and summary.
2. Creator identity.
3. Story and supporting sources.
4. Campaign and advertising visuals.
5. Intended audience and distribution settings.
6. Funding goal and estimated audience reach.
7. Campaign duration.
8. Applicable fees and funding policies.

Require confirmation of applicable campaign rules/submission policies. Primary actions: **Back**, **Save as Draft**, **Preview Campaign**, **Submit for Review**. After submission, show a confirmation screen and status timeline describing next steps. Submit enters review; it must not directly publish or launch advertising.

Proposed validation: positive valid monetary goal under explicit demo policy, valid duration/targeting/allocation, persisted draft/version/assets and required confirmation. The PDF does not provide numeric limits or consent wording; those are future documented decisions. Submission errors must preserve the draft and distinguish a failed request from a successful submission whose response was lost.

### 6.7 Requirements at every stage (pp. 8, 12, 21, 23)

- Preserve all entered form state when navigating backward.
- Autosave drafts and support later resumption; include explicit Save as Draft actions.
- Keep the five-step progress indicator visible; retain the prescribed order.
- Indicate required fields and clear validation errors.
- Distinguish editing, previewing and submitting.
- Give clear saved/submitted feedback and purposeful next actions.
- Maintain one coherent draft across manual/voice assistance, previews and submission.
- Proposed reliability checks: reopening after app restart restores persisted changes, save failures are visible/recoverable, conflicting/stale updates cannot silently destroy content, and submission cannot produce duplicate campaigns. These are implementation/verification recommendations supporting the required draft and data-integrity behavior.

## 7. Campaign lifecycle

**Exact PDF sequence (p. 20):**

```text
Draft -> Submitted for Review -> Changes Requested or Approved
      -> Available for Funding -> Funding Goal Reached or Funding Period Ends
      -> Distribution Preparation -> Promoting -> Completed
```

Exceptional states: **Rejected, Cancelled, Refund Pending, Failed**, where applicable. These are distinct from payment outcomes. The displayed chain includes a review branch: Changes Requested is not an approval and must not give access to funding.

**Mandatory business guards (pp. 18-20):** no publication or advertising before required approvals; material published-content changes return for appropriate review before advertising updates; funding completion does not imply advertising has launched. Distribution begins only when required approval, payment, budget and advertising setup conditions are met. Approval, funding completion, distribution and campaign completion are separate stages.

**Proposed allowed-transition design** (derived from the sequence; exact transition mechanics are not all specified):

| From | To | Guard / responsibility |
| --- | --- | --- |
| Draft | Submitted for Review | Creator owns draft, required fields and policy confirmation valid, submission snapshot saved |
| Submitted for Review | Changes Requested / Approved / Rejected | Authorized review decision with feedback/history; rejection is an exceptional branch |
| Changes Requested | Submitted for Review | Creator addresses feedback and resubmits; no direct transition to funding |
| Approved | Available for Funding | Required approvals complete; eligible publishable version and funding settings |
| Available for Funding | Funding Goal Reached / Funding Period Ends | Reconciled qualifying payments or actual funding deadline; do not launch ads |
| Funding Goal Reached / Funding Period Ends | Distribution Preparation | Apply disclosed funding/allocation/refund policy and review requirements; end-of-period underfunding outcome is not specified by PDF |
| Distribution Preparation | Promoting | Required approval, payment, budget and advertising setup all satisfied; explicit authorized distribution start |
| Promoting | Completed | Distribution has concluded; completion/reporting status reflects actual demo/provider evidence |

Completion threshold, partial-funding behavior, cancellation permissions, retries, refund timing and reopening rules are unspecified. Define and document them before implementation; do not make exceptional states arbitrary user-accessible jumps. Failures/cancellation/refunds must have explicit reasons, payment/ledger reconciliation and appropriate next actions. Proposed audit events record actor, prior/new state, reason, timestamp and campaign revision; broader reviewer moderation/audit tooling remains conceptual.

## 8. Contributions and payments

The required six-stage journey is inspection, amount selection, review, payment, confirmation and tracking (pp. 15-16).

| Stage | Required behavior |
| --- | --- |
| Inspect | Story, sources, funding information, audience and use of funds are available before contribution |
| Choose | Preset amounts plus custom amount; reach estimate updates using the configured campaign estimate model |
| Review | Contribution, applicable platform/transaction fees, total payment, associated estimated reach where calculable, current progress, terms/refund information and clear amplification purpose |
| Pay | Dummy provider for the assignment; clearly labelled simulated checkout when no credentials; support guest contributions where permitted and avoid unnecessary profile data |
| Outcome | Accurately represent pending, rejected, cancelled and failed states; show success only after the transaction result is verified |
| Confirm/track | Payment confirmation, amount, campaign title, receipt access, updated funding progress and share action; follow progress/updates and inspect final reports |

**Funding explanations (pp. 5-6, 14-16):** explain fees, advertising portion, allocation policies, refunds and unspent funds; money funds distribution, not direct charitable support. No policy percentages, real donation/tax benefit, unconditional refund promise or fund transfer to a creator is authorized by the PDF.

**Reach:** Home per-dollar illustration, goal-level estimate and contribution-level estimate must share explicit configurable assumptions. No fixed reach guarantee. Proposed model: fee-aware advertising budget and configurable delivery-cost assumptions, with a clearly documented demo formula. Selection of formula/rates is pending; the website's 27 people/$ is not mandated. Distinguish estimated audience reach from impressions and measured unique reach.

**Privacy:** public backer names private by default; accurate payment records with private receipt/history access and backend permissions. Do not display payment secrets, another backer's identity or unnecessary personal information (pp. 6, 23).

**Proposed integrity design:** separate contribution intent and payment attempt/status; verify simulated provider result on the backend; apply successful funding changes once; retain precision and original fee/estimate snapshot; model refunds explicitly. Pending/rejected/cancelled/failed attempts do not count as successful funds raised. This is a recommendation for coherent state, not a claim that the PDF specifies a particular ledger schema or payment protocol.

Reports distinguish raised funds, advertising spend, impressions, estimated/measured reach, clicks and other available results. Successful simulated checkout verifies a **demo transaction**, never a real financial settlement or real ad delivery.

## 9. UI/UX guidelines

**Confirmed requirements (pp. 2-4, 6-15, 20-23):**

- UI/UX is a major evaluation priority. Aim for premium, calm, credible, readable and easy-to-use screens; visual polish includes navigation, hierarchy, feedback and clear next actions.
- Design for real phones and one-handed use; test common mobile sizes. Keep consistent bottom navigation and contextual back behavior, avoiding deep/confusing menus, dead ends and unclear icons.
- Use a consistent spacing scale, clean typography, restrained brand colors, consistent icons/card styles/interactions, rounded campaign cards and high-quality imagery.
- Prioritize strong hierarchy, clear progress indicators, expandable secondary information and contextual explanations of funding, fees, reach, review and distribution.
- Use readable text, comfortable editorial line lengths/spacing, accessible contrast and sufficiently large touch targets; clear field labels and validation messages.
- Use smooth purposeful transitions and subtle feedback. Show skeleton loading, useful errors, empty/no-results, pending, validation and success states appropriate to each major flow.
- Confirm saving, submission, backing and status changes. Avoid buttons that appear functional but do nothing.
- Story screens prioritize readability, context and public sources. Backing screens prioritize trust, funds, reach estimates, fees and contribution action. Creator screens prioritize progress, saved work, validation and next step.
- Do not overload every screen with charts, badges, cards or decoration. Keep details expandable and actions obvious. Funding controls must remain accessible without covering story content.
- Demo data must be credible and consistent across feed/detail/progress/dashboard; label sample figures and estimates. Do not fabricate trust scores, independent verification or live measured delivery.
- First-time-user acceptance test: the user can explain what the platform does, what their money pays for and what happens next without team guidance.

**Project recommendations, not official design specifications:** use shared design tokens, consistent semantic status/error colors, platform-aware safe areas and keyboard handling, screen-reader labels and logical focus order. No official palette, font, pixel spacing, minimum touch dimension or animation duration is specified. Choose these deliberately later and record the actual design system instead of repeatedly redesigning it.

## 10. Technical requirements and open choices

The choice/status wording in this table is the historical initialization baseline. Confirmed implementations are recorded in decisions D11 onward and section 18; do not treat a baseline "unconfigured" or "undecided" cell as the current state.

| Area | PDF expectation | Classification / current decision |
| --- | --- | --- |
| Mobile | React Native with Expo; working mobile prototype and common-screen-size testing | Mandatory (pp. 2, 22); confirmed requirement, not initialized |
| Language | TypeScript strongly recommended | Recommended (p. 22); project preference, no configuration yet |
| Navigation/components | Consistent navigation and reusable components | Required qualities (pp. 4, 22-23); implementation library undecided |
| Backend | Clear backend architecture; Node with Express/NestJS or Python/FastAPI listed in recommended baseline; sensible substitutions allowed | Architecture/behavior required; exact framework/provider flexible (p. 22) |
| APIs | Authentication, campaigns, drafts, review states, contributions, activity and reports | Required API coverage (p. 22); endpoint design undecided |
| Validation/security | Backend validation and role permissions; protect secrets/private backer/payment details | Mandatory (pp. 22-23); no auth implementation yet |
| Database | PostgreSQL can hold relational records; Supabase or another managed database acceptable | Suggested alternatives, no provider/schema chosen (p. 22) |
| Authentication | Guest campaign browsing; one account can span audience/creator/backer; guest contributions where permitted | Required behavior (pp. 3, 5-6, 16); provider/identity verification unspecified |
| Storage | Image uploads/previews, credits/captions, story versus ad separation, file validation; supported video/generation/placements | Required capabilities/conditional support (pp. 9-11); provider/media limits unspecified |
| Payments | Dummy provider; labelled simulation where no credentials; coherent outcome states | Required prototype flow (pp. 15-16); provider architecture undecided |
| AI / voice | Assistance remains editable; services may use clear demo/manual fallback | Required entry/behavior with allowed fallback (pp. 5, 8-9); live provider not mandated |
| Advertising | Targeting/channels/budget/duration, approval gates, progress/reports; dummy data acceptable | Coherent workflow mandatory; live ad network not mandated (pp. 11, 16-22) |
| Deployment | No named hosting provider or production-scale deployment required | Environment/API access for functioning demo still needed; undecided |
| Packaging | Android APK and demo video; TestFlight conditional/if possible; code not required | Mandatory/conditional delivery (pp. 23-24); build accounts/toolchain unconfigured |

Do not lock architecture merely because the PDF lists examples. Choose a small maintainable approach that satisfies server validation, persistence, permissions, consistent state and Android delivery. No application dependency is installed during initialization. Exact commands and versions must be recorded after actual configuration; see `INIT.md`.

## 11. Proposed data model

**Original proposed model (retained for decision history).** The PDF defines workflows rather than prescribing entity names or storage design. The implemented SQLite migrations/API now realize these responsibilities using campaign content JSON, relational users/sessions/reviews/events/payments/ledger/tracking/notifications/assets/feedback. See section 18 for the actual architecture rather than treating every proposed entity as a separate implemented table.

| Entity | Proposed fields / responsibility | Relationships and constraints |
| --- | --- | --- |
| User / session / role | ID, minimal account/profile fields, roles and preferences | One user can create/back/follow; reviewers have restricted permissions; guest browsing independent of session |
| Campaign | ID, owner, title/category/creator display name/summary, goal, deadlines/duration, lifecycle state, selected revision, timestamps | Owns story/sources/assets/targeting; title max 60; owner required for protected editing; funding goal explicitly creator-set at Submit |
| Campaign draft / revision | Campaign/version IDs, editable fields, current step, save/submission timestamps, revision state | Preserves ordered content and backward/resume state; separates published approved content from pending material edits |
| Campaign story / section | Revision ID, ordered typed content: headline/intro/text/image/statistic/action | Stable section ordering across edit/preview/published rendering; image captions and credits persist |
| Campaign source | Revision ID, title, URL and associated evidence references | Sources render publicly with the relevant story version; validation must not imply independent verification |
| Campaign asset | Revision ID, purpose (cover/story/ad), URI, media metadata, caption/credit, validation/upload state | Editorial and advertising purposes distinct; supported formats/size rules configured later |
| Campaign targeting / creative settings | Locations, supported audience/interests, channels, proposed allocation, duration, ad copy/CTA/placements | Preserve creator choices separately from finalized reviewer settings; numeric budget derives transparently from explicit goal/policies |
| Campaign review | Revision, restricted reviewer, decision/reason/feedback, timestamp | Approve/request edits/reject against exact revision; retain review history and gates |
| Lifecycle / significant change event | Campaign/revision, actor, from/to states, reason and timestamp | Proposed auditable state history; backend guards required; full moderation tooling conceptual |
| Contribution | Campaign, optional backer/guest reference, amount/currency, privacy choice, fee/estimate snapshots, status | Default public anonymity; funding counts only reconciled successful payments; preserve accurate records |
| Payment / receipt / refund | Contribution, unique attempt/provider reference, simulated flag, outcome, total/fees, timestamps, receipt/refund links | Multiple attempts possible; idempotent accounting; private receipt/history; refund pending distinct from initial payment pending |
| Campaign follow / save | User/eligible guest mechanism, campaign, type/timestamps | Supports followed Activity and saved Profile lists; enforce recipient privacy/ownership |
| Notification / preference | Recipient, event/category, destination, delivery/read state; supported channel preferences | Produced by coherent events without repetitive low-value duplication; no unauthorized access |
| Campaign update | Campaign, author, content, timestamp, visibility | Progress/milestone communications link to Activity and tracking; authorized publishing |
| Distribution record / report | Campaign/revision, budget allocated/spent, period, impressions, estimated/measured reach, clicks, duration/results, provenance/demo flag | Distinct definitions and availability; promotion requires prerequisites; final report reflects coherent distribution state |
| Demo policy / estimate configuration | Fees, funding/refund/unspent rules, reach assumptions, supported channels/media | Version assumptions used in displayed calculations; do not present configurable demo policy as an official organizer rule |

Potential comments/replies/reports are optional entities only if moderation, reporting and privacy controls are supported. Amount precision, transactional accounting, versioned reviews and idempotency are recommendations to implement data integrity; exact schemas must be selected with the backend decision.

## 12. Requirements tracking: initialization baseline

Status vocabulary: `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `BLOCKED`. `IMPLEMENTED` needs corresponding code; `VERIFIED` needs recorded checks/evidence. The rows below preserve the **historical initialization snapshot**, when all implementation and verification statuses were NOT STARTED. The active 248-row implementation/evidence matrix is now REQUIREMENTS.md. Do not use this historical table as current progress or erase it when a session starts.

Classification uses **Mandatory**, **Optional**, or **Conceptual**. Conditional PDF requirements are marked Mandatory with their condition in the description; recommendations are described as Optional/recommended and not promoted into mandatory technologies. Planned implementations are proposals, not completed work.

| ID | Requirement | PDF page(s) | Class | Planned implementation | Current status | Verification status |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | Connected functioning Expo/React Native mobile prototype | 1-3, 22 | Mandatory | Expo app plus coherent backend/data flows | NOT STARTED | NOT STARTED |
| R02 | Explain amplification rather than direct donation throughout | 1-3, 5-6, 14-16 | Mandatory | Home/detail/editor/checkout explanations | NOT STARTED | NOT STARTED |
| R03 | Stable Home, Explore, Create, Activity, Profile tabs and clear back navigation | 3-4 | Mandatory | Shared bottom-tab navigation | NOT STARTED | NOT STARTED |
| R04 | Guest campaign browsing | 3, 5 | Mandatory | Public discovery/detail access | NOT STARTED | NOT STARTED |
| R05 | Secondary Partners/About/How It Works/FAQ/Help/Contact/legal destinations where appropriate | 4 | Mandatory | Reachable contextual information screens | NOT STARTED | NOT STARTED |
| R06 | Profile account, created/backed/saved campaigns, payment history, settings/help | 4 | Mandatory | Connected Profile views | NOT STARTED | NOT STARTED |
| R07 | Audience/creator/backer coexistence and reviewer restrictions | 5-6, 22-23 | Mandatory | Enforced backend ownership/role checks | NOT STARTED | NOT STARTED |
| R08 | Home hero, explore/create actions and labelled configurable per-dollar estimate | 6 | Mandatory | Intro with shared estimate configuration | NOT STARTED | NOT STARTED |
| R09 | Featured/feed cards with all cover/category/title/creator/summary/funding/reach/backing fields | 3, 6-8 | Mandatory | Reusable coherent campaign cards and seeded data | NOT STARTED | NOT STARTED |
| R10 | Visual Create -> Review -> Amplify explanation | 7 | Mandatory | Plain-language How It Works content | NOT STARTED | NOT STARTED |
| R11 | Functioning search/category/featured/sort/filter discovery | 7-8 | Mandatory | Real dataset query/filter/sort | NOT STARTED | NOT STARTED |
| R12 | Discovery loading/empty/error/no-results states | 8 | Mandatory | Explicit result/load states with recovery | NOT STARTED | NOT STARTED |
| R13 | Manual and voice creation entry; editable AI draft with labelled demo/manual fallback | 5, 8-9 | Mandatory | Guided entry and assistance adapter/fallback | NOT STARTED | NOT STARTED |
| R14 | Exact five-step order and persistent indicator; no unnecessary intermediate setup | 3, 8, 12 | Mandatory | One ordered editor flow | NOT STARTED | NOT STARTED |
| R15 | Autosave/resume, explicit draft saving, backward-state preservation and clear editor/preview/submit states | 8-12 | Mandatory | Persistent draft/revision model and feedback | NOT STARTED | NOT STARTED |
| R16 | Basics prompts, required title/category/creator, max 60 counter, summary and optional cover, title/ad explanation | 9 | Mandatory | Validated Basics step | NOT STARTED | NOT STARTED |
| R17 | Editorial composer: intro/headline, formatting, add/reorder sections, stats/actions | 9-10 | Mandatory | Structured story blocks and preview | NOT STARTED | NOT STARTED |
| R18 | Story image upload/preview/captions/credits and public evidence/source title/URL | 10, 13-14 | Mandatory | Versioned assets/sources and shared renderer | NOT STARTED | NOT STARTED |
| R19 | Separate cover/ad assets, ad copy/CTA, upload and supported generation/placement previews | 10-11 | Mandatory | Creative step with explicit support boundary | NOT STARTED | NOT STARTED |
| R20 | File validation and missing-asset warnings | 11 | Mandatory | Media checks and recoverable upload feedback | NOT STARTED | NOT STARTED |
| R21 | Video creatives where supported | 10 | Mandatory | Document supported media, enable supported preview | NOT STARTED | NOT STARTED |
| R22 | Optional creative-quality feedback prompt | 11 | Optional | Consider after primary creation flow | NOT STARTED | NOT STARTED |
| R23 | Reach geography, supported audience/interests, channels/allocation/duration and audience/ad preview | 11 | Mandatory | Reach step with proposed/final setting distinction | NOT STARTED | NOT STARTED |
| R24 | No fixed reach promise; shared configurable estimates and uncertainty | 6, 11, 14-15 | Mandatory | Explicit estimation model and disclosure | NOT STARTED | NOT STARTED |
| R25 | Submit complete preview, creator-set goal only here, fees/policies confirmation | 11-12 | Mandatory | Final review/goal/consent step; no AI goal | NOT STARTED | NOT STARTED |
| R26 | Back/save/preview/submit actions; confirmation and status timeline | 12 | Mandatory | Validated submission into review | NOT STARTED | NOT STARTED |
| R27 | Editorial detail/header/date/status/share/back-to-Explore, preserved story structure | 12-13 | Mandatory | Shared published story renderer | NOT STARTED | NOT STARTED |
| R28 | Accessible funding panel, amount/goal/percent/time/reach/back/share | 13-14 | Mandatory | Non-obscuring mobile funding controls | NOT STARTED | NOT STARTED |
| R29 | Expandable fees/ad portion/allocation/refund/unspent disclosures | 14 | Mandatory | Versioned visible demo policy | NOT STARTED | NOT STARTED |
| R30 | Audience/targeting/placements/privacy/ad/review/source/verification/partner disclosures as applicable; no invented trust | 14 | Mandatory | Honest expandable trust/distribution information | NOT STARTED | NOT STARTED |
| R31 | Optional visual/persuasion feedback where appropriate | 15 | Optional | No/Somewhat/Yes feedback if included | NOT STARTED | NOT STARTED |
| R32 | Optional comments/replies only with moderation/reporting/privacy | 15 | Optional | Defer until controls justified | NOT STARTED | NOT STARTED |
| R33 | Preset/custom contribution and dynamic associated reach | 15 | Mandatory | Amount selector plus shared estimator | NOT STARTED | NOT STARTED |
| R34 | Contribution review amount/fees/total/reach/progress/terms/refunds/purpose | 15-16 | Mandatory | Transparent review step | NOT STARTED | NOT STARTED |
| R35 | Dummy provider/labelled simulation; guest contributions where permitted | 16 | Mandatory | Backend-controlled simulated checkout | NOT STARTED | NOT STARTED |
| R36 | Accurate pending/rejected/cancelled/failed outcomes; verified-success receipt/funding/share | 16 | Mandatory | Outcome state machine and reconciliation | NOT STARTED | NOT STARTED |
| R37 | Public backer privacy by default and private accurate payment history | 4, 6, 23 | Mandatory | Private records and permissions | NOT STARTED | NOT STARTED |
| R38 | Followed/saved/backed campaign progress and updates | 4, 16 | Mandatory | Shared follow/save/backer tracking views | NOT STARTED | NOT STARTED |
| R39 | Creator overview fields and all six status filters | 16-17 | Mandatory | State-filtered dashboard | NOT STARTED | NOT STARTED |
| R40 | Draft edit/preview, moderation feedback/responses, sharing, milestones, promotion and final report | 17 | Mandatory | Contextual creator management | NOT STARTED | NOT STARTED |
| R41 | Controlled published material edits with re-review before ad updates | 18 | Mandatory | Proposed approved/pending revisions | NOT STARTED | NOT STARTED |
| R42 | Analytics/report definitions distinguish raised/allocated/spent/estimated/measured/impressions/clicks/duration/results | 16, 18 | Mandatory | Coherent labelled progress/final reports | NOT STARTED | NOT STARTED |
| R43 | In-app center with all relevant submission/review/funding/deadline/payment/promotion/progress/completion/report/update/security events | 18-19 | Mandatory | Recipient-scoped domain event notifications | NOT STARTED | NOT STARTED |
| R44 | Preferences/categories where supported; avoid repetitive low-value notifications | 19 | Mandatory | Supported preference UI/event deduplication | NOT STARTED | NOT STARTED |
| R45 | Push and email notifications if time/infrastructure allow | 18 | Optional | Defer until in-app flow complete | NOT STARTED | NOT STARTED |
| R46 | Minimum restricted review logic demonstration (scope ambiguity recorded) | 19-20 | Mandatory | Restricted approve/request edits/reject demonstration | NOT STARTED | NOT STARTED |
| R47 | Wider internal moderation, complaints, reviewer delivery management and audit tooling | 19-20 | Conceptual | Keep capability model; no full admin scope assumed | NOT STARTED | NOT STARTED |
| R48 | Normal lifecycle branches and exceptional rejected/cancelled/refund-pending/failed states where applicable | 20 | Mandatory | Explicit server-controlled state machine | NOT STARTED | NOT STARTED |
| R49 | Approval before publication/distribution; funding completion separate; approval/payment/budget/setup prerequisites | 18-20 | Mandatory | Guards and deliberate distribution preparation | NOT STARTED | NOT STARTED |
| R50 | Premium mobile typography/spacing/colors/cards/imagery/hierarchy/navigation/accessibility/feedback | 20-21 | Mandatory | Shared mobile design system and screen review | NOT STARTED | NOT STARTED |
| R51 | Major-flow loading/empty/error/pending/validation/success, meaningful actions and consistent demo data | 8, 21, 23 | Mandatory | State-aware UI and integrated data model | NOT STARTED | NOT STARTED |
| R52 | First-time-user comprehension and complete core journey | 2-3, 21, 23 | Mandatory | Usability and Android end-to-end demonstration | NOT STARTED | NOT STARTED |
| R53 | APIs for auth/campaigns/drafts/reviews/contributions/activity/reports; server validation/role security | 22-23 | Mandatory | Selected backend and verified contracts | NOT STARTED | NOT STARTED |
| R54 | Maintainable structure/reusable components, protect secrets and privacy | 22-23 | Mandatory | Reviewed module boundaries and secret handling | NOT STARTED | NOT STARTED |
| R55 | TypeScript strongly recommended; example backend/database technologies flexible | 22 | Optional | Evaluate/confirm choices with rationale | NOT STARTED | NOT STARTED |
| R56 | Android APK and full demo video | 23-24 | Mandatory | Build/install validation and recorded walkthrough | NOT STARTED | NOT STARTED |
| R57 | iOS TestFlight if requested in final stage / if possible | 23-24 | Mandatory | Conditional build readiness; pending request/environment | NOT STARTED | NOT STARTED |
| R58 | Telegram delivery and architecture explanation; code submission not required | 23-24 | Mandatory | Artifact/link checks and separately authorized submission | NOT STARTED | NOT STARTED |

When implementation begins, record evidence in `PROGRESS.md` and update rows accurately. A separate expanded requirements matrix may be created later, maintaining these IDs and page links. Conditional and optional items stay visible even if deferred; do not falsely mark them complete because they were excluded.

## 13. Development roadmap

**Planning recommendation, not an organizer schedule.** The user deadline is Monday evening, October 19, 2026. No mandatory requirement is removed to fit this plan. The starting state is documentation only, so build/service feasibility is an early risk to resolve, not a completed task.

| Window | Dependency-aware milestone | Required coverage / exit evidence |
| --- | --- | --- |
| Thu Oct 15 | Confirm architecture, demo policy/estimate choices and build feasibility; then authorized foundation | Stack/ownership/roles/API/data model, Expo navigation/design baseline, test strategy; early path to an installable Android build |
| Fri Oct 16 | Connected guest discovery/detail and complete five-step creator workflow | Required card/detail/disclosure content, functioning search/filter/sort, manual/voice fallback, composer/assets/targeting, autosave/resume/preview/goal/submission |
| Sat Oct 17 | Review/lifecycle and creator management; contribution integration | Restricted review/feedback/resubmission, approval guards, dashboard/revision rules, amount/fees/simulation/outcomes/receipt and consistent funding/private history |
| Sun Oct 18 | Progress, reports, activity/profile and state coverage; first candidate APK | Distribution prerequisites/promotion/completion, metric separation, event notifications/follows/saves/settings/help, Android installed core journey and major failure scenarios |
| Mon Oct 19 before evening | Fix defects, verify final APK and complete demo/delivery package | Verified required behavior, Android install/launch/retest, playable demo, accurate limitations and architecture notes, artifact/link checks |

Within each milestone, finish connected required workflows before optional comments, push/email or decorative extras. Use permitted simulated payments, demo delivery records and voice/AI fallback to control integration time without disguising their nature.

**Historical initialization risks:** at initialization, no application/toolchain/provider was configured, signing/build/device access was unknown, and persistent drafts, revisions, accounting and policy needed implementation. Those baseline risks are not current implementation claims. Sections 15/18 and the active progress/release records now identify demonstrated behavior and remaining verification/hosting/human gates. Surface any active requirement at risk with owner/next action/evidence; do not claim the dated plan guarantees completion or silently drop scope.

## 14. Architecture decisions

Decision log records **Decision, Reason, Alternatives, Date, Impact, Status**. Confirmed requirements are not claims of implementation. Preserve history and add rationale when changing a decision.

| ID / date | Decision | Reason | Alternatives considered | Impact | Status |
| --- | --- | --- | --- | --- | --- |
| D01 / 2026-10-15 | Use `E:\Campaign` as authoritative root | Actual resolved workspace; user explicitly confirmed correction | Supplied macOS project path | All project files/work remain here; macOS root superseded | CONFIRMED - user decision |
| D02 / 2026-10-15 | Original 25-page PDF governs product requirements | Explicit user instruction and task brief | Website/chat summaries as authority | Keep page traceability and reconcile changes against original | CONFIRMED - source rule |
| D03 / 2026-10-15 | React Native with Expo, five tabs, exact five editor steps | PDF mandates these | Web-only prototype, altered step order | Defines app/navigation/workflow boundary; not yet scaffolded | CONFIRMED - requirement |
| D04 / 2026-10-15 | No app development during initialization | User's strict execution limit | Scaffold alongside documentation | Only three documentation files authored in this task | CONFIRMED - task boundary |
| D05 / 2026-10-15 | Prefer TypeScript | PDF strongly recommends; shared types may aid maintainability | JavaScript; separate Python backend | Type/config setup pending; not an installed stack | PROPOSED |
| D06 / 2026-10-15 | Minimal restricted review demonstration; full admin conceptual | Reconcile p. 19 minimum with its explicit exclusion; user also requires demonstration | Omit review entirely; build full internal admin system | Preserve approval-dependent journey without treating all conceptual capabilities as mandatory | PLANNED INTERPRETATION - ambiguity retained |
| D07 / 2026-10-15 | Dummy payment and labelled voice/AI/demo delivery support boundaries | PDF allows prototype simulations/fallbacks | Live provider integrations | Define explicit adapters/outcomes and honest disclosures later | CONFIRMED allowance; implementation PROPOSED |
| D08 / 2026-10-15 | Backend, database, auth, storage, navigation library and build provider undecided | No existing implementation/provider constraints evaluated | Express/NestJS/FastAPI; PostgreSQL/Supabase/other managed; Expo Router/React Navigation; EAS/local Android | Evaluate before scaffolding; require server validation/roles and coherent persistence | OPEN |
| D09 / 2026-10-15 | Versioned drafts/reviews, structured story blocks and reconciled payment accounting | Supports state preservation, controlled edits, consistent receipts/progress | Simpler storage with equivalent behavior | Proposed entity/guard design; exact schema not selected | PROPOSED |
| D10 / 2026-10-15 | Configurable demo fees/policies/reach assumptions, no official palette or numeric rates invented | PDF requires transparency without providing values | Copy website figures or invent organizer rules | Explicit future configuration/disclosure decision needed | CONFIRMED constraint; values OPEN |
| D11 / 2026-10-15 | Expo 55 / RN 0.83 / TypeScript / Expo Router / TanStack Query, FastAPI and local SQLite | Working mobile stack with one coherent API, persistent relational transactions and no required cloud credentials; PDF permits sensible database substitutions | Supabase/PostgreSQL or Node backend; client-only state rejected for permissions/accounting | Supersedes open stack D08 and confirms D05 for local implementation; DB remains project-isolated | CONFIRMED and IMPLEMENTED; verification in PROGRESS.md |
| D12 / 2026-10-15 | Finish local application before accounts, external hosting or release setup | Explicit instruction superseded the brief intervening request to set up cloud accounts | Paid hosting rejected by free-only budget; possible free services researched, not configured | No accounts, cloud adapter, deployment or external submission created | Cloud deferral RETAINED; local build scope superseded by D16 |
| D13 / 2026-10-15 | Warm-neutral/forest/coral shared UI with editorial typography, rounded cards and 48-unit chip touch targets | Premium readable mobile-first interpretation without copying desktop reference | No official palette exists; generic dense admin style rejected | Shared tokens/components; browser visual checks with native accessibility still pending | CONFIRMED project design decision |
| D14 / 2026-10-15 | USD demo: included 5% platform fee, no extra transaction fee, 27 estimated people/net advertising dollar; documented refund/partial-funding rules | Concrete transparent configurable prototype policy where PDF supplies no numeric values | Guaranteed reach/unsupported organizer fee claims rejected | Server owns policies/calculations; frontend integer-cent quotes mirror rounding; no real funds or ad delivery | CONFIRMED demo assumptions, not organizer rules |
| D15 / 2026-10-16 | Contemporary civic publication with bundled Manrope/Newsreader, ultramarine actions, warm paper, photography and compact utility screens | Earlier explicit user request for a complete native redesign; screenshot audit exposed oversized functional layouts | Pure editorial and consumer-finance directions considered | Superseded D13 at that time; preserved APIs, architecture, exact five-step flow and financial rules | HISTORICAL implementation; later rejected by the user and superseded visually by D18 |
| D16 / 2026-10-16 | Local INTERNAL-TEST release variant with embedded JS and Android Debug certificate | Latest directive authorizes safe standalone-build investigation without waiting for EAS | Existing Metro-dependent debug APKs remain preserved; no production signing or invented hosted URL | Gated CNG HTTP plugin supports the explicitly local demo API; build launcher verifies bundle, fonts and signing; runtime Metro/backend acceptance tracked separately | IMPLEMENTED configuration; actual artifact acceptance in RELEASE_READINESS.md |
| D17 / 2026-10-16 | Root Git source-only backup to existing private tejassambhus17/Campaign, main tracking origin/main | Explicit GitHub backup instruction; existing Git Credential Manager login and private destination verified | New repository, force-push, history rewrite, CI/deployment and inclusion of credentials/runtime artifacts rejected | Original mobile scaffold remains an ancestor; nested metadata archived locally; 102 source/config/asset/doc files uploaded, PDF/video/database/toolchains excluded; no app behavior changed | VERIFIED initial source commit and GitHub refs/API; see docs/GITHUB_BACKUP.md |
| D18 / 2026-10-16 | Compact mint-and-charcoal consumer mobile composition, image-led discovery and sans-serif Manrope hierarchy | Latest explicit reference-driven request rejects D15's visual result; use reference composition while preserving Campaign's amplification meaning | Donation/banking claims, copied reference people/photos, another scaffold and unnecessary business rewrites rejected | Supersedes D15 visual choices only; all five tabs, exact creation steps, APIs, financial policy and lifecycle gates retained; checkpoint preserves prior source | IMPLEMENTED/frozen; four native corrections and bounded 12-surface finish review pass; full new journey/video IN PROGRESS |
| D19 / 2026-10-16 | Device-scoped System (default), Light and Dark appearance through one semantic theme provider | Explicit complete-appearance requirement for guests and signed-in users, live OS changes, cold restore and sign-out retention | Per-screen toggles, account-bound preference and theme-driven navigation/session remounts rejected | AsyncStorage `campaign:appearance:v1`; provider above session/query/navigation; semantic palettes/styles, SDK55 system UI/navigation bar/splash configuration; user content, forms and draft state remain separate | IMPLEMENTED; pure tests and scoped installed System/cold-restore/draft continuity pass; exhaustive state combinations unverified |
| D20 / 2026-10-16 | Preserve Light; correct Dark to pure black/neutral-charcoal surfaces with restrained mint accents/actions | Later explicit user steering rejects the first reference pass's green-tinted Dark appearance | Green-tinted large backgrounds/containers rejected; no change to preference/session/draft architecture | Frozen pass2 source uses background #000000, surface #121212, raised #1C1C1C, header #151515 and contextual container #1E1E1E; earlier green-Dark captures remain rejected visually | IMPLEMENTED; contrast tests, exact-build Black cold restore and 12-surface visual review pass in their stated scopes |
| D21 / 2026-10-16 | Apply the Product Quality and Hackathon Alignment Addendum as targeted refinements within the existing design | Explicit user direction reopens source after black pass2; avoid another redesign or duplicated functionality | New visual direction, extra wizard step, separate notification store and full admin expansion rejected | Actionable existing-validation checklist, truthful draft persistence, distinct editorial/ad previews, contextual private receipts and ledger-derived refund reconciliation; exact current evidence stays in PROGRESS/REQUIREMENTS | IMPLEMENTED; source and selected installed gates pass; physical/human and judge-backend gates remain open, recording held and cloud release deferred |
| D22 / 2026-10-16 | Faithfully implement the user-approved Campaign App UI Showcase across native discovery, creation, backing, Activity and complete auth/Profile | Explicit latest user direction makes screen composition and actual phone screenshot comparison primary acceptance criteria | Another generic template, invented identity/followers/trust or copied financial assumptions rejected | Retain Expo/FastAPI, five tabs/steps, scoped drafts, shared appearance, server policy/privacy/review; use compact Manrope, near-white Light, neutral-black Dark, mint actions and documented generated local art | IMPLEMENTED; final source/binary/physical checks and bounded reference review VERIFIED; performance/human/external delivery remain open, recording held |
| D23 / 2026-10-16 | Apply the later Create reference to the existing five-step editor and add persistent private profile photos | Explicit request for faithful creation composition and a working My Profile/Edit Profile photo option | Six-step/80-character/goal-at-Reach/immediate-live reference text, public avatar URLs, fabricated portraits and a replacement stack rejected | Reuse existing draft/session/theme/validation; add compact native CreationUi components and decorative local art; add owner-only normalized avatar BLOB via migration005 and authenticated API | IMPLEMENTED; 35 API tests retained, final 64 mobile/source checks pass; pass3/pass5 native matrix plus pass6 route/runtime correction and bounded reference review VERIFIED; human/performance/release gates remain, recording held |
| D24 / 2026-10-16 | Separate Home quick notifications from Activity's full existing history | Explicit premium-notifications directive; PDF pp.18–19 governs events/preferences | Duplicate backend/store/event records and changed business rules rejected | Content-sized native Modal latest5, shared NotificationRow/recipient Query, safe destinations and guarded existing-POST coordinator; stable header gesture/compact pinned failures | IMPLEMENTED; pass5 source 81 mobile/35 API tests, strict binary, installed launch/focused native checks and bounded finish review VERIFIED; broader human/performance/release limits remain, recording held |
| D25 / 2026-10-16 | Refine the approved identity using exact supplied logo and later Home/Onboarding compositions | Explicit final-correction, logo, Home and Auth references supersede earlier compositions in their scope | Backend rewrite, duplicate stores, omitted PDF explanation or altered brand raster rejected | Preserve Expo/FastAPI, five tabs/steps and business rules; refine density/notifications/summary/Explore/Appearance; Home source unchanged 6→7; new Auth optionally persists login | VERIFIED within pass12 source/binary and bounded Home/Auth/native scope; earlier matrices retain exact hashes; human/performance/release held |
| D26 / 2026-10-16 | Compact Auth polish, transparent extracted mark and Dark fallback | Later explicit user brief removes Welcome/Login theme controls and requests Dark default | Parallel auth theme, forced overwrite of saved Light/System and opaque poster fragments rejected | One shared store; preserve saved preferences/Settings, truthful recovery text, original poster unchanged and separately documented transparent extraction | VERIFIED within pass12 source/Auth/keyboard/preference-restoration scope; new-device fallback source-tested, no fresh-install claim; pass8 unbuilt |

## 15. Actual project status

**Historical notification phase — VERIFIED within recorded local scope:** notification pass5 preserves the existing backend and distinct Home quick-sheet/full Activity responsibilities. 78 source inputs/81 tests, TypeScript/lint/diff, unchanged backend 35 tests and strict binary inspection pass; actual POCO compatible install/Metro-off launch and final focused error/privacy/theme/dismissal/context checks pass. The broader pass2/pass3 matrices retain their exact scope. The bounded finish review closes the header-swipe finding and two material visual findings (long failure prose and low-volume empty height). Diagnostics/service restoration are saved. No filming, hosting or submission occurred; sustained performance, human/TalkBack, more devices/orientations and external delivery remain separate.

**Historical Create phase:** bounded Create/photo local verification is complete. Final pass6 source has 64/64 mobile tests (898.9374ms), TypeScript/lint exit 0, independently inspected binary and actual Metro-off/API launch. The unchanged backend retains 35/35 tests observed earlier in tool output (13.323s). Pass3/pass5 cover Story order/format/source, distinct cover/ad uploads, Reach and explicit goal persistence, appearances, previews/policies/submission and complete photo controls; pass6 closes the submission destination defect and confirms the focused native follow-ups. The independent review has no open P0/P1/P2 in its matrix. Prior Showcase proof remains historical. No film, hosting or submission occurred.

**Previous corrected x86 checkpoint:** [quality-pass2 native results](artifacts/product-quality/pass2/NATIVE_RESULTS.md) bind `4B9B6535…8EACA` to selected keyboard/footer/receipt and Metro-off/state/report checks. The first `35974413…` APK retains its connected lifecycle fixture. The later `24348DD9…B096A` ARM64 was physically installed and exercised through its documented core workflows before Showcase development. These historical checks remain useful regression evidence but do not establish current appearance or final-build acceptance.

**Existing files/configuration:** original PDF and preserved initialization records; active requirements/progress; shared Expo source, bundled licensed fonts, local CNG plugin/configuration, session/draft/appearance state and tests; one FastAPI/SQLite API with migrations, uploads and cached licensed seed assets; re-extracted current design system/sidecar, audit and release/demo evidence; isolated Android SDK/JDK/Gradle/emulator tools; preserved historical artifacts and both final tagged black pass2 APKs. Test helpers under tmp remain non-product artifacts.

**Historical initialization evidence (before development):** resolved root verified; macOS-path mismatch corrected with explicit user confirmation; all 25 PDF pages reread; reference homepage product understanding retained with audit limits recorded; agent/startup/product context files created with traceability, proposed architecture and accurate unimplemented statuses. At that stage, documentation checks confirmed all three files existed, startup references resolved, context sections ran from 1 through 17, all 58 baseline requirement IDs had valid classifications/page ranges and NOT STARTED implementation/verification statuses, local Markdown links resolved, and the original PDF hash was unchanged. That initialization-only inventory contained the PDF, pre-existing review directory and three requested documents; no application tests or builds had yet run. Subsequent authorized implementation and actual checks are recorded above and in the active evidence files.

**Historical black-pass2 checks and outstanding acceptance at that checkpoint:** frontend tests pass 50/50 in 499.9563ms; TypeScript, lint and web/Android exports pass. Backend 30/30 remains valid for unchanged API source; online Expo dependency compatibility and Doctor 20/20 pass. Independent [binary inspection](artifacts/reference-redesign/BUILD_INSPECTION.json) verifies both final APKs and all 50 frozen app inputs. [Native results](artifacts/reference-redesign/after-pass2/NATIVE_RESULTS.md) record Home funding in the first 393dp viewport in both schemes, 360dp/font 1.3 docks/actual Gboard, selected 411dp/font 1.6 critical screens, exact Metro-off Black/ordinary-identity restore, a draft's explicit $7.50 goal through preview/theme change/cold Home Continue, guest $9.99 offline scope/recovery, and System following actual Android night changes. The unavailable client port 8788 check intentionally signs out; it is not a physical network-outage test. Metro was restored after the specific cold-launch proof. These selected cases do not verify every width/font/state combination. The full new connected journey, uninterrupted Dark raw capture and final demo playback/privacy review remain pending at this checkpoint.

**Historical delivery evidence:** the previous [native creation-to-report journey](artifacts/demo/NATIVE_RESULTS.md), [22-scene video](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4), [bounded review](artifacts/demo/VIDEO_REVIEW.md), [player proof](artifacts/demo/PLAYBACK_RESULTS.json) and [cleanup](artifacts/demo/cleanup/README.md) remain preserved. Their accepted scopes belong to the former `638807B4…` x86_64 build, not D18/D19. Do not reuse those results to mark current theme, image-led hierarchy, state continuity or demo acceptance VERIFIED. ARM64 installation, physical devices, screen-reader use, human comprehension/listening and public judging connectivity remain unverified. Live AI/voice/advertising retain the permitted fallback/simulation boundaries.

**Historical black-pass2 blocker record:** cloud credentials are unnecessary for the controlled local demo. EAS is signed out and hosting is unconfigured/deferred. Exact final x86_64 Metro-off cold launch and separate API rendering pass; the API is still a separate required service. Final ARM64 is built and inspected but uninstalled. Physical-device/firewall/LAN reachability, production signing, screen-reader/human testing, human listening and conditional TestFlight remain separate. Dependency audit/unlisted-media boundaries remain documented; no production-security claim is made. The reported Telegram cutoff/timezone remain unconfirmed.

**Isolation:** initialization authored only its three requested Markdown files. The subsequent authorized development work remains under E:\Campaign, with ordinary system toolchain/package-cache use permitted by the master directive. No ERP files, source, databases, containers, credentials or settings were accessed or changed; its exclusion path was not inspected. The original PDF remains unchanged.

**Current next action:** preserve final pass6 and its source/binary/native/reference records; no further code correction is required by this bounded review. Keep P3 ornament/IME-spacing notes and sustained-performance, TalkBack/human/additional-device checks separate from completion. Free hosted judging access, production signing, conditional TestFlight and Telegram cutoff confirmation remain external release gates. Recording, external submission and Git publication are not resumed.

## 16. Delivery requirements

**Confirmed PDF deliverables (pp. 23-24):**

- **Android APK:** submit an Android application build. A working source tree, web preview or uninstalled build job does not itself verify the final APK.
- **Demo video:** walk through the complete assignment and key user flows using actual implemented behavior.
- **iOS TestFlight:** p. 23 makes final-stage preparation conditional on a request; p. 24 asks to prepare/share if possible. Track this condition honestly instead of assuming it is already required or completed.
- **Submission channel:** Telegram group <https://t.me/+brkDpS8rYfBjNzll>; submit video, APK and any other required files/links there. Initialization does not authorize joining or sending messages/files; future submission requires user direction under applicable tool policies.
- **Code submission:** not required. Be ready to explain architecture and demonstrate implementation. Opportunities/certificates/prizes on pp. 24-25 do not introduce additional technical deliverables.

**Submission timing:** Monday, October 19, 2026 remains the working target (Asia/Calcutta planning context). The user's October 16 organizer-video summary reports a maximum Tuesday, October 20 at 11:59 AM. This maximum and its timezone are not independently confirmed: the official Telegram invite exposes no posts publicly. The PDF supplies no separate deadline. See REQUIREMENTS.md organizer alignment for provenance and follow-up.

**Delivery verification:** RELEASE_READINESS.md separates the new Create/photo candidates from the historical Showcase pass5 binary/phone proof, pass4 connected workflow and bounded reference review. Actual bytecode and exact phone launch confirm the corrected USB-local default; the host API and USB are still required. Performance/human/accessibility, complete current video, signing, iOS and organizer connectivity remain separate. No automated similarity/engine or whole-device approval is claimed.

## 17. Important project rules

1. Follow the original PDF; preserve mandatory requirements and page traceability. Distinguish recommendations, conceptual scope, optional/conditional capabilities and unresolved policy.
2. Use React Native with Expo and deliver a functioning Android prototype with a demo video.
3. Preserve Home, Explore, Create, Activity and Profile bottom tabs and the exact five-step creation sequence.
4. Support guest browsing, editable assisted drafts, autosave/resumption and backward-state preservation. The creator explicitly sets the goal at Submit.
5. Keep public sources and editorial structure; separate story from advertising creative.
6. Demonstrate review logic; protect reviewer actions and ownership on the backend. Approval, funding, distribution and completion are separate stages.
7. Explain message-distribution funding, fees, advertising allocation, refunds, unspent funds and uncertain reach clearly. Never imply direct cause donations.
8. Label simulations/demo data, separate estimates from measured/verified metrics, and never invent trust scores, tests or completed behavior.
9. Build coherent connected workflows with appropriate states, real actions, data integrity, privacy and accessible premium mobile UI/UX.
10. Reuse existing implementations and maintain the established architecture; document significant decisions and verify changes before claiming completion.
11. Keep all project work inside `E:\Campaign`; leave the Prakash Glass Enterprise ERP and unrelated projects completely untouched.
12. The initialization-only boundary is complete. Local implementation, dependencies, tests, authorized screenshots and INTERNAL-TEST builds may continue; demo recording/production remains held and cloud accounts/hosting remain deferred.

## 18. Implemented local architecture and continuation

- **Mobile source:** `apps/mobile/src/app/(tabs)` contains Home, nested Explore/detail/checkout/report, Create, Activity and Profile. Expo Router preserves the five tabs; non-route components and features stay outside the route directory.
- **Shared client boundaries:** `components/ui.tsx` provides reusable controls/states consuming `useTheme`. `lib/appearance.ts` owns semantic Light/Dark palettes and a separate device preference store; `lib/theme-styles.ts` derives styles; `lib/theme.tsx` owns the stable provider above session/query/navigation. Appearance now defaults to Dark only for absent/invalid preferences under the later explicit Auth-polish brief (D26), preserves saved Light/System values, follows live OS changes in System mode, and persists in AsyncStorage under `campaign:appearance:v1`, handles invalid/failed restoration and serialized writes, and does not touch account/draft/payment keys. Native OS bars/root background and supported keyboard appearance follow the effective scheme; OS-owned dialogs/gesture behavior remain platform-controlled. `lib/api.ts` owns request auth/timeouts/errors and validated device-reachable media/API URLs; `lib/session.tsx` owns session restoration and TanStack Query invalidation. Explicit expiry clears durable/private identity, allowlisted public reads may retry as guests, writes never replay, and a late old-session response cannot clear a newer sign-in. Offline failures preserve saved identity/drafts; switching backends signs out. `lib/types.ts` centralizes types, supported categories and integer-cent quote previews. Server responses remain authoritative for transactions.
- **Audience content:** `lib/public-campaign.ts` projects approved public content from managed private revisions using an allowlist, failing closed when required approved content is absent or malformed. Public lifecycle/financial facts remain current, but private pending story, assets, goal and reviewer feedback do not become backable audience content. Detail, checkout, sharing and reporting use the public projection; the campaign journey displays only available real lifecycle dates, never inferred advertising delivery or private review history.
- **Creation:** `features/creation` owns validation, normalized editable payloads, scoped durable multi-draft storage and live campaign/advertising previews. `readiness.ts` derives issues from existing validation; `FieldTarget` and `SubmissionChecklist` reuse the five existing steps. `persistence.ts` describes actual local/account snapshots and protects newer edits from late save responses. Guest transfer is explicit after sign-in. Automatic local saves and explicit account saves preserve progress; submit is idempotent and requires the creator's goal/policy confirmation. Published and pending revisions stay separate.
- **Quick notifications and Activity:** Home mounts `features/notifications/NotificationSheet.tsx` separately from its ScrollView; Activity retains the full existing virtualized feed. `NotificationRow.tsx` shares presentation; `useActivity` remains the sole recipient notification cache/badge source. `state.ts`/`useNotificationActions.ts` share guarded in-flight reads, not duplicate event records. Existing endpoints/preferences/destinations remain. D24/section 23 records final pass5 and separately scoped native evidence; bounded local verification passes.
- **Private account photos:** `features/profile/Photo.tsx` uses the system picker and authenticated JSON transport for choose/crop/change/remove; user initials remain the fallback. `captureApiSession` rejects late completions after sign-out, reauthentication or server change. Private image query keys include server/account/version and clear on sign-out; no photo bytes go to AsyncStorage. `/me`, login and name edits expose nullable `avatarVersion`. Migration005 stores one owner-only normalized JPEG BLOB, separate from public campaign assets. See section 22.
- **Backend:** `services/api/main.py` implements validated authentication/profiles, campaigns/drafts/submission/reviews/transitions, tracking/preferences/activity/updates, uploads, payments/receipts/refunds and reports. `db.py` owns transactions, migrations, password/session/receipt primitives; `domain.py` owns content/policy validation; `seed.py` produces fictional coherent demo campaigns. See its README for exact contracts.
- **Persistence/permissions:** local-default SQLite and explicitly configured PostgreSQL share relational identity/payment/event/ledger records and versioned content snapshots. Ownership/reviewer roles, privileged-field protection and transactional contribution/refund rules remain. The D27 preparation replaces the previous unlisted-public upload boundary: unpublished media requires owner/reviewer authorization, and only approved public snapshots expose image bytes. Cloudinary objects remain authenticated behind the API proxy; all media responses use private/no-store caching. Profile images remain authenticated database bytes/data URIs. Stable cloud receipt secrets preserve capabilities; neither secrets nor private local records enter the APK/cloud seeds. Actual hosted persistence is unverified pending account connection.
- **Business states:** review, approval/publication, funding, preparation, promotion and completion remain separate. Funding cannot launch advertising. Material revisions require review and setup reconfirmation. Demo delivery records and refund calculations are coherent with successful simulated funds and never claim verified real-world delivery.
- **Run locally:** `start-local.cmd` verifies/reuses project listeners or starts hidden owned processes. Preview localhost:8081; API 127.0.0.1:8787. Per-process PowerShell invocations in README avoid changing the machine's global script policy. The authorized physical phone uses the verified in-app override http://127.0.0.1:8787 with its explicitly scoped USB reverse 8787; LAN/hosting remain unverified. An emulator uses 10.0.2.2:8787.
- **Android:** Expo CNG generates native files; never hand-edit them. Package com.campaignamplification.mobile; app name Campaign. Camera/microphone permissions are blocked, keyboard resize configured, focused Back preserves editor state. SDK55-compatible `expo-system-ui` and `expo-navigation-bar` plus automatic appearance/black splash configuration are generated through CNG. `android-local.ps1` supports preserved Debug and distinct InternalTest release variants using isolated SDK/JDK17/Gradle and explicit ABI, restoring process variables. Optional `-ArtifactTag` writes a separate artifact directory and tagged build log. The process-only JVM temporary directory is `tmp/java` for both `java.io.tmpdir` and `jdk.net.unixdomain.tmpdir`, resolving the Windows selector failure without global changes. The internal flag permits local HTTP and exposes existing backend connection controls. Historical quality-pass APKs have independent binary and scoped installed evidence. The historical Showcase pass5 independently matches frozen/compiled sources and actual embedded API assignment `http://127.0.0.1:8787`; the old emulator value is absent. Each build attempt now uses a fresh project-local TEMP/TMP directory while CI remains enabled, avoiding shared stale transforms without clearing global caches. The exact installed POCO Metro-off/API launch and bounded native/reference checks pass. Scope and remaining performance/accessibility/release limits are recorded separately. The emulator helper verifies only Campaign_API_36/dedicated ADB5039; its default Install still targets the debug APK, so use the explicit internal artifact for acceptance. Exact hashes/runtime scopes are in RELEASE_READINESS and ANDROID_LOCAL. Exports alone never establish installed acceptance.
- **Verification memory:** the active matrix and progress log record exact evidence and limits. Do not promote a parent requirement to VERIFIED based solely on static code, one screen or a partial test. Keep the original product specification and decision history while updating live evidence.

## 19. Organizer guidance alignment

The user supplied a 13-point summary of reviewed official video guidance on October 16. It supplements the original PDF; the actual video/transcript was not provided or independently watched in this session. Preserve the existing native app, design system, single audience/creator/backer account model, exact five-step workflow, transparent dummy backing and minimal restricted review. Real advertising and a larger admin platform remain outside scope. Mobile clarity, stability and Activity/Notifications receive extra attention, and the complete demo video is the first evaluation stage.

The alignment audit found Activity-specific gaps rather than a reason to restart: missing campaign context, identical followed links, generic destinations, a singular/plural payment-icon mismatch and read writes blocking navigation. The current refinement uses a virtualized chronological native inbox, explicit unread/category controls, shared unread badge, named followed campaigns and server-resolved safe destinations. Existing Profile settings handle payment/preference navigation; no separate end-user roles or parallel architecture were introduced. Notification destination metadata preserves legacy rows and resolves current permissions/approved public titles; preference updates merge transactionally. A native regression also exposed repeated correction links returning to creation entry; Create now consumes focused draft intents and saves/preserves the current device snapshot when switching or reopening. Actual tests/native acceptance and outstanding delivery limits belong in PROGRESS.md and REQUIREMENTS.md.

## 20. Previous October 16 reference redesign and local delivery

The earlier civic-publication iteration remains preserved in source/artifact history. The latest reference-driven directive rejects that visual result and requests compact mint-and-charcoal consumer mobile UI, complete appearance and refreshed native/demo proof without restarting working functionality. Source checkpoint `artifacts/checkpoints/before-reference-redesign-20261016-101133` preserves the clean prior source. All 25 original PDF pages were reread; the actual organizer recording/transcript remains unavailable, so the user-supplied clarifications are not presented as a directly watched video. The reference website text reader failed this visit; prior product understanding and the PDF remain available.

Later explicit steering rejects the first reference pass's green-tinted Dark surfaces and requires a premium black/neutral-charcoal Dark treatment with mint restricted to small accents/actions. Light remains unchanged. D20 records this focused correction rather than another architecture or workflow redesign. The single correction round also fixes Home funding visibility, enlarged detail/checkout docks and real Gboard avoidance. All four targeted checks pass on the exact corrected APK. The [independent finish review](artifacts/reference-redesign/FINISH_REVIEW.md) returns `ship` for only its 12 supplied core phone surfaces, with no material visual fixes; broader workflows/video remain outside that verdict. Current DESIGN.md and its sidecar have been re-extracted and validated by a fresh documenter.

Product Design's supplied-reference translation and screenshot-first audit plus Impeccable Operate/Android/craft-floor guidance inform this iteration. Impeccable `context` ran successfully with a project-local `IMPECCABLE_HOME` cache; the earlier missing-engine/cache limitation is resolved. The native target does not use the HTML/CSS detector. No Figma connection, generated alternatives or design approval is claimed. The new source uses compact Manrope hierarchy, semantic light/dark colors and one device-level preference mechanism throughout app-owned screens. Newsreader assets/licenses remain bundled for historical compatibility, rather than being the active title style. `DESIGN.md` and its sidecar must describe the final actual source; no parallel component framework or web-only architecture was introduced.

The final black pass2 APKs are under `artifacts/android/black-theme-pass2-20261016/`: x86_64 is 38,437,869 bytes, SHA-256 `45F0D82B23CD9B6C3DAD56E029E56B7F3CAF3CD91F18CF4FC6A8DED7DE7AE187`; ARM64 is 37,150,011 bytes, SHA-256 `CE69B6139356A578E1E4E9FC80EE01960B8E90F26C4BD7B000C5210DBB8DC166`. Independent inspection verifies a shared 2,018,008-byte Hermes bundle, exact fonts/full licenses, correct ABIs/API and Android Debug signing, plus the frozen 50-input digest `31def764edeefb1d1d3a03cdecfadb9353e2ae5992b03fe0cbf8969d8376d543`. ARM64 is uninstalled. [Exact x86_64 cold-launch proof](artifacts/reference-redesign/after-pass2/cold-launch.json) demonstrates Metro absent, API content, saved Black and restored ordinary identity; Metro was restored afterward. Additional selected theme/draft/large-text/System/recovery checks are in the [native results](artifacts/reference-redesign/after-pass2/NATIVE_RESULTS.md). The new demo is incomplete and held at the user's request; no recording/production or demo campaign mutations are authorized until the human user explicitly resumes them. The old film remains historical. EAS/cloud accounts and hosting stay deferred, free-only preference retained. Embedded JavaScript, installed Metro independence, backend reachability and video acceptance remain distinct claims. Current artifact/runtime/video evidence and precise remaining blockers live in PROGRESS.md, RELEASE_READINESS.md and DEMO_CHECKLIST.md.

## 21. Approved Showcase design contract and acceptance boundary

The app-wide user-approved `Campaign App UI Showcase.png` is preserved under `artifacts/showcase-redesign/reference.png`. D22 changes native composition, not product semantics or the architecture: compact Manrope, image-led Home/Explore/detail, clear contribution amounts and configured allocation, the existing five-step creation/editor and current-data previews, vertical campaign journey, contextual Activity, and focused Profile/account destinations. Light uses near-white surfaces/deep-green primary; Dark uses `#000000` background/header, `#121212` surfaces, `#1C1C1C` raised surfaces and restrained mint actions. The device-level System/Light/Dark provider remains stable above identity/navigation; the Profile switch retains System under Settings.

The guest welcome, sign-in and create-account forms use real session APIs, validation, loading/error feedback, password visibility and guest navigation. Signed-in Profile uses actual identity and truthful Campaigns/Backed/Saved metrics, with existing private payment, notification, help/legal, backend connection, sign-out and role-restricted review functions retained. No reference likeness, follower count or trust metric is fabricated. Successful auth notices are transient and accessibility-announced; error feedback remains available.

Three generated local assets live under `apps/mobile/assets/images/showcase/`: `campaign-mark.png`, `welcome-background.png` and `ocean-turtle.png`. [Provenance](artifacts/showcase-redesign/ASSETS.md) records generation, the native-driven medallion correction and exact hashes. The ocean cover is explicitly illustrative for a fictional fixture, not campaign evidence or a replacement for story/ad uploads. [DESIGN.md](DESIGN.md) and `.impeccable/design.json` describe actual implementation and the bounded native reference review. The inner advertising creative intentionally remains white with dark text/deep-green CTA in both app appearances; the surrounding canvas/frame follows the selected theme.

Historical Showcase build/runtime facts remain in release/progress/physical records. Its pass3 exposed a stale baked emulator address despite matching source maps and a working saved USB override. Pass4 fixes build cache isolation; final pass5 retains independent exact API-module verification and actual installed phone launch. The pass4 workflow matrix and pass5 focused correction remain separate in the completed local verification; human/accessibility/performance and external release gates remain open. Existing records, accounts and drafts must be preserved. Screenshot QA is authorized; recording and external release setup remain held.

## 22. Create reference and private profile-photo refinement

The later [Create reference](artifacts/create-polish/reference.png) refines D22 only for creation and its confirmation. `features/creation/CreationUi.tsx` adds the connected five-icon progress row, compact category selector, formatting/story composer, upload area and media thumbnails, review-summary rows and pill actions. Existing `create.tsx`, model/readiness/persistence and draft-library behavior remain in use. `FundingPolicies` is shared from `creation/Preview.tsx` into Submit so complete current server policy is available before explicit consent.

PDF pages 9–12 retain Basics → Story → Campaign & Ad Visuals → Reach → Submit, 60-character title, required creator/category, optional summary/cover, editable ordered editorial sections, public source titles/URLs and separate ad assets. Geography/interests/channels/allocation/duration remain Reach controls; the creator enters the funding goal only at Submit. Manual and labelled guided fallback, previews, local/account persistence, Back and review-only submission remain connected. Reference claims of six steps, 80 characters, goal at Reach, INR amounts, 100MB/video/document upload and immediate publication are visual sample content and are not adopted. Confirmation says submitted for review; it cannot imply funding or advertising has begun.

Two generated local decorative rasters, `assets/images/create/story-mountains.png` and `confirmation-coast.png`, frame Story and confirmation. [Asset provenance](artifacts/create-polish/ASSETS.md) records exact prompts/hashes. They are fictional scenery outside the accessibility reading order, not user campaign media or factual evidence; no draft/ad field is automatically populated. App surfaces retain neutral black/charcoal Dark and near-white Light.

Profile/Edit Profile now support deliberately selected photo add/change/remove with busy/cancel/error feedback. POST `/me/avatar` accepts a still JPEG/PNG/WebP up to 8MB and 25 megapixels, validates actual content, applies EXIF orientation, bounds to 512×512, flattens transparency and re-encodes fresh JPEG without original metadata. Migration `005_profile_avatars.sql` stores one BLOB per bearer owner; atomic replacement/removal does not touch public uploads or other users. GET/POST/DELETE return `{version,dataUri}` under no-store/Vary Authorization, with no user/path selector. Photos are private to account views and do not become public creator avatars. No portrait is fabricated or selected automatically. The picker may create a temporary crop file; app photo data is otherwise held in scoped memory, not durable client storage.

Four new API tests cover auth/ownership including reviewer separation, nonpublic storage, content/size/metadata validation, invalid-upload preservation, replacement/removal and persistence after app-factory restart. The mobile transport regression checks late-picker session invalidation. The backend's 35/35 test result (13.323s) was observed in completed tool output, not saved as a standalone log; no later backend rerun is claimed. Its sandbox event-loop socket stall was resolved for the isolated test by bounded escalation. Final mobile tests are 64/64 in [898.9374ms](artifacts/create-polish/pass6/frontend.log), including the new confirmation-route regression; TypeScript/ESLint exit 0.

**Final snapshot:** [72-input pass6 source](artifacts/create-polish/pass6/SOURCE_INPUTS.json), digest `aaf7b4df0713749a7ff5c7ea0997ce7f05760e49ed53f592f1e3992283436a4b`; [13-input backend](artifacts/create-polish/pass6/BACKEND_INPUTS.json), digest `622e55ee66c0872fb4a6e0a7d1f48b873e9ad0dd145fc6693b4a3d2eaa8bdecf`. [Independent inspection](artifacts/create-polish/pass6/BUILD_INSPECTION.json) verifies frozen/compiled sources, art/fonts/licenses, ARM64/Hermes, Debug signing and exact `http://127.0.0.1:8787` assignment. [APK](artifacts/android/create-polish-pass6-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk): 45,035,820 bytes, SHA-256 `383F23C2945B052AE4E8DA6482632AADF0146DB08D3702D4959C180322D69184`. [Exact phone proof](artifacts/create-polish/pass6/METRO_OFF.json) records install Success, Metro absent, healthy API, selected-phone reverse and cold launch 1,483ms/wait 1,490ms.

**Native scope:** pass3 records Story order/format/source, separate native cover/ad upload, Reach and explicit $13.25 goal across checked navigation/appearances. Photo captures [23](artifacts/create-polish/pass3/23-edit-profile-photo-dark.png)–[28](artifacts/create-polish/pass3/28-profile-photo-cancel-preserved-dark.png) show removal, crop, add, change and cancellation preservation. Pass5 retains that draft through update/cold launch, demonstrates both preview modes, complete policies/consent and submission for review, and checks selected font 1.3 Basics Dark/Profile Light. Compact upload feedback clears on step change, summary actions measure 48dp, and progress distinguishes 32-unit active from 24-unit inactive markers.

Pass5's new View Campaign action exposed an invalid route after the successful $13.25 submission. Pass6 reuses `detailPath`; actual [confirmation](artifacts/create-polish/pass6/03-route-submitted-dark.png) → [detail](artifacts/create-polish/pass6/04-view-campaign-fixed-dark.png) now opens a separate submitted $2.50 QA fixture with backing closed, without publication or advertising. Pass6 also checks Explore, a contribution quote (not a new payment), Activity/context destination and [persistent photo](artifacts/create-polish/pass6/09-photo-persisted-final-dark.png). The full pass3/pass5 matrix is not described as a complete pass6 rerun.

**Review and limits:** [Native results](artifacts/create-polish/NATIVE_RESULTS.md) record the complete scoped matrix. [FINISH_REVIEW](artifacts/create-polish/FINISH_REVIEW.md) returns bounded `ship`, closing all its P0/P1/P2 findings. Straight connectors/plain decorative quote lettering and spare IME footer space remain P3 notes. [Final diagnostics](artifacts/create-polish/pass6/FINAL_DIAGNOSTICS.json) contain no matching fatal entries in a two-line current-process sample (vendor warning); package exits are updates/intentional stops. Frames: 84/2,920 janky (2.88%), p95 17ms/p99 34ms; [eight tab switches](artifacts/create-polish/pass6/NAVIGATION_FRAME_SAMPLE.json) add 18/265 (6.79%). These bounded samples do not guarantee crash freedom or sustained smoothness. [Restoration](artifacts/create-polish/pass6/SERVICES_RESTORED.json) confirms API healthy, preview running, original font 1.17 and Dark Create entry. TalkBack/human testing, more devices/orientations, release signing/hosting and the held video remain open. Existing records/data are preserved; no recording, unrelated project or device action is implied.


## 23. Quick notifications and complete Activity

The later premium-notifications directive refines existing PDF pp.18–19 functionality without replacing its backend. Home's bell opens `features/notifications/NotificationSheet.tsx`; it no longer changes to Activity. The native Modal shows `recentNotifications`' newest five recipient-owned events, actual unread count, contextual icons, campaign context, short descriptions and relative timestamps. Read controls, refresh and Mark all as read remain above the persistent View all activity action. Activity retains its virtualized chronological SectionList, Today/Yesterday/Earlier grouping, All/Updates/Contributions/Unread/Account filters, followed campaigns, preferences and contextual destinations. Both consume `NotificationRow.tsx`; it uses dividers and compact type instead of repeated bordered cards. The existing API returns up to 300 newest events; “full history” means that existing available feed, not newly added unlimited pagination.

`useActivity` keeps the sole notification records/read state in `['activity', user.id]`. Disabled/guest reads do not issue private GETs; results require the captured API session to remain current. Background refresh merges confirmed read states so an older GET cannot restore an unread badge. `state.ts` is a shared in-flight request coordinator, not a second notification store: a WeakMap keyed by QueryClient supplies the same coordinator to both views, guards the API session epoch, deduplicates individual reads and limits existing POST `/activity/{id}/read` concurrency to 3. Batch reads capture the current unread IDs once, leave later arrivals unread and keep successful writes if some fail. Errors and pending indicators are shared; late operations cannot recreate a cleared query or affect a later identity, including reauthentication to the same account. Existing provider sign-out clears private queries. No endpoint, migration, preference rule or financial/review business logic changed.

The existing `notificationAction` routes remain authoritative: campaign details, creator correction context, owned receipt/history, report/progress or account settings. Opening starts a read request without waiting; the quick sheet finishes dismissal before routing and rechecks its captured session. Home scroll/navigation stays mounted. Native Close, backdrop, Android Back, long downward drag, short-drag return and reopening pass on final pass5; contextual campaign navigation removes the overlay and Home bounds remain identical. The stable responder claims header starts through bubbling so enabled child buttons retain taps. Shared Light/Dark/System tokens and insets remain; reduced-motion source uses zero-duration transitions, with native open/Back under zero transition setting and restoration recorded. Failure feedback remains outside scrolling. Pass5 fits short feeds to content with a shrinking scroll region and capped height.

**Final checkpoint — VERIFIED within recorded local scope:** [78-input pass5 freeze](artifacts/notification-center/pass5/SOURCE_INPUTS.json), digest `4ce5ef5d69ec022ec40ffe5e4eb29ea0af3e8ee02cd51d05a06fd8dff1d06535`; [81/81 frontend tests](artifacts/notification-center/pass5/frontend.log) in 898.5777ms; TypeScript/ESLint/diff exit 0. [Final source verification](artifacts/notification-center/pass5/SOURCE_VERIFICATION.json) shows zero drift for mobile and unchanged 13-input backend `622e55ee66c0872fb4a6e0a7d1f48b873e9ad0dd145fc6693b4a3d2eaa8bdecf`, with the original PDF hash unchanged. The [current-task API log](artifacts/notification-center/checks/backend.log) is 35/35 in 13.391s. [Strict binary inspection](artifacts/notification-center/pass5/BUILD_INSPECTION.json) passes 40 compiled modules, assets/fonts/licenses, ARM64/Hermes, Debug signing and exact USB-local API initialization. [APK](artifacts/android/notifications-pass5-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk) is 45,050,500 bytes/SHA-256 `430E65719BA17029B8C62B9AE4D6707D1EB502E9336A0B5B27738468322BDEB3`. [Exact installed proof](artifacts/notification-center/pass5/METRO_OFF.json) records compatible update/no data reset, Metro absent, API healthy and cold 1,189ms/wait 1,211ms on the authorized POCO Android15/ARM64.

Pass2 physical POCO captures retain shared counts 22→21→20, the owned receipt, View all Activity, filters/preferences, stale refresh/recovery and 360dp/font 1.3 Light. Its failed swipe and scrolled-away error retain their original failed scope. Pass3 [dismissal checks](artifacts/notification-center/pass3/DISMISSAL_CHECKS.json) pass swipe-down, short-drag return, Close, Android Back, backdrop and reopening. [Batch proof](artifacts/notification-center/pass3/OFFLINE_MUTATION_CHECK.json) starts with 19 unread, saves 3 and retains 16 failed/unread; healthy refresh confirms 16 and retry reaches 0 in both views. [Home state](artifacts/notification-center/pass3/HOME_STATE_CHECK.json) remains mounted/touchable. [Display/motion](artifacts/notification-center/pass3/DISPLAY_MOTION_CHECK.json) covers 360dp/font 1.3 Dark and zero-transition functional opening/Back, restoring original display/font 1.17/transition 0.5; it does not measure animation duration. [Guest/account proof](artifacts/notification-center/pass3/GUEST_ACCOUNT_CHECK.json) shows sign-out removes private feed/badges, guest-sheet Sign in reaches auth, and a separately registered fictional B sees only its own Account created event. Pass4's cold launch is 1,104ms; its verbose-error correction is source-checked, not a complete repeated matrix. Pass5 additionally removes fixed height for low-volume feeds and permits the scroll list to shrink within the cap. Final pass5 [read-failure proof](artifacts/notification-center/pass5/OFFLINE_READ_CHECK.json) confirms the compact singular message, retained unread and omitted transport prose; retry saves it. [Account recovery](artifacts/notification-center/pass5/ACCOUNT_RECOVERY_CHECK.json) verifies B read 0→guest privacy→A native sign-in/history, excluding B's event from A's recent five and retaining A's real new-sign-in event. The [final interactions](artifacts/notification-center/pass5/FINAL_INTERACTIONS.json) repeat all dismissal/reopen paths, Home bounds/touchability, contextual campaign navigation and the zero-transition functional check. Final pictures 07–11 retain five-event scrolling/Light Activity; 12–15 capture Dark sheet/context/Activity/Home. Earlier whole matrices were not repeated wholesale on pass5; a native zero-record inbox was not manufactured (Unread empty is native, zero-record layout is source-inspected).

The [bounded finish review](artifacts/notification-center/FINISH_REVIEW.md) returns `ship`, resolving the P1 swipe and P2 excessive failure copy/low-volume empty height; no actionable P0/P1/P2 visual finding remains in its supplied matrix. [Current-PID diagnostics](artifacts/notification-center/pass5/FINAL_DIAGNOSTICS.json) record 208 lines, no matching fatal and 243/3,904 janky frames(6.22%), p95=17ms/p99=65ms during mixed QA. A separate [eight-transition Home↔Activity sample](artifacts/notification-center/pass5/NAVIGATION_FRAME_SAMPLE.json) adds 22/390 janky frames (5.64%). These are limited logs/frame samples, not crash-free or sustained-smoothness guarantees. [Restoration](artifacts/notification-center/pass5/SERVICES_RESTORED.json) confirms API healthy, Metro running, selected-phone USB 8787, original 1080×2400/density 440/font 1.17/keyboard 1/transition 0.5 and Dark Home. Human/TalkBack, landscape/more hardware, sustained performance, production signing/hosting and the held video remain separate. No recording or unrelated device/project action occurred.


## 24. Targeted premium correction and supplied Campaign branding

**Current premium pass12 — VERIFIED within the recorded local scope:** [Fresh source gates](artifacts/premium-quality/pass12/SOURCE_CHECKS.json) pass **91/91 in 1044.901ms**, TypeScript/full-source ESLint/diff/public Expo config. [Strict inspection](artifacts/premium-quality/pass12/BUILD_INSPECTION.json) binds **86 inputs / 45 compiled modules / six artworks / 15 native branding resources** to the **48,623,759-byte APK**, SHA `DF4C95CB9F6555DE6E5637DCF18989B7E41042E0D978F7F908EFA0697FDAEDF9`. The installed package hash matches. [Actual Metro-off launch](artifacts/premium-quality/pass12/METRO_OFF.json) is **COLD 1,418ms / wait 1,431ms**, with preserved data and a separately healthy USB-local API. [Independent finish review](artifacts/premium-quality/FINISH_REVIEW.md) closes the opened Home/Auth/keyboard findings. Earlier matrices retain [their exact scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json); no whole-app final-hash rerun or human/production acceptance is inferred. Recording/external release stay held.

The final premium-quality brief preserves the approved mint/neutral-black identity and working product. The later Home-only PNG supersedes earlier paired-header actions: Campaign label, 22/26 Good ideas deserve to be heard headline, short Search campaigns… field/equal-height filter action, categories and In the spotlight. Home-specific SpotlightCard retains 140-unit top-biased ocean cover, exact unchanged raster, compact Featured · demo badge, separated category/creator, full 17/22 title, real funding/stats and lifecycle-correct 48-unit action. Explicit `height: undefined` clears React Native static-image intrinsic height before its native aspect ratio determines the top-clipped image. Other campaign covers stay intact. Search/filters/See all retain discovery; the prompt strip routes to Create and stacks at width<370/fontScale≥1.25. Full advertising-purpose explanation and configured uncertain $1 reach example remain below the feed.

The shared 16-unit badge shows 99+ visually while parents announce full synchronized counts. NotificationRow conditionally discloses full copy only when natural-line measurement proves truncation; permissions/cache/read/navigation remain shared. Create keeps five icons, compact Save Draft/icon Preview and save status, with adaptive 108–124-unit summary labels. Explore uses the existing bounded six-row/batch FlatList and real filters. Backing keeps its compact footer and complete scrollable policies. Shared Stats places labels below full-width icon/value rows, preserving fonts/tabular values and full accessible labels. Backend/business/financial rules remain unchanged.

`features/Brand.tsx` now uses `campaign-megaphone-transparent.png` for Auth: 70-unit horizontal Welcome icon, 60-unit compact form icon, native Campaign text and tagline in both themes. The original complete poster remains unchanged for full-artwork, launcher and splash use. The transparent extraction is a separate 1254×1254 RGBA PNG, 622,358 bytes, SHA `F6DA62459FD81DD47DA127B3FA2892CE0855A703A2A76652FC5642EF0F2F6395`. [Extraction provenance](artifacts/premium-quality/brand-extraction/PROVENANCE.json) records built-in image-generation background removal and its limits: this is a synthesized extraction, not a byte/pixel-identical cutout. The original poster remains SHA `C88BA8F63DE5C155664591DA81EB9C146FCAA92C3913323974D3577E174031F3`; whole-poster icon/favicon/black 160-unit contained splash configuration is unchanged. No Python raster editing, generic replacement logo or monochrome asset was introduced. Actual pass12 normal/compact Light/Dark rendering is included in the independent bounded review; no pixel-identical extraction claim is made.

The later Onboarding reference and Auth-polish steering govern Welcome and Sign In. Welcome uses horizontal branding, a 28/34 headline, amplification explanation, three manually selected landscape slides and filled/outlined entry actions. Its image is 176 units on narrow/short/enlarged-text windows and 190 otherwise. Login/Register use compact centered branding, a 24/30 heading, 64-unit icon/label/input cards and a 50-unit primary action. Actual email/password/name validation, secure/reveal control, keyboard Next/Go, API errors and busy feedback remain. Remember me is functional and initially unchecked. Guest browsing, mounted Help form state and focus-scoped Android Back remain. The guest Profile auth surface hides its tab bar while retaining all five registered destinations. Auth no longer contains a theme picker or recovery button; a static sentence truthfully explains unavailable local password recovery. Appearance remains available through existing Help/Profile settings.

The later explicit Dark-default instruction supersedes the former System fallback. The same device-scoped `campaign:appearance:v1` store now starts/restores Dark only when its saved preference is absent, invalid or unreadable. Existing explicit Light, Dark and System values are preserved; System still follows live OS changes. Signed-in Profile/Settings and guest Help retain all three choices, independently of identity and drafts. No Auth-only theme store or forced overwrite is added. ThemeProvider remains above session/query/navigation; changes and sign-out preserve forms, filters, checkout and the device preference. Tests cover missing/invalid-preference Dark fallback. Actual pass11 System switching and pass12 preference/account restart preserve existing choices; no fresh-install test or user-data clearing is claimed.

**Optional login persistence:** `login(email,password,remember = true)` preserves existing callers; the new checkbox starts unchecked and passes explicitly. Unchecked login removes any prior persisted session before publishing the new memory-only token/user; process restart returns to guest and retains drafts. Checked login and registration preserve existing SecureStore persistence (AsyncStorage on web). Serialized writes and authentication/API-session guards suppress obsolete commits and prevent late logout/expiry/storage cleanup crossing a new identity. Storage failure is actionable and does not publish the new identity. Eight meaningful new storage/provider tests cover save/remove, retry/failure, stale transactions, process-like restoration and logout races; no token-format/API/business-rule change.

Android Auth keeps the guest Screen’s extra height avoidance disabled and measures only native IME overlap at the stable AuthBackdrop outer view. The bottom inset is the maximum of safe-area padding and actual overlap; an already-resized window adds no duplicate height. Frame revisions and focus/active guards reject stale async measurements, hide/blur clears overlap and layout changes remeasure. Android drags/taps keep the keyboard open while the form scrolls; Help explicitly dismisses it and restores the usual Screen avoidance for Help fields. iOS keeps its existing behavior. Actual pass12 screenshots/AUTH_FUNCTIONAL.json verify focused fields and complete primary actions with IME, including compact Login/Register in both themes.

The unchanged 13-input backend digest `622e55ee66c0872fb4a6e0a7d1f48b873e9ad0dd145fc6693b4a3d2eaa8bdecf` retains this task’s [35/35 isolated tests in 14.300s](artifacts/premium-quality/pass1/BACKEND_CHECKS.json). Unchanged dependencies retain pass1 online Expo/Doctor 20/20 evidence; the later offline dependency check warns its validation is unreliable. No unnecessary API/online-metadata rerun, dependency, migration or build-command change is claimed. Binary inspection verifies Hermes, real USB-local API assignment, ARM64-only, Debug-v2/non-debuggable, assets/fonts/licenses and pre-build freezes; it does not establish installed behavior.

[Candidate scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json) retain every freeze, exact diff, build and physical matrix under its own hash. Pass1 covers creation; pass2 connected discovery/backing/Activity/report workflows; pass6 closes Home/compact Stats; pass7 proves optional Remember restart; pass9 captures the transparent-brand Auth composition; pass10 proves actual registration/isolation/restart; pass11 retains System/form checks. Pass3 was built but neither installed nor strictly inspected; pass5 built/inspected but never installed; pass8 was superseded unbuilt. Nine Create files remain source-identical from pass1, Home/Spotlight/Stats/Explore from pass6 and Session/writer from pass7, while later Screen/Auth/Profile keyboard changes are explicitly listed. This is source binding and bounded native evidence, not a wholesale final-hash rerun.

[Pass12 native actions](artifacts/premium-quality/pass12/AUTH_FUNCTIONAL.json) verify full Login/Register buttons while the IME remains open in all four compact Light/Dark combinations, plus normal Dark Login; measured targets are 49.82–50.18dp. The native Register button surfaces invalid-email feedback. Guest browsing opens the five-tab public app and hides private notifications. Unchecked login returns to guest after process restart; checked login restores the original account/photo and 10/3/1 private counts. Inline mode links, hardware/header Back, Help/form preservation and saved draft-library access work. The held Ocean awareness preview QA draft was viewed without editing/submission. System preference and account restore through restart; Dark/original display are restored afterward. Exact captures 00–33 remain under pass12, with registration/isolation and live System follow-up also retaining their earlier pass10/11 scopes.

[Final diagnostics](artifacts/premium-quality/pass12/FINAL_DIAGNOSTICS.json) record 46 current-PID log lines with no matching fatal/JS error markers and confirm the installed APK hash. Package-specific exit/memory/frame captures remain bounded observations, not crash-free or sustained-performance guarantees. Original 1080×2400/density 440/font 1.17/IME 1/night mode and animation 0.5 values are restored. [Service restoration](artifacts/premium-quality/pass12/SERVICES_RESTORED.json) confirms the same Campaign API healthy and owned Metro 8081 running again, with only the selected phone’s USB 8787 reverse; an initial bounded health timeout resolved without duplicate restart. No unrelated device/service or recording action is implied.

The final review is bounded to actual opened captures and recorded interactions. Compact submission confirmation remains explicitly unverified. Human/TalkBack, additional hardware/orientations, fresh-install default behavior and sustained smoothness remain separate; preserved existing Light/System preferences are verified without clearing user data. Password recovery is truthfully unavailable locally. Production signing/hosting, current Telegram cutoff confirmation, the held video and external submission remain open or held. USB-local backend reachability is not hosted availability; no score or fictional engine verdict is used.
