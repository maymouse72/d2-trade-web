# IAS-6 Regression Results

**Run date:** 2026-11-11

| Check | Result |
|---|---|
| `npm run test:ias` | PASS — 132/132 |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npx next build --webpack` | PASS — compiled and generated all 12 routes |
| Golden/regression dataset | PASS — existing Golden expectations and earlier IAS-5-C-3-R tests remain in the full suite |
| Coverage audit | PASS — 64 selectable skill/mode entries; 22,946 candidates, 22,792 numeric and 154 conflicted Dragon Claw combinations |
| Weapon exclusion audit | PASS — 306 total; 196 in at least one numeric candidate; remaining 110 reconcile as 9 non-spawnable and 101 unresolved WSM |
| `npm run test:ias:browser -- --workers=1` | PASS — 14/14: seven Desktop Chrome and seven Mobile Chrome 390×844 runs |
| Browser errors / mobile overflow | PASS — no console/page errors or horizontal overflow in asserted cases |

Browser coverage now includes fixed Dragon Flight timing, Double Throw dual-weapon controls, all existing class and sequence cases, console/page-error checks, and mobile horizontal overflow. The local browser run does not verify live-game timing or Production services.

The initial sandboxed Webpack build hit EPERM creating a generated `.next` directory. Re-running with the previously approved workspace process permission succeeded, without ACL or security changes. No Production site, Git remote, database, or Vercel deployment was modified.
