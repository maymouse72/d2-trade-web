/**
 * IAS-6 reference-based Druid wereform standard-attack model.
 *
 * This is intentionally isolated from the production support policy until a
 * class/weapon-specific Human A1 profile is connected by a later integration.
 * It accepts that profile as input instead of guessing Druid animation data.
 *
 * Sources:
 * - Blizzard D2R Patch 2.4: both wereforms use the new attack-speed
 *   calculation; Werewolf/Werebear cap is +150%; Maul grants attack-speed
 *   bonuses. https://news.blizzard.com/en-us/article/23788293/diablo-ii-resurrected-patch-2-4-ladder-now-live
 * - D2R.org Druid breakpoints, build 3.3.93847: Human Druid staff/polearm A1
 *   profile is 17 FPD, speed 256; WSM 0 has 16 frames at 0 IAS and 15 at 8 IAS.
 *   https://d2r.org/tools/breakpoints/druid
 * - D2R Tools IAS calculation reference: wereform FPD ratios, EIAS bounds,
 *   standard speed and frame equations. This is a public calculator reference,
 *   not Blizzard source. https://d2r-tools.com/ias/calculations
 */

export type DruidWereform = "WEREWOLF" | "WEREBEAR";

export interface DruidHumanA1Profile {
  /** Frames per direction for the same Druid weapon animation in Human form. */
  framesPerDirection: number;
  /** Animation speed from the Human A1 profile, normally 256. */
  animationSpeed: number;
  /** Animation starting frame for the Human A1 weapon profile. */
  startingFrame: number;
}

export interface DruidShapeshiftReferenceInput {
  form: DruidWereform;
  /** Weapon WSM from the selected base, not an item tooltip's attack speed. */
  weaponSpeedModifier: number;
  /** Combined weapon and off-weapon IAS, before diminishing returns. */
  totalIAS: number;
  /** Druid's same-weapon Human A1 profile; missing data is never guessed. */
  humanA1Profile: DruidHumanA1Profile;
  /** Additive skill IAS (e.g. Werewolf) before the wereform EIAS clamp. */
  skillIAS?: number;
  /** Other additive IAS effects (e.g. Fanaticism) before the EIAS clamp. */
  buffIAS?: number;
  /** Attack phase FPD override; speed reduction still uses the form's FPD. */
  attackFramesPerDirection?: number;
}

export interface DruidShapeshiftReferenceResult {
  status: "REFERENCE_BASED" | "UNSUPPORTED" | "INVALID_INPUT";
  reason: string;
  framesPerAttack: number | null;
  attacksPerSecond: number | null;
  effectiveIAS: number | null;
  effectiveIASAfterModifiers: number | null;
  speedIncrease: number | null;
  wereformFramesPerDirection: number | null;
  evidence: readonly string[];
}

export interface DruidFurySequenceResult extends DruidShapeshiftReferenceResult {
  skill: "FURY";
  hitFrameIntervals: readonly number[] | null;
  totalSequenceFrames: number | null;
}

const REFERENCE_URLS = [
  "https://news.blizzard.com/en-us/article/23788293/diablo-ii-resurrected-patch-2-4-ladder-now-live",
  "https://d2r.org/tools/breakpoints/druid",
  "https://d2r-tools.com/ias/calculations",
] as const;

const WEREFORM_FPD: Readonly<Record<DruidWereform, number>> = {
  WEREWOLF: 13,
  WEREBEAR: 12,
};

// D2R.org build 3.3.93847 Werewolf skill table, levels 1–60.
const WEREWOLF_SIAS = [
  20, 28, 35, 40, 45, 48, 51, 53, 56, 57, 59, 61, 62, 63, 64, 66, 66, 67, 68, 68,
  69, 70, 70, 71, 71, 72, 73, 73, 73, 73, 74, 74, 75, 75, 75, 75, 75, 76, 76, 76,
  76, 77, 77, 77, 77, 77, 77, 77, 78, 78, 78, 78, 78, 79, 79, 79, 79, 79, 79, 80,
] as const;

export function getDruidWerewolfSIAS(skillLevel: number): number | null {
  return Number.isInteger(skillLevel) && skillLevel >= 1 && skillLevel <= WEREWOLF_SIAS.length
    ? WEREWOLF_SIAS[skillLevel - 1]
    : null;
}

