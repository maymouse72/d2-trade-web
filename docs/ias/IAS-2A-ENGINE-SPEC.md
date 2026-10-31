# IAS-2A Engine Specification

## Purpose

Provide a reusable, pure TypeScript calculation module. This stage does not add a page or UI.

## Supported calculation

Only this evidence-backed scope returns `SUPPORTED`:

- Diablo II: Resurrected build 3.3.93847
- Paladin, Human form, Normal Attack
- A1 reference animation (this does not assert that all in-game normal attacks select A1)
- Crystal Sword (`crs`), weapon class `1hs`, resolved WSM 0
- No skill, buff, or debuff IAS
- Total item IAS 0–200
- Metric: complete animation frames, not a damage or hit-registration frame

The engine does not calculate APS.

## Public API

`lib/ias/index.ts` exports:

- `calculateIAS(input: unknown): IASResult`
- `evaluateIASSupport(input: unknown)`
- Golden frame and breakpoint helpers scoped to the Crystal Sword A1 reference dataset
- Input, result, status, reason, trace, and weapon types/constants

Non-supported responses have null frame, IAS, breakpoint, and evidence-version fields. The result also includes a reason and reason code.

## Input and policy

`weaponIAS` and `offWeaponIAS` must be finite, non-negative integers. Their sum must be 0–200. Optional `skillIAS`, `buffIAS`, and `debuffIAS` must be omitted or zero for supported output.

- `INVALID_INPUT`: malformed values, required fields missing, negative/fractional/non-finite IAS, or total IAS above 200.
- `UNSUPPORTED`: a different class, form, or attack mode.
- `UNVERIFIED`: A2, another weapon, or a non-zero skill/buff/debuff modifier.
- `SUPPORTED`: exact policy match and calculated frame equals the Golden row.

All failures return null numeric outputs; no unverified frame is exposed.

## Formula

For this mode SIAS=0 and WSM=0:

```text
TotalIAS = weaponIAS + offWeaponIAS
IEIAS = floor(120 × TotalIAS / (120 + TotalIAS))
EIAS = clamp(IEIAS − WSM, −85, 75)
R = floor(AnimationSpeed × (100 + EIAS) / 100)
FullAnimationFrames = ceil(256 × (FPD − StartingFrame) / R) − 1
```

Constants: AnimationSpeed=256, FPD=15, StartingFrame=0. The implementation floors the whole speed product before dividing. The engine does not calculate ActionEventFrame or use the FPD−1 alternative.

## Golden and evidence separation

`data/paladin-crs-a1-golden.json` contains 201 expected rows expanded from the independent D2R.org reference table's IAS ranges. `scripts/generate-golden.mjs` expands those ranges and never imports or calls the engine formula. `data/evidence.json` records the source links, extraction hashes, limitations, and Golden file SHA-256.

At runtime, formula results are compared against the separate Golden row. A missing or mismatched expected value returns `UNVERIFIED` with null numbers.

## Breakpoints

`breakpoints.ts` derives frame-change thresholds from Golden rows: 0, 9, 19, 32, 54, 86, and 152. At IAS 40 the current threshold is 32, the next is 54, and the additional IAS required is 14. At IAS 152–200, the next threshold and additional IAS are null because none exists inside the verified range.

## Run locally

```powershell
npm run test:ias
npx tsc --noEmit
npm run lint
npx next build --webpack
```
