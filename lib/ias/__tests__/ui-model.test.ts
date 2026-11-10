import assert from "node:assert/strict";
import test from "node:test";
import { constrainIASInput, getCalculatorViewModel, getCalculatorViewModelFromParts, getWeaponBreakpoints, getZealBreakpoints } from "../ui-model.ts";
import { IAS_WEAPONS } from "../weapons.ts";
import { IAS_SKILLS } from "../skills.ts";

const paladin = { characterClass: "PALADIN", weaponCode: "crs", animation: "A1" };

test("UI breakpoint rows come from Golden Dataset", () => {
  assert.deepEqual(getWeaponBreakpoints("crs"), [
    { ias: 0, fullAnimationFrames: 14 }, { ias: 9, fullAnimationFrames: 13 },
    { ias: 19, fullAnimationFrames: 12 }, { ias: 32, fullAnimationFrames: 11 },
    { ias: 54, fullAnimationFrames: 10 }, { ias: 86, fullAnimationFrames: 9 },
    { ias: 152, fullAnimationFrames: 8 },
  ]);
  assert.deepEqual(getWeaponBreakpoints("7cr"), [
    { ias: 0, fullAnimationFrames: 11 }, { ias: 8, fullAnimationFrames: 10 },
    { ias: 24, fullAnimationFrames: 9 }, { ias: 54, fullAnimationFrames: 8 },
  ]);
  assert.deepEqual(getWeaponBreakpoints("whm").at(-1), { ias: 317, fullAnimationFrames: 8 });
});

test("supported result and breakpoint boundaries", () => {
  const expected = new Map([[0, 14], [8, 14], [9, 13], [18, 13], [19, 12], [31, 12], [32, 11], [40, 11], [53, 11], [54, 10], [85, 10], [86, 9], [151, 9], [152, 8], [200, 8]]);
  for (const [ias, frames] of expected) {
    const model = getCalculatorViewModel(String(ias), paladin);
    assert.equal(model.status, "SUPPORTED", `IAS ${ias}`);
    if (model.status === "SUPPORTED") assert.equal(model.result.fullAnimationFrames, frames, `IAS ${ias}`);
  }
  const forty = getCalculatorViewModel("40", paladin);
  assert.equal(forty.status, "SUPPORTED");
  if (forty.status === "SUPPORTED") assert.deepEqual([forty.result.currentBreakpoint, forty.result.nextBreakpoint, forty.result.requiredAdditionalIAS], [32, 54, 14]);
  assert.equal(getCalculatorViewModel("040", paladin).status, "SUPPORTED");
  for (const ias of [152, 200]) {
    const model = getCalculatorViewModel(String(ias), paladin);
    assert.equal(model.status, "SUPPORTED");
    if (model.status === "SUPPORTED") assert.equal(model.result.nextBreakpoint, null);
  }
});

test("empty, non-integer, negative, malformed, and out-of-range inputs have no result", () => {
  for (const value of ["", "abc", "-1", "1.5", "201", " 1", "1e2"]) {
    assert.equal(getCalculatorViewModel(value, paladin).status, "INVALID_INPUT", value);
  }
});

test("unverified animations do not return numbers and reference-based classes return marked results", () => {
  for (const selection of [{ ...paladin, animation: "A2" }]) {
    const model = getCalculatorViewModel("40", selection);
    assert.notEqual(model.status, "SUPPORTED");
    assert.equal("result" in model, false);
  }
  const amazon = getCalculatorViewModel("40", { ...paladin, characterClass: "AMAZON" });
  assert.equal(amazon.status, "REFERENCE_BASED");
  if (amazon.status === "REFERENCE_BASED") assert.equal(amazon.result.status, "REFERENCE_BASED");
  assert.deepEqual(getWeaponBreakpoints("crs", "A2"), []);
  assert.deepEqual(getWeaponBreakpoints("7cr", "A2"), []);
  assert.deepEqual(getWeaponBreakpoints("whm", "A2"), []);
});

