# IAS-6 Reference Tests

New deterministic reference-engine tests exercise one representative class/weapon pair per target class, sorted breakpoint transitions, Amazon skill aliases and sequences, Druid Werewolf/Werebear standard attacks and skill-level SIAS, Assassin Dragon Claw symmetric-pair sequences/Burst of Speed/conflict guards, Paladin Charge rush/fallback behavior, and rejection of missing WSM, invalid forms and incompatible class-only weapons. Immolation Arrow continuous-fire cadence is modeled separately from its ordinary single-animation length.

Representative zero-IAS frames are pinned in `lib/ias/__tests__/reference-normal-attack.test.ts`:

| Class / weapon | Expected full A1 frames |
|---|---:|
| Amazon / Spider Bow (`6sb`) | 14 |
| Assassin / Runic Talons (`7tw`) | 10 |
| Barbarian / Axe (`axe`) | 17 |
| Druid / Crystal Sword (`crs`) | 18 (human baseline) |
| Necromancer / Crystal Sword (`crs`) | 18 |
| Paladin / Spider Bow (`6sb`) | 16 |
| Sorceress / Eagle Orb (`ob1`) | 16 |

These are reference-engine fixtures based on the documented animation profile and formula; they are not seven independent hand-entered outputs from separate calculators. The externally published D2R.org page reports reproducing 2,955 attack-table rows for seven classes. Automated per-cell external cross-validation has not yet been added.

Druid shapeshift fixtures use the documented Werewolf/Werebear FPD mapping and a published Druid weapon-profile sample. Extreme catalog WSM values −40 and −60 are covered to prevent valid crossbow bases from being rejected. Assassin Dragon Claw fixtures: Greater Talons + Greater Talons, WSM −30, 0 IAS → 16 frames; 20 gear IAS → 14 frames. Burst of Speed level 20 changes the sequence. Unequal hand IAS and mixed WSM pairs return `CONFLICTED` with no frame count.

Additional Amazon fixtures: Jab with Javelin (23 total frames at 0 IAS) and Spear (27); Fend target sums and breakpoint rows; Strafe Spider Bow at 2/3/10 shots (18/22/50 frames) and Light Crossbow at 2/10 shots (23/63); eight Bow/Crossbow aliases use Spider Bow A1 timing (14 frames), while Immolation Arrow retains that 14-frame ordinary animation and reports 22 frames after adding the 15-frame local delay; Throw and four listed javelin skills use Amazon 1HT Throw rows (Javelin WSM −10 gives 14 frames at 0 IAS and breakpoints at 6/16/30/52/89 IAS for 13/12/11/10/9 frames); Power Strike, Charged Strike, and Lightning Strike with both Javelin and Spear match their weapon-class normal A1 timing, while bows are rejected. These timings are labeled `REFERENCE_BASED`; projectile behavior and remaining sequence skills are out of scope.

IAS-6 class-sequence integration fixtures: Assassin Dragon Talon with Greater Talons (WSM −30), skill level 6 and 0 IAS returns a 14-frame/two-kick sequence; skill level 31 is rejected. Druid Werewolf Fury with Phase Blade, skill level 1 (SIAS +20) and 0 item IAS returns a 32-frame five-hit sequence; changing Werewolf skill level changes the result and Werebear is rejected. Barbarian Double Swing returns 12 frames for Phase Blade/Phase Blade and 14 frames for primary Phase Blade/secondary War Hammer at 0 IAS; nonzero gear IAS is marked CONFLICTED. These are regression vectors from the declared references, not game instrumentation.

Assassin trap-laying fixtures use the published fixed 8-FPD / 128-speed model: Greater Talons (WSM −30) returns 12 frames at 0 IAS and 9 frames at 42 IAS without Burst of Speed. Burst of Speed levels 1 and 60 map to +21 and +60 SIAS, and breakpoint rows are strictly decreasing. The integrated calculator path is also tested; no dual-claw aggregation or slow modifiers are claimed.

Barbarian Concentrate, Berserk, Bash, and Stun are integration-tested as standard A1 animation aliases using a Phase Blade; each shares the documented weapon-timing result, without modeling skill effects or damage.

### IAS-6 integration additions (2026-11-11)

- Druid reference tests cover Feral Rage, Fire Claws, Maul charge level/cap behavior, Hunger, Rabies, Wolf skill IAS, and form restrictions. UI-level values are also checked in desktop/mobile browser runs.
- Necromancer Poison Dagger accepts eligible dagger bases and rejects a Crystal Sword/non-dagger input.
- Assassin Dragon Tail uses the selected weapon-class A1 timing and rejects unsupported weapon classes; it does not claim to model kick damage or stored charge effects.
- Barbarian Whirlwind tests one-hand timing, dual-hand rounded-up average, gear-IAS breakpoint movement, invalid bounds and invalid two-hand/offhand pairings. Current-model vectors include Phase Blade single hand: 12-frame interval at zero gear IAS; PB/War Hammer: 16; PB/War Hammer at 13 gear IAS: 14. These are reference-based rules and not game measurements. The previous IAS-5-C-4 sample vectors are discordant with the current source model.
- Amazon Impale tests cover the 1HT jav boundary (27 frames at 0 gear IAS; 24 at 9) and 2HT spr baseline (31), plus class/WSM/weapon and range guards. Browser checks verify weapon switching updates the displayed result.
- Barbarian Frenzy tests verify dual-hand averaging, hand-specific IAS before averaging, skill-level SIAS ceilings, endpoint sequence lengths and unsupported intermediate SIAS rejection. The UI exposes only no-charge and maximum-charge states.
- Paladin Charge adapter tests verify RUSH returns no IAS frame result and MELEE_FALLBACK exactly matches the Paladin A1 normal calculator, including invalid-weapon guards. Desktop/mobile browser tests verify the selectable UI mode and input disablement.

### IAS-6 final additions

- Assassin Tiger Strike, Cobra Strike and Phoenix Strike use the published normal A1 path. Fists of Fire, Claws of Thunder and Blades of Ice test D2R Tools' 16-FPD, −30 sequence EIAS, per-hand WSM/IEIAS average, hand-swap invariance, invalid claw rejection and monotonic breakpoints. UI browser tests cover both claw selectors, hand IAS, gear IAS and Burst of Speed.
- Immolation Arrow cadence tests confirm that the speed-scaled action frame is combined with 15 local-delay frames and presented separately from ordinary animation length.
- Paladin Charge UI browser tests verify rush output suppression/input disablement and the A1 melee fallback result/table without Charge bonuses.
- Assassin Dragon Flight tests verify fixed 23-frame output across weapon classes and reject nonzero IAS; the browser suite checks disabled controls and its explanation.
- Barbarian Double Throw tests verify the 12-FPD/−30 sequence model, per-hand and equipment IAS bounds, monotonically improving breakpoints, supported paired weapons, and acceptance of two items with the same base type.
- The reproducible combination audit runs the calculator view-model on 22,946 declared legal candidates and classifies 22 VERIFIED, 22,770 REFERENCE_BASED and 154 CONFLICTED mixed-WSM Dragon Claw pairs.

Final IAS unit suite: **132/132 passed**. Existing Golden expectations remain in the suite. Desktop and 390×844 mobile Playwright passed **14/14**, including Dragon Flight and Double Throw UI coverage. See `IAS-6-REGRESSION-RESULTS.md` for build and lint outcomes.
