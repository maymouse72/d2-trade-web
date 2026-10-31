import { calculateIAS, deriveGoldenBreakpoints, getGoldenFrameCount } from "./index.ts";
import type { IASResult } from "./types.ts";

export const IAS_BREAKPOINTS = deriveGoldenBreakpoints().map((ias) => ({
  ias,
  fullAnimationFrames: getGoldenFrameCount(ias) as number,
}));

export type CalculatorSelection = {
  characterClass: string;
  weaponCode: string;
  animation: string;
};

export type CalculatorViewModel =
  | { status: "SUPPORTED"; ias: number; result: IASResult }
  | { status: "INVALID_INPUT"; reason: string }
  | { status: "UNVERIFIED" | "UNSUPPORTED"; reason: string };

export function getCalculatorViewModel(rawIAS: string, selection: CalculatorSelection): CalculatorViewModel {
  if (!/^\d+$/.test(rawIAS)) {
    return { status: "INVALID_INPUT", reason: "IAS는 0~200 사이의 정수로 입력해 주세요." };
  }

  const ias = Number(rawIAS);
  if (ias > 200) return { status: "INVALID_INPUT", reason: "IAS는 0~200 사이의 정수로 입력해 주세요." };

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
