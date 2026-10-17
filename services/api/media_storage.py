"""Private, server-only campaign image storage behind the existing /media route.

This module never decides whether an image is public. The API must authorize a
read before calling ``read``. Cloudinary objects always use ``authenticated``
delivery, including images that the API later makes publicly readable.
"""
from __future__ import annotations

from dataclasses import dataclass
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import time
from typing import Mapping

import httpx


MAX_STORED_IMAGE_BYTES = 10_000_000  # Cloudinary Free's image-file ceiling.
_FILENAME = re.compile(r'img_[a-f0-9]{24}\.jpg')
_CLOUD_NAME = re.compile(r'[a-zA-Z0-9_-]{1,100}')
_PUBLIC_ID = re.compile(r'campaign/img_[a-f0-9]{24}')


class MediaStorageError(Exception):
    """Safe operational failure: contains no provider response or credentials."""


class MediaNotFound(MediaStorageError):
    pass


@dataclass(frozen=True)
class StorageRecord:
    provider: str
    public_id: str | None = None
    version: str | None = None


def _filename(filename: str) -> str:
    if not isinstance(filename, str) or not _FILENAME.fullmatch(filename):
        raise MediaStorageError('Invalid campaign image reference.')
    return filename


def _image(data: bytes) -> None:
    # The route performs full Pillow validation and normalization first. These
    # additional bounds prevent accidentally sending arbitrary/oversized bytes.
    if not isinstance(data, bytes) or not data.startswith(b'\xff\xd8\xff') or not 0 < len(data) <= MAX_STORED_IMAGE_BYTES:
        raise MediaStorageError('Invalid normalized campaign image.')


def _signature(parameters: Mapping[str, str], secret: str) -> str:
    # Cloudinary's documented Upload API authentication protocol uses SHA-1 of
    # alphabetically sorted parameters followed by the server-side API secret.
    message = '&'.join(f'{key}={parameters[key]}' for key in sorted(parameters))
    return hashlib.sha1((message + secret).encode('utf-8')).hexdigest()


class LocalMediaStorage:
    provider = 'local'

    def __init__(self, directory: Path, *, allowed_root: Path | None = None):
        service_root = (allowed_root or Path(__file__).resolve().parent).resolve()
        self.directory = Path(directory).resolve()
        if not self.directory.is_relative_to(service_root):
            raise ValueError('Local campaign storage must remain within services/api.')
        self.directory.mkdir(parents=True, exist_ok=True)

    def _path(self, filename: str) -> Path:
        result = (self.directory / _filename(filename)).resolve()
        if not result.is_relative_to(self.directory):
            raise MediaStorageError('Invalid campaign image reference.')
        return result

    def save(self, filename: str, data: bytes) -> StorageRecord:
        _image(data)
        try:
            # Random asset names must never overwrite another asset.
            with self._path(filename).open('xb') as handle:
                handle.write(data)
        except OSError:
            raise MediaStorageError('The campaign image could not be stored. Retry the upload.') from None
        return StorageRecord('local')

    def read(self, filename: str, record: StorageRecord | None = None) -> bytes:
        if record and record.provider != 'local':
            raise MediaStorageError('Campaign image storage is unavailable.')
        try:
            with self._path(filename).open('rb') as handle:
                data = handle.read(MAX_STORED_IMAGE_BYTES + 1)
        except FileNotFoundError:
            raise MediaNotFound('Campaign image not found.') from None
        except OSError:
            raise MediaStorageError('The campaign image could not be loaded. Retry shortly.') from None
        _image(data)
        return data

    def delete(self, filename: str, record: StorageRecord | None = None) -> None:
        if record and record.provider != 'local':
            raise MediaStorageError('Campaign image storage is unavailable.')
        try:
            self._path(filename).unlink(missing_ok=True)
        except OSError:
            raise MediaStorageError('The incomplete campaign upload could not be removed.') from None


