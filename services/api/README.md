# Campaign Amplification API

Cloud preparation retains FastAPI and local-default SQLite, adding versioned
PostgreSQL and authenticated Cloudinary media through the authorized API proxy.
Read the [runbook](../../docs/CLOUD_DEPLOYMENT.md),
[provider checks](../../docs/CLOUD_PROVIDERS.md),
[migration notes](migrations/postgres/README.md) and `.env.cloud.example`.
The user chose account connection later; no public service/persistence exists.
`run.py` supports hosting `PORT` and does not automatically load .env files.
Server credentials/private local records never enter the APK or public seeds.

Persistent FastAPI + SQLite prototype. Only project-local data is used. Payments, refunds, advertising, and delivery metrics are simulated; no real money moves and no ads are purchased. The PDF remains the product source of truth. SQLite is a prototype substitution for the PDF's suggested relational database; data relationships, migrations, foreign keys, transactions, and a separate payment ledger remain enforced.

## Run and test

From `E:\Campaign\services\api`:

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe run.py
```

The API listens on `0.0.0.0:8787`. Open `http://127.0.0.1:8787/docs` for generated endpoint schemas and `http://127.0.0.1:8787/health` for health. Android emulators use `http://10.0.2.2:8787`. The authorized physical POCO has been verified through a device-specific USB reverse using `http://127.0.0.1:8787`; see [Android local setup](../../docs/ANDROID_LOCAL.md) for the exact checkpoint and scope. Physical-device LAN access remains unverified.

```powershell
.venv/Scripts/python.exe -m unittest -v test_api
```

Tests use isolated SQLite files within `data/tests/`, exercised through HTTP TestClient. Behavioral tests cover auth/session storage, ownership, private JSON cache protection, persistent drafts/format/order, idempotent draft creation, stale writes, submission validation, corrections/resubmission/rejection, controlled public revisions, promoting-revision setup reconfirmation and paused progress, submission/publication timestamps, all payment outcomes, monetary precision, receipt privacy, concurrent idempotency, concurrent totals, lifecycle guards, partial funding, reports, refunds including 130-backers rounding reconciliation, highest-threshold milestone grouping, approaching/ended deadline notification deduplication, recipient isolation, concurrent preference merging/persistence, deterministic notification ordering/read persistence, reader-safe campaign identity and destinations, legacy/unavailable destination fallback, multiple-role deduplication, tracking, profile, public campaign updates/private history access, upload validation, and seeded discovery. They do not verify Android UI, APK installation, a live payment provider, or real advertising. FastAPI's current Starlette TestClient emits a deprecation warning for its httpx adapter; the tests pass with the pinned dependencies.

## State and credentials

The quality addendum adds ledger-derived report fields without a schema or accounting-policy change: `refundedFees`, `refundedAdvertising`, `retainedFees`, `remainingAdvertisingBudget`, `unspentBeforeRefund`, `refundPendingAmount`, `refundState` and `refundStatus`. Original raised/fees/allocation remain historical totals. Remaining advertising budget subtracts spend and completed advertising refunds; pre-refund unspent includes already-refunded advertising and is not additive. Pending refunds are separate from recorded completed refunds. The earlier 31-test checkpoint added failed-promotion net-refund conservation, full-refund fee reconciliation, no repeat zero-value pending refund, milestone report routing and a single contextual completion/report notification. Exact results are recorded in `PROGRESS.md`.

`data/campaign.db`, receipt-signing secret, and uploaded media persist locally. `migrations/*.sql` run once by numbered version. SQLite uses WAL, foreign keys, and `BEGIN IMMEDIATE` for accounting and state mutations. All money is stored as integer cents. Read context managers close connections explicitly, including on Windows.

On first run the reviewer account is provisioned. By default a random password is written only to ignored `.demo-credentials.json`; read this local file privately to sign in. Never copy it into the mobile app, logs, shared screenshots, source control, or public documentation. Alternatively set `CAMPAIGN_REVIEWER_EMAIL` and `CAMPAIGN_REVIEWER_PASSWORD` before the initial run (password minimum 12 characters). Changing these variables does not reset an existing account. Registration always grants `member`, never `reviewer`. Passwords use salted scrypt; seven-day bearer sessions are stored by SHA-256 digest. A session is invalidated by logout. The launcher disables HTTP access logs because query strings can contain private receipt capabilities; startup and application error logging remain available. Passwords/session tokens are not deliberately logged.

`CAMPAIGN_DB_PATH` may select another database **inside this service directory only**. `CAMPAIGN_HOST` and `CAMPAIGN_PORT` configure the listener. `CAMPAIGN_CORS_ORIGINS` defaults to localhost/127.0.0.1 port 8081 and localhost port 19006. This is a local prototype without production deployment, TLS termination, multi-instance rate limiting, email verification, account recovery, or a database backup service.

