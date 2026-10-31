import type { IASCharacterClass, IASStatus } from "./types.ts";
import { PALADIN_CRS_A1 } from "./constants.ts";
import { IAS_WEAPONS } from "./weapons.ts";

const KNOWN_CLASSES: readonly IASCharacterClass[] = [
  "PALADIN",
  "AMAZON",
  "ASSASSIN",
  "BARBARIAN",
  "DRUID",
  "NECROMANCER",
  "SORCERESS",
  "WARLOCK",
];

export interface NormalizedIASInput {
  characterClass: string;
  characterForm: string;
  attackMode: string;
  animation: string;
  weaponCode: string;
  weaponIAS: number;
  offWeaponIAS: number;
  totalIAS: number;
  skillIAS: number;
  buffIAS: number;
  debuffIAS: number;
}

export interface SupportDecision {
  status: IASStatus;
  reasonCode: string;
  reason: string;
  input?: NormalizedIASInput;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIASNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

function decision(status: IASStatus, reasonCode: string, reason: string): SupportDecision {
  return { status, reasonCode, reason };
}

export function evaluateIASSupport(value: unknown): SupportDecision {
  if (!isRecord(value)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "입력값은 객체여야 합니다.");
  }

  const requiredStrings = ["characterClass", "characterForm", "attackMode", "animation", "weaponCode"];
  if (requiredStrings.some((key) => typeof value[key] !== "string" || value[key] === "")) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "필수 캐릭터, 공격, 애니메이션, 무기 정보가 필요합니다.");
  }

  if (!isIASNumber(value.weaponIAS) || !isIASNumber(value.offWeaponIAS)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "무기 IAS와 장비 IAS는 0 이상의 정수여야 합니다.");
  }

  const modifiers: Array<[string, unknown]> = [
    ["skillIAS", value.skillIAS],
    ["buffIAS", value.buffIAS],
    ["debuffIAS", value.debuffIAS],
  ];
  for (const [name, modifier] of modifiers) {
    if (modifier !== undefined && !isIASNumber(modifier)) {
      return decision("INVALID_INPUT", "INVALID_INPUT", `${name}는 0 이상의 정수여야 합니다.`);
    }
  }

  const weaponCode = value.weaponCode as string;
  if (!/^[a-z0-9]{3}$/.test(weaponCode)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "무기 코드는 영문 소문자 또는 숫자 3자리여야 합니다.");
  }

  const totalIAS = value.weaponIAS + value.offWeaponIAS;
  if (totalIAS > PALADIN_CRS_A1.totalIASMax) {
    return decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "지원 범위는 총 IAS 0~200입니다.");
  }

  const input: NormalizedIASInput = {
    characterClass: value.characterClass as string,
    characterForm: value.characterForm as string,
    attackMode: value.attackMode as string,
    animation: value.animation as string,
    weaponCode,
    weaponIAS: value.weaponIAS,
    offWeaponIAS: value.offWeaponIAS,
    totalIAS,
    skillIAS: (value.skillIAS as number | undefined) ?? 0,
    buffIAS: (value.buffIAS as number | undefined) ?? 0,
    debuffIAS: (value.debuffIAS as number | undefined) ?? 0,
  };

  if (!KNOWN_CLASSES.includes(input.characterClass as IASCharacterClass) || input.characterClass !== "PALADIN") {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_CLASS", "현재 검증된 직업은 Paladin뿐입니다."), input };
  }
  if (input.characterForm !== "HUMAN") {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "현재 검증된 형태는 Human Form뿐입니다."), input };
  }
  if (input.attackMode !== "NORMAL") {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "현재 검증된 공격은 Normal Attack 기준 애니메이션뿐입니다."), input };
  }
  if (input.skillIAS !== 0 || input.buffIAS !== 0 || input.debuffIAS !== 0) {
    return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "스킬, 버프 또는 디버프 IAS가 포함된 조합은 아직 검증되지 않았습니다."), input };
  }
  if (input.animation !== "A1") {
    return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "A2는 독립 기준표와 실제 선택 규칙이 확인되지 않았습니다."), input };
  }
  if (input.weaponCode !== "crs" || !IAS_WEAPONS[input.weaponCode]) {
    return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "이 무기 조합은 독립적으로 검증되지 않았습니다."), input };
  }

  return {
    status: "SUPPORTED",
    reasonCode: "SUPPORTED_GOLDEN_MATCH",
    reason: "Paladin A1 기준 애니메이션, Crystal Sword WSM 0, 무스킬 총 IAS 0~200 검증 범위입니다.",
    input,
  };
}
