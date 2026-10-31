import assert from "node:assert/strict";
import test from "node:test";
import { deriveGoldenBreakpoints, getBreakpointDetails } from "../breakpoints.ts";

test("derives the expected boundaries from Golden frame changes", () => {
  assert.deepEqual(deriveGoldenBreakpoints(), [0, 9, 19, 32, 54, 86, 152]);
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
    assert.equal(getBreakpointDetails(ias)?.fullAnimationFrames, frames, `IAS ${ias}`);
  }
  assert.equal(getBreakpointDetails(-1), null);
});

test("reports current, next, and additional IAS from Golden data", () => {
  assert.deepEqual(getBreakpointDetails(40), {
    currentBreakpoint: 32,
    nextBreakpoint: 54,
    requiredAdditionalIAS: 14,
    fullAnimationFrames: 11,
  });
  assert.deepEqual(getBreakpointDetails(54), {
    currentBreakpoint: 54,
    nextBreakpoint: 86,
    requiredAdditionalIAS: 32,
    fullAnimationFrames: 10,
  });
  for (const ias of [152, 200]) {
    assert.deepEqual(getBreakpointDetails(ias), {
      currentBreakpoint: 152,
      nextBreakpoint: null,
      requiredAdditionalIAS: null,
      fullAnimationFrames: 8,
    });
  }
});
