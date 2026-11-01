# IAS-4-D — Paladin animation compatibility

## Source-backed mapping

The parsed D2R build `3.3.93847` records `PAA11HS` and `PAA21HS` as the Paladin 1HS A1 and A2 animation objects. Existing IAS-3-B raw validation reports FPD 15, AnimationSpeed 256, and event slot 7 for both. Their COFs each have 9 layers, 15 FPD, 16 directions, and a slot-7 frame event; layer ordering differs. The COFs do not establish the runtime attack-mode selection or a verified A2 frame formula.

Long Sword (`lsd`) has `weapons.txt` `wclass=1hs`, with raw WSM `-10`. That maps it to the same Paladin A1 1HS animation-class asset as the already modeled one-handed cases. This class mapping alone is not treated as calculator support.

## Skill / animation matrix

| Paladin skill | Source animation | Long Sword decision | Reason |
|---|---|---|---|
| Normal attack | A1 | UNVERIFIED | No independent Long Sword A1 threshold comparison captured in this task |
| Sacrifice | A1 | UNVERIFIED | Skill animation alone does not validate a new weapon's complete IAS range |
| Vengeance | A1 | UNVERIFIED | Same boundary as other A1 single-hit skills |
| Conversion | A1 | UNVERIFIED | Same boundary as other A1 single-hit skills |
| Zeal | A1 | VERIFIED | 9 independent Long Sword WSM -10 breakpoint rows agree with the fixed Paladin 1HS Zeal model |
| Smite | S1 | UNVERIFIED | Separate `PAS11HS` mapping; no Long Sword S1 reference comparison was performed |
| Any A2 use | A2 | UNVERIFIED | Runtime selection and A2 starting-frame rule are not established by the extracted files |

The verified claim is deliberately narrow: Paladin human-form Long Sword A1 Zeal, without aura/skill IAS or other speed modifiers, 0–142 item IAS, 2–5 selected hit events. It does not prove in-game measured strike timestamps.

## Independent reference comparison

[Warren1001 IAS Calculator](https://warren1001.github.io/IAS_Calculator/) identifies its page as updated for D2R 3.3. With Character `Paladin`, Skill `Zeal`, Table `IAS`, and P Weapon `Long Sword [-10]`, its displayed rows were:

| IAS start | First/follow-up frames | Final animation frames | Five-hit total |
|---:|---:|---:|---:|
| 0 | 7 | 13 | 41 |
| 7 | 7 | 12 | 40 |
| 8 | 6 | 12 | 36 |
| 18 | 6 | 11 | 35 |
| 35 | 6 | 10 | 34 |
| 42 | 5 | 10 | 30 |
| 60 | 5 | 9 | 29 |
| 109 | 5 | 8 | 28 |
| 142 | 4 | 8 | 24 |

All nine boundary IAS values and first/final frames match the local formula. `142` reaches the EIAS 75 ceiling for WSM -10 and is the selected calculator cap. The independent reference evidence and its limits are stored in [paladin-lsd-zeal-reference.json](../../lib/ias/data/paladin-lsd-zeal-reference.json).

This is a community calculator cross-check, not an in-game capture. Non-transition IAS values in the 572-row Golden expansion are deterministic expansions of the existing fixed Paladin 1HS Zeal reference table and are marked `REFERENCE_TABLE_EXPANSION`; they are not described as 572 independently observed rows.
