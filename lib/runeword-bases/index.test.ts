import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Runeword } from '../../app/runewords/catalog.ts';
import { BASE_ITEMS, equipmentCategories, getBaseRecommendations, hasReviewedBaseRecommendations, isBaseCompatible, validateBaseRecommendationData } from './index.ts';

const records = JSON.parse(readFileSync(new URL('../../app/runewords/data.json', import.meta.url), 'utf8')) as Runeword[];

test('reviewed recommendations are compatible and unreviewed legacy recommendations are withheld', () => {
  assert.equal(records.length, 102);
  assert.deepEqual(validateBaseRecommendationData(records), []);
  for (const record of records) {
    const recs = getBaseRecommendations(record);
    assert.equal(recs.length > 0, hasReviewedBaseRecommendations(record.id), record.name);
    if (!hasReviewedBaseRecommendations(record.id)) continue;
    assert.ok(recs.length >= 1 && recs.length <= 5, record.name);
    assert.equal(new Set(recs.map((row) => row.baseItem.id)).size, recs.length, record.name);
  }
});

test('review coverage is explicit and scoped to the current curated set', () => {
  assert.equal(records.filter((record) => hasReviewedBaseRecommendations(record.id)).length, 102);
  assert.deepEqual(records.filter((record) => !hasReviewedBaseRecommendations(record.id)).map((record) => record.id), []);
  assert.deepEqual(JSON.parse(readFileSync(new URL('./pending-review.json', import.meta.url), 'utf8')), { runewordIds: [], reasons: {} });
  const overrides = JSON.parse(readFileSync(new URL('./practical-recommendations.json', import.meta.url), 'utf8')) as Record<string, { baseItemId: string }[]>;
  assert.equal(Object.values(overrides).reduce((count, entries) => count + entries.length, 0), 204);
  assert.equal(records.reduce((count, row) => count + getBaseRecommendations(row).length, 0), 204);
});

test('all 15 Druid pelt bases carry sourced class, tier, requirements, durability, staffmod, and socket data', () => {
  const pelts = BASE_ITEMS.filter((item) => item.equipmentTypes.includes('druidPelt'));
  assert.equal(pelts.length, 15);
  assert.ok(pelts.every((item) => item.classRestriction === '드루이드' && item.equipmentTypes.includes('helm')));
  assert.ok(pelts.every((item) => item.durability === 20 && item.staffmodsPossible && item.baseCode));
  assert.ok(pelts.every((item) => item.maxSockets === 3 && item.socketLimitsByItemLevel?.[0].maxSockets === 2 && item.socketLimitsByItemLevel?.[1].minItemLevel === 26));
  assert.deepEqual(pelts.filter((item) => item.tier === 'NO').map((item) => item.id), ['wolf-head','hawk-helm','antlers','falcon-mask','spirit-mask']);
  assert.deepEqual(pelts.filter((item) => item.tier === 'EX').map((item) => item.id), ['alpha-helm','griffon-headdress','hunters-guise','sacred-feathers','totemic-mask']);
  assert.deepEqual(pelts.filter((item) => item.tier === 'EL').map((item) => item.id), ['blood-spirit','sun-spirit','earth-spirit','sky-spirit','dream-spirit']);
  assert.equal(pelts.find((item) => item.id === 'wolf-head')?.strengthRequired, 16);
  assert.equal(pelts.find((item) => item.id === 'blood-spirit')?.strengthRequired, 86);
  assert.equal(pelts.find((item) => item.id === 'dream-spirit')?.requiredLevel, 66);
});

test('class-specific bases identify their eligible class and automatic skill attributes', () => {
  for (const id of ['war-scepter', 'divine-scepter', 'caduceus']) {
    const base = BASE_ITEMS.find((item) => item.id === id)!;
    assert.equal(base.classRestriction, '성기사', id);
    assert.equal(base.staffmodsPossible, true, id);
  }
  for (const id of ['bone-wand', 'ghost-wand']) {
    const base = BASE_ITEMS.find((item) => item.id === id)!;
    assert.equal(base.classRestriction, '강령술사', id);
    assert.equal(base.staffmodsPossible, true, id);
  }
});

