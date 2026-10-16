# Campaign Amplification

**October17 update:** Neon PostgreSQL is connected to the existing FastAPI app.
From this root,`npm run build` checks TypeScript, exports Android JavaScript/assets
and compiles FastAPI;`npm start` runs the Neon-backed local API on8879. The original
SQLite launcher remains unchanged. See [Neon setup](docs/NEON_SETUP.md),
[current progress](PROGRESS.md) and [release readiness](RELEASE_READINESS.md).
Database hosting does not yet provide a public API or independent Android APK.
After the API starts, `npm run preview:neon` serves the isolated app preview at
`http://localhost:19006`. Database workflow checks passed; the current preview
has bundle/network verification, with browser visual and new native QA pending.

A React Native / Expo prototype for community-funded message distribution. Contributions fund advertising reach, rather than direct donations to the campaign's cause. All payments, advertising delivery and report figures are explicitly simulated.

The active October 16 redesign uses compact Manrope typography, campaign photography, mint-and-charcoal surfaces and complete System/Light/Dark appearance. The user's latest reference replaces the previous civic-publication visual result while preserving the working Expo/FastAPI architecture and workflows. [Design system](DESIGN.md), [native redesign evidence](UI_REDESIGN_PROGRESS.md) and [current delivery status](RELEASE_READINESS.md) distinguish source checks, fresh installed Android acceptance and historical evidence.

Later user steering preserves Light and corrects Dark to pure black/neutral-charcoal surfaces, with mint restricted to small accents/actions. Current source uses `#000000` background, `#121212` surfaces and `#1C1C1C` raised surfaces. The subsequent [product-quality addendum pass](docs/PRODUCT_QUALITY.md) refines existing creation, persistence, previews, receipts and reports within that design. Black pass2 and its 12-surface automated verdict are historical checkpoints, not current approval. The updated demo remains incomplete and user-held; recording and production require explicit human authorization. Current verification is in [PROGRESS.md](PROGRESS.md).

The quality pass adds an actionable Submit checklist, distinct device/account save feedback, separate campaign/ad previews, payment-specific private receipts and clearer refund accounting. Current source passes 62 frontend and 31 backend tests; corrected x86_64 and ARM64 INTERNAL-TEST APKs are preserved under `artifacts/android/quality-addendum-pass2-20261016/`. Exact installed checks and remaining physical-device, human-test and reachable-backend gates are in [release readiness](RELEASE_READINESS.md).

The quality pass adds an actionable Submit checklist, distinct device/account save feedback, separate campaign/ad previews, payment-specific private receipts and clearer refund accounting. Current source passes 62 frontend and 31 backend tests; corrected x86_64 and ARM64 INTERNAL-TEST APKs are preserved under `artifacts/android/quality-addendum-pass2-20261016/`. Exact installed checks and remaining physical-device, human-test and reachable-backend gates are in [release readiness](RELEASE_READINESS.md).

## Architecture and source backup

- `apps/mobile`: Expo SDK 55, React Native 0.83, React 19.2 and TypeScript, with Expo Router and TanStack Query. Native sessions use SecureStore; scoped drafts use AsyncStorage. One semantic theme provider sits above session/query/navigation; a separate AsyncStorage device preference defaults to System and persists Light/Dark overrides through sign-out.
- `services/api`: FastAPI with SQLite, numbered migrations, server validation, account/reviewer permissions and transactional simulated payment accounting. The API remains a separate running service.
- `scripts`: Windows launch, verification and local Android build helpers. `docs` and the root Markdown files preserve requirements, design decisions and verification limits.

This repository is a **source-only backup**. Dependencies, local databases/uploads, generated credentials, native build directories, SDK/JDK toolchains, `tmp` and `artifacts` stay local. Links below to APKs, videos, screenshots and other `artifacts/` evidence refer to the original workspace and will not resolve in a fresh clone. The source includes dependency locks, migrations, cached seed photographs and bundled font licenses; it does not include existing accounts or recorded campaign data.

See [GitHub backup boundaries](docs/GITHUB_BACKUP.md) for excluded organizer material, preserved history and future commit precautions.

## First setup on Windows

Install Git, Node **20.19.4 or newer** with npm (a supported LTS is preferable), and Python **3.12** available as `python`. Clone or restore the source into the authorized `E:\Campaign` workspace. The local Android build launcher explicitly requires this root; its separately installed SDK/JDK versions are listed in the [local Android guide](docs/ANDROID_LOCAL.md).

