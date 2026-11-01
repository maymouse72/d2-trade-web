# IAS-3-A War Hammer 검증

## 판정

**VERIFIED — 성기사 / 인간형 / A1 / War Hammer / 총 IAS 0–317**. IAS 318 이상은 제공하지 않습니다.

## 근거

- 추출 D2R 빌드 `3.3.93847`의 `weapons.txt`에서 `whm` War Hammer는 타입 `hamm`, WSM `+20`, 무기 클래스 `1hs`입니다.
- `animdata.d2`의 성기사 `PAA11HS`/`PAA21HS`는 FPD 15, speed 256이며 A1 Attack 이벤트가 확인됩니다. COF의 공격 무기 레이어도 `1hs`입니다. 원본 파일 해시는 `data/evidence.json` 참조.
- 공개 Paladin 1 Handed Swing 표 WSM +20 행의 임계값은 `[0, 5, 10, 16, 24, 37, 52, 72, 109, 168, 317]`; 전체 프레임은 `[18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8]`입니다.
- 공개 임계표를 독립 정답으로 삼아 정수 IAS 0–317을 318개 행으로 확장, 엔진 결과를 행별 대조했습니다. 공식식의 자체 재실행을 독립 검증으로 취급하지 않았습니다.
- WSM +20의 마지막 공개 경계에서 IAS 316은 9프레임, 317은 8프레임입니다. 318은 데이터셋 바깥이며 입력 검증에서 거부됩니다.

참고: [Amazon Basin Paladin attack speed](https://theamazonbasin.com/wiki/index.php?title=Paladin_attack_speed), [D2R.org Paladin breakpoints](https://d2r.org/tools/breakpoints/paladin).

## 데이터셋

`lib/ias/data/paladin-whm-a1-golden.json`: 318행, SHA-256 `6014cdb7559e965d97d714ccb7d1671947bd2cf3680ab08911d1202401fca8c0`.

A2, 기술 속도, 버프/오라, IAS 318 이상, 타격 판정 및 연속입력 주기는 판정하지 않았습니다.