## Demo policy and limits

`GET /config` is the single API source for supported categories/channels/media, policies, currency, rates, and limits. Defaults are USD, a **5% platform fee deducted from the contribution**, no extra transaction fee, and **27 estimated people per net advertising dollar**. Configure `CAMPAIGN_DEMO_FEE_RATE` and `CAMPAIGN_DEMO_PEOPLE_PER_AD_DOLLAR` before creating a demonstration database. Payment records retain their original fee/reach snapshots; changing rates does not reprice past payments.

Goal: $0.01-$100,000; contribution: $1-$10,000; monetary precision: two decimals; duration: 1-90 days. These are labelled prototype policies, not organizer rules. Reach uses the same half-up rounded fee in cents for goals and payments, then floors the estimate from net cents. Report estimates derive the reconciled net ledger. Reach is uncertain and never guaranteed.

Cancellation/failure before promotion permits full simulated refunds (including fees) through `Cancelled/Failed -> Refund Pending -> Cancelled`. A completed advertising simulation spends 95% of its net budget and refunds the remaining 5% proportionally, with integer-cent remainder reconciliation. After promotion starts, only unspent net funds are refundable and the platform fee is retained. Reviewer partial-funding approval is required to distribute a positive underfunded budget after its actual deadline. A campaign with no successful funds cannot distribute. All policy text is returned by `/config` for disclosure before contribution/submission.

## API contract

JSON uses camelCase. Errors use FastAPI's `detail` string, field mapping, or validation list with HTTP 401/403/404/409/422 as appropriate. Protected calls use `Authorization: Bearer <session token>`.

JSON responses use `Cache-Control: no-store` and vary on Authorization, so owner drafts, private review/history/account data, and funding responses cannot be reused by an HTTP cache after sign-out or account/server switching. Public image assets retain their explicit cache policy. A stale/expired bearer token produces 401 rather than silently converting a protected write or payment to guest ownership; clients may clear an expired session and retry an appropriate public GET, while preserving strict authorization on private reads and all writes.

| Endpoint | Access | Response / behavior |
| --- | --- | --- |
| `GET /config`, `GET /health` | Public | Config and service status |
| `POST /auth/register` | Public | `{name,email,password}` -> `{token,user}`; role always member |
| `POST /auth/login` | Public | `{email,password}` -> `{token,user}` |
| `POST /auth/logout` | Session | Invalidates current bearer token |
| `GET /campaigns` | Public | `Campaign[]`; `q,category,sort,status,featured` filter actual records |
| `GET /campaigns/{id}` | Public / owner | Approved public version; owner/reviewer sees editable revision and private history |
| `POST /campaigns` | Session | Editable content + optional stable `clientDraftId` -> owner-scoped idempotent persisted Draft |
| `PUT /campaigns/{id}` | Creator owner | Merge editable fields, validate, increment version; optional `version` rejects stale writes |
| `POST /campaigns/{id}/revision` | Creator owner | Start/continue private material revision, preserving approved public snapshot |
| `POST /campaigns/{id}/submit` | Creator owner | `{rulesAccepted:true}`; validation -> Submitted for Review, idempotent for current submitted version |
| `GET /review-queue` | Reviewer | Submitted and non-Draft lifecycle records, including distribution controls |
| `POST /campaigns/{id}/review` | Reviewer | `{decision:'approve'|'changes'|'reject',feedback}`; feedback required for changes/rejection |
| `POST /campaigns/{id}/transition` | Reviewer | `{target,setupReady?,partialFundingApproved?,reason?}`; state/prerequisite guards |
| `POST /campaigns/{id}/progress` | Reviewer | One deterministic midpoint simulation; emits a deduplicated progress event |
| `POST /contributions` | Public / session | `{campaignId,amount,outcome,idempotencyKey}` -> payment result |
| `GET /receipts/{id}` | Backer / private capability | Successful simulated receipt only; owner session or `?token=<private token>` |
| `GET /me` | Session | `{user,campaigns,payments,saved:string[],followed:string[],preferences}` |
| `PUT /me` | Session | `{name}` -> updated user |
| `PUT /me/preferences` | Session | Nested category/delivery preferences; security/in-app required, push/email unavailable |
| `GET /activity` | Session | Recipient-scoped `Notification[]` |
| `POST /activity/{id}/read` | Recipient | Mark own notification read |
| `POST /campaigns/{id}/save`, `/follow` | Session | Toggle -> `{active:boolean}` |
| `GET /campaigns/{id}/report` | Campaign visibility | Funding accounting and explicit delivery availability/definitions |
| `GET /campaigns/{id}/updates` | Campaign visibility | `[{id,title,body,createdAt}]`; public for published campaigns, owner/reviewer only for private drafts |
| `GET /campaigns/{id}/history` | Owner/reviewer | Private audit events `[{id,type,previousState,newState,detail,createdAt,version}]` |
| `POST /campaigns/{id}/updates` | Owner/reviewer | `{title,body}` -> campaign update notification |
| `POST /campaigns/{id}/feedback` | Session | `{visuals,persuasion}` with No/Somewhat/Yes; private feedback |
| `POST /uploads` | Session | Multipart `file`, `purpose:cover|story|advertising` -> validated asset metadata |
| `GET /media/{filename}` | Owner/reviewer, or exact approved public snapshot reference | Private/no-store normalized JPEG; unpublished replacements remain private |

