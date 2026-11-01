# IAS-4-C Smite Source Validation

## Scope and outcome

Source build: Diablo II: Resurrected 3.3.93847. The extracted game records establish Smite Skill ID 97 and its dedicated `S1` skill animation. This validates the animation identity and its base data; it is not a direct capture of rendered in-game hit timing.

## Extracted records

| File | Finding | SHA-256 |
|---|---|---|
| `skills.txt` | Id 97, `anim=S1`, `seqtrans=S1`, `UseAttackRate=1`, `itypea1=shld`; no explicit IAS or skill IAS modifier field | `56944CB6B6B0F3C57F7B690977987A732AFEAFC961FA9DC969E7796E54C93F3F` |
| `skilldesc.txt` | Skill description mapping used to identify the player-facing Smite name | `CDF11C518EAB9FE678616A237FC64B28CEA5EA51649EC641A14E09B06EA34B38` |
| `plrmode.txt` | `S1` is Skill1 mode; separate from A1/A2 | `23106DA08603BC215624E2837F3990B5ED4B5521BBE8B4A80B0EA6B6502FB8E3` |
| `animdata.d2` | `PAS11HS`: FPD 12, animation speed 256, event slot 7 | `61EA70EDE691E88A4BF375D872668D74D6CDCA4ED5235034188ED1EB0D1E8EE5` |
| `pas11hs.cof` | 9 layers, 16 directions, FPD 12; raw weapon class `1hs`; event slot 7 set | `29C78A90C8CFE1A430E8DC292813DF80D970B1216B73576B44C9A0AF7DF015F2` |
| `weapons.txt` | Crystal Sword WSM 0 / 1hs; Phase Blade WSM -30 / 1hs; War Hammer WSM +20 / 1hs | `B0890901F87FD42FCB474CE835B6E1A9FE1E66DBAB4E7C2F236A3D9C3224F923` |
| `itemtypes.txt` | `shld` is a shield item type; Paladin shields inherit the shield type | `AE957ABDE89A2D0276A55FEFFA809E0CCBDAF82F65C6EAED9443B886B960E26A` |

The COF was selected and extracted as a single file from the installed D2R CASC archive; the extraction ran offline (`Online False`) and did not add game assets to the repository.

## Evidence vs interpretation

Directly encoded facts: skill ID, mode, shield requirement, FPD, speed scalar, event slot, COF identity and weapon WSM. `UseAttackRate=1` plus matching public IAS tables supports the interpretation that equipment IAS and weapon WSM enter the attack-rate calculation. The original row does not explicitly state a Smite-specific WSM formula or a separate skill IAS bonus. No skill IAS bonus was found, so the supported scope uses 0 skill/aura IAS.

## External sources

- [Tradia D2R Weapon Speed Calculator](https://tradia.me/en/diablo2/weapon_speed_calculator), linked to game data build 93847; Smite available under Paladin.
- [D2X2ch Wiki: Smite](https://wikiwiki.jp/d2x2ch/Smite), publishes the Smite 12-FPD/256-speed frame model and weapon-speed breakpoint table.
- [Warren1001 IAS Calculator](https://github.com/Warren1001/IAS_Calculator), a community calculator that documents its sequence-animation data lineage and Paladin Smite support.
- [D2R.org Paladin Breakpoints](https://d2r.org/tools/breakpoints/paladin), supplementary build-specific animation/frame context.

These references are independent implementations/publications, not Blizzard gameplay captures. Their derived results agree for the three tested weapon WSM values. Result status is therefore “data and published table cross-validated”; gameplay measurement remains NOT_TESTED.
