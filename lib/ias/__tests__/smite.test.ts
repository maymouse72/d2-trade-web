import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { SMITE_BREAKPOINTS, SMITE_GOLDEN_DATASETS } from "../smite-golden.ts";
import { getCalculatorViewModel, getWeaponBreakpoints } from "../ui-model.ts";

const weaponCodes = ["crs", "7cr", "whm"] as const;
const base = { characterClass: "PALADIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "S1", skill: "SMITE", weaponIAS: 0, offWeaponIAS: 0 };

test("Smite registry and source model are dedicated S1 with shield-required scope", async () => {
  const { IAS_SKILLS } = await import("../skills.ts");
  assert.equal(IAS_SKILLS.SMITE.skillId, 97);
  assert.equal(IAS_SKILLS.SMITE.animationMode, "S1");
  assert.equal(IAS_SKILLS.SMITE.supportStatus, "SUPPORTED");
  assert.match(IAS_SKILLS.SMITE.evidenceScope, /shield equipped/);
});

test("all 731 integer IAS Golden rows match the independent fixed Smite breakpoint vectors", () => {
  assert.equal(SMITE_GOLDEN_DATASETS.reduce((sum, dataset) => sum + dataset.rows.length, 0), 731);
  for (const weaponCode of weaponCodes) {
    const dataset = SMITE_GOLDEN_DATASETS.find((item) => item.weaponCode === weaponCode)!;
    assert.equal(dataset.rows.length, dataset.IASRange.max + 1);
    for (const row of dataset.rows) {
      const result = calculateIAS({ ...base, weaponCode, weaponIAS: row.IAS });
      assert.equal(result.status, "SUPPORTED", `${weaponCode} IAS ${row.IAS}`);
      assert.equal(result.fullAnimationFrames, row.expectedFrames, `${weaponCode} IAS ${row.IAS}`);
      assert.equal(result.currentBreakpoint, row.breakpoint);
    }
  }
});

test("Smite threshold minus/exact/plus rows and output limits match references", () => {
  for (const weaponCode of weaponCodes) {
    const max = SMITE_GOLDEN_DATASETS.find((dataset) => dataset.weaponCode === weaponCode)!.IASRange.max;
    for (const [index, row] of SMITE_BREAKPOINTS[weaponCode].entries()) {
      for (const ias of [row.ias - 1, row.ias, row.ias + 1]) {
        if (ias < 0 || ias > max) continue;
        const result = calculateIAS({ ...base, weaponCode, weaponIAS: ias });
        assert.equal(result.status, "SUPPORTED");
        const expected = SMITE_BREAKPOINTS[weaponCode].filter((point) => point.ias <= ias).at(-1)!;
        assert.equal(result.fullAnimationFrames, expected.frames);
      }
      assert.equal(row.frames > 0, true);
      assert.equal(index >= 0, true);
    }
  }
  assert.equal(calculateIAS({ ...base, weaponCode: "crs", animation: "A1" }).status, "UNVERIFIED");
  assert.equal(calculateIAS({ ...base, weaponCode: "crs", characterClass: "AMAZON" }).status, "UNSUPPORTED");
  assert.equal(calculateIAS({ ...base, weaponCode: "crs", skillIAS: 1 }).status, "UNVERIFIED");
  assert.equal(calculateIAS({ ...base, weaponCode: "crs", weaponIAS: 201 }).status, "INVALID_INPUT");
  assert.equal(calculateIAS({ ...base, weaponCode: "7cr", weaponIAS: 73 }).status, "INVALID_INPUT");
  assert.equal(calculateIAS({ ...base, weaponCode: "whm", weaponIAS: 457 }).status, "INVALID_INPUT");
  assert.deepEqual(getWeaponBreakpoints("crs", "A1", "SMITE").map((row) => row.ias), [0, 11, 26, 48, 86, 180]);
});

test("Smite calculator input limits follow selected weapon and breakpoint bands", () => {
  for (const [weaponCode, max, cases] of [
    ["crs", 200, [[0, 11], [11, 10], [180, 6], [200, 6]]],
    ["7cr", 72, [[0, 9], [5, 8], [24, 7], [65, 6], [72, 6]]],
    ["whm", 456, [[0, 15], [168, 7], [395, 6], [456, 6]]],
  ] as const) {
    for (const [ias, frames] of cases) {
      const model = getCalculatorViewModel(String(ias), { characterClass: "PALADIN", weaponCode, animation: "S1", skill: "SMITE" });
      assert.equal(model.status, "SUPPORTED");
      if (model.status === "SUPPORTED") assert.equal(model.result.fullAnimationFrames, frames);
    }
    assert.equal(getCalculatorViewModel(String(max + 1), { characterClass: "PALADIN", weaponCode, animation: "S1", skill: "SMITE" }).status, "INVALID_INPUT");
  }
});
