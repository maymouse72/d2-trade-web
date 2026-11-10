import assert from "node:assert/strict";
import test from "node:test";
import { assassinBurstOfSpeedSIAS, calculateAssassinDragonClawReference } from "../assassin-dual-claw.ts";

const symmetricGreaterTalons = {
  characterForm: "HUMAN",
  primaryWeapon: { code: "9tw", wsm: -30, weaponIAS: 0 },
  secondaryWeapon: { code: "9tw", wsm: -30, weaponIAS: 0 },
  gearIAS: 0,
  burstOfSpeedLevel: 0,
} as const;

test("symmetric Greater Talons reproduces TrAdia's 16-frame, 2-hit sequence at 0 IAS", () => {
  const result = calculateAssassinDragonClawReference(symmetricGreaterTalons);
  assert.equal(result.status, "REFERENCE_BASED");
  if (result.status !== "REFERENCE_BASED") return;
  assert.equal(result.itemEffectiveIAS, 0);
  assert.equal(result.effectiveIAS, 0);
  assert.equal(result.animationSpeed, 256);
  assert.equal(result.sequenceFrames, 16);
  assert.equal(result.hitCount, 2);
  assert.equal(result.hitsPerSecond, 3.125);
  assert.equal(result.hitFrameOffsets, null);
});

test("symmetric Greater Talons with 20 gear IAS reproduces TrAdia's 14-frame result", () => {
  const result = calculateAssassinDragonClawReference({ ...symmetricGreaterTalons, gearIAS: 20 });
  assert.equal(result.status, "REFERENCE_BASED");
  if (result.status !== "REFERENCE_BASED") return;
  assert.equal(result.itemEffectiveIAS, 17);
  assert.equal(result.effectiveIAS, 17);
  assert.equal(result.animationSpeed, 299);
  assert.equal(result.sequenceFrames, 14);
});

test("Burst of Speed skill IAS uses the published diminishing curve", () => {
  assert.equal(assassinBurstOfSpeedSIAS(0), 0);
  assert.equal(assassinBurstOfSpeedSIAS(1), 21);
  assert.equal(assassinBurstOfSpeedSIAS(20), 52);
  assert.equal(assassinBurstOfSpeedSIAS(60), 60);
  assert.equal(assassinBurstOfSpeedSIAS(61), null);
});

test("mixed WSM and unequal weapon IAS are blocked as reference conflicts", () => {
  const mixedWSM = calculateAssassinDragonClawReference({
    ...symmetricGreaterTalons,
    secondaryWeapon: { code: "7wb", wsm: -10, weaponIAS: 0 },
  });
  assert.equal(mixedWSM.status, "CONFLICTED");
  assert.equal(mixedWSM.sequenceFrames, null);

  const mixedIAS = calculateAssassinDragonClawReference({
    ...symmetricGreaterTalons,
    secondaryWeapon: { code: "9tw", wsm: -30, weaponIAS: 15 },
  });
  assert.equal(mixedIAS.status, "CONFLICTED");
  assert.equal(mixedIAS.sequenceFrames, null);
});

test("unknown WSM, non-claws, malformed IAS, and non-human forms do not produce numbers", () => {
  const unknownWSM = calculateAssassinDragonClawReference({
    ...symmetricGreaterTalons,
    primaryWeapon: { code: "7ar", wsm: 0, weaponIAS: 0 },
    secondaryWeapon: { code: "7ar", wsm: 0, weaponIAS: 0 },
  });
  assert.equal(unknownWSM.status, "UNSUPPORTED");
  assert.equal(unknownWSM.sequenceFrames, null);

  const nonClaw = calculateAssassinDragonClawReference({
    ...symmetricGreaterTalons,
    primaryWeapon: { code: "7cr", wsm: -30, weaponIAS: 0 },
    secondaryWeapon: { code: "7cr", wsm: -30, weaponIAS: 0 },
  });
  assert.equal(nonClaw.status, "UNSUPPORTED");
  assert.equal(nonClaw.sequenceFrames, null);

  const invalidIAS = calculateAssassinDragonClawReference({
    ...symmetricGreaterTalons,
    primaryWeapon: { code: "9tw", wsm: -30, weaponIAS: 121 },
    secondaryWeapon: { code: "9tw", wsm: -30, weaponIAS: 121 },
  });
  assert.equal(invalidIAS.status, "INVALID_INPUT");
  assert.equal(invalidIAS.sequenceFrames, null);

  const werebear = calculateAssassinDragonClawReference({ ...symmetricGreaterTalons, characterForm: "WEREBEAR" });
  assert.equal(werebear.status, "UNSUPPORTED");
  assert.equal(werebear.sequenceFrames, null);
});

test("the result is invariant when the symmetric claws are swapped", () => {
  const input = {
    ...symmetricGreaterTalons,
    primaryWeapon: { code: "9tw", wsm: -30, weaponIAS: 20 },
    secondaryWeapon: { code: "7tw", wsm: -30, weaponIAS: 20 },
    gearIAS: 20,
  };
  const left = calculateAssassinDragonClawReference(input);
  const right = calculateAssassinDragonClawReference({
    ...input,
    primaryWeapon: input.secondaryWeapon,
    secondaryWeapon: input.primaryWeapon,
  });
  assert.equal(left.status, "REFERENCE_BASED");
  assert.equal(right.status, "REFERENCE_BASED");
  if (left.status === "REFERENCE_BASED" && right.status === "REFERENCE_BASED") {
    assert.equal(left.sequenceFrames, right.sequenceFrames);
    assert.equal(left.effectiveIAS, right.effectiveIAS);
  }
});
