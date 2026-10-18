"""Resize existing native captures for the README. Does not start the app."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'docs/screenshots'
BASE = 'artifacts/dropdown-hierarchy-20261018/'
HASHES = {
    'final': 'cb08edf303ba6eb7b9720f21be4e2879c8179cdb7d19eccfac91024908953397',
    'candidate': 'ff9e305392eb75cc113a63223422cb96b92dfe81269ebcf99e99085fe832db69',
    'earlier-verified': '11755a1675ccd0264adb661ddd4d3ef916b220ca686599333891414ad02a2bc9a',
}
SELECTION = [
    ('welcome', 'Welcome', 'earlier-verified', 'artifacts/final-completion-20261017/activity-lifecycle-fix/fresh-native/welcome-1-mountains.png'),
    ('home', 'Home', 'final', BASE + 'native-confirmed/64-final-home.png'),
    ('explore', 'Explore', 'final', BASE + 'native-confirmed/45-explore.png'),
    ('campaign-details', 'Campaign details: transparency', 'candidate', BASE + 'native-candidate/01-campaign-transparency.png'),
    ('create', 'Five-step overview', 'final', BASE + 'native-confirmed/03-creation-entry-confirmed.png'),
    ('create-basics', 'Basics', 'candidate', BASE + 'native-candidate/24-basics.png'),
    ('create-story', 'Story', 'candidate', BASE + 'native-candidate/27-story.png'),
    ('create-visuals', 'Campaign & Ad Visuals', 'candidate', BASE + 'native-candidate/29-visuals.png'),
    ('create-reach', 'Reach', 'candidate', BASE + 'native-candidate/32-reach.png'),
    ('create-submit', 'Submit', 'candidate', BASE + 'native-candidate/36-submit-summary.png'),
    ('trust-verification', 'Trust & Verification', 'candidate', BASE + 'native-candidate/11-assessment-overview.png'),
    ('contribution', 'Simulated contribution', 'candidate', BASE + 'native-candidate/19-contribution.png'),
    ('activity', 'Activity', 'final', BASE + 'native-confirmed/support-activity-confirmed-all.png'),
    ('campaign-report', 'Campaign report', 'final', BASE + 'native-confirmed/47-report-after-share-cancel.png'),
    ('profile', 'Fictional QA profile', 'final', BASE + 'native-confirmed/support-profile-confirmed-overview.png'),
    ('light-theme', 'Light campaign transparency', 'final', BASE + 'native-confirmed/52-light-transparency.png'),
]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def generate():
    assert ROOT == Path('E:/Campaign'), 'Use the authorized workspace.'
    DEST.mkdir(parents=True, exist_ok=True)
    entries = []
    for slug, title, scope, source in SELECTION:
        original, output = ROOT / source, DEST / (slug + '.jpg')
        with Image.open(original) as capture:
            size = (540, round(capture.height * 540 / capture.width))
            capture.convert('RGB').resize(size, Image.Resampling.LANCZOS).save(
                output, 'JPEG', quality=88, subsampling=0, optimize=True, progressive=True)
            original_size = list(capture.size)
        entries.append(dict(title=title, file=output.relative_to(ROOT).as_posix(),
            source=source, scope=scope,
            version='1.2.2 / code 5' if scope == 'earlier-verified' else '1.4.0 / code 10',
            apkSha256=HASHES[scope], sourceSha256=digest(original),
            sourceDimensions=original_size, dimensions=list(size),
            sourceBytes=original.stat().st_size, bytes=output.stat().st_size,
            sha256=digest(output)))
    original_logo = ROOT / 'apps/mobile/assets/brand/campaign-megaphone-transparent.png'
    with Image.open(original_logo) as image:
        logo = image.convert('RGBA')
        logo = ImageOps.contain(logo.crop(logo.getchannel('A').getbbox()), (256, 256), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (280, 280), (0, 0, 0, 0))
        canvas.alpha_composite(logo, ((280 - logo.width)//2, (280 - logo.height)//2))
        canvas.save(DEST / 'campaign-logo.png', optimize=True)
    manifest = dict(preparedOn='2026-10-19',
        platform='Android API 36 x86_64 emulator; not physical-device screenshots',
        processing='540px proportional resize; progressive JPEG quality88 4:4:4; no screenshot crop, retouch, recolor, compositing or generated content. Metadata omitted.',
        logo=dict(source=original_logo.relative_to(ROOT).as_posix(), sourceSha256=digest(original_logo),
            file='docs/screenshots/campaign-logo.png', processing='Trim transparent padding and proportionally resize approved mark only.'),
        buildScopes={
            'final': 'Exact signed 1.4.0 final CB08.',
            'candidate': 'Same-version 1.4.0 initial QA candidate FF9E, before Information.tsx keyboard-occlusion correction. Not exact-final-binary captures.',
            'earlier-verified': 'Welcome verified 1.2.2 capture; no final1.4.0 Welcome capture available. Auth/carousel and associated image assets unchanged between preserved1.2.3 and1.4.0 checkpoints; not a new runtime test.'},
        screenshots=entries, totalImageBytes=sum(e['bytes'] for e in entries),
        totalOriginalBytes=sum(e['sourceBytes'] for e in entries))
    (DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: manifest[k] for k in ['totalImageBytes','totalOriginalBytes']}))

if __name__ == '__main__':
    generate()
