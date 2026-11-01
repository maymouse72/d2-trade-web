# IAS-4-A-2 자동 테스트 결과

- `npm run test:ias`: PASS, 26/26 (신규 전체 2,160행 검증 포함)
- `npx tsc --noEmit`: PASS
- `npm run lint`: PASS
- `npx next build --webpack`: PASS (Next.js 16.4.3)
- 기존 Golden 720행: 보존
- 기술 파생 Golden: 9그룹/2,160행 전부 일치
- War Hammer IAS 316→9프레임, 317→8프레임, 318 입력→상한 317 적용: 브라우저 확인

Node가 테스트 파일을 ES module로 재해석한다는 경고는 출력되었으나 테스트 실패나 린트 오류는 없었다. Turbopack은 이번 게이트 조건이 아니며 기존 정체 문제를 별도 항목으로 유지한다.