From the project root in PowerShell:

```powershell
Set-Location E:\Campaign
Push-Location apps/mobile
npm.cmd ci
Pop-Location
python -m venv services/api/.venv
& .\services\api\.venv\Scripts\python.exe -m pip install -r .\services\api\requirements.txt
.\start-local.cmd
```

Use the checked-in `package-lock.json` and pinned Python dependencies. Initial startup applies migrations, creates fictional seed campaigns and provisions fresh local reviewer credentials. No cloud credentials are required. See the [API guide](services/api/README.md) for account provisioning and persistence details.

No environment file is needed for local development: web uses `http://127.0.0.1:8787` and Android emulators use `http://10.0.2.2:8787`. [The mobile environment template](apps/mobile/.env.example) contains optional commented URL examples. A phone needs a reachable LAN or hosted API address. `EXPO_PUBLIC_*` values are bundled into the client and must never contain secrets. The backend reads process environment variables; it does not automatically load a `.env` file.

## Run locally on Windows

From `E:\Campaign`, with the installed project dependencies:

```powershell
.\start-local.cmd
```

Open <http://localhost:8081>. The FastAPI backend listens on <http://127.0.0.1:8787>; its interactive API reference is <http://127.0.0.1:8787/docs>. The startup script reuses verified existing project listeners and never stops an unrelated service.

For foreground development, use two terminals:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api.ps1 run
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 web
```

`mobile.ps1` selects a compatible Node executable. This machine's system Node 20.9 is too old for SDK 55; the script can use Codex's bundled Node 24.21.0 or an explicit process-only `CAMPAIGN_NODE` executable. Set the latter when automatic discovery is unavailable under a restricted shell identity. No global Node installation is changed.

## Accounts and demonstration

- Browse Home and Explore without signing in. Search, categories, sorting and funding filters change actual results.
- Create a prototype account in Profile. Use test credentials that you do not use elsewhere. One account can create, back, save and follow campaigns.
- Create offers a manual editor and a clearly labelled guided voice/AI fallback. The five steps are Basics, Story, Campaign & Ad Visuals, Reach, Submit. Local drafts survive reload; signed-in drafts also save to the API. A guest can explicitly transfer their current draft after signing in.
- The funding goal is entered only at Submit. Submission enters review, and cannot publish or launch advertising.
- A local reviewer account is created by the backend. Its private credentials are in `services/api/.demo-credentials.json` (ignored by version control). Read that file locally and sign in through Profile to access Review. Do not share or bundle it.
- Approve submitted content, then explicitly make it available for funding. Back it using the simulated checkout. Each outcome is selectable; only confirmed successful transactions add funding.
- Funding completion is separate from advertising. The reviewer prepares distribution, confirms setup, starts simulated promotion, records progress and completes it. The final report distinguishes funding, allocated budget, spend, estimates, simulated delivery and refunds.
- Creator updates appear on campaign pages and in follower/backer activity. Profile contains created/backed/saved campaigns, payment history and notification settings. Public backer names remain private.
- Activity groups recent updates by date, with unread/category filters, clear campaign names and direct editor/report/payment destinations. Preferences control future campaign/payment updates; essential account-security notices remain on.
- Profile Settings offers System (default), Light and Dark to guests and signed-in users. Appearance is a device preference, separate from account, drafts and checkout. Source tests and selected installed cold-restore, draft-continuity and actual Android System changes pass; exact cases and remaining combinations are tracked in [native results](artifacts/reference-redesign/after-pass2/NATIVE_RESULTS.md).

Six fictional seeded campaigns use locally cached illustrative stock images and public general-context sources. These sources do not independently verify fictional creators or claims.

## Verify

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api.ps1 test
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 typecheck
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 lint
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 test
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 export:web
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mobile.ps1 export:android
```

Final-source frontend tests pass 50/50 in 499.9563ms, including appearance, contrast and public-revision safeguards. TypeScript, lint and web/Android exports pass; backend 30/30 remains valid for unchanged API source. Online Expo dependency compatibility and Doctor 20/20 pass. See [PROGRESS.md](PROGRESS.md) for exact results and later evidence. An Android JavaScript/Hermes export is not an installable APK or Android device verification. The separate [local Android guide](docs/ANDROID_LOCAL.md) describes the final tagged INTERNAL-TEST builds, historical artifacts and isolated toolchain.

