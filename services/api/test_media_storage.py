"""Isolated local storage and mocked Cloudinary protocol/failure checks."""
import hashlib
import io
from pathlib import Path
import tempfile
import unittest
from urllib.parse import parse_qs

import httpx
from PIL import Image

from media_storage import (CloudinaryMediaStorage, LocalMediaStorage,
                           MAX_STORED_IMAGE_BYTES, MediaNotFound,
                           MediaStorageError, StorageRecord, create_media_storage)


ROOT = Path(__file__).resolve().parent
FILENAME = 'img_' + 'a' * 24 + '.jpg'
PUBLIC_ID = 'campaign/' + FILENAME[:-4]
SECRET = 'test-only-cloudinary-secret'
VERSION = '1700000000'


def jpeg():
    output = io.BytesIO()
    Image.new('RGB', (32, 24), 'teal').save(output, 'JPEG')
    return output.getvalue()


def signed_upload_result(**changes):
    signature = hashlib.sha1(f'public_id={PUBLIC_ID}&version={VERSION}{SECRET}'.encode()).hexdigest()
    return {'public_id': PUBLIC_ID, 'version': int(VERSION), 'type': 'authenticated',
            'resource_type': 'image', 'format': 'jpg', 'signature': signature, **changes}


class MediaStorageTests(unittest.TestCase):
    def setUp(self):
        folder = ROOT / 'data' / 'tests'
        folder.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=folder)
        self.directory = Path(self.temp.name) / 'uploads'
        self.data = jpeg()

    def tearDown(self):
        self.temp.cleanup()

    def cloud(self, handler):
        return CloudinaryMediaStorage('test-cloud', '123456', SECRET,
                                      transport=httpx.MockTransport(handler),
                                      clock=lambda: 1700000000)

    def test_local_restart_legacy_read_and_no_overwrite(self):
        storage = LocalMediaStorage(self.directory)
        record = storage.save(FILENAME, self.data)
        self.assertEqual(record, StorageRecord('local'))
        restarted = LocalMediaStorage(self.directory)
        self.assertEqual(restarted.read(FILENAME), self.data)
        with self.assertRaises(MediaStorageError):
            restarted.save(FILENAME, jpeg())
        self.assertEqual(restarted.read(FILENAME), self.data)
        restarted.delete(FILENAME, record)
        restarted.delete(FILENAME, record)
        with self.assertRaises(MediaNotFound):
            restarted.read(FILENAME)

    def test_local_rejects_traversal_and_wrong_provider(self):
        storage = LocalMediaStorage(self.directory)
        for filename in ['../private.jpg', '/outside.jpg', FILENAME + '?token=secret', 'avatar_aaaa.jpg']:
            with self.subTest(filename=filename), self.assertRaises(MediaStorageError):
                storage.save(filename, self.data)
        with self.assertRaises(ValueError):
            LocalMediaStorage(ROOT.parent)
        with self.assertRaises(MediaStorageError):
            storage.read(FILENAME, StorageRecord('cloudinary', PUBLIC_ID, VERSION))

    def test_upload_signed_authenticated_wire_format_and_verified_response(self):
        def handler(request):
            self.assertEqual(str(request.url), 'https://api.cloudinary.com/v1_1/test-cloud/image/upload')
            self.assertEqual(request.method, 'POST')
            body = request.read()
            for value in [b'name="type"\r\n\r\nauthenticated', b'name="overwrite"\r\n\r\nfalse',
                          b'name="unique_filename"\r\n\r\nfalse', PUBLIC_ID.encode(), self.data]:
                self.assertIn(value, body)
            expected = hashlib.sha1(('overwrite=false&public_id=' + PUBLIC_ID +
                                     '&timestamp=1700000000&type=authenticated&unique_filename=false' + SECRET).encode()).hexdigest()
            self.assertIn(expected.encode(), body)
            self.assertNotIn(SECRET.encode(), body)
            self.assertNotIn(SECRET, str(request.url))
            self.assertEqual(request.extensions['timeout']['connect'], 5)
            self.assertEqual(request.extensions['timeout']['read'], 20)
            return httpx.Response(200, json=signed_upload_result())
        self.assertEqual(self.cloud(handler).save(FILENAME, self.data), StorageRecord('cloudinary', PUBLIC_ID, VERSION))

    def test_upload_fails_closed_for_public_wrong_or_unsigned_result(self):
        cases = [{'type': 'upload'}, {'public_id': 'another-user/image'}, {'signature': 'invalid'},
                 {'version': 'bad'}, {'resource_type': 'raw'}, {'format': 'png'}]
        for changes in cases:
            with self.subTest(changes=changes), self.assertRaises(MediaStorageError):
                self.cloud(lambda request: httpx.Response(200, json=signed_upload_result(**changes))).save(FILENAME, self.data)

    def test_provider_errors_timeouts_redirects_do_not_leak_or_retry(self):
        for status in [302, 400, 401, 403, 420, 429, 500]:
            calls = []
            def handler(request):
                calls.append(request)
                return httpx.Response(status, text=SECRET + ': raw provider details', headers={'location': 'https://other.example'})
            with self.subTest(status=status), self.assertRaises(MediaStorageError) as caught:
                self.cloud(handler).save(FILENAME, self.data)
            self.assertNotIn(SECRET, str(caught.exception))
            self.assertNotIn('provider details', str(caught.exception))
            self.assertEqual(len(calls), 1)
        def timeout(request):
            raise httpx.ReadTimeout(SECRET + str(request.url))
        with self.assertRaises(MediaStorageError) as caught:
            self.cloud(timeout).save(FILENAME, self.data)
        self.assertNotIn(SECRET, str(caught.exception))
        self.assertTrue(caught.exception.__suppress_context__)

    def test_provider_json_is_bounded_and_must_be_an_object(self):
        for body in [b'not json', b'[]', b'"' + b'a' * (64 * 1024) + b'"']:
            with self.subTest(size=len(body)), self.assertRaises(MediaStorageError):
                self.cloud(lambda request: httpx.Response(200, content=body)).save(FILENAME, self.data)

    def test_read_uses_server_only_expiring_authenticated_download(self):
        def handler(request):
            self.assertEqual(request.url.path, '/v1_1/test-cloud/image/download')
            parameters = dict(request.url.params)
            self.assertEqual(parameters['type'], 'authenticated')
            self.assertEqual(parameters['expires_at'], '1700000060')
            self.assertEqual(parameters['public_id'], PUBLIC_ID)
            self.assertEqual(parameters['format'], 'jpg')
            expected = hashlib.sha1(('expires_at=1700000060&format=jpg&public_id=' + PUBLIC_ID +
                                     '&timestamp=1700000000&type=authenticated' + SECRET).encode()).hexdigest()
            self.assertEqual(parameters['signature'], expected)
            self.assertNotIn(SECRET, str(request.url))
            return httpx.Response(200, content=self.data, headers={'content-type': 'image/jpeg; charset=binary'})
        self.assertEqual(self.cloud(handler).read(FILENAME, StorageRecord('cloudinary', PUBLIC_ID, VERSION)), self.data)

    def test_read_requires_matching_saved_mapping_before_network(self):
        def handler(request):
            self.fail('An invalid storage mapping must not issue a network request.')
        for record in [None, StorageRecord('local'), StorageRecord('cloudinary', 'other/image', VERSION),
                       StorageRecord('cloudinary', PUBLIC_ID, 'invalid')]:
            with self.subTest(record=record), self.assertRaises(MediaStorageError):
                self.cloud(handler).read(FILENAME, record)

    def test_read_rejects_missing_non_image_and_oversized_response(self):
        record = StorageRecord('cloudinary', PUBLIC_ID, VERSION)
        with self.assertRaises(MediaNotFound):
            self.cloud(lambda request: httpx.Response(404)).read(FILENAME, record)
        for content, mime in [(b'<html>private provider error</html>', 'text/html'),
                              (b'invalid', 'image/jpeg'),
                              (b'\xff\xd8\xff' + b'a' * MAX_STORED_IMAGE_BYTES, 'image/jpeg')]:
            with self.subTest(mime=mime, size=len(content)), self.assertRaises(MediaStorageError):
                self.cloud(lambda request: httpx.Response(200, content=content, headers={'content-type': mime})).read(FILENAME, record)

    def test_destroy_only_expected_authenticated_object_and_idempotent(self):
        for outcome in ['ok', 'not found']:
            def handler(request):
                self.assertEqual(request.url.path, '/v1_1/test-cloud/image/destroy')
                parameters = {key: values[0] for key, values in parse_qs(request.read().decode()).items()}
                self.assertEqual(parameters['public_id'], PUBLIC_ID)
                self.assertEqual(parameters['type'], 'authenticated')
                self.assertEqual(parameters['invalidate'], 'true')
                expected = hashlib.sha1(('invalidate=true&public_id=' + PUBLIC_ID +
                                         '&timestamp=1700000000&type=authenticated' + SECRET).encode()).hexdigest()
                self.assertEqual(parameters['signature'], expected)
                return httpx.Response(200, json={'result': outcome})
            self.cloud(handler).delete(FILENAME, StorageRecord('cloudinary', PUBLIC_ID, VERSION))
        with self.assertRaises(MediaStorageError):
            self.cloud(lambda request: httpx.Response(200, json={'result': 'failed', 'error': SECRET})).delete(FILENAME, StorageRecord('cloudinary', PUBLIC_ID, VERSION))

    def test_factory_and_normalized_upload_bounds(self):
        self.assertIsInstance(create_media_storage(self.directory, environment={}), LocalMediaStorage)
        with self.assertRaises(ValueError):
            create_media_storage(self.directory, environment={'CAMPAIGN_MEDIA_STORAGE': 'cloudinary'})
        with self.assertRaises(ValueError):
            create_media_storage(self.directory, environment={'CAMPAIGN_MEDIA_STORAGE': 'unknown'})
        def handler(request):
            self.fail('Invalid normalized input must not reach the provider.')
        for data in [b'not jpeg', b'\xff\xd8\xff' + b'a' * MAX_STORED_IMAGE_BYTES]:
            with self.assertRaises(MediaStorageError):
                self.cloud(handler).save(FILENAME, data)


if __name__ == '__main__':
    unittest.main()
