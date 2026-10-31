export interface IASWeaponDefinition {
  code: string;
  name: string;
  weaponClass: string;
  rawSpeed: number | null;
  resolvedWeaponSpeedModifier: number;
  evidence: string;
}

// This module contains only the weapon row independently matched to the
// build-specific Golden Dataset. Other bases remain UNVERIFIED in policy.
export const IAS_WEAPONS: Readonly<Record<string, IASWeaponDefinition>> = {
  crs: {
    code: "crs",
    name: "Crystal Sword",
    weaponClass: "1hs",
    rawSpeed: null,
    resolvedWeaponSpeedModifier: 0,
    evidence: "weapons.txt speed is blank; base-item WSM 0 is independently documented and matches the D2R 3.3.93847 Paladin WSM 0 reference table.",
  },
};
