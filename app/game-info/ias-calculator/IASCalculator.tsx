'use client';

import { useMemo, useState } from 'react';
import { constrainIASInput, getCalculatorViewModelFromParts, getWeaponBreakpoints, getZealBreakpoints, getZealHitCountFromSkillLevel } from '../../../lib/ias/ui-model';
import { IAS_WEAPONS } from '../../../lib/ias/weapons';
import { IAS_SKILLS } from '../../../lib/ias/skills';
import GameInfoNavigation from '../GameInfoNavigation';
import styles from './ias-calculator.module.css';
import { SMITE_MAX_IAS_BY_WEAPON } from '../../../lib/ias/constants';
import { filterIASWeaponCatalog, IAS_WEAPON_CATALOG, type WeaponCombinationStatus } from '../../../lib/ias/weapon-catalog';
import { localizedWeaponName, WEAPON_CATEGORY_KO } from '../../../lib/ias/weapon-localization';
import { fanaticismSIAS } from '../../../lib/ias/fanaticism';
import { BARBARIAN_TWO_HANDED_WEAPONS, BARBARIAN_WEAPONS, getClassSkill, getClassSkills } from '../../../lib/ias/class-registry';
import { canUseReferenceNormalAttack, getNormalAttackProfile, referenceWeaponClass as getReferenceWeaponClass, getReferenceAmazonJabBreakpointRows, getReferenceNormalBreakpointRows } from '../../../lib/ias/reference-normal-attack';
import { getAmazonFendBreakpointRows } from '../../../lib/ias/amazon-fend';
import { getAmazonStrafeBreakpointRows } from '../../../lib/ias/amazon-strafe';
import { getAmazonThrowBreakpointRows } from '../../../lib/ias/amazon-throw';
import { getDruidShapeshiftBreakpointRows, getDruidWerewolfSIAS, getDruidMaulMaxCharges, getDruidMaulSIAS, calculateDruidWerewolfFurySequence } from '../../../lib/ias/druid-shapeshift-reference';
import { getAssassinDragonClawBreakpointRows, assassinBurstOfSpeedSIAS } from '../../../lib/ias/assassin-dual-claw';
import { getAssassinTrapLayingBreakpointRows } from '../../../lib/ias/assassin-trap-laying';
import { getAssassinChargeUpBreakpoints } from '../../../lib/ias/assassin-charge-up';
import { calculateAssassinDragonTalonReference } from '../../../lib/ias/assassin-dragon-talon';
import { calculateBarbarianDoubleSwingReference } from '../../../lib/ias/barbarian-double-swing-reference';
import { getBarbarianWhirlwindBreakpointRows } from '../../../lib/ias/barbarian-whirlwind';
import { getBarbarianFrenzyBreakpointRows, getBarbarianFrenzyMaxSIAS } from '../../../lib/ias/barbarian-frenzy-reference';
import { calculateAmazonImpaleReference } from '../../../lib/ias/amazon-impale';
import { getAmazonImmolationCadenceBreakpointRows } from '../../../lib/ias/amazon-immolation-cadence';
import { calculatePaladinChargeReference } from '../../../lib/ias/paladin-charge-reference';
import { getBarbarianDoubleThrowBreakpointRows } from '../../../lib/ias/barbarian-double-throw';

const classes = [
  ['AMAZON', '아마존'], ['ASSASSIN', '암살자'], ['BARBARIAN', '야만용사'], ['DRUID', '드루이드'],
  ['NECROMANCER', '강령술사'], ['PALADIN', '성기사'], ['SORCERESS', '원소술사'], ['WARLOCK', '워록'],
] as const;
const weaponByCode = new Map(IAS_WEAPON_CATALOG.map(weapon => [weapon.code, weapon]));
const weaponCategories = [...new Set(IAS_WEAPON_CATALOG.filter(weapon => weapon.spawnable).map(weapon => weapon.itemTypeName ?? weapon.itemType))].sort();
const barbarianWhirlwindOffhands = IAS_WEAPON_CATALOG.filter(weapon => weapon.spawnable && weapon.wsm !== null && canUseReferenceNormalAttack('BARBARIAN', weapon.code, 'BARBARIAN_NORMAL_ATTACK', 'ONE_HAND'));
const barbarianFrenzyWeapons = IAS_WEAPON_CATALOG.filter(weapon => weapon.spawnable && (IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier !== undefined || weapon.wsm !== null) && canUseReferenceNormalAttack('BARBARIAN', weapon.code, 'BARBARIAN_NORMAL_ATTACK', 'ONE_HAND'));
const barbarianDoubleThrowWeapons = IAS_WEAPON_CATALOG.filter(weapon => getClassSkill('BARBARIAN', 'BARBARIAN_DOUBLE_THROW')?.supportedWeapons.includes(weapon.code));

function getIASLimit(skillCode: string, weaponCode: string, characterClass: string, weaponMode: 'ONE_HAND' | 'TWO_HAND' | 'DEFAULT' = 'DEFAULT') {
  if (characterClass === 'PALADIN' && skillCode === 'PALADIN_CHARGE') return IAS_SKILLS.NORMAL_ATTACK.iasRange?.[weaponCode]?.max ?? 0;
  if (skillCode === 'ZEAL') return IAS_SKILLS.ZEAL.iasRange?.[weaponCode]?.max ?? 0;
  if (skillCode === 'SMITE') return SMITE_MAX_IAS_BY_WEAPON[weaponCode] ?? 0;
  const classSkill = getClassSkill(characterClass, skillCode);
  if (classSkill?.maxIASByWeapon[weaponCode] !== undefined) return classSkill.maxIASByWeapon[weaponCode];
  const skillDefinition = IAS_SKILLS[skillCode as keyof typeof IAS_SKILLS];
  if (!skillDefinition?.supportedWeapons.includes(weaponCode)) return canUseReferenceNormalAttack(characterClass, weaponCode, skillCode, weaponMode) ? 456 : 0;
  return skillDefinition.iasRange?.[weaponCode]?.max ?? IAS_WEAPONS[weaponCode]?.maxIAS ?? (canUseReferenceNormalAttack(characterClass, weaponCode, skillCode, weaponMode) ? 456 : 0);
}