/** Maul starts with three charges and gains one at even skill levels, to a cap of 13. */
export function getDruidMaulMaxCharges(skillLevel: number): number | null {
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 60) return null;
  return Math.min(13, 3 + Math.floor(skillLevel / 2));
}

/** Maul grants 3 SIAS for each active charge. */
export function getDruidMaulSIAS(skillLevel: number, charges: number): number | null {
  const maxCharges = getDruidMaulMaxCharges(skillLevel);
  return maxCharges === null || !Number.isInteger(charges) || charges < 0 || charges > maxCharges ? null : charges * 3;
}

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

function invalid(reason: string): DruidShapeshiftReferenceResult {
  return {
    status: "INVALID_INPUT", reason, framesPerAttack: null, attacksPerSecond: null,
    effectiveIAS: null, effectiveIASAfterModifiers: null, speedIncrease: null,
    wereformFramesPerDirection: null, evidence: REFERENCE_URLS,
  };
}

/**
 * Calculates a reference-based standard attack FPA for a Druid wereform.
 * Does not calculate Fury/Rabies/Feral Rage hit sequences, Maul charge state,
 * dual wielding, Wereform conversion itself, or unsupported animation profiles.
 */
export function calculateDruidShapeshiftStandardAttack(
  input: DruidShapeshiftReferenceInput,
): DruidShapeshiftReferenceResult {
  if (input.form !== "WEREWOLF" && input.form !== "WEREBEAR") {
    return invalid("변신 형태는 WEREWOLF 또는 WEREBEAR여야 합니다.");
  }
  if (!isIntegerInRange(input.totalIAS, 0, 456)) {
    return invalid("총 IAS는 0~456 사이의 정수여야 합니다.");
  }
  if (!isIntegerInRange(input.weaponSpeedModifier, -60, 60)) {
    return invalid("무기 WSM은 카탈로그 범위인 -60~60 사이의 정수여야 합니다.");
  }
  const profile = input.humanA1Profile;
  if (!profile || !isIntegerInRange(profile.framesPerDirection, 1, 100)
    || !isIntegerInRange(profile.animationSpeed, 1, 1024)
    || !isIntegerInRange(profile.startingFrame, 0, profile.framesPerDirection - 1)) {
    return invalid("동일 무기 기준 Human A1 애니메이션 프로필이 필요합니다.");
  }
  const skillIAS = input.skillIAS ?? 0;
  const buffIAS = input.buffIAS ?? 0;
  const attackFramesPerDirection = input.attackFramesPerDirection ?? WEREFORM_FPD[input.form];
  if (!isIntegerInRange(skillIAS, -200, 200) || !isIntegerInRange(buffIAS, -200, 200)) {
    return invalid("스킬 IAS와 기타 IAS 보정은 각각 -200~200 정수여야 합니다.");
  }
  if (!isIntegerInRange(attackFramesPerDirection, 1, 100)) {
    return invalid("공격별 wereform FPD는 1~100 사이의 정수여야 합니다.");
  }

  const effectiveIAS = Math.floor(120 * input.totalIAS / (120 + input.totalIAS));
  const eiasRaw = effectiveIAS + skillIAS + buffIAS - input.weaponSpeedModifier;
  const effectiveIASAfterModifiers = Math.max(-85, Math.min(150, eiasRaw));
  const wereformFramesPerDirection = WEREFORM_FPD[input.form];
  const speedIncrease = Math.floor(
    (profile.animationSpeed + Math.floor(profile.animationSpeed * effectiveIASAfterModifiers / 100))
      * wereformFramesPerDirection / profile.framesPerDirection,
  );
  if (speedIncrease <= 0) {
    return invalid("입력 조건에서 양수 공격 애니메이션 속도를 산출할 수 없습니다.");
  }

  // Wereform uses its own FPD in the numerator and the standard-attack -1 offset.
  const framesPerAttack = Math.ceil(256 * attackFramesPerDirection / speedIncrease) - 1;
  if (!Number.isFinite(framesPerAttack) || framesPerAttack < 1) {
    return invalid("입력 조건에서 유효한 공격 프레임을 산출할 수 없습니다.");
  }
  return {
    status: "REFERENCE_BASED",
    reason: `${input.form} 공격 · wereform 공격 FPD ${attackFramesPerDirection}, 동일 무기 Human A1 프로필 기반 참고 계산입니다.`,
    framesPerAttack,
    attacksPerSecond: 25 / framesPerAttack,
    effectiveIAS,
    effectiveIASAfterModifiers,
    speedIncrease,
    wereformFramesPerDirection,
    evidence: REFERENCE_URLS,
  };
}

