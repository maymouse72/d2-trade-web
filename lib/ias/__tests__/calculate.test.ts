import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";

function input(totalIAS: number) {
  return {
    characterClass: "PALADIN",
    characterForm: "HUMAN",
    attackMode: "NORMAL",
    animation: "A1",
    weaponCode: "crs",
    weaponIAS: totalIAS,
    offWeaponIAS: 0,
  };
}

test("returns supported full-animation counts and intermediate integers", () => {
  const cases = [
    [0, 0, 0, 256, 14],
    [9, 8, 8, 276, 13],
    [19, 16, 16, 296, 12],
    [32, 25, 25, 320, 11],
    [54, 37, 37, 350, 10],
    [86, 50, 50, 384, 9],
    [152, 67, 67, 427, 8],
    [200, 75, 75, 448, 8],
  ] as const;

  for (const [ias, ieias, eias, speedIncrease, frames] of cases) {
    const result = calculateIAS(input(ias));
    assert.equal(result.status, "SUPPORTED", `IAS ${ias}`);
    assert.equal(result.fullAnimationFrames, frames, `IAS ${ias}`);
    assert.equal(result.totalIAS, ias);
    assert.equal(result.effectiveIAS, eias);
    assert.equal(result.trace?.itemEffectiveIAS, ieias);
    assert.equal(result.trace?.eiasRaw, eias);
    assert.equal(result.trace?.eiasApplied, eias);
    assert.equal(result.trace?.speedIncrease, speedIncrease);
  }
});

test("sums weapon and off-weapon IAS before diminishing returns", () => {
  const result = calculateIAS({ ...input(0), weaponIAS: 20, offWeaponIAS: 34 });
  assert.equal(result.status, "SUPPORTED");
  assert.equal(result.totalIAS, 54);
  assert.equal(result.fullAnimationFrames, 10);
  assert.equal(result.trace?.itemEffectiveIAS, 37);
});

test("refuses to expose numbers if an independently expected row is absent or disagrees", () => {
  const result = calculateIAS(input(201));
  assert.equal(result.status, "INVALID_INPUT");
  assert.equal(result.fullAnimationFrames, null);
});
