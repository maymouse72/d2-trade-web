import { calculateIAS, deriveGoldenBreakpoints, getGoldenFrameCount } from "./index.ts";
import type { IASAnimation, IASResult } from "./types.ts";
import { IAS_WEAPONS } from "./weapons.ts";

export function getWeaponBreakpoints(weaponCode: string, animation: IASAnimation = "A1") {
  if (animation !== "A1" || IAS_WEAPONS[weaponCode]?.animationEvidence[animation].status !== "VERIFIED") return [];
  return deriveGoldenBreakpoints(weaponCode).map((ias) => ({
    ias,
    fullAnimationFrames: getGoldenFrameCount(weaponCode, ias) as number,
  }));
}

export type CalculatorSelection = {
  characterClass: string;
  weaponCode: string;
  animation: string;
};

export type CalculatorViewModel =
  | { status: "SUPPORTED"; ias: number; result: IASResult }
  | { status: "INVALID_INPUT"; reason: string }
  | { status: "UNVERIFIED" | "UNSUPPORTED"; reason: string };

export function constrainIASInput(rawIAS: string, maxIAS: number): string {
  if (/^\d+$/.test(rawIAS) && Number(rawIAS) > maxIAS) return String(maxIAS);
  return rawIAS;
}

export function getCalculatorViewModel(rawIAS: string, selection: CalculatorSelection): CalculatorViewModel {
  const weapon = IAS_WEAPONS[selection.weaponCode];
  const maxIAS = weapon?.maxIAS ?? 317;
  if (!/^\d+$/.test(rawIAS)) {
    return { status: "INVALID_INPUT", reason: `공격 속도 증가 합계는 0~${maxIAS} 사이의 정수로 입력해 주세요.` };
  }

  const ias = Number(rawIAS);
  if (!Number.isSafeInteger(ias) || ias > maxIAS) return { status: "INVALID_INPUT", reason: `공격 속도 증가 합계는 0~${maxIAS} 사이의 정수로 입력해 주세요.` };

  const result = calculateIAS({
    characterClass: selection.characterClass,
    characterForm: "HUMAN",
    attackMode: "NORMAL",
    animation: selection.animation,
    weaponCode: selection.weaponCode,
    weaponIAS: 0,
    offWeaponIAS: ias,
    skillIAS: 0,
    buffIAS: 0,
    debuffIAS: 0,
  });

  if (result.status !== "SUPPORTED") return { status: result.status, reason: result.reason };
  return { status: "SUPPORTED", ias, result };
}
