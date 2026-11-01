export type IASCharacterClass =
  | "PALADIN"
  | "AMAZON"
  | "ASSASSIN"
  | "BARBARIAN"
  | "DRUID"
  | "NECROMANCER"
  | "SORCERESS"
  | "WARLOCK";

export type IASAttackMode = "NORMAL";
export type IASAttackSkill = "NORMAL_ATTACK" | "SACRIFICE" | "VENGEANCE" | "CONVERSION" | "ZEAL" | "SMITE";
export type IASAnimation = "A1" | "A2";
export type IASStatus = "SUPPORTED" | "UNVERIFIED" | "UNSUPPORTED" | "INVALID_INPUT";
export type IASVerificationStatus = "VERIFIED" | "PROVISIONAL" | "CONFLICTED" | "UNVERIFIED";

export interface IASAnimationEvidence {
  status: IASVerificationStatus;
  note: string;
}

export interface IASAttackSkillDefinition {
  code: IASAttackSkill;
  skillId: number | null;
  skillName: string;
  label: string;
  characterClass: IASCharacterClass;
  weaponClass: string | null;
  animationMode: IASAnimation | null;
  gameBuild: string;
  supportedWeapons: readonly string[];
  iasRange: Readonly<Record<string, { min: number; max: number }>> | null;
  speedModifierPolicy: "NONE" | "UNVERIFIED";
  evidenceSource: string;
  evidenceScope: string;
  gameplayTestStatus: "NOT_TESTED" | "TESTED";
  evidenceStatus: IASVerificationStatus;
  supportStatus: "SUPPORTED" | "UNVERIFIED" | "UNSUPPORTED";
  selectable: boolean;
  evidenceNote: string;
}

export type IASReasonCode =
  | "SUPPORTED_GOLDEN_MATCH"
  | "INVALID_INPUT"
  | "IAS_OUT_OF_RANGE"
  | "UNSUPPORTED_CLASS"
  | "UNSUPPORTED_FORM"
  | "UNSUPPORTED_ATTACK_MODE"
  | "UNVERIFIED_ANIMATION"
  | "UNVERIFIED_WEAPON"
  | "UNVERIFIED_MODIFIER"
  | "GOLDEN_DATA_MISMATCH";

export interface IASInput {
  characterClass: IASCharacterClass | string;
  characterForm: "HUMAN" | string;
  attackMode: IASAttackMode | string;
  animation: IASAnimation | string;
  skill?: IASAttackSkill | string;
  weaponCode: string;
  weaponIAS: number;
  offWeaponIAS: number;
  skillIAS?: number;
  buffIAS?: number;
  debuffIAS?: number;
}

export interface CalculationTrace {
  weaponSpeedModifier: number;
  totalIAS: number;
  itemEffectiveIAS: number;
  eiasRaw: number;
  eiasApplied: number;
  animationSpeed: number;
  framesPerDirection: number;
  startingFrame: number;
  speedIncrease: number;
  fullAnimationFrames: number;
}

export interface IASResult {
  status: IASStatus;
  reasonCode: IASReasonCode;
  fullAnimationFrames: number | null;
  totalIAS: number | null;
  effectiveIAS: number | null;
  currentBreakpoint: number | null;
  nextBreakpoint: number | null;
  requiredAdditionalIAS: number | null;
  evidenceVersion: string | null;
  reason: string;
  trace?: CalculationTrace;
}

export interface BreakpointDetails {
  currentBreakpoint: number;
  nextBreakpoint: number | null;
  requiredAdditionalIAS: number | null;
  fullAnimationFrames: number;
}
