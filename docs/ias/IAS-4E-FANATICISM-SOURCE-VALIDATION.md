# IAS-4-E Fanaticism Source Validation

## Game data

- Build: D2R `3.3.93847`, Korean branch `kr`.
- `skills.txt`: Fanaticism Skill ID 122; `aurastat1=attackrate`; `aurastatcalc1=dm34`; `Param3=10`; `Param4=40`; `Maxlvl=20` (hard-point cap).
- SHA-256 of extracted `skills.txt`: `56944CB6B6B0F3C57F7B690977987A732AFEAFC961FA9DC969E7796E54C93F3F`.
- Effective levels 21–60 represent added skill levels; the supported formula reaches the 40 SIAS cap at level 60.
- The source uses one attack-rate aura stat; no separate self/party attack-rate value was found. Fanaticism's speed value is therefore the same SIAS for the Paladin user and recipients. This UI computes only Paladin player attacks.

## Independent cross-checks

- D2R reference formula and `dm(lvl,a,b)` explanation: [D2R IAS Calculations Reference](https://d2r-tools.com/ias/calculations).
- Fanaticism data and level samples sourced to the same game build: [D2R.org Fanaticism](https://d2r.org/data/skills/fanaticism).
- Existing D2R animation tables remain the frame basis; this work did not claim in-game hit-frame measurements.

## Scope

Fanaticism is enabled only for 19 existing Paladin weapon/skill combinations: 12 A1 combinations (Normal Attack, Sacrifice, Vengeance, Conversion × three current A1 weapons), four Zeal combinations, and three Smite combinations. Other classes and unverified combinations remain blocked.