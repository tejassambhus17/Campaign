# Existing Free cloud rollout: trust and demo library

**Authorized cloud rollout completed on October17.** The reviewed backend-only
commit `cbd4f90d5108f40beb8474813cc42d475f095354` was fast-forwarded to the
existing private cloud branch and manually deployed to the same Render **Free**
service, with auto-deploy **off**. Deployment `dep-db9q15ijnfac73d7gu1g` became
live at16:22:32 UTC. Additive migration007 and the guarded fourteen-demo/twenty-
assessment apply completed; a real repeat inserted no campaigns or duplicate
publications. HTTPS verification passed **243/243 checks**. No provider settings,
secrets, billing, media adapter or existing application records were changed.

Current sanitized evidence is under
`artifacts/trust-release-20261017/cloud-rollout/`: `DEPLOY_SOURCE.json`,
`RENDER_DEPLOY.json`, `PRE_SEED_PRESERVATION.json`, `SEED_APPLIED.json` and
`HTTPS_VERIFICATION.json`. Final pre-native-QA `CLOUD_ACCEPTANCE.json` passed:
every original row in all13 tables was still exact after HTTPS verification.
`FINAL_SEED_DRY_RUN.json` reports0 inserts/conflicts/skipped edits and the same
post-apply digest as the actual idempotent rerun; new deadlines/publication times
were not extended. Native interaction and release APK acceptance remain separate
from cloud proof. Later isolated UI QA must be attributed after this baseline.

## Historical approved preparation and backup

After explicit human approval, automatic review accepted the protected read-only
preflight. Actual evidence is in
`artifacts/trust-release-20261017/cloud-rollout/READ_ONLY_PREFLIGHT.json`:

- At that pre-deployment snapshot, the existing service was **Free**, auto-deploy **off**, live on
  `e599f984…` / `dep-db9n37e1egvs73fsumfg`; repository/branch/origin match.
- Pre-deployment HTTPS health/config returned200; new rubric/assessment routes
  returned404. The later deployed endpoints now return200 with version-bound data.
- Production transaction confirms read-only mode, migrations1–6 and13 campaign
  rows. Six exact app-owned originals are eligible; seven other rows are kept.
  The real seed dry-run finds14 missing new IDs,20 eligible assessments and no
  conflicts/skipped edits. Migration007 remains the prerequisite, so pre-migration
  `canApply:false` is expected.
- `PUBLIC_BASELINE_COUNTS.json` derives actual public counts from the same
  protected snapshot without invoking GET reconciliation. Built-in coverage
  remains6 →20, two per category; other public records are counted separately.
- Owner/SYSTEM ACLs were applied before private writes and independently read
  back: no inherited/other access grants. The private row snapshot is109,116bytes,
  SHA256 `6ca483e03112c60823444491561aa6c9a4a88cdbe83687fa6aad386aff65d78c`.
- Custom-format `pg_dump` is54,291bytes, SHA256
  `ad45f322e9bbdbb6848fec22f39150bf06a684fb9bf025b74b80b8812ff1b970`.
  `pg_restore --list` succeeds. An actual fresh protected local cluster on
 127.0.0.1:15881 restored it and matched **all13 tables and every row/fingerprint**
  against that snapshot, including accounts/sessions, funding/ledger, private
  avatars and media metadata. `BACKUP_RESTORE.json` records the bounded proof.
  That exact owned cluster was stopped; existing QA/other clusters were untouched.

The local restoration first encountered inherited Windows pipe handles and then
an already-existing empty `public` schema. Those attempts were not passed checks.
Recovery used protected file handles, restarted only the newly owned cluster,
removed only its verified-empty local schema with RESTRICT, restored and compared
successfully, then stopped it. No production DDL or data restoration occurred.
Normal main HEAD/index and the cloud source branch remained unchanged.

The protected backup/preflight helper was prepared under ignored
`tmp/trust-release-20261017/prepare-cloud-rollout.py`. Automatic approval review
rejected its first attempted execution **before process start**, stating that
copying sensitive production records to a local snapshot required explicit
trusted user authorization. It was not retried through an indirect workaround;
the later accepted execution followed the human's explicit scope approval.
That preparation receipt alone is not deployment proof; use the later exact
deployment and HTTPS receipts for the completed rollout.

## Pinned existing target and current evidence

