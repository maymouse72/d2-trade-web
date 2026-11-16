import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  amazonBuilds,
  amazonSkills,
  barbarianBuilds,
  barbarianSkills,
  barbarianSkillSynergies,
  assassinBuilds,
  assassinSkills,
  availableSkillPoints,
  druidBuilds,
  druidSkills,
  warlockBuilds,
  warlockSkills,
  warlockSkillSynergies,
  necromancerBuilds,
  necromancerSkills,
  validateSkillAllocation,
  validateSkillProgression,
  type SkillAllocation,
  type SkillProgressionStep,
} from '../lib/leveling-guides/skill-builds.ts';

test('level and quest skill points match guide totals', () => {
  assert.equal(availableSkillPoints(1, 0), 0);
  assert.equal(availableSkillPoints(40, 4), 43);
  assert.equal(availableSkillPoints(85, 12), 96);
});

test('existing guide snapshots and new Amazon/Druid snapshots obey totals, rank caps, and prerequisites', () => {
  for (const [skills, allocation, level, quests] of [
    [necromancerSkills, necromancerBuilds.level40, 40, 4],
    [necromancerSkills, necromancerBuilds.level85, 85, 12],
    [assassinSkills, assassinBuilds.fireLevel40, 40, 4],
    [assassinSkills, assassinBuilds.lightningLevel40, 40, 4],
    [assassinSkills, assassinBuilds.lightningLevel85, 85, 12],
    [amazonSkills, amazonBuilds.poisonLevel40, 40, 4],
    [amazonSkills, amazonBuilds.poisonLevel40NoQuests, 40, 0],
    [amazonSkills, amazonBuilds.lightningLevel40, 40, 4],
    [amazonSkills, amazonBuilds.lightningLevel85, 85, 12],
    [amazonSkills, amazonBuilds.lightningLevel85NoQuests, 85, 0],
    [amazonSkills, amazonBuilds.hybridLevel85, 85, 12],
    [druidSkills, druidBuilds.fireLevel40, 40, 4],
    [druidSkills, druidBuilds.fireLevel40NoQuests, 40, 0],
    [druidSkills, druidBuilds.windLevel40, 40, 4],
    [druidSkills, druidBuilds.windLevel40NoQuests, 40, 0],
    [druidSkills, druidBuilds.windLevel85, 85, 12],
    [druidSkills, druidBuilds.windLevel85NoQuests, 85, 0],
    [barbarianSkills, barbarianBuilds.meleeLevel29, 29, 0],
    [barbarianSkills, barbarianBuilds.singerLevel40, 40, 4],
    [barbarianSkills, barbarianBuilds.singerLevel40NoQuests, 40, 0],
    [barbarianSkills, barbarianBuilds.singerLevel85, 85, 12],
    [warlockSkills, warlockBuilds.chaosLevel40, 40, 4],
    [warlockSkills, warlockBuilds.chaosLevel40NoQuests, 40, 0],
    [warlockSkills, warlockBuilds.chaosLevel85, 85, 12],
    [warlockSkills, warlockBuilds.chaosLevel85NoQuests, 85, 0],
  ] as const) {
    const result = validateSkillAllocation(skills, allocation, level, quests);
    assert.equal(result.valid, true, result.errors.join('\n'));
  }
});

