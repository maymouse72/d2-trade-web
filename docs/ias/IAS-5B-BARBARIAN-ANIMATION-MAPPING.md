# IAS-5-B 야만용사 애니메이션 매핑

| 입력 조합 | 값 | 근거 | 상태 |
|---|---|---|---|
| 직업/형태 | Barbarian / Human | D2R.org Barbarian 표 | VERIFIED |
| 공격 | Normal Attack | 일반 공격, 외부 스킬 속도 보정 0 | VERIFIED |
| 모드 | A1 | D2R `plrmode.txt`의 Attack1 모드 | VERIFIED |
| 무기 분류 | 1hs one-handed swing | `weapons.txt`의 `crs` wclass와 공개 breakpoint 표 분류 | VERIFIED, 해당 조합 한정 |
| 애니메이션 클래스 | BAA11HS | 공개 build 3.3.93847 표에 표시 | VERIFIED |
| FPD / speed | 16 / 256 | 공개 표의 BAA11HS 레코드 | VERIFIED |
| StartingFrame | 0 | WSM 0 표 IAS 0→15f를 공개 계산식에 대입하면 일치 | 공개 표를 이용한 추론, COF 미검증 |
| WSM | 0 | 기존 `crs` 원장과 독립 WSM 0 표 | 기존 원장 + 공개 기준 일치 |
| weaponSlot | main | 단일 무기 범위 | VERIFIED |

특수 모드, 양손 공격, 쌍수, 오프핸드, 스킬 공격 이벤트는 이번 구현에서 제외했다.
