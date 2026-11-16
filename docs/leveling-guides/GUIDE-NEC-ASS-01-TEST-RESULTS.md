# GUIDE-NEC-ASS-01 — 테스트 결과

## 자동 검사

- `npm run test:guides`: PASS, 5/5. 포인트 총합, 랭크 상한, 요구 레벨·선행 기술, 미완료 퀘스트 fallback, 암살자 단계별 배분을 확인.
- `npm run test:items`: PASS, 13/13. 도감 ID·데이터 및 변형 회귀.
- `npm run test:guides:browser`: PASS, 6/6. PC와 모바일 390×844에서 디렉터리 검색, 기존 두 공략 회귀, 신규 두 페이지, 체크리스트, 목차 앵커, 화면 넘침, 콘솔 오류 및 잎새 도감 링크 확인.
- 운영 `https://www.d2jugobatgo.com`의 같은 브라우저 스모크 테스트: PASS, PC·모바일 합계 6/6. 신규·기존 공략, 검색, 체크리스트, 목차 앵커, 도감 링크와 콘솔을 확인.
- `npm run test:items:browser`: PASS, 6/6. 룬워드·유니크·세트 도감 PC/모바일 및 내부 ID 링크 회귀.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS.
- `npx next build --webpack`: PASS. 17개 경로 정적 생성, 강령술사·암살자 정적 페이지 포함.

## 실행 메모

기본 sandbox 실행에서는 `.next` 프리렌더 폴더 생성 시 Windows `EPERM`이 발생했지만, 승인된 실행 권한으로 동일한 Webpack 빌드를 재실행해 성공했습니다. 최초 브라우저 시도는 기존 4173 서버를 재사용하는 바람에 구버전 화면을 읽었습니다. 새 빌드를 별도 4175 포트에서 재검증했으며 최종 테스트는 통과했습니다. 두 Playwright 명령을 동시에 돌린 경우 공유 artifact 출력 파일 충돌이 있었고, 각각 단독 재실행해 모두 통과했습니다.

Node는 테스트 파일을 ES module로 다시 분석한다는 성능 안내를 표시했으나 실패나 테스트 오류는 아닙니다.
