"""Bounded documentation/asset checks. No app, build, device, or cloud actions."""
import argparse
import hashlib
import html
import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image
from markdown_it import MarkdownIt

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'docs/screenshots'
TEXT = (ROOT / 'README.md').read_text(encoding='utf-8')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def slug(value):
    return re.sub(r'[^\w\- ]', '', value.lower()).replace(' ', '-')

class InspectHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.images, self.rows, self.row = [], [], [], None
        self.stack, self.errors = [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ['src', 'href']:
            if key in a:
                self.refs.append(a[key])
        if tag == 'img':
            self.images.append(a)
        if tag == 'tr':
            self.row = 0
        if tag == 'td' and self.row is not None:
            self.row += 1
        if tag not in ['img', 'br', 'hr', 'meta', 'link', 'input']:
            self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
    def handle_endtag(self, tag):
        if tag == 'tr':
            if self.row:
                self.rows.append(self.row)
            self.row = None
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        else:
            self.errors.append('Unexpected closing tag: ' + tag)

def check_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Campaign-README-verification'})
        with urllib.request.urlopen(req, timeout=20) as response:
            body = response.read()
            good_svg = b'<svg' in body if 'img.shields.io/' in url else True
            return dict(url=url, status=response.status, valid=good_svg,
                        bytes=len(body), finalUrl=response.url)
    except Exception as error:
        return dict(url=url, valid=False, error=str(error))

def main():
    args = argparse.ArgumentParser()
    args.add_argument('--check-network', action='store_true')
    options = args.parse_args()
    assert ROOT == Path('E:/Campaign')
    md = MarkdownIt('commonmark', {'html': True}).enable('table')
    tokens = md.parse(TEXT)
    anchors = set()
    for index, token in enumerate(tokens):
        if token.type == 'heading_open':
            anchor = slug(tokens[index + 1].content)
            anchors.add(anchor)
            token.attrSet('id', anchor)
    rendered = md.renderer.render(tokens, md.options, {})
    parser = InspectHTML()
    parser.feed(rendered)
    checks = []
    def record(name, passed, detail=None):
        checks.append(dict(name=name, passed=bool(passed), detail=detail))
    missing, fragments, root_routes = [], [], []
    for ref in parser.refs:
        if ref.startswith(('https://', 'http://')):
            continue
        if ref.startswith('#'):
            if ref[1:] not in anchors:
                fragments.append(ref)
        elif ref.startswith('/'):
            root_routes.append(ref)
        elif not (ROOT / ref.split('#')[0]).exists():
            missing.append(ref)
    record('All README local files and folders exist', not missing, missing)
    record('All README in-page links resolve', not fragments, fragments)
    record('Release links use only the known GitHub-relative release index',
           bool(root_routes) and set(root_routes) == {'/tejassambhus17/Campaign/releases'}, sorted(set(root_routes)))
    record('Rendered HTML tags balance', not parser.errors and not parser.stack, parser.errors + parser.stack)
    record('All images have descriptive alt text', all(i.get('alt') for i in parser.images), len(parser.images))
    record('Four screenshot rows contain four images each', parser.rows[:4] == [4, 4, 4, 4], parser.rows[:4])
    image_refs = [i['src'] for i in parser.images if i['src'].endswith('.jpg')]
    record('Exactly16 unique screenshot assets in relative docs paths',
           len(image_refs) == len(set(image_refs)) == 16 and all(r.startswith('docs/screenshots/') for r in image_refs))
    record('No ignored artifact/APK/video links in README', not re.search(r'(?:href|src)="[^"]*(?:artifacts/|\.apk|\.mp4)', rendered))
    record('Balanced code fences including architecture diagram', TEXT.count('```') == 4)
    record('Simulation and illustrative-score disclosures present', all(s in TEXT for s in [
        'No real money is charged', 'illustrative', 'not independent verification', 'does not automatically start ads', 'New user campaigns begin unassessed']))

    manifest = json.loads((DEST / 'manifest.json').read_text(encoding='utf-8'))
    problems = []
    for item in manifest['screenshots']:
        path, original = ROOT / item['file'], ROOT / item['source']
        with Image.open(path) as image:
            image.load()
            valid = (list(image.size) == item['dimensions'] and image.width == 540
                     and not image.getexif() and sha(path) == item['sha256']
                     and sha(original) == item['sourceSha256'])
        if not valid:
            problems.append(item['file'])
    record('All16 output/source hashes, dimensions and stripped EXIF verified', not problems, problems)
    record('Screenshot download weight below1.5MB', manifest['totalImageBytes'] < 1500000, manifest['totalImageBytes'])
    frozen = json.loads((ROOT / 'artifacts/dropdown-hierarchy-20261018/SOURCE_INPUTS.confirmed.json').read_text(encoding='utf-8-sig'))
    drift = [f['path'] for f in frozen['files'] if sha(ROOT / f['path']) != f['sha256']]
    record('All203 frozen application inputs unchanged', len(frozen['files']) == 203 and not drift, drift)
    apk_hash = sha(ROOT / 'artifacts/dropdown-hierarchy-20261018/Campaign.apk')
    record('Latest APK byte-identical; no rebuild', apk_hash == 'cb08edf303ba6eb7b9720f21be4e2879c8179cdb7d19eccfac91024908953397', apk_hash)

    old = json.loads((ROOT / 'artifacts/final-completion-20261017/activity-lifecycle-fix/RELEASE_SOURCE_INPUTS.inspection-final2.json').read_text(encoding='utf-8-sig'))
    auth_inputs = [f for f in old['runtime'] if (f['path'].startswith('apps/mobile/src/features/auth')
                   or f['path'].startswith('apps/mobile/assets/brand/')
                   or f['path'].startswith('apps/mobile/assets/images/showcase/')
                   or f['path'].startswith('apps/mobile/assets/images/create/'))]
    auth_drift = [f['path'] for f in auth_inputs if sha(ROOT / f['path']) != f['sha256']]
    record('Welcome-related captured source inputs remain unchanged', bool(auth_inputs) and not auth_drift,
           dict(compared=len(auth_inputs), changed=auth_drift))

    urls = sorted({i['src'] for i in parser.images if i['src'].startswith('https://')}
                  | {u for u in parser.refs if u.startswith('https://') and 'img.shields.io/' not in u})
    previous = DEST / 'verification.json'
    network = []
    if options.check_network:
        with ThreadPoolExecutor(max_workers=7) as pool:
            network = list(pool.map(check_url, urls))
    elif previous.exists():
        network = json.loads(previous.read_text(encoding='utf-8')).get('network', [])
    report = dict(preparedOn='2026-10-19', checks=checks, passed=sum(c['passed'] for c in checks),
                  total=len(checks), allLocalChecksPassed=all(c['passed'] for c in checks), network=network,
                  privateReleaseVerification='UNVERIFIED: gh auth login required; no account or release changed',
                  renderScope='Local markdown-it HTML/GitHub-style preview, not an authenticated github.com render',
                  noAppBuildTestsDeviceOrCloudActions=True)
    previous.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')

    # Standalone supporting review file; serve only docs, never the project root.
    preview = DEST / 'review'
    preview.mkdir(exist_ok=True)
    rendered = rendered.replace('src="docs/screenshots/', 'src="../').replace('href="docs/screenshots/', 'href="../')
    css = '''body{margin:0;background:#fff;color:#1f2328;font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:980px;padding:40px;margin:auto}h1,h2{line-height:1.25;border-bottom:1px solid #d1d9e0;padding-bottom:.3em}h2{margin-top:30px}a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}img{max-width:100%;height:auto}p{margin:0 0 16px}table{display:block;overflow:auto;width:100%;border-collapse:collapse;margin-bottom:20px}td,th{padding:8px;border:1px solid #d1d9e0}th{text-align:center}td{vertical-align:top}td img{display:block}blockquote{margin:0 0 16px;padding:0 1em;border-left:4px solid #d1d9e0;color:#59636e}pre{padding:16px;overflow:auto;background:#f6f8fa;border-radius:6px}code{font-size:85%}sub{font-size:12px}hr{border:0;border-top:1px solid #d1d9e0;margin:28px 0}summary{cursor:pointer}@media(max-width:600px){main{padding:18px}td,th{padding:5px;font-size:12px}td img{min-width:142px}}@media(prefers-color-scheme:dark){body{background:#0d1117;color:#f0f6fc}h1,h2,td,th{border-color:#3d444d}a{color:#4493f8}pre{background:#151b23}blockquote{color:#9198a1;border-color:#3d444d}hr{border-color:#3d444d}}'''
    (preview / 'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Campaign README — local review</title><style>' + css + '</style><main>' + rendered + '</main></html>\n', encoding='utf-8')
    print(json.dumps(dict(passed=report['passed'], total=report['total'], allLocalChecksPassed=report['allLocalChecksPassed'],
                         networkPassed=sum(n.get('valid', False) for n in network), networkTotal=len(network),
                         failures=[c for c in checks if not c['passed']])))
    if not report['allLocalChecksPassed']:
        raise SystemExit(1)

if __name__ == '__main__':
    main()
