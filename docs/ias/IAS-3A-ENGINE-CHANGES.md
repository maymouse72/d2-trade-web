# IAS-3-A 엔진 변경사항

- 무기 정의에 WSM, 검증 상태, 무기별 최대 IAS를 연결: Crystal Sword `0–200`, Phase Blade `0–200`, War Hammer `0–317`.
- 성기사 인간형 A1만 지원합니다. 다른 직업/A2 및 기타 미검증 조합은 결과 수치 없이 UNVERIFIED/UNSUPPORTED 상태로 반환합니다.
- 총 IAS가 무기별 상한을 넘으면 INVALID_INPUT으로 처리합니다. War Hammer 318은 계산하지 않습니다.
- 계산기 결과, 기준 행, 전체 프레임 표는 동일한 무기별 golden 데이터에 연결됩니다.
- UI에 사용자 용어, IAS 합산 입력 예시, 무기별 범위, 증감 버튼, 검증 범위 한정 고지를 추가했습니다.

주요 구현: `lib/ias/{weapons,support-policy,breakpoints,calculate,ui-model,constants}.ts`, `app/game-info/ias-calculator/{IASCalculator.tsx,ias-calculator.module.css,page.tsx}`. 테스트: `lib/ias/__tests__/`.
