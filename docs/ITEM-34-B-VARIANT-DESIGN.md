# ITEM-34-B — Variant Design

## Model

`lib/items/variants.ts` defines game era (`Classic`, `LoD`, `RotW`), connection state (`Online`, `Offline`), ladder state, patch, availability (`AVAILABLE`, `UNAVAILABLE`, `REVIEW`), and source/evidence metadata. A context rejects Offline + Ladder/NonLadder combinations.

Each catalog record stays under its existing ID. The `variants` array holds mode-specific overrides, including patch scope, availability, source URL, check date, and evidence. Option arrays, set bonuses, and runeword equipment are overridden only where supported.

## Resolver rules

1. Classic and LoD return REVIEW because the stored records are not sufficiently versioned to safely apply the RotW data.
2. RotW selects an exact patch + online/offline + ladder scope match. A 3.3 variant never carries forward to 3.4 implicitly.
3. More than one matching variant returns REVIEW and no options.
4. REVIEW and UNAVAILABLE return `properties: null`; the current UI labels them and keeps the original values behind an explicitly historical/uncertain disclosure.
5. If no special override matches in RotW 3.3/3.4, the resolver identifies the existing record as the 3.3 baseline. It does not apply an unrelated newer variant.
6. Each record has one card; variants do not duplicate catalog items or affect counts and pagination.

## UI and preservation

All three catalogs use the same mode selector, defaulting to RotW online Ladder 3.4. The selector offers valid Ladder, Non-Ladder, or Offline presets for RotW 3.3 and 3.4 and labels Classic/LoD presets as data needing review. Status cards show the mode, patch, evidence, and source link. Search includes variant values; existing catalog filters and sorting remain in place.

`tests/fixtures/items-baseline-3.3.json` snapshots original catalog counts, IDs, and targeted records. The only intentional legacy-record correction is Rogue's Bow's formerly unresolved placeholder, now an explicit “Cold Arrow OR Fire Arrow +1–3” choice group based on Blizzard's 3.3 note.

