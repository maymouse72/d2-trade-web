/**
 * Reference-based Dragon Claw sequence model, intentionally isolated from the
 * production IAS policy until the class registry and UI are integrated.
 *
 * Formula basis: Warren1001 v1.2.6 (D2R 3.3) dual-wield sequence model,
 * cross-checked against TrAdia's D2R build 93847 output. See the parent task
 * report for source URLs and the known disagreement boundaries.
 */

export type AssassinClawDefinition = {
  code: string;
  wsm: number | null;
  weaponIAS: number;
};

export type AssassinDragonClawInput = {
  characterForm: "HUMAN" | string;
  primaryWeapon: AssassinClawDefinition;
  secondaryWeapon: AssassinClawDefinition;
  gearIAS: number;
  burstOfSpeedLevel: number;
};

export type AssassinDragonClawResult =
  | {
      status: "REFERENCE_BASED";
      reasonCode: "REFERENCE_SEQUENCE_MATCH";
      reason: string;
      effectiveItemIAS: number;
      itemEffectiveIAS: number;
      skillIAS: number;
      effectiveIAS: number;
      animationSpeed: number;
      sequenceFrames: number;
      hitCount: 2;
      hitsPerSecond: number;
      hitFrameOffsets: null;
      evidenceVersion: "D2R 3.3.93847 / Warren1001 v1.2.6";
    }
  | {
      status: "INVALID_INPUT" | "CONFLICTED" | "UNSUPPORTED";
      reasonCode: string;
      reason: string;
      sequenceFrames: null;
      hitCount: null;
      hitsPerSecond: null;
      hitFrameOffsets: null;
    };

// WSM values are taken from the repository's D2R 3.3.93847 weapon catalog.
// Null means the base's WSM is not populated and must not be inferred.
const ASSASSIN_CLAW_WSM: Readonly<Record<string, number | null>> = {
  ktr: -10,
  wrb: null,
  axf: 10,
  ces: null,
  clw: -10,
  btl: -20,
  skr: -10,
  "9ar": null,
  "9wb": -10,
  "9xf": 10,
  "9cs": -10,
  "9lw": -20,
  "9tw": -30,
  "9qr": null,
  "7ar": null,
  "7wb": -10,
  "7xf": 10,
  "7cs": -10,
  "7lw": -20,
  "7tw": -30,
  "7qr": null,
};

const MIN_IAS = 0;
const MAX_WEAPON_IAS = 120;
const MAX_TOTAL_IAS = 456;
const SEQUENCE_EIAS_PENALTY = 30;
const DRAGON_CLAW_SEQUENCE_FRAMES = 16;
const MAX_HUMAN_EIAS = 75;
const MIN_HUMAN_EIAS = -85;

function invalid(
  status: "INVALID_INPUT" | "CONFLICTED" | "UNSUPPORTED",
  reasonCode: string,
  reason: string,
): AssassinDragonClawResult {
  return {
    status,
    reasonCode,
    reason,
    sequenceFrames: null,
    hitCount: null,
    hitsPerSecond: null,
    hitFrameOffsets: null,
  };
}

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/** Warren1001's diminishing-return skill IAS curve for Burst of Speed. */
export function assassinBurstOfSpeedSIAS(level: number): number | null {
  if (!isIntegerInRange(level, 0, 60)) return null;
  if (level === 0) return 0;
  const diminishedLevel = Math.floor((110 * level) / (level + 6));
  return 15 + Math.floor((45 * diminishedLevel) / 100);
}

/**
 * Calculates a symmetric two-claw Dragon Claw cycle.
 *
 * The current public references disagree on mixed WSM and unequal weapon IAS
 * handling. To keep this result safe, those cases return CONFLICTED instead
 * of choosing one source's disputed policy. The supported symmetric subset
 * uses the sequence EIAS penalty, 16-frame sequence length, human EIAS cap,
 * animation-speed truncation, then ceiling division with no sequence -1.
 */
