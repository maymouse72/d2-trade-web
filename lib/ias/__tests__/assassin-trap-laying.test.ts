import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { assassinBurstOfSpeedSIAS, calculateAssassinTrapLaying, getAssassinTrapLayingBreakpointRows } from "../assassin-trap-laying.ts";

test("Trap laying uses the documented half-speed 8-FPD model", () => {
  const result = calculateAssassinTrapLaying({ weaponSpeedModifier: -30, totalIAS: 0, burstOfSpeedLevel: 0 });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.framesPerTrap, 12);
  assert.equal(result.speedIncrease, 166);
  const knownBreakpoint = calculateAssassinTrapLaying({ weaponSpeedModifier: -30, totalIAS: 42, burstOfSpeedLevel: 0 });
  assert.equal(knownBreakpoint.framesPerTrap, 9);
});

test("Burst of Speed level SIAS is applied and the breakpoint table is monotonic", () => {
  assert.equal(assassinBurstOfSpeedSIAS(1), 21);
  assert.equal(assassinBurstOfSpeedSIAS(60), 60);
  const rows = getAssassinTrapLayingBreakpointRows({ weaponSpeedModifier: -30, burstOfSpeedLevel: 0, maxIAS: 200 });
  assert.ok(rows.length > 1);
  assert.equal(rows[0].ias, 0);
  assert.ok(rows.every((row, index) => index === 0 || row.fullAnimationFrames < rows[index - 1].fullAnimationFrames));
});

test("trap laying rejects invalid speed inputs", () => {
  assert.equal(calculateAssassinTrapLaying({ weaponSpeedModifier: 61, totalIAS: 0, burstOfSpeedLevel: 0 }).status, "INVALID_INPUT");
  assert.equal(calculateAssassinTrapLaying({ weaponSpeedModifier: 0, totalIAS: 457, burstOfSpeedLevel: 0 }).status, "INVALID_INPUT");
  assert.equal(calculateAssassinTrapLaying({ weaponSpeedModifier: 0, totalIAS: 0, burstOfSpeedLevel: 61 }).status, "INVALID_INPUT");
});

test("Assassin trap laying is selectable through the integrated calculator model", () => {
  const result = calculateIAS({ characterClass: "ASSASSIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "ASSASSIN_TRAP_LAYING", weaponCode: "9tw", weaponIAS: 0, offWeaponIAS: 0, burstOfSpeedLevel: 0 });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(result.fullAnimationFrames, 12);
  assert.equal(result.trace?.animationSpeed, 128);
});
