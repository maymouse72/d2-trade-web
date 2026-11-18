import catalog from './base-items.json' with { type: 'json' };
import recommendationOverrides from './practical-recommendations.json' with { type: 'json' };
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
  requiredLevel?: number;
  strengthRequired?: number;
  dexterityRequired?: number;
  durability?: number;
  baseCode?: string;
  staffmodsPossible?: boolean;
  socketLimitsByItemLevel?: { minItemLevel: number; maxItemLevel?: number; maxSockets: number }[];
}

export interface BaseRecommendation {
  baseItem: BaseItem;
  purposes: BasePurpose[];
  priority: number;
  reason: string;
  condition?: string;
}

interface CuratedRecommendation {
  baseItemId: string;
  purposes: BasePurpose[];
  reason: string;
  condition?: string;
}

export const BASE_ITEMS = catalog.items as BaseItem[];
export const BASE_ITEM_SOURCES = catalog.sources;

export function hasReviewedBaseRecommendations(runewordId: number | string | undefined): boolean {
  return runewordId !== undefined && Object.hasOwn(recommendationOverrides, String(runewordId));
}

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

function minItemLevelForSockets(base: BaseItem, sockets: number): number | undefined {
  const bands = base.socketLimitsByItemLevel;
  if (!bands?.length) return undefined;
  const band = [...bands].sort((a, b) => a.minItemLevel - b.minItemLevel).find((item) => item.maxSockets >= sockets);
  return band && band.minItemLevel > 1 ? band.minItemLevel : undefined;
}

export function getBaseRecommendations(runeword: Pick<Runeword, 'equipment' | 'sockets'> & Partial<Pick<Runeword, 'id' | 'level'>>): BaseRecommendation[] {
  const compatible = BASE_ITEMS.filter((item) => isBaseCompatible(item, runeword.equipment, runeword.sockets));
  const curated = runeword.id === undefined ? undefined : (recommendationOverrides as Record<string, CuratedRecommendation[]>)[String(runeword.id)];
  if (curated) {
    const curatedRecommendations = curated.flatMap((entry, index) => {
      const baseItem = compatible.find((item) => item.id === entry.baseItemId);
      return baseItem ? [{ baseItem, purposes: entry.purposes, priority: index + 1, reason: entry.reason, ...(entry.condition ? { condition: entry.condition } : {}) }] : [];
    });
    return curatedRecommendations;
  }
  return [];
}

