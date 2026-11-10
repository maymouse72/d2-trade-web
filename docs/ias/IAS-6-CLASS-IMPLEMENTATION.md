# IAS-6 Class Implementation

All seven target classes have selectable IAS attack paths. The UI exposes **64 selectable skills/modes**: Amazon 22, Assassin 12, Barbarian 11, Druid 9, Necromancer 2, Paladin 7 (including Charge), and Sorceress 1. Of these, 62 are numeric-capable registry paths, Charge has distinct RUSH/melee UI modes, and Barbarian dual-wield normal attack is visible as an explicitly `CONFLICTED` option with no numeric result.

| Class | Selectable entries | Implemented paths |
|---|---:|---|
| Amazon | 22 | Normal A1, Jab, Impale 1HT/2HT, Fend, Strafe, bow/crossbow skill aliases with Immolation cadence, thrust aliases, and five Throw-table skills |
| Assassin | 12 | Normal A1; Tiger/Cobra/Phoenix Strike A1 aliases; three dual-claw martial charge-up sequences; symmetric Dragon Claw; Dragon Talon; fixed 23-frame Dragon Flight; Dragon Tail weapon-class timing; Trap Laying with Burst of Speed |
| Barbarian | 11 | Verified normal; reference one-/two-hand A1; dual-wield normal explicitly CONFLICTED; Concentrate/Berserk/Bash/Stun; bounded Double Swing; dual-wield Double Throw 12-FPD sequence; Frenzy no/max-charge sequence; Whirlwind repeated interval |
| Druid | 9 | Human/Werewolf/Werebear normal; Werewolf Fury/Feral Rage/Rabies; Fire Claws; Maul; Hunger |
| Necromancer | 2 | Normal A1 and Poison Dagger on eligible daggers |
| Paladin | 7 | Existing verified normal, Sacrifice, Vengeance, Conversion, Zeal and Smite; Charge UI selection distinguishes rush from melee fallback |
| Sorceress | 1 | Normal A1 |

All non-Golden new calculation paths are `REFERENCE_BASED`, not in-game verified. All numeric outputs use known WSM, class/weapon restrictions, spawnability and hand mode guards. The 306-code catalog has 297 spawnable records, 23 item types, 201 explicit WSM values and 105 unknown source WSM values.

## Special model notes

- Amazon Immolation Arrow reports action-frame cadence + 15 D2R local-delay frames, and retains ordinary animation frames separately.
- Assassin charge-up sequences average the two hands' WSM/IEIAS under D2R Tools' 16-FPD and −30 sequence rule; Dragon Claw mixed WSM pairs remain CONFLICTED. Burst of Speed is available in this UI mode.
- Assassin Dragon Flight returns a fixed 23-frame reference result and disables IAS inputs because the reviewed mechanics sources say IAS, FCR, and movement speed do not affect it.
- Barbarian Double Throw uses the D2R Tools 12-FPD dual-wield sequence, averaged per-hand WSM/IEIAS, and −30 sequence SIAS; the UI exposes distinct throwing weapons and separate hand/equipment IAS inputs.
- Barbarian dual-wield normal attack is explicitly blocked: D2R Tools documents averaging for sequence/dual-wield skills, while Warren1001 marks character off-hand Normal Attack as untested; no alternating attack-cycle rule is established. Frenzy includes arbitrary legal ordered weapon pairs but only uncharged/max-charge states; intermediate hit charge states remain blocked. Double Swing remains restricted to the two recorded weapon pairs. Whirlwind displays repeated interval only.
- Druid Maul charges add 3 SIAS per active charge up to the skill-level cap; Werewolf skill IAS and Werewolf-only Fury are kept distinct from Werebear.
- Paladin Charge real rush produces no IAS frames. A user-selected melee fallback uses Paladin A1 and does not apply Charge bonuses.

## Coverage audit

Run `node --experimental-strip-types scripts/ias-coverage-audit.mjs`. It enumerates legal registered weapon/mode/form candidates and ordered pairs available in the UI, then calls the calculator view-model with 0 IAS and skill level 1. Result: **22,946 candidates** = **22 VERIFIED**, **22,770 REFERENCE_BASED**, **154 CONFLICTED**, **0 unsupported or invalid**. Mixed-WSM Dragon Claw pairs account for the conflicts. 22,792 numeric outputs (99.33%) are available in this defined scope; 196 distinct catalog codes occur in at least one numeric candidate. This does not cover every IAS/rank/modifier value or skills intentionally outside the registered MVP. The remaining 110 catalog codes are accounted for as 9 non-spawnable and 101 unresolved-WSM records.
