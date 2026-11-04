import { calculateIAS, deriveGoldenBreakpoints, getGoldenFrameCount } from "./index.ts";
import type { IASAnimation, IASAttackSkill, IASResult } from "./types.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_SKILLS } from "./skills.ts";
import { deriveSkillGoldenBreakpoints, getSkillGoldenFrameCount } from "./skill-golden.ts";
import { ZEAL_MAX_IAS_BY_WEAPON, PALADIN_CRS_A1 } from "./constants.ts";
import { deriveZealBreakpoints, getZealGoldenRow } from "./zeal-golden.ts";
import { SMITE_MAX_IAS_BY_WEAPON } from "./constants.ts";
import { SMITE_BREAKPOINTS } from "./smite-golden.ts";
import { fanaticismSIAS } from "./fanaticism.ts";
import { getClassSkill } from "./class-registry.ts";
import { getBarbarianBreakpoints } from "./barbarian-golden.ts";

export function getWeaponBreakpoints(weaponCode: string, animation: IASAnimation = "A1", skill: string = "NORMAL_ATTACK", hitCount = 5, fanaticismLevel = 0) {
  if (skill === "BARBARIAN_NORMAL_ATTACK") return animation === "A1" && fanaticismLevel === 0 ? getBarbarianBreakpoints(weaponCode) : [];
  if (animation !== "A1" || IAS_WEAPONS[weaponCode]?.animationEvidence[animation].status !== "VERIFIED") return [];
  const skillDefinition = IAS_SKILLS[skill];
  if (skillDefinition?.supportStatus !== "SUPPORTED") return [];
  if (fanaticismLevel > 0) {
    const weapon = IAS_WEAPONS[weaponCode];
    if (!weapon) return [];
    const maxIAS = skill === "ZEAL" ? (ZEAL_MAX_IAS_BY_WEAPON[weaponCode] ?? 0) : skill === "SMITE" ? (SMITE_MAX_IAS_BY_WEAPON[weaponCode] ?? 0) : (skillDefinition.iasRange?.[weaponCode]?.max ?? weapon.maxIAS);
    const rows: { ias: number; fullAnimationFrames: number }[] = [];
    let previous = -1;
    for (let ias = 0; ias <= maxIAS; ias++) {
      const ieias = Math.floor(120 * ias / (120 + ias));
      const eias = Math.max(-85, Math.min(75, ieias + fanaticismSIAS(fanaticismLevel) - weapon.resolvedWeaponSpeedModifier));
      const speed = skill === "ZEAL" || skill === "SMITE" ? Math.floor(256 * (100 + eias) / 100) : Math.floor(PALADIN_CRS_A1.animationSpeed * (100 + eias) / 100);
      const frames = skill === "ZEAL" ? Math.ceil(256 * 7 / speed) * (hitCount - 1) + Math.ceil(256 * 15 / speed) - 1 : skill === "SMITE" ? Math.ceil(256 * 12 / speed) - 1 : Math.ceil(256 * (PALADIN_CRS_A1.framesPerDirection - PALADIN_CRS_A1.startingFrame) / speed) - 1;
      if (frames !== previous) rows.push({ ias, fullAnimationFrames: frames });
      previous = frames;
    }
    return rows;
  }
  if (skill === "ZEAL") {
    return getZealBreakpoints(weaponCode, hitCount).map((row) => ({ ias: row.ias, fullAnimationFrames: row.totalSequenceFrames }));
  }
  if (skill === "SMITE") return (SMITE_BREAKPOINTS[weaponCode] ?? []).map((row) => ({ ias: row.ias, fullAnimationFrames: row.frames }));
  const breakpoints = skill === "NORMAL_ATTACK"
    ? deriveGoldenBreakpoints(weaponCode)
    : deriveSkillGoldenBreakpoints(skill as IASAttackSkill, weaponCode);
  return breakpoints.map((ias) => ({
    ias,
    fullAnimationFrames: (skill === "NORMAL_ATTACK"
      ? getGoldenFrameCount(weaponCode, ias)
      : getSkillGoldenFrameCount(skill as IASAttackSkill, weaponCode, ias)) as number,
  }));
}

export function getZealBreakpoints(weaponCode: string, hitCount: number, fanaticismLevel = 0) {
  if (fanaticismLevel > 0) {
    const weapon = IAS_WEAPONS[weaponCode]; if (!weapon) return [];
    return getWeaponBreakpoints(weaponCode, "A1", "ZEAL", hitCount, fanaticismLevel).map(row => {
      const ieias = Math.floor(120 * row.ias / (120 + row.ias)); const eias = Math.max(-85, Math.min(75, ieias + fanaticismSIAS(fanaticismLevel) - weapon.resolvedWeaponSpeedModifier));
      const speed = Math.floor(256 * (100 + eias) / 100); const first = Math.ceil(256 * 7 / speed); const last = Math.ceil(256 * 15 / speed) - 1;
      return { ias: row.ias, totalSequenceFrames: row.fullAnimationFrames, firstAttackFrames: first, followUpAttackFrames: first, finalAttackFrames: last };
    });
  }
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
  fanaticismLevel?: number;
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
  const classSkill = getClassSkill(selection.characterClass, skill);
  const maxIAS = classSkill?.maxIASByWeapon[selection.weaponCode] ?? (skill === "ZEAL" ? (ZEAL_MAX_IAS_BY_WEAPON[selection.weaponCode] ?? 0) : skill === "SMITE" ? (SMITE_MAX_IAS_BY_WEAPON[selection.weaponCode] ?? 0) : (weapon?.maxIAS ?? 317));
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
    fanaticismLevel: selection.fanaticismLevel ?? 0,
  });

  if (result.status !== "SUPPORTED") return { status: result.status, reason: result.reason };
  return { status: "SUPPORTED", ias, result };
}
