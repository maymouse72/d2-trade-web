/**
 * IAS-6 reference-based Double Swing timing model.
 *
 * Scope is deliberately narrow: D2R build 3.3.93847, human Barbarian,
 * Phase Blade/Phase Blade or Phase Blade primary + War Hammer secondary;
 * only primary-weapon IAS varies, with secondary weapon IAS, gear IAS, aura,
 * slow, and Frenzy state fixed at zero.
 *
 * The result is one aggregate 2-hit sequence duration. It does not claim
 * first/second hand event timing or event order.
 */

export type DoubleSwingReferenceWeapon = "7cr" | "whm";
export type DoubleSwingReferenceStatus = "REFERENCE_BASED" | "CONFLICTED" | "UNSUPPORTED" | "INVALID_INPUT";

export interface BarbarianDoubleSwingReferenceInput {
  primaryWeapon: DoubleSwingReferenceWeapon;
  secondaryWeapon: DoubleSwingReferenceWeapon;
  /** IAS on the primary weapon, the variable used by the reference table. */
  primaryWeaponIAS: number;
  /** C4 comparison held both values at zero; nonzero input is outside scope. */
  secondaryWeaponIAS?: number;
  /** C4 comparison held both values at zero; nonzero input is outside scope. */
  gearIAS?: number;
  /** External SIAS (e.g. Fanaticism) was not part of the reference matrix. */
  externalSIAS?: number;
}

export interface BarbarianDoubleSwingReferenceResult {
  status: DoubleSwingReferenceStatus;
  sequenceFrames: number | null;
  attacksPerSecond: number | null;
  effectiveIAS: number | null;
  effectiveWSM: number | null;
  eventOrder: null;
  reason: string;
  source: readonly string[];
}

const WSM: Readonly<Record<DoubleSwingReferenceWeapon, number>> = {
  "7cr": -30,
  whm: 20,
};

const REFERENCE_SOURCE = [
  "https://d2r-tools.com/ias/calculations (D2R 3.3.93847; dual wield WSM/IEIAS averaging, Double Swing net SIAS +20, sequence length 17; site states it is based on Warren1001)",
  "https://tradia.me/en/diablo2/weapon_speed_calculator (D2R build 93847; dual-wield table varies primary IAS while holding secondary IAS constant)",
  "https://warren1001.github.io/IAS_Calculator/ (D2R 3.3 reference rows; used only as a comparison, not copied)",
  "https://github.com/Warren1001/IAS_Calculator/issues/9 (sequence/action-frame questions; timing/event sequence remains outside this module)",
] as const;

function empty(
  status: DoubleSwingReferenceStatus,
  reason: string,
): BarbarianDoubleSwingReferenceResult {
  return {
    status,
    sequenceFrames: null,
    attacksPerSecond: null,
    effectiveIAS: null,
    effectiveWSM: null,
    eventOrder: null,
    reason,
    source: REFERENCE_SOURCE,
  };
}

function isWholeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && Number.isFinite(value);
}

/**
 * Calculates an aggregate two-hit Double Swing sequence length.
 *
 * Source model: effective WSM and per-hand item EIAS are averaged; the
 * documented +20 Double Swing net attack-speed modifier is then applied;
 * the 17-frame sequence uses offset 0 (no standard-attack -1). The formula
 * reproduces all seven directly recorded C4 breakpoint samples in the
 * supported ordered weapon cases. Since the supporting secondary formula
 * is a Warren-derived calculator rather than independent game instrumentation,
 * the result is explicitly REFERENCE_BASED.
 */
export function calculateBarbarianDoubleSwingReference(
  input: BarbarianDoubleSwingReferenceInput,
): BarbarianDoubleSwingReferenceResult {
  if (!input || !(input.primaryWeapon in WSM) || !(input.secondaryWeapon in WSM)) {
    return empty("INVALID_INPUT", "Double Swing requires recognized weapon codes.");
  }

  const primaryIAS = input.primaryWeaponIAS;
  const secondaryIAS = input.secondaryWeaponIAS ?? 0;
  const gearIAS = input.gearIAS ?? 0;
  const externalSIAS = input.externalSIAS ?? 0;
  if (![primaryIAS, secondaryIAS, gearIAS, externalSIAS].every(isWholeNumber) ||
      [primaryIAS, secondaryIAS, gearIAS, externalSIAS].some((value) => value < 0 || value > 456)) {
    return empty("INVALID_INPUT", "IAS and SIAS inputs must be integers from 0 through 456.");
  }

  if (input.primaryWeapon !== "7cr" || (input.secondaryWeapon !== "7cr" && input.secondaryWeapon !== "whm")) {
    return empty("CONFLICTED", "Only Phase Blade/Phase Blade and primary Phase Blade + secondary War Hammer reference cases are recorded; other hand orders are not supported.");
  }
  if (secondaryIAS !== 0 || gearIAS !== 0 || externalSIAS !== 0) {
    return empty("CONFLICTED", "The recorded Double Swing matrix varies primary weapon IAS only; secondary IAS, gear IAS, and external speed modifiers were not normalized here.");
  }

  const effectiveWSM = (WSM[input.primaryWeapon] + WSM[input.secondaryWeapon]) / 2;
  const primaryIEIAS = Math.floor((120 * primaryIAS) / (120 + primaryIAS));
  const secondaryIEIAS = 0;
  const averageIEIAS = (primaryIEIAS + secondaryIEIAS) / 2;

  // +20 is the net sequence speed modifier reported for Double Swing:
  // +50 skill attack speed combined with the player's -30 sequence adjustment.
  const effectiveIAS = Math.max(-85, Math.min(75, Math.floor(20 - effectiveWSM + averageIEIAS)));
  const speedIncrease = Math.floor((256 * (100 + effectiveIAS)) / 100);
  const sequenceFrames = Math.ceil((256 * 17) / speedIncrease);

  return {
    status: "REFERENCE_BASED",
    sequenceFrames,
    attacksPerSecond: 25 / sequenceFrames,
    effectiveIAS,
    effectiveWSM,
    eventOrder: null,
    reason: "외부 IAS 계산기 기준의 2타 합산 시퀀스 참고값입니다. 좌우 손별 명중 프레임과 순서는 제공하지 않습니다.",
    source: REFERENCE_SOURCE,
  };
}
