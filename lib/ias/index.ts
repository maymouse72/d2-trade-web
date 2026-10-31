export { calculateIAS } from "./calculate.ts";
export { deriveGoldenBreakpoints, getBreakpointDetails, getGoldenFrameCount } from "./breakpoints.ts";
export { evaluateIASSupport } from "./support-policy.ts";
export { IAS_WEAPONS } from "./weapons.ts";
export { IAS_EVIDENCE_VERSION, PALADIN_CRS_A1 } from "./constants.ts";
export type {
  BreakpointDetails,
  CalculationTrace,
  IASAnimation,
  IASAttackMode,
  IASCharacterClass,
  IASInput,
  IASReasonCode,
  IASResult,
  IASStatus,
} from "./types.ts";
