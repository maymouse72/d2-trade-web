import { getBarbarianBreakpoints, getBarbarianGoldenFrameCount } from "./barbarian-golden.ts";
import { getBarbarianWeapon } from "./class-registry.ts";
import type { IASResult, CalculationTrace } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";

export const BARBARIAN_A1 = { animationClass: "BAA11HS", animationSpeed: 256, framesPerDirection: 16, startingFrame: 0 } as const;

export function calculateBarbarianNormalAttack(input: NormalizedIASInput): IASResult {
  const weapon = getBarbarianWeapon(input.weaponCode);
  if (!weapon) return { status: "UNVERIFIED", reasonCode: "UNVERIFIED_WEAPON", fullAnimationFrames: null, totalIAS: null, effectiveIAS: null, currentBreakpoint: null, nextBreakpoint: null, requiredAdditionalIAS: null, evidenceVersion: null, reason: "야만용사 일반 공격 무기의 원본 검증이 완료되지 않았습니다." };
  const itemEffectiveIAS = Math.floor(120 * input.totalIAS / (120 + input.totalIAS));
  const eiasRaw = itemEffectiveIAS - weapon.weaponSpeedModifier;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const speedIncrease = Math.floor(BARBARIAN_A1.animationSpeed * (100 + eiasApplied) / 100);
  const frames = Math.ceil(256 * (weapon.framesPerDirection - weapon.startingFrame) / speedIncrease) - 1;
  if (frames !== getBarbarianGoldenFrameCount(input.weaponCode, input.totalIAS)) {
    return { status: "UNVERIFIED", reasonCode: "GOLDEN_DATA_MISMATCH", fullAnimationFrames: null, totalIAS: null, effectiveIAS: null, currentBreakpoint: null, nextBreakpoint: null, requiredAdditionalIAS: null, evidenceVersion: null, reason: "야만용사 계산이 공개 기준 Golden과 일치하지 않습니다." };
  }
  const breakpointRows = getBarbarianBreakpoints(input.weaponCode);
  const currentBreakpoint = breakpointRows.filter((row) => row.ias <= input.totalIAS).at(-1)?.ias ?? 0;
  const nextBreakpoint = breakpointRows.find((row) => row.ias > input.totalIAS)?.ias ?? null;
  const trace: CalculationTrace = {
    weaponSpeedModifier: weapon.weaponSpeedModifier, totalIAS: input.totalIAS, itemEffectiveIAS,
    eiasRaw, eiasApplied, animationSpeed: BARBARIAN_A1.animationSpeed, framesPerDirection: weapon.framesPerDirection,
    startingFrame: weapon.startingFrame, speedIncrease, fullAnimationFrames: frames,
  };
  return { status: "SUPPORTED", reasonCode: "SUPPORTED_GOLDEN_MATCH", fullAnimationFrames: frames, totalIAS: input.totalIAS,
    effectiveIAS: eiasApplied, currentBreakpoint, nextBreakpoint, requiredAdditionalIAS: nextBreakpoint === null ? null : nextBreakpoint - input.totalIAS,
    evidenceVersion: "D2R-3.3.93847-IAS-5C2-BARBARIAN-NORMAL", reason: `야만용사 A1 · ${weapon.animationClass} · ${weapon.weaponClass} WSM ${weapon.weaponSpeedModifier} 공개 기준표와 일치`, trace };
}
