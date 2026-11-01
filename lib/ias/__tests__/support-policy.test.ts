import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { evaluateIASSupport } from "../support-policy.ts";

const base = {
  characterClass: "PALADIN",
  characterForm: "HUMAN",
  attackMode: "NORMAL",
  animation: "A1",
  weaponCode: "crs",
  weaponIAS: 40,
  offWeaponIAS: 0,
};

function assertNoNumbers(input: unknown, status: string) {
  const result = calculateIAS(input);
  assert.equal(result.status, status);
  assert.equal(result.fullAnimationFrames, null);
  assert.equal(result.totalIAS, null);
  assert.equal(result.effectiveIAS, null);
  assert.equal(result.currentBreakpoint, null);
  assert.equal(result.nextBreakpoint, null);
  assert.equal(result.requiredAdditionalIAS, null);
}

test("accepts verified weapons and blocks unverified combinations", () => {
  assert.equal(evaluateIASSupport(base).status, "SUPPORTED");
  assert.equal(evaluateIASSupport({ ...base, weaponCode: "7cr" }).status, "SUPPORTED");
  assert.equal(evaluateIASSupport({ ...base, weaponCode: "whm" }).status, "SUPPORTED");
  assertNoNumbers({ ...base, animation: "A2" }, "UNVERIFIED");
  assertNoNumbers({ ...base, weaponCode: "xyz" }, "UNVERIFIED");
  assertNoNumbers({ ...base, characterClass: "AMAZON" }, "UNSUPPORTED");
  assertNoNumbers({ ...base, attackMode: "ZEAL" }, "UNSUPPORTED");
  assertNoNumbers({ ...base, characterForm: "WEREWOLF" }, "UNSUPPORTED");
  assertNoNumbers({ ...base, buffIAS: 20 }, "UNVERIFIED");
});

test("rejects malformed and out-of-range values", () => {
  const invalidCases: unknown[] = [
    { ...base, weaponIAS: -1 },
    { ...base, weaponIAS: 1.5 },
    { ...base, weaponIAS: Number.NaN },
    { ...base, weaponIAS: Number.POSITIVE_INFINITY },
    { ...base, weaponIAS: "40" },
    { ...base, weaponIAS: 201 },
    { ...base, weaponIAS: 200, offWeaponIAS: 1 },
    { ...base, weaponCode: "7cr", weaponIAS: 201 },
    { ...base, weaponCode: "whm", weaponIAS: 318 },
    { ...base, weaponCode: "whm", weaponIAS: 317, offWeaponIAS: 1 },
    { ...base, weaponCode: "!!!" },
    { ...base, weaponCode: undefined },
    { ...base, characterClass: undefined },
    null,
  ];

  for (const invalid of invalidCases) assertNoNumbers(invalid, "INVALID_INPUT");
});

test("same input returns a stable result", () => {
  assert.deepEqual(calculateIAS(base), calculateIAS(base));
});
