import catalog from './base-items.json' with { type: 'json' };
import recommendationPreferences from './recommendation-preferences.json' with { type: 'json' };
import type { Runeword } from '../../app/runewords/catalog.ts';

export type BaseTier = 'NO' | 'EX' | 'EL';
export type BasePurpose = 'leveling' | 'endgame' | 'mercenary';

export interface BaseItem {
  id: string;
  nameKo: string;
  nameEn: string;
  tier: BaseTier;
  equipmentTypes: string[];
  maxSockets: number;
  classRestriction?: string;
  mercenaryClasses?: string[];
}

export interface BaseRecommendation {
  baseItem: BaseItem;
  purposes: BasePurpose[];
  priority: number;
  reason: string;
}

export const BASE_ITEMS = catalog.items as BaseItem[];
export const BASE_ITEM_SOURCES = catalog.sources;

const TIER_ORDER: Record<BaseTier, number> = { NO: 0, EX: 1, EL: 2 };
const NON_RANGED_WEAPONS = ['sword', 'axe', 'mace', 'club', 'hammer', 'polearm', 'spear', 'staff', 'claw', 'dagger', 'scepter'];
const ALL_RUNeword_WEAPONS = [...NON_RANGED_WEAPONS, 'bow', 'crossbow', 'wand'];

const EQUIPMENT_CATEGORY: Record<string, string[]> = {
  '아머': ['bodyArmor'],
  '헬름': ['helm'],
  '쉴드': ['shield', 'paladinShield', 'necromancerShield'],
  '마법서': ['warlockBook'],
  '네크로맨서 방패': ['necromancerShield'],
  '팔라딘 방패': ['paladinShield'],
  '검': ['sword'],
  '도끼': ['axe'],
  '메이스': ['mace'],
  '클럽': ['club'],
  '해머': ['hammer'],
  '폴암': ['polearm'],
  '스피어': ['spear'],
  '스태프': ['staff'],
  '보우': ['bow'],
  '크로스보우': ['crossbow'],
  '원드': ['wand'],
  '클러': ['claw'],
  '대거': ['dagger'],
  '셉터': ['scepter'],
  '무기': ALL_RUNeword_WEAPONS,
  '근접 무기': NON_RANGED_WEAPONS,
  '원거리 무기': ['bow', 'crossbow'],
  '근접 무기 및 미사일 무기': [...NON_RANGED_WEAPONS, 'bow', 'crossbow'],
};

export function equipmentCategories(equipment: string): string[] {
  return [...new Set(equipment.split('/').flatMap((label) => EQUIPMENT_CATEGORY[label.trim()] || []))];
}

export function isBaseCompatible(base: BaseItem, equipment: string, sockets: number): boolean {
  const categories = equipmentCategories(equipment);
  return base.maxSockets >= sockets && base.equipmentTypes.some((type) => categories.includes(type));
}

function choose(items: BaseItem[], predicate: (item: BaseItem) => boolean, order: (a: BaseItem, b: BaseItem) => number) {
  return items.filter(predicate).sort(order)[0];
}

function reasonFor(item: BaseItem, purpose: BasePurpose): string {
  if (purpose === 'leveling') return '필요 소켓을 맞출 수 있는 육성 단계의 제작 후보입니다.';
  if (purpose === 'endgame') return '필요 소켓과 장비 유형을 만족하는 최종 베이스 후보입니다.';
  const classNames = (item.mercenaryClasses || []).map((value) => ({ act1: '1막', act2: '2막', act3: '3막', act5: '5막' }[value] || value));
  return `용병이 장착할 수 있는 장비 유형입니다${classNames.length ? ` (${classNames.join('·')} 용병)` : ''}.`;
}