test('Barbarian and Warlock prerequisite data and documented skill synergies are exact', () => {
  assert.deepEqual(barbarianSkills.doubleSwing.prerequisites, ['bash']);
  assert.deepEqual(barbarianSkills.frenzy.prerequisites, ['doubleThrow']);
  assert.deepEqual(barbarianSkills.warCry.prerequisites, ['battleCry', 'battleOrders']);
  assert.deepEqual(barbarianSkillSynergies.warCry, ['howl', 'taunt', 'battleCry']);
  assert.deepEqual(warlockSkills.abyss.prerequisites, ['enhancedEntropy']);
  assert.equal(warlockSkills.levitationMastery.requiredLevel, 1);
  assert.equal(warlockSkills.echoingStrike.requiredLevel, 12);
  assert.equal(warlockSkills.bladeWarp.requiredLevel, 18);
  assert.deepEqual(warlockSkills.echoingStrike.prerequisites, ['levitationMastery']);
  assert.deepEqual(warlockSkills.bladeWarp.prerequisites, ['echoingStrike']);
  assert.deepEqual(warlockSkills.apocalypse.prerequisites, ['flameWave', 'sigilDeath']);
  assert.deepEqual(warlockSkillSynergies.abyss, ['miasmaBolt', 'miasmaChain']);
  assert.deepEqual(warlockSkillSynergies.apocalypse, ['ringOfFire', 'flameWave']);
});

test('eight guide articles and portrait assets exist with required shared tip coverage', () => {
  const jobs = ['sorceress', 'paladin', 'necromancer', 'assassin', 'amazon', 'druid', 'barbarian', 'warlock'];
  for (const job of jobs) {
    const articlePath = new URL(`../app/game-info/leveling-guides/content/${job}.json`, import.meta.url);
    const article = JSON.parse(readFileSync(articlePath, 'utf8').replace(/^\uFEFF/, '')) as string;
    assert.ok(article.length > 1500, `${job} article should be substantive`);
    assert.ok(existsSync(new URL(`../public/images/leveling-guides/${job}.webp`, import.meta.url)), `${job} portrait should exist`);
    if (job === 'sorceress') assert.ok(!article.includes('순간이동 충전 지팡이 구매'));
  }
  assert.ok(readFileSync(new URL('../app/game-info/leveling-guides/TeleportStaffTip.tsx', import.meta.url), 'utf8').includes('오르무스'));
});

test('Amazon poison leveling steps validate every level and account for a saved level-5 point', () => {
  const current: SkillAllocation = {};
  const steps: SkillProgressionStep[] = [{ level: 1, questRewards: 0, allocation: { ...current } }];
  const add = (level: number, skill: string, points = 1, questRewards = 0, unspentPoints = 0) => {
    current[skill] = (current[skill] ?? 0) + points;
    steps.push({ level, questRewards, allocation: { ...current }, unspentPoints });
  };
  add(2, 'jab');
  add(3, 'innerSight');
  add(4, 'criticalStrike');
  steps.push({ level: 5, questRewards: 0, allocation: { ...current }, unspentPoints: 1 });
  current.poisonJavelin = 1;
  current.dodge = 1;
  steps.push({ level: 6, questRewards: 0, allocation: { ...current } });
  for (let level = 7; level <= 11; level += 1) add(level, 'poisonJavelin');
  add(12, 'lightningBolt');
  for (let level = 13; level <= 25; level += 1) add(level, 'poisonJavelin');
  add(26, 'poisonJavelin');
  for (let level = 27; level <= 39; level += 1) add(level, 'plagueJavelin');
  add(40, 'plagueJavelin', 5, 4);

  const result = validateSkillProgression(amazonSkills, steps);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.deepEqual(current, amazonBuilds.poisonLevel40);
});

test('skill progression rejects negative or fractional unspent points', () => {
  const invalid = validateSkillProgression(amazonSkills, [
    { level: 2, questRewards: 0, allocation: { jab: 1 }, unspentPoints: -1 },
  ]);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes('미투자 포인트는 0 이상의 정수')));
});

