"""Fail-closed cloud configuration; local development retains its own defaults."""
from __future__ import annotations

from dataclasses import dataclass
import ipaddress
import os
import re
from typing import Mapping
from urllib.parse import parse_qs, urlsplit


def public_https_url(value: str) -> str:
    try:
        url = urlsplit(value.strip())
        host = (url.hostname or '').lower()
        port = url.port
    except ValueError:
        raise ValueError('A public HTTPS origin is required.') from None
    if (url.scheme != 'https' or not host or url.username or url.password or
            url.query or url.fragment or url.path not in {'', '/'} or port not in {None, 443} or
            not re.fullmatch(r'(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}', host) or
            host.rsplit('.', 1)[-1] in {'localhost', 'local', 'internal', 'test', 'invalid', 'example'}):
        raise ValueError('A public HTTPS origin without credentials, paths or custom ports is required.')
    try:
        ipaddress.ip_address(host)
    except ValueError:
        return f'https://{host}'
    raise ValueError('Use a public HTTPS hostname, not an IP address.')


@dataclass(frozen=True)
class Deployment:
    cloud: bool = False
    public_url: str = ''
    allowed_hosts: tuple[str, ...] = ()
    cors_origins: tuple[str, ...] = ()

    @classmethod
    def read(cls, environment: Mapping[str, str] | None = None) -> 'Deployment':
        env = os.environ if environment is None else environment
        mode = env.get('CAMPAIGN_ENV', 'local')
        if mode not in {'local', 'cloud'}:
            raise ValueError('CAMPAIGN_ENV must be local or cloud.')
        if mode == 'local':
            origins = env.get('CAMPAIGN_CORS_ORIGINS',
                              'http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006')
            return cls(cors_origins=tuple(item.strip() for item in origins.split(',') if item.strip()))
        public_url = public_https_url(env.get('CAMPAIGN_PUBLIC_BASE_URL') or env.get('RENDER_EXTERNAL_URL', ''))
        database_url = urlsplit(env.get('CAMPAIGN_DATABASE_URL', ''))
        if (database_url.scheme not in {'postgres', 'postgresql'} or not database_url.hostname or
                not database_url.username or not database_url.password or not database_url.path.strip('/') or
                parse_qs(database_url.query).get('sslmode', [''])[0] not in {'require', 'verify-ca', 'verify-full'}):
            raise ValueError('Cloud mode requires PostgreSQL credentials and an explicit TLS sslmode.')
        required = ('CAMPAIGN_RECEIPT_SECRET', 'CAMPAIGN_REVIEWER_EMAIL', 'CAMPAIGN_REVIEWER_PASSWORD',
                    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET')
        missing = [key for key in required if not env.get(key, '').strip()]
        if missing:
            raise ValueError('Missing cloud configuration: ' + ', '.join(missing))
        if len(env['CAMPAIGN_RECEIPT_SECRET']) < 32:
            raise ValueError('CAMPAIGN_RECEIPT_SECRET must contain at least 32 characters.')
        if len(env['CAMPAIGN_REVIEWER_PASSWORD']) < 12:
            raise ValueError('CAMPAIGN_REVIEWER_PASSWORD must contain at least 12 characters.')
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', env['CAMPAIGN_REVIEWER_EMAIL']):
            raise ValueError('CAMPAIGN_REVIEWER_EMAIL must be a valid address.')
        if env.get('CAMPAIGN_MEDIA_STORAGE') != 'cloudinary':
            raise ValueError('Cloud mode requires persistent authenticated Cloudinary media storage.')
        origins = tuple(public_https_url(item) for item in env.get('CAMPAIGN_CORS_ORIGINS', '').split(',') if item.strip())
        # The public origin is authoritative; never trust an arbitrary forwarded
        # Host when generating private/public campaign image references.
        return cls(True, public_url, (urlsplit(public_url).hostname,), origins)
