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

The initial sandboxed Webpack build hit EPERM creating a generated `.next` directory. Re-running with the previously approved workspace process permission succeeded, without ACL or security changes.

## Production smoke check

- Vercel project `d2-trade-web-6e47`: deployment `dpl_EAFGNEjew4FhmLoYGdBf1wjYBUxn`, **READY**, source commit `5ee6e587f6c4622a4749f4a633239a8a1385821e`.
- `www.d2jugobatgo.com` alias: assigned to the new deployment.
- `/game-info/ias-calculator`: HTTP 200; server-rendered page contains the IAS calculator, seven class choices, skill and weapon selectors, and reference-status notice.
- Live interactive browser and console checks were not repeated on the Production URL. Interactive desktop/mobile and console assertions passed in the 14-run local production-build browser suite above.
- Rollback: not performed. No database, environment variable, or PWA/Push setting was changed.
