# IAS-6 Engine Design

## Implemented

- `reference-normal-attack.ts` stores class × animation weapon-class profiles and exposes profile lookup, compatibility checks, generic frame calculation, and breakpoint generation.
- `support-policy.ts` keeps legacy VERIFIED checks and routes eligible human-form A1 normal attacks to `REFERENCE_BASED`.
- `calculate.ts` dispatches reference results without changing existing Paladin Golden or Barbarian verified calculation branches.
- Weapon mode is part of normalized input. Conditional one-/two-hand weapons require an explicit mode; fixed-handed entries reject incompatible modes.
- Class-only catalog tags are enforced (Amazon-only bows/javelins, Assassin claws, Sorceress orbs) and WSM is required.
- Breakpoint output is generated from the same reference calculation and selected hand mode. UI labels the result as reference-based.
- Amazon Jab uses a separate sequence calculation (18-frame 1HT / 21-frame spear base, three hits, sequence EIAS −30 before clamp, no final −1). Amazon Impale uses a dedicated published 1HT/2HT EIAS tier table. Amazon Multiple Shot and Guided Arrow are limited to bow/crossbow base A1 timing and do not expose projectile-count timing.
- Amazon Fend uses the published 2–12 target First + ordered Follow + Last table entries for 1HT/2HT weapons. Target count selects how many ordered Follow intervals are included; breakpoint rows are generated for that count.
- Amazon Strafe uses its own published bow/crossbow First + Follow + Last sequence table for 2–10 shots. Actual Follow intervals are floored at 3 frames for bows and 4 for crossbows; each volley count has separately generated breakpoint rows.
- Amazon Throw uses the published EIAS-to-frames 1HT table, with support restricted to WSM-known javelin catalog entries. Poison Javelin, Plague Javelin, Lightning Bolt, and Lightning Fury share that reference table. Immolation Arrow reports continuous-fire cadence as the speed-scaled action frame plus D2R's 15-frame local delay; ordinary animation length is a separate result field.
- Amazon's eight supported bow/crossbow attacks and three supported thrust attacks route through the shared A1 profile only for the weapon classes documented by Amazon Basin; unmatched weapon classes are rejected.
- Druid Werewolf/Werebear standard attacks have dedicated form FPD values (13/12), an EIAS cap of −85…+150, matching Human A1 profile input, and no guessed animation profile. The WSM validator accepts the catalog's observed −60…+60 range.
- Assassin Dragon Claw is a separate two-hit sequence engine. It applies the public Burst of Speed SIAS curve, limits `REFERENCE_BASED` output to equal WSM and equal per-hand weapon IAS, and returns `CONFLICTED` for mixed WSM or unequal hand IAS. Breakpoint rows use the same constrained reference calculation.
- Assassin Tiger Strike, Cobra Strike and Phoenix Strike use the published standard A1 alias. Fists of Fire, Claws of Thunder and Blades of Ice use a separate 16-FPD dual-claw sequence with −30 sequence EIAS, average per-hand WSM/IEIAS and the selectable Burst of Speed SIAS curve. The UI exposes both claws and hand-specific IAS.
- Assassin Dragon Talon uses a dedicated kick rollback model with kick count from skill levels 1–30, weapon/gear IAS, and Burst of Speed; other buff/debuff effects are rejected. Trap laying uses an independent 8-FPD, speed-128 model with single selected WSM and Burst of Speed; dual-wield aggregation and debuffs remain blocked.
- Assassin Dragon Tail reports weapon-class A1 kick timing only; kick charge consumption, damage and fire burst are not modeled. Necromancer Poison Dagger is an A1 alias limited to eligible daggers.
- Druid Werewolf Fury uses the five-hit rollback model and Werewolf skill-level SIAS plus the selected Druid Human A1 profile. Werebear Fury is unsupported; the profile follows Warren1001 vectors and records a known first-hit offset disagreement with generic rollback notation.
- Druid Feral Rage, Fire Claws, Maul, Hunger and Rabies use their cited weapon-attack timing rules. Werewolf SIAS derives from skill level; Maul applies +3 SIAS per active charge up to the level-based cap; Werewolf Hunger/Rabies use the cited 10-FPD attack phase.
- Barbarian Double Swing uses a bounded aggregate-cycle model for Phase Blade/Phase Blade or Phase Blade/War Hammer. It holds offhand IAS, gear IAS, and external modifiers at zero and returns no event-order claim.
- Barbarian Whirlwind uses the current D2R patch-based normal-attack frame model: equipment IAS is applied per weapon, dual-wield frames are averaged and rounded up. It reports repeated hit interval only, not startup, movement or hit confirmation. IAS-5-C-4 sample rows disagree and are explicitly treated as superseded/discordant.

## Formula

`IEIAS = floor(120 × totalIAS / (120 + totalIAS))`

`EIAS = clamp(IEIAS + supported SIAS − WSM, −85, 75)`

`speed = floor(animationSpeed × (100 + EIAS) / 100)`

`frames = ceil(256 × (framesPerDirection − startingFrame) / speed) − 1`

## Boundaries

The current input supports Fanaticism through Paladin and Burst of Speed on Assassin paths that include it. The generic path rejects unsupported modifiers. Jab, Impale, Fend, Strafe, Assassin dual-claw charge-ups, Dragon Claw, Dragon Talon, Double Swing, endpoint-only Frenzy states and Werewolf Fury return their modeled sequences/cycles; Throw uses a standalone table; Whirlwind reports a repeated hit interval; Dragon Tail and Poison Dagger map to constrained A1 timing. Paladin Charge is selectable: RUSH returns no IAS frames, while MELEE_FALLBACK delegates to Paladin A1 and does not apply Charge bonuses.

The existing architecture was extended instead of replaced. Barbarian dual-wield normal, intermediate Frenzy states, several unimplemented skill sequences, and the excluded modifiers listed in the skill matrix remain future work.
