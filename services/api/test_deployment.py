"""Configuration safety tests; never connect to a provider."""
import unittest
import os
import runpy
import traceback
from pathlib import Path
from unittest.mock import patch

from deployment import Deployment, public_https_url


def cloud_environment():
    return {
        'CAMPAIGN_ENV': 'cloud', 'CAMPAIGN_PUBLIC_BASE_URL': 'https://campaign-qa.onrender.com',
        'CAMPAIGN_DATABASE_URL': 'postgresql://fictional:only-a-test@db.neon.tech/campaign?sslmode=require',
        'CAMPAIGN_RECEIPT_SECRET': 'fictional-configuration-test-secret-32-characters',
        'CAMPAIGN_REVIEWER_EMAIL': 'reviewer@example.test',
        'CAMPAIGN_REVIEWER_PASSWORD': 'fictional-test-only-password',
        'CAMPAIGN_MEDIA_STORAGE': 'cloudinary', 'CLOUDINARY_CLOUD_NAME': 'fictional-test-cloud',
        'CLOUDINARY_API_KEY': 'fictional-test-key', 'CLOUDINARY_API_SECRET': 'fictional-test-secret',
    }


class DeploymentTests(unittest.TestCase):
    def test_cloud_startup_suppresses_driver_secret_context(self):
        import asgi
        with patch.dict(os.environ, {'CAMPAIGN_ENV': 'cloud'}), \
                patch('main.create_app', side_effect=RuntimeError('postgresql://private:secret@host/db')):
            try:
                asgi.create_app()
                self.fail('Cloud startup must fail closed.')
            except RuntimeError as error:
                rendered = ''.join(traceback.format_exception(error))
                self.assertIn('Cloud API initialization failed', rendered)
                self.assertNotIn('postgresql:', rendered)
                self.assertNotIn('private:secret', rendered)

    def test_port_binding_and_private_access_log_defaults(self):
        with patch.dict(os.environ, {'CAMPAIGN_ENV': 'cloud', 'PORT': '10000', 'CAMPAIGN_PORT': '8787'}, clear=True), \
                patch('uvicorn.run') as run:
            runpy.run_path(str(Path(__file__).with_name('run.py')), run_name='__main__')
        self.assertEqual(run.call_args.args, ('asgi:create_app',))
        self.assertEqual(run.call_args.kwargs['port'], 10000)
        self.assertEqual(run.call_args.kwargs['host'], '0.0.0.0')
        self.assertTrue(run.call_args.kwargs['factory'])
        self.assertFalse(run.call_args.kwargs['access_log'])
        self.assertEqual(run.call_args.kwargs['forwarded_allow_ips'], '127.0.0.1')

    def test_local_port_configuration_is_not_overridden_by_unrelated_port(self):
        with patch.dict(os.environ, {'PORT': '10000', 'CAMPAIGN_PORT': '8787'}, clear=True), \
                patch('uvicorn.run') as run:
            runpy.run_path(str(Path(__file__).with_name('run.py')), run_name='__main__')
        self.assertEqual(run.call_args.kwargs['port'], 8787)

    def test_local_defaults_do_not_require_cloud_credentials(self):
        config = Deployment.read({})
        self.assertFalse(config.cloud)
        self.assertIn('http://localhost:8081', config.cors_origins)

    def test_cloud_requires_persistent_services_and_stable_secret(self):
        env = cloud_environment()
        config = Deployment.read(env)
        self.assertTrue(config.cloud)
        self.assertEqual(config.allowed_hosts, ('campaign-qa.onrender.com',))
        self.assertEqual(config.cors_origins, ())
        for key in ('CAMPAIGN_DATABASE_URL', 'CAMPAIGN_RECEIPT_SECRET', 'CAMPAIGN_REVIEWER_EMAIL',
                    'CAMPAIGN_REVIEWER_PASSWORD', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY',
                    'CLOUDINARY_API_SECRET', 'CAMPAIGN_MEDIA_STORAGE'):
            with self.subTest(key=key), self.assertRaises(ValueError):
                Deployment.read({k: v for k, v in env.items() if k != key})

    def test_tls_and_secret_strength_fail_closed(self):
        for change in ({'CAMPAIGN_DATABASE_URL': 'sqlite:///data.db'},
                       {'CAMPAIGN_DATABASE_URL': 'postgresql://user:pass@db.neon.tech/campaign'},
                       {'CAMPAIGN_RECEIPT_SECRET': 'short'}, {'CAMPAIGN_REVIEWER_PASSWORD': 'short'},
                       {'CAMPAIGN_CORS_ORIGINS': '*'}, {'CAMPAIGN_ENV': 'production-typo'}):
            with self.subTest(change=next(iter(change))), self.assertRaises(ValueError):
                Deployment.read({**cloud_environment(), **change})

    def test_render_injected_origin_is_supported_without_host_reflection(self):
        env = cloud_environment()
        env['RENDER_EXTERNAL_URL'] = env.pop('CAMPAIGN_PUBLIC_BASE_URL')
        self.assertEqual(Deployment.read(env).public_url, 'https://campaign-qa.onrender.com')

    def test_reject_nonpublic_or_ambiguous_origins(self):
        for url in ('http://campaign-qa.onrender.com', 'https://localhost', 'https://127.0.0.1',
                    'https://[::1]', 'https://campaign.local', 'https://campaign.invalid',
                    'https://campaign.example', 'https://user:secret@campaign-qa.onrender.com',
                    'https://campaign-qa.onrender.com/api', 'https://campaign-qa.onrender.com?key=secret',
                    'https://campaign-qa.onrender.com/#fragment', 'https://campaign-qa.onrender.com:8443',
                    'https://campaign-qa.onrender.com:invalid'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                public_https_url(url)


if __name__ == '__main__':
    unittest.main()
