> **후속 상태 (IAS-4-A-2):** 이 문서는 IAS-4-A 또는 초기 분석 당시의 판정을 기록합니다. 현재 구현·지원 범위·배포 판정은 [IAS-4-A-2 최종 보고](IAS-4A2-FINAL-REPORT.md)와 관련 IAS-4-A-2 보고서를 기준으로 확인하세요.

# IAS-4-A — Engine Changes

## Implemented

- Added `IAS_SKILLS` registry separating evidence status from engine support status.
- `NORMAL_ATTACK` remains SUPPORTED for the existing Paladin A1 calculation.
- Sacrifice, Vengeance and Conversion are selectable with PROVISIONAL evidence status and UNVERIFIED engine support. They return no frames, EIAS, breakpoint, next IAS, or breakpoint rows.
- Zeal and Smite remain disabled/UNSUPPORTED in the UI registry for IAS-4-B and IAS-4-C.
- Existing `IASInput` remains backward-compatible: absent `skill` defaults to `NORMAL_ATTACK`.
- Added a split-input UI-model function; it sums weapon IAS and off-weapon IAS, rejects invalid or over-range totals, and feeds the unchanged calculation. The legacy single-total UI-model function remains and delegates to the split path with 0 weapon IAS.
- Existing A1 formula, weapon definitions, 720 Golden rows, and A2 UNVERIFIED policy remain intact.

## Tests added

- Split 20 weapon IAS + 20 equipment IAS matches the previous single-total IAS 40 result.
- Combined over-limit input is rejected.
- PROVISIONAL skills expose no result and no breakpoint rows.
- Skill registry separately asserts evidence/support/selectability states.
- Existing tests continue to exercise A1 breakpoints and A2/class blocking.

## Deferred

No per-skill formula branch or Golden generator was added because exact original skill animation rows are unavailable. Skill IAS, buff/debuff speed changes, dual wield, Zeal rollback, and Smite-specific animation remain unsupported.
