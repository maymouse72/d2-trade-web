import assert from "node:assert/strict";
import test from "node:test";
import { calculateIAS } from "../calculate.ts";
import { evaluateIASSupport } from "../support-policy.ts";
import { BARBARIAN_GOLDEN_ROWS, BARBARIAN_TWO_HANDED_GOLDEN_ROWS, BARBARIAN_C3_TWO_HANDED_GOLDEN_ROWS, getBarbarianBreakpoints, getBarbarianGoldenFrameCount, getBarbarianMaxIAS } from "../barbarian-golden.ts";
import { getCalculatorViewModelFromParts, getWeaponBreakpoints } from "../ui-model.ts";
import { BARBARIAN_WEAPONS, BARBARIAN_TWO_HANDED_WEAPONS, IAS_SUPPORTED_CLASSES } from "../class-registry.ts";

const base = { characterClass: "BARBARIAN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "BARBARIAN_NORMAL_ATTACK", weaponCode: "crs", weaponIAS: 0, offWeaponIAS: 0 };
const referenceSteps: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
  "7cr": [[0, 12], [5, 11], [19, 10], [42, 9]],
  lsd: [[0, 14], [6, 13], [16, 12], [30, 11], [52, 10], [89, 9]],
  mpi: [[0, 14], [6, 13], [16, 12], [30, 11], [52, 10], [89, 9]],
  crs: [[0, 15], [9, 14], [18, 13], [30, 12], [48, 11], [75, 10], [125, 9]],
  whm: [[0, 20], [2, 19], [6, 18], [11, 17], [18, 16], [24, 15], [37, 14], [50, 13], [70, 12], [99, 11], [147, 10], [250, 9]],
};

test("class registry covers target classes and source-verified Barbarian one- and two-handed weapons", () => {
  assert.equal(IAS_SUPPORTED_CLASSES.length, 7);
  assert.deepEqual(Object.keys(BARBARIAN_WEAPONS).sort(), ["7cr", "crs", "lsd", "mpi", "whm"]);
  assert.deepEqual(Object.fromEntries(Object.values(BARBARIAN_WEAPONS).map(({ code, weaponSpeedModifier }) => [code, weaponSpeedModifier])), { crs: 0, lsd: -10, "7cr": -30, mpi: -10, whm: 20 });
  assert.equal(BARBARIAN_GOLDEN_ROWS.length, 35);
  assert.ok(BARBARIAN_GOLDEN_ROWS.every(row => row.gameBuild === "3.3.93847" && row.weaponClass === "1hs" && row.animationClass === "BAA11HS" && row.verificationStatus === "VERIFIED"));
  assert.deepEqual(Object.keys(BARBARIAN_TWO_HANDED_WEAPONS).sort(), ["72h", "7fb", "9fb"]);
});

test("all weapon IAS values match independent Barbarian 1HS WSM breakpoint intervals", () => {
  for (const [weaponCode, steps] of Object.entries(referenceSteps)) {
    const maxIAS = getBarbarianMaxIAS(weaponCode)!;
    for (let ias = 0; ias <= maxIAS; ias++) {
      const expected = [...steps].reverse().find(([start]) => ias >= start)![1];
      assert.equal(getBarbarianGoldenFrameCount(weaponCode, ias), expected, `${weaponCode} Golden IAS ${ias}`);
      const result = calculateIAS({ ...base, weaponCode, weaponIAS: ias });
      assert.equal(result.status, "SUPPORTED", `${weaponCode} IAS ${ias}`);
      assert.equal(result.fullAnimationFrames, expected, `${weaponCode} IAS ${ias}`);
      assert.equal(result.trace?.weaponSpeedModifier, BARBARIAN_WEAPONS[weaponCode].weaponSpeedModifier);
      const currentThreshold = [...steps].reverse().find(([start]) => ias >= start)![0];
      const nextThreshold = steps.find(([start]) => start > ias)?.[0] ?? null;
      assert.equal(result.currentBreakpoint, currentThreshold, `${weaponCode} current breakpoint at ${ias}`);
      assert.equal(result.nextBreakpoint, nextThreshold, `${weaponCode} next breakpoint at ${ias}`);
    }
  }
});

