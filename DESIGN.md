---
name: Campaign
description: Approved native mint-and-charcoal composition with compact discovery, shared notifications and user-supplied Campaign branding
colors:
  light-bg: "#FAFBFC"
  light-paper: "#FFFFFF"
  light-surface-raised: "#F0F3F4"
  light-ink: "#111919"
  light-text: "#273234"
  light-muted: "#566269"
  light-line: "#E2E7E8"
  light-outline: "#7C898C"
  light-primary: "#103C31"
  light-on-primary: "#FFFFFF"
  light-mint: "#E9FAF2"
  light-header: "#FAFBFC"
  light-header-text: "#111919"
  light-on-header-muted: "#566269"
  light-peach: "#F9EFE5"
  light-red: "#A82424"
  light-error-surface: "#FCECEC"
  light-warning: "#795516"
  light-focus: "#176541"
  light-progress: "#16865B"
  light-progress-track: "#E5ECE8"
  light-subtle: "#F0F3F4"
  light-disabled-surface: "#E6EBE9"
  light-disabled-text: "#596C60"
  dark-bg: "#000000"
  dark-paper: "#121212"
  dark-surface-raised: "#1C1C1C"
  dark-ink: "#F5F7F6"
  dark-text: "#E1E6E3"
  dark-muted: "#AEB8B3"
  dark-line: "#2C302E"
  dark-outline: "#7D8982"
  dark-primary: "#8EF4C5"
  dark-on-primary: "#08271D"
  dark-mint: "#1E1E1E"
  dark-header: "#000000"
  dark-header-text: "#F5F7F6"
  dark-on-header-muted: "#AEB8B3"
  dark-peach: "#392D23"
  dark-red: "#FFB0AD"
  dark-error-surface: "#402625"
  dark-warning: "#E9CF8D"
  dark-focus: "#A9DEC7"
  dark-progress: "#8EF4C5"
  dark-progress-track: "#303733"
  dark-subtle: "#191919"
  dark-disabled-surface: "#242424"
  dark-disabled-text: "#A3A3A3"
typography:
  home-title:
    fontFamily: "ManropeBold"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.1818181818181819
    letterSpacing: "-0.45px"
  profile-name:
    fontFamily: "ManropeBold"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.35
  unread-badge:
    fontFamily: "ManropeBold"
    fontSize: "9px"
    fontWeight: 700
    lineHeight: 1.3333333333333333
  page-title:
    fontFamily: "ManropeBold"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.28
    letterSpacing: "-0.5px"
  section-title:
    fontFamily: "ManropeBold"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.3157894736842106
    letterSpacing: "-0.4px"
  detail-title:
    fontFamily: "ManropeBold"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
  campaign-title:
    fontFamily: "ManropeBold"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.25
  editor-title:
    fontFamily: "ManropeBold"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.3529411764705883
    letterSpacing: "-0.35px"
  story-body:
    fontFamily: "ManropeRegular"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "ManropeRegular"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  secondary:
    fontFamily: "ManropeRegular"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5384615384615385
  label:
    fontFamily: "ManropeSemiBold"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4166666666666667
  button-label:
    fontFamily: "ManropeBold"
    fontSize: "15px"
    fontWeight: 700
  activity-title:
    fontFamily: "ManropeBold"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.45px"
  notification-sheet-title:
    fontFamily: "ManropeBold"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.35
  notification-title:
    fontFamily: "ManropeBold"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4285714285714286
    letterSpacing: "-0.15px"
  quick-notification-title:
    fontFamily: "ManropeBold"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.3846153846153846
    letterSpacing: "-0.15px"
  notification-body:
    fontFamily: "ManropeRegular"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  notification-time:
    fontFamily: "ManropeRegular"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4545454545454546
rounded:
  unread-badge: "8px"
  notification-sheet: "24px"
  progress: "3px"
  pill: "24px"
  button: "24px"
  field: "10px"
  context: "12px"
  card: "14px"
spacing:
  micro: "4px"
  small: "8px"
  control: "12px"
  card: "14px"
  group: "16px"
  gutter: "18px"
  section: "24px"
  screen-bottom: "28px"
components:
  unread-badge-light:
    backgroundColor: "{colors.light-primary}"
    textColor: "{colors.light-on-primary}"
    typography: "{typography.unread-badge}"
    rounded: "{rounded.unread-badge}"
    padding: "0px 4px"
    height: "16px"
  unread-badge-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
    typography: "{typography.unread-badge}"
    rounded: "{rounded.unread-badge}"
    padding: "0px 4px"
    height: "16px"
  button-primary-light:
    backgroundColor: "{colors.light-primary}"
    textColor: "{colors.light-on-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-secondary-light:
    backgroundColor: "{colors.light-mint}"
    textColor: "{colors.light-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.light-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-danger-light:
    backgroundColor: "{colors.light-red}"
    textColor: "{colors.light-paper}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  field-light:
    backgroundColor: "{colors.light-paper}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.field}"
    padding: "12px 15px"
  campaign-card-light:
    backgroundColor: "{colors.light-paper}"
    rounded: "{rounded.card}"
  pill-light:
    backgroundColor: "{colors.light-paper}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.pill}"
    padding: "12px 14px"
  pill-selected-light:
    backgroundColor: "{colors.light-primary}"
    textColor: "{colors.light-on-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 14px"
  button-primary-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-secondary-dark:
    backgroundColor: "{colors.dark-mint}"
    textColor: "{colors.dark-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.dark-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-danger-dark:
    backgroundColor: "{colors.dark-red}"
    textColor: "{colors.dark-paper}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  field-dark:
    backgroundColor: "{colors.dark-paper}"
    textColor: "{colors.dark-ink}"
    rounded: "{rounded.field}"
    padding: "12px 15px"
  campaign-card-dark:
    backgroundColor: "{colors.dark-paper}"
    rounded: "{rounded.card}"
  pill-dark:
    backgroundColor: "{colors.dark-paper}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.pill}"
    padding: "12px 14px"
  pill-selected-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 14px"
