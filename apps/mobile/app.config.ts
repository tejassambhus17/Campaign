import type { ConfigContext, ExpoConfig } from "expo/config";

// Keep product metadata in app.json. This flag is set only by the local build
// launcher; normal builds do not permit cleartext traffic in the main manifest.
export default ({ config }: ConfigContext): ExpoConfig => {
  const { name, slug } = config;
  if (!name || !slug) {
    throw new Error("app.json must provide the Campaign name and slug.");
  }
  return {
    ...config,
    name,
    slug,
    plugins: [
      ...(config.plugins || []),
      [
        "./plugins/withInternalTestAndroid.cjs",
        { enabled: process.env.CAMPAIGN_INTERNAL_TEST === "1" },
      ],
    ],
  };
};