## Android artifacts and recorded demonstration

Both final black pass2 builds are available under `artifacts/android/black-theme-pass2-20261016/`:

| Build | Bytes / SHA-256 | Runtime evidence |
| --- | --- | --- |
| [x86_64 APK](artifacts/android/black-theme-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-x86_64.apk) | 38,437,869 / `45F0D82B23CD9B6C3DAD56E029E56B7F3CAF3CD91F18CF4FC6A8DED7DE7AE187` | Installed on owned Android 16 / API 36 emulator; exact Metro-off/API-backed cold launch with saved Black and ordinary identity passes |
| [ARM64 APK](artifacts/android/black-theme-pass2-20261016/campaign-1.0.0-INTERNAL-TEST-arm64.apk) | 37,150,011 / `CE69B6139356A578E1E4E9FC80EE01960B8E90F26C4BD7B000C5210DBB8DC166` | Built and inspected; uninstalled |

[Independent binary inspection](artifacts/reference-redesign/BUILD_INSPECTION.json) verifies matching embedded Hermes/fonts/licenses, correct ABIs/API, Android Debug signatures and all 50 frozen app inputs. [Native results](artifacts/reference-redesign/after-pass2/NATIVE_RESULTS.md) cover Home funding above the first fold in both schemes, selected 360dp/font 1.3 docks/Gboard, 411dp/font 1.6 critical screens, draft/theme/cold continuation, actual System appearance and client-address error recovery. The unused port 8788 check changed only the client configuration and intentionally signed out; it was not a physical outage. Metro was restored after the specific cold-launch proof. These are scoped checks, not every workflow or viewport combination. The full new journey/demo and playback remain unfinished and user-held; recording/production requires explicit human authorization to resume. Consult [release readiness](RELEASE_READINESS.md) for subsequent results.

The emulator API defaults to `http://10.0.2.2:8787`. Internal test builds use the Android Debug certificate, not production signing. A phone needs a reachable API address: Profile's internal Demo connection settings can replace the emulator alias, or supply `EXPO_PUBLIC_API_URL` at build time. The API must still run separately; public judging connectivity/hosting are not configured. Embedded JavaScript, installed Metro independence and API reachability are distinct checks. Preserved [ARM64 debug](artifacts/android/campaign-1.0.0-debug-arm64.apk) and [x86_64 debug](artifacts/android/campaign-1.0.0-debug-x86_64.apk) builds require Metro.

Historical [ARM64 INTERNAL-TEST](artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk) and [x86_64 INTERNAL-TEST](artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk) artifacts are preserved. The former remains uninstalled; the latter's prior Android16/API36 Metro-off, offline/draft and large-text checkout evidence belongs to that older build. The historical [9m40s native demonstration](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4), [native results](artifacts/demo/NATIVE_RESULTS.md), [bounded review](artifacts/demo/VIDEO_REVIEW.md), [muted playback](artifacts/demo/PLAYBACK_RESULTS.json) and [metadata](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4.json) retain their exact former scopes. They do not verify the replacement design or complete appearance. Human listening remains unverified. Share only intended final APK/video files; raw captures and private helpers stay local.

## Scope and documentation

- [AGENTS.md](AGENTS.md): permanent agent and isolation instructions.
- [INIT.md](INIT.md) / [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): startup and product/architecture memory.
- [REQUIREMENTS.md](REQUIREMENTS.md): PDF-derived coverage and evidence matrix.
- [PROGRESS.md](PROGRESS.md): current work, test evidence, remaining issues and next steps.
- [docs/DEMO.md](docs/DEMO.md) / [docs/DELIVERY.md](docs/DELIVERY.md): demonstration and release checklists.

The original 25-page PDF remains authoritative; the user's organizer-video summary supplements it. All work stays inside this project; the Prakash Glass Enterprise ERP is untouched. Cloud accounts and hosting remain deferred. Current artifact, Metro/backend dependency and remaining verification status live in [release readiness](RELEASE_READINESS.md) and [demo checklist](DEMO_CHECKLIST.md). Prior [cleanup](artifacts/demo/cleanup/README.md) and [Activity rehearsal](artifacts/android/activity-native-rehearsal.mp4) records are historical; consult current progress for active device/service state. Free services only remains the preference for later hosting. No hackathon submission has been sent.
