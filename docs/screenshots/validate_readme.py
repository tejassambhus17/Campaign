"""Bounded documentation/asset checks. No app, build, device, or cloud actions."""
import argparse
import hashlib
import html
import json
import re
import urllib.request
from datetime import datetime, timezone
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
    args.add_argument('--retain-network-evidence', action='store_true',
                      help='Reuse matching previously recorded public URL results; perform no network requests.')
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
    record('Release links use the absolute latest-release route',
           not root_routes and parser.refs.count('https://github.com/tejassambhus17/Campaign/releases/latest') == 2)
    record('Rendered HTML tags balance', not parser.errors and not parser.stack, parser.errors + parser.stack)
    record('All images have descriptive alt text', all(i.get('alt') for i in parser.images), len(parser.images))
    record('Five screenshot rows contain four images each', parser.rows[:5] == [4, 4, 4, 4, 4], parser.rows[:5])
    image_refs = [i['src'] for i in parser.images if i['src'].endswith('.jpg')]
    record('Exactly20 unique screenshot assets in relative docs paths',
           len(image_refs) == len(set(image_refs)) == 20 and all(r.startswith('docs/screenshots/') for r in image_refs))
    record('No ignored artifact/APK/video links in README', not re.search(r'(?:href|src)="[^"]*(?:artifacts/|\.apk|\.mp4)', rendered))
    record('Balanced code fences including architecture diagram', TEXT.count('```') == 4)
    record('Simulation and illustrative-score disclosures present', all(s in TEXT for s in [
        'No real money is charged', 'illustrative', 'not independent verification', 'does not automatically start ads', 'New user campaigns begin unassessed']))
    record('Four creation and creator improvements described without an AI claim', all(s in TEXT for s in [
        'Readiness assistant', 'Writing suggestions', 'Instant preview', 'Creator Studio', 'no AI API is involved']))
    record('Source/gallery version and release-asset upload clearly distinguished', all(s in TEXT for s in [
        'Source and gallery: 1.5.1', 'build 12', 'published GitHub Release', 'Pushing source does not upload the APK', 'separately as a release asset']))

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
    record('All20 output/source hashes, dimensions and stripped EXIF verified', len(manifest['screenshots']) == 20 and not problems, problems)
    total_bytes = sum((ROOT / item['file']).stat().st_size for item in manifest['screenshots'])
    record('Screenshot download weight below2.25MB', total_bytes == manifest['totalImageBytes'] and total_bytes < 2250000, total_bytes)
    record('README gallery and manifest identify the same20 images', set(image_refs) == {item['file'] for item in manifest['screenshots']})
    build = manifest['localBuild']
    freeze_path = ROOT / build['sourceFreeze']
    frozen = json.loads(freeze_path.read_text(encoding='utf-8-sig'))
    drift = [f['path'] for f in frozen['files'] if not (ROOT / f['path']).is_file() or sha(ROOT / f['path']) != f['sha256'].lower()]
    record('Final frozen application inputs unchanged', bool(frozen['files']) and not drift and sha(freeze_path) == build['sourceFreezeSha256'], dict(compared=len(frozen['files']), changed=drift))
    apk_hash = sha(ROOT / build['apk'])
    receipt_path = ROOT / build['buildReceipt']
    receipt = json.loads(receipt_path.read_text(encoding='utf-8-sig'))
    record('Gallery APK matches exact final build receipt', apk_hash == build['apkSha256'] == receipt['sha256'].lower()
           and (ROOT / build['apk']).stat().st_size == build['bytes'] == receipt['bytes']
           and sha(receipt_path) == build['buildReceiptSha256'], apk_hash)
    record('All20 screenshots attributed to one final1.5.1/code12 build', build['version'] == '1.5.1' and build['code'] == 12
           and receipt['versionName'] == '1.5.1' and receipt['versionCode'] == 12
           and all(item['scope'] == 'exact-final' and item['version'] == '1.5.1 / code 12' and item['apkSha256'] == apk_hash for item in manifest['screenshots']))
    record('Capture attribution names both owned emulators accurately',
           sum(item.get('deviceSerial') == 'emulator-5578' and item.get('avd') == 'Campaign_Submission_Auth_36' and item['file'].endswith('/welcome.jpg') for item in manifest['screenshots']) == 1
           and sum(item.get('deviceSerial') == 'emulator-5574' and item.get('avd') == 'Campaign_Studio_36' for item in manifest['screenshots']) == 19)
    xml_problems = [item['sourceXml'] for item in manifest['screenshots'] if not (ROOT / item['sourceXml']).is_file() or sha(ROOT / item['sourceXml']) != item['sourceXmlSha256']]
    record('All20 original native XML captures preserved', not xml_problems, xml_problems)
    logo = manifest['logo']
    record('Approved logo source and output unchanged', sha(ROOT / logo['file']) == logo['sha256'] and sha(ROOT / logo['source']) == logo['sourceSha256'])

    urls = sorted({i['src'] for i in parser.images if i['src'].startswith('https://')}
                  | {u for u in parser.refs if u.startswith('https://') and 'img.shields.io/' not in u and not u.startswith('https://github.com/tejassambhus17/Campaign/')})
    previous = DEST / 'verification.json'
    network = []
    network_mode = 'Not performed in this validator run'
    network_recorded_utc = None
    if options.check_network:
        with ThreadPoolExecutor(max_workers=7) as pool:
            network = list(pool.map(check_url, urls))
        network_mode = 'Fresh read-only public URL requests'
        network_recorded_utc = datetime.now(timezone.utc).isoformat()
    elif options.retain_network_evidence and previous.exists():
        old_report = json.loads(previous.read_text(encoding='utf-8'))
        old_network = old_report.get('network', [])
        if {item['url'] for item in old_network} != set(urls) or not all(item.get('valid') for item in old_network):
            raise SystemExit('Recorded public URL evidence does not match current URLs or contains failures; no network results were reused.')
        network = old_network
        network_mode = 'Recorded matching public URL evidence retained; no fresh network requests in this run'
        network_recorded_utc = old_report.get('networkEvidenceRecordedUtc') or datetime.fromtimestamp(previous.stat().st_mtime, timezone.utc).isoformat()
    # Default mode omits network results. Explicit retention preserves matching
    # prior evidence without relabelling it as fresh requests.
    report = dict(preparedOn='2026-10-19', checks=checks, passed=sum(c['passed'] for c in checks),
                  total=len(checks), allLocalChecksPassed=all(c['passed'] for c in checks), network=network,
                  privateReleaseVerification='Not authenticated by this media validator; owner reports release1.4.0, recipient asset access remains separate',
                  renderScope='Local markdown-it HTML/GitHub-style preview, not an authenticated github.com render',
                  networkCheckMode=network_mode, networkEvidenceRecordedUtc=network_recorded_utc,
                  validatorPerformedNoAppBuildTestsDeviceOrCloudActions=True)
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
