# Campaign Amplification

A React Native / Expo prototype for community-funded message distribution. Contributions fund advertising reach, rather than direct donations to the campaign's cause. All payments, advertising delivery and report figures are explicitly simulated.

The October 16 native redesign uses campaign photography, bundled Manrope/Newsreader and compact native creation, checkout and tracking flows. [Design system](DESIGN.md), [native redesign evidence](UI_REDESIGN_PROGRESS.md) and [current delivery status](RELEASE_READINESS.md) distinguish source checks, installed Android results and remaining external prerequisites.

## Architecture and source backup

- `apps/mobile`: Expo SDK 55, React Native 0.83, React 19.2 and TypeScript, with Expo Router and TanStack Query. Native sessions use SecureStore; scoped drafts use AsyncStorage.
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

`mobile.ps1` selects a compatible Node executable. This machine's system Node 20.9 is too old for SDK 55; the script can use Codex's bundled Node 24 or an explicit `CAMPAIGN_NODE` executable. No global Node installation is changed.

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

See [PROGRESS.md](PROGRESS.md) for actual results and limits. An Android JavaScript/Hermes export is not an installable APK or Android device verification. The separate [local Android guide](docs/ANDROID_LOCAL.md) describes the final INTERNAL-TEST builds, historical debug artifacts and isolated toolchain.

## Android artifacts and recorded demonstration

The emulator API defaults to `http://10.0.2.2:8787`. Final [ARM64 INTERNAL-TEST APK](artifacts/android/campaign-1.0.0-INTERNAL-TEST-arm64.apk) and [x86_64 INTERNAL-TEST APK](artifacts/android/campaign-1.0.0-INTERNAL-TEST-x86_64.apk) contain JavaScript, fonts and full font licenses. The x86_64 build installed and cold-launched on Android16/API36 with Metro stopped and the local API reachable. Native offline recovery, local draft saving and 360dp/1.3-scale checkout pass. ARM64 has not been installed on a physical device.

Both use the Android Debug certificate and are explicitly internal test artifacts. A phone needs a reachable API address: Profile's internal Demo connection settings can replace the emulator alias, or supply `EXPO_PUBLIC_API_URL` at build time. The API must still run separately; public judging connectivity/hosting are not configured. See [release readiness](RELEASE_READINESS.md) for hashes and exact limits. Preserved older [ARM64 debug](artifacts/android/campaign-1.0.0-debug-arm64.apk) and [x86_64 debug](artifacts/android/campaign-1.0.0-debug-x86_64.apk) builds require Metro.

The [complete native demonstration](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4) is 9m40s, recorded from the final x86_64 APK with Metro off. It follows one account through creation/backing and a separate restricted reviewer through approval and simulated delivery. Full decode, objective audio, [bounded frame/privacy review](artifacts/demo/VIDEO_REVIEW.md) and [continuous muted playback](artifacts/demo/PLAYBACK_RESULTS.json) pass. Human listening remains unverified. [Native results](artifacts/demo/NATIVE_RESULTS.md) and [video metadata](artifacts/demo/campaign-native-demo-INTERNAL-TEST.mp4.json) provide exact hashes and scope. Share the final APK/video files; raw captures and private helpers stay local.

## Scope and documentation

- [AGENTS.md](AGENTS.md): permanent agent and isolation instructions.
- [INIT.md](INIT.md) / [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): startup and product/architecture memory.
- [REQUIREMENTS.md](REQUIREMENTS.md): PDF-derived coverage and evidence matrix.
- [PROGRESS.md](PROGRESS.md): current work, test evidence, remaining issues and next steps.
- [docs/DEMO.md](docs/DEMO.md) / [docs/DELIVERY.md](docs/DELIVERY.md): demonstration and release checklists.

The original 25-page PDF remains authoritative; the user's organizer-video summary supplements it. All work stays inside this project; the Prakash Glass Enterprise ERP is untouched. Cloud accounts and hosting remain deferred. Current artifact, Metro/backend dependency and remaining verification status live in [release readiness](RELEASE_READINESS.md) and [demo checklist](DEMO_CHECKLIST.md). [Cleanup](artifacts/demo/cleanup/README.md) removed the native private session and stopped only owned Android services; API and preview remain healthy. The earlier [Activity rehearsal](artifacts/android/activity-native-rehearsal.mp4) is partial historical evidence. Free services only remains the preference for later hosting. No hackathon submission has been sent.
