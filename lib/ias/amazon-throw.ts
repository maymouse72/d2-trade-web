import type { IASResult } from "./types.ts";
import type { NormalizedIASInput } from "./support-policy.ts";
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_HARD_MAX } from "./constants.ts";

// Amazon Basin's Amazon attack-speed table: Throw 1HT, target EIAS -> frames.
const THROW_ROWS = [
  { eias: -23, frames: 20 }, { eias: -19, frames: 19 }, { eias: -15, frames: 18 },
  { eias: -10, frames: 17 }, { eias: -5, frames: 16 }, { eias: 0, frames: 15 },
  { eias: 8, frames: 14 }, { eias: 15, frames: 13 }, { eias: 24, frames: 12 },
  { eias: 34, frames: 11 }, { eias: 46, frames: 10 }, { eias: 61, frames: 9 },
] as const;

function eiasFor(totalIAS: number, wsm: number) {
  return Math.max(-85, Math.min(75, Math.floor((120 * totalIAS) / (120 + totalIAS)) - wsm));
}

function framesFor(totalIAS: number, wsm: number) {
  const eias = eiasFor(totalIAS, wsm);
  return THROW_ROWS.filter((row) => row.eias <= eias).at(-1)?.frames ?? 20;
}

export function calculateAmazonThrow(input: NormalizedIASInput, wsm: number): IASResult {
  const frames = framesFor(input.totalIAS, wsm);
  const rows = getAmazonThrowBreakpointRows(input.weaponCode, IAS_HARD_MAX);
  const current = rows.filter((row) => row.ias <= input.totalIAS).at(-1);
  const next = rows.find((row) => row.ias > input.totalIAS);
  return {
    status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: frames,
    totalIAS: input.totalIAS, effectiveIAS: eiasFor(input.totalIAS, wsm), currentBreakpoint: current?.ias ?? 0,
    nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - input.totalIAS : null,
    evidenceVersion: "AMAZON-BASIN-THROW-1HT",
    reason: "Amazon Basin의 Amazon Throw 1HT EIAS/프레임 기준표를 적용한 참고값입니다.",
  };
}

export function getAmazonThrowBreakpointRows(weaponCode: string, maxIAS: number) {
  const weapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === weaponCode);
  const wsm = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? weapon?.wsm;
  if (!weapon || weapon.itemType !== "jave" || wsm === null || wsm === undefined) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= maxIAS; ias++) {
    const frames = framesFor(ias, wsm);
    if (frames !== previous) rows.push({ ias, fullAnimationFrames: frames });
    previous = frames;
  }
  return rows;
}
