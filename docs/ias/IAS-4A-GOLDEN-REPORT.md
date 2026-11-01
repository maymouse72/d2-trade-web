> **후속 상태 (IAS-4-A-2):** 이 문서는 IAS-4-A 또는 초기 분석 당시의 판정을 기록합니다. 현재 구현·지원 범위·배포 판정은 [IAS-4-A-2 최종 보고](IAS-4A2-FINAL-REPORT.md)와 관련 IAS-4-A-2 보고서를 기준으로 확인하세요.

# IAS-4-A — Golden Dataset Report

## Outcome

- Existing A1 Golden Dataset is unchanged: Crystal Sword 201, Phase Blade 201, War Hammer 318; **720 rows total**.
- New Sacrifice Golden rows: **0**.
- New Vengeance Golden rows: **0**.
- New Conversion Golden rows: **0**.
- A2 Golden rows: **0**; A2 remains UNVERIFIED.

## Why no skill Golden rows were generated

The public D2R.org current-build mechanics pages describe these skills as weapon attacks and publish derived attack frames. D2R Tools also categorizes them as using the weapon's normal attack animation. The exact `skills.txt` / `skilldesc.txt` build rows, their local hashes, and their animation-control fields are absent from the local extraction. Generating 2,160 cloned A1 rows would turn an unverified mapping into apparent independent evidence, so none were created.

This is intentionally a zero-row result, not a failed or empty data generation. No calculator output was copied into Golden data.

## Dataset preservation check

The three existing JSON datasets and generator were not edited. Existing tests still check complete 201/201/318 coverage and breakpoint boundaries. Calculating the current A1 weapon IAS + off-weapon IAS total uses the existing 720 rows without changing their expected frames.

## To continue

Obtain and hash the exact build's relevant skills rows, verify the mapping and formula independently, then generate separate per-skill datasets with character, skill, animation mode, weapon code/class, WSM, IAS, SIAS, frame count, breakpoint, source, evidence status and game build. Never derive a new skill dataset solely by copying reference calculator results.