---

# Design System: Campaign

## Overview

**Creative North Star: "Campaign App UI Showcase" with the later Create and Home references**

The user's supplied [Campaign App UI Showcase](artifacts/showcase-redesign/reference.png) is the app-wide visual direction. The later [Create reference](artifacts/create-polish/reference.png) governs the creation editor and confirmation composition. The subsequent user-supplied Home PNG (`codex-clipboard-dec309d5-dc6c-4027-a9fc-9abb765afede.png`) governs Home composition only; its illustrative data and iPhone chrome do not become product facts or Android UI. Match its app-owned compositions, proportions, image treatment, navigation, typography, spacing and Light/Dark relationships as closely as practical. The reference does not authorize replacing genuine Android system chrome, mandatory PDF content or working product behavior with a picture. This remains a React Native/Expo application with the existing FastAPI, session, query and draft architecture.

The current implementation uses compact Manrope, image-led discovery, near-white Light surfaces, black/neutral-charcoal Dark surfaces and restrained mint actions. Discovery emphasizes a real campaign's image, identity, funding and next action. Utility screens use clear rows and native controls. Profile and authentication have dedicated compositions rather than embedding every account function into one dashboard.

**Current premium correction: VERIFIED within the bounded native review.** The user explicitly preserves this visual identity and requests targeted density, wrapping, notification, footer and performance corrections. The later Home reference replaces the first correction header with Campaign branding, a compact Good ideas deserve to be heard headline, search/filter controls, category strip and In the spotlight card. Its configured per-dollar reach example and complete product explanation remain in Create. Review. Amplify. below discovery. Shared compact unread badges, full notification disclosure, compact creation actions/adaptive summary rows, virtualized Explore and a labelled Profile Appearance entry refine existing components. The supplied poster replaces the old logo unchanged in launcher/splash; the later Auth-polish brief adds a separately documented transparent extraction and native wordmark. Previous APKs, screenshots and reviews do not establish acceptance of this later source; final current-source/binary/physical evidence belongs in [PROGRESS.md](PROGRESS.md) and [RELEASE_READINESS.md](RELEASE_READINESS.md). No design score, human acceptance or sustained-performance guarantee is claimed. Recording and external release stay held.

**Historical quick-notifications acceptance: VERIFIED within recorded local scope.** The Home bell's native latest-five sheet and complete existing Activity feed use shared authorized data/read state/badges. [Pass5 source checks](artifacts/notification-center/pass5/CHECKS.json), strict binary inspection and actual POCO install/Metro-off/API launch pass. Final compact error/retry, guest/account recovery, Light/Dark content sizing, contextual destination and all dismissal paths have exact evidence. [FINISH_REVIEW](artifacts/notification-center/FINISH_REVIEW.md) returns bounded `ship` after closing long failure copy and low-volume empty height; no actionable P0/P1/P2 remains in its matrix. Earlier candidate scopes remain separate. No human/TalkBack, every-device, automated similarity or sustained-performance approval is implied; recording and external release remain held.

**Historical Create/photo acceptance: VERIFIED within the recorded local review.** [FINISH_REVIEW](artifacts/create-polish/FINISH_REVIEW.md) returns bounded `ship` after the exact pass6 confirmation-to-detail correction; no open P0/P1/P2 remains in its matrix. Pass3/pass5 retain the creation, photo, Light/Dark, preview, selected font-scaling and submission observations; pass6 independently binds the final source/APK and focused route/runtime follow-up. [Native results](artifacts/create-polish/NATIVE_RESULTS.md) preserve exact scopes and comparisons. This is not a wholesale pass6 recapture, human approval, pixel-perfect score or formal engine gate. Straight progress connectors/plain decorative quote lettering and spare IME footer space remain P3 notes. Sustained performance, TalkBack/human testing, other devices, production release and the held video remain separate.

**Historical Showcase checkpoint:** the [independent finish review](artifacts/showcase-redesign/FINISH_REVIEW.md) compared pass4 physical surfaces and closed its sole preview-color finding with pass5 captures 05/06. Its bounded `ship` and [design QA](artifacts/showcase-redesign/design-qa.md) remain valid for that source/APK only. They do not verify the new creation/photo changes or imply human approval, pixel identity or a whole-surface automated engine gate.

History: the civic-publication ultramarine/large-serif direction and later green-tinted Dark result were rejected. The preceding black/quality passes established useful theme and workflow behavior, now preserved while the approved Showcase replaces their compositions. Source snapshots remain under `artifacts/checkpoints/before-reference-redesign-20261016-101133` and `artifacts/showcase-redesign/before-source`. Current build and acceptance status belongs in [PROGRESS.md](PROGRESS.md) and [RELEASE_READINESS.md](RELEASE_READINESS.md).

**Key Characteristics:**

- Compact native Manrope hierarchy, strong campaign imagery and clear funding groups.
- Near-white Light and pure-black/neutral-charcoal Dark, with mint reserved for actions and small accents.
- Five persistent tabs, compact native five-step creation controls, and focused account/detail views.
- User-selected private profile photos with truthful initials fallback and scoped persistence.
- Distinct Home quick-notifications sheet and complete Activity history over one private query and read state.
- Truthful server-backed identity, finance and activity; explicitly illustrative artwork and estimates.
- User-supplied complete Campaign artwork is contained unchanged for branding; it is separate from the app's neutral shared surfaces.

