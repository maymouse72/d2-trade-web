# 경험치 효율 참고 데이터

- 자료: 운영자 제공 `경험치 테이블.png` (719×2268).
- 원본 SHA-256: `BDBF72A4EBF50C6DB4C7F37B4E3BF8A6EA2E47D4470FD2654ABD492B1F3B2DDC`.
- 전사 및 확대 육안 재대조: 2026-10-28.
- 버전: `reference-chart-v1`. 게임 버전·계산 기준 버전은 미상(null).
- 검증 상태: 전사값 대조와 게임 계산 방식 검증을 구분한다. 이 표의 몬스터 표본과 평균 방식은 미확인이다. 공식 정확 수령률로 사용하지 않는다.

## 데이터 구조

`data/experience-efficiency.json`의 rows는 레벨 1~99 순서이며, 각 values는 노멀 Act 1~5 / 나이트메어 Act 1~5 / 헬 Act 1~5 순서이다. 총 1,485개 수치. 각 셀은 행의 level, 열의 difficulty/act 및 공통 metadata의 출처·상태·버전을 상속한다. 불명확한 수치는 null로 입력하면 UI가 ‘확인 필요’로 표시하고 추천을 확인된 값으로 제한한다.

`sourceAverageExperience`와 `sourceSummaryRanges`는 원문 보관용이며 계산에 사용하지 않는다. 특히 평균 경험치를 몬스터 레벨로 간주하지 않는다. 원문에 나이트메어 Act 5 추천 구간이 없어 임의로 만들지 않았다. 나이트메어 Act 2는 43~48, 헬 Act 4는 83~94, Act 5는 95~99로 판독했다. 앞선 Phase 2 문서의 44~48 및 94~99 판독은 정정한다.

## 추천

행의 15개 셀에서 최대값과 모든 동률을 찾는다. 공동 최고인 연속 레벨을 추천 구간으로 산출한다. 원문 요약과 별개다. 난이도 필터는 표와 선택 레벨 요약에만 적용한다. 99레벨에는 육성 추천을 하지 않는다. 표에 기록된 99레벨 값은 참고 자료 비교를 위해 보존한다.

원문 특이값(예: 68레벨 나이트메어 Act 4의 2%)도 임의로 5%로 보정하지 않았다.

## 게임 규칙 참고

- [Blizzard Arreat Summit — Experience](https://classic.battle.net/diablo2exp/basics/experience.shtml): 레벨 차이 보정 및 70레벨 이후 추가 감소 설명.
- [Blizzard — Patch 2.5 출시 안내](https://news.blizzard.com/de-de/article/23827590/patch-2-5-fuer-diablo-ii-resurrected-ist-jetzt-live): 테러존의 별도 레벨 및 경험치 기준.
- [d2data experience.json](https://github.com/blizzhackers/d2data/blob/master/json/experience.json): 공개 추출 데이터의 고레벨 계수 교차검증용. 페이지 계산에는 사용하지 않는다.
- [D2MOO SUnitDmg.cpp](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Game/src/UNIT/SUnitDmg.cpp): 레거시 경험치 계산 코드 재구현 참고. 현재 D2R 실행 파일 검증으로 간주하지 않는다. 페이지 계산에는 사용하지 않는다.

표를 최신 게임 규칙으로 재계산하려면 지역·몬스터별 기준과 가중 방식을 별도로 확보해야 한다. 기존 표에 고레벨 계수만 곱해 공식 데이터로 전환하지 않는다. 테러존·파티·인원·장비 보너스·처치 속도·시간당 경험치는 이번 기능 범위에서 제외한다.
