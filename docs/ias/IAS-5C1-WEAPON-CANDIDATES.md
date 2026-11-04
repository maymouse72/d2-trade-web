# IAS-5-C-1 후보 무기 조사

## 후보 선별 방식

D2R build 3.3.93847 `weapons.txt` 306개 코드 항목과 `itemtypes.txt` 계층을 기준으로 조사했다. 원본에서 `wclass=1hs`, spawnable, 명시적 정수 WSM인 무기는 74개다. 후보 선택은 직업 제한을 추정하지 않고, 한손 휘두르기 COF와 WSM별 독립 표가 있는 WSM 열이 일치하는 무기부터 진행했다.

| 코드 | 무기 | 원본 type | 원본 WSM | wclass | A1 결과 | 결정 |
|---|---|---|---:|---|---|---|
| `crs` | Crystal Sword | `swor` | blank; IAS-5-B resolved 0 | `1hs` | `BAA11HS` | 기존 검증 유지 |
| `lsd` | Long Sword | `swor` | -10 | `1hs` | `BAA11HS` | 신규 VERIFIED |
| `7cr` | Phase Blade | `swor` | -30 | `1hs` | `BAA11HS` | 신규 VERIFIED |
| `mpi` | Military Pick | `axe` | -10 | `1hs` | `BAA11HS` | 신규 VERIFIED |
| `whm` | War Hammer | `hamm` | +20 | `1hs` | `BAA11HS` | 신규 VERIFIED |
| `hax` | Hand Axe | `axe` | blank | `1hs` | 후보 COF는 맞지만 WSM 미기재 | UNVERIFIED, 차단 |

신규 VERIFIED는 4종이며, 검·도끼·철퇴 계열을 포함하고 서로 다른 원본 WSM -30, -10, +20을 포함한다. `1hs`인 것만으로 모든 무기를 자동 승인하지 않는다. WSM 공란/표에 없는 수치/다른 weapon class는 계속 차단한다.

## IAS 최대 입력

각 무기 상한은 EIAS 75 상한에 도달하는 총 IAS 값으로 설정했다. WSM -30: 72, WSM -10: 142, WSM 0: 200, WSM +20: 456. 상한에서 프레임 개선이 이미 끝났는지는 해당 WSM의 공개 전체 breakpoint 표와 개별로 대조했다. War Hammer의 최대 프레임 전환은 250 IAS이며 250–456 구간은 9프레임을 유지한다.
