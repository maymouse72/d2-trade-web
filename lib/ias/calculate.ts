import { IAS_EVIDENCE_VERSION, IAS_HARD_MAX, PALADIN_CRS_A1 } from "./constants.ts";
import { getBreakpointDetails, getGoldenFrameCount } from "./breakpoints.ts";
import { evaluateIASSupport } from "./support-policy.ts";
import type { CalculationTrace, IASResult } from "./types.ts";
import { IAS_WEAPONS } from "./weapons.ts";
import { IAS_SKILLS } from "./skills.ts";
import { getSkillGoldenFrameCount } from "./skill-golden.ts";
import { calculateSupportedZeal } from "./zeal.ts";
import { calculateSupportedSmite } from "./smite.ts";
import { fanaticismSIAS } from "./fanaticism.ts";
import { calculateBarbarianNormalAttack } from "./barbarian.ts";
import { calculateReferenceAmazonJab, calculateReferenceNormalAttack, getNormalAttackProfile, amazonJabSequenceLength, referenceWeaponClass } from "./reference-normal-attack.ts";
import { IAS_WEAPON_CATALOG } from "./weapon-catalog.ts";
import { calculateAmazonFend } from "./amazon-fend.ts";
import { calculateAmazonStrafe } from "./amazon-strafe.ts";
import { calculateAmazonThrow } from "./amazon-throw.ts";
import { calculateDruidShapeshiftStandardAttack, getDruidShapeshiftBreakpointRows } from "./druid-shapeshift-reference.ts";
import { calculateAssassinDragonClawReference, getAssassinDragonClawBreakpointRows } from "./assassin-dual-claw.ts";
import { calculateAssassinDragonTalonReference } from "./assassin-dragon-talon.ts";
import { calculateDruidWerewolfFurySequence, getDruidWerewolfSIAS, getDruidMaulSIAS } from "./druid-shapeshift-reference.ts";
import { calculateBarbarianDoubleSwingReference } from "./barbarian-double-swing-reference.ts";
import { calculateAssassinTrapLaying, getAssassinTrapLayingBreakpointRows } from "./assassin-trap-laying.ts";
import { calculateBarbarianWhirlwind, getBarbarianWhirlwindBreakpointRows } from "./barbarian-whirlwind.ts";
import { calculateBarbarianFrenzyReference, getBarbarianFrenzyBreakpointRows } from "./barbarian-frenzy-reference.ts";
import { calculateAmazonImpaleReference } from "./amazon-impale.ts";
import { calculateAssassinChargeUp, getAssassinChargeUpBreakpoints } from "./assassin-charge-up.ts";
import { calculateAmazonImmolationCadence, getAmazonImmolationCadenceBreakpointRows } from "./amazon-immolation-cadence.ts";
import { calculateBarbarianDoubleThrow, getBarbarianDoubleThrowBreakpointRows } from "./barbarian-double-throw.ts";

function emptyResult(
  status: IASResult["status"],
  reasonCode: IASResult["reasonCode"],
  reason: string,
): IASResult {
  return {
    status,
    reasonCode,
    fullAnimationFrames: null,
    totalIAS: null,
    effectiveIAS: null,
    currentBreakpoint: null,
    nextBreakpoint: null,
    requiredAdditionalIAS: null,
    evidenceVersion: null,
    reason,
  };
}