## Colors

Frontmatter values are extracted from `apps/mobile/src/lib/appearance.ts`. Native components consume the shared semantic `useTheme().colors`; prefixed Light/Dark names here are documentation keys. The `green` property remains a compatibility alias of `primary`.

Light uses `#FAFBFC` ground, white paper, `#F0F3F4` subtle/raised surfaces, `#111919` title ink and deep `#103C31` primary actions. The earlier solid mint Home masthead is replaced by the reference's quiet near-white header. Pale `#E9FAF2` is a contextual surface, not the default background.

Dark uses `#000000` ground/header, `#121212` paper, `#1C1C1C` raised and `#1E1E1E` contextual surfaces. Primary actions and progress use `#8EF4C5` mint with `#08271D` text. Large containers remain black or neutral charcoal. Error, warning and success surfaces preserve their existing semantic meanings.

**The Neutral Dark Rule.** Keep ordinary Dark backgrounds and containers black or neutral charcoal. Mint belongs to restrained actions, progress and accents; the decorative welcome raster is a specific branded artwork, not permission to recolor the app green.

**The Shared Appearance Rule.** Change the existing device preference through ThemeProvider. A theme change must preserve identity, navigation, editor state, drafts, filters and checkout values.

## Typography

All active interface type uses locally bundled Manrope Regular, Medium, SemiBold and Bold through the shared `Text` wrapper. Newsreader assets remain historical compatibility files, not the current heading voice. Native text scaling stays enabled.

Source roles: page title 25/32, Home headline 22/26, section 19/25, body 14/21, secondary 13/20 and label 12/17. The full discovery card title is 20/25; detail title 24/30; editor header 17/23; editorial paragraphs retain 16/26. Compact rows and finance metadata use smaller 10–13-unit text with explicit line height. Auth has a 30/38 form heading; its brand wordmark/tagline belong to the supplied raster. Profile identity uses 20/27. The 9/12 visual unread badge caps font scaling at 1.2 within its 16-unit height; the parent control announces the complete count and ordinary content remains scalable. Values are React Native logical units; portable frontmatter uses `px` notation.

**The Compact Type Rule.** Match the reference's compact hierarchy using Manrope and real text. Keep full titles, form instructions, financial meanings and primary actions readable at larger font scales.

## Layout

The shared Screen respects native safe areas, centers content to a maximum 640 logical units and normally uses an 18-unit gutter, 18-unit group gap and 28-unit bottom padding. Root/tab surfaces follow the active theme. Five-tab navigation uses `56 + max(bottomInset, 8)` units, 20-unit Ionicons and 9-unit Manrope labels. Android's status/navigation bars remain native; do not reproduce the reference's iPhone bezel, notch or status chrome.

Shared buttons and pills start at 48 units high; fields start at 52. Full campaign cards use a 160-unit cover and 13-unit content padding. Compact rows use a 96-by-132 cover slot, narrowing to 86 units below a 370-unit window width; detail uses a full-width image at `min(260, width × 0.6)`. These are actual current variants, not universal image dimensions. The native comparison must judge resulting proportions rather than treating the source values as proof of fidelity.

Create keeps its contextual header, five-icon connected progress row, scrollable body and Back/Next footer. Save Draft and the 48-unit icon-only Preview action share the upper action row; one centered save-status line follows the indicator. The active step title remains in the content instead of repeating in the editor header. Review rows reserve a 108–124-unit label column and stack label/value when effective content width divided by font scale falls below 280. Detail's scrolled funding dock and compact campaign action row stack below 350-unit width or above font scale 1.3. Backing's compact normal-layout footer sits outside the flexing scroll container and above the existing tab bar; its explanatory content ends with 24 units of clearance. Shared Android keyboard avoidance applies height only while the IME is visible, restoring ordinary flex layout afterward without remounting children; iOS retains padding behavior. Reachability and keyboard behavior require actual native checks, not source values alone.

Native review must compare the same campaign/state and theme against the supplied compositions, then check keyboard open/closed, long titles, safe areas, scrolling and selected enlarged text. Preserve the authorized physical phone's settings and data. Any additional device sizes must be identified explicitly in the evidence; an emulator or old screenshot is not a substitute for current physical-device proof.

## Elevation & Depth

The application is flat at rest. Semantic surfaces, one-pixel boundaries, spacing and clipped imagery establish grouping. Shared components have no new shadow or animated entrance system. Native loading, focus borders and immediate press opacity provide interaction feedback. The welcome illustration supplies restrained visual depth; it does not define a general gradient, glow or shadow token.

**The Flat Surface Rule.** Let images, typography, spacing and semantic surfaces carry hierarchy. Do not add decorative elevation that changes the approved compositions.

## Shapes

Buttons and category pills use a 24-unit radius. Fields retain 10, contextual containers commonly use 12, and shared campaign/activity cards use 14 with clipped overflow and semantic boundaries. Progress bars are six units high with a three-unit radius. Circular identity/notification treatments and the advertising preview frame are specific components, not new global shape scales.

## Components

### Shared controls and navigation

Buttons keep primary, secondary, ghost and danger variants, visible disabled/loading feedback and action-specific labels. Fields retain visible labels, hints/errors, 16-unit input text, focus border, secure entry and native keyboard appearance. Pill state changes fill and foreground while horizontal category lists remain scrollable. The stable destinations are Home, Explore, Create, Activity and Profile. A role-restricted reviewer view stays within Profile; ordinary accounts remain able to browse, create and back.

