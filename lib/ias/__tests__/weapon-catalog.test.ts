import assert from "node:assert/strict";
import test from "node:test";
import { IAS_WEAPON_CATALOG, IAS_WEAPON_CATALOG_SOURCE, filterIASWeaponCatalog, type WeaponCombinationStatus } from "../weapon-catalog.ts";
import { localizedWeaponName, WEAPON_CATEGORY_KO, WEAPON_LOCALIZATION_COUNT } from "../weapon-localization.ts";

test("normalized weapon catalog contains every coded source record", () => {
  assert.equal(IAS_WEAPON_CATALOG.length, 306);
  assert.equal(new Set(IAS_WEAPON_CATALOG.map((weapon) => weapon.code)).size, IAS_WEAPON_CATALOG.length);
  assert.ok(IAS_WEAPON_CATALOG.every((weapon) => /^[a-z0-9]{3}$/.test(weapon.code)));
});

test("catalog preserves D2R source hashes and item type hierarchy", () => {
  assert.match(IAS_WEAPON_CATALOG_SOURCE.weapons_txt_sha256, /^[a-f0-9]{64}$/);
  assert.match(IAS_WEAPON_CATALOG_SOURCE.itemtypes_txt_sha256, /^[a-f0-9]{64}$/);
  const longSword = IAS_WEAPON_CATALOG.find((weapon) => weapon.code === "lsd");
  assert.deepEqual([longSword?.name, longSword?.itemType, longSword?.itemTypeName, longSword?.wsm, longSword?.weaponClass], ["Long Sword", "swor", "Sword", -10, "1hs"]);
  assert.equal(IAS_WEAPON_CATALOG.find((weapon) => weapon.code === "7cr")?.wsm, -30);
  assert.ok(IAS_WEAPON_CATALOG.every((weapon) => weapon.itemTypeClassTag === null || typeof weapon.itemTypeClassTag === "string"));
});

test("catalog preserves unknown WSM instead of assigning a zero", () => {
  assert.ok(IAS_WEAPON_CATALOG.some((weapon) => weapon.wsm === null));
  assert.ok(IAS_WEAPON_CATALOG.filter((weapon) => weapon.wsm !== null).every((weapon) => Number.isInteger(weapon.wsm)));
});

test("weapon search matches display name, code, direct type and animation class", () => {
  assert.deepEqual(filterIASWeaponCatalog({ search: "long sword" }).map((weapon) => weapon.code), ["lsd"]);
  assert.deepEqual(filterIASWeaponCatalog({ search: "lsd" }).map((weapon) => weapon.code), ["lsd"]);
  assert.ok(filterIASWeaponCatalog({ search: "1hs" }).some((weapon) => weapon.code === "lsd"));
});

test("item type filter returns only the selected category", () => {
  const swords = filterIASWeaponCatalog({ category: "Sword" });
  assert.ok(swords.length > 0);
  assert.ok(swords.every((weapon) => weapon.itemTypeName === "Sword"));
});

test("handedness filter returns only matching source-derived entries", () => {
  assert.ok(filterIASWeaponCatalog({ handedness: "one-handed" }).every((weapon) => weapon.handedness === "one-handed"));
  assert.ok(filterIASWeaponCatalog({ handedness: "two-handed" }).every((weapon) => weapon.handedness === "two-handed"));
});

test("support filter separates enabled combinations from unverified catalog entries", () => {
  const verified = filterIASWeaponCatalog({ support: "VERIFIED", verifiedWeaponCodes: ["crs", "7cr", "whm", "lsd"] });
  assert.deepEqual(new Set(verified.map((weapon) => weapon.code)), new Set(["crs", "7cr", "whm", "lsd"]));
  assert.ok(filterIASWeaponCatalog({ support: "UNVERIFIED", verifiedWeaponCodes: ["crs", "7cr", "whm", "lsd"] }).every((weapon) => !verified.some((supported) => supported.code === weapon.code)));
});

test("combined catalog filters remain composable", () => {
  const entries = filterIASWeaponCatalog({ search: "sword", category: "Sword", handedness: "one-handed", support: "VERIFIED", verifiedWeaponCodes: ["lsd"] });
  assert.deepEqual(entries.map((weapon) => weapon.code), ["lsd"]);
});

test("official Korean item localization covers all catalog codes and supports Korean, English, and code search", () => {
  assert.equal(WEAPON_LOCALIZATION_COUNT, 306);
  assert.match(localizedWeaponName("crs", "Crystal Sword"), /크리스탈 소드 \(Crystal Sword\)/);
  assert.deepEqual(filterIASWeaponCatalog({ search: "크리스탈 소드" }).map(item => item.code), ["crs"]);
  assert.deepEqual(filterIASWeaponCatalog({ search: "PHASE BLADE" }).map(item => item.code), ["7cr"]);
  assert.deepEqual(filterIASWeaponCatalog({ search: "7CR" }).map(item => item.code), ["7cr"]);
  assert.equal(WEAPON_CATEGORY_KO.Sword, "검");
  assert.equal(IAS_WEAPON_CATALOG.filter(item => item.spawnable).length, 297);
});

test("selector support-state filter separates verified, pending, conflicted, and unsupported combinations", () => {
  for (const [state, code] of Object.entries({ VERIFIED: "crs", UNVERIFIED: "7cr", CONFLICTED: "whm", UNSUPPORTED: "lsd" })) {
    const states: Record<string, WeaponCombinationStatus> = Object.fromEntries(IAS_WEAPON_CATALOG.map(item => [item.code, state === "VERIFIED" ? "UNVERIFIED" : "VERIFIED"]));
    states[code] = state as WeaponCombinationStatus;
    assert.deepEqual(filterIASWeaponCatalog({ support: state as "VERIFIED" | "UNVERIFIED" | "CONFLICTED" | "UNSUPPORTED", weaponStatuses: states, includeNonSpawnable: true }).map(item => item.code), [code]);
  }
});
