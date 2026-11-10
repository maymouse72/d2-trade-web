import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDruidWerewolfFurySequence,
  calculateDruidShapeshiftStandardAttack,
  druidReferenceEffectiveIAS,
  getDruidMaulMaxCharges,
  getDruidMaulSIAS,
} from "../druid-shapeshift-reference.ts";
import { calculateIAS } from "../calculate.ts";

const druidStaffHumanProfile = {
  // D2R.org Druid table: Staff or polearm, Human A1, WSM 0, FPD 17, speed 256.
  framesPerDirection: 17,
  animationSpeed: 256,
  startingFrame: 0,
} as const;

test("diminishing-return IAS matches published reference examples", () => {
  assert.equal(druidReferenceEffectiveIAS(0), 0);
  assert.equal(druidReferenceEffectiveIAS(20), 17);
  assert.equal(druidReferenceEffectiveIAS(40), 30);
  assert.equal(druidReferenceEffectiveIAS(456), 95);
  assert.equal(druidReferenceEffectiveIAS(457), null);
});

test("wereform standard attack uses the form FPD ratio against the provided Human A1 profile", () => {
  const wolf = calculateDruidShapeshiftStandardAttack({
    form: "WEREWOLF", weaponSpeedModifier: 0, totalIAS: 0,
    humanA1Profile: druidStaffHumanProfile,
  });
  const bear = calculateDruidShapeshiftStandardAttack({
    form: "WEREBEAR", weaponSpeedModifier: 0, totalIAS: 0,
    humanA1Profile: druidStaffHumanProfile,
  });

  assert.equal(wolf.status, "REFERENCE_BASED");
  assert.equal(wolf.framesPerAttack, 17);
  assert.equal(wolf.wereformFramesPerDirection, 13);
  assert.equal(bear.status, "REFERENCE_BASED");
  assert.equal(bear.framesPerAttack, 17);
  assert.equal(bear.wereformFramesPerDirection, 12);
});

test("published Druid Human staff/polearm sample changes from 16 to 15 frames at 8 IAS", () => {
  const result = calculateDruidShapeshiftStandardAttack({
    form: "WEREWOLF", weaponSpeedModifier: 0, totalIAS: 8,
    humanA1Profile: druidStaffHumanProfile,
  });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.effectiveIAS, 7);
  assert.equal(result.framesPerAttack, 15);
});

test("skill and other speed modifiers are additive before the wereform cap", () => {
  const result = calculateDruidShapeshiftStandardAttack({
    form: "WEREWOLF", weaponSpeedModifier: 0, totalIAS: 0,
    humanA1Profile: druidStaffHumanProfile,
    skillIAS: 68, buffIAS: 10,
  });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.effectiveIASAfterModifiers, 78);
  assert.ok(result.framesPerAttack! < 16);
});

test("invalid or absent human animation profiles never produce numeric frames", () => {
  for (const input of [
    { form: "WEREWOLF", weaponSpeedModifier: 0, totalIAS: 0, humanA1Profile: undefined },
    { form: "WEREBEAR", weaponSpeedModifier: 0, totalIAS: 0, humanA1Profile: { framesPerDirection: 0, animationSpeed: 256, startingFrame: 0 } },
    { form: "WEREWOLF", weaponSpeedModifier: 0, totalIAS: 457, humanA1Profile: druidStaffHumanProfile },
  ] as const) {
    const result = calculateDruidShapeshiftStandardAttack(input as never);
    assert.equal(result.status, "INVALID_INPUT");
    assert.equal(result.framesPerAttack, null);
  }
});

test("Werewolf Fury sequence matches Warren1001 fixed Phase Blade reference vectors", () => {
  // Warren1001 v1.2.6 Druid/Werewolf/Fury/Phase Blade/-30 WSM, Werewolf skill 0.
  // Reference notation uses parentheses for repeated middle intervals.
  const reference: ReadonlyArray<readonly [number, readonly number[]]> = [
    [0, [7, 7, 6, 6, 12]],
    [6, [7, 7, 6, 6, 11]],
    [20, [6, 6, 5, 5, 10]],
    [63, [5, 6, 5, 5, 9]],
    [208, [4, 5, 4, 4, 7]],
  ];

  for (const [totalIAS, expectedIntervals] of reference) {
    const result = calculateDruidWerewolfFurySequence({
      form: "WEREWOLF",
      weaponSpeedModifier: -30,
      totalIAS,
      humanA1Profile: { framesPerDirection: 19, animationSpeed: 256, startingFrame: 0 },
    });
    assert.equal(result.status, "REFERENCE_BASED", `IAS ${totalIAS}`);
    assert.deepEqual(result.hitFrameIntervals, expectedIntervals, `IAS ${totalIAS}`);
    assert.equal(result.totalSequenceFrames, expectedIntervals.reduce((sum, value) => sum + value, 0));
  }
});

