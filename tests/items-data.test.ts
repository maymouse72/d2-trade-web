/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveItemVariant, type ItemContext } from '../lib/items/variants.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const baseline = read('tests/fixtures/items-baseline-3.3.json');
const runewords = read('app/runewords/data.json');
const uniques = read('app/uniques/data.json');
const sets = read('app/sets/data.json');
const official34 = 'https://news.blizzard.com/en-us/article/24316567/diablo-ii-resurrected-ladder-season-16';
const context = (id: string): ItemContext => ({
  gameEra: 'RotW', onlineState: 'Online', ladderState: id.includes('nonladder') ? 'NonLadder' : 'Ladder', patch: id.endsWith('33') ? '3.3' : '3.4',
});
const optionTexts = (values: Array<{ text: string }>) => values.map((entry) => entry.text);
const withoutVariant = (record: any) => Object.fromEntries(Object.entries(record).filter(([key]) => key !== 'variants'));

test('catalog record counts, IDs, and old target values remain preserved', () => {
  assert.equal(runewords.length, baseline.counts.runewordRows);
  assert.equal(uniques.length, baseline.counts.uniqueRows);
  assert.equal(sets.length, baseline.counts.setRows);
  assert.equal(sets.reduce((sum: number, set: any) => sum + set.pieces.length, 0), baseline.counts.setPieces);
  for (const [name, records, ids] of [
    ['runewords', runewords, baseline.ids.runewords], ['uniques', uniques, baseline.ids.uniques], ['sets', sets, baseline.ids.sets],
  ] as const) {
    assert.equal(new Set(records.map((record: any) => String(record.id))).size, records.length, `${name}: duplicate ID`);
    assert.deepEqual(records.map((record: any) => String(record.id)).sort(), ids.map(String).sort(), `${name}: IDs changed`);
  }
  assert.deepEqual(runewords.filter((row: any) => row.id === 58 || ['Mania','Hysteria','Metamorphosis','Ground','Temper','Hearth','Cure','Bulwark'].some((name) => row.name.endsWith(`(${name})`))).map(withoutVariant), baseline.legacyRecords.runewords);
  const legacyUniqueRecords = baseline.legacyRecords.uniques.map((row: any) => {
    if (row.english !== "Rogue's Bow") return row;
    return { ...row, options: row.options.filter((option: any) => !option.text.includes('세부 조건 확인 중')), optionGroups: [[{ text: '냉기 화살 +1~3 (아마존 전용)', variable: true }, { text: '화염 화살 +1~3 (아마존 전용)', variable: true }]] };
  });
  assert.deepEqual(uniques.filter((row: any) => baseline.legacyRecords.uniques.some((old: any) => old.id === row.id)).map(withoutVariant), legacyUniqueRecords);
  assert.deepEqual(sets.filter((row: any) => ['4','13'].includes(row.id)).map(withoutVariant), baseline.legacyRecords.sets);
});

test('every catalog image reference resolves to an existing public file', () => {
  for (const row of uniques) if (row.image) assert.equal(existsSync(resolve(root, `public${row.image}`)), true, `unique image ${row.id}`);
  for (const set of sets) for (const piece of set.pieces) if (piece.image) assert.equal(existsSync(resolve(root, `public${piece.image}`)), true, `set image ${piece.id}`);
});

test('rune rows keep rune order and socket count, including three multi-base logical runewords', () => {
  for (const row of runewords) assert.equal(row.runes.length, row.sockets, `${row.name}`);
  assert.equal(new Set(runewords.map((row: any) => row.name.match(/\(([^()]*)\)\s*$/)?.[1] || row.name)).size, 99);
  const eternity = runewords.find((row: any) => row.id === 58);
  assert.deepEqual(eternity.runes, ['앰', '베르', '이스트', '솔', '수르']);
  const updated = resolveItemVariant(eternity, eternity.variants, context('rotw-ladder-34'));
  assert.equal(updated.availability, 'AVAILABLE');
  assert.match(updated.properties.options, /\+30% 공격 속도 증가/);
  assert.match(updated.properties.options, /\+300~390%/);
  assert.match(updated.properties.options, /\+3~297/);
  assert.match(updated.properties.options, /\+5 부활 \(O-skill\)/);
  assert.match(updated.properties.equipment, /미사일 무기/);
  const legacy = resolveItemVariant(eternity, eternity.variants, context('rotw-nonladder-34'));
  assert.equal(legacy.properties.options, eternity.options);
});

