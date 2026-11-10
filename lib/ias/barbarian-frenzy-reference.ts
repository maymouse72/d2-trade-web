/**
 * IAS-6 bounded Barbarian Frenzy sequence model.
 *
 * Inputs are two one-handed weapon profiles and the currently active Frenzy
 * buff's SIAS. This module intentionally does not infer charge count or the
 * buff curve from character skill level. Output is the aggregate two-swing
 * sequence duration, not per-hand hit timestamps.
 */

export interface BarbarianFrenzyWeaponInput {
  weaponSpeedModifier: number;
  weaponIAS: number;
}

export interface BarbarianFrenzyReferenceInput {
  primaryWeapon: BarbarianFrenzyWeaponInput;
  secondaryWeapon: BarbarianFrenzyWeaponInput;
  /** IAS from non-weapon equipment, added to each hand before IEIAS conversion. */
  gearIAS: number;
  /** Current Frenzy buff SIAS, from 0 through the published 50% ceiling. */
  frenzyBuffSIAS: number;
}

export interface BarbarianFrenzyReferenceResult {
  status: "REFERENCE_BASED" | "UNSUPPORTED" | "INVALID_INPUT";
  reason: string;
  sequenceFrames: number | null;
  swingsPerSecond: number | null;
  effectiveIAS: number | null;
  effectiveWSM: number | null;
  handEffectiveIAS: readonly [number, number] | null;
  source: readonly string[];
}

const SOURCES = [
  "https://d2r.org/mechanics/frenzy (D2R 3.3.93847; Frenzy uses two weapons in a sequence; buff SIAS rises per successful hit to the level-dependent ceiling)",
  "https://d2r.org/tools/breakpoints/barbarian (D2R 3.3.93847 Barbarian one-handed animation profile and validated frame equation)",
  "https://d2r-tools.com/ias/calculations (dual-wield WSM/IEIAS averaging, 17-frame Frenzy sequence, player Frenzy -30 SIAS adjustment)",
] as const;

export interface BarbarianFrenzyBreakpointRow {
  gearIAS: number;
  sequenceFrames: number;
}

/** Frenzy's published level-dependent maximum SIAS (unbuffed state is 0). */
export function getBarbarianFrenzyMaxSIAS(skillLevel: number): number | null {
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 30) return null;
  const curve = Math.floor(110 * skillLevel / (skillLevel + 6));
  return Math.min(50, Math.floor(50 * curve / 100));
}

function isIntegerIn(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && Number.isFinite(value)
    && value >= min && value <= max;
}

function result(status: BarbarianFrenzyReferenceResult["status"], reason: string): BarbarianFrenzyReferenceResult {
  return {
    status, reason, sequenceFrames: null, swingsPerSecond: null,
    effectiveIAS: null, effectiveWSM: null, handEffectiveIAS: null, source: SOURCES,
  };
}

/** Calculates the two-swing 17-frame Frenzy sequence using published D2R formulas. */
export function calculateBarbarianFrenzyReference(
  input: BarbarianFrenzyReferenceInput,
): BarbarianFrenzyReferenceResult {
  if (!input || !input.primaryWeapon || !input.secondaryWeapon) {
    return result("INVALID_INPUT", "Frenzy에는 양손의 무기 프로필이 필요합니다.");
  }
  for (const weapon of [input.primaryWeapon, input.secondaryWeapon]) {
    if (!isIntegerIn(weapon.weaponSpeedModifier, -60, 60)
      || !isIntegerIn(weapon.weaponIAS, 0, 120)) {
      return result("INVALID_INPUT", "각 무기의 WSM은 -60~60, 무기 IAS는 0~120 정수여야 합니다.");
    }
  }
  if (!isIntegerIn(input.gearIAS, 0, 456) || !isIntegerIn(input.frenzyBuffSIAS, 0, 50)) {
    return result("INVALID_INPUT", "장비 IAS는 0~456, 현재 Frenzy SIAS는 0~50 정수여야 합니다.");
  }

  const handEffectiveIAS = [input.primaryWeapon, input.secondaryWeapon].map((weapon) => {
    const combinedIAS = input.gearIAS + weapon.weaponIAS;
    return Math.floor(120 * combinedIAS / (120 + combinedIAS));
  }) as [number, number];
  const effectiveWSM = (input.primaryWeapon.weaponSpeedModifier
    + input.secondaryWeapon.weaponSpeedModifier) / 2;
  // Frenzy's player sequence applies -30 SIAS; do not fold this into the
  // externally specified current charge-buff SIAS.
  const effectiveIAS = Math.max(-85, Math.min(75, Math.floor(
    input.frenzyBuffSIAS - 30 - effectiveWSM
      + (handEffectiveIAS[0] + handEffectiveIAS[1]) / 2,
  )));
  const speedIncrease = Math.floor(256 * (100 + effectiveIAS) / 100);
  if (speedIncrease <= 0) return result("UNSUPPORTED", "계산된 시퀀스 속도가 유효하지 않습니다.");
  const sequenceFrames = Math.ceil(256 * 17 / speedIncrease);
  return {
    status: "REFERENCE_BASED",
    reason: "야만용사 Frenzy 양손 17프레임 시퀀스 참고값입니다. 현재 충전 SIAS를 입력받으며 개별 타격 순서·충전 진행은 계산하지 않습니다.",
    sequenceFrames,
    swingsPerSecond: 2 * 25 / sequenceFrames,
    effectiveIAS,
    effectiveWSM,
    handEffectiveIAS,
    source: SOURCES,
  };
}

/** Generates gear-IAS breakpoints for fixed weapon IAS and a fixed Frenzy buff state. */
export function getBarbarianFrenzyBreakpointRows(
  input: Omit<BarbarianFrenzyReferenceInput, "gearIAS">,
  maxGearIAS = 456,
): BarbarianFrenzyBreakpointRow[] {
  if (!Number.isInteger(maxGearIAS) || maxGearIAS < 0 || maxGearIAS > 456) return [];
  const rows: BarbarianFrenzyBreakpointRow[] = [];
  let previous = -1;
  for (let gearIAS = 0; gearIAS <= maxGearIAS; gearIAS++) {
    const result = calculateBarbarianFrenzyReference({ ...input, gearIAS });
    if (result.status !== "REFERENCE_BASED" || result.sequenceFrames === null) break;
    if (result.sequenceFrames !== previous) rows.push({ gearIAS, sequenceFrames: result.sequenceFrames });
    previous = result.sequenceFrames;
  }
  return rows;
}
