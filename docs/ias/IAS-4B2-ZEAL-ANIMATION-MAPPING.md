# IAS-4B-2 Zeal Animation Mapping

| Property | Supported value | Evidence |
|---|---|---|
| Class | Paladin | D2R `skills.txt`, Zeal class record |
| Skill ID | 106 | D2R `skills.txt` |
| Animation / sequence | A1 / A1 | D2R `skills.txt`; Paladin 1HS A1 COF mapping |
| Weapon scope | Crystal Sword, Phase Blade, War Hammer, one-handed | D2R `weapons.txt` and existing verified A1 weapon records |
| Frames per direction | 15 | Existing AnimData/COF parser validation for `paa11hs.cof` |
| Action frame | 7 | Existing A1 parser mapping and the fixed Zeal table's event frame |
| Zeal hit count | `min(skillLevel + 1, 5)`, with minimum 2 | D2R skill parameters 5/6 and `calc1` |
| Sequence behavior | Repeated action-frame rollback; final strike completes the remaining animation | Published Zeal table semantics and formula cross-check |
| Supported modifiers | None beyond item IAS and weapon WSM | Only the documented base Paladin 1HS table is implemented |

Zeal uses its own sequence calculator and does not reuse the single-hit A1 result path. A2, other classes, two-handed weapons, and unmodeled speed modifiers remain blocked from numerical results.

Source and inference limits are detailed in [the source validation](IAS-4B2-ZEAL-SOURCE-VALIDATION.md).
