# Campaign Amplification Hackathon: project context

Initialization baseline date: October 15, 2026. Primary agent: OpenAI Codex. Authoritative workspace: `E:\Campaign` (user-confirmed). Current phase: complete native redesign, Android acceptance and local delivery. The latest October 16 attached directive authorizes local embedded-JavaScript INTERNAL-TEST APK preparation and full demo production; cloud accounts/hosting remain deferred. Sections 18-20 describe current architecture/direction; [PROGRESS.md](PROGRESS.md), [REQUIREMENTS.md](REQUIREMENTS.md) and [RELEASE_READINESS.md](RELEASE_READINESS.md) contain live evidence. Earlier debug-only/stopped-device descriptions are historical where the active records supersede them.

Read [AGENTS.md](AGENTS.md) and [INIT.md](INIT.md) before development. Product requirements below come from [Hackathon_Requirements.pdf](Hackathon_Requirements.pdf), unless explicitly labelled otherwise. All PDF page references use the document's printed pages, 1-25. Proposed designs describe future work, not existing functionality.

**Latest authorized task:** source-only GitHub backup to the user's existing private `Campaign` repository. This is independent of deferred hosting/release work and does not authorize application changes, a new repository, history replacement, force-push or automated deployments. [Backup boundaries](docs/GITHUB_BACKUP.md) and [PROGRESS.md](PROGRESS.md) track authentication, preserved history and actual remote verification. Organizer material, credentials, local data and generated artifacts remain local.

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
| User decisions | Initialization completed, then development was authorized. The latest October16 directive authorizes a full native redesign, local embedded-JS INTERNAL-TEST builds and complete demo production, with routine choices delegated. Expo/EAS accounts and hosting remain deferred; free-only preference retained. Monday evening October19 target, strict ERP separation and `E:\Campaign` remain confirmed. |
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

**Known risks:** no application/toolchain/provider has been configured; APK signing/build service access and Android test-device availability are unknown; cloud/network access may be constrained; persistent drafts/media handling and review-safe revisions need coherent backend design; payment reconciliation and report provenance must remain consistent; numeric demo policy choices and review-scope wording require clear decisions. Surface any requirement at risk with owner/next action/evidence in future progress notes. Do not claim the dated plan guarantees completion or silently drop scope.

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
| D15 / 2026-10-16 | Contemporary civic publication with bundled Manrope/Newsreader, ultramarine actions, warm paper, photography and compact utility screens | Explicit user request for a complete native redesign; screenshot audit exposed oversized functional layouts | Pure editorial and consumer-finance directions considered; civic direction combines story character and operational clarity | Supersedes D13 visual choices while preserving APIs, architecture, exact five-step flow and financial rules; DESIGN.md is the implemented visual contract | IMPLEMENTED; current native acceptance in PROGRESS.md |
| D16 / 2026-10-16 | Local INTERNAL-TEST release variant with embedded JS and Android Debug certificate | Latest directive authorizes safe standalone-build investigation without waiting for EAS | Existing Metro-dependent debug APKs remain preserved; no production signing or invented hosted URL | Gated CNG HTTP plugin supports the explicitly local demo API; build launcher verifies bundle, fonts and signing; runtime Metro/backend acceptance tracked separately | IMPLEMENTED configuration; actual artifact acceptance in RELEASE_READINESS.md |

## 15. Actual project status

**Current phase:** the local native redesign, targeted corrections, internal artifacts and complete demo are accepted in their recorded scopes. Both final INTERNAL-TEST APKs are built; x86_64 installed Metro-independent acceptance passes on Android 16/API 36. The complete 22-scene native video passes full decode, continuous muted playback and bounded frame/privacy review. Cloud accounts and hosting remain deferred; current evidence and precise limits are in the active matrix and release readiness.

