export const IAS_EVIDENCE_VERSION = "D2R-3.3.93847-IAS-4A2";
export const IAS_HARD_MAX = 456;

// Total IAS values that reach the Zeal EIAS ceiling of 75 for each weapon.
export const ZEAL_MAX_IAS_BY_WEAPON: Readonly<Record<string, number>> = {
  crs: 360,
  "7cr": 72,
  whm: 456,
};

export const PALADIN_CRS_A1 = {
  characterClass: "PALADIN",
  characterForm: "HUMAN",
  attackMode: "NORMAL",
  animation: "A1",
  weaponCode: "crs",
  weaponClass: "1hs",
  weaponSpeedModifier: 0,
  skillIAS: 0,
  framesPerDirection: 15,
  animationSpeed: 256,
  startingFrame: 0,
  actionFrame: 7,
  totalIASMin: 0,
  totalIASMax: 200,
} as const;
