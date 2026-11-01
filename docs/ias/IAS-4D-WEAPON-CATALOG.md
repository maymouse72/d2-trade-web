# IAS-4-D — normalized weapon catalog

Catalog source: [weapon-catalog.json](../../lib/ias/data/weapon-catalog.json). It contains 306 coded rows from D2R `weapons.txt` and joined `itemtypes.txt` values, with source hashes embedded in the file.

Fields preserve code, English source name, direct item type, item type name, `Equiv1`/`Equiv2`, raw WSM (nullable), `wclass`, `1or2handed`/`2handed`-derived handedness, source version, spawnable flag, normal-base code, two-handed animation class, and item-type class tag. A null WSM stays unknown. Existing validated WSM overrides are separate runtime values and do not alter the raw catalog.

## Count by item type

| Item type | Rows | Item type | Rows |
|---|---:|---|---:|
| Sword | 42 | Axe | 30 |
| Bow | 24 | Polearm | 18 |
| Staff | 17 | Javelin | 15 |
| Spear | 15 | Orb | 15 |
| Knife | 14 | Wand | 12 |
| Crossbow | 12 | Mace | 11 |
| Hammer | 11 | Hand to Hand 2 | 11 |
| Hand to Hand | 10 | Scepter | 9 |
| Club | 7 | Throwing Knife | 6 |
| Throwing Axe | 6 | Missile Potion | 6 |
| Amazon Bow | 6 | Amazon Spear | 6 |
| Amazon Javelin | 3 | **Total** | **306** |

## UI behavior

The selector offers text search, item-type filtering, handedness filtering, and current-skill verification filtering. Each visible option shows source code, resolved/raw WSM, handedness, and whether that exact selected skill and animation is enabled. Non-spawnable catalog rows remain inspectable in source data but are hidden from the regular selector.

The 306-row catalog is not the 306-row support list. Only 19 Paladin skill/weapon combinations are VERIFIED; other catalog entries are UNVERIFIED and produce no numeric result. Long Sword is enabled for Zeal only, 0–142 IAS. Crystal Sword's raw WSM remains unknown in the catalog while the existing validated runtime WSM 0 is shown to users.
