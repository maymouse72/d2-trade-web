import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { calculateBarbarianWhirlwind, getBarbarianWhirlwindBreakpointRows } from "../barbarian-whirlwind.ts";

test("Whirlwind single-weapon interval follows the Barbarian A1 attack frame after equipment IAS", () => {
  const base = calculateBarbarianWhirlwind({ primaryWeapon: { code: "axe", weaponIAS: 0, weaponMode: "ONE_HAND" }, gearIAS: 0 });
  const faster = calculateBarbarianWhirlwind({ primaryWeapon: { code: "axe", weaponIAS: 0, weaponMode: "ONE_HAND" }, gearIAS: 13 });
  assert.equal(base.status, "REFERENCE_BASED");
  assert.equal(base.hitIntervalFrames, 17);
  assert.equal(faster.hitIntervalFrames, 15);
});

test("dual-wield Whirlwind averages both weapon frames and rounds up", () => {
  const base = calculateBarbarianWhirlwind({
    primaryWeapon: { code: "7cr", weaponIAS: 0, weaponMode: "ONE_HAND" },
    secondaryWeapon: { code: "whm", weaponIAS: 0, weaponMode: "ONE_HAND" }, gearIAS: 0,
  });
  const geared = calculateBarbarianWhirlwind({
    primaryWeapon: { code: "7cr", weaponIAS: 0, weaponMode: "ONE_HAND" },
    secondaryWeapon: { code: "whm", weaponIAS: 0, weaponMode: "ONE_HAND" }, gearIAS: 13,
  });
  assert.deepEqual([base.primaryFrames, base.secondaryFrames, base.hitIntervalFrames], [12, 20, 16]);
  assert.deepEqual([geared.primaryFrames, geared.secondaryFrames, geared.hitIntervalFrames], [11, 17, 14]);
});

test("integrated Whirlwind returns interval and gear-IAS breakpoints without a full-spin duration claim", () => {
  const result = calculateIAS({
    characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1",
    skill: "BARBARIAN_WHIRLWIND", weaponCode: "7cr", secondaryWeaponCode: "whm",
    weaponIAS: 0, secondaryWeaponIAS: 0, offWeaponIAS: 0,
  });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.fullAnimationFrames, 16);
  assert.equal(result.attackSequence?.hitCount, 2);
  assert.equal(result.attackSequence?.label, "소용돌이 양손 타격 간격");
  assert.ok(getBarbarianWhirlwindBreakpointRows({
    primaryWeapon: { code: "7cr", weaponIAS: 0, weaponMode: "ONE_HAND" },
    secondaryWeapon: { code: "whm", weaponIAS: 0, weaponMode: "ONE_HAND" },
  }).some((row) => row.gearIAS === 11 && row.hitIntervalFrames === 14));
});

test("Whirlwind rejects malformed IAS, unknown WSM, and two simultaneous two-hand weapons", () => {
  assert.equal(calculateBarbarianWhirlwind({ primaryWeapon: { code: "7cr", weaponIAS: 0, weaponMode: "ONE_HAND" }, gearIAS: 457 }).status, "INVALID_INPUT");
  assert.equal(calculateBarbarianWhirlwind({ primaryWeapon: { code: "xyz", weaponIAS: 0, weaponMode: "ONE_HAND" }, gearIAS: 0 }).status, "UNSUPPORTED");
  assert.equal(calculateBarbarianWhirlwind({
    primaryWeapon: { code: "7cs", weaponIAS: 0, weaponMode: "TWO_HAND" },
    secondaryWeapon: { code: "7cs", weaponIAS: 0, weaponMode: "ONE_HAND" }, gearIAS: 0,
  }).status, "UNSUPPORTED");
});
