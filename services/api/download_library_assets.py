"""Explicit optional media-cache task. API startup never downloads images.

Only optimize licensed stock downloads; never synthesize people or event evidence.
The versioned media manifest records the exact input URL, bytes and usage limits.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path
import urllib.request

from PIL import Image

ROOT = Path(__file__).resolve().parent
PHOTOS = {
    'bedroom': 'photo-1505693416388-ac5ce068fe85',
    'movement': 'photo-1476480862126-209bfaa8edc8',
    'night-sky': 'photo-1419242902214-272b3f66ee7a',
    'library': 'photo-1507842217343-583bb7270b66',
    'workspace': 'photo-1498050108023-c5249f4df085',
    'data-desk': 'photo-1460925895917-afdab827c52f',
    'repair': 'photo-1581092921461-eab62e97a780',
    'civic': 'photo-1486406146926-c627a92ad1ab',
}
SUBJECTS = {
    'bedroom': 'An unoccupied furnished bedroom with a bed and lamps.',
    'movement': 'Cropped legs and running shoes on outdoor steps; no creator identity implied.',
    'night-sky': 'A star-filled sky above a mountain silhouette; no local visibility forecast implied.',
    'library': 'Rows of books on library shelving; no specific branch or service is claimed.',
    'workspace': 'Laptop and desktop computer on a work desk; screen content is illustrative stock.',
    'data-desk': 'Laptop with charts on its screen; figures are not campaign or current economic data.',
    'repair': 'Hands working on a circuit board; not a safe-repair tutorial or a named provider.',
    'civic': 'Upward view between tall city buildings; not a claim about a named public authority.',
}


def download():
    target = ROOT / 'assets' / 'seed' / 'library-v1'
    target.mkdir(parents=True, exist_ok=True)
    records = []
    for key, photo in PHOTOS.items():
        destination = target / f'{key}.jpg'
        url = f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w=960&q=80'
        if not destination.exists():
            request = urllib.request.Request(url, headers={'User-Agent': 'CampaignDemoLibrary/1.0'})
            with urllib.request.urlopen(request, timeout=30) as response:
                raw = response.read(5 * 1024 * 1024 + 1)
            if len(raw) > 5 * 1024 * 1024:
                raise ValueError(f'{key}: source exceeds 5 MiB.')
            with Image.open(io.BytesIO(raw)) as image:
                image.thumbnail((960, 960))
                image.convert('RGB').save(destination, 'JPEG', quality=82, optimize=True)
        with Image.open(destination) as image:
            width, height = image.size
        records.append({
            'id': key, 'file': f'library-v1/{key}.jpg', 'source': url,
            'sourceImageId': photo, 'provider': 'Unsplash',
            'subjectInspected': SUBJECTS[key], 'visualInspectionOn': '2026-10-17',
            'credit': 'Unsplash stock photography; individual photographer attribution not established',
            'license': 'Unsplash License', 'licenseUrl': 'https://unsplash.com/license',
            'licenseInspectedOn': '2026-10-17',
            'usage': 'Illustrative licensed stock, not campaign participants, event documentation, endorsement or outcome evidence.',
            'limitations': 'No identifiable subject is represented as the fictional creator. Stock rights are not independent campaign verification.',
            'optimization': 'Downloaded at 960px maximum; JPEG quality82, metadata removed.',
            'width': width, 'height': height, 'bytes': destination.stat().st_size,
            'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(),
        })
        print(f'{key}: {width}x{height}, {destination.stat().st_size} bytes')
    (target / 'media-manifest.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    download()
