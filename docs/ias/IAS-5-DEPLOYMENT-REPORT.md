# IAS-5 배포 보고서

- 기준 원격 HEAD: `591577c2ec7e87b7877a6efcd827097107827bc9`
- 기존 작업 전 사용자 변경: 7개 IAS-2B/IAS-3A 보고서와 untracked `debug.log`; 보존/제외.
- 자동 테스트 57/57, TypeScript, ESLint, Webpack Build, Playwright desktop/mobile: PASS
- IAS-5 구현 commit: `61b7d3eb2c054b9b36046be4e5b16846c0b6ff49`
- Push: `origin/main` 성공
- Vercel project: `d2-trade-web-6e47`
- Production deployment: `dpl_2hYt88xNjwGWsamFqxZ9k1vFz5Dy` — READY
- Alias: `www.d2jugobatgo.com` 연결됨, 프로젝트 도메인 verified
- IAS 운영 스모크: desktop 1365×900 및 mobile 390×844 각 PASS
- 운영 결과: IAS 0→15f, IAS 9→14f, 미검증 Phase Blade 차단, Paladin 복귀/광신 초기화 PASS; 콘솔 오류·수평 넘침 없음
- `d2jugobatgo.com` alias는 www로 308 redirect 구성.

IAS 기능 코드가 포함된 위 배포가 정상 READY이며 운영 도메인 검증과 별도 Chrome smoke test도 통과했다.
