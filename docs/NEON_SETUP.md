# Campaign on Neon PostgreSQL

October17,2026. Target supplied by the user:
organization `org-patient-sound-11803564`, project `dawn-lab-92471358` (**Campaign**),
branch **production**, PostgreSQL only. The organization API reports **Free**.
No credit card, paid plan, trial, extra project, Auth, Functions, Object Storage,
AI Gateway or Realtime service was enabled.

## Setup and server environment

Neon CLI8.7.2 was installed using the requested global-install mode with an
isolated prefix, `E:\Campaign\tools\neon-cli`; npm cache stays under ignored
`tmp/neon-setup`. Browser sign-in was completed directly by the user. Credentials
remain in ignored `tmp/neon-setup/auth`, without changes to global agent tooling.
Official Neon and Neon Postgres skills were installed project-locally and read.

Initialization used the supplied org/project/branch/services flags, adding
`--no-agent-setup` to prevent global plugin/MCP edits and an explicit local
`--config-dir`. `.neon` pins the selected project/branch and is ignored by Git.
`neon.ts` uses the CLI's generated PostgreSQL-only policy with Auth disabled.
The authenticated plan and `neon deploy` reported:

```text
No changes — branch production already matches the policy.
Utilized services: Postgres
Pulled 3 Neon variables into .env.local
Postgres DATABASE_URL, DATABASE_URL_UNPOOLED
Branch NEON_BRANCH
```

`scripts/neon-runtime.mjs` reads only this project's ignored environment file,
validates matching Neon database/role and explicit TLS, then maps:

| Pulled setting | Backend use |
| --- | --- |
| DATABASE_URL | CAMPAIGN_DATABASE_URL: pooled normal app traffic |
| DATABASE_URL_UNPOOLED | CAMPAIGN_MIGRATION_DATABASE_URL: direct migrations |
| NEON_BRANCH | Required context when validating the selected environment |

FastAPI keeps its existing `psycopg` driver, endpoint contracts, migrations,
money/lifecycle rules and private photo storage. No database credential is
imported into mobile source. Normal `scripts/api.ps1` startup still defaults to
the original SQLite database; the new Neon startup is explicit.

Local server receipt/reviewer secrets are generated once in ignored
`services/api/data/neon-runtime.json`. Preserve them across restart and later
hosting: guest receipt capabilities depend on the same receipt secret. Set those
values directly in Render's secret environment when connecting that provider;
do not paste them into chat or commit the file. The blueprint now requests the
established receipt secret instead of generating a replacement. Existing
reviewer passwords are not reset by changing environment variables.

## Commands

From `E:\Campaign`:

```powershell
npm run build
npm run test:neon
npm start
# In a second terminal, after the API is healthy:
npm run preview:neon
```

The root build delegates to existing mobile TypeScript/Android export tooling
and Python source compilation. It prints:

```text
Exported: dist-android
Campaign build passed: TypeScript, Android JavaScript/assets export and FastAPI compilation. This is not an APK build.
```

Node22.20+ is selected using `CAMPAIGN_NODE` or the existing bundled runtime;
the machine's older default Node is unchanged. API starts on loopback port8879
to preserve the existing SQLite API8787 and Metro8081. `npm start -- -Port 8880`
can select another unused port. Do not start a second instance on a busy port.

The optional Expo Web preview uses `http://localhost:19006` and points to the
Neon-backed API at `http://127.0.0.1:8879`. Its separate browser origin isolates
sessions/drafts from the original SQLite preview. The HTML and compiled bundle
returned HTTP 200; the bundle contains the intended API URL, and the API's
existing CORS policy allows this origin. See `PREVIEW.json` in the evidence
directory. Browser automation failed to initialize, so this is bundle/network
verification, not a browser visual or physical Android test. Expo used its
fallback React Native DevTools after the latest version could not download.

## Actual verification

- The production database was empty before application migrations: metadata
  listed no public tables. No private local database or user records were copied.
- Migrations/workflows were exercised first on an isolated Free0.25-CU QA branch.
  The actual Neon compute was restarted; `pg_postmaster_start_time()` changed,
  and TLS remained active. Original sessions, campaign/funding/report, receipt
  capability, Activity and private photo survived. Campaign image bytes in this
  test remained local; this is not Cloudinary persistence evidence.
- Production HTTP checks pass20 assertions: registration/sign-in; all five
  creation steps; persisted drafts; unpublished image privacy; submission;
  reviewer-only approval; separate publication; simulated contribution/replay;
  private receipts; funding/fees; Profile, Activity and private photo.
- Production retains all8 restart-comparison checks: original session, campaign
  and goal, funding report, original guest receipt capability, image metadata,
  private photo and Activity. Only this new local API instance was restarted.
- Focused live-Neon tests pass3/3, zero skips/errors, in305.328s: concurrent
  payment idempotency/no automatic ads, concurrent unique funding totals, and
  parallel migrations/reviewer bootstrap. These use isolated QA schemas.
- Final local regression passes83/83 backend,107/107 mobile and3/3 environment
  adapter tests, with TypeScript, ESLint and the root build passing.
- The exact temporary QA branch`br-green-glade-b48szmfm` was deleted after tests;
  production`br-divine-resonance-b41w9vyl` remains. The organization still reports
  Free. The original API8787/Metro8081 are preserved; the production-backed
  localhost API remains running on8879.
- Targeted scanning of53 Android-export files and178 candidate application
  source files found no actual pulled database URL/password or established
  server-secret values. This is a bounded check, not a full security audit.

Sanitized evidence is under [`artifacts/neon-setup`](../artifacts/neon-setup).
Private fixture state, connection strings and logs containing potential driver
details stay under ignored `tmp/neon-setup`.

## Diagnosed failures

1. Init initially linked offline without verifying credentials. User browser
   login, targeted project lookup, Free-plan check and deploy resolved it.
2. The CLI's initial dependency install used the machine's Node20.9 and emitted
   engine warnings. Supported Node24 was used for subsequent lock/build/runtime
   commands; dependency audit reported zero vulnerabilities for the root setup.
3. A QA expiry timestamp used Windows locale separators and was rejected before
   provisioning. An explicit suspend interval was also rejected by Free policy.
   QA creation succeeded using Free defaults and fixed0.25CU; no upgrade was made.
4. Live Neon rejected SQL timeout startup options. The adapter now sets timeout
   and schema values inside the transaction, compatible with transaction pooling.
5. The first QA harness expected a string receipt/404; the real contract returns
   a receipt object and403 for unauthorized reads. The harness was corrected and
   resumed the existing fixture with the same idempotency key; no second payment.
6. A local restart orchestration command tested an unset PowerShell exit-code
   variable and returned before relaunching. The replacement API was explicitly
   started, then passed all8 original-state comparisons. This was a verification
   helper issue; existing application services were not stopped.
7. Final restricted-sandbox probes could not see the host's listeners or bundled
   Node runtime. A redundant API start correctly failed to bind the occupied
   port; it did not replace the running server. Host-side checks then confirmed
   HTTP 200 on the original API8787/Metro8081 and new API8879/preview19006,
   and all three adapter tests passed using the supported runtime. No existing
   listener was stopped to resolve this verification limitation.

## Remaining delivery boundaries

Neon hosts the PostgreSQL database. FastAPI still runs locally, and campaign image
files remain local until Cloudinary is connected. Render/public HTTPS, a cloud
APK and independent-phone/laptop-off verification remain pending. Android export
is a JavaScript/assets build, not an installed APK or new native acceptance.
Recording and organizer submission remain held. Only labelled fictional cloud QA
records were created, through normal API workflows.
