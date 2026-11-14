# ITEM-34-B — Data Changes

Date: 2026-11-14 · Source baseline: repository D2R 3.3.93847 data

## Baseline and preservation

| Catalog | Original count | Current count | Original SHA-256 |
|---|---:|---:|---|
| Runewords | 102 rows / 99 logical names | 102 / 99 | `2d5320847f2aa51b305b4d7a5f9776f0d5f7adb7acf578aed7588e137d2889ca` |
| Uniques | 415 | 415 | `461152731c92cf7f1ed774912f061bff216b15f8d47476cb188ee47db9a68c9b` |
| Sets | 34 sets / 135 pieces | 34 / 135 | `f3c045c47a338a98af719965a83c8a23bffd385ff4e235a71058c282dc8a6f72` |

The fixture `tests/fixtures/items-baseline-3.3.json` preserves the original IDs and targeted legacy records. No catalog record was added, removed, or assigned a new ID. The only intended root-record correction is Rogue's Bow: the unverified placeholder option was removed and replaced by Blizzard's documented mutually exclusive Cold Arrow / Fire Arrow choice group.

## Patch 3.4 uniques (RotW online Ladder and Offline)

Official source: [Blizzard Patch 3.4](https://news.blizzard.com/en-us/article/24316567/diablo-ii-resurrected-ladder-season-16).

| ID · item | Patch 3.4 data applied |
|---|---|
| 48 · Dimoak's Hew | Replaces +15 Dexterity with +20 Strength; enhanced damage 100% → 100–150%. |
| 55 · Serpent Lord | Enhanced damage 30–40% → 40–80%; adds 15% IAS and +5 minimum damage. |
| 30 · Griswold's Edge | Replaces Knockback with 4% chance to cast level 1 Amplify Damage on striking; damage 100–160%; 25% slow. |
| 57 · The Salamander | Fire skills +3, Fire Ball +4, 10% FCR. |
| 47 · The Tannr Gorerod | Damage 200–220%; life stolen 5–9%. |
| 53 · The Grim Reaper | Damage 80–120%; mana stolen 5–9%. |
| 92 · Silks of the Victor | Adds 20% FRW, 30% IAS, damage 50–100%, and 15% MF. |
| 172 · The Impaler | Damage 170–240%; repairs 1 durability every 4 seconds. |
| 129 · Coldkill | Cold damage 80–100; damage 160–200%. |
| 161 · The Atlantean | Damage 250–300%; Zeal +2–5, AR +100–125, requirements −20%, level requirement 35. |
| 235 · Lava Gout | Enchant proc 5% / level 10; Cannot Be Frozen. |
| 151 · Earthshaker | Fire Claws +3–5. |
| 182 · Grim's Burning Dead | Necromancer skills +4; 15% reanimate Burning Dead Archer; Fire Golem +3–5. |
| 167 · Swordguard | Resists +20–30; defense per level +7–779; damage 180–230%; replenish life +10–15; attacker takes 15–25 damage. |
| 325 · Demonhorn's Edge | 20% IAS; +1 to Barbarian skills. |
| 249 · Veil of Steel | All skills +2; physical damage reduced 15–25%; magic resist +20–40%. |
| 324 · Ethereal Edge | Damage 220–260%; IAS 40%; maximum damage +2–198 per character level. |
| 315 · Executioner's Justice | Damage 260–300%; on kill 25% chance to cast level 13 Amplify Damage; IAS 40%; +15 life / +5 mana per kill. |

Each change lives in an explicit RotW 3.4 Ladder/Offline variant. Existing root options remain as the 3.3 snapshot; online Non-Ladder falls back to those earlier values because Blizzard states the new 3.4 changes apply to Ladder and Offline. Classic and LoD remain REVIEW.

## Patch 3.3 items and unlock conditions

- Nine 3.3-updated uniques (Bloodletter, The Battlebranch, Rogue's Bow, Pluckeye, Bane Ash, Gravenspine, Blinkbat's Form, The Ward, Manald Heal) keep their root 3.3 options. Their RotW online Non-Ladder availability is explicitly AVAILABLE from patch 3.4; patch 3.3 Non-Ladder and Offline are REVIEW.
- Angelic Raiment keeps the 3.3 values. RotW online Ladder and Non-Ladder are AVAILABLE from 3.4; Offline remains REVIEW.
- The eight 3.3 Ladder runewords retain their existing recipes and Ladder availability. Patch 3.3 Non-Ladder and Offline are UNAVAILABLE; patch 3.4 Non-Ladder and Offline are REVIEW because the official 3.4 unlock list does not confirm those combinations.

## Isenhart's Armory and Eternity

- Isenhart's Armory (set ID 4) receives a 3.4 RotW Ladder/Offline variant: Lightbrand IAS 40%; move level-based AR to Lightbrand; Parry 2-piece cold/fire resists +15% each; Case magic resist +25%; Horns life stolen 5%; 3-piece max damage +2–198 per level; full-set FRW 30% and FHR 25%.
- Eternity (runeword ID 58) keeps its rune order and 5 sockets. Its 3.4 Ladder/Offline variant allows the documented broad base label “melee weapons and missile weapons,” adds IAS 30%, damage 300–390%, max damage +3–297 per character level, and level 5 Revive O-skill.

