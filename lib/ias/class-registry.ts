import type { IASCharacterClass } from "./types.ts";
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { canUseReferenceAmazonJab, canUseReferenceNormalAttack, referenceWeaponClass } from "./reference-normal-attack.ts";

export const IAS_SUPPORTED_CLASSES = ["PALADIN", "BARBARIAN", "AMAZON", "ASSASSIN", "DRUID", "NECROMANCER", "SORCERESS"] as const satisfies readonly IASCharacterClass[];

export interface IASClassSkillDefinition {
  characterClass: IASCharacterClass;
  skill: string;
  characterForm?: string;
  label: string;
  animationMode: string;
  animationClass: string;
  supportedWeapons: readonly string[];
  weaponSlot: "main" | "offhand";
  maxIASByWeapon: Readonly<Record<string, number>>;
  verificationStatus: "VERIFIED" | "REFERENCE_BASED" | "PROVISIONAL" | "UNVERIFIED" | "CONFLICTED" | "UNSUPPORTED";
  evidenceSource: string;
  evidenceUrls?: readonly string[];
}

// IAS-5-B supports only this independently benchmarked Barbarian combination.
export interface BarbarianWeaponDefinition {
  code: string;
  label: string;
  weaponClass: "1hs" | "2hs";
  weaponSpeedModifier: number;
  animationMode: "A1";
  animationClass: "BAA11HS" | "BAA12HS";
  maxIAS: number;
  cofFile: "baa11hs.cof" | "baa12hs.cof";
  framesPerDirection: 16 | 18;
  startingFrame: 0;
  verificationStatus: "VERIFIED";
}

// Each weapon has a raw, explicitly populated weapons.txt WSM except Crystal Sword,
// whose existing verified WSM=0 resolution is retained from IAS-5-B.
export const BARBARIAN_WEAPONS: Readonly<Record<string, BarbarianWeaponDefinition>> = {
  crs: { code: "crs", label: "Crystal Sword", weaponClass: "1hs", weaponSpeedModifier: 0, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 200, cofFile: "baa11hs.cof", framesPerDirection: 16, startingFrame: 0, verificationStatus: "VERIFIED" },
  lsd: { code: "lsd", label: "Long Sword", weaponClass: "1hs", weaponSpeedModifier: -10, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 142, cofFile: "baa11hs.cof", framesPerDirection: 16, startingFrame: 0, verificationStatus: "VERIFIED" },
  "7cr": { code: "7cr", label: "Phase Blade", weaponClass: "1hs", weaponSpeedModifier: -30, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 72, cofFile: "baa11hs.cof", framesPerDirection: 16, startingFrame: 0, verificationStatus: "VERIFIED" },
  mpi: { code: "mpi", label: "Military Pick", weaponClass: "1hs", weaponSpeedModifier: -10, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 142, cofFile: "baa11hs.cof", framesPerDirection: 16, startingFrame: 0, verificationStatus: "VERIFIED" },
  whm: { code: "whm", label: "War Hammer", weaponClass: "1hs", weaponSpeedModifier: 20, animationMode: "A1", animationClass: "BAA11HS", maxIAS: 456, cofFile: "baa11hs.cof", framesPerDirection: 16, startingFrame: 0, verificationStatus: "VERIFIED" },
};

