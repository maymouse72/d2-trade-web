import assert from "node:assert/strict";
import test from "node:test";
import { calculateAssassinChargeUp, getAssassinChargeUpBreakpoints } from "../assassin-charge-up.ts";

const talons = {
  primary: { code: "9tw", wsm: -30, weaponIAS: 0 },
  secondary: { code: "9tw", wsm: -30, weaponIAS: 0 },
  gearIAS: 0,
  burstOfSpeedLevel: 0,
};

test("Assassin dual-claw charge-up skills use the published 16-FPD and -30 sequence model", () => {
  const base = calculateAssassinChargeUp(talons);
  assert.equal(base.status, "REFERENCE_BASED");
  if (base.status === "REFERENCE_BASED") assert.deepEqual([base.effectiveIAS, base.frames], [0, 16]);
  const geared = calculateAssassinChargeUp({ ...talons, gearIAS: 20 });
  assert.equal(geared.status, "REFERENCE_BASED");
  if (geared.status === "REFERENCE_BASED") assert.deepEqual([geared.effectiveIAS, geared.frames], [17, 14]);
});

test("dual-claw charge-up model averages per-hand WSM/IEIAS and is invariant to swapping hands", () => {
  const mixed = { ...talons, primary: { code: "9tw", wsm: -30, weaponIAS: 15 }, secondary: { code: "7cs", wsm: -10, weaponIAS: 35 }, gearIAS: 8, burstOfSpeedLevel: 20 };
  const result = calculateAssassinChargeUp(mixed);
  const swapped = calculateAssassinChargeUp({ ...mixed, primary: mixed.secondary, secondary: mixed.primary });
  assert.equal(result.status, "REFERENCE_BASED");
  assert.equal(swapped.status, "REFERENCE_BASED");
  if (result.status === "REFERENCE_BASED" && swapped.status === "REFERENCE_BASED") assert.deepEqual([result.effectiveIAS, result.frames], [swapped.effectiveIAS, swapped.frames]);
});

test("charge-up breakpoints are monotonic and invalid claw/range inputs return no frames", () => {
  const rows = getAssassinChargeUpBreakpoints(talons);
  assert.ok(rows.length > 1);
  assert.ok(rows.every((row, index) => index === 0 || row.frames < rows[index - 1]!.frames));
  assert.equal(calculateAssassinChargeUp({ ...talons, secondary: { code: "7cr", wsm: -30, weaponIAS: 0 } }).status, "UNSUPPORTED");
  assert.equal(calculateAssassinChargeUp({ ...talons, primary: { code: "7qr", wsm: null, weaponIAS: 0 } }).status, "UNSUPPORTED");
  assert.equal(calculateAssassinChargeUp({ ...talons, primary: { code: "9tw", wsm: -30, weaponIAS: 121 } }).status, "INVALID_INPUT");
});
