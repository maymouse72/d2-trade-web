import assert from "node:assert/strict";
import test from "node:test";
import { calculateAmazonImmolationCadence, getAmazonImmolationCadenceBreakpointRows } from "../amazon-immolation-cadence.ts";
import { calculateIAS } from "../calculate.ts";

test("Immolation Arrow cadence adds D2R 15-frame local delay after scaled bow action frame", () => {
  const bow = calculateAmazonImmolationCadence({ totalIAS: 0, weaponSpeedModifier: 0, actionFrame: 6 });
  const xbow = calculateAmazonImmolationCadence({ totalIAS: 0, weaponSpeedModifier: 0, actionFrame: 9 });
  const fast = calculateAmazonImmolationCadence({ totalIAS: 456, weaponSpeedModifier: 0, actionFrame: 6 });
  assert.deepEqual([bow?.actionFrame, bow?.intervalFrames], [6, 21]);
  assert.deepEqual([xbow?.actionFrame, xbow?.intervalFrames], [9, 24]);
  assert.deepEqual([fast?.actionFrame, fast?.intervalFrames], [4, 19]);
});

test("cadence breakpoint rows only include interval changes", () => {
  const rows = getAmazonImmolationCadenceBreakpointRows({ weaponSpeedModifier: 0, actionFrame: 6 }, 456);
  assert.deepEqual(rows[0], { ias: 0, fullAnimationFrames: 21 });
  assert.equal(rows.at(-1)?.fullAnimationFrames, 19);
  assert.ok(rows.every((row, i) => i === 0 || rows[i - 1]!.fullAnimationFrames > row.fullAnimationFrames));
});

test("calculator exposes cadence separately from the ordinary attack animation", () => {
  const result = calculateIAS({ characterClass: "AMAZON", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1",
    skill: "AMAZON_IMMOLATION_ARROW", weaponCode: "6sb", weaponIAS: 0, offWeaponIAS: 0 });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.fullAnimationFrames, 14);
  assert.equal(result.attackCadence?.intervalFrames, 22);
  assert.equal(result.attacksPerSecond, 25 / 22);
});
