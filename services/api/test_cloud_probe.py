"""Probe integration through isolated real API contracts, never a cloud claim."""
from pathlib import Path
import json
import os
import tempfile
import unittest
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

from cloud_probe import BoundedProbeClient, CloudProbe, PRIVATE_DIRECTORY, REPORT_DIRECTORY, ProbeError
from db import ROOT
from main import create_app


URL = 'https://campaign-probe-qa.onrender.com'
REVIEWER_EMAIL = 'probe-reviewer@example.test'
REVIEWER_PASSWORD = 'fictional-probe-reviewer-password'


class CloudProbeTests(unittest.TestCase):
    def setUp(self):
        database_folder = ROOT / 'data/tests'
        database_folder.mkdir(parents=True, exist_ok=True)
        PRIVATE_DIRECTORY.mkdir(parents=True, exist_ok=True)
        REPORT_DIRECTORY.mkdir(parents=True, exist_ok=True)
        self.database_temp = tempfile.TemporaryDirectory(dir=database_folder)
        self.state_temp = tempfile.TemporaryDirectory(prefix='isolated-test-', dir=PRIVATE_DIRECTORY)
        self.report_temp = tempfile.TemporaryDirectory(prefix='isolated-test-', dir=REPORT_DIRECTORY)
        self.path = Path(self.database_temp.name) / 'probe.db'
        self.state_path = Path(self.state_temp.name) / 'state.json'
        self.report_directory = Path(self.report_temp.name)
        self.env = patch.dict(os.environ, {
            'CAMPAIGN_ENV': 'local', 'CAMPAIGN_DATABASE_URL': '', 'CAMPAIGN_MEDIA_STORAGE': 'local',
            'CAMPAIGN_REVIEWER_EMAIL': REVIEWER_EMAIL, 'CAMPAIGN_REVIEWER_PASSWORD': REVIEWER_PASSWORD})
        self.env.start()
        self.app = create_app(self.path, seed=True)
        self.client = TestClient(self.app, base_url=URL, follow_redirects=False)

    def tearDown(self):
        self.client.close()
        self.env.stop()
        self.database_temp.cleanup()
        self.state_temp.cleanup()
        self.report_temp.cleanup()

    def probe(self, client=None):
        return CloudProbe(client or self.client, URL, state_path=self.state_path,
                          report_directory=self.report_directory)

    def test_full_probe_and_actual_factory_restart_comparison(self):
        created = self.probe().create(reviewer_email=REVIEWER_EMAIL, reviewer_password=REVIEWER_PASSWORD)
        self.assertTrue(all(created['checks'].values()))
        self.assertEqual(created['scope'], 'isolated API contract')
        self.assertEqual(created['reviewWorkflow'], 'verified')
        self.assertFalse(created['providerRestartPerformed'])
        prior = json.loads(self.state_path.read_text())
        self.assertEqual(prior['phase'], 'complete')
        self.assertEqual(prior['payment']['amount'], 1)
        self.assertEqual(prior['payment']['fee'], .05)
        self.assertEqual(prior['payment']['adBudget'], .95)
        # An actual API factory restart reopens only this case's SQLite file.
        # It does not stand in for a cloud provider restart or PostgreSQL test.
        restarted_app = create_app(self.path, seed=True)
        with TestClient(restarted_app, base_url=URL, follow_redirects=False) as restarted:
            verified = self.probe(restarted).verify()
        self.assertTrue(all(verified['checks'].values()))
        self.assertTrue(verified['checks']['originalSessionStillValid'])
        self.assertTrue(verified['checks']['originalReceiptCapabilityStillValid'])
        report = (self.report_directory / 'cloud-probe-verify.json').read_text()
        for private_value in [prior['password'], prior['token'], prior['email'],
                              prior['payment']['receipt']['token'], REVIEWER_PASSWORD, REVIEWER_EMAIL]:
            self.assertNotIn(private_value, report)
        with self.app.state.database.connect() as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM payments WHERE user_id=?', (prior['userId'],)).fetchone()[0], 1)

    def test_without_reviewer_retains_private_submission_and_uses_seed_payment(self):
        result = self.probe().create()
        state = json.loads(self.state_path.read_text())
        self.assertFalse(state['reviewed'])
        self.assertTrue(result['reviewWorkflow'].startswith('blocked:'))
        self.assertNotEqual(state['campaignId'], state['paymentCampaignId'])
        self.assertTrue(all(result['checks'].values()))
        self.assertEqual(self.client.get('/campaigns/' + state['campaignId']).status_code, 404)
        self.assertEqual(self.client.get('/media/' + state['mediaUrl'].split('/')[-1]).status_code, 404)
        self.assertTrue(all(self.probe().verify()['checks'].values()))

    def test_repeated_create_refuses_before_network_and_preserves_state(self):
        self.probe().create()
        saved = self.state_path.read_bytes()
        with patch.object(self.client, 'request', side_effect=AssertionError('must not send')):
            with self.assertRaises(ProbeError):
                self.probe().create()
        self.assertEqual(self.state_path.read_bytes(), saved)

    def test_interruption_records_credentials_before_mutation_without_retry(self):
        real_request = self.client.request
        calls = []
        def lose_response(method, path, **kwargs):
            calls.append((method, path))
            response = real_request(method, path, **kwargs)
            if path == '/auth/register':
                saved = json.loads(self.state_path.read_text())
                self.assertEqual(saved['phase'], 'registration_pending')
                self.assertEqual(saved['password'], kwargs['json']['password'])
                raise TimeoutError('private fake provider failure')
            return response
        with patch.object(self.client, 'request', side_effect=lose_response):
            with self.assertRaises(ProbeError) as caught:
                self.probe().create()
        self.assertNotIn('private fake provider failure', str(caught.exception))
        self.assertEqual(sum(path == '/auth/register' for _, path in calls), 1)
        saved = self.state_path.read_bytes()
        with self.assertRaises(ProbeError):
            self.probe().verify()
        self.assertEqual(saved, self.state_path.read_bytes())

    def test_invalid_host_state_and_external_media_do_not_send_credentials(self):
        with self.assertRaises(ValueError):
            CloudProbe(self.client, 'http://127.0.0.1:8787', state_path=self.state_path)
        probe = self.probe()
        for value in ['https://elsewhere.onrender.com/media/image.jpg', '//elsewhere.onrender.com/media/image.jpg',
                      'https://user:password@campaign-probe-qa.onrender.com/media/image.jpg']:
            with self.subTest(value=value), self.assertRaises(ProbeError):
                probe.relative(value)
        with self.assertRaises(ProbeError):
            CloudProbe(self.client, URL, state_path=ROOT / 'data/unsafe-state.json')

    def test_cli_client_bounds_streamed_responses_without_following_redirects(self):
        calls = []
        def redirect(request):
            calls.append(str(request.url))
            return httpx.Response(302, headers={'location': 'https://elsewhere.onrender.com'})
        with BoundedProbeClient(base_url=URL, transport=httpx.MockTransport(redirect),
                                follow_redirects=False, trust_env=False) as client:
            response = client.get('/health')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(calls, [URL + '/health'])
        with BoundedProbeClient(base_url=URL, transport=httpx.MockTransport(
                lambda request: httpx.Response(200, content=b'x' * 33))) as client:
            client.max_response_bytes = 32
            with self.assertRaises(ProbeError):
                client.get('/health')


if __name__ == '__main__':
    unittest.main(verbosity=2)
