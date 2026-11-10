/** Reference-based Immolation Arrow repeated-fire cadence for D2R local delay. */
export const IMMOLATION_ARROW_LOCAL_DELAY_FRAMES = 15;

export interface ImmolationCadenceInput {
  totalIAS: number;
  weaponSpeedModifier: number;
  actionFrame: number;
  animationSpeed?: number;
  skillIAS?: number;
  buffIAS?: number;
  debuffIAS?: number;
  fanaticismSIAS?: number;
}

export interface ImmolationCadence {
  actionFrame: number;
  localDelayFrames: number;
  intervalFrames: number;
  attacksPerSecond: number;
  effectiveIAS: number;
}

export function calculateAmazonImmolationCadence(input: ImmolationCadenceInput): ImmolationCadence | null {
  const values = [input.totalIAS, input.weaponSpeedModifier, input.actionFrame, input.animationSpeed ?? 256,
    input.skillIAS ?? 0, input.buffIAS ?? 0, input.debuffIAS ?? 0, input.fanaticismSIAS ?? 0];
  if (values.some((value) => !Number.isFinite(value)) || input.totalIAS < 0 || input.totalIAS > 456 || input.actionFrame <= 0) return null;
  const itemEffectiveIAS = Math.floor((120 * input.totalIAS) / (120 + input.totalIAS));
  const rawEIAS = itemEffectiveIAS + (input.skillIAS ?? 0) + (input.buffIAS ?? 0) - (input.debuffIAS ?? 0)
    + (input.fanaticismSIAS ?? 0) - input.weaponSpeedModifier;
  const effectiveIAS = Math.max(-85, Math.min(75, rawEIAS));
  const speedIncrease = Math.floor(((input.animationSpeed ?? 256) * (100 + effectiveIAS)) / 100);
  if (speedIncrease <= 0) return null;
  // Action flags are reached earlier with faster animation speed. The local
  // delay itself is fixed; D2R's interval is action frame plus local delay.
  const actionFrame = Math.ceil((input.actionFrame * 256) / speedIncrease);
  const intervalFrames = actionFrame + IMMOLATION_ARROW_LOCAL_DELAY_FRAMES;
  return { actionFrame, localDelayFrames: IMMOLATION_ARROW_LOCAL_DELAY_FRAMES, intervalFrames,
    attacksPerSecond: 25 / intervalFrames, effectiveIAS };
}

export function getAmazonImmolationCadenceBreakpointRows(input: Omit<ImmolationCadenceInput, "totalIAS">, maxIAS: number) {
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= maxIAS; ias++) {
    const result = calculateAmazonImmolationCadence({ ...input, totalIAS: ias });
    if (!result) return [];
    if (result.intervalFrames !== previous) rows.push({ ias, fullAnimationFrames: result.intervalFrames });
    previous = result.intervalFrames;
  }
  return rows;
}
