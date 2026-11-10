import assert from "node:assert/strict";
import test from "node:test";
import { calculateAssassinDragonTalonReference } from "../assassin-dragon-talon.ts";

const base = {
  characterForm: "HUMAN",
  weapon: { code: "9tw", wsm: -30, weaponIAS: 0 }, // Greater Talons
  gearIAS: 0,
  burstOfSpeedLevel: 0,
  dragonTalonLevel: 6,
} as const;

test("two-kick Dragon Talon reference vector is (4)+10 at EIAS 30", () => {
  const result = calculateAssassinDragonTalonReference(base);
  assert.equal(result.status, "REFERENCE_BASED");
  if (result.status !== "REFERENCE_BASED") return;
  assert.equal(result.kickCount, 2);
  assert.equal(result.effectiveIAS, 30);
  assert.deepEqual(result.hitFrameLengths, [4, 10]);
  assert.equal(result.totalSequenceFrames, 14);
  assert.equal(result.animationSpeed, 332);
});

test("gear IAS 19 reaches the fixed 3+8 Talon sequence at WSM -30", () => {
  const result = calculateAssassinDragonTalonReference({ ...base, gearIAS: 19 });
  assert.equal(result.status, "REFERENCE_BASED");
  if (result.status !== "REFERENCE_BASED") return;
  assert.equal(result.itemEffectiveIAS, 16);
  assert.equal(result.effectiveIAS, 46);
  assert.equal(result.animationSpeed, 373);
  assert.deepEqual(result.hitFrameLengths, [3, 8]);
  assert.equal(result.totalSequenceFrames, 11);
});

test("skill level determines one, two, and three kicks using verified level bands", () => {
  const one = calculateAssassinDragonTalonReference({ ...base, dragonTalonLevel: 1 });
  const two = calculateAssassinDragonTalonReference({ ...base, dragonTalonLevel: 6 });
  const three = calculateAssassinDragonTalonReference({ ...base, dragonTalonLevel: 12 });
  assert.equal(one.status, "REFERENCE_BASED");
  assert.equal(two.status, "REFERENCE_BASED");
  assert.equal(three.status, "REFERENCE_BASED");
  if (one.status === "REFERENCE_BASED" && two.status === "REFERENCE_BASED" && three.status === "REFERENCE_BASED") {
    assert.deepEqual(one.hitFrameLengths, [10]);
    assert.deepEqual(two.hitFrameLengths, [4, 10]);
    assert.deepEqual(three.hitFrameLengths, [4, 4, 10]);
  }
});

test("Burst of Speed accelerates Talon; unknown WSM/form/ranges do not return numbers", () => {
  const boosted = calculateAssassinDragonTalonReference({ ...base, burstOfSpeedLevel: 1 });
  assert.equal(boosted.status, "REFERENCE_BASED");
  if (boosted.status === "REFERENCE_BASED") {
    assert.equal(boosted.skillIAS, 21);
    assert.deepEqual(boosted.hitFrameLengths, [3, 8]);
  }

  const unknown = calculateAssassinDragonTalonReference({ ...base, weapon: { code: "hax", wsm: 0, weaponIAS: 0 } });
  assert.equal(unknown.status, "UNSUPPORTED");
  assert.equal(unknown.totalSequenceFrames, null);
  const nonHuman = calculateAssassinDragonTalonReference({ ...base, characterForm: "WEREWOLF" });
  assert.equal(nonHuman.status, "UNSUPPORTED");
  const unverifiedSkillLevel = calculateAssassinDragonTalonReference({ ...base, dragonTalonLevel: 31 });
  assert.equal(unverifiedSkillLevel.status, "UNSUPPORTED");
});
