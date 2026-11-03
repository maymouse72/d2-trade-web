import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { evaluateIASSupport } from "../support-policy.ts";
import { BARBARIAN_GOLDEN_ROWS, getBarbarianGoldenFrameCount } from "../barbarian-golden.ts";
import { getCalculatorViewModelFromParts, getWeaponBreakpoints } from "../ui-model.ts";
import { IAS_SUPPORTED_CLASSES } from "../class-registry.ts";

const base = { characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_NORMAL_ATTACK", weaponCode: "crs", weaponIAS: 0, offWeaponIAS: 0 };

test("class registry covers all seven target classes and isolates Barbarian MVP", () => {
  assert.equal(IAS_SUPPORTED_CLASSES.length, 7);
  assert.deepEqual(BARBARIAN_GOLDEN_ROWS.map(row => row.IAS), [0, 9, 18, 30, 48, 75, 125]);
  assert.ok(BARBARIAN_GOLDEN_ROWS.every(row => row.characterClass === "BARBARIAN" && row.WSM === 0 && row.animationClass === "BAA11HS"));
});

test("Barbarian 1HS WSM 0 output matches every published IAS interval", () => {
  const published = [[0, 15], [9, 14], [18, 13], [30, 12], [48, 11], [75, 10], [125, 9]] as const;
  for (let ias = 0; ias <= 200; ias++) {
    const expected = [...published].reverse().find(([start]) => ias >= start)![1];
    assert.equal(getBarbarianGoldenFrameCount(ias), expected, `Golden IAS ${ias}`);
    const result = calculateIAS({ ...base, weaponIAS: ias });
    assert.equal(result.status, "SUPPORTED", `IAS ${ias}`);
    assert.equal(result.fullAnimationFrames, expected, `IAS ${ias}`);
  }
  assert.equal(calculateIAS({ ...base, weaponIAS: 0 }).trace?.framesPerDirection, 16);
});

test("only verified Barbarian weapon, animation, form, range, and no-modifier conditions calculate", () => {
  assert.equal(evaluateIASSupport(base).status, "SUPPORTED");
  for (const invalid of [
    { ...base, weaponCode: "7cr" }, { ...base, weaponCode: "whm" }, { ...base, animation: "A2" },
    { ...base, characterForm: "WEREWOLF" }, { ...base, fanaticismLevel: 1 }, { ...base, skillIAS: 1 },
    { ...base, buffIAS: 1 }, { ...base, debuffIAS: 1 }, { ...base, weaponIAS: 201 },
    { ...base, skill: "ZEAL" }, { ...base, characterClass: "AMAZON" },
  ]) {
    assert.notEqual(calculateIAS(invalid).status, "SUPPORTED", JSON.stringify(invalid));
    assert.equal(calculateIAS(invalid).fullAnimationFrames, null);
  }
  assert.equal(getCalculatorViewModelFromParts("0", "201", { characterClass: "BARBARIAN", weaponCode: "crs", animation: "A1", skill: "BARBARIAN_NORMAL_ATTACK" }).status, "INVALID_INPUT");
});

test("Barbarian breakpoint UI is independent and leaves Paladin Golden unchanged", () => {
  assert.deepEqual(getWeaponBreakpoints("crs", "A1", "BARBARIAN_NORMAL_ATTACK"), [
    { ias: 0, fullAnimationFrames: 15 }, { ias: 9, fullAnimationFrames: 14 }, { ias: 18, fullAnimationFrames: 13 },
    { ias: 30, fullAnimationFrames: 12 }, { ias: 48, fullAnimationFrames: 11 }, { ias: 75, fullAnimationFrames: 10 }, { ias: 125, fullAnimationFrames: 9 },
  ]);
  assert.equal(calculateIAS({ characterClass: "PALADIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "NORMAL_ATTACK", weaponCode: "crs", weaponIAS: 40, offWeaponIAS: 0 }).fullAnimationFrames, 11);
});