| Target | Value and evidence boundary |
| --- | --- |
| Repository | Existing private `tejassambhus17/Campaign` |
| Cloud source branch | `codex/cloud-deployment`; reviewed/live ref `cbd4f90d5108f40beb8474813cc42d475f095354`, parent `e599f984d43b8b109dff63504937c946400cbbad` |
| Existing Render service | `srv-db985h8pd3as73ba6h80`, `campaign-api`, Ohio |
| Existing HTTPS API | `https://campaign-api-cw8y.onrender.com` |
| Last verified live deployment | `dep-db9q15ijnfac73d7gu1g`, exact `cbd4f90…`, finished October17,16:22:32 UTC |
| Last verified service settings | Free plan; auto-deploy off; no environment/provider change |
| Database | User-supplied Neon project `dawn-lab-92471358`, organisation `org-patient-sound-11803564`, production branch, PostgreSQL only |
| Media | Existing authenticated Cloudinary adapter/configuration unchanged; new library stock files are committed server assets |

The original deployment receipt is
`artifacts/final-delivery-20261017/RENDER_DEPLOY.json`; the new authorized
`READ_ONLY_PREFLIGHT.json` independently rechecks the current exact service,
repository/branch/Free/off settings. Stop on a mismatch or any card/billing/upgrade request. Do not
create a second service, database, branch compute, disk, worker or paid CI job.

The earlier HTTPS preservation baseline recorded **8 public campaigns**, not
eight built-in seeds. Six known stable seeds are eligible for this task; the
others are preserved and never counted as seeds just because they are fictional
QA content. Fresh production counts are now recorded from the authorized
read-only snapshot and `PUBLIC_BASELINE_COUNTS.json`. An earlier attempt with
the web reader was inaccessible; that attempt supplied no HTTP-status/content
evidence and is superseded by the authorized preflight.

Read installed Neon/Neon Postgres guidance: preserve `psycopg`, use the existing
pooled URL for API traffic and direct URL for migrations/backup; no account or
architecture replacement. Source credentials stay in established ignored files.
No CLI initialization, secret regeneration or environment dump is needed.

## Exact reviewed source change

The backend-only commit used parent **e599f984…** and an alternate Git index.
Normal main HEAD, the user's normal index and all uncommitted frontend/signing
work were preserved. The explicit22-file allowlist, exact passing-test source
hashes, whitespace and credential exclusions passed review. It includes:

- `services/api/main.py`: register protected assessment routes and public
  transparency data; preserve existing tombstone-aware draft deletion,
  accounting, lifecycle and media permissions; narrow eight-file stock route.
- `services/api/assessments.py`: recorded, version-bound assessment logic and
  reviewer API, server-calculated anchored results, no new eligibility threshold.
- `services/api/migrations/007_assessments.sql` and its PostgreSQL counterpart.
- `services/api/demo_library.py`, `demo_library_v1.json`, and
  `download_library_assets.py` for reviewed explicit/idempotent tooling.
- Eight `services/api/assets/seed/library-v1/*.jpg` files plus media manifest.
- `test_assessments.py`, `test_demo_library.py`, changed `test_postgres.py` and
  the scoped rubric/demo/rollout documentation.

The machine-readable proposed allowlist and hashes are
`artifacts/trust-release-20261017/cloud-rollout/SOURCE_PLAN.json`. Regenerate it
only after code freezes; verify against the actual staged tree. The reviewed
candidate commit is **cbd4f90d5108f40beb8474813cc42d475f095354**. No mobile/signing files, APK, `.env`, local data, backup, credential,
toolchain or generated artifact belongs in this cloud commit. No dependency or
Render configuration change is required.

After permission and final tests, verify both remote branch and service still
point at the reviewed base. Fast-forward only the existing cloud branch; no
force-push, main checkout or history reset. Manually deploy that exact reviewed
commit to the same Free service. Keep auto-deploy off.

## Additive schema and exact data intent

Migration007 creates **two new tables**, `campaign_seed_registry` and
`campaign_assessments`, their constraints and **two explicit indexes**. Successful
application adds version7 to existing `schema_migrations`. It does not alter or
rewrite existing campaign/user/payment/ledger/media columns. The established
`Database.initialize()` migration transaction/advisory lock applies pending
versioned SQL on startup using the direct migration URL. Do not invoke it before
the approved deployment/migration step.

