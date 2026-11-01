import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { fanaticismSIAS } from "../fanaticism.ts";
import { getWeaponBreakpoints } from "../ui-model.ts";
import golden from "../data/fanaticism-golden.json" with { type: "json" };

const base = { characterClass:"PALADIN", characterForm:"HUMAN", attackMode:"NORMAL", animation:"A1", weaponCode:"crs", weaponIAS:0, offWeaponIAS:0 };

test("Fanaticism dm34 formula matches independently published D2R level samples and cap", () => {
  const levels = [14,18,20,23,25,26,27,28,29,30,31,31,32,33,33,34,34,34,34,35,35,35,36,36];
  levels.forEach((value,index) => assert.equal(fanaticismSIAS(index+1), value, `level ${index+1}`));
  assert.equal(fanaticismSIAS(60), 40);
  assert.throws(() => fanaticismSIAS(61), RangeError);
});

test("Fanaticism OFF preserves exact baseline and ON changes supported A1/Zeal/Smite calculations", () => {
  for (const skill of ["NORMAL_ATTACK","SACRIFICE","VENGEANCE","CONVERSION","ZEAL","SMITE"]) {
    const animation = skill === "SMITE" ? "S1" : "A1";
    const baseline = calculateIAS({ ...base, animation, skill, weaponIAS:40, hitCount:5 });
    const off = calculateIAS({ ...base, animation, skill, weaponIAS:40, hitCount:5, fanaticismLevel:0 });
    assert.deepEqual(off, baseline, `${skill} OFF parity`);
    const on = calculateIAS({ ...base, animation, skill, weaponIAS:40, hitCount:5, fanaticismLevel:20 });
    assert.equal(on.status,"SUPPORTED",`${skill} ON`);
    assert.ok(on.trace && on.trace.eiasRaw > (baseline.trace?.eiasRaw ?? -999));
    assert.ok(on.currentBreakpoint !== null);
  }
});

test("Fanaticism blocks unsupported classes, combinations, and generic modifiers", () => {
  assert.equal(calculateIAS({ ...base, characterClass:"AMAZON", fanaticismLevel:20 }).status,"UNSUPPORTED");
  assert.equal(calculateIAS({ ...base, weaponCode:"axe", fanaticismLevel:20 }).status,"UNVERIFIED");
  assert.equal(calculateIAS({ ...base, fanaticismLevel:61 }).status,"INVALID_INPUT");
  assert.equal(calculateIAS({ ...base, fanaticismLevel:20, skillIAS:1 }).status,"UNVERIFIED");
});

test("Fanaticism breakpoint rows change with level and retain sorted boundaries", () => {
  const low = getWeaponBreakpoints("crs","A1","NORMAL_ATTACK",5,1);
  const high = getWeaponBreakpoints("crs","A1","NORMAL_ATTACK",5,20);
  assert.ok(low.length > 0 && high.length > 0);
  assert.ok(high[0].ias > low[0].ias || high.length !== low.length);
  assert.ok(high.every((row,index) => index === 0 || row.ias > high[index-1].ias));
});

test("separate Fanaticism Golden covers every supported combo and level boundary", () => {
  assert.equal(golden.datasets.length, 19 * 60);
  assert.equal(golden.rowCount, golden.datasets.reduce((sum, item) => sum + item.rows.length, 0));
  for (const dataset of golden.datasets) {
    assert.equal(dataset.fanaticismSIAS, fanaticismSIAS(dataset.fanaticismLevel));
    assert.equal(dataset.rows[0].ias, 0);
    assert.ok(dataset.rows.every((row, index) => index === 0 || row.ias > dataset.rows[index - 1].ias));
    for (const row of dataset.rows) {
      const result = calculateIAS({ ...base, skill: dataset.skill, animation: dataset.skill === "SMITE" ? "S1" : "A1", weaponCode: dataset.weaponCode, weaponIAS: row.ias, fanaticismLevel: dataset.fanaticismLevel, hitCount: 5 });
      assert.equal(result.status, "SUPPORTED", `${dataset.weaponCode}/${dataset.skill}/L${dataset.fanaticismLevel}/${row.ias}`);
      assert.equal(result.effectiveIAS, row.eias);
      assert.equal(result.fullAnimationFrames, row.frames);
    }
  }
});
