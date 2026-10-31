# IAS-2A Final Report

## Result

**IAS-2-A: PASS for the defined limited engine scope.**

**IAS-2-B: READY**, limited to the Crystal Sword A1 reference-animation experience described below. Any later UI must explain that A1 is a reference animation and does not claim every in-game normal attack uses A1.

## Implemented

- Pure TypeScript engine, support policy, weapon metadata, and Golden-derived breakpoint lookup under `lib/ias`.
- Independent 201-row Golden Dataset for Paladin Human Normal Attack A1 reference animation, Crystal Sword WSM 0, SIAS 0, total IAS 0–200.
- Evidence metadata with source URLs, D2R extraction hashes, dataset SHA-256, and explicit limitations.
- Node built-in test runner command `npm run test:ias`; no test package added.
- Four IAS-2A engineering/validation reports.

## Example

Paladin / Human / Normal / A1 reference / Crystal Sword / total IAS 40 returns `SUPPORTED`, 11 full-animation frames, current breakpoint 32, next breakpoint 54, and 14 additional IAS required. The result does not include an event frame or APS.

## Verification

- IAS tests: 12 passed, 0 failed.
- Golden comparison: 201/201 matched.
- TypeScript: passed.
- ESLint: passed.
- Next.js production build using Webpack: passed.
- Default Turbopack build was stopped after over two minutes without new output; Webpack build passed.
- Existing site source remained unchanged. No commit, push, deployment, or database operation occurred.

## Files

Engine/data/tests: `lib/ias/`. Technical documentation: `docs/ias/`. Project configuration changes: `package.json` adds `test:ias`; `tsconfig.json` enables explicit TypeScript import extensions for Node's built-in TypeScript test runner. No dependency was added.

## Limits

A2, Phase Blade, War Hammer, nonzero skill/buff/debuff IAS, actual hit-registration timing, A1/A2 live selection, and APS remain disabled or unverified. Unsupported and unverified inputs return null numeric results.

No IAS-2-B page was added. IAS-2-B may proceed with the narrow supported scope and the A1-reference label; broadening that scope requires new independent evidence.
