import type { IASCharacterClass, IASResult } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { fanaticismSIAS } from "./fanaticism.ts";
import { IAS_HARD_MAX } from "./constants.ts";

export interface NormalAttackAnimationProfile {
  animationClass: string;
  framesPerDirection: number;
  animationSpeed: number;
  startingFrame: number;
  actionFrame: number;
}

// D2R build 3.3.93847 A1 profiles. Animation values are published in the
// Amazon Basin Attack speed data and reproduced by d2r.org's build-stamped
// breakpoint lab; see docs/ias/IAS-6-REFERENCE-SOURCES.md.
export const NORMAL_ATTACK_PROFILES: Readonly<Record<string, Readonly<Record<string, NormalAttackAnimationProfile>>>> = {
  AMAZON: {
    hth: { animationClass: "AM A1 HTH", framesPerDirection: 13, animationSpeed: 256, startingFrame: 1, actionFrame: 8 },
    "1hs": { animationClass: "AM A1 1HS", framesPerDirection: 16, animationSpeed: 256, startingFrame: 2, actionFrame: 10 },
    "2hs": { animationClass: "AM A1 2HS", framesPerDirection: 20, animationSpeed: 256, startingFrame: 2, actionFrame: 12 },
    "1ht": { animationClass: "AM A1 1HT", framesPerDirection: 15, animationSpeed: 256, startingFrame: 2, actionFrame: 9 },
    "2ht": { animationClass: "AM A1 2HT", framesPerDirection: 18, animationSpeed: 256, startingFrame: 2, actionFrame: 11 },
    stf: { animationClass: "AM A1 STF", framesPerDirection: 20, animationSpeed: 256, startingFrame: 2, actionFrame: 12 },
    bow: { animationClass: "AM A1 BOW", framesPerDirection: 14, animationSpeed: 256, startingFrame: 0, actionFrame: 6 },
    xbw: { animationClass: "AM A1 XBW", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
  },
  ASSASSIN: {
    hth: { animationClass: "AI A1 HTH", framesPerDirection: 11, animationSpeed: 256, startingFrame: 0, actionFrame: 6 },
    "1hs": { animationClass: "AI A1 1HS", framesPerDirection: 15, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    "2hs": { animationClass: "AI A1 2HS", framesPerDirection: 23, animationSpeed: 256, startingFrame: 0, actionFrame: 11 },
    "1ht": { animationClass: "AI A1 1HT", framesPerDirection: 15, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    "2ht": { animationClass: "AI A1 2HT", framesPerDirection: 23, animationSpeed: 256, startingFrame: 0, actionFrame: 10 },
    stf: { animationClass: "AI A1 STF", framesPerDirection: 19, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    bow: { animationClass: "AI A1 BOW", framesPerDirection: 16, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    xbw: { animationClass: "AI A1 XBW", framesPerDirection: 21, animationSpeed: 256, startingFrame: 0, actionFrame: 10 },
    ht1: { animationClass: "AI A1 HT1", framesPerDirection: 11, animationSpeed: 208, startingFrame: 0, actionFrame: 6 },
  },
  BARBARIAN: {
    hth: { animationClass: "BA A1 HTH", framesPerDirection: 12, animationSpeed: 256, startingFrame: 0, actionFrame: 6 },
    "1hs": { animationClass: "BA A1 1HS", framesPerDirection: 16, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    "2hs": { animationClass: "BA A1 2HS", framesPerDirection: 18, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    "1ht": { animationClass: "BA A1 1HT", framesPerDirection: 16, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    "2ht": { animationClass: "BA A1 2HT", framesPerDirection: 19, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    stf: { animationClass: "BA A1 STF", framesPerDirection: 19, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    bow: { animationClass: "BA A1 BOW", framesPerDirection: 15, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    xbw: { animationClass: "BA A1 XBW", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 10 },
  },
  DRUID: {
    hth: { animationClass: "DZ A1 HTH", framesPerDirection: 16, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    "1hs": { animationClass: "DZ A1 1HS", framesPerDirection: 19, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    "2hs": { animationClass: "DZ A1 2HS", framesPerDirection: 21, animationSpeed: 256, startingFrame: 0, actionFrame: 10 },
    "1ht": { animationClass: "DZ A1 1HT", framesPerDirection: 19, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    "2ht": { animationClass: "DZ A1 2HT", framesPerDirection: 23, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    stf: { animationClass: "DZ A1 STF", framesPerDirection: 17, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    bow: { animationClass: "DZ A1 BOW", framesPerDirection: 16, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    xbw: { animationClass: "DZ A1 XBW", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 10 },
  },
  NECROMANCER: {
    hth: { animationClass: "NE A1 HTH", framesPerDirection: 15, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    "1hs": { animationClass: "NE A1 1HS", framesPerDirection: 19, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    "2hs": { animationClass: "NE A1 2HS", framesPerDirection: 23, animationSpeed: 256, startingFrame: 0, actionFrame: 11 },
    "1ht": { animationClass: "NE A1 1HT", framesPerDirection: 19, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    "2ht": { animationClass: "NE A1 2HT", framesPerDirection: 24, animationSpeed: 256, startingFrame: 0, actionFrame: 10 },
    stf: { animationClass: "NE A1 STF", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 11 },
    bow: { animationClass: "NE A1 BOW", framesPerDirection: 18, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    xbw: { animationClass: "NE A1 XBW", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 11 },
  },
  PALADIN: {
    hth: { animationClass: "PA A1 HTH", framesPerDirection: 14, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    "1hs": { animationClass: "PA A1 1HS", framesPerDirection: 15, animationSpeed: 256, startingFrame: 0, actionFrame: 7 },
    "2hs": { animationClass: "PA A1 2HS", framesPerDirection: 18, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    "1ht": { animationClass: "PA A1 1HT", framesPerDirection: 17, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    "2ht": { animationClass: "PA A1 2HT", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    stf: { animationClass: "PA A1 STF", framesPerDirection: 18, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    bow: { animationClass: "PA A1 BOW", framesPerDirection: 16, animationSpeed: 256, startingFrame: 0, actionFrame: 8 },
    xbw: { animationClass: "PA A1 XBW", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 10 },
  },
  SORCERESS: {
    hth: { animationClass: "SO A1 HTH", framesPerDirection: 16, animationSpeed: 256, startingFrame: 1, actionFrame: 9 },
    "1hs": { animationClass: "SO A1 1HS", framesPerDirection: 20, animationSpeed: 256, startingFrame: 2, actionFrame: 12 },
    "2hs": { animationClass: "SO A1 2HS", framesPerDirection: 24, animationSpeed: 256, startingFrame: 2, actionFrame: 14 },
    "1ht": { animationClass: "SO A1 1HT", framesPerDirection: 19, animationSpeed: 256, startingFrame: 2, actionFrame: 11 },
    "2ht": { animationClass: "SO A1 2HT", framesPerDirection: 23, animationSpeed: 256, startingFrame: 2, actionFrame: 13 },
    stf: { animationClass: "SO A1 STF", framesPerDirection: 18, animationSpeed: 256, startingFrame: 2, actionFrame: 11 },
    bow: { animationClass: "SO A1 BOW", framesPerDirection: 17, animationSpeed: 256, startingFrame: 0, actionFrame: 9 },
    xbw: { animationClass: "SO A1 XBW", framesPerDirection: 20, animationSpeed: 256, startingFrame: 0, actionFrame: 11 },
  },
};

export function getNormalAttackProfile(characterClass: string, weaponClass: string) {
  return NORMAL_ATTACK_PROFILES[characterClass]?.[weaponClass] ?? null;
}

export function referenceWeaponClass(characterClass: string, weaponCode: string, skill: string, weaponMode = "DEFAULT") {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  if (!weapon || weapon.itemType === "tpot") return null;
  if (weapon.itemTypeClassTag === "ama" && characterClass !== "AMAZON") return null;
  if (weapon.itemTypeClassTag === "ass" && characterClass !== "ASSASSIN") return null;
  if (weapon.itemTypeClassTag === "sor" && characterClass !== "SORCERESS") return null;
  if (characterClass === "BARBARIAN" && skill === "BARBARIAN_TWO_HANDED_NORMAL_ATTACK") {
    if (weapon.handedness !== "conditional" && weapon.handedness !== "two-handed") return null;
    return weapon.twoHandedWclass;
  }
  if (weapon.handedness === "conditional") {
    if (weaponMode === "ONE_HAND") return weapon.weaponClass;
    if (weaponMode === "TWO_HAND") return weapon.twoHandedWclass;
    return null;
  }
  if (weaponMode === "ONE_HAND" && weapon.handedness === "two-handed") return null;
  if (weaponMode === "TWO_HAND" && weapon.handedness === "one-handed") return null;
  if (weapon.weaponClass === "ht1" && characterClass !== "ASSASSIN") return null;
  if (characterClass === "ASSASSIN" && weapon.itemTypeClassTag === "ass") return "ht1";
  return weapon.weaponClass;
}

export function canUseReferenceNormalAttack(characterClass: string, weaponCode: string, skill: string, weaponMode = "DEFAULT") {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  if (!weapon || !weapon.spawnable || !referenceWeaponClass(characterClass, weaponCode, skill, weaponMode)) return false;
  return weapon.wsm !== null || IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier !== undefined;
}

export function amazonJabSequenceLength(weaponCode: string, weaponMode = "DEFAULT") {
  const weaponClass = referenceWeaponClass("AMAZON", weaponCode, "NORMAL_ATTACK", weaponMode);
  if (weaponClass === "1ht") return 18;
  if (weaponClass === "2ht") return 21;
  return null;
}

export function canUseReferenceAmazonJab(weaponCode: string, weaponMode = "DEFAULT") {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  const length = amazonJabSequenceLength(weaponCode, weaponMode);
  return Boolean(weapon?.spawnable && length !== null && (weapon.wsm !== null || IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier !== undefined));
}

function calculateAmazonJabFrames(totalIAS: number, wsm: number, fanaticismLevel: number, sequenceLength: number) {
  const itemEffectiveIAS = Math.floor((120 * totalIAS) / (120 + totalIAS));
  const eiasRaw = itemEffectiveIAS + (fanaticismLevel ? fanaticismSIAS(fanaticismLevel) : 0) - wsm;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const sequenceEias = Math.max(-85, Math.min(75, eiasRaw - 30));
  const speedIncrease = Math.floor(256 * (100 + sequenceEias) / 100);
  return {
    itemEffectiveIAS,
    eiasRaw,
    eiasApplied,
    speedIncrease,
    fullAnimationFrames: Math.ceil(256 * sequenceLength / speedIncrease),
  };
}

export function calculateReferenceAmazonJab(input: NormalizedIASInput, wsm: number, sequenceLength: number): IASResult {
  const values = calculateAmazonJabFrames(input.totalIAS, wsm, input.fanaticismLevel, sequenceLength);
  const rows = getReferenceAmazonJabBreakpointRows(input.weaponCode, input.weaponMode, IAS_HARD_MAX, input.fanaticismLevel);
  const current = rows.filter((row) => row.ias <= input.totalIAS).at(-1);
  const next = rows.find((row) => row.ias > input.totalIAS);
  return {
    status: "REFERENCE_BASED",
    reasonCode: "REFERENCE_BASED_RESULT",
    fullAnimationFrames: values.fullAnimationFrames,
    totalIAS: input.totalIAS,
    effectiveIAS: Math.max(-85, Math.min(75, values.eiasRaw - 30)),
    currentBreakpoint: current?.ias ?? 0,
    nextBreakpoint: next?.ias ?? null,
    requiredAdditionalIAS: next ? next.ias - input.totalIAS : null,
    evidenceVersion: "D2R-3.3.93847-IAS-6-AMAZON-JAB-SEQUENCE",
    reason: `Amazon Jab ${sequenceLength}-frame sequence model from published D2R attack rules.`,
    attackSequence: { hitCount: 3, totalSequenceFrames: values.fullAnimationFrames, label: "잽 3회 연속 공격" },
    trace: {
      weaponSpeedModifier: wsm, totalIAS: input.totalIAS, itemEffectiveIAS: values.itemEffectiveIAS,
      eiasRaw: values.eiasRaw, eiasApplied: Math.max(-85, Math.min(75, values.eiasRaw - 30)), animationSpeed: 256,
      framesPerDirection: sequenceLength, startingFrame: 0, speedIncrease: values.speedIncrease,
      fullAnimationFrames: values.fullAnimationFrames, skillSpeedModifier: -30,
    },
  };
}

export function getReferenceAmazonJabBreakpointRows(weaponCode: string, weaponMode: string, maxIAS: number, fanaticismLevel = 0) {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  const sequenceLength = amazonJabSequenceLength(weaponCode, weaponMode);
  const wsm = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? weapon?.wsm;
  if (sequenceLength === null || sequenceLength === undefined || wsm === null || wsm === undefined) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= maxIAS; ias++) {
    const frames = calculateAmazonJabFrames(ias, wsm, fanaticismLevel, sequenceLength).fullAnimationFrames;
    if (frames !== previous) rows.push({ ias, fullAnimationFrames: frames });
    previous = frames;
  }
  return rows;
}

export function calculateReferenceNormalAttack(input: NormalizedIASInput, profile: NormalAttackAnimationProfile, wsm: number): IASResult {
  const itemEffectiveIAS = Math.floor((120 * input.totalIAS) / (120 + input.totalIAS));
  const eiasRaw = itemEffectiveIAS + input.skillIAS + input.buffIAS - input.debuffIAS + (input.fanaticismLevel ? fanaticismSIAS(input.fanaticismLevel) : 0) - wsm;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const speedIncrease = Math.floor((profile.animationSpeed * (100 + eiasApplied)) / 100);
  const fullAnimationFrames = Math.ceil((256 * (profile.framesPerDirection - profile.startingFrame)) / speedIncrease) - 1;
  const breakpointRows = getReferenceNormalBreakpointRows(input.characterClass as IASCharacterClass, input.weaponCode, input.skill, IAS_HARD_MAX, input.fanaticismLevel, input.weaponMode);
  const current = breakpointRows.filter((row) => row.ias <= input.totalIAS).at(-1);
  const next = breakpointRows.find((row) => row.ias > input.totalIAS);
  return {
    status: "REFERENCE_BASED",
    reasonCode: "REFERENCE_BASED_RESULT",
    fullAnimationFrames,
    totalIAS: input.totalIAS,
    effectiveIAS: eiasApplied,
    currentBreakpoint: current?.ias ?? 0,
    nextBreakpoint: next?.ias ?? null,
    requiredAdditionalIAS: next ? next.ias - input.totalIAS : null,
    evidenceVersion: "D2R-3.3.93847-IAS-6-REFERENCE-NORMAL-A1",
    reason: `${profile.animationClass} 일반 공격 프레임 공식을 외부 공개 기준으로 계산한 참고값입니다.`,
    trace: {
      weaponSpeedModifier: wsm, totalIAS: input.totalIAS, itemEffectiveIAS, eiasRaw, eiasApplied,
      animationSpeed: profile.animationSpeed, framesPerDirection: profile.framesPerDirection,
      startingFrame: profile.startingFrame, speedIncrease, fullAnimationFrames,
    },
  };
}

export function getReferenceNormalBreakpointRows(characterClass: string, weaponCode: string, skill: string, maxIAS: number, fanaticismLevel = 0, weaponMode = "DEFAULT") {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  const profileWeaponClass = referenceWeaponClass(characterClass, weaponCode, skill, weaponMode);
  const profile = profileWeaponClass ? getNormalAttackProfile(characterClass, profileWeaponClass) : null;
  const wsm = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? weapon?.wsm;
  if (!profile || wsm === null || wsm === undefined) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= maxIAS; ias++) {
    const itemEffectiveIAS = Math.floor((120 * ias) / (120 + ias));
    const eias = Math.max(-85, Math.min(75, itemEffectiveIAS + (fanaticismLevel ? fanaticismSIAS(fanaticismLevel) : 0) - wsm));
    const speed = Math.floor((profile.animationSpeed * (100 + eias)) / 100);
    const frames = Math.ceil((256 * (profile.framesPerDirection - profile.startingFrame)) / speed) - 1;
    if (frames !== previous) rows.push({ ias, fullAnimationFrames: frames });
    previous = frames;
  }
  return rows;
}
