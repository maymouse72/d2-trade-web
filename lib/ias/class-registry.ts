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
export const BARBARIAN_NORMAL_ATTACK: IASClassSkillDefinition = {
  characterClass: "BARBARIAN",
  skill: "BARBARIAN_NORMAL_ATTACK",
  label: "일반 공격",
  animationMode: "A1",
  animationClass: "BAA11HS",
  supportedWeapons: ["crs"],
  weaponSlot: "main",
  maxIASByWeapon: { crs: 200 },
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
