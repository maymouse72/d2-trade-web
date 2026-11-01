# IAS-4-D — D2R weapon source analysis

## Source build and handling

The local extracted source set is identified as D2R build `3.3.93847`. Source files were read only; no raw CASC files were added to this repository.

| Source | Size | SHA-256 | Use |
|---|---:|---|---|
| `weapons.txt` | 119,607 bytes | `b0890901f87fd42fcb474ce835b6e1a9fe1e66dbab4e7c2f236a3d9c3224f923` | weapon code, display name, item type, speed, weapon class, hand flags, version, spawnable flag |
| `itemtypes.txt` | 10,452 bytes | `ae957abde89a2d0276a55feffa809e0ccbdaf82f65c6eaed9443b886b960e26a` | direct item type and `Equiv1`/`Equiv2` hierarchy, body slots, class tags |
| `skills.txt` | 270,115 bytes | `56944cb6b6b0f3c57f7b690977987a732afeafc961fa9dc969e7796e54c93f3f` | Paladin Zeal ID 106 and `anim=A1` |
| `skilldesc.txt` | 95,092 bytes | `cdf11c518eab9fe678616a237fc64c28cea5ea51649ec641a14e09b06ea34b38` | player-facing skill descriptions |
| `plrmode.txt` | 302 bytes | `23106da08603bc215624e2837f3990b5ed4b5521bbe8b4a80b0ea6b6502fb8e3` | player animation mode names |
| `animdata.d2` | 586,784 bytes | `61ea70ede691e88a4bf375d872668d74d6cdca4ed5235034188ed1eb0d1e8ee5` | animation records and frame data |
| `eanimdata.d2` | 565,984 bytes | `c910e23da67de84d5d0295159c2725778fce53af3a819b3d989e71005420113c` | extracted companion animation data; not used to infer a player weapon class |
| `paa11hs.cof` | 2,284 bytes | `0447c43cea898812dad91e1f815c08cc6f5e68094cb767c3bea9682c8fa2a855` | Paladin A1, 1HS composite object |
| `paa21hs.cof` | 2,284 bytes | `1f771bf18d40770aadf9be7907587c171862b2f5ba976f8bbb2b552a9befc532` | Paladin A2, 1HS composite object |

The Smite-specific `pas11hs.cof` evidence remains in the earlier IAS-4-C report; it is not treated as evidence that a new weapon is compatible with Smite.

## Record-level results

- `weapons.txt`: **307 rows**; **306 rows have a three-character weapon code** and are represented in the normalized catalog.
- Coded weapon keys: **306 unique**, **0 duplicate**; **1 source row has no code** and is not selectable.
- Item type references: **0 missing** among coded rows.
- Weapon-class value: **306/306 coded rows have a class**.
- WSM (`speed`): **201/306 coded rows have an explicit integer**; **105 are blank** and remain `null` in the catalog. Blank is never rewritten as WSM 0. Crystal Sword is a known existing exception: raw WSM is blank, while its previously validated calculator value is 0 and is shown as a resolved value in the UI.
- Source `spawnable` flag: **297 true**, **9 false** in coded records. The UI lists the 297 selectable records by default; the full 306 coded records remain cataloged for auditability.
- `version` values in the extracted records: **175 rows `0`**, **131 rows `100`**. The original numeric values are preserved without assigning an undocumented interpretation.
- Handedness uses the source flags: `1or2handed=1` → conditional, else `2handed=1` → two-handed, else → one-handed. Result: **169 one-handed, 119 two-handed, 18 conditional**.

`weapons.txt` does not contain an explicit class-restriction column. The normalized catalog preserves the `itemtypes.txt` `Class` value as an item-type class tag, rather than presenting that tag as a direct per-weapon restriction.

## Candidate selected for support expansion

`Long Sword` is source code `lsd`, type `swor` → `Sword`, WSM `-10`, class `1hs`, one-handed, spawnable, version `0`. Its A1 compatibility is supported by the matching Paladin `PAA11HS` / `1hs` data and the independent Paladin Zeal table comparison documented in [animation compatibility](IAS-4D-ANIMATION-COMPATIBILITY.md). Only the Long Sword Zeal A1 combination is enabled. The catalog alone does not enable other skills or animation modes.

## Integrity findings and exclusions

No coded duplicate, dangling item-type reference, or missing animation class was found. The raw file has blank WSMs, blank weapon codes, and non-spawnable rows; these are retained or excluded according to the rules above rather than silently filled. Full raw data is not checked into Git.
