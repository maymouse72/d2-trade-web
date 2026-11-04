import type { IASCharacterClass, IASStatus } from "./types.ts";
import { IAS_HARD_MAX, SMITE_MAX_IAS_BY_WEAPON, ZEAL_MAX_IAS_BY_WEAPON } from "./constants.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_SKILLS } from "./skills.ts";
import { getBarbarianWeapon, getClassSkill } from "./class-registry.ts";

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
  skill: string;
  weaponCode: string;
  weaponIAS: number;
  offWeaponIAS: number;
  totalIAS: number;
  skillIAS: number;
  buffIAS: number;
  debuffIAS: number;
  hitCount: number;
  fanaticismLevel: number;
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
  if (!Number.isSafeInteger(totalIAS) || totalIAS > IAS_HARD_MAX) {
    return decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `지원 가능한 최대 공속 증가 합계는 ${IAS_HARD_MAX}입니다.`);
  }

  const skillCode = (value.skill as string | undefined) ?? "NORMAL_ATTACK";
  const rawHitCount = value.hitCount === undefined ? 5 : value.hitCount;
  if (skillCode === "ZEAL" && !isIASNumber(rawHitCount)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "열의 공격 횟수는 2~5 사이 정수여야 합니다.");
  }
  const hitCount = isIASNumber(rawHitCount) ? rawHitCount : 5;
  if (skillCode === "ZEAL" && (hitCount < 2 || hitCount > 5)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "열의 공격 횟수는 2~5 사이 정수여야 합니다.");
  }

  const input: NormalizedIASInput = {
    characterClass: value.characterClass as string,
    characterForm: value.characterForm as string,
    attackMode: value.attackMode as string,
    animation: value.animation as string,
    skill: skillCode,
    weaponCode,
    weaponIAS: value.weaponIAS,
    offWeaponIAS: value.offWeaponIAS,
    totalIAS,
    skillIAS: (value.skillIAS as number | undefined) ?? 0,
    buffIAS: (value.buffIAS as number | undefined) ?? 0,
    debuffIAS: (value.debuffIAS as number | undefined) ?? 0,
    hitCount,
    fanaticismLevel: value.fanaticismLevel === undefined ? 0 : (value.fanaticismLevel as number),
  };

  if (value.fanaticismLevel !== undefined && (!isIASNumber(value.fanaticismLevel) || value.fanaticismLevel > 60)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "광신 레벨은 0(사용 안 함) 또는 1~60 정수여야 합니다.");
  }

  const weapon = IAS_WEAPONS[weaponCode];
  if (skillCode === "SMITE" && SMITE_MAX_IAS_BY_WEAPON[weaponCode] !== undefined && totalIAS > SMITE_MAX_IAS_BY_WEAPON[weaponCode]) {
    return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `${weapon?.name ?? weaponCode} 강타 검증 범위는 0~${SMITE_MAX_IAS_BY_WEAPON[weaponCode]} IAS입니다.`), input };
  }
  const genericClassSkill = getClassSkill(value.characterClass as string, skillCode);
  const classMaxIAS = genericClassSkill?.maxIASByWeapon[weaponCode];
  if (classMaxIAS !== undefined && totalIAS > classMaxIAS) {
    return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `${weapon?.name ?? weaponCode}의 검증 범위는 0~${classMaxIAS} IAS입니다.`), input: { characterClass: value.characterClass as string, characterForm: value.characterForm as string, attackMode: value.attackMode as string, animation: value.animation as string, skill: skillCode, weaponCode, weaponIAS: value.weaponIAS, offWeaponIAS: value.offWeaponIAS, totalIAS, skillIAS: (value.skillIAS as number | undefined) ?? 0, buffIAS: (value.buffIAS as number | undefined) ?? 0, debuffIAS: (value.debuffIAS as number | undefined) ?? 0, hitCount: 5, fanaticismLevel: (value.fanaticismLevel as number | undefined) ?? 0 } };
  }
  if (skillCode !== "ZEAL" && skillCode !== "SMITE" && !genericClassSkill && weapon && totalIAS > weapon.maxIAS) {
    return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `${weapon.name}의 검증 범위는 ${weapon.minIAS}~${weapon.maxIAS} IAS입니다.`), input };
  }
  if (skillCode === "ZEAL") {
    const zealMaxIAS = ZEAL_MAX_IAS_BY_WEAPON[weaponCode];
    if (zealMaxIAS === undefined) {
      return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "열의는 검증된 Paladin 1HS 무기만 지원합니다."), input };
    }
    if (totalIAS > zealMaxIAS) {
      return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `${weapon?.name ?? weaponCode} 열의 검증 범위는 0~${zealMaxIAS} IAS입니다.`), input };
    }
  }

  if (!KNOWN_CLASSES.includes(input.characterClass as IASCharacterClass)) {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_CLASS", "지원하지 않는 직업입니다."), input };
  }
  if (input.characterClass === "BARBARIAN") {
    const definition = getClassSkill(input.characterClass, input.skill);
    if (!definition) return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "야만용사 일반 공격만 구현되어 있습니다."), input };
    if (input.characterForm !== "HUMAN") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "현재 검증된 형태는 야만용사 인간형뿐입니다."), input };
    if (input.attackMode !== "NORMAL" || input.animation !== definition.animationMode) return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "야만용사 A1 일반 공격 외 애니메이션은 검증되지 않았습니다."), input };
    const barbarianWeapon = getBarbarianWeapon(input.weaponCode);
    if (!definition.supportedWeapons.includes(input.weaponCode) || !barbarianWeapon || barbarianWeapon.verificationStatus !== "VERIFIED") return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "선택한 무기는 야만용사 일반 공격의 애니메이션 검증이 완료되지 않아 계산을 제공하지 않습니다."), input };
    if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "야만용사의 스킬/버프 IAS 및 광신 보정은 이 MVP에서 지원하지 않습니다."), input };
    return { status: "SUPPORTED", reasonCode: "SUPPORTED_GOLDEN_MATCH", reason: `야만용사 인간형 일반 공격 A1, ${barbarianWeapon.animationClass} ${barbarianWeapon.weaponClass} WSM ${barbarianWeapon.weaponSpeedModifier}, IAS 0~${barbarianWeapon.maxIAS}`, input };
  }
  if (input.characterClass !== "PALADIN") {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_CLASS", "현재 검증된 직업은 Paladin뿐입니다."), input };
  }
  if (input.characterForm !== "HUMAN") {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "현재 검증된 형태는 Human Form뿐입니다."), input };
  }
  if (input.attackMode !== "NORMAL") {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "현재 지원하는 공격 유형은 검증된 Paladin 단일 공격입니다."), input };
  }
  const skill = IAS_SKILLS[input.skill as keyof typeof IAS_SKILLS];
  if (!skill) {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "이 공격 스킬은 IAS-4-A 지원 범위에 포함되지 않습니다."), input };
  }
  if (skill.supportStatus !== "SUPPORTED") {
    return { ...decision(skill.supportStatus, skill.supportStatus === "UNVERIFIED" ? "UNVERIFIED_ANIMATION" : "UNSUPPORTED_ATTACK_MODE", skill.supportStatus === "UNVERIFIED" ? `${skill.label} 스킬의 D2R 빌드별 애니메이션 식별이 원본 skills.txt로 확인되지 않아 결과를 차단했습니다.` : `${skill.label}은(는) 후속 단계에서 검증할 예정입니다.`), input };
  }
  if (!weapon || !weapon.verified) {
    return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "이 무기 조합은 독립적으로 검증되지 않았습니다."), input };
  }
  if (skill.characterClass !== input.characterClass) {
    return { ...decision("UNSUPPORTED", "UNSUPPORTED_CLASS", `${skill.label}은(는) ${skill.characterClass} 검증 조합에만 적용됩니다.`), input };
  }
  if (!skill.supportedWeapons.includes(input.weaponCode)) {
    return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", `${skill.label}과 선택한 무기 조합은 애니메이션·공속 기준 검증이 완료되지 않아 계산을 제공하지 않습니다.`), input };
  }
  if (!skill.animationMode || input.animation !== skill.animationMode) {
    return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", `${skill.label}은(는) 검증된 ${skill.animationMode ?? "전용"} 애니메이션만 지원합니다.`), input };
  }
  if (skill.speedModifierPolicy !== "NONE") {
    return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", `${skill.label}의 스킬별 속도 보정은 검증되지 않았습니다.`), input };
  }
  if (input.skillIAS !== 0 || input.buffIAS !== 0 || input.debuffIAS !== 0) {
    return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "스킬, 버프 또는 디버프 IAS가 포함된 조합은 아직 검증되지 않았습니다."), input };
  }
  const hasFanaticismEvidence = skillCode === "ZEAL"
    ? skill.supportedWeapons.includes(weaponCode)
    : ["NORMAL_ATTACK", "SACRIFICE", "VENGEANCE", "CONVERSION", "SMITE"].includes(skillCode) && weaponCode !== "lsd" && skill.supportedWeapons.includes(weaponCode);
  if (input.fanaticismLevel > 0 && (input.characterClass !== "PALADIN" || !hasFanaticismEvidence)) {
    return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "광신은 현재 검증된 성기사 공격 스킬·무기 조합에서만 계산할 수 있습니다."), input };
  }
  if (skillCode !== "SMITE" && input.animation !== "A1") {
    const animationEvidence = weapon?.animationEvidence[input.animation as "A1" | "A2"];
    return {
      ...decision(
        "UNVERIFIED",
        "UNVERIFIED_ANIMATION",
        animationEvidence?.note ?? "이 공격 동작은 독립적으로 검증되지 않았습니다.",
      ),
      input,
    };
  }
  return {
    status: "SUPPORTED",
    reasonCode: "SUPPORTED_GOLDEN_MATCH",
    reason: `${skill.label} ${skill.animationMode} 기준 애니메이션, ${weapon.name} WSM ${weapon.resolvedWeaponSpeedModifier >= 0 ? "+" : ""}${weapon.resolvedWeaponSpeedModifier}, 무스킬 총 IAS 검증 범위입니다.`,
    input,
  };
}
