# PostgreSQL compatibility

The existing FastAPI domain, endpoint contracts and integer-cent ledger are shared by SQLite and PostgreSQL. `CAMPAIGN_DATABASE_URL` selects PostgreSQL only when `Database`/`create_app` receives no explicit SQLite path. Local development and the original isolated SQLite tests retain their existing storage. No local user data is exported or copied into PostgreSQL.

Required server-only PostgreSQL settings:

- `CAMPAIGN_DATABASE_URL`: PostgreSQL connection URL. Cloud mode additionally requires an explicit TLS `sslmode` through `Deployment.read()`.
- `CAMPAIGN_RECEIPT_SECRET`: stable secret of at least 32 characters. Preserve it across restarts/redeployments so existing private guest receipt capabilities remain valid. Never place it in the mobile application or Git.
- `CAMPAIGN_REVIEWER_EMAIL` and `CAMPAIGN_REVIEWER_PASSWORD`: explicitly provision one restricted reviewer; password minimum 12 characters. Bootstrap never promotes an existing member or resets an existing reviewer's password. An address collision with a member fails closed. Changing environment values does not change an existing account's password.
- `CAMPAIGN_DATABASE_SCHEMA`: optional simple identifier, default `public`. Unique schemas are used for isolated PostgreSQL tests; no unrelated schema is inspected or changed.

Cloud mode separately requires persistent authenticated media storage and the public HTTPS configuration; PostgreSQL compatibility alone is not a cloud deployment.

## Migrations and integrity

Numbered SQL files in this directory run once, in order, in one PostgreSQL transaction protected by the same transaction-scoped application advisory lock used for mutations. `schema_migrations` records successfully committed versions. A failed startup migration rolls back instead of marking the version applied. Do not modify already applied migrations to change a deployed schema; add a new numbered forward migration.

The schema deliberately retains UTC ISO timestamp text, JSON text, integer flags and integer-cent monetary records. PostgreSQL uses `BYTEA` with a byte-length constraint for owner-only profile photos. A `BIGSERIAL` notification insertion order replaces SQLite's implicit `rowid`, preserving deterministic newest-first ordering when timestamps tie. Public API aliases retain their exact camelCase spelling through quoted SQL aliases. Foreign keys, uniqueness, role/status constraints, ledger idempotency and existing monetary calculations remain enforced.

Every `Database.transaction()` takes `pg_advisory_xact_lock` before reading state. This preserves the prototype's SQLite `BEGIN IMMEDIATE` serialization for contribution replays, funding transitions, draft creation, notification deduplication, preference merges and refunds. It intentionally favors correctness over write throughput for this hackathon prototype. This is a transaction lock, not a session lock, and is compatible with transaction pooling. Search paths use `SET LOCAL`; prepared statement caching is disabled. Connections have a 10-second connect timeout and 30-second statement/lock timeouts. Mutations are never blindly replayed by the adapter.

`seed_demo` runs through the same transaction boundary and adds only the existing clearly labelled fictional samples to an empty campaign database. The local SQLite database, local credentials and private uploads are never migration inputs.

## Executable verification

From `services/api`, using its virtual environment:

```powershell
.venv/Scripts/python.exe -m unittest -v test_api test_database
# Set CAMPAIGN_TEST_POSTGRES_URL privately to an isolated PostgreSQL test database.
.venv/Scripts/python.exe -m unittest -v test_postgres
```

The PostgreSQL suite creates a unique `campaign_test_<random>` schema per case and drops only the exact schemas created by that case. Use a project-owned isolated database/test role with permission to create those schemas. Missing test configuration is reported as skipped, not passed. The original 35 API cases run on actual PostgreSQL through a subclass, with the explicit-path seeded case adapted to a second PostgreSQL schema. Additional cases cover startup races, duplicate-registration rollback, foreign keys and reviewer/member collision; six HTTP media-boundary regressions also run on PostgreSQL.

On October 16, 2026, a portable official PostgreSQL 18.6 runtime in the Campaign workspace passed **45/45 PostgreSQL tests in 82.875 seconds** and **40/40 SQLite/storage tests in 17.375 seconds**, with zero skips and unchanged source before/after. An actual owned PostgreSQL server stop/start also preserved HTTP-created fictional drafts, sessions, password authentication, integer-cent funding/report values, guest receipt capabilities, Activity and private avatar bytes. Same-host local campaign image bytes survived that restart; this does not verify Cloudinary or application redeployment. See [test evidence](../../../../artifacts/cloud-deployment/database/postgres-tests.json), [SQLite evidence](../../../../artifacts/cloud-deployment/database/sqlite-tests.json) and [restart evidence](../../../../artifacts/cloud-deployment/database/local-postgres-restart.json). Neon connectivity and cloud persistence require separate live verification.

The pinned driver is `psycopg[binary]==3.3.6`, verified against [official PyPI](https://pypi.org/project/psycopg/3.3.6/) and [Psycopg installation guidance](https://www.psycopg.org/psycopg3/docs/basic/install.html). Its [row factories](https://www.psycopg.org/psycopg3/docs/advanced/rows.html) support the small shared row adapter. PostgreSQL documents [transaction advisory locks](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS); the [official Windows download page](https://www.postgresql.org/download/windows/) links the portable EDB binary distribution used for local verification. No Windows service, Docker resource or global tool configuration was installed.