Campaign content fields: `title,category,creatorName,summary,coverImage,storyHeadline,intro,sections,sources,adImages,adHeadline,adDescription,cta,geography,interests,channels,allocation,durationDays,goal,currentStep`. `sections` preserve ordered `{id,kind,text,format,url,caption,credit}`. Kinds are text/heading/image/statistic/action; formats plain/normal/bold/italic/bullet. `sources` are ordered `{id,title,url}`. Channels are Instagram/Facebook/Display and selected allocations must total 100% at submission. The cover is optional. Media warnings are a client concern, not an invented mandatory upload count. Empty summary/story/sources are allowed; each source added must have a title and safe HTTP(S) URL. Titles are limited to 60 characters. Current step is 0-4. The creator sets the goal explicitly in the final step.

Returned campaigns also include `id,ownerId,status,campaignState,createdAt,submittedAt,publishedAt,updatedAt,deadline,raised,version,feedback,estimatedReach,revisionPending,setupReady,report,simulated:true`. `submittedAt` is the most recent submission event timestamp; `publishedAt` is the first transition to Available for Funding, with the creation timestamp used only for explicitly fictional seeded published snapshots. Unsubmitted drafts have null submission/publication timestamps. An owner/reviewer sees a pending revision status in `status`, while `campaignState` retains the public lifecycle state. Public queries return the approved snapshot and do not expose feedback/history or any payment/backer records. Publication locks goal and duration to preserve backer expectations. Approving a material revision preserves the live lifecycle state; pending revisions pause the prototype's distribution progress/completion mutations while the previously approved public snapshot remains readable. `setupReady` is a boolean, cleared by revision approval. A revision approved during promotion requires reviewer setup reconfirmation with `{target:'Promoting',setupReady:true}` before recording more progress or completion; this action is recorded in the private audit history. This is a controlled local simulation pause, not a claim about a live ad provider.

Lifecycle: Draft -> Submitted for Review -> Changes Requested / Approved / Rejected; Approved -> Available for Funding; verified successful simulated ledger -> Funding Goal Reached; actual deadline -> Funding Period Ends; reviewer -> Distribution Preparation -> Promoting (`setupReady:true`) -> Completed. Funding completion **never** starts advertising. Funding deadline reconciliation and approaching-deadline events happen on API discovery/detail/me/activity/contribution/transition reads; this prototype has no background job scheduler.

Payment response: `{id,campaignId,title,status,amount,fee,total,adBudget,reach,currency,simulated,createdAt,refunded,receipt}`. Outcomes are successful/pending/rejected/cancelled/failed. Only successful outcomes add a ledger entry. The dummy provider outcome selector is deliberately available for the assignment; it is not a real payment verification mechanism. Idempotency keys must be unpredictable UUIDs, 16-128 characters, reused after response loss; a replay with changed request data returns 409. Guest keys act as private recovery capabilities, so keep them secret. For success, `receipt` is `{id,url,token}`; the private token is HMAC-signed, stable across restart, and must never appear in a public share link. Failed/pending outcomes have no receipt. Private histories include all outcomes.

Report fields: `campaignId,status,simulated,raised,fees,allocated,spent,refunded,estimatedReach,measuredReach,simulatedReach,impressions,clicks,durationDays,final,available,provenance,definitions,contributionCount,backerActivity`; available delivery records also include `unspent,refundStatus,startedAt,completedAt`. `measuredReach` is always null because no real provider is connected. The count is successful contribution records, not verified unique people. `raised` preserves gross successful funds before refunds; `allocated` is original net advertising budget; `refunded` is a separate total. Never describe simulation figures as live verified statistics.

