# IAS-4-B-2 Implementation Report

## Delivered

- Added a separately typed Zeal sequence result and calculator path.
- Registered Zeal (skill ID 106) for Paladin A1 and the three supported one-handed weapons.
- Added Zeal skill-level selection with the D2R 2–5 hit progression.
- Added weapon-specific Zeal IAS ceilings and input clamping, including weapon changes and skill changes.
- Added first event, follow-up interval, final event, final animation remainder, total sequence, and hit-count presentation.
- Added Zeal breakpoint table rows sourced from the fixed reference and expanded Golden data.
- Kept A2, other classes, unsupported weapons, and unsupported modifiers from returning numeric output.
- Added source, formula, mapping, Golden, browser, regression, test, deployment, and final reports.

## Files in implementation scope

`app/game-info/ias-calculator/IASCalculator.tsx`; `lib/ias/{calculate,constants,index,skills,support-policy,types,ui-model,zeal,zeal-golden}.ts`; `lib/ias/data/paladin-zeal-{1hs-reference,golden}.json`; `lib/ias/scripts/generate-zeal-golden.mjs`; `lib/ias/__tests__/{support-policy,ui-model,zeal}.test.ts`; and `docs/ias/IAS-4B2-*.md`.

Existing IAS-2B/IAS-3A edited reports and `debug.log` are unrelated pre-existing workspace changes and are excluded from the IAS-4B-2 change.

## Scope boundary

The displayed event frames are derived from the documented fixed Paladin 1HS Zeal table and matched D2R records. They are not represented as in-game frame captures. Zeal-specific speed modifiers are not implemented.
