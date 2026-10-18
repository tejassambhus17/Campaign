const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");
const fs = require("node:fs/promises");
const path = require("node:path");

// INTERNAL-TEST permits the explicitly configured local demo API. CLOUD-TEST
// explicitly denies cleartext; switching modes reverses prior local prebuilds.
module.exports = function withInternalTestAndroid(
  config,
  { enabled = false, cloud = false } = {},
) {
  if (enabled && cloud) throw new Error("Cloud builds must not enable local HTTP traffic.");
  config = withAndroidManifest(config, (result) => {
    const application = result.modResults.manifest.application?.[0];
    if (!application)
      throw new Error("The Android application manifest is missing.");
    application.$ ||= {};
    if (cloud === true)
      application.$["android:usesCleartextTraffic"] = "false";
    else if (enabled === true)
      application.$["android:usesCleartextTraffic"] = "true";
    else delete application.$["android:usesCleartextTraffic"];
    return result;
  });
  // Accompany the unmodified fonts with full copyright/license texts in both
  // debug and internal builds. Native assets are generated through CNG.
  return withDangerousMod(config, [
    "android",
    async (result) => {
      const destination = path.join(
        result.modRequest.platformProjectRoot,
        "app/src/main/assets/licenses",
      );
      await fs.mkdir(destination, { recursive: true });
      for (const name of ["Manrope-OFL.txt", "Newsreader-OFL.txt"]) {
        await fs.copyFile(
          path.join(result.modRequest.projectRoot, "assets/fonts", name),
          path.join(destination, name),
        );
      }
      for (const name of ["Lucide-ISC.txt", "React-Native-SVG-MIT.txt", "Expo-MIT.txt"]) {
        await fs.copyFile(
          path.join(result.modRequest.projectRoot, "assets/licenses", name),
          path.join(destination, name),
        );
      }
      return result;
    },
  ]);
};