// Two-handed sword bases use BAA12HS when equipped in both hands. The code and
// WSM remain weapon-specific; the animation profile is shared by this class.
export const BARBARIAN_TWO_HANDED_WEAPONS: Readonly<Record<string, BarbarianWeaponDefinition>> = {
  "7fb": { code: "7fb", label: "Colossal Sword (양손 장착)", weaponClass: "2hs", weaponSpeedModifier: 10, animationMode: "A1", animationClass: "BAA12HS", maxIAS: 200, cofFile: "baa12hs.cof", framesPerDirection: 18, startingFrame: 0, verificationStatus: "VERIFIED" },
  "72h": { code: "72h", label: "Legend Sword (양손 장착)", weaponClass: "2hs", weaponSpeedModifier: -15, animationMode: "A1", animationClass: "BAA12HS", maxIAS: 200, cofFile: "baa12hs.cof", framesPerDirection: 18, startingFrame: 0, verificationStatus: "VERIFIED" },
  "9fb": { code: "9fb", label: "Zweihander (양손 장착)", weaponClass: "2hs", weaponSpeedModifier: -10, animationMode: "A1", animationClass: "BAA12HS", maxIAS: 200, cofFile: "baa12hs.cof", framesPerDirection: 18, startingFrame: 0, verificationStatus: "VERIFIED" },
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

export const BARBARIAN_TWO_HANDED_NORMAL_ATTACK: IASClassSkillDefinition = {
  characterClass: "BARBARIAN",
  skill: "BARBARIAN_TWO_HANDED_NORMAL_ATTACK",
  label: "일반 공격 · 양손 장착",
  animationMode: "A1",
  animationClass: "BAA12HS",
  supportedWeapons: Object.keys(BARBARIAN_TWO_HANDED_WEAPONS),
  weaponSlot: "main",
  maxIASByWeapon: Object.fromEntries(Object.values(BARBARIAN_TWO_HANDED_WEAPONS).map((weapon) => [weapon.code, weapon.maxIAS])),
  verificationStatus: "VERIFIED",
  evidenceSource: "D2R 3.3.93847 weapons.txt 7fb (2handedwclass=2hs, speed=10); extracted BAA12HS COF (FPD18, speed256, event slot8); Amazon Basin Barbarian 2HS WSM +10 breakpoint table.",
};

export const BARBARIAN_DUAL_WIELD_NORMAL_ATTACK: IASClassSkillDefinition = {
  characterClass: "BARBARIAN",
  skill: "BARBARIAN_DUAL_WIELD_NORMAL_ATTACK",
  label: "쌍수 일반 공격 · 자료 충돌로 계산 불가",
  animationMode: "A1",
  animationClass: "Barbarian dual-wield normal attack",
  supportedWeapons: [],
  weaponSlot: "main",
  maxIASByWeapon: {},
  verificationStatus: "CONFLICTED",
  evidenceUrls: ["https://d2r-tools.com/ias/calculations", "https://github.com/Warren1001/IAS_Calculator"],
  evidenceSource: "D2R Tools documents averaged WSM/IEIAS for sequence/dual-wield skills; Warren1001 notes off-hand character Normal Attack is untested. The references do not establish a reliable alternating normal-attack cycle.",
};

function barbarianStandardAttackSkill(skill: "BARBARIAN_CONCENTRATE" | "BARBARIAN_BERSERK" | "BARBARIAN_BASH" | "BARBARIAN_STUN", label: string): IASClassSkillDefinition {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => canUseReferenceNormalAttack("BARBARIAN", weapon.code, "BARBARIAN_NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND")).map((weapon) => weapon.code);
  return {
    characterClass: "BARBARIAN", skill, label, animationMode: "A1", animationClass: "Barbarian standard A1 weapon animation",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://d2r-tools.com/ias/calculations", "https://d2r.org/tools/breakpoints/barbarian"],
    evidenceSource: "D2R Tools standard-skill list explicitly maps Concentrate, Berserk, Bash, and Stun to the weapon's normal attack animation; class A1 profile and WSM come from the IAS-6 reference data.",
  };
}

export const BARBARIAN_STANDARD_ATTACK_SKILLS: readonly IASClassSkillDefinition[] = [
  barbarianStandardAttackSkill("BARBARIAN_CONCENTRATE", "집중 (Concentrate)"),
  barbarianStandardAttackSkill("BARBARIAN_BERSERK", "광폭화 (Berserk)"),
  barbarianStandardAttackSkill("BARBARIAN_BASH", "강타 (Bash)"),
  barbarianStandardAttackSkill("BARBARIAN_STUN", "기절 (Stun)"),
];

