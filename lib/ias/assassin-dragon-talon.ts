/**
 * Isolated, reference-based Dragon Talon timing model. This module is not
 * wired into the shared IAS engine or UI.
 *
 * Timing follows Warren1001's D2R 3.3 rollback calculation: the first and
 * repeated kicks use the 4-frame action frame, each intermediate kick rolls
 * back by 100% (therefore to frame zero), and the final kick uses 13 FPD - 1.
 */

export type AssassinDragonTalonInput = {
  characterForm: "HUMAN" | string;
  weapon: { code: string; wsm: number | null; weaponIAS: number };
  gearIAS: number;
  burstOfSpeedLevel: number;
  dragonTalonLevel: number;
};

export type AssassinDragonTalonResult =
  | {
      status: "REFERENCE_BASED";
      reasonCode: "REFERENCE_ROLLBACK_MATCH";
      reason: string;
      itemEffectiveIAS: number;
      skillIAS: number;
      effectiveIAS: number;
      animationSpeed: number;
      kickCount: number;
      hitFrameLengths: number[];
      totalSequenceFrames: number;
      hitsPerSecond: number;
      evidenceVersion: "D2R 3.3.93847 / Warren1001 v1.2.6";
    }
  | {
      status: "INVALID_INPUT" | "UNSUPPORTED";
      reasonCode: string;
      reason: string;
      hitFrameLengths: null;
      totalSequenceFrames: null;
      hitsPerSecond: null;
    };

// The shared catalog is the sole WSM source. Dragon Talon uses the active
// weapon's WSM; the secondary hand is deliberately not an input.

const MIN_IAS = 0;
const MAX_IAS = 456;
const MAX_WEAPON_IAS = 120;
const MIN_EIAS = -85;
const MAX_EIAS = 75;

function invalid(status: "INVALID_INPUT" | "UNSUPPORTED", reasonCode: string, reason: string): AssassinDragonTalonResult {
  return { status, reasonCode, reason, hitFrameLengths: null, totalSequenceFrames: null, hitsPerSecond: null };
}

function inRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/** Warren1001's Burst of Speed SIAS curve; 0 means no active BoS. */
export function assassinTalonBurstOfSpeedSIAS(level: number): number | null {
  if (!inRange(level, 0, 60)) return null;
  if (level === 0) return 0;
  const diminishedLevel = Math.floor((110 * level) / (level + 6));
  return 15 + Math.floor((45 * diminishedLevel) / 100);
}

/**
 * Calculate Dragon Talon's repeated 4-frame kick interval plus final kick.
 * Asymmetric modifiers outside the explicit input (slows, Fanaticism, curses,
 * wereform and charge effects) are intentionally outside this profile.
 */
export function calculateAssassinDragonTalonReference(input: AssassinDragonTalonInput): AssassinDragonTalonResult {
  if (!input || typeof input !== "object") return invalid("INVALID_INPUT", "INVALID_INPUT", "입력 객체가 필요합니다.");
  if (input.characterForm !== "HUMAN") return invalid("UNSUPPORTED", "UNSUPPORTED_FORM", "인간형 Dragon Talon만 지원합니다.");
  const weapon = input.weapon;
  if (!weapon || typeof weapon.code !== "string") return invalid("INVALID_INPUT", "INVALID_WEAPON", "무기 코드가 필요합니다.");
  const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weapon.code);
  if (!catalogWeapon || !catalogWeapon.spawnable || catalogWeapon.parentType === "miss") return invalid("UNSUPPORTED", "UNSUPPORTED_WEAPON", "생성 가능한 근접 무기만 지원합니다.");
  const catalogWSM = catalogWeapon.wsm;
  if (catalogWSM === null) return invalid("UNSUPPORTED", "UNKNOWN_WSM", "선택 무기의 WSM이 확인되지 않습니다.");
  if (weapon.wsm !== catalogWSM) return invalid("INVALID_INPUT", "WSM_MISMATCH", `무기 WSM은 카탈로그 값 ${catalogWSM}이어야 합니다.`);
  if (!inRange(weapon.weaponIAS, MIN_IAS, MAX_WEAPON_IAS)) return invalid("INVALID_INPUT", "WEAPON_IAS_RANGE", "무기 IAS는 0~120 정수여야 합니다.");
  if (!inRange(input.gearIAS, MIN_IAS, MAX_IAS)) return invalid("INVALID_INPUT", "GEAR_IAS_RANGE", `장비 IAS는 0~${MAX_IAS} 정수여야 합니다.`);
  if (input.gearIAS + weapon.weaponIAS > MAX_IAS) return invalid("INVALID_INPUT", "TOTAL_IAS_RANGE", `총 IAS는 ${MAX_IAS} 이하여야 합니다.`);
  if (!inRange(input.dragonTalonLevel, 1, 30)) return invalid("UNSUPPORTED", "TALON_LEVEL_RANGE", "검증된 Dragon Talon 레벨 범위는 1~30입니다.");
  if (!inRange(input.burstOfSpeedLevel, 0, 60)) return invalid("INVALID_INPUT", "BOS_LEVEL_RANGE", "폭발적인 속도 레벨은 0~60 정수여야 합니다.");

  const weaponAndGearIAS = input.gearIAS + weapon.weaponIAS;
  const itemEffectiveIAS = Math.floor((120 * weaponAndGearIAS) / (120 + weaponAndGearIAS));
  const skillIAS = assassinTalonBurstOfSpeedSIAS(input.burstOfSpeedLevel)!;
  const effectiveIAS = Math.max(MIN_EIAS, Math.min(MAX_EIAS, skillIAS + itemEffectiveIAS - weapon.wsm!));
  const animationSpeed = Math.floor((256 * (100 + effectiveIAS)) / 100);

  // skills.txt calc1 is floor(level / 6) + 1, verified through level 30.
  const kickCount = Math.floor(input.dragonTalonLevel / 6) + 1;
  const serialKickFrames = Math.ceil((256 * 4) / animationSpeed);
  const finalKickFrames = Math.ceil((256 * 13) / animationSpeed) - 1;
  const hitFrameLengths = [
    ...Array.from({ length: Math.max(0, kickCount - 1) }, () => serialKickFrames),
    finalKickFrames,
  ];
  const totalSequenceFrames = hitFrameLengths.reduce((sum, frames) => sum + frames, 0);

  return {
    status: "REFERENCE_BASED",
    reasonCode: "REFERENCE_ROLLBACK_MATCH",
    reason: "검증된 인간형 Dragon Talon 롤백 모델로 kick interval과 마지막 kick을 계산했습니다.",
    itemEffectiveIAS,
    skillIAS,
    effectiveIAS,
    animationSpeed,
    kickCount,
    hitFrameLengths,
    totalSequenceFrames,
    hitsPerSecond: (kickCount * 25) / totalSequenceFrames,
    evidenceVersion: "D2R 3.3.93847 / Warren1001 v1.2.6",
  };
}
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
