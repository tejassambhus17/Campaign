# Native product audit and redesign decisions

**Current evidence:** the subsequent targeted Product Quality Addendum is recorded in [PRODUCT_QUALITY.md](docs/PRODUCT_QUALITY.md) and its [independent native picture review](artifacts/product-quality/FLOW_REVIEW.md). Corrected editor keyboard/footer pictures pass their bounded scope in both themes at normal/enlarged text. The older reference audit below is history; it does not verify the later workflow changes, all native states, physical/human acceptance or a current video. Recording remains held.

## Current reference audit, October 16

The user rejects the earlier visual result. The new attached reference is the
authority for composition and appearance, while the PDF remains the authority for
business workflows. Its donation/banking terminology, provider balances, people,
organizations, photographs and four-destination navigation are not copied.

The image was opened directly and compared with fresh native incumbent captures
under `artifacts/reference-redesign/before/`: identity/search and compact mint
context, photography leading discovery, clear funding alongside campaign identity,
and a focused contribution summary are the useful relationships.

1. Home: `01-home.png` shows a large serif slogan and introductory controls before
   the first photo; featured funding is outside the first viewport. Replace the
   composition with compact identity/search/category discovery and deliberate
   featured/regular campaign presentations. Retain the actual product explanation,
   Explore/Create actions, configurable estimate and How It Works.
2. Detail: `03-detail.png` shows separate large navigation, photo, serif identity
   and distant story funding. Bring compact identity/funding close to the image,
   keep native share and retain public story/source/policy information and dock.
3. Checkout: `04-checkout.png` shows large repeated framing before the selected
   amount. Give the amount, included fee, ad budget and uncertain reach one compact
   financial composition with concise actions and explicit simulation language.
4. Appearance: actual source was fixed light mode. Both themes need semantic text,
   surface, action, boundary and feedback roles; settings must persist independently
   of authentication without remounting forms or navigation.

The first new installed batch is under `artifacts/reference-redesign/after-pass1/`,
bound to x86 candidate C451DDE4…. Root opened Light/Dark Home, Dark Detail and
Dark Checkout. The semantic dark surfaces and compact sans hierarchy are visible;
Home still fails the explicit first-viewport funding requirement at 393dp because
the mint intro/actions occupy too much height. This is a material correction,
not visual acceptance. An initially misnamed large-text checkout capture was
flagged for recapture rather than treated as valid evidence.

Source inspection is not native acceptance. The captured batch must test both
themes, 360/393/411 logical widths, normal and enlarged text, final-field
reachability, errors/privacy and the connected journey. A scoped actual Metro-off
cold launch loaded API data and retained Dark; later QA uses the restored preview.
The bounded correction is now confirmed in the installed black pass2 build.
Its 393dp Home shows funding above tabs, 360dp/font1.3 docks preserve full labels
and funding, and actual Gboard leaves the focused summary/cursor and actions
visible. The fresh independent [finish review](artifacts/reference-redesign/FINISH_REVIEW.md)
returned **ship** for all 12 supplied core phone captures with no material fixes.
This covers those visual surfaces, not unpictured workflows or refreshed video.
Human and screen-reader claims remain unverified. Historical findings stay scoped.

## Historical audit

October16,2026. Scope: current installed React Native APK/API36 emulator, existing source, and live reference website. Product Design audit uses screenshots captured in this run, not remembered screens. Impeccable critique/craft/native guidance informs the fixes. Full human/screen-reader usability is not inferred from images.

## Captured flow and findings

1. Creation entry/Basics: [entry](artifacts/redesign/before/01-create-entry.png), [Basics](artifacts/redesign/before/02-basics.png). Entry places promotional material above saved work. At393 logical width, the persistent header is about203dp and fixed actions about139dp; instructions/notices then push the first field to roughly397dp from the top. Reduce duplicate progress and move secondary Save/Preview actions into a compact toolbar; retain all five labels, required actions, autosave and validation.
2. Story/Visuals: [Story](artifacts/redesign/before/03-story.png), [fields](artifacts/redesign/before/03b-story-fields.png), [Visuals](artifacts/redesign/before/04-visuals.png). Resume/feedback/instructions dominate before editable content. Preserve section editing, media, sources and formatting; use clearer task groups. A normal scroll clipping boundary is visible, not proof of an overlapping sticky element.
3. Reach/Submit/Preview: [Reach](artifacts/redesign/before/05-reach-interim-theme.png), [Submit](artifacts/redesign/before/06-submit-interim-theme.png), [Preview](artifacts/redesign/before/07-preview-interim-theme.png). Captured after common theme changed; these are explicitly interim composition evidence, not original-color baselines. No independently proven preview overlap. Reduce header/footer occupancy and retest scrolling and keyboard with full preview.
4. Campaign reading: [Detail](artifacts/redesign/before/08-detail-interim-theme.png), [Story](artifacts/redesign/before/09-detail-story-interim-theme.png).285dp cover plus approximately180dp funding dock compete with reading. Repeated headline/intro fragments add length. Reduce cover/dock, give distinct article typography, suppress only exact duplicate header text, keep public sources and all funding/trust information.
5. Contribution: [Checkout](artifacts/redesign/before/10-checkout-interim-theme.png). Slogan, utility headline and large notice push amount entry roughly450dp down. Prioritize campaign identity, amount, total/fees/ad allocation/reach and the next action; keep simulation/privacy/refund disclosures.
6. Home/Explore/Activity/Profile: existing source confirms repetitive oversized editorial utility titles and decorative eyebrows. Fresh redesigned native captures must verify these surfaces; earlier artifacts are historical. The initial web-home.png capture was malformed during viewport settling and is rejected.05-reach.png has an HMR refresh bar and is also rejected.

Strengths to retain: photographic campaigns, transparent money model, safe five-tab navigation, actual persisted creation and guest contributions, explicit simulation boundaries, recipient-scoped Activity, meaningful contextual routes. Accessibility checks must measure contrast,48dp touch targets, font scale and keyboard geometry; screenshots alone cannot establish assistive usability.

## Directions considered

| Direction | Strength | Risk | Decision |
| --- | --- | --- | --- |
| Premium editorial | Strong storytelling and image rhythm | Oversized publication styling can crowd utility tasks, as the incumbent demonstrates | Keep editorial serif for actual stories only |
| Contemporary civic publication | Memorable ultramarine identity, credible campaign photography, clear participation and restrained typography | Needs discipline to avoid activist-poster decoration | Selected; scope expression to content and functional accents |
| Premium consumer finance | Excellent amount hierarchy, receipts and status clarity | Can become a generic financial dashboard and weaken the message | Borrow contribution clarity and compact operational controls |

The selected world is documented in DESIGN.md. No new app, platform or backend is needed. The official reference website was read and screenshotted for product meaning; its trust-score claim is not copied because the PDF prohibits inventing one. Official Material navigation and Expo font documentation plus Kickstarter backing and Monzo notification guidance were consulted for transferable patterns, not copied branding or screens.

## Acceptance still required

Capture and inspect every redesigned primary native screen, all five creation steps/preview, contribution review/confirmation, signed-in Activity/Profile/dashboard and reports. Test360/393/411 logical widths, font scale1.3, keyboard/Back, saved drafts, sessions, offline recovery and real backend-driven states. Record exact scopes and limits in UI_REDESIGN_PROGRESS.md and PROGRESS.md; do not promote requirement parents from appearance alone.
