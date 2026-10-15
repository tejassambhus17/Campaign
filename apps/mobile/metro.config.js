const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const config = getDefaultConfig(__dirname);
// Native generation/builds replace directories on Windows. Those generated files
// are not JavaScript inputs; exclude them to avoid ENOENT watcher crashes.
const existing = config.resolver.blockList;
const nativeDirectories = ["android", "ios"].map((name) => {
  const absolute = path
    .join(__dirname, name)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${absolute}(?:[/\\\\].*)?$`);
});
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  ...nativeDirectories,
];
module.exports = config;