export const AMAZON_JAB: IASClassSkillDefinition = {
  characterClass: "AMAZON", skill: "AMAZON_JAB", label: "잽 (Jab)", animationMode: "A1",
  animationClass: "Amazon sequence · 1HT / 2HT", supportedWeapons: IAS_WEAPON_CATALOG
    .filter((weapon) => canUseReferenceAmazonJab(weapon.code, weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND"))
    .map((weapon) => weapon.code),
  weaponSlot: "main", maxIASByWeapon: Object.fromEntries(IAS_WEAPON_CATALOG.filter((weapon) => canUseReferenceAmazonJab(weapon.code, weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND")).map((weapon) => [weapon.code, 456])),
  verificationStatus: "REFERENCE_BASED",
  evidenceUrls: ["https://d2r.org/tools/breakpoints/amazon", "https://github.com/Warren1001/IAS_Calculator"],
  evidenceSource: "D2R.org build 3.3.93847 attack rules: Amazon Jab is a 3-hit sequence, 18 frames for 1HT and 21 for spear (2HT), sequence EIAS penalty −30 before clamp; no final −1.",
};

export const AMAZON_IMPALE: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable
    && ["jave", "ajav", "spea", "aspe"].includes(weapon.itemType)
    && (weapon.weaponClass === "1ht" || weapon.weaponClass === "2ht"))
    .map((weapon) => weapon.code);
  return {
    characterClass: "AMAZON", skill: "AMAZON_IMPALE", label: "꿰뚫기 (Impale)",
    animationMode: "A1", animationClass: "Amazon Impale dedicated 1HT/2HT frame table",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://www.theamazonbasin.com/wiki/index.php/Amazon_attack_speed", "https://d2r.org/tools/breakpoints/amazon"],
    evidenceSource: "Amazon Basin publishes dedicated Impale 1HT and 2HT EIAS/frame tables; the project transcribes those tiers and uses the existing catalog WSM and item-IAS diminishing-returns rule.",
  };
})();

type AmazonBowSkill = "AMAZON_MAGIC_ARROW" | "AMAZON_FIRE_ARROW" | "AMAZON_COLD_ARROW" | "AMAZON_MULTIPLE_SHOT" | "AMAZON_EXPLODING_ARROW" | "AMAZON_ICE_ARROW" | "AMAZON_GUIDED_ARROW" | "AMAZON_FREEZING_ARROW" | "AMAZON_IMMOLATION_ARROW";

function amazonBowAttackSkill(skill: AmazonBowSkill, label: string): IASClassSkillDefinition {
  const weapons = IAS_WEAPON_CATALOG.filter((weapon) => {
    return weapon.spawnable && weapon.itemTypeClassTag !== "ass" && (weapon.weaponClass === "bow" || weapon.weaponClass === "xbw") && weapon.wsm !== null;
  });
  return {
    characterClass: "AMAZON", skill, label, animationMode: "A1", animationClass: "Amazon A1 BOW/XBW",
    supportedWeapons: weapons.map((weapon) => weapon.code), weaponSlot: "main",
    maxIASByWeapon: Object.fromEntries(weapons.map((weapon) => [weapon.code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://www.theamazonbasin.com/wiki/index.php/Amazon_attack_speed", "https://d2r.org/tools/breakpoints/amazon"],
    evidenceSource: "D2R.org build 3.3.93847 Amazon bow/crossbow A1 attack animation and published human-form FPA formula; projectile multi-target/homing behavior is outside IAS timing.",
  };
}

export const AMAZON_MULTIPLE_SHOT = amazonBowAttackSkill("AMAZON_MULTIPLE_SHOT", "다발 사격 (Multiple Shot)");
export const AMAZON_GUIDED_ARROW = amazonBowAttackSkill("AMAZON_GUIDED_ARROW", "유도 화살 (Guided Arrow)");
export const AMAZON_BOW_SKILLS: readonly IASClassSkillDefinition[] = [
  amazonBowAttackSkill("AMAZON_MAGIC_ARROW", "마법 화살 (Magic Arrow)"),
  amazonBowAttackSkill("AMAZON_FIRE_ARROW", "불꽃 화살 (Fire Arrow)"),
  amazonBowAttackSkill("AMAZON_COLD_ARROW", "냉기 화살 (Cold Arrow)"),
  AMAZON_MULTIPLE_SHOT,
  amazonBowAttackSkill("AMAZON_EXPLODING_ARROW", "폭발 화살 (Exploding Arrow)"),
  amazonBowAttackSkill("AMAZON_ICE_ARROW", "얼음 화살 (Ice Arrow)"),
  AMAZON_GUIDED_ARROW,
  amazonBowAttackSkill("AMAZON_FREEZING_ARROW", "빙결 화살 (Freezing Arrow)"),
  amazonBowAttackSkill("AMAZON_IMMOLATION_ARROW", "점화 화살 (Immolation Arrow)"),
];

type AmazonThrowSkill = "AMAZON_THROW" | "AMAZON_POISON_JAVELIN" | "AMAZON_PLAGUE_JAVELIN" | "AMAZON_LIGHTNING_BOLT" | "AMAZON_LIGHTNING_FURY";

function amazonThrowSkill(skill: AmazonThrowSkill, label: string): IASClassSkillDefinition {
  const weapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.itemType === "jave" && weapon.wsm !== null);
  return {
    characterClass: "AMAZON", skill, label, animationMode: "A1", animationClass: "Amazon 1HT Throw",
    supportedWeapons: weapons.map((weapon) => weapon.code), weaponSlot: "main",
    maxIASByWeapon: Object.fromEntries(weapons.map((weapon) => [weapon.code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://www.theamazonbasin.com/wiki/index.php/Amazon_attack_speed", "https://d2r.org/tools/breakpoints/amazon"],
    evidenceSource: "Amazon Basin Amazon attack-speed Throw 1HT table; the table explicitly also applies to Poison Javelin, Plague Javelin, Lightning Bolt, and Lightning Fury.",
  };
}

export const AMAZON_THROW_SKILLS: readonly IASClassSkillDefinition[] = [
  amazonThrowSkill("AMAZON_THROW", "투척 공격 (Throw)"),
  amazonThrowSkill("AMAZON_POISON_JAVELIN", "맹독 투창 (Poison Javelin)"),
  amazonThrowSkill("AMAZON_PLAGUE_JAVELIN", "역병 투창 (Plague Javelin)"),
  amazonThrowSkill("AMAZON_LIGHTNING_BOLT", "번개의 격노 (Lightning Bolt)"),
  amazonThrowSkill("AMAZON_LIGHTNING_FURY", "번개의 분노 (Lightning Fury)"),
];

function amazonThrustSkill(skill: "AMAZON_POWER_STRIKE" | "AMAZON_CHARGED_STRIKE" | "AMAZON_LIGHTNING_STRIKE", label: string): IASClassSkillDefinition {
  const weapons = IAS_WEAPON_CATALOG.filter((weapon) => {
    return weapon.spawnable && (weapon.weaponClass === "1ht" || weapon.weaponClass === "2ht") && weapon.wsm !== null;
  });
  return {
    characterClass: "AMAZON", skill, label, animationMode: "A1", animationClass: "Amazon A1 1HT/2HT",
    supportedWeapons: weapons.map((weapon) => weapon.code), weaponSlot: "main",
    maxIASByWeapon: Object.fromEntries(weapons.map((weapon) => [weapon.code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceSource: "Amazon Basin Amazon attack-speed reference states 1HT/2HT breakpoint tables also apply to Power Strike, Charged Strike, and Lightning Strike; current D2R.org A1 profiles and WSM catalogue provide class frame/weapon inputs.",
  };
}

export const AMAZON_THRUST_SKILLS: readonly IASClassSkillDefinition[] = [
  amazonThrustSkill("AMAZON_POWER_STRIKE", "전기의 일격 (Power Strike)"),
  amazonThrustSkill("AMAZON_CHARGED_STRIKE", "전류의 일격 (Charged Strike)"),
  amazonThrustSkill("AMAZON_LIGHTNING_STRIKE", "번개의 일격 (Lightning Strike)"),
];

export const AMAZON_FEND: IASClassSkillDefinition = {
  characterClass: "AMAZON", skill: "AMAZON_FEND", label: "난격 (Fend · 2대상 시퀀스)", animationMode: "A1",
  animationClass: "Amazon Fend 1HT/2HT sequence", supportedWeapons: IAS_WEAPON_CATALOG
    .filter((weapon) => weapon.spawnable && (weapon.weaponClass === "1ht" || weapon.weaponClass === "2ht") && weapon.wsm !== null)
    .map((weapon) => weapon.code),
  weaponSlot: "main", maxIASByWeapon: Object.fromEntries(IAS_WEAPON_CATALOG
    .filter((weapon) => weapon.spawnable && (weapon.weaponClass === "1ht" || weapon.weaponClass === "2ht") && weapon.wsm !== null)
    .map((weapon) => [weapon.code, 456])),
  verificationStatus: "REFERENCE_BASED",
  evidenceUrls: ["https://www.theamazonbasin.com/wiki/index.php/Fend_attack_speed", "https://d2r.org/tools/breakpoints/amazon"],
  evidenceSource: "Amazon Basin Fend attack-speed table: two-target sequence duration is First + Last by 1HT/2HT weapon class; this initial model intentionally fixes target count to two.",
};

export const AMAZON_STRAFE: IASClassSkillDefinition = {
  characterClass: "AMAZON", skill: "AMAZON_STRAFE", label: "속사 (Strafe)", animationMode: "A1",
  animationClass: "Amazon Strafe BOW/XBW sequence", supportedWeapons: IAS_WEAPON_CATALOG
    .filter((weapon) => weapon.spawnable && (weapon.weaponClass === "bow" || weapon.weaponClass === "xbw") && weapon.wsm !== null)
    .map((weapon) => weapon.code),
  weaponSlot: "main", maxIASByWeapon: Object.fromEntries(IAS_WEAPON_CATALOG
    .filter((weapon) => weapon.spawnable && (weapon.weaponClass === "bow" || weapon.weaponClass === "xbw") && weapon.wsm !== null)
    .map((weapon) => [weapon.code, 456])),
  verificationStatus: "REFERENCE_BASED",
  evidenceUrls: ["https://www.theamazonbasin.com/wiki/index.php/Strafe_attack_speed", "https://d2r.org/tools/breakpoints/amazon"],
  evidenceSource: "Amazon Basin Strafe attack-speed table: First/Follow/Last sequence for bow and crossbow; continuous bow follow-up interval has a 3-frame floor and crossbow has a 4-frame floor.",
};

export const ASSASSIN_DRAGON_CLAW: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.itemTypeClassTag === "ass" && weapon.wsm !== null).map((weapon) => weapon.code);
  return {
    characterClass: "ASSASSIN", skill: "ASSASSIN_DRAGON_CLAW", label: "용의 발톱 (Dragon Claw · 쌍클러)",
    animationMode: "A1", animationClass: "Assassin dual-claw two-hit sequence",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://github.com/Warren1001/IAS_Calculator", "https://tradia.me/diablo2/weapon_speed_calculator", "https://d2r.org/data/skills/dragon-claw"],
    evidenceSource: "Warren1001 v1.2.6 + TrAdia build 93847 symmetric dual-claw sequence results. Mixed WSM and unequal per-hand IAS are marked CONFLICTED because public references disagree.",
  };
})();

function assassinStandardMartialSkill(skill: "ASSASSIN_TIGER_STRIKE" | "ASSASSIN_COBRA_STRIKE" | "ASSASSIN_PHOENIX_STRIKE", label: string): IASClassSkillDefinition {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.wsm !== null
    && referenceWeaponClass("ASSASSIN", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND") !== null)
    .map((weapon) => weapon.code);
  return { characterClass: "ASSASSIN", skill, label, animationMode: "A1", animationClass: "Assassin standard weapon A1 martial charge-up",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED", evidenceUrls: ["https://d2r-tools.com/ias/calculations", "https://d2r.org/tools/breakpoints/assassin"],
    evidenceSource: "D2R Tools standard-skill list maps Tiger Strike, Cobra Strike, and Phoenix Strike to the weapon normal-attack animation; catalog WSM and Assassin A1 profile supply weapon timing." };
}

export const ASSASSIN_MARTIAL_STANDARD_SKILLS: readonly IASClassSkillDefinition[] = [
  assassinStandardMartialSkill("ASSASSIN_TIGER_STRIKE", "호랑이 일격 (Tiger Strike)"),
  assassinStandardMartialSkill("ASSASSIN_COBRA_STRIKE", "코브라 일격 (Cobra Strike)"),
  assassinStandardMartialSkill("ASSASSIN_PHOENIX_STRIKE", "피닉스 일격 (Phoenix Strike)"),
];

function assassinDualClawSequenceSkill(skill: "ASSASSIN_FISTS_OF_FIRE" | "ASSASSIN_CLAWS_OF_THUNDER" | "ASSASSIN_BLADES_OF_ICE", label: string): IASClassSkillDefinition {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.itemTypeClassTag === "ass" && weapon.wsm !== null).map((weapon) => weapon.code);
  return { characterClass: "ASSASSIN", skill, label, animationMode: "A1", animationClass: "Assassin dual-claw 16-FPD charge-up attack",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED", evidenceUrls: ["https://d2r-tools.com/ias/calculations"],
    evidenceSource: "D2R Tools IAS calculation reference: Fists of Fire, Claws of Thunder, and Blades of Ice use the 16-FPD other/dual-wield sequence, apply sequence EIAS −30, and average both weapons' WSM and IEIAS." };
}

export const ASSASSIN_DUAL_CLAW_SEQUENCE_SKILLS: readonly IASClassSkillDefinition[] = [
  assassinDualClawSequenceSkill("ASSASSIN_FISTS_OF_FIRE", "불의 주먹 (Fists of Fire · 쌍클러)"),
  assassinDualClawSequenceSkill("ASSASSIN_CLAWS_OF_THUNDER", "천둥의 손톱 (Claws of Thunder · 쌍클러)"),
  assassinDualClawSequenceSkill("ASSASSIN_BLADES_OF_ICE", "얼음 칼날 (Blades of Ice · 쌍클러)"),
];

export const ASSASSIN_DRAGON_TALON: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.parentType !== "miss" && weapon.wsm !== null).map((weapon) => weapon.code);
  return {
    characterClass: "ASSASSIN", skill: "ASSASSIN_DRAGON_TALON", label: "용의 발톱 (Dragon Talon · 발차기)",
    animationMode: "A1", animationClass: "Assassin kick rollback sequence",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceSource: "D2R.org build 3.3.93847 kick count and Warren1001 v1.2.6 rollback frames; limited to the model's documented human-form single-weapon inputs.",
    evidenceUrls: ["https://d2r.org/mechanics/dragon-talon", "https://raw.githubusercontent.com/Warren1001/IAS_Calculator/master/calculator.js", "https://d2r-tools.com/ias/calculations"],
  };
})();

export const ASSASSIN_DRAGON_FLIGHT: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable
    && referenceWeaponClass("ASSASSIN", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND") !== null)
    .map((weapon) => weapon.code);
  return {
    characterClass: "ASSASSIN", skill: "ASSASSIN_DRAGON_FLIGHT", label: "용의 비상 (Dragon Flight · 고정 23프레임)",
    animationMode: "A1", animationClass: "Assassin Dragon Flight fixed 23-frame teleport-kick sequence",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 0])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://d2r.org/mechanics/dragon-flight", "https://www.theamazonbasin.com/wiki/index.php/Dragon_Flight"],
    evidenceSource: "D2R.org / Amazon Basin: Dragon Flight is a fixed 23-frame teleport-kick sequence, unaffected by IAS, FCR, or movement speed; the kick event occurs on frame 15.",
  };
})();

export const ASSASSIN_DRAGON_TAIL: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.parentType !== "miss" && weapon.wsm !== null
    && referenceWeaponClass("ASSASSIN", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND") !== null)
    .map((weapon) => weapon.code);
  return {
    characterClass: "ASSASSIN", skill: "ASSASSIN_DRAGON_TAIL", label: "용의 꼬리 (Dragon Tail · 마무리 발차기)",
    animationMode: "A1", animationClass: "Assassin Dragon Tail weapon-class A1 kick attack",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceSource: "D2R.org build 3.3.93847 identifies Dragon Tail as a kick/finishing attack whose swing speed follows the Assassin weapon-class attack animation; this model reports only the weapon-class swing timing.",
    evidenceUrls: ["https://d2r.org/mechanics/dragon-tail", "https://d2r.org/tools/breakpoints/assassin", "https://d2r-tools.com/ias/calculations"],
  };
})();

