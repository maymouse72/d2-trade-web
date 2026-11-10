/** Reference-based Barbarian Double Throw sequence (D2R Tools IAS rules). */

export type BarbarianDoubleThrowInput = {
  primary: { weaponSpeedModifier: number; weaponIAS: number };
  secondary: { weaponSpeedModifier: number; weaponIAS: number };
  gearIAS: number;
};

export type BarbarianDoubleThrowResult = {
  status: "REFERENCE_BASED" | "INVALID_INPUT";
  frames: number | null;
  effectiveIAS: number | null;
  attacksPerSecond: number | null;
  reason: string;
};

const MAX_GEAR_IAS = 456;
const MAX_WEAPON_IAS = 120;
const SOURCES = "D2R Tools IAS calculations: 12-FPD Double Throw sequence, dual-wield WSM/IEIAS average, player sequence −30 SIAS, sequence offset 0.";

function validInt(value: number, min: number, max: number) {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function calculateBarbarianDoubleThrow(input: BarbarianDoubleThrowInput): BarbarianDoubleThrowResult {
  const { primary, secondary, gearIAS } = input;
  if (!primary || !secondary || !validInt(primary.weaponSpeedModifier, -60, 60)
    || !validInt(secondary.weaponSpeedModifier, -60, 60)
    || !validInt(primary.weaponIAS, 0, MAX_WEAPON_IAS)
    || !validInt(secondary.weaponIAS, 0, MAX_WEAPON_IAS)
    || !validInt(gearIAS, 0, MAX_GEAR_IAS)) {
    return { status: "INVALID_INPUT", frames: null, effectiveIAS: null, attacksPerSecond: null,
      reason: "Double Throw: 각 무기 IAS는 0~120, 장비 IAS는 0~456 정수여야 합니다." };
  }

  const primaryIEIAS = Math.floor(120 * (gearIAS + primary.weaponIAS) / (120 + gearIAS + primary.weaponIAS));
  const secondaryIEIAS = Math.floor(120 * (gearIAS + secondary.weaponIAS) / (120 + gearIAS + secondary.weaponIAS));
  const averageWSM = (primary.weaponSpeedModifier + secondary.weaponSpeedModifier) / 2;
  // D2R Tools truncates the final dual-wield EIAS toward zero before clamping.
  const effectiveIAS = Math.max(-85, Math.min(75, Math.trunc(-30 - averageWSM + (primaryIEIAS + secondaryIEIAS) / 2)));
  const speedIncrease = Math.floor(256 * (100 + effectiveIAS) / 100);
  if (speedIncrease <= 0) return { status: "INVALID_INPUT", frames: null, effectiveIAS, attacksPerSecond: null,
    reason: "Double Throw: 계산된 시퀀스 속도가 유효하지 않습니다." };
  const frames = Math.ceil(256 * 12 / speedIncrease);
  return { status: "REFERENCE_BASED", frames, effectiveIAS, attacksPerSecond: 50 / frames,
    reason: `야만용사 Double Throw 양손 12프레임 시퀀스 참고값입니다. ${SOURCES}` };
}

export function getBarbarianDoubleThrowBreakpointRows(
  weapons: Omit<BarbarianDoubleThrowInput, "gearIAS">,
  maxGearIAS = MAX_GEAR_IAS,
) {
  if (!validInt(maxGearIAS, 0, MAX_GEAR_IAS)) return [];
  const rows: { gearIAS: number; frames: number }[] = [];
  let previous = -1;
  for (let gearIAS = 0; gearIAS <= maxGearIAS; gearIAS++) {
    const result = calculateBarbarianDoubleThrow({ ...weapons, gearIAS });
    if (result.status !== "REFERENCE_BASED" || result.frames === null) break;
    if (result.frames !== previous) rows.push({ gearIAS, frames: result.frames });
    previous = result.frames;
  }
  return rows;
}
