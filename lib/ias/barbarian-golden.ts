export interface BarbarianGoldenRow {
  gameBuild: "3.3.93847";
  characterClass: "BARBARIAN";
  skill: "BARBARIAN_NORMAL_ATTACK";
  weaponCode: "crs";
  WSM: 0;
  animationMode: "A1";
  animationClass: "BAA11HS";
  IAS: number;
  EIAS: number;
  expectedFrames: number;
  breakpoint: boolean;
  evidenceSource: string;
  verificationStatus: "VERIFIED";
}

const SOURCE = "https://d2r.org/tools/breakpoints/barbarian (one-handed swing WSM 0; published IAS intervals)";
const PUBLISHED_STEPS = [[0, 15], [9, 14], [18, 13], [30, 12], [48, 11], [75, 10], [125, 9]] as const;

export const BARBARIAN_GOLDEN_ROWS: readonly BarbarianGoldenRow[] = PUBLISHED_STEPS.map(([ias, frames]) => ({
  gameBuild: "3.3.93847", characterClass: "BARBARIAN", skill: "BARBARIAN_NORMAL_ATTACK", weaponCode: "crs", WSM: 0,
  animationMode: "A1", animationClass: "BAA11HS", IAS: ias,
  EIAS: Math.max(-85, Math.min(75, Math.floor(120 * ias / (120 + ias)))),
  expectedFrames: frames, breakpoint: true, evidenceSource: SOURCE, verificationStatus: "VERIFIED",
}));

export function getBarbarianGoldenFrameCount(ias: number): number | null {
  if (!Number.isInteger(ias) || ias < 0 || ias > 200) return null;
  let frames: number = PUBLISHED_STEPS[0][1];
  for (const [start, expected] of PUBLISHED_STEPS) if (ias >= start) frames = expected;
  return frames;
}

export function getBarbarianBreakpoints() {
  return BARBARIAN_GOLDEN_ROWS.map(({ IAS, expectedFrames }) => ({ ias: IAS, fullAnimationFrames: expectedFrames }));
}
