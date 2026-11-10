import assert from "node:assert/strict";
import test from "node:test";
import { calculateBarbarianDoubleThrow, getBarbarianDoubleThrowBreakpointRows } from "../barbarian-double-throw.ts";
import { calculateIAS } from "../calculate.ts";

const pair = {
  primary: { weaponSpeedModifier: -10, weaponIAS: 0 },
  secondary: { weaponSpeedModifier: 0, weaponIAS: 0 },
};

test("Double Throw uses a 12-FPD dual-wield sequence with the published −30 modifier", () => {
  const result = calculateBarbarianDoubleThrow({ ...pair, gearIAS: 0 });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.effectiveIAS, -25);
  assert.equal(result.frames, 16);
  assert.equal(result.attacksPerSecond, 50 / 16);
});

test("Double Throw breakpoints improve monotonically and respect per-slot IAS bounds", () => {
  const rows = getBarbarianDoubleThrowBreakpointRows(pair);
  assert.ok(rows.length > 1);
  assert.deepEqual(rows.slice(1).map((row) => row.frames), rows.slice(1).map((row) => row.frames).toSorted((a, b) => b - a));
  assert.equal(calculateBarbarianDoubleThrow({ ...pair, primary: { ...pair.primary, weaponIAS: 121 }, gearIAS: 0 }).status, "INVALID_INPUT");
  assert.equal(calculateBarbarianDoubleThrow({ ...pair, gearIAS: 457 }).status, "INVALID_INPUT");
});

test("Barbarian Double Throw calculator accepts repeated base types and validates both inputs", () => {
  const result = calculateIAS({ characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_DOUBLE_THROW", weaponCode: "tax", secondaryWeaponCode: "bal", weaponIAS: 0, secondaryWeaponIAS: 0, offWeaponIAS: 0 });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.fullAnimationFrames, 18);
  const sameBase = calculateIAS({ characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_DOUBLE_THROW", weaponCode: "tax", secondaryWeaponCode: "tax", weaponIAS: 0, secondaryWeaponIAS: 0, offWeaponIAS: 0 });
  assert.equal(sameBase.status, "REFERENCE_BASED");
});
