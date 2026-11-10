/** Reference-based Assassin trap-laying timing model. */

export interface AssassinTrapLayingInput {
  weaponSpeedModifier: number;
  totalIAS: number;
  burstOfSpeedLevel: number;
}

export interface AssassinTrapLayingResult {
  status: "REFERENCE_BASED" | "INVALID_INPUT";
  reason: string;
  framesPerTrap: number | null;
  itemEffectiveIAS: number | null;
  effectiveIAS: number | null;
  speedIncrease: number | null;
}

export function assassinBurstOfSpeedSIAS(level: number): number | null {
  if (!Number.isInteger(level) || level < 0 || level > 60) return null;
  if (level === 0) return 0;
  const diminishing = Math.floor(110 * level / (level + 6));
  return Math.min(60, 15 + Math.floor(45 * diminishing / 100));
}

export function calculateAssassinTrapLaying(input: AssassinTrapLayingInput): AssassinTrapLayingResult {
  if (!Number.isInteger(input.weaponSpeedModifier) || input.weaponSpeedModifier < -60 || input.weaponSpeedModifier > 60
    || !Number.isInteger(input.totalIAS) || input.totalIAS < 0 || input.totalIAS > 456) {
    return { status: "INVALID_INPUT", reason: "WSM은 -60~60, 총 IAS는 0~456의 정수여야 합니다.", framesPerTrap: null, itemEffectiveIAS: null, effectiveIAS: null, speedIncrease: null };
  }
  const burstSIAS = assassinBurstOfSpeedSIAS(input.burstOfSpeedLevel);
  if (burstSIAS === null) {
    return { status: "INVALID_INPUT", reason: "폭발적인 속도 레벨은 0~60이어야 합니다.", framesPerTrap: null, itemEffectiveIAS: null, effectiveIAS: null, speedIncrease: null };
  }
  const itemEffectiveIAS = Math.floor(120 * input.totalIAS / (120 + input.totalIAS));
  const effectiveIAS = Math.max(-85, Math.min(75, itemEffectiveIAS + burstSIAS - input.weaponSpeedModifier));
  // Trap laying uses 8 FPD and an animation speed of 128 (half the usual rate).
  const speedIncrease = Math.floor(128 * (100 + effectiveIAS) / 100);
  const framesPerTrap = speedIncrease > 0 ? Math.ceil(8 * 256 / speedIncrease) - 1 : null;
  return {
    status: "REFERENCE_BASED",
    reason: "암살자 함정 설치 · 8 FPD, 애니메이션 속도 128, 인간형 EIAS 한계 기반 공개 기준 참고값입니다.",
    framesPerTrap, itemEffectiveIAS, effectiveIAS, speedIncrease,
  };
}

export function getAssassinTrapLayingBreakpointRows(input: Omit<AssassinTrapLayingInput, "totalIAS"> & { maxIAS: number }) {
  if (!Number.isInteger(input.maxIAS) || input.maxIAS < 0 || input.maxIAS > 456) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= input.maxIAS; ias += 1) {
    const result = calculateAssassinTrapLaying({ ...input, totalIAS: ias });
    if (result.status !== "REFERENCE_BASED" || result.framesPerTrap === null) return [];
    if (result.framesPerTrap !== previous) rows.push({ ias, fullAnimationFrames: result.framesPerTrap });
    previous = result.framesPerTrap;
  }
  return rows;
}