`UnreadBadge.tsx` is the shared visual badge for the Home bell and Activity icon: minimum width/height 16, four-unit horizontal padding, eight-unit radius and `99+` above 99. Zero has no visual badge. It consumes the same actual unread count; the enclosing 48-unit bell or tab announces the full count. Decorative badge text stays outside the accessibility tree, avoiding duplicate announcements and adjacent-tab overlap.

### Home and Explore

The later Home-only reference uses a restrained CAMPAIGN brand label, 22/26 Good ideas deserve to be heard headline, short discovery subtitle and bordered bell. The Home container uses 16-unit gutters, six-unit top padding and ten-unit groups. The shorter Search campaigns… placeholder stays within a shared search/filter height of `max(48, ceil(19 × fontScale + 20))`;  the latter opens Explore with current search/All category and its existing filter/sort panel expanded. Categories begin All, Environment, Health, Education, Public Policy, then retain the remaining categories in the horizontal strip. In the spotlight has a 17/23 section title and See all discovery action. The supplied logo asset remains unchanged elsewhere.

`features/home/SpotlightCard.tsx` is a Home-specific presentation; shared CampaignCard layouts elsewhere stay intact. It uses a 140-unit cover, a compact Featured · demo badge, 16-unit clipped corners, 12-unit content padding and 7-unit internal gaps. Category and real creator are separated by a neutral vertical rule at normal scale, stacking at font scale 1.25 and above. A full 17/22 title precedes a two-line summary, expanding to three preview lines above font scale 1.2. The smaller badge uses seven/three-unit horizontal/vertical padding and 12-unit corners. Shared Funding and CampaignStats retain real amounts, goal progress, estimated reach at goal, actual contribution count and recorded/planned days. Each shared stat places its icon/value in an inner row and its label below across the entire column, preserving the original font sizes and tabular numerals; the accessible parent announces the full label/value. This avoids spending label width on an adjacent icon. Pass6 compact Detail captures 15/16 confirm the corrected label columns in both themes. The full-width 48-unit action opens backing only for Available for Funding; otherwise it opens the actual campaign. For the existing fictional ocean seed only, a 140-unit overflow-clipped Home slot renders the exact raster at full-width native aspect ratio, anchored at the top to preserve the turtle head; all other covers use the shared CampaignCover. No raster bytes, campaign asset or detail/Explore image treatment is changed. The reference's fictional money, people and deadline are not copied.

A restrained Have a message to share? strip provides Start a campaign below the spotlight; it stacks below 370-unit width or at font scale 1.25 and above. Continue your draft and More to discover retain existing data and destinations. Create. Review. Amplify. below the feed preserves the full community-funded advertising explanation, the configured $1 illustrative reach example/uncertainty, review steps and simulation disclosure. Mandatory PDF content is relocated, not removed. This later explicit Home composition supersedes the earlier greeting/paired header actions for Home only; the approved palette, other screens and backend remain unchanged. The installed pass6 Home comparison and compact Stats correction are verified within the recorded normal/360dp-font 1.3 Light/Dark matrix; the newer Auth scope remains in progress.

Explore uses a compact heading/search/filter layout and a FlatList with six initial rows, six-row render batches and `windowSize: 5`; clipped subviews remain disabled. Memoized real filtering/sorting and a stable render callback avoid rebuilding the entire old ScrollView list. This is a targeted rendering change, not proof that jank is solved. Search, category, sort and backing availability controls retain their existing state and real results.

Each campaign card retains category, creator, title, editorial summary, amount/goal, funding progress, estimated goal reach and a clear backing action when open for funding. Compact titles and summaries wrap to two lines; financial amounts/percentages align with tabular numerals. Short Back campaign/View campaign actions reflect actual lifecycle eligibility and keep at least a 48-unit touch height. Closed states use the reading destination. Clickable card content opens the detail. The fictional ocean seed alone may use the generated cover; other campaign media remains its own.

### Campaign details, backing and journey

Detail leads with a full-width cover, overlay Back/Save controls, campaign identity, creator/category, summary, funding and three compact statistics. Story, Updates, Impact and Sources are functional sections. The primary backing/report action is visible in the overview; a contextual funding dock appears after scrolling. Sources preserve actual public titles/URLs and source context; sharing, following, policies and reports remain reachable.

Backing follows the reference's amount presets, custom amount, compact fee/allocation/estimate panel, explanatory reach block and Continue to payment footer. The footer uses eight-unit vertical padding, six-unit gap and a 48-unit minimum action; the separate scroll region retains all policies and simulation disclosures above it. Actual scroll-to-end and keyboard checks establish accessibility, rather than assuming the initial screenshot proves clipping. Values come from current configuration and the server transaction. Do not copy the reference's 10% fee, 12,000 reach, amounts, guarantees or security claims as product facts. Review, simulated outcomes, confirmation, private receipt and progress remain connected. Contributions fund message distribution, never a direct cause donation.

The vertical Campaign journey shows Under review → Funding → Preparing ads → Promoting → Completed with the actual current state and available recorded dates. Funding completion cannot imply advertising started. Reports continue separating original allocation, spend, retained fees, completed refunds, pending refunds, remaining budget, estimates and measured results when available.

### Creation and previews

The entry surface visually presents Basics → Story → Campaign & Ad Visuals → Reach → Submit. Continue opens the existing manual editor; the labelled voice-assisted guided demo/manual fallback remains available. No extra setup step is inserted between the five required steps. The actual editor preserves the visible step indicator, backward state, autosave, resumption, precise device/account save feedback, reviewer correction context and actionable Submit checklist. The creator sets the funding goal at Submit.