test('Amazon lightning and Druid wind progression reach verified level-85 allocations', () => {
  const amazon: SkillAllocation = { ...amazonBuilds.lightningLevel40 };
  const amazonSteps: SkillProgressionStep[] = [{ level: 40, questRewards: 4, allocation: { ...amazon } }];
  const addAmazon = (level: number, skill: string, points = 1, questRewards = 4) => {
    amazon[skill] = (amazon[skill] ?? 0) + points;
    amazonSteps.push({ level, questRewards, allocation: { ...amazon } });
  };
  for (let level = 41; level <= 49; level += 1) addAmazon(level, 'lightningFury');
  for (let level = 50; level <= 53; level += 1) addAmazon(level, 'chargedStrike');
  for (let level = 54; level <= 72; level += 1) addAmazon(level, 'lightningStrike');
  for (let level = 73; level <= 84; level += 1) addAmazon(level, 'powerStrike');
  amazon.powerStrike += 7;
  amazon.decoy += 2;
  amazonSteps.push({ level: 85, questRewards: 12, allocation: { ...amazon } });
  const amazonResult = validateSkillProgression(amazonSkills, amazonSteps);
  assert.equal(amazonResult.valid, true, amazonResult.errors.join('\n'));
  assert.deepEqual(amazon, amazonBuilds.lightningLevel85);

  const druid: SkillAllocation = { ...druidBuilds.windLevel40 };
  const druidSteps: SkillProgressionStep[] = [{ level: 40, questRewards: 4, allocation: { ...druid } }];
  const addDruid = (level: number, skill: string) => {
    druid[skill] = (druid[skill] ?? 0) + 1;
    druidSteps.push({ level, questRewards: 4, allocation: { ...druid } });
  };
  for (let level = 41; level <= 43; level += 1) addDruid(level, 'tornado');
  for (let level = 44; level <= 52; level += 1) addDruid(level, 'hurricane');
  for (let level = 53; level <= 64; level += 1) addDruid(level, 'cycloneArmor');
  for (let level = 65; level <= 83; level += 1) addDruid(level, 'twister');
  addDruid(84, 'oakSage');
  druid.oakSage += 9;
  druidSteps.push({ level: 85, questRewards: 12, allocation: { ...druid } });
  const druidResult = validateSkillProgression(druidSkills, druidSteps);
  assert.equal(druidResult.valid, true, druidResult.errors.join('\n'));
  assert.deepEqual(druid, druidBuilds.windLevel85);
});

test('Druid fire leveling validates sequential skill unlocks from level 1 to 40', () => {
  const current: SkillAllocation = {};
  const steps: SkillProgressionStep[] = [{ level: 1, questRewards: 0, allocation: {} }];
  const add = (level: number, skill: string, points = 1, questRewards = 0) => {
    current[skill] = (current[skill] ?? 0) + points;
    steps.push({ level, questRewards, allocation: { ...current } });
  };
  for (let level = 2; level <= 5; level += 1) add(level, 'firestorm');
  add(6, 'oakSage');
  add(7, 'moltenBoulder');
  add(8, 'arcticBlast');
  for (let level = 9; level <= 11; level += 1) add(level, 'firestorm');
  for (let level = 12; level <= 31; level += 1) add(level, 'fissure');
  for (let level = 32; level <= 39; level += 1) add(level, 'firestorm');
  add(40, 'firestorm', 5, 4);
  const result = validateSkillProgression(druidSkills, steps);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.deepEqual(current, druidBuilds.fireLevel40);
});

test('assassin lightning sentry rank is capped at 17 at level 40', () => {
  const invalid: SkillAllocation = { ...assassinBuilds.lightningLevel40, lightningSentry: 20, fireBlast: 1 };
  const result = validateSkillAllocation(assassinSkills, invalid, 40, 4);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('레벨 40에서 17포인트')));
});

