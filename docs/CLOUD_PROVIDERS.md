# Zero-cost cloud provider checks

**October17 actual account result:** the user-supplied Neon organization reports
Free before and after setup. The existing Campaign production branch is wired
and tested; the temporary0.25-CU QA branch was removed after real compute-restart
and concurrency tests. No card/paid plan/additional Neon service was enabled.
[NEON_SETUP.md](NEON_SETUP.md) contains actual proof. Render and Cloudinary remain
unconfigured; their account eligibility is still unverified. Earlier no-resource
statements below retain their October16 preparation scope.

Checked October 16, 2026 (Asia/Calcutta). These are public documentation checks,
not an account eligibility, provisioning, persistence or deployed-service result.
No account, subscription, card, billing, add-on or cloud resource was created.
The user's latest direction is to prepare the deployment and leave account setup
for later. Recheck the actual account's Free plan and limits before provisioning;
stop if a card, paid plan, billing verification or automatic paid upgrade appears.

## Cloudinary Image and Video API

| Check | Official evidence and practical limit |
| --- | --- |
| Price and card | Free is advertised as $0, permanent and requiring no credit card, with three users in one account. [Pricing](https://cloudinary.com/pricing), [Free-plan FAQ](https://cloudinary.com/documentation/developer_onboarding_faq_free_plan) |
| Combined allowance | 25 monthly credits. One credit represents 1 GB stored, 1 GB image delivery, or 1,000 transformations; consumption across resources is combined. Storage is the amount currently retained, while transformations/bandwidth use a rolling 30-day window. This is not 25 GB of storage plus 25 GB of bandwidth. [Billing definitions](https://cloudinary.com/documentation/billing_and_plans) |
| Image and API ceilings | Free lists 10 MB per image, 25 megapixels, and 500 Admin API requests per hour. Campaign retains its stricter 8 MiB input and 25 MP checks; normalized provider objects are additionally capped at 10,000,000 bytes. [Plan comparison](https://cloudinary.com/pricing/compare-plans) |
| Overuse | Fixed-plan overuse prompts warnings and requests to reduce usage or upgrade; continued overuse can disable the account. Pay-as-you-go overages are a separate paid offering and are excluded. No paid fallback or automatic upgrade is configured. [Usage behavior](https://cloudinary.com/documentation/programmable_media_asset_usage_data) |
| Expiry, sleep and retention | The Free plan does not expire according to the [FAQ](https://cloudinary.com/faq). No unconditional free-tier retention or availability guarantee was established. Content-policy restriction can block upload/delivery, and unresolved suspension can lead to deletion within 30 days. [Service policy](https://cloudinary.com/documentation/solution_overview) |
| Temporary provisioning | A Claimable Cloud expires and deletes its assets after 24 hours unless claimed by the human; initial delivery is restricted to nominated IP addresses. It is unsuitable as evidence of permanent public availability. None was provisioned. [Claimable Cloud reference](https://cloudinary.com/documentation/claimable_cloud_provisioning) |

The prepared media adapter uses signed uploads with delivery type `authenticated`,
which protects both originals and derivatives. Cloudinary `private` alone can
leave derivatives publicly retrievable. Provider secrets and signed download
URLs stay on the API. The implemented API integration preserves stable
`/media/img_….jpg` URLs that proxy image bytes;
only an exact approved public campaign reference makes an image public through
Campaign. Unpublished media requires its owner or an authorized reviewer. This
also preserves existing draft/preview image references without replacing them
with public Cloudinary URLs. Profile photos retain the separate authenticated
database/data-URI contract. [Media access rules](https://cloudinary.com/documentation/control_access_to_media)

The adapter uses the existing pinned `httpx` dependency, fixed HTTPS endpoints,
documented signatures, verified upload responses, bounded response sizes and
connect/read timeouts. It follows no redirects and performs no automatic upload
retry. Failure responses do not reveal provider bodies, request URLs or secrets.
After a confirmed upload, database failure triggers best-effort removal of
that new object. An upload timeout can leave an inaccessible orphan whose
provider-side quota requires later operator reconciliation; the application must
not claim that an uncertain operation succeeded. [Upload protocol](https://cloudinary.com/documentation/upload_images), [signature protocol](https://cloudinary.com/documentation/authentication_signatures)

**Verification boundary:** local adapter persistence and mocked provider
upload/read/destroy/security checks pass **19/19 in 0.093 seconds** using
`services/api/.venv/Scripts/python.exe -m unittest test_media_storage test_security -v`
from `services/api` (October 16, 2026). The Windows sandbox stalled at event-loop
initialization, so the final isolated suite ran outside it; HTTP remained mocked
and temporary files stayed under `services/api/data/tests`. No cloud request was
made. The later combined media/security/probe run passes **25/25 in 2.147 seconds**;
the six probe cases use real isolated FastAPI/SQLite contracts and mocked HTTP,
including an actual local factory restart. This does not verify a PostgreSQL or
cloud restart. A claimed
Free account, actual upload/read, service restart/redeployment persistence,
unsigned-delivery rejection and quota checks remain unverified until account
setup is authorized and completed. No public Cloudinary URL or cloud persistence
claim exists yet.

The exact signed-download wire format was independently compared with the
official Python SDK's `private_download_url` and `cloudinary_api_url`: the API
path is `/v1_1/<cloud>/image/download`, using `public_id`, `format`, `type`,
`timestamp`, `expires_at`, `api_key` and signature. No delivery signature or
credentials reach the app. This is protocol/source verification, not an actual
Cloudinary download. [Official SDK source](https://github.com/cloudinary/pycloudinary/blob/master/cloudinary/utils.py)

Cloud request guards are installed only when `CAMPAIGN_ENV=cloud`. Per-process,
per-client limits are 20 authentication attempts, 12 uploads, 120 other mutations
and 300 reads per minute. Actual body bytes, including chunked requests, are
bounded before parsing. The client address comes from the ASGI server; raw
forwarded headers are not trusted by the application. Until Render's actual
trusted proxy addresses are confirmed, several users may share one bucket.
These limits reset at restart and are not distributed abuse protection. Media
success/error responses are private/no-store and vary by authorization. Public
OpenAPI is disabled; public links use the configured HTTPS origin, and request
errors are sanitized. Reviewer email collisions fail closed without promoting
members or changing existing passwords.

`cloud_probe.py` prepares the later API check. `--step create --url <HTTPS origin>`
saves fictional credentials and idempotency keys in ignored private state before
mutations, then exercises all five server-side draft steps, upload, submission,
simulated backing, receipt privacy, Activity, Profile and reports. Supplying both
reviewer environment variables additionally verifies restricted review and
explicit publication. Without them the new submission remains private and
backing uses an existing fictional funding fixture; the report marks review
blocked. `--step verify` compares saved records/media bytes and the original
session/receipt capability after an operator's separately recorded restart.
It never restarts a provider or proves Android independence. Repeating create
refuses to overwrite its state or create another account/payment. Interrupted
state requires private recovery; mutations are never blindly retried. The CLI
accepts only a public HTTPS origin, streams responses with a size limit, follows
no redirects, and writes sanitized results under ignored artifacts. It has not
been run against a public backend.

## Hosting and database

**Render Free Web Service:** public documentation offers 750 shared instance-hours
per workspace/month, managed HTTPS and an ephemeral filesystem. It sleeps after
15 minutes without traffic; waking can take about a minute. Free services cannot
attach persistent disks. If no payment method is present, exhausting included
bandwidth suspends free services and exhausting build minutes prevents builds;
adding a payment method can enable chargeable overages. Consequently this project
requires a Free service, no payment method, no paid workspace/add-ons and no paid
fallback. Account eligibility, any anti-abuse/card requirement, and the actual
account's included bandwidth/build minutes remain unchecked. Stop if billing
verification is demanded. Free Postgres on Render expires after 30 days and is
not selected. [Free-service behavior](https://render.com/docs/free),
[billing FAQ](https://render.com/docs/faq), [current pricing](https://render.com/pricing).

**Neon Free PostgreSQL:** the current pricing page advertises $0 with no time
limit or card, 1 GB database storage/project, 100 CU-hours/project/month, up to
2 CU and 100 projects. Scale-to-zero occurs after five inactive minutes; the
restore window is up to six hours or 1 GB of changes. The comparison lists 5 GB
public transfer/project. Older blog posts with 0.5 GB/50 CU-hours are not used as
current limits. Select only Free; no Launch/Scale, trial, paid backup, paid branch
or automatic upgrade. No unconditional retention/availability guarantee or
account-specific eligibility has been established. Keep a single small project
and measure usage after provisioning. [Current pricing](https://neon.com/pricing),
[plan/limit documentation](https://neon.com/docs/introduction/plans).

No provider was used or provisioned. The local SQLite database, uploaded files,
private accounts and reviewer credentials must never be copied automatically
into the public demonstration environment. A new cloud database should receive
only the existing explicitly fictional seed campaigns and newly created QA data.
The [deployment runbook](CLOUD_DEPLOYMENT.md) separates executable local checks
from the public HTTPS, persistence and independent-phone gates.