export function calculateIAS(input: unknown): IASResult {
  const support = evaluateIASSupport(input);
  if ((support.status !== "SUPPORTED" && support.status !== "REFERENCE_BASED") || !support.input) {
    return emptyResult(support.status, support.reasonCode as IASResult["reasonCode"], support.reason);
  }

  if (support.input.skill === "ZEAL") return calculateSupportedZeal(support.input);
  if (support.input.skill === "SMITE") return calculateSupportedSmite(support.input);
  if (support.input.characterClass === "AMAZON" && support.input.skill === "AMAZON_IMPALE") {
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    if (!catalogWeapon || catalogWeapon.wsm === null || (catalogWeapon.weaponClass !== "1ht" && catalogWeapon.weaponClass !== "2ht")) {
      return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "Impale 무기 클래스 또는 WSM 자료가 없습니다.");
    }
    const calc = (gearIAS: number) => calculateAmazonImpaleReference({ weaponCode: catalogWeapon.code, weaponWSM: catalogWeapon.wsm, weaponClass: catalogWeapon.weaponClass as "1ht" | "2ht", gearIAS, weaponIAS: support.input!.weaponIAS });
    const currentCalc = calc(support.input.offWeaponIAS);
    if (currentCalc.status !== "REFERENCE_BASED") return emptyResult(currentCalc.status, "INVALID_INPUT", currentCalc.reason);
    const rows: { ias: number; fullAnimationFrames: number }[] = [];
    let previous = -1;
    for (let gear = 0; gear <= 456 - support.input.weaponIAS; gear++) {
      const candidate = calc(gear);
      if (candidate.status !== "REFERENCE_BASED") break;
      if (candidate.frames !== previous) rows.push({ ias: gear, fullAnimationFrames: candidate.frames });
      previous = candidate.frames;
    }
    const current = rows.filter((row) => row.ias <= support.input!.offWeaponIAS).at(-1);
    const next = rows.find((row) => row.ias > support.input!.offWeaponIAS);
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: currentCalc.frames,
      totalIAS: support.input.totalIAS, effectiveIAS: currentCalc.effectiveIAS, currentBreakpoint: current?.ias ?? 0,
      nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - support.input.offWeaponIAS : null,
      evidenceVersion: currentCalc.evidenceVersion, reason: currentCalc.reason, attacksPerSecond: currentCalc.attacksPerSecond };
  }
  if (support.input.characterClass === "ASSASSIN" && ["ASSASSIN_FISTS_OF_FIRE", "ASSASSIN_CLAWS_OF_THUNDER", "ASSASSIN_BLADES_OF_ICE"].includes(support.input.skill)) {
    const primary = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const secondary = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.secondaryWeaponCode);
    if (!primary || !secondary || primary.wsm === null || secondary.wsm === null) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "쌍클러 카탈로그 WSM을 찾을 수 없습니다.");
    const sequenceInput = { primary: { code: primary.code, wsm: primary.wsm, weaponIAS: support.input.weaponIAS }, secondary: { code: secondary.code, wsm: secondary.wsm, weaponIAS: support.input.secondaryWeaponIAS }, gearIAS: support.input.offWeaponIAS, burstOfSpeedLevel: support.input.burstOfSpeedLevel };
    const sequence = calculateAssassinChargeUp(sequenceInput);
    if (sequence.status !== "REFERENCE_BASED") return emptyResult(sequence.status, "INVALID_INPUT", sequence.reason);
    const rows = getAssassinChargeUpBreakpoints(sequenceInput, Math.min(456 - support.input.weaponIAS, 456 - support.input.secondaryWeaponIAS));
    const current = rows.filter((row) => row.gearIAS <= support.input!.offWeaponIAS).at(-1);
    const next = rows.find((row) => row.gearIAS > support.input!.offWeaponIAS);
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: sequence.frames,
      totalIAS: support.input.totalIAS, effectiveIAS: sequence.effectiveIAS, currentBreakpoint: current?.gearIAS ?? 0,
      nextBreakpoint: next?.gearIAS ?? null, requiredAdditionalIAS: next ? next.gearIAS - support.input.offWeaponIAS : null,
      evidenceVersion: "D2R Tools IAS reference / dual-claw charge-up sequence", reason: sequence.reason,
      attacksPerSecond: 25 / sequence.frames };
  }
  if (support.input.characterClass === "ASSASSIN" && support.input.skill === "ASSASSIN_DRAGON_TALON") {
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    if (!catalogWeapon) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "선택 무기 카탈로그 자료를 찾을 수 없습니다.");
    const sequence = calculateAssassinDragonTalonReference({
      characterForm: support.input.characterForm,
      weapon: { code: catalogWeapon.code, wsm: catalogWeapon.wsm, weaponIAS: support.input.weaponIAS },
      gearIAS: support.input.offWeaponIAS, burstOfSpeedLevel: support.input.burstOfSpeedLevel,
      dragonTalonLevel: support.input.skillLevel,
    });
    if (sequence.status !== "REFERENCE_BASED") return emptyResult(sequence.status, sequence.reasonCode === "TALON_LEVEL_RANGE" ? "INVALID_INPUT" : "UNSUPPORTED_WEAPON", sequence.reason);
    const rows: { ias: number; fullAnimationFrames: number }[] = [];
    let previous = -1;
    for (let ias = support.input.weaponIAS; ias <= Math.min(IAS_HARD_MAX, support.input.weaponIAS + support.input.offWeaponIAS + IAS_HARD_MAX); ias++) {
      const candidate = calculateAssassinDragonTalonReference({ characterForm: support.input.characterForm, weapon: { code: catalogWeapon.code, wsm: catalogWeapon.wsm, weaponIAS: support.input.weaponIAS }, gearIAS: ias - support.input.weaponIAS, burstOfSpeedLevel: support.input.burstOfSpeedLevel, dragonTalonLevel: support.input.skillLevel });
      if (candidate.status !== "REFERENCE_BASED") break;
      if (candidate.totalSequenceFrames !== previous) rows.push({ ias, fullAnimationFrames: candidate.totalSequenceFrames });
      previous = candidate.totalSequenceFrames;
    }
    const current = rows.filter((row) => row.ias <= support.input!.totalIAS).at(-1);
    const next = rows.find((row) => row.ias > support.input!.totalIAS);
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: sequence.totalSequenceFrames,
      totalIAS: support.input.totalIAS, effectiveIAS: sequence.effectiveIAS, currentBreakpoint: current?.ias ?? 0,
      nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - support.input.totalIAS : null,
      evidenceVersion: sequence.evidenceVersion, reason: sequence.reason, attacksPerSecond: sequence.hitsPerSecond,
      attackSequence: { hitCount: sequence.kickCount, totalSequenceFrames: sequence.totalSequenceFrames, label: `용의 발톱 ${sequence.kickCount}회 발차기` } };
  }
  if (support.input.characterClass === "ASSASSIN" && support.input.skill === "ASSASSIN_DRAGON_FLIGHT") {
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: 23,
      totalIAS: 0, effectiveIAS: null, currentBreakpoint: 0, nextBreakpoint: null,
      requiredAdditionalIAS: null, evidenceVersion: "D2R.org mechanics / Dragon Flight fixed 23-frame timing",
      reason: "용의 비상은 고정 23프레임입니다. IAS, 시전 속도, 이동 속도에 영향을 받지 않습니다.",
      attacksPerSecond: 25 / 23,
      attackSequence: { hitCount: 1, totalSequenceFrames: 23, label: "용의 비상 고정 공격" },
    };
  }
  if (support.input.characterClass === "ASSASSIN" && support.input.skill === "ASSASSIN_TRAP_LAYING") {
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = catalogWeapon?.wsm ?? IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier;
    if (wsm === null || wsm === undefined) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "선택한 무기의 WSM이 확인되지 않았습니다.");
    const calculation = calculateAssassinTrapLaying({ weaponSpeedModifier: wsm, totalIAS: support.input.totalIAS, burstOfSpeedLevel: support.input.burstOfSpeedLevel });
    if (calculation.status !== "REFERENCE_BASED" || calculation.framesPerTrap === null || calculation.effectiveIAS === null) return emptyResult(calculation.status, "INVALID_INPUT", calculation.reason);
    const rows = getAssassinTrapLayingBreakpointRows({ weaponSpeedModifier: wsm, burstOfSpeedLevel: support.input.burstOfSpeedLevel, maxIAS: IAS_HARD_MAX });
    const current = rows.filter((row) => row.ias <= support.input!.totalIAS).at(-1);
    const next = rows.find((row) => row.ias > support.input!.totalIAS);
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: calculation.framesPerTrap,
      totalIAS: support.input.totalIAS, effectiveIAS: calculation.effectiveIAS,
      currentBreakpoint: current?.ias ?? 0, nextBreakpoint: next?.ias ?? null,
      requiredAdditionalIAS: next ? next.ias - support.input.totalIAS : null,
      evidenceVersion: "D2R-3.3.93847-ASSASSIN-TRAP-LAYING-REFERENCE", reason: calculation.reason,
      trace: { weaponSpeedModifier: wsm, totalIAS: support.input.totalIAS, itemEffectiveIAS: calculation.itemEffectiveIAS ?? 0,
        eiasRaw: calculation.effectiveIAS, eiasApplied: calculation.effectiveIAS, animationSpeed: 128,
        framesPerDirection: 8, startingFrame: 0, speedIncrease: calculation.speedIncrease ?? 0,
        fullAnimationFrames: calculation.framesPerTrap },
    };
  }
  if (support.input.characterClass === "BARBARIAN" && support.input.skill === "BARBARIAN_DOUBLE_SWING") {
    const sequence = calculateBarbarianDoubleSwingReference({ primaryWeapon: "7cr", secondaryWeapon: support.input.secondaryWeaponCode as "7cr" | "whm", primaryWeaponIAS: support.input.weaponIAS });
    if (sequence.status !== "REFERENCE_BASED" || sequence.sequenceFrames === null) return emptyResult(sequence.status, sequence.status === "CONFLICTED" ? "CONFLICTED_REFERENCE" : "INVALID_INPUT", sequence.reason);
    const rows: { ias: number; fullAnimationFrames: number }[] = [];
    let previous = -1;
    for (let ias = 0; ias <= 456; ias++) {
      const sample = calculateBarbarianDoubleSwingReference({ primaryWeapon: "7cr", secondaryWeapon: support.input.secondaryWeaponCode as "7cr" | "whm", primaryWeaponIAS: ias });
      if (sample.sequenceFrames !== previous) rows.push({ ias, fullAnimationFrames: sample.sequenceFrames ?? 0 });
      previous = sample.sequenceFrames ?? previous;
    }
    const current = rows.filter((row) => row.ias <= support.input!.weaponIAS).at(-1);
    const next = rows.find((row) => row.ias > support.input!.weaponIAS);
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: sequence.sequenceFrames,
      totalIAS: support.input.weaponIAS, effectiveIAS: sequence.effectiveIAS, currentBreakpoint: current?.ias ?? 0,
      nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - support.input.weaponIAS : null,
      evidenceVersion: "D2R-3.3.93847-DOUBLE-SWING-REFERENCE", reason: sequence.reason,
      attacksPerSecond: sequence.attacksPerSecond,
      attackSequence: { hitCount: 2, totalSequenceFrames: sequence.sequenceFrames, label: "이중 타격 2회 합산 주기" } };
  }
  if (support.input.characterClass === "BARBARIAN" && support.input.skill === "BARBARIAN_FRENZY") {
    const primaryCatalog = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const secondaryCatalog = support.input.secondaryWeaponCode ? IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.secondaryWeaponCode) : undefined;
    const primaryWSM = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? primaryCatalog?.wsm;
    const secondaryWSM = IAS_WEAPONS[support.input.secondaryWeaponCode ?? ""]?.resolvedWeaponSpeedModifier ?? secondaryCatalog?.wsm;
    if (!primaryCatalog || !secondaryCatalog || primaryWSM === null || primaryWSM === undefined || secondaryWSM === null || secondaryWSM === undefined) {
      return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "Frenzy 양손의 WSM 자료를 찾을 수 없습니다.");
    }
    const frenzyInput = {
      primaryWeapon: { weaponSpeedModifier: primaryWSM, weaponIAS: support.input.weaponIAS },
      secondaryWeapon: { weaponSpeedModifier: secondaryWSM, weaponIAS: support.input.secondaryWeaponIAS },
      gearIAS: support.input.offWeaponIAS,
      frenzyBuffSIAS: support.input.frenzyBuffSIAS,
    };
    const sequence = calculateBarbarianFrenzyReference(frenzyInput);
    if (sequence.status !== "REFERENCE_BASED" || sequence.sequenceFrames === null) return emptyResult(sequence.status, "INVALID_INPUT", sequence.reason);
    const rows = getBarbarianFrenzyBreakpointRows({
      primaryWeapon: frenzyInput.primaryWeapon,
      secondaryWeapon: frenzyInput.secondaryWeapon,
      frenzyBuffSIAS: frenzyInput.frenzyBuffSIAS,
    });
    const current = rows.filter((row) => row.gearIAS <= support.input!.offWeaponIAS).at(-1);
    const next = rows.find((row) => row.gearIAS > support.input!.offWeaponIAS);
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT",
      fullAnimationFrames: sequence.sequenceFrames, totalIAS: support.input.totalIAS,
      effectiveIAS: sequence.effectiveIAS, currentBreakpoint: current?.gearIAS ?? 0,
      nextBreakpoint: next?.gearIAS ?? null,
      requiredAdditionalIAS: next ? next.gearIAS - support.input.offWeaponIAS : null,
      evidenceVersion: "D2R 3.3.93847 / 17-frame Frenzy sequence; reference-based",
      reason: sequence.reason, attacksPerSecond: sequence.swingsPerSecond,
      attackSequence: { hitCount: 2, totalSequenceFrames: sequence.sequenceFrames, label: "광분 양손 공격 시퀀스" },
    };
  }
  if (support.input.characterClass === "BARBARIAN" && support.input.skill === "BARBARIAN_DOUBLE_THROW") {
    const secondaryCode = support.input.secondaryWeaponCode;
    const primaryCatalog = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const secondaryCatalog = secondaryCode ? IAS_WEAPON_CATALOG.find((entry) => entry.code === secondaryCode) : undefined;
    const primaryWSM = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? primaryCatalog?.wsm;
    const secondaryWSM = IAS_WEAPONS[secondaryCode ?? ""]?.resolvedWeaponSpeedModifier ?? secondaryCatalog?.wsm;
    if (!primaryCatalog || !secondaryCatalog || primaryWSM === null || primaryWSM === undefined || secondaryWSM === null || secondaryWSM === undefined) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "Double Throw 양손의 WSM 자료를 찾을 수 없습니다.");
    const sequenceInput = {
      primary: { weaponSpeedModifier: primaryWSM, weaponIAS: support.input.weaponIAS },
      secondary: { weaponSpeedModifier: secondaryWSM, weaponIAS: support.input.secondaryWeaponIAS },
    };
    const sequence = calculateBarbarianDoubleThrow({ ...sequenceInput, gearIAS: support.input.offWeaponIAS });
    if (sequence.status !== "REFERENCE_BASED" || sequence.frames === null) return emptyResult(sequence.status, "INVALID_INPUT", sequence.reason);
    const rows = getBarbarianDoubleThrowBreakpointRows(sequenceInput, IAS_HARD_MAX);
    const current = rows.filter((row) => row.gearIAS <= support.input!.offWeaponIAS).at(-1);
    const next = rows.find((row) => row.gearIAS > support.input!.offWeaponIAS);
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: sequence.frames,
      totalIAS: support.input.weaponIAS + support.input.secondaryWeaponIAS + support.input.offWeaponIAS,
      effectiveIAS: sequence.effectiveIAS, currentBreakpoint: current?.gearIAS ?? 0,
      nextBreakpoint: next?.gearIAS ?? null, requiredAdditionalIAS: next ? next.gearIAS - support.input.offWeaponIAS : null,
      evidenceVersion: "D2R Tools IAS calculations / 12-FPD dual-wield Double Throw",
      reason: sequence.reason, attacksPerSecond: sequence.attacksPerSecond,
      attackSequence: { hitCount: 2, totalSequenceFrames: sequence.frames, label: "이중 투척 양손 공격 시퀀스" },
    };
  }
  if (support.input.characterClass === "ASSASSIN" && support.input.skill === "ASSASSIN_DRAGON_CLAW") {
    const secondaryCode = support.input.secondaryWeaponCode;
    const primaryCatalog = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const secondaryCatalog = secondaryCode ? IAS_WEAPON_CATALOG.find((entry) => entry.code === secondaryCode) : null;
    if (!secondaryCode || !primaryCatalog || !secondaryCatalog) return emptyResult("INVALID_INPUT", "INVALID_INPUT", "주무기와 보조 클러가 모두 필요합니다.");
    const sequence = calculateAssassinDragonClawReference({
      characterForm: support.input.characterForm,
      primaryWeapon: { code: primaryCatalog.code, wsm: primaryCatalog.wsm, weaponIAS: support.input.weaponIAS },
      secondaryWeapon: { code: secondaryCatalog.code, wsm: secondaryCatalog.wsm, weaponIAS: support.input.secondaryWeaponIAS },
      gearIAS: support.input.offWeaponIAS, burstOfSpeedLevel: support.input.burstOfSpeedLevel,
    });
    if (sequence.status !== "REFERENCE_BASED" || sequence.sequenceFrames === null) {
      return emptyResult(sequence.status, sequence.status === "CONFLICTED" ? "CONFLICTED_REFERENCE" : "INVALID_INPUT", sequence.reason);
    }
    const maxGearIAS = Math.max(0, Math.min(IAS_HARD_MAX - support.input.weaponIAS, IAS_HARD_MAX - support.input.secondaryWeaponIAS));
    const rows = getAssassinDragonClawBreakpointRows({
      characterForm: support.input.characterForm,
      primaryWeapon: { code: primaryCatalog.code, wsm: primaryCatalog.wsm, weaponIAS: support.input.weaponIAS },
      secondaryWeapon: { code: secondaryCatalog.code, wsm: secondaryCatalog.wsm, weaponIAS: support.input.secondaryWeaponIAS },
      gearIAS: 0, burstOfSpeedLevel: support.input.burstOfSpeedLevel,
    }, maxGearIAS).map((row) => ({ ...row, ias: row.ias + support.input!.weaponIAS }));
    const current = rows.filter((row) => row.ias <= support.input!.totalIAS).at(-1);
    const next = rows.find((row) => row.ias > support.input!.totalIAS);
    const wsm = primaryCatalog.wsm ?? 0;
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT",
      fullAnimationFrames: sequence.sequenceFrames, totalIAS: support.input.totalIAS,
      effectiveIAS: sequence.effectiveIAS, currentBreakpoint: current?.ias ?? 0,
      nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - support.input.totalIAS : null,
      evidenceVersion: sequence.evidenceVersion, reason: sequence.reason,
      attacksPerSecond: sequence.hitsPerSecond,
      attackSequence: { hitCount: sequence.hitCount, totalSequenceFrames: sequence.sequenceFrames, label: "용의 발톱 2회 연속 공격" },
      trace: {
        weaponSpeedModifier: wsm, totalIAS: support.input.totalIAS, itemEffectiveIAS: sequence.itemEffectiveIAS,
        eiasRaw: sequence.skillIAS + sequence.itemEffectiveIAS - wsm - 30, eiasApplied: sequence.effectiveIAS,
        animationSpeed: sequence.animationSpeed, framesPerDirection: 16, startingFrame: 0,
        speedIncrease: sequence.animationSpeed, fullAnimationFrames: sequence.sequenceFrames, skillSpeedModifier: -30,
      },
    };
  }
  if (support.input.skill === "AMAZON_FEND") {
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    const weaponClass = catalogWeapon?.weaponClass;
    if (wsm === null || wsm === undefined || (weaponClass !== "1ht" && weaponClass !== "2ht")) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "난격 시퀀스 또는 무기 WSM이 없어 계산할 수 없습니다.");
    return calculateAmazonFend(support.input, wsm, weaponClass);
  }
  if (support.input.skill === "AMAZON_STRAFE") {
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    const weaponClass = catalogWeapon?.weaponClass;
    if (wsm === null || wsm === undefined || (weaponClass !== "bow" && weaponClass !== "xbw")) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "속사 시퀀스 또는 무기 WSM이 없어 계산할 수 없습니다.");
    return calculateAmazonStrafe(support.input, wsm, weaponClass);
  }
  if (support.input.characterClass === "AMAZON" && support.input.skill.startsWith("AMAZON_") && support.input.skill !== "AMAZON_JAB" && support.input.skill !== "AMAZON_FEND" && support.input.skill !== "AMAZON_STRAFE" && !["AMAZON_MAGIC_ARROW", "AMAZON_FIRE_ARROW", "AMAZON_COLD_ARROW", "AMAZON_MULTIPLE_SHOT", "AMAZON_EXPLODING_ARROW", "AMAZON_ICE_ARROW", "AMAZON_GUIDED_ARROW", "AMAZON_FREEZING_ARROW", "AMAZON_IMMOLATION_ARROW", "AMAZON_POWER_STRIKE", "AMAZON_CHARGED_STRIKE", "AMAZON_LIGHTNING_STRIKE"].includes(support.input.skill)) {
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    if (wsm === null || wsm === undefined) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "투척 무기 WSM이 없어 계산할 수 없습니다.");
    return calculateAmazonThrow(support.input, wsm);
  }
  if (support.input.characterClass === "DRUID" && (support.input.skill === "DRUID_WEREWOLF_NORMAL_ATTACK" || support.input.skill === "DRUID_WEREBEAR_NORMAL_ATTACK")) {
    const weaponClass = referenceWeaponClass("DRUID", support.input.weaponCode, "NORMAL_ATTACK", support.input.weaponMode);
    const profile = weaponClass ? getNormalAttackProfile("DRUID", weaponClass) : null;
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    if (!profile || wsm === null || wsm === undefined) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "변신형 공격에 사용할 Human A1 프로필 또는 WSM을 확인할 수 없습니다.");
    const form = support.input.skill === "DRUID_WEREWOLF_NORMAL_ATTACK" ? "WEREWOLF" : "WEREBEAR";
    const bearMaulSIAS = form === "WEREBEAR" ? getDruidMaulSIAS(support.input.skillLevel, support.input.maulCharges) ?? 0 : 0;
    const calculation = calculateDruidShapeshiftStandardAttack({
      form, weaponSpeedModifier: wsm, totalIAS: support.input.totalIAS,
      humanA1Profile: { framesPerDirection: profile.framesPerDirection, animationSpeed: profile.animationSpeed, startingFrame: profile.startingFrame },
      skillIAS: support.input.skillIAS, buffIAS: bearMaulSIAS,
    });
    if (calculation.status !== "REFERENCE_BASED" || calculation.framesPerAttack === null) return emptyResult(calculation.status, "INVALID_INPUT", calculation.reason);
    const breakpointRows = getDruidShapeshiftBreakpointRows({
      form, weaponSpeedModifier: wsm, maxIAS: IAS_HARD_MAX,
      humanA1Profile: { framesPerDirection: profile.framesPerDirection, animationSpeed: profile.animationSpeed, startingFrame: profile.startingFrame },
      skillIAS: support.input.skillIAS, buffIAS: bearMaulSIAS,
    });
    const current = breakpointRows.filter((row) => row.ias <= support.input!.totalIAS).at(-1);
    const next = breakpointRows.find((row) => row.ias > support.input!.totalIAS);
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT",
      fullAnimationFrames: calculation.framesPerAttack, totalIAS: support.input.totalIAS,
      effectiveIAS: calculation.effectiveIASAfterModifiers, currentBreakpoint: current?.ias ?? 0,
      nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - support.input.totalIAS : null,
      evidenceVersion: "D2R-3.3.93847-DRUID-WEREFORM-REFERENCE",
      reason: calculation.reason, attacksPerSecond: calculation.attacksPerSecond,
      trace: {
        weaponSpeedModifier: wsm, totalIAS: support.input.totalIAS, itemEffectiveIAS: calculation.effectiveIAS,
        eiasRaw: calculation.effectiveIASAfterModifiers, eiasApplied: calculation.effectiveIASAfterModifiers,
        animationSpeed: profile.animationSpeed, framesPerDirection: calculation.wereformFramesPerDirection ?? 0,
        startingFrame: 0, speedIncrease: calculation.speedIncrease ?? 0,
        fullAnimationFrames: calculation.framesPerAttack,
      },
    };
  }
  if (support.input.characterClass === "DRUID" && support.input.skill === "DRUID_WEREWOLF_FURY") {
    const weaponClass = referenceWeaponClass("DRUID", support.input.weaponCode, "NORMAL_ATTACK", support.input.weaponMode);
    const profile = weaponClass ? getNormalAttackProfile("DRUID", weaponClass) : null;
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    const skillIAS = getDruidWerewolfSIAS(support.input.skillLevel);
    if (!profile || wsm === null || wsm === undefined || skillIAS === null) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "격노에 필요한 Human A1 프로필, WSM 또는 늑대인간 기술 레벨 자료가 없습니다.");
    const profileInput = { weaponSpeedModifier: wsm, humanA1Profile: { framesPerDirection: profile.framesPerDirection, animationSpeed: profile.animationSpeed, startingFrame: profile.startingFrame }, skillIAS };
    const sequence = calculateDruidWerewolfFurySequence({ ...profileInput, form: "WEREWOLF", totalIAS: support.input.totalIAS });
    if (sequence.status !== "REFERENCE_BASED" || sequence.totalSequenceFrames === null) return emptyResult(sequence.status, "UNVERIFIED_ANIMATION", sequence.reason);
    const rows: { ias: number; fullAnimationFrames: number }[] = [];
    let previous = -1;
    for (let ias = 0; ias <= IAS_HARD_MAX; ias++) {
      const sample = calculateDruidWerewolfFurySequence({ ...profileInput, form: "WEREWOLF", totalIAS: ias });
      if (sample.totalSequenceFrames !== previous) rows.push({ ias, fullAnimationFrames: sample.totalSequenceFrames ?? 0 });
      previous = sample.totalSequenceFrames ?? previous;
    }
    const current = rows.filter((row) => row.ias <= support.input!.totalIAS).at(-1);
    const next = rows.find((row) => row.ias > support.input!.totalIAS);
    return { status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: sequence.totalSequenceFrames,
      totalIAS: support.input.totalIAS, effectiveIAS: sequence.effectiveIASAfterModifiers, currentBreakpoint: current?.ias ?? 0,
      nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - support.input.totalIAS : null,
      evidenceVersion: "D2R-3.3.93847-WEREWOLF-FURY-WARREN-1.2.6", reason: sequence.reason,
      attacksPerSecond: sequence.attacksPerSecond,
      attackSequence: { hitCount: 5, totalSequenceFrames: sequence.totalSequenceFrames, label: "늑대인간 격노 5타 시퀀스" } };
  }
  if (support.input.characterClass === "DRUID" && ["DRUID_FERAL_RAGE", "DRUID_FIRE_CLAWS", "DRUID_MAUL", "DRUID_HUNGER", "DRUID_RABIES"].includes(support.input.skill)) {
    const form = support.input.characterForm as "WEREWOLF" | "WEREBEAR";
    const weaponClass = referenceWeaponClass("DRUID", support.input.weaponCode, "NORMAL_ATTACK", support.input.weaponMode);
    const profile = weaponClass ? getNormalAttackProfile("DRUID", weaponClass) : null;
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    const wolfSkillIAS = form === "WEREWOLF" ? getDruidWerewolfSIAS(support.input.skillLevel) : 0;
    const maulSIAS = form === "WEREBEAR" ? getDruidMaulSIAS(support.input.skillLevel, support.input.maulCharges) : 0;
    if (!profile || wsm === null || wsm === undefined || wolfSkillIAS === null || maulSIAS === null) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "변신 A1 프로필, WSM, 늑대인간 레벨 또는 Maul 충전 자료가 필요합니다.");
    const attackFramesPerDirection = form === "WEREWOLF" && (support.input.skill === "DRUID_HUNGER" || support.input.skill === "DRUID_RABIES") ? 10 : undefined;
    const profileInput = {
      form, weaponSpeedModifier: wsm, totalIAS: support.input.totalIAS,
      humanA1Profile: { framesPerDirection: profile.framesPerDirection, animationSpeed: profile.animationSpeed, startingFrame: profile.startingFrame },
      skillIAS: wolfSkillIAS, buffIAS: maulSIAS, attackFramesPerDirection,
    };
    const calculation = calculateDruidShapeshiftStandardAttack(profileInput);
    if (calculation.status !== "REFERENCE_BASED" || calculation.framesPerAttack === null) return emptyResult(calculation.status, "INVALID_INPUT", calculation.reason);
    const rows = getDruidShapeshiftBreakpointRows({ ...profileInput, maxIAS: IAS_HARD_MAX });
    const current = rows.filter((row) => row.ias <= support.input!.totalIAS).at(-1);
    const next = rows.find((row) => row.ias > support.input!.totalIAS);
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: calculation.framesPerAttack,
      totalIAS: support.input.totalIAS, effectiveIAS: calculation.effectiveIASAfterModifiers,
      currentBreakpoint: current?.ias ?? 0, nextBreakpoint: next?.ias ?? null,
      requiredAdditionalIAS: next ? next.ias - support.input.totalIAS : null,
      evidenceVersion: "D2R-3.3.93847-DRUID-WEREFORM-SKILL-REFERENCE", reason: calculation.reason,
      attacksPerSecond: calculation.attacksPerSecond,
      trace: { weaponSpeedModifier: wsm, totalIAS: support.input.totalIAS, itemEffectiveIAS: calculation.effectiveIAS ?? 0,
        eiasRaw: calculation.effectiveIASAfterModifiers ?? 0, eiasApplied: calculation.effectiveIASAfterModifiers ?? 0,
        animationSpeed: profile.animationSpeed, framesPerDirection: calculation.wereformFramesPerDirection ?? 0,
        startingFrame: profile.startingFrame, speedIncrease: calculation.speedIncrease ?? 0,
        fullAnimationFrames: calculation.framesPerAttack, skillSpeedModifier: wolfSkillIAS + maulSIAS },
    };
  }
  if (support.input.characterClass === "BARBARIAN" && support.input.skill === "BARBARIAN_WHIRLWIND") {
    const catalog = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    if (!catalog) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "선택한 Whirlwind 무기 자료가 없습니다.");
    const primary = { code: catalog.code, weaponIAS: support.input.weaponIAS, weaponMode: support.input.weaponMode === "TWO_HAND" ? "TWO_HAND" as const : "ONE_HAND" as const };
    const secondaryCatalog = support.input.secondaryWeaponCode ? IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input.secondaryWeaponCode) : undefined;
    if (support.input.secondaryWeaponCode && !secondaryCatalog) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "선택한 보조 무기 자료가 없습니다.");
    const secondary = secondaryCatalog ? { code: secondaryCatalog.code, weaponIAS: support.input.secondaryWeaponIAS, weaponMode: "ONE_HAND" as const } : undefined;
    const calculation = calculateBarbarianWhirlwind({ primaryWeapon: primary, secondaryWeapon: secondary, gearIAS: support.input.offWeaponIAS });
    if (calculation.status !== "REFERENCE_BASED" || calculation.hitIntervalFrames === null) return emptyResult(calculation.status, "UNVERIFIED_WEAPON", calculation.reason);
    const rows = getBarbarianWhirlwindBreakpointRows({ primaryWeapon: primary, secondaryWeapon: secondary }, IAS_HARD_MAX);
    const current = rows.filter((row) => row.gearIAS <= support.input!.offWeaponIAS).at(-1);
    const next = rows.find((row) => row.gearIAS > support.input!.offWeaponIAS);
    const totalIAS = support.input.weaponIAS + support.input.secondaryWeaponIAS + support.input.offWeaponIAS;
    return {
      status: "REFERENCE_BASED", reasonCode: "REFERENCE_BASED_RESULT", fullAnimationFrames: calculation.hitIntervalFrames,
      totalIAS, effectiveIAS: null, currentBreakpoint: current?.gearIAS ?? 0,
      nextBreakpoint: next?.gearIAS ?? null, requiredAdditionalIAS: next ? next.gearIAS - support.input.offWeaponIAS : null,
      evidenceVersion: "D2R-2.4.3-3.3.93847-BARBARIAN-WHIRLWIND", reason: calculation.reason,
      attacksPerSecond: calculation.hitsPerSecond,
      attackSequence: { hitCount: secondary ? 2 : 1, totalSequenceFrames: calculation.hitIntervalFrames, label: secondary ? "소용돌이 양손 타격 간격" : "소용돌이 타격 간격" },
    };
  }
  if (support.status === "REFERENCE_BASED") {
    if (support.input.skill === "AMAZON_JAB") {
      const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
      const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
      const sequenceLength = amazonJabSequenceLength(support.input.weaponCode, support.input.weaponMode);
      if (wsm === null || wsm === undefined || sequenceLength === null) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "잽 시퀀스 또는 무기 WSM이 없어 계산할 수 없습니다.");
      return calculateReferenceAmazonJab(support.input, wsm, sequenceLength);
    }
    const normalReferenceSkill = support.input.skill === "NECROMANCER_POISON_DAGGER" || support.input.skill === "ASSASSIN_DRAGON_TAIL" ? "NORMAL_ATTACK" : support.input.skill;
    const weaponClass = referenceWeaponClass(support.input.characterClass, support.input.weaponCode, normalReferenceSkill, support.input.weaponMode);
    const profile = weaponClass ? getNormalAttackProfile(support.input.characterClass, weaponClass) : null;
    const catalogWeapon = IAS_WEAPON_CATALOG.find((entry) => entry.code === support.input!.weaponCode);
    const wsm = IAS_WEAPONS[support.input.weaponCode]?.resolvedWeaponSpeedModifier ?? catalogWeapon?.wsm;
    if (!profile || wsm === null || wsm === undefined) return emptyResult("UNVERIFIED", "UNVERIFIED_WEAPON", "공개 기준 프로필 또는 무기 WSM이 없어 계산할 수 없습니다.");
    const normalResult = calculateReferenceNormalAttack(support.input, profile, wsm);
    if (support.input.characterClass === "AMAZON" && support.input.skill === "AMAZON_IMMOLATION_ARROW") {
      const cadenceInput = { weaponSpeedModifier: wsm, actionFrame: profile.actionFrame,
        animationSpeed: profile.animationSpeed, skillIAS: support.input.skillIAS, buffIAS: support.input.buffIAS,
        debuffIAS: support.input.debuffIAS, fanaticismSIAS: support.input.fanaticismLevel ? fanaticismSIAS(support.input.fanaticismLevel) : 0 };
      const cadence = calculateAmazonImmolationCadence({ ...cadenceInput, totalIAS: support.input.totalIAS });
      const rows = getAmazonImmolationCadenceBreakpointRows(cadenceInput, IAS_HARD_MAX);
      const current = rows.filter((row) => row.ias <= support.input!.totalIAS).at(-1);
      const next = rows.find((row) => row.ias > support.input!.totalIAS);
      if (!cadence) return emptyResult("UNVERIFIED", "UNVERIFIED_ANIMATION", "점화 화살 연속 발사 간격을 계산할 수 없습니다.");
      return { ...normalResult, fullAnimationFrames: normalResult.fullAnimationFrames,
        currentBreakpoint: current?.ias ?? 0, nextBreakpoint: next?.ias ?? null,
        requiredAdditionalIAS: next ? next.ias - support.input.totalIAS : null,
        attacksPerSecond: cadence.attacksPerSecond,
        attackCadence: { actionFrame: cadence.actionFrame, localDelayFrames: cadence.localDelayFrames, intervalFrames: cadence.intervalFrames },
        evidenceVersion: "D2R-3.3.93847-AMAZON-IMMOLATION-LOCAL-DELAY-CADENCE",
        reason: "Amazon 활/석궁 일반 공격 액션 프레임과 D2R 점화 화살 15프레임 로컬 지연을 합산한 연속 발사 간격 참고값입니다." };
    }
    return normalResult;
  }
  if (support.input.characterClass === "BARBARIAN") return calculateBarbarianNormalAttack(support.input);

  const weapon = IAS_WEAPONS[support.input.weaponCode];
  const totalIAS = support.input.totalIAS;
  const itemEffectiveIAS = Math.floor((120 * totalIAS) / (120 + totalIAS));
  const eiasRaw = itemEffectiveIAS + (support.input.fanaticismLevel ? fanaticismSIAS(support.input.fanaticismLevel) : 0) - weapon.resolvedWeaponSpeedModifier;
  const eiasApplied = Math.max(-85, Math.min(75, eiasRaw));
  const speedIncrease = Math.floor((PALADIN_CRS_A1.animationSpeed * (100 + eiasApplied)) / 100);

  if (speedIncrease <= 0) {
    return emptyResult("INVALID_INPUT", "INVALID_INPUT", "계산된 애니메이션 속도가 유효하지 않습니다.");
  }

  const fullAnimationFrames =
    Math.ceil((256 * (PALADIN_CRS_A1.framesPerDirection - PALADIN_CRS_A1.startingFrame)) / speedIncrease) - 1;
  const expectedFrames = support.input.fanaticismLevel ? fullAnimationFrames : support.input.skill === "NORMAL_ATTACK"
    ? getGoldenFrameCount(support.input.weaponCode, totalIAS)
    : getSkillGoldenFrameCount(support.input.skill as keyof typeof IAS_SKILLS, support.input.weaponCode, totalIAS);
  if (expectedFrames === null || fullAnimationFrames !== expectedFrames) {
    return emptyResult(
      "UNVERIFIED",
      "GOLDEN_DATA_MISMATCH",
      "계산 결과가 독립 Golden Dataset과 일치하지 않아 숫자를 제공하지 않습니다.",
    );
  }

  const breakpoint = support.input.fanaticismLevel
    ? (() => {
      const rows = Array.from({ length: (weapon.maxIAS + 1) }, (_, ias) => {
        const ieias = Math.floor((120 * ias) / (120 + ias));
        const eias = Math.max(-85, Math.min(75, ieias + fanaticismSIAS(support.input!.fanaticismLevel) - weapon.resolvedWeaponSpeedModifier));
        const speed = Math.floor((PALADIN_CRS_A1.animationSpeed * (100 + eias)) / 100);
        return { ias, frames: Math.ceil((256 * (PALADIN_CRS_A1.framesPerDirection - PALADIN_CRS_A1.startingFrame)) / speed) - 1 };
      });
      const current = rows[totalIAS]; const prior = rows.slice(0, totalIAS).reverse().find(row => row.frames !== current.frames);
      const next = rows.slice(totalIAS + 1).find(row => row.frames < current.frames);
      const breakpointIAS = prior ? rows.find(row => row.ias > prior.ias && row.frames === current.frames)!.ias : 0;
      return { currentBreakpoint: breakpointIAS, nextBreakpoint: next?.ias ?? null, requiredAdditionalIAS: next ? next.ias - totalIAS : null, fullAnimationFrames };
    })()
    : getBreakpointDetails(totalIAS, support.input.weaponCode);
  if (!breakpoint) {
    return emptyResult("UNVERIFIED", "GOLDEN_DATA_MISMATCH", "Golden Dataset에 해당 IAS 결과가 없습니다.");
  }

  const trace: CalculationTrace = {
    weaponSpeedModifier: weapon.resolvedWeaponSpeedModifier,
    totalIAS,
    itemEffectiveIAS,
    eiasRaw,
    eiasApplied,
    animationSpeed: PALADIN_CRS_A1.animationSpeed,
    framesPerDirection: PALADIN_CRS_A1.framesPerDirection,
    startingFrame: PALADIN_CRS_A1.startingFrame,
    speedIncrease,
    fullAnimationFrames,
  };

  return {
    status: "SUPPORTED",
    reasonCode: "SUPPORTED_GOLDEN_MATCH",
    fullAnimationFrames,
    totalIAS,
    effectiveIAS: eiasApplied,
    currentBreakpoint: breakpoint.currentBreakpoint,
    nextBreakpoint: breakpoint.nextBreakpoint,
    requiredAdditionalIAS: breakpoint.requiredAdditionalIAS,
    evidenceVersion: support.input.fanaticismLevel ? "D2R-3.3.93847-IAS-4E-FANATICISM" : IAS_EVIDENCE_VERSION,
    reason: `${IAS_SKILLS[support.input.skill as keyof typeof IAS_SKILLS].label}: ${support.reason}`,
    trace,
  };
}
