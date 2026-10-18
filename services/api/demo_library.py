"""Explicit, insert-only library rollout; never invoked by API/app startup.

Dry-run opens an existing database read-only and never initializes migrations.
Apply requires the reviewed plan digest and its version. Existing campaigns,
users, dates, payments, ledgers and edited public/working revisions are immutable.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import timedelta
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
from urllib.parse import parse_qs, urlsplit

from assessments import (AssessmentDraft, RUBRIC, RUBRIC_VERSION, calculate_criteria,
                         classification, content_hash, publish_demo_assessment,
                         register_demo_campaign)
from db import (ROOT, WRITE_LOCK, PostgresConnection, hash_password, identifier)
from domain import (CATEGORIES, CampaignContent, DEFAULT_PREFERENCES, PUBLIC_STATES,
                    cents, fee_for, stamp, submission_errors, utcnow)
import secrets

MANIFEST_PATH = ROOT / 'demo_library_v1.json'
LIBRARY_VERSION = 'campaign-library-v1'


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def manifest():
    value = json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
    if value['version'] != LIBRARY_VERSION or value['categories'] != CATEGORIES:
        raise ValueError('Manifest version/categories do not match this application.')
    entries = value['existing'] + value['campaigns']
    ids = [item['id'] for item in entries]
    if len(ids) != 20 or len(set(ids)) != 20 or set(value['existingIds']) != {item['id'] for item in value['existing']}:
        raise ValueError('The versioned library must contain exactly twenty unique stable IDs.')
    counts = {category: 0 for category in CATEGORIES}
    for item in entries:
        validated = CampaignContent.model_validate(item['content']).model_dump()
        if submission_errors(validated):
            raise ValueError(f'{item["id"]}: incomplete campaign content.')
        counts[validated['category']] += 1
        if item in value['campaigns']:
            if item['initialRaisedUSD'] != 0 or item['status'] != 'Available for Funding':
                raise ValueError('New demos start at zero, with no synthetic popularity or delivery.')
            if validated['coverImage'] in validated['adImages']:
                raise ValueError('New covers and ad artwork references must be distinct.')
    if any(count != 2 for count in counts.values()):
        raise ValueError('Library coverage must be exactly two per existing category.')
    return value


def policy_context():
    fee = Decimal(os.getenv('CAMPAIGN_DEMO_FEE_RATE', '0.05'))
    people = float(os.getenv('CAMPAIGN_DEMO_PEOPLE_PER_AD_DOLLAR', '27'))
    if not fee.is_finite() or not 0 <= fee < 1 or not 0 < people < float('inf'):
        raise ValueError('Invalid current prototype funding configuration.')
    return {'version': 'prototype-funding-v1', 'currency': 'USD', 'feeRate': float(fee),
            'peoplePerAdDollar': people,
            'basis': 'Net advertising dollars after the configured platform fee; payments and delivery are simulated.'}


def check_result(key, result, reason, reference, note, missing=(), performed=True):
    return {'id': key, 'result': result, 'performed': performed, 'reason': reason,
            'evidence': [{'reference': reference, 'note': note, 'visibility': 'public'}] if performed else [],
            'missing': list(missing)}


def assessment_payload(entry, content, policies):
    """Anchored authoring review, restricted to the exact inspected snapshots.

    No arbitrary total is stored: the shared server rubric awards each anchor.
    This is an automated-demo authoring assessment, never an independent review.
    """
    key, source = entry['id'], entry['sourceInspection']
    old = key in manifest()['existingIds']
    reference = f'campaign:{key}'
    limitation = source['limitations']
    checks = {}
    def put(name, result, reason, note, missing=(), ref=reference):
        checks[name] = check_result(name, result, reason, ref, note, missing)

    if old:
        put('claim_support', 'none', f'The general UN goals page does not supply campaign-specific evidence for “{content["title"]}”.',
            source['supports'], ('No campaign-specific supporting study or evidence is supplied.',), source['url'])
        put('source_scope', 'partial', f'The source is an institutional global goals index relevant broadly to {content["category"]}, not local or campaign evidence.',
            'Opened the UN goals index and compared the sole creator-provided context source.', (limitation,), source['url'])
        put('evidence_limits', 'met', 'The story explicitly calls this fictional and says the reference does not verify the creator, funding or delivery.',
            'sections: story, source-note; original report simulation labels were inspected separately from factual evidence.')
        put('claim_types', 'partial', 'The generic aspirational story is distinguishable from a demonstration, but the summary does not explain a concrete evidenced intervention.',
            f'summary: {content["summary"]}; sections: story/action.', ('No concrete campaign-specific causal case is supplied.',))
        put('consistency', 'met', f'Story, summary and ad copy were compared for “{content["title"]}”; they consistently invite message sharing.',
            f'adHeadline: {content["adHeadline"]}; adDescription matches the campaign summary. No quantified real outcome is asserted.')
        put('accountability', 'partial', f'{content["creatorName"]} is named, but the fixture does not disclose a usable real-world accountability contact.',
            'creatorName and reserved Demonstration Campaigns fixture ownership.', ('No real accountable organisation/contact was independently established.',))
        put('identity_limits', 'partial', 'The story identifies the campaign as fictional but does not explicitly state the displayed organisation is a fictional unverified identity.',
            'sections: story and source-note; no actual identity verification record exists.', ('Creator-specific identity disclosure is incomplete in this preserved older content.',))
        put('purpose', 'met', 'The story explicitly describes community-funded distribution and no direct transfer to the cause.',
            'sections: story. Summary/ad were checked for contrary donation claims; none observed.')
        put('allocation', 'met', f'The configured USD {content["goal"]:g} goal, fee model and 60/40 selected-channel split reconcile; sample funding stays untouched.',
            f'channels/allocation/goal; current policy context feeRate={policies["feeRate"]}. No points depend on money already raised.')
        put('uncertainty_policies', 'partial', 'Current shared app policies qualify estimates, simulation and refunds, but this old generic story does not explain those rules.',
            'Current /config policies in main.py plus original story/source-note.', ('Campaign-specific refund, unspent-fund and reach-assumption explanation is absent.',))
        put('content', 'partial', 'Inspected the published story/ad for direct-transfer claims, fabricated endorsements, personal data and unsupported quantified success.',
            f'{content["category"]} generic awareness text and ad were read; no claim of a legal or medical certification was observed.',
            ('No independent human content review or advertising-provider policy check was performed.',))
        put('source_media_rights', 'partial', 'The stock credit and bundled source manifest were inspected; imagery is illustrative, not an event claim.',
            f'assets/seed/manifest.json; story image credit Unsplash; cover {content["coverImage"]}.',
            ('Individual photographer/property releases and rights beyond the stock licence were not established.',))
        delivery = key in {'demo_arts', 'demo_science'}
        put('approval_limits', 'partial' if delivery else 'none',
            'Existing simulated delivery report distinguishes modelled results, but no separate approval/readiness record is claimed.' if delivery else 'This older story does not explicitly distinguish approval, advertising readiness and delivery.',
            'Original seeded report is labelled simulated; no provider was contacted.' if delivery else 'Inspected original published story and seed event; no actual advertising approval exists.',
            ('Policy approval, this new assessment and platform readiness are not fully explained in the preserved old story.',))
    else:
        # Narrow factual background was inspected, but no campaign effectiveness
        # study exists. This explicit partial anchor avoids treating fluent copy
        # or one functioning institutional URL as proof of campaign effectiveness.
        put('claim_support', 'partial', 'The opened institutional page supports the identified background; it does not establish the effectiveness of the proposed awareness message.',
            source['supports'], ('No campaign-specific effectiveness evidence or measured outcome exists.',), source['url'])
        local_gap = key in {'demo_budget', 'demo_information', 'demo_inflation', 'demo_volunteer', 'demo_offers'}
        put('source_scope', 'partial' if local_gap else 'met',
            'Institutional origin and scope were checked; applicability to local services or jurisdiction remains limited.' if local_gap else 'The relied-on source was opened, its origin/scope compared with the exact background paragraph, and endorsement is explicitly excluded.',
            source['supports'], (limitation,) if local_gap else (), source['url'])
        put('evidence_limits', 'met', 'Source limits, fictional identity, illustrative imagery and absence of measured results are explicit.',
            f'sections: background, fictional, plan, limits. {limitation}')
        put('claim_types', 'met', 'The institutional background is separated from the proposed message and unmeasured aspirations.',
            f'sections: background/plan; summary “{content["summary"]}”; no achieved outcome is invented.')
        put('consistency', 'met', 'Compared the summary, structured story, ad headline/copy and exact source scope; no unexplained contradictory promise was observed.',
            f'adHeadline “{content["adHeadline"]}”; adDescription mirrors the awareness summary; CTA Read the story.')
        put('accountability', 'partial', f'{content["creatorName"]} is a clearly fictional creator and the app-owned fixture is accountable only as prototype content.',
            'creatorName and sections: fictional; no real organisation or official contact is implied.', ('A real-world accountable creator/contact is not verified.',))
        put('identity_limits', 'met', 'The story expressly labels the creator fictional and unverified and disclaims institutional endorsement.',
            'sections: fictional; the source institution is background provenance only.')
        put('purpose', 'met', 'The funding section explicitly limits contributions to communication and advertising; it excludes direct donations or transfers.',
            'sections: funding-purpose; ad copy makes an awareness invitation rather than a direct-support promise.')
        goal = cents(content['goal'])
        fee = fee_for(goal, Decimal(str(policies['feeRate'])))
        put('allocation', 'met', 'Compared the USD goal, current configured fee deduction and exact selected-channel percentages; no raised total is fabricated.',
            f'goalUSD={goal/100:g}; feeAtGoalUSD={fee/100:g}; netAtGoalUSD={(goal-fee)/100:g}; Instagram60%+Facebook40%=100%.')
        put('uncertainty_policies', 'partial', 'Story and current shared policies qualify net-budget estimates, simulated checkout and refunds; full policy text is linked rather than reproduced in this campaign.',
            'sections: distribution/limits and main.py /config policies; no live delivery or guaranteed audience.',
            ('Actual placement pricing, final readiness and delivery cannot be verified without a live provider; policy text remains contextual shared UI.',))
        put('content', 'partial', 'Checked original story/ad for direct-transfer promises, individual medical/financial advice, partisan endorsements and invented outcomes.',
            f'All structured sections for {content["title"]}; health content stays general and economic/policy content explanatory.',
            ('No independent human legal, clinical or advertising-provider policy certification was performed.',))
        put('source_media_rights', 'partial', 'Inspected institutional source scope, Unsplash licence and media manifest; stock is labelled illustrative, not evidence.',
            f'assets/seed/library-v1/media-manifest.json; {content["coverImage"]}; distinct ad {content["adImages"][0]}; no private recipient data in content.',
            ('Individual stock photographer/property releases and independent campaign verification are not established.',))
        put('approval_limits', 'met', 'Explicitly distinguishes proposed channels/review, illustrative assessment, advertising readiness and absent real delivery.',
            'sections: distribution/limits; explicit seed publication provenance. No advertising-platform partnership or approval is claimed.')
    criteria = [{'id': criterion['id'], 'checks': [checks[item['id']] for item in criterion['checks']]} for criterion in RUBRIC]
    return AssessmentDraft(contentHash=content_hash(content), rubricVersion=RUBRIC_VERSION, criteria=criteria,
        limitations=[f'{content["creatorName"]} is a fictional demonstration identity; no independent identity or human fact-check review.',
                     limitation, 'Illustrative automated authoring assessment, not a probability of accuracy, funding eligibility rule or advertising-platform approval.']).model_dump()


def equivalent_content(raw, expected):
    """Allow only the old, documented remote→bundled stock localization."""
    actual = CampaignContent.model_validate(json.loads(raw) if isinstance(raw, str) else raw).model_dump()
    if content_hash(actual) == content_hash(expected):
        return True
    from seed import SAMPLES
    text = json.dumps(actual)
    for row in SAMPLES:
        text = text.replace(f'https://images.unsplash.com/{row[8]}?auto=format&fit=crop&w=1200&q=85', f'/seed-media/{row[0]}.jpg')
    return content_hash(json.loads(text)) == content_hash(expected)


def owned_fixture(connection, row):
    owner = connection.execute('SELECT name,email,role FROM users WHERE id=?', (row['owner_id'],)).fetchone()
    event = connection.execute("SELECT 1 FROM campaign_events WHERE campaign_id=? AND event_type='seed' AND actor_id IS NULL", (row['id'],)).fetchone()
    return bool(owner and dict(owner) == manifest()['fixtureOwner'] and event and row['published_json'])


def preserved_snapshot(connection):
    """Digest all preserved records without leaking their content into reports."""
    tables = ['users', 'campaigns', 'campaign_events', 'payments', 'ledger', 'tracking', 'notifications', 'assets']
    result = {}
    for table in tables:
        # Static app-owned table names; no user-controlled SQL identifier.
        rows = [dict(row) for row in connection.execute(f'SELECT * FROM {table}').fetchall()]
        rows.sort(key=lambda row: json.dumps(row, sort_keys=True))
        result[table] = {'count': len(rows), 'sha256': digest(rows)}
    return result


def media_requirements(value):
    paths = sorted({url for item in value['campaigns'] for url in [item['content']['coverImage'], *item['content']['adImages']]})
    result = []
    for url in paths:
        path = (ROOT / 'assets' / 'seed' / url.removeprefix('/seed-media/')).resolve()
        if not path.is_relative_to((ROOT / 'assets' / 'seed').resolve()):
            raise ValueError('Media must remain inside app-owned static seed assets.')
        result.append({'url': url, 'exists': path.is_file(), 'bytes': path.stat().st_size if path.is_file() else 0,
                       'sha256': hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None})
    return result


def plan(connection):
    value, policies = manifest(), policy_context()
    rows = {row['id']: dict(row) for row in connection.execute('SELECT * FROM campaigns').fetchall()}
    counts = {category: 0 for category in CATEGORIES}
    existing, inserts, assessments, skipped, conflicts = [], [], [], [], []
    if isinstance(connection, sqlite3.Connection):
        table_names = {row['name'] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()}
    else:
        table_names = {row['table_name'] for row in connection.execute('SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema()').fetchall()}
    schema_ready = {'campaign_seed_registry', 'campaign_assessments'}.issubset(table_names)
    reserved_owner = connection.execute('SELECT name,email,role FROM users WHERE email=?', (value['fixtureOwner']['email'],)).fetchone()
    if reserved_owner and dict(reserved_owner) != value['fixtureOwner']:
        conflicts.append({'id': 'reserved-fixture-owner', 'reason': 'Reserved fixture email belongs to a different identity; preserve it.'})
    for entry in value['existing'] + value['campaigns']:
        row = rows.get(entry['id'])
        if not row:
            if entry['id'] in value['existingIds']:
                skipped.append({'id': entry['id'], 'reason': 'Original seed missing: do not recreate legacy funding/lifecycle history.'})
                continue
            inserts.append({'id': entry['id'], 'title': entry['content']['title'], 'category': entry['content']['category'], 'raisedUSD': 0})
            assessed_content = entry['content']
        else:
            if not owned_fixture(connection, row):
                conflicts.append({'id': entry['id'], 'reason': 'Stable ID is not the exact app-owned fixture; never overwrite or assess it.'})
                continue
            current = CampaignContent.model_validate(json.loads(row['published_json'])).model_dump()
            if row['status'] in PUBLIC_STATES and not submission_errors(current):
                counts[current['category']] += 1
            existing.append({'id': entry['id'], 'title': current['title'], 'status': row['status'], 'leftUntouched': True})
            if not equivalent_content(current, entry['content']):
                skipped.append({'id': entry['id'], 'reason': 'Published content differs from the source-inspected manifest; preserve it and leave unassessed.'})
                continue
            assessed_content = current
        payload = assessment_payload(entry, assessed_content, policies)
        scored, total = calculate_criteria(payload['criteria'], complete=True)
        exists = False
        if schema_ready:
            seed_key = f'{LIBRARY_VERSION}:{entry["id"]}:{payload["contentHash"]}:{RUBRIC_VERSION}'
            exists = bool(connection.execute('SELECT 1 FROM campaign_assessments WHERE seed_key=?', (seed_key,)).fetchone())
            registry = connection.execute('SELECT initial_content_hash FROM campaign_seed_registry WHERE campaign_id=?', (entry['id'],)).fetchone()
            if registry and registry['initial_content_hash'] != payload['contentHash']:
                skipped.append({'id': entry['id'], 'reason': 'Registered original public revision differs; do not replace earlier assessment provenance.'})
                continue
        assessments.append({'id': entry['id'], 'action': 'unchanged' if exists else 'add', 'type': 'demo',
                            'contentHash': payload['contentHash'], 'total': total, 'classification': classification(total),
                            'breakdown': {item['id']: item['points'] for item in scored}, 'limitations': payload['limitations']})
    after = dict(counts)
    for item in inserts:
        after[item['category']] += 1
    media = media_requirements(value)
    result = {'manifestVersion': LIBRARY_VERSION, 'rubricVersion': RUBRIC_VERSION,
              'manifestSHA256': hashlib.sha256(MANIFEST_PATH.read_bytes()).hexdigest(),
              'categoryCountsBefore': counts, 'categoryCountsAfter': after,
              'recordsToInsert': inserts, 'existingAppOwnedLeftUntouched': existing,
              'otherExistingCampaignCountUntouched': len(rows) - len(existing) - len(conflicts),
              'assessments': assessments, 'skipped': skipped, 'conflicts': conflicts,
              'media': media, 'policyContext': policies, 'assessmentSchemaReady': schema_ready,
              'preservedSnapshot': preserved_snapshot(connection),
              'warnings': ['No source availability or campaign effectiveness is inferred from this database-only dry-run.',
                           'Missing original demos are not recreated; any coverage gaps require explicit review.',
                           'Apply only after reviewed additive migration007 and explicit existing-cloud seed authorization.'],
              'canApply': schema_ready and not conflicts and all(item['exists'] for item in media) and all(count >= 1 for count in after.values())}
    result['planSHA256'] = digest(result)
    return result


def apply_plan(database, expected_plan_sha):
    """One transaction; recheck reviewed state, then insert only missing records."""
    value = manifest()
    with database.transaction() as connection:
        before = plan(connection)
        if not before['canApply'] or before['planSHA256'] != expected_plan_sha:
            raise ValueError('Seed plan changed or prerequisites failed. Review a new dry-run before apply.')
        owner = connection.execute('SELECT * FROM users WHERE email=?', (value['fixtureOwner']['email'],)).fetchone()
        if owner and any(owner[key] != expected for key, expected in value['fixtureOwner'].items()):
            raise ValueError('Reserved fixture identity has incompatible ownership; no records changed.')
        if not owner:
            owner_id = identifier('usr')
            connection.execute('INSERT INTO users VALUES (?,?,?,?,?,?,?)',
                (owner_id, value['fixtureOwner']['name'], value['fixtureOwner']['email'], hash_password(secrets.token_urlsafe(48)),
                 'member', json.dumps(DEFAULT_PREFERENCES), stamp()))
        else:
            owner_id = owner['id']
        insert_ids = {item['id'] for item in before['recordsToInsert']}
        for entry in value['campaigns']:
            if entry['id'] not in insert_ids:
                continue
            created = utcnow()
            content = CampaignContent.model_validate(entry['content']).model_dump()
            connection.execute('''INSERT INTO campaigns
                (id,owner_id,data_json,published_json,status,version,approved_version,setup_ready,created_at,updated_at,deadline)
                VALUES (?,?,?,?,?,1,1,0,?,?,?)''',
                (entry['id'], owner_id, json.dumps(content), json.dumps(content), entry['status'], stamp(created), stamp(created),
                 stamp(created + timedelta(days=content['durationDays']))))
            connection.execute('INSERT INTO campaign_events VALUES (?,?,?,?,?,?,?,?,?)',
                (identifier('evt'), entry['id'], None, 'seed', None, entry['status'], 1,
                 entry['publicationProvenance'], stamp(created)))
        eligible = {item['id'] for item in before['assessments']}
        results = []
        for entry in value['existing'] + value['campaigns']:
            if entry['id'] not in eligible:
                continue
            row = dict(connection.execute('SELECT * FROM campaigns WHERE id=?', (entry['id'],)).fetchone())
            content = json.loads(row['published_json'])
            provenance = {'manifest': 'demo_library_v1.json', 'sourceReview': entry['sourceInspection'],
                          'method': 'Explicit source-inspected fictional demo authoring assessment; no independent reviewer impersonation.'}
            register_demo_campaign(connection, row, LIBRARY_VERSION, provenance)
            results.append(publish_demo_assessment(connection, row, assessment_payload(entry, content, before['policyContext']),
                           LIBRARY_VERSION, provenance, before['policyContext']))
        after = plan(connection)
        return {'manifestVersion': LIBRARY_VERSION, 'appliedPlanSHA256': expected_plan_sha,
                'insertedIds': sorted(insert_ids), 'assessmentIds': [item['id'] for item in results],
                'categoryCountsBefore': before['categoryCountsBefore'], 'categoryCountsAfter': after['categoryCountsAfter'],
                'existingRecordsPreserved': True, 'paymentsCreated': 0, 'ledgerEntriesCreated': 0,
                'afterPlanSHA256': after['planSHA256']}


class ExistingTarget:
    """No Database.initialize(), seed_reviewer(), .env loading or migration side effect."""
    def __init__(self, path=None, *, cloud=False, read_only=True):
        self.path = Path(path).resolve() if path else None
        self.cloud, self.read_only = cloud, read_only
        if self.path and (not self.path.is_relative_to(ROOT) or not self.path.is_file()):
            raise ValueError('Use an existing SQLite database inside services/api.')
        if not self.path and not cloud:
            raise ValueError('Choose an explicit existing target; there is no implicit local/cloud database.')

    def connect(self):
        if self.cloud:
            import psycopg
            from db import record_factory
            url = os.getenv('CAMPAIGN_DATABASE_URL', '')
            parsed = urlsplit(url)
            if (parsed.scheme not in {'postgres', 'postgresql'} or not parsed.hostname or not parsed.username
                    or not parsed.password or not parsed.path.strip('/') or
                    parse_qs(parsed.query).get('sslmode', [''])[0] not in {'require', 'verify-ca', 'verify-full'}):
                raise ValueError('Configured cloud target requires existing PostgreSQL credentials and explicit TLS in the private environment.')
            schema = os.getenv('CAMPAIGN_DATABASE_SCHEMA', 'public')
            if not re.fullmatch(r'[a-z_][a-z0-9_]{0,62}', schema):
                raise ValueError('Configured schema must be a simple PostgreSQL identifier.')
            raw = psycopg.connect(url, row_factory=record_factory, connect_timeout=10, prepare_threshold=None)
            connection = PostgresConnection(raw)
            connection.execute('SET TRANSACTION READ ONLY' if self.read_only else 'SET TRANSACTION READ WRITE')
            connection.execute('SET LOCAL statement_timeout=30000; SET LOCAL lock_timeout=30000')
            connection.execute(f'SET LOCAL search_path TO "{schema}"')
            return connection
        connection = sqlite3.connect(self.path.as_uri() + ('?mode=ro' if self.read_only else '?mode=rw'), uri=True)
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA foreign_keys=ON')
        return connection

    @contextmanager
    def transaction(self):
        if self.read_only:
            raise ValueError('Apply needs an explicitly writable target.')
        connection = self.connect()
        try:
            if self.cloud:
                connection.execute('SELECT pg_advisory_xact_lock(?)', (WRITE_LOCK,))
            else:
                connection.execute('BEGIN IMMEDIATE')
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument('--sqlite', type=Path, help='Explicit existing Campaign SQLite database; never initialized.')
    target.add_argument('--configured-cloud', action='store_true', help='Explicit existing cloud target from private environment; no env values printed.')
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument('--dry-run', action='store_true')
    action.add_argument('--apply', action='store_true')
    parser.add_argument('--confirm-manifest')
    parser.add_argument('--expected-plan-sha')
    args = parser.parse_args()
    if args.apply and (args.confirm_manifest != LIBRARY_VERSION or not args.expected_plan_sha):
        parser.error('Apply requires --confirm-manifest campaign-library-v1 and the reviewed --expected-plan-sha.')
    database = ExistingTarget(args.sqlite, cloud=args.configured_cloud, read_only=not args.apply)
    if args.dry_run:
        connection = database.connect()
        try:
            result = plan(connection)
        finally:
            connection.close()
    else:
        result = apply_plan(database, args.expected_plan_sha)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Provider errors can contain private connection metadata. Never emit
        # provider text, DSNs, env values or SQL through this rollout CLI.
        print(json.dumps({'error': 'Seed operation failed; no uncommitted transaction was applied. Check the reviewed plan and prerequisites.',
                          'errorType': type(error).__name__}), file=sys.stderr)
        sys.exit(1)