test('Barbarian singer progression stays legal from the level-40 reset to level 85', () => {
  const allocation: SkillAllocation = { ...barbarianBuilds.singerLevel40 };
  const steps: SkillProgressionStep[] = [{ level: 40, questRewards: 4, allocation: { ...allocation } }];
  const add = (level: number, skill: string, questRewards = 4) => {
    allocation[skill] = (allocation[skill] ?? 0) + 1;
    steps.push({ level, questRewards, allocation: { ...allocation } });
  };
  for (let level = 41; level <= 49; level += 1) add(level, 'warCry');
  for (let level = 50; level <= 52; level += 1) add(level, 'battleOrders');
  for (let level = 53; level <= 70; level += 1) add(level, 'howl');
  for (let level = 71; level <= 84; level += 1) {
    allocation.taunt += 1;
    steps.push({ level, questRewards: 8, allocation: { ...allocation }, unspentPoints: 4 });
  }
  steps[steps.length - 1] = { ...steps.at(-1)!, unspentPoints: 4 };
  allocation.taunt += 3;
  allocation.battleCry += 4;
  allocation.findPotion = 1;
  allocation.findItem = 1;
  steps.push({ level: 85, questRewards: 12, allocation: { ...allocation } });

  const result = validateSkillProgression(barbarianSkills, steps);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.deepEqual(allocation, barbarianBuilds.singerLevel85);
});

test('Barbarian Double Swing to Frenzy leveling route stays legal through level 29', () => {
  const allocation: SkillAllocation = {};
  const steps: SkillProgressionStep[] = [{ level: 1, questRewards: 0, allocation: {} }];
  const add = (level: number, skill: string, points = 1) => {
    allocation[skill] = (allocation[skill] ?? 0) + points;
    const allocated = Object.values(allocation).reduce((sum, rank) => sum + rank, 0);
    steps.push({ level, questRewards: 0, allocation: { ...allocation }, unspentPoints: level - 1 - allocated });
  };
  add(2, 'bash');
  add(3, 'howl');
  steps.push({ level: 4, questRewards: 0, allocation: { ...allocation }, unspentPoints: 1 });
  steps.push({ level: 5, questRewards: 0, allocation: { ...allocation }, unspentPoints: 2 });
  allocation.doubleSwing = 1;
  allocation.taunt = 1;
  steps.push({ level: 6, questRewards: 0, allocation: { ...allocation }, unspentPoints: 1 });
  for (let level = 7; level <= 11; level += 1) add(level, 'doubleSwing');
  add(12, 'doubleThrow');
  add(13, 'shout');
  for (let level = 14; level <= 17; level += 1) add(level, 'doubleSwing');
  add(18, 'battleCry');
  for (let level = 19; level <= 23; level += 1) {
    const allocated = Object.values(allocation).reduce((sum, rank) => sum + rank, 0);
    steps.push({ level, questRewards: 0, allocation: { ...allocation }, unspentPoints: level - 1 - allocated });
  }
  allocation.battleOrders = 1;
  allocation.frenzy = 1;
  steps.push({ level: 24, questRewards: 0, allocation: { ...allocation }, unspentPoints: 24 - 1 - Object.values(allocation).reduce((sum, rank) => sum + rank, 0) });
  for (let level = 25; level <= 29; level += 1) {
    allocation.battleOrders += 1;
    allocation.frenzy += 1;
    const allocated = Object.values(allocation).reduce((sum, rank) => sum + rank, 0);
    steps.push({ level, questRewards: 0, allocation: { ...allocation }, unspentPoints: level - 1 - allocated });
  }

  const result = validateSkillProgression(barbarianSkills, steps);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.deepEqual(allocation, barbarianBuilds.meleeLevel29);
});

test('Warlock Chaos progression reaches Abyss, then adds a legal fire option by level 85', () => {
  const allocation: SkillAllocation = { ...warlockBuilds.chaosLevel40 };
  const steps: SkillProgressionStep[] = [{ level: 40, questRewards: 4, allocation: { ...allocation } }];
  const add = (level: number, skill: string, questRewards = 4, points = 1) => {
    allocation[skill] = (allocation[skill] ?? 0) + points;
    steps.push({ level, questRewards, allocation: { ...allocation } });
  };
  for (let level = 41; level <= 52; level += 1) add(level, 'abyss');
  for (let level = 53; level <= 61; level += 1) add(level, 'miasmaChain');
  add(62, 'ringOfFire');
  add(63, 'flameWave');
  add(64, 'sigilLethargy');
  add(65, 'sigilRancor');
  add(66, 'sigilDeath');
  for (let level = 67; level <= 83; level += 1) add(level, 'apocalypse');
  add(84, 'flameWave');
  add(85, 'flameWave', 12, 9);

  const result = validateSkillProgression(warlockSkills, steps);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.deepEqual(allocation, warlockBuilds.chaosLevel85);
});

