import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { mapNeonEnvironment, loadNeonEnvironment, loadLocalServerSecrets } from "../scripts/neon-runtime.mjs";

const values = {
  DATABASE_URL: "postgresql://fixture:only-test@ep-fictional-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  DATABASE_URL_UNPOOLED: "postgresql://fixture:only-test@ep-fictional.us-east-2.aws.neon.tech/neondb?sslmode=require",
  NEON_BRANCH: "production",
};
test("maps pooled traffic and direct migrations without exporting arbitrary keys", () => {
  const result = mapNeonEnvironment({ ...values, EXPO_PUBLIC_PASSWORD: "must-not-copy", OTHER_PROJECT: "must-not-copy" });
  assert.deepEqual(result, { CAMPAIGN_DATABASE_URL: values.DATABASE_URL, CAMPAIGN_MIGRATION_DATABASE_URL: values.DATABASE_URL_UNPOOLED });
});
test("rejects missing, plaintext, foreign or mismatched URLs without exposing values", () => {
  for (const update of [{ DATABASE_URL: "" }, { DATABASE_URL: values.DATABASE_URL.replace("?sslmode=require", "") },
    { DATABASE_URL: values.DATABASE_URL.replace(".neon.tech", ".neon.tech.attacker.test") },
    { DATABASE_URL_UNPOOLED: values.DATABASE_URL }, { NEON_BRANCH: "" },
    { DATABASE_URL_UNPOOLED: values.DATABASE_URL_UNPOOLED.replace("neondb?", "otherdb?") }]) {
    assert.throws(() => mapNeonEnvironment({ ...values, ...update }), error => !error.message.includes("only-test"));
  }
});
test("loads the project file and preserves stable local server credentials", () => {
  const directory = mkdtempSync(resolve("tmp/neon-setup/runtime-test-"));
  try {
    writeFileSync(resolve(directory, ".env.local"), Object.entries(values).map(([key, value]) => `${key}='${value}'`).join("\n"));
    assert.equal(loadNeonEnvironment(directory).CAMPAIGN_DATABASE_URL, values.DATABASE_URL);
    const before = loadLocalServerSecrets(directory);
    assert.ok(before.CAMPAIGN_RECEIPT_SECRET.length >= 32);
    assert.ok(before.CAMPAIGN_REVIEWER_PASSWORD.length >= 12);
    assert.deepEqual(loadLocalServerSecrets(directory), before);
    assert.throws(() => loadNeonEnvironment(directory, resolve(directory, "..", ".env.local")), /inside/);
    mkdirSync(resolve(directory, "services/api/data"), { recursive: true });
    writeFileSync(resolve(directory, "services/api/data/neon-runtime.json"), "{}");
    assert.throws(() => loadLocalServerSecrets(directory), /invalid/);
  } finally { rmSync(directory, { recursive: true }); }
});
