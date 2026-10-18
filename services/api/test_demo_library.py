"""Disposable SQLite only. Never reads an existing user/cloud database."""
from decimal import Decimal
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image

from assessments import content_hash, public_assessment
from db import Database, ROOT
from demo_library import (ExistingTarget, LIBRARY_VERSION, apply_plan, manifest,
                          plan, preserved_snapshot)
from domain import CATEGORIES, stamp
from seed import seed_demo


class DemoLibraryTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict('os.environ', {'CAMPAIGN_ENV': 'local', 'CAMPAIGN_MEDIA_STORAGE': 'local',
            'CAMPAIGN_REVIEWER_EMAIL': 'library-reviewer@example.test',
            'CAMPAIGN_REVIEWER_PASSWORD': 'isolated-library-reviewer-password'})
        self.environment.start()
        folder = ROOT / 'data' / 'tests'
        folder.mkdir(parents=True, exist_ok=True)
        self.temporary = tempfile.TemporaryDirectory(dir=folder)
        self.path = Path(self.temporary.name) / 'isolated.db'
        self.database = Database(self.path)
        seed_demo(self.database, Decimal('0.05'), 27)

    def tearDown(self):
        self.temporary.cleanup()
        self.environment.stop()

    def dry_run(self):
        with self.database.connect() as connection:
            return plan(connection)

    def apply(self):
        return apply_plan(self.database, self.dry_run()['planSHA256'])

    def rows(self, table):
        with self.database.connect() as connection:
            return {row['id']: dict(row) for row in connection.execute(f'SELECT * FROM {table}').fetchall()}

    def test_complete_unique_coverage_and_separate_media(self):
        value = manifest()
        self.assertEqual(len(value['existing']), 6)
        self.assertEqual(len(value['campaigns']), 14)
        counts = {category: 0 for category in CATEGORIES}
        for entry in value['existing'] + value['campaigns']:
            counts[entry['content']['category']] += 1
        self.assertEqual(set(counts.values()), {2})
        for entry in value['campaigns']:
            self.assertNotIn(entry['content']['coverImage'], entry['content']['adImages'])
            self.assertEqual(entry['initialRaisedUSD'], 0)
            self.assertEqual(sum(entry['content']['allocation'].values()), 100)
            self.assertIn('fictional', ' '.join(section['text'] for section in entry['content']['sections']))

    def test_readonly_dry_run_reports_actual_counts_without_writes(self):
        target = ExistingTarget(self.path)
        connection = target.connect()
        try:
            before = preserved_snapshot(connection)
            preview = plan(connection)
            self.assertEqual(before, preserved_snapshot(connection))
            with self.assertRaisesRegex(Exception, 'readonly'):
                connection.execute('UPDATE campaigns SET updated_at=?', (stamp(),))
        finally:
            connection.close()
        self.assertEqual(sum(preview['categoryCountsBefore'].values()), 6)
        self.assertEqual(preview['categoryCountsAfter'], {category: 2 for category in CATEGORIES})
        self.assertEqual(len(preview['recordsToInsert']), 14)
        self.assertEqual(len(preview['assessments']), 20)
        self.assertTrue(preview['canApply'])

    def test_insert_rerun_is_idempotent_and_existing_records_byte_preserved(self):
        old = {name: self.rows(name) for name in ['users', 'campaigns', 'campaign_events', 'payments', 'ledger']}
        first = self.apply()
        after = {name: self.rows(name) for name in old}
        for table in old:
            for key, row in old[table].items():
                self.assertEqual(row, after[table][key], (table, key))
        self.assertEqual(len(first['insertedIds']), 14)
        second = self.apply()
        self.assertEqual(second['insertedIds'], [])
        self.assertEqual(set(first['assessmentIds']), set(second['assessmentIds']))
        self.assertEqual({name: self.rows(name) for name in old}, after)
        with self.database.connect() as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM campaign_assessments').fetchone()[0], 20)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM payments').fetchone()[0], 6)

    def test_user_edits_funding_dates_and_private_revision_survive(self):
        self.apply()
        with self.database.transaction() as connection:
            row = dict(connection.execute("SELECT * FROM campaigns WHERE id='demo_sleep'").fetchone())
            content = json.loads(row['data_json'])
            content['summary'] = 'Private saved editor change that must remain private.'
            connection.execute("UPDATE campaigns SET data_json=?,revision_status='Changes Requested',version=2 WHERE id='demo_sleep'", (json.dumps(content),))
            connection.execute("UPDATE campaigns SET deadline='2030-01-01T00:00:00Z' WHERE id='demo_forest'")
            connection.execute("UPDATE payments SET amount_cents=amount_cents+1 WHERE id='seed_forest'")
            connection.execute("UPDATE ledger SET gross_cents=gross_cents+1 WHERE payment_id='seed_forest' AND kind='contribution'")
        before = {name: self.rows(name) for name in ['campaigns', 'payments', 'ledger']}
        self.apply()
        self.assertEqual(before, {name: self.rows(name) for name in before})
        with self.database.connect() as connection:
            row = dict(connection.execute("SELECT * FROM campaigns WHERE id='demo_sleep'").fetchone())
            self.assertEqual(public_assessment(connection, row)['state'], 'completed')

    def test_changed_public_content_is_preserved_and_not_autoscored(self):
        with self.database.transaction() as connection:
            row = connection.execute("SELECT published_json FROM campaigns WHERE id='demo_forest'").fetchone()
            content = json.loads(row[0])
            content['summary'] = 'Edited published source content; authoring assessment is no longer applicable.'
            connection.execute("UPDATE campaigns SET data_json=?,published_json=? WHERE id='demo_forest'", (json.dumps(content), json.dumps(content)))
        original = self.rows('campaigns')['demo_forest']
        preview = self.dry_run()
        self.assertNotIn('demo_forest', {item['id'] for item in preview['assessments']})
        self.apply()
        self.assertEqual(original, self.rows('campaigns')['demo_forest'])
        with self.database.connect() as connection:
            self.assertEqual(public_assessment(connection, original)['state'], 'not_assessed')

    def test_post_assessment_public_edit_does_not_get_old_score(self):
        self.apply()
        with self.database.transaction() as connection:
            row = dict(connection.execute("SELECT * FROM campaigns WHERE id='demo_sleep'").fetchone())
            content = json.loads(row['published_json'])
            content['intro'] += ' New public content requires another real assessment.'
            connection.execute("UPDATE campaigns SET data_json=?,published_json=?,approved_version=2,version=2 WHERE id='demo_sleep'", (json.dumps(content), json.dumps(content)))
        self.apply()
        with self.database.connect() as connection:
            row = dict(connection.execute("SELECT * FROM campaigns WHERE id='demo_sleep'").fetchone())
            result = public_assessment(connection, row)
            self.assertEqual(result['state'], 'superseded')
            self.assertIsNone(result['assessment'])

    def test_nonfixture_stable_id_collision_blocks_atomically(self):
        with self.database.transaction() as connection:
            owner = connection.execute("SELECT owner_id FROM campaigns LIMIT 1").fetchone()[0]
            content = json.dumps(manifest()['campaigns'][0]['content'])
            connection.execute("INSERT INTO campaigns(id,owner_id,data_json,status,created_at,updated_at) VALUES ('demo_sleep',?,?,'Draft',?,?)", (owner, content, stamp(), stamp()))
        preview = self.dry_run()
        before = self.rows('campaigns')
        self.assertFalse(preview['canApply'])
        with self.assertRaisesRegex(ValueError, 'plan changed|prerequisites'):
            apply_plan(self.database, preview['planSHA256'])
        self.assertEqual(before, self.rows('campaigns'))

    def test_no_title_demo_heuristic_and_stale_plan_rejected(self):
        preview = self.dry_run()
        with self.database.transaction() as connection:
            owner = connection.execute('SELECT owner_id FROM campaigns LIMIT 1').fetchone()[0]
            content = dict(manifest()['campaigns'][0]['content'], title='Demo QA record is not an owned seed')
            connection.execute("INSERT INTO campaigns(id,owner_id,data_json,status,created_at,updated_at) VALUES ('qa_example',?,?,'Draft',?,?)", (owner, json.dumps(content), stamp(), stamp()))
        with self.assertRaisesRegex(ValueError, 'plan changed'):
            apply_plan(self.database, preview['planSHA256'])
        changed = self.dry_run()
        self.assertEqual(sum(changed['categoryCountsBefore'].values()), 6)
        self.assertNotIn('qa_example', {item['id'] for item in changed['assessments']})

    def test_new_campaigns_have_zero_reconciled_money_and_real_server_discovery(self):
        self.apply()
        from main import create_app
        with TestClient(create_app(self.path, seed=False)) as client:
            campaigns = client.get('/campaigns').json()
            self.assertEqual(len(campaigns), 20)
            for category in CATEGORIES:
                filtered = client.get('/campaigns', params={'category': category}).json()
                self.assertEqual(len(filtered), 2)
            for entry in manifest()['campaigns']:
                detail = client.get(f'/campaigns/{entry["id"]}').json()
                self.assertEqual(detail['raised'], 0)
                report = client.get(f'/campaigns/{entry["id"]}/report').json()
                self.assertEqual(report['fees'], 0)
                self.assertEqual(report['allocated'], 0)
                self.assertEqual(report['spent'], 0)
                self.assertEqual(report['contributionCount'], 0)
                self.assertEqual(report['measuredReach'], None)
                found = client.get('/campaigns', params={'q': entry['content']['title']}).json()
                self.assertIn(entry['id'], {item['id'] for item in found})
                score = client.get(f'/campaigns/{entry["id"]}/assessment').json()['assessment']
                self.assertEqual(score['assessmentType'], 'demo')
                self.assertEqual(score['total'], sum(item['points'] for item in score['criteria']))

    def test_media_assets_are_bounded_resolvable_and_match_provenance(self):
        records = json.loads((ROOT/'assets/seed/library-v1/media-manifest.json').read_text())
        self.assertEqual(len(records), 8)
        for item in records:
            path = ROOT/'assets/seed'/item['file']
            with Image.open(path) as image:
                self.assertLessEqual(max(image.size), 960)
            self.assertLess(path.stat().st_size, 250000)
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), item['sha256'])
        from main import create_app
        self.apply()
        with TestClient(create_app(self.path, seed=False)) as client:
            for item in self.dry_run()['media']:
                response = client.get(item['url'])
                self.assertEqual(response.status_code, 200)
                self.assertEqual(hashlib.sha256(response.content).hexdigest(), item['sha256'])

    def test_test_app_does_not_write_shared_reviewer_credentials(self):
        from main import create_app
        with patch('pathlib.Path.write_text') as writer:
            create_app(self.path, seed=False)
        self.assertFalse(any(call.args and 'Local reviewer credentials' in str(call.args[0]) for call in writer.call_args_list))

    def test_cloud_target_rejects_non_tls_and_schema_injection_without_connection(self):
        target = ExistingTarget(cloud=True)
        with patch('psycopg.connect') as connect:
            with patch.dict('os.environ', {'CAMPAIGN_DATABASE_URL': 'postgresql://fixture:only-test@example.invalid/db'}):
                with self.assertRaisesRegex(ValueError, 'TLS'):
                    target.connect()
            with patch.dict('os.environ', {'CAMPAIGN_DATABASE_URL': 'postgresql://fixture:only-test@example.invalid/db?sslmode=require',
                                         'CAMPAIGN_DATABASE_SCHEMA': 'public;DROP TABLE users'}):
                with self.assertRaisesRegex(ValueError, 'schema'):
                    target.connect()
            connect.assert_not_called()


if __name__ == '__main__':
    unittest.main(verbosity=2)
