import type { IASResult } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { IAS_HARD_MAX } from "./constants.ts";

// Amazon Basin Fend table, keyed by minimum EIAS. Javelin rows carry each
// successive Follow interval; spear rows use one repeated Follow interval.
const FEND_ROWS: Readonly<Record<"1ht" | "2ht", readonly { eias: number; first: number; follows: readonly number[]; last: number }[]>> = {
  "1ht": [
    { eias: -21, first: 9, follows: Array(10).fill(8), last: 15 }, { eias: -19, first: 9, follows: Array(10).fill(8), last: 14 },
    { eias: -14, first: 9, follows: Array(10).fill(7), last: 13 }, { eias: -12, first: 8, follows: Array(10).fill(7), last: 13 },
    { eias: -7, first: 8, follows: Array(10).fill(7), last: 12 }, { eias: 0, first: 7, follows: Array(10).fill(6), last: 11 },
    { eias: 10, first: 7, follows: Array(10).fill(6), last: 10 }, { eias: 15, first: 7, follows: [5, ...Array(9).fill(6)], last: 10 },
    { eias: 17, first: 6, follows: [6, 5, 6, 5, 6, 5, 6, 5, 6, 5], last: 10 }, { eias: 21, first: 6, follows: Array(10).fill(5), last: 9 },
    { eias: 34, first: 6, follows: [4, ...Array(9).fill(5)], last: 8 }, { eias: 41, first: 5, follows: [5, 4, 5, 4, 5, 4, 5, 4, 5, 4], last: 8 },
    { eias: 50, first: 5, follows: Array(10).fill(4), last: 7 }, { eias: 61, first: 5, follows: Array(10).fill(4), last: 6 },
    { eias: 67, first: 5, follows: [3, ...Array(9).fill(4)], last: 7 }, { eias: 72, first: 5, follows: [3, ...Array(9).fill(4)], last: 6 },
    { eias: 75, first: 4, follows: [4, 3, 4, 3, 4, 3, 4, 3, 4, 3], last: 6 },
  ],
  "2ht": [
    { eias: -21, first: 12, follows: Array(10).fill(9), last: 17 }, { eias: -17, first: 11, follows: Array(10).fill(9), last: 16 },
    { eias: -12, first: 11, follows: Array(10).fill(8), last: 15 }, { eias: -9, first: 10, follows: Array(10).fill(8), last: 15 },
    { eias: -6, first: 10, follows: Array(10).fill(8), last: 14 }, { eias: 0, first: 9, follows: Array(10).fill(7), last: 13 },
    { eias: 8, first: 9, follows: Array(10).fill(7), last: 12 }, { eias: 13, first: 8, follows: Array(10).fill(7), last: 12 },
    { eias: 17, first: 8, follows: Array(10).fill(6), last: 11 }, { eias: 28, first: 8, follows: Array(10).fill(6), last: 10 },
    { eias: 29, first: 7, follows: Array(10).fill(6), last: 10 }, { eias: 41, first: 7, follows: Array(10).fill(5), last: 9 },
    { eias: 50, first: 6, follows: Array(10).fill(5), last: 9 }, { eias: 56, first: 6, follows: Array(10).fill(5), last: 8 },
    { eias: 75, first: 6, follows: Array(10).fill(4), last: 7 },
  ],
};

function getEias(input: NormalizedIASInput, wsm: number) {
  const itemEias = Math.floor(120 * input.totalIAS / (120 + input.totalIAS));
  return Math.max(-85, Math.min(75, itemEias - wsm));
}

function getRow(weaponClass: "1ht" | "2ht", eias: number) {
  const rows = FEND_ROWS[weaponClass];
  return [...rows].reverse().find((row) => row.eias <= eias) ?? rows[0];
}

function sequence(weaponClass: "1ht" | "2ht", eias: number, targetCount: number) {
  const row = getRow(weaponClass, eias);
  const follows = row.follows.slice(0, Math.max(0, targetCount - 2));
  return { first: row.first, follows, last: row.last, total: row.first + follows.reduce((sum, value) => sum + value, 0) + row.last };
}

export function calculateAmazonFend(input: NormalizedIASInput, wsm: number, weaponClass: "1ht" | "2ht"): IASResult {
  const eias = getEias(input, wsm);
  const targetCount = input.hitCount;
  const current = sequence(weaponClass, eias, targetCount);
  const rows = getAmazonFendBreakpointRows(input.weaponCode, IAS_HARD_MAX, targetCount);
  const currentBreakpoint = rows.filter((row) => row.ias <= input.totalIAS).at(-1);
  const next = rows.find((row) => row.ias > input.totalIAS);
  return {
    status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: current.total,
    totalIAS: input.totalIAS, effectiveIAS: eias, currentBreakpoint: currentBreakpoint?.ias ?? 0,
    nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - input.totalIAS : null,
    evidenceVersion: "AMAZON-BASIN-FEND-SEQUENCE", reason: `Amazon Basin의 난격 ${targetCount}대상 First/Follow/Last 시퀀스 공개 기준값입니다.`,
    attackSequence: { hitCount: targetCount, totalSequenceFrames: current.total, label: `난격 ${targetCount}대상 (${[current.first, ...current.follows, current.last].join("+")}프레임)` },
  };
}

export function getAmazonFendBreakpointRows(weaponCode: string, maxIAS: number, targetCount = 2) {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  const weaponClass = weapon?.weaponClass;
  const wsm = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? weapon?.wsm;
  if (!weapon || (weaponClass !== "1ht" && weaponClass !== "2ht") || wsm === null || wsm === undefined) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= maxIAS; ias++) {
    const itemEias = Math.floor(120 * ias / (120 + ias));
    const eias = Math.max(-85, Math.min(75, itemEias - wsm));
    const frames = sequence(weaponClass, eias, targetCount).total;
    if (frames !== previous) rows.push({ ias, fullAnimationFrames: frames });
    previous = frames;
  }
  return rows;
}
