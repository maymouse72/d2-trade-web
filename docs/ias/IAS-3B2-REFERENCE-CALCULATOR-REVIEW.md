# IAS-3-B-2 참고 계산기 검토

조사일: 2026-11-01 (KST). 화면과 공개 설명을 기준으로 조사했다. 공개 계산기 출력은 A2의 정답 자료로 승격하지 않았다.

| 사이트 | 버전/대상/공격 | A1/A2 및 무기/WSM | 공식·출처 계보 | 평가 |
|---|---|---|---|---|
| [D2R.org Paladin Breakpoints](https://d2r.org/tools/breakpoints/paladin) | 표시 빌드 3.3.93847, Paladin 표 | PAA11HS/A1 표 확인. PAA21HS/A2 자료는 찾지 못함. WSM별 표 | AnimData 기반 설명과 Amazon Basin 표를 통한 검증 설명. StartingFrame 안내는 일반 설명이며 A2 성기사의 개별 레코드 증명은 아님 | A1 참고 전용 |
| [Icy Veins IAS Calculator](https://www.icy-veins.com/d2/ias-calculator) | D2R 계산기, 캐릭터/폼/스킬/무기/IAS 입력 | Paladin Normal Attack을 선택할 수 있으나 A1/A2 별도 선택은 확인되지 않음 | Warren1001 및 Amazon Basin 등 공헌자를 명시. 이 자료 계보에 의존하는 독립 A2 증거로 볼 수 없음 | A1 교차 확인 후보, A2에는 미사용 |
| [diablo2.io IAS Calculator](https://diablo2.io/attackspeed.php) | 페이지 설명상 D2R 및 RotW 3.3 | 캐릭터/스킬/무기/IAS 입력. A1/A2 selector 없음 | 페이지가 Warren IAS Calculator v1.1.3의 fork라고 명시 | Warren 계열의 파생물, 독립 증거 아님 |
| [Dongaroo IAS Calculator](https://dongaroo.github.io/Diablo2-Resurrected-IAS-calculator-bar-simulator/index.html) | 공개 페이지는 접근했으나 이번 점검에서 재현 가능한 Paladin A2 조건·표·데이터 출처를 확정하지 못함 | A2에 대한 명시적 검증 가능한 증거 미확보 | 출처/애니메이션 레코드의 계보를 확인하지 못함 | NOT_AVAILABLE; A2 사용 불가 |
| [Tradia Weapon Speed Calculator](https://tradia.me/en/diablo2/weapon_speed_calculator) | build 93847 및 local data 표시 | Standard Attack (A1) 선택 확인. A2 selector 없음. 1HS와 WSM/장비 IAS 조건 설정 가능 | IEIAS/EIAS, AnimData 프레임 파라미터와 로컬 데이터 사용을 설명. 공개 화면만으로 A2 레코드의 독립 검증은 안 됨 | A1 재현 비교에 적합, A2에 사용 불가 |

## 비교 조건 및 결과

조건은 Paladin, human form, Normal Attack A1, one-handed swing, SIAS 0, 장비/무기 IAS 합산 조건, 오라 및 디버프 없음으로 맞췄다. Tradia에서 IAS 경계 표본을 확인했고 기존 A1 Golden Dataset과 모두 일치했다.

- Crystal Sword WSM 0: 경계 0/9/19/32/54/86/152에서 프레임 14/13/12/11/10/9/8. 요청된 IAS 15개 표본 모두 일치.
- Phase Blade WSM −30: 경계 0/8/24/54에서 11/10/9/8. 요청된 IAS 8개 표본 모두 일치.
- War Hammer WSM +20: 경계 0/5/10/16/24/37/52/72/109/168/317에서 18에서 8까지 한 단계씩 감소. 요청된 IAS 21개 표본 모두 일치. IAS 316은 9, 317은 8.

Icy Veins와 diablo2.io는 Warren 계산기 계보를 공유하므로 둘의 일치를 독립 검증 표본 수로 중복 집계하지 않는다. 다른 공개 도구가 A2를 명시적으로 식별하고 소스 데이터까지 공개한다는 증거는 확보하지 못했다.
