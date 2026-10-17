const { withFinalizedMod } = require("expo/config-plugins");
const fs = require("node:fs/promises");
const path = require("node:path");

// Reuse the approved bitmap without redrawing it. Expo generates the density
// variants; native drawable insets fit the mark within Android's 66/108 safe
// zone, retaining the horn, handle and waves under different launcher masks.
module.exports = function withCampaignBranding(config) {
  return withFinalizedMod(config, [
    "android",
    async (result) => {
      const directory = path.join(
        result.modRequest.platformProjectRoot,
        "app/src/main/res/mipmap-anydpi-v26",
      );
      const mark = `<inset android:drawable="@mipmap/ic_launcher_foreground"
            android:insetLeft="16%" android:insetTop="16%"
            android:insetRight="16%" android:insetBottom="16%" />`;
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/iconBackground" />
    <foreground>${mark}</foreground>
    <monochrome>${mark}</monochrome>
</adaptive-icon>
`;
      await fs.mkdir(directory, { recursive: true });
      for (const name of ["ic_launcher.xml", "ic_launcher_round.xml"]) {
        await fs.writeFile(path.join(directory, name), xml, "utf8");
      }
      return result;
    },
  ]);
};
