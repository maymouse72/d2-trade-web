import { IAS_WEAPONS } from "./weapons.ts";
import { getBarbarianGoldenFrameCount } from "./barbarian-golden.ts";
import type { IASResult, CalculationTrace } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";

export const BARBARIAN_A1 = { animationClass: "BAA11HS", animationSpeed: 256, framesPerDirection: 16, startingFrame: 0 } as const;

export function calculateBarbarianNormalAttack(input: NormalizedIASInput): IASResult {
  const weapon = IAS_WEAPONS[input.weaponCode];
  const itemEffectiveIAS = Math.floor(120 * input.totalIAS / (120 + input.totalIAS));
  const eiasRaw = itemEffectiveIAS - weapon.resolvedWeaponSpeedModifier;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const speedIncrease = Math.floor(BARBARIAN_A1.animationSpeed * (100 + eiasApplied) / 100);
  const frames = Math.ceil(256 * (BARBARIAN_A1.framesPerDirection - BARBARIAN_A1.startingFrame) / speedIncrease) - 1;
  if (frames !== getBarbarianGoldenFrameCount(input.totalIAS)) {
    return { status: "UNVERIFIED", reasonCode: "GOLDEN_DATA_MISMATCH", fullAnimationFrames: null, totalIAS: null, effectiveIAS: null, currentBreakpoint: null, nextBreakpoint: null, requiredAdditionalIAS: null, evidenceVersion: null, reason: "야만용사 계산이 공개 기준 Golden과 일치하지 않습니다." };
  }
  let currentBreakpoint = 0;
  let nextBreakpoint: number | null = null;
  for (let ias = 0; ias <= 200; ias++) {
    if (getBarbarianGoldenFrameCount(ias) === frames) currentBreakpoint = ias;
    else if (ias > input.totalIAS && (getBarbarianGoldenFrameCount(ias) ?? frames) < frames) { nextBreakpoint = ias; break; }
  }
  const trace: CalculationTrace = {
    weaponSpeedModifier: weapon.resolvedWeaponSpeedModifier, totalIAS: input.totalIAS, itemEffectiveIAS,
    eiasRaw, eiasApplied, animationSpeed: BARBARIAN_A1.animationSpeed, framesPerDirection: BARBARIAN_A1.framesPerDirection,
    startingFrame: BARBARIAN_A1.startingFrame, speedIncrease, fullAnimationFrames: frames,
  };
  return { status: "SUPPORTED", reasonCode: "SUPPORTED_GOLDEN_MATCH", fullAnimationFrames: frames, totalIAS: input.totalIAS,
    effectiveIAS: eiasApplied, currentBreakpoint, nextBreakpoint, requiredAdditionalIAS: nextBreakpoint === null ? null : nextBreakpoint - input.totalIAS,
    evidenceVersion: "D2R-3.3.93847-IAS-5B-BARBARIAN", reason: "야만용사 일반 공격 A1 · BAA11HS · WSM 0 공개 기준표와 일치", trace };
}
