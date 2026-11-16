export type SkillInfo = {
  requiredLevel: number;
  prerequisites?: readonly string[];
};

export type SkillTree = Record<string, SkillInfo>;
export type SkillAllocation = Record<string, number>;

export const MAX_HARD_SKILL_POINTS = 20;

export function availableSkillPoints(level: number, questRewards: number) {
  if (level < 1 || questRewards < 0) return 0;
  return level - 1 + questRewards;
}

export function maxRankAtLevel(requiredLevel: number, characterLevel: number) {
  return Math.max(0, Math.min(MAX_HARD_SKILL_POINTS, characterLevel - requiredLevel + 1));
}

export function validateSkillAllocation(
  classSkills: SkillTree,
  allocation: SkillAllocation,
  characterLevel: number,
  questRewards: number,
) {
  const errors: string[] = [];
  const total = Object.values(allocation).reduce((sum, points) => sum + points, 0);
  const available = availableSkillPoints(characterLevel, questRewards);

  if (total !== available) errors.push(`포인트 합계 ${total}가 사용 가능 포인트 ${available}와 다릅니다.`);

  for (const [skill, points] of Object.entries(allocation)) {
    const info = classSkills[skill];
    if (!info) {
      errors.push(`등록되지 않은 기술: ${skill}`);
      continue;
    }
    if (!Number.isInteger(points) || points < 0) errors.push(`${skill}: 포인트는 0 이상의 정수여야 합니다.`);
    if (points > MAX_HARD_SKILL_POINTS) errors.push(`${skill}: 기본 기술 포인트 상한 20을 초과했습니다.`);
    const rankLimit = maxRankAtLevel(info.requiredLevel, characterLevel);
    if (points > rankLimit) errors.push(`${skill}: 레벨 ${characterLevel}에서 ${rankLimit}포인트까지만 투자할 수 있습니다.`);
    if (points > 0 && info.requiredLevel > characterLevel) errors.push(`${skill}: 요구 레벨 ${info.requiredLevel}에 도달하지 않았습니다.`);
    if (points > 0) {
      for (const prerequisite of info.prerequisites ?? []) {
        if ((allocation[prerequisite] ?? 0) < 1) errors.push(`${skill}: 선행 기술 ${prerequisite}가 필요합니다.`);
      }
    }
  }

  return { valid: errors.length === 0, total, available, errors };
}

export type SkillProgressionStep = {
  level: number;
  questRewards: number;
  allocation: SkillAllocation;
};

export function validateSkillProgression(classSkills: SkillTree, steps: readonly SkillProgressionStep[]) {
  const errors: string[] = [];
  let previous: SkillAllocation = {};
  for (const step of steps) {
    const result = validateSkillAllocation(classSkills, step.allocation, step.level, step.questRewards);
    errors.push(...result.errors.map((error) => `레벨 ${step.level}: ${error}`));
    for (const [skill, points] of Object.entries(step.allocation)) {
      if (points < (previous[skill] ?? 0)) errors.push(`레벨 ${step.level}: ${skill} 포인트가 이전 단계보다 감소했습니다.`);
    }
    previous = step.allocation;
  }
  return { valid: errors.length === 0, errors };
}

export const necromancerSkills: SkillTree = {
  raiseSkeleton: { requiredLevel: 1 },
  skeletonMastery: { requiredLevel: 1, prerequisites: ['raiseSkeleton'] },
  clayGolem: { requiredLevel: 6 },
  golemMastery: { requiredLevel: 12, prerequisites: ['clayGolem'] },
  summonResist: { requiredLevel: 24, prerequisites: ['golemMastery'] },
  raiseSkeletalMage: { requiredLevel: 12, prerequisites: ['raiseSkeleton'] },
  bloodGolem: { requiredLevel: 18, prerequisites: ['clayGolem'] },
  ironGolem: { requiredLevel: 24, prerequisites: ['bloodGolem'] },
  revive: { requiredLevel: 30, prerequisites: ['raiseSkeletalMage', 'ironGolem'] },
  teeth: { requiredLevel: 1 },
  corpseExplosion: { requiredLevel: 6, prerequisites: ['teeth'] },
  boneArmor: { requiredLevel: 1 },
  boneWall: { requiredLevel: 12, prerequisites: ['boneArmor'] },
  amplifyDamage: { requiredLevel: 1 },
  weaken: { requiredLevel: 6, prerequisites: ['amplifyDamage'] },
  terror: { requiredLevel: 12, prerequisites: ['weaken'] },
  decrepify: { requiredLevel: 24, prerequisites: ['terror'] },
  dimVision: { requiredLevel: 6 },
  confuse: { requiredLevel: 12, prerequisites: ['dimVision'] },
  attract: { requiredLevel: 24, prerequisites: ['confuse'] },
};

export const assassinSkills: SkillTree = {
  fireBlast: { requiredLevel: 1 },
  shockWeb: { requiredLevel: 1 },
  chargedBoltSentry: { requiredLevel: 12, prerequisites: ['shockWeb'] },
  wakeOfFire: { requiredLevel: 12, prerequisites: ['fireBlast'] },
  lightningSentry: { requiredLevel: 24, prerequisites: ['chargedBoltSentry'] },
  deathSentry: { requiredLevel: 30, prerequisites: ['lightningSentry'] },
  clawMastery: { requiredLevel: 1 },
  burstOfSpeed: { requiredLevel: 6, prerequisites: ['clawMastery'] },
  psychicHammer: { requiredLevel: 1 },
  cloakOfShadows: { requiredLevel: 12, prerequisites: ['psychicHammer'] },
  mindBlast: { requiredLevel: 24, prerequisites: ['cloakOfShadows'] },
  fade: { requiredLevel: 12, prerequisites: ['cloakOfShadows'] },
};

export const necromancerBuilds = {
  level40: {
    raiseSkeleton: 20, skeletonMastery: 14, clayGolem: 1, golemMastery: 1,
    summonResist: 1, teeth: 1, corpseExplosion: 1, amplifyDamage: 1,
    weaken: 1, terror: 1, decrepify: 1,
  },
  level85: {
    raiseSkeleton: 20, skeletonMastery: 20, clayGolem: 1, golemMastery: 1,
    summonResist: 1, raiseSkeletalMage: 1, bloodGolem: 1, ironGolem: 1,
    revive: 1, teeth: 1, corpseExplosion: 20, boneArmor: 1, boneWall: 20,
    amplifyDamage: 1, weaken: 1, terror: 1, decrepify: 1, dimVision: 1,
    confuse: 1, attract: 1,
  },
} satisfies Record<string, SkillAllocation>;

export const assassinBuilds = {
  fireLevel40: {
    fireBlast: 15, wakeOfFire: 20, clawMastery: 1, burstOfSpeed: 5,
    psychicHammer: 1, cloakOfShadows: 1,
  },
  lightningLevel40: {
    fireBlast: 4, shockWeb: 1, chargedBoltSentry: 14, lightningSentry: 17,
    deathSentry: 1, clawMastery: 1, burstOfSpeed: 1, psychicHammer: 1,
    cloakOfShadows: 1, mindBlast: 1, fade: 1,
  },
  lightningLevel85: {
    fireBlast: 20, shockWeb: 10, chargedBoltSentry: 20, lightningSentry: 20,
    deathSentry: 20, clawMastery: 1, burstOfSpeed: 1, psychicHammer: 1,
    cloakOfShadows: 1, mindBlast: 1, fade: 1,
  },
} satisfies Record<string, SkillAllocation>;