The local seed reproduction and later actual production dry-run/apply are
verified: original6 → built-in20, two per10 categories, fourteen inserts and
twenty individually explained illustrative assessments. Two additional existing
public campaigns remain preserved, making22 public records. The applied rules are:

1. Insert only absent IDs among the fourteen new manifest IDs.
2. Leave every existing campaign, working/public edit, status, goal, funding,
   contribution, receipt, deadline and upload untouched.
3. Register/assess only an exact stable ID with reserved fixture owner, actorless
   seed event and inspected matching public content. Changed content is skipped
   rather than auto-scored. Every seeded assessment remains prominently demo.
4. New demos start at `$0`, with no payment, ledger or invented backer records.
5. Add up to20 matching assessment records. Rerun reuses publications instead of
   changing timestamps or creating duplicates. Missing legacy originals are not
   reconstructed with fictional funding history.

The allowed new IDs are `demo_sleep`, `demo_move`, `demo_nightsky`,
`demo_libraries`, `demo_budget`, `demo_information`, `demo_inflation`, `demo_data`,
`demo_volunteer`, `demo_heritage`, `demo_offers`, `demo_repair`, `demo_privacy` and
`demo_sharing`. See `docs/DEMO_LIBRARY.md` for exact titles/sources/assessments.

## Protected read-only preparation after approval

The helper has no deploy, seed, migration, login or API-write operation. It first
creates task-local private backup storage, disables inherited permissions and
grants access to **only the current Windows owner and SYSTEM**, before writing
production rows. Failure to protect that folder blocks snapshot/backup writes.

It loads only established Campaign files in memory, validates matching existing
Neon pooled/direct URLs and TLS, and prints no values. Render requests are GETs
for the exact existing service/deploy metadata. PostgreSQL uses a direct
`REPEATABLE READ READ ONLY` transaction, confirms read-only mode, then reads the
application public schema and computes all-row table counts/fingerprints plus
the real seed plan. No `Database` or `create_app` object is constructed.

Raw rows—including credentials/password hashes, private drafts and session
records—are saved only under owner/SYSTEM-protected ignored:

`tmp/trust-release-20261017/private-backup/`

Sanitized artifacts contain table counts/aggregate SHA256, source IDs/titles that
are already public app-owned demos, prerequisite results and file checksums.
They contain no raw user rows, email addresses, passwords, session tokens,
receipt capabilities or password hashes. Private backups must never enter Git,
APK, Render assets, Cloudinary or chat.

```powershell
# Only after the consolidated human approval:
& '.\services\api\.venv\Scripts\python.exe' `
  '.\tmp\trust-release-20261017\prepare-cloud-rollout.py' --backup
```

The optional custom-format `pg_dump` uses the **existing project-local** tool
and direct connection. Host/user/database/password are passed in the child
process environment, never command arguments or shell history. It creates no
cloud resource. A local `pg_restore --list` checks the archive, but is not a full
restoration test. Before rollout, restore that dump into a new isolated local
database and prove expected tables/counts there; do not restore over production.

**GET is not always read-only here:** current `/campaigns`, campaign detail and
`/me` invoke existing `reconcile()`, which can create deadline status/events and
notifications. The strict preflight therefore does not call them. It reads
campaign baseline data with SQL SELECT instead. Safe HTTP preflight endpoints
are `/health`, `/config`, `/assessment-rubric` and the public assessment route;
the new endpoints may correctly return404 before deployment. Normal discovery/
old-client acceptance GETs are deferred to authorized post-rollout testing and
their normal deadline effects must be distinguished from seed writes.

Before migration, the production dry-run may report `assessmentSchemaReady:false`
and `canApply:false`. That is a prerequisite, not permission to migrate. After
approved migration/deploy, generate a **new** dry-run/digest because schema and
normal concurrent user activity change the plan. Apply must use the new reviewed
post-migration `planSHA256`; never reuse a pre-migration digest.

## Seed apply after deployment and reviewed dry-run

Using the established private environment mapped to `CAMPAIGN_DATABASE_URL`
(no credential values in the command), from `services/api`:

```powershell
.\.venv\Scripts\python.exe demo_library.py --configured-cloud --dry-run
# Review exact inserts/skips/conflicts/counts and the current planSHA256 first.
.\.venv\Scripts\python.exe demo_library.py --configured-cloud --apply `
  --confirm-manifest campaign-library-v1 --expected-plan-sha <reviewed-current-digest>
```