export function calculateAssassinDragonClawReference(
  input: AssassinDragonClawInput,
): AssassinDragonClawResult {
  if (!input || typeof input !== "object") {
    return invalid("INVALID_INPUT", "INVALID_INPUT", "입력 객체가 필요합니다.");
  }
  if (input.characterForm !== "HUMAN") {
    return invalid("UNSUPPORTED", "UNSUPPORTED_FORM", "현재 REFERENCE_BASED 범위는 암살자 인간형입니다.");
  }

  const primary = input.primaryWeapon;
  const secondary = input.secondaryWeapon;
  if (!primary || !secondary || typeof primary.code !== "string" || typeof secondary.code !== "string") {
    return invalid("INVALID_INPUT", "INVALID_WEAPONS", "주무기와 보조 클러가 모두 필요합니다.");
  }

  for (const claw of [primary, secondary]) {
    if (!(claw.code in ASSASSIN_CLAW_WSM)) {
      return invalid("UNSUPPORTED", "UNSUPPORTED_WEAPON", `${claw.code}은 등록된 암살자 클러 코드가 아닙니다.`);
    }
    const catalogWSM = ASSASSIN_CLAW_WSM[claw.code];
    if (catalogWSM === null) {
      return invalid("UNSUPPORTED", "UNKNOWN_WSM", `${claw.code} 클러의 WSM이 카탈로그에서 확인되지 않습니다.`);
    }
    if (claw.wsm !== catalogWSM) {
      return invalid("INVALID_INPUT", "WSM_MISMATCH", `${claw.code}의 WSM은 카탈로그 값 ${catalogWSM}이어야 합니다.`);
    }
    if (!isIntegerInRange(claw.weaponIAS, MIN_IAS, MAX_WEAPON_IAS)) {
      return invalid("INVALID_INPUT", "WEAPON_IAS_RANGE", "각 클러 IAS는 0~120 사이의 정수여야 합니다.");
    }
  }

  if (!isIntegerInRange(input.gearIAS, MIN_IAS, MAX_TOTAL_IAS)) {
    return invalid("INVALID_INPUT", "GEAR_IAS_RANGE", `장비 IAS는 0~${MAX_TOTAL_IAS} 사이의 정수여야 합니다.`);
  }
  if (!isIntegerInRange(input.burstOfSpeedLevel, 0, 60)) {
    return invalid("INVALID_INPUT", "BOS_LEVEL_RANGE", "폭발적인 속도 레벨은 0~60 사이의 정수여야 합니다.");
  }
  if (input.gearIAS + primary.weaponIAS > MAX_TOTAL_IAS || input.gearIAS + secondary.weaponIAS > MAX_TOTAL_IAS) {
    return invalid("INVALID_INPUT", "TOTAL_IAS_RANGE", `각 손의 IAS 합계는 ${MAX_TOTAL_IAS} 이하여야 합니다.`);
  }

  if (primary.wsm !== secondary.wsm) {
    return invalid("CONFLICTED", "DUAL_CLAW_WSM_POLICY_CONFLICT", "혼합 WSM 쌍클러는 공개 기준 간 주무기/평균 WSM 정책이 달라 결과를 확정하지 않습니다.");
  }
  if (primary.weaponIAS !== secondary.weaponIAS) {
    return invalid("CONFLICTED", "DUAL_CLAW_IAS_POLICY_CONFLICT", "양손 무기 IAS가 다르면 공개 기준의 보조 손 IAS 적용 정책이 달라 결과를 확정하지 않습니다.");
  }

  const effectiveItemIAS = input.gearIAS + primary.weaponIAS;
  const itemEffectiveIAS = Math.floor((120 * effectiveItemIAS) / (120 + effectiveItemIAS));
  const burstSIAS = assassinBurstOfSpeedSIAS(input.burstOfSpeedLevel);
  // Sequence skills apply -30 EIAS before the human EIAS clamp.
  const rawEIAS = burstSIAS! + itemEffectiveIAS - primary.wsm! - SEQUENCE_EIAS_PENALTY;
  const effectiveIAS = Math.max(MIN_HUMAN_EIAS, Math.min(MAX_HUMAN_EIAS, rawEIAS));
  const animationSpeed = Math.trunc((256 * (100 + effectiveIAS)) / 100);
  const sequenceFrames = Math.ceil((DRAGON_CLAW_SEQUENCE_FRAMES * 256) / animationSpeed);

  return {
    status: "REFERENCE_BASED",
    reasonCode: "REFERENCE_SEQUENCE_MATCH",
    reason: "대칭 WSM·동일 손별 IAS의 인간형 Dragon Claw를 D2R 3.3 참조 시퀀스로 계산했습니다.",
    effectiveItemIAS,
    itemEffectiveIAS,
    skillIAS: burstSIAS!,
    effectiveIAS,
    animationSpeed,
    sequenceFrames,
    hitCount: 2,
    hitsPerSecond: (2 * 25) / sequenceFrames,
    hitFrameOffsets: null,
    evidenceVersion: "D2R 3.3.93847 / Warren1001 v1.2.6",
  };
}

export function getAssassinDragonClawBreakpointRows(input: AssassinDragonClawInput, maxGearIAS: number) {
  if (!isIntegerInRange(maxGearIAS, 0, MAX_TOTAL_IAS)) return [];
  const rows: { ias: number; fullAnimationFrames: number }[] = [];
  let previous = -1;
  for (let ias = 0; ias <= maxGearIAS; ias++) {
    const result = calculateAssassinDragonClawReference({ ...input, gearIAS: ias });
    if (result.status !== "REFERENCE_BASED" || result.sequenceFrames === null) return [];
    if (result.sequenceFrames !== previous) rows.push({ ias, fullAnimationFrames: result.sequenceFrames });
    previous = result.sequenceFrames;
  }
  return rows;
}
