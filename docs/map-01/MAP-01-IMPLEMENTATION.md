# MAP-01 구현
게임 정보 공통 메뉴에서 /game-info/dungeon-routes로 연결한다. 기존 SiteFrame 안에서 Act 1~5와 던전을 선택한다. PC에서는 목록을 왼쪽에, 좁은 화면에서는 본문 위에 배치한다. 선택은 페이지 안에서 바뀐다.

| 파일 | 역할 |
|---|---|
| app/game-info/GameInfoNavigation.tsx | 공통 메뉴 링크 및 현재 위치 |
| app/game-info/dungeon-routes/page.tsx | 페이지와 메타데이터 |
| app/game-info/dungeon-routes/RouteGuide.tsx | 액트·던전 선택, 층별 탐색 순서, 주의사항, 참고 링크 |
| app/game-info/dungeon-routes/routes.module.css | 반응형 배치와 선택 표시 |
| lib/dungeon-routes/routes.json | 던전·보스·출발·도착 안내, 층별 방향·기준·신뢰도, 도식·출처·버전 |
| public/images/dungeon-routes/{tower,catacombs,durance,worldstone}.svg | 직접 제작한 방향 및 구간 안내 도식. 클릭하면 원본 확대 |
| tests/dungeon-routes-data.test.mjs, tests/dungeon-routes.spec.ts | 데이터 및 브라우저 검증 |
| docs/map-01/MAP-01-*.md | 구현·조사·검증·최종 보고 |
