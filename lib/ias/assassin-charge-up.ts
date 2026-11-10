import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { assassinBurstOfSpeedSIAS } from "./assassin-dual-claw.ts";

export type AssassinChargeUpInput = {
  primary: { code: string; wsm: number | null; weaponIAS: number };
  secondary: { code: string; wsm: number | null; weaponIAS: number };
  gearIAS: number;
  burstOfSpeedLevel: number;
};

export type AssassinChargeUpResult =
  | { status: "REFERENCE_BASED"; reason: string; frames: number; itemEffectiveIAS: number; effectiveIAS: number; attackSpeed: number }
  | { status: "INVALID_INPUT" | "UNSUPPORTED"; reason: string; frames: null; itemEffectiveIAS: null; effectiveIAS: null; attackSpeed: null };

function invalid(status: "INVALID_INPUT" | "UNSUPPORTED", reason: string): AssassinChargeUpResult {
  return { status, reason, frames: null, itemEffectiveIAS: null, effectiveIAS: null, attackSpeed: null };
}

function isIntegerIn(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/**
 * D2R Tools reference model for Assassin claw charge-up sequence skills.
 * The public table assigns dual-wield FPD 16 and sequence EIAS −30; it averages
 * the two hand WSM and item-effective IAS values before applying SIAS.
 */
export function calculateAssassinChargeUp(input: AssassinChargeUpInput): AssassinChargeUpResult {
  if (!input || !input.primary || !input.secondary) return invalid("INVALID_INPUT", "주무기와 보조 클러가 모두 필요합니다.");
  const hands = [input.primary, input.secondary];
  for (const hand of hands) {
    const weapon = IAS_WEAPON_CATALOG.find((item) => item.code === hand.code);
    if (!weapon || !weapon.spawnable || weapon.itemTypeClassTag !== "ass") return invalid("UNSUPPORTED", "쌍클러 시퀀스는 생성 가능한 암살자 전용 클러 두 개만 지원합니다.");
    if (weapon.wsm === null) return invalid("UNSUPPORTED", `${weapon.name}의 WSM을 확인할 수 없습니다.`);
    if (hand.wsm !== weapon.wsm) return invalid("INVALID_INPUT", `${weapon.name} WSM이 카탈로그 값과 다릅니다.`);
    if (!isIntegerIn(hand.weaponIAS, 0, 120) || hand.weaponIAS + input.gearIAS > 456) return invalid("INVALID_INPUT", "각 클러 IAS는 0~120, 손별 총 IAS는 456 이하여야 합니다.");
  }
  if (!isIntegerIn(input.gearIAS, 0, 456) || !isIntegerIn(input.burstOfSpeedLevel, 0, 60)) return invalid("INVALID_INPUT", "장비 IAS는 0~456, 폭발적인 속도는 0~60 레벨이어야 합니다.");

  const itemEias = hands.map((hand) => Math.floor((120 * (input.gearIAS + hand.weaponIAS)) / (120 + input.gearIAS + hand.weaponIAS)));
  const averageItemEias = (itemEias[0] + itemEias[1]) / 2;
  const averageWsm = (input.primary.wsm! + input.secondary.wsm!) / 2;
  const burstSIAS = assassinBurstOfSpeedSIAS(input.burstOfSpeedLevel);
  if (burstSIAS === null) return invalid("INVALID_INPUT", "폭발적인 속도 레벨은 0~60 사이여야 합니다.");
  const effectiveIAS = Math.max(-85, Math.min(75, Math.floor(burstSIAS + averageItemEias - averageWsm - 30)));
  const attackSpeed = Math.floor((256 * (100 + effectiveIAS)) / 100);
  const frames = Math.ceil((16 * 256) / attackSpeed);
  return { status: "REFERENCE_BASED", reason: "D2R Tools의 쌍클러 charge-up 16-FPD 시퀀스, 손별 IEIAS/WSM 평균 및 −30 sequence EIAS 기준입니다.", frames, itemEffectiveIAS: Math.floor(averageItemEias), effectiveIAS, attackSpeed };
}

export function getAssassinChargeUpBreakpoints(input: AssassinChargeUpInput, maxGearIAS = 456) {
  if (!isIntegerIn(maxGearIAS, 0, 456)) return [];
  const rows: { gearIAS: number; frames: number }[] = [];
  let previous = -1;
  for (let gearIAS = 0; gearIAS <= maxGearIAS; gearIAS++) {
    const result = calculateAssassinChargeUp({ ...input, gearIAS });
    if (result.status !== "REFERENCE_BASED") break;
    if (result.frames !== previous) rows.push({ gearIAS, frames: result.frames });
    previous = result.frames;
  }
  return rows;
}
