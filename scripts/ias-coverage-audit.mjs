import { IAS_SUPPORTED_CLASSES, getClassSkills } from "../lib/ias/class-registry.ts";
import { IAS_SKILLS } from "../lib/ias/skills.ts";
import { IAS_WEAPON_CATALOG } from "../lib/ias/weapon-catalog.ts";
import { IAS_WEAPONS } from "../lib/ias/weapons.ts";
import { getCalculatorViewModelFromParts } from "../lib/ias/ui-model.ts";
import { canUseReferenceNormalAttack, referenceWeaponClass } from "../lib/ias/reference-normal-attack.ts";

const weapons = new Map(IAS_WEAPON_CATALOG.map((weapon) => [weapon.code, weapon]));
const supportedModes = (characterClass, skill, weapon) => {
  if (["ASSASSIN_DRAGON_CLAW", "ASSASSIN_FISTS_OF_FIRE", "ASSASSIN_CLAWS_OF_THUNDER", "ASSASSIN_BLADES_OF_ICE", "BARBARIAN_DOUBLE_SWING", "BARBARIAN_DOUBLE_THROW", "BARBARIAN_FRENZY", "BARBARIAN_WHIRLWIND"].includes(skill)) return weapon.handedness === "two-handed" ? [] : ["ONE_HAND"];
  if (skill === "BARBARIAN_TWO_HANDED_NORMAL_ATTACK") return canUseReferenceNormalAttack(characterClass, weapon.code, skill, "TWO_HAND") ? ["TWO_HAND"] : [];
  return ["ONE_HAND", "TWO_HAND"].filter((mode) => referenceWeaponClass(characterClass, weapon.code, skill, mode) !== null && canUseReferenceNormalAttack(characterClass, weapon.code, skill, mode));
};
const classEntries = new Map();
const combos = [];

for (const characterClass of IAS_SUPPORTED_CLASSES) {
  if (characterClass === "PALADIN") {
    const skills = Object.values(IAS_SKILLS).filter((entry) => entry.selectable);
    classEntries.set(characterClass, skills.length);
    for (const entry of skills) {
      for (const code of entry.supportedWeapons) {
        combos.push({ characterClass, skill: entry.code, weaponCode: code, form: "HUMAN", mode: "ONE_HAND", statusHint: entry.evidenceStatus });
      }
    }
    continue;
  }

  const entries = getClassSkills(characterClass).filter((entry) => entry.verificationStatus === "VERIFIED" || entry.verificationStatus === "REFERENCE_BASED");
  classEntries.set(characterClass, entries.length);
  for (const entry of entries) {
    const forms = entry.characterForm ? [entry.characterForm] : characterClass === "DRUID" && ["DRUID_FIRE_CLAWS", "DRUID_HUNGER"].includes(entry.skill) ? ["WEREWOLF", "WEREBEAR"] : ["HUMAN"];
    for (const code of entry.supportedWeapons) {
      const weapon = weapons.get(code);
      if (!weapon) continue;
      for (const form of forms) {
        for (const mode of supportedModes(characterClass, entry.skill, weapon)) {
          const assassinDual = entry.skill === "ASSASSIN_DRAGON_CLAW" || ["ASSASSIN_FISTS_OF_FIRE", "ASSASSIN_CLAWS_OF_THUNDER", "ASSASSIN_BLADES_OF_ICE"].includes(entry.skill);
          if (assassinDual) {
            for (const secondary of entry.supportedWeapons) if (weapons.get(secondary)?.handedness !== "two-handed") combos.push({ characterClass, skill: entry.skill, weaponCode: code, secondaryWeaponCode: secondary, form, mode, statusHint: entry.verificationStatus });
            continue;
          }
          if (entry.skill === "BARBARIAN_FRENZY" || entry.skill === "BARBARIAN_DOUBLE_THROW") {
            for (const secondary of entry.supportedWeapons) if ((entry.skill === "BARBARIAN_DOUBLE_THROW" || secondary !== code) && canUseReferenceNormalAttack("BARBARIAN", secondary, "BARBARIAN_NORMAL_ATTACK", "ONE_HAND")) combos.push({ characterClass, skill: entry.skill, weaponCode: code, secondaryWeaponCode: secondary, form, mode, statusHint: entry.verificationStatus });
            continue;
          }
          if (entry.skill === "BARBARIAN_DOUBLE_SWING") {
            for (const secondary of ["7cr", "whm"]) combos.push({ characterClass, skill: entry.skill, weaponCode: code, secondaryWeaponCode: secondary, form, mode, statusHint: entry.verificationStatus });
            continue;
          }
          if (entry.skill === "BARBARIAN_WHIRLWIND") {
            combos.push({ characterClass, skill: entry.skill, weaponCode: code, form, mode, statusHint: entry.verificationStatus });
            if (mode === "ONE_HAND") for (const secondary of entry.supportedWeapons.filter((candidate) => canUseReferenceNormalAttack("BARBARIAN", candidate, "BARBARIAN_NORMAL_ATTACK", "ONE_HAND"))) combos.push({ characterClass, skill: entry.skill, weaponCode: code, secondaryWeaponCode: secondary, form, mode, statusHint: entry.verificationStatus });
            continue;
          }
          combos.push({ characterClass, skill: entry.skill, weaponCode: code, form, mode, statusHint: entry.verificationStatus });
        }
      }
    }
  }
}

