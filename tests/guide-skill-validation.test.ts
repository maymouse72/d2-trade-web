import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assassinBuilds,
  assassinSkills,
  availableSkillPoints,
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

test('four class guide snapshots obey totals, rank caps, and prerequisites', () => {
  for (const [skills, allocation, level, quests] of [
    [necromancerSkills, necromancerBuilds.level40, 40, 4],
    [necromancerSkills, necromancerBuilds.level85, 85, 12],
    [assassinSkills, assassinBuilds.fireLevel40, 40, 4],
    [assassinSkills, assassinBuilds.lightningLevel40, 40, 4],
    [assassinSkills, assassinBuilds.lightningLevel85, 85, 12],
  ] as const) {
    const result = validateSkillAllocation(skills, allocation, level, quests);
    assert.equal(result.valid, true, result.errors.join('\n'));
  }
});

test('assassin lightning sentry rank is capped at 17 at level 40', () => {
  const invalid: SkillAllocation = { ...assassinBuilds.lightningLevel40, lightningSentry: 20, fireBlast: 1 };
  const result = validateSkillAllocation(assassinSkills, invalid, 40, 4);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('레벨 40에서 17포인트')));
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
