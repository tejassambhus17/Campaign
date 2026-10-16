import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadNeonEnvironment, loadLocalServerSecrets } from "./neon-runtime.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (root.toLowerCase() !== "e:\\campaign") throw new Error("Campaign must run inside E:\\Campaign.");
try {
  const neon = loadNeonEnvironment(root, process.env.CAMPAIGN_NEON_ENV_FILE);
  const secrets = loadLocalServerSecrets(root);
  const port = process.env.CAMPAIGN_PORT || "8879";
  if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error("Choose a valid local Campaign port.");
  const env = { ...process.env, ...neon, ...secrets,
    CAMPAIGN_ENV: "local", CAMPAIGN_MEDIA_STORAGE: "local", CAMPAIGN_HOST: "127.0.0.1", CAMPAIGN_PORT: port };
  delete env.CAMPAIGN_DB_PATH;
  // A separate opt-in startup command leaves normal SQLite startup unchanged.
  // No generic DATABASE_URL from another process/project is read by the API.
  const child = spawn(resolve(root, "services/api/.venv/Scripts/python.exe"), ["run.py"], {
    cwd: resolve(root, "services/api"), env, stdio: "inherit", windowsHide: true,
  });
  child.on("error", () => { console.error("Campaign's project Python could not start."); process.exitCode = 1; });
  child.on("exit", (code) => { process.exitCode = code ?? 1; });
  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
} catch {
  console.error("Neon API startup failed. Check the project's ignored environment and private server settings; no credentials were printed.");
  process.exitCode = 1;
}
