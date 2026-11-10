import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { getReferenceAmazonJabBreakpointRows, getReferenceNormalBreakpointRows } from "../reference-normal-attack.ts";
import { getAmazonFendBreakpointRows } from "../amazon-fend.ts";
import { getAmazonStrafeBreakpointRows } from "../amazon-strafe.ts";
import { getAmazonThrowBreakpointRows } from "../amazon-throw.ts";
import { getDruidWerewolfSIAS } from "../druid-shapeshift-reference.ts";

function input(characterClass: string, weaponCode = "crs") {
  return { characterClass, characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: characterClass === "BARBARIAN" ? "BARBARIAN_NORMAL_ATTACK" : "NORMAL_ATTACK", weaponCode, weaponIAS: 0, offWeaponIAS: 0 };
}

test("reference-based normal attack profiles cover all seven requested classes", () => {
  const cases = [
    ["AMAZON", "6sb", 14],
    ["ASSASSIN", "7tw", 10],
    ["BARBARIAN", "axe", 17],
    ["DRUID", "crs", 18],
    ["NECROMANCER", "crs", 18],
    ["PALADIN", "6sb", 16],
    ["SORCERESS", "ob1", 16],
  ] as const;
  for (const [characterClass, weaponCode, expectedFrames] of cases) {
    const result = calculateIAS(input(characterClass, weaponCode));
    assert.equal(result.status, "REFERENCE_BASED", `${characterClass}/${weaponCode}`);
    assert.equal(result.fullAnimationFrames, expectedFrames, `${characterClass}/${weaponCode}`);
    assert.equal(result.reasonCode, "REFERENCE_BASED_RESULT");
  }
});

test("Barbarian Concentrate, Berserk, Bash, and Stun use the documented standard A1 weapon timing", () => {
  for (const skill of ["BARBARIAN_CONCENTRATE", "BARBARIAN_BERSERK", "BARBARIAN_BASH", "BARBARIAN_STUN"]) {
    const result = calculateIAS({ ...input("BARBARIAN", "7cr"), skill });
    assert.equal(result.status, "REFERENCE_BASED", skill);
    assert.equal(result.fullAnimationFrames, 12, skill);
  }
});

test("reference breakpoints are complete, sorted and match calculation transitions", () => {
  const rows = getReferenceNormalBreakpointRows("AMAZON", "6sb", "NORMAL_ATTACK", 456);
  assert.ok(rows.length > 0);
  assert.equal(rows[0].ias, 0);
  assert.ok(rows.every((row, index) => index === 0 || row.ias > rows[index - 1].ias));
  for (const row of rows) assert.equal(calculateIAS({ ...input("AMAZON", "6sb"), weaponIAS: row.ias }).fullAnimationFrames, row.fullAnimationFrames);
});

test("unknown WSM, unsupported forms, unverified animations and incompatible class-only weapons do not produce numbers", () => {
  for (const candidate of [
    { ...input("AMAZON", "lbw") },
    { ...input("DRUID"), characterForm: "WEREWOLF" },
    { ...input("SORCERESS"), animation: "A2" },
    { ...input("NECROMANCER", "7tw") },
  ]) {
    const result = calculateIAS(candidate);
    assert.notEqual(result.status, "REFERENCE_BASED");
    assert.equal(result.fullAnimationFrames, null);
  }
});

test("Amazon Jab uses the published 1HT/2HT sequence formula and reports three hits", () => {
  const jab = (weaponCode: string, weaponIAS = 0) => calculateIAS({
    ...input("AMAZON", weaponCode), skill: "AMAZON_JAB", weaponIAS,
  });
  const javelin = jab("jav");
  const spear = jab("spr");
  assert.equal(javelin.status, "REFERENCE_BASED");
  assert.equal(javelin.fullAnimationFrames, 23);
  assert.equal(javelin.attackSequence?.hitCount, 3);
  assert.equal(javelin.trace?.framesPerDirection, 18);
  assert.equal(javelin.trace?.skillSpeedModifier, -30);
  assert.equal(spear.status, "REFERENCE_BASED");
  assert.equal(spear.fullAnimationFrames, 27);
  assert.equal(spear.trace?.framesPerDirection, 21);
  assert.notEqual(jab("6sb").status, "REFERENCE_BASED");
  assert.notEqual(jab("lbw").status, "REFERENCE_BASED");
  assert.ok((jab("jav", 40).fullAnimationFrames ?? 0) < javelin.fullAnimationFrames!);
});

