import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { configureReleaseSigning } = require('../plugins/withCampaignReleaseSigning.cjs');
const template = `apply plugin: "com.android.application"
android {
  signingConfigs { debug { storeFile file('debug.keystore') } }
  buildTypes {
    debug { signingConfig signingConfigs.debug }
    release {
      // Expo's generated test binding must not survive Release mode.
      signingConfig signingConfigs.debug
      minifyEnabled false
    }
  }
}
`;

test('dedicated signing clears the generated release debug binding and uses only mandatory process variables', () => {
  const result = configureReleaseSigning(template, true);
  assert.match(result, /release\s*\{[\s\S]*?signingConfig null/);
  assert.match(result, /debug \{ signingConfig signingConfigs.debug \}/);
  assert.match(result, /android.buildTypes.release.signingConfig = android.signingConfigs.campaignRelease/);
  assert.match(result, /if \(!value\).*?[\s\S]*?throw new GradleException/);
  assert.match(result, /System.getenv\('CAMPAIGN_RELEASE_' \+ suffix\)/);
  for (const name of ['STORE_FILE', 'STORE_PASSWORD', 'KEY_ALIAS', 'KEY_PASSWORD']) assert.ok(result.includes(`'${name}'`));
  assert.doesNotMatch(result, /storePassword\s+['"]|keyPassword\s+['"]/);
});

test('CNG signing transformation is idempotent and mode reversal retains existing compatible internal builds', () => {
  const once = configureReleaseSigning(template, true);
  assert.equal(configureReleaseSigning(once, true), once);
  const restored = configureReleaseSigning(once, false);
  assert.doesNotMatch(restored, /CAMPAIGN DEDICATED RELEASE SIGNING|campaignRelease|CAMPAIGN_RELEASE_/);
  assert.match(restored, /release\s*\{[\s\S]*?signingConfig signingConfigs.debug/);
  assert.equal(configureReleaseSigning(restored, false), restored);
  assert.equal(configureReleaseSigning(restored, true), once);
});

test('unknown or duplicate native signing templates fail instead of silently shipping debug signing', () => {
  assert.throws(() => configureReleaseSigning('android {}', true), /Expected one/);
  assert.throws(() => configureReleaseSigning(template + template, true), /Expected one/);
  assert.throws(() => configureReleaseSigning(template.replace('signingConfig signingConfigs.debug\n', 'signingConfig signingConfigs.other\n'), true), /Expected one/);
});

test('release metadata retains identity and increments code; unused capabilities are blocked', () => {
  const { expo } = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  assert.equal(expo.name, 'Campaign');
  assert.equal(expo.android.package, 'com.campaignamplification.mobile');
  assert.equal(expo.version, '1.4.0');
  assert.equal(expo.android.versionCode, 10);
  assert.equal(pkg.version, expo.version);
  assert.equal(lock.version, expo.version);
  assert.equal(lock.packages[''].version, expo.version);
  for (const [name, entry] of Object.entries(lock.packages)) {
    if (name && entry.resolved?.startsWith('https://registry.npmjs.org/') && entry.resolved.endsWith('.tgz')) {
      assert.ok(entry.resolved.endsWith(`-${entry.version}.tgz`), `Dependency version must match its unchanged npm archive: ${name}`);
    }
  }
  for (const permission of ['VIBRATE', 'USE_BIOMETRIC', 'USE_FINGERPRINT', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'SYSTEM_ALERT_WINDOW']) {
    assert.ok(expo.android.blockedPermissions.includes(`android.permission.${permission}`));
  }
  assert.ok(expo.android.blockedPermissions.includes('com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE'));
});
