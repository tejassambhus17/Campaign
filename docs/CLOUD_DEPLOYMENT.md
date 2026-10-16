# Campaign zero-cost deployment runbook

**October17 update:** the user has resumed guided Free account connection with
no credit card. The earlier deferral below is historical. Connection/provisioning
is IN PROGRESS; no actual account/resource/HTTPS/persistence result exists yet.
The human completes login, verification and terms directly. Keep all credentials
out of chat and grant GitHub access only to the Campaign repository.

## Current result: prepared locally; accounts intentionally pending

The October 16 cloud directive authorizes deployment engineering with a strict
₹0 budget. The user's subsequent answer is **“Prepare everything; I'll connect
accounts later.”** No cloud account, service, database, subscription, card, paid
trial or external deployment was created. There is no public backend URL or
cloud APK. Do not treat local PostgreSQL or mocked Cloudinary tests as hosted
persistence. Recording and organizer submission remain held.

The recoverable pre-change source is
`refs/checkpoints/cloud-deployment-20261016`, commit
`2882721fa3b0b83125bab9d195a6a8aeb9f5f3fe`. HEAD and the normal index were preserved.
The [checkpoint evidence](../artifacts/cloud-deployment/CHECKPOINT.json) records
the original working source, including prior uncommitted UI work.

## Prepared architecture and preserved behavior

- Existing Expo/React Native mobile app and FastAPI API are retained.
- `render.yaml` describes one **Free** Python web service in `services/api`,
  managed HTTPS, `/health`, dynamic `PORT`, and automatic deploys disabled.
  No Render database, disk, worker, CI job or chargeable resource is defined.
- `CAMPAIGN_DATABASE_URL` selects PostgreSQL. Explicit local database paths keep
  SQLite. PostgreSQL migrations are separate, transactional and versioned;
  integer cents, UTC text, JSON snapshots, foreign keys and idempotency remain.
  A transaction advisory lock preserves the existing serialized write behavior.
  This deliberately favors small-prototype correctness over parallel throughput.
- Cloud mode requires a stable receipt secret, explicit reviewer credentials,
  PostgreSQL TLS and authenticated Cloudinary storage. It never imports local
  SQLite records, local accounts, uploads or secrets. Fresh fictional seeds are
  the existing clearly labelled samples.
- Campaign images retain API `/media/...` references. All provider objects are
  authenticated; the API authorizes owner/reviewer access or an exact approved
  public snapshot reference. Private replacements remain private until approved.
  Image errors and successes use private/no-store caching. Native pictures send
  authorization only to the exact API media path, with session-separated cache
  identities. Profile photos remain authenticated database bytes/data URIs.
- Cloud docs/OpenAPI are disabled; public-origin/host and CORS are explicit.
  Actual-body and bounded per-client rate limits run before route parsing.
  These limits are per process, reset on restart and are not a distributed
  abuse service. Proxy identity must be verified on the real host; do not trust
  arbitrary X-Forwarded-For headers. A shared proxy address can share a quota.
- Cloud mobile mode ignores saved local connection overrides and uses separate
  backend-scoped session and guest/account draft keys. Old local sessions and
  drafts remain untouched. Appearance remains the same shared device setting.
  Requests allow a bounded 90-second cold start, show delayed connection guidance,
  and retain explicit retry. Writes are not automatically replayed.
- `CloudTest` uses the existing package and Debug certificate, embeds Hermes and
  disables cleartext/connection editing. It is still an **INTERNAL-TEST** APK,
  never a production-signed release. It requires an actual public HTTPS URL.
  Its generated filename uses `CLOUD-TEST` to distinguish it from the local fallback.

## Local evidence

Source and backend test evidence is in
[`artifacts/cloud-deployment`](../artifacts/cloud-deployment). Real PostgreSQL
tests use an isolated portable project-owned server, never a provider or the
existing local SQLite data. Cloudinary HTTP tests are mocked. The account-later
probe is tested through an isolated HTTP test client, not a deployed endpoint.

Final source gates: **107/107 frontend tests**, TypeScript/full-source ESLint,
PowerShell syntax/diff checks, **82/82 consolidated backend tests** and online
Expo Doctor **20/20**. Separate actual PostgreSQL coverage passes **45/45** with
zero skips; a real owned PG stop/start preserves the original records/session,
receipt capability, money/report/Activity/private photo. The QA cluster was
stopped afterward. Provider and native/cloud gates remain pending.

The authorized POCO is connected and authorized: model 2312FRAFDI, Android 15 /
API 35, ARM64. [Read-only detection](../artifacts/cloud-deployment/PHYSICAL_AVAILABILITY.json)
did not install, launch or test a new APK. An earlier sandbox ADB failure was
resolved by the scoped authorized check; it is not a missing-device claim.

