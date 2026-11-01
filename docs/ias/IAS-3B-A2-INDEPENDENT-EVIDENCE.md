# IAS-3-B A2 독립 근거 검토

## 결과

검토 결과 기준 빌드 `3.3.93847`에서 Paladin 일반 공격 A2를 명시적으로 식별하고, 무기별 WSM과 IAS 경계의 전체 애니메이션 프레임을 독립 제시하는 자료나 재현 가능한 게임 측정은 확보하지 못했다. 세 무기 모두 A2 상태는 `UNVERIFIED`다.

## 검토 자료와 한계

| 자료 | 무엇을 뒷받침하는가 | 왜 A2 VERIFIED 근거가 아닌가 |
|---|---|---|
| [D2R.org Paladin Breakpoints](https://d2r.org/tools/breakpoints/paladin) | Paladin breakpoint 계산과 시작 프레임 규칙에 관한 참고자료. 표는 `PAA11HS` / A1로 명시됨 | A2 테이블이 아니며 A2 전용 WSM별 프레임 결과를 싣지 않음 |
| [91D2 공격속도 안내](https://bbs.91d2.cn/read-htm-tid-1519325.html?_d_id=dfcb8e671bd2a74f3509465993e6d1) | 구형 커뮤니티 자료에서 A1/A2 선택 및 시작 프레임에 관한 주장 확인 | 2019년 자료로 기준 D2R 빌드·무기별 독립표·실측 절차를 제공하지 않음 |
| [Mannm Frames and Animations](https://www.mannm.org/d2library/faqtoids/frames_eng.html) | A2가 캐릭터에게 어떤 의미인지에 관한 구형 기술 설명 | 구형 레거시 자료이며 위 커뮤니티 자료와 A2 사용 설명이 상충함. D2R 기준 런타임 증명이 아님 |
| [D2JSP Action Frames 토론](https://forums.d2jsp.org/topic.php?f=87&t=80560872) | A1/A2 무작위 선택 주장을 포함한 커뮤니티 토론 | 독립 실험·게임 빌드·재현 데이터가 없는 토론 글 |

자료 간 A2 사용 설명이 서로 모순되며, 어느 것도 D2R 3.3.93847에서의 런타임 규칙을 확정하지 못한다. StartingFrame=0을 언급하는 외부 자료는 계산 가정의 참고자료로만 남기며 직접 검증으로 승격하지 않는다.

## 무기별 판정

| 무기 | A2 상태 | 근거 |
|---|---|---|
| Crystal Sword (`crs`, WSM 0) | UNVERIFIED | 공개 기준표는 A1/PAA11HS이며 A2 전용표 없음 |
| Phase Blade (`7cr`, WSM -30) | UNVERIFIED | A2 전용 D2R WSM -30 독립표 또는 실측 없음 |
| War Hammer (`whm`, WSM +20) | UNVERIFIED | A2 전용 D2R WSM +20 독립표 또는 실측 없음 |

기존 A1 표를 A2 기대값으로 복사하지 않았다. 동일 원본 필드에 동일 공식을 넣어 얻는 표의 일치는 독립 검증이 아니므로 Golden Dataset 승격 근거로 사용하지 않았다.

## VERIFIED 승격에 필요한 증거

Paladin 인간형 일반 공격 A2임을 확인할 수 있고, D2R 빌드가 명시된 재현 가능한 게임 측정 또는 A2라고 명시된 독립 자료가 필요하다. 각 무기별 IAS 구간과 프레임 전체 길이, breakpoint 직전·직후 표본, 측정 단위(게임 25Hz frame)가 포함돼야 한다.
