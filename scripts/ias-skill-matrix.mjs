import { IAS_SUPPORTED_CLASSES, getClassSkills } from "../lib/ias/class-registry.ts";
import { IAS_SKILLS } from "../lib/ias/skills.ts";
import { IAS_WEAPON_CATALOG } from "../lib/ias/weapon-catalog.ts";

const classKo = { AMAZON: "아마존", ASSASSIN: "암살자", BARBARIAN: "야만용사", DRUID: "드루이드", NECROMANCER: "강령술사", PALADIN: "성기사", SORCERESS: "원소술사" };
const catalog = new Map(IAS_WEAPON_CATALOG.map((weapon) => [weapon.code, weapon]));
const dual = new Set(["ASSASSIN_DRAGON_CLAW", "ASSASSIN_FISTS_OF_FIRE", "ASSASSIN_CLAWS_OF_THUNDER", "ASSASSIN_BLADES_OF_ICE", "BARBARIAN_DOUBLE_SWING", "BARBARIAN_DOUBLE_THROW", "BARBARIAN_FRENZY", "BARBARIAN_WHIRLWIND"]);
const rows = [];

for (const characterClass of IAS_SUPPORTED_CLASSES) {
  const entries = characterClass === "PALADIN"
    ? Object.values(IAS_SKILLS).filter((entry) => entry.selectable).map((entry) => ({
      characterClass, skill: entry.code, label: entry.label, animationClass: `${entry.animationMode ?? "A1"} ${entry.evidenceScope}`,
      supportedWeapons: entry.supportedWeapons, verificationStatus: entry.evidenceStatus, evidenceSource: entry.evidenceSource,
      evidenceUrls: entry.evidenceUrls ?? [],
    }))
    : getClassSkills(characterClass).filter((entry) => entry.verificationStatus === "VERIFIED" || entry.verificationStatus === "REFERENCE_BASED" || entry.verificationStatus === "CONFLICTED");
  for (const entry of entries) {
    const codes = entry.supportedWeapons ?? [];
    const types = [...new Set(codes.map((code) => catalog.get(code)?.itemTypeName ?? catalog.get(code)?.itemType).filter(Boolean))].sort();
    const modes = dual.has(entry.skill) ? "쌍수(한손 무기 2개)" : entry.skill === "BARBARIAN_TWO_HANDED_NORMAL_ATTACK" ? "양손" : entry.skill === "BARBARIAN_NORMAL_ATTACK" ? "한손" : "직업·무기 분류에 따른 한손/양손";
    const isThrow = entry.skill === "BARBARIAN_DOUBLE_THROW" || entry.skill.startsWith("AMAZON_THROW") || ["AMAZON_POISON_JAVELIN", "AMAZON_PLAGUE_JAVELIN", "AMAZON_LIGHTNING_BOLT", "AMAZON_LIGHTNING_FURY"].includes(entry.skill);
    const inputs = entry.skill === "ASSASSIN_DRAGON_FLIGHT" ? "무기 선택; IAS 입력 없음(고정 23프레임)"
      : entry.skill === "BARBARIAN_DOUBLE_THROW" ? "주·보조 투척 무기, 각 무기 IAS, 장비 IAS"
      : dual.has(entry.skill) ? "주·보조 무기, 손별 무기 IAS, 장비 IAS; 일부 스킬은 BoS/충전 입력"
      : entry.skill.includes("FRENZY") ? "주·보조 무기, 손별 IAS, 장비 IAS, 광분 충전"
      : entry.skill.includes("DRAGON_TALON") ? "무기 IAS, 장비 IAS, BoS, 기술 레벨"
      : entry.skill.includes("TRAP_LAYING") ? "무기, 장비 IAS, BoS"
      : entry.skill.includes("FEND") || entry.skill.includes("STRAFE") ? "무기·IAS, 대상 수/발사 수"
      : entry.skill.includes("CHARGE") ? "모드 선택; 실제 돌진은 숫자 없음, 근접 A1 대체 모드에 무기·IAS"
      : isThrow ? "무기·무기 IAS, 장비 IAS, 필요 시 광신"
      : "무기, 장착 방식, 무기 IAS, 장비 IAS; 스킬별 지원 보정은 별도 입력";
    const engine = entry.skill === "ASSASSIN_DRAGON_FLIGHT" ? "calculate.ts (fixed 23-frame result)"
      : entry.skill === "BARBARIAN_DOUBLE_THROW" ? "barbarian-double-throw.ts (12-FPD dual-wield sequence)"
      : entry.skill.includes("FRENZY") ? "barbarian-frenzy-reference.ts"
      : entry.skill.includes("WHIRLWIND") ? "barbarian-whirlwind.ts"
      : entry.skill.includes("DOUBLE_SWING") ? "barbarian-double-swing-reference.ts"
      : entry.skill.includes("DRAGON_CLAW") ? "assassin-dual-claw.ts"
      : entry.skill.includes("DRAGON_TALON") ? "assassin-dragon-talon.ts"
      : entry.skill.includes("TRAP_LAYING") ? "assassin-trap-laying.ts"
      : entry.skill.includes("FEND") ? "amazon-fend.ts"
      : entry.skill.includes("STRAFE") ? "amazon-strafe.ts"
      : entry.skill.includes("IMPALE") ? "amazon-impale.ts"
      : entry.skill.includes("IMMOLATION") ? "amazon-immolation-cadence.ts"
      : entry.skill.startsWith("DRUID_") ? "druid-shapeshift-reference.ts"
      : entry.skill === "ZEAL" ? "zeal.ts"
      : entry.skill === "SMITE" ? "smite.ts"
      : "reference-normal-attack.ts / skill-specific registry";
    const urls = entry.evidenceUrls?.length ? entry.evidenceUrls.map((url) => `[${new URL(url).hostname}](${url})`).join("; ") : entry.evidenceSource ?? "등록된 1차/비교 근거 참조";
    rows.push({ className: classKo[characterClass] ?? characterClass, label: entry.label, skill: entry.skill, attack: entry.animationClass ?? "직업별 A1 공격", weapons: types.join(", ") || "해당 없음", modes, inputs, engine, reference: urls, status: entry.verificationStatus, numeric: entry.verificationStatus === "VERIFIED" || entry.verificationStatus === "REFERENCE_BASED" ? "예" : "아니요" });
  }
}

