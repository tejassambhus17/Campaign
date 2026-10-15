---
name: Campaign
description: A contemporary civic publication for community-funded reach
colors:
  primary: "#2D4ED8"
  primary-container: "#EEF1FC"
  background: "#F6F5F0"
  surface: "#FFFFFF"
  ink: "#17252E"
  text: "#24333E"
  muted: "#59666D"
  separator: "#DDE1E5"
  outline: "#7B868E"
  accent: "#B83F2C"
  accent-container: "#F9EEE8"
  error: "#B3261E"
  success: "#216146"
  warning: "#785616"
typography:
  display:
    fontFamily: NewsreaderSemiBold
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.059
    letterSpacing: "-0.6px"
  title:
    fontFamily: ManropeBold
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.292
    letterSpacing: "-0.6px"
  section:
    fontFamily: ManropeBold
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.5px"
  body:
    fontFamily: ManropeRegular
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.533
  secondary:
    fontFamily: ManropeRegular
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: ManropeSemiBold
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.455
    letterSpacing: "0.5px"
rounded:
  field: "8px"
  button: "9px"
  card: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  control: "12px"
  group: "16px"
  gutter: "20px"
  section: "24px"
  major: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-secondary:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 15px"
  campaign-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
---

# Design System: Campaign

## Overview

**Creative North Star: "The Civic Publication"**

Contemporary civic publication: a photographic editorial product with the operational clarity of a consumer financial app. Daylight phone use, quick browsing, one-handed backing, and longer creator sessions. Replace the incumbent promotional composition; preserve its product truth and working flows.

Stories use a Read mode; discovery combines content-led persuasion with browsing; creation, checkout, Activity, Profile, review and reports use Operate. Personality comes from photographs, Newsreader story typography, ultramarine actions and precise rules, rather than repeated slogans, decorative labels or nested panels.

**Key Characteristics:**

- Real campaign photography and selective editorial typography.
- Ultramarine actions on warm paper, with quiet structural separators.
- Compact utilities, persistent context and explicit financial provenance.
- Native safe areas, scalable text and touch targets of at least 48dp.

## Colors

Ultramarine identifies actions and selection; its pale container groups estimates and feedback. Warm background and white paper separate the application from campaign content. Clay supports contextual notices. Error, success and warning carry meaning.

**The Boundary Rule.** Use the stronger outline token for input boundaries. The pale separator belongs to decorative rules and containers. Focus uses primary; errors use error.

## Typography

Six bundled SIL Open Font licensed files provide Manrope Regular/Medium/SemiBold/Bold and Newsreader Medium/SemiBold. The Text wrapper maps weights to static files while retaining native scaling. Fonts require no runtime download. Token sizes describe logical mobile pixels; CSS units above are the portable documentation representation.

Functional titles use Manrope. Home display and campaign storytelling use Newsreader. Card titles use 26/29, detail headlines 32/35 and story preview headings 28/32. Report identity uses compact Manrope 20/27.

**The Task Rule.** Reserve editorial display type for reading and selected discovery moments. Payment, editing, account and reporting controls use functional type.

## Layout

Phone content has a 20dp gutter and centered maximum width of 640dp. Controls grow with content; inputs begin at 52dp. Five-tab navigation includes the actual bottom inset. Normal-flow funding and checkout docks reserve space above tabs.

Creation keeps all five progress segments visible. At font scale greater than 1.15, or width below 350dp, Save and Preview move to a second row. Submit and checkout stage changes mount a fresh scroll container so the new heading is visible. Explore presents search, horizontal categories and one compact sort/eligibility row; sort options expand on demand.

Home's first viewport contains the wordmark, a concise community-funded advertising explanation, Explore/Create actions, a qualified configurable per-dollar estimate and real campaign photography. This is Home composition, not a utility-screen template.

## Elevation & Depth

The system is flat at rest. White paper, pale tonal groups, rules and clipped photography establish depth. Press opacity and native feedback communicate interaction. There is no shared shadow vocabulary or decorative card entrance sequence.

## Shapes

Fields and chips have gently curved corners, actions slightly softer corners, and campaign cards broader corners. Rules divide utility lists. A card groups a real campaign or financial object; it is not the default paragraph wrapper.

## Components

Buttons provide primary/secondary/ghost/danger variants, loading and disabled feedback, and Ionicons for meaningful actions. Inputs have visible labels, hints, focus outlines and error text. Selected chips use primary with white text.

Signature interaction: campaign progress and the next action stay in context as the reader moves from a story into a compact contribution review; Activity connects a real event directly to editing, payments or a report. No decorative card entrance sequence. Native press feedback and immediate inline save/read/status feedback carry state.

Screen composition: photography-led Home; compact search/category discovery; editorial detail with a compact funding dock; tool-like five-step creation; amount-first checkout; date-grouped Activity rows; account-first Profile; status-oriented creator management; explicit money/delivery report sections. Sources remain public and expandable, initially visible.

Verification: native Android screenshots at360/393/411 logical widths, keyboard and font scale1.3, primary journey and empty/error/privacy states. Check contrast for actual pairs. Screenshot review does not certify screen-reader usability or physical-device performance. No CSS/web-only UI enters the RN implementation.

Implementation exports live in apps/mobile/src/components/ui.tsx; colors.green and colors.mint remain compatibility aliases for primary and primary container. Do not create a competing theme.

The `.impeccable/design.json` HTML/CSS examples translate these native primitives for documentation only. They are not a second product implementation.

## Do's and Don'ts

- Do preserve authored story structure, public evidence and mandatory funding disclosures.
- Do reserve dock and tab space so essential content remains reachable.
- Do pair monetary and delivery figures with truthful estimated or simulated provenance.
- Do verify Android composition at 360, 393 and 411 logical pixels and font scale 1.3.
- Don't use oversized editorial headings on utility screens.
- Don't replace campaign photography with unrelated decorative illustrations.
- Don't add repeated slogans, nested panels or labels without a useful purpose.
- Don't treat screenshot review as physical-device, screen-reader or human-usability certification.
