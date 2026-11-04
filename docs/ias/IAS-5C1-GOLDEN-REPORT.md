# IAS-5-C-1 Barbarian Golden 결과

## 데이터 범위

- 기존 Crystal Sword row: 7 breakpoint rows 유지
- 신규 무기: Long Sword 6, Phase Blade 4, Military Pick 6, War Hammer 12
- Golden breakpoint 행: 총 35 (신규 28)
- 독립 기준: Amazon Basin Barbarian 1 Handed Swing WSM별 공개 IAS 표; D2R.org 3.3.93847 AnimData/formula 설명으로 build/애니메이션 교차 확인
- 원본 WSM: `weapons.txt`; 애니메이션: Barbarian COF 및 `animdata.d2`

## 검증 범위

단위 테스트는 무기별 입력 상한까지 정수 IAS 전 구간을 독립 표의 구간 결과와 대조한다. 신규 무기 입력 값은 143 + 73 + 143 + 457 = 816개다. 기존 Crystal Sword는 IAS 0–200, 201개를 재검증한다. 합계 1,017개 입력값, 35개 reference breakpoint rows. 각 breakpoint는 threshold−1/threshold를 확인한다. Expected rows는 엔진에서 생성하지 않고 고정 공개 표에서 저장한다.

기존 Paladin/Zeal/Smite/Fanaticism Golden 파일은 수정하지 않았다. 기존 Crystal Sword의 0 IAS 결과와 Paladin의 40 IAS 결과를 regression assertion으로 유지한다.

## 고정 reference breakpoint rows

| WSM | IAS 시작값 → frames |
|---:|---|
| -30 | 0→12, 5→11, 19→10, 42→9 |
| -10 | 0→14, 6→13, 16→12, 30→11, 52→10, 89→9 |
| 0 | 0→15, 9→14, 18→13, 30→12, 48→11, 75→10, 125→9 |
| +20 | 0→20, 2→19, 6→18, 11→17, 18→16, 24→15, 37→14, 50→13, 70→12, 99→11, 147→10, 250→9 |

프레임 계산 입력은 `EIAS = clamp(floor(120×IAS/(120+IAS)) − WSM, −85, 75)`, `speed = floor(256×(100+EIAS)/100)`, `frames = ceil(256×(16−0)/speed)−1`이다. 무기별 reference rows는 [Amazon Basin 표](https://www.theamazonbasin.com/wiki/index.php/Barbarian_attack_speed)와 직접 대조했다. D2R.org build 3.3.93847는 AnimData에서 산출한 표가 Amazon Basin의 class table 전 행과 맞는다고 설명한다.