export const ASSASSIN_TRAP_LAYING: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.wsm !== null
    && referenceWeaponClass("ASSASSIN", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND") !== null)
    .map((weapon) => weapon.code);
  return {
    characterClass: "ASSASSIN", skill: "ASSASSIN_TRAP_LAYING", label: "함정 설치 (Trap Laying)",
    animationMode: "A1", animationClass: "Assassin trap laying · 8 FPD / speed 128",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://d2r-tools.com/ias/calculations", "https://github.com/sscalera2/SinIAS-D2R"],
    evidenceSource: "D2R Tools reference: trap laying uses fixed 8 FPD and animation speed 128; published SIAS formula applies Burst of Speed. Dual-claw WSM aggregation and debuffs are not included.",
  };
})();

function druidWereformNormalAttack(form: "WEREWOLF" | "WEREBEAR"): IASClassSkillDefinition {
  const skill = `DRUID_${form}_NORMAL_ATTACK`;
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => canUseReferenceNormalAttack("DRUID", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND")).map((weapon) => weapon.code);
  return {
    characterClass: "DRUID", skill, characterForm: form,
    label: form === "WEREWOLF" ? "일반 공격 · 늑대인간" : "일반 공격 · 곰인간",
    animationMode: "A1", animationClass: `Druid ${form} A1 · same-weapon Human profile`,
    supportedWeapons, weaponSlot: "main",
    maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://news.blizzard.com/en-us/article/23788293/diablo-ii-resurrected-patch-2-4-ladder-now-live", "https://d2r.org/tools/breakpoints/druid", "https://d2r-tools.com/ias/calculations"],
    evidenceSource: "Blizzard Patch 2.4 wereform speed recalculation; D2R.org build 3.3.93847 Druid Human weapon profile; D2R Tools published wereform FPD ratio and EIAS cap equations. Werewolf skill IAS uses the D2R.org per-level table.",
  };
}

export const DRUID_WEREWOLF_FURY: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => canUseReferenceNormalAttack("DRUID", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND")).map((weapon) => weapon.code);
  return {
    characterClass: "DRUID", skill: "DRUID_WEREWOLF_FURY", characterForm: "WEREWOLF",
    label: "격노 (Fury · 늑대인간)", animationMode: "A1", animationClass: "Werewolf Fury five-hit rollback sequence",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceSource: "Warren1001 v1.2.6 Werewolf Fury rollback sequence output with D2R.org Werewolf profile; D2R Tools documents the 70% rollback rules. Warren and generic rollback notation differ on the first-hit offset; this path is pinned to Warren's public vectors.",
    evidenceUrls: ["https://d2r.org/tools/breakpoints/druid", "https://d2r-tools.com/ias/calculations", "https://github.com/Warren1001/IAS_Calculator/blob/master/calculator.js"],
  };
})();

