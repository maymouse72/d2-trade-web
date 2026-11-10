import assert from "node:assert/strict";
import test from "node:test";
import { calculateAmazonImpaleReference } from "../amazon-impale.ts";

test("Amazon Impale 1HT matches published javelin table EIAS boundaries", () => {
  const input = { weaponCode: "jav", weaponWSM: -10, weaponClass: "1ht" as const, gearIAS: 0, weaponIAS: 0 };
  const baseline = calculateAmazonImpaleReference(input);
  assert.equal(baseline.status, "REFERENCE_BASED");
  if (baseline.status !== "REFERENCE_BASED") return;
  assert.equal(baseline.effectiveIAS, 10);
  assert.equal(baseline.frames, 27);

  // 9 gear IAS gives 8 item EIAS, reaching EIAS 18 and the 24-frame tier.
  const exact = calculateAmazonImpaleReference({ ...input, gearIAS: 9 });
  assert.equal(exact.status, "REFERENCE_BASED");
  if (exact.status === "REFERENCE_BASED") {
    assert.equal(exact.effectiveIAS, 18);
    assert.equal(exact.frames, 24);
  }
});

test("Amazon Impale 2HT matches the published spear table", () => {
  const result = calculateAmazonImpaleReference({
    weaponCode: "spr", weaponWSM: -10, weaponClass: "2ht", gearIAS: 0, weaponIAS: 0,
  });
  assert.equal(result.status, "REFERENCE_BASED");
  if (result.status === "REFERENCE_BASED") {
    assert.equal(result.effectiveIAS, 10);
    assert.equal(result.frames, 31);
  }
});

test("Impale refuses unknown WSM, mismatched class, non-spear weapons, and out-of-table EIAS", () => {
  const base = { weaponCode: "glv", weaponWSM: 20, weaponClass: "1ht" as const, gearIAS: 0, weaponIAS: 0 };
  const boundary = calculateAmazonImpaleReference(base);
  assert.equal(boundary.status, "REFERENCE_BASED");
  if (boundary.status === "REFERENCE_BASED") {
    assert.equal(boundary.effectiveIAS, -20);
    assert.equal(boundary.frames, 42);
  }
  assert.equal(calculateAmazonImpaleReference({ ...base, weaponWSM: 0 }).status, "INVALID_INPUT");
  assert.equal(calculateAmazonImpaleReference({ ...base, weaponClass: "2ht" }).status, "INVALID_INPUT");
  assert.equal(calculateAmazonImpaleReference({ ...base, weaponCode: "dgr", weaponWSM: -20 }).status, "UNSUPPORTED");
  assert.equal(calculateAmazonImpaleReference({ ...base, skillEIAS: -100 }).status, "UNSUPPORTED");
});
