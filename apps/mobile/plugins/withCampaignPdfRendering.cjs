const { withDangerousMod } = require("expo/config-plugins");
const { patchInstalled } = require("./campaignPrintPatch.cjs");

module.exports = function withCampaignPdfRendering(config) {
  return withDangerousMod(config, ["android", async (result) => {
    patchInstalled(result.modRequest.projectRoot);
    return result;
  }]);
};
