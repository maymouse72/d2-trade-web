import assert from "node:assert/strict";
import test from "node:test";
import { constrainIASInput, getCalculatorViewModel, getWeaponBreakpoints } from "../ui-model.ts";
import { IAS_WEAPONS } from "../weapons.ts";

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

test("unverified animations, weapons, and unsupported classes never return numbers", () => {
  for (const selection of [
    { ...paladin, animation: "A2" },
    { ...paladin, characterClass: "AMAZON" },
  ]) {
    const model = getCalculatorViewModel("40", selection);
    assert.notEqual(model.status, "SUPPORTED");
    assert.equal("result" in model, false);
  }
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

test("input control constrains values to the selected weapon's maximum", () => {
  assert.equal(constrainIASInput("318", 317), "317");
  assert.equal(constrainIASInput("319", 317), "317");
  assert.equal(constrainIASInput("201", IAS_WEAPONS["7cr"].maxIAS), "200");
  assert.equal(constrainIASInput("201", IAS_WEAPONS.crs.maxIAS), "200");
  assert.equal(constrainIASInput("317", 317), "317");
  assert.equal(constrainIASInput("", 317), "");
  assert.equal(constrainIASInput("-1", 317), "-1");
});