The preserved fallback is
[`campaign-1.0.0-INTERNAL-TEST-arm64.apk`](../artifacts/android/premium-quality-pass12-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk),
48,623,759 bytes, SHA256
`DF4C95CB9F6555DE6E5637DCF18989B7E41042E0D978F7F908EFA0697FDAEDF9`.
Its previous physical launch needs no Metro, but its **backend still needs the
laptop and USB reverse**. Its prior native evidence does not verify this new
deployment source or independent-network access.

## Account connection and first deployment

1. Complete provider login/signup directly. Recheck the actual account's Free
   eligibility and the [current provider conditions](CLOUD_PROVIDERS.md). If any
   provider requires a card, paid trial, billing verification or paid fallback,
   stop. Do not attach a payment method or enable overages/automatic upgrades.
2. Create one fresh **Neon Free** project/database. Keep scale-to-zero enabled;
   use its TLS connection string, preferably the pooled endpoint. Do not copy
   the local database. Keep the database password in server-side secrets.
3. Create/claim a normal permanent **Cloudinary Free Image and Video API**
   account. Do not use an expiring unclaimed sandbox or a paid add-on. Keep
   cloud name/API key/API secret server-side. Unsigned upload presets are not
   needed and should not be enabled for this application.
4. Review and push only the verified preparation source to the existing private
   `tejassambhus17/Campaign` repository, preserving history. Do not create a new
   repository, force-push or include local artifacts/secrets. No GitHub Actions
   billing or paid CI is required.
5. Connect that repository in Render and review `render.yaml` before applying.
   Select the **Free** service and no payment method; leave Blueprint Auto Sync
   off as well as service auto-deploy. Set the secrets listed in
   [`services/api/.env.cloud.example`](../services/api/.env.cloud.example).
   `run.py` does not load .env files automatically. Render injects its public
   URL; another host must set `CAMPAIGN_PUBLIC_BASE_URL` explicitly.
6. Keep the generated `CAMPAIGN_RECEIPT_SECRET` stable across restarts/redeploys.
   Rotating it invalidates existing guest receipt capabilities. Use a distinct
   strong reviewer account; an existing member-email collision must fail, never
   promote the member. Changing the environment password does not reset an
   already provisioned reviewer's password. No reviewer secret goes in the APK.
7. Deploy manually. Confirm HTTPS `/health` **and** real `/config`, campaign
   discovery, images and story responses. Verify database/media configuration
   and Free plan directly in each provider dashboard; health alone is insufficient.

## Persistence probe and cloud APK

After real accounts/HTTPS are available, run the prepared probe from
`E:\Campaign\services\api` using the project Python. Reviewer credentials are
optional environment secrets; without them its restricted workflow is explicitly
incomplete. The probe creates only labelled fictional QA records through API
workflows and saves private state under ignored `tmp/cloud-deployment`.

```powershell
& '.venv\Scripts\python.exe' cloud_probe.py --url 'https://ACTUAL_BACKEND' --step create
```

Record the provider's actual restart/redeploy identifier, restart only the
Campaign service, then run:

```powershell
& '.venv\Scripts\python.exe' cloud_probe.py --url 'https://ACTUAL_BACKEND' --step verify
```

A second successful read alone does not prove a restart occurred. Retain the
provider restart evidence with the sanitized probe report. Never share the
private probe-state file or credentials. Confirm media remains available and
unsigned direct Cloudinary delivery remains denied.

After that gate, from `E:\Campaign`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/android-local.ps1 -Mode CloudTest -Architecture arm64-v8a -ApiUrl 'https://ACTUAL_BACKEND' -ArtifactTag 'cloud-verified'
```

This example URL is a command placeholder, not a deployed service. Do not run
the build against an invented hostname or distribute such an APK. Inspect the
actual packaged API assignment, CloudTest flags, embedded bundle, manifest,
assets/ABIs, certificate and frozen source before compatible `install -r` on
the authorized phone. Do not uninstall, clear data or replace incompatible
signatures without approval. Preserve the fallback APK and local data.

Then test real Home/Explore/images/detail, registration/sign-in, all five steps,
draft restore, submission/reviewer restrictions, simulated contribution/receipt,
funding, Activity, Profile/reports and both themes on the physical phone. Start
with Metro absent. After preparation is complete, request USB disconnection and
mobile data or independent Wi-Fi, then test again with the laptop off. ADB reverse
must not serve the cloud build. USB-connected screenshots, local PostgreSQL or
source checks cannot close these independent-device gates.

## Remaining gates

- **BLOCKED:** provider access/provisioning, actual account Free/no-billing
  confirmation, public HTTPS URL, hosted database/media restart persistence.
- **BLOCKED:** cloud APK build/inspection/install and disconnected independent
  phone verification. No cloud APK was produced or installed.
- **IN PROGRESS:** controlled private reviewer handover, judge download location
  and final connected deployment regression after provisioning.
- **HELD:** recording, external submission and any paid resource. Production
  signing and human/TalkBack/broader-device acceptance are not inferred.

The immediate action required from the user is to connect the three free
provider accounts when ready. Do not repeat that request while it is deferred.
