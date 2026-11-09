# IAS-5C3 External Calculator Review

확인일: 2026-11-09. 공개 페이지의 사용자 인터페이스를 읽기 전용으로 확인했다. 사이트 코드와 UI는 복제하지 않았다.

| Source | 관측 정보 | 독립성/제약 |
|---|---|---|
| [TrAdia](https://tradia.me/en/diablo2/weapon_speed_calculator) | D2R 데이터 build 93847, 직업·형태·무기·스킬·IAS 입력, 프레임 및 breakpoint 표시. 수동 입력 표본으로 사용 | 페이지 설명 자체가 일부 기술/계산 기준을 외부 참조에 의존한다고 알림. 인게임 측정값은 아님 |
| [Warren1001](https://warren1001.github.io/IAS_Calculator/) | UI에서 D2R 3.3 / v1.2.6, Barbarian Standard, 무기 WSM 및 전체 breakpoint 표 관측 | 공개 변경 이력에 breakpoint/rounding 보완 및 인게임 수정이 기록됨. Issues #38/#42는 Whirlwind 조합/정확도 우려를 보고함 |
| [Icy Veins](https://www.icy-veins.com/d2/ias-calculator) | 비교 후보 확인 | Warren1001 기반으로 크레딧되어 독립 계산기로 세지 않음 |
| [Amazon Basin Barbarian attack speed](https://www.theamazonbasin.com/wiki/index.php/Barbarian_attack_speed) | Barbarian 2HS 표 및 일반 계산 설명 | 레거시 자료로 D2R 빌드 검증을 대체하지 않음 |
| [Amazon Basin Two weapons](https://theamazonbasin.com/wiki/index.php/Two_weapons) | 손/장착 순서의 배경 규칙 | 오래된 동작이 현재 패치에 그대로 적용된다고 가정하지 않음 |
| [Amazon Basin Whirlwind](https://theamazonbasin.com/wiki/index.php/Whirlwind) | 과거 WW 타격 간격 설명 | 레거시 규칙은 현재 D2R에 적용하지 않음 |
| [Blizzard 2.4.3 notes](https://news.blizzard.com/en-us/article/23814050/diablo-ii-resurrected-patch-2-4-3-now-live) | D2R Whirlwind가 장비 IAS를 반영하고 쌍수 프레임 처리 변경 | 공식 패치 설명, 특정 무기 조합의 완전한 golden 표는 아님 |

Warren 저장소의 공개 코드/변경 이력은 조사에만 사용했다. 이번 변경에는 외부 소스 코드가 포함되지 않았다. 확인한 공개 저장소 화면과 페이지에서 명확한 재사용 라이선스를 찾지 못해 코드를 재사용하지 않았다. 사이트 약관 역시 이번 확인 범위에서 명확히 확인하지 못했다. 접근 제한을 우회하지 않았다.

이용한 비교 계산기 계열은 TrAdia 및 Warren1001 두 개다. Icy Veins는 Warren 계열이라 세 번째 독립 근거로 계산하지 않는다. 모든 UI 결과는 계산기 출력 관측이며 인게임 타격 실측이 아니다.