This CLI does not load `.env` or migrate. Root must use the approved secure
loader to populate only its child environment. It requires TLS and a validated
schema, takes the established application write lock and recalculates the entire
reviewed plan within the same transaction. A stale plan aborts before any insert.
No exposed seed endpoint or app-launch reseeding is added. Do not run old
deployment scripts unchanged: their assertions/log paths belong to earlier work.

## Verification and rollback

Before promotion, bind current passing backend SQLite and actual PostgreSQL,
frontend, TypeScript/lint and package tests to the exact source candidate. New
checks must cover old-client responses with additive fields, ordinary-user score
write denials, private-evidence protection, public/private revision binding,
publication without campaign/funding mutation, zero reconciled new funds,
category coverage and served media bytes. Local tests do not close cloud gates.

After rollout, verify the exact Render commit/Free/off settings; new HTTPS
rubric/assessment endpoints; all actual category counts; at least one concrete
new campaign search result per category; demo labels/provenance; static images;
score/hash binding; and preserved pre-existing row fingerprints. Recheck all
original payment/ledger/receipt/media/account data from the protected baseline.
Do not create a live reviewer decision/payment or mutate real user records just
to obtain evidence. Use disposable QA records only where explicitly authorized.
Document any normal concurrent user activity instead of treating every changed
aggregate fingerprint as evidence of seeding damage.

Rollback is **code-only and additive-schema-preserving**. Keep migration007,
registered content, assessments and any activity already accumulated. Returning
to the existing e599 source retains tombstone-aware draft handling and ignores
extra tables, but the new client must then show unavailable/retry states and
cannot be called ready. Prefer disabling the new UI/feature or deploying a
reviewed forward fix. Do not drop tables, delete seeded campaigns after activity,
remove contributions, restore the old whole production dump over newer writes,
reset secrets or remove draft-deletion tombstones. A destructive recovery needs
its own concrete approval and separate review.

Keep the old working APK. Build/verify the dedicated release-signed APK against
this HTTPS origin, and test the exact artifact only where signature compatibility
permits. The user's existing debug-signed phone app must not be uninstalled or
cleared to force the new signer. An APK is not release-ready until required live
endpoints/schema/data are verified. Recording, billing, Play publication and
organizer submission remain held.

## Consolidated approval granted before execution

> May I create an owner/SYSTEM-only local backup and read-only preservation
> snapshot of the existing Campaign Neon production data, push the reviewed
> backend-only commit to the existing private `codex/cloud-deployment` branch,
> manually deploy it to the same Render Free service with auto-deploy off,
> apply additive migration007, insert only the reviewed missing fourteen
> app-owned demos and up to twenty matching demo assessments, then verify HTTPS
> compatibility and preservation? Existing accounts, campaigns, drafts, funding,
> receipts, media, provider configuration and secrets will be preserved; no card,
> paid resource or new cloud service will be added.

Why approval was required: the current user brief, section11, requires consolidated
approval when a previous live deployment/migration/seed hold remains. Existing
AGENTS authorization permits only the earlier scoped draft-deletion deployment.
Automatic approval review also explicitly rejected the sensitive production
snapshot/backup, so the request includes that data-copy scope rather than hiding
it inside “read-only checks.”

The human explicitly approved this exact backup, reviewed backend-only push,
same-Free-service deploy, additive migration and guarded seed/preservation scope.
Routine execution then proceeded under that approval. The procedures above
remain a runbook, not instructions to replay an already-completed deployment or
reuse an old digest. Subsequent local documentation edits do not change the
deployed candidate; bind source checks to the committed tree and receipts.

## Local reviewer-credential incident boundary

An initial isolated seed test omitted explicit reviewer fixture environment and
the legacy helper wrote `services/api/.demo-credentials.json`, replacing the
local generated file. No real default SQLite reviewer row/password hash or cloud
secret was changed. Root verified that the new file does not authenticate the
existing local reviewer. The known `tmp/qa/demo-credentials.json` belongs to a
member account and is not a reviewer recovery copy; no matching known prior
credential-file backup was located in Campaign. Previous content cannot be
reconstructed from its password hash. No credential reset, cloud secret rotation,
new account or unrelated-project search was attempted. Preserve the incident
file; the default-local reviewer's lost generated password remains a documented
local limitation. Existing separately provisioned cloud reviewer credentials are
unaffected. All seed tests now supply isolated credentials and assert that the
shared credential writer is not called.
