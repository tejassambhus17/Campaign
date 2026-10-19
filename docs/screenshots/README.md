# Campaign screenshot gallery

These are real native **Android 16 / API 36 x86_64 emulator captures** from the same dedicated-signed **1.5.1 / code 12** local build. They are neither generated mockups nor physical-phone screenshots. The README presents 20 screenshots in five rows of four, with descriptive alt text and links to the 540 px versions.

## Build provenance

All gallery sources are the `final-*.png` captures under `artifacts/final-submission-20261019/native/`. Each source has a matching native UI XML capture. [manifest.json](manifest.json) records complete source/output hashes, sizes, dimensions, and the exact APK/build-receipt/source-freeze identity. The previous mixture of 1.4.0 candidate/final and earlier Welcome captures is replaced.

Nineteen captures use the owned `Campaign_Studio_36` emulator (`emulator-5574`). Fresh Welcome uses the isolated `Campaign_Submission_Auth_36` emulator (`emulator-5578`). Both run Android 16 / API 36 x86_64 with the exact same APK; per-image attribution is recorded in the manifest. No phone screenshots or phone-data reset are implied.

The capture selection includes all five creation steps, the current moving step rail, Readiness Assistant, rule-based writing suggestions, current-draft preview, Creator Studio, and premium Profile in both themes. Sample campaigns, financial amounts, notifications, names, and the fictional QA profile are captured demonstration data, not product-performance claims. No credentials, passwords, provider keys, or private receipt links are intentionally published.

Creation screenshots deliberately show an incomplete fictional draft so missing items, recommendations, optional media and writing guidance remain visible. Its empty story/media states and preview reflect that draft rather than fabricated finished content.

All photographs, controls, text, data and bundled artwork remain as actually rendered. A static illustration inside the app does not make the native screenshot a generated mockup. No screenshot content was composited, regenerated, rewritten or selectively hidden for the gallery.

## Image processing

- Preserve the complete original screen and aspect ratio; resize proportionally to **540 px wide**.
- Encode progressive JPEG at quality 88 with 4:4:4 chroma for readable UI text.
- Do not crop screenshots, replace text, change figures, recolor surfaces, add phone frames, or synthesize UI.
- Strip source metadata during encoding.
- Retain the existing approved transparent megaphone logo unchanged.

The 20 JPEGs total **1,699,089 bytes**, reduced from **9,478,219 bytes** of original PNGs (about **82% smaller**). The logo is additional. Exact per-file totals are in the manifest, and validation checks a 2.25 MB gallery budget. Original PNG/XML evidence remains unchanged in the ignored local artifact tree. A normal clone already includes the optimized gallery; regenerating it needs the preserved originals and Pillow.

## Reproduce and validate

Run from `E:\Campaign`, supplying the root-verified final APK, its build metadata, and its confirmed SHA256:

The supporting scripts use Pillow and `markdown-it-py`; both are available in the bundled workspace Python. A normal clone already contains the prepared JPEGs and does not need to regenerate them.

```powershell
python docs/screenshots/prepare_assets.py --apk <final-APK-path> --build-receipt <APK-build-metadata.json> --expected-sha256 <confirmed-SHA256>
python docs/screenshots/validate_readme.py
```

The generator also reads `artifacts/final-submission-20261019/SOURCE_INPUTS.json` by default. All inputs must exist and match before gallery replacement. It does not build, sign, install, launch, or capture the app.

[verification.json](verification.json) records the performed README/image/build-source checks. `review/index.html` is a local composition preview; GitHub controls its own typography, tables, Mermaid, and image proxying. Public URL checks do not authenticate access to a private GitHub release.

Screenshots demonstrate appearance only. They do not establish every gesture, financial state, upload, accessibility mode, physical-device behavior, or unfamiliar-user usability. Build-specific native results remain in the main release documentation.
