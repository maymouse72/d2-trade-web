# IAS-4-C Smite Animation Mapping

| Mapping stage | Evidence | Result |
|---|---|---|
| `skills.txt` Id 97 | `anim=S1`, `seqtrans=S1`, class `pal`, `itypea1=shld` | Paladin Smite selects dedicated S1 and requires a shield |
| Player mode | `plrmode.txt` Skill1 → `S1` | S1 is not A1 or A2 |
| Animation table | `animdata.d2` `PAS11HS` | Paladin, one-handed weapon-class animation, 12 FPD, speed 256, event slot 7 |
| COF | `pas11hs.cof` | 16 directions; 9 layers; raw weapon class 1hs; same FPD/event slot |
| Gear class | `weapons.txt` and `itemtypes.txt` | Supported test weapons are 1hs; Smite is shield-gated |

`S1 → PAS11HS` is the selected mapping from skill mode plus Paladin animation record. The file name and event slot are source facts; interpreting event slot 7 as the strike event uses the existing IAS parser's event convention. No live-frame game capture was made.

Shield condition is a required calculation assumption. The source `shld` field is generic and does not distinguish shield subtypes for animation selection. The public calculator and breakpoint table expose no shield subtype speed variable. Therefore the UI tells users to have a shield equipped and does not add a shield-type selector.

Weapon WSM is retained per the equipped one-handed weapon. The official extracted `weapons.txt` values are 0, -30 and +20 for the supported Crystal Sword, Phase Blade and War Hammer respectively.
