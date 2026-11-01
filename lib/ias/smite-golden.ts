import { SMITE_MAX_IAS_BY_WEAPON } from "./constants.ts";

// Fixed breakpoint vectors transcribed from the published Paladin Smite table;
// values are deliberately independent of the production frame formula.
export const SMITE_BREAKPOINTS: Readonly<Record<string, readonly { ias: number; frames: number }[]>> = {
  crs: [{ ias: 0, frames: 11 }, { ias: 11, frames: 10 }, { ias: 26, frames: 9 }, { ias: 48, frames: 8 }, { ias: 86, frames: 7 }, { ias: 180, frames: 6 }],
  "7cr": [{ ias: 0, frames: 9 }, { ias: 5, frames: 8 }, { ias: 24, frames: 7 }, { ias: 65, frames: 6 }],
  whm: [{ ias: 0, frames: 15 }, { ias: 2, frames: 14 }, { ias: 7, frames: 13 }, { ias: 15, frames: 12 }, { ias: 24, frames: 11 }, { ias: 40, frames: 10 }, { ias: 63, frames: 9 }, { ias: 99, frames: 8 }, { ias: 168, frames: 7 }, { ias: 395, frames: 6 }],
};

export interface SmiteGoldenRow { IAS: number; EIAS: number; expectedFrames: number; breakpoint: number; }

export const SMITE_GOLDEN_DATASETS = Object.entries(SMITE_BREAKPOINTS).map(([weaponCode, breakpoints]) => {
  const WSM = ({ crs: 0, "7cr": -30, whm: 20 } as const)[weaponCode as "crs" | "7cr" | "whm"];
  let index = 0;
  const rows: SmiteGoldenRow[] = [];
  const max = SMITE_MAX_IAS_BY_WEAPON[weaponCode];
  for (let IAS = 0; IAS <= max; IAS++) {
    while (index + 1 < breakpoints.length && breakpoints[index + 1].ias <= IAS) index++;
    const itemEffectiveIAS = Math.floor((120 * IAS) / (120 + IAS));
    rows.push({ IAS, EIAS: Math.max(-85, Math.min(75, itemEffectiveIAS - WSM)), expectedFrames: breakpoints[index].frames, breakpoint: breakpoints[index].ias });
  }
  return { gameBuild: "3.3.93847", skillId: 97, animationMode: "S1" as const, weaponCode, WSM, IASRange: { min: 0, max }, evidenceSource: "D2X Smite published breakpoint table; cross-checked with Tradia D2R build 93847 and CASC source records", evidenceStatus: "VERIFIED" as const, rows };
});

const rowMap = new Map(SMITE_GOLDEN_DATASETS.flatMap((dataset) => dataset.rows.map((row) => [`${dataset.weaponCode}:${row.IAS}`, row] as const)));

export function getSmiteGoldenRow(weaponCode: string, IAS: number): SmiteGoldenRow | null {
  return rowMap.get(`${weaponCode}:${IAS}`) ?? null;
}

export function getSmiteBreakpointDetails(weaponCode: string, IAS: number) {
  const row = getSmiteGoldenRow(weaponCode, IAS);
  if (!row) return null;
  const breakpoints = SMITE_BREAKPOINTS[weaponCode];
  const index = breakpoints.findIndex((item) => item.ias === row.breakpoint);
  const nextBreakpoint = breakpoints[index + 1]?.ias ?? null;
  return { currentBreakpoint: row.breakpoint, nextBreakpoint, requiredAdditionalIAS: nextBreakpoint === null ? null : nextBreakpoint - IAS };
}