/**
 * Calculates the five-hit Werewolf Fury frame sequence from the published
 * rollback model. This is a reference-based sequence, not a damage/accuracy
 * or in-game hit-confirmation model. Werebear Fury is explicitly unsupported.
 */
export function calculateDruidWerewolfFurySequence(
  input: Omit<DruidShapeshiftReferenceInput, "form"> & { form: DruidWereform },
): DruidFurySequenceResult {
  if (input.form !== "WEREWOLF") {
    return {
      skill: "FURY", status: "UNSUPPORTED",
      reason: "Fury 시퀀스는 늑대인간 형태만 지원합니다.",
      framesPerAttack: null, attacksPerSecond: null,
      effectiveIAS: null, effectiveIASAfterModifiers: null, speedIncrease: null,
      wereformFramesPerDirection: null, hitFrameIntervals: null,
      totalSequenceFrames: null, evidence: REFERENCE_URLS,
    };
  }

  const base = calculateDruidShapeshiftStandardAttack({ ...input, form: "WEREWOLF" });
  if (base.status !== "REFERENCE_BASED" || base.speedIncrease === null) {
    return {
      ...base, skill: "FURY", hitFrameIntervals: null, totalSequenceFrames: null,
    };
  }

  const speedIncrease = base.speedIncrease;
  const firstPhaseFrames = 7;
  const finalPhaseFrames = 13;
  const rollbackPercent = 70;
  // Warren1001 v1.2.6 applies the standard -1 offset to Fury's first hit,
  // then uses rollback intervals and a -1 offset on the sequence's final hit.
  const firstHit = Math.ceil(
    256 * (firstPhaseFrames - input.humanA1Profile.startingFrame) / speedIncrease,
  ) - 1;
  const hitFrameIntervals = [firstHit];
  const rollbacks = [input.humanA1Profile.startingFrame];

  for (let index = 0; index < 3; index += 1) {
    const previousRollback = rollbacks[index];
    const previousHitLength = hitFrameIntervals[index];
    const truncatedAnimationFrames = Math.trunc(
      (256 * previousRollback + speedIncrease * previousHitLength) / 256,
    );
    const rollback = Math.trunc(truncatedAnimationFrames * (100 - rollbackPercent) / 100);
    rollbacks.push(rollback);
    hitFrameIntervals.push(Math.ceil(
      256 * (firstPhaseFrames - rollback) / speedIncrease,
    ));
  }

  const lastRollback = rollbacks[rollbacks.length - 1];
  hitFrameIntervals.push(Math.ceil(
    256 * (finalPhaseFrames - lastRollback) / speedIncrease,
  ) - 1);
  const totalSequenceFrames = hitFrameIntervals.reduce((sum, frames) => sum + frames, 0);
  return {
    ...base,
    skill: "FURY",
    reason: "Werewolf Fury 5-hit rollback sequence · Warren1001/D2R Tools 공개 프레임 모델 기반 참고값",
    framesPerAttack: null,
    attacksPerSecond: totalSequenceFrames > 0 ? 5 * 25 / totalSequenceFrames : null,
    hitFrameIntervals,
    totalSequenceFrames,
  };
}

/** Returns the public diminishing-return IAS term used by the model. */
export function druidReferenceEffectiveIAS(totalIAS: number): number | null {
  if (!isIntegerInRange(totalIAS, 0, 456)) return null;
  return Math.floor(120 * totalIAS / (120 + totalIAS));
}

export function getDruidShapeshiftBreakpointRows(input: Omit<DruidShapeshiftReferenceInput, "totalIAS"> & { maxIAS: number }) {
  if (!isIntegerInRange(input.maxIAS, 0, 456)) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= input.maxIAS; ias++) {
    const result = calculateDruidShapeshiftStandardAttack({ ...input, totalIAS: ias });
    if (result.status !== "REFERENCE_BASED" || result.framesPerAttack === null) return [];
    if (result.framesPerAttack !== previous) rows.push({ ias, fullAnimationFrames: result.framesPerAttack });
    previous = result.framesPerAttack;
  }
  return rows;
}
