# IAS-5-B Barbarian Golden 검증 보고서

- 데이터 파일: `lib/ias/barbarian-golden.ts`
- 독립 Golden 행: 7 breakpoint rows (IAS 0, 9, 18, 30, 48, 75, 125)
- 검증 조합: 1 (Barbarian Normal Attack A1 + Crystal Sword `crs` WSM 0)
- 자동 구간 비교: IAS 0–200 전수 (201개 입력값)
- 공개 표 경계/프레임: 0→15, 9→14, 18→13, 30→12, 48→11, 75→10, 125→9
- 기존 Paladin Golden 파일: 수정하지 않음

Golden 기대값은 계산 엔진에서 생성하지 않고 D2R.org의 고정 breakpoint 행을 정적으로 등록했다. 계산식 결과를 각 정수 IAS에서 구간 기준과 비교한다. 검증 테스트는 Paladin의 기존 일반 공격 결과도 대조한다. 전체 테스트/빌드 결과는 `IAS-5-TEST-RESULTS.md`에 기록한다.
