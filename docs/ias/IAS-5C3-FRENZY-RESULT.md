# IAS-5C3 Track C — Frenzy

상태: **BLOCKED**, no numeric support enabled.

Warren1001 exposes Frenzy level/state-related controls and weapon slots. This does not by itself establish the game's stacking state, skill IAS modifier, sequence timing, or hand-by-hand event rules. A matched level/state and dual-wield output matrix was not captured from both calculators. C2 source data confirms the skill/animation identifiers but not enough timing rules to enable a result. No Frenzy Golden rows were created.

| Requirement | Result |
|---|---|
| No Frenzy effect / active / maximum state | Not fully matched across references |
| Skill level and skill IAS modifier | Not validated against current-build event timing |
| Weapon order, IAS, and repeated hand events | Not validated |
| Implementation | Blocked; numeric output remains unavailable |

Minimal reproduction: on build 3.3.93847 record a fixed Barbarian and two identified weapons at the same skill level; capture baseline before Frenzy, after one activation, and at maximum visible state. Repeat with swapped hands and varied IAS on one weapon at a time. Record the frame of every hand's attack event, then compare to each calculator.

References: [Warren1001](https://warren1001.github.io/IAS_Calculator/), [TrAdia](https://tradia.me/en/diablo2/weapon_speed_calculator), [C2 source-validation report](IAS-5C2-SOURCE-VALIDATION.md).
