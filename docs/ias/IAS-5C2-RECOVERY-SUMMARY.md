# IAS-5-C-2 Recovery Summary

## Result
**PARTIAL / READY FOR APPROVAL** for a Track A-only production release. Track A is implemented and verified for one two-hand combination. Tracks B/C remain disabled. Production was not changed.

## Starting point
HEAD and `origin/main` were `70049bb521a4434f27ad9c7fd211bcf9f5f58160`. Existing IAS-5-C-1 implementation and prior uncommitted reports were retained. Earlier C2 source analysis and 150 extracted Barbarian COF inventory were reused; extraction output was cleaned after review.

## Track outcomes
- A: PASS for Barbarian Colossal Sword (`7fb`) equipped with both hands, A1 / BAA12HS, WSM +10. One weapon, one verified configuration; 11 published breakpoint rows and all 201 IAS values exercised against the fixed table.
- B: BLOCKED. Hand order, hand-specific speed resolution and Double Swing sequence timing need controlled game evidence.
- C: BLOCKED. Exact Frenzy state progression and Whirlwind hit cadence are not established by existing records.
- D: diagnosed as an execution-environment write boundary. No Node process was visible through `Get-Process`; CIM process inventory was denied. Restricted execution returned EPERM even for an isolated build directory. The same isolated Webpack build passed when run with the approved elevated execution. No process was stopped, no security setting changed and no `.next` data was deleted.

## Verification
IAS tests 59/59; TypeScript PASS; ESLint PASS; isolated Webpack production build PASS; existing Playwright PC 1365x900 and mobile 390x844 PASS, including selected C2 result, overflow, console and page errors. See [test results](IAS-5C2-TEST-RESULTS.md), [browser results](IAS-5C2-BROWSER-RESULTS.md), and [build diagnosis](IAS-5C2-BUILD-EPERM-REPORT.md).

## Release handling
No commit, push, or deployment. The task requires user approval for Track A-only deployment. Existing modified IAS-2B/IAS-3A reports and `debug.log` were preserved.
