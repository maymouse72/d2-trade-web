> **후속 상태 (IAS-4-A-2):** 이 문서는 IAS-4-A 또는 초기 분석 당시의 판정을 기록합니다. 현재 구현·지원 범위·배포 판정은 [IAS-4-A-2 최종 보고](IAS-4A2-FINAL-REPORT.md)와 관련 IAS-4-A-2 보고서를 기준으로 확인하세요.

# IAS-4-A — Test Results

## Automated checks

| Check | Result |
|---|---|
| `npm run test:ias` | PASS — 22/22 |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npx next build --webpack` | PASS — sandbox run first encountered EPERM when creating `.next/types`; same requested build succeeded in the approved local execution environment. |

The Node test runner prints the existing MODULE_TYPELESS_PACKAGE_JSON performance warning; it does not fail tests.

## Browser checks

| Check | Result |
|---|---|
| PC: split IAS 20 + 20 | PASS — total 40, Crystal Sword A1 = 11 frames. |
| PC: Sacrifice/Vengeance/Conversion switching | PASS — prior A1 result and table disappear; Korean verification reason shown. |
| PC: return to Normal Attack | PASS — result restored from A1 dataset. |
| PC: switch to Phase Blade at total IAS 40 | PASS — 9 frames; 24 IAS current breakpoint. |
| Mobile viewport 390×844 | PASS — fields and controls fit; split fields stack at <=390; page/body width 375 CSS px; no horizontal document overflow. |
| Mobile skill transitions | PASS — Vengeance and Conversion show no frame value or table rows. |
| Mobile invalid total 318 with War Hammer max 317 | PASS — clear range error, no frame value. |
| Browser console errors/warnings | PASS for IAS calculator — no calculator errors. A read-only trade-detail visit emitted the existing Supabase warning `Multiple GoTrueClient instances detected`; it states this is not an error. |
| A2 diagnostic | PASS by automated policy regression; browser selector remains in advanced details and A2 has no output. |

## Existing-site regression

Read-only local browser checks: homepage and trade list rendered; a trade detail rendered and showed the existing comment area (0 comments for the inspected listing); experience page was checked and rendered its level/recommendation/efficiency content. Game Info navigation and the IAS calculator link rendered. Trade-detail notification UI reported that server notifications are disabled or pending. No trade, comment, account, DB, auth, PWA, Push, or environment settings were changed.

## Dataset and scope

- Existing A1 Golden: 720 rows preserved (201 CRS + 201 Phase Blade + 318 War Hammer).
- New skill Golden rows: 0.
- A2 Golden rows: 0; status UNVERIFIED.
- No commit, push, PR, or Production deployment performed.

The initial build attempt in the restricted shell hit EPERM creating `.next/types`; rerunning the same Webpack build in the permitted local execution environment passed. This was an execution-environment permission issue, not a source/build failure.
