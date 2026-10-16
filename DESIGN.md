---
name: Campaign
description: Compact, image-led mobile design for community-funded message amplification
colors:
  light-bg: "#F7FAF8"
  light-paper: "#FFFFFF"
  light-surface-raised: "#EEF4F0"
  light-ink: "#17221D"
  light-text: "#24362B"
  light-muted: "#52655A"
  light-line: "#D5E0D9"
  light-outline: "#73867B"
  light-primary: "#17221D"
  light-on-primary: "#FFFFFF"
  light-mint: "#E4F3EB"
  light-header: "#BCE6D5"
  light-header-text: "#17221D"
  light-on-header-muted: "#375B49"
  light-peach: "#F9EFE5"
  light-red: "#A82424"
  light-error-surface: "#FCECEC"
  light-warning: "#795516"
  light-focus: "#176541"
  light-progress: "#287452"
  light-progress-track: "#D4E9DE"
  light-subtle: "#EDF3EF"
  light-disabled-surface: "#E0E7E2"
  light-disabled-text: "#596C60"
  dark-bg: "#000000"
  dark-paper: "#121212"
  dark-surface-raised: "#1C1C1C"
  dark-ink: "#F5F5F5"
  dark-text: "#E5E5E5"
  dark-muted: "#B0B0B0"
  dark-line: "#303030"
  dark-outline: "#7D7D7D"
  dark-primary: "#A9DEC7"
  dark-on-primary: "#111111"
  dark-mint: "#1E1E1E"
  dark-header: "#151515"
  dark-header-text: "#F5F5F5"
  dark-on-header-muted: "#B8B8B8"
  dark-peach: "#392D23"
  dark-red: "#FFB0AD"
  dark-error-surface: "#402625"
  dark-warning: "#E9CF8D"
  dark-focus: "#A9DEC7"
  dark-progress: "#A9DEC7"
  dark-progress-track: "#363636"
  dark-subtle: "#191919"
  dark-disabled-surface: "#242424"
  dark-disabled-text: "#A3A3A3"
typography:
  page-title:
    fontFamily: "ManropeBold"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.28
    letterSpacing: "-0.5px"
  section-title:
    fontFamily: "ManropeBold"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.4px"
  detail-title:
    fontFamily: "ManropeBold"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2692307692307692
  campaign-title:
    fontFamily: "ManropeBold"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
  editor-title:
    fontFamily: "ManropeBold"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3333333333333333
    letterSpacing: "-0.35px"
  story-body:
    fontFamily: "ManropeRegular"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "ManropeRegular"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5333333333333334
  secondary:
    fontFamily: "ManropeRegular"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ManropeSemiBold"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4166666666666667
  button-label:
    fontFamily: "ManropeBold"
    fontSize: "15px"
    fontWeight: 700
rounded:
  progress: "3px"
  pill: "8px"
  button: "9px"
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

**Creative North Star: "The Clear Signal"**

Campaign uses a compact consumer mobile composition: campaign photographs lead discovery, clear sans-serif type gives a message its identity, and concise funding groups make the next action legible. Light pairs a mint identity area with charcoal actions. Dark uses pure black and neutral charcoal grounds, with mint reserved for accents, progress and actions.

This is the source-derived replacement for the rejected civic-publication ultramarine and large-serif system. The supplied three-screen reference informed proportions and hierarchy; its photographs, people, banking language and donation claims are not Campaign assets or product claims. The user subsequently rejected green-tinted Dark surfaces; that correction is binding while the existing Light palette stays unchanged.

This document records the React Native implementation on October 16, 2026, not user approval or completed native acceptance. It is grounded in `apps/mobile/src/lib/appearance.ts`, `theme-styles.ts`, `theme.tsx`, `components/ui.tsx` and sampled routes. The prior system remains in `artifacts/checkpoints/before-reference-redesign-20261016-101133`. Current build, capture and acceptance evidence belongs in `PROGRESS.md` and `RELEASE_READINESS.md`.

**Key Characteristics:**

- Compact Manrope hierarchy and image-led campaign discovery.
- Unchanged mint-and-charcoal Light; black-and-neutral-charcoal Dark.
- Shared semantic surfaces, visible fields and restrained native feedback.
- Five persistent tabs, content-aware docks and scalable native text.

## Colors

The frontmatter records the source palette by semantic role and scheme. `light-*` and `dark-*` are documentation keys for the matching `lightColors` and `darkColors` properties; native code consumes `useTheme().colors` rather than these prefixed keys. Portable `px` sizes in this file represent React Native logical units, not device pixels.

