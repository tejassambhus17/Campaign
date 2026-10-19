# Campaign creation assistance and Creator Studio

This October 19 frontend update adds four connected improvements to the existing
Expo/React Native application. It keeps the current mint/neutral-charcoal and
Light themes, package identity, cloud endpoint and backend. The original PDF
remains authoritative; the supplied reference images guide composition only.

## Campaign readiness

Review & Submit presents seven checklist groups: campaign basics, story,
supporting sources, visuals, audience/distribution, funding goal and policies.
Each shows **completed**, **missing required information** or **recommended
improvement**, derived from the existing `validateStep` rules. Recommendations
do not become new submission blockers.

Tapping an item returns to the relevant step and field. Groups with several
required issues expose individual destinations. The percentage counts completed
checklist groups, including optional improvements; it is neither a Trust Score
nor an approval or a prediction of approval. The normal submission validator and
review gate still decide what can proceed.

## Local writing suggestions

Basics and Story offer contextual, deterministic rules. Examples include tidying
spacing, reusing an existing headline/summary, inviting more specific context,
adding a learning/sharing action section, and pointing to source entry.

- Proposed edits are shown before explicit application; suggestions can be
  dismissed or left alone.
- Rules reuse the creator's text or a clearly visible generic audience-action
  invitation. They do not manufacture factual claims, statistics or source URLs.
- Application re-evaluates the rule against the current draft, preventing a stale
  suggestion from overwriting a newer edit or unrelated fields.
- Dismissals remain scoped to the active draft during editor navigation. They
  are temporary editor state, not a new durable preference or backend store.
  Relevant text changes can produce a different applicable suggestion.
- No AI API, model, microphone service or external writing service is involved.

Applying a suggestion is an ordinary editable draft change. Existing device
autosave and explicit account-saving behavior continue to apply.

## Instant preview

The visible Preview action is available beside Save Draft throughout the
five-step editor. It renders the current in-memory draft, including recent edits,
through the established `CampaignPreview`; it does not require Save Draft or
submission. The preview identifies itself as a draft and returns to editing.

Previewing does not create a campaign, submit a draft, approve content, start
funding or purchase advertising. Existing Story, advertising-placement and
complete-preview entry points remain connected to their established content.
The native preview remains a mobile campaign preview; no new desktop preview or
advertising integration is implied by the reference mock.

## Profile and Creator Studio

Signed-in Profile follows the supplied premium composition: actual identity and
editable avatar, account campaign/backed/saved counts, a Creator Studio entry,
grouped account destinations, direct Appearance/Currency preferences and Sign
out after all rows. Notifications uses the existing recipient-scoped Activity
query. Settings is not reintroduced. Completed guests retain their dedicated
Guest profile and explicit Sign in/Create account choices.

The Profile header uses a clean theme background in Light. Its subtle mountain
image is rendered only in Dark, avoiding a gray image strip behind the Light
identity area. Text remains scalable. The Studio invitation gives regular-size
copy and artwork separate horizontal space; at font scales above 1.2 or an
effective viewport width below 300 dp, decorative artwork is omitted and copy
uses the full area, with space reserved for the chevron. Functional text and
actions remain present at those sizes. The invitation's feature strip uses two
columns in that adaptive layout, retaining four columns at regular text sizes so
enlarged labels do not split inside narrow cells.

Creator Studio is a Profile destination, not a sixth bottom tab. It combines
existing account campaigns with the established account-scoped device draft
library:

- `/me` supplies account campaigns, review state and funding values.
- `useDraftLibrary(userId, true)` reads the same backend-scoped local draft key
  used by Create. Studio does not create a second store or import guest drafts.
- Linked device/account copies count once by stable campaign ID. Unsynced device
  drafts keep their own local ID. Foreign-owner records are excluded.
- Current linked account review/lifecycle metadata and reviewer feedback take
  precedence over stale local metadata. Local editable text, goal, saved step and
  resume reference remain unchanged. Ordinary drafts show a draft goal rather
  than funding progress; an active public campaign's private revision identifies
  its account funding separately and uses the account goal/raised snapshot.
- All, Drafts, Review and Funding show existing records and actual states.
  Funding is not relabelled as advertising delivery or “live” ads. Exceptions
  remain visible in All.
- Resume uses the actual local/account draft ID and saved step. Campaign and
  report actions reuse the existing routes. All campaign management retains the
  existing My Campaigns view and revision controls.
- Focus reloads the draft library after edits elsewhere. Loading/error states do
  not replace unknown totals with fabricated zero values.
