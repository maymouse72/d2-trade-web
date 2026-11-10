# IAS-6 Weapon Coverage

## Catalog inventory

- 306 weapon codes across 23 item types; 297 are spawnable and 9 are non-spawnable.
- Explicit source WSM exists for 201/306 records (65.69%); 105/306 (34.31%) have no source WSM.
- Existing documented IAS-specific WSM resolutions remain available. Unknown values are never silently changed to zero.
- All 306 records remain searchable; invalid class tags, spawnability, hand modes and missing WSM prevent numeric results where required.

## Numeric weapon coverage

The reproducible coverage command is `node --experimental-strip-types scripts/ias-coverage-audit.mjs`.

| Measure | Count |
|---|---:|
| Catalog codes | 306 |
| Distinct catalog codes appearing in at least one numeric candidate | 196 (64.05%) |
| Spawnable records | 297 |
| Source WSM present | 201 |
| Source WSM missing | 105 |

The audit’s legal candidate denominator is 22,925 registered skill × weapon × legal hand-mode × form configurations, including ordered legal dual-wield pairs exposed by the UI. It evaluates zero IAS / skill level 1 through `getCalculatorViewModelFromParts`. 22,771 return a number (22 VERIFIED, 22,749 REFERENCE_BASED); 154 mixed-WSM Dragon Claw pairs return CONFLICTED. This metric is limited to currently registered skill/weapon candidates; it does not treat every game skill × all 306 weapons as legal.

The 110 codes without a numeric candidate reconcile under the audit's primary exclusion precedence as 9 non-spawnable records and 101 spawnable records with unresolved WSM. The other 4 of 105 source-unknown WSM records have an explicit existing IAS-specific resolution. These reason counts are emitted by the audit script.

## Class normal-attack candidates

Earlier class counts (Amazon 172, Assassin 177, Barbarian 162, Druid 162, Necromancer 162, Paladin 162, Sorceress 171) counted spawnable codes eligible in at least one mode under the normal-attack profile. They are not the denominator for all skill-specific combinations. The current script counts each legal mode separately and expands ordered pairs for Assassin dual-claw attacks, Barbarian Frenzy and Whirlwind.

## Constraints

- 105 unknown-WSM records remain non-computable unless an existing explicit resolution supplies the value.
- Class-only weapons, unsupported animation classes, incompatible hand modes and non-spawnable records are excluded from numeric candidate sets with explicit UI statuses.
- Assassin Dragon Claw mixed-WSM pairs are counted as CONFLICTED, never given guessed timing.
- Barbarian Double Swing remains limited to the two recorded primary Phase Blade pairs (Phase Blade/Phase Blade and Phase Blade/War Hammer); its output fixes secondary and gear IAS at zero.
- Barbarian Frenzy and Whirlwind enumerate ordered legal hand pairs in the audit; their distinct mechanics and modifier limitations are documented in the skill matrix.
- Barbarian Double Throw enumerates ordered legal pairs of supported throwing-weapon bases, including the same base type in both hands; its visible inputs are separate primary IAS, secondary IAS, and equipment IAS.
- Assassin Dragon Flight does not require WSM for its fixed 23-frame result; it reports no IAS breakpoints.
