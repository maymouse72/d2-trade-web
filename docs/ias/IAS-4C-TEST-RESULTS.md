# IAS-4-C Test Results

## Required gates

| Check | Result |
|---|---|
| `npm run test:ias` | PASS — 36 tests, 36 passed, 0 failed (baseline 32 plus 4 Smite-specific tests) |
| Smite complete integer Golden coverage | PASS — 731/731 frames, EIAS and breakpoint match |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npx next build --webpack` | PASS — build compiled and generated all 12 static pages/routes |

The first normal-permission Webpack attempt stopped with Windows `EPERM` while creating `.next/types/app/trade`. No Node process was running and `.next` was an ordinary project build directory. Re-running the same build in the authorized project context with filesystem permissions succeeded; no source/configuration workaround was committed.

## Coverage

Tests cover Skill 97 and S1 selection, shield-required source scope, all 731 integer rows, fixed breakpoint-minus/exact/plus values, EIAS ceiling, weapon-specific WSM, all three input caps, invalid IAS, A1 mismatch, unsupported class and speed modifiers, and UI breakpoints. Existing normal/A1 and Zeal tests pass unchanged. Existing A1/derived/Zeal Golden hashes are recorded in `IAS-4C-SMITE-GOLDEN-REPORT.md` and unchanged.
