import assert from "node:assert/strict";
import test from "node:test";
import { IAS_BREAKPOINTS, getCalculatorViewModel } from "../ui-model.ts";

const paladin = { characterClass: "PALADIN", weaponCode: "crs", animation: "A1" };

test("UI breakpoint rows come from Golden Dataset", () => {
  assert.deepEqual(IAS_BREAKPOINTS, [
    { ias: 0, fullAnimationFrames: 14 }, { ias: 9, fullAnimationFrames: 13 },
    { ias: 19, fullAnimationFrames: 12 }, { ias: 32, fullAnimationFrames: 11 },
    { ias: 54, fullAnimationFrames: 10 }, { ias: 86, fullAnimationFrames: 9 },
    { ias: 152, fullAnimationFrames: 8 },
  ]);
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
    { ...paladin, weaponCode: "7cr" },
    { ...paladin, weaponCode: "whm" },
    { ...paladin, characterClass: "AMAZON" },
  ]) {
    const model = getCalculatorViewModel("40", selection);
    assert.notEqual(model.status, "SUPPORTED");
    assert.equal("result" in model, false);
  }
});
