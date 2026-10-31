import assert from "node:assert/strict";
import test from "node:test";
import golden from "../data/paladin-crs-a1-golden.json" with { type: "json" };
import { calculateIAS } from "../calculate.ts";
import { deriveGoldenBreakpoints } from "../breakpoints.ts";

test("Golden Dataset has complete, unique integer IAS coverage", () => {
  assert.equal(golden.datasetId, "PALADIN-CRS-A1-D2R-3.3.93847");
  assert.equal(golden.rows.length, 201);
  assert.deepEqual(golden.rows.map((row) => row.ias), Array.from({ length: 201 }, (_, i) => i));
  assert.ok(golden.rows.every((row) => Number.isInteger(row.fullAnimationFrames)));
  assert.equal(golden.metric, "FULL_ANIMATION_FRAMES");
  assert.match(golden.source.url, /^https:\/\//);
});

test("all 201 engine outputs equal independent table-expanded expectations", () => {
  for (const row of golden.rows) {
    const result = calculateIAS({
      characterClass: "PALADIN",
      characterForm: "HUMAN",
      attackMode: "NORMAL",
      animation: "A1",
      weaponCode: "crs",
      weaponIAS: row.ias,
      offWeaponIAS: 0,
    });
    assert.equal(result.status, "SUPPORTED", `IAS ${row.ias}`);
    assert.equal(result.fullAnimationFrames, row.fullAnimationFrames, `IAS ${row.ias}`);
  }
});

test("Golden source ranges expand to the agreed breakpoints", () => {
  assert.deepEqual(deriveGoldenBreakpoints(), [0, 9, 19, 32, 54, 86, 152]);
});
