const { AndroidConfig, withAndroidManifest, withDangerousMod } = require("expo/config-plugins");
const { patchInstalled } = require("./campaignActivityResultsPatch.cjs");

module.exports = function withCampaignActivityResults(config) {
  // Restore Android's normal Activity recreation and RN text-layout refresh.
  // This also removes the rejected token from a previously generated manifest.
  config = withAndroidManifest(config, (result) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(result.modResults);
    const changes = activity.$["android:configChanges"];
    if (changes) activity.$["android:configChanges"] = changes.split("|").filter((value) => value.trim() !== "fontScale").join("|");
    return result;
  });
  return withDangerousMod(config, ["android", async (result) => {
    patchInstalled(result.modRequest.projectRoot);
    return result;
  }]);
};