The later Create reference informs compact connected icon steps, category selection, the toolbar/paragraph composer, bounded upload area, cover/ad thumbnail arrangement, Reach controls, actionable review rows and the confirmation composition. `CreationUi.tsx` reuses shared theme/text and existing controlled draft fields. Its active progress marker is 32 units and inactive markers 24 within a consistent 32-unit slot, with 10/15 labels; category/format/actions and the actionable review-summary rows have at least 48-unit touch areas. Successful transient notices clear when changing steps so they do not occupy the next screen; failures remain available. Upload area minimum height is 152; larger and smaller thumbnails use 174 and 110-unit image heights. Text remains native/selectable where appropriate rather than baked into the artwork. Existing sources, ordered sections, formatting, caption/credit/statistic/action controls and placement previews remain available.

The PDF overrides conflicting illustration text: exactly five steps; title maximum 60; geography stays at Reach; goal entered at Submit; server-configured USD policy instead of copied INR figures; still JPEG/PNG/WebP up to 8MB rather than unsupported 100MB/video/documents. `FundingPolicies` from `creation/Preview.tsx` is reused in Submit and the complete preview, exposing current fee/allocation/refund/unspent-funds rules before consent. Submission confirmation says submitted for review and explains the next stages; it does not claim immediate publication or advertising. Its View Campaign action uses the existing `detailPath` route and opens the actual submitted record with backing closed; the invalid-route issue found in pass5 is fixed and physically checked in pass6. Decorative mountains and coast remain separate from user content and do not tint ordinary Dark containers.

Campaign page and Social ad tabs render the same live draft with separate editorial and advertising assets. The social preview uses a contained phone-like creative frame with a maximum width of 286 units. Image height is 150 units for social placements and 120 for Display; title typography is 16/21 and body copy is 12/18. It retains the selected placement and genuine draft CTA text and is labelled illustrative, with no live advertising. The creative itself intentionally keeps white paper, dark text and a deep-green CTA in both Light and Dark; the surrounding app canvas, segments and device frame follow the selected appearance. This fixed creative treatment matches the approved reference and represents ad content rather than an accidental unthemed app surface. Additional creatives and campaign story/source structures remain available. Previews must not become a static image of the reference or silently replace user-authored content.

### Activity and notifications

The Home bell opens a native quick-notifications Modal; the Activity tab keeps the full existing feed. Both use the existing recipient-scoped `useActivity` Query cache, shared read coordinator and `NotificationRow.tsx`. The bell/tab badges derive from the same actual unread items. No duplicated events, backend, persistent store or competing theme is introduced. The server's existing feed cap is300 newest events; unlimited pagination is not implemented.

The sheet has a 20/27 Manrope heading, actual unread count, Close/Refresh, Mark all as read and persistent View all activity. It lists the newest five authorized events, each with contextual Ionicon, title, campaign context where supplied, up to two body lines, relative time and unread indicator. It fits content and caps height at the smallest of 84% of the current window, 800 units and the window less top inset/24-unit clearance; width caps at 640. The list uses `flexGrow:0`/`flexShrink:1` so short feeds stay compact and longer feeds scroll while the footer remains reachable. The paper surface is white in Light and neutral `#121212` in Dark, with 24-unit top corners, outline-colored grip and 56% black backdrop. Bottom safe-area inset protects the footer. No illustration, gradient or decorative shadow is added.

Activity uses a 24/30 heading, horizontal 48-unit filter chips and a virtualized Today/Yesterday/Earlier list. All, Updates, Contributions, Unread and Account remain available, along with preferences, refresh and followed-campaign progress. Shared rows use 36-unit contextual icon containers, subtle bottom dividers, title 14/20 (quick sheet 13/18), campaign context 12/17, body 12/18 and timestamp 11/16. Unread titles use bold with a mint dot; read rows use semibold and a contextual chevron. The independent read target is 48×48 with 8-unit separation from the primary row action; body/title previews wrap while accessibility labels retain the complete copy and exact timestamp. Dynamic native text scaling is retained rather than capped.

The premium correction uses three body preview lines in Activity and two in the sheet. Read full update appears only when natural native line measurement proves the heading, campaign context or body exceeds its preview limit; Show less collapses the same mounted event. Short events retain a compact 24-unit timestamp row instead of a redundant disclosure action. Temporary invisible natural-line probes use the exact text width/font/appearance, stay outside accessibility/touch/layout height and disappear after measurement. In-place expansion preserves navigation/read actions and reveals complete content. Pass2 SHEET_INTERACTIONS.json records actual short-event omission and truncated-event expansion/collapse at 360dp/font 1.3; these unchanged row modules retain that candidate scope.

Existing safe destinations remain: campaign details, creator correction context, owned receipt/history, progress/report or account settings. Read writes never delay destination navigation. The quick sheet finishes dismissal before routing and rechecks its captured session; Home and its scroll state stay mounted. Close, backdrop, Android Back and downward header drag use one dismissal path; short drags return to rest. Pass3 stabilizes the PanResponder, claims header touch starts through bubbling so child buttons remain usable, and keeps failure feedback outside the scrolling list. Opening uses 240ms translation/180ms dimming, closing 190/150ms and cancelled drags 180ms; reduced motion uses 0ms and listens to live OS preference changes. [Final pass5 interactions](artifacts/notification-center/pass5/FINAL_INTERACTIONS.json) exercise all dismissal/reopen paths, Home preservation, contextual navigation and functional zero-transition behavior; no frame-duration measurement is inferred.

Guest/loading/empty/error/stale-refresh states are compact and explicit. Guests issue no private feed request; sign-out clears queries and hides the sheet's private content. Shared read actions guard current account/API session, deduplicate existing requests and limit batch concurrency to 3. Mark all reads the unread snapshot captured at the tap, keeps successful writes if others fail and leaves later arrivals unread. Background refresh cannot overwrite a confirmed read with an older unread result. Preferences and server authorization remain unchanged; no push/email integration is implied.

