import type { IASResult } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { IAS_HARD_MAX } from "./constants.ts";

interface StrafeBreakpoint { eias: number; first: number; follow: number; last: number }
const STRAFE_ROWS: Readonly<Record<"bow" | "xbw", readonly StrafeBreakpoint[]>> = {
  bow: [
    { eias: -20, first: 8, follow: 4, last: 13 }, { eias: -15, first: 8, follow: 4, last: 12 },
    { eias: -14, first: 7, follow: 4, last: 12 }, { eias: -8, first: 7, follow: 4, last: 11 },
    { eias: 0, first: 6, follow: 3, last: 10 }, { eias: 11, first: 6, follow: 3, last: 9 },
    { eias: 21, first: 5, follow: 3, last: 9 }, { eias: 23, first: 5, follow: 3, last: 8 },
    { eias: 38, first: 5, follow: 3, last: 7 }, { eias: 50, first: 4, follow: 2, last: 7 },
    { eias: 58, first: 4, follow: 2, last: 6 },
  ],
  xbw: [
    { eias: -20, first: 12, follow: 7, last: 20 }, { eias: -19, first: 12, follow: 7, last: 19 },
    { eias: -17, first: 11, follow: 7, last: 19 }, { eias: -16, first: 11, follow: 6, last: 19 },
    { eias: -15, first: 11, follow: 6, last: 18 }, { eias: -10, first: 11, follow: 6, last: 17 },
    { eias: -9, first: 10, follow: 6, last: 17 }, { eias: -5, first: 10, follow: 6, last: 16 },
    { eias: 0, first: 9, follow: 5, last: 15 }, { eias: 8, first: 9, follow: 5, last: 14 },
    { eias: 12, first: 9, follow: 4, last: 14 }, { eias: 13, first: 8, follow: 5, last: 14 },
    { eias: 15, first: 8, follow: 5, last: 13 }, { eias: 21, first: 8, follow: 5, last: 13 },
    { eias: 24, first: 8, follow: 5, last: 12 }, { eias: 25, first: 8, follow: 4, last: 11 },
    { eias: 29, first: 7, follow: 4, last: 12 }, { eias: 34, first: 7, follow: 4, last: 11 },
    { eias: 43, first: 7, follow: 3, last: 11 }, { eias: 50, first: 6, follow: 4, last: 10 },
    { eias: 61, first: 6, follow: 4, last: 9 }, { eias: 67, first: 6, follow: 3, last: 8 },
  ],
};

function eiasFor(ias: number, wsm: number) {
  return Math.max(-85, Math.min(75, Math.floor(120 * ias / (120 + ias)) - wsm));
}

function sequence(weaponClass: "bow" | "xbw", eias: number, targetCount: number) {
  const row = [...STRAFE_ROWS[weaponClass]].reverse().find((item) => item.eias <= eias) ?? STRAFE_ROWS[weaponClass][0];
  const followFloor = weaponClass === "bow" ? 3 : 4;
  const follow = Math.max(followFloor, row.follow);
  return { first: row.first, follow, last: row.last, total: row.first + follow * (targetCount - 2) + row.last };
}

export function calculateAmazonStrafe(input: NormalizedIASInput, wsm: number, weaponClass: "bow" | "xbw") {
  const eias = eiasFor(input.totalIAS, wsm);
  const result = sequence(weaponClass, eias, input.hitCount);
  const rows = getAmazonStrafeBreakpointRows(input.weaponCode, IAS_HARD_MAX, input.hitCount);
  const current = rows.filter((row) => row.ias <= input.totalIAS).at(-1);
  const next = rows.find((row) => row.ias > input.totalIAS);
  return {
    status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: result.total,
    totalIAS: input.totalIAS, effectiveIAS: eias, currentBreakpoint: current?.ias ?? 0,
    nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - input.totalIAS : null,
    evidenceVersion: "AMAZON-BASIN-STRAFE-SEQUENCE", reason: "Amazon Basin의 속사 First/Follow/Last 시퀀스 공개 기준값입니다.",
    attackSequence: { hitCount: input.hitCount, totalSequenceFrames: result.total, label: `속사 ${input.hitCount}발 (${result.first}+${input.hitCount - 2}×${result.follow}+${result.last}프레임)` },
  } satisfies IASResult;
}

export function getAmazonStrafeBreakpointRows(weaponCode: string, maxIAS: number, targetCount = 2) {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  const weaponClass = weapon?.weaponClass;
  const wsm = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? weapon?.wsm;
  if (!weapon || (weaponClass !== "bow" && weaponClass !== "xbw") || wsm === null || wsm === undefined) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= maxIAS; ias++) {
    const frames = sequence(weaponClass, eiasFor(ias, wsm), targetCount).total;
    if (frames !== previous) rows.push({ ias, fullAnimationFrames: frames });
    previous = frames;
  }
  return rows;
}