test("Phase Blade and War Hammer results use weapon-specific bounds and rows", () => {
  const phase = getCalculatorViewModel("54", { ...paladin, weaponCode: "7cr" });
  assert.equal(phase.status, "SUPPORTED");
  if (phase.status === "SUPPORTED") assert.equal(phase.result.fullAnimationFrames, 8);
  assert.equal(getCalculatorViewModel("201", { ...paladin, weaponCode: "7cr" }).status, "INVALID_INPUT");

  const hammer316 = getCalculatorViewModel("316", { ...paladin, weaponCode: "whm" });
  assert.equal(hammer316.status, "SUPPORTED");
  if (hammer316.status === "SUPPORTED") assert.equal(hammer316.result.fullAnimationFrames, 9);
  const hammer317 = getCalculatorViewModel("317", { ...paladin, weaponCode: "whm" });
  assert.equal(hammer317.status, "SUPPORTED");
  if (hammer317.status === "SUPPORTED") assert.equal(hammer317.result.fullAnimationFrames, 8);
  assert.equal(getCalculatorViewModel("318", { ...paladin, weaponCode: "whm" }).status, "INVALID_INPUT");
});

test("Long Sword exposes only its verified Zeal sequence while other skill combinations remain blocked", () => {
  const zeal = getCalculatorViewModel("0", { characterClass: "PALADIN", weaponCode: "lsd", animation: "A1", skill: "ZEAL", hitCount: 5 });
  assert.equal(zeal.status, "SUPPORTED");
  if (zeal.status === "SUPPORTED") assert.equal(zeal.result.fullAnimationFrames, 41);
  const standard = getCalculatorViewModel("0", { characterClass: "PALADIN", weaponCode: "lsd", animation: "A1", skill: "NORMAL_ATTACK" });
  assert.notEqual(standard.status, "SUPPORTED");
  assert.deepEqual(getWeaponBreakpoints("lsd", "A1", "NORMAL_ATTACK"), []);
  assert.equal(getZealBreakpoints("lsd", 5)[0]?.ias, 0);
});

test("input control constrains values to the selected weapon's maximum", () => {
  assert.equal(constrainIASInput("318", 317), "317");
  assert.equal(constrainIASInput("319", 317), "317");
  assert.equal(constrainIASInput("201", IAS_WEAPONS["7cr"].maxIAS), "200");
  assert.equal(constrainIASInput("201", IAS_WEAPONS.crs.maxIAS), "200");
  assert.equal(constrainIASInput("317", 317), "317");
  assert.equal(constrainIASInput("", 317), "");
  assert.equal(constrainIASInput("-1", 317), "-1");
});

test("split weapon and equipment IAS preserve the legacy total IAS calculation", () => {
  const split = getCalculatorViewModelFromParts("20", "20", paladin);
  const legacy = getCalculatorViewModel("40", paladin);
  assert.equal(split.status, "SUPPORTED");
  assert.equal(legacy.status, "SUPPORTED");
  if (split.status === "SUPPORTED" && legacy.status === "SUPPORTED") {
    assert.equal(split.ias, 40);
    assert.deepEqual(split.result, legacy.result);
  }
  assert.equal(getCalculatorViewModelFromParts("201", "0", { ...paladin, weaponCode: "7cr" }).status, "INVALID_INPUT");
  assert.equal(getCalculatorViewModelFromParts("200", "1", paladin).status, "INVALID_INPUT");
});

test("supported Paladin skills return A1 results and skill-derived breakpoint rows", () => {
  for (const skill of ["SACRIFICE", "VENGEANCE", "CONVERSION"]) {
    const model = getCalculatorViewModelFromParts("20", "20", { ...paladin, skill });
    assert.equal(model.status, "SUPPORTED", skill);
    if (model.status === "SUPPORTED") assert.equal(model.result.fullAnimationFrames, 11);
    assert.deepEqual(getWeaponBreakpoints("crs", "A1", skill as "SACRIFICE" | "VENGEANCE" | "CONVERSION")[0], { ias: 0, fullAnimationFrames: 14 });
  }
  assert.equal(getCalculatorViewModelFromParts("0", "40", { ...paladin, skill: "SACRIFICE", animation: "A2" }).status, "UNVERIFIED");
  assert.deepEqual(getWeaponBreakpoints("crs", "A2"), []);
  assert.equal(getCalculatorViewModel("40", paladin).status, "SUPPORTED");
});

