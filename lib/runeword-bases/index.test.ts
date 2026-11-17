import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Runeword } from '../../app/runewords/catalog.ts';
import { BASE_ITEMS, equipmentCategories, getBaseRecommendations, isBaseCompatible, validateBaseRecommendationData } from './index.ts';

const records = JSON.parse(readFileSync(new URL('../../app/runewords/data.json', import.meta.url), 'utf8')) as Runeword[];

test('every displayed runeword record has compatible and non-duplicated recommendations', () => {
  assert.equal(records.length, 102);
  assert.deepEqual(validateBaseRecommendationData(records), []);
  for (const record of records) {
    const recs = getBaseRecommendations(record);
    assert.ok(recs.length >= 1 && recs.length <= 5, record.name);
    assert.equal(new Set(recs.map((row) => row.baseItem.id)).size, recs.length, record.name);
  }
});

test('representative recommendations keep the intended common bases and purposes', () => {
  const byId = new Map(records.map((row) => [row.id, row]));
  const names = (id: number) => getBaseRecommendations(byId.get(id)!).map((entry) => entry.baseItem.id);
  assert.deepEqual(names(59).slice(0, 3), ['crystal-sword', 'broad-sword', 'long-sword']);
  assert.deepEqual(names(60).slice(0, 3), ['monarch', 'sacred-targe', 'sacred-rondache']);
  assert.ok(names(70).includes('mage-plate'));
  assert.ok(names(41).includes('mage-plate'));
  assert.ok(names(25).includes('thresher'));
  assert.ok(names(44).includes('phase-blade'));
  assert.ok(names(40).includes('crystal-sword'));
  assert.ok(names(83).includes('flail'));
  for (const id of [70, 41, 25, 44, 40, 83]) {
    assert.ok(getBaseRecommendations(byId.get(id)!).every((entry) => entry.reason.length > 0));
  }
});

test('weapon type mapping keeps clubs, hammers, maces, melee and missile weapons distinct', () => {
  assert.deepEqual(equipmentCategories('메이스'), ['mace']);
  assert.ok(!BASE_ITEMS.some((base) => isBaseCompatible(base, '메이스', 3) && base.equipmentTypes.includes('hammer')));
  assert.ok(!equipmentCategories('근접 무기').includes('bow'));
  assert.ok(equipmentCategories('원거리 무기').includes('crossbow'));
  assert.ok(equipmentCategories('근접 무기 및 미사일 무기').includes('spear'));
  assert.ok(equipmentCategories('근접 무기 및 미사일 무기').includes('bow'));
});

test('recommendation sockets never exceed a base upper bound', () => {
  for (const row of records) {
    for (const recommendation of getBaseRecommendations(row)) {
      assert.ok(recommendation.baseItem.maxSockets >= row.sockets, `${row.name}: ${recommendation.baseItem.nameEn}`);
    }
  }
});

test('every recommendation is possible with some legal item-level/socket outcome', () => {
  for (const row of records) {
    for (const recommendation of getBaseRecommendations(row)) {
      assert.ok(recommendation.baseItem.maxSockets >= row.sockets, `${row.name}: ${recommendation.baseItem.nameEn}`);
      assert.ok(!recommendation.purposes.includes('mercenary') || (!recommendation.baseItem.classRestriction && recommendation.baseItem.mercenaryClasses?.length), `${row.name}: invalid mercenary base`);
    }
  }
});

test('3.4 variant equipment expands the compatible recommendation set without mutating its source', () => {
  const eternity = records.find((row) => row.id === 58);
  assert.ok(eternity);
  const originalEquipment = eternity.equipment;
  const variant = eternity.variants?.find((entry) => entry.id === 'rotw-3.4-eternity-58');
  assert.ok(variant?.properties?.equipment);
  const variantEquipment = { equipment: variant.properties.equipment, sockets: variant.properties.sockets || eternity.sockets, level: eternity.level };
  const bladeBow = BASE_ITEMS.find((row) => row.id === 'blade-bow');
  assert.ok(bladeBow && isBaseCompatible(bladeBow, variantEquipment.equipment, variantEquipment.sockets));
  assert.equal(eternity.equipment, originalEquipment);
});
