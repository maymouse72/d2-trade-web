# IAS-5-B 야만용사 일반 공격 공식

적용 범위: Barbarian Human Normal Attack A1, `BAA11HS`, `crs` WSM 0, 무기/장비 총 IAS 0–200, skill/buff/debuff IAS와 외부 오라 없음.

```text
itemEIAS = floor(120 × IAS / (120 + IAS))
rawEIAS = itemEIAS - WSM
appliedEIAS = clamp(rawEIAS, -85, 75)
speed = floor(AnimationSpeed × (100 + appliedEIAS) / 100)
frames = ceil(256 × (FPD - StartingFrame) / speed) - 1
```

매개변수는 speed 256, FPD 16, StartingFrame 0, WSM 0이다. 외부 근거가 제시한 WSM 0 구간 경계는 IAS 0/9/18/30/48/75/125에서 각각 15/14/13/12/11/10/9프레임이다. Golden에는 이 독립 공개 기준의 7개 경계만 저장한다. 자동 테스트는 IAS 0–200 각각을 구간 표와 비교한다. 이 계산의 프레임은 전체 애니메이션 길이이며 게임 내 타격 판정 이벤트 프레임을 뜻하지 않는다.

검증 범위 상한은 기존 무기 원장의 `crs` 200 IAS다. 200 초과 값은 UI와 엔진에서 차단한다. 외부 속도 보정은 포함하지 않으며 Barbarian Fanaticism, Frenzy 및 버프 입력은 미지원이다.
