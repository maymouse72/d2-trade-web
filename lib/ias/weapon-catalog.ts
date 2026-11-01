import catalog from "./data/weapon-catalog.json" with { type: "json" };

export interface IASWeaponCatalogEntry {
  code: string;
  name: string;
  itemType: string;
  itemTypeName: string | null;
  itemTypeClassTag: string | null;
  parentType: string | null;
  parentType2: string | null;
  wsm: number | null;
  weaponClass: string | null;
  handedness: "one-handed" | "two-handed" | "conditional";
  version: number;
  spawnable: boolean;
  baseCode: string;
  twoHandedWclass: string | null;
}

export const IAS_WEAPON_CATALOG = catalog.records as IASWeaponCatalogEntry[];
export const IAS_WEAPON_CATALOG_SOURCE = catalog.sourceFiles;
export const IAS_WEAPON_CATALOG_RECORD_COUNT = catalog.catalogRecordCount;

export type WeaponHandednessFilter = "ALL" | IASWeaponCatalogEntry["handedness"];
export type WeaponSupportFilter = "ALL" | "VERIFIED" | "UNVERIFIED";

export function filterIASWeaponCatalog(options: {
  search?: string;
  category?: string;
  handedness?: WeaponHandednessFilter;
  support?: WeaponSupportFilter;
  verifiedWeaponCodes?: readonly string[];
  includeNonSpawnable?: boolean;
} = {}) {
  const term = (options.search ?? "").trim().toLocaleLowerCase();
  const verified = new Set(options.verifiedWeaponCodes ?? []);
  return IAS_WEAPON_CATALOG.filter((weapon) => {
    const category = weapon.itemTypeName ?? weapon.itemType;
    const matchesCategory = !options.category || options.category === "ALL" || category === options.category;
    const matchesSpawnable = options.includeNonSpawnable || weapon.spawnable;
    const matchesHandedness = !options.handedness || options.handedness === "ALL" || weapon.handedness === options.handedness;
    const matchesSupport = !options.support || options.support === "ALL" || (verified.has(weapon.code) ? "VERIFIED" : "UNVERIFIED") === options.support;
    const searchable = `${weapon.name} ${weapon.code} ${weapon.itemType} ${weapon.weaponClass ?? ""}`.toLocaleLowerCase();
    return matchesSpawnable && matchesCategory && matchesHandedness && matchesSupport && (!term || searchable.includes(term));
  });
}