Notifications: `{id,title,body,category,campaignId,campaignTitle,destination,createdAt,read}`. `destination` is `{type:'campaign'|'creator'|'payments'|'report'|'profile',campaignId?:string,paymentId?:string}`. Submission/review notices resolve to `creator` only for the actual owner while the current draft/revision is Draft or Changes Requested; once it advances they resolve to a readable campaign. Funding/updates open the campaign, progress/completion/final-report notices open its report, payment/refund notices open private payment history, and security notices open profile settings. Payment identifiers are returned only to their owning account; no receipt tokens occur in notifications. `campaignTitle` uses the owner's editable identity or the approved public title for followers/backers, never a non-owner's private pending revision title. A campaign that is no longer readable has null campaign title/id and a safe profile destination. Existing records without metadata infer safe destinations from category/domain deduplication keys; migration004 preserves existing notifications and read state.

Preferences: `{categories:{campaigns:boolean,payments:boolean,security:true},delivery:{inApp:true,push:false,email:false}}`. Partial updates merge with the latest database values inside the write transaction, so simultaneous category changes are retained and persist across app/API restarts. Preferences control future supported notices; they do not erase earlier activity. Security and in-app delivery remain required; live push/email are unavailable. Payment/security events are recipient-only; campaign milestones/updates reach the creator, followers, and signed-in successful backers, without exposing backer identities. One person acting as creator, follower and backer receives one copy of each campaign event. A contribution emits only its highest newly crossed funding milestone, avoiding near-identical 25/50/75/100 notices after a single goal-reaching payment. Milestones, deadlines, report availability, and midpoint progress use deduplication keys. Activity orders newest timestamp first and newest insertion first for tied timestamps; read marking is recipient-only, idempotent and durable.

Uploads accept JPEG/PNG/WebP, at most 8 MiB and 25 megapixels, resized to maximum 3000 pixels per side and re-encoded to JPEG. Response: `{id,url,width,height,contentType,size,purpose}`. Unpublished images require the owner or reviewer. Only an exact approved public campaign snapshot permits public bytes; private replacements remain private until approval. Attachments require asset ownership. API media responses, including errors, are private/no-store and vary by authorization. Cloudinary objects use authenticated delivery; credentials and signed download URLs stay on the API. Native pictures attach bearer headers only to the exact API media path; web uses authorized temporary blobs. Local storage remains project-local. Video is unsupported; image generation, voice and AI retain labelled demo/manual fallbacks. Six fictional seed campaigns use bundled attributed stock photos served separately at `/seed-media/{name}`. Image references use the configured public HTTPS origin in cloud mode and the request base locally. Normal startup does not download photos; `download_seed_assets.py` is an optional development helper. General-context sources do not verify fictional stories, creators, funding or reports.

## Private profile photos

`GET /me/avatar`, multipart `POST /me/avatar` (`file`) and `DELETE /me/avatar` require the current bearer identity. There is no user-ID or filesystem-path selector. A new `005_profile_avatars.sql` migration stores one normalized JPEG BLOB per user, separate from the public campaign assets/uploads. Atomic replacement removes the previous row image; removal is idempotent. User metadata from sign-in, `/me` and profile edits includes nullable `avatarVersion`. Existing users/campaigns/payments are not changed by the migration.

Upload accepts still JPEG, PNG or WebP, at most 8 MB and 25 megapixels. The server validates decoded content, corrects EXIF orientation, bounds dimensions to 512 by 512, flattens transparency onto white and writes a fresh JPEG without EXIF/GPS/ICC/text metadata. Invalid, oversized or animated content leaves the existing photo intact. Original filenames, extra multipart user IDs and URLs never select another owner or storage path.

Photo endpoints return `{version,dataUri}` (both null when absent). The small private data URI travels through the existing authenticated JSON transport, with `Cache-Control: no-store` and `Vary: Authorization`. No public URL or bearer-bearing image URL is issued. The app holds downloaded photo bytes in account/server/version-scoped in-memory query data and native image state; it does not persist them to AsyncStorage or a shared image-file cache. The system picker may create its own temporary crop file. Signing out clears query data. A pending picker/upload completion cannot update a different or renewed session. Profile/Edit Profile provide choose/crop/change/remove, loading/cancel/error feedback and initials fallback. Photos appear only in these private account views, not public campaign creator avatars. The system picker needs the user's deliberate selection; no portrait is generated or chosen automatically.

Four API cases cover authentication/ownership (including reviewer separation), nonpublic storage, content validation, EXIF removal/orientation/resize, invalid-upload preservation, replacement/removal, session metadata and persistence across app-factory restart. The mobile transport test verifies invalidation after logout, renewed token and backend changes. The October 16 photo implementation passed all 35 API tests (13.323 seconds), all 63 mobile tests (531.6948 milliseconds), TypeScript and scoped ESLint. The Windows sandbox stalled Python's local event-loop socket creation before the first request; the bounded isolated API suite passed outside that sandbox. Source/API tests do not establish native picker, permission, crop, keyboard or on-device appearance acceptance; those require the new build and actual authorized phone QA.
