# IAS-3-B-1 기존 기능 회귀 결과

검증일: 2026-11-01 (KST)
환경: 로컬 Chrome, 읽기 전용 탐색

| 기능 | 확인 결과 | 판정 |
|---|---|---|
| 거래 목록 `/` | 목록과 거래 카드 렌더링 | PASS |
| 거래 상세 `/trade/18`, `/trade/17`, `/trade/16`, `/trade/15` | 상세 화면 로드 | PASS |
| 기존 댓글 조회 | `/trade/16`에 기존 댓글 1건 표시, 나머지 열람한 상세에는 0건 | PASS |
| 게임 정보 `/game-info` | 경험치 정보로 이동 | PASS |
| 경험치 `/game-info/experience` | 제목과 정보 화면 로드 | PASS |
| IAS `/game-info/ias-calculator` | 계산기 로드 및 PC/모바일 검증 | PASS |
| 기타 주요 페이지 | `/runewords`, `/uniques`, `/sets` 로드 | PASS |

거래, 댓글, 계정 및 DB에는 쓰기 동작을 수행하지 않았다. IAS 페이지 자체의 콘솔 error/warning은 없었다. 사이트의 여러 페이지를 열 때 Supabase GoTrueClient 중복 인스턴스 경고와 uniques/sets 이미지 비율 경고가 관찰됐다. 이는 기존 유지보수 항목으로 분리하며 이번 IAS 변경과의 인과관계는 확인되지 않았다.