test('3.4 unique changes resolve for RotW Ladder and Offline while preserving 3.3 root data', () => {
  const cases: Record<string, string[]> = {
    "Dimoak's Hew": ['힘 +20','피해 +100~150%'],
    'Serpent Lord': ['공격 속도 +15%','최소 피해 +5','피해 +40~80%'],
    "Griswold's Edge": ['피해 +100~160%','대상 둔화 25%'],
    'The Salamander': ['화염 기술 +3','Fire Ball +4 (해당 직업 전용)','시전 속도 +10%'],
    'The Tannr Gorerod': ['피해 +200~220%','적중 시 생명력 5~9% 훔침'],
    'The Grim Reaper': ['피해 +80~120%','적중당 마나 5~9% 훔침'],
    'Silks of the Victor': ['달리기/걷기 속도 +20%','공격 속도 +30%','피해 +50~100%','마법 아이템 발견 확률 +15%'],
    'The Impaler': ['피해 +170~240%','4초마다 내구도 1 회복'],
    'Coldkill': ['냉기 피해 80~100 추가','피해 +160~200%'],
    'The Atlantean': ['피해 +250~300%','Zeal +2~5 (성기사 전용)','명중률 +100~125','착용 조건 -20%'],
    'Lava Gout': ['타격 시 5% 확률로 10레벨 Enchant 시전','결빙되지 않음'],
    Earthshaker: ['Fire Claw +3~5 (드루이드 전용)'],
    "Grim's Burning Dead": ['강령술사 기술 +4','15% 확률로 Burning Dead Archer로 환생','Fire Golem +3~5 (강령술사 전용)'],
    Swordguard: ['모든 저항 +20~30','피해 +180~230%','생명력 회복 +10~15','공격자가 피해 15~25 받음'],
    "Demonhorn's Edge": ['공격 속도 +20%','야만용사 기술 +1'],
    'Veil of Steel': ['모든 기술 +2','물리 피해 감소 15~25%','마법 저항 +20~40%'],
    'Ethereal Edge': ['피해 +220~260%','공격 속도 +40%','캐릭터 레벨에 따라 최대 피해 +2~198'],
    "Executioner's Justice": ['피해 +260~300%','적 처치 시 25% 확률로 13레벨 Amplify Damage 시전','공격 속도 +40%','적 처치 시 생명력 +15','적 처치 시 마나 +5'],
  };
  assert.equal(Object.keys(cases).length, 18);
  for (const [name, expected] of Object.entries(cases)) {
    const item = uniques.find((row: any) => row.english === name);
    assert.ok(item, `unique ${name}`);
    const selected = resolveItemVariant(item, item.variants, context('rotw-ladder-34'));
    assert.equal(selected.availability, 'AVAILABLE', name);
    const values = optionTexts(selected.properties.options);
    for (const text of expected) assert.ok(values.includes(text), `${name} missing ${text}`);
    assert.deepEqual(item.options, baseline.legacyRecords.uniques.find((row: any) => row.id === item.id)?.options, `${name} legacy root preserved`);
  }
  const ethereal = uniques.find((row: any) => row.english === 'Ethereal Edge');
  const offline = resolveItemVariant(ethereal, ethereal.variants, { ...context('rotw-ladder-34'), onlineState: 'Offline', ladderState: 'NotApplicable' });
  assert.equal(offline.availability, 'AVAILABLE');
  const nonladder = resolveItemVariant(ethereal, ethereal.variants, context('rotw-nonladder-34'));
  assert.deepEqual(nonladder.properties.options, ethereal.options);
});

test('3.3 updated uniques get RotW Non-Ladder availability only from 3.4; Rogue Bow choices are explicit', () => {
  const names = ['Bloodletter','The Battlebranch',"Rogue's Bow",'Pluckeye','Bane Ash','Gravenspine',"Blinkbat's Form",'The Ward','Manald Heal'];
  for (const name of names) {
    const item = uniques.find((row: any) => row.english === name);
    const nl33 = resolveItemVariant(item, item.variants, context('rotw-nonladder-33'));
    assert.equal(nl33.availability, 'REVIEW', `${name} before official non-ladder unlock`);
    const nl34 = resolveItemVariant(item, item.variants, context('rotw-nonladder-34'));
    assert.equal(nl34.availability, 'AVAILABLE', `${name} patch 3.4 NL`);
    assert.deepEqual(nl34.properties.options, item.options, `${name} retains patch 3.3 values`);
  }
  const rogue = uniques.find((row: any) => row.english === "Rogue's Bow");
  assert.equal(rogue.options.some((option: any) => option.text.includes('세부 조건 확인 중')), false);
  assert.deepEqual(rogue.optionGroups[0].map((option: any) => option.text), ['냉기 화살 +1~3 (아마존 전용)', '화염 화살 +1~3 (아마존 전용)']);
});

