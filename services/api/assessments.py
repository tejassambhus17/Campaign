"""Version-bound, explainable prototype assessments, separate from approval/money.

No source fetch, automated fact check, score threshold or lifecycle write occurs
here. Reviewer judgments must identify the actual checks and their limitations.
Only explicit offline seed tooling can create illustrative demo provenance.
"""
from __future__ import annotations

import hashlib
import json
from typing import Literal

from fastapi import Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from db import identifier
from domain import CampaignContent, stamp

RUBRIC_VERSION = 'campaign-review-v1'
DISCLAIMER = 'This reflects the documented review rubric, not a guarantee that every claim is correct.'
DEMO_IDS = frozenset('demo_' + key for key in (
    'forest', 'learning', 'ocean', 'community', 'arts', 'science', 'sleep', 'move',
    'nightsky', 'libraries', 'budget', 'information', 'inflation', 'data',
    'volunteer', 'heritage', 'offers', 'repair', 'privacy', 'sharing'))


def check(key, title, maximum, none, partial, met):
    return {'id': key, 'title': title, 'maximum': maximum,
            'anchors': {'none': {'points': 0, 'rule': none},
                        'partial': {'points': maximum // 2, 'rule': partial},
                        'met': {'points': maximum, 'rule': met}}}


RUBRIC = [
    {'id': 'sources', 'title': 'Supporting sources and evidence', 'maximum': 30, 'checks': [
        check('claim_support', 'Support for material factual claims', 10,
              'No relevant source was inspected against a material factual claim.',
              'An inspected source supports some background or claims; important gaps remain.',
              'Inspected relevant sources support each material factual claim, with claim-to-source references.'),
        check('source_scope', 'Source scope and provenance', 10,
              'Source origin, scope and relevance were not checked.',
              'Origin and scope were checked for some sources, with unresolved access or applicability gaps.',
              'Origin, applicability and scope were checked for all relied-on sources; background is distinguished from endorsement.'),
        check('evidence_limits', 'Evidence limitations and outcomes', 10,
              'Unsupported outcomes and evidence limitations were not examined.',
              'Some limitations are identified, but material unsupported claims or outcome ambiguity remain.',
              'The review identifies evidence limits and unsupported outcomes; no invented campaign success is treated as evidence.') ]},
    {'id': 'claims', 'title': 'Clarity and consistency of claims', 'maximum': 20, 'checks': [
        check('claim_types', 'Fact, opinion, aspiration and outcome', 10,
              'Claim types were not checked or material aspirations are presented as achieved outcomes.',
              'Most claim types are distinguishable; specific ambiguities are documented.',
              'Material fact, opinion, aspiration and outcome statements are distinguished with references; fluency is not evidence.'),
        check('consistency', 'Consistency across story and advertisement', 10,
              'Story, summary, advertisement and sources were not compared.',
              'Some surfaces were compared; specified inconsistencies or unreviewed surfaces remain.',
              'Story, summary, ad copy and source scope were compared without material unexplained contradictions.') ]},
    {'id': 'creator', 'title': 'Creator transparency', 'maximum': 20, 'checks': [
        check('accountability', 'Disclosed responsibility and accountability', 10,
              'Responsibility and accountability are absent or were not examined.',
              'A responsible identity is disclosed, but the accountability or contact mechanism is limited/unverified.',
              'A responsible identity and usable accountability mechanism are disclosed and were examined; popularity and appearance are excluded.'),
        check('identity_limits', 'Identity and verification boundaries', 10,
              'Identity verification is implied without support, or its limits were not checked.',
              'Some identity limitations are stated but the distinction between disclosed and verified identity remains incomplete.',
              'Disclosed identity, fictional demonstration status and any actual verification are explicitly distinguished without invented verification.') ]},
    {'id': 'funding', 'title': 'Funding and advertising transparency', 'maximum': 15, 'checks': [
        check('purpose', 'Advertising rather than direct donations', 5,
              'Funding purpose was not examined or the campaign implies direct charitable transfers.',
              'Advertising purpose is stated but some copy remains ambiguous.',
              'Story and ad explain that contributions fund communication/advertising, not direct support or transfers to the cause.'),
        check('allocation', 'Fees, budget and allocation consistency', 5,
              'Fees, goal and selected-channel allocation were not compared.',
              'Some amounts/allocation were compared; a specified gap remains.',
              'Goal, fee model, net advertising budget and selected-channel allocation were checked for consistency; a larger goal earns no credit.'),
        check('uncertainty_policies', 'Reach uncertainty and applicable policies', 5,
              'Reach guarantees or relevant funding/refund policies were not examined.',
              'Some estimate/refund/unspent-fund qualifications are available, with specified omissions.',
              'Estimate assumptions, delivery uncertainty, simulation, fees, refund and unspent-fund rules were reviewed and clearly disclosed.') ]},
    {'id': 'policy', 'title': 'Policy and content review', 'maximum': 15, 'checks': [
        check('content', 'Existing campaign content rules', 5,
              'No content-policy checks are recorded.',
              'Some applicable content rules were checked; the exact unreviewed rules or concerns are listed.',
              'Existing campaign rules were explicitly checked against referenced content, with no unresolved observed violation; this is not legal certification.'),
        check('source_media_rights', 'Sources, media and privacy', 5,
              'Media/source provenance and public privacy exposure were not examined.',
              'Some provenance/privacy checks were performed; specified rights or verification gaps remain.',
              'Source/media attribution and allowed use were inspected, and public content was checked for personal-data exposure; artwork is not factual evidence.'),
        check('approval_limits', 'Approval, readiness and delivery boundaries', 5,
              'Policy approval, advertising readiness and actual delivery were not distinguished.',
              'Some boundaries are disclosed, with specified unverified readiness/delivery claims.',
              'Policy approval, this assessment, advertising readiness and simulated/actual delivery are explicitly distinguished; no provider approval is invented.') ]},
]


def rubric_json():
    return {'version': RUBRIC_VERSION, 'title': "Campaign's prototype review methodology",
            'maximum': 100, 'criteria': RUBRIC,
            'bands': [{'minimum': 0, 'maximum': 39, 'label': 'Limited review coverage'},
                      {'minimum': 40, 'maximum': 69, 'label': 'Moderate review coverage'},
                      {'minimum': 70, 'maximum': 100, 'label': 'Strong review coverage'}],
            'disclaimer': DISCLAIMER,
            'limitations': 'Rubric coverage is not a probability of accuracy, independent fact-checking, identity verification, legal certification or advertising-platform approval.'}


def content_snapshot(value):
    """Canonical persisted content, never absolute host URLs or derived money.

    Editor progress and catalogue promotion are not material editorial content.
    All other validated campaign fields, including ads/audience/goal, are bound.
    """
    content = CampaignContent.model_validate(json.loads(value) if isinstance(value, str) else value).model_dump()
    return {key: content[key] for key in sorted(content) if key not in {'currentStep', 'featured'}}


def content_hash(value):
    return hashlib.sha256(json.dumps(content_snapshot(value), sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


class Evidence(BaseModel):
    model_config = ConfigDict(extra='forbid')
    reference: str = Field(default='', max_length=2000)
    note: str = Field(default='', max_length=2000)
    visibility: Literal['public', 'private'] = 'public'

    @field_validator('reference', 'note')
    @classmethod
    def meaningful(cls, value):
        return value.strip()


class CheckResult(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: str = Field(min_length=1, max_length=80)
    result: Literal['none', 'partial', 'met'] = 'none'
    performed: bool = False
    reason: str = Field(default='', max_length=4000)
    evidence: list[Evidence] = Field(default_factory=list, max_length=20)
    missing: list[str] = Field(default_factory=list, max_length=20)

    @field_validator('missing')
    @classmethod
    def useful_missing(cls, values):
        if any(not value.strip() or len(value) > 2000 for value in values):
            raise ValueError('Missing information must contain concise meaningful text.')
        return [value.strip() for value in values]


class CriterionResult(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: str = Field(min_length=1, max_length=80)
    checks: list[CheckResult] = Field(default_factory=list, max_length=5)


class AssessmentCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    target: Literal['public', 'working'] = 'public'
    contentHash: str = Field(pattern=r'^[a-f0-9]{64}$')


class AssessmentDraft(BaseModel):
    model_config = ConfigDict(extra='forbid')
    contentHash: str = Field(pattern=r'^[a-f0-9]{64}$')
    rubricVersion: Literal['campaign-review-v1'] = RUBRIC_VERSION
    expectedRevision: int = Field(default=1, ge=1)
    criteria: list[CriterionResult] = Field(default_factory=list, max_length=5)
    limitations: list[str] = Field(default_factory=list, max_length=30)

    @field_validator('limitations')
    @classmethod
    def useful_limitations(cls, values):
        if any(not value.strip() or len(value) > 2000 for value in values):
            raise ValueError('Limitations must contain concise meaningful text.')
        return [value.strip() for value in values]


class AssessmentPublish(BaseModel):
    model_config = ConfigDict(extra='forbid')
    contentHash: str = Field(pattern=r'^[a-f0-9]{64}$')
    expectedRevision: int = Field(ge=1)


def calculate_criteria(criteria, *, complete=False):
    """Validate IDs/anchors and calculate all points exclusively on the server."""
    values = [value.model_dump() if isinstance(value, CriterionResult) else value for value in criteria]
    if len({value['id'] for value in values}) != len(values):
        raise HTTPException(422, 'Duplicate assessment criteria are not allowed.')
    by_id = {value['id']: value for value in values}
    allowed = {criterion['id'] for criterion in RUBRIC}
    if set(by_id) - allowed or (complete and set(by_id) != allowed):
        raise HTTPException(422, 'Use every current rubric criterion when publishing; unknown criteria are not allowed.')
    scored = []
    for criterion in RUBRIC:
        if criterion['id'] not in by_id:
            continue
        checks = by_id[criterion['id']]['checks']
        entries = {item['id']: item for item in checks}
        check_ids = {item['id'] for item in criterion['checks']}
        if len(entries) != len(checks) or set(entries) - check_ids or (complete and set(entries) != check_ids):
            raise HTTPException(422, 'Each criterion needs its unique current rubric checks before publication.')
        result_checks = []
        for definition in criterion['checks']:
            if definition['id'] not in entries:
                continue
            result = entries[definition['id']]
            if result['result'] != 'none' and not result['performed']:
                raise HTTPException(422, 'Unperformed checks cannot earn points.')
            if complete:
                if not result['reason'].strip():
                    raise HTTPException(422, 'Explain the result of every check.')
                if result['performed'] and not result['evidence']:
                    raise HTTPException(422, 'Performed checks require evidence or a campaign/source reference.')
                if any(not item['reference'].strip() or not item['note'].strip() for item in result['evidence']):
                    raise HTTPException(422, 'Every published evidence entry needs a meaningful reference and note.')
                if (not result['performed'] or result['result'] != 'met') and not result['missing']:
                    raise HTTPException(422, 'Identify missing or unverified information for incomplete checks.')
            result_checks.append({**result, 'title': definition['title'], 'maximum': definition['maximum'],
                                  'points': definition['anchors'][result['result']]['points']})
        scored.append({'id': criterion['id'], 'title': criterion['title'], 'maximum': criterion['maximum'],
                       'points': sum(item['points'] for item in result_checks), 'checks': result_checks})
    return scored, sum(item['points'] for item in scored)


def classification(total):
    return 'Strong review coverage' if total >= 70 else 'Moderate review coverage' if total >= 40 else 'Limited review coverage'


def target_snapshot(campaign, target='public'):
    public = target == 'public' and bool(campaign['published_json'])
    raw = campaign['published_json'] if public else campaign['data_json']
    return content_snapshot(raw), content_hash(raw), campaign['approved_version'] if public else campaign['version'], 'public' if public else 'working'


def assessment_json(row, *, private=False):
    row = dict(row)
    criteria = json.loads(row['criteria_json'])
    if not private:
        for criterion in criteria:
            for result in criterion['checks']:
                evidence = result['evidence']
                result['privateEvidenceWithheld'] = any(item['visibility'] == 'private' for item in evidence)
                result['evidence'] = [item for item in evidence if item['visibility'] == 'public']
    result = {'id': row['id'], 'campaignId': row['campaign_id'], 'contentHash': row['content_hash'],
              'assessedVersion': row['assessed_version'], 'rubricVersion': row['rubric_version'],
              'assessmentType': row['assessment_type'], 'status': row['status'], 'criteria': criteria,
              'limitations': json.loads(row['limitations_json']), 'policyContext': json.loads(row['policy_context_json']),
              'provenance': json.loads(row['provenance_json']), 'total': row['total'], 'classification': row['classification'],
              'createdAt': row['created_at'], 'updatedAt': row['updated_at'], 'publishedAt': row['published_at'],
              'revision': row['revision'], 'disclaimer': DISCLAIMER}
    if private:
        result['snapshot'] = json.loads(row['snapshot_json'])
        result['actorId'] = row['actor_id']
        result['publishedBy'] = row['published_by']
    return result


def public_assessment(connection, campaign):
    _, current_hash, version, target = target_snapshot(campaign)
    # Never expose an assessment of a private working revision as public history.
    rows = connection.execute("SELECT * FROM campaign_assessments WHERE campaign_id=? AND status='published' ORDER BY published_at DESC,id DESC", (campaign['id'],)).fetchall()
    public_rows = [row for row in rows if campaign['published_json'] and (
        row['content_hash'] == current_hash or row['public_bound_at'] is not None)]
    current = [row for row in public_rows if row['content_hash'] == current_hash and row['rubric_version'] == RUBRIC_VERSION]
    # A completed real reviewer assessment supersedes an illustrative seed score.
    current.sort(key=lambda row: (row['assessment_type'] == 'reviewer', row['published_at']), reverse=True)
    chosen = current[0] if current else None
    pending = connection.execute("SELECT 1 FROM campaign_assessments WHERE campaign_id=? AND content_hash=? AND rubric_version=? AND status='draft' LIMIT 1", (campaign['id'], current_hash, RUBRIC_VERSION)).fetchone()
    state = 'completed' if chosen else 'in_progress' if pending and target == 'public' else 'superseded' if public_rows else 'not_assessed'
    return {'state': state, 'contentHash': current_hash if target == 'public' else None,
            'assessedVersion': version if target == 'public' else None,
            'assessment': assessment_json(chosen) if chosen else None,
            'history': [assessment_json(row) for row in public_rows if not chosen or row['id'] != chosen['id']],
            'rubricVersion': RUBRIC_VERSION, 'disclaimer': DISCLAIMER}


def observe_public_assessments(connection, campaign):
    """Mark only assessments of an actually approved public content hash.

    A published assessment of a working draft remains private until that exact
    content becomes public. This marker retains honest public history later.
    """
    if campaign['published_json']:
        connection.execute("""UPDATE campaign_assessments SET public_bound_at=COALESCE(public_bound_at,?)
            WHERE campaign_id=? AND content_hash=? AND status='published'""",
            (stamp(), campaign['id'], content_hash(campaign['published_json'])))


def register_demo_campaign(connection, campaign, seed_version, provenance):
    """Offline-only attestation. Stable IDs + fixture owner + seed event required."""
    owner = connection.execute('SELECT name,email,role FROM users WHERE id=?', (campaign['owner_id'],)).fetchone()
    seeded = connection.execute("SELECT 1 FROM campaign_events WHERE campaign_id=? AND event_type='seed' AND actor_id IS NULL", (campaign['id'],)).fetchone()
    if (campaign['id'] not in DEMO_IDS or not owner or owner['name'] != 'Demonstration Campaigns' or
            owner['email'] != 'samples@amplify.local' or owner['role'] != 'member' or not seeded or not campaign['published_json']):
        raise ValueError('Only exact app-owned fixture campaigns can receive demo provenance.')
    current_hash = content_hash(campaign['published_json'])
    connection.execute('''INSERT INTO campaign_seed_registry
        (campaign_id,seed_version,initial_content_hash,provenance_json,created_at) VALUES (?,?,?,?,?)
        ON CONFLICT(campaign_id) DO NOTHING''',
                       (campaign['id'], seed_version, current_hash, json.dumps(provenance), stamp()))
    return dict(connection.execute('SELECT * FROM campaign_seed_registry WHERE campaign_id=?', (campaign['id'],)).fetchone())


def publish_demo_assessment(connection, campaign, payload, seed_version, provenance, policy_context):
    """Explicit seed CLI only; never called from app startup or an HTTP route."""
    payload = AssessmentDraft.model_validate(payload)
    registry = connection.execute('SELECT * FROM campaign_seed_registry WHERE campaign_id=?', (campaign['id'],)).fetchone()
    snapshot, current_hash, version, _ = target_snapshot(campaign)
    if not registry or registry['initial_content_hash'] != current_hash or payload.contentHash != current_hash:
        raise ValueError('Demo assessment skipped: the registered published content changed or is unregistered.')
    # Repeat the ownership/provenance guard, not just a caller-supplied registry.
    register_demo_campaign(connection, campaign, seed_version, provenance)
    key = f'{seed_version}:{campaign["id"]}:{current_hash}:{RUBRIC_VERSION}'
    existing = connection.execute("""SELECT * FROM campaign_assessments WHERE seed_key=? OR
        (campaign_id=? AND content_hash=? AND rubric_version=? AND assessment_type='demo' AND status='published')""",
        (key, campaign['id'], current_hash, RUBRIC_VERSION)).fetchone()
    if existing:
        return assessment_json(existing)
    criteria, total = calculate_criteria(payload.criteria, complete=True)
    if not payload.limitations:
        raise HTTPException(422, 'Publish at least one honest overall limitation.')
    created = stamp()
    assessment_id = identifier('assess')
    safe_provenance = {'kind': 'automated_demo', 'label': 'Demo assessment', 'seedVersion': seed_version,
                       'description': 'Illustrative seeded rubric review; no independent human review or identity verification.',
                       **{key: value for key, value in provenance.items() if key in {'manifest', 'sourceReview', 'method'}}}
    connection.execute('''INSERT INTO campaign_assessments
        (id,campaign_id,content_hash,snapshot_json,assessed_version,rubric_version,assessment_type,status,
         criteria_json,limitations_json,policy_context_json,provenance_json,actor_id,total,classification,
         created_at,updated_at,published_at,public_bound_at,revision,seed_key)
        VALUES (?,?,?,?,?,?,'demo','published',?,?,?,?,NULL,?,?,?,?,?,?,1,?)''',
        (assessment_id, campaign['id'], current_hash, json.dumps(snapshot), version, RUBRIC_VERSION,
         json.dumps(criteria), json.dumps(payload.limitations), json.dumps(policy_context), json.dumps(safe_provenance),
         total, classification(total), created, created, created, created, key))
    return assessment_json(connection.execute('SELECT * FROM campaign_assessments WHERE id=?', (assessment_id,)).fetchone())


def register_assessment_routes(app, database, *, get_campaign, assert_visible, auth_optional, reviewer, policy_context):
    @app.get('/assessment-rubric')
    def get_rubric():
        return rubric_json()

    @app.get('/campaigns/{campaign_id}/assessment')
    def get_assessment(campaign_id: str, user=Depends(auth_optional)):
        with database.connect() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_visible(campaign, user)
            return public_assessment(connection, campaign)

    @app.get('/campaigns/{campaign_id}/assessment-workspace')
    def workspace(campaign_id: str, target: Literal['public', 'working'] = 'public', user=Depends(reviewer)):
        with database.connect() as connection:
            campaign = get_campaign(connection, campaign_id)
            snapshot, current_hash, version, target = target_snapshot(campaign, target)
            rows = connection.execute("SELECT * FROM campaign_assessments WHERE campaign_id=? AND content_hash=? AND rubric_version=? AND status='draft' ORDER BY updated_at DESC,id DESC", (campaign_id, current_hash, RUBRIC_VERSION)).fetchall()
            completed = connection.execute("""SELECT * FROM campaign_assessments WHERE campaign_id=?
                AND content_hash=? AND rubric_version=? AND assessment_type='reviewer' AND status='published'
                ORDER BY published_at DESC,id DESC LIMIT 1""", (campaign_id, current_hash, RUBRIC_VERSION)).fetchone()
            return {'rubric': rubric_json(), 'target': target, 'contentHash': current_hash,
                    'assessedVersion': version, 'content': snapshot, 'policyContext': policy_context,
                    'draft': assessment_json(rows[0], private=True) if rows else None,
                    'completed': assessment_json(completed, private=True) if completed else None,
                    'published': public_assessment(connection, campaign)}

    @app.post('/campaigns/{campaign_id}/assessments', status_code=201)
    def create_assessment(campaign_id: str, payload: AssessmentCreate, user=Depends(reviewer)):
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            snapshot, current_hash, version, _ = target_snapshot(campaign, payload.target)
            if payload.contentHash != current_hash:
                raise HTTPException(409, 'Campaign content changed. Reload the assessment workspace.')
            existing = connection.execute("SELECT * FROM campaign_assessments WHERE campaign_id=? AND content_hash=? AND rubric_version=? AND status='draft' AND assessment_type='reviewer' ORDER BY updated_at DESC,id DESC LIMIT 1", (campaign_id, current_hash, RUBRIC_VERSION)).fetchone()
            if existing:
                return assessment_json(existing, private=True)
            created, assessment_id = stamp(), identifier('assess')
            provenance = {'kind': 'reviewer', 'label': 'Authorized Campaign reviewer',
                          'description': 'Recorded prototype rubric review; not independent fact-checking or identity verification.'}
            connection.execute('''INSERT INTO campaign_assessments
                (id,campaign_id,content_hash,snapshot_json,assessed_version,rubric_version,assessment_type,status,
                 criteria_json,limitations_json,policy_context_json,provenance_json,actor_id,created_at,updated_at)
                VALUES (?,?,?,?,?,?,'reviewer','draft','[]','[]',?,?,?,?,?)''',
                (assessment_id, campaign_id, current_hash, json.dumps(snapshot), version, RUBRIC_VERSION,
                 json.dumps(policy_context), json.dumps(provenance), user['id'], created, created))
            return assessment_json(connection.execute('SELECT * FROM campaign_assessments WHERE id=?', (assessment_id,)).fetchone(), private=True)

    def editable(connection, campaign_id, assessment_id, expected_hash, revision):
        campaign = get_campaign(connection, campaign_id)
        row = connection.execute("SELECT * FROM campaign_assessments WHERE id=? AND campaign_id=? AND assessment_type='reviewer'", (assessment_id, campaign_id)).fetchone()
        if not row:
            raise HTTPException(404, 'Assessment not found.')
        if row['rubric_version'] != RUBRIC_VERSION:
            raise HTTPException(409, 'The rubric changed. Start a new assessment using the current rubric.')
        valid_hashes = {content_hash(campaign['data_json'])}
        if campaign['published_json']:
            valid_hashes.add(content_hash(campaign['published_json']))
        if expected_hash != row['content_hash'] or row['content_hash'] not in valid_hashes:
            raise HTTPException(409, 'Assessed content changed. Start a new assessment for the current version.')
        if row['status'] != 'published' and row['revision'] != revision:
            raise HTTPException(409, 'Another reviewer saved this assessment. Reload before saving.')
        return row

    @app.put('/campaigns/{campaign_id}/assessments/{assessment_id}')
    def save_assessment(campaign_id: str, assessment_id: str, payload: AssessmentDraft, user=Depends(reviewer)):
        criteria, _ = calculate_criteria(payload.criteria)
        with database.transaction() as connection:
            row = editable(connection, campaign_id, assessment_id, payload.contentHash, payload.expectedRevision)
            if row['status'] == 'published':
                raise HTTPException(409, 'Published assessments are immutable. Start a new version instead.')
            connection.execute('''UPDATE campaign_assessments SET criteria_json=?,limitations_json=?,
                updated_at=?,revision=revision+1 WHERE id=?''',
                (json.dumps(criteria), json.dumps(payload.limitations), stamp(), assessment_id))
            return assessment_json(connection.execute('SELECT * FROM campaign_assessments WHERE id=?', (assessment_id,)).fetchone(), private=True)

    @app.post('/campaigns/{campaign_id}/assessments/{assessment_id}/publish')
    def publish_assessment(campaign_id: str, assessment_id: str, payload: AssessmentPublish, user=Depends(reviewer)):
        with database.transaction() as connection:
            row = editable(connection, campaign_id, assessment_id, payload.contentHash, payload.expectedRevision)
            if row['status'] == 'published':
                return assessment_json(row, private=True)  # An uncertain retry never republishes.
            # Stored score fields are stripped below and recomputed.
            values = [CriterionResult.model_validate({'id': criterion['id'], 'checks': [
                {key: value for key, value in result.items() if key in CheckResult.model_fields}
                for result in criterion['checks']]}) for criterion in json.loads(row['criteria_json'])]
            criteria, total = calculate_criteria(values, complete=True)
            if not json.loads(row['limitations_json']):
                raise HTTPException(422, 'Publish at least one honest overall limitation.')
            duplicate = connection.execute("SELECT id FROM campaign_assessments WHERE campaign_id=? AND content_hash=? AND rubric_version=? AND assessment_type='reviewer' AND status='published'", (campaign_id, row['content_hash'], row['rubric_version'])).fetchone()
            if duplicate:
                raise HTTPException(409, 'This content and rubric already have a published reviewer assessment.')
            now = stamp()
            connection.execute("""UPDATE campaign_assessments SET status='published',criteria_json=?,total=?,
                classification=?,published_at=?,updated_at=?,published_by=?,revision=revision+1 WHERE id=?""",
                (json.dumps(criteria), total, classification(total), now, now, user['id'], assessment_id))
            observe_public_assessments(connection, get_campaign(connection, campaign_id))
            return assessment_json(connection.execute('SELECT * FROM campaign_assessments WHERE id=?', (assessment_id,)).fetchone(), private=True)
