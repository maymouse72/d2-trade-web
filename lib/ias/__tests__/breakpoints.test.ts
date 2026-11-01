import assert from "node:assert/strict";
import test from "node:test";
import { deriveGoldenBreakpoints, getBreakpointDetails } from "../breakpoints.ts";

test("derives weapon-specific boundaries from Golden frame changes", () => {
  assert.deepEqual(deriveGoldenBreakpoints("crs"), [0, 9, 19, 32, 54, 86, 152]);
  assert.deepEqual(deriveGoldenBreakpoints("7cr"), [0, 8, 24, 54]);
  assert.deepEqual(deriveGoldenBreakpoints("whm"), [0, 5, 10, 16, 24, 37, 52, 72, 109, 168, 317]);
});

test("checks each breakpoint at minus one, exact, and plus one", () => {
  const expected = [
    [0, 14],
    [1, 14],
    [8, 14],
    [9, 13],
    [10, 13],
    [18, 13],
    [19, 12],
    [20, 12],
    [31, 12],
    [32, 11],
    [33, 11],
    [53, 11],
    [54, 10],
    [55, 10],
    [85, 10],
    [86, 9],
    [87, 9],
    [151, 9],
    [152, 8],
    [153, 8],
  ] as const;

  for (const [ias, frames] of expected) {
    assert.equal(getBreakpointDetails(ias, "crs")?.fullAnimationFrames, frames, `IAS ${ias}`);
  }
  assert.equal(getBreakpointDetails(-1), null);
});

test("reports current, next, and additional IAS from Golden data", () => {
  assert.deepEqual(getBreakpointDetails(40, "crs"), {
    currentBreakpoint: 32,
    nextBreakpoint: 54,
    requiredAdditionalIAS: 14,
    fullAnimationFrames: 11,
  });
  assert.deepEqual(getBreakpointDetails(54, "crs"), {
    currentBreakpoint: 54,
    nextBreakpoint: 86,
    requiredAdditionalIAS: 32,
    fullAnimationFrames: 10,
  });
  for (const ias of [152, 200]) {
    assert.deepEqual(getBreakpointDetails(ias, "crs"), {
      currentBreakpoint: 152,
      nextBreakpoint: null,
      requiredAdditionalIAS: null,
      fullAnimationFrames: 8,
    });
  }
});

test("Phase Blade and War Hammer details use their own frame ranges", () => {
  assert.deepEqual(getBreakpointDetails(23, "7cr"), { currentBreakpoint: 8, nextBreakpoint: 24, requiredAdditionalIAS: 1, fullAnimationFrames: 10 });
  assert.deepEqual(getBreakpointDetails(316, "whm"), { currentBreakpoint: 168, nextBreakpoint: 317, requiredAdditionalIAS: 1, fullAnimationFrames: 9 });
  assert.deepEqual(getBreakpointDetails(317, "whm"), { currentBreakpoint: 317, nextBreakpoint: null, requiredAdditionalIAS: null, fullAnimationFrames: 8 });
  assert.equal(getBreakpointDetails(318, "whm"), null);
});
