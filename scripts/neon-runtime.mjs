// Server-only environment adapter. Never import this module from apps/mobile.
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseEnv } from "node:util";

export function mapNeonEnvironment(values) {
  const result = {};
  for (const [source, destination] of [
    ["DATABASE_URL", "CAMPAIGN_DATABASE_URL"],
    ["DATABASE_URL_UNPOOLED", "CAMPAIGN_MIGRATION_DATABASE_URL"],
  ]) {
    const raw = values[source];
    let parsed;
    try { parsed = new URL(raw); } catch { throw new Error(`${source} must be a valid server-side PostgreSQL URL.`); }
    if (!["postgres:", "postgresql:"].includes(parsed.protocol) || !parsed.username || !parsed.password ||
        !parsed.hostname.endsWith(".neon.tech") || !parsed.pathname.slice(1) ||
        !["require", "verify-ca", "verify-full"].includes(parsed.searchParams.get("sslmode")))
      throw new Error(`${source} must use Neon PostgreSQL with explicit TLS.`);
    if (source === "DATABASE_URL_UNPOOLED" && parsed.hostname.split(".")[0].endsWith("-pooler"))
      throw new Error("Migrations require the unpooled Neon URL.");
    result[destination] = raw;
  }
  const pooled = new URL(values.DATABASE_URL);
  const direct = new URL(values.DATABASE_URL_UNPOOLED);
  if (pooled.hostname.replace(/-pooler(?=\.)/, "") !== direct.hostname ||
      pooled.pathname !== direct.pathname || pooled.username !== direct.username || pooled.password !== direct.password)
    throw new Error("The pooled and direct URLs must belong to the same Neon database and role.");
  if (!values.NEON_BRANCH?.trim()) throw new Error("NEON_BRANCH is required in the pulled environment.");
  return result;
}

export function loadNeonEnvironment(root, envPath) {
  const file = resolve(envPath || (existsSync(resolve(root, ".env")) ? resolve(root, ".env") : resolve(root, ".env.local")));
  const relative = file.slice(resolve(root).length);
  if (!file.startsWith(resolve(root) + "\\") && !file.startsWith(resolve(root) + "/"))
    throw new Error("The Neon environment file must stay inside the Campaign workspace.");
  if (!relative || !existsSync(file)) throw new Error("Run neon deploy to pull this project's server environment first.");
  const actual = realpathSync(file);
  if (!actual.startsWith(realpathSync(root) + "\\") && !actual.startsWith(realpathSync(root) + "/"))
    throw new Error("The Neon environment file must not link outside Campaign.");
  return mapNeonEnvironment(parseEnv(readFileSync(file, "utf8")));
}

export function loadLocalServerSecrets(root) {
  const path = resolve(root, "services/api/data/neon-runtime.json");
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    const values = {
      CAMPAIGN_RECEIPT_SECRET: randomBytes(32).toString("hex"),
      CAMPAIGN_REVIEWER_EMAIL: "campaign-reviewer@example.test",
      CAMPAIGN_REVIEWER_PASSWORD: randomBytes(24).toString("base64url"),
    };
    try { writeFileSync(path, JSON.stringify(values, null, 2) + "\n", { flag: "wx", mode: 0o600 }); }
    catch (error) { if (error.code !== "EEXIST") throw error; }
  }
  const values = JSON.parse(readFileSync(path, "utf8"));
  if (typeof values.CAMPAIGN_RECEIPT_SECRET !== "string" || values.CAMPAIGN_RECEIPT_SECRET.length < 32 ||
      typeof values.CAMPAIGN_REVIEWER_PASSWORD !== "string" || values.CAMPAIGN_REVIEWER_PASSWORD.length < 12 ||
      typeof values.CAMPAIGN_REVIEWER_EMAIL !== "string") throw new Error("Private Neon server settings are invalid.");
  return Object.fromEntries(["CAMPAIGN_RECEIPT_SECRET", "CAMPAIGN_REVIEWER_EMAIL", "CAMPAIGN_REVIEWER_PASSWORD"].map(key => [key, values[key]]));
}
