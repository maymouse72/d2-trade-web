# IAS-3-A Phase Blade 검증

## 판정

**VERIFIED — 성기사 / 인간형 / A1 / Phase Blade / 총 IAS 0–200**. 이 판정은 이 조합과 범위의 A1 전체 애니메이션 프레임에만 해당합니다.

## 근거

- 추출 D2R 빌드: `3.3.93847`.
- `weapons.txt`의 `7cr` Phase Blade: 무기 타입 `swor`, 무기 속도(WSM) `-30`, 무기 클래스 `1hs`.
- `animdata.d2`의 `PAA11HS`/`PAA21HS`: FPD 15, speed 256; A1 이벤트 슬롯 7은 Attack 코드 1.
- `paa11hs.cof`, `paa21hs.cof`: FPD 15, 공격 무기 레이어 `1hs`.
- 이 원본 파일의 SHA-256은 `data/evidence.json`에 기록했습니다.
- 독립 예상값은 기존 엔진 공식 실행 결과가 아니라 공개 Paladin 1 Handed Swing 표에서 전사한 WSM -30 구간의 프레임 임계 IAS `[0, 8, 24, 54]`, 프레임 `[11, 10, 9, 8]`입니다. 해당 구간을 정수 IAS별 201개 행으로 확장하고 엔진 결과와 대조했습니다.
- D2R.org의 빌드별 도구는 같은 빌드와 애니메이션 레코드를 제시하며 공개 클래스 표와의 대조 방법을 설명합니다.

참고: [Amazon Basin Paladin attack speed](https://theamazonbasin.com/wiki/index.php?title=Paladin_attack_speed), [D2R.org Paladin breakpoints](https://d2r.org/tools/breakpoints/paladin).

## 데이터셋

`lib/ias/data/paladin-7cr-a1-golden.json`: 201행, SHA-256 `45a22b763c7ca12b6a438dc355b3b1e2a52a6879897e4e6439f63e5068141fbb`.

기술, 오라/버프, IAS 200 초과, A2 실행 선택, 타격 판정 시점 및 연속 입력 주기는 검증 범위에 포함하지 않습니다.
