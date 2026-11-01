import { IAS_EVIDENCE_VERSION, PALADIN_CRS_A1 } from "./constants.ts";
import { getBreakpointDetails, getGoldenFrameCount } from "./breakpoints.ts";
import { evaluateIASSupport } from "./support-policy.ts";
import type { CalculationTrace, IASResult } from "./types.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_SKILLS } from "./skills.ts";
import { getSkillGoldenFrameCount } from "./skill-golden.ts";

function emptyResult(
  status: IASResult["status"],
  reasonCode: IASResult["reasonCode"],
  reason: string,
): IASResult {
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
  };
}

export function calculateIAS(input: unknown): IASResult {
  const support = evaluateIASSupport(input);
  if (support.status !== "SUPPORTED" || !support.input) {
    return emptyResult(support.status, support.reasonCode as IASResult["reasonCode"], support.reason);
  }

  const weapon = IAS_WEAPONS[support.input.weaponCode];
  const totalIAS = support.input.totalIAS;
  const itemEffectiveIAS = Math.floor((120 * totalIAS) / (120 + totalIAS));
  const eiasRaw = itemEffectiveIAS - weapon.resolvedWeaponSpeedModifier;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const speedIncrease = Math.floor((PALADIN_CRS_A1.animationSpeed * (100 + eiasApplied)) / 100);

  if (speedIncrease <= 0) {
    return emptyResult("INVALID_INPUT", "INVALID_INPUT", "계산된 애니메이션 속도가 유효하지 않습니다.");
  }

  const fullAnimationFrames =
    Math.ceil((256 * (PALADIN_CRS_A1.framesPerDirection - PALADIN_CRS_A1.startingFrame)) / speedIncrease) - 1;
  const expectedFrames = support.input.skill === "NORMAL_ATTACK"
    ? getGoldenFrameCount(support.input.weaponCode, totalIAS)
    : getSkillGoldenFrameCount(support.input.skill as keyof typeof IAS_SKILLS, support.input.weaponCode, totalIAS);
  if (expectedFrames === null || fullAnimationFrames !== expectedFrames) {
    return emptyResult(
      "UNVERIFIED",
      "GOLDEN_DATA_MISMATCH",
      "계산 결과가 독립 Golden Dataset과 일치하지 않아 숫자를 제공하지 않습니다.",
    );
  }

  const breakpoint = getBreakpointDetails(totalIAS, support.input.weaponCode);
  if (!breakpoint) {
    return emptyResult("UNVERIFIED", "GOLDEN_DATA_MISMATCH", "Golden Dataset에 해당 IAS 결과가 없습니다.");
  }

  const trace: CalculationTrace = {
    weaponSpeedModifier: weapon.resolvedWeaponSpeedModifier,
    totalIAS,
    itemEffectiveIAS,
    eiasRaw,
    eiasApplied,
    animationSpeed: PALADIN_CRS_A1.animationSpeed,
    framesPerDirection: PALADIN_CRS_A1.framesPerDirection,
    startingFrame: PALADIN_CRS_A1.startingFrame,
    speedIncrease,
    fullAnimationFrames,
  };

  return {
    status: "SUPPORTED",
    reasonCode: "SUPPORTED_GOLDEN_MATCH",
    fullAnimationFrames,
    totalIAS,
    effectiveIAS: eiasApplied,
    currentBreakpoint: breakpoint.currentBreakpoint,
    nextBreakpoint: breakpoint.nextBreakpoint,
    requiredAdditionalIAS: breakpoint.requiredAdditionalIAS,
    evidenceVersion: IAS_EVIDENCE_VERSION,
    reason: `${IAS_SKILLS[support.input.skill as keyof typeof IAS_SKILLS].label}: ${support.reason}`,
    trace,
  };
}
