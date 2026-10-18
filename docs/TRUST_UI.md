# Trust and distribution UI contract

Mode: **Read**, within Campaign's existing native detail journey. The selected
source is `artifacts/trust-release-20261017/reference-trust-score.jpg`. It defines
the centered heading, tall fine shield, prominent score, classification and
review-details action. Its purple palette, arbitrary76 and Moderate Trust label
are not Campaign data or a supplied official method.

Keep the existing pure-black/neutral-charcoal Dark surfaces, mint interaction
accent, softly tinted Light surface and bundled Manrope. Native Android chrome,
five tabs, campaign Story/Updates/Impact/Sources paging and existing funding dock
remain. Within Story the sequence is **Estimated reach → Assessment → Audience &
distribution**. The details route omits the action linking to itself.

The shield is the licensed Lucide `Shield` component, imported directly from
`lucide-react-native/icons/shield`1.59.0, with Expo55's supported
`react-native-svg`15.15.3. This replaces the fixed-weight Ionicons glyph only in
this component: a fresh native comparison found its silhouette/stroke too large
and heavy. It does not replace the app's icon family. Native SVG was needed for
an adjustable thin stroke; no rasterized score or hand-drawn icon is used.
Full ISC/MIT licence texts accompany the APK through CNG. Installation guidance:
[Expo SVG](https://docs.expo.dev/versions/v55.0.0/sdk/svg/),
[Lucide React Native](https://lucide.dev/guide/react-native).

Score/classification/provenance are separate scalable native text. Normal text
uses a bounded wrapping area within the shield. Above font scale1.2, the score
and classification reflow beneath a compact decorative shield; they must never
be clipped, reduced to fit, rasterized or assigned `allowFontScaling=false`.
The current content/assessment hashes must match before Story shows a number.
Independent cache responses can settle in either order. Missing, provisional,
stale and failed data are different states with no fabricated zero.

Demo records say **Illustrative Trust Score / Demo assessment** beside the
number. Actual reviewer records retain honest recorded-review provenance.
Every display includes the documented-rubric limitation. The details view
exposes criteria, anchors, evidence scope, gaps, actual publication time and
historical version context. Confidential evidence stays server-redacted.

The separate audience view uses the approved public campaign projection and
existing ad previews. It shows creator-proposed geography/interests/channels/
allocation/duration, distinguishes proposed/prepared/simulated/completed states,
and links the established report for funds/spend/refunds. No real advertising or
private backer profile is inferred. The reviewer workspace instead renders its
authorized exact working/public snapshot, with a hash-change guard on edits.

Native visual review is bounded to one correction batch after round1 and one
confirmation. See `VISUAL_REVIEW.round1.md` and passed `VISUAL_REVIEW.final.md` under
`artifacts/trust-release-20261017/`; old E555/D8EB screenshots and build proofs
must not be called evidence for the corrected binary. Engine context loading
was unavailable; the documented Impeccable native/manual fallback was used.
