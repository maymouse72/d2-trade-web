# IAS-3-B 엔진 및 UI 변경

## 엔진

- `types.ts`: 검증 상태와 무기별 애니메이션 증거 메타데이터 타입을 추가했다.
- `weapons.ts`: 세 무기의 A1은 기존 VERIFIED 상태를 기록하고 A2는 UNVERIFIED 근거 메모를 기록한다.
- `support-policy.ts`: A2 요청은 근거 메모와 함께 UNVERIFIED를 반환한다. 계산기는 이 상태에서 수치 필드를 null로 반환한다.
- `ui-model.ts`: A1 VERIFIED인 경우에만 breakpoint 행을 제공한다. A2에서는 빈 배열을 반환한다.

## UI

- `app/game-info/ias-calculator/IASCalculator.tsx`: A1/A2 선택 표기를 분명히 하고 A2를 “검증 중”으로 표시한다.
- A2 선택 시 독립 근거 부족 안내를 제공한다.
- 현재 공격 동작에 맞춰 결과/표 설명과 접근성 캡션을 동적으로 표시한다.
- 상단 안내는 선택한 모션의 전체 애니메이션 길이만 나타내며 런타임 선택 규칙과 평균 공격 속도를 계산하지 않는다고 설명한다.
- A2는 `UNVERIFIED`로 남기 때문에 결과 숫자와 breakpoint 표가 노출되지 않는다. A1에서 A2로 바꿔도 이전 수치가 렌더링되지 않는다.

## 자동화 테스트

- 모든 세 무기 A2가 UNVERIFIED이며 계산 숫자가 null인지 확인.
- A2 breakpoint 모델이 빈 배열인지 확인.
- A1 Golden Dataset 합계가 계속 720행인지 확인.

브라우저 직접 조작 및 기존 운영 기능 회귀는 별도의 테스트 결과 문서에 실제 수행 여부를 적는다.
