> **후속 상태 (IAS-4-A-2):** 이 문서는 IAS-4-A 또는 초기 분석 당시의 판정을 기록합니다. 현재 구현·지원 범위·배포 판정은 [IAS-4-A-2 최종 보고](IAS-4A2-FINAL-REPORT.md)와 관련 IAS-4-A-2 보고서를 기준으로 확인하세요.

# IAS-4-A — Final Report

**Final decision: PARTIAL**
**Work mode:** local development and verification only; no commit, push, PR, or Vercel Production deployment.

## Delivered

- Skill-centric Paladin UI with Normal Attack, Sacrifice, Vengeance and Conversion selection; Zeal and Smite remain disabled as future work.
- Distinct skill evidence and engine support states. Sacrifice, Vengeance and Conversion remain PROVISIONAL / UNVERIFIED, so they show a reason and no numeric outputs.
- Weapon IAS / off-weapon equipment IAS split fields with a combined total, over-limit handling and compatibility with the existing single-total API.
- Advanced A1/A2 diagnostic selection preserved; A2 remains UNVERIFIED and returns no values.
- Eight IAS-4-A reports and reference comparison CSV.

## Final results

| Item | Result |
|---|---|
| Sacrifice | PROVISIONAL; not calculated |
| Vengeance | PROVISIONAL; not calculated |
| Conversion | PROVISIONAL; not calculated |
| New Golden rows | 0 |
| Existing A1 Golden rows | PASS — 720 preserved |
| A2 | UNVERIFIED; 0 Golden rows |
| Automated IAS tests | PASS — 22/22 |
| TypeScript / lint / Webpack build | PASS |
| PC and 390×844 browser checks | PASS for tested flows |
| Browser console | IAS calculator: no errors. Trade detail emitted an existing Supabase `Multiple GoTrueClient instances` warning; the library message says it is not an error. |
| Existing trade/detail/comments/experience regression | PASS for read-only rendering — homepage/list and detail loaded; inspected detail showed 0 comments; experience content rendered. Trade notifications report server feature disabled or pending. |
| Git/Production | unchanged by this task; no release operations |

## Browser limitation resolution

The earlier Windows Chrome session was stopped by a URL-confidence safeguard because an app-level Chrome action could not establish the active URL among multiple tabs. No security control was changed or bypassed. The local route was opened explicitly in the Codex in-app browser, and the supported viewport and console-log APIs were used there; this allowed the 390×844 and console checks to complete. The local homepage/list, read-only trade detail/comment area, experience page, and Game Info navigation were inspected. The selected detail had 0 comments. The trade route emitted a Supabase multiple-client warning (the library says it is not an error); the IAS calculator route had no errors.

## Evidence gap and next work

The `C:\IAS-Validation-Temp\02-raw-extracted\data` extraction does not contain `skills.txt` or `skilldesc.txt`. Public current-build references support the same-normal-attack candidate for all three skills, but exact skill-row animation fields and local hashes were not independently checked. No new skill outputs or Golden data were enabled. Obtain the exact build rows and repeat the mapping/formula check before promoting any skill to VERIFIED.

IAS-4-B (Zeal) and IAS-4-C (Smite) can proceed as separately scoped evidence investigations; this implementation keeps those skills disabled. IAS-5 can reuse the skill registry and support-policy separation, but other characters must supply independent animation and Golden evidence.

## Artifacts

- `IAS-4A-SKILL-ANIMATION-MAPPING.md`
- `IAS-4A-SKILL-EVIDENCE.md`
- `IAS-4A-REFERENCE-COMPARISON.csv`
- `IAS-4A-GOLDEN-REPORT.md`
- `IAS-4A-ENGINE-CHANGES.md`
- `IAS-4A-UI-CHANGES.md`
- `IAS-4A-TEST-RESULTS.md`
- `IAS-4A-FINAL-REPORT.md`