function druidWereformSkill(skill: string, label: string, characterForm?: "WEREWOLF" | "WEREBEAR"): IASClassSkillDefinition {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => canUseReferenceNormalAttack("DRUID", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND")).map((weapon) => weapon.code);
  return {
    characterClass: "DRUID", skill, characterForm, label, animationMode: "A1",
    animationClass: "Druid wereform weapon attack · same-weapon Human A1 speed profile",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://d2r.org/tools/breakpoints/druid", "https://d2r-tools.com/ias/calculations"],
    evidenceSource: "D2R.org build 3.3.93847 identifies this as a weapon attack; D2R Tools documents wereform speed reduction and skill-specific FPD rules. Druid A1 weapon class and catalog WSM feed the reference formula.",
  };
}

export const DRUID_FERAL_RAGE = druidWereformSkill("DRUID_FERAL_RAGE", "광폭화 (Feral Rage · 늑대인간)", "WEREWOLF");
export const DRUID_FIRE_CLAWS = druidWereformSkill("DRUID_FIRE_CLAWS", "불꽃 발톱 (Fire Claws · 변신 공격)");
export const DRUID_MAUL = druidWereformSkill("DRUID_MAUL", "후려치기 (Maul · 곰인간)", "WEREBEAR");
export const DRUID_HUNGER = druidWereformSkill("DRUID_HUNGER", "허기 (Hunger · 변신 공격)");
export const DRUID_RABIES = druidWereformSkill("DRUID_RABIES", "광견병 (Rabies · 늑대인간)", "WEREWOLF");

export const NECROMANCER_POISON_DAGGER: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.itemType === "knif" && weapon.wsm !== null
    && referenceWeaponClass("NECROMANCER", weapon.code, "NORMAL_ATTACK", weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND") !== null)
    .map((weapon) => weapon.code);
  return {
    characterClass: "NECROMANCER", skill: "NECROMANCER_POISON_DAGGER", label: "독 단검 (Poison Dagger)",
    animationMode: "A1", animationClass: "Necromancer dagger A1 weapon attack",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceSource: "D2R.org build 3.3.93847 identifies Poison Dagger as a dagger-only weapon attack; its animation follows the Necromancer A1 dagger profile and catalog WSM.",
    evidenceUrls: ["https://d2r.org/mechanics/poison-dagger", "https://d2r.org/tools/breakpoints/necromancer", "https://d2r-tools.com/ias/calculations"],
  };
})();