**Existing files/configuration:** original PDF and preserved initialization records; active requirements/progress; shared Expo source, bundled licensed fonts, local CNG plugin/configuration, session/draft state and tests; one FastAPI/SQLite API with migrations, uploads and cached licensed seed assets; design system/audit, release/demo evidence and guides; isolated Android SDK/JDK/Gradle/emulator tools; preserved debug APKs and distinct final ARM64/x86_64 INTERNAL-TEST APKs. Test helpers under tmp remain non-product artifacts.

**Historical initialization evidence (before development):** resolved root verified; macOS-path mismatch corrected with explicit user confirmation; all 25 PDF pages reread; reference homepage product understanding retained with audit limits recorded; agent/startup/product context files created with traceability, proposed architecture and accurate unimplemented statuses. At that stage, documentation checks confirmed all three files existed, startup references resolved, context sections ran from 1 through 17, all 58 baseline requirement IDs had valid classifications/page ranges and NOT STARTED implementation/verification statuses, local Markdown links resolved, and the original PDF hash was unchanged. That initialization-only inventory contained the PDF, pre-existing review directory and three requested documents; no application tests or builds had yet run. Subsequent authorized implementation and actual checks are recorded above and in the active evidence files.

**Outstanding verification/delivery:** exact evidence is in PROGRESS.md, REQUIREMENTS.md and RELEASE_READINESS.md. Backend 30/frontend 34, TypeScript, lint, Doctor 20 and exports pass. Native redesign captures, seven independently scored fixes, archived initial-build four non-success outcomes and final internal cold launch/offline/save/large-text checkout pass in their recorded scopes. The [complete final-build native journey](artifacts/demo/NATIVE_RESULTS.md) covers one ordinary account creating and backing the same campaign and separate restricted native review/publication/preparation/promotion/completion. Its $10 report balances the $0.50 fee, $9.02 spend and $0.48 refund; measured reach remains unavailable. The [complete native video](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) plays to its 580.121354-second end without a media error; [bounded review](artifacts/demo/VIDEO_REVIEW.md) and [player proof](artifacts/demo/PLAYBACK_RESULTS.json) state the exact scope. [Native cleanup](artifacts/demo/cleanup/README.md) passed; API/Metro are healthy and the owned AVD/ADB/player stopped. ARM64 installation, physical devices, screen-reader use, human comprehension/listening and public judging connectivity remain unverified. Live AI/voice/advertising retain the permitted fallback/simulation boundaries.

**Known blockers/unknowns:** cloud credentials are unnecessary for the controlled local demo. EAS is signed out and hosting is unconfigured/deferred. Final x86_64 INTERNAL-TEST does not require Metro; it still needs its separately reachable API. ARM64 has the same embedded bytecode but no installed proof. Physical-device/firewall/LAN reachability, production signing, screen-reader/human testing and conditional TestFlight remain separate. Dependency audit/unlisted-media boundaries remain documented; no production-security claim is made. The reported Telegram cutoff/timezone remain unconfirmed.

**Isolation:** initialization authored only its three requested Markdown files. The subsequent authorized development work remains under E:\Campaign, with ordinary system toolchain/package-cache use permitted by the master directive. No ERP files, source, databases, containers, credentials or settings were accessed or changed; its exclusion path was not inspected. The original PDF remains unchanged.

**Next action:** preserve the accepted local source/artifacts. When the user resumes external release work, test the ARM64 artifact on a physical phone with a reachable API, perform human comprehension/listening/screen-reader checks, arrange the free-only backend/signing setup and confirm the Telegram cutoff before separately authorized submission. Existing unlisted draft-media and upstream dependency findings remain production review items. A local internal test artifact is not an organizer-accessible release.

## 16. Delivery requirements

**Confirmed PDF deliverables (pp. 23-24):**