- Profile → Studio → My Campaigns returns to Studio and then Profile. Existing
  authentication, receipt and nested Help/preference return paths remain.

Opening Studio, selecting filters, reading readiness or opening preview makes no
server mutation. Explicit existing actions such as account saving, submission,
profile editing and sign-out retain their original behavior and authorization.

## Preserved product rules

The connected, moving five-step icon rail remains:

**Basics → Story → Campaign & Ad Visuals → Reach → Submit**

Backward navigation, saved/resumable drafts, the 60-character campaign title,
separate cover/story/ad images, manual and labelled guided-demo creation,
creator-set funding goal at Submit, policy consent and submission for review are
preserved. Guest/account isolation and media ownership remain enforced by the
existing flows. Contributions fund message distribution; payment and advertising
delivery remain simulated. Funding completion still does not launch ads.

No backend rewrite, API addition, migration, seed, provider configuration,
deployment, AI integration or financial-accounting change is part of this work.

## Reference and implementation provenance

The user supplied **Photo 1.jpg** (Profile) and **Photo 2.jpg** (four feature
compositions). Mock identities, counts, scores and financial figures are not
application data. After the user rejected the initial low-resolution reference
crop, the Profile Studio invitation switched to `creator-studio-hq.png`, a
1254×1254 RGBA illustration produced with the built-in ImageGen tool. Its genuine
alpha background, original opacity and contain treatment avoid the previous
dark rectangle and washed-out Light presentation. It contains no numeric
campaign labels or functional controls. The earlier extracted crop is retained
only as historical reference and is no longer rendered;
[asset provenance](../apps/mobile/assets/images/profile/README.md) records both.
The Dark-only Profile header reuses the existing bundled mountain asset.

Implementation is concentrated in the existing creation editor/readiness and
preview components, the local `suggestions.ts`/`WritingSuggestions.tsx` modules,
and Profile's `ProfileOverview.tsx`, `CreatorStudio.tsx` and `studio.ts` modules.
The existing Profile navigation helper adds the private Studio destination.

## Verification and limits

During implementation, **27 focused Profile/Studio/support tests passed**,
including draft deduplication and isolation, stale submitted-device suppression,
real resume/report routing, focus reload, current review metadata, draft/private
revision financial presentation, canonical funding values, guest/auth
entry, parent Back, sign-out, preferences and preserved Help disclosures. The
focused checks also render normal, 130%, 200% and compact-width Studio
compositions, assert decorative-art removal and reserved text space, and verify
the clean Light versus decorative Dark header. These are source-level checks,
not a substitute for the final native comparison. The
final frontend suite passes **434 tests**. TypeScript and full source/plugin
ESLint pass without warnings.

The updated [Campaign.apk](../artifacts/creator-studio-20261019/Campaign.apk) is
**1.5.0 / code 11**, 68,616,686 bytes, signed with the existing dedicated Campaign
key and containing ARM64/x86_64 native code. Its SHA-256 is
`1d641f7126af94962a7da89cf8f06adba3247d4b359ce2417afc6f7c606420c4`.
All **28 package checks** pass. The same-key update was installed on the owned
API 36 emulator; its cold launch completed in 1517 ms without Metro or backend
USB forwarding.

Final native checks cover Profile in Dark, Light and increased text sizes
(130%/200%), including the clean Light header, transparent HQ artwork and
readable two-column enlarged-text feature strip. Existing Studio counts and
draft resumption to Submit were checked against actual QA data, including the
$125 goal and 57% readiness state. The
[delivery visual comparison](../artifacts/creator-studio-20261019/VISUAL_REVIEW.delivery.md)
limits its independent claim to the exact Dark, Light and scrolled Light/200%
images it inspected.

The five-step preview, suggestion apply/dismiss and checklist goal/policy
interaction checks belong to the original candidate's native pass. Eighteen
relevant creation inputs remain unchanged in the final build; that source
continuity is not a claim that every gesture was rerun on the final binary.
Additional final preview/Story-target confirmation is tracked in the
[artifact report](../artifacts/creator-studio-20261019/README.md), alongside exact
screenshots, binary bindings and remaining limits. See also
[PROGRESS.md](../PROGRESS.md) and [RELEASE_READINESS.md](../RELEASE_READINESS.md).
These bounded checks do not establish complete-app acceptance.

Human usability testing remains pending because no unfamiliar tester is
available. Compatible physical release acceptance is separate: the previously
authorized POCO has an older incompatible Debug signer, so this task must not
uninstall, clear its data or replace it with a differently signed release.
