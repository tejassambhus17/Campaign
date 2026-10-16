# First-time-user comprehension and Android acceptance

Prepared October 16, 2026 for the product-quality addendum. **NOT STARTED: no real participant has run this test.** This is a test plan, not evidence of human acceptance. PDF pp. 20-21 and 23 require understandable product thinking; the addendum supplies the three comprehension prompts below. No judging weights or numerical success score is inferred.

Current artifact selection is tracked in [RELEASE_READINESS.md](../RELEASE_READINESS.md). The corrected addendum-pass2 candidates use 54-input digest `a302e8c14b3706e92efc4eb54c1f7c7e11ac53476ca007fde9ad07b76c5c44a9`; source tests, binary inspection and bounded x86 installed keyboard/footer/receipt/Metro-off/API/state/report confirmation pass. Physical/fresh-install/TalkBack/first-time-human acceptance is still NOT STARTED or unverified. Earlier 359744 emulator QA and any subsequent agent-operated confirmation are functional evidence, not a first-time human session. Select the actual final artifact/hash at the time of testing; do not prefill participant/device/result fields below from an emulator report.

## Short unassisted test

Use one real person unfamiliar with Campaign. Allow about 8-10 minutes. Record written observations only; the user's hold prohibits screen recording or demo production until explicit resumption. Do not include passwords, receipt capabilities, private account details or identifiable participant information in project notes.

1. Give the participant the intended Android build and working backend. State only: “Explore a campaign that interests you, read its story and sources, and review what backing it would involve. This is a simulated prototype; no money will move.” Let the participant navigate without a walkthrough. If help is necessary, note the point and the exact assistance rather than counting it as unassisted success.
2. Before explaining the product, ask these questions exactly and capture the participant's own words:

   | Prompt | Understanding to check after the answer |
   | --- | --- |
   | What does a contribution pay for? | Distribution of the message, with disclosed included fees and advertising budget; no direct donation or transfer to the creator/cause. |
   | What happens after the funding goal is reached? | Funding closes; a separate review/readiness/setup process precedes promotion. Reaching the goal does not launch advertising automatically. |
   | Where are the results? | Campaign progress/Activity lead to the campaign report. Estimates, simulated delivery and unavailable measured results are distinguishable. |

3. Ask the participant to find the public supporting sources, return to discovery, then locate campaign progress and the report. Observe whether the next action and back behavior are clear. For a completed demonstration campaign, ask what “unspent” and “refund” mean; the same money must not be counted twice.
4. If appropriate, ask them to start a manual draft, correct an issue from the Submit checklist, save it, change appearance and resume it. Stop before submitting or paying unless the QA task separately calls for those mutations. No demo campaign mutations or filming are authorized by this plan.
5. Note confusion, missed information, blocked actions and recovery. Fix material misunderstandings and rerun the affected task; do not replace the participant's answers with the expected wording.

## Record an actual session

Until completed, leave this table explicitly pending. A teammate or automated agent inspecting screenshots is not a first-time-user session.

| Evidence field | Result |
| --- | --- |
| Date and anonymous participant label | NOT STARTED |
| Installed artifact path / SHA-256 / app version | NOT STARTED |
| Physical device model / Android version / font size / appearance | NOT STARTED |
| Backend arrangement verified from that device | NOT STARTED |
| Participant answers to all three prompts, in their own words | NOT STARTED |
| Unassisted tasks / assistance actually required | NOT STARTED |
| Defects, source corrections and retest evidence | NOT STARTED |

## Physical Android and release gate

A physical Android device is currently unverified. Emulator screenshots or a successful ARM64 build do not establish this gate. When a device is available, use a separately tagged current APK and preserve existing campaigns/drafts; do not uninstall a user's existing app merely to claim a fresh install. Use a genuinely clean authorized device/profile or record why fresh-install acceptance remains pending.

Verify launch with Metro unavailable and a backend reachable by the device. The emulator alias `10.0.2.2` is not a phone or judge backend arrangement. The submitted APK must arrive configured for a working backend without expecting judges to type a local API URL. Hosting/accounts remain deferred; this is an open release blocker, not permission to create accounts or paid resources.

Exercise guest discovery/source opening/search-filter return; manual five-step creation/save/process restart/resume; both themes and System without state loss; review correction -> editing -> resubmission with separately restricted reviewer authority; one successful simulated payment counted once/private receipt; non-success and cancellation recovery; contextual Activity/report; and offline local save without false account-sync success. Check normal/increased text, actual keyboard, scrollable sheets/errors/receipts/reports and Android Back. Keep installed hash, device, steps, expected/actual results and limitations for each check.

## Curated fictional examples, without altering records

The existing seed source already supplies six labelled fictional campaigns. A future demonstration can deliberately select a few stable examples; no database reset, user-campaign deletion, title rewrite or fabricated citation is needed.

| Existing seed campaign | Example purpose | Source/content boundary |
| --- | --- | --- |
| Let our forests keep growing (`demo_forest`) | Guest story, public sources and backing review | Fictional Canopy Collective / Environment; funding is simulated. |
| A brighter start for every learner (`demo_learning`) | Another category and creator presentation | Fictional Open Chapter Studio / Education. |
| Good neighbours make stronger communities (`demo_community`) | Funding complete before promotion | Fictional community example; reaching the goal is separate from launch. |
| Curiosity belongs to everyone (`demo_science`) | Completed report and accounting explanation | Fictional science example; delivery is simulated and measured reach unavailable. |

`services/api/seed.py` also includes ocean and arts examples. The existing source title/URL is United Nations Sustainable Development Goals, supplied as general context, not proof of a fictional campaign. `services/api/assets/seed/manifest.json` records the illustrative stock image URLs/credits and non-endorsement boundary. This source audit did not independently recertify licenses or verify live external pages, change records or claim that every seed is present in the running database. Choose actual existing records in the UI when testing resumes.
