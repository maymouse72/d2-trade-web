# IAS-5-A 다중 직업 계산 구조

## 적용 구조

지원 입력은 직업별 스킬 레지스트리(`lib/ias/class-registry.ts`)에서 판별하며, 지원 조합은 직업·스킬·무기·애니메이션·보정 조건으로 제한한다. 기존 Paladin 스킬 레지스트리와 엔진을 그대로 두고 `calculate.ts`에서 Barbarian 전용 경로를 분기한다. 계산 컨텍스트의 현재 모델은 기존 `NormalizedIASInput`을 재사용하고, 직업별 레지스트리는 `weaponSlot`, 애니메이션 클래스, 지원 IAS 범위, 근거 상태를 별도로 제공한다.

7개 직업 목록은 `IAS_SUPPORTED_CLASSES`에 명시됐다. 현 계산기는 대상 외 WARLOCK 옵션도 기존 호환을 위해 남겨두고 미지원 상태로 처리한다. 현재 활성 검증 범위는 Paladin 기존 기능과 Barbarian 일반 공격 1조합이다. Amazon, Assassin, Druid, Necromancer, Sorceress는 목록에 있어도 결과를 차단한다.

직업 변경 시 스킬, 애니메이션, 무기 IAS, 장비 IAS, 광신을 초기화한다. Barbarian UI에서는 광신 제어가 표시되지 않고 계산 정책도 광신/기타 버프를 차단한다. 무기 검색·한국어 이름·카테고리 필터는 기존 카탈로그를 재사용한다.

## 확장 경계

주/보조 무기 슬롯을 컨텍스트로 표현하되 offhand, dual wield, 변신, 특수 스킬 계산은 구현하지 않았다. 미구현 직업의 엔진은 자동으로 Paladin 공식을 적용하지 않는다.