test("each weapon breakpoint is checked at the preceding and exact IAS values", () => {
  for (const [weaponCode, steps] of Object.entries(referenceSteps)) {
    for (const [ias, frames] of steps) {
      assert.equal(calculateIAS({ ...base, weaponCode, weaponIAS: ias }).fullAnimationFrames, frames, `${weaponCode} IAS ${ias}`);
      if (ias > 0) assert.notEqual(calculateIAS({ ...base, weaponCode, weaponIAS: ias - 1 }).fullAnimationFrames, frames, `${weaponCode} threshold -1`);
    }
  }
});

test("only verified Barbarian weapon, animation, form, range, and no-modifier conditions calculate", () => {
  for (const weaponCode of Object.keys(BARBARIAN_WEAPONS)) assert.equal(evaluateIASSupport({ ...base, weaponCode }).status, "SUPPORTED");
  for (const invalid of [
    { ...base, weaponCode: "hax" }, { ...base, weaponCode: "whm", weaponIAS: 457 }, { ...base, weaponCode: "7cr", weaponIAS: 73 },
    { ...base, weaponCode: "lsd", weaponIAS: 143 }, { ...base, weaponCode: "mpi", weaponIAS: 143 }, { ...base, animation: "A2" },
    { ...base, characterForm: "WEREWOLF" }, { ...base, fanaticismLevel: 1 }, { ...base, skillIAS: 1 },
    { ...base, buffIAS: 1 }, { ...base, debuffIAS: 1 }, { ...base, weaponIAS: 201 },
    { ...base, skill: "ZEAL" }, { ...base, characterClass: "AMAZON" },
  ]) {
    assert.notEqual(calculateIAS(invalid).status, "SUPPORTED", JSON.stringify(invalid));
    assert.equal(calculateIAS(invalid).fullAnimationFrames, null);
  }
  assert.equal(getCalculatorViewModelFromParts("0", "143", { characterClass: "BARBARIAN", weaponCode: "lsd", animation: "A1", skill: "BARBARIAN_NORMAL_ATTACK" }).status, "INVALID_INPUT");
  assert.equal(getCalculatorViewModelFromParts("0", "457", { characterClass: "BARBARIAN", weaponCode: "whm", animation: "A1", skill: "BARBARIAN_NORMAL_ATTACK" }).status, "INVALID_INPUT");
});

test("weapon-specific breakpoint UI and existing Crystal Sword/Paladin results remain intact", () => {
  for (const [weaponCode, steps] of Object.entries(referenceSteps)) {
    const expected = steps.map(([ias, fullAnimationFrames]) => ({ ias, fullAnimationFrames }));
    assert.deepEqual(getBarbarianBreakpoints(weaponCode), expected);
    assert.deepEqual(getWeaponBreakpoints(weaponCode, "A1", "BARBARIAN_NORMAL_ATTACK"), expected);
  }
  assert.deepEqual(getWeaponBreakpoints("hax", "A1", "BARBARIAN_NORMAL_ATTACK"), []);
  assert.equal(calculateIAS({ ...base, weaponIAS: 0 }).fullAnimationFrames, 15);
  assert.equal(calculateIAS({ characterClass: "PALADIN", characterForm: "HUMAN", attackMode: "NORMAL", animation: "A1", skill: "NORMAL_ATTACK", weaponCode: "crs", weaponIAS: 40, offWeaponIAS: 0 }).fullAnimationFrames, 11);
});

