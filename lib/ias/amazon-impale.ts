import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";

/** Source-table model for Amazon Impale. It intentionally lives outside the
 * shared registry / policy until separately reviewed for integration. */
export type AmazonImpaleInput = {
  weaponCode: string;
  weaponWSM: number | null;
  weaponClass: "1ht" | "2ht";
  gearIAS: number;
  weaponIAS: number;
  skillEIAS?: number;
};

export type AmazonImpaleResult =
  | {
      status: "REFERENCE_BASED";
      reasonCode: "AMAZON_BASIN_IMPALE_TABLE";
      reason: string;
      totalIAS: number;
      itemEIAS: number;
      effectiveIAS: number;
      frames: number;
      attacksPerSecond: number;
      evidenceVersion: "Amazon Basin Amazon attack-speed table";
    }
  | {
      status: "INVALID_INPUT" | "UNSUPPORTED";
      reasonCode: string;
      reason: string;
      frames: null;
      attacksPerSecond: null;
    };

// Minimum EIAS at which each frame tier is reached, transcribed from the
// Amazon Basin Impale 1HT/2HT tables. Tiers beyond the player cap are omitted.
const IMPALE_MIN_EIAS: Readonly<Record<"1ht" | "2ht", readonly { eias: number; frames: number }[]>> = {
  "1ht": [
    { eias: -20, frames: 42 }, { eias: -18, frames: 41 }, { eias: -17, frames: 40 },
    { eias: -16, frames: 39 }, { eias: -14, frames: 38 }, { eias: -12, frames: 37 },
    { eias: -11, frames: 36 }, { eias: -9, frames: 35 }, { eias: -7, frames: 34 },
    { eias: -6, frames: 33 }, { eias: -4, frames: 32 }, { eias: -2, frames: 31 },
    { eias: 1, frames: 30 }, { eias: 3, frames: 29 }, { eias: 5, frames: 28 },
    { eias: 9, frames: 27 }, { eias: 11, frames: 26 }, { eias: 15, frames: 25 },
    { eias: 18, frames: 24 }, { eias: 22, frames: 23 }, { eias: 26, frames: 22 },
    { eias: 30, frames: 21 }, { eias: 36, frames: 20 }, { eias: 41, frames: 19 },
    { eias: 47, frames: 18 }, { eias: 54, frames: 17 }, { eias: 62, frames: 16 },
    { eias: 71, frames: 15 },
  ],
  "2ht": [
    { eias: -20, frames: 48 }, { eias: -18, frames: 47 }, { eias: -17, frames: 46 },
    { eias: -16, frames: 45 }, { eias: -15, frames: 44 }, { eias: -14, frames: 43 },
    { eias: -12, frames: 42 }, { eias: -11, frames: 41 }, { eias: -9, frames: 40 },
    { eias: -8, frames: 39 }, { eias: -6, frames: 38 }, { eias: -4, frames: 37 },
    { eias: -3, frames: 36 }, { eias: -1, frames: 35 }, { eias: 1, frames: 34 },
    { eias: 4, frames: 33 }, { eias: 5, frames: 32 }, { eias: 8, frames: 31 },
    { eias: 11, frames: 30 }, { eias: 13, frames: 29 }, { eias: 16, frames: 28 },
    { eias: 20, frames: 27 }, { eias: 23, frames: 26 }, { eias: 27, frames: 25 },
    { eias: 30, frames: 24 }, { eias: 35, frames: 23 }, { eias: 40, frames: 22 },
    { eias: 45, frames: 21 }, { eias: 51, frames: 20 }, { eias: 57, frames: 19 },
    { eias: 64, frames: 18 }, { eias: 72, frames: 17 },
  ],
};

function invalid(status: "INVALID_INPUT" | "UNSUPPORTED", reasonCode: string, reason: string): AmazonImpaleResult {
  return { status, reasonCode, reason, frames: null, attacksPerSecond: null };
}

function integerIn(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function calculateAmazonImpaleReference(input: AmazonImpaleInput): AmazonImpaleResult {
  if (!input || typeof input !== "object") return invalid("INVALID_INPUT", "INVALID_INPUT", "입력 객체가 필요합니다.");
  if (input.weaponClass !== "1ht" && input.weaponClass !== "2ht") return invalid("UNSUPPORTED", "UNSUPPORTED_WEAPON_CLASS", "Impale은 1HT 또는 2HT 투창/창 무기만 지원합니다.");
  const weapon = IAS_WEAPON_CATALOG.find((item) => item.code === input.weaponCode);
  if (!weapon || !weapon.spawnable || !["jave", "ajav", "spea", "aspe"].includes(weapon.itemType)) return invalid("UNSUPPORTED", "UNSUPPORTED_WEAPON", "생성 가능한 창 또는 투창 계열만 지원합니다.");
  if (weapon.weaponClass !== input.weaponClass) return invalid("INVALID_INPUT", "WEAPON_CLASS_MISMATCH", "무기 코드와 공격 무기 클래스가 일치하지 않습니다.");
  if (weapon.wsm === null) return invalid("UNSUPPORTED", "UNKNOWN_WSM", "무기의 WSM이 카탈로그에서 확인되지 않습니다.");
  if (input.weaponWSM !== weapon.wsm) return invalid("INVALID_INPUT", "WSM_MISMATCH", `무기 WSM은 카탈로그 값 ${weapon.wsm}이어야 합니다.`);
  if (!integerIn(input.gearIAS, 0, 456) || !integerIn(input.weaponIAS, 0, 120) || input.gearIAS + input.weaponIAS > 456) return invalid("INVALID_INPUT", "IAS_RANGE", "장비 IAS는 0~456, 무기 IAS는 0~120이며 합계는 456 이하여야 합니다.");
  const skillEIAS = input.skillEIAS ?? 0;
  if (!integerIn(skillEIAS, -200, 200)) return invalid("INVALID_INPUT", "SKILL_EIAS_RANGE", "합산 스킬 EIAS는 -200~200 정수여야 합니다.");

  const totalIAS = input.gearIAS + input.weaponIAS;
  const itemEIAS = Math.floor((120 * totalIAS) / (120 + totalIAS));
  const effectiveIAS = Math.max(-85, Math.min(75, itemEIAS + skillEIAS - weapon.wsm));
  const tiers = IMPALE_MIN_EIAS[input.weaponClass];
  let tier: { eias: number; frames: number } | undefined;
  for (const candidate of tiers) {
    if (candidate.eias > effectiveIAS) break;
    tier = candidate;
  }
  if (!tier) return invalid("UNSUPPORTED", "EIAS_OUTSIDE_REFERENCE", "계산된 EIAS가 공개 Impale 표의 검증 구간보다 낮습니다.");

  return {
    status: "REFERENCE_BASED",
    reasonCode: "AMAZON_BASIN_IMPALE_TABLE",
    reason: "Amazon Basin의 Impale 1HT/2HT IAS 기준표를 적용했습니다.",
    totalIAS,
    itemEIAS,
    effectiveIAS,
    frames: tier.frames,
    attacksPerSecond: 25 / tier.frames,
    evidenceVersion: "Amazon Basin Amazon attack-speed table",
  };
}
