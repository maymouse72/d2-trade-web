# IAS-5-C-2 In-Game Test Guide

These scenarios are pending; they are not observations. Use a private/controlled game session and record screen video at a stable, reported FPS. Do not alter production data.

## Capture record for every run
- D2R build and platform; class and form; skill and skill level.
- Main/offhand weapon base and code, weapon IAS on each, off-weapon IAS, hand/slot position.
- Skill/buff states, target type, start/end markers and number of repetitions.
- Original video file, measured frame/event timestamps, and observer notes.
- Keep raw recordings; do not report an inferred value as an observed value.

## Track B scenarios
1. Same base weapons in both hands; normal attack, record which hand attacks each event.
2. Fast/slow WSM pair; record per-hand events and repeat.
3. Swap the hand slots without changing IAS; compare event order and intervals.
4. Repeat with Double Swing at the same skill level and equipment.
5. Change weapon IAS only, then off-weapon IAS only; distinguish each effect.

## Track C scenarios
1. Frenzy: same pair/IAS at no Frenzy effect, initial effect, and empirically defined maximum; repeat at at least two skill levels. Record how each stack changes the next same-hand event interval and when it expires.
2. Whirlwind: same path and target at IAS 0; vary only weapon IAS, then weapon WSM; repeat at least five runs per condition.
3. Whirlwind dual wield: record each weapon's hit events separately and compare against single weapon runs. Separate animation frames from actual damage/hit events.

A track becomes eligible for implementation only after an independent formula or published table agrees with the captured boundaries. These guidelines alone do not provide expected numbers.