const counts = { VERIFIED: 0, REFERENCE_BASED: 0, CONFLICTED: 0, UNSUPPORTED: 0, INVALID_INPUT: 0, UNVERIFIED: 0 };
const byClass = Object.fromEntries(IAS_SUPPORTED_CLASSES.map((name) => [name, { entries: classEntries.get(name) ?? 0, candidates: 0, ...Object.fromEntries(Object.keys(counts).map((key) => [key, 0])) }]));
const failures = [];
const numericCodes = new Set();
const numericCodesByClass = new Map(IAS_SUPPORTED_CLASSES.map((name) => [name, new Set()]));

for (const combo of combos) {
  const result = getCalculatorViewModelFromParts("0", "0", {
    characterClass: combo.characterClass,
    characterForm: combo.form,
    weaponCode: combo.weaponCode,
    secondaryWeaponCode: combo.secondaryWeaponCode,
    animation: combo.skill === "SMITE" ? "S1" : "A1",
    skill: combo.skill,
    weaponMode: combo.mode,
    skillLevel: 1,
    hitCount: 2,
  });
  let category = result.status;
  if (category === "SUPPORTED") category = combo.statusHint === "VERIFIED" ? "VERIFIED" : "REFERENCE_BASED";
  if (!Object.hasOwn(counts, category)) category = "UNSUPPORTED";
  counts[category] += 1;
  byClass[combo.characterClass].candidates += 1;
  byClass[combo.characterClass][category] += 1;
  if (category === "VERIFIED" || category === "REFERENCE_BASED") {
    numericCodes.add(combo.weaponCode);
    numericCodesByClass.get(combo.characterClass).add(combo.weaponCode);
  }
  if (category === "UNSUPPORTED" || category === "CONFLICTED" || category === "INVALID_INPUT" || category === "UNVERIFIED") {
    failures.push({ class: combo.characterClass, skill: combo.skill, weapon: combo.weaponCode, secondary: combo.secondaryWeaponCode ?? null, form: combo.form, mode: combo.mode, status: result.status, reason: result.reason });
  }
}

const knownWsm = IAS_WEAPON_CATALOG.filter((weapon) => weapon.wsm !== null).length;
const failureGroups = new Map();
for (const failure of failures) {
  const key = `${failure.class} · ${failure.skill} · ${failure.status} · ${failure.reason}`;
  failureGroups.set(key, (failureGroups.get(key) ?? 0) + 1);
}
console.log(JSON.stringify({
  metricDefinition: "Numeric candidate denominator: registered VERIFIED/REFERENCE_BASED skill × registry-declared spawnable weapon base and legal hand mode, plus each selectable form. Conflict-only options are reported in selectableSkills but excluded from numeric candidates. Barbarian dual-wield normal attack and Paladin Charge real-rush/melee-fallback modes are excluded because they are conflict-only or distinct non-generic modes. For two-weapon skills, every ordered legal pair exposed by the UI is enumerated; Double Swing uses its recorded Phase Blade/War Hammer pairs. Charge-up inputs are held at 0 IAS and skill level 1. Arbitrary IAS values and charge states are not separate combinations.",
  classes: IAS_SUPPORTED_CLASSES.length,
  catalog: { codes: IAS_WEAPON_CATALOG.length, spawnable: IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable).length, knownWsm, unknownWsm: IAS_WEAPON_CATALOG.length - knownWsm },
  numericWeaponCodeCoverage: { distinctCodes: numericCodes.size, ofCatalog: IAS_WEAPON_CATALOG.length, rate: `${((numericCodes.size / IAS_WEAPON_CATALOG.length) * 100).toFixed(2)}%`, byClass: Object.fromEntries([...numericCodesByClass].map(([name, codes]) => [name, codes.size])) },
  weaponCodeExclusionReasons: (() => { const missing = IAS_WEAPON_CATALOG.filter((weapon) => !numericCodes.has(weapon.code)); const groups = { NON_SPAWNABLE: 0, UNKNOWN_WSM: 0, NO_REGISTERED_LEGAL_CLASS_SKILL_PATH: 0 }; for (const weapon of missing) { const resolved = weapon.wsm !== null || IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier !== undefined; if (!weapon.spawnable) groups.NON_SPAWNABLE += 1; else if (!resolved) groups.UNKNOWN_WSM += 1; else groups.NO_REGISTERED_LEGAL_CLASS_SKILL_PATH += 1; } return { count: missing.length, groups }; })(),
  selectableSkills: IAS_SUPPORTED_CLASSES.reduce((sum, characterClass) => sum + (characterClass === "PALADIN" ? Object.values(IAS_SKILLS).filter((entry) => entry.selectable).length + 1 : getClassSkills(characterClass).length), 0),
  numericSkills: [...classEntries.values()].reduce((sum, count) => sum + count, 0),
  combinations: combos.length,
  calculableCombinations: counts.VERIFIED + counts.REFERENCE_BASED,
  calculableRate: `${(((counts.VERIFIED + counts.REFERENCE_BASED) / combos.length) * 100).toFixed(2)}%`,
  counts,
  byClass,
  failureGroups: [...failureGroups].map(([label, combinations]) => ({ label, combinations })),
  failureSamples: failures.slice(0, 12),
}, null, 2));