class CloudinaryMediaStorage:
    provider = 'cloudinary'

    def __init__(self, cloud_name: str, api_key: str, api_secret: str, *,
                 transport: httpx.BaseTransport | None = None, clock=time.time):
        if not _CLOUD_NAME.fullmatch(cloud_name or '') or not re.fullmatch(r'[0-9]{1,100}', api_key or '') or not api_secret or len(api_secret) > 512:
            raise ValueError('Configure valid server-only Cloudinary credentials.')
        self._base = f'https://api.cloudinary.com/v1_1/{cloud_name}/image'
        self._api_key = api_key
        self._api_secret = api_secret
        self._transport = transport
        self._clock = clock

    def _client(self):
        # Fixed HTTPS origin, no redirects, environment proxies or implicit
        # retries. A failed upload must be reconciled, never blindly repeated.
        return httpx.Client(timeout=httpx.Timeout(20, connect=5, pool=5),
                            follow_redirects=False, trust_env=False,
                            transport=self._transport)

    def _signed(self, parameters: dict[str, str]) -> dict[str, str]:
        signed = {**parameters, 'timestamp': str(int(self._clock()))}
        return {**signed, 'api_key': self._api_key,
                'signature': _signature(signed, self._api_secret)}

    def _json(self, client, path: str, *, data, files=None):
        with client.stream('POST', self._base + path, data=data, files=files) as response:
            if response.status_code != 200:
                raise MediaStorageError()
            output = bytearray()
            for chunk in response.iter_bytes(16 * 1024):
                output.extend(chunk)
                if len(output) > 64 * 1024:
                    raise MediaStorageError()
            result = json.loads(output)
            if not isinstance(result, dict):
                raise MediaStorageError()
            return result

    def _record(self, filename: str, record: StorageRecord | None) -> StorageRecord:
        expected = 'campaign/' + _filename(filename)[:-4]
        if (not record or record.provider != self.provider or record.public_id != expected
                or not _PUBLIC_ID.fullmatch(record.public_id or '')
                or not re.fullmatch(r'[0-9]{1,20}', record.version or '')):
            raise MediaStorageError('Invalid campaign image storage reference.')
        return record

    def save(self, filename: str, data: bytes) -> StorageRecord:
        _image(data)
        public_id = 'campaign/' + _filename(filename)[:-4]
        parameters = self._signed({'public_id': public_id, 'type': 'authenticated',
                                   'overwrite': 'false', 'unique_filename': 'false'})
        try:
            with self._client() as client:
                result = self._json(client, '/upload', data=parameters,
                                    files={'file': (filename, data, 'image/jpeg')})
                version = str(result.get('version', ''))
                if (result.get('public_id') != public_id or result.get('type') != 'authenticated'
                        or result.get('resource_type') != 'image' or result.get('format') != 'jpg'
                        or not re.fullmatch(r'[0-9]{1,20}', version)):
                    raise MediaStorageError()
                expected = _signature({'public_id': public_id, 'version': version}, self._api_secret)
                actual = result.get('signature', '')
                if not isinstance(actual, str) or not hmac.compare_digest(expected, actual):
                    raise MediaStorageError()
                return StorageRecord(self.provider, public_id, version)
        except (httpx.HTTPError, ValueError, TypeError, AttributeError, MediaStorageError):
            raise MediaStorageError('The campaign image could not be stored. Retry the upload.') from None

    def read(self, filename: str, record: StorageRecord | None = None) -> bytes:
        record = self._record(filename, record)
        parameters = self._signed({'public_id': record.public_id, 'format': 'jpg',
                                   'type': 'authenticated',
                                   'expires_at': str(int(self._clock()) + 60)})
        try:
            with self._client() as client:
                # The short-lived signed API download stays entirely on the
                # server; its URL and signature are never returned to clients.
                with client.stream('GET', self._base + '/download', params=parameters) as response:
                    if response.status_code == 404:
                        raise MediaNotFound('Campaign image not found.')
                    if response.status_code != 200 or response.headers.get('content-type', '').split(';')[0].strip().lower() != 'image/jpeg':
                        raise MediaStorageError()
                    output = bytearray()
                    for chunk in response.iter_bytes(64 * 1024):
                        output.extend(chunk)
                        if len(output) > MAX_STORED_IMAGE_BYTES:
                            raise MediaStorageError()
                    data = bytes(output)
                    _image(data)
                    return data
        except MediaNotFound:
            raise
        except (httpx.HTTPError, ValueError, MediaStorageError):
            raise MediaStorageError('The campaign image could not be loaded. Retry shortly.') from None

    def delete(self, filename: str, record: StorageRecord | None = None) -> None:
        record = self._record(filename, record)
        parameters = self._signed({'public_id': record.public_id, 'type': 'authenticated', 'invalidate': 'true'})
        try:
            with self._client() as client:
                result = self._json(client, '/destroy', data=parameters)
                if result.get('result') not in {'ok', 'not found'}:
                    raise MediaStorageError()
        except (httpx.HTTPError, ValueError, TypeError, AttributeError, MediaStorageError):
            raise MediaStorageError('The incomplete campaign upload could not be removed.') from None


def create_media_storage(directory: Path, *, environment: Mapping[str, str] | None = None,
                         transport: httpx.BaseTransport | None = None):
    config = os.environ if environment is None else environment
    provider = config.get('CAMPAIGN_MEDIA_STORAGE', 'local').strip().lower()
    if provider == 'local':
        return LocalMediaStorage(directory)
    if provider == 'cloudinary':
        return CloudinaryMediaStorage(config.get('CLOUDINARY_CLOUD_NAME', ''),
                                      config.get('CLOUDINARY_API_KEY', ''),
                                      config.get('CLOUDINARY_API_SECRET', ''),
                                      transport=transport)
    raise ValueError('CAMPAIGN_MEDIA_STORAGE must be local or cloudinary.')
