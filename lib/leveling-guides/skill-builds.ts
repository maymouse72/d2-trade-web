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
  unspentPoints?: number;
};

export function validateSkillProgression(classSkills: SkillTree, steps: readonly SkillProgressionStep[]) {
  const errors: string[] = [];
  let previous: SkillAllocation = {};
  for (const step of steps) {
    const result = validateSkillAllocation(classSkills, step.allocation, step.level, step.questRewards);
    const unspentPoints = step.unspentPoints ?? 0;
    if (!Number.isInteger(unspentPoints) || unspentPoints < 0) {
      errors.push(`레벨 ${step.level}: 미투자 포인트는 0 이상의 정수여야 합니다.`);
    }
    const totalWithUnspent = result.total + unspentPoints;
    if (totalWithUnspent !== result.available) {
      errors.push(`레벨 ${step.level}: 투자 ${result.total} + 미투자 ${unspentPoints} = 사용 가능 ${result.available}이어야 합니다.`);
    }
    errors.push(...result.errors.filter((error) => !error.startsWith('포인트 합계')).map((error) => `레벨 ${step.level}: ${error}`));
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

export const amazonSkills: SkillTree = {
  jab: { requiredLevel: 1 },
  criticalStrike: { requiredLevel: 1 },
  innerSight: { requiredLevel: 1 },
  dodge: { requiredLevel: 6 },
  powerStrike: { requiredLevel: 6, prerequisites: ['jab'] },
  poisonJavelin: { requiredLevel: 6 },
  slowMissiles: { requiredLevel: 12, prerequisites: ['innerSight'] },
  avoid: { requiredLevel: 12, prerequisites: ['dodge'] },
  lightningBolt: { requiredLevel: 12, prerequisites: ['poisonJavelin'] },
  penetrate: { requiredLevel: 18, prerequisites: ['criticalStrike'] },
  chargedStrike: { requiredLevel: 18, prerequisites: ['powerStrike', 'lightningBolt'] },
  plagueJavelin: { requiredLevel: 18, prerequisites: ['lightningBolt'] },
  decoy: { requiredLevel: 24, prerequisites: ['slowMissiles'] },
  evade: { requiredLevel: 24, prerequisites: ['avoid'] },
  valkyrie: { requiredLevel: 30, prerequisites: ['decoy', 'evade'] },
  pierce: { requiredLevel: 30, prerequisites: ['penetrate'] },
  lightningStrike: { requiredLevel: 30, prerequisites: ['chargedStrike'] },
  lightningFury: { requiredLevel: 30, prerequisites: ['plagueJavelin'] },
};

export const druidSkills: SkillTree = {
  firestorm: { requiredLevel: 1 },
  raven: { requiredLevel: 1 },
  oakSage: { requiredLevel: 6 },
  summonSpiritWolf: { requiredLevel: 6, prerequisites: ['raven'] },
  moltenBoulder: { requiredLevel: 6, prerequisites: ['firestorm'] },
  arcticBlast: { requiredLevel: 6 },
  fissure: { requiredLevel: 12, prerequisites: ['moltenBoulder'] },
  cycloneArmor: { requiredLevel: 12, prerequisites: ['arcticBlast'] },
  summonDireWolf: { requiredLevel: 18, prerequisites: ['oakSage', 'summonSpiritWolf'] },
  twister: { requiredLevel: 18, prerequisites: ['cycloneArmor'] },
  tornado: { requiredLevel: 24, prerequisites: ['twister'] },
  summonGrizzly: { requiredLevel: 30, prerequisites: ['summonDireWolf'] },
  hurricane: { requiredLevel: 30, prerequisites: ['tornado'] },
};

export const barbarianSkills: SkillTree = {
  bash: { requiredLevel: 1 },
  howl: { requiredLevel: 1 },
  bladeMastery: { requiredLevel: 1 },
  findPotion: { requiredLevel: 1 },
  doubleSwing: { requiredLevel: 6, prerequisites: ['bash'] },
  taunt: { requiredLevel: 6, prerequisites: ['howl'] },
  shout: { requiredLevel: 6, prerequisites: ['howl'] },
  doubleThrow: { requiredLevel: 12, prerequisites: ['doubleSwing'] },
  findItem: { requiredLevel: 12, prerequisites: ['findPotion'] },
  stun: { requiredLevel: 12, prerequisites: ['bash'] },
  battleCry: { requiredLevel: 18, prerequisites: ['taunt'] },
  concentrate: { requiredLevel: 18, prerequisites: ['stun'] },
  frenzy: { requiredLevel: 24, prerequisites: ['doubleThrow'] },
  battleOrders: { requiredLevel: 24, prerequisites: ['shout'] },
  warCry: { requiredLevel: 30, prerequisites: ['battleCry', 'battleOrders'] },
  battleCommand: { requiredLevel: 30, prerequisites: ['battleOrders'] },
  berserk: { requiredLevel: 30, prerequisites: ['concentrate'] },
  naturalResistance: { requiredLevel: 30 },
};

export const warlockSkills: SkillTree = {
  levitationMastery: { requiredLevel: 1 },
  echoingStrike: { requiredLevel: 12, prerequisites: ['levitationMastery'] },
  bladeWarp: { requiredLevel: 18, prerequisites: ['echoingStrike'] },
  miasmaBolt: { requiredLevel: 1 },
  ringOfFire: { requiredLevel: 6 },
  sigilLethargy: { requiredLevel: 6 },
  miasmaChain: { requiredLevel: 12, prerequisites: ['miasmaBolt'] },
  sigilRancor: { requiredLevel: 12, prerequisites: ['sigilLethargy'] },
  flameWave: { requiredLevel: 18, prerequisites: ['ringOfFire'] },
  enhancedEntropy: { requiredLevel: 24, prerequisites: ['miasmaChain'] },
  sigilDeath: { requiredLevel: 24, prerequisites: ['sigilRancor'] },
  abyss: { requiredLevel: 30, prerequisites: ['enhancedEntropy'] },
  apocalypse: { requiredLevel: 30, prerequisites: ['flameWave', 'sigilDeath'] },
};

export const barbarianSkillSynergies = {
  warCry: ['howl', 'taunt', 'battleCry'],
} as const;

export const warlockSkillSynergies = {
  abyss: ['miasmaBolt', 'miasmaChain'],
  apocalypse: ['ringOfFire', 'flameWave'],
} as const;

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

export const amazonBuilds = {
  poisonLevel40: {
    jab: 1, innerSight: 1, criticalStrike: 1, poisonJavelin: 20,
    lightningBolt: 1, plagueJavelin: 18, dodge: 1,
  },
  poisonLevel40NoQuests: {
    jab: 1, innerSight: 1, criticalStrike: 1, poisonJavelin: 20,
    lightningBolt: 1, plagueJavelin: 14, dodge: 1,
  },
  lightningLevel40: {
    jab: 1, powerStrike: 1, poisonJavelin: 1, lightningBolt: 1,
    chargedStrike: 16, lightningStrike: 1, plagueJavelin: 1, lightningFury: 11,
    criticalStrike: 1, penetrate: 1, pierce: 1, innerSight: 1, slowMissiles: 1,
    decoy: 1, dodge: 1, avoid: 1, evade: 1, valkyrie: 1,
  },
  lightningLevel85: {
    jab: 1, powerStrike: 20, poisonJavelin: 1, lightningBolt: 1,
    chargedStrike: 20, lightningStrike: 20, plagueJavelin: 1, lightningFury: 20,
    criticalStrike: 1, penetrate: 1, pierce: 1, innerSight: 1, slowMissiles: 1,
    decoy: 3, dodge: 1, avoid: 1, evade: 1, valkyrie: 1,
  },
  lightningLevel85NoQuests: {
    jab: 1, powerStrike: 14, poisonJavelin: 1, lightningBolt: 1,
    chargedStrike: 20, lightningStrike: 20, plagueJavelin: 1, lightningFury: 20,
    criticalStrike: 1, penetrate: 1, pierce: 1, innerSight: 1, slowMissiles: 1,
    decoy: 1,
  },
  hybridLevel85: {
    jab: 1, powerStrike: 3, poisonJavelin: 20, lightningBolt: 1,
    chargedStrike: 20, lightningStrike: 1, plagueJavelin: 20, lightningFury: 20,
    criticalStrike: 1, penetrate: 1, pierce: 1, innerSight: 1, slowMissiles: 1,
    decoy: 1, dodge: 1, avoid: 1, evade: 1, valkyrie: 1,
  },
} satisfies Record<string, SkillAllocation>;

export const druidBuilds = {
  fireLevel40: { firestorm: 20, oakSage: 1, moltenBoulder: 1, arcticBlast: 1, fissure: 20 },
  fireLevel40NoQuests: { firestorm: 16, oakSage: 1, moltenBoulder: 1, arcticBlast: 1, fissure: 20 },
  windLevel40: {
    raven: 1, arcticBlast: 1, cycloneArmor: 8, twister: 1, tornado: 17,
    hurricane: 11, oakSage: 1, summonSpiritWolf: 1, summonDireWolf: 1, summonGrizzly: 1,
  },
  windLevel40NoQuests: {
    raven: 1, arcticBlast: 1, cycloneArmor: 4, twister: 1, tornado: 17,
    hurricane: 11, oakSage: 1, summonSpiritWolf: 1, summonDireWolf: 1, summonGrizzly: 1,
  },
  windLevel85: {
    raven: 1, arcticBlast: 1, cycloneArmor: 20, twister: 20, tornado: 20,
    hurricane: 20, oakSage: 11, summonSpiritWolf: 1, summonDireWolf: 1, summonGrizzly: 1,
  },
  windLevel85NoQuests: {
    raven: 1, arcticBlast: 1, cycloneArmor: 18, twister: 20, tornado: 20,
    hurricane: 20, oakSage: 1, summonSpiritWolf: 1, summonDireWolf: 1, summonGrizzly: 1,
  },
} satisfies Record<string, SkillAllocation>;

export const barbarianBuilds = {
  meleeLevel29: {
    bash: 1, doubleSwing: 10, howl: 1, taunt: 1, shout: 1,
    doubleThrow: 1, battleCry: 1, battleOrders: 6, frenzy: 6,
  },
  singerLevel40: {
    bash: 1, doubleSwing: 1, doubleThrow: 1, frenzy: 1, stun: 1, concentrate: 1, berserk: 1,
    howl: 2, taunt: 3, battleCry: 1, shout: 1, battleOrders: 17,
    battleCommand: 1, warCry: 11,
  },
  singerLevel40NoQuests: {
    bash: 1, doubleSwing: 1, doubleThrow: 1, frenzy: 1, stun: 1, concentrate: 1, berserk: 1,
    howl: 1, taunt: 1, battleCry: 1, shout: 1, battleOrders: 17,
    battleCommand: 1, warCry: 10,
  },
  singerLevel85: {
    bash: 1, doubleSwing: 1, doubleThrow: 1, frenzy: 1, stun: 1, concentrate: 1, berserk: 1,
    howl: 20, taunt: 20, battleCry: 5, shout: 1, battleOrders: 20, findPotion: 1, findItem: 1,
    battleCommand: 1, warCry: 20,
  },
} satisfies Record<string, SkillAllocation>;

export const warlockBuilds = {
  chaosLevel40: { levitationMastery: 1, echoingStrike: 1, bladeWarp: 1, miasmaBolt: 20, miasmaChain: 11, enhancedEntropy: 1, abyss: 8 },
  chaosLevel40NoQuests: { levitationMastery: 1, echoingStrike: 1, bladeWarp: 1, miasmaBolt: 20, miasmaChain: 11, enhancedEntropy: 1, abyss: 4 },
  chaosLevel85: {
    levitationMastery: 1, echoingStrike: 1, bladeWarp: 1,
    miasmaBolt: 20, miasmaChain: 20, enhancedEntropy: 1, abyss: 20,
    ringOfFire: 1, sigilLethargy: 1, flameWave: 11,
    sigilRancor: 1, sigilDeath: 1, apocalypse: 17,
  },
  chaosLevel85NoQuests: {
    levitationMastery: 1, echoingStrike: 1, bladeWarp: 1,
    miasmaBolt: 20, miasmaChain: 20, enhancedEntropy: 1, abyss: 20,
    ringOfFire: 1, sigilLethargy: 1, flameWave: 5,
    sigilRancor: 1, sigilDeath: 1, apocalypse: 11,
  },
} satisfies Record<string, SkillAllocation>;
