"""Real HTTP/SQLite assessment regressions; isolated disposable records only."""
from concurrent.futures import ThreadPoolExecutor
import copy
import json
import unittest

from fastapi.testclient import TestClient

from assessments import (RUBRIC, RUBRIC_VERSION, content_hash, content_snapshot,
                         publish_demo_assessment, register_demo_campaign)
from main import create_app
import test_api


def complete_payload(hash_value, *, result='partial', private=False):
    return {'contentHash': hash_value, 'rubricVersion': RUBRIC_VERSION, 'expectedRevision': 1,
            'criteria': [{'id': criterion['id'], 'checks': [
                {'id': check['id'], 'result': result, 'performed': result != 'none',
                 'reason': 'Isolated reviewer fixture records the scope of this check.',
                 'evidence': [{'reference': 'campaign:story', 'note': 'Inspected the isolated fictional campaign.',
                               'visibility': 'private' if private else 'public'}] if result != 'none' else [],
                 'missing': ['Independent verification remains unavailable.'] if result != 'met' else []}
                for check in criterion['checks']]} for criterion in RUBRIC],
            'limitations': ['Prototype review coverage is not factual verification or live advertising approval.']}


class AssessmentTests(unittest.TestCase):
    setUp, tearDown = test_api.ApiTests.setUp, test_api.ApiTests.tearDown
    register, headers, create = test_api.ApiTests.register, test_api.ApiTests.headers, test_api.ApiTests.create
    publish, transition, contribute = test_api.ApiTests.publish, test_api.ApiTests.transition, test_api.ApiTests.contribute

    def workspace(self, campaign_id, target='public'):
        response = self.client.get(f'/campaigns/{campaign_id}/assessment-workspace?target={target}', headers=self.headers(self.reviewer))
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def create_assessment(self, campaign_id, *, target='public'):
        workspace = self.workspace(campaign_id, target)
        response = self.client.post(f'/campaigns/{campaign_id}/assessments',
                                    json={'target': target, 'contentHash': workspace['contentHash']}, headers=self.headers(self.reviewer))
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def save(self, record, payload=None):
        payload = payload or complete_payload(record['contentHash'])
        payload['expectedRevision'] = record['revision']
        return self.client.put(f'/campaigns/{record["campaignId"]}/assessments/{record["id"]}', json=payload, headers=self.headers(self.reviewer))

    def publish_assessment(self, record):
        return self.client.post(f'/campaigns/{record["campaignId"]}/assessments/{record["id"]}/publish',
                                json={'contentHash': record['contentHash'], 'expectedRevision': record['revision']}, headers=self.headers(self.reviewer))

    def finished(self, campaign_id, *, target='public', result='partial', private=False):
        record = self.create_assessment(campaign_id, target=target)
        saved = self.save(record, complete_payload(record['contentHash'], result=result, private=private))
        self.assertEqual(saved.status_code, 200, saved.text)
        response = self.publish_assessment(saved.json())
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_rubric_weights_anchors_and_uncalibrated_bands(self):
        rubric = self.client.get('/assessment-rubric').json()
        self.assertEqual(rubric['version'], RUBRIC_VERSION)
        self.assertEqual([item['maximum'] for item in rubric['criteria']], [30, 20, 20, 15, 15])
        self.assertEqual(sum(check['maximum'] for item in rubric['criteria'] for check in item['checks']), 100)
        self.assertEqual(len([check for item in rubric['criteria'] for check in item['checks']]), 13)
        self.assertIn('not a probability', rubric['limitations'])
        self.assertEqual([band['minimum'] for band in rubric['bands']], [0, 40, 70])

    def test_missing_is_not_zero_and_incomplete_has_no_public_score(self):
        campaign = self.publish()
        endpoint = f'/campaigns/{campaign["id"]}/assessment'
        missing = self.client.get(endpoint).json()
        self.assertEqual(missing['state'], 'not_assessed')
        self.assertIsNone(missing['assessment'])
        record = self.create_assessment(campaign['id'])
        incomplete = self.client.get(endpoint).json()
        self.assertEqual(incomplete['state'], 'in_progress')
        self.assertIsNone(incomplete['assessment'])
        self.assertNotIn(record['id'], json.dumps(incomplete))
        self.assertEqual(self.publish_assessment(record).status_code, 422)
        saved = self.save(record, complete_payload(record['contentHash'], result='none')).json()
        zero = self.publish_assessment(saved).json()
        self.assertEqual(zero['total'], 0)
        public = self.client.get(endpoint).json()
        self.assertEqual(public['state'], 'completed')
        self.assertEqual(public['assessment']['total'], 0)
        self.assertEqual(public['assessment']['classification'], 'Limited review coverage')

    def test_totals_are_server_derived_and_provenance_actor_timestamp_recorded(self):
        campaign = self.publish()
        record = self.finished(campaign['id'])
        self.assertEqual(record['total'], 47)
        self.assertEqual(record['total'], sum(criterion['points'] for criterion in record['criteria']))
        for criterion in record['criteria']:
            self.assertEqual(criterion['points'], sum(check['points'] for check in criterion['checks']))
        self.assertEqual(record['assessmentType'], 'reviewer')
        self.assertEqual(record['actorId'], self.reviewer['user']['id'])
        self.assertEqual(record['publishedBy'], self.reviewer['user']['id'])
        self.assertEqual(record['provenance']['kind'], 'reviewer')
        self.assertIsNotNone(record['publishedAt'])
        self.assertEqual(record['policyContext']['feeRate'], 0.05)
        public = self.client.get(f'/campaigns/{campaign["id"]}/assessment').json()['assessment']
        self.assertNotIn('actorId', public)
        self.assertNotIn('publishedBy', public)
        self.assertNotIn('snapshot', public)
        self.assertNotIn(self.reviewer['user']['email'], json.dumps(public))

    def test_input_cannot_write_scores_demo_provenance_or_unknown_ranges(self):
        record = self.create_assessment(self.publish()['id'])
        payload = complete_payload(record['contentHash'])
        for key, value in [('total', 100), ('assessmentType', 'demo'), ('provenance', {'kind': 'reviewer'}), ('actorId', 'fake')]:
            bad = {**payload, key: value}
            self.assertEqual(self.save(record, bad).status_code, 422)
        for field, value in [('points', 999), ('result', 'excellent')]:
            bad = copy.deepcopy(payload)
            bad['criteria'][0]['checks'][0][field] = value
            self.assertEqual(self.save(record, bad).status_code, 422)
        bad = copy.deepcopy(payload)
        bad['criteria'][0]['id'] = 'image_attractiveness'
        self.assertEqual(self.save(record, bad).status_code, 422)

    def test_unperformed_scored_checks_duplicate_ids_and_missing_reasons_rejected(self):
        record = self.create_assessment(self.publish()['id'])
        bad = complete_payload(record['contentHash'])
        bad['criteria'][0]['checks'][0]['performed'] = False
        self.assertEqual(self.save(record, bad).status_code, 422)
        bad = complete_payload(record['contentHash'])
        bad['criteria'][0]['checks'].append(copy.deepcopy(bad['criteria'][0]['checks'][0]))
        self.assertEqual(self.save(record, bad).status_code, 422)
        for field, value in [('reason', ''), ('evidence', []), ('missing', [])]:
            bad = complete_payload(record['contentHash'])
            bad['criteria'][0]['checks'][0][field] = value
            saved = self.save(record, bad)
            self.assertEqual(saved.status_code, 200, saved.text)
            record = saved.json()
            self.assertEqual(self.publish_assessment(record).status_code, 422)

    def test_partially_typed_evidence_can_save_draft_but_cannot_publish(self):
        record = self.create_assessment(self.publish()['id'])
        payload = complete_payload(record['contentHash'])
        payload['criteria'][0]['checks'][0]['evidence'][0]['note'] = '  '
        saved = self.save(record, payload)
        self.assertEqual(saved.status_code, 200, saved.text)
        self.assertEqual(saved.json()['criteria'][0]['checks'][0]['evidence'][0]['note'], '')
        self.assertEqual(self.publish_assessment(saved.json()).status_code, 422)

    def test_ordinary_creators_backers_and_guests_cannot_write_or_read_workspace(self):
        campaign_id = self.publish()['id']
        record = self.create_assessment(campaign_id)
        for headers, expected in [({}, 401), (self.headers(), 403), (self.headers(self.other), 403)]:
            self.assertEqual(self.client.get(f'/campaigns/{campaign_id}/assessment-workspace', headers=headers).status_code, expected)
            self.assertEqual(self.client.post(f'/campaigns/{campaign_id}/assessments', json={'contentHash': record['contentHash']}, headers=headers).status_code, expected)
            self.assertEqual(self.client.put(f'/campaigns/{campaign_id}/assessments/{record["id"]}', json=complete_payload(record['contentHash']), headers=headers).status_code, expected)
            self.assertEqual(self.client.post(f'/campaigns/{campaign_id}/assessments/{record["id"]}/publish', json={'contentHash': record['contentHash'], 'expectedRevision': 1}, headers=headers).status_code, expected)

    def test_private_evidence_is_not_in_public_response_or_draft_projection(self):
        campaign_id = self.publish()['id']
        record = self.create_assessment(campaign_id)
        payload = complete_payload(record['contentHash'], private=True)
        payload['criteria'][0]['checks'][0]['evidence'][0]['note'] = 'PRIVATE-TEST-NOTE'
        payload['criteria'][0]['checks'][0]['evidence'][0]['reference'] = 'private:internal-test-only'
        saved = self.save(record, payload).json()
        self.assertNotIn('PRIVATE-TEST-NOTE', self.client.get(f'/campaigns/{campaign_id}/assessment').text)
        self.assertEqual(self.publish_assessment(saved).status_code, 200)
        public = self.client.get(f'/campaigns/{campaign_id}/assessment')
        self.assertNotIn('PRIVATE-TEST-NOTE', public.text)
        self.assertNotIn('private:internal-test-only', public.text)
        first = public.json()['assessment']['criteria'][0]['checks'][0]
        self.assertEqual(first['evidence'], [])
        self.assertTrue(first['privateEvidenceWithheld'])
        workspace = self.workspace(campaign_id)
        self.assertNotIn('PRIVATE-TEST-NOTE', json.dumps(workspace['published']))

    def test_private_draft_edits_and_contributions_preserve_approved_public_assessment(self):
        campaign = self.publish()
        record = self.finished(campaign['id'])
        self.assertEqual(self.contribute(campaign['id']).status_code, 200)
        self.client.post(f'/campaigns/{campaign["id"]}/revision', headers=self.headers())
        changed = self.client.put(f'/campaigns/{campaign["id"]}', json={'summary': 'Private working content differs.'}, headers=self.headers())
        self.assertEqual(changed.status_code, 200, changed.text)
        public = self.client.get(f'/campaigns/{campaign["id"]}/assessment').json()
        self.assertEqual(public['state'], 'completed')
        self.assertEqual(public['contentHash'], record['contentHash'])
        self.assertEqual(public['assessment']['id'], record['id'])
        self.assertNotEqual(self.workspace(campaign['id'], 'working')['contentHash'], record['contentHash'])

    def test_campaign_public_hash_matches_assessment_across_private_edit_and_approval(self):
        campaign_id = self.publish()['id']
        record = self.finished(campaign_id)
        original_hash = record['contentHash']

        def assert_public_binding(expected_hash, private_hash=None):
            for account in (None, self.creator, self.reviewer):
                headers = self.headers(account) if account else {}
                detail = self.client.get(f'/campaigns/{campaign_id}', headers=headers)
                assessment = self.client.get(f'/campaigns/{campaign_id}/assessment', headers=headers)
                self.assertEqual(detail.status_code, 200, detail.text)
                self.assertEqual(assessment.status_code, 200, assessment.text)
                self.assertEqual(detail.json()['publicContentHash'], expected_hash)
                self.assertEqual(assessment.json()['contentHash'], expected_hash)
                if private_hash:
                    self.assertNotEqual(detail.json()['publicContentHash'], private_hash)
                    self.assertNotIn(private_hash, detail.text)
                    self.assertNotIn(private_hash, assessment.text)

        assert_public_binding(original_hash)
        response = self.client.post(f'/campaigns/{campaign_id}/revision', headers=self.headers())
        self.assertEqual(response.status_code, 200, response.text)
        response = self.client.put(f'/campaigns/{campaign_id}',
            json={'summary': 'Private future summary must not become the public assessment binding.'}, headers=self.headers())
        self.assertEqual(response.status_code, 200, response.text)
        working_hash = self.workspace(campaign_id, 'working')['contentHash']
        self.assertNotEqual(working_hash, original_hash)
        assert_public_binding(original_hash, working_hash)
        public = self.client.get(f'/campaigns/{campaign_id}').json()
        self.assertNotIn('Private future summary', json.dumps(public))
        self.assertEqual(self.client.get(f'/campaigns/{campaign_id}/assessment').json()['assessment']['id'], record['id'])

        response = self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.assertEqual(response.status_code, 200, response.text)
        response = self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(response.status_code, 200, response.text)
        assert_public_binding(working_hash)
        assessment = self.client.get(f'/campaigns/{campaign_id}/assessment').json()
        self.assertEqual(assessment['state'], 'superseded')
        self.assertIsNone(assessment['assessment'])
        self.assertEqual(assessment['history'][0]['id'], record['id'])

    def test_unpublished_campaign_exposes_no_private_content_hash(self):
        campaign = self.create(summary='Unpublished private draft content.')
        campaign_id = campaign['id']
        private_hash = self.workspace(campaign_id, 'working')['contentHash']
        self.assertIsNone(campaign['publicContentHash'])
        for account in (self.creator, self.reviewer):
            detail = self.client.get(f'/campaigns/{campaign_id}', headers=self.headers(account))
            self.assertEqual(detail.status_code, 200, detail.text)
            self.assertIsNone(detail.json()['publicContentHash'])
            self.assertNotIn(private_hash, detail.text)
            assessment = self.client.get(f'/campaigns/{campaign_id}/assessment', headers=self.headers(account))
            self.assertIsNone(assessment.json()['contentHash'])
        for headers in ({}, self.headers(self.other)):
            self.assertEqual(self.client.get(f'/campaigns/{campaign_id}', headers=headers).status_code, 404)
            self.assertEqual(self.client.get(f'/campaigns/{campaign_id}/assessment', headers=headers).status_code, 404)

    def test_changed_public_revision_is_superseded_history_not_current_score(self):
        campaign_id = self.publish()['id']
        record = self.finished(campaign_id)
        self.client.post(f'/campaigns/{campaign_id}/revision', headers=self.headers())
        self.client.put(f'/campaigns/{campaign_id}', json={'summary': 'Material updated public summary.'}, headers=self.headers())
        self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': True}, headers=self.headers())
        response = self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(response.status_code, 200, response.text)
        current = self.client.get(f'/campaigns/{campaign_id}/assessment').json()
        self.assertEqual(current['state'], 'superseded')
        self.assertIsNone(current['assessment'])
        self.assertNotEqual(current['contentHash'], record['contentHash'])
        self.assertEqual(current['history'][0]['id'], record['id'])
        self.assertEqual(self.publish_assessment(record).status_code, 409)

    def test_assessment_of_private_revision_is_hidden_until_exact_public_approval(self):
        campaign_id = self.publish()['id']
        self.client.post(f'/campaigns/{campaign_id}/revision', headers=self.headers())
        self.client.put(f'/campaigns/{campaign_id}', json={'summary': 'Private assessed future story.'}, headers=self.headers())
        working = self.finished(campaign_id, target='working')
        public = self.client.get(f'/campaigns/{campaign_id}/assessment').json()
        self.assertEqual(public['state'], 'not_assessed')
        self.assertNotIn(working['id'], json.dumps(public))
        self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(self.client.get(f'/campaigns/{campaign_id}/assessment').json()['assessment']['id'], working['id'])
        self.client.post(f'/campaigns/{campaign_id}/revision', headers=self.headers())
        self.client.put(f'/campaigns/{campaign_id}', json={'summary': 'Second changed future story.'}, headers=self.headers())
        self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        history = self.client.get(f'/campaigns/{campaign_id}/assessment').json()
        self.assertEqual(history['state'], 'superseded')
        self.assertEqual(history['history'][0]['id'], working['id'])

    def test_unpublished_campaign_and_assessment_stay_private(self):
        campaign_id = self.create()['id']
        record = self.finished(campaign_id, target='working')
        endpoint = f'/campaigns/{campaign_id}/assessment'
        self.assertEqual(self.client.get(endpoint).status_code, 404)
        self.assertEqual(self.client.get(endpoint, headers=self.headers(self.other)).status_code, 404)
        own = self.client.get(endpoint, headers=self.headers()).json()
        self.assertEqual(own['state'], 'not_assessed')
        self.assertNotIn(record['id'], json.dumps(own))
        self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(self.transition(campaign_id, 'Available for Funding').status_code, 200)
        self.assertEqual(self.client.get(endpoint).json()['assessment']['id'], record['id'])

    def test_publication_is_concurrently_idempotent_immutable_and_no_business_side_effect(self):
        campaign_id = self.publish()['id']
        with self.app.state.database.connect() as connection:
            before = dict(connection.execute('SELECT * FROM campaigns WHERE id=?', (campaign_id,)).fetchone())
            counts = {table: connection.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]
                      for table in ['payments', 'ledger', 'campaign_events', 'notifications']}
        draft = self.create_assessment(campaign_id)
        draft = self.save(draft).json()
        with ThreadPoolExecutor(max_workers=4) as workers:
            results = list(workers.map(lambda _: self.publish_assessment(draft), range(6)))
        self.assertTrue(all(response.status_code == 200 for response in results), [response.text for response in results])
        self.assertEqual(len({response.json()['publishedAt'] for response in results}), 1)
        self.assertEqual(len({response.json()['id'] for response in results}), 1)
        self.assertEqual(self.save(results[0].json()).status_code, 409)
        with self.app.state.database.connect() as connection:
            self.assertEqual(dict(connection.execute('SELECT * FROM campaigns WHERE id=?', (campaign_id,)).fetchone()), before)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM campaign_assessments').fetchone()[0], 1)
            for table, count in counts.items():
                self.assertEqual(connection.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0], count)

    def test_draft_resume_stale_save_and_content_hash_conflicts(self):
        campaign_id = self.publish()['id']
        draft = self.create_assessment(campaign_id)
        self.assertEqual(self.create_assessment(campaign_id)['id'], draft['id'])
        saved = self.save(draft).json()
        self.assertEqual(self.save(draft).status_code, 409)
        wrong = {**complete_payload(saved['contentHash']), 'contentHash': 'f' * 64}
        self.assertEqual(self.save(saved, wrong).status_code, 409)
        self.assertEqual(self.workspace(campaign_id)['draft']['revision'], saved['revision'])

    def test_assessment_survives_restart_and_legacy_client_contract_unchanged(self):
        campaign_id = self.publish()['id']
        before = self.client.get(f'/campaigns/{campaign_id}').json()
        record = self.finished(campaign_id)
        with TestClient(create_app(self.path, seed=False)) as restarted:
            current = restarted.get(f'/campaigns/{campaign_id}/assessment').json()
            self.assertEqual(current['assessment']['id'], record['id'])
            self.assertEqual(restarted.get(f'/campaigns/{campaign_id}').json(), before)

    def test_hash_excludes_editor_progress_but_binds_all_public_material(self):
        content = self.workspace(self.publish()['id'])['content']
        first = content_hash(content)
        self.assertEqual(content_hash({**content, 'currentStep': 3, 'featured': True, 'raised': 999}), first)
        for field, value in [('summary', 'Changed'), ('creatorName', 'Different'), ('goal', 1000), ('geography', 'Different location'), ('adHeadline', 'Different ad'), ('coverImage', 'https://example.org/new.jpg')]:
            self.assertNotEqual(content_hash({**content, field: value}), first, field)
        self.assertNotIn('currentStep', content_snapshot(content))

    def test_old_rubric_record_becomes_history_instead_of_current_score(self):
        campaign_id = self.publish()['id']
        record = self.finished(campaign_id)
        with self.app.state.database.transaction() as connection:
            connection.execute('UPDATE campaign_assessments SET rubric_version=? WHERE id=?', ('historical-rubric', record['id']))
        result = self.client.get(f'/campaigns/{campaign_id}/assessment').json()
        self.assertEqual(result['state'], 'superseded')
        self.assertIsNone(result['assessment'])
        self.assertEqual(result['history'][0]['rubricVersion'], 'historical-rubric')
        self.assertEqual(self.publish_assessment(record).status_code, 409)

    def test_additive_migration_preserves_existing_accounts_campaigns_and_payment_records(self):
        campaign_id = self.publish()['id']
        self.assertEqual(self.contribute(campaign_id).status_code, 200)
        with self.app.state.database.transaction() as connection:
            previous = {table: [dict(row) for row in connection.execute(f'SELECT * FROM {table} ORDER BY 1')]
                        for table in ['users', 'sessions', 'campaigns', 'payments', 'ledger', 'campaign_events']}
            connection.execute('DROP TABLE campaign_assessments')
            connection.execute('DROP TABLE campaign_seed_registry')
            connection.execute('DELETE FROM schema_migrations WHERE version=7')
        restarted = create_app(self.path, seed=False)
        with restarted.state.database.connect() as connection:
            for table, rows in previous.items():
                self.assertEqual([dict(row) for row in connection.execute(f'SELECT * FROM {table} ORDER BY 1')], rows, table)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM campaign_assessments').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM campaign_seed_registry').fetchone()[0], 0)

    def test_demo_helper_exact_fixture_guard_and_honest_individual_score(self):
        # Isolated original fixture seeding, no live Campaign database.
        from seed import seed_demo
        from decimal import Decimal
        seed_demo(self.app.state.database, Decimal('0.05'), 27)
        with self.app.state.database.transaction() as connection:
            campaign = dict(connection.execute("SELECT * FROM campaigns WHERE id='demo_ocean'").fetchone())
            register_demo_campaign(connection, campaign, 'test-demo-v1', {'manifest': 'isolated-test'})
            payload = complete_payload(content_hash(campaign['published_json']))
            first = publish_demo_assessment(connection, campaign, payload, 'test-demo-v1', {'manifest': 'isolated-test'}, {'version': 'prototype-funding-v1'})
            second = publish_demo_assessment(connection, campaign, payload, 'test-demo-v1', {'manifest': 'isolated-test'}, {'version': 'prototype-funding-v1'})
            self.assertEqual(first['id'], second['id'])
            self.assertEqual(first['assessmentType'], 'demo')
            self.assertEqual(first['provenance']['kind'], 'automated_demo')
            self.assertEqual(first['total'], 47)
        public = self.client.get('/campaigns/demo_ocean/assessment').json()
        self.assertEqual(public['assessment']['provenance']['label'], 'Demo assessment')
        reviewer = self.finished('demo_ocean', result='none')
        current = self.client.get('/campaigns/demo_ocean/assessment').json()
        self.assertEqual(current['assessment']['id'], reviewer['id'])
        self.assertEqual(current['assessment']['assessmentType'], 'reviewer')
        self.assertEqual(current['history'][0]['id'], first['id'])
        with self.app.state.database.transaction() as connection:
            campaign = dict(connection.execute("SELECT * FROM campaigns WHERE id='demo_ocean'").fetchone())
            changed = json.loads(campaign['published_json'])
            changed['summary'] = 'A later user edit must not inherit seeded assessment support.'
            campaign['published_json'] = json.dumps(changed)
            with self.assertRaises(ValueError):
                publish_demo_assessment(connection, campaign, complete_payload(content_hash(changed)), 'test-demo-v1', {}, {})
        created = self.create()
        with self.app.state.database.transaction() as connection:
            campaign = dict(connection.execute('SELECT * FROM campaigns WHERE id=?', (created['id'],)).fetchone())
            with self.assertRaises(ValueError):
                register_demo_campaign(connection, campaign, 'test-demo-v1', {})


if __name__ == '__main__':
    unittest.main(verbosity=2)
