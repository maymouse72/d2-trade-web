import assert from "node:assert/strict";
import test from "node:test";
import { IAS_WEAPON_CATALOG, IAS_WEAPON_CATALOG_SOURCE, filterIASWeaponCatalog } from "../weapon-catalog.ts";

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
