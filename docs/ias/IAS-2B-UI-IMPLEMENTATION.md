# IAS-2B UI 구현 보고서

## 경로 및 파일

- `/game-info/ias-calculator`
- `app/game-info/ias-calculator/page.tsx`
- `app/game-info/ias-calculator/IASCalculator.tsx`
- `app/game-info/ias-calculator/ias-calculator.module.css`
- `lib/ias/ui-model.ts`
- `lib/ias/__tests__/ui-model.test.ts`

## 구현

- 사이트 공통 프레임과 다크/골드 스타일을 적용하고 거래소 홈 및 내부 페이지 내비게이션에 경험치 정보와 공속 계산기 링크를 제공한다.
- 현재 UI는 직업, 무기, A1/A2 기준 애니메이션 및 총 IAS 0~200 정수 입력을 제공한다.
- `getCalculatorViewModel`을 통해 공개 IAS 엔진을 호출한다. 오직 Paladin/Human/Normal/A1 reference/Crystal Sword(`crs`, WSM 0)/수정 IAS 없음 조합만 결과를 반환한다.
- Golden Dataset에서 브레이크포인트 행을 도출하며 현재 구간을 행 색상과 “현재” 텍스트로 표시한다.
- 결과는 전체 애니메이션 프레임, 현재 및 다음 브레이크포인트, 다음 단계까지 추가 IAS로 한정한다. 마지막 구간에는 검증된 입력 범위에만 한정한 안내를 표시한다.
- `aria-live`, 연결된 label, 오류 상태, 키보드 초점 표시와 모바일 1열 레이아웃을 제공한다.

## 제한

A1은 검증된 기준 애니메이션이며 모든 일반 공격의 애니메이션 선택이나 반복 주기라고 주장하지 않는다. 실제 서버 타격 프레임, APS, DPS, A1/A2 평균값은 계산하거나 표시하지 않는다. 직업·무기·애니메이션이 지원되지 않으면 숫자 결과를 렌더링하지 않는다.
