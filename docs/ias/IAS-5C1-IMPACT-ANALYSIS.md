# IAS-5-C-1 변경 영향도 분석

## 기준

- 작업 기준 HEAD 및 `origin/main`: `260fad414d0da68fac7d120b45aefd5bb13e3f0f`.
- 작업 시작 트리: 기존 IAS-2B 및 IAS-3A 보고서 7개 수정본과 미추적 `debug.log`; 사용자의 기존 변경으로 보존하고 staging에서 제외.
- 기준 `npm run test:ias`: 57/57 PASS.
- Production 기준 IAS-5 code commit `61b7d3e`, latest report commit `260fad4`, Vercel `dpl_FCs4SbqLiQffGVTZA1gA4pTNd6Sx` READY.

## 의존 관계/변경 범위

계산기 Client Component → Barbarian weapon/skill registry → shared IAS input gate → Barbarian A1 engine → weapon-specific published breakpoint rows → UI result/table. 기존 Paladin engine, Fanaticism logic, weapon catalog/localization/filter, IAS-5 Crystal Sword Golden은 그대로 두고 Barbarian registry와 Golden을 추가·확장한다. 무기 선택 컴포넌트는 선택 직업의 verified weapon list를 읽어 지원 표시를 계산한다.

예상 변경은 IAS 전용 `class-registry`, `support-policy`, `barbarian`, `barbarian-golden`, `ui-model`, IASCalculator, IAS unit/browser tests 및 IAS-5C1 보고서 10개다. 공유 사이트 레이아웃/API/DB/PWA 설정은 수정하지 않는다.

## 원본 증거와 제한

D2R COF/AnimData와 `weapons.txt`를 새로 대조한다. 외부 WSM별 독립 기대값은 Amazon Basin Barbarian 1HS 표를 사용하고 D2R.org는 build 3.3.93847 AnimData와 공개 class tables의 상호 대조를 설명한다. 1hs 일치만으로 활성화하지 않고, 무기별 명시적 WSM, COF 1hs layer, animation record, 0 IAS/전환/상한 rows 전부 맞을 때만 활성화한다. 공개 자료가 특정 WSM의 전 구간을 확인할 수 없거나 원본 매핑이 모호하면 그 무기는 차단한다.

## 테스트 범위

IAS tests, TypeScript, lint, Webpack production build, Playwright desktop 1365×900/mobile 390×844, Production IAS smoke를 실행한다. 거래 상세/댓글, 경험치, 도감, Supabase, PWA/Push는 IAS 전용 파일만 변경되어 호출·설정 경로가 없으므로 생략한다. 작업 시작/종료 Git diff로 이 경계를 확인한다.
