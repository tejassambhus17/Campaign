# Campaign prototype assessment rubric v1

`campaign-review-v1` is Campaign's documented prototype methodology. It is not
an organizer-supplied formula, calibrated probability of accuracy, independent
fact-check, identity verification, legal certification or advertising-platform
approval. The reference shield specifies presentation, not a scoring algorithm.
Policy approval, this assessment, advertising readiness and actual delivery are
separate. No score changes funding eligibility, campaign status or payment state.

The API's `GET /assessment-rubric` returns the authoritative observable checks
and exact anchors implemented in `services/api/assessments.py`. Each check has
three permitted results: `none`, `partial`, `met`. Ten-point checks award 0/5/10;
five-point checks award 0/2/5. Unknown criteria, unknown anchors, duplicate checks,
client-calculated points and client-provided provenance are rejected. A field's
presence, source quantity, working URL, fluent prose or attractive art earns no
automatic credit. Authorized reviewers record judgments against these anchors;
the server validates the structure and computes arithmetic, not factual truth.

| Criterion | Observable checks and maximum |
| --- | --- |
| Supporting sources and evidence (30) | `claim_support` (10): inspect sources against material factual claims; full credit needs a claim-to-source map for each. `source_scope` (10): inspect origin, applicability and scope of all relied-on sources; distinguish background from endorsement. `evidence_limits` (10): identify unsupported outcomes and evidence limits rather than infer campaign success. |
| Clarity and consistency of claims (20) | `claim_types` (10): distinguish material fact, opinion, aspiration and outcome statements. `consistency` (10): compare story, summary, ad copy and source scope for unexplained contradictions. |
| Creator transparency (20) | `accountability` (10): examine disclosed responsibility and a usable accountability mechanism, without popularity or appearance inputs. `identity_limits` (10): explicitly distinguish disclosed identity, fictional identity and any actual verification; never invent verification. |
| Funding and advertising transparency (15) | `purpose` (5): story/ad clearly describe advertising rather than direct support. `allocation` (5): compare goal, fee model, net ad budget and channel allocation; size of goal gives no credit. `uncertainty_policies` (5): review estimate assumptions, simulation, delivery uncertainty, fees, refund and unspent-fund rules. |
| Policy and content review (15) | `content` (5): record applicable existing content-rule checks and observed unresolved violations; no legal-certification claim. `source_media_rights` (5): inspect attribution/allowed use and public privacy exposure; art is not factual evidence. `approval_limits` (5): distinguish policy approval, assessment, ad readiness and simulated/actual delivery without invented provider approval. |

For every check, **none** means the named check was not performed, no relevant
support was inspected, or the material requirement was not met. **Partial**
means some named checks/support were inspected but specified applicability,
access, consistency, disclosure or verification gaps remain. **Met** requires
the complete named observable check, referenced evidence and no unresolved
material omission within that check's stated scope. The endpoint returns the
longer criterion-specific zero/partial/full rules, so reviewers need not infer
these from a score slider.

Every published assessment includes all 13 check results, whether performed,
the reason, relevant campaign/source references, missing/unverified information
for unperformed or partial/zero checks, and at least one overall limitation.
Performed checks require an evidence reference and note. No points can be
awarded to an unperformed check. Unavailable or unopened sources cannot be
described as inspected. Health correctness is not inferred from clarity.
Political agreement and protected characteristics are never scoring inputs.

Bands describe **review coverage**: 0–39 Limited; 40–69 Moderate; 70–100 Strong.
These are ordinal prototype classifications, not empirically calibrated trust
probabilities. They were fixed before applying the rubric to the demo library;
seed scores are not tuned to make the library look reliable.

## Stored content, provenance and privacy

Assessments are separate additive records, bound to campaign ID, canonical
content SHA-256, assessed version, rubric version and a stored content snapshot.
The hash includes every validated editorial/ad/audience/goal/duration field.
It excludes editor progress, catalogue `featured`, host-expanded image URLs,
ledger totals, contribution count and other derived delivery/money fields.
Canonical source-relative media paths remain unchanged. The server records its
funding policy/version, currency, fee rate and people-per-net-ad-dollar snapshot
as the assessment's `policyContext`; it never accepts these from the client.

Private draft edits cannot invalidate an unchanged approved public assessment.
A newly approved material version gets a different hash; an old score is only
labelled history, not the new version's score. An assessment of a working
revision remains private until its exact content becomes approved/public.
`public_bound_at` retains that genuine public association for later history.
Public reads return no draft content, private evidence text/references, raw actor
identity or private content snapshot. An explicit withheld-evidence indicator
explains omission. Reasons and overall limitations are public-facing text; the
reviewer must put confidential evidence into its separate private field.

Only the existing reviewer role can open the workspace or create/save/publish
reviewer records. Ordinary creators/backers cannot write scores. Creation is
deduplicated per draft/content; revisions prevent stale saves; publication is
transactional, immutable and repeat-idempotent. At most one published reviewer
assessment exists for each content hash/rubric. Publishing does not create
notifications, payments, campaign approval or advertising transitions.

Demo type/provenance cannot be selected by any HTTP client, including a
reviewer. The explicit offline seed helper requires a fixed app-owned demo ID,
the reserved fictional fixture owner, a seed event with no human actor, a seed
registry and an unchanged registered public hash. It records actual insertion
time and `automated_demo`/`Demo assessment`, never an invented human reviewer or
review date. It does not run on app launch. Reapplying an identical seed keeps
the existing published assessment; changed registered content is preserved and
must not receive its predecessor's assessment automatically.

## Public states

- **Not yet assessed:** no completed current assessment; no zero default.
- **Assessment in progress:** a draft exists for current public content; no
  provisional public total or private draft evidence is exposed.
- **Completed reviewer assessment:** server total and coverage band with actual
  recorded publication time and honest authorized-reviewer provenance.
- **Illustrative Trust Score / Demo assessment:** conspicuous demonstration
  designation in the shield and details, including missing verification.
- **Superseded:** public content changed; historical assessment remains labelled
  as history and the current version requires assessment. A new current draft
  may instead show in-progress with history available.

Every display carries: “This reflects the documented review rubric, not a
guarantee that every claim is correct.”

## API workflow

1. Public `GET /assessment-rubric` and `GET /campaigns/{id}/assessment`.
2. Reviewer `GET /campaigns/{id}/assessment-workspace?target=public|working`
   receives exact content/hash, rubric, server policy snapshot and saved draft.
3. Reviewer `POST /campaigns/{id}/assessments` with `{target,contentHash}`.
4. Reviewer `PUT /campaigns/{id}/assessments/{assessmentId}` with `contentHash`,
   `rubricVersion`, `expectedRevision`, criterion/check input and limitations.
   Strip returned titles/points/maxima/withheld markers from write payloads.
5. Reviewer `POST /campaigns/{id}/assessments/{assessmentId}/publish` with
   `{contentHash,expectedRevision}`. Incomplete, stale or conflicting records
   fail explicitly; successful uncertain retries return the same publication.

This contract is additive. Existing campaign/config/contribution/review endpoint
response contracts and financial calculations stay intact. Migration 007 adds
only assessment and app-owned seed-registry tables/indexes. Cloud deployment and
seed application require the separate reviewed rollout gate; local test results
do not prove that the live service has these endpoints.
