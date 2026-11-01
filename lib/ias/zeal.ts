import { getZealBreakpointDetails, getZealGoldenRow } from "./zeal-golden.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import type { IASResult } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";

function emptyResult(status: IASResult["status"], reasonCode: IASResult["reasonCode"], reason: string): IASResult {
  return {
    status,
    reasonCode,
    fullAnimationFrames: null,
    totalIAS: null,
    effectiveIAS: null,
    currentBreakpoint: null,
    nextBreakpoint: null,
    requiredAdditionalIAS: null,
    evidenceVersion: null,
    reason,
    zealSequence: null,
  };
}

export function calculateSupportedZeal(input: NormalizedIASInput): IASResult {
  const weapon = IAS_WEAPONS[input.weaponCode];
  if (!weapon) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "열의 무기 기준값을 찾을 수 없습니다.");

  const itemEffectiveIAS = Math.floor((120 * input.totalIAS) / (120 + input.totalIAS));
  const eiasRaw = itemEffectiveIAS - weapon.resolvedWeaponSpeedModifier;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const speedIncrease = Math.floor((256 * (100 + eiasApplied)) / 100);
  if (speedIncrease <= 0) return emptyResult("INVALID_INPUT", "INVALID_INPUT", "계산된 애니메이션 속도가 유효하지 않습니다.");

  const firstAttackFrames = Math.ceil((256 * 7) / speedIncrease);
  const followUpAttackFrames = firstAttackFrames;
  const finalAttackFrames = Math.ceil((256 * 15) / speedIncrease) - 1;
  const hitCount = input.hitCount;
  const totalSequenceFrames = firstAttackFrames + (hitCount - 2) * followUpAttackFrames + finalAttackFrames;
  const expected = getZealGoldenRow(input.weaponCode, input.totalIAS, hitCount);
  if (
    !expected || expected.EIAS !== eiasApplied || expected.firstAttackFrames !== firstAttackFrames ||
    expected.followUpAttackFrames !== followUpAttackFrames || expected.finalAttackFrames !== finalAttackFrames ||
    expected.totalSequenceFrames !== totalSequenceFrames
  ) {
    return emptyResult("UNVERIFIED", "GOLDEN_DATA_MISMATCH", "열의 계산 결과가 고정 기준표 Golden Dataset과 일치하지 않아 숫자를 표시하지 않습니다.");
  }

  const breakpoint = getZealBreakpointDetails(input.weaponCode, input.totalIAS, hitCount);
  if (!breakpoint) return emptyResult("UNVERIFIED", "GOLDEN_DATA_MISMATCH", "열의 Golden Dataset에 해당 입력이 없습니다.");

  return {
    status: "SUPPORTED",
    reasonCode: "SUPPORTED_GOLDEN_MATCH",
    fullAnimationFrames: totalSequenceFrames,
    totalIAS: input.totalIAS,
    effectiveIAS: eiasApplied,
    currentBreakpoint: breakpoint.currentBreakpoint,
    nextBreakpoint: breakpoint.nextBreakpoint,
    requiredAdditionalIAS: breakpoint.requiredAdditionalIAS,
    evidenceVersion: "D2R-3.3.93847-IAS-4B2-ZEAL",
    reason: `열의 ${hitCount}회 연속 공격의 Paladin A1 Zeal 기준표 일치 결과입니다.`,
    trace: {
      weaponSpeedModifier: weapon.resolvedWeaponSpeedModifier,
      totalIAS: input.totalIAS,
      itemEffectiveIAS,
      eiasRaw,
      eiasApplied,
      animationSpeed: 256,
      framesPerDirection: 15,
      startingFrame: 0,
      speedIncrease,
      fullAnimationFrames: totalSequenceFrames,
    },
    zealSequence: {
      hitCount,
      firstHitFrame: expected.hitEventFrames[0],
      subsequentHitFrames: followUpAttackFrames,
      finalHitFrame: expected.hitEventFrames[hitCount - 1],
      firstAttackFrames,
      followUpAttackFrames,
      finalAttackFrames,
      totalSequenceFrames,
    },
  };
}