rows.push({ className: "성기사", label: "돌진 (Charge)", skill: "PALADIN_CHARGE", attack: "실제 돌진 / 근접 A1 대체", weapons: "성기사 A1 무기", modes: "돌진 또는 근접 대체", inputs: "모드, 무기, 무기 IAS, 장비 IAS, 광신", engine: "paladin-charge-reference.ts", reference: "실제 돌진은 IAS 프레임 없음; 근접 모드는 A1 일반 공격", status: "REFERENCE_BASED", numeric: "모드에 따라 다름" });

const table = rows.map((row) => `| ${row.className} | ${row.label.replaceAll("|", "\\|")} | \`${row.skill}\` | ${row.attack.replaceAll("|", "\\|")} | ${row.weapons} | ${row.modes} | ${row.inputs} | \`${row.engine}\` | ${row.reference.replaceAll("|", "\\|")} | ${row.status} | ${row.numeric} |`).join("\n");
console.log(`# IAS-6 Skill Coverage Matrix\n\n**Selectable skill / mode rows:** ${rows.length} (including the Barbarian dual-wield normal-attack conflict and Paladin Charge modes).\n\nEvery row records its attack type, catalog weapon categories, hand mode, calculator inputs, engine module, reference, evidence status, and whether it returns a numeric result. REFERENCE_BASED rows are reference-derived, not game-tested Golden verification.\n\n| Class | Skill | Code | Attack type | Weapon types | Hand mode | Inputs | Engine | Reference | Status | Numeric result |\n|---|---|---|---|---|---|---|---|---|---|---|\n${table}\n`);
