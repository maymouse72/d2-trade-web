# IAS-4B-2 Zeal Source Validation

## Scope

This report records the source evidence used to enable the Paladin Zeal calculation for the supported one-handed A1 weapon set. It does not claim an in-game frame capture.

## D2R source records

| File | SHA-256 | Extracted facts |
|---|---|---|
| `skills.txt` | `56944CB6B6B0F3C57F7B690977987A732AFEAFC961FA9DC969E7796E54C93F3F` | Zeal skill ID 106, Paladin, A1/sequence A1, melee requirement, 100% rollback parameter, hit count `min(2 + level - 1, 5)` |
| `skilldesc.txt` | `CDF11C518EAB9FE678616A237FC64B28CEA5EA51649EC641A14E09B06EA34B38` | Zeal display description mapping |
| `plrmode.txt` | `23106DA08603BC215624E2837F3990B5ED4B5521BBE8B4A80B0EA6B6502FB8E3` | Player animation mode names used in the asset cross-check |
| `weapons.txt` | `B0890901F87FD42FCB474CE835B6E1A9FE1E66DBAB4E7C2F236A3D9C3224F923` | Crystal Sword `crs` WSM 0, Phase Blade `7cr` WSM −30, War Hammer `whm` WSM +20; all supported as one-handed |
| `animdata.d2` | `61EA70EDE691E88A4BF375D872668D74D6CDCA4ED5235034188ED1EB0D1E8EE5` | Source animation record used by the existing Paladin 1HS mapping |
| `paa11hs.cof` | `0447C43CEA898812DAD91E1F815C08CC6F5E68094CB767C3BEA9682C8FA2A855` | Paladin A1 one-handed COF mapping; 15 frames per direction and action event slot 7 per the existing parser report |

The source extracts are from the user's local D2R installation and are used as technical inputs. This report does not redistribute game assets.

## Published table cross-check

The fixed Paladin 1HS Zeal First/Follow/Last table in [The Amazon Basin Zeal attack speed reference](https://www.theamazonbasin.com/wiki/index.php/Zeal_attack_speed) was transcribed into `paladin-zeal-1hs-reference.json`. All 64 published rows match the implementation formula. An expanded comparison across all 161 integer EIAS values from −85 through 75 also matches.

[D2R.org's Paladin breakpoint reference](https://d2r.org/tools/breakpoints/paladin) documents the Zeal frame formula, Paladin one-handed 15 FPD and action frame 7. The page reports 2556/2561 matches against Basin across its entire set of comparisons; within the Paladin 1HS Zeal rows used here, all 64 match. These are published references that overlap in lineage, not two independent in-game experiments.

## Confidence boundary

Asset records establish skill identity, animation family, sequence, and hit-count progression. The published fixed table establishes the supported frame output. No live game-client frame-by-frame capture was performed. The calculator and UI disclose that distinction.
