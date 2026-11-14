# ITEM-34-B — Test Results

| Check | Result | Evidence |
|---|---|---|
| `npm run test:items` | PASS | 13 tests passed; 0 failed. Covers counts/IDs, images, all 18 unique variants, nine 3.3 unique Non-Ladder conditions, set/runeword variants, and ambiguity blocking. |
| `npm run test:ias` | PASS | 132 tests passed; 0 failed. |
| `npx tsc --noEmit` | PASS | Exit code 0. |
| `npm run lint` | PASS | Exit code 0. |
| `npm run build:webpack` | PASS | Webpack production build and all 12 static pages completed. Initial sandbox attempts hit Windows `EPERM` while creating `.next` segment folders; the same authorized build completed with local build write permission. |
| `npm run test:items:browser` | PASS | Latest attached run: 6/6 passed across Desktop Chrome and Mobile Chrome 390×844, including catalog interactions, overflow, page exceptions, and console error checks. |

No IAS, trade, Supabase, PWA, Push, environment-variable, or production configuration source was intentionally changed. Trade/PWA production regressions were not exercised in a browser during this local-only implementation.

