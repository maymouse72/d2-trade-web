# IAS-2B 빌드 검증

- Node.js: 프로젝트 실행기는 Node 24 계열 사용(Next가 출력한 빌드 로그 기준). Next.js 16.4.3.
- `npm run build` (Next 기본 Turbopack): 이번 단계에서 2회 시도했다. 첫 시도는 개발 서버와 겹쳤고, 이를 멈춘 뒤의 단독 재시도도 약 1분 넘게 `Creating an optimized production build ...`에서 출력/산출 진행이 확인되지 않아 종료했다. IAS-2A에서도 2분 이상 정체가 보고됐다. 이 현상을 해결하기 위한 사이트 전체 설정 변경은 하지 않았다.
- `npx next build --webpack`: 성공. Webpack 컴파일, TypeScript, 11개 정적 페이지 생성, 트레이스 수집이 끝났다.
- 새 정적 경로 `/game-info/ias-calculator`와 기존 `/game-info/experience`, 카탈로그 경로 및 동적 `/trade/[id]`가 빌드 라우트 표에 포함됐다.
- PC/모바일 화면은 개발 서버에서 확인했고 IAS 동작은 Webpack 프로덕션 산출물 서버에서 재검증했다.
- 최종 Production 배포 빌드 성공 여부는 Vercel 프로젝트 `d2-trade-web-6e47`의 로그와 READY 상태로 확인한다.
- 실행기 버전은 Node.js `v24.21.0`, npm `11.19.0`이었다. 격리 빌드 과정에서 일반 권한의 첫 Webpack 시도는 `.next/types` 생성 시 `EPERM`이 발생했고, 허용된 빌드 실행에서 같은 명령이 정상 완료됐다.