test("Amazon Jab breakpoint rows match each IAS transition", () => {
  const rows = getReferenceAmazonJabBreakpointRows("jav", "ONE_HAND", 456);
  assert.ok(rows.length > 0);
  assert.equal(rows[0].ias, 0);
  assert.ok(rows.every((row, index) => index === 0 || row.ias > rows[index - 1].ias));
  for (const row of rows) {
    const result = calculateIAS({ ...input("AMAZON", "jav"), skill: "AMAZON_JAB", weaponIAS: row.ias });
    assert.equal(result.fullAnimationFrames, row.fullAnimationFrames, `IAS ${row.ias}`);
  }
});

test("Amazon Multiple Shot and Guided Arrow use the supported bow/crossbow A1 timing profile", () => {
  for (const skill of ["AMAZON_MAGIC_ARROW", "AMAZON_FIRE_ARROW", "AMAZON_COLD_ARROW", "AMAZON_MULTIPLE_SHOT", "AMAZON_EXPLODING_ARROW", "AMAZON_ICE_ARROW", "AMAZON_GUIDED_ARROW", "AMAZON_FREEZING_ARROW"]) {
    const bow = calculateIAS({ ...input("AMAZON", "6sb"), skill });
    const crossbow = calculateIAS({ ...input("AMAZON", "lxb"), skill });
    const spear = calculateIAS({ ...input("AMAZON", "spr"), skill });
    assert.equal(bow.status, "REFERENCE_BASED");
    assert.equal(bow.fullAnimationFrames, 14);
    assert.equal(crossbow.status, "REFERENCE_BASED");
    assert.equal(crossbow.fullAnimationFrames, 18);
    assert.notEqual(spear.status, "REFERENCE_BASED");
    assert.equal(spear.fullAnimationFrames, null);
  }
  const immolation = calculateIAS({ ...input("AMAZON", "6sb"), skill: "AMAZON_IMMOLATION_ARROW" });
  assert.equal(immolation.status, "REFERENCE_BASED");
  assert.equal(immolation.fullAnimationFrames, 14);
});

test("Amazon Power, Charged, and Lightning Strike use the published 1HT/2HT attack timing", () => {
  for (const skill of ["AMAZON_POWER_STRIKE", "AMAZON_CHARGED_STRIKE", "AMAZON_LIGHTNING_STRIKE"]) {
    for (const weaponCode of ["jav", "spr"]) {
      const skillResult = calculateIAS({ ...input("AMAZON", weaponCode), skill });
      const normalResult = calculateIAS(input("AMAZON", weaponCode));
      assert.equal(skillResult.status, "REFERENCE_BASED");
      assert.equal(skillResult.fullAnimationFrames, normalResult.fullAnimationFrames);
    }
    const bowResult = calculateIAS({ ...input("AMAZON", "6sb"), skill });
    assert.equal(bowResult.status, "UNSUPPORTED");
    assert.equal(bowResult.fullAnimationFrames, null);
  }
});

test("Amazon Fend two-target sequence follows published First + Last rows and breakpoint transitions", () => {
  const jav = calculateIAS({ ...input("AMAZON", "jav"), skill: "AMAZON_FEND" });
  const spear = calculateIAS({ ...input("AMAZON", "spr"), skill: "AMAZON_FEND" });
  assert.equal(jav.status, "REFERENCE_BASED");
  assert.equal(jav.fullAnimationFrames, 17);
  assert.equal(jav.attackSequence?.label, "난격 2대상 (7+10프레임)");
  assert.equal(spear.status, "REFERENCE_BASED");
  assert.equal(spear.fullAnimationFrames, 21);
  assert.equal(spear.attackSequence?.hitCount, 2);
  assert.notEqual(calculateIAS({ ...input("AMAZON", "6sb"), skill: "AMAZON_FEND" }).status, "REFERENCE_BASED");
  const rows = getAmazonFendBreakpointRows("jav", 456);
  assert.ok(rows.length > 0);
  assert.ok(rows.every((row, index) => index === 0 || row.ias > rows[index - 1].ias));
  for (const row of rows) {
    const result = calculateIAS({ ...input("AMAZON", "jav"), skill: "AMAZON_FEND", weaponIAS: row.ias });
    assert.equal(result.fullAnimationFrames, row.fullAnimationFrames, `IAS ${row.ias}`);
  }
});

test("Amazon Fend 3-12 target sequences include ordered Follow intervals", () => {
  const calc = (hitCount: number) => calculateIAS({ ...input("AMAZON", "jav"), skill: "AMAZON_FEND", hitCount });
  assert.equal(calc(3).fullAnimationFrames, 23);
  assert.equal(calc(12).fullAnimationFrames, 77);
  assert.equal(calc(12).attackSequence?.hitCount, 12);
  assert.equal(calc(1).status, "INVALID_INPUT");
  assert.equal(calc(13).status, "INVALID_INPUT");
  for (const hitCount of [3, 12]) {
    const rows = getAmazonFendBreakpointRows("jav", 456, hitCount);
    for (const row of rows) {
      const atRow = calculateIAS({ ...input("AMAZON", "jav"), skill: "AMAZON_FEND", hitCount, weaponIAS: row.ias });
      assert.equal(atRow.fullAnimationFrames, row.fullAnimationFrames, `targets ${hitCount}, IAS ${row.ias}`);
    }
  }
});

