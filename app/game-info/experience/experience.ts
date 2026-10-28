import raw from './data/experience-efficiency.json';

export type Difficulty = 'normal' | 'nightmare' | 'hell';
export type Filter = 'all' | Difficulty;
export type ChartRow = { level: number; values: (number | null)[] };
export const difficulties: { id: Difficulty; name: string }[] = [
  { id: 'normal', name: '노멀' }, { id: 'nightmare', name: '나이트메어' }, { id: 'hell', name: '헬' },
];
export const columns = difficulties.flatMap((difficulty, index) =>
  Array.from({ length: 5 }, (_, act) => ({ ...difficulty, act: act + 1, index: index * 5 + act })));
export const rows: ChartRow[] = raw.rows;
export const metadata = raw.metadata;

export function highest(row: ChartRow, indices = columns.map(column => column.index)) {
  const values = indices.map(index => row.values[index]).filter((value): value is number => value !== null);
  return values.length ? Math.max(...values) : null;
}

export function winners(row: ChartRow) {
  const max = highest(row);
  return max === null ? [] : columns.filter(column => row.values[column.index] === max);
}

// Include tied winners in the continuous reference range; level 99 is not a leveling recommendation.
export function recommendedRange(level: number, index: number) {
  let from = level;
  let to = level;
  const includes = (candidate: number) => candidate < 99 && winners(rows[candidate - 1]).some(column => column.index === index);
  while (from > 1 && includes(from - 1)) from--;
  while (to < 98 && includes(to + 1)) to++;
  return `${from}~${to}레벨`;
}

export function bucket(value: number | null) {
  if (value === null) return 'unknown';
  if (value >= 90) return 'highest';
  if (value >= 70) return 'high';
  if (value >= 40) return 'medium';
  if (value >= 10) return 'low';
  return 'lowest';
}

export function normalizeLevel(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(1, Math.min(99, Math.trunc(value))) : fallback;
}
