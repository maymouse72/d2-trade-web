# IAS-4-D-2 + IAS-4-E Test Results

## Status

- IAS unit/integration suite: **53/53 PASS**.
- TypeScript `npx tsc --noEmit`: **PASS**.
- ESLint `npm run lint`: **PASS**.
- Webpack production build `npx next build --webpack`: **PASS** after running sequentially in the approved local build context.
- Browser test `npm run test:ias:browser`: **2/2 PASS** (desktop Chrome and mobile Chrome 390×844).
- Production same-suite smoke test: **2/2 PASS** against `www.d2jugobatgo.com`.

## Coverage

- All baseline 46 IAS tests retained; new Fanaticism/localization/support-state assertions added across suite coverage.
- SIAS levels 1–24 compared against published D2R samples, level 60 cap, invalid level rejected.
- Fanaticism OFF deep-equals legacy output for A1 skills, Zeal and Smite.
- ON calculations tested for all six supported Paladin skills; unsupported class, weapon and generic modifiers blocked.
- New Fanaticism Golden: 1,140 datasets (19 combos × 60 levels), 4,364 threshold rows; all thresholds return expected EIAS and frame counts.
- Localization: 306 code-keyed names, 23 type labels, Korean/English/code search and 297 spawnable choices.
- Browser: option count, category label, searches, aura on/off, skill switches, browser console, page errors, and no horizontal overflow.

## Build note

The first parallel check raced TypeScript against Next.js `.next` generation and hit missing generated type files; a parallel Webpack build also hit `.next` EPERM. The build was rerun alone in the approved execution context and passed; TypeScript and ESLint then passed after build completion. These were verification-order/Windows `.next` filesystem issues, not source compile errors.