### Primary

- **Charcoal action:** Light primary actions, links and active controls use `light-primary`, with `light-on-primary` text.
- **Mint accent:** Dark actions, active controls, focus and progress use `dark-primary`, with `dark-on-primary` text on filled actions. The existing `green` property is a compatibility alias of `primary` in each palette.
- **Contextual mint role:** `mint` is a semantic contextual surface: pale mint in Light and neutral charcoal in Dark. Its name must not be interpreted as a requirement to tint Dark containers green.

### Neutral

- **Application ground:** `bg` belongs to root, navigation content and loading screens; `paper` belongs to shared cards, fields, docks and tabs. `header` owns the Home identity area, editor header and checkout identity/estimate groups.
- **Surface steps:** `surfaceRaised` records the defined palette role; sampled shared cards currently use `paper`. `subtle` distinguishes read Activity items. Do not manufacture extra elevation levels.
- **Text hierarchy:** `ink` carries titles and high-emphasis figures; `text` carries body copy; `muted` carries secondary copy. Headers use `headerText` and `onHeaderMuted` as a matched pair.
- **Boundaries:** `line` is a separator/card boundary, `outline` makes fields and unselected appearance controls visible, and `focus` replaces the field outline during focus.
- **Progress and disabled states:** `progress` sits on `progressTrack`; disabled buttons use `disabledSurface` with `disabledText`.

### Feedback

Error notices use `errorSurface` with `red` text and field boundaries. Context notices use `peach` with `ink`; success notices use the contextual `mint` surface. Exceptional campaign status uses `warning`. These roles communicate meaning and are not alternative brand palettes. The source also defines unused/reserved roles; this document does not invent component usage for them.

**The Neutral Dark Rule.** Dark backgrounds, headers and large containers use their neutral semantic roles. Mint belongs to restrained accents, progress and actions; never replace the neutral grounds with green-tinted surfaces.

**The Shared Appearance Rule.** Resolve colors through the existing theme provider. Appearance is a device preference independent of identity, drafts and payments; a theme change must preserve the current workflow.

## Typography

**Title and body family:** Manrope. The shared Text wrapper selects `ManropeRegular`, `ManropeMedium`, `ManropeSemiBold` or `ManropeBold` from an explicit family or requested weight, then normalizes native fontWeight. No separate display face is active in the sampled hierarchy. The bundled Newsreader files and licenses remain for historical compatibility; they are not the current title system. Native font loading is local, with no runtime font download.

The frontmatter records actual roles, rather than a new proportional ramp. Shared page titles use 25/32, section titles 20/27, body 15/23, secondary copy 14/21 and labels 12/17. Campaign card titles use 20/26, detail titles 26/33 and editorial paragraphs 16/26. Editor titles use 18/24; compact metadata is commonly 11/16 or 12/18. These smaller sizes identify metadata and qualification, not a replacement body style.

Use the regular face for prose, medium/semibold for labels and bold for titles, figures and primary actions. Card and utility titles remain compact. The native wrapper leaves text scaling enabled; no fixed maximum font scale is established here.

**The Compact Type Rule.** Use the implemented Manrope hierarchy for both storytelling and tasks. Do not restore the superseded large-serif or ultramarine direction.

## Layout

The shared Screen is a safe-area phone canvas with full available width, a centered maximum content width of 640 logical units, an 18-unit gutter, an 18-unit content gap and 28-unit bottom padding. Screen-specific discovery and editorial layouts reuse the same maximum width with their actual local padding. The spacing frontmatter lists recurring observed steps; it is not a mandatory mathematical grid.

Primary controls start at 48 units high and shared fields at 52. Fields and buttons grow with their content. Home uses a compact identity/search header, horizontal category pills, a photographic campaign card and compact following rows. The full campaign card uses a 150-unit cover, 14-unit content padding and compact funding; detail uses a 220-unit cover. These are component variants, not universal image dimensions.

Five-tab navigation reserves `60 + max(bottomInset, 8)` units. Funding and checkout docks sit in normal layout above it; detail's dock content is centered to 608 units. Detail and checkout switch their action rows to columns when fontScale exceeds 1.15 or width is below 350. Create applies that rule to Save/Preview and also stacks them in Campaign & Ad Visuals. The editor retains its five-step indicator, fixed contextual header/footer and scrolling content. Shared keyboard avoidance uses iOS padding and Android height with the safe-area top offset; this source behavior still requires installed keyboard verification.

A 393-unit normal-text Home must keep campaign imagery, identity and funding in the first viewport under the direction contract. This is a Home acceptance target, not a template for every utility screen. Larger text can scroll naturally; it must remain reachable. The required inspection set is 360/393/411 logical widths, text scale 1.3 and critical keyboard states; that test plan is not a claim that the corrected candidate has passed.

## Elevation & Depth

The system is flat at rest. Semantic background/paper/header/context surfaces, one-pixel separators and clipped photography establish grouping. Shared components define no shadows, elevation tokens, gradients, animated entrance sequences or easing/duration scale. Native loading indicators, field focus, immediate state feedback and press opacity provide the observed interaction feedback. Ordinary buttons use pressed opacity 0.8; several row/icon actions use 0.75. No hover animation is specified for native controls.

**The Flat Surface Rule.** Establish hierarchy with semantic surfaces, one-pixel boundaries, spacing and photography. The shared native components define no shadow or motion scale.

## Shapes

Campaign cards have broadly rounded corners; fields, contextual groups, pills and buttons use their distinct source radii in frontmatter. Shared cards clip their images and content with a one-pixel semantic line border. Pill selection changes fill and text rather than silhouette. Progress bars are six units high with the three-unit progress radius. Context groups commonly use the 12-unit radius; circular notification/avatar treatments remain component-specific rather than a second global radius scale.

## Components

### Buttons

Confident, compact actions use the button radius, 12-unit vertical and 18-unit horizontal padding, 15-unit bold text and a 48-unit minimum height. Primary uses `primary/onPrimary`; secondary uses `mint/primary`; ghost uses a transparent fill with primary text; danger uses `red/paper`. Disabled state uses the disabled pair, and loading replaces the optional 19-unit Ionicon with a native indicator while preventing repeat activation. Pressed opacity is immediate. The source does not define a separate native hover or button focus-ring token.

### Inputs / Fields

Fields have visible labels, optional hints, an outlined paper surface, a field radius, 15-unit horizontal and 12-unit vertical padding, and 16-unit regular input text. Multiline fields start at 110 units high. Focus uses the semantic focus border; errors use the red border and alert text. Placeholder color is muted, selection uses primary, and supported native keyboard appearance follows the effective scheme. Preserve native input behavior instead of translating browser focus styles into the app.

### Chips

Pills use paper/text with a one-pixel line border, the pill radius, 12-unit vertical and 14-unit horizontal padding, 13-unit semibold text and a 48-unit minimum height. Selected pills use primary/onPrimary and a primary border. Categories scroll horizontally; multi-select controls wrap where the existing screen calls for it.

### Cards / Containers

A card groups an actual campaign or financial object. Shared cards use paper, the card radius, a one-pixel line border and clipped overflow. The full campaign card keeps category/title/creator, compact funding, estimated reach, summary and the real next action together. Compact campaign rows use a thumbnail and a separator instead of nested cards. Notices, empty states and contextual contribution groups use their actual semantic surfaces; Dark financial/header groups stay neutral.

### Navigation

Preserve Home, Explore, Create, Activity and Profile, each with Ionicons and a 10-unit Manrope semibold label. Active tint is primary, inactive tint muted; a 48-by-28 contextual icon container highlights the current tab. Activity's unread badge uses primary/onPrimary. The tab surface and top boundary follow paper/line. A restricted reviewer view stays inside the existing account flow.

Creation's Submit checklist reuses existing validation. Required issues and optional suggestions are separate expandable groups; each issue opens the existing step and field with an explanation and input focus or accessible announcement. Keep the five-step indicator and draft state. Save feedback names actual device/account persistence, pending writes, unsaved edits and sync failures. Editorial Campaign page and Advertisement previews share the live draft; placement representations are labelled previews.

The shared Android screen uses keyboard height avoidance only while the IME is visible, returning to ordinary flex layout after dismissal. Preserve the same child tree, focused field and editor state; the complete footer button shape and padding must remain above the existing tab bar. iOS retains padding behavior. Native keyboard and increased-text evidence is separate from source inspection.

### Appearance

Profile exposes System, Light and Dark to guests and signed-in users. The current control is a wrapping radio group with 64-unit minimum height, 88-unit minimum width, 12-unit radius, 10-by-8-unit padding, paper/outline at rest and mint/primary selection. It shows saving, saved and failure feedback.

