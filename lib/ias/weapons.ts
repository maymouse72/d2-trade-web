export interface IASWeaponDefinition {
  code: string;
  name: string;
  weaponClass: string;
  rawSpeed: number | null;
  resolvedWeaponSpeedModifier: number;
  minIAS: number;
  maxIAS: number;
  verified: boolean;
  evidence: string;
}

// A1 support is enabled only when the extracted D2R weapon data and published
// Paladin 1HS frame table agree over the weapon's registered IAS range.
export const IAS_WEAPONS: Readonly<Record<string, IASWeaponDefinition>> = {
  crs: {
    code: "crs",
    name: "Crystal Sword",
    weaponClass: "1hs",
    rawSpeed: null,
    resolvedWeaponSpeedModifier: 0,
    minIAS: 0,
    maxIAS: 200,
    verified: true,
    evidence: "Existing 201 row dataset matches the published Paladin 1HS WSM 0 frame table.",
  },
  "7cr": {
    code: "7cr",
    name: "Phase Blade",
    weaponClass: "1hs",
    rawSpeed: -30,
    resolvedWeaponSpeedModifier: -30,
    minIAS: 0,
    maxIAS: 200,
    verified: true,
    evidence: "D2R weapons.txt: WSM -30, weapon class 1hs; published Paladin 1HS WSM -30 frame thresholds match the complete 0–200 A1 dataset.",
  },
  whm: {
    code: "whm",
    name: "War Hammer",
    weaponClass: "1hs",
    rawSpeed: 20,
    resolvedWeaponSpeedModifier: 20,
    minIAS: 0,
    maxIAS: 317,
    verified: true,
    evidence: "D2R weapons.txt: WSM +20, weapon class 1hs; published Paladin 1HS WSM +20 thresholds match the complete 0–317 A1 dataset.",
  },
};
