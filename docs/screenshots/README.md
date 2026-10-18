# Campaign screenshot gallery

These are real native **Android API 36 emulator captures**, not mockups or physical-phone screenshots. The README shows them in four groups of four, with descriptive alternative text and links to the 540 px versions.

## Build provenance

| Gallery images | Capture source |
| --- | --- |
| Home, Explore, Create overview, Activity, Report, Profile, Light appearance | Exact final dedicated-signed **1.4.0 / code 10**, APK SHA-256 beginning `cb08edf3` |
| Campaign details/transparency, Basics, Story, Visuals, Reach, Submit, Trust & Verification, Contribution | **1.4.0 / code 10 initial QA candidate**, SHA-256 beginning `ff9e3053`; before the final shared-sheet keyboard correction. Marked `²` in the gallery, not represented as exact-final captures. |
| Welcome | Earlier verified **1.2.2 / code 5**, SHA-256 beginning `11755a16`; marked `¹`. No final 1.4.0 Welcome capture exists in the packet. Auth/carousel and associated image sources are unchanged between the preserved 1.2.3 and 1.4.0 checkpoints; this is not a new interaction test. |

Campaign details shows the scrolled Story/transparency region, not a fabricated full-screen composite. Editor captures show an actual fictional local QA draft. Profile/Activity show an existing fictional QA account, without passwords, tokens, email addresses, private receipt links, or provider credentials. Numbers are captured demonstration data, not product-performance claims.

## Image processing

- Preserve the complete original screen and aspect ratio; resize proportionally to **540 px wide**.
- Encode progressive JPEG at quality 88 with 4:4:4 chroma for readable UI text.
- Do not crop screenshots, replace text, hide controls, edit figures, recolor surfaces, add phone frames, or synthesize any UI.
- Strip source metadata during encoding.
- The logo reuses the approved transparent megaphone: trim transparent padding, resize proportionally, and retain transparency. No new logo was generated.

The 16 screenshots total **1,362,427 bytes**, down from **7,239,006 bytes** in the original PNGs, about **81% smaller**. The small logo is additional. All images are repository assets, not ignored local-artifact links.

[manifest.json](manifest.json) contains full source paths, source/output hashes, dimensions, byte sizes, and exact build identities. Original high-resolution PNGs remain unchanged in the local `artifacts/` evidence tree, which is deliberately excluded from Git. Reproduction therefore requires that preserved local evidence and Pillow; a normal clone already includes the optimized gallery.

## Checks and limits

[verification.json](verification.json) records the performed README path, anchor, gallery, image, frozen-source, and available network checks. A local GitHub-style preview is for document composition only; GitHub's own renderer controls final typography, table scrolling, Mermaid rendering, and image proxying. Private repository/release access requires authenticated verification and was not established by a local preview.

This documentation task runs no application build, app tests, ADB/emulator session, cloud rollout, or fresh screen capture. Physical release verification and unfamiliar-user testing remain separate pending work.
