import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";

test("Dragon Flight has fixed 23-frame timing across supported melee weapons", () => {
  for (const weaponCode of ["crs", "7cr", "9tw"]) {
    const result = calculateIAS({ characterClass: "ASSASSIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "ASSASSIN_DRAGON_FLIGHT", weaponCode, weaponIAS: 0, offWeaponIAS: 0, burstOfSpeedLevel: 0 });
    assert.equal(result.status, "REFERENCE_BASED");
    assert.equal(result.fullAnimationFrames, 23);
    assert.equal(result.nextBreakpoint, null);
  }
});

test("Dragon Flight speed inputs are rejected because its attack timing is fixed", () => {
  const result = calculateIAS({ characterClass: "ASSASSIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "ASSASSIN_DRAGON_FLIGHT", weaponCode: "9tw", weaponIAS: 1, offWeaponIAS: 0 });
  assert.equal(result.status, "INVALID_INPUT");
});
