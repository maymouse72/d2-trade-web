# IAS-5-A + IAS-5-B 영향도 분석

## 기준 상태

- 기준 커밋: `591577c2ec7e87b7877a6efcd827097107827bc9`
- `origin/main`은 작업 시작 시 기준 커밋과 일치했다.
- IAS baseline: `npm run test:ias` 53/53 PASS.
- 기존 사용자 변경: IAS-2B 및 IAS-3A 보고서 7개와 미추적 `debug.log`; 모두 보존하고 커밋 대상에서 제외한다.

## 호출 흐름과 변경 경계

`app/game-info/ias-calculator/IASCalculator.tsx` (Client Component: 선택/입력 상태) → 직업별 스킬·지원 조합 레지스트리 → `ui-model.ts` → `support-policy.ts` 입력 및 지원 판정 → `calculate.ts`가 직업 엔진을 선택 → 직업별 Golden Dataset/브레이크포인트 → 검증된 결과. 기존 Paladin 계산식·Golden 경로는 어댑터 경계로 보존하고, Barbarian 계산 및 데이터는 별도 모듈로 둔다. 공용 무기 카탈로그와 한국어 로컬라이제이션은 조회용으로 재사용하며 카탈로그 원본은 바꾸지 않는다.

## 예상 변경 파일

- IAS 전용 타입·직업/스킬 레지스트리·지원 정책·계산 엔진·UI model
- IAS 계산기 Client Component 및 필요한 전용 스타일
- 별도 Barbarian Golden 데이터와 테스트
- IAS-5 산출 보고서 11개

IAS 외 사이트 페이지, API, 전역 레이아웃, DB, 인증, PWA/Push 설정은 변경 대상이 아니다. 영향 분석상 거래 상세/댓글, 경험치, 룬워드, 유니크/세트, Supabase 및 PWA/Push 테스트는 생략 가능하며, 사유는 이들이 IAS 전용 모듈을 가져오지 않고 IAS 페이지 외 공유 파일을 수정하지 않기 때문이다. IAS 페이지에서 카탈로그/검색/기존 성기사 계산/UI 회귀는 수행한다.

## 위험과 검증 제한

기존 계산기가 클래스 전반에 Paladin 가정을 포함한다. 상태 격리, 스킬 목록, 허용 IAS, 광신 차단, 결과/표 생성 경로를 함께 바꿔야 한다. D2R 설치 파일 기준은 3.3.93847이다. 추출물에 Barbarian COF가 없으므로 COF 바이트를 직접 검증했다거나 게임 내 실제 타격을 측정했다고 주장하지 않는다. 공개 D2R breakpoint 페이지의 `BAA11HS` 애니메이션 및 1HS WSM 0 표, 로컬 무기 데이터의 `crs` 1hs/빈 speed(기존 IAS 원장에서는 0으로 resolved)를 조합 독립 검증의 범위로 삼는다. 이 근거가 교차 검증에 충분하지 않거나 Golden 비교가 실패하면 계산은 차단되고 배포하지 않는다.

## 검증 계획

53개 baseline을 보존하고 Barbarian formula/Golden/support/UI 테스트를 추가한다. 이후 `npm run test:ias`, `npx tsc --noEmit`, `npm run lint`, `npx next build --webpack`, Playwright PC 1365×900/모바일 390×844 및 콘솔 오류 검사를 순서대로 실행한다. 모든 게이트와 원격 정합성 확인이 통과하는 경우에만 IAS 관련 파일만 staging하여 사용자 지시의 조건부 배포를 수행한다.