test('Metamorphosis recommendations use Druid pelts and explain three-socket item-level requirements', () => {
  const metamorphosis = records.find((row) => row.id === 88)!;
  const recs = getBaseRecommendations(metamorphosis);
  assert.deepEqual(recs.map((row) => row.baseItem.id), ['wolf-head','blood-spirit']);
  assert.ok(recs.every((row) => row.baseItem.classRestriction === '드루이드' && /아이템 레벨 26 이상/.test(row.condition || '')));
  assert.ok(recs.every((row) => /기술 자동 옵션/.test(`${row.reason} ${row.condition}`)));
  assert.deepEqual(records.filter((row) => row.id === 88).map((row) => row.runes), [['이오','참','팔']]);
});

test('Passion and Harmony recommendation text matches actual weapon options and mercenary use', () => {
  const passion = records.find((row) => row.id === 57)!;
  const passionText = getBaseRecommendations(passion).map((row) => `${row.reason} ${row.condition || ''}`).join(' ');
  assert.match(passion.options, /\+1 질/);
  assert.match(passion.options, /\+1 버서크/);
  assert.doesNotMatch(passion.options, /광신|파나티시즘|파나틱|fanaticism/i);
  assert.doesNotMatch(passionText, /광신|파나티시즘|파나틱|fanaticism/i);
  const harmony = records.find((row) => row.id === 74)!;
  const mercenary = getBaseRecommendations(harmony).find((row) => row.purposes.includes('mercenary'))!;
  assert.match(harmony.options, /비거 오라/);
  assert.match(mercenary.reason, /원기 오라/);
  assert.doesNotMatch(mercenary.reason, /발키리|valkyrie/i);
});

test('Beast recommendations identify Fanaticism aura and do not call Berserk an aura', () => {
  const beast = records.find((row) => row.id === 51)!;
  const text = getBaseRecommendations(beast).map((row) => `${row.reason} ${row.condition || ''}`).join(' ');
  assert.match(beast.options, /파나티시즘 오라/);
  assert.match(text, /광신 오라/);
  assert.doesNotMatch(text, /광폭화 오라/);
});

test('Silence and Unbending Will recommendations disclose feasible six-socket bases and item-level limits', () => {
  const silence = getBaseRecommendations(records.find((row) => row.id === 87)!);
  assert.deepEqual(silence.map((row) => row.baseItem.id), ['crystal-sword','phase-blade']);
  assert.ok(silence.every((row) => /아이템 레벨 41 이상/.test(row.condition || '')));
  const will = getBaseRecommendations(records.find((row) => row.id === 31)!);
  assert.deepEqual(will.map((row) => row.baseItem.id), ['phase-blade','colossus-blade']);
  assert.ok(will.every((row) => /아이템 레벨 41 이상/.test(row.condition || '')));
  assert.ok(will.every((row) => row.baseItem.id !== 'crystal-sword'));
  assert.equal(BASE_ITEMS.find((item) => item.id === 'phase-blade')?.dexterityRequired, 136);
  assert.equal(BASE_ITEMS.find((item) => item.id === 'phase-blade')?.durability, 0);
});

test('representative recommendations keep the intended common bases and purposes', () => {
  const byId = new Map(records.map((row) => [row.id, row]));
  const names = (id: number) => getBaseRecommendations(byId.get(id)!).map((entry) => entry.baseItem.id);
  assert.deepEqual(names(59), ['crystal-sword', 'broad-sword', 'long-sword']);
  assert.deepEqual(names(60).slice(0, 3), ['monarch', 'sacred-targe', 'sacred-rondache']);
  assert.ok(names(70).includes('mage-plate'));
  assert.ok(names(41).includes('mage-plate'));
  assert.ok(names(25).includes('thresher'));
  assert.deepEqual(names(44), ['phase-blade', 'berserker-axe']);
  assert.ok(names(40).includes('crystal-sword'));
  assert.ok(names(83).includes('flail'));
  for (const id of [70, 41, 25, 44, 40, 83]) {
    assert.ok(getBaseRecommendations(byId.get(id)!).every((entry) => entry.reason.length > 0));
  }
  assert.deepEqual(names(59).filter((id) => ['phase-blade', 'colossus-blade'].includes(id)), []);
  assert.deepEqual(names(44), ['phase-blade', 'berserker-axe']);
  assert.deepEqual(names(41), ['mage-plate', 'dusk-shroud', 'archon-plate']);
  assert.deepEqual(names(60), ['monarch', 'sacred-targe', 'sacred-rondache']);
  assert.ok(getBaseRecommendations(byId.get(25)!).every((entry) => entry.purposes.includes('mercenary')));
  assert.ok(getBaseRecommendations(byId.get(59)!).every((entry) => entry.purposes.includes('leveling')));
});

test('RW-BASE-06 corrections cover Rhyme, Death, War Staff, and Obsession', () => {
  const byId = new Map(records.map((row) => [row.id, row]));
  const rhyme = getBaseRecommendations(byId.get(1)!);
  assert.deepEqual(rhyme.map((row) => row.baseItem.id), ['small-shield', 'sacred-targe']);
  assert.ok(rhyme.every((row) => !/3\s*소켓/.test(`${row.reason} ${row.condition || ''}`)));
  const death = getBaseRecommendations(byId.get(76)!);
  assert.ok(death.every((row) => /파괴 불가/.test(`${row.reason} ${row.condition || ''}`)));
  assert.equal(BASE_ITEMS.find((item) => item.id === 'war-staff')?.tier, 'NO');
  const obsession = getBaseRecommendations(byId.get(79)!);
  assert.ok(obsession.some((row) => row.baseItem.id === 'war-staff' && /아이템 레벨 26/.test(row.condition || '')));
  assert.ok(obsession.every((row) => row.baseItem.maxSockets >= 6));
});

test('RotW 3.4 five new runewords retain the official recipe, sockets, and equipment type', () => {
  const expected = [
    { id: 98, runes: ['헬','샤엘','랄'], sockets: 3, equipment: '아머', url: 'https://d2r.org/runewords/authority' },
    { id: 99, runes: ['이스트','랄','이오'], sockets: 3, equipment: '헬름', url: 'https://d2r.org/runewords/coven' },
    { id: 100, runes: ['앰','샤엘','오움'], sockets: 3, equipment: '대거', url: 'https://d2r.org/runewords/ritual' },
    { id: 101, runes: ['돌','굴'], sockets: 2, equipment: '쉴드/마법서/네크로맨서 방패/팔라딘 방패', url: 'https://d2r.org/runewords/vigilance' },
    { id: 102, runes: ['주울','조드','이스트'], sockets: 3, equipment: '대거', url: 'https://d2r.org/runewords/void' },
  ];
  for (const item of expected) {
    const row = records.find((record) => record.id === item.id) as Runeword & { edition?: string; source?: string };
    assert.ok(row);
    assert.equal(row.edition, '악마술사의 군림');
    assert.equal(row.sockets, item.sockets);
    assert.equal(row.equipment, item.equipment);
    assert.deepEqual(row.runes, item.runes);
    assert.equal(row.source, item.url);
  }
});

test('all original 398 candidate links have an explicit disposition', () => {
  const report = JSON.parse(readFileSync(new URL('../../docs/runewords/RW-BASE-06-REVIEW-DISPOSITIONS.json', import.meta.url), 'utf8')) as {
    sourceLinks: number;
    dispositions: Record<string, number>;
    links: { disposition: string }[];
  };
  assert.equal(report.sourceLinks, 398);
  assert.equal(report.links.length, 416);
  assert.deepEqual(report.dispositions, { KEEP: 0, REVISE: 192, REMOVE: 210, ADD: 14, REVIEW: 0 });
  assert.ok(report.links.every((entry) => ['KEEP', 'REVISE', 'REMOVE', 'ADD', 'REVIEW'].includes(entry.disposition)));
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
  const crusaderBow = BASE_ITEMS.find((row) => row.id === 'crusader-bow');
  assert.ok(crusaderBow && isBaseCompatible(crusaderBow, variantEquipment.equipment, variantEquipment.sockets));
  assert.equal(eternity.equipment, originalEquipment);
});
