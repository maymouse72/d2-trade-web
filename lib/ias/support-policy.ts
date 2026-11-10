import type { IASCharacterClass, IASStatus } from "./types.ts";
import { IAS_HARD_MAX, SMITE_MAX_IAS_BY_WEAPON, ZEAL_MAX_IAS_BY_WEAPON } from "./constants.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_SKILLS } from "./skills.ts";
import { getBarbarianWeapon, getClassSkill } from "./class-registry.ts";
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { amazonJabSequenceLength, canUseReferenceAmazonJab, canUseReferenceNormalAttack, getNormalAttackProfile, referenceWeaponClass } from "./reference-normal-attack.ts";
import { getDruidWerewolfSIAS } from "./druid-shapeshift-reference.ts";
import { getBarbarianFrenzyMaxSIAS } from "./barbarian-frenzy-reference.ts";

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
  skillLevel: number;
  frenzyBuffSIAS: number;
  maulCharges: number;
  weaponCode: string;
  secondaryWeaponCode: string | null;
  secondaryWeaponIAS: number;
  burstOfSpeedLevel: number;
  weaponMode: "ONE_HAND" | "TWO_HAND" | "DEFAULT";
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
  if (value.secondaryWeaponCode !== undefined && typeof value.secondaryWeaponCode !== "string") {
    return decision("INVALID_INPUT", "INVALID_INPUT", "보조 무기 코드는 문자열이어야 합니다.");
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
  const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  const rawWeaponMode = value.weaponMode;
  if (rawWeaponMode !== undefined && rawWeaponMode !== "ONE_HAND" && rawWeaponMode !== "TWO_HAND" && rawWeaponMode !== "DEFAULT") {
    return decision("INVALID_INPUT", "INVALID_INPUT", "무기 장착 방식은 한손 또는 양손이어야 합니다.");
  }
  const weaponMode = (rawWeaponMode as NormalizedIASInput["weaponMode"] | undefined)
    ?? (catalogWeapon?.handedness === "two-handed" ? "TWO_HAND" : catalogWeapon?.handedness === "conditional" ? "DEFAULT" : "ONE_HAND");

  const totalIAS = value.weaponIAS + value.offWeaponIAS;
  const isDualSequenceInput = value.skill === "BARBARIAN_FRENZY" || value.skill === "BARBARIAN_DOUBLE_THROW";
  if (!Number.isSafeInteger(totalIAS) || (!isDualSequenceInput && totalIAS > IAS_HARD_MAX)) {
    return decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `지원 가능한 최대 공속 증가 합계는 ${IAS_HARD_MAX}입니다.`);
  }

  const skillCode = (value.skill as string | undefined) ?? "NORMAL_ATTACK";
  const rawHitCount = value.hitCount === undefined ? (skillCode === "AMAZON_FEND" || skillCode === "AMAZON_STRAFE" ? 2 : 5) : value.hitCount;
  if (skillCode === "ZEAL" && !isIASNumber(rawHitCount)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "열의 공격 횟수는 2~5 사이 정수여야 합니다.");
  }
  const hitCount = isIASNumber(rawHitCount) ? rawHitCount : 5;
  if (skillCode === "ZEAL" && (hitCount < 2 || hitCount > 5)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "열의 공격 횟수는 2~5 사이 정수여야 합니다.");
  }
  if (skillCode === "AMAZON_FEND" && (!isIASNumber(rawHitCount) || hitCount < 2 || hitCount > 12)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "난격 대상 수는 2~12 사이 정수여야 합니다.");
  }
  if (skillCode === "AMAZON_STRAFE" && (!isIASNumber(rawHitCount) || hitCount < 2 || hitCount > 10)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "속사 발사 수는 2~10 사이 정수여야 합니다.");
  }

  const input: NormalizedIASInput = {
    characterClass: value.characterClass as string,
    characterForm: value.characterForm as string,
    attackMode: value.attackMode as string,
    animation: value.animation as string,
    skill: skillCode,
    skillLevel: (value.skillLevel as number | undefined) ?? 1,
    frenzyBuffSIAS: (value.frenzyBuffSIAS as number | undefined) ?? 0,
    maulCharges: (value.maulCharges as number | undefined) ?? 0,
    weaponCode,
    secondaryWeaponCode: typeof value.secondaryWeaponCode === "string" ? value.secondaryWeaponCode : null,
    secondaryWeaponIAS: (value.secondaryWeaponIAS as number | undefined) ?? 0,
    burstOfSpeedLevel: (value.burstOfSpeedLevel as number | undefined) ?? 0,
    weaponMode,
    weaponIAS: value.weaponIAS,
    offWeaponIAS: value.offWeaponIAS,
    totalIAS,
    skillIAS: (value.skillIAS as number | undefined) ?? 0,
    buffIAS: (value.buffIAS as number | undefined) ?? 0,
    debuffIAS: (value.debuffIAS as number | undefined) ?? 0,
    hitCount,
    fanaticismLevel: value.fanaticismLevel === undefined ? 0 : (value.fanaticismLevel as number),
  };

  if (!isIASNumber(input.secondaryWeaponIAS) || input.secondaryWeaponIAS > 120) {
    return { ...decision("INVALID_INPUT", "INVALID_INPUT", "보조 클러 IAS는 0~120 사이의 정수여야 합니다."), input };
  }
  if (!isIASNumber(input.skillLevel) || input.skillLevel > 60) {
    return { ...decision("INVALID_INPUT", "INVALID_INPUT", "기술 레벨은 1~60 사이의 정수여야 합니다."), input };
  }
  if (!isIASNumber(input.frenzyBuffSIAS) || input.frenzyBuffSIAS > 50) {
    return { ...decision("INVALID_INPUT", "INVALID_INPUT", "Frenzy 현재 SIAS는 0~50 정수여야 합니다."), input };
  }
  if (!isIASNumber(input.maulCharges) || input.maulCharges > 13) {
    return { ...decision("INVALID_INPUT", "INVALID_INPUT", "Maul 충전 수는 0~13 사이의 정수여야 합니다."), input };
  }
  if (!isIASNumber(input.burstOfSpeedLevel) || input.burstOfSpeedLevel > 60) {
    return { ...decision("INVALID_INPUT", "INVALID_INPUT", "폭발적인 속도 레벨은 0~60 사이의 정수여야 합니다."), input };
  }

  if (value.fanaticismLevel !== undefined && (!isIASNumber(value.fanaticismLevel) || value.fanaticismLevel > 60)) {
    return decision("INVALID_INPUT", "INVALID_INPUT", "광신 레벨은 0(사용 안 함) 또는 1~60 정수여야 합니다.");
  }

  const weapon = IAS_WEAPONS[weaponCode];
  if (skillCode === "SMITE" && SMITE_MAX_IAS_BY_WEAPON[weaponCode] !== undefined && totalIAS > SMITE_MAX_IAS_BY_WEAPON[weaponCode]) {
    return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `${weapon?.name ?? weaponCode} 강타 검증 범위는 0~${SMITE_MAX_IAS_BY_WEAPON[weaponCode]} IAS입니다.`), input };
  }
  const genericClassSkill = getClassSkill(value.characterClass as string, skillCode);
  const classMaxIAS = genericClassSkill?.maxIASByWeapon[weaponCode];
    if (classMaxIAS !== undefined && totalIAS > classMaxIAS && input.skill !== "BARBARIAN_FRENZY" && input.skill !== "BARBARIAN_DOUBLE_THROW") {
    return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", `${weapon?.name ?? weaponCode}의 검증 범위는 0~${classMaxIAS} IAS입니다.`), input: { characterClass: value.characterClass as string, characterForm: value.characterForm as string, attackMode: value.attackMode as string, animation: value.animation as string, skill: skillCode, skillLevel: (value.skillLevel as number | undefined) ?? 1, frenzyBuffSIAS: (value.frenzyBuffSIAS as number | undefined) ?? 0, maulCharges: (value.maulCharges as number | undefined) ?? 0, weaponCode, secondaryWeaponCode: typeof value.secondaryWeaponCode === "string" ? value.secondaryWeaponCode : null, secondaryWeaponIAS: (value.secondaryWeaponIAS as number | undefined) ?? 0, burstOfSpeedLevel: (value.burstOfSpeedLevel as number | undefined) ?? 0, weaponMode, weaponIAS: value.weaponIAS, offWeaponIAS: value.offWeaponIAS, totalIAS, skillIAS: (value.skillIAS as number | undefined) ?? 0, buffIAS: (value.buffIAS as number | undefined) ?? 0, debuffIAS: (value.debuffIAS as number | undefined) ?? 0, hitCount: 5, fanaticismLevel: (value.fanaticismLevel as number | undefined) ?? 0 } };
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
    if (input.skill === "BARBARIAN_DUAL_WIELD_NORMAL_ATTACK") {
      return { ...decision("CONFLICTED", "CONFLICTED_REFERENCE", "야만용사 쌍수 일반 공격의 보조 손 타격 주기 기준은 공개 자료에서 확인되지 않습니다. 쌍수 전용 시퀀스의 양손 평균 공식을 일반 공격에 적용하지 않아 계산을 보류합니다."), input };
    }
    if (input.skill === "BARBARIAN_FRENZY") {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "Frenzy는 야만용사 인간형 A1 공격만 지원합니다."), input };
      const secondaryCode = input.secondaryWeaponCode;
      if (!secondaryCode || secondaryCode === input.weaponCode) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "Frenzy는 서로 장착 가능한 주·보조 무기 두 개가 필요합니다."), input };
      if (!definition?.supportedWeapons.includes(input.weaponCode) || !definition.supportedWeapons.includes(secondaryCode)
        || !canUseReferenceNormalAttack("BARBARIAN", input.weaponCode, "BARBARIAN_NORMAL_ATTACK", "ONE_HAND")
        || !canUseReferenceNormalAttack("BARBARIAN", secondaryCode, "BARBARIAN_NORMAL_ATTACK", "ONE_HAND")) {
        return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "카탈로그에서 야만용사가 한손으로 장착할 수 있는 무기 조합만 지원합니다."), input };
      }
      const primaryCatalog = IAS_WEAPON_CATALOG.find((entry) => entry.code === input.weaponCode);
      const secondaryCatalog = IAS_WEAPON_CATALOG.find((entry) => entry.code === secondaryCode);
      const primaryWSM = IAS_WEAPONS[input.weaponCode]?.resolvedWeaponSpeedModifier ?? primaryCatalog?.wsm;
      const secondaryWSM = IAS_WEAPONS[secondaryCode]?.resolvedWeaponSpeedModifier ?? secondaryCatalog?.wsm;
      if (!primaryCatalog?.spawnable || !secondaryCatalog?.spawnable || primaryWSM === null || primaryWSM === undefined || secondaryWSM === null || secondaryWSM === undefined) {
        return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "양손의 WSM이 확인되지 않아 Frenzy를 계산할 수 없습니다."), input };
      }
      if (input.weaponIAS > 120 || input.secondaryWeaponIAS > 120 || input.offWeaponIAS > IAS_HARD_MAX) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "양손 무기 IAS는 각각 0~120, 무기 외 장비 IAS는 0~456 범위여야 합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "현재 Frenzy 모델은 Frenzy 충전만 포함하며 외부 오라·가속·감속은 지원하지 않습니다."), input };
      const maximumFrenzySIAS = getBarbarianFrenzyMaxSIAS(input.skillLevel);
      if (maximumFrenzySIAS === null || (input.frenzyBuffSIAS !== 0 && input.frenzyBuffSIAS !== maximumFrenzySIAS)) return { ...decision("UNSUPPORTED", "UNVERIFIED_MODIFIER", "현재는 Frenzy 충전 없음 또는 기술 레벨 최대 충전 상태만 지원합니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "야만용사 Frenzy 양손 17프레임 시퀀스 참고값", input };
    }
    if (input.skill === "BARBARIAN_DOUBLE_THROW") {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "Double Throw는 야만용사 인간형 A1만 지원합니다."), input };
      const secondaryCode = input.secondaryWeaponCode;
      if (!secondaryCode) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "Double Throw는 주·보조 투척 무기 두 개가 필요합니다."), input };
      if (!definition?.supportedWeapons.includes(input.weaponCode) || !definition.supportedWeapons.includes(secondaryCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "Double Throw는 WSM이 확인된 생성 가능 한손 투척 무기 조합만 지원합니다."), input };
      const primary = IAS_WEAPON_CATALOG.find((entry) => entry.code === input.weaponCode);
      const secondary = IAS_WEAPON_CATALOG.find((entry) => entry.code === secondaryCode);
      const primaryWSM = IAS_WEAPONS[input.weaponCode]?.resolvedWeaponSpeedModifier ?? primary?.wsm;
      const secondaryWSM = IAS_WEAPONS[secondaryCode]?.resolvedWeaponSpeedModifier ?? secondary?.wsm;
      if (!primary?.spawnable || !secondary?.spawnable || primaryWSM === null || primaryWSM === undefined || secondaryWSM === null || secondaryWSM === undefined) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "양손 투척 무기의 WSM을 확인할 수 없습니다."), input };
      if (input.weaponIAS > 120 || input.secondaryWeaponIAS > 120 || input.offWeaponIAS > IAS_HARD_MAX) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "양손 투척 무기 IAS는 각각 0~120, 장비 IAS는 0~456 범위여야 합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel || input.frenzyBuffSIAS || input.burstOfSpeedLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "Double Throw 참고 계산은 기술·오라 가속 및 감속 입력을 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "야만용사 Double Throw 양손 12프레임 시퀀스 참고값", input };
    }
    const knownOneHanded = getBarbarianWeapon(input.weaponCode)?.verificationStatus === "VERIFIED" && input.skill === "BARBARIAN_NORMAL_ATTACK";
    const knownTwoHanded = Boolean(definition?.supportedWeapons.includes(input.weaponCode) && input.skill === "BARBARIAN_TWO_HANDED_NORMAL_ATTACK");
    if (!definition && input.skill !== "BARBARIAN_TWO_HANDED_NORMAL_ATTACK") return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "이 야만용사 공격 유형은 아직 등록되지 않았습니다."), input };
    if (input.characterForm !== "HUMAN") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "현재 검증된 형태는 야만용사 인간형뿐입니다."), input };
    if (input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "야만용사 A1 일반 공격만 지원합니다."), input };
    if (input.skill === "BARBARIAN_DOUBLE_SWING") {
      if (input.weaponCode !== "7cr" || (input.secondaryWeaponCode !== "7cr" && input.secondaryWeaponCode !== "whm")) return { ...decision("CONFLICTED", "CONFLICTED_REFERENCE", "기록된 기준은 주무기 페이즈 블레이드, 보조 페이즈 블레이드 또는 워 해머 조합뿐입니다."), input };
      if (input.offWeaponIAS || input.secondaryWeaponIAS || input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("CONFLICTED", "CONFLICTED_REFERENCE", "이중 타격 기준표는 주무기 IAS만 변화시키며 보조 IAS·장비 IAS·외부 속도 보정은 0으로 고정합니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "야만용사 이중 타격 2타 합산 주기; 기록된 Phase Blade 조합 참고값", input };
    }
    if (input.skill === "BARBARIAN_WHIRLWIND") {
      if (input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "Whirlwind A1 무기 공격 프레임만 지원합니다."), input };
      if (!definition?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "Whirlwind 주무기는 무기 카탈로그에서 확인한 야만용사 무기만 지원합니다."), input };
      if (input.secondaryWeaponCode && !definition?.supportedWeapons.includes(input.secondaryWeaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "Whirlwind 보조 무기는 야만용사가 장착할 수 있는 무기만 지원합니다."), input };
      if (input.weaponIAS > 120 || input.secondaryWeaponIAS > 120) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "각 손의 무기 IAS는 0~120 범위여야 합니다."), input };
      if (input.secondaryWeaponCode && input.weaponMode === "TWO_HAND") return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "양손 무기와 보조 무기를 동시에 사용할 수 없습니다."), input };
      if (!input.secondaryWeaponCode && input.secondaryWeaponIAS > 0) return { ...decision("INVALID_INPUT", "INVALID_INPUT", "보조 무기 IAS를 입력하려면 보조 무기를 선택해야 합니다."), input };
      if (input.secondaryWeaponIAS + input.offWeaponIAS > IAS_HARD_MAX) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "보조 무기 IAS와 장비 IAS의 합계는 456 이하여야 합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "현재 Whirlwind 모델은 장비 IAS만 포함하며 오라·스킬 가속과 감속은 별도 처리하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "D2R 2.4.3 equipment-IAS Whirlwind repeated hit interval", input };
    }
    if (knownOneHanded || knownTwoHanded) {
      const barbarianWeapon = getBarbarianWeapon(input.weaponCode);
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "검증된 야만용사 Golden 범위는 추가 속도 보정을 포함하지 않습니다."), input };
      return { status: "SUPPORTED", reasonCode: "SUPPORTED_GOLDEN_MATCH", reason: `야만용사 인간형 일반 공격 A1, ${barbarianWeapon!.animationClass} ${barbarianWeapon!.weaponClass} WSM ${barbarianWeapon!.weaponSpeedModifier}, IAS 0~${barbarianWeapon!.maxIAS}`, input };
    }
    const resolvedSkill = input.skill === "BARBARIAN_TWO_HANDED_NORMAL_ATTACK" ? input.skill : "BARBARIAN_NORMAL_ATTACK";
    const animationWeaponClass = referenceWeaponClass(input.characterClass, input.weaponCode, resolvedSkill, input.weaponMode);
    const profile = animationWeaponClass ? getNormalAttackProfile(input.characterClass, animationWeaponClass) : null;
    const wsm = weapon?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    if (!catalogWeapon) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "무기 코드가 현재 카탈로그에 없어 계산할 수 없습니다."), input };
    if (!catalogWeapon.spawnable || !referenceWeaponClass(input.characterClass, input.weaponCode, resolvedSkill, input.weaponMode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "이 직업이 사용할 수 있는 기본 A1 무기 유형이 아니거나 별도 공격 방식이 필요합니다."), input };
    if (!profile) return { ...decision("UNSUPPORTED", "UNSUPPORTED_ANIMATION", "이 무기 유형의 인간형 A1 애니메이션 프로필은 아직 없습니다."), input };
    if (wsm === null || wsm === undefined) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "카탈로그의 무기 속도 보정(WSM)이 비어 있어 계산할 수 없습니다."), input };
    if (!canUseReferenceNormalAttack(input.characterClass, input.weaponCode, resolvedSkill, input.weaponMode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "이 무기 조합은 일반 공격 기준 계산을 지원하지 않습니다."), input };
    if (input.skillIAS || input.buffIAS || input.debuffIAS) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "공격 스킬의 개별 속도 효과와 감속은 아직 일반 공격 기준에 포함되지 않습니다."), input };
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: `${input.characterClass} 인간형 일반 공격 A1, ${profile.animationClass}, WSM ${wsm}; 공개 기준 공식 기반 참고값`, input };
  }
  if (input.characterClass !== "PALADIN") {
    const classSkill = getClassSkill(input.characterClass, input.skill);
    const isAmazonThrow = input.characterClass === "AMAZON" && input.skill.startsWith("AMAZON_")
      && (input.skill === "AMAZON_THROW" || input.skill === "AMAZON_POISON_JAVELIN" || input.skill === "AMAZON_PLAGUE_JAVELIN" || input.skill === "AMAZON_LIGHTNING_BOLT" || input.skill === "AMAZON_LIGHTNING_FURY");
    const isAmazonStandardBowSkill = input.characterClass === "AMAZON"
      && input.skill.startsWith("AMAZON_") && input.skill !== "AMAZON_JAB"
      && input.skill !== "AMAZON_STRAFE" && !isAmazonThrow;
    const isAssassinMartialStandard = input.characterClass === "ASSASSIN" && ["ASSASSIN_TIGER_STRIKE", "ASSASSIN_COBRA_STRIKE", "ASSASSIN_PHOENIX_STRIKE"].includes(input.skill);
    const isNormalAttack = input.skill === "NORMAL_ATTACK" || isAmazonStandardBowSkill || isAssassinMartialStandard || (input.characterClass === "ASSASSIN" && input.skill === "ASSASSIN_DRAGON_TAIL");
    const isAmazonJab = input.characterClass === "AMAZON" && input.skill === "AMAZON_JAB";
    const isAmazonImpale = input.characterClass === "AMAZON" && input.skill === "AMAZON_IMPALE";
    const isAmazonFend = input.characterClass === "AMAZON" && input.skill === "AMAZON_FEND";
    const isAmazonStrafe = input.characterClass === "AMAZON" && input.skill === "AMAZON_STRAFE";
    const isDruidWereformNormal = input.characterClass === "DRUID" && (input.skill === "DRUID_WEREWOLF_NORMAL_ATTACK" || input.skill === "DRUID_WEREBEAR_NORMAL_ATTACK");
    const isDruidFury = input.characterClass === "DRUID" && input.skill === "DRUID_WEREWOLF_FURY";
    const isDruidWereformReferenceSkill = input.characterClass === "DRUID" && ["DRUID_FERAL_RAGE", "DRUID_FIRE_CLAWS", "DRUID_MAUL", "DRUID_HUNGER", "DRUID_RABIES"].includes(input.skill);
    const isNecromancerPoisonDagger = input.characterClass === "NECROMANCER" && input.skill === "NECROMANCER_POISON_DAGGER";
    const isAssassinDragonClaw = input.characterClass === "ASSASSIN" && input.skill === "ASSASSIN_DRAGON_CLAW";
    const isAssassinChargeUp = input.characterClass === "ASSASSIN" && ["ASSASSIN_FISTS_OF_FIRE", "ASSASSIN_CLAWS_OF_THUNDER", "ASSASSIN_BLADES_OF_ICE"].includes(input.skill);
    const isAssassinDragonTalon = input.characterClass === "ASSASSIN" && input.skill === "ASSASSIN_DRAGON_TALON";
    const isAssassinTrapLaying = input.characterClass === "ASSASSIN" && input.skill === "ASSASSIN_TRAP_LAYING";
    const isAssassinDragonFlight = input.characterClass === "ASSASSIN" && input.skill === "ASSASSIN_DRAGON_FLIGHT";
    const isBarbarianDoubleThrow = input.characterClass === "BARBARIAN" && input.skill === "BARBARIAN_DOUBLE_THROW";
    if (!isNormalAttack && !isAmazonJab && !isAmazonImpale && !isAmazonFend && !isAmazonStrafe && !isAmazonThrow && !isDruidWereformNormal && !isDruidFury && !isDruidWereformReferenceSkill && !isNecromancerPoisonDagger && !isAssassinDragonClaw && !isAssassinChargeUp && !isAssassinDragonTalon && !isAssassinTrapLaying && !isAssassinDragonFlight && !isBarbarianDoubleThrow) return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "이 직업의 선택 스킬은 아직 계산 엔진에 연결되지 않았습니다."), input };
    if (isNecromancerPoisonDagger) {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "독 단검은 인간형 강령술사 A1 공격만 지원합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "독 단검은 생성 가능하고 WSM이 확인된 단검 계열만 지원합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "독 단검 기본 계산은 장비 IAS만 반영합니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "Necromancer Poison Dagger dagger-only A1 weapon attack", input };
    }
    if (input.characterClass === "ASSASSIN" && input.skill === "ASSASSIN_DRAGON_TAIL") {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "용의 꼬리는 인간형 암살자 A1 발차기만 지원합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "용의 꼬리는 WSM이 확인된 생성 가능 근접 무기만 지원합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "용의 꼬리 기본 A1 계산은 장비 IAS만 반영합니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "Assassin Dragon Tail weapon-class A1 kick timing", input };
    }
    if (isAssassinDragonFlight) {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_ATTACK_MODE", "용의 비상은 인간형 암살자 A1만 지원합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "용의 비상은 암살자가 장착할 수 있는 생성 가능 근접 무기만 지원합니다."), input };
      if (input.weaponIAS || input.offWeaponIAS || input.secondaryWeaponIAS || input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel || input.burstOfSpeedLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "용의 비상은 고정 23프레임이며 IAS와 속도 보정은 적용되지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "Dragon Flight fixed 23-frame attack reference", input };
    }
    if (isAssassinDragonClaw) {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "용의 발톱은 인간형 쌍클러 A1만 지원합니다."), input };
      if (!input.secondaryWeaponCode) return { ...decision("INVALID_INPUT", "INVALID_INPUT", "용의 발톱은 주무기와 보조 클러가 모두 필요합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode) || !classSkill.supportedWeapons.includes(input.secondaryWeaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "용의 발톱은 WSM이 확인된 암살자 전용 클러만 지원합니다."), input };
      if (input.weaponIAS > 120) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "주무기 클러 IAS는 0~120 사이여야 합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "폭발적인 속도만 별도 지원합니다. 다른 가속·감속 입력은 지원하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "대칭 또는 출처가 일치하는 암살자 Dragon Claw 쌍클러 시퀀스 참고 계산", input };
    }
    if (isAssassinChargeUp) {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "무술 충전 공격은 인간형 쌍클러 A1만 지원합니다."), input };
      if (!input.secondaryWeaponCode || !classSkill?.supportedWeapons.includes(input.weaponCode) || !classSkill.supportedWeapons.includes(input.secondaryWeaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "무술 충전 공격은 WSM이 확인된 암살자 전용 클러 두 개가 필요합니다."), input };
      if (input.weaponIAS > 120 || input.secondaryWeaponIAS > 120 || input.offWeaponIAS + input.weaponIAS > IAS_HARD_MAX || input.offWeaponIAS + input.secondaryWeaponIAS > IAS_HARD_MAX) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "각 클러 IAS는 0~120이며 손별 장비 IAS 포함 합계는 456 이하여야 합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "쌍클러 무술 충전 기준은 폭발적인 속도 외 추가 보정은 지원하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "Assassin dual-claw charge-up 16-FPD sequence using published two-hand WSM/IEIAS averaging", input };
    }
    if (isAssassinDragonTalon) {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "용의 발톱은 인간형 A1 공격만 지원합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "WSM이 확인된 생성 가능 근접 무기만 지원합니다."), input };
      if (input.weaponIAS > 120 || input.skillLevel < 1 || input.skillLevel > 30) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "무기 IAS는 0~120, 용의 발톱 기술 레벨은 1~30 범위입니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "폭발적인 속도 외 추가 가속·감속 효과는 지원하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "암살자 용의 발톱 롤백 시퀀스 공개 기준 참고 계산", input };
    }
    if (isAssassinTrapLaying) {
      if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "함정 설치는 인간형 암살자 A1만 지원합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "생성 가능하고 WSM이 확인된 암살자 무기만 지원합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "현재 함정 설치 모델은 폭발적인 속도만 별도 지원하며 그 외 스킬 가속·감속·오라는 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "암살자 함정 설치 8 FPD / 속도 128 공개 기준 참고 계산", input };
    }
    if (isDruidFury) {
      if (input.characterForm !== "WEREWOLF" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "격노는 늑대인간 A1만 지원합니다. 곰인간 격노는 계산하지 않습니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "선택한 무기 유형에 드루이드 A1 공개 프로필이 없습니다."), input };
      if (!input.skillLevel || input.skillLevel > 60) return { ...decision("INVALID_INPUT", "INVALID_INPUT", "늑대인간 기술 레벨은 1~60이어야 합니다."), input };
      if (input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "격노 기준 모델은 감속과 외부 오라를 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "늑대인간 격노 5타 롤백 시퀀스 공개 기준 참고 계산", input };
    }
    if (isDruidWereformNormal) {
      const expectedForm = input.skill === "DRUID_WEREWOLF_NORMAL_ATTACK" ? "WEREWOLF" : "WEREBEAR";
      if (input.characterForm !== expectedForm) return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", `${expectedForm} 형태를 선택해야 계산할 수 있습니다.`), input };
      if (input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "현재 드루이드 변신 참고 계산은 A1 일반 공격만 지원합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "선택한 드루이드 무기 유형은 변신 A1 기준 계산을 지원하지 않습니다."), input };
      const weaponClass = referenceWeaponClass("DRUID", input.weaponCode, "NORMAL_ATTACK", input.weaponMode);
      const profile = weaponClass ? getNormalAttackProfile("DRUID", weaponClass) : null;
      const wsm = weapon?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
      if (!profile || wsm === null || wsm === undefined) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "동일 무기의 인간형 A1 프로필 또는 WSM을 확인할 수 없습니다."), input };
      if (input.debuffIAS) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "드루이드 변신형 감속 효과는 아직 지원하지 않습니다."), input };
      const maxMaulCharges = Math.min(13, 3 + Math.floor(input.skillLevel / 2));
      if (input.maulCharges > maxMaulCharges) return { ...decision("INVALID_INPUT", "INVALID_INPUT", `현재 Maul 기술 레벨의 충전 상한은 ${maxMaulCharges}회입니다.`), input };
      if (input.characterForm !== "WEREBEAR" && input.maulCharges > 0) return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "Maul 충전은 곰인간 형태에서만 적용합니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: `${expectedForm} 표준 공격, 동일 무기 Human A1 프로필 기반 참고 계산`, input };
    }
    if (isDruidWereformReferenceSkill) {
      const expectedForm = input.skill === "DRUID_FERAL_RAGE" || input.skill === "DRUID_RABIES" ? "WEREWOLF"
        : input.skill === "DRUID_MAUL" ? "WEREBEAR" : null;
      if ((expectedForm && input.characterForm !== expectedForm) || (input.characterForm !== "WEREWOLF" && input.characterForm !== "WEREBEAR")) {
        return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", expectedForm ? `${expectedForm} 형태에서만 지원합니다.` : "변신형에서만 지원합니다."), input };
      }
      if (input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "Druid 변신 A1 공격만 지원합니다."), input };
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "선택한 변신 무기 유형의 Druid A1 프로필이 없습니다."), input };
      const maxMaulCharges = Math.min(13, 3 + Math.floor(input.skillLevel / 2));
      if (input.maulCharges > maxMaulCharges) return { ...decision("INVALID_INPUT", "INVALID_INPUT", `현재 Maul 기술 레벨의 충전 상한은 ${maxMaulCharges}회입니다.`), input };
      if (input.characterForm !== "WEREBEAR" && input.maulCharges > 0) return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "Maul 충전은 곰인간 형태에서만 적용합니다."), input };
      const expectedWolfSIAS = input.characterForm === "WEREWOLF" ? getDruidWerewolfSIAS(input.skillLevel) : 0;
      if (expectedWolfSIAS === null || (input.skillIAS !== 0 && input.skillIAS !== expectedWolfSIAS) || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "이 변신 스킬 경로는 자동 Werewolf SIAS와 Maul 충전 외 추가 가속·감속 보정을 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: `${input.skill} 변신형 무기 공격 공개 프레임 규칙 기반 참고값`, input };
    }
    if (input.characterForm !== "HUMAN") return { ...decision("UNSUPPORTED", "UNSUPPORTED_FORM", "현재 구현된 참고 계산은 인간형만 지원합니다."), input };
    if (input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "현재 참고 계산은 인간형 A1 일반 공격만 지원합니다."), input };
    if (isAmazonJab) {
      if (!classSkill?.supportedWeapons.includes(input.weaponCode) || !canUseReferenceAmazonJab(input.weaponCode, input.weaponMode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "잽은 카탈로그에서 속도와 창 계열 공격 동작을 확인할 수 있는 무기만 지원합니다."), input };
      if (!catalogWeapon) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "무기 코드가 현재 카탈로그에 없어 계산할 수 없습니다."), input };
      const wsm = weapon?.resolvedWeaponSpeedModifier ?? catalogWeapon.wsm;
      if (wsm === null || wsm === undefined) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "카탈로그의 무기 속도 보정(WSM)이 비어 있어 계산할 수 없습니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "잽의 고유 시퀀스 보정은 계산하지만 기타 스킬 IAS 및 감속은 지원하지 않습니다."), input };
      const sequenceLength = amazonJabSequenceLength(input.weaponCode, input.weaponMode);
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: `Amazon Jab 3-hit sequence (${sequenceLength} frames), WSM ${wsm}; published D2R reference rules`, input };
    }
    if (isAmazonImpale) {
      const validTypes = ["jave", "ajav", "spea", "aspe"].includes(catalogWeapon?.itemType ?? "");
      if (!classSkill?.supportedWeapons.includes(input.weaponCode) || !validTypes || (catalogWeapon?.weaponClass !== "1ht" && catalogWeapon?.weaponClass !== "2ht")) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "꿰뚫기는 WSM이 확인된 Amazon 재벌린·창 계열만 지원합니다."), input };
      if (input.weaponIAS > 120) return { ...decision("INVALID_INPUT", "IAS_OUT_OF_RANGE", "Impale 무기 IAS는 0~120 범위여야 합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "Impale 공개 기준표는 외부 오라·스킬 가속·감속을 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "Amazon Impale dedicated 1HT/2HT EIAS table", input };
    }
    if (isAmazonFend) {
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "난격은 속도 자료가 있는 Amazon 재벌린·창만 지원합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "난격 참조표는 개별 속도 오라와 감속 입력을 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "Amazon Fend 2-target First + Last sequence from public attack-speed table", input };
    }
    if (isAmazonStrafe) {
      if (!classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "속사는 WSM이 확인된 아마존 활·석궁만 지원합니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "속사 공개 표는 개별 속도 오라와 감속 입력을 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: `Amazon Strafe ${input.hitCount}-shot sequence from public bow/crossbow tables`, input };
    }
    if (isAmazonThrow) {
      if (!catalogWeapon || !catalogWeapon.spawnable || !classSkill?.supportedWeapons.includes(input.weaponCode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "Amazon Throw 계열은 WSM이 확인된 투창만 지원합니다."), input };
      const wsm = weapon?.resolvedWeaponSpeedModifier ?? catalogWeapon.wsm;
      if (wsm === null || wsm === undefined) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "투창의 무기 속도 보정(WSM)이 없어 계산할 수 없습니다."), input };
      if (input.skillIAS || input.buffIAS || input.debuffIAS || input.fanaticismLevel) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "Amazon Throw 공개 표는 별도 스킬 속도 및 오라 보정을 포함하지 않습니다."), input };
      return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: "Amazon 1HT Throw attack-speed table from public reference", input };
    }
    if (isAmazonStandardBowSkill && !classSkill?.supportedWeapons.includes(input.weaponCode)) {
      return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "다발 사격과 유도 화살은 WSM이 확인된 아마존 활·석궁 조합만 지원합니다."), input };
    }
    const animationSkill = input.skill === "ASSASSIN_DRAGON_TAIL" ? "NORMAL_ATTACK" : input.skill;
    const animationWeaponClass = referenceWeaponClass(input.characterClass, input.weaponCode, animationSkill, input.weaponMode);
    const profile = animationWeaponClass ? getNormalAttackProfile(input.characterClass, animationWeaponClass) : null;
    const wsm = weapon?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    if (!catalogWeapon) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "무기 코드가 현재 카탈로그에 없어 계산할 수 없습니다."), input };
    if (!catalogWeapon.spawnable || !referenceWeaponClass(input.characterClass, input.weaponCode, input.skill, input.weaponMode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "이 직업이 사용할 수 있는 기본 A1 무기 유형이 아니거나 별도 공격 방식이 필요합니다."), input };
    if (!profile) return { ...decision("UNSUPPORTED", "UNSUPPORTED_ANIMATION", "이 무기 유형의 인간형 A1 애니메이션 프로필은 아직 없습니다."), input };
    if (wsm === null || wsm === undefined) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "카탈로그의 무기 속도 보정(WSM)이 비어 있어 계산할 수 없습니다."), input };
    if (!canUseReferenceNormalAttack(input.characterClass, input.weaponCode, input.skill, input.weaponMode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "이 무기 조합은 일반 공격 기준 계산을 지원하지 않습니다."), input };
    if (input.skillIAS || input.buffIAS || input.debuffIAS) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "공격 스킬의 개별 속도 효과와 감속은 아직 일반 공격 기준에 포함되지 않습니다."), input };
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: `${input.characterClass} 인간형 일반 공격 A1, ${profile.animationClass}, WSM ${wsm}; 공개 기준 공식 기반 참고값`, input };
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
  if (input.skill === "NORMAL_ATTACK" && skill.supportStatus === "SUPPORTED" && !skill.supportedWeapons.includes(input.weaponCode)) {
    if (input.characterForm !== "HUMAN" || input.attackMode !== "NORMAL" || input.animation !== "A1") return { ...decision("UNVERIFIED", "UNVERIFIED_ANIMATION", "성기사 참고 계산은 인간형 A1 일반 공격만 지원합니다."), input };
    const animationWeaponClass = referenceWeaponClass(input.characterClass, input.weaponCode, input.skill, input.weaponMode);
    const profile = animationWeaponClass ? getNormalAttackProfile(input.characterClass, animationWeaponClass) : null;
    const wsm = weapon?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    if (!catalogWeapon) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "무기 코드가 현재 카탈로그에 없어 계산할 수 없습니다."), input };
    if (!catalogWeapon.spawnable || !referenceWeaponClass(input.characterClass, input.weaponCode, input.skill, input.weaponMode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "이 성기사 공격에 지원되지 않는 무기 유형입니다."), input };
    if (!profile) return { ...decision("UNSUPPORTED", "UNSUPPORTED_ANIMATION", "이 무기 유형의 성기사 A1 프로필은 없습니다."), input };
    if (wsm === null || wsm === undefined) return { ...decision("UNVERIFIED", "UNVERIFIED_WEAPON", "카탈로그의 무기 속도 보정(WSM)이 비어 있어 계산할 수 없습니다."), input };
    if (!canUseReferenceNormalAttack(input.characterClass, input.weaponCode, input.skill, input.weaponMode)) return { ...decision("UNSUPPORTED", "UNSUPPORTED_WEAPON", "이 성기사 무기 조합은 일반 공격 기준 계산을 지원하지 않습니다."), input };
    if (input.skillIAS || input.buffIAS || input.debuffIAS) return { ...decision("UNVERIFIED", "UNVERIFIED_MODIFIER", "성기사 일반 공격 참고 계산은 스킬 추가 속도 및 감속을 지원하지 않습니다."), input };
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", reason: `성기사 인간형 일반 공격 A1, ${profile.animationClass}, WSM ${wsm}; 공개 기준 공식 기반 참고값`, input };
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
