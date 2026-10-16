"""Actual PostgreSQL API regressions, opt-in with CAMPAIGN_TEST_POSTGRES_URL.

Each case creates a uniquely named Campaign-only schema and drops only that
schema afterward. Never point the test role at a database with broad privileges
over unrelated data. Missing configuration is reported as SKIPPED, not passed.
No local Campaign SQLite data or private user records are read or migrated.
"""
from concurrent.futures import ThreadPoolExecutor
import os
import tempfile
import unittest
from unittest.mock import patch
import uuid

from fastapi.testclient import TestClient
import psycopg
from psycopg import sql

from db import ROOT
from main import create_app
import test_api
import test_cloud_api

TEST_URL = os.getenv('CAMPAIGN_TEST_POSTGRES_URL', '')


@unittest.skipUnless(TEST_URL, 'Requires an explicitly configured isolated PostgreSQL test database.')
class PostgresApiTests(test_api.ApiTests):
    def setUp(self):
        self.schemas = []
        schema = self.make_schema()
        folder = ROOT / 'data' / 'tests'
        folder.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=folder)
        self.env = patch.dict(os.environ, {
            'CAMPAIGN_DATABASE_URL': TEST_URL, 'CAMPAIGN_DATABASE_SCHEMA': schema,
            'CAMPAIGN_RECEIPT_SECRET': 'isolated-postgres-test-only-receipt-key-2026',
            'CAMPAIGN_REVIEWER_EMAIL': 'test-reviewer@example.test',
            'CAMPAIGN_REVIEWER_PASSWORD': 'test-only-reviewer-password',
            'CAMPAIGN_ENV': 'local',
        })
        self.env.start()
        # Existing restart cases create_app(self.path) still exercise PostgreSQL.
        self.path = None
        self.app = create_app(seed=False)
        self.assertEqual(self.app.state.database.backend, 'postgresql')
        self.client = TestClient(self.app)
        self.creator = self.register('creator@example.test')
        self.other = self.register('other@example.test')
        response = self.client.post('/auth/login', json={
            'email': 'test-reviewer@example.test', 'password': 'test-only-reviewer-password'})
        self.assertEqual(response.status_code, 200, response.text)
        self.reviewer = response.json()

    def make_schema(self):
        schema = 'campaign_test_' + uuid.uuid4().hex
        with psycopg.connect(TEST_URL, autocommit=True) as connection:
            connection.execute(sql.SQL('CREATE SCHEMA {}').format(sql.Identifier(schema)))
        self.schemas.append(schema)
        return schema

    def tearDown(self):
        self.client.close()
        self.env.stop()
        self.temp.cleanup()
        with psycopg.connect(TEST_URL, autocommit=True) as connection:
            for schema in self.schemas:
                # Only exact schema names created and retained by this case.
                if not schema.startswith('campaign_test_') or len(schema) != 46:
                    raise AssertionError('Refusing non-test schema cleanup.')
                connection.execute(sql.SQL('DROP SCHEMA {} CASCADE').format(sql.Identifier(schema)))

    def test_seeded_discovery_and_completed_reporting(self):
        # The inherited seed test explicitly creates a SQLite path. Here use a
        # second empty PostgreSQL schema instead, without changing the base test.
        schema = self.make_schema()
        with patch.dict(os.environ, {'CAMPAIGN_DATABASE_SCHEMA': schema}):
            with TestClient(create_app(seed=True)) as client:
                campaigns = client.get('/campaigns').json()
                self.assertEqual(len(campaigns), 6)
                self.assertEqual(campaigns[0]['publishedAt'], campaigns[0]['createdAt'])
                self.assertIsNone(campaigns[0]['submittedAt'])
                self.assertEqual(len(client.get('/campaigns?category=Environment').json()), 2)
                self.assertEqual(client.get('/campaigns?q=not-a-match').json(), [])
                report = client.get('/campaigns/demo_science/report').json()
                self.assertTrue(report['final'])
                self.assertTrue(report['simulated'])
                self.assertIsNone(report['measuredReach'])

    def test_duplicate_registration_rolls_back_and_keeps_existing_session(self):
        response = self.client.post('/auth/register', json={
            'name': 'Duplicate', 'email': 'creator@example.test', 'password': 'test-only-password'})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(self.client.get('/me', headers=self.headers()).status_code, 200)
        with self.app.state.database.connect() as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM users WHERE email=?',
                                               ('creator@example.test',)).fetchone()[0], 1)

    def test_reviewer_bootstrap_rejects_member_collision_without_promotion(self):
        with patch.dict(os.environ, {'CAMPAIGN_REVIEWER_EMAIL': 'creator@example.test'}):
            with self.assertRaisesRegex(ValueError, 'belongs to a member'):
                create_app(seed=False)
        profile = self.client.get('/me', headers=self.headers()).json()
        self.assertEqual(profile['user']['role'], 'member')
        self.assertEqual(self.client.get('/review-queue', headers=self.headers()).status_code, 403)

    def test_parallel_factories_reuse_atomic_migrations_and_reviewer(self):
        def initialize(_):
            application = create_app(seed=False)
            with application.state.database.connect() as connection:
                versions = [row[0] for row in connection.execute('SELECT version FROM schema_migrations ORDER BY version')]
                reviewer_count = connection.execute("SELECT COUNT(*) FROM users WHERE role='reviewer'").fetchone()[0]
            return versions, reviewer_count
        with ThreadPoolExecutor(max_workers=4) as workers:
            results = list(workers.map(initialize, range(4)))
        expected_versions = [int(path.name.split('_')[0]) for path in sorted((ROOT / 'migrations' / 'postgres').glob('*.sql'))]
        self.assertTrue(all(versions == expected_versions and count == 1 for versions, count in results))

    def test_invalid_reference_and_failed_transaction_do_not_persist(self):
        with self.assertRaises(psycopg.errors.ForeignKeyViolation):
            with self.app.state.database.transaction() as connection:
                connection.execute('INSERT INTO tracking VALUES (?,?,?,?)',
                                   (self.creator['user']['id'], 'missing-campaign', 'save', '2026-10-16T00:00:00Z'))
        self.assertEqual(self.client.get('/me', headers=self.headers()).json()['saved'], [])


@unittest.skipUnless(TEST_URL, 'Requires an explicitly configured isolated PostgreSQL test database.')
class PostgresCloudBoundaryTests(test_cloud_api.CloudBoundaryTests):
    setUp = PostgresApiTests.setUp
    tearDown = PostgresApiTests.tearDown
    make_schema = PostgresApiTests.make_schema


if __name__ == '__main__':
    unittest.main(verbosity=2)
