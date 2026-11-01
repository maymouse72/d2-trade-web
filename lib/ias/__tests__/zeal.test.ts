import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import reference from "../data/paladin-zeal-1hs-reference.json" with { type: "json" };
import golden from "../data/paladin-zeal-golden.json" with { type: "json" };
import { calculateIAS } from "../calculate.ts";
import { ZEAL_GOLDEN_DATASETS, ZEAL_GOLDEN_ROWS, deriveZealBreakpoints, getZealGoldenRow } from "../zeal-golden.ts";
import { getCalculatorViewModelFromParts, getZealHitCountFromSkillLevel } from "../ui-model.ts";
import { IAS_SKILLS } from "../skills.ts";

const base = {
  characterClass: "PALADIN",
  characterForm: "HUMAN",
  attackMode: "NORMAL",
  animation: "A1",
  skill: "ZEAL",
  weaponCode: "crs",
  weaponIAS: 0,
  offWeaponIAS: 0,
};

test("Zeal registry binds the D2R skill ID and A1 repeated-attack scope", () => {
  assert.equal(IAS_SKILLS.ZEAL.skillId, 106);
  assert.equal(IAS_SKILLS.ZEAL.animationMode, "A1");
  assert.equal(IAS_SKILLS.ZEAL.selectable, true);
  assert.equal(IAS_SKILLS.ZEAL.supportStatus, "SUPPORTED");
  assert.deepEqual(IAS_SKILLS.ZEAL.supportedWeapons, ["crs", "7cr", "whm"]);
});

test("Paladin 1HS Zeal formula matches all fixed reference rows and all EIAS cells", async () => {
  const bytes = await readFile(new URL("../data/paladin-zeal-1hs-reference.json", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), golden.referenceHash);
  const rows = reference.rows as number[][];
  const referenceAt = (eias: number) => rows.filter((row) => row[0] <= eias).at(-1)!;
  for (const eias of Array.from({ length: 161 }, (_, index) => index - 85)) {
    const [threshold, first, follow, last] = referenceAt(eias);
    const speed = Math.floor((256 * (100 + eias)) / 100);
    const calculated = [Math.ceil((256 * 7) / speed), Math.ceil((256 * 7) / speed), Math.ceil((256 * 15) / speed) - 1];
    assert.ok(threshold <= eias);
    assert.deepEqual(calculated, [first, follow, last], `EIAS ${eias}`);
  }
});

test("Zeal Golden expands complete IAS and 2–5 hit coverage from the fixed reference table", () => {
  assert.equal(golden.rowCount, 3564);
  assert.equal(ZEAL_GOLDEN_ROWS.length, 3564);
  assert.deepEqual(ZEAL_GOLDEN_DATASETS.map((dataset) => [dataset.weaponCode, dataset.IASRange.max]), [
    ["crs", 360], ["7cr", 72], ["whm", 456],
  ]);
  for (const dataset of ZEAL_GOLDEN_DATASETS) {
    assert.equal(dataset.gameBuild, "3.3.93847");
    assert.equal(dataset.skillId, 106);
    assert.equal(dataset.animationMode, "A1");
    assert.equal(dataset.rows.length, (dataset.IASRange.max + 1) * 4);
    for (let ias = 0; ias <= dataset.IASRange.max; ias += 1) {
      for (let hitCount = 2; hitCount <= 5; hitCount += 1) {
        assert.ok(getZealGoldenRow(dataset.weaponCode, ias, hitCount), `${dataset.weaponCode}/${ias}/${hitCount}`);
      }
    }
  }
});

test("Zeal engine matches every Golden vector and remains separate from normal A1", () => {
  for (const dataset of ZEAL_GOLDEN_DATASETS) {
    for (const row of dataset.rows) {
      const result = calculateIAS({ ...base, weaponCode: dataset.weaponCode, weaponIAS: row.IAS, hitCount: row.hitCount });
      assert.equal(result.status, "SUPPORTED", `${dataset.weaponCode}/${row.IAS}/${row.hitCount}`);
      assert.equal(result.fullAnimationFrames, row.totalSequenceFrames);
      assert.equal(result.effectiveIAS, row.EIAS);
      assert.deepEqual(result.zealSequence, {
        hitCount: row.hitCount,
        firstHitFrame: row.hitEventFrames[0],
        subsequentHitFrames: row.followUpAttackFrames,
        finalHitFrame: row.hitEventFrames[row.hitCount - 1],
        firstAttackFrames: row.firstAttackFrames,
        followUpAttackFrames: row.followUpAttackFrames,
        finalAttackFrames: row.finalAttackFrames,
        totalSequenceFrames: row.totalSequenceFrames,
      });
    }
  }
  const zeal = calculateIAS({ ...base, hitCount: 5 });
  const normal = calculateIAS({ ...base, skill: "NORMAL_ATTACK" });
  assert.equal(zeal.status, "SUPPORTED");
  assert.equal(normal.status, "SUPPORTED");
  assert.notEqual(zeal.fullAnimationFrames, normal.fullAnimationFrames);
});

test("Zeal thresholds and sequence output account for the selected hit count", () => {
  const expected = getZealGoldenRow("crs", 0, 5)!;
  assert.deepEqual([expected.firstAttackFrames, expected.followUpAttackFrames, expected.finalAttackFrames, expected.totalSequenceFrames], [7, 7, 14, 42]);
  const twoHits = calculateIAS({ ...base, hitCount: 2 });
  assert.equal(twoHits.fullAnimationFrames, 21);
  assert.equal(twoHits.zealSequence?.finalHitFrame, 14);
  const view = getCalculatorViewModelFromParts("0", "9", { characterClass: "PALADIN", weaponCode: "crs", animation: "A1", skill: "ZEAL", hitCount: 5 });
  assert.equal(view.status, "SUPPORTED");
  if (view.status === "SUPPORTED") assert.deepEqual([view.result.currentBreakpoint, view.result.nextBreakpoint, view.result.requiredAdditionalIAS], [9, 19, 10]);
  assert.ok(deriveZealBreakpoints("crs", 2).length > 0);
  assert.deepEqual(deriveZealBreakpoints("crs", 2), deriveZealBreakpoints("crs", 5));
  assert.deepEqual([1, 2, 3, 4, 20].map((level) => getZealHitCountFromSkillLevel(level)), [2, 3, 4, 5, 5]);
  assert.equal(getZealHitCountFromSkillLevel(0), null);
  assert.equal(getZealHitCountFromSkillLevel(21), null);
});

test("Zeal rejects unsupported hit counts, modifiers, animation, classes, weapons and IAS bounds", () => {
  for (const hitCount of [1, 1.5, 6, "5"]) {
    const result = calculateIAS({ ...base, hitCount });
    assert.equal(result.status, "INVALID_INPUT");
    assert.equal(result.fullAnimationFrames, null);
  }
  for (const input of [
    { ...base, animation: "A2" },
    { ...base, characterClass: "AMAZON" },
    { ...base, weaponCode: "xyz" },
    { ...base, skillIAS: 1 },
    { ...base, buffIAS: 1 },
    { ...base, debuffIAS: 1 },
    { ...base, weaponCode: "crs", weaponIAS: 361 },
    { ...base, weaponCode: "7cr", weaponIAS: 73 },
    { ...base, weaponCode: "whm", weaponIAS: 457 },
  ]) {
    const result = calculateIAS(input);
    assert.notEqual(result.status, "SUPPORTED");
    assert.equal(result.fullAnimationFrames, null);
    assert.equal(result.zealSequence ?? null, null);
  }
});