test("Amazon Strafe uses published bow/crossbow sequence tables and actual Follow interval floors", () => {
  const bow = (hitCount: number) => calculateIAS({ ...input("AMAZON", "6sb"), skill: "AMAZON_STRAFE", hitCount });
  const crossbow = (hitCount: number) => calculateIAS({ ...input("AMAZON", "lxb"), skill: "AMAZON_STRAFE", hitCount });
  assert.equal(bow(2).status, "REFERENCE_BASED");
  assert.equal(bow(2).fullAnimationFrames, 18);
  assert.equal(bow(10).fullAnimationFrames, 50);
  assert.equal(crossbow(2).fullAnimationFrames, 23);
  assert.equal(crossbow(10).fullAnimationFrames, 63);
  assert.equal(calculateIAS({ ...input("AMAZON", "crs"), skill: "AMAZON_STRAFE" }).status, "UNSUPPORTED");
  assert.equal(calculateIAS({ ...input("AMAZON", "6sb"), skill: "AMAZON_STRAFE", hitCount: 11 }).status, "INVALID_INPUT");
  const rows = getAmazonStrafeBreakpointRows("6sb", 456, 5);
  assert.ok(rows.length > 0);
  for (const row of rows) {
    const atRow = calculateIAS({ ...input("AMAZON", "6sb"), skill: "AMAZON_STRAFE", hitCount: 5, weaponIAS: row.ias });
    assert.equal(atRow.fullAnimationFrames, row.fullAnimationFrames, `IAS ${row.ias}`);
  }
});

test("Amazon javelin throw skills use the dedicated public 1HT Throw breakpoint table", () => {
  const thrown = (skill: string, ias = 0) => calculateIAS({ ...input("AMAZON", "jav"), skill, weaponIAS: ias });
  for (const skill of ["AMAZON_THROW", "AMAZON_POISON_JAVELIN", "AMAZON_PLAGUE_JAVELIN", "AMAZON_LIGHTNING_BOLT", "AMAZON_LIGHTNING_FURY"]) {
    assert.equal(thrown(skill).status, "REFERENCE_BASED");
    assert.equal(thrown(skill).fullAnimationFrames, 14);
  }
  for (const [ias, frames] of [[6, 13], [16, 12], [30, 11], [52, 10], [89, 9]]) {
    assert.equal(thrown("AMAZON_THROW", ias).fullAnimationFrames, frames);
  }
  assert.equal(calculateIAS({ ...input("AMAZON", "spr"), skill: "AMAZON_THROW" }).status, "UNSUPPORTED");
  const rows = getAmazonThrowBreakpointRows("jav", 456);
  assert.deepEqual(rows.slice(0, 6), [
    { ias: 0, fullAnimationFrames: 14 }, { ias: 6, fullAnimationFrames: 13 },
    { ias: 16, fullAnimationFrames: 12 }, { ias: 30, fullAnimationFrames: 11 },
    { ias: 52, fullAnimationFrames: 10 }, { ias: 89, fullAnimationFrames: 9 },
  ]);
});

test("Druid wereforms use the reference shape-speed engine and per-level Werewolf SIAS", () => {
  assert.equal(getDruidWerewolfSIAS(1), 20);
  assert.equal(getDruidWerewolfSIAS(4), 40);
  assert.equal(getDruidWerewolfSIAS(60), 80);
  assert.equal(getDruidWerewolfSIAS(61), null);
  const wolf = calculateIAS({ ...input("DRUID", "sst"), skill: "DRUID_WEREWOLF_NORMAL_ATTACK", characterForm: "WEREWOLF", skillIAS: 40 });
  assert.equal(wolf.status, "REFERENCE_BASED");
  assert.ok(wolf.fullAnimationFrames !== null);
  assert.ok(wolf.attacksPerSecond !== undefined);
  const bear = calculateIAS({ ...input("DRUID", "sst"), skill: "DRUID_WEREBEAR_NORMAL_ATTACK", characterForm: "WEREBEAR" });
  assert.equal(bear.status, "REFERENCE_BASED");
  assert.notEqual(bear.fullAnimationFrames, wolf.fullAnimationFrames);
  const wrongForm = calculateIAS({ ...input("DRUID", "sst"), skill: "DRUID_WEREWOLF_NORMAL_ATTACK", characterForm: "HUMAN" });
  assert.equal(wrongForm.status, "UNSUPPORTED");
  assert.equal(wrongForm.fullAnimationFrames, null);
});
