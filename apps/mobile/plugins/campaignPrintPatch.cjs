/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const patchDirectory = path.join(__dirname, "../native-patches/expo-print-55.0.19");
const patch = JSON.parse(fs.readFileSync(path.join(patchDirectory, "patch.json"), "utf8"));
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

function patchSource(source, version, sourcePath) {
  if (version !== patch.version) throw new Error(`Campaign PDF patch requires expo-print ${patch.version}; found ${version}`);
  const file = patch.files.find((entry) => entry.source === sourcePath);
  if (!file) throw new Error("Unreviewed Expo print patch target");
  const hash = digest(source);
  if (hash !== file.upstreamSha256 && hash !== file.patchedSha256) throw new Error("Unrecognized Expo print source bytes; PDF patch failed closed");
  const bytes = fs.readFileSync(path.join(patchDirectory, file.patchedFile));
  if (digest(bytes) !== file.patchedSha256) throw new Error("Reviewed Expo PDF patch bytes changed; failed closed");
  return { bytes, changed: hash !== file.patchedSha256, sha256: file.patchedSha256 };
}

function patchInstalled(projectRoot) {
  const mobileRoot = fs.realpathSync(projectRoot);
  const sourceModules = JSON.parse(fs.readFileSync(path.join(mobileRoot, "package.json"), "utf8"))
    .expo?.autolinking?.android?.buildFromSource;
  if (!Array.isArray(sourceModules) || !["expo-modules-core", "expo-print"].every((name) => sourceModules.includes(name))) {
    throw new Error("Campaign patched Expo modules must explicitly build from source; refusing prebuilt native fallback");
  }
  const modulePackage = require.resolve("expo-print/package.json", { paths: [mobileRoot] });
  const packageRoot = fs.realpathSync(path.dirname(modulePackage));
  const expectedRoot = fs.realpathSync(path.join(mobileRoot, "node_modules/expo-print"));
  if (packageRoot !== expectedRoot || !packageRoot.startsWith(mobileRoot + path.sep)) throw new Error("Refusing to patch Expo print outside Campaign's mobile dependency tree");
  const version = JSON.parse(fs.readFileSync(modulePackage, "utf8")).version;
  // Validate every target before changing either file. A partial known state is
  // idempotently repairable, but an unknown source never receives a write.
  const results = patch.files.map((entry) => {
    const target = path.join(packageRoot, entry.source);
    if (fs.lstatSync(target).isSymbolicLink() || !fs.realpathSync(target).startsWith(packageRoot + path.sep)) throw new Error("Refusing a linked Expo print source");
    return { target, source: entry.source, ...patchSource(fs.readFileSync(target), version, entry.source) };
  });
  for (const result of results) if (result.changed) fs.writeFileSync(result.target, result.bytes);
  return { version, files: results.map(({ source, changed, sha256 }) => ({ source, changed, sha256 })) };
}

module.exports = { patchSource, patchInstalled, patch };
if (require.main === module) console.log(JSON.stringify(patchInstalled(path.join(__dirname, ".."))));
