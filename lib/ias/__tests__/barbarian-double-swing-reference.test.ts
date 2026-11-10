import assert from "node:assert/strict";
import test from "node:test";
import { calculateBarbarianDoubleSwingReference } from "../barbarian-double-swing-reference.ts";

test("Double Swing matches the recorded D2R 3.3 Phase Blade/Phase Blade primary-IAS reference rows", () => {
  const cases = [
    [0, 12],
    [11, 11],
    [65, 10],
  ] as const;
  for (const [primaryWeaponIAS, expectedFrames] of cases) {
    const result = calculateBarbarianDoubleSwingReference({
      primaryWeapon: "7cr",
      secondaryWeapon: "7cr",
      primaryWeaponIAS,
    });
    assert.equal(result.status, "REFERENCE_BASED");
    assert.equal(result.sequenceFrames, expectedFrames);
    assert.equal(result.eventOrder, null);
  }
});

test("Double Swing matches the recorded Phase Blade primary / War Hammer secondary rows", () => {
  const cases = [
    [0, 14],
    [48, 12],
    [120, 11],
    [395, 10],
  ] as const;
  for (const [primaryWeaponIAS, expectedFrames] of cases) {
    const result = calculateBarbarianDoubleSwingReference({
      primaryWeapon: "7cr",
      secondaryWeapon: "whm",
      primaryWeaponIAS,
    });
    assert.equal(result.status, "REFERENCE_BASED");
    assert.equal(result.sequenceFrames, expectedFrames);
    assert.equal(result.eventOrder, null);
  }
});

test("unsupported hand order and unnormalized modifiers return no numeric result", () => {
  const reversed = calculateBarbarianDoubleSwingReference({
    primaryWeapon: "whm",
    secondaryWeapon: "7cr",
    primaryWeaponIAS: 0,
  });
  assert.equal(reversed.status, "CONFLICTED");
  assert.equal(reversed.sequenceFrames, null);

  const gearIAS = calculateBarbarianDoubleSwingReference({
    primaryWeapon: "7cr",
    secondaryWeapon: "7cr",
    primaryWeaponIAS: 0,
    gearIAS: 20,
  });
  assert.equal(gearIAS.status, "CONFLICTED");
  assert.equal(gearIAS.sequenceFrames, null);

  const secondaryIAS = calculateBarbarianDoubleSwingReference({
    primaryWeapon: "7cr",
    secondaryWeapon: "7cr",
    primaryWeaponIAS: 0,
    secondaryWeaponIAS: 20,
  });
  assert.equal(secondaryIAS.status, "CONFLICTED");
  assert.equal(secondaryIAS.sequenceFrames, null);
});

test("invalid IAS values cannot produce a result", () => {
  const result = calculateBarbarianDoubleSwingReference({
    primaryWeapon: "7cr",
    secondaryWeapon: "7cr",
    primaryWeaponIAS: 457,
  });
  assert.equal(result.status, "INVALID_INPUT");
  assert.equal(result.sequenceFrames, null);
});
