import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/features/walkthrough/layout.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = { exports: {} };
new Function('module', 'exports', compiled)(loaded, loaded.exports);
const { visibleTourTarget, placeTourCard } = loaded.exports;
const portrait = { width: 393, height: 800, top: 24, bottom: 24 };

function assertTargetPreserved(actual, spotlight, viewport) {
  assert.ok(spotlight, 'a whole visible actual target should be available');
  assert.ok(spotlight.x <= actual.x && spotlight.y <= actual.y, 'outline starts outside the actual control');
  assert.ok(spotlight.x + spotlight.width >= actual.x + actual.width, 'outline contains the whole control width');
  assert.ok(spotlight.y + spotlight.height >= actual.y + actual.height, 'outline contains the whole control height');
  assert.ok(spotlight.x >= 0 && spotlight.x + spotlight.width <= viewport.width, 'spotlight stays within horizontal viewport');
  assert.ok(spotlight.y >= viewport.top && spotlight.y + spotlight.height <= viewport.height - viewport.bottom, 'spotlight stays clear of system safe areas');
}

function assertReadablePlacement(position, measuredHeight, viewport, target) {
  assert.ok([position.top, position.maxHeight].every(Number.isFinite));
  assert.ok(position.maxHeight > 0, 'the card retains a scrollable readable area');
  assert.ok(position.top >= viewport.top, 'card clears the upper safe area');
  const visibleHeight = Math.min(measuredHeight, position.maxHeight);
  assert.ok(position.top + visibleHeight <= viewport.height - viewport.bottom, 'the visible card clears the lower safe area');
  if (position.anchored) {
    assert.ok(target, 'anchoring needs a real visible target');
    assert.ok(position.top + visibleHeight < target.y || position.top > target.y + target.height,
      'a readable anchored card cannot cover its actual highlighted control');
  }
}

test('a native search control retains its full bounds and leaves room for a readable card below', () => {
  const actual = { x: 16, y: 132, width: 305, height: 48 };
  const target = visibleTourTarget(actual, portrait);
  assertTargetPreserved(actual, target, portrait);
  const placement = placeTourCard(portrait, target, 280);
  assertReadablePlacement(placement, 280, portrait, target);
  assert.equal(placement.anchored, true);
  assert.ok(placement.top > actual.y + actual.height);
  assert.ok(placement.maxHeight >= 280, 'ordinary copy fits without forced card scrolling');
});

test('Create and Activity tab spotlights preserve whole touch targets with cards above', () => {
  for (const actual of [{ x: 157, y: 708, width: 79, height: 56 }, { x: 236, y: 708, width: 78, height: 56 }]) {
    const target = visibleTourTarget(actual, portrait);
    assertTargetPreserved(actual, target, portrait);
    const placement = placeTourCard(portrait, target, 296);
    assertReadablePlacement(placement, 296, portrait, target);
    assert.equal(placement.anchored, true);
    assert.ok(placement.top + 296 < actual.y, 'tab labels and touch target remain visible');
  }
});

test('edge-adjacent controls remain contained without outlining the system bars', () => {
  for (const actual of [{ x: 4, y: 24, width: 48, height: 48 }, { x: 341, y: 728, width: 48, height: 48 }]) {
    const target = visibleTourTarget(actual, portrait);
    assertTargetPreserved(actual, target, portrait);
    const placement = placeTourCard(portrait, target, 260);
    assertReadablePlacement(placement, 260, portrait, target);
  }
});

test('missing, stale, clipped and nonfinite target measurements use safe unanchored copy', () => {
  const unavailable = [
    null,
    { x: -20, y: 100, width: 48, height: 48 },
    { x: 365, y: 100, width: 48, height: 48 },
    { x: 16, y: 12, width: 305, height: 48 },
    { x: 16, y: 760, width: 305, height: 48 },
    { x: 16, y: 920, width: 305, height: 48 },
    { x: NaN, y: 100, width: 48, height: 48 },
    { x: 16, y: Infinity, width: 48, height: 48 },
    { x: 16, y: 100, width: -48, height: 48 },
    { x: 16, y: 100, width: 0, height: 48 },
    { x: 16, y: 100, width: 48, height: NaN },
  ];
  for (const measurement of unavailable) {
    const target = visibleTourTarget(measurement, portrait);
    assert.equal(target, null);
    const placement = placeTourCard(portrait, target, 320);
    assert.equal(placement.anchored, false);
    assertReadablePlacement(placement, 320, portrait, target);
    assert.ok(placement.maxHeight >= 320, 'fallback retains the available normal-size explanation');
  }
});

test('a funding action in the lower viewport chooses a nonoverlapping card above it', () => {
  const actual = { x: 28, y: 582, width: 337, height: 48 };
  const target = visibleTourTarget(actual, portrait);
  assertTargetPreserved(actual, target, portrait);
  const placement = placeTourCard(portrait, target, 330);
  assert.equal(placement.anchored, true);
  assertReadablePlacement(placement, 330, portrait, target);
  assert.ok(placement.top + 330 < actual.y);
});

test('large text that cannot fit beside a target gets bounded unanchored scrolling space', () => {
  const target = visibleTourTarget({ x: 28, y: 345, width: 337, height: 56 }, portrait);
  for (const textHeight of [500, 900, 1400]) {
    const placement = placeTourCard(portrait, target, textHeight);
    assert.equal(placement.anchored, false, 'do not pretend a covered control is visibly spotlighted');
    assertReadablePlacement(placement, textHeight, portrait, target);
    assert.ok(placement.maxHeight >= 500, 'long copy has useful scrollable space');
  }
});

test('compact, portrait and landscape layouts either preserve the full target or fall back readably', () => {
  for (const viewport of [
    { width: 320, height: 568, top: 24, bottom: 24 },
    portrait,
    { width: 800, height: 393, top: 24, bottom: 24 },
  ]) {
    const actual = { x: viewport.width / 5 * 2, y: viewport.height - viewport.bottom - 60, width: viewport.width / 5, height: 48 };
    const target = visibleTourTarget(actual, viewport);
    assertTargetPreserved(actual, target, viewport);
    for (const textHeight of [240, 360, 620, 1100]) {
      const placement = placeTourCard(viewport, target, textHeight);
      assertReadablePlacement(placement, textHeight, viewport, target);
      if (!placement.anchored) assert.ok(placement.maxHeight >= Math.min(textHeight, 200), 'fallback keeps controls reachable through card scrolling');
    }
  }
});

test('orientation changes reject an old offscreen measurement until a fresh native measurement arrives', () => {
  const landscape = { width: 800, height: 393, top: 24, bottom: 24 };
  const oldPortraitTab = { x: 157, y: 708, width: 79, height: 56 };
  assert.equal(visibleTourTarget(oldPortraitTab, landscape), null);
  assertReadablePlacement(placeTourCard(landscape, null, 420), 420, landscape, null);
  const currentLandscapeTab = { x: 320, y: 309, width: 160, height: 48 };
  const target = visibleTourTarget(currentLandscapeTab, landscape);
  assertTargetPreserved(currentLandscapeTab, target, landscape);
  const placement = placeTourCard(landscape, target, 220);
  assert.equal(placement.anchored, true);
  assertReadablePlacement(placement, 220, landscape, target);
});
