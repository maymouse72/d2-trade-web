# IAS-5-C-1 야만용사 일반 공격 애니메이션 매핑

## 원본 레코드

| 자료 | A1 | A2 | 결과 |
|---|---|---|---|
| AnimData name | `BAA11HS` | `BAA21HS` | A1/A2 구분 |
| `animdata.d2` bucket / byte offset | 193 / 383,496 | 194 / 383,660 | 레코드 경계 검증 |
| FPD | 16 | 16 | 원본 값 |
| AnimationSpeed | 256 | 256 | 원본 값 |
| nonzero event | slot 7 / raw 1 | slot 7 / raw 1 | Attack code |
| COF layers/FPD/directions | 9 / 16 / 16 | 9 / 16 / 16 | 원본 헤더 |
| COF weapon class | 각 layer `1hs` | 각 layer `1hs` | 해당 mode resource |

`plrmode.txt`의 A1/A2 토큰은 Attack1/Attack2다. `weapons.txt`의 후보 무기는 각각 `wclass=1hs`다. 따라서 현재 UI의 일반 공격 A1 조합은 `BAA11HS` COF/AnimData를 사용한다. A2 리소스는 식별하고 조사했지만 UI에서 지원하지 않는다.

## 계산 프로파일

[Amazon Basin Barbarian attack speed](https://www.theamazonbasin.com/wiki/index.php/Barbarian_attack_speed)의 1 Handed Swing 표는 `FrameDataActionFlag=7`, FPD 16, speed 256, StartingFrame 0, Rollback 0을 표시한다. [D2R.org Barbarian breakpoints](https://d2r.org/tools/breakpoints/barbarian)는 build 3.3.93847 `BAA11HS`를 16 frames per direction/speed 256으로 제시하고, 기준표 rows가 원본 AnimData에서 재현된다고 설명한다. COF/AnimData slot 7 event 및 이 기준과 일치한다. WeaponSpeedModifier는 개별 weapon 원본 speed를 사용한다. Dual wield, 1HT, 1SS, 양손, throw, bow, A2는 이 프로파일에서 제외한다.
