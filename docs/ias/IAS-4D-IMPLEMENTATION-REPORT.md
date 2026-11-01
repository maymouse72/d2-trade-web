# IAS-4-D — implementation report

## Delivered locally

- Added a normalized catalog for 306 coded D2R weapon rows, preserving missing WSM values as `null`, source hashes, type ancestry, raw animation classes, version/spawnable flags, and source-derived handedness.
- Added source-aware search plus item-type, handedness, and current-skill verification filters. Options display code, WSM, hand form, and status. Non-spawnable rows are excluded from the default selector.
- Kept catalog data, animation mapping, and calculator registry as separate layers. Catalog presence does not add a supported weapon.
- Added only one new calculation combination: Paladin Long Sword Zeal A1, code `lsd`, WSM `-10`, IAS 0–142, 2–5 hit count.
- Added 572 fixed-reference expansion rows and a separate nine-boundary independent reference record. Existing Zeal dataset rows remain byte-for-byte equivalent as dataset objects.
- Changed unsupported weapon/skill combinations with incomplete evidence to `UNVERIFIED` and a Korean explanation; no number or breakpoint table is displayed.
- Left Normal attack, Sacrifice, Vengeance, Conversion, Smite, A2, other classes, and modifiers unexpanded for Long Sword.

## Changed implementation files

- `app/game-info/ias-calculator/IASCalculator.tsx`
- `app/game-info/ias-calculator/ias-calculator.module.css`
- `lib/ias/constants.ts`, `skills.ts`, `support-policy.ts`, `weapons.ts`, `weapon-catalog.ts`
- `lib/ias/data/weapon-catalog.json`, `paladin-lsd-zeal-reference.json`, `paladin-zeal-golden.json`
- `lib/ias/scripts/generate-zeal-golden.mjs`
- IAS catalog, Zeal, and UI model test files

No Supabase, auth, push, PWA, environment, marketplace, comments, experience, runeword, unique, or set source was changed.

## Formula and range

The existing Zeal engine and fixed Paladin 1HS formula are reused with raw WSM -10. The 9 independent breakpoint rows matched in the separate reference comparison. IAS 142 reaches the EIAS 75 ceiling; higher inputs are constrained to 142 for this combo. No other weapon's limits were copied.

## Remaining gate

The production build and code checks pass. PC interaction was partially verified locally. 390×844 verification, browser console review, and interactive trade-detail/comment regression were not completed because Windows Chrome Computer Use stopped when it could not confirm the native window URL. The local work is therefore not committed, pushed, or deployed. See the [browser results](IAS-4D-BROWSER-RESULTS.md) and [deployment gate](IAS-4D-DEPLOYMENT-REPORT.md).
