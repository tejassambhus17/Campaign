const { withAppBuildGradle } = require("expo/config-plugins");

const START = "// BEGIN CAMPAIGN DEDICATED RELEASE SIGNING";
const END = "// END CAMPAIGN DEDICATED RELEASE SIGNING";
const block = `${START}
def campaignSigningValues = [:]
['STORE_FILE', 'STORE_PASSWORD', 'KEY_ALIAS', 'KEY_PASSWORD'].each { suffix ->
    def value = System.getenv('CAMPAIGN_RELEASE_' + suffix)
    if (!value) {
        throw new GradleException('Dedicated Campaign release signing is unavailable. Use scripts/android-local.ps1 -Mode Release; debug signing fallback is forbidden.')
    }
    campaignSigningValues[suffix] = value
}
def campaignStoreFile = file(campaignSigningValues.STORE_FILE)
if (!campaignStoreFile.isFile()) {
    throw new GradleException('The dedicated Campaign release keystore is unavailable.')
}
android.signingConfigs {
    campaignRelease {
        storeFile campaignStoreFile
        storePassword campaignSigningValues.STORE_PASSWORD
        keyAlias campaignSigningValues.KEY_ALIAS
        keyPassword campaignSigningValues.KEY_PASSWORD
    }
}
android.buildTypes.release.signingConfig = android.signingConfigs.campaignRelease
${END}`;

function configureReleaseSigning(contents, enabled) {
  const escapedStart = START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let source = contents.replace(new RegExp(`\\n?${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, "g"), "\n");
  const release = /(\brelease\s*\{[\s\S]*?\bsigningConfig\s+)(?:signingConfigs\.debug|null)/g;
  const matches = [...source.matchAll(release)];
  if (matches.length !== 1) throw new Error("Expected one Expo-generated Android release signing binding; review the native template before building.");
  source = source.replace(release, `$1${enabled ? "null" : "signingConfigs.debug"}`);
  return enabled ? `${source.trimEnd()}\n\n${block}\n` : source;
}

module.exports = function withCampaignReleaseSigning(config, { enabled = false } = {}) {
  return withAppBuildGradle(config, result => {
    if (result.modResults.language !== "groovy") throw new Error("Campaign release signing requires the existing Groovy Android template.");
    result.modResults.contents = configureReleaseSigning(result.modResults.contents, enabled);
    return result;
  });
};
module.exports.configureReleaseSigning = configureReleaseSigning;
