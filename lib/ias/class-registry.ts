import type { IASCharacterClass } from "./types.ts";

export const IAS_SUPPORTED_CLASSES = ["PALADIN", "BARBARIAN", "AMAZON", "ASSASSIN", "DRUID", "NECROMANCER", "SORCERESS"] as const satisfies readonly IASCharacterClass[];

export interface IASClassSkillDefinition {
  characterClass: IASCharacterClass;
  skill: string;
  label: string;
  animationMode: string;
  animationClass: string;
  supportedWeapons: readonly string[];
  weaponSlot: "main" | "offhand";
  maxIASByWeapon: Readonly<Record<string, number>>;
  verificationStatus: "VERIFIED" | "PROVISIONAL" | "UNVERIFIED" | "CONFLICTED" | "UNSUPPORTED";
  evidenceSource: string;
}

// IAS-5-B supports only this independently benchmarked Barbarian combination.
export interface BarbarianWeaponDefinition {
  code: string;
  label: string;
  weaponClass: "1hs";
  weaponSpeedModifier: number;
  animationMode: "A1";
  animationClass: "BAA11HS";
  maxIAS: number;
  cofFile: "baa11hs.cof";
  verificationStatus: "VERIFIED";
}

// Each weapon has a raw, explicitly populated weapons.txt WSM except Crystal Sword,
// whose existing verified WSM=0 resolution is retained from IAS-5-B.
export const BARBARIAN_WEAPONS: Readonly<Record<string, BarbarianWeaponDefinition>> = {
  crs: { code: "crs", label: "Crystal Sword", weaponClass: "1hs", weaponSpeedModifier: 0, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 200, cofFile: "baa11hs.cof", verificationStatus: "VERIFIED" },
  lsd: { code: "lsd", label: "Long Sword", weaponClass: "1hs", weaponSpeedModifier: -10, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 142, cofFile: "baa11hs.cof", verificationStatus: "VERIFIED" },
  "7cr": { code: "7cr", label: "Phase Blade", weaponClass: "1hs", weaponSpeedModifier: -30, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 72, cofFile: "baa11hs.cof", verificationStatus: "VERIFIED" },
  mpi: { code: "mpi", label: "Military Pick", weaponClass: "1hs", weaponSpeedModifier: -10, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 142, cofFile: "baa11hs.cof", verificationStatus: "VERIFIED" },
  whm: { code: "whm", label: "War Hammer", weaponClass: "1hs", weaponSpeedModifier: 20, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 456, cofFile: "baa11hs.cof", verificationStatus: "VERIFIED" },
};

export const BARBARIAN_NORMAL_ATTACK: IASClassSkillDefinition = {
  characterClass: "BARBARIAN",
  skill: "BARBARIAN_NORMAL_ATTACK",
  label: "일반 공격",
  animationMode: "A1",
  animationClass: "BAA11HS",
  supportedWeapons: Object.keys(BARBARIAN_WEAPONS),
  weaponSlot: "main",
  maxIASByWeapon: Object.fromEntries(Object.values(BARBARIAN_WEAPONS).map((weapon) => [weapon.code, weapon.maxIAS])),
  verificationStatus: "VERIFIED",
  evidenceSource: "D2R.org Barbarian breakpoint table, one-handed swing WSM 0, build 3.3.93847; local D2R weapons.txt crs record (1hs, speed blank) and existing resolved WSM 0 evidence.",
};

export const IAS_CLASS_SKILLS: Readonly<Record<string, readonly IASClassSkillDefinition[]>> = {
  PALADIN: [], // Existing Paladin-specific registry remains authoritative.
  BARBARIAN: [BARBARIAN_NORMAL_ATTACK],
  AMAZON: [], ASSASSIN: [], DRUID: [], NECROMANCER: [], SORCERESS: [], WARLOCK: [],
};

export function getClassSkills(characterClass: string) {
  return IAS_CLASS_SKILLS[characterClass] ?? [];
}

export function getClassSkill(characterClass: string, skill: string) {
  return getClassSkills(characterClass).find((entry) => entry.skill === skill);
}

export function getBarbarianWeapon(weaponCode: string) {
  return BARBARIAN_WEAPONS[weaponCode];
}
