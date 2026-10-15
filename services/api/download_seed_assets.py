"""Optional development-time cache. Running the API never fetches external media."""
import io
import json
from pathlib import Path
import urllib.request

from PIL import Image

from db import ROOT
from seed import SAMPLES

if __name__ == '__main__':
    target = (ROOT / 'assets' / 'seed').resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError('Seed image output must remain inside this service.')
    target.mkdir(parents=True, exist_ok=True)
    manifest = []
    for sample in SAMPLES:
        key, photo = sample[0], sample[8]
        url = f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w=1200&q=85'
        destination = target / f'{key}.jpg'
        if not destination.exists():
            request = urllib.request.Request(url, headers={'User-Agent': 'CampaignAmplificationPrototype/1.0'})
            with urllib.request.urlopen(request, timeout=30) as response:
                raw = response.read(8*1024*1024+1)
            if len(raw) > 8*1024*1024:
                raise ValueError(f'{key}: source image is too large.')
            with Image.open(io.BytesIO(raw)) as image:
                image.convert('RGB').save(destination, 'JPEG', quality=88, optimize=True)
        with Image.open(destination) as image:
            width, height = image.size
        print(f'{key}: cached {width}x{height} JPEG')
        manifest.append({'file': destination.name, 'source': url, 'credit': 'Unsplash stock photography',
                         'usage': 'Illustrative imagery only; no endorsement or campaign verification implied.'})
    (target / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')

