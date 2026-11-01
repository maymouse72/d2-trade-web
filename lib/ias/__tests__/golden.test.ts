import assert from "node:assert/strict";
import test from "node:test";
import golden from "../data/paladin-crs-a1-golden.json" with { type: "json" };
import phaseBlade from "../data/paladin-7cr-a1-golden.json" with { type: "json" };
import warHammer from "../data/paladin-whm-a1-golden.json" with { type: "json" };
import { calculateIAS } from "../calculate.ts";
import { deriveGoldenBreakpoints } from "../breakpoints.ts";

const datasets = [golden, phaseBlade, warHammer] as const;

test("each weapon Golden Dataset has complete, unique integer IAS coverage", () => {
  assert.equal(datasets.reduce((sum, dataset) => sum + dataset.rows.length, 0), 720);
  for (const dataset of datasets) {
    assert.equal(dataset.gameBuild, "3.3.93847");
    assert.equal(dataset.rows.length, dataset.iasMax + 1, dataset.weaponCode);
    assert.deepEqual(dataset.rows.map((row) => row.ias), Array.from({ length: dataset.iasMax + 1 }, (_, i) => i));
    assert.ok(dataset.rows.every((row) => Number.isInteger(row.fullAnimationFrames)));
    assert.equal(dataset.metric, "FULL_ANIMATION_FRAMES");
    assert.match(dataset.source.url, /^https:\/\//);
  }
});

test("all weapon outputs equal independent published-table expectations", () => {
  for (const dataset of datasets) {
    for (const row of dataset.rows) {
      const result = calculateIAS({
        characterClass: "PALADIN",
        characterForm: "HUMAN",
        attackMode: "NORMAL",
        animation: "A1",
        weaponCode: dataset.weaponCode,
        weaponIAS: row.ias,
        offWeaponIAS: 0,
      });
      assert.equal(result.status, "SUPPORTED", `${dataset.weaponCode} IAS ${row.ias}`);
      assert.equal(result.fullAnimationFrames, row.fullAnimationFrames, `${dataset.weaponCode} IAS ${row.ias}`);
    }
  }
});

test("published source ranges expand to each weapon's agreed breakpoints", () => {
  assert.deepEqual(deriveGoldenBreakpoints("crs"), [0, 9, 19, 32, 54, 86, 152]);
  assert.deepEqual(deriveGoldenBreakpoints("7cr"), [0, 8, 24, 54]);
  assert.deepEqual(deriveGoldenBreakpoints("whm"), [0, 5, 10, 16, 24, 37, 52, 72, 109, 168, 317]);
});
