# IAS-4-A-2 배포 보고

## 배포 결과
- Git 커밋: `67c0b2cd308058ebfa82dd7165334f9dd1888320` (`feat(ias): support verified Paladin A1 skills`)
- 원격: `origin/main` push 성공
- Vercel 프로젝트: `d2-trade-web-6e47`
- Production 배포: `dpl_7GTHWiCNWvokAmq33yqktMkkgCRA`
- 상태: READY
- 도메인: `www.d2jugobatgo.com` Production alias 연결 확인
- 배포 빌드: Vercel Next.js 16.4.3 Turbopack 빌드 완료; 로컬 필수 Webpack 빌드도 통과
- 롤백: 미실시

## 운영 스모크 테스트
새 운영 IAS 페이지에서 세 무기와 세 지원 스킬을 확인했다. War Hammer 316→9프레임, 317→8프레임, 318을 직접 입력하면 317로 제한됐다. 결과·기준표와 한국어 설명이 렌더링되고 IAS 페이지 브라우저 콘솔 로그는 비어 있었다. `/`, `/trade/18`, `/game-info`, `/game-info/experience`, `/runewords`, `/uniques`, `/sets`는 HTTP 200. 거래 목록 카드와 상세·댓글 상태는 읽기 전용으로 확인했다.

모바일 390×844 및 모바일 콘솔은 로컬에서 최종 Production build를 대상으로 검증했다. 상세는 `IAS-4A2-BROWSER-TEST-RESULTS.md`와 `IAS-4A2-REGRESSION-RESULTS.md` 참고.
