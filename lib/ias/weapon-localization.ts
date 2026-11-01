import data from "./data/weapon-localization-ko.json" with { type: "json" };
import type { IASWeaponCatalogEntry } from "./weapon-catalog.ts";

export const WEAPON_CATEGORY_KO: Readonly<Record<string, string>> = {
  "Amazon Bow":"아마존 전용 활", "Amazon Javelin":"아마존 전용 투창", "Amazon Spear":"아마존 전용 창", Axe:"도끼", Bow:"활", Club:"곤봉", Crossbow:"쇠뇌", Hammer:"망치", "Hand to Hand":"암살자 전용 손톱", "Hand to Hand 2":"암살자 전용 손톱(확장)", Javelin:"투창", Knife:"단검", Mace:"철퇴", "Missile Potion":"투척 물약", Orb:"원소술사 전용 보주", Polearm:"미늘창", Scepter:"셉터", Spear:"창", Staff:"지팡이", Sword:"검", "Throwing Axe":"투척 도끼", "Throwing Knife":"투척 단검", Wand:"원드",
};
const records = data.records as Record<string, { enUS: string; koKR: string }>;
export const WEAPON_LOCALIZATION_COUNT = Object.keys(records).length;
export function localizedWeaponName(code: string, fallback: string) {
  const item = records[code];
  return item?.koKR ? `${item.koKR} (${item.enUS || fallback})` : fallback;
}
export function weaponSearchText(weapon: IASWeaponCatalogEntry) {
  const item = records[weapon.code];
  const type = weapon.itemTypeName ?? weapon.itemType;
  return `${weapon.name} ${weapon.code} ${weapon.itemType} ${type} ${WEAPON_CATEGORY_KO[type] ?? ""} ${weapon.weaponClass ?? ""} ${item?.koKR ?? ""} ${item?.enUS ?? ""}`;
}