export const BARBARIAN_DOUBLE_SWING: IASClassSkillDefinition = {
  characterClass: "BARBARIAN", skill: "BARBARIAN_DOUBLE_SWING", label: "이중 타격 (Double Swing · 쌍수)",
  animationMode: "A1", animationClass: "Barbarian dual-wield aggregate two-hit sequence",
  supportedWeapons: ["7cr"], weaponSlot: "main", maxIASByWeapon: { "7cr": 456 },
  verificationStatus: "REFERENCE_BASED",
  evidenceSource: "IAS-5-C-4 directly recorded TrAdia/Warren1001 matched samples: Phase Blade/Phase Blade and ordered Phase Blade/War Hammer. Output is aggregate cycle length only; no per-hand event order.",
  evidenceUrls: ["https://d2r-tools.com/ias/calculations", "https://tradia.me/diablo2/weapon_speed_calculator", "https://warren1001.github.io/IAS_Calculator/"],
};

export const BARBARIAN_DOUBLE_THROW: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable && weapon.wsm !== null
    && ["jave", "taxe", "tkni"].includes(weapon.itemType)
    && canUseReferenceNormalAttack("BARBARIAN", weapon.code, "BARBARIAN_NORMAL_ATTACK", "ONE_HAND"))
    .map((weapon) => weapon.code);
  return {
    characterClass: "BARBARIAN", skill: "BARBARIAN_DOUBLE_THROW", label: "이중 투척 (Double Throw · 쌍수)",
    animationMode: "A1", animationClass: "Barbarian dual-wield 12-frame Double Throw sequence",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 120])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://d2r-tools.com/ias/calculations", "https://d2r.org/tools/breakpoints/barbarian"],
    evidenceSource: "D2R Tools IAS calculations: Double Throw uses a 12-FPD dual-wield sequence, averages both WSM/IEIAS contributions, applies player sequence −30 SIAS, and uses primary/secondary weapon IAS inputs.",
  };
})();