test("Fury sequence blocks Werebear and preserves invalid-input blocking", () => {
  const bear = calculateDruidWerewolfFurySequence({
    form: "WEREBEAR", weaponSpeedModifier: -30, totalIAS: 0,
    humanA1Profile: { framesPerDirection: 19, animationSpeed: 256, startingFrame: 0 },
  });
  assert.equal(bear.status, "UNSUPPORTED");
  assert.equal(bear.hitFrameIntervals, null);
  assert.equal(bear.totalSequenceFrames, null);

  const invalid = calculateDruidWerewolfFurySequence({
    form: "WEREWOLF", weaponSpeedModifier: -30, totalIAS: 457,
    humanA1Profile: { framesPerDirection: 19, animationSpeed: 256, startingFrame: 0 },
  });
  assert.equal(invalid.status, "INVALID_INPUT");
  assert.equal(invalid.hitFrameIntervals, null);
  assert.equal(invalid.totalSequenceFrames, null);
});

test("catalog extreme crossbow WSM values remain valid wereform inputs", () => {
  for (const weaponSpeedModifier of [-60, -40]) {
    const result = calculateDruidShapeshiftStandardAttack({
      form: "WEREWOLF", weaponSpeedModifier, totalIAS: 0, humanA1Profile: druidStaffHumanProfile,
    });
    assert.equal(result.status, "REFERENCE_BASED");
    assert.ok(result.framesPerAttack !== null);
  }
});

test("Maul charge caps and SIAS follow skill level and active charge count", () => {
  assert.equal(getDruidMaulMaxCharges(1), 3);
  assert.equal(getDruidMaulMaxCharges(2), 4);
  assert.equal(getDruidMaulMaxCharges(20), 13);
  assert.equal(getDruidMaulMaxCharges(60), 13);
  assert.equal(getDruidMaulMaxCharges(0), null);
  assert.equal(getDruidMaulSIAS(20, 13), 39);
  assert.equal(getDruidMaulSIAS(1, 4), null);
});

test("IAS-6 Druid reference attacks calculate with form-specific modifiers and block invalid form/charges", () => {
  for (const skill of ["DRUID_FERAL_RAGE", "DRUID_RABIES", "DRUID_HUNGER"] as const) {
    const wolf = calculateIAS({ characterClass: "DRUID", characterForm: "WEREWOLF", attackMode: "NORMAL", animation: "A1", skill, skillLevel: 4, weaponCode: "7cr", weaponIAS: 0, offWeaponIAS: 0 });
    assert.equal(wolf.status, "REFERENCE_BASED", skill);
    assert.ok(wolf.fullAnimationFrames !== null, skill);
  }
  for (const skill of ["DRUID_FIRE_CLAWS", "DRUID_HUNGER"] as const) {
    const bear = calculateIAS({ characterClass: "DRUID", characterForm: "WEREBEAR", attackMode: "NORMAL", animation: "A1", skill, skillLevel: 4, weaponCode: "7cr", weaponIAS: 0, offWeaponIAS: 0 });
    assert.equal(bear.status, "REFERENCE_BASED", skill);
    assert.ok(bear.fullAnimationFrames !== null, skill);
  }

  const bearMaul = calculateIAS({ characterClass: "DRUID", characterForm: "WEREBEAR", attackMode: "NORMAL", animation: "A1", skill: "DRUID_MAUL", skillLevel: 20, maulCharges: 13, weaponCode: "7cr", weaponIAS: 0, offWeaponIAS: 0 });
  assert.equal(bearMaul.status, "REFERENCE_BASED");
  assert.ok(bearMaul.fullAnimationFrames !== null);
  assert.equal(calculateIAS({ characterClass: "DRUID", characterForm: "WEREBEAR", attackMode: "NORMAL", animation: "A1", skill: "DRUID_MAUL", skillLevel: 1, maulCharges: 4, weaponCode: "7cr", weaponIAS: 0, offWeaponIAS: 0 }).status, "INVALID_INPUT");
  assert.equal(calculateIAS({ characterClass: "DRUID", characterForm: "WEREWOLF", attackMode: "NORMAL", animation: "A1", skill: "DRUID_MAUL", skillLevel: 20, weaponCode: "7cr", weaponIAS: 0, offWeaponIAS: 0 }).status, "UNSUPPORTED");
});