- **Android APK:** submit an Android application build. A working source tree, web preview or uninstalled build job does not itself verify the final APK.
- **Demo video:** walk through the complete assignment and key user flows using actual implemented behavior.
- **iOS TestFlight:** p. 23 makes final-stage preparation conditional on a request; p. 24 asks to prepare/share if possible. Track this condition honestly instead of assuming it is already required or completed.
- **Submission channel:** Telegram group <https://t.me/+brkDpS8rYfBjNzll>; submit video, APK and any other required files/links there. Initialization does not authorize joining or sending messages/files; future submission requires user direction under applicable tool policies.
- **Code submission:** not required. Be ready to explain architecture and demonstrate implementation. Opportunities/certificates/prizes on pp. 24-25 do not introduce additional technical deliverables.

**Submission timing:** Monday, October 19, 2026 remains the working target (Asia/Calcutta planning context). The user's October 16 organizer-video summary reports a maximum Tuesday, October 20 at 11:59 AM. This maximum and its timezone are not independently confirmed: the official Telegram invite exposes no posts publicly. The PDF supplies no separate deadline. See REQUIREMENTS.md organizer alignment for provenance and follow-up.

**Delivery verification:** local APK hashes/build inspection, installed x86_64 Metro-off launch, complete native core journey, scoped error outcomes, final video playback/frame review and cleanup are now recorded in RELEASE_READINESS.md and the linked evidence. Recipient backend access, physical ARM64/human checks, conditional TestFlight and actual submission remain separate. Do not equate the completed local preparation with external delivery or claim checks that were not run.

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
12. The initialization-only boundary is complete. Current instructions authorize local implementation, dependencies, tests, redesign, INTERNAL-TEST builds and full demo production; cloud accounts/hosting remain deferred.

## 18. Implemented local architecture and continuation

- **Mobile source:** `apps/mobile/src/app/(tabs)` contains Home, nested Explore/detail/checkout/report, Create, Activity and Profile. Expo Router preserves the five tabs; non-route components and features stay outside the route directory.
- **Shared client boundaries:** `components/ui.tsx` provides tokens and reusable controls/states. `lib/api.ts` owns request auth/timeouts/errors and validated device-reachable media/API URLs; `lib/session.tsx` owns session restoration and TanStack Query invalidation. Explicit expiry clears durable/private identity, allowlisted public reads may retry as guests, writes never replay, and a late old-session response cannot clear a newer sign-in. Offline failures preserve saved identity/drafts; switching backends signs out. `lib/types.ts` centralizes types, supported categories and integer-cent quote previews. Server responses remain authoritative for transactions.
- **Creation:** `features/creation` owns validation, normalized editable payloads, scoped durable multi-draft storage and shared story/advertising/full previews. Guest transfer is explicit after sign-in. Automatic and manual saves preserve progress; submit is idempotent and requires the creator's goal/policy confirmation. Published and pending revisions stay separate.
- **Backend:** `services/api/main.py` implements validated authentication/profiles, campaigns/drafts/submission/reviews/transitions, tracking/preferences/activity/updates, uploads, payments/receipts/refunds and reports. `db.py` owns transactions, migrations, password/session/receipt primitives; `domain.py` owns content/policy validation; `seed.py` produces fictional coherent demo campaigns. See its README for exact contracts.
- **Persistence/permissions:** project-local SQLite uses relational identity/payment/event/ledger records and versioned campaign content snapshots. Ownership and reviewer roles are enforced server-side, privileged status/funding fields are not accepted from draft edits, and confirmed contributions/refunds reconcile transactionally. API JSON prevents private caching; private receipt capabilities are not logged. Images retain caching and unlisted public URIs; draft authenticated-media delivery is a documented production boundary.
- **Business states:** review, approval/publication, funding, preparation, promotion and completion remain separate. Funding cannot launch advertising. Material revisions require review and setup reconfirmation. Demo delivery records and refund calculations are coherent with successful simulated funds and never claim verified real-world delivery.
- **Run locally:** `start-local.cmd` verifies/reuses project listeners or starts hidden owned processes. Preview localhost:8081; API 127.0.0.1:8787. Per-process PowerShell invocations in README avoid changing the machine's global script policy. A physical device needs a reachable LAN API address; an emulator uses 10.0.2.2:8787.
- **Android:** Expo CNG generates native files; never hand-edit them. Package com.campaignamplification.mobile; app name Campaign. Camera/microphone permissions are blocked, keyboard resize configured, focused Back preserves editor state. `android-local.ps1` supports preserved Debug and distinct InternalTest release variants using isolated SDK/JDK17/Gradle and explicit ABI, restoring process variables. The internal flag permits local HTTP and exposes existing backend connection controls; full fonts/licenses and Hermes are byte-verified. Actual final x86_64 cold launch with Metro off and API reachable passes; ARM64 installation remains unverified. The emulator helper verifies only Campaign_API_36/dedicated ADB5039; its default Install still targets the debug APK, so use the explicit internal artifact for acceptance. Exact hashes/runtime scopes are in RELEASE_READINESS and ANDROID_LOCAL. Exports alone never establish installed acceptance.
- **Verification memory:** the active matrix and progress log record exact evidence and limits. Do not promote a parent requirement to VERIFIED based solely on static code, one screen or a partial test. Keep the original product specification and decision history while updating live evidence.