### Profile, welcome and authentication

Profile uses a labelled top-right Appearance entry showing the current preference, a deliberately selected private photo or initials derived from the actual account, aligned name/capability line, Edit Profile and three compact truthful tiles: Campaigns, Backed and Saved. The entry opens the shared System/Light/Dark settings instead of silently cycling a binary switch. No follower number or photograph of the reference's person is fabricated. Icon-and-chevron rows open My Campaigns, Backed Campaigns, Payment History, Saved Campaigns, Notifications, Settings and Help & Support. The reviewer row appears only for the reviewer role. Details, receipts, filters, settings, help/legal information, local connection controls and sign-out remain connected within the account flow, with contextual native Back behavior.

`features/profile/Photo.tsx` keeps the overview avatar at 76 units and Edit Profile avatar at 96, with a camera badge and accessible choose/change/remove controls. Photo changes save immediately through authenticated `/me/avatar`; cancel leaves the prior photo intact, loading blocks duplicate actions, failures retain actionable feedback and initials remain a readable fallback. The server validates/normalizes JPEG/PNG/WebP to at most 512×512 and strips metadata. Private bearer-owned BLOB storage and account/server/version-scoped in-memory queries keep images out of public campaign media; sign-out clears queries and stale session completions cannot update another account. The system picker may create a temporary crop file. Photos are used in private account views only, never fabricated or published as creator portraits.

The later Onboarding reference and Auth-polish steering govern Welcome and Sign In. Welcome uses horizontal branding, a 28/34 headline, amplification explanation, three manually selected landscape slides and filled/outlined entry actions. Its image is 176 units on narrow/short/enlarged-text windows and 190 otherwise. Login/Register use compact centered branding, a 24/30 heading, 64-unit icon/label/input cards and a 50-unit primary action. Actual email/password/name validation, secure/reveal control, keyboard Next/Go, API errors and busy feedback remain. Remember me is functional and initially unchecked. Guest browsing, mounted Help form state and focus-scoped Android Back remain. The guest Profile auth surface hides its tab bar while retaining all five registered destinations. Auth no longer contains a theme picker or recovery button; a static sentence truthfully explains unavailable local password recovery. Appearance remains available through existing Help/Profile settings. Android Auth keeps the guest Screen’s extra height avoidance disabled and measures only native IME overlap at the stable AuthBackdrop outer view. The bottom inset is the maximum of safe-area padding and actual overlap; an already-resized window adds no duplicate height. Frame revisions and focus/active guards reject stale async measurements, hide/blur clears overlap and layout changes remeasure. Android drags/taps keep the keyboard open while the form scrolls; Help explicitly dismisses it and restores the usual Screen avoidance for Help fields. iOS keeps its existing behavior. Actual pass12 screenshots and AUTH_FUNCTIONAL.json verify the focused fields and complete primary action within the resized/occluded viewport, including four compact theme/form combinations.

`features/Brand.tsx` now uses `campaign-megaphone-transparent.png` for Auth: 70-unit horizontal Welcome icon, 60-unit compact form icon, native Campaign text and tagline in both themes. The original complete poster remains unchanged for full-artwork, launcher and splash use. The transparent extraction is a separate 1254×1254 RGBA PNG, 622,358 bytes, SHA `F6DA62459FD81DD47DA127B3FA2892CE0855A703A2A76652FC5642EF0F2F6395`. [Extraction provenance](artifacts/premium-quality/brand-extraction/PROVENANCE.json) records built-in image-generation background removal and its limits: this is a synthesized extraction, not a byte/pixel-identical cutout. The original poster remains SHA `C88BA8F63DE5C155664591DA81EB9C146FCAA92C3913323974D3577E174031F3`; whole-poster icon/favicon/black 160-unit contained splash configuration is unchanged. No Python raster editing, generic replacement logo or monochrome asset was introduced. Actual pass12 normal/compact Light/Dark rendering is included in the independent bounded review; no pixel-identical extraction claim is made.

Remember me is unchecked initially. Login passes its explicit boolean to Session; unchecked removes any older durable session before publishing the new memory-only identity, so a process restart returns to guest without deleting drafts. Checked login and registration retain existing SecureStore persistence. Serialized writes, authentication generation and API-session guards prevent late writes/logout/expiry cleanup from crossing a newer identity. Storage failure is visible and does not publish the new identity. Eight meaningful storage/provider tests cover persistence, failure and races; actual pass12 checked/unchecked process restarts are verified in AUTH_FUNCTIONAL.json.

### Appearance persistence

The later explicit Dark-default instruction supersedes the former System fallback. The same device-scoped `campaign:appearance:v1` store now starts/restores Dark only when its saved preference is absent, invalid or unreadable. Existing explicit Light, Dark and System values are preserved; System still follows live OS changes. Signed-in Profile/Settings and guest Help retain all three choices, independently of identity and drafts. No Auth-only theme store or forced overwrite is added. ThemeProvider remains above session/query/navigation; changes and sign-out preserve forms, filters, checkout and the device preference. Tests cover missing/invalid-preference Dark fallback. Actual pass11 System switching and pass12 preference/account restart preserve existing choices; no fresh-install test or user-data clearing is claimed.

### Raster provenance

The Showcase rasters are local under `apps/mobile/assets/images/showcase/`, generated with the built-in image generation tool on October 16, 2026. Exact prompts, dimensions and SHA-256 hashes are recorded in [Showcase provenance](artifacts/showcase-redesign/ASSETS.md). The later creation assets use the same tool and have separate [Create provenance](artifacts/create-polish/ASSETS.md).

