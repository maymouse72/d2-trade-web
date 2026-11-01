import derivedDataset from "./data/paladin-a1-skill-derived-golden.json" with { type: "json" };
import type { IASAttackSkill } from "./types.ts";

export interface SkillGoldenRow {
  skill: IASAttackSkill;
  skillId: number;
  weaponCode: string;
  IAS: number;
  expectedFrames: number;
  evidenceStatus: "DERIVED_RANGE_VALIDATION";
}

export interface SkillGoldenDataset {
  derivedFrom: string;
  sourceGolden: string;
  gameBuild: string;
  skillId: number;
  skill: IASAttackSkill;
  animationMode: "A1";
  weaponCode: string;
  WSM: number;
  evidenceScope: string;
  evidenceStatus: "DERIVED_RANGE_VALIDATION";
  sourceHash: string;
  rows: Array<{ IAS: number; expectedFrames: number }>;
}

export const SKILL_DERIVED_GOLDEN_DATASETS = derivedDataset.datasets as SkillGoldenDataset[];
export const SKILL_DERIVED_GOLDEN_ROWS: SkillGoldenRow[] = SKILL_DERIVED_GOLDEN_DATASETS.flatMap((dataset) =>
  dataset.rows.map((row) => ({
    skill: dataset.skill,
    skillId: dataset.skillId,
    weaponCode: dataset.weaponCode,
    IAS: row.IAS,
    expectedFrames: row.expectedFrames,
    evidenceStatus: dataset.evidenceStatus,
  })),
);

const FRAME_BY_SKILL_WEAPON_IAS = new Map<string, number>();
for (const dataset of SKILL_DERIVED_GOLDEN_DATASETS) {
  for (const row of dataset.rows) {
    FRAME_BY_SKILL_WEAPON_IAS.set(`${dataset.skill}:${dataset.weaponCode}:${row.IAS}`, row.expectedFrames);
  }
}

export function getSkillGoldenFrameCount(skill: IASAttackSkill, weaponCode: string, totalIAS: number): number | null {
  return FRAME_BY_SKILL_WEAPON_IAS.get(`${skill}:${weaponCode}:${totalIAS}`) ?? null;
}

export function deriveSkillGoldenBreakpoints(skill: IASAttackSkill, weaponCode: string): number[] {
  const rows = SKILL_DERIVED_GOLDEN_DATASETS.find((dataset) => dataset.skill === skill && dataset.weaponCode === weaponCode)?.rows ?? [];
  const transitions: number[] = [];
  let previousFrames: number | null = null;
  for (const row of rows) {
    if (previousFrames === null || row.expectedFrames < previousFrames) transitions.push(row.IAS);
    previousFrames = row.expectedFrames;
  }
  return transitions;
}
