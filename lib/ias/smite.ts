import { getSmiteBreakpointDetails, getSmiteGoldenRow } from "./smite-golden.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import type { IASResult } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";

export function calculateSupportedSmite(input: NormalizedIASInput): IASResult {
  const weapon = IAS_WEAPONS[input.weaponCode];
  if (!weapon) return unavailable("UNVERIFIED_WEAPON", "강타 무기 기준값을 찾을 수 없습니다.");
  const itemEffectiveIAS = Math.floor((120 * input.totalIAS) / (120 + input.totalIAS));
  const eiasRaw = itemEffectiveIAS - weapon.resolvedWeaponSpeedModifier;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const speedIncrease = Math.floor((256 * (100 + eiasApplied)) / 100);
  if (speedIncrease <= 0) return unavailable("INVALID_INPUT", "계산된 애니메이션 속도가 유효하지 않습니다.");
  const frames = Math.ceil((256 * 12) / speedIncrease) - 1;
  const expected = getSmiteGoldenRow(input.weaponCode, input.totalIAS);
  if (!expected || expected.expectedFrames !== frames || expected.EIAS !== eiasApplied) return unavailable("GOLDEN_DATA_MISMATCH", "강타 결과가 고정 Golden 기준표와 일치하지 않습니다.");
  const breakpoint = getSmiteBreakpointDetails(input.weaponCode, input.totalIAS);
  if (!breakpoint) return unavailable("GOLDEN_DATA_MISMATCH", "강타 Golden 기준표에 입력값이 없습니다.");
  return {
    status: "SUPPORTED", reasonCode: "SUPPORTED_GOLDEN_MATCH", fullAnimationFrames: frames,
    totalIAS: input.totalIAS, effectiveIAS: eiasApplied, ...breakpoint,
    evidenceVersion: "D2R-3.3.93847-IAS-4C-SMITE", reason: "강타 S1 기준표와 일치한 단일 공격 동작입니다.",
    trace: { weaponSpeedModifier: weapon.resolvedWeaponSpeedModifier, totalIAS: input.totalIAS, itemEffectiveIAS, eiasRaw, eiasApplied, animationSpeed: 256, framesPerDirection: 12, startingFrame: 0, speedIncrease, fullAnimationFrames: frames },
  };
}

function unavailable(reasonCode: IASResult["reasonCode"], reason: string): IASResult {
  return { status: "UNVERIFIED", reasonCode, fullAnimationFrames: null, totalIAS: null, effectiveIAS: null, currentBreakpoint: null, nextBreakpoint: null, requiredAdditionalIAS: null, evidenceVersion: null, reason };
}