export const BARBARIAN_FRENZY: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable
    && canUseReferenceNormalAttack("BARBARIAN", weapon.code, "BARBARIAN_NORMAL_ATTACK", "ONE_HAND"))
    .map((weapon) => weapon.code);
  return {
    characterClass: "BARBARIAN", skill: "BARBARIAN_FRENZY", label: "광분 (Frenzy · 쌍수)",
    animationMode: "A1", animationClass: "Barbarian dual-wield 17-frame Frenzy sequence",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 120])),
    verificationStatus: "REFERENCE_BASED",
    evidenceUrls: ["https://d2r.org/mechanics/frenzy", "https://d2r.org/tools/breakpoints/barbarian", "https://d2r-tools.com/ias/calculations"],
    evidenceSource: "D2R.org build 3.3.93847 identifies the dual-weapon attack and per-hit buff ceiling; D2R Tools documents 17-FPD, dual WSM/IEIAS averaging and player sequence adjustment. Only unbuffed and level-derived maximum-buff endpoints are exposed; intermediate successful-hit steps are intentionally omitted.",
  };
})();

export const BARBARIAN_WHIRLWIND: IASClassSkillDefinition = (() => {
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => weapon.spawnable
    && (canUseReferenceNormalAttack("BARBARIAN", weapon.code, "BARBARIAN_NORMAL_ATTACK", "ONE_HAND")
      || canUseReferenceNormalAttack("BARBARIAN", weapon.code, "BARBARIAN_TWO_HANDED_NORMAL_ATTACK", "TWO_HAND")))
    .map((weapon) => weapon.code);
  return {
    characterClass: "BARBARIAN", skill: "BARBARIAN_WHIRLWIND", label: "소용돌이 (Whirlwind)",
    animationMode: "A1", animationClass: "Barbarian Whirlwind repeated hit interval",
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, 456])),
    verificationStatus: "REFERENCE_BASED",
    evidenceSource: "Blizzard D2R patch 2.4.3: Whirlwind uses the basic attack frame with IAS from equipment; dual-wield weapon frames are averaged and rounded up. Reports repeated interval only.",
    evidenceUrls: ["https://news.blizzard.com/en-gb/article/23814050/diablo-ii-resurrected-patch-2-4-3-now-live", "https://d2r.org/mechanics/whirlwind", "https://d2r.org/tools/breakpoints/barbarian"],
  };
})();

