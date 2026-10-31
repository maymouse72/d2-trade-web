# IAS-2A Validation

## Expected-data provenance

Golden source: [D2R Paladin breakpoints](https://d2r.org/tools/breakpoints/paladin), accessed 2026-11-01. The page identifies build 3.3.93847, Paladin PAA11HS at 15 frames per direction / animation speed 256, and the 1HS WSM 0 normal-attack frame ranges. The source says its game-data-derived tables are checked against Amazon Basin tables.

The source publishes continuous IAS bands rather than a 201-element array. `lib/ias/scripts/generate-golden.mjs` expands its seven ranges into each integer IAS 0–200, preserving the page's expected frame value for every included IAS. The generator does not call the production formula. The ranges are visible in the generated JSON, so the conversion can be reviewed and repeated.

Independent context: [Amazon Basin Paladin attack speed](https://www.theamazonbasin.com/wiki/index.php/Paladin_attack_speed) lists Paladin 1HS ActionFlag 7, FPD 15, speed 256, and StartingFrame 0. [D2R IAS calculation reference](https://d2r-tools.com/ias/calculations) documents EIAS, WSM sign, speed flooring, and the distinction between complete animation and action timing.

## Local extraction trail

Raw D2R input hashes from the earlier extraction are recorded in `lib/ias/data/evidence.json`. Relevant local parsed facts are PAA11HS at offset 396032 and PAA21HS at offset 398116; each is FPD 15, speed 256, event slot 7/code 1. Crystal Sword's local `weapons.txt` speed is blank; WSM 0 is an independently sourced base-item value. The raw blank is not rewritten as zero.

Golden dataset SHA-256: `39e8b8046482a7bbf4c0bb7ebc6fc52f83954df657193ddf5bdc275a3937a4d2`.

## Validation boundary

Only Paladin A1 full-animation frames with Crystal Sword WSM 0 and total IAS 0–200 are independently table-matched and enabled. The reference is a technical secondary source, not a gameplay capture in this task.

A2 has matching extracted FPD/speed/event bytes but no separate matching published A2 frame table. Phase Blade and War Hammer formula outputs reproduce the earlier candidate thresholds, but this task did not locate independent exact per-WSM tables. Those combinations return `UNVERIFIED`.

The engine does not equate event slot 7 with server-side hit registration, does not assert A1/A2 selection order, and does not calculate APS.
