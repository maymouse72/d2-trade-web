# IAS-4-C Deployment Report

## Gate status before deployment

Source mapping, formula comparison, 731-row Golden comparison, existing Golden hashes, automated tests, TypeScript, lint, Webpack build, local desktop/mobile browser, console and existing production route smoke checks passed.

## Git and remote

- Expected base: `0c0b0a7d3a461103338c8a4e741cfc4804073077` on `main`.
- Pre-existing unrelated edits: seven IAS-2B/IAS-3A report files; untracked `debug.log`. Excluded from the IAS-4-C change set.
- Commit: `f5e1780fa61134b2326928b8fee96beca19d51a3` (`feat(ias): add validated Paladin Smite speed calculation`).
- Push: PASS — fast-forward `0c0b0a7..f5e1780` to `origin/main`; no force push.
- Production deployment: `dpl_5wHYDxBsP1KasKe96TnjW1mgxdev`, READY.
- Production aliases: `www.d2jugobatgo.com`, `d2jugobatgo.com`, and Vercel project aliases; Vercel reports no alias error.
- Vercel project: `d2-trade-web-6e47` (`prj_kiBEIv1IOSotE8DlHwIvtVyMNQ4f`).
- Previous Production deployment: `dpl_Ejd7P4H5yiu3KX8eHzZVHdqbM4V7`, READY on commit `0c0b0a7d3a461103338c8a4e741cfc4804073077`.

## Production smoke test

- `/game-info/ias-calculator` loaded with Smite enabled and shield/S1 support scope visible.
- Crystal Sword 0 IAS: 11 frames.
- Phase Blade 65 IAS: 6 frames.
- War Hammer 168 IAS: 7 frames; 395 IAS breakpoint: 6 frames.
- War Hammer 457 input constrained to 456; 456 IAS returns 6 frames and EIAS 75.
- 390×844 mobile viewport: document/body width 375px; no horizontal overflow.
- Browser console: no warning/error entries during the production calculator smoke test.
- Existing production route/read-only regression checks are recorded in `IAS-4C-REGRESSION-RESULTS.md`.

## Final disposition

All listed implementation, data, automated, desktop/mobile, production and service-route gates passed. No rollback was needed. A later documentation-only commit may trigger an identical-code Vercel deployment; this report identifies the code deployment that introduced Smite.
