"""Cloud-boundary HTTP regressions using isolated SQLite, not provider claims."""
from contextlib import contextmanager
import io
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image

from db import ROOT
from main import create_app
from media_storage import LocalMediaStorage, MediaStorageError
from test_deployment import cloud_environment
import test_api


class CloudBoundaryTests(unittest.TestCase):
    # Reuse real fixture/workflow helpers without duplicating the existing suite.
    setUp = test_api.ApiTests.setUp
    tearDown = test_api.ApiTests.tearDown
    register = test_api.ApiTests.register
    headers = test_api.ApiTests.headers
    create = test_api.ApiTests.create
    publish = test_api.ApiTests.publish
    transition = test_api.ApiTests.transition

    def upload(self):
        output = io.BytesIO()
        Image.new('RGB', (50, 40), 'teal').save(output, 'PNG')
        result = self.client.post('/uploads', files={'file': ('fictional.png', output.getvalue(), 'image/png')},
                                  data={'purpose': 'cover'}, headers=self.headers())
        self.assertEqual(result.status_code, 201, result.text)
        return result.json()

    def test_unpublished_image_requires_owner_or_reviewer(self):
        asset = self.upload()
        for account, expected in ((None, 404), (self.creator, 200), (self.reviewer, 200), (self.other, 404)):
            response = self.client.get(asset['url'], headers=self.headers(account) if account else {})
            self.assertEqual(response.status_code, expected)
            self.assertEqual(response.headers['cache-control'], 'private, no-store')
            self.assertIn('Authorization', response.headers['vary'])
            if expected == 200:
                self.assertEqual(response.headers['cache-control'], 'private, no-store')
                self.assertIn('Authorization', response.headers['vary'])
        self.assertEqual(self.client.get(asset['url'], headers={'Authorization': 'Bearer invalid'}).status_code, 401)

    def test_only_owner_can_attach_an_uploaded_image(self):
        asset = self.upload()
        result = self.client.post('/campaigns', json={'coverImage': asset['url']}, headers=self.headers(self.other))
        self.assertEqual(result.status_code, 403)
        own = self.create(coverImage=asset['url'])
        self.assertTrue(own['coverImage'].endswith('/media/' + asset['id'] + '.jpg'))
        missing = self.client.post('/campaigns', json={'coverImage': '/media/img_' + '0' * 24 + '.jpg'}, headers=self.headers())
        self.assertEqual(missing.status_code, 422)

    def test_public_media_follows_only_the_approved_snapshot(self):
        original = self.upload()
        campaign = self.publish(coverImage=original['url'], adImages=[original['url']])
        self.assertEqual(self.client.get(original['url']).status_code, 200)
        replacement = self.upload()
        saved = self.client.put('/campaigns/' + campaign['id'],
                               json={'coverImage': replacement['url'], 'adImages': [replacement['url']]},
                               headers=self.headers())
        self.assertEqual(saved.status_code, 200, saved.text)
        self.assertEqual(self.client.get(original['url']).status_code, 200)
        self.assertEqual(self.client.get(replacement['url']).status_code, 404)
        submitted = self.client.post('/campaigns/' + campaign['id'] + '/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.assertEqual(submitted.status_code, 200, submitted.text)
        self.assertEqual(self.client.get(replacement['url']).status_code, 404)
        approved = self.client.post('/campaigns/' + campaign['id'] + '/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(approved.status_code, 200, approved.text)
        self.assertEqual(self.client.get(replacement['url']).status_code, 200)
        self.assertEqual(self.client.get(original['url']).status_code, 404)

    def test_upload_failure_leaves_no_asset_metadata(self):
        with self.app.state.database.connect() as connection:
            count = connection.execute('SELECT COUNT(*) FROM assets').fetchone()[0]
        output = io.BytesIO()
        Image.new('RGB', (20, 20)).save(output, 'PNG')
        with patch.object(self.app.state.media_storage, 'save', side_effect=MediaStorageError('provider private detail')):
            response = self.client.post('/uploads', files={'file': ('a.png', output.getvalue(), 'image/png')}, headers=self.headers())
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('provider private detail', response.text)
        with self.app.state.database.connect() as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM assets').fetchone()[0], count)

    def test_database_failure_compensates_only_new_upload(self):
        existing = self.upload()
        output = io.BytesIO()
        Image.new('RGB', (20, 20)).save(output, 'PNG')
        store = self.app.state.media_storage
        prior_files = set(store.directory.iterdir())
        with patch.object(self.app.state.database, 'transaction', side_effect=RuntimeError('fictional DB failure')):
            with self.assertRaises(RuntimeError):
                self.client.post('/uploads', files={'file': ('a.png', output.getvalue(), 'image/png')}, headers=self.headers())
        self.assertEqual(set(store.directory.iterdir()), prior_files)
        self.assertEqual(self.client.get(existing['url'], headers=self.headers()).status_code, 200)

    def test_storage_read_failure_is_safe_and_retryable(self):
        asset = self.upload()
        with patch.object(self.app.state.media_storage, 'read', side_effect=MediaStorageError('secret provider response')):
            result = self.client.get(asset['url'], headers=self.headers())
        self.assertEqual(result.status_code, 503)
        self.assertEqual(result.headers['cache-control'], 'private, no-store')
        self.assertNotIn('secret provider response', result.text)


class CloudHttpConfigurationTests(unittest.TestCase):
    @contextmanager
    def cloud_client(self):
        directory = ROOT / 'data/tests'
        directory.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=directory) as folder, patch.dict(os.environ, cloud_environment()), \
                patch('main.create_media_storage', side_effect=lambda path: LocalMediaStorage(path)):
            app = create_app(Path(folder) / 'cloud-boundary.db', seed=False)
            with TestClient(app, base_url='https://campaign-qa.onrender.com') as client:
                yield app, client

    def test_private_docs_trusted_host_and_database_readiness(self):
        with self.cloud_client() as (app, client):
            self.assertEqual(client.get('/health').status_code, 200)
            for path in ('/docs', '/redoc', '/openapi.json'):
                self.assertEqual(client.get(path).status_code, 404)
            self.assertEqual(client.get('/health', headers={'Host': 'untrusted.example.test'}).status_code, 400)
            with patch.object(app.state.database, 'connect', side_effect=RuntimeError('private database password')):
                unavailable = client.get('/health')
            self.assertEqual(unavailable.status_code, 503)
            self.assertNotIn('private database password', unavailable.text)

    def test_origin_and_empty_cors_do_not_reflect_request_values(self):
        with self.cloud_client() as (_, client):
            result = client.options('/config', headers={'Origin': 'https://untrusted.example.test',
                                                        'Access-Control-Request-Method': 'GET'})
            self.assertNotIn('access-control-allow-origin', result.headers)
            response = client.get('/config', headers={'X-Forwarded-Host': 'untrusted.example.test'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers['cache-control'], 'no-store')

    def test_cloud_database_errors_do_not_escape_into_http_or_server_tracebacks(self):
        with self.cloud_client() as (app, client):
            with patch.object(app.state.database, 'transaction', side_effect=RuntimeError('postgresql://secret:private@host/db')):
                with self.assertLogs('campaign', level='WARNING') as captured:
                    result = client.get('/campaigns')
            self.assertEqual(result.status_code, 500)
            self.assertIn('no-store', result.headers['cache-control'])
            self.assertNotIn('postgresql:', result.text)
            self.assertNotIn('postgresql:', '\n'.join(captured.output))
            self.assertNotIn('private@', '\n'.join(captured.output))


if __name__ == '__main__':
    unittest.main()
