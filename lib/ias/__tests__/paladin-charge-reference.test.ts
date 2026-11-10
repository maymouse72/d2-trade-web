import test from "node:test";
import assert from "node:assert/strict";
import { calculatePaladinChargeReference } from "../paladin-charge-reference.ts";
import { calculateIAS } from "../calculate.ts";

test("real Charge rush is kept outside the IAS frame calculation", () => {
  const result = calculatePaladinChargeReference({ mode: "RUSH", weaponCode: "crs", weaponIAS: 200, offWeaponIAS: 200 });
  assert.equal(result.mode, "RUSH");
  assert.equal(result.frames, null);
  assert.match(result.reason, /IAS가 아닌/);
});

test("melee-range Charge fallback is exactly the supported Paladin A1 normal attack", () => {
  const input = { mode: "MELEE_FALLBACK" as const, weaponCode: "crs", weaponIAS: 40, offWeaponIAS: 20, fanaticismLevel: 0 };
  const fallback = calculatePaladinChargeReference(input);
  const normal = calculateIAS({
    characterClass: "PALADIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1",
    skill: "NORMAL_ATTACK", weaponCode: input.weaponCode, weaponIAS: input.weaponIAS,
    offWeaponIAS: input.offWeaponIAS, fanaticismLevel: input.fanaticismLevel,
  });
  assert.equal(fallback.mode, "MELEE_FALLBACK");
  if (fallback.mode !== "MELEE_FALLBACK") throw new Error("expected melee fallback result");
  assert.equal(fallback.frames, normal.fullAnimationFrames);
  assert.equal(fallback.result.status, normal.status);
  assert.ok(fallback.frames !== null);
  assert.match(fallback.reason, /Charge 보너스가 없는/);
});

test("fallback retains normal calculator weapon guards", () => {
  const result = calculatePaladinChargeReference({ mode: "MELEE_FALLBACK", weaponCode: "bad", weaponIAS: 0, offWeaponIAS: 0 });
  if (result.mode !== "MELEE_FALLBACK") throw new Error("expected melee fallback result");
  assert.equal(result.frames, null);
  assert.equal(result.result.status, "UNVERIFIED");
});