test('Isenhart 3.4 changes keep all legacy pieces and separate piece/set bonuses', () => {
  const isenhart = sets.find((set: any) => set.english === "Isenhart's Armory");
  assert.equal(isenhart.id, '4');
  assert.equal(isenhart.pieces.length, 4);
  const current = resolveItemVariant(isenhart, isenhart.variants, context('rotw-ladder-34'));
  assert.equal(current.availability, 'AVAILABLE');
  const pieces = current.properties.piecesById;
  assert.ok(pieces['13'].options.some((option: any) => option.text === '공격 속도 +40%'));
  assert.ok(pieces['13'].options.some((option: any) => option.text === '캐릭터 레벨에 따라 명중률 +5~495'));
  assert.equal(pieces['13'].bonuses.some((bonus: any) => bonus.count === 2 && bonus.options.some((option: any) => option.text.includes('명중률 +5'))), false);
  assert.ok(pieces['14'].bonuses.some((bonus: any) => bonus.count === 2 && bonus.options.some((option: any) => option.text === '냉기 저항 +15%')));
  assert.ok(pieces['14'].bonuses.some((bonus: any) => bonus.count === 2 && bonus.options.some((option: any) => option.text === '화염 저항 +15%')));
  assert.ok(pieces['15'].options.some((option: any) => option.text === '마법 저항 +25%'));
  assert.ok(pieces['16'].options.some((option: any) => option.text === '적중 시 생명력 5% 훔침'));
  assert.ok(current.properties.partial.find((group: any) => group.count === 3).options.some((option: any) => option.text === '캐릭터 레벨에 따라 최대 피해 +2~198'));
  assert.ok(current.properties.full.some((option: any) => option.text === '달리기/걷기 속도 +30%'));
  assert.ok(current.properties.full.some((option: any) => option.text === '타격 회복 속도 +25%'));
});

test('Angelic set and 8 new runeword availability never invent unconfirmed combinations', () => {
  const angelic = sets.find((set: any) => set.english === 'Angelic Raiment');
  const angelicNl = resolveItemVariant(angelic, angelic.variants, context('rotw-nonladder-34'));
  assert.equal(angelicNl.availability, 'AVAILABLE');
  assert.equal(angelicNl.properties.availability, 'RotW 온라인 래더·비래더 · 패치 3.4부터');
  const mania = runewords.find((row: any) => row.name.endsWith('(Mania)'));
  const maniaNl = resolveItemVariant(mania, mania.variants, context('rotw-nonladder-34'));
  assert.equal(maniaNl.availability, 'REVIEW');
  assert.equal(maniaNl.properties, null);
  const maniaLadder = resolveItemVariant(mania, mania.variants, context('rotw-ladder-34'));
  assert.equal(maniaLadder.availability, 'AVAILABLE');
});

test('all variants have a valid range, source, evidence, and at most one match for every UI preset context', () => {
  const all = [...uniques, ...sets, ...runewords];
  const presets: ItemContext[] = [
    ...(['3.3','3.4'] as const).flatMap((patch) => [
      { gameEra: 'RotW' as const, onlineState: 'Online' as const, ladderState: 'Ladder' as const, patch },
      { gameEra: 'RotW' as const, onlineState: 'Online' as const, ladderState: 'NonLadder' as const, patch },
      { gameEra: 'RotW' as const, onlineState: 'Offline' as const, ladderState: 'NotApplicable' as const, patch },
    ]),
  ];
  for (const item of all) for (const context of presets) {
  const matches = (item.variants || []).filter((variant: any) => variant.gameEras.includes(context.gameEra) && variant.onlineStates.includes(context.onlineState) && variant.ladderStates.includes(context.ladderState) && variant.patchFrom === context.patch);
    assert.ok(matches.length <= 1, `${item.id} has overlapping variants for ${JSON.stringify(context)}`);
  }
  const official33 = 'https://news.blizzard.com/en-us/article/24296140/diablo-ii-resurrected-ladder-season-15-has-concluded';
  for (const item of all) for (const variant of item.variants || []) {
    assert.ok(variant.id && [official33, official34].includes(variant.sourceUrl) && variant.sourceCheckedAt === '2026-11-14' && variant.evidence, `${item.id} variant metadata`);
    assert.ok(variant.gameEras.length && variant.onlineStates.length && variant.ladderStates.length, `${item.id} variant scope`);
  }
});
