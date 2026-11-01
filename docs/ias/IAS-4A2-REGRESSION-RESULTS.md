# IAS-4-A-2 기존 서비스 회귀 결과

## 운영 Production 기준선 (배포 전, 읽기 전용)
`https://www.d2jugobatgo.com` 대상 Vercel fetch에서 홈페이지, `/game-info`, `/game-info/experience`, `/runewords`, `/uniques`, `/sets`, `/game-info/ias-calculator`가 HTTP 200을 반환했다. Production 브라우저에서 헤더 메뉴와 경험치·공속 메뉴 링크를 확인했다. 이 배포 전 기준선은 IAS-4-A-2 새 코드를 포함하지 않는다.

## 새 코드 로컬 확인
Webpack Production build에서 공통 헤더, 주요 메뉴와 게임 정보 하위 메뉴를 확인했다. 운영 거래 데이터에 테스트 레코드를 쓰지 않았다.

## 남은 운영 회귀 확인
새 배포 후 홈페이지/거래 목록, 샘플 거래 상세와 기존 댓글 조회, 경험치 정보, 게임 정보/공속 계산기 이동, 룬워드·유니크·세트 도감을 읽기 전용으로 확인하고 결과를 갱신한다. 운영 DB/계정/댓글 변경은 금지한다.