`ThemeProvider` remains above session/query/navigation providers. The device store uses `campaign:appearance:v1`, defaults invalid/missing values to System, observes live OS changes, serializes saves and protects an in-progress choice from late restoration. It changes native system background/status/navigation styling where supported and persists separately from account data. Sign-out must retain the preference. Theme changes must preserve navigation, editor step/fields/drafts, filters, contribution amount and identity. Code structure and pure tests do not alone verify those installed behaviors; OS-owned dialogs and some keyboard/gesture surfaces remain platform-controlled. Expo's configured dark splash background matches the black application ground.

### Funding and journey

Funding combines amount/goal, percentage, six-unit progress and an explicitly estimated audience. Contribution groups keep the selected total, included platform fee and advertising allocation adjacent to the uncertain estimate. The campaign journey distinguishes review, funding, preparation, promotion and report using available actual dates. These patterns support comprehension; they never imply direct cause donations, guaranteed reach or automatic advertising launch.

Checkout waits for current backend configuration rather than displaying assumed rates. Public source links show the creator-entered title, host and full URL, with external-link and failure feedback. Payment Activity opens the specific owned receipt in the existing Profile Payments context. Reports distinguish original allocation from current spend, retained fees, completed refunds and remaining advertising budget; pre-refund unspent is contextual history rather than an additional balance. Pending refunds are labelled separately. All monetary figures use the existing server ledger and shared calculations.

### Documentation previews and evidence

The later Product Quality Addendum refines behavior within this design. Its changed source requires fresh targeted verification; the pass2 automated verdict below is checkpoint history and does not approve the current appearance or workflows.

The subsequent [native flow review](artifacts/product-quality/FLOW_REVIEW.md) personally inspects first-candidate correction/backing/receipt/source/report pictures and corrected quality-pass2 editor/copy/enlarged-receipt pictures. It confirms the pictured post-IME footer correction in Light/Black at 393dp/font1.0 and 360dp/font1.3, with no new material defect. Exact interactions and Metro-off acceptance remain in the [native evidence](artifacts/product-quality/pass2/NATIVE_RESULTS.md). These are scoped checks, with physical/human, exhaustive accessibility and current-video gates still open.

`.impeccable/design.json` provides paired Light/Dark HTML/CSS illustrations of nine existing native patterns. They are documentation only: CSS units and browser focus behavior are preview translations, not a second app or native detector target. The preview omits remote photography and may fall back to browser sans-serif when the bundled Manrope faces are unavailable. Generated swatch ramps are panel illustrations, not additional application palette tokens; no motion or shadow values are synthesized.

The independent `artifacts/reference-redesign/FINISH_REVIEW.md` records a **SHIP** disposition for all twelve valid after-pass2 native phone captures of the exact x86_64 INTERNAL-TEST candidate (`45F0D82B23CD9B6C3DAD56E029E56B7F3CAF3CD91F18CF4FC6A8DED7DE7AE187`). This bounded visual review covers unchanged Light Home, corrected black/neutral core surfaces, Home funding in the first viewport, and the approximately 360-unit/font-scale-1.3 detail/checkout docks and editor with the actual IME. It reports no material fixes in that pictured scope. It does not certify unpictured reports, fee/refund sections, every editor step, broader workflow/state continuity, other viewports, physical hardware, screen-reader or human usability, motion, or the refreshed video. Earlier green-Dark captures remain rejected visual evidence, and prior behavioral results retain their exact tested build scope. Keep broader acceptance and current delivery evidence in PROGRESS.md and RELEASE_READINESS.md.

## Do's and Don'ts

### Do:

- **Do** use the shared semantic Light/Dark palette and preserve the existing Light design.
- **Do** keep Dark grounds neutral, including headers and contribution panels, with mint confined to accents and actions.
- **Do** use Manrope static font files through the shared Text wrapper and let native text scale.
- **Do** retain the five tabs and five visible creation steps, with space for docks, keyboard and system insets.
- **Do** keep campaign identity, funding, estimated reach and the next action coherent, with truthful simulated or estimated labels.
- **Do** verify the actual installed candidate at 360, 393 and 411 logical widths, font scale 1.3 and critical keyboard states before claiming visual acceptance.

### Don't:

- **Don't** reintroduce green-tinted Dark grounds, oversized serif discovery headings or ultramarine actions from rejected directions.
- **Don't** create parallel per-screen themes, remount navigation to change appearance, or store the preference in account data.
- **Don't** copy the reference's people, photographs, donation wording, banking balances or unsupported trust claims.
- **Don't** add decorative gradients, nested panels, repeated slogans or new motion/shadow tokens that the native system does not define.
- **Don't** treat old green-Dark captures, a successful build, browser snippets or source token checks as acceptance of the corrected installed appearance.