## 19. Organizer guidance alignment

The user supplied a 13-point summary of reviewed official video guidance on October 16. It supplements the original PDF; the actual video/transcript was not provided or independently watched in this session. Preserve the existing native app, design system, single audience/creator/backer account model, exact five-step workflow, transparent dummy backing and minimal restricted review. Real advertising and a larger admin platform remain outside scope. Mobile clarity, stability and Activity/Notifications receive extra attention, and the complete demo video is the first evaluation stage.

The alignment audit found Activity-specific gaps rather than a reason to restart: missing campaign context, identical followed links, generic destinations, a singular/plural payment-icon mismatch and read writes blocking navigation. The current refinement uses a virtualized chronological native inbox, explicit unread/category controls, shared unread badge, named followed campaigns and server-resolved safe destinations. Existing Profile settings handle payment/preference navigation; no separate end-user roles or parallel architecture were introduced. Notification destination metadata preserves legacy rows and resolves current permissions/approved public titles; preference updates merge transactionally. A native regression also exposed repeated correction links returning to creation entry; Create now consumes focused draft intents and saves/preserves the current device snapshot when switching or reopening. Actual tests/native acceptance and outstanding delivery limits belong in PROGRESS.md and REQUIREMENTS.md.

## 20. October 16 native redesign and local delivery

The user's later attached directive explicitly requests a major UI overhaul and complete feasible delivery work; the earlier Activity-only scope does not limit it. A recoverable source checkpoint precedes changes. Product Design screenshot-based audit and installed Impeccable native/Operate/craft guidance informed the implemented civic-publication direction. Impeccable context engine execution was unavailable; direct-context fallback and a fresh independent finish reviewer were used honestly. No Figma connection, generated comp, named engine success or design approval is claimed.

All major existing screens now use the shared Manrope/Newsreader system. Native first-pass evidence includes the exact five-step draft/resubmission, successful backing/receipt and completed report; targeted corrections address large-text header wrapping, scroll reset, checkout continuation, discovery density, input boundaries, report hierarchy and connected Refresh. `DESIGN.md` and its sidecar are source-derived documentation; no competing component framework or web-only architecture was introduced.

Local INTERNAL-TEST preparation is permitted under D16. EAS/cloud accounts and hosting remain deferred, free-only preference retained. Embedded JavaScript, Metro-independent installed launch and backend reachability are separate acceptance claims. The complete native journey/video now has actual encoded-frame and continuous muted playback evidence; human listening and every-frame privacy are not claimed. Current artifact/runtime/video evidence and precise remaining blockers live in PROGRESS.md, RELEASE_READINESS.md and DEMO_CHECKLIST.md.