test("Colossal Sword two-hand A1 uses its independent BAA12HS 2HS WSM +10 breakpoint table", () => {
  const twoHandBase = { ...base, skill: "BARBARIAN_TWO_HANDED_NORMAL_ATTACK", weaponCode: "7fb" };
  const steps = [[0, 20], [2, 19], [6, 18], [11, 17], [20, 16], [29, 15], [42, 14], [58, 13], [83, 12], [120, 11], [194, 10]] as const;
  assert.equal(BARBARIAN_TWO_HANDED_GOLDEN_ROWS.length, steps.length);
  assert.equal(getBarbarianMaxIAS("7fb"), 200);
  for (let ias = 0; ias <= 200; ias++) {
    const expected = [...steps].reverse().find(([start]) => ias >= start)![1];
    const result = calculateIAS({ ...twoHandBase, weaponIAS: ias });
    assert.equal(result.status, "SUPPORTED", `Colossal Sword 2HS IAS ${ias}`);
    assert.equal(result.fullAnimationFrames, expected, `Colossal Sword 2HS IAS ${ias}`);
    assert.equal(result.trace?.framesPerDirection, 18);
    assert.equal(result.trace?.weaponSpeedModifier, 10);
  }
  assert.deepEqual(getWeaponBreakpoints("7fb", "A1", "BARBARIAN_TWO_HANDED_NORMAL_ATTACK"), steps.map(([ias, fullAnimationFrames]) => ({ ias, fullAnimationFrames })));
  assert.notEqual(calculateIAS({ ...twoHandBase, weaponIAS: 0 }).fullAnimationFrames, calculateIAS({ ...twoHandBase, weaponIAS: 2 }).fullAnimationFrames);
  assert.equal(calculateIAS({ ...twoHandBase, weaponCode: "crs" }).fullAnimationFrames, null);
  assert.equal(calculateIAS({ ...twoHandBase, weaponIAS: 201 }).fullAnimationFrames, null);
});

test("IAS-5-C-3 two-handed sword Golden tables match both reference calculators over IAS 0..200", () => {
  const reference: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
    "72h": [[0, 15], [7, 14], [16, 13], [30, 12], [50, 11], [83, 10]],
    "9fb": [[0, 16], [4, 15], [13, 14], [23, 13], [39, 12], [60, 11], [99, 10]],
  };
  assert.equal(BARBARIAN_C3_TWO_HANDED_GOLDEN_ROWS.length, 13);
  for (const [weaponCode, steps] of Object.entries(reference)) {
    assert.equal(getBarbarianMaxIAS(weaponCode), 200);
    for (let ias = 0; ias <= 200; ias++) {
      const expected = [...steps].reverse().find(([start]) => ias >= start)![1];
      const result = calculateIAS({ ...base, skill: "BARBARIAN_TWO_HANDED_NORMAL_ATTACK", weaponCode, weaponIAS: ias });
      assert.equal(result.status, "SUPPORTED", `${weaponCode} IAS ${ias}`);
      assert.equal(result.fullAnimationFrames, expected, `${weaponCode} IAS ${ias}`);
      assert.equal(result.trace?.framesPerDirection, 18);
      assert.equal(result.trace?.weaponSpeedModifier, { "72h": -15, "9fb": -10 }[weaponCode as "72h" | "9fb"]);
    }
    assert.deepEqual(getBarbarianBreakpoints(weaponCode), steps.map(([ias, fullAnimationFrames]) => ({ ias, fullAnimationFrames })));
  }
});

test("IAS-5-C-3 dual wield, Double Swing, and Frenzy remain blocked without validated timing", () => {
  const dualNormal = calculateIAS({ ...base, skill: "BARBARIAN_DUAL_WIELD_NORMAL_ATTACK" });
  assert.equal(dualNormal.status, "CONFLICTED");
  assert.equal(dualNormal.fullAnimationFrames, null);
  assert.match(dualNormal.reason, /보조 손 타격 주기 기준은 공개 자료에서 확인되지 않습니다/);
  for (const skill of ["BARBARIAN_DOUBLE_SWING", "BARBARIAN_FRENZY"]) {
    const result = calculateIAS({ ...base, skill });
    assert.notEqual(result.status, "SUPPORTED", `${skill} must remain blocked`);
    assert.equal(result.fullAnimationFrames, null, `${skill} must not expose a numeric result`);
  }
  const whirlwind = calculateIAS({ ...base, skill: "BARBARIAN_WHIRLWIND" });
  assert.equal(whirlwind.status, "REFERENCE_BASED");
  assert.equal(whirlwind.fullAnimationFrames, 15);
});