test("skill registry keeps evidence and UI support status separate", () => {
  assert.equal(IAS_SKILLS.NORMAL_ATTACK.supportStatus, "SUPPORTED");
  for (const code of ["SACRIFICE", "VENGEANCE", "CONVERSION"] as const) {
    assert.equal(IAS_SKILLS[code].evidenceStatus, "VERIFIED");
    assert.equal(IAS_SKILLS[code].supportStatus, "SUPPORTED");
    assert.equal(IAS_SKILLS[code].selectable, true);
    assert.equal(IAS_SKILLS[code].gameBuild, "3.3.93847");
    assert.equal(IAS_SKILLS[code].animationMode, "A1");
    assert.equal(IAS_SKILLS[code].gameplayTestStatus, "NOT_TESTED");
  }
  assert.equal(IAS_SKILLS.ZEAL.selectable, true);
  assert.equal(IAS_SKILLS.ZEAL.skillId, 106);
  assert.equal(IAS_SKILLS.ZEAL.supportStatus, "SUPPORTED");
  assert.equal(IAS_SKILLS.SMITE.selectable, true);
  assert.equal(IAS_SKILLS.SMITE.animationMode, "S1");
});

test("Assassin Dragon Claw UI model carries both claws, gear IAS, and Burst of Speed", () => {
  const selection = { characterClass: "ASSASSIN", characterForm: "HUMAN", weaponCode: "9tw", secondaryWeaponCode: "9tw", animation: "A1", skill: "ASSASSIN_DRAGON_CLAW", secondaryWeaponIAS: 0, burstOfSpeedLevel: 0 };
  const base = getCalculatorViewModelFromParts("0", "0", selection);
  assert.equal(base.status, "REFERENCE_BASED");
  if (base.status === "REFERENCE_BASED") assert.equal(base.result.fullAnimationFrames, 16);

  const geared = getCalculatorViewModelFromParts("0", "20", selection);
  assert.equal(geared.status, "REFERENCE_BASED");
  if (geared.status === "REFERENCE_BASED") assert.equal(geared.result.fullAnimationFrames, 14);

  const mismatched = getCalculatorViewModelFromParts("0", "0", { ...selection, secondaryWeaponCode: "9lw" });
  assert.equal(mismatched.status, "CONFLICTED");
  assert.equal("result" in mismatched, false);

  const overWeaponIAS = getCalculatorViewModelFromParts("121", "0", selection);
  assert.equal(overWeaponIAS.status, "INVALID_INPUT");
});

test("IAS-6 integrated class sequences are reference-based and block out-of-scope modifiers", () => {
  const talon = getCalculatorViewModelFromParts("0", "0", { characterClass: "ASSASSIN", characterForm: "HUMAN", weaponCode: "9tw", animation: "A1", skill: "ASSASSIN_DRAGON_TALON", skillLevel: 6 });
  assert.equal(talon.status, "REFERENCE_BASED");
  if (talon.status === "REFERENCE_BASED") assert.deepEqual([talon.result.fullAnimationFrames, talon.result.attackSequence?.hitCount], [14, 2]);
  const invalidTalon = getCalculatorViewModelFromParts("0", "0", { characterClass: "ASSASSIN", characterForm: "HUMAN", weaponCode: "9tw", animation: "A1", skill: "ASSASSIN_DRAGON_TALON", skillLevel: 31 });
  assert.equal(invalidTalon.status, "INVALID_INPUT");

  const fury = getCalculatorViewModelFromParts("0", "0", { characterClass: "DRUID", characterForm: "WEREWOLF", weaponCode: "7cr", animation: "A1", skill: "DRUID_WEREWOLF_FURY", skillLevel: 1, skillIAS: 20 });
  assert.equal(fury.status, "REFERENCE_BASED");
  if (fury.status === "REFERENCE_BASED") assert.deepEqual([fury.result.fullAnimationFrames, fury.result.attackSequence?.hitCount], [32, 5]);
  assert.equal(getCalculatorViewModelFromParts("0", "0", { characterClass: "DRUID", characterForm: "WEREBEAR", weaponCode: "7cr", animation: "A1", skill: "DRUID_WEREWOLF_FURY", skillLevel: 1, skillIAS: 20 }).status, "UNSUPPORTED");

  const doubleSwing = getCalculatorViewModelFromParts("0", "0", { characterClass: "BARBARIAN", characterForm: "HUMAN", weaponCode: "7cr", secondaryWeaponCode: "whm", animation: "A1", skill: "BARBARIAN_DOUBLE_SWING" });
  assert.equal(doubleSwing.status, "REFERENCE_BASED");
  if (doubleSwing.status === "REFERENCE_BASED") assert.deepEqual([doubleSwing.result.fullAnimationFrames, doubleSwing.result.attackSequence?.hitCount], [14, 2]);
  assert.equal(getCalculatorViewModelFromParts("0", "20", { characterClass: "BARBARIAN", characterForm: "HUMAN", weaponCode: "7cr", secondaryWeaponCode: "whm", animation: "A1", skill: "BARBARIAN_DOUBLE_SWING" }).status, "CONFLICTED");

  const poisonDagger = getCalculatorViewModelFromParts("0", "0", { characterClass: "NECROMANCER", characterForm: "HUMAN", weaponCode: "dgr", animation: "A1", skill: "NECROMANCER_POISON_DAGGER" });
  assert.equal(poisonDagger.status, "REFERENCE_BASED");
  if (poisonDagger.status === "REFERENCE_BASED") assert.ok(poisonDagger.result.fullAnimationFrames !== null);
  assert.equal(getCalculatorViewModelFromParts("0", "0", { characterClass: "NECROMANCER", characterForm: "HUMAN", weaponCode: "crs", animation: "A1", skill: "NECROMANCER_POISON_DAGGER" }).status, "UNSUPPORTED");
  const dragonTail = getCalculatorViewModelFromParts("0", "0", { characterClass: "ASSASSIN", characterForm: "HUMAN", weaponCode: "7tw", animation: "A1", skill: "ASSASSIN_DRAGON_TAIL" });
  assert.equal(dragonTail.status, "REFERENCE_BASED");
  if (dragonTail.status === "REFERENCE_BASED") assert.ok(dragonTail.result.fullAnimationFrames !== null);
});