export default function IASCalculator() {
  const [characterClass, setCharacterClass] = useState('PALADIN');
  const [characterForm, setCharacterForm] = useState('HUMAN');
  const [weaponCode, setWeaponCode] = useState('crs');
  const [secondaryWeaponCode, setSecondaryWeaponCode] = useState('9tw');
  const [secondaryWeaponIAS, setSecondaryWeaponIAS] = useState('0');
  const [burstOfSpeedLevel, setBurstOfSpeedLevel] = useState(0);
  const [weaponMode, setWeaponMode] = useState<'ONE_HAND' | 'TWO_HAND'>('ONE_HAND');
  const [skill, setSkill] = useState('NORMAL_ATTACK');
  const [paladinChargeMode, setPaladinChargeMode] = useState<'RUSH' | 'MELEE_FALLBACK'>('RUSH');
  const [animation, setAnimation] = useState('A1');
  const [weaponIAS, setWeaponIAS] = useState('0');
  const [offWeaponIAS, setOffWeaponIAS] = useState('0');
  const [skillLevel, setSkillLevel] = useState(4);
  const [maulCharges, setMaulCharges] = useState(0);
  const [frenzyAtMaximum, setFrenzyAtMaximum] = useState(false);
  const [fendTargetCount, setFendTargetCount] = useState(2);
  const [strafeShotCount, setStrafeShotCount] = useState(2);
  const [weaponSearch, setWeaponSearch] = useState('');
  const [weaponCategory, setWeaponCategory] = useState('ALL');
  const [weaponHandedness, setWeaponHandedness] = useState<'ALL' | 'one-handed' | 'two-handed' | 'conditional'>('ALL');
  const [weaponSupport, setWeaponSupport] = useState<'ALL' | WeaponCombinationStatus>('ALL');
  const [fanaticismLevel, setFanaticismLevel] = useState(0);
  const hitCount = skill === 'AMAZON_FEND' ? fendTargetCount : skill === 'AMAZON_STRAFE' ? strafeShotCount : getZealHitCountFromSkillLevel(skillLevel) ?? 5;
  const selectedWeapon = IAS_WEAPONS[weaponCode];
  const selectedWeaponLabel = selectedWeapon?.name ?? weaponByCode.get(weaponCode)?.name;
  const isPaladinCharge = characterClass === 'PALADIN' && skill === 'PALADIN_CHARGE';
  const selectedSkill = useMemo(() => characterClass === 'PALADIN'
    ? isPaladinCharge
      ? ({ ...IAS_SKILLS.NORMAL_ATTACK, label: '돌진 (Charge)', evidenceSource: 'D2R.org build 3.3.93847 Charge mechanics and Amazon Basin Charge rules.', evidenceUrls: ['https://d2r.org/mechanics/charge', 'https://theamazonbasin.com/wiki/index.php/Charge'], evidenceScope: 'Actual out-of-range Charge rush has no IAS frame result. In-melee Charge falls back to plain Paladin A1 normal attack, without Charge bonuses.', evidenceNote: '실제 돌진은 IAS 계산에서 제외합니다. 근접 범위 예외는 A1 일반 공격으로 계산하며 Charge 보너스는 적용하지 않습니다.' } as typeof IAS_SKILLS.NORMAL_ATTACK)
      : IAS_SKILLS[skill as keyof typeof IAS_SKILLS]
    : getClassSkill(characterClass, skill), [characterClass, skill, isPaladinCharge]);
  const isDragonClaw = characterClass === 'ASSASSIN' && skill === 'ASSASSIN_DRAGON_CLAW';
  const isAssassinChargeUp = characterClass === 'ASSASSIN' && ['ASSASSIN_FISTS_OF_FIRE', 'ASSASSIN_CLAWS_OF_THUNDER', 'ASSASSIN_BLADES_OF_ICE'].includes(skill);
  const isDragonTalon = characterClass === 'ASSASSIN' && skill === 'ASSASSIN_DRAGON_TALON';
  const isDragonFlight = characterClass === 'ASSASSIN' && skill === 'ASSASSIN_DRAGON_FLIGHT';
  const isTrapLaying = characterClass === 'ASSASSIN' && skill === 'ASSASSIN_TRAP_LAYING';
  const isDoubleSwing = characterClass === 'BARBARIAN' && skill === 'BARBARIAN_DOUBLE_SWING';
  const isFrenzy = characterClass === 'BARBARIAN' && skill === 'BARBARIAN_FRENZY';
  const isDoubleThrow = characterClass === 'BARBARIAN' && skill === 'BARBARIAN_DOUBLE_THROW';
  const isAmazonImpale = characterClass === 'AMAZON' && skill === 'AMAZON_IMPALE';
  const isWhirlwind = characterClass === 'BARBARIAN' && skill === 'BARBARIAN_WHIRLWIND';
  const isDruidFury = characterClass === 'DRUID' && skill === 'DRUID_WEREWOLF_FURY';
  const isDruidWereformSkill = characterClass === 'DRUID' && ['DRUID_WEREWOLF_NORMAL_ATTACK', 'DRUID_WEREBEAR_NORMAL_ATTACK', 'DRUID_WEREWOLF_FURY', 'DRUID_FERAL_RAGE', 'DRUID_FIRE_CLAWS', 'DRUID_MAUL', 'DRUID_HUNGER', 'DRUID_RABIES'].includes(skill);
  const isDruidWolfAttack = characterClass === 'DRUID' && characterForm === 'WEREWOLF' && isDruidWereformSkill;
  const isDruidBearAttack = characterClass === 'DRUID' && characterForm === 'WEREBEAR' && isDruidWereformSkill;
  const clawOptions = useMemo(() => IAS_WEAPON_CATALOG.filter(weapon => weapon.spawnable && weapon.itemTypeClassTag === 'ass' && weapon.wsm !== null), []);
  const compatibleAnimation = skill === 'SMITE' ? 'S1' : skill === 'NORMAL_ATTACK' || skill === 'BARBARIAN_NORMAL_ATTACK' ? animation : selectedSkill && 'animationMode' in selectedSkill ? selectedSkill.animationMode : null;
  const verifiedWeaponCodes = useMemo(() => (characterClass === 'PALADIN' && (compatibleAnimation === 'A1' || compatibleAnimation === 'S1')
    ? (selectedSkill?.supportedWeapons ?? [])
    : characterClass === 'BARBARIAN' && skill === 'BARBARIAN_NORMAL_ATTACK'
      ? Object.keys(BARBARIAN_WEAPONS)
      : characterClass === 'BARBARIAN' && skill === 'BARBARIAN_TWO_HANDED_NORMAL_ATTACK'
        ? Object.keys(BARBARIAN_TWO_HANDED_WEAPONS)
    : []), [characterClass, compatibleAnimation, selectedSkill, skill]);
  const weaponStatuses = useMemo(() => Object.fromEntries(IAS_WEAPON_CATALOG.map(weapon => {
    if (isDragonClaw || isAssassinChargeUp) {
      const supportedClaw = selectedSkill?.supportedWeapons.includes(weapon.code) && weapon.wsm !== null;
      return [weapon.code, (supportedClaw ? 'REFERENCE_BASED' : 'UNSUPPORTED') as WeaponCombinationStatus];
    }
    if (isDragonFlight) return [weapon.code, selectedSkill?.supportedWeapons.includes(weapon.code) ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    if (isDoubleThrow) return [weapon.code, selectedSkill?.supportedWeapons.includes(weapon.code) && (IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier !== undefined || weapon.wsm !== null) ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    if (isDragonTalon) return [weapon.code, selectedSkill?.supportedWeapons.includes(weapon.code) && weapon.wsm !== null ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    if (isTrapLaying) return [weapon.code, selectedSkill?.supportedWeapons.includes(weapon.code) && weapon.wsm !== null ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    if (isDoubleSwing) return [weapon.code, weapon.code === '7cr' ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    if (isFrenzy) return [weapon.code, selectedSkill?.supportedWeapons.includes(weapon.code) && (IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier !== undefined || weapon.wsm !== null) ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    if (isWhirlwind) return [weapon.code, selectedSkill?.supportedWeapons.includes(weapon.code) && (IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier !== undefined || weapon.wsm !== null) ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    if (characterClass === 'NECROMANCER' && skill === 'NECROMANCER_POISON_DAGGER') return [weapon.code, selectedSkill?.supportedWeapons.includes(weapon.code) && weapon.wsm !== null ? 'REFERENCE_BASED' as WeaponCombinationStatus : 'UNSUPPORTED' as WeaponCombinationStatus];
    const barbarianUsesNormalA1 = ['BARBARIAN_NORMAL_ATTACK', 'BARBARIAN_TWO_HANDED_NORMAL_ATTACK', 'BARBARIAN_CONCENTRATE', 'BARBARIAN_BERSERK', 'BARBARIAN_BASH', 'BARBARIAN_STUN'].includes(skill);
    const referenceSkill = characterClass === 'BARBARIAN' && barbarianUsesNormalA1 ? 'BARBARIAN_NORMAL_ATTACK' : 'NORMAL_ATTACK';
    const isAmazonJab = characterClass === 'AMAZON' && skill === 'AMAZON_JAB';
    const isDruidReferenceAttack = characterClass === 'DRUID' && ['DRUID_WEREWOLF_NORMAL_ATTACK', 'DRUID_WEREBEAR_NORMAL_ATTACK', 'DRUID_WEREWOLF_FURY', 'DRUID_FERAL_RAGE', 'DRUID_FIRE_CLAWS', 'DRUID_MAUL', 'DRUID_HUNGER', 'DRUID_RABIES'].includes(skill);
    const isNormalAttack = characterClass === 'BARBARIAN' ? barbarianUsesNormalA1 : skill === 'NORMAL_ATTACK' || isPaladinCharge || skill === 'NECROMANCER_POISON_DAGGER' || skill === 'ASSASSIN_DRAGON_TAIL' || isDruidReferenceAttack || (characterClass === 'AMAZON' && skill.startsWith('AMAZON_') && skill !== 'AMAZON_JAB');
    const statusMode = weapon.handedness === 'two-handed' ? 'TWO_HAND' : 'ONE_HAND';
    const refWeaponClass = isNormalAttack ? getReferenceWeaponClass(characterClass, weapon.code, referenceSkill, statusMode) : null;
    const referenceProfile = refWeaponClass ? getNormalAttackProfile(characterClass, refWeaponClass) : null;
    const hasKnownWsm = IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier !== undefined || weapon.wsm !== null;
    const isReference = !verifiedWeaponCodes.includes(weapon.code) && (isAmazonJab || (characterClass === 'AMAZON' && selectedSkill && 'supportedWeapons' in selectedSkill)
      ? Boolean(selectedSkill?.supportedWeapons.includes(weapon.code))
      : Boolean(referenceProfile) && hasKnownWsm && canUseReferenceNormalAttack(characterClass, weapon.code, referenceSkill, statusMode));
    const isPossibleButMissingWsm = !verifiedWeaponCodes.includes(weapon.code) && Boolean(referenceProfile) && !hasKnownWsm;
    const status: WeaponCombinationStatus = verifiedWeaponCodes.includes(weapon.code) ? 'VERIFIED' : isReference ? 'REFERENCE_BASED' : isPossibleButMissingWsm ? 'UNVERIFIED' : 'UNSUPPORTED';
    return [weapon.code, status];
  })), [characterClass, skill, selectedSkill, verifiedWeaponCodes, isPaladinCharge, isDragonClaw, isAssassinChargeUp, isDragonFlight, isDoubleThrow, isDragonTalon, isTrapLaying, isDoubleSwing, isFrenzy, isWhirlwind]);
  const supportCounts = useMemo(() => Object.values(weaponStatuses).reduce((counts, status) => ({ ...counts, [status]: (counts[status] ?? 0) + 1 }), {} as Record<WeaponCombinationStatus, number>), [weaponStatuses]);
  const maxIAS = isDragonFlight ? 0 : isPaladinCharge ? IAS_SKILLS.NORMAL_ATTACK.iasRange?.[weaponCode]?.max ?? 0 : isDragonClaw || isAssassinChargeUp || isDragonTalon ? 456 : characterClass === 'BARBARIAN' && selectedSkill && 'maxIASByWeapon' in selectedSkill && selectedSkill.maxIASByWeapon[weaponCode] !== undefined
    ? selectedSkill.maxIASByWeapon[weaponCode]
    : getIASLimit(skill, weaponCode, characterClass, weaponMode);
  const selectedCatalogWeapon = weaponByCode.get(weaponCode);
  const filteredWeapons = useMemo(() => filterIASWeaponCatalog({ search: weaponSearch, category: weaponCategory, handedness: weaponHandedness, support: weaponSupport, verifiedWeaponCodes, weaponStatuses }), [weaponCategory, weaponHandedness, weaponSearch, weaponSupport, verifiedWeaponCodes, weaponStatuses]);
  const weaponOptions = filteredWeapons.some(weapon => weapon.code === weaponCode) || !selectedCatalogWeapon
    ? filteredWeapons
    : [selectedCatalogWeapon, ...filteredWeapons];
  const weaponIASMax = isDragonFlight ? 0 : isDragonClaw || isAssassinChargeUp || isDragonTalon || isWhirlwind || isFrenzy || isDoubleThrow || isAmazonImpale ? 120 : Math.max(0, maxIAS - (Number(offWeaponIAS) || 0));
  const equipmentIASMax = isDoubleSwing || isDragonFlight ? 0 : isWhirlwind ? Math.max(0, maxIAS - Math.max(Number(weaponIAS) || 0, secondaryWeaponCode ? Number(secondaryWeaponIAS) || 0 : 0)) : isFrenzy || isDoubleThrow ? 456 : isAssassinChargeUp ? Math.max(0, Math.min(456 - (Number(weaponIAS) || 0), 456 - (Number(secondaryWeaponIAS) || 0))) : Math.max(0, maxIAS - (Number(weaponIAS) || 0));
  const totalIAS = (Number(weaponIAS) || 0) + (Number(offWeaponIAS) || 0) + (isWhirlwind && secondaryWeaponCode ? Number(secondaryWeaponIAS) || 0 : 0);
  const selectedAnimation = skill === 'NORMAL_ATTACK' || skill === 'BARBARIAN_NORMAL_ATTACK' ? animation : skill === 'SMITE' ? 'S1' : 'A1';
  const currentAnimation = skill === 'NORMAL_ATTACK' || skill === 'BARBARIAN_NORMAL_ATTACK' ? selectedAnimation : selectedSkill?.animationMode;
  const druidWerewolfSkillIAS = isDruidWolfAttack ? getDruidWerewolfSIAS(skillLevel) ?? 0 : 0;
  const druidMaulSIAS = isDruidBearAttack ? getDruidMaulSIAS(skillLevel, maulCharges) ?? 0 : 0;
  const maulChargeMax = getDruidMaulMaxCharges(skillLevel) ?? 3;
  const frenzyBuffSIAS = isFrenzy && frenzyAtMaximum ? getBarbarianFrenzyMaxSIAS(skillLevel) ?? 0 : 0;
  const model = useMemo(() => getCalculatorViewModelFromParts(weaponIAS, offWeaponIAS, { characterClass, characterForm, weaponCode, secondaryWeaponCode: isDragonClaw || isAssassinChargeUp || isDoubleSwing || isFrenzy || isDoubleThrow || (isWhirlwind && secondaryWeaponCode) ? secondaryWeaponCode : undefined, secondaryWeaponIAS: isDragonClaw || isAssassinChargeUp || isWhirlwind || isFrenzy || isDoubleThrow ? Number(secondaryWeaponIAS) || 0 : 0, burstOfSpeedLevel: isDragonClaw || isAssassinChargeUp || isDragonTalon || isTrapLaying ? burstOfSpeedLevel : 0, skillLevel, frenzyBuffSIAS, maulCharges, weaponMode: skill === 'BARBARIAN_TWO_HANDED_NORMAL_ATTACK' ? 'TWO_HAND' : weaponMode, animation: selectedAnimation, skill, hitCount, fanaticismLevel, skillIAS: druidWerewolfSkillIAS }), [weaponIAS, offWeaponIAS, characterClass, characterForm, weaponCode, secondaryWeaponCode, secondaryWeaponIAS, burstOfSpeedLevel, skillLevel, frenzyBuffSIAS, maulCharges, isDragonClaw, isAssassinChargeUp, isDragonTalon, isTrapLaying, isDoubleSwing, isFrenzy, isDoubleThrow, isWhirlwind, weaponMode, skill, selectedAnimation, hitCount, fanaticismLevel, druidWerewolfSkillIAS]);
  const chargeReference = isPaladinCharge ? calculatePaladinChargeReference({ mode: paladinChargeMode, weaponCode, weaponIAS: Number(weaponIAS) || 0, offWeaponIAS: Number(offWeaponIAS) || 0, fanaticismLevel }) : null;
  const result = isPaladinCharge
    ? chargeReference?.mode === 'MELEE_FALLBACK' ? chargeReference.result : null
    : model.status === 'SUPPORTED' || model.status === 'REFERENCE_BASED' ? model.result : null;
  const breakpointRows = isPaladinCharge
    ? paladinChargeMode === 'MELEE_FALLBACK' && result?.fullAnimationFrames !== null
      ? getWeaponBreakpoints(weaponCode, 'A1', 'NORMAL_ATTACK', 5, fanaticismLevel).map(row => ({ ias: row.ias, fullAnimationFrames: row.fullAnimationFrames }))
      : []
    : model.status === 'REFERENCE_BASED'
    ? skill === 'AMAZON_STRAFE'
      ? getAmazonStrafeBreakpointRows(weaponCode, maxIAS, hitCount)
      : isDragonFlight ? []
      : skill === 'AMAZON_IMMOLATION_ARROW'
      ? (() => { const wc = getReferenceWeaponClass('AMAZON', weaponCode, skill, weaponMode); const profile = wc ? getNormalAttackProfile('AMAZON', wc) : null; const wsm = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? selectedCatalogWeapon?.wsm; if (!profile || wsm === null || wsm === undefined) return []; return getAmazonImmolationCadenceBreakpointRows({ weaponSpeedModifier: wsm, actionFrame: profile.actionFrame, animationSpeed: profile.animationSpeed }, maxIAS); })()
      : ['AMAZON_THROW', 'AMAZON_POISON_JAVELIN', 'AMAZON_PLAGUE_JAVELIN', 'AMAZON_LIGHTNING_BOLT', 'AMAZON_LIGHTNING_FURY'].includes(skill)
      ? getAmazonThrowBreakpointRows(weaponCode, maxIAS)
      : skill === 'AMAZON_FEND'
      ? getAmazonFendBreakpointRows(weaponCode, maxIAS, hitCount)
      : skill === 'AMAZON_JAB'
      ? getReferenceAmazonJabBreakpointRows(weaponCode, weaponMode, maxIAS, fanaticismLevel)
      : isAmazonImpale ? (() => { const rows: { ias: number; fullAnimationFrames: number }[] = []; let previous = -1; for (let gear = 0; gear <= equipmentIASMax; gear++) { const r = calculateAmazonImpaleReference({ weaponCode, weaponWSM: selectedCatalogWeapon?.wsm ?? null, weaponClass: selectedCatalogWeapon?.weaponClass as '1ht' | '2ht', gearIAS: gear, weaponIAS: Number(weaponIAS) || 0 }); if (r.status !== 'REFERENCE_BASED') break; if (r.frames !== previous) rows.push({ ias: gear, fullAnimationFrames: r.frames }); previous = r.frames; } return rows; })()
      : isDruidWereformSkill && !isDruidFury
      ? getDruidShapeshiftBreakpointRows({ form: characterForm as 'WEREWOLF' | 'WEREBEAR', weaponSpeedModifier: IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? selectedCatalogWeapon?.wsm ?? 0, maxIAS, humanA1Profile: (() => { const weaponClass = getReferenceWeaponClass('DRUID', weaponCode, 'NORMAL_ATTACK', weaponMode); const profile = weaponClass ? getNormalAttackProfile('DRUID', weaponClass) : null; return profile ? { framesPerDirection: profile.framesPerDirection, animationSpeed: profile.animationSpeed, startingFrame: profile.startingFrame } : { framesPerDirection: 0, animationSpeed: 0, startingFrame: 0 }; })(), skillIAS: druidWerewolfSkillIAS, buffIAS: druidMaulSIAS, attackFramesPerDirection: characterForm === 'WEREWOLF' && (skill === 'DRUID_HUNGER' || skill === 'DRUID_RABIES') ? 10 : undefined })
      : isFrenzy ? (() => { const mainWSM = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? selectedCatalogWeapon?.wsm; const offhand = weaponByCode.get(secondaryWeaponCode); const offWSM = IAS_WEAPONS[secondaryWeaponCode]?.resolvedWeaponSpeedModifier ?? offhand?.wsm; if (mainWSM === null || mainWSM === undefined || offWSM === null || offWSM === undefined) return []; return getBarbarianFrenzyBreakpointRows({ primaryWeapon: { weaponSpeedModifier: mainWSM, weaponIAS: Number(weaponIAS) || 0 }, secondaryWeapon: { weaponSpeedModifier: offWSM, weaponIAS: Number(secondaryWeaponIAS) || 0 }, frenzyBuffSIAS }, equipmentIASMax).map(row => ({ ias: row.gearIAS, fullAnimationFrames: row.sequenceFrames })); })()
      : isDoubleThrow ? (() => { const mainWSM = IAS_WEAPONS[weaponCode]?.resolvedWeaponSpeedModifier ?? selectedCatalogWeapon?.wsm; const offhand = weaponByCode.get(secondaryWeaponCode); const offWSM = IAS_WEAPONS[secondaryWeaponCode]?.resolvedWeaponSpeedModifier ?? offhand?.wsm; if (mainWSM === null || mainWSM === undefined || offWSM === null || offWSM === undefined) return []; return getBarbarianDoubleThrowBreakpointRows({ primary: { weaponSpeedModifier: mainWSM, weaponIAS: Number(weaponIAS) || 0 }, secondary: { weaponSpeedModifier: offWSM, weaponIAS: Number(secondaryWeaponIAS) || 0 } }, equipmentIASMax).map(row => ({ ias: row.gearIAS, fullAnimationFrames: row.frames })); })()
      : isWhirlwind ? getBarbarianWhirlwindBreakpointRows({ primaryWeapon: { code: weaponCode, weaponIAS: Number(weaponIAS) || 0, weaponMode: weaponMode === 'TWO_HAND' ? 'TWO_HAND' : 'ONE_HAND' }, secondaryWeapon: secondaryWeaponCode ? { code: secondaryWeaponCode, weaponIAS: Number(secondaryWeaponIAS) || 0, weaponMode: 'ONE_HAND' } : undefined }, equipmentIASMax).map(row => ({ ias: row.gearIAS, fullAnimationFrames: row.hitIntervalFrames }))
      : isDragonClaw ? getAssassinDragonClawBreakpointRows({ characterForm, primaryWeapon: { code: weaponCode, wsm: selectedCatalogWeapon?.wsm ?? null, weaponIAS: Number(weaponIAS) || 0 }, secondaryWeapon: { code: secondaryWeaponCode, wsm: weaponByCode.get(secondaryWeaponCode)?.wsm ?? null, weaponIAS: Number(secondaryWeaponIAS) || 0 }, gearIAS: 0, burstOfSpeedLevel }, maxIAS).map(row => ({ ...row, ias: row.ias + (Number(weaponIAS) || 0) }))
      : isAssassinChargeUp ? (() => { const primary = selectedCatalogWeapon; const secondary = weaponByCode.get(secondaryWeaponCode); if (!primary || !secondary || primary.wsm === null || secondary.wsm === null) return []; return getAssassinChargeUpBreakpoints({ primary: { code: primary.code, wsm: primary.wsm, weaponIAS: Number(weaponIAS) || 0 }, secondary: { code: secondary.code, wsm: secondary.wsm, weaponIAS: Number(secondaryWeaponIAS) || 0 }, gearIAS: 0, burstOfSpeedLevel }, equipmentIASMax).map(row => ({ ias: row.gearIAS, fullAnimationFrames: row.frames })); })()
      : isDragonTalon ? (() => { const rows: { ias: number; fullAnimationFrames: number }[] = []; let prev = -1; const weaponIas = Number(weaponIAS) || 0; for (let ias = weaponIas; ias <= maxIAS; ias++) { const r = calculateAssassinDragonTalonReference({ characterForm, weapon: { code: weaponCode, wsm: selectedCatalogWeapon?.wsm ?? null, weaponIAS: weaponIas }, gearIAS: ias - weaponIas, burstOfSpeedLevel, dragonTalonLevel: skillLevel }); if (r.status !== 'REFERENCE_BASED') break; if (r.totalSequenceFrames !== prev) rows.push({ ias, fullAnimationFrames: r.totalSequenceFrames }); prev = r.totalSequenceFrames; } return rows; })()
      : isTrapLaying ? getAssassinTrapLayingBreakpointRows({ weaponSpeedModifier: selectedCatalogWeapon?.wsm ?? 0, burstOfSpeedLevel, maxIAS })
      : isDoubleSwing ? (() => { const rows: { ias: number; fullAnimationFrames: number }[] = []; let prev = -1; for (let ias = 0; ias <= maxIAS; ias++) { const r = calculateBarbarianDoubleSwingReference({ primaryWeapon: '7cr', secondaryWeapon: secondaryWeaponCode as '7cr' | 'whm', primaryWeaponIAS: ias }); if (r.sequenceFrames !== prev) rows.push({ ias, fullAnimationFrames: r.sequenceFrames ?? 0 }); prev = r.sequenceFrames ?? prev; } return rows; })()
      : isDruidFury ? (() => { const wc = getReferenceWeaponClass('DRUID', weaponCode, 'NORMAL_ATTACK', weaponMode); const p = wc ? getNormalAttackProfile('DRUID', wc) : null; if (!p) return []; const rows: { ias: number; fullAnimationFrames: number }[] = []; let prev = -1; for (let ias = 0; ias <= maxIAS; ias++) { const r = calculateDruidWerewolfFurySequence({ form: 'WEREWOLF', totalIAS: ias, weaponSpeedModifier: selectedCatalogWeapon?.wsm ?? 0, humanA1Profile: { framesPerDirection: p.framesPerDirection, animationSpeed: p.animationSpeed, startingFrame: p.startingFrame }, skillIAS: druidWerewolfSkillIAS }); if (r.totalSequenceFrames !== prev) rows.push({ ias, fullAnimationFrames: r.totalSequenceFrames ?? 0 }); prev = r.totalSequenceFrames ?? prev; } return rows; })()
      : getReferenceNormalBreakpointRows(characterClass, weaponCode, skill === 'NECROMANCER_POISON_DAGGER' || skill === 'ASSASSIN_DRAGON_TAIL' ? 'NORMAL_ATTACK' : skill, maxIAS, fanaticismLevel, skill === 'BARBARIAN_TWO_HANDED_NORMAL_ATTACK' ? 'TWO_HAND' : weaponMode)
    : (characterClass === 'PALADIN' || characterClass === 'BARBARIAN') ? getWeaponBreakpoints(weaponCode, (skill === 'SMITE' ? 'A1' : selectedAnimation) as 'A1' | 'A2', skill as keyof typeof IAS_SKILLS, hitCount, characterClass === 'PALADIN' ? fanaticismLevel : 0) : [];
  const zealBreakpointRows = skill === 'ZEAL' ? getZealBreakpoints(weaponCode, hitCount, fanaticismLevel) : [];
  const statusMessage = isPaladinCharge
    ? paladinChargeMode === 'RUSH' ? '실제 돌진은 IAS 공격 프레임으로 계산되지 않습니다. 대상이 근접 범위인지 선택하세요.' : null
    : model.status === 'INVALID_INPUT'
    ? model.reason
    : model.status === 'UNVERIFIED'
      ? model.reason
      : model.status === 'UNSUPPORTED'
        ? model.reason
          : model.status === 'CONFLICTED'
            ? model.reason
        : null;
  const isDruidFormAgnosticSkill = (entry: { characterForm?: string; skill?: string }) => characterClass === 'DRUID' && ['DRUID_FIRE_CLAWS', 'DRUID_HUNGER'].includes(entry.skill ?? '');
  const skillOptions = characterClass === 'PALADIN'
    ? [...Object.values(IAS_SKILLS).filter(entry => entry.selectable).map(entry => ({ code: entry.code, label: entry.label, supported: entry.supportStatus === 'SUPPORTED' })), { code: 'PALADIN_CHARGE', label: '돌진 (Charge) · 거리별 동작', supported: true }]
    : getClassSkills(characterClass).filter(entry => entry.characterForm ? entry.characterForm === characterForm : characterForm === 'HUMAN' || isDruidFormAgnosticSkill(entry)).map(entry => ({ code: entry.skill, label: entry.label, supported: entry.verificationStatus === 'VERIFIED' || entry.verificationStatus === 'REFERENCE_BASED' }));
  const referenceUrls = isPaladinCharge
    ? ['https://d2r.org/mechanics/charge', 'https://theamazonbasin.com/wiki/index.php/Charge']
    : selectedSkill?.evidenceUrls ?? (characterClass === 'PALADIN'
    ? ['https://d2r.org/tools/breakpoints/paladin', 'https://d2r-tools.com/ias/calculations']
    : [`https://d2r.org/tools/breakpoints/${characterClass.toLowerCase()}`, 'https://d2r-tools.com/ias/calculations']);

  function adjustIAS(delta: number) {
    const current = /^(0|[1-9]\d*)$/.test(offWeaponIAS) ? Number(offWeaponIAS) : 0;
    setOffWeaponIAS(String(Math.max(0, Math.min(equipmentIASMax, current + delta))));
  }

  function handleIASChange(value: string, field: 'weapon' | 'equipment') {
    if (field === 'weapon') setWeaponIAS(constrainIASInput(value, weaponIASMax));
    else setOffWeaponIAS(constrainIASInput(value, equipmentIASMax));
  }

  function handleSkillChange(nextSkill: string) {
    if (characterClass === 'PALADIN' && nextSkill === 'PALADIN_CHARGE') setPaladinChargeMode('RUSH');
    const nextIsDragonClaw = characterClass === 'ASSASSIN' && nextSkill === 'ASSASSIN_DRAGON_CLAW';
    const nextIsAssassinChargeUp = characterClass === 'ASSASSIN' && ['ASSASSIN_FISTS_OF_FIRE', 'ASSASSIN_CLAWS_OF_THUNDER', 'ASSASSIN_BLADES_OF_ICE'].includes(nextSkill);
    const nextIsDoubleSwing = characterClass === 'BARBARIAN' && nextSkill === 'BARBARIAN_DOUBLE_SWING';
    const nextIsFrenzy = characterClass === 'BARBARIAN' && nextSkill === 'BARBARIAN_FRENZY';
    const nextIsDoubleThrow = characterClass === 'BARBARIAN' && nextSkill === 'BARBARIAN_DOUBLE_THROW';
    const nextIsWhirlwind = characterClass === 'BARBARIAN' && nextSkill === 'BARBARIAN_WHIRLWIND';
    const nextWeapon = nextIsDoubleSwing || nextIsFrenzy ? '7cr' : nextIsDoubleThrow ? (barbarianDoubleThrowWeapons[0]?.code ?? weaponCode) : (nextIsDragonClaw || nextIsAssassinChargeUp) && !clawOptions.some(entry => entry.code === weaponCode) ? '9tw' : weaponCode;
    const nextLimit = nextIsDragonClaw || nextIsAssassinChargeUp ? 456 : nextIsFrenzy || nextIsDoubleThrow ? 120 : getIASLimit(nextSkill, nextWeapon, characterClass, weaponMode);
    const nextWeaponIAS = Math.min(Number(weaponIAS) || 0, nextLimit);
    setSkill(nextSkill);
    if (nextWeapon !== weaponCode) setWeaponCode(nextWeapon);
    if (nextIsDragonClaw || nextIsAssassinChargeUp) { setSecondaryWeaponCode(nextWeapon); setSecondaryWeaponIAS('0'); }
    if (nextIsDoubleSwing) { setSecondaryWeaponCode('7cr'); setSecondaryWeaponIAS('0'); setOffWeaponIAS('0'); }
    if (nextIsFrenzy) { setSecondaryWeaponCode('7cr'); setSecondaryWeaponIAS('0'); setOffWeaponIAS('0'); setSkillLevel(20); setFrenzyAtMaximum(false); }
    if (nextIsDoubleThrow) { setSecondaryWeaponCode(barbarianDoubleThrowWeapons.find(entry => entry.code !== nextWeapon)?.code ?? ''); setSecondaryWeaponIAS('0'); setOffWeaponIAS('0'); }
    if (nextIsWhirlwind) { setSecondaryWeaponCode(''); setSecondaryWeaponIAS('0'); }
    setWeaponIAS(String(nextWeaponIAS));
    setOffWeaponIAS(String(nextIsFrenzy || nextIsDoubleThrow ? Math.min(Number(offWeaponIAS) || 0, 456) : Math.min(Number(offWeaponIAS) || 0, nextLimit - nextWeaponIAS)));
  }

  function handleClassChange(nextClass: string) {
    setCharacterClass(nextClass);
    setCharacterForm('HUMAN');
    setSkill(nextClass === 'PALADIN' ? 'NORMAL_ATTACK' : getClassSkills(nextClass).find(entry => !entry.characterForm || entry.characterForm === 'HUMAN')?.skill ?? 'NORMAL_ATTACK');
    setWeaponCode(nextClass === 'BARBARIAN' ? 'crs' : 'crs');
    setWeaponMode('ONE_HAND');
    setAnimation('A1');
    setWeaponIAS('0');
    setOffWeaponIAS('0');
    setFanaticismLevel(0);
    setMaulCharges(0);
    setFrenzyAtMaximum(false);
  }

  function handleFormChange(nextForm: string) {
    setCharacterForm(nextForm);
    const nextSkills = getClassSkills(characterClass).filter(entry => entry.characterForm ? entry.characterForm === nextForm : nextForm === 'HUMAN' || isDruidFormAgnosticSkill(entry));
    setSkill(nextSkills[0]?.skill ?? 'NORMAL_ATTACK');
    setWeaponIAS('0');
    setOffWeaponIAS('0');
    if (nextForm !== 'WEREBEAR') setMaulCharges(0);
  }

  function handleReset() {
    setCharacterForm('HUMAN');
    setSkill(characterClass === 'PALADIN' ? 'NORMAL_ATTACK' : getClassSkills(characterClass).find(entry => !entry.characterForm || entry.characterForm === 'HUMAN')?.skill ?? 'NORMAL_ATTACK');
    setWeaponCode('crs');
    setSecondaryWeaponCode('9tw');
    setSecondaryWeaponIAS('0');
    setBurstOfSpeedLevel(0);
    setWeaponMode('ONE_HAND');
    setAnimation('A1');
    setWeaponIAS('0');
    setOffWeaponIAS('0');
    setSkillLevel(4);
    setMaulCharges(0);
    setFrenzyAtMaximum(false);
    setFendTargetCount(2);
    setStrafeShotCount(2);
    setWeaponSearch('');
    setWeaponCategory('ALL');
    setWeaponHandedness('ALL');
    setWeaponSupport('ALL');
    setFanaticismLevel(0);
  }

  function swapClaws() {
    const previousCode = weaponCode;
    const previousIAS = weaponIAS;
    setWeaponCode(secondaryWeaponCode);
    setWeaponIAS(secondaryWeaponIAS);
    setSecondaryWeaponCode(previousCode);
    setSecondaryWeaponIAS(previousIAS);
  }

  return (
    <section className={styles.calculator} aria-labelledby="ias-title">
      <p className={styles.breadcrumb}>게임 정보 <span aria-hidden="true">›</span> 공속 계산기</p>
      <GameInfoNavigation active="ias-calculator" />
      <div className={styles.heading}><h2 id="ias-title">디아블로2 레저렉션 공속 계산기</h2><span className={styles.badge}>시험 운영</span></div>
      <p className={styles.intro}>직업과 무기 유형에 맞는 공격 동작의 프레임과 공속 기준값을 확인할 수 있습니다.</p>
      <p className={styles.notice}>VERIFIED 결과는 기존 기준 자료와 Golden Dataset을 통과한 값입니다. REFERENCE_BASED 결과는 공개 IAS 계산 규칙과 직업별 애니메이션 자료를 이용한 참고값이며, 추후 정밀 검증에 따라 달라질 수 있습니다. 미지원 조합과 WSM 미확인 무기는 숫자를 표시하지 않습니다.</p>

      <div className={styles.layout}>
        <section className={styles.controls} aria-labelledby="conditions-title">
          <div className={styles.tableHeading}><h3 id="conditions-title">계산 조건</h3><button type="button" className={styles.smallAction} onClick={handleReset}>입력 초기화</button></div>
          <label className={styles.field} htmlFor="ias-class"><span>직업</span>
            <select id="ias-class" value={characterClass} onChange={event => handleClassChange(event.target.value)}>
              {classes.map(([id, name]) => <option key={id} value={id}>{name}{id === 'WARLOCK' ? ' · 준비 중' : ''}</option>)}
            </select>
          </label>
          {isDragonClaw || isAssassinChargeUp || isDoubleSwing || isFrenzy || isDoubleThrow || isWhirlwind ? <>
            <label className={styles.field} htmlFor="ias-secondary-weapon"><span>{isDragonClaw || isAssassinChargeUp ? '보조 클러' : '보조 무기'}</span><select id="ias-secondary-weapon" value={secondaryWeaponCode} onChange={event => { setSecondaryWeaponCode(event.target.value); if (isWhirlwind || isFrenzy || isDoubleThrow) setSecondaryWeaponIAS('0'); }} >{isWhirlwind ? <option value="">보조 무기 없음 · 단일 무기</option> : null}{(isDragonClaw || isAssassinChargeUp ? clawOptions : isDoubleSwing ? IAS_WEAPON_CATALOG.filter(weapon => weapon.code === '7cr' || weapon.code === 'whm') : isFrenzy ? barbarianFrenzyWeapons : isDoubleThrow ? barbarianDoubleThrowWeapons : barbarianWhirlwindOffhands).map(weapon => <option key={weapon.code} value={weapon.code}>{localizedWeaponName(weapon.code, weapon.name)} · {weapon.code} · WSM {weapon.wsm ?? IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier}</option>)}</select></label>
            {isDragonClaw || isAssassinChargeUp || isDoubleThrow ? <>
            <label className={styles.field} htmlFor="ias-secondary-weapon-ias"><span>{isDoubleThrow ? '보조 투척 무기 IAS' : '보조 클러 IAS'}</span><input id="ias-secondary-weapon-ias" type="number" min="0" max="120" step="1" value={secondaryWeaponIAS} onChange={event => setSecondaryWeaponIAS(constrainIASInput(event.target.value, 120))} /></label>
            {!isDoubleThrow ? <button type="button" className={styles.smallAction} onClick={swapClaws}>주·보조 클러 교환</button> : <p className={styles.hint}>양손 투척 무기 IAS는 각각 0~120, 장비 IAS는 별도로 0~456 범위에서 입력합니다.</p>}
            </> : isDoubleSwing ? <p className={styles.hint}>기록된 비교 기준은 주무기 페이즈 블레이드, 보조 페이즈 블레이드 또는 워 해머이며 보조 IAS와 장비 IAS는 0으로 고정합니다.</p> : secondaryWeaponCode ? <label className={styles.field} htmlFor="ias-secondary-weapon-ias"><span>보조 무기 IAS</span><input id="ias-secondary-weapon-ias" type="number" min="0" max="120" step="1" value={secondaryWeaponIAS} onChange={event => setSecondaryWeaponIAS(constrainIASInput(event.target.value, 120))} /></label> : <p className={styles.hint}>보조 무기는 선택 사항입니다. 양손 무기는 보조 무기와 함께 사용할 수 없습니다.</p>}
          </> : null}
          {isDragonClaw || isAssassinChargeUp || isDragonTalon || isTrapLaying ? <label className={styles.field} htmlFor="ias-burst-level"><span>폭발적인 속도 레벨</span><select id="ias-burst-level" value={burstOfSpeedLevel} onChange={event => setBurstOfSpeedLevel(Number(event.target.value))}><option value={0}>사용 안 함</option>{Array.from({length:60},(_,i)=>i+1).map(level=><option key={level} value={level}>레벨 {level} · +{assassinBurstOfSpeedSIAS(level)} SIAS</option>)}</select></label> : null}
          {characterClass === 'DRUID' ? <label className={styles.field} htmlFor="ias-form"><span>캐릭터 형태</span><select id="ias-form" value={characterForm} onChange={event => handleFormChange(event.target.value)}><option value="HUMAN">인간형</option><option value="WEREWOLF">늑대인간</option><option value="WEREBEAR">곰인간</option></select></label> : null}
          <label className={styles.field} htmlFor="ias-skill"><span>공격 스킬</span>
            <select id="ias-skill" value={skill} onChange={event => handleSkillChange(event.target.value)}>
              {skillOptions.map(entry => <option key={entry.code} value={entry.code}>{entry.label}{entry.supported ? '' : ' · 검증 중'}</option>)}
              {characterClass === 'PALADIN' ? Object.values(IAS_SKILLS).filter(entry => !entry.selectable).map(entry => <option key={entry.code} value={entry.code} disabled>{entry.label} · 준비 중</option>) : null}
            </select>
          </label>
          {isPaladinCharge ? <>
            <label className={styles.field} htmlFor="paladin-charge-mode"><span>Charge 동작 조건</span>
              <select id="paladin-charge-mode" value={paladinChargeMode} onChange={event => setPaladinChargeMode(event.target.value as 'RUSH' | 'MELEE_FALLBACK')}>
                <option value="RUSH">실제 돌진 · IAS 프레임 없음</option>
                <option value="MELEE_FALLBACK">대상이 이미 근접 범위 · A1 일반 공격</option>
              </select>
            </label>
            <p className={styles.hint}>실제 동작은 대상과의 거리, 선택 상태 및 장애물에 따라 달라집니다. 이 조건을 직접 선택하세요. 실제 돌진은 이동 속도에 좌우되며 IAS 프레임을 계산하지 않습니다. 근접 fallback은 Charge 보너스 없는 일반 공격입니다.</p>
          </> : null}
          {skill === 'AMAZON_FEND' || skill === 'AMAZON_STRAFE' ? <label className={styles.field} htmlFor="sequence-target-count"><span>{skill === 'AMAZON_FEND' ? '난격 대상 수' : '속사 발사 수'}</span><select id="sequence-target-count" value={skill === 'AMAZON_FEND' ? fendTargetCount : strafeShotCount} onChange={event => skill === 'AMAZON_FEND' ? setFendTargetCount(Number(event.target.value)) : setStrafeShotCount(Number(event.target.value))}>{Array.from({length: (skill === 'AMAZON_FEND' ? 12 : 10) - 1}, (_, index) => index + 2).map(count => <option key={count} value={count}>{count}{skill === 'AMAZON_FEND' ? '대상' : '발'}</option>)}</select></label> : null}
          <label className={styles.field} htmlFor="ias-weapon-category"><span>무기 종류</span>
            <select id="ias-weapon-category" value={weaponCategory} onChange={event => setWeaponCategory(event.target.value)}>
              <option value="ALL">전체 종류 (297)</option>
              {weaponCategories.map(category => <option key={category} value={category}>{WEAPON_CATEGORY_KO[category] ?? category}</option>)}
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-weapon"><span>주 무기</span>
            <select id="ias-weapon" value={weaponCode} onChange={event => { const nextCode = event.target.value; const nextWeapon = weaponByCode.get(nextCode); setWeaponCode(nextCode); setWeaponMode(nextWeapon?.handedness === 'two-handed' ? 'TWO_HAND' : 'ONE_HAND'); setWeaponIAS('0'); setOffWeaponIAS('0'); if (isDoubleThrow && nextCode === secondaryWeaponCode) setSecondaryWeaponCode(barbarianDoubleThrowWeapons.find(entry => entry.code !== nextCode && entry.code === weaponCode)?.code ?? barbarianDoubleThrowWeapons.find(entry => entry.code !== nextCode)?.code ?? ''); }}>
              {weaponOptions.map(weapon => <option key={weapon.code} value={weapon.code}>{localizedWeaponName(weapon.code, weapon.name)} · {weapon.code} · WSM {IAS_WEAPONS[weapon.code]?.resolvedWeaponSpeedModifier ?? weapon.wsm ?? '?'} · {{ VERIFIED: '검증 완료', REFERENCE_BASED: '참고 기준 계산', UNVERIFIED: '자료 확인 필요', CONFLICTED: '기준 충돌', UNSUPPORTED: '지원 불가' }[weaponStatuses[weapon.code]]}</option>)}
            </select>
          </label>
          {selectedCatalogWeapon?.handedness === 'conditional' && skill !== 'BARBARIAN_TWO_HANDED_NORMAL_ATTACK' ? <label className={styles.field} htmlFor="ias-weapon-mode"><span>장착 방식</span>
            <select id="ias-weapon-mode" value={weaponMode} onChange={event => setWeaponMode(event.target.value as 'ONE_HAND' | 'TWO_HAND')}>
              <option value="ONE_HAND">한손 장착</option><option value="TWO_HAND">양손 장착</option>
            </select>
          </label> : null}
          <label className={styles.field} htmlFor="ias-weapon-search"><span>무기 검색</span>
            <input id="ias-weapon-search" type="search" value={weaponSearch} onChange={event => setWeaponSearch(event.target.value)} placeholder="무기명 또는 코드 검색" />
          </label>
          <label className={styles.field} htmlFor="ias-weapon-handedness"><span>손잡이 형태 필터</span>
            <select id="ias-weapon-handedness" value={weaponHandedness} onChange={event => setWeaponHandedness(event.target.value as typeof weaponHandedness)}>
              <option value="ALL">전체</option><option value="one-handed">한손 무기</option><option value="two-handed">양손 무기</option><option value="conditional">조건부</option>
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-weapon-support"><span>계산 지원 상태</span>
            <select id="ias-weapon-support" value={weaponSupport} onChange={event => setWeaponSupport(event.target.value as typeof weaponSupport)}>
              <option value="ALL">전체 무기</option><option value="VERIFIED">검증 완료</option><option value="REFERENCE_BASED">참고 기준 계산</option><option value="UNVERIFIED">자료 확인 필요</option><option value="CONFLICTED">기준 충돌</option><option value="UNSUPPORTED">지원 불가</option>
            </select>
          </label>
          <p className={styles.hint} aria-live="polite">등록 {IAS_WEAPON_CATALOG.length}종 · 선택 가능 {IAS_WEAPON_CATALOG.filter(weapon => weapon.spawnable).length}종 중 {filteredWeapons.length}종 표시 · 조합 상태: VERIFIED {supportCounts.VERIFIED ?? 0} · 참고 기준 {supportCounts.REFERENCE_BASED ?? 0} · 자료 확인 필요 {supportCounts.UNVERIFIED ?? 0} · 불가 {supportCounts.UNSUPPORTED ?? 0}</p>
          {characterClass === 'PALADIN' ? <label className={styles.field} htmlFor="fanaticism-level"><span>광신 보정</span><select id="fanaticism-level" value={fanaticismLevel} onChange={event => setFanaticismLevel(Number(event.target.value))}><option value={0}>사용 안 함</option>{Array.from({length:60},(_,i)=>i+1).map(level=><option key={level} value={level}>레벨 {level} · +{fanaticismSIAS(level)} SIAS</option>)}</select></label> : null}
          {characterClass === 'PALADIN' && fanaticismLevel > 0 ? <p className={styles.hint}>광신 레벨 {fanaticismLevel}: 장비 IAS 감쇠 이후 +{fanaticismSIAS(fanaticismLevel)} 스킬 IAS 적용. 레벨은 장비 보너스를 포함한 합산 레벨입니다.</p> : null}
          {skill === 'ZEAL' ? <label className={styles.field} htmlFor="zeal-skill-level"><span>열의 기술 레벨</span>
            <select id="zeal-skill-level" value={skillLevel} onChange={event => setSkillLevel(Number(event.target.value))}>
              {Array.from({length: 20}, (_, index) => index + 1).map(level => <option key={level} value={level}>{level}레벨 · 최대 {Math.min(level + 1, 5)}회</option>)}
            </select>
          </label> : null}
          {isFrenzy ? <>
            <label className={styles.field} htmlFor="frenzy-skill-level"><span>광분 기술 레벨</span><select id="frenzy-skill-level" value={skillLevel} onChange={event => { setSkillLevel(Number(event.target.value)); setFrenzyAtMaximum(false); }}>{Array.from({length: 30}, (_, index) => index + 1).map(level => <option key={level} value={level}>레벨 {level} · 최대 +{getBarbarianFrenzyMaxSIAS(level)} SIAS</option>)}</select></label>
            <label className={styles.field} htmlFor="frenzy-charge-state"><span>현재 Frenzy 충전</span><select id="frenzy-charge-state" value={frenzyAtMaximum ? 'MAX' : 'NONE'} onChange={event => setFrenzyAtMaximum(event.target.value === 'MAX')}><option value="NONE">충전 없음 · 0 SIAS</option><option value="MAX">최대 충전 · +{getBarbarianFrenzyMaxSIAS(skillLevel)} SIAS</option></select></label>
            <p className={styles.hint}>성공 타격에 따라 단계적으로 오르는 중간 충전값은 공개 산식의 반올림 규칙이 확정되지 않아 계산에서 제외합니다. 보조 IAS는 0~120, 장비 IAS는 0~456이며 외부 속도 보정은 적용하지 않습니다.</p>
          </> : null}
          {isDragonTalon ? <label className={styles.field} htmlFor="dragon-talon-level"><span>용의 발톱 기술 레벨</span><select id="dragon-talon-level" value={skillLevel} onChange={event => setSkillLevel(Number(event.target.value))}>{Array.from({length: 30}, (_, index) => index + 1).map(level => <option key={level} value={level}>레벨 {level} · {Math.floor(level / 6) + 1}회 발차기</option>)}</select></label> : null}
          {isDruidWolfAttack ? <label className={styles.field} htmlFor="druid-werewolf-level"><span>늑대인간 기술 레벨</span><select id="druid-werewolf-level" value={skillLevel} onChange={event => setSkillLevel(Number(event.target.value))}>{Array.from({length: 60}, (_, index) => index + 1).map(level => <option key={level} value={level}>레벨 {level} · +{getDruidWerewolfSIAS(level)} SIAS</option>)}</select></label> : null}
          {isDruidBearAttack ? <>
            <label className={styles.field} htmlFor="druid-maul-level"><span>Maul 기술 레벨</span><select id="druid-maul-level" value={skillLevel} onChange={event => { const level = Number(event.target.value); setSkillLevel(level); setMaulCharges(charges => Math.min(charges, getDruidMaulMaxCharges(level) ?? 0)); }}>{Array.from({length: 60}, (_, index) => index + 1).map(level => <option key={level} value={level}>레벨 {level} · 최대 {getDruidMaulMaxCharges(level)} 충전</option>)}</select></label>
            <label className={styles.field} htmlFor="druid-maul-charges"><span>활성 Maul 충전 수</span><select id="druid-maul-charges" value={maulCharges} onChange={event => setMaulCharges(Number(event.target.value))}><option value={0}>충전 없음</option>{Array.from({length: maulChargeMax}, (_, index) => index + 1).map(charges => <option key={charges} value={charges}>{charges}회 · +{getDruidMaulSIAS(skillLevel, charges)} SIAS</option>)}</select></label>
          </> : null}
          <details className={styles.explanation}>
            <summary>일반 공격 A1/A2 애니메이션 진단</summary>
            <label className={styles.diagnosticField} htmlFor="ias-animation">진단용 애니메이션 모드
              <select id="ias-animation" value={animation} onChange={event => setAnimation(event.target.value)}>
                <option value="A1">기본 공격 동작 1 (A1)</option>
                <option value="A2">기본 공격 동작 2 (A2) · 검증 중</option>
              </select>
            </label>
            <p>A1/A2는 내부 애니메이션 식별자입니다. 일반 공격을 선택했을 때 진단에만 사용하며, A2는 독립 검증 자료가 없어 계산 숫자와 기준표를 표시하지 않습니다.</p>
          </details>
          <details className={styles.explanation}>
            <summary>선택 스킬의 검증 근거</summary>
            <p>D2R 빌드 {selectedSkill && 'gameBuild' in selectedSkill ? selectedSkill.gameBuild : '3.3.93847'} · {selectedSkill && 'skillId' in selectedSkill ? selectedSkill.skillId === 0 ? '일반 공격' : `skills.txt Skill ID ${selectedSkill.skillId}` : '직업별 일반 공격'} · 애니메이션 {currentAnimation ?? '미검증'} · {selectedSkill && 'animationClass' in selectedSkill ? selectedSkill.animationClass : characterClass === 'PALADIN' ? 'Paladin A1' : '미검증'}</p>
            <p>{selectedSkill ? 'evidenceNote' in selectedSkill ? selectedSkill.evidenceNote : selectedSkill.evidenceSource : '선택 직업의 스킬 근거가 검증되지 않았습니다.'}</p>
            <p>지원 무기: {selectedSkill?.supportedWeapons.map(code => IAS_WEAPONS[code]?.name ?? weaponByCode.get(code)?.name).filter(Boolean).join(', ') || '없음'} · 게임 내 실측: 미수행</p>
            <p>{selectedSkill ? 'evidenceScope' in selectedSkill ? selectedSkill.evidenceScope : '지원 상태는 직업·스킬·무기·애니메이션 조합 기준입니다.' : '이 직업은 계산 지원 준비 중입니다.'}</p>
            <p>참고 자료</p><ul className={styles.referenceLinks}>{referenceUrls.map(url => <li key={url}><a href={url} target="_blank" rel="noreferrer">{new URL(url).hostname} · 원문 열기</a></li>)}</ul>
          </details>
          <div className={styles.iasField}>
            <label>공격 속도 증가 입력</label>
            <div className={styles.splitInputs}>
              <label htmlFor="weapon-ias">{isDoubleSwing || isFrenzy || isWhirlwind || isDoubleThrow ? '주무기 IAS' : '무기 IAS'}<input id="weapon-ias" type="number" min="0" max={weaponIASMax} step="1" inputMode="numeric" disabled={isDragonFlight || isPaladinCharge && paladinChargeMode === 'RUSH'} value={weaponIAS} onChange={event => handleIASChange(event.target.value, 'weapon')} /></label>
              <label htmlFor="equipment-ias">무기 외 장비 IAS<input id="equipment-ias" type="number" min="0" max={equipmentIASMax} step="1" disabled={isDoubleSwing || isDragonFlight || isPaladinCharge && paladinChargeMode === 'RUSH'} value={offWeaponIAS} onChange={event => handleIASChange(event.target.value, 'equipment')} /></label>
            </div>
            <p className={styles.hint}>{isFrenzy || isDoubleThrow ? `주무기 IAS ${weaponIAS} · 보조 무기 IAS ${secondaryWeaponIAS} · 장비 IAS ${offWeaponIAS}` : `공격 속도 증가 합계 (IAS): ${totalIAS}`}</p>
            <div className={styles.stepper}>
              <span>장비 IAS 조정</span>
              <button type="button" aria-label="장비 IAS 1 감소" disabled={isDoubleSwing || isDragonFlight || isPaladinCharge && paladinChargeMode === 'RUSH' || Number(offWeaponIAS) <= 0} onClick={() => adjustIAS(-1)}>−1</button>
              <button type="button" aria-label="장비 IAS 1 증가" disabled={isDoubleSwing || isDragonFlight || isPaladinCharge && paladinChargeMode === 'RUSH' || (isFrenzy || isDoubleThrow ? Number(offWeaponIAS) >= equipmentIASMax : totalIAS >= maxIAS)} onClick={() => adjustIAS(1)}>+1</button>
              <button type="button" aria-label="장비 IAS 10 증가" disabled={isDoubleSwing || isDragonFlight || isPaladinCharge && paladinChargeMode === 'RUSH' || (isFrenzy || isDoubleThrow ? Number(offWeaponIAS) >= equipmentIASMax : totalIAS >= maxIAS)} onClick={() => adjustIAS(10)}>+10</button>
            </div>
            {isDragonFlight ? <p className={styles.hint}>용의 비상은 고정 23프레임이며 IAS·시전 속도·이동 속도 영향을 받지 않습니다.</p> : null}
            {isPaladinCharge && paladinChargeMode === 'RUSH' ? <p className={styles.hint}>실제 돌진 동작의 간격은 IAS 프레임으로 표시하지 않습니다.</p> : null}
            <p id="ias-range" className={styles.hint}>{isFrenzy ? '각 무기 IAS 0~120 · 장비 IAS 0~456 · Frenzy 17프레임 시퀀스' : isDoubleThrow ? '각 투척 무기 IAS 0~120 · 장비 IAS 0~456 · Double Throw 12-FPD 시퀀스 규칙' : isDragonFlight ? '고정 23프레임 · IAS 및 속도 보정 없음' : `선택한 ${selectedSkill?.label ?? '공격'}·무기의 검증 범위: 0~${maxIAS} IAS${skill === 'ZEAL' || skill === 'SMITE' ? ' (EIAS 75 상한)' : ''}`}</p>
            {isAmazonImpale ? <p className={styles.hint}>꿰뚫기 전용 1HT/2HT 참고표입니다. 무기 IAS 최대 120, 장비 IAS를 포함한 합계는 456 이하입니다.</p> : null}
            {isAmazonImpale ? <p className={styles.hint}>꿰뚫기 전용 1HT/2HT 참고표입니다. 무기 IAS 최대 120, 장비 IAS를 포함한 합계는 456 이하입니다.</p> : null}
            {skill === 'SMITE' ? <p className={styles.hint}>강타 계산은 방패를 착용한 성기사 인간형 기준입니다. 방패 유형은 이 IAS 기준표에서 추가 속도 변수가 아닙니다.</p> : null}
            {skill === 'ZEAL' ? <p className={styles.hint}>원본 공식은 최소 타격 수 2회에서 시작해 기술 레벨에 따라 늘어나며 최대 5회입니다. 실제 타격 수는 대상과 전투 상황에 따라 달라질 수 있습니다. 열의는 action frame 이후 동작을 되감고, 마지막 공격은 전체 동작을 마칩니다.</p> : null}
          </div>
          {statusMessage ? <p className={styles.error} role="status">{statusMessage}</p> : null}
        </section>

        <section className={styles.results} aria-labelledby="result-title" aria-live="polite" aria-atomic="true">
          <h3 id="result-title">계산 결과</h3>
          {result ? <>
            <p className={styles.resultMeta}>{classes.find(([id]) => id === characterClass)?.[1]} · {characterForm === 'WEREWOLF' ? '늑대인간' : characterForm === 'WEREBEAR' ? '곰인간' : '인간형'} · {selectedSkill?.label} · {selectedWeaponLabel}{(isDragonClaw || isAssassinChargeUp || isDoubleSwing || ((isFrenzy || isWhirlwind) && secondaryWeaponCode)) ? ` + ${weaponByCode.get(secondaryWeaponCode)?.name ?? secondaryWeaponCode}` : ''}{isDragonClaw || isAssassinChargeUp ? ` (보조 IAS ${secondaryWeaponIAS}) · 폭발적인 속도 ${burstOfSpeedLevel}레벨` : isDragonTalon || isTrapLaying ? ` · ${isDragonTalon ? `기술 레벨 ${skillLevel} · ` : ''}폭발적인 속도 ${burstOfSpeedLevel}레벨` : isFrenzy ? ` · 기술 레벨 ${skillLevel} · 주/보조 IAS ${weaponIAS}/${secondaryWeaponIAS} · 장비 IAS ${offWeaponIAS} · Frenzy SIAS +${frenzyBuffSIAS}` : ''} · {currentAnimation} · {isWhirlwind ? `주무기 IAS ${weaponIAS} · 보조 무기 IAS ${secondaryWeaponCode ? secondaryWeaponIAS : '없음'} · 장비 IAS ${offWeaponIAS}` : `공격 속도 증가 합계 ${result.totalIAS} IAS`}{isDruidWolfAttack ? ` · 늑대인간 SIAS +${druidWerewolfSkillIAS}` : ''}{isDruidBearAttack && maulCharges > 0 ? ` · Maul 충전 SIAS +${druidMaulSIAS}` : ''}{characterClass === 'PALADIN' && fanaticismLevel ? ` · 광신 레벨 ${fanaticismLevel} (+${fanaticismSIAS(fanaticismLevel)} SIAS)` : ''}</p>
            {result.status === 'REFERENCE_BASED' ? <p className={styles.resultMeta}>외부 공속 계산 자료를 기준으로 산출한 참고값이며, 추후 정밀 검증에 따라 변경될 수 있습니다.</p> : null}
            {isPaladinCharge ? <p className={styles.resultMeta}>대상이 이미 근접 범위라 일반 공격으로 전환된 경우의 참고값입니다. Charge 피해·명중 보너스와 실제 돌진 주기는 포함하지 않습니다.</p> : result.zealSequence ? <p className={styles.resultMeta}>{fanaticismLevel ? '광신 SIAS를 반영한 열의 연속 공격 시퀀스입니다.' : '고정 Paladin 1HS Zeal 표와 일치한 연속 공격 시퀀스입니다.'} 이벤트 프레임은 표의 action frame 산출값이며 게임 내 실측값은 아닙니다.</p>
              : <p className={styles.resultMeta}>{skill === 'BARBARIAN_WHIRLWIND' ? 'D2R 2.4.3 이후 소용돌이의 반복 타격 간격 참고값입니다. 시작 후 첫 타격까지의 시간, 이동 거리와 대상 탐색은 포함하지 않습니다.' : skill === 'BARBARIAN_FRENZY' ? 'Frenzy 양손 17프레임 시퀀스의 총 길이 참고값입니다. 개별 손 타격 시점은 표시하지 않으며, 충전 없음/최대 충전 상태만 계산합니다.' : result.attackSequence ? skill === 'AMAZON_FEND' || skill === 'AMAZON_STRAFE' ? '선택한 공격 수의 First/Follow/Last 공개 기준 시퀀스 프레임 합계입니다.' : skill === 'AMAZON_JAB' ? '잽 3회가 포함된 공개 기준 연속 시퀀스 길이입니다. 개별 타격 이벤트 프레임은 표시하지 않습니다.' : skill === 'ASSASSIN_DRAGON_CLAW' ? '대칭 WSM·손별 동일 IAS 조건의 2회 연속 클러 공격 시퀀스 참고값입니다.' : `${result.attackSequence.label}의 전체 시퀀스 길이입니다.` : skill === 'AMAZON_IMMOLATION_ARROW' ? '연속 발사 간격은 속도에 따라 달라지는 액션 프레임과 D2R 로컬 지연 15프레임(0.6초)의 합입니다. 공격 동작 전체 길이와 구분되는 참고값입니다.' : ['AMAZON_THROW', 'AMAZON_POISON_JAVELIN', 'AMAZON_PLAGUE_JAVELIN', 'AMAZON_LIGHTNING_BOLT', 'AMAZON_LIGHTNING_FURY'].includes(skill) ? 'Amazon 1HT Throw 동작 프레임 기준입니다. 기술별 지연과 투사체 동작은 이 프레임 수에 포함하지 않았습니다.' : skill === 'SMITE' ? '방패 착용 상태의 강타 S1 전체 동작 길이입니다. 실제 타격 시점의 게임 내 실측은 아닙니다.' : '선택한 공격 동작의 전체 애니메이션 길이입니다. 실제 타격 판정 시점이나 연속 공격의 정확한 주기를 뜻하지 않습니다.'}</p>}
            <p className={styles.frameValue}><strong>{result.attackCadence?.intervalFrames ?? result.zealSequence?.totalSequenceFrames ?? result.attackSequence?.totalSequenceFrames ?? result.fullAnimationFrames}</strong><span>{result.attackCadence ? '연속 발사 간격(프레임)' : '프레임'}</span></p>
            <dl className={styles.stats}>
              {result.attackSequence ? <div><dt>연속 공격</dt><dd>{result.attackSequence.label}</dd></div> : null}
              {result.attackCadence ? <><div><dt>액션 프레임</dt><dd>{result.attackCadence.actionFrame}프레임</dd></div><div><dt>D2R 로컬 지연</dt><dd>{result.attackCadence.localDelayFrames}프레임 (0.6초)</dd></div></> : null}
              {result.attacksPerSecond ? <div><dt>초당 공격 횟수</dt><dd>{result.attacksPerSecond.toFixed(2)}</dd></div> : null}
              {result.zealSequence ? <>
                <div><dt>유효 타격 횟수</dt><dd>{result.zealSequence.hitCount}회</dd></div>
                <div><dt>첫 타격 이벤트까지</dt><dd>{result.zealSequence.firstHitFrame}프레임</dd></div>
                <div><dt>후속 타격 간격</dt><dd>{result.zealSequence.subsequentHitFrames}프레임</dd></div>
                <div><dt>마지막 타격 이벤트</dt><dd>{result.zealSequence.finalHitFrame}프레임</dd></div>
                <div><dt>마지막 공격 동작 구간</dt><dd>{result.zealSequence.finalAttackFrames}프레임</dd></div>
                <div><dt>전체 열의 시퀀스</dt><dd>{result.zealSequence.totalSequenceFrames}프레임</dd></div>
              </> : result.attackSequence ? null : <div><dt>공격 동작 전체 길이</dt><dd>{result.fullAnimationFrames}프레임</dd></div>}
              {result.effectiveIAS !== null ? <div><dt>적용 EIAS</dt><dd>{result.effectiveIAS}</dd></div> : null}
              <div><dt>{isWhirlwind ? '현재 장비 IAS 구간' : '현재 적용되는 공속 기준'}</dt><dd>{result.currentBreakpoint} IAS</dd></div>
              <div><dt>{isWhirlwind ? '다음 타격 간격 감소 기준' : '다음 프레임 감소에 필요한 공속'}</dt><dd>{result.nextBreakpoint === null ? '검증 범위 내 다음 기준 없음' : `${result.nextBreakpoint} IAS`}</dd></div>
              <div><dt>다음 단계까지 필요한 공속 증가</dt><dd>{result.requiredAdditionalIAS === null ? '검증 범위 내 다음 단계 없음' : `${result.requiredAdditionalIAS} IAS`}</dd></div>
            </dl>
            {result.nextBreakpoint === null ? <p className={styles.lastStep}>현재 이 무기의 검증된 공속 범위에서 다음 프레임 감소 기준은 확인되지 않았습니다.</p> : null}
          </> : <p className={styles.empty}>지원되는 조건을 선택하면 검증된 결과를 표시합니다.</p>}
        </section>
      </div>

      <section className={styles.tableSection} aria-labelledby="table-title">
        <div className={styles.tableHeading}><h3 id="table-title">{isPaladinCharge ? paladinChargeMode === 'RUSH' ? '실제 Charge 돌진 · IAS 기준 없음' : 'Charge 근접 fallback · 일반 공격 기준표' : selectedAnimation === 'A2' ? '검증 중인 공속 기준표' : skill === 'BARBARIAN_WHIRLWIND' ? '소용돌이 반복 타격 간격 기준표' : skill === 'BARBARIAN_FRENZY' ? '광분 양손 공격 시퀀스 기준표' : skill === 'ZEAL' ? `열의 ${hitCount}회 공격 기준표` : skill === 'SMITE' ? '강타 공격 기준표' : skill === 'AMAZON_JAB' ? '잽 연속 공격 기준표' : skill === 'AMAZON_FEND' ? `난격 ${hitCount}대상 시퀀스 기준표` : skill === 'AMAZON_STRAFE' ? `속사 ${hitCount}발 시퀀스 기준표` : model.status === 'REFERENCE_BASED' ? '참고 기준 공속표' : '검증된 공속 기준표'}</h3><p>{classes.find(([id]) => id === characterClass)?.[1]} · {selectedSkill?.label} · {selectedWeaponLabel ?? '선택 무기'} · {currentAnimation ?? selectedAnimation}</p></div>
        <details className={styles.explanation}><summary>공속 기준(브레이크포인트)이란?</summary><p>공격 속도 증가 수치를 높여도 프레임이 매번 줄어드는 것은 아닙니다. 특정 수치에 도달해야 공격 동작의 전체 프레임이 한 단계 감소합니다. 이 기준값을 브레이크포인트라고 합니다.</p></details>
        {breakpointRows.length > 0 ? <>
        <p className={styles.hint}>강조된 행은 현재 수치가 포함된 프레임 구간의 시작 기준값입니다.</p>
        <div className={styles.tableWrap}>
          <table>
          <caption className={styles.srOnly}>{classes.find(([id]) => id === characterClass)?.[1]} {selectedSkill?.label} {selectedWeaponLabel} {currentAnimation}의 공속 기준값과 프레임</caption>
            {skill === 'ZEAL' ? <>
              <thead><tr><th scope="col">기준 IAS</th><th scope="col">첫 공격</th><th scope="col">후속 간격</th><th scope="col">마지막 동작</th><th scope="col">전체 시퀀스</th><th scope="col">IAS 구간</th></tr></thead>
              <tbody>{zealBreakpointRows.map((row, index) => {
                const next = zealBreakpointRows[index + 1] ? zealBreakpointRows[index + 1].ias - 1 : maxIAS;
                const isCurrent = result?.currentBreakpoint === row.ias;
                return <tr key={row.ias} className={isCurrent ? styles.currentRow : undefined} aria-current={isCurrent ? 'true' : undefined}>
                  <th scope="row">{row.ias} IAS{isCurrent ? <span className={styles.currentBadge}>현재</span> : null}</th><td>{row.firstAttackFrames}프레임</td><td>{row.followUpAttackFrames}프레임</td><td>{row.finalAttackFrames}프레임</td><td>{row.totalSequenceFrames}프레임</td><td>{row.ias}~{next} IAS</td>
                </tr>;
              })}</tbody>
            </> : <>
            <thead><tr><th scope="col">{isWhirlwind || isAmazonImpale ? '장비 IAS 기준값' : '공속 기준값 (IAS)'}</th><th scope="col">{isWhirlwind ? '반복 타격 간격' : '공격 동작 전체 길이'}</th><th scope="col">공속 증가 수치 구간</th></tr></thead>
            <tbody>{breakpointRows.map((row, index) => {
              const next = breakpointRows[index + 1] ? breakpointRows[index + 1].ias - 1 : maxIAS;
              const isCurrent = result?.currentBreakpoint === row.ias;
              return <tr key={row.ias} className={isCurrent ? styles.currentRow : undefined} aria-current={isCurrent ? 'true' : undefined}>
                <th scope="row">{row.ias} IAS{isCurrent ? <span className={styles.currentBadge}>현재</span> : null}</th>
                <td>{row.fullAnimationFrames}프레임</td><td>{row.ias}~{next} IAS</td>
              </tr>;
            })}</tbody></>}
          </table>
        </div>
        <p className={styles.footnote}>이 표는 선택한 무기의 독립 검증 범위까지만 표시합니다. 범위 바깥의 게임 전체 기준을 의미하지 않습니다.</p>
        </> : <p className={styles.empty}>{statusMessage ?? '선택한 조합은 검증된 결과를 제공하지 않습니다.'}</p>}
      </section>
    </section>
  );
}
