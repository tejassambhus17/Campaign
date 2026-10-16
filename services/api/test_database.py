"""Storage-boundary checks; no existing application database or cloud account."""
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from db import Database, Record, ROOT, postgres_query


class DatabaseBoundaryTests(unittest.TestCase):
    def test_qmark_binding_does_not_rewrite_quoted_values_or_comments(self):
        statement = '''SELECT ?, '?', "a?", 'It''s ? 100%' -- ?
            /* ? */ WHERE key=? AND title LIKE '100%' '''
        translated = postgres_query(statement)
        self.assertEqual(translated, '''SELECT %s, '?', "a?", 'It''s ? 100%%' -- ?
            /* ? */ WHERE key=%s AND title LIKE '100%%' ''')

    def test_rows_preserve_integer_and_named_reads_and_camelcase_json(self):
        row = Record([('previousState', 'Draft'), ('newState', 'Submitted for Review')])
        self.assertEqual(row[0], row['previousState'])
        self.assertEqual(row[-1], row['newState'])
        self.assertEqual(dict(row), {'previousState': 'Draft', 'newState': 'Submitted for Review'})

    def test_explicit_sqlite_path_ignores_cloud_database_configuration(self):
        folder = ROOT / 'data' / 'tests'
        folder.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=folder) as temporary:
            with patch.dict(os.environ, {'CAMPAIGN_DATABASE_URL': 'postgresql://not-used.invalid/test',
                                         'CAMPAIGN_RECEIPT_SECRET': ''}):
                database = Database(Path(temporary) / 'isolated.db')
            self.assertEqual(database.backend, 'sqlite')
            self.assertEqual(database.notification_order, 'rowid')
            with database.connect() as connection:
                self.assertEqual(connection.execute('SELECT COUNT(*) FROM users').fetchone()[0], 0)

    def test_postgres_rejects_missing_secret_before_connecting(self):
        with patch.dict(os.environ, {'CAMPAIGN_DATABASE_URL': 'postgresql://not-used.invalid/test',
                                     'CAMPAIGN_RECEIPT_SECRET': '', 'CAMPAIGN_DATABASE_SCHEMA': 'public'}):
            with self.assertRaisesRegex(ValueError, 'RECEIPT_SECRET'):
                Database()

    def test_postgres_rejects_schema_injection_before_connecting(self):
        with patch.dict(os.environ, {'CAMPAIGN_DATABASE_URL': 'postgresql://not-used.invalid/test',
                                     'CAMPAIGN_RECEIPT_SECRET': 'test-only-' * 5,
                                     'CAMPAIGN_DATABASE_SCHEMA': 'public; DROP TABLE users'}):
            with self.assertRaisesRegex(ValueError, 'simple PostgreSQL identifier'):
                Database()


if __name__ == '__main__':
    unittest.main(verbosity=2)
