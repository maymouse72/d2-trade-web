import data from './data.json';
import type { ItemVariant } from '../../lib/items/variants';

export type Runeword = {
  id: number; name: string; level: number; base: string; sockets: number;
  equipment: string; runes: string[]; options: string;
  aliases?: string[]; edition?: string; source?: string;
  variants?: ItemVariant<Partial<Runeword>>[];
};
export const records: Runeword[] = data as unknown as Runeword[];
export const normalize = (value: string) => value.toLocaleLowerCase().replace(/[\s'’‘"().·-]+/g, '');
export const englishName = (row: Runeword) => row.name.match(/\(([^()]*)\)\s*$/)?.[1] || row.name;
export const countKinds = (rows: Runeword[]) => new Set(rows.map(row => normalize(englishName(row)))).size;

const melee = ['검', '도끼', '메이스', '클럽', '해머', '셉터', '폴암', '스피어', '스태프', '원드', '클러', '대거'];
const ranged = ['보우', '크로스보우'];
const shields = ['쉴드', '마법서', '네크로맨서 방패', '팔라딘 방패'];
const groups: Record<string, string[]> = { '무기': [...melee, ...ranged], '근접 무기': melee, '원거리 무기': ranged, '근접 무기 및 미사일 무기': ['근접 무기 및 미사일 무기'] };
export function equipmentTypes(row: Runeword) {
  const labels = [row.equipment, ...(row.variants || []).map(variant => variant.properties?.equipment).filter((value): value is string => Boolean(value))];
  return [...new Set(labels.flatMap(label => label.split('/').flatMap(type => groups[type] || [type])))];
}
export const equipment = [...new Set(records.flatMap(equipmentTypes))].sort((a, b) => a.localeCompare(b, 'ko'));
export function filterRecords(filters: { query: string; base: string; sockets: string; level: string; rune: string; sort: string }) {
  const { query, base, sockets, level, rune, sort } = filters;
  return records.filter(row =>
    (!query || normalize([row.name, ...(row.aliases || []), row.base, row.runes.join(' '), row.options, ...(row.variants || []).flatMap(variant => [variant.properties?.base || '', variant.properties?.equipment || '', variant.properties?.options || ''])].join(' ')).includes(normalize(query))) &&
    (!base || equipmentTypes(row).includes(base) || (base === '쉴드' && equipmentTypes(row).some(type => shields.includes(type)))) &&
    (!sockets || row.sockets === Number(sockets)) && (!level || row.level <= Number(level)) && (!rune || row.runes.includes(rune))
  ).sort((a, b) => sort === 'level' ? a.level - b.level || a.id - b.id : sort === 'sockets' ? a.sockets - b.sockets || a.id - b.id : a.name.localeCompare(b.name, 'ko'));
}