function referenceNormalAttack(characterClass: IASCharacterClass): IASClassSkillDefinition {
  const skill = characterClass === "BARBARIAN" ? "BARBARIAN_NORMAL_ATTACK" : "NORMAL_ATTACK";
  const supportedWeapons = IAS_WEAPON_CATALOG.filter((weapon) => canUseReferenceNormalAttack(characterClass, weapon.code, skill, weapon.handedness === "two-handed" ? "TWO_HAND" : "ONE_HAND")).map((weapon) => weapon.code);
  return {
    characterClass, skill, label: "일반 공격", animationMode: "A1", animationClass: `${characterClass} A1 (무기 유형별)`,
    supportedWeapons, weaponSlot: "main", maxIASByWeapon: Object.fromEntries(supportedWeapons.map((code) => [code, characterClass === "BARBARIAN" ? (BARBARIAN_WEAPONS[code]?.maxIAS ?? 456) : 456])),
    verificationStatus: "REFERENCE_BASED", evidenceSource: "D2R build 3.3.93847 class A1 animation profiles + published IAS/EIAS formula.",
    evidenceUrls: [`https://d2r.org/tools/breakpoints/${characterClass.toLowerCase()}`, "https://d2r-tools.com/ias/calculations"],
  };
}

export const IAS_CLASS_SKILLS: Readonly<Record<string, readonly IASClassSkillDefinition[]>> = {
  PALADIN: [], // Existing Paladin-specific registry remains authoritative.
  BARBARIAN: [referenceNormalAttack("BARBARIAN"), BARBARIAN_TWO_HANDED_NORMAL_ATTACK, BARBARIAN_DUAL_WIELD_NORMAL_ATTACK, ...BARBARIAN_STANDARD_ATTACK_SKILLS, BARBARIAN_DOUBLE_SWING, BARBARIAN_DOUBLE_THROW, BARBARIAN_FRENZY, BARBARIAN_WHIRLWIND],
  AMAZON: [referenceNormalAttack("AMAZON"), AMAZON_JAB, AMAZON_IMPALE, AMAZON_FEND, AMAZON_STRAFE, ...AMAZON_BOW_SKILLS, ...AMAZON_THRUST_SKILLS, ...AMAZON_THROW_SKILLS], ASSASSIN: [referenceNormalAttack("ASSASSIN"), ASSASSIN_DRAGON_CLAW, ...ASSASSIN_MARTIAL_STANDARD_SKILLS, ...ASSASSIN_DUAL_CLAW_SEQUENCE_SKILLS, ASSASSIN_DRAGON_TALON, ASSASSIN_DRAGON_FLIGHT, ASSASSIN_DRAGON_TAIL, ASSASSIN_TRAP_LAYING],
  DRUID: [referenceNormalAttack("DRUID"), druidWereformNormalAttack("WEREWOLF"), DRUID_WEREWOLF_FURY, druidWereformNormalAttack("WEREBEAR"), DRUID_FERAL_RAGE, DRUID_FIRE_CLAWS, DRUID_MAUL, DRUID_HUNGER, DRUID_RABIES], NECROMANCER: [referenceNormalAttack("NECROMANCER"), NECROMANCER_POISON_DAGGER],
  SORCERESS: [referenceNormalAttack("SORCERESS")], WARLOCK: [],
};

export function getClassSkills(characterClass: string) {
  return IAS_CLASS_SKILLS[characterClass] ?? [];
}

export function getClassSkill(characterClass: string, skill: string) {
  return getClassSkills(characterClass).find((entry) => entry.skill === skill);
}

export function getBarbarianWeapon(weaponCode: string) {
  return BARBARIAN_WEAPONS[weaponCode] ?? BARBARIAN_TWO_HANDED_WEAPONS[weaponCode];
}