| Asset | Actual size | Implemented use |
| --- | --- | --- |
| `campaign-mark.png` | 1254 × 1254, transparent | Historical generated welcome/auth mark, retained as an old asset but replaced in current branding by the user's complete PNG. |
| `welcome-background.png` | 841 × 1870 | Dark decorative welcome artwork only; not the ordinary Dark surface palette. |
| `ocean-turtle.png` | 1536 × 1024 | AI-generated illustrative discovery/detail cover for fictional `demo_ocean` only; not campaign evidence, verified photography or an ad-asset replacement. |

Additional creation rasters live under `apps/mobile/assets/images/create/`: `story-mountains.png` and `confirmation-coast.png`, each 1774×887 RGB PNG. They are AI-generated fictional decorative scenery, with native text rendered separately and artwork excluded from the accessibility reading order. Mountains are bottom-anchored in a shallow Story footer; the coast frames confirmation. Both also appear in the labelled Welcome illustration carousel, where their explicit image accessibility descriptions distinguish that use from the decorative editor scenery. Their bounded dark artwork is intentional in Light and never changes shared palette tokens. Neither asset populates a campaign story, cover or ad field automatically.

The user's composite is a design reference, not an implemented screen capture. Existing creator photos/media and evidence remain separate. The ocean detail disclosure and image accessibility description identify the generated cover.

The later user-supplied complete brand image is copied unchanged to `apps/mobile/assets/brand/campaign-logo.png`: 1254×1254 PNG, 1,583,508 bytes, SHA-256 `C88BA8F63DE5C155664591DA81EB9C146FCAA92C3913323974D3577E174031F3`. [Provenance](artifacts/premium-quality/BRAND_ASSET.json) records exact source-byte identity and no image edits. Its dark textured background, dimensional megaphone, Campaign wordmark and tagline are baked artwork; this specific authorized asset does not recolor ordinary Light/Dark surfaces or invent financial/identity data. That original poster was not edited. The subsequent Auth-polish brief separately authorized a transparent extraction; its method/hash and synthesis limitations are recorded above.

### Documentation and acceptance

**Current premium pass12 — VERIFIED within the recorded local scope:** [Fresh source gates](artifacts/premium-quality/pass12/SOURCE_CHECKS.json) pass **91/91 in 1044.901ms**, TypeScript/full-source ESLint/diff/public Expo config. [Strict inspection](artifacts/premium-quality/pass12/BUILD_INSPECTION.json) binds **86 inputs / 45 compiled modules / six artworks / 15 native branding resources** to the **48,623,759-byte APK**, SHA `DF4C95CB9F6555DE6E5637DCF18989B7E41042E0D978F7F908EFA0697FDAEDF9`. The installed package hash matches. [Actual Metro-off launch](artifacts/premium-quality/pass12/METRO_OFF.json) is **COLD 1,418ms / wait 1,431ms**, with preserved data and a separately healthy USB-local API. [Independent finish review](artifacts/premium-quality/FINISH_REVIEW.md) closes the opened Home/Auth/keyboard findings. Earlier matrices retain [their exact scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json); no whole-app final-hash rerun or human/production acceptance is inferred. Recording/external release stay held.

[Frozen source](artifacts/premium-quality/pass12/SOURCE_INPUTS.json) digest: `6e92c273b2ca5ddea4a99119d7a8357b8cfab54d54bf365c9f31b5697cf47726`. [Final source verification](artifacts/premium-quality/pass12/SOURCE_VERIFICATION.json) and strict inspection bind the same 86 mobile/13 backend inputs; original 25-page PDF SHA remains `6A5443253C33997A7361BA91BFF4C04DAF02743ADF23CB47F7E4F1C3789E3290`.

The unchanged 13-input backend digest `622e55ee66c0872fb4a6e0a7d1f48b873e9ad0dd145fc6693b4a3d2eaa8bdecf` retains this task’s [35/35 isolated tests in 14.300s](artifacts/premium-quality/pass1/BACKEND_CHECKS.json). Unchanged dependencies retain pass1 online Expo/Doctor 20/20 evidence; the later offline dependency check warns its validation is unreliable. No unnecessary API/online-metadata rerun, dependency, migration or build-command change is claimed. Binary inspection verifies Hermes, real USB-local API assignment, ARM64-only, Debug-v2/non-debuggable, assets/fonts/licenses and pre-build freezes; it does not establish installed behavior.

[Candidate scopes](artifacts/premium-quality/CANDIDATE_SCOPES.json) retain every freeze, exact diff, build and physical matrix under its own hash. Pass1 covers creation; pass2 connected discovery/backing/Activity/report workflows; pass6 closes Home/compact Stats; pass7 proves optional Remember restart; pass9 captures the transparent-brand Auth composition; pass10 proves actual registration/isolation/restart; pass11 retains System/form checks. Pass3 was built but neither installed nor strictly inspected; pass5 built/inspected but never installed; pass8 was superseded unbuilt. Nine Create files remain source-identical from pass1, Home/Spotlight/Stats/Explore from pass6 and Session/writer from pass7, while later Screen/Auth/Profile keyboard changes are explicitly listed. This is source binding and bounded native evidence, not a wholesale final-hash rerun.

[Pass12 native actions](artifacts/premium-quality/pass12/AUTH_FUNCTIONAL.json) verify full Login/Register buttons while the IME remains open in all four compact Light/Dark combinations, plus normal Dark Login; measured targets are 49.82–50.18dp. The native Register button surfaces invalid-email feedback. Guest browsing opens the five-tab public app and hides private notifications. Unchecked login returns to guest after process restart; checked login restores the original account/photo and 10/3/1 private counts. Inline mode links, hardware/header Back, Help/form preservation and saved draft-library access work. The held Ocean awareness preview QA draft was viewed without editing/submission. System preference and account restore through restart; Dark/original display are restored afterward. Exact captures 00–33 remain under pass12, with registration/isolation and live System follow-up also retaining their earlier pass10/11 scopes.

