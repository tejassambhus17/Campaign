"""One-time, bounded live check of the Campaign Cloudinary Free environment."""
from __future__ import annotations

import io
import json
from pathlib import Path
import secrets
import sys

import httpx
from PIL import Image

from media_storage import CloudinaryMediaStorage, StorageRecord


ROOT = Path(__file__).resolve().parents[2]
PRIVATE = ROOT / 'services' / 'api' / 'data' / 'cloudinary-runtime.env'
REPORT = ROOT / 'artifacts' / 'cloud-deployment' / 'CLOUDINARY_LIVE.json'


def load_private() -> tuple[str, str, str]:
    if not PRIVATE.is_file() or not PRIVATE.resolve().is_relative_to(ROOT / 'services' / 'api' / 'data'):
        raise RuntimeError('Campaign-local Cloudinary settings are missing or outside the project.')
    values = {}
    for line in PRIVATE.read_text(encoding='utf-8-sig').splitlines():
        if '=' not in line:
            raise RuntimeError('Campaign-local Cloudinary settings are invalid.')
        key, value = line.split('=', 1)
        if key in values:
            raise RuntimeError('Duplicate Campaign-local Cloudinary setting.')
        values[key] = value
    required = {'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'}
    if set(values) != required:
        raise RuntimeError('Campaign-local Cloudinary settings have unexpected keys.')
    return tuple(values[key] for key in ('CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'))


def main() -> int:
    cloud, key, secret = load_private()
    storage = CloudinaryMediaStorage(cloud, key, secret)
    report = {'provider': 'Cloudinary', 'plan': 'unverified', 'usageApi': False,
              'authenticatedUpload': False, 'signedRead': False,
              'unsignedDeliveryDenied': False, 'qaObjectDeleted': False}
    timeout = httpx.Timeout(20, connect=5, pool=5)
    with httpx.Client(timeout=timeout, follow_redirects=False, trust_env=False,
                      auth=(key, secret)) as client:
        response = client.get(f'https://api.cloudinary.com/v1_1/{cloud}/usage')
        if response.status_code != 200 or len(response.content) > 64 * 1024:
            raise RuntimeError('Cloudinary usage check failed; account eligibility remains unverified.')
        usage = response.json()
        if not isinstance(usage, dict):
            raise RuntimeError('Cloudinary usage response was invalid.')
        plan = str(usage.get('plan', '')).strip()
        report['plan'] = plan[:40] if plan else 'unverified'
        report['usageApi'] = True
        if plan.lower() != 'free':
            raise RuntimeError('Cloudinary account plan was not confirmed Free; upload was not attempted.')

    image = io.BytesIO()
    Image.new('RGB', (24, 24), '#34bc91').save(image, 'JPEG')
    data = image.getvalue()
    filename = 'img_' + secrets.token_hex(12) + '.jpg'
    record: StorageRecord | None = None
    try:
        record = storage.save(filename, data)
        report['authenticatedUpload'] = record.provider == 'cloudinary'
        report['signedRead'] = storage.read(filename, record) == data
        unsigned = f'https://res.cloudinary.com/{cloud}/image/authenticated/v{record.version}/{record.public_id}.jpg'
        with httpx.Client(timeout=timeout, follow_redirects=False, trust_env=False) as client:
            response = client.get(unsigned)
            report['unsignedDeliveryDenied'] = response.status_code in {401, 403, 404}
        if not all(report[key] for key in ('authenticatedUpload', 'signedRead', 'unsignedDeliveryDenied')):
            raise RuntimeError('Cloudinary live media checks did not all pass.')
    finally:
        if record:
            storage.delete(filename, record)
            report['qaObjectDeleted'] = True
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (RuntimeError, httpx.HTTPError, ValueError, KeyError, TypeError):
        print('Cloudinary verification did not complete. No credentials were printed. Check the private Campaign settings and report.', file=sys.stderr)
        raise SystemExit(1) from None
