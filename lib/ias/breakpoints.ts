import goldenDataset from "./data/paladin-crs-a1-golden.json" with { type: "json" };
import type { BreakpointDetails } from "./types.ts";

export interface GoldenRow {
  ias: number;
  fullAnimationFrames: number;
}

export const GOLDEN_ROWS = goldenDataset.rows as GoldenRow[];

export function getGoldenFrameCount(totalIAS: number): number | null {
  if (!Number.isInteger(totalIAS) || totalIAS < 0 || totalIAS > 200) return null;
  return GOLDEN_ROWS.find((row) => row.ias === totalIAS)?.fullAnimationFrames ?? null;
}

export function deriveGoldenBreakpoints(): number[] {
  const sorted = [...GOLDEN_ROWS].sort((a, b) => a.ias - b.ias);
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

export function getBreakpointDetails(totalIAS: number): BreakpointDetails | null {
  if (getGoldenFrameCount(totalIAS) === null) return null;

  const breakpoints = deriveGoldenBreakpoints();
  const currentBreakpoint = [...breakpoints].reverse().find((breakpoint) => breakpoint <= totalIAS);
  if (currentBreakpoint === undefined) return null;

  const nextBreakpoint = breakpoints.find((breakpoint) => breakpoint > totalIAS) ?? null;
  return {
    currentBreakpoint,
    nextBreakpoint,
    requiredAdditionalIAS: nextBreakpoint === null ? null : nextBreakpoint - totalIAS,
    fullAnimationFrames: getGoldenFrameCount(totalIAS) as number,
  };
}