test('Warlock prerequisite routes, stored points, and level-30 Abyss investment are legal through level 40', () => {
  const allocation: SkillAllocation = {};
  const steps: SkillProgressionStep[] = [{ level: 1, questRewards: 0, allocation: {} }];
  const checkpoint = (level: number, questRewards = 0) => {
    const allocated = Object.values(allocation).reduce((sum, rank) => sum + rank, 0);
    const available = availableSkillPoints(level, questRewards);
    steps.push({ level, questRewards, allocation: { ...allocation }, unspentPoints: available - allocated });
  };

  allocation.levitationMastery = 1;
  checkpoint(2);
  allocation.miasmaBolt = 1;
  allocation.echoingStrike = 1;
  allocation.miasmaChain = 1;
  checkpoint(12);
  allocation.bladeWarp = 1;
  checkpoint(18);
  allocation.enhancedEntropy = 1;
  checkpoint(24);

  allocation.miasmaBolt = 20;
  allocation.miasmaChain = 11;
  checkpoint(32, 4);
  for (let level = 33; level <= 40; level += 1) {
    allocation.abyss = (allocation.abyss ?? 0) + 1;
    checkpoint(level, 4);
  }

  const result = validateSkillProgression(warlockSkills, steps);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.deepEqual(allocation, warlockBuilds.chaosLevel40);
});

test('unfinished skill quests do not create points and published fallback allocations remain valid', () => {
  const variants: Array<[typeof necromancerSkills | typeof assassinSkills, SkillAllocation, number]> = [
    [necromancerSkills, { ...necromancerBuilds.level40, skeletonMastery: 10 }, 40],
    [necromancerSkills, { ...necromancerBuilds.level85, boneWall: 8 }, 85],
    [assassinSkills, { ...assassinBuilds.fireLevel40, burstOfSpeed: 1 }, 40],
    [assassinSkills, { ...assassinBuilds.lightningLevel40, fireBlast: 1, chargedBoltSentry: 13 }, 40],
    [assassinSkills, { ...assassinBuilds.lightningLevel85, fireBlast: 17, shockWeb: 1 }, 85],
  ];
  for (const [skills, allocation, level] of variants) {
    const result = validateSkillAllocation(skills, allocation, level, 0);
    assert.equal(result.valid, true, result.errors.join('\n'));
  }
});

test('assassin lightning respec milestones reach level 85 without illegal rank jumps', () => {
  const current: SkillAllocation = { ...assassinBuilds.lightningLevel40 };
  const steps: SkillProgressionStep[] = [{ level: 40, questRewards: 4, allocation: { ...current } }];

  current.lightningSentry = 20;
  steps.push({ level: 43, questRewards: 4, allocation: { ...current } });
  current.chargedBoltSentry = 20;
  steps.push({ level: 49, questRewards: 4, allocation: { ...current } });
  current.deathSentry = 20;
  steps.push({ level: 68, questRewards: 4, allocation: { ...current } });
  current.fireBlast = 20;
  steps.push({ level: 84, questRewards: 4, allocation: { ...current } });
  current.shockWeb = 10;
  steps.push({ level: 85, questRewards: 12, allocation: { ...current } });

  const result = validateSkillProgression(assassinSkills, steps);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.deepEqual(current, assassinBuilds.lightningLevel85);
});
