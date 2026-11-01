# IAS-4A-1 — Golden Dataset 등록 준비 판정

**판정: IAS-4-A-2에서 기술별 후보 데이터 생성 가능; 현재 저장소 등록/운영 지원은 미승인 상태.**

## 보존 상태

기존 Golden 파일은 다음을 유지한다.

- `paladin-crs-a1-golden.json`: 201 IAS 행, WSM 0, 상한 200.
- `paladin-7cr-a1-golden.json`: 201 IAS 행, WSM -30, 상한 200.
- `paladin-whm-a1-golden.json`: 318 IAS 행, WSM +20, 상한 317.
- 총 720행. IAS-4-A-1에서 파일을 변경하거나 새 기술별 행을 추가하지 않았다.

## 후속 등록 제안

IAS-4-A-2에서 별도 스킬 식별자를 가진 Sacrifice, Vengeance, Conversion 고정 벡터를 세 무기별로 생성한다. 초기 candidate 기대 프레임은 기존 A1 Golden의 동일 IAS 행을 참조한다. 검증은 경계 전/경계/경계 후 및 전체 범위를 자동 비교하고, 잘못된 상한 입력, 무기 전환, A1 선택 유지, A2 차단을 포함해야 한다.

원본 레코드, 빌드, SHA, WSM, 수식 버전, 유효 범위를 데이터 메타데이터로 남긴다. 외부 계산기에서 세 기술을 개별적으로 분리 선택할 수 없었으므로 동일한 공통 결과라는 사실을 명시하고, 이를 게임 측정 증거로 표기하지 않는다.

## 승인 범위

IAS-4-A-1은 조사 문서만 추가한다. 운영 코드/테스트/기존 Golden 변경, Git commit/push, 배포, 데이터베이스, Vercel 설정, PWA/Push 설정은 수행하지 않았다. `IAS-4A-ENGINE-CHANGES.md` 등 앞선 IAS-4-A 미커밋 작업물은 기존 사용자 변경으로 보존했다.