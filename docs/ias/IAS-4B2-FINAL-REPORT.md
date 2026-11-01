# IAS-4-B-2 Final Report

## Final gate: PASS / DEPLOYED

### Completed

- D2R Zeal skill and weapon source extraction/hash record
- Paladin 1HS Zeal animation/formula cross-check
- Fixed reference transcription and 3,564-vector Golden dataset
- Separate Zeal engine and user interface for supported skill levels and weapons
- Automated tests: 32/32 pass
- TypeScript, lint, and Webpack production build: PASS
- Local desktop browser interaction and console check: PASS
- Mobile 390×844 layout and interaction check: PASS; no page-level horizontal overflow
- Existing read-only trade list and detail `/trade/18` (0 existing comments), catalogs, experience information, and navigation checks: PASS
- Production browser smoke tests: PASS on PC and mobile; console errors none

### Git and Vercel

- Baseline HEAD and `origin/main`: `5bb9653952f9aed0fc234dc29020e2597c17704e`
- IAS-4-B-2 commit: `a85f05d08b0065722ee31452b595fae59dc7b651`
- Production deployment ID: `dpl_6ntYAikPWmeRSn5YfBEZj6CD16B6`
- Production state: READY
- `www.d2jugobatgo.com`: attached to the new Production deployment
- Rollback: not applicable

### Production Zeal smoke

- Crystal Sword 0 IAS / 2 hits: 21 frames
- Phase Blade 24 IAS / 2 hits: 14 frames; 200 IAS constrained to 72
- War Hammer 317 IAS / 2 hits: 13 frames; 317 and 318 both valid within Zeal's 456 cap
- War Hammer 456 IAS / 2 hits: 12 frames
- Five-hit War Hammer sequence: 317 IAS → 28 frames; 456 IAS → 24 frames
- Existing trade list/detail/comments, item catalogs, and experience page rendered; no records changed
- Production browser console: no errors

### Evidence caveat

Zeal frames derive from the D2R source records, existing Paladin A1 animation mapping, and published Zeal reference table. No in-game frame capture was performed. The published fixed table and formula matched across the supported 64 rows and 161 integer EIAS values. Unsupported modifiers and A2 remain blocked.

See the companion IAS-4B2 reports for source, formula, data, browser, regression, and test details.