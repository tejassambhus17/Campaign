/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { Buffer } = require("node:buffer");

const patchDirectory = path.join(__dirname, "../native-patches/expo-modules-core-55.0.26");
const patch = JSON.parse(fs.readFileSync(path.join(patchDirectory, "AppContext.kt.patch.json"), "utf8"));
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

// Only the reviewed npm source or its exact reviewed transformation is accepted.
// A dependency upgrade or a second local patch requires a new explicit review.
function patchSource(source, version) {
  if (version !== patch.version) throw new Error(`Campaign activity-results patch requires expo-modules-core ${patch.version}; found ${version}`);
  const hash = digest(source);
  if (hash === patch.patchedSha256) return { bytes: source, changed: false, sha256: hash };
  if (hash !== patch.upstreamSha256) throw new Error("Unrecognized Expo AppContext.kt bytes; activity-results patch failed closed");
  let text = source.toString("utf8");
  for (const { before, after } of patch.replacements) {
    if (text.split(before).length !== 2) throw new Error("Expected one reviewed Expo patch context");
    text = text.replace(before, after);
  }
  const bytes = Buffer.from(text, "utf8");
  if (digest(bytes) !== patch.patchedSha256) throw new Error("Expo activity-results patched-source hash mismatch");
  return { bytes, changed: true, sha256: patch.patchedSha256 };
}

function patchInstalled(projectRoot) {
  const mobileRoot = fs.realpathSync(projectRoot);
  const modulePackage = require.resolve("expo-modules-core/package.json", { paths: [mobileRoot] });
  const packageRoot = fs.realpathSync(path.dirname(modulePackage));
  const expectedRoot = fs.realpathSync(path.join(mobileRoot, "node_modules/expo-modules-core"));
  if (packageRoot !== expectedRoot || !packageRoot.startsWith(mobileRoot + path.sep)) {
    throw new Error("Refusing to patch Expo outside this Campaign mobile dependency tree");
  }
  const version = JSON.parse(fs.readFileSync(modulePackage, "utf8")).version;
  const target = path.join(packageRoot, patch.source);
  if (fs.lstatSync(target).isSymbolicLink()) throw new Error("Refusing a linked Expo native source");
  const result = patchSource(fs.readFileSync(target), version);
  if (result.changed) fs.writeFileSync(target, result.bytes);
  return { version, changed: result.changed, sha256: result.sha256 };
}

module.exports = { patchSource, patchInstalled, patch };
if (require.main === module) {
  console.log(JSON.stringify(patchInstalled(path.join(__dirname, ".."))));
}
