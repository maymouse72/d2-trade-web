# IAS-5C3 Test Results

실행일: 2026-11-09.

Required checks: `npm run test:ias`, `npx tsc --noEmit`, `npm run lint`, `npx next build --webpack`, and `npm run test:ias:browser` (Playwright projects Desktop 1365×900 and Mobile 390×844). Browser tests must include new 72h/9fb supported output, legacy IAS coverage, unsupported B/C, console errors, and horizontal overflow. Build EPERM handling follows [C2 build report](IAS-5C2-BUILD-EPERM-REPORT.md) if that report is present; do not remove any user's `.next` data.

| Check | Result |
|---|---|
| IAS unit tests | PASS, 61/61 |
| TypeScript | PASS (`npx tsc --noEmit`) |
| ESLint | PASS (`npm run lint`) |
| Webpack production build | PASS with approved execution after default `.next` raised EPERM at `/sets`; no config change |
| Playwright desktop/mobile | BLOCKED: both projects failed navigation with `ERR_NETWORK_ACCESS_DENIED` under restricted execution and `ERR_CONNECTION_TIMED_OUT` under approved execution; local socket access was denied to the test runner. No UI result was marked PASS. |
| Existing Golden integrity | PASS: prior `BARBARIAN_GOLDEN_ROWS` remain unchanged; baseline source-file hash is recorded in Golden report |
| Diff whitespace check | PASS (`git diff --check`) |

Playwright could not reach the local test server even when the server was started with approved execution. As desktop and mobile Playwright are required gates, this candidate is **not ready for commit/push or Production approval**. No production action was taken.
