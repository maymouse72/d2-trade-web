export interface BarbarianGoldenRow {
  gameBuild: "3.3.93847";
  characterClass: "BARBARIAN";
  skill: "BARBARIAN_NORMAL_ATTACK";
  weaponCode: "crs" | "lsd" | "7cr" | "mpi" | "whm";
  weaponClass: "1hs";
  WSM: number;
  animationMode: "A1";
  animationClass: "BAA11HS";
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

export function getBarbarianMaxIAS(weaponCode: string): number | null {
  return WEAPON_DATA.find((weapon) => weapon.code === weaponCode)?.maxIAS ?? null;
}

export function getBarbarianGoldenFrameCount(weaponCode: string, ias: number): number | null {
  const weapon = WEAPON_DATA.find((entry) => entry.code === weaponCode);
  if (!weapon || !Number.isInteger(ias) || ias < 0 || ias > weapon.maxIAS) return null;
  const steps = PUBLISHED_STEPS_BY_WSM[weapon.WSM];
  let frames: number = steps[0][1];
  for (const [start, expected] of steps) if (ias >= start) frames = expected;
  return frames;
}

export function getBarbarianBreakpoints(weaponCode: string) {
  return BARBARIAN_GOLDEN_ROWS.filter((row) => row.weaponCode === weaponCode).map(({ IAS, expectedFrames }) => ({ ias: IAS, fullAnimationFrames: expectedFrames }));
}
