import zealDataset from "./data/paladin-zeal-golden.json" with { type: "json" };

export interface ZealGoldenRow {
  IAS: number;
  EIAS: number;
  hitCount: number;
  firstAttackFrames: number;
  followUpAttackFrames: number;
  finalAttackFrames: number;
  hitEventFrames: number[];
  totalSequenceFrames: number;
}

export interface ZealGoldenDataset {
  datasetId: string;
  gameBuild: string;
  skillId: number;
  animationMode: "A1";
  weaponCode: string;
  WSM: number;
  IASRange: { min: number; max: number };
  sourceHash: string;
  rows: ZealGoldenRow[];
}

export const ZEAL_GOLDEN_DATASETS = zealDataset.datasets as ZealGoldenDataset[];
export const ZEAL_GOLDEN_ROWS = ZEAL_GOLDEN_DATASETS.flatMap((dataset) => dataset.rows);
const rowMap = new Map<string, ZealGoldenRow>();
for (const dataset of ZEAL_GOLDEN_DATASETS) {
  for (const row of dataset.rows) rowMap.set(`${dataset.weaponCode}:${row.IAS}:${row.hitCount}`, row);
}

export function getZealGoldenRow(weaponCode: string, totalIAS: number, hitCount: number): ZealGoldenRow | null {
  return rowMap.get(`${weaponCode}:${totalIAS}:${hitCount}`) ?? null;
}

export function deriveZealBreakpoints(weaponCode: string, hitCount: number): number[] {
  const dataset = ZEAL_GOLDEN_DATASETS.find((item) => item.weaponCode === weaponCode);
  if (!dataset) return [];
  const rows = dataset.rows.filter((row) => row.hitCount === hitCount);
  const transitions: number[] = [];
  let previous: number | null = null;
  for (const row of rows) {
    if (previous === null || row.totalSequenceFrames < previous) transitions.push(row.IAS);
    previous = row.totalSequenceFrames;
  }
  return transitions;
}

export function getZealBreakpointDetails(weaponCode: string, totalIAS: number, hitCount: number) {
  const row = getZealGoldenRow(weaponCode, totalIAS, hitCount);
  if (!row) return null;
  const breakpoints = deriveZealBreakpoints(weaponCode, hitCount);
  const currentBreakpoint = [...breakpoints].reverse().find((value) => value <= totalIAS);
  if (currentBreakpoint === undefined) return null;
  const nextBreakpoint = breakpoints.find((value) => value > totalIAS) ?? null;
  return { currentBreakpoint, nextBreakpoint, requiredAdditionalIAS: nextBreakpoint === null ? null : nextBreakpoint - totalIAS };
}
