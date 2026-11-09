export interface BarbarianGoldenRow {
  gameBuild: "3.3.93847";
  characterClass: "BARBARIAN";
  skill: "BARBARIAN_NORMAL_ATTACK" | "BARBARIAN_TWO_HANDED_NORMAL_ATTACK";
  weaponCode: "crs" | "lsd" | "7cr" | "mpi" | "whm" | "7fb" | "72h" | "9fb";
  weaponClass: "1hs" | "2hs";
  WSM: number;
  animationMode: "A1";
  animationClass: "BAA11HS" | "BAA12HS";
  IAS: number;
  EIAS: number;
  expectedFrames: number;
  breakpoint: boolean;
  evidenceSource: string;
  verificationStatus: "VERIFIED";
}

const PUBLISHED_STEPS_BY_WSM: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  [-30]: [[0, 12], [5, 11], [19, 10], [42, 9]],
  [-10]: [[0, 14], [6, 13], [16, 12], [30, 11], [52, 10], [89, 9]],
  [0]: [[0, 15], [9, 14], [18, 13], [30, 12], [48, 11], [75, 10], [125, 9]],
  [20]: [[0, 20], [2, 19], [6, 18], [11, 17], [18, 16], [24, 15], [37, 14], [50, 13], [70, 12], [99, 11], [147, 10], [250, 9]],
};
// Amazon Basin Barbarian 2-Handed Swing, WSM +10 column. Colossal Sword
// uses its 2hs profile only when equipped in both hands by a Barbarian.
const TWO_HANDED_STEPS: readonly (readonly [number, number])[] = [
  [0, 20], [2, 19], [6, 18], [11, 17], [20, 16], [29, 15],
  [42, 14], [58, 13], [83, 12], [120, 11], [194, 10],
];
const TWO_HANDED_C3_STEPS: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
  "72h": [[0, 15], [7, 14], [16, 13], [30, 12], [50, 11], [83, 10]],
  "9fb": [[0, 16], [4, 15], [13, 14], [23, 13], [39, 12], [60, 11], [99, 10]],
};
const TWO_HANDED_WEAPON_DATA = [
  { code: "72h", WSM: -15 }, { code: "9fb", WSM: -10 },
] as const;
const WEAPON_DATA = [
  { code: "crs", WSM: 0, maxIAS: 200 }, { code: "lsd", WSM: -10, maxIAS: 142 },
  { code: "7cr", WSM: -30, maxIAS: 72 }, { code: "mpi", WSM: -10, maxIAS: 142 }, { code: "whm", WSM: 20, maxIAS: 456 },
] as const;
const SOURCE = "Amazon Basin Barbarian 1 Handed Swing breakpoint table; D2R.org build 3.3.93847 animation and IAS formula cross-check";

export const BARBARIAN_GOLDEN_ROWS: readonly BarbarianGoldenRow[] = WEAPON_DATA.flatMap(({ code, WSM }) =>
  PUBLISHED_STEPS_BY_WSM[WSM].map(([ias, frames]) => ({
    gameBuild: "3.3.93847", characterClass: "BARBARIAN", skill: "BARBARIAN_NORMAL_ATTACK", weaponCode: code,
    weaponClass: "1hs", WSM, animationMode: "A1", animationClass: "BAA11HS", IAS: ias,
    EIAS: Math.max(-85, Math.min(75, Math.floor(120 * ias / (120 + ias)) - WSM)),
    expectedFrames: frames, breakpoint: true, evidenceSource: SOURCE, verificationStatus: "VERIFIED",
  })),
);

export const BARBARIAN_TWO_HANDED_GOLDEN_ROWS: readonly BarbarianGoldenRow[] = TWO_HANDED_STEPS.map(([ias, expectedFrames]) => ({
  gameBuild: "3.3.93847", characterClass: "BARBARIAN", skill: "BARBARIAN_TWO_HANDED_NORMAL_ATTACK", weaponCode: "7fb",
  weaponClass: "2hs", WSM: 10, animationMode: "A1", animationClass: "BAA12HS", IAS: ias,
  EIAS: Math.max(-85, Math.min(75, Math.floor(120 * ias / (120 + ias)) - 10)),
  expectedFrames, breakpoint: true, evidenceSource: "Amazon Basin Barbarian 2-Handed Swing table, WSM +10; D2R 3.3.93847 weapons.txt and BAA12HS COF mapping", verificationStatus: "VERIFIED",
}));
export const BARBARIAN_C3_TWO_HANDED_GOLDEN_ROWS: readonly BarbarianGoldenRow[] = TWO_HANDED_WEAPON_DATA.flatMap(({ code, WSM }) =>
  TWO_HANDED_C3_STEPS[code].map(([ias, expectedFrames]) => ({
    gameBuild: "3.3.93847", characterClass: "BARBARIAN", skill: "BARBARIAN_TWO_HANDED_NORMAL_ATTACK", weaponCode: code,
    weaponClass: "2hs", WSM, animationMode: "A1", animationClass: "BAA12HS", IAS: ias,
    EIAS: Math.max(-85, Math.min(75, Math.floor(120 * ias / (120 + ias)) - WSM)),
    expectedFrames, breakpoint: true,
    evidenceSource: "D2R 3.3.93847 weapon catalog WSM + shared Barbarian 2HS A1 animation; TrAdia D2R 93847 and Warren1001 v1.2.6 breakpoint tables; Amazon Basin Barbarian 2HS table/formula cross-check",
    verificationStatus: "VERIFIED",
  })),
);

export function getBarbarianMaxIAS(weaponCode: string): number | null {
  if (weaponCode === "7fb" || TWO_HANDED_C3_STEPS[weaponCode]) return 200;
  return WEAPON_DATA.find((weapon) => weapon.code === weaponCode)?.maxIAS ?? null;
}

export function getBarbarianGoldenFrameCount(weaponCode: string, ias: number): number | null {
  const weapon = WEAPON_DATA.find((entry) => entry.code === weaponCode);
  if (weaponCode === "7fb" || TWO_HANDED_C3_STEPS[weaponCode]) {
    if (!Number.isInteger(ias) || ias < 0 || ias > 200) return null;
    const steps = weaponCode === "7fb" ? TWO_HANDED_STEPS : TWO_HANDED_C3_STEPS[weaponCode];
    let frames = steps[0][1];
    for (const [start, expected] of steps) if (ias >= start) frames = expected;
    return frames;
  }
  if (!weapon || !Number.isInteger(ias) || ias < 0 || ias > weapon.maxIAS) return null;
  const steps = PUBLISHED_STEPS_BY_WSM[weapon.WSM];
  let frames: number = steps[0][1];
  for (const [start, expected] of steps) if (ias >= start) frames = expected;
  return frames;
}

export function getBarbarianBreakpoints(weaponCode: string) {
  if (weaponCode === "7fb") return BARBARIAN_TWO_HANDED_GOLDEN_ROWS.map(({ IAS, expectedFrames }) => ({ ias: IAS, fullAnimationFrames: expectedFrames }));
  if (TWO_HANDED_C3_STEPS[weaponCode]) return BARBARIAN_C3_TWO_HANDED_GOLDEN_ROWS.filter((row) => row.weaponCode === weaponCode).map(({ IAS, expectedFrames }) => ({ ias: IAS, fullAnimationFrames: expectedFrames }));
  return BARBARIAN_GOLDEN_ROWS.filter((row) => row.weaponCode === weaponCode).map(({ IAS, expectedFrames }) => ({ ias: IAS, fullAnimationFrames: expectedFrames }));
}
