# D2 주고받고 — IAS-4-A-1 최종 보고

## 최종 판정: PASS — 범위 제한된 A1 애니메이션 후보 검증

요청된 원본 탐색과 누락 표의 선택 추출을 완료했다. 설치된 D2R 3.3.93847에서 `skills.txt`, `skilldesc.txt`, `plrmode.txt`만 CASCConsole로 로컬 추출했다. Sacrifice(Id 96), Vengeance(Id 111), Conversion(Id 116)는 모두 `anim=A1`, `seqtrans=A1`, `UseAttackRate=1`이며 Paladin 기술로 확인했다. Conversion의 공격 속도 비율 값은 0이다. Vengeance의 피해 계산식은 IAS 필드로 해석하지 않았다.

이 정확한 레코드와 D2R.org의 기술별 무기 공격 설명, Tradia의 공통 기술 옵션 결과, 프로젝트의 기존 A1 Golden 720행은 Paladin 인간형 한손 단일 무기 일반 A1 단타의 프레임 후보가 기존 A1 모델과 일치함을 뒷받침한다. 비교 경계의 결과는 Crystal Sword 9 IAS→13f/152→8f, Phase Blade 8→10f/24→9f/54→8f, War Hammer 168→9f/317→8f였다.

## 수행 및 변경 범위

- 대상 설치 빌드/브랜치: 3.3.93847 / `kr`.
- 원본 표 SHA-256과 재현 명령: `IAS-4A1-DATA-DISCOVERY.md`.
- 기술 레코드·표시 키: `IAS-4A1-SKILL-RAW-RECORDS.md`.
- 애니메이션 적용 범위: `IAS-4A1-ANIMATION-MAPPING.md`.
- 산식/경계값: `IAS-4A1-FORMULA-VALIDATION.md` 및 `IAS-4A1-REFERENCE-COMPARISON.csv`.
- 증거 등급과 한계: `IAS-4A1-EVIDENCE-MATRIX.md`.
- 기존 720 Golden 행을 그대로 두고 신규 데이터는 등록하지 않았다. 후속 등록 준비는 `IAS-4A1-GOLDEN-READINESS.md`.
- 이번 IAS-4-A-1 문서 8개 외에는 작업하지 않았다. 기존 IAS-4-A 변경/미커밋 파일도 건드리지 않았다.
- 커밋, push, 배포 없음.

## 한계와 다음 단계

실제 게임 내 프레임 캡처(E4)는 수행하지 않았다. Tradia는 세 기술을 하나의 선택지로 묶기 때문에 스킬별 결과를 분리 검증하지 않으며, 커뮤니티 계산기의 코드 계보 독립성도 완전히 감사하지 않았다. 이에 따라 PASS는 명시된 A1 일반 단타 범위에만 적용되는 candidate 검증이며, 런타임 전체·A2·Zeal·Smite·쌍수·중단/반복 공격 검증을 의미하지 않는다.

IAS-4-A-2에서 별도 기술별 고정 Golden 벡터와 자동 검증을 만들고, UI/API 지원을 구현·검토하기 전까지 운영 기능으로 간주하지 않는다. 기존 A1 Golden Dataset 720행, A2의 UNVERIFIED 상태, Git 브랜치/이력은 유지된다.