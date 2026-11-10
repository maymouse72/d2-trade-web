import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { getNormalAttackProfile, referenceWeaponClass } from "./reference-normal-attack.ts";

export interface BarbarianWhirlwindWeapon {
  code: string;
  weaponIAS: number;
  weaponMode: "ONE_HAND" | "TWO_HAND";
}

export interface BarbarianWhirlwindInput {
  primaryWeapon: BarbarianWhirlwindWeapon;
  secondaryWeapon?: BarbarianWhirlwindWeapon;
  gearIAS: number;
}

export interface BarbarianWhirlwindResult {
  status: "REFERENCE_BASED" | "UNSUPPORTED" | "INVALID_INPUT";
  reason: string;
  primaryFrames: number | null;
  secondaryFrames: number | null;
  hitIntervalFrames: number | null;
  hitsPerSecond: number | null;
  evidence: readonly string[];
}

export interface BarbarianWhirlwindBreakpointRow {
  gearIAS: number;
  hitIntervalFrames: number;
}

const EVIDENCE = [
  "https://news.blizzard.com/en-gb/article/23814050/diablo-ii-resurrected-patch-2-4-3-now-live",
  "https://d2r.org/mechanics/whirlwind",
  "https://d2r.org/tools/breakpoints/barbarian",
] as const;

function invalid(status: "UNSUPPORTED" | "INVALID_INPUT", reason: string): BarbarianWhirlwindResult {
  return { status, reason, primaryFrames: null, secondaryFrames: null, hitIntervalFrames: null, hitsPerSecond: null, evidence: EVIDENCE };
}

function frameForWeapon(weapon: BarbarianWhirlwindWeapon, gearIAS: number): number | null {
  const catalog = IAS_WEAPON_CATALOG.find((entry) => entry.code === weapon.code);
  if (!catalog || !catalog.spawnable) return null;
  const wsm = IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier ?? catalog.wsm;
  if (wsm === null || wsm === undefined) return null;
  const attackSkill = weapon.weaponMode === "TWO_HAND" ? "BARBARIAN_TWO_HANDED_NORMAL_ATTACK" : "BARBARIAN_NORMAL_ATTACK";
  const weaponClass = referenceWeaponClass("BARBARIAN", weapon.code, attackSkill, weapon.weaponMode);
  const profile = weaponClass ? getNormalAttackProfile("BARBARIAN", weaponClass) : null;
  if (!profile) return null;

  const totalItemIAS = weapon.weaponIAS + gearIAS;
  const itemEffectiveIAS = Math.floor((120 * totalItemIAS) / (120 + totalItemIAS));
  const eias = Math.max(-85, Math.min(75, itemEffectiveIAS - wsm));
  const speed = Math.floor(profile.animationSpeed * (100 + eias) / 100);
  if (speed <= 0) return null;
  return Math.ceil(256 * (profile.framesPerDirection - profile.startingFrame) / speed) - 1;
}

/**
 * D2R 2.4.3 makes Whirlwind use the basic-attack frame after equipment IAS.
 * With two weapons, Blizzard specifies the rounded-up average of each frame.
 * This reports the repeated hit interval only; it does not model spin startup,
 * travel distance, target search, or hit confirmation.
 */
export function calculateBarbarianWhirlwind(input: BarbarianWhirlwindInput): BarbarianWhirlwindResult {
  if (!input || !input.primaryWeapon) return invalid("INVALID_INPUT", "Whirlwind 주무기 입력이 필요합니다.");
  if (!Number.isInteger(input.gearIAS) || input.gearIAS < 0 || input.gearIAS > 456) return invalid("INVALID_INPUT", "장비 IAS는 0~456 사이의 정수여야 합니다.");
  for (const weapon of [input.primaryWeapon, input.secondaryWeapon].filter(Boolean) as BarbarianWhirlwindWeapon[]) {
    if (!Number.isInteger(weapon.weaponIAS) || weapon.weaponIAS < 0 || weapon.weaponIAS > 120) return invalid("INVALID_INPUT", "손별 무기 IAS는 0~120 사이의 정수여야 합니다.");
  }
  if (input.secondaryWeapon) {
    const offhand = IAS_WEAPON_CATALOG.find((entry) => entry.code === input.secondaryWeapon!.code);
    if (input.primaryWeapon.weaponMode === "TWO_HAND") return invalid("UNSUPPORTED", "양손 무기와 보조 무기를 동시에 사용할 수 없습니다.");
    if (input.secondaryWeapon.weaponMode !== "ONE_HAND" || offhand?.handedness === "two-handed") return invalid("UNSUPPORTED", "보조 무기는 야만용사가 한손 장착할 수 있는 무기여야 합니다.");
  }
  const primaryFrames = frameForWeapon(input.primaryWeapon, input.gearIAS);
  const secondaryFrames = input.secondaryWeapon ? frameForWeapon(input.secondaryWeapon, input.gearIAS) : null;
  if (primaryFrames === null || (input.secondaryWeapon && secondaryFrames === null)) return invalid("UNSUPPORTED", "해당 무기 유형의 야만용사 A1 프로필 또는 WSM이 없습니다.");
  const hitIntervalFrames = secondaryFrames === null ? primaryFrames : Math.ceil((primaryFrames + secondaryFrames) / 2);
  const weaponHitCount = secondaryFrames === null ? 1 : 2;
  return {
    status: "REFERENCE_BASED",
    reason: "D2R 2.4.3 이후 Whirlwind 반복 타격 간격 참고값입니다. 양손 사용 시 손별 기본 공격 프레임 평균을 올림합니다.",
    primaryFrames, secondaryFrames, hitIntervalFrames,
    hitsPerSecond: 25 * weaponHitCount / hitIntervalFrames,
    evidence: EVIDENCE,
  };
}

export function getBarbarianWhirlwindBreakpointRows(input: Omit<BarbarianWhirlwindInput, "gearIAS">, maxGearIAS = 456): BarbarianWhirlwindBreakpointRow[] {
  const rows: BarbarianWhirlwindBreakpointRow[] = [];
  let previous = -1;
  for (let gearIAS = 0; gearIAS <= maxGearIAS; gearIAS += 1) {
    const result = calculateBarbarianWhirlwind({ ...input, gearIAS });
    if (result.status !== "REFERENCE_BASED" || result.hitIntervalFrames === null) break;
    if (result.hitIntervalFrames !== previous) rows.push({ gearIAS, hitIntervalFrames: result.hitIntervalFrames });
    previous = result.hitIntervalFrames;
  }
  return rows;
}