export function validateBaseRecommendationData(runewords: Runeword[]): string[] {
  const errors: string[] = [];
  const baseById = new Map(BASE_ITEMS.map((base) => [base.id, base]));
  const runewordIds = new Set(runewords.map((row) => String(row.id)));
  if (baseById.size !== BASE_ITEMS.length) errors.push('베이스 ID가 중복됩니다.');
  for (const [runewordId, recommendations] of Object.entries(recommendationOverrides as Record<string, CuratedRecommendation[]>)) {
    if (!runewordIds.has(runewordId)) errors.push(`추천 데이터에 존재하지 않는 룬워드 ID ${runewordId}가 있습니다.`);
    const runeword = runewords.find((row) => String(row.id) === runewordId);
    for (const recommendation of recommendations) {
      const base = baseById.get(recommendation.baseItemId);
      if (!base) errors.push(`${runewordId}: 추천 베이스 ${recommendation.baseItemId}가 카탈로그에 없습니다.`);
      else if (runeword && !isBaseCompatible(base, runeword.equipment, runeword.sockets)) errors.push(`${runewordId} ${runeword.name}: ${base.nameEn} 원본 추천 데이터가 장비 종류/소켓과 호환되지 않습니다.`);
    }
  }

  for (const item of BASE_ITEMS) {
    if (!item.nameKo || !item.nameEn) errors.push(`${item.id}: 베이스 이름이 비어 있습니다.`);
    if (!['NO', 'EX', 'EL'].includes(item.tier)) errors.push(`${item.id}: 등급이 잘못되었습니다.`);
    if (!Number.isInteger(item.maxSockets) || item.maxSockets < 1 || item.maxSockets > 6) errors.push(`${item.id}: 최대 소켓 값이 잘못되었습니다.`);
    if (!item.equipmentTypes.length) errors.push(`${item.id}: 장비 유형이 비어 있습니다.`);
  }

  for (const runeword of runewords) {
    if (!hasReviewedBaseRecommendations(runeword.id)) continue;
    const recommendations = getBaseRecommendations(runeword);
    if (recommendations.length < 1 || recommendations.length > 5) errors.push(`${runeword.id} ${runeword.name}: 추천 베이스가 1~5개 범위를 벗어납니다.`);
    if (new Set(recommendations.map((row) => row.baseItem.id)).size !== recommendations.length) errors.push(`${runeword.id} ${runeword.name}: 중복 추천 베이스가 있습니다.`);
    for (const recommendation of recommendations) {
      const base = baseById.get(recommendation.baseItem.id);
      if (!base) errors.push(`${runeword.id} ${runeword.name}: 존재하지 않는 베이스 ID입니다.`);
      else if (!isBaseCompatible(base, runeword.equipment, runeword.sockets)) errors.push(`${runeword.id} ${runeword.name}: ${base.nameEn} 장비 유형/소켓 호환 오류.`);
      if (!recommendation.reason.trim()) errors.push(`${runeword.id} ${runeword.name}: 추천 이유가 없습니다.`);
      if (recommendation.reason.trim().length < 12 || recommendation.reason.length > 100) errors.push(`${runeword.id} ${runeword.name}: 추천 이유 길이가 12~100자 기준을 벗어납니다.`);
      for (const text of [recommendation.reason, recommendation.condition || '']) {
        for (const match of text.matchAll(/(\d)\s*소켓/g)) {
          if (Number(match[1]) !== runeword.sockets) errors.push(`${runeword.id} ${runeword.name}: 설명의 ${match[0]}이 실제 ${runeword.sockets}소켓과 다릅니다.`);
        }
      }
      const text = `${recommendation.reason} ${recommendation.condition || ''}`.replace(/\s/g, '');
      const options = String((runeword as Runeword & { options?: string }).options || '').replace(/\s/g, '');
      if (/파괴불가/.test(options) && /파괴불가(가|는)?없/.test(text)) errors.push(`${runeword.id} ${runeword.name}: 파괴 불가 옵션을 잘못 부정하는 설명이 있습니다.`);
      if (/(광신|파나티시즘|파나틱|fanaticism)/i.test(text) && !/(광신|파나티시즘|파나틱|fanaticism)/i.test(options)) errors.push(`${runeword.id} ${runeword.name}: 룬워드 옵션에 없는 광신 효과를 설명합니다.`);
      if (/광폭화\s*오라/.test(text)) errors.push(`${runeword.id} ${runeword.name}: 광폭화 기술을 오라로 잘못 설명합니다.`);
      if (/(원기\s*오라|비거\s*오라|vigor\s*aura)/i.test(text) && !/(원기|비거|vigor)/i.test(options)) errors.push(`${runeword.id} ${runeword.name}: 룬워드 옵션에 없는 원기 오라를 설명합니다.`);
      if (recommendation.purposes.includes('mercenary') && /(발키리|valkyrie)/i.test(text)) errors.push(`${runeword.id} ${runeword.name}: 용병 추천 이유에서 발키리 기술을 활용한다고 안내합니다.`);
      if (/(자동\s*수리|수리\s*옵션)/.test(text) && !/(자동\s*수리|내구력\s*\d+\s*회복)/.test(options)) errors.push(`${runeword.id} ${runeword.name}: 실제 옵션에 없는 자동 수리를 설명합니다.`);
      if (/(파괴\s*불가|내구도\s*소모가\s*없)/.test(text) && base?.durability !== 0 && !/(파괴\s*불가|파괴안됨)/.test(options)) errors.push(`${runeword.id} ${runeword.name}: 베이스나 룬워드 옵션에 없는 내구도 효과를 설명합니다.`);
      const socketLevel = base ? minItemLevelForSockets(base, runeword.sockets) : undefined;
      if (socketLevel && !new RegExp(`아이템\\s*레벨\\s*${socketLevel}\\s*이상`).test(recommendation.condition || '')) errors.push(`${runeword.id} ${runeword.name}: ${base?.nameEn} ${runeword.sockets}소켓의 아이템 레벨 ${socketLevel}+ 조건 안내가 없습니다.`);
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
  const seenReasons = new Map<string, string>();
  for (const runeword of runewords) {
    if (!(recommendationOverrides as Record<string, CuratedRecommendation[]>)[String(runeword.id)]) continue;
    for (const recommendation of getBaseRecommendations(runeword)) {
      const key = recommendation.reason.trim();
      const prior = seenReasons.get(key);
      if (prior) errors.push(`${runeword.id} ${runeword.name}: ${prior}와 추천 이유가 중복됩니다.`);
      else seenReasons.set(key, `${runeword.id} ${runeword.name}`);
    }
  }
  return errors;
}
