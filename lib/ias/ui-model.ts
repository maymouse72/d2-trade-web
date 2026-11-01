import { calculateIAS, deriveGoldenBreakpoints, getGoldenFrameCount } from "./index.ts";
import type { IASAnimation, IASAttackSkill, IASResult } from "./types.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_SKILLS } from "./skills.ts";
import { deriveSkillGoldenBreakpoints, getSkillGoldenFrameCount } from "./skill-golden.ts";
import { ZEAL_MAX_IAS_BY_WEAPON } from "./constants.ts";
import { deriveZealBreakpoints, getZealGoldenRow } from "./zeal-golden.ts";

export function getWeaponBreakpoints(weaponCode: string, animation: IASAnimation = "A1", skill: IASAttackSkill = "NORMAL_ATTACK", hitCount = 5) {
  if (animation !== "A1" || IAS_WEAPONS[weaponCode]?.animationEvidence[animation].status !== "VERIFIED") return [];
  const skillDefinition = IAS_SKILLS[skill];
  if (skillDefinition?.supportStatus !== "SUPPORTED") return [];
  if (skill === "ZEAL") {
    return getZealBreakpoints(weaponCode, hitCount).map((row) => ({ ias: row.ias, fullAnimationFrames: row.totalSequenceFrames }));
  }
  const breakpoints = skill === "NORMAL_ATTACK"
    ? deriveGoldenBreakpoints(weaponCode)
    : deriveSkillGoldenBreakpoints(skill, weaponCode);
  return breakpoints.map((ias) => ({
    ias,
    fullAnimationFrames: (skill === "NORMAL_ATTACK"
      ? getGoldenFrameCount(weaponCode, ias)
      : getSkillGoldenFrameCount(skill, weaponCode, ias)) as number,
  }));
}

export function getZealBreakpoints(weaponCode: string, hitCount: number) {
  return deriveZealBreakpoints(weaponCode, hitCount).flatMap((ias) => {
    const row = getZealGoldenRow(weaponCode, ias, hitCount);
    return row ? [{ ias, ...row }] : [];
  });
}

export type CalculatorSelection = {
  characterClass: string;
  weaponCode: string;
  animation: string;
  skill?: string;
  hitCount?: number;
};

export type CalculatorViewModel =
  | { status: "SUPPORTED"; ias: number; result: IASResult }
  | { status: "INVALID_INPUT"; reason: string }
  | { status: "UNVERIFIED" | "UNSUPPORTED"; reason: string };

export function constrainIASInput(rawIAS: string, maxIAS: number): string {
  if (/^\d+$/.test(rawIAS) && Number(rawIAS) > maxIAS) return String(maxIAS);
  return rawIAS;
}

export function getZealHitCountFromSkillLevel(skillLevel: number): number | null {
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 20) return null;
  return Math.min(2 + skillLevel - 1, 5);
}

export function getCalculatorViewModel(rawIAS: string, selection: CalculatorSelection): CalculatorViewModel {
  return getCalculatorViewModelFromParts("0", rawIAS, selection);
}

export function getCalculatorViewModelFromParts(rawWeaponIAS: string, rawOffWeaponIAS: string, selection: CalculatorSelection): CalculatorViewModel {
  const weapon = IAS_WEAPONS[selection.weaponCode];
  const skill = selection.skill ?? "NORMAL_ATTACK";
  const maxIAS = skill === "ZEAL" ? (ZEAL_MAX_IAS_BY_WEAPON[selection.weaponCode] ?? 0) : (weapon?.maxIAS ?? 317);
  if (!/^\d+$/.test(rawWeaponIAS) || !/^\d+$/.test(rawOffWeaponIAS)) {
    return { status: "INVALID_INPUT", reason: `무기 IAS와 장비 IAS를 각각 0 이상의 정수로 입력해 주세요. 합계 범위는 0~${maxIAS}입니다.` };
  }

  const weaponIAS = Number(rawWeaponIAS);
  const offWeaponIAS = Number(rawOffWeaponIAS);
  const ias = weaponIAS + offWeaponIAS;
  if (!Number.isSafeInteger(ias) || ias > maxIAS) return { status: "INVALID_INPUT", reason: `공격 속도 증가 합계는 0~${maxIAS} 사이의 정수로 입력해 주세요.` };

  const result = calculateIAS({
    characterClass: selection.characterClass,
    characterForm: "HUMAN",
    attackMode: "NORMAL",
    animation: selection.animation,
    skill: selection.skill ?? "NORMAL_ATTACK",
    hitCount: selection.hitCount,
    weaponCode: selection.weaponCode,
    weaponIAS,
    offWeaponIAS,
    skillIAS: 0,
    buffIAS: 0,
    debuffIAS: 0,
  });

  if (result.status !== "SUPPORTED") return { status: result.status, reason: result.reason };
  return { status: "SUPPORTED", ias, result };
}
