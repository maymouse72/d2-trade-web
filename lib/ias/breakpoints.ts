import goldenDataset from "./data/paladin-crs-a1-golden.json" with { type: "json" };
import phaseBladeDataset from "./data/paladin-7cr-a1-golden.json" with { type: "json" };
import warHammerDataset from "./data/paladin-whm-a1-golden.json" with { type: "json" };
import type { BreakpointDetails } from "./types.ts";
import { IAS_WEAPONS } from "./weapons.ts";

export interface GoldenRow {
  ias: number;
  fullAnimationFrames: number;
}

export const GOLDEN_ROWS = goldenDataset.rows as GoldenRow[];
const GOLDEN_DATASETS: Readonly<Record<string, GoldenRow[]>> = {
  crs: GOLDEN_ROWS,
  "7cr": phaseBladeDataset.rows as GoldenRow[],
  whm: warHammerDataset.rows as GoldenRow[],
};

export function getGoldenFrameCount(weaponCode: string, totalIAS: number): number | null {
  const weapon = IAS_WEAPONS[weaponCode];
  if (!weapon || !weapon.verified || !Number.isInteger(totalIAS) || totalIAS < weapon.minIAS || totalIAS > weapon.maxIAS) return null;
  return GOLDEN_DATASETS[weaponCode]?.find((row) => row.ias === totalIAS)?.fullAnimationFrames ?? null;
}

export function deriveGoldenBreakpoints(weaponCode = "crs"): number[] {
  const sorted = [...(GOLDEN_DATASETS[weaponCode] ?? [])].sort((a, b) => a.ias - b.ias);
  const transitions: number[] = [];
  let previousFrames: number | null = null;

  for (const row of sorted) {
    if (previousFrames === null || row.fullAnimationFrames < previousFrames) {
      transitions.push(row.ias);
    }
    previousFrames = row.fullAnimationFrames;
  }

  return transitions;
}

export function getBreakpointDetails(totalIAS: number, weaponCode = "crs"): BreakpointDetails | null {
  if (getGoldenFrameCount(weaponCode, totalIAS) === null) return null;

  const breakpoints = deriveGoldenBreakpoints(weaponCode);
  const currentBreakpoint = [...breakpoints].reverse().find((breakpoint) => breakpoint <= totalIAS);
  if (currentBreakpoint === undefined) return null;

  const nextBreakpoint = breakpoints.find((breakpoint) => breakpoint > totalIAS) ?? null;
  return {
    currentBreakpoint,
    nextBreakpoint,
    requiredAdditionalIAS: nextBreakpoint === null ? null : nextBreakpoint - totalIAS,
    fullAnimationFrames: getGoldenFrameCount(weaponCode, totalIAS) as number,
  };
}