export function getBaseRecommendations(runeword: Pick<Runeword, 'equipment' | 'sockets'> & Partial<Pick<Runeword, 'id' | 'level'>>): BaseRecommendation[] {
  const compatible = BASE_ITEMS.filter((item) => isBaseCompatible(item, runeword.equipment, runeword.sockets));
  const selected = new Map<string, BaseRecommendation>();
  const add = (item: BaseItem | undefined, purpose: BasePurpose) => {
    if (!item) return;
    const existing = selected.get(item.id);
    if (existing) {
      if (!existing.purposes.includes(purpose)) {
        existing.purposes.push(purpose);
        existing.reason = `${existing.reason} ${reasonFor(item, purpose)}`;
      }
      return;
    }
    selected.set(item.id, {
      baseItem: item,
      purposes: [purpose],
      priority: selected.size + 1,
      reason: reasonFor(item, purpose),
    });
  };

  const preferredIds = runeword.id === undefined ? [] : (recommendationPreferences as Record<string, string[]>)[String(runeword.id)] || [];
  for (const id of preferredIds) {
    if (selected.size >= 5) break;
    const item = compatible.find((candidate) => candidate.id === id);
    if (item) add(item, item.tier === 'EL' ? 'endgame' : (runeword.level === undefined || runeword.level <= 40 ? 'leveling' : 'endgame'));
  }

  if (runeword.level === undefined || runeword.level <= 40) {
    const earlierTier = choose(compatible, (item) => item.tier !== 'EL' && !selected.has(item.id), (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
    if (selected.size < 5) add(earlierTier, 'leveling');
  }

  const recommendationGroups = [...new Set(equipmentCategories(runeword.equipment).map((type) =>
    type === 'paladinShield' || type === 'necromancerShield' || type === 'warlockBook' ? 'shield' : type,
  ))];
  for (const group of recommendationGroups) {
    if (selected.size >= 5) break;
    const groupItems = compatible.filter((item) => item.equipmentTypes.some((type) =>
      (type === 'paladinShield' || type === 'necromancerShield' || type === 'warlockBook' ? 'shield' : type) === group,
    ));
    const elite = choose(groupItems, (item) => item.tier === 'EL', (a, b) => groupItems.indexOf(a) - groupItems.indexOf(b));
    add(elite, 'endgame');
  }

  const mercenary = choose(compatible.filter((item) => item.mercenaryClasses?.length), () => true,
    (a, b) => TIER_ORDER[b.tier] - TIER_ORDER[a.tier] || compatible.indexOf(a) - compatible.indexOf(b));
  if (selected.size < 5) add(mercenary, 'mercenary');

  for (const item of compatible) {
    if (selected.size >= 5) break;
    if (!selected.has(item.id) && (item.tier === 'EL' || runeword.level === undefined || runeword.level <= 40)) {
      add(item, item.tier === 'EL' ? 'endgame' : 'leveling');
    }
  }

  return [...selected.values()].sort((a, b) => a.priority - b.priority);
}

export function validateBaseRecommendationData(runewords: Runeword[]): string[] {
  const errors: string[] = [];
  const baseById = new Map(BASE_ITEMS.map((base) => [base.id, base]));
  const runewordIds = new Set(runewords.map((row) => String(row.id)));
  const preferences = recommendationPreferences as Record<string, string[]>;
  if (baseById.size !== BASE_ITEMS.length) errors.push('베이스 ID가 중복됩니다.');
  for (const [runewordId, baseIds] of Object.entries(preferences)) {
    if (!runewordIds.has(runewordId)) errors.push(`추천 우선순위에 존재하지 않는 룬워드 ID ${runewordId}가 있습니다.`);
    for (const baseId of baseIds) if (!baseById.has(baseId)) errors.push(`${runewordId}: 우선 추천 베이스 ${baseId}가 카탈로그에 없습니다.`);
  }

  for (const item of BASE_ITEMS) {
    if (!item.nameKo || !item.nameEn) errors.push(`${item.id}: 베이스 이름이 비어 있습니다.`);
    if (!['NO', 'EX', 'EL'].includes(item.tier)) errors.push(`${item.id}: 등급이 잘못되었습니다.`);
    if (!Number.isInteger(item.maxSockets) || item.maxSockets < 1 || item.maxSockets > 6) errors.push(`${item.id}: 최대 소켓 값이 잘못되었습니다.`);
    if (!item.equipmentTypes.length) errors.push(`${item.id}: 장비 유형이 비어 있습니다.`);
  }

  for (const runeword of runewords) {
    const recommendations = getBaseRecommendations(runeword);
    if (recommendations.length < 1 || recommendations.length > 5) errors.push(`${runeword.id} ${runeword.name}: 추천 베이스가 1~5개 범위를 벗어납니다.`);
    if (new Set(recommendations.map((row) => row.baseItem.id)).size !== recommendations.length) errors.push(`${runeword.id} ${runeword.name}: 중복 추천 베이스가 있습니다.`);
    for (const recommendation of recommendations) {
      const base = baseById.get(recommendation.baseItem.id);
      if (!base) errors.push(`${runeword.id} ${runeword.name}: 존재하지 않는 베이스 ID입니다.`);
      else if (!isBaseCompatible(base, runeword.equipment, runeword.sockets)) errors.push(`${runeword.id} ${runeword.name}: ${base.nameEn} 장비 유형/소켓 호환 오류.`);
      if (!recommendation.reason.trim()) errors.push(`${runeword.id} ${runeword.name}: 추천 이유가 없습니다.`);
      if (!recommendation.purposes.length) errors.push(`${runeword.id} ${runeword.name}: 목적 분류가 없습니다.`);
      if (recommendation.purposes.includes('mercenary') && (!base?.mercenaryClasses?.length || base.classRestriction)) {
        errors.push(`${runeword.id} ${runeword.name}: 용병 장착 자격이 없는 ${base?.nameEn || recommendation.baseItem.id}가 용병 용도로 표시됩니다.`);
      }
    }

    for (const variant of runeword.variants || []) {
      const equipment = variant.properties?.equipment || runeword.equipment;
      const sockets = variant.properties?.sockets || runeword.sockets;
      const variantRecommendations = getBaseRecommendations({ id: runeword.id, equipment, sockets, level: runeword.level });
      if (!variantRecommendations.length) errors.push(`${runeword.id} ${runeword.name}: Variant ${variant.id}의 제작 호환 베이스가 없습니다.`);
      for (const recommendation of variantRecommendations) {
        if (!isBaseCompatible(recommendation.baseItem, equipment, sockets)) errors.push(`${runeword.id} ${runeword.name}: Variant ${variant.id}의 ${recommendation.baseItem.nameEn} 호환 오류.`);
      }
    }
  }
  return errors;
}
