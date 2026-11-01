# IAS-4-C Deployment Report

## Gate status before deployment

Source mapping, formula comparison, 731-row Golden comparison, existing Golden hashes, automated tests, TypeScript, lint, Webpack build, local desktop/mobile browser, console and existing production route smoke checks passed.

## Git and remote

- Expected base: `0c0b0a7d3a461103338c8a4e741cfc4804073077` on `main`.
- Pre-existing unrelated edits: seven IAS-2B/IAS-3A report files; untracked `debug.log`. Excluded from the IAS-4-C change set.
- Commit: pending final origin/main check and commit.
- Push / Production: pending.
- Vercel project: `d2-trade-web-6e47` (`prj_kiBEIv1IOSotE8DlHwIvtVyMNQ4f`).
- Existing Production deployment observed: `dpl_Ejd7P4H5yiu3KX8eHzZVHdqbM4V7`, READY on commit `0c0b0a7d3a461103338c8a4e741cfc4804073077`.

## Deployment disposition

This report will be updated after clean remote verification and deployment. The user-authorized conditional deployment proceeds only if origin/main remains the expected ancestor and the IAS-4-C-only commit can be pushed without conflict.
