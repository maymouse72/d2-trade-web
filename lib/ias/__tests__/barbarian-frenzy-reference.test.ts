import assert from "node:assert/strict";
import test from "node:test";
import { calculateBarbarianFrenzyReference, getBarbarianFrenzyBreakpointRows, getBarbarianFrenzyMaxSIAS } from "../barbarian-frenzy-reference.ts";
import { calculateIAS } from "../calculate.ts";

test("Frenzy applies dual-wield averages and player sequence adjustment", () => {
  const result = calculateBarbarianFrenzyReference({
    primaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 0 },
    secondaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 0 },
    gearIAS: 0,
    frenzyBuffSIAS: 0,
  });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.deepEqual(result.handEffectiveIAS, [0, 0]);
  assert.equal(result.effectiveWSM, -30);
  assert.equal(result.effectiveIAS, 0);
  assert.equal(result.sequenceFrames, 17);
  assert.equal(result.swingsPerSecond, 50 / 17);
});

test("Frenzy uses each weapon's IAS before averaging hand IEIAS", () => {
  const result = calculateBarbarianFrenzyReference({
    primaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 40 },
    secondaryWeapon: { weaponSpeedModifier: 0, weaponIAS: 20 },
    gearIAS: 20,
    frenzyBuffSIAS: 42,
  });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.deepEqual(result.handEffectiveIAS, [40, 30]);
  assert.equal(result.effectiveWSM, -15);
  assert.equal(result.effectiveIAS, 62);
  assert.equal(result.sequenceFrames, 11);
});

test("invalid weapon or Frenzy modifier inputs return no numeric result", () => {
  const bad = calculateBarbarianFrenzyReference({
    primaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 121 },
    secondaryWeapon: { weaponSpeedModifier: 0, weaponIAS: 0 },
    gearIAS: 0,
    frenzyBuffSIAS: 42,
  });
  assert.equal(bad.status, "INVALID_INPUT");
  assert.equal(bad.sequenceFrames, null);
  const overCap = calculateBarbarianFrenzyReference({
    primaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 0 },
    secondaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 0 },
    gearIAS: 0,
    frenzyBuffSIAS: 51,
  });
  assert.equal(overCap.status, "INVALID_INPUT");
  assert.equal(overCap.sequenceFrames, null);
});

test("published Frenzy SIAS ceiling follows the level curve and breakpoint table changes by gear IAS", () => {
  assert.equal(getBarbarianFrenzyMaxSIAS(1), 7);
  assert.equal(getBarbarianFrenzyMaxSIAS(20), 42);
  assert.equal(getBarbarianFrenzyMaxSIAS(30), 45);
  assert.equal(getBarbarianFrenzyMaxSIAS(0), null);
  const rows = getBarbarianFrenzyBreakpointRows({
    primaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 0 },
    secondaryWeapon: { weaponSpeedModifier: -30, weaponIAS: 0 },
    frenzyBuffSIAS: 0,
  });
  assert.equal(rows[0]?.sequenceFrames, 17);
  assert.ok(rows.some((row) => row.gearIAS > 0 && row.sequenceFrames < 17));
});

test("Frenzy is integrated for two legal Barbarian weapons and only its published endpoint states", () => {
  const base = calculateIAS({ characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_FRENZY", skillLevel: 20, frenzyBuffSIAS: 0, weaponCode: "7cr", weaponIAS: 0, secondaryWeaponCode: "whm", secondaryWeaponIAS: 0, offWeaponIAS: 0 });
  assert.equal(base.status, "REFERENCE_BASED");
  assert.equal(base.fullAnimationFrames, 23);
  assert.equal(base.attackSequence?.hitCount, 2);
  const charged = calculateIAS({ characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_FRENZY", skillLevel: 20, frenzyBuffSIAS: 42, weaponCode: "7cr", weaponIAS: 0, secondaryWeaponCode: "whm", secondaryWeaponIAS: 0, offWeaponIAS: 0 });
  assert.equal(charged.status, "REFERENCE_BASED");
  assert.equal(charged.fullAnimationFrames, 15);
  assert.equal(calculateIAS({ characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_FRENZY", skillLevel: 20, frenzyBuffSIAS: 20, weaponCode: "7cr", weaponIAS: 0, secondaryWeaponCode: "whm", secondaryWeaponIAS: 0, offWeaponIAS: 0 }).status, "UNSUPPORTED");
  assert.equal(calculateIAS({ characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_FRENZY", skillLevel: 20, frenzyBuffSIAS: 42, weaponCode: "7cr", weaponIAS: 0, secondaryWeaponCode: "bow", secondaryWeaponIAS: 0, offWeaponIAS: 0 }).status, "UNSUPPORTED");
});