[Final diagnostics](artifacts/premium-quality/pass12/FINAL_DIAGNOSTICS.json) record 46 current-PID log lines with no matching fatal/JS error markers and confirm the installed APK hash. Package-specific exit/memory/frame captures remain bounded observations, not crash-free or sustained-performance guarantees. Original 1080×2400/density 440/font 1.17/IME 1/night mode and animation 0.5 values are restored. [Service restoration](artifacts/premium-quality/pass12/SERVICES_RESTORED.json) confirms the same Campaign API healthy and owned Metro 8081 running again, with only the selected phone’s USB 8787 reverse; an initial bounded health timeout resolved without duplicate restart. No unrelated device/service or recording action is implied.

The final review is bounded to actual opened captures and recorded interactions. Compact submission confirmation remains explicitly unverified. Human/TalkBack, additional hardware/orientations, fresh-install default behavior and sustained smoothness remain separate; preserved existing Light/System preferences are verified without clearing user data. Password recovery is truthfully unavailable locally. Production signing/hosting, current Telegram cutoff confirmation, the held video and external submission remain open or held. USB-local backend reachability is not hosted availability; no score or fictional engine verdict is used.

The historical quick-notifications/Activity feature is **VERIFIED within its bounded local matrix**. [Pass5 checks](artifacts/notification-center/pass5/CHECKS.json) bind 81/81 mobile tests in 898.5777ms, TypeScript/lint/diff exit 0 and 78-input freeze `4ce5ef5d…06535`; unchanged backend 35/35 in 13.391s and strict binary checks pass. [Exact launch](artifacts/notification-center/pass5/METRO_OFF.json) is cold 1,189ms/wait 1,211ms with Metro absent and healthy USB-local API. Pass2 retains read synchronization/receipt/preferences/compact Light; pass3 retains six dismissal checks, batch 19→16→0, Home/compact Dark/reduced-motion/guest+B isolation. Final pass5 adds actual singular read failure/retry, B→guest→A recovery, compact content sizing, Light/Dark five-event scroll, contextual campaign and all dismissal/reopen paths. The [finish review](artifacts/notification-center/FINISH_REVIEW.md) closes its two P2 visual findings. [Final diagnostics](artifacts/notification-center/pass5/FINAL_DIAGNOSTICS.json) find no matching fatal in 208 current-PID lines; mixed QA frames 243/3,904 janky (6.22%), p95=17ms/p99=65ms are bounded observations. A separate [eight-transition Home↔Activity sample](artifacts/notification-center/pass5/NAVIGATION_FRAME_SAMPLE.json) adds 22/390 janky frames (5.64%), without a sustained-performance claim. [Services/settings](artifacts/notification-center/pass5/SERVICES_RESTORED.json) are restored. Earlier matrices were not repeated wholesale; native empty evidence is the cleared Unread filter, with zero-record layout source-inspected. Human/TalkBack, more hardware/orientations and sustained performance remain unverified; external release and recording stay held.

Historical Create/photo design verification is **VERIFIED within the bounded native matrix**. The [independent review](artifacts/create-polish/FINISH_REVIEW.md) preserves pass3/pass5 pictures, source-bound target measurements and pass6 correction captures rather than labelling every screen as a final-build rerun. Pass6 `383F23C2…69184` is independently inspected and installed on the authorized POCO; [Metro-off proof](artifacts/create-polish/pass6/METRO_OFF.json) records cold 1,483ms and separate healthy USB-local API. The historical [Showcase comparison](artifacts/showcase-redesign/FINISH_REVIEW.md) remains separate. No human acceptance, automated similarity score or crash-free/smoothness guarantee is claimed. The sampled frame counters and limited logs remain diagnostic evidence; TalkBack/human testing, additional devices, signing/hosting and recording remain open or held.

## Do's and Don'ts

### Do:

- **Do** use Showcase app compositions and the later Create reference, preserving the PDF when illustration text conflicts.
- **Do** keep photos user-selected, private and owner-scoped; use real initials when absent.
- **Do** keep the Home bell a quick view and Activity the complete existing feed, with one authorized query/read state and honest partial-failure feedback.
- **Do** keep ordinary Dark backgrounds pure black or neutral charcoal and use mint for restrained actions and accents.
- **Do** preserve all mandatory PDF workflows, truthful finance, private identities, guest browsing and labelled simulations.
- **Do** use actual account data, campaign content and current backend configuration instead of reference figures or people.
- **Do** compare the installed Android candidate with the same reference state and theme before declaring fidelity complete.
- **Do** preserve user data, theme continuity, draft state, safe areas and keyboard usability through the redesign.

### Don't:

- **Don't** replace native screens with a flattened reference image, copied device chrome or a web-only implementation.
- **Don't** reintroduce green-tinted Dark grounds, ultramarine actions or the rejected large-serif system.
- **Don't** invent follower counts, verification badges, trust claims, fees, payment guarantees or measured reach.
- **Don't** let theme changes reset navigation, identity, forms, drafts, filters or contribution amounts.
- **Don't** use old APK/screenshots, generated artwork or documentation previews as current native acceptance.
- **Don't** resume recording, cloud setup or submission without the applicable human authorization.
- **Don't** fabricate guest notifications, duplicate notification stores/endpoints or let stale read/navigation callbacks cross an account/session change.
