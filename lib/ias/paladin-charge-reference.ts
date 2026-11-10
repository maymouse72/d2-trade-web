import { calculateIAS } from "./calculate.ts";
import type { IASInput, IASResult } from "./types.ts";

/**
 * Charge has two mechanically different outcomes. The rush attack has no IAS
 * cadence; when the target is already in melee range the game performs the
 * Paladin's ordinary A1 attack instead. This isolated adapter makes that
 * distinction explicit and is intentionally not registered in the UI.
 *
 * Sources (D2R build 3.3.93847):
 * https://d2r.org/mechanics/charge
 * https://theamazonbasin.com/wiki/index.php/Charge
 */
export type PaladinChargeReference =
  | { mode: "RUSH"; frames: null; reason: string }
  | { mode: "MELEE_FALLBACK"; frames: number | null; result: IASResult; reason: string };

export type PaladinChargeInput = Pick<IASInput, "weaponCode" | "weaponIAS" | "offWeaponIAS" | "fanaticismLevel"> & {
  mode: "RUSH" | "MELEE_FALLBACK";
};

export function calculatePaladinChargeReference(input: PaladinChargeInput): PaladinChargeReference {
  if (input.mode === "RUSH") {
    return {
      mode: "RUSH",
      frames: null,
      reason: "실제 돌진 공격의 간격은 IAS가 아닌 돌진 이동 속도와 게임 상태에 좌우되어 IAS 프레임을 산출하지 않습니다.",
    };
  }

  const result = calculateIAS({
    characterClass: "PALADIN",
    characterForm: "HUMAN",
    attackMode: "NORMAL",
    animation: "A1",
    skill: "NORMAL_ATTACK",
    weaponCode: input.weaponCode,
    weaponIAS: input.weaponIAS,
    offWeaponIAS: input.offWeaponIAS,
    fanaticismLevel: input.fanaticismLevel ?? 0,
  });
  return {
    mode: "MELEE_FALLBACK",
    frames: result.fullAnimationFrames,
    result,
    reason: "대상이 이미 근접 범위이면 Charge 보너스가 없는 성기사 A1 일반 공격으로 처리합니다.",
  };
}
