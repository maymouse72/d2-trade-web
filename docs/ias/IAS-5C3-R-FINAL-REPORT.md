# IAS-5-C-3-R Final Report

**Final status: PASS / READY FOR PRODUCTION.** The user approved deployment if verification remained clean; final Playwright result is clean.

## 1. Connection issue

- Classification: `NETWORK_POLICY_DENIED` in the Codex constrained runner; the user's ordinary Windows PowerShell successfully ran the prior Playwright suite.
- Next server starts and reports Ready, but Playwright health-check connections return `EACCES 127.0.0.1:4173`; browser navigation previously returned `ERR_NETWORK_ACCESS_DENIED`.
- PowerShell probes to both `127.0.0.1` and `localhost` are denied by the execution environment. The application/server start itself is not the failing stage.
- No retry inflation, hostname workaround, firewall changes, privilege escalation for networking, or config change was made. Detailed diagnosis and user-PC command: [network diagnosis](IAS-5C3-R-NETWORK-DIAGNOSIS.md).

## 2. Browser tests

| Project | Result | Calculation / UI observations |
|---|---|---|
| Desktop 1365×900 | PASS | Final spec passed (2.2s) |
| Mobile 390×844 | PASS | Final spec passed (2.2s) |

The successful final run includes 72h IAS 7→14 and 83→10, 9fb IAS 99→10, breakpoint table updates, stepper keyboard activation, and B/C option blocking. Prior Codex-runner errors were `ERR_NETWORK_ACCESS_DENIED` / `ERR_CONNECTION_TIMED_OUT`; the user's normal PowerShell resolved the practical testing block without project configuration or system-policy changes.

## 3. Automated checks

- IAS: 61/61 PASS.
- TypeScript: PASS sequentially after `.next/types` generation; earlier concurrent run had transient missing generated files.
- ESLint: PASS.
- Webpack: restricted execution reproduced `.next` EPERM; previously approved execution method passed all 12 static pages.
- Golden: baseline hash unchanged; 13 C3 rows retained; no existing Golden rows changed.
- B/C blocking: PASS via unit assertions.

## 4. Candidate and Git state

- Candidate remains Track A two-hand swords only: Legend Sword `72h`, Zweihander `9fb`.
- Existing user-owned IAS-2B/3A report edits, IAS-5C2 files, and `debug.log` remain excluded and untouched.
- C3-R changed the IAS-only Playwright spec and six reports; no Playwright configuration, engine, UI, or Golden code changed.
- Commit/push and Production deployment were not performed.

## 5. Decision

**PASS / READY FOR PRODUCTION.** The user's latest screenshot passed both projects after all required assertions were added, and the user authorized deployment if no issue was found. Candidate scope is the five implementation/test files and sixteen C3/C3-R reports described above. Existing IAS-2B/3A edits, IAS-5C2 materials, and `debug.log` are excluded. Deployment is in progress; record the commit, Vercel deployment and live smoke-test results in this report before completion.