test("Amazon Impale integrates its 1HT/2HT reference tiers and per-weapon IAS cap", () => {
  const selection = { characterClass: "AMAZON", characterForm: "HUMAN", weaponCode: "jav", animation: "A1", skill: "AMAZON_IMPALE" };
  const base = getCalculatorViewModelFromParts("0", "0", selection);
  assert.equal(base.status, "REFERENCE_BASED");
  if (base.status === "REFERENCE_BASED") assert.equal(base.result.fullAnimationFrames, 27);
  const breakpoint = getCalculatorViewModelFromParts("0", "9", selection);
  assert.equal(breakpoint.status, "REFERENCE_BASED");
  if (breakpoint.status === "REFERENCE_BASED") assert.equal(breakpoint.result.fullAnimationFrames, 24);
  const twoHanded = getCalculatorViewModelFromParts("0", "0", { ...selection, weaponCode: "spr" });
  assert.equal(twoHanded.status, "REFERENCE_BASED");
  if (twoHanded.status === "REFERENCE_BASED") assert.equal(twoHanded.result.fullAnimationFrames, 31);
  assert.equal(getCalculatorViewModelFromParts("121", "0", selection).status, "INVALID_INPUT");
});

test("Assassin martial charge-ups use normal A1 and dual-claw sequence references", () => {
  for (const skill of ["ASSASSIN_TIGER_STRIKE", "ASSASSIN_COBRA_STRIKE", "ASSASSIN_PHOENIX_STRIKE"]) {
    const model = getCalculatorViewModelFromParts("0", "0", { characterClass: "ASSASSIN", characterForm: "HUMAN", weaponCode: "7tw", animation: "A1", skill });
    assert.equal(model.status, "REFERENCE_BASED", skill);
    if (model.status === "REFERENCE_BASED") assert.equal(model.result.fullAnimationFrames, 10);
  }
  const fire = getCalculatorViewModelFromParts("0", "0", { characterClass: "ASSASSIN", characterForm: "HUMAN", weaponCode: "9tw", secondaryWeaponCode: "9tw", animation: "A1", skill: "ASSASSIN_FISTS_OF_FIRE" });
  assert.equal(fire.status, "REFERENCE_BASED");
  if (fire.status === "REFERENCE_BASED") assert.equal(fire.result.fullAnimationFrames, 16);
  const geared = getCalculatorViewModelFromParts("0", "20", { characterClass: "ASSASSIN", characterForm: "HUMAN", weaponCode: "9tw", secondaryWeaponCode: "9tw", animation: "A1", skill: "ASSASSIN_FISTS_OF_FIRE" });
  assert.equal(geared.status, "REFERENCE_BASED");
  if (geared.status === "REFERENCE_BASED") assert.equal(geared.result.fullAnimationFrames, 14);
});
