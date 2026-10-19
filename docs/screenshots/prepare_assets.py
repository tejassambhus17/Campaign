"""Optimize exact-final Android captures for the README; no app/device actions."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "docs/screenshots"
BASE = "artifacts/final-submission-20261019/native/"
VERSION, CODE = "1.5.1", 12
CERT = "ef0d218676ed3fa4f81033ebd9ec0c6d825017b60505c89f675b31ee6188db07"
SELECTION = [
    ("welcome", "Welcome"), ("home", "Home"), ("explore", "Explore"), ("campaign-details", "Campaign details"),
    ("create", "Five-step creation overview"), ("create-basics", "Basics"), ("create-story", "Story"), ("create-visuals", "Campaign & Ad Visuals"),
    ("create-reach", "Reach"), ("readiness", "Campaign Readiness Assistant"), ("suggestions", "Rule-based writing suggestions"), ("instant-preview", "Instant campaign preview"),
    ("create-submit", "Review & Submit summary"), ("trust-verification", "Trust & Verification"), ("contribution", "Simulated contribution"), ("campaign-report", "Campaign report"),
    ("activity", "Activity"), ("creator-studio", "Creator Studio"), ("profile", "Profile - Dark"), ("light-theme", "Profile - Light"),
]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def project_path(path):
    result = path.resolve()
    if not result.is_relative_to(ROOT):
        raise ValueError("Media inputs must remain inside Campaign.")
    return result


def generate():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--apk", type=Path, required=True)
    args.add_argument("--build-receipt", type=Path, required=True)
    args.add_argument("--expected-sha256", required=True)
    args.add_argument("--source-freeze", type=Path, default=ROOT / "artifacts/final-submission-20261019/SOURCE_INPUTS.json")
    options = args.parse_args()
    assert ROOT == Path("E:/Campaign"), "Use the authorized workspace."
    apk, receipt_path, freeze_path = map(project_path, [options.apk, options.build_receipt, options.source_freeze])
    receipt = json.loads(receipt_path.read_text(encoding="utf-8-sig"))
    frozen = json.loads(freeze_path.read_text(encoding="utf-8-sig"))
    actual_hash = digest(apk)
    assert actual_hash == options.expected_sha256.lower() == receipt["sha256"].lower(), "Actual APK / confirmed hash / build receipt mismatch."
    assert apk.stat().st_size == receipt["bytes"], "APK size mismatch."
    assert receipt["versionName"] == VERSION and receipt["versionCode"] == CODE, "Unexpected build identity."
    assert receipt["signingCertificateSha256"].lower() == CERT and receipt["dedicatedReleaseSigned"], "Unexpected signer."
    assert frozen["files"] and all(digest(project_path(ROOT / item["path"])) == item["sha256"].lower() for item in frozen["files"]), "Frozen application source drift."
    inputs = [(slug, title, ROOT / f"{BASE}final-{slug}.png") for slug, title in SELECTION]
    missing = [str(source.relative_to(ROOT)) for _, _, source in inputs if not source.is_file() or not source.with_suffix(".xml").is_file()]
    assert not missing, "Wait for all exact-final PNG/XML captures: " + ", ".join(missing)
    for _, _, source in inputs:
        with Image.open(source) as capture:
            capture.verify()
    # Validate every input before replacing a published gallery image.
    entries = []
    for slug, title, source in inputs:
        output = DEST / (slug + ".jpg")
        with Image.open(source) as capture:
            size = (540, round(capture.height * 540 / capture.width))
            capture.convert("RGB").resize(size, Image.Resampling.LANCZOS).save(
                output, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True)
            original_size = list(capture.size)
        entries.append(dict(title=title, file=output.relative_to(ROOT).as_posix(),
            source=source.relative_to(ROOT).as_posix(), scope="exact-final", version=f"{VERSION} / code {CODE}",
            deviceSerial="emulator-5578" if slug == "welcome" else "emulator-5574",
            avd="Campaign_Submission_Auth_36" if slug == "welcome" else "Campaign_Studio_36",
            apkSha256=actual_hash, sourceSha256=digest(source),
            sourceXml=source.with_suffix(".xml").relative_to(ROOT).as_posix(), sourceXmlSha256=digest(source.with_suffix(".xml")),
            sourceDimensions=original_size, dimensions=list(size), sourceBytes=source.stat().st_size,
            bytes=output.stat().st_size, sha256=digest(output)))
    original_logo = ROOT / "apps/mobile/assets/brand/campaign-megaphone-transparent.png"
    assert (DEST / "campaign-logo.png").is_file(), "Preserve the existing approved README logo."
    manifest = dict(schemaVersion=2, preparedOn="2026-10-19",
        platform="Two owned isolated Android16/API36 x86_64 emulators: Campaign_Studio_36/emulator-5574 for19 captures and Campaign_Submission_Auth_36/emulator-5578 for fresh Welcome; same exact APK, not physical-device screenshots",
        processing="540px proportional resize; progressive JPEG quality88 4:4:4; no screenshot crop, retouch, recolor, compositing or generated UI. Metadata omitted.",
        logo=dict(source=original_logo.relative_to(ROOT).as_posix(), sourceSha256=digest(original_logo),
            file="docs/screenshots/campaign-logo.png", sha256=digest(DEST / "campaign-logo.png"), processing="Existing approved transparent megaphone; unchanged by this refresh."),
        localBuild=dict(version=VERSION, code=CODE, apk=apk.relative_to(ROOT).as_posix(), apkSha256=actual_hash, bytes=apk.stat().st_size,
            buildReceipt=receipt_path.relative_to(ROOT).as_posix(), buildReceiptSha256=digest(receipt_path),
            sourceFreeze=freeze_path.relative_to(ROOT).as_posix(), sourceFreezeSha256=digest(freeze_path),
            signingCertificateSha256=CERT, publication="Local prepared build; not uploaded or published by this task."),
        publishedRelease=dict(version="1.4.0", evidence="Owner-provided release URL; private release assets not authenticated by this media task.", url="https://github.com/tejassambhus17/Campaign/releases/tag/1.4.0", downloadRoute="https://github.com/tejassambhus17/Campaign/releases/latest"),
        buildScopes={"exact-final": "All gallery sources are root-captured final1.5.1/code12 screenshots after installing the same dedicated-signed APK; individual screenshot files and XML are preserved. Screenshot appearance does not establish every workflow or gesture."},
        screenshots=entries, totalImageBytes=sum(item["bytes"] for item in entries), totalOriginalBytes=sum(item["sourceBytes"] for item in entries))
    (DEST / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"screenshots": len(entries), "version": VERSION, "code": CODE, "apkSha256": actual_hash, "totalImageBytes": manifest["totalImageBytes"], "totalOriginalBytes": manifest["totalOriginalBytes"]}, indent=2))


if __name__ == "__main__":
    generate()
