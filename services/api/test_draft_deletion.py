"""Confirmed draft deletion against disposable SQLite; no configured cloud DB."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
import io
import json
import threading
import unittest
from unittest.mock import MagicMock, patch
from PIL import Image

from db import Database, WRITE_LOCK
import test_api


class DraftDeletionTests(unittest.TestCase):
    setUp, tearDown = test_api.ApiTests.setUp, test_api.ApiTests.tearDown
    register, headers, create = test_api.ApiTests.register, test_api.ApiTests.headers, test_api.ApiTests.create
    publish, transition, contribute = test_api.ApiTests.publish, test_api.ApiTests.transition, test_api.ApiTests.contribute

    def delete(self, campaign_id, account=None):
        return self.client.delete(f'/campaigns/{campaign_id}/draft', headers=self.headers(account))

    def test_owner_only_and_missing_draft(self):
        campaign = self.create()
        endpoint = f'/campaigns/{campaign["id"]}/draft'
        self.assertEqual(self.client.delete(endpoint).status_code, 401)
        self.assertEqual(self.delete(campaign['id'], self.other).status_code, 403)
        self.assertEqual(self.delete(campaign['id'], self.reviewer).status_code, 403)
        self.assertEqual(self.delete('missing').status_code, 404)
        self.assertEqual(self.client.get(f'/campaigns/{campaign["id"]}', headers=self.headers()).status_code, 200)

    def test_content_removed_and_refresh_restart_never_resurrects(self):
        campaign = self.create(clientDraftId='disposable-qa-local')
        other = self.create(title='Unrelated record stays intact')
        response = self.delete(campaign['id'])
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json(), {'deleted': True, 'campaignId': campaign['id'], 'scope': 'account'})
        self.assertEqual(self.delete(campaign['id']).status_code, 200)  # An uncertain retry is safe.
        for suffix in ['', '/report', '/updates', '/history']:
            self.assertEqual(self.client.get(f'/campaigns/{campaign["id"]}{suffix}', headers=self.headers()).status_code, 404)
        profile = self.client.get('/me', headers=self.headers()).json()
        self.assertEqual([item['id'] for item in profile['campaigns']], [other['id']])
        self.assertNotIn(campaign['id'], json.dumps(self.client.get('/review-queue', headers=self.headers(self.reviewer)).json()))
        with self.app.state.database.connect() as connection:
            stored = connection.execute('SELECT * FROM campaigns WHERE id=?', (campaign['id'],)).fetchone()
            self.assertEqual(stored['data_json'], '{}')
            self.assertEqual(stored['feedback'], '')
            self.assertEqual(stored['status'], 'Deleted Draft')
            self.assertEqual(stored['client_draft_id'], 'disposable-qa-local')
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM campaign_events WHERE campaign_id=?', (campaign['id'],)).fetchone()[0], 0)
        from main import create_app
        from fastapi.testclient import TestClient
        with TestClient(create_app(self.path, seed=False)) as restarted:
            self.assertEqual(restarted.get(f'/campaigns/{campaign["id"]}', headers=self.headers()).status_code, 404)
            duplicate = restarted.post('/campaigns', json={'clientDraftId': 'disposable-qa-local'}, headers=self.headers())
            self.assertEqual(duplicate.status_code, 409, duplicate.text)
        self.assertEqual(self.client.put(f'/campaigns/{campaign["id"]}', json={'title': 'Late save'}, headers=self.headers()).status_code, 404)
        self.assertEqual(self.client.post(f'/campaigns/{campaign["id"]}/submit', json={'rulesAccepted': True}, headers=self.headers()).status_code, 404)

    def test_submitted_and_requested_corrections_cannot_be_deleted(self):
        campaign = self.create()
        self.client.post(f'/campaigns/{campaign["id"]}/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.assertEqual(self.delete(campaign['id']).status_code, 409)
        self.client.post(f'/campaigns/{campaign["id"]}/review', json={'decision': 'changes', 'feedback': 'Clarify the message.'}, headers=self.headers(self.reviewer))
        self.assertEqual(self.delete(campaign['id']).status_code, 409)

    def test_published_private_draft_revision_and_payments_are_preserved(self):
        campaign = self.publish()
        self.assertEqual(self.contribute(campaign['id']).status_code, 200)
        revised = self.client.post(f'/campaigns/{campaign["id"]}/revision', headers=self.headers()).json()
        self.assertEqual(revised['status'], 'Draft')
        self.assertTrue(revised['revisionPending'])
        self.assertEqual(self.delete(campaign['id']).status_code, 409)
        public = self.client.get(f'/campaigns/{campaign["id"]}')
        self.assertEqual(public.status_code, 200)
        self.assertEqual(public.json()['raised'], 10)
        self.assertEqual(len(self.client.get('/me', headers=self.headers()).json()['payments']), 1)

    def test_deletion_keeps_shared_uploads_and_unrelated_drafts(self):
        image = io.BytesIO()
        Image.new('RGB', (12, 12), 'teal').save(image, 'PNG')
        uploaded = self.client.post('/uploads', files={'file': ('disposable.png', image.getvalue(), 'image/png')},
                                    data={'purpose': 'cover'}, headers=self.headers())
        self.assertEqual(uploaded.status_code, 201, uploaded.text)
        media_path = '/media/' + uploaded.json()['url'].rsplit('/', 1)[-1]
        first = self.create(coverImage=media_path)
        second = self.create(coverImage=media_path)
        with self.app.state.database.connect() as connection:
            before_assets = list(connection.execute('SELECT * FROM assets'))
            self.assertEqual(len(before_assets), 1)
        self.assertEqual(self.delete(first['id']).status_code, 200)
        remaining = self.client.get(f'/campaigns/{second["id"]}', headers=self.headers()).json()
        self.assertTrue(remaining['coverImage'].endswith(media_path))
        self.assertEqual(self.client.get(media_path, headers=self.headers()).status_code, 200)
        with self.app.state.database.connect() as connection:
            self.assertEqual(list(connection.execute('SELECT * FROM assets')), before_assets)

    def locked_race(self, first, second):
        original = self.app.state.database.transaction
        entered, release = threading.Event(), threading.Event()
        first_lock = [True]

        @contextmanager
        def hold_first_writer():
            with original() as connection:
                if first_lock[0]:
                    first_lock[0] = False
                    entered.set()
                    if not release.wait(10):
                        raise RuntimeError('QA writer release timed out.')
                yield connection

        with patch.object(self.app.state.database, 'transaction', hold_first_writer):
            with ThreadPoolExecutor(max_workers=2) as pool:
                a = pool.submit(first)
                self.assertTrue(entered.wait(10))
                b = pool.submit(second)
                release.set()
                return a.result(15), b.result(15)

    def test_submission_holding_write_lock_wins_and_delete_rejects(self):
        campaign = self.create()
        submit, deletion = self.locked_race(
            lambda: self.client.post(f'/campaigns/{campaign["id"]}/submit', json={'rulesAccepted': True}, headers=self.headers()),
            lambda: self.delete(campaign['id']))
        self.assertEqual((submit.status_code, deletion.status_code), (200, 409))
        self.assertEqual(self.client.get(f'/campaigns/{campaign["id"]}', headers=self.headers()).json()['status'], 'Submitted for Review')

    def test_deletion_holding_write_lock_wins_and_submission_cannot_recreate(self):
        campaign = self.create()
        deletion, submit = self.locked_race(lambda: self.delete(campaign['id']),
            lambda: self.client.post(f'/campaigns/{campaign["id"]}/submit', json={'rulesAccepted': True}, headers=self.headers()))
        self.assertEqual((deletion.status_code, submit.status_code), (200, 404))

    def test_delete_wins_over_late_put_and_idempotent_post(self):
        for operation in ['put', 'post']:
            with self.subTest(operation=operation):
                local_id = f'disposable-race-{operation}'
                campaign = self.create(clientDraftId=local_id)
                def late_save():
                    return self.client.put(f'/campaigns/{campaign["id"]}', json={'title': 'Late autosave'}, headers=self.headers()) if operation == 'put' else self.client.post('/campaigns', json={'clientDraftId': local_id}, headers=self.headers())
                deletion, save = self.locked_race(lambda: self.delete(campaign['id']), late_save)
                self.assertEqual(deletion.status_code, 200)
                self.assertEqual(save.status_code, 404 if operation == 'put' else 409)

    def test_postgres_mutation_uses_existing_transaction_advisory_lock(self):
        # Driver-free SQL/transaction contract proof; this does not claim a
        # live PostgreSQL run or access the configured Neon project.
        database = object.__new__(Database)
        database.url = 'fixture-only'
        connection = MagicMock()
        database.connect = MagicMock(return_value=connection)
        with database.transaction() as current:
            self.assertIs(current, connection)
            connection.execute.assert_called_once_with('SELECT pg_advisory_xact_lock(?)', (WRITE_LOCK,))
        connection.commit.assert_called_once()
        connection.close.assert_called_once()


if __name__ == '__main__':
    unittest.main(verbosity=2)
