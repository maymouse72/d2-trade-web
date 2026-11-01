import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import {
  SKILL_DERIVED_GOLDEN_DATASETS,
  SKILL_DERIVED_GOLDEN_ROWS,
} from "../skill-golden.ts";
import { IAS_SKILLS } from "../skills.ts";

const expected = [
  { skill: "SACRIFICE", skillId: 96 },
  { skill: "VENGEANCE", skillId: 111 },
  { skill: "CONVERSION", skillId: 116 },
] as const;

test("skill-derived dataset is traceable, complete, unique, and keeps source hashes", async () => {
  assert.equal(SKILL_DERIVED_GOLDEN_DATASETS.length, 9);
  assert.equal(SKILL_DERIVED_GOLDEN_ROWS.length, 2160);
  const keys = new Set<string>();
  for (const dataset of SKILL_DERIVED_GOLDEN_DATASETS) {
    assert.equal(dataset.gameBuild, "3.3.93847");
    assert.equal(dataset.animationMode, "A1");
    assert.equal(dataset.evidenceStatus, "DERIVED_RANGE_VALIDATION");
    assert.match(dataset.sourceGolden, /^lib\/ias\/data\/paladin-(crs|7cr|whm)-a1-golden\.json$/);
    const sourceBytes = await readFile(new URL(`../${dataset.sourceGolden.slice("lib/ias/".length)}`, import.meta.url));
    assert.equal(createHash("sha256").update(sourceBytes).digest("hex"), dataset.sourceHash);
    const skillDefinition = IAS_SKILLS[dataset.skill];
    assert.equal(dataset.skillId, skillDefinition.skillId);
    assert.equal(dataset.rows.length, dataset.weaponCode === "whm" ? 318 : 201);
    assert.deepEqual(dataset.rows.map((row) => row.IAS), Array.from({ length: dataset.rows.length }, (_, i) => i));
    for (const row of dataset.rows) {
      const key = `${dataset.skill}:${dataset.weaponCode}:${row.IAS}`;
      assert.equal(keys.has(key), false, `duplicate ${key}`);
      keys.add(key);
      assert.ok(Number.isInteger(row.expectedFrames), key);
    }
  }
  assert.equal(keys.size, 2160);
  for (const item of expected) assert.equal(SKILL_DERIVED_GOLDEN_DATASETS.filter((d) => d.skill === item.skill && d.skillId === item.skillId).length, 3);
});

test("engine output matches all 2160 derived vectors without changing existing A1 expectations", () => {
  for (const dataset of SKILL_DERIVED_GOLDEN_DATASETS) {
    for (const row of dataset.rows) {
      const result = calculateIAS({
        characterClass: "PALADIN",
        characterForm: "HUMAN",
        attackMode: "NORMAL",
        animation: "A1",
        skill: dataset.skill,
        weaponCode: dataset.weaponCode,
        weaponIAS: row.IAS,
        offWeaponIAS: 0,
      });
      assert.equal(result.status, "SUPPORTED", `${dataset.skill}/${dataset.weaponCode}/${row.IAS}`);
      assert.equal(result.fullAnimationFrames, row.expectedFrames, `${dataset.skill}/${dataset.weaponCode}/${row.IAS}`);
    }
  }
});

test("skill-specific boundary vectors cover both sides of each Paladin A1 breakpoint", () => {
  const cases = [
    ["crs", 8, 14], ["crs", 9, 13], ["crs", 151, 9], ["crs", 152, 8],
    ["7cr", 7, 11], ["7cr", 8, 10], ["7cr", 23, 10], ["7cr", 24, 9], ["7cr", 53, 9], ["7cr", 54, 8],
    ["whm", 167, 10], ["whm", 168, 9], ["whm", 316, 9], ["whm", 317, 8],
  ] as const;
  for (const skill of ["SACRIFICE", "VENGEANCE", "CONVERSION"] as const) {
    for (const [weaponCode, ias, frames] of cases) {
      const result = calculateIAS({
        characterClass: "PALADIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1",
        skill, weaponCode, weaponIAS: ias, offWeaponIAS: 0,
      });
      assert.equal(result.status, "SUPPORTED", `${skill}/${weaponCode}/${ias}`);
      assert.equal(result.fullAnimationFrames, frames, `${skill}/${weaponCode}/${ias}`);
    }
  }
});
