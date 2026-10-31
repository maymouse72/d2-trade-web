# IAS-2B 최종 보고서

## 개발

`/game-info/ias-calculator`를 추가하고 공통 내비게이션에 링크했다. 지원 범위는 Paladin/Human/Normal/A1 reference/Crystal Sword(`crs`, WSM 0)/무스킬·무버프·무디버프/총 IAS 0~200이다. 숫자는 전체 애니메이션 프레임과 검증된 브레이크포인트 정보로 제한한다.

## 검증

- IAS/UI-model 테스트: 16/16 통과.
- Golden Dataset: 201/201 일치.
- TypeScript 및 ESLint: 통과.
- PC/390×844 모바일 및 로컬 Webpack 프로덕션 산출물: 통과.
- Turbopack 로컬 빌드: 두 차례 정체로 종료. Webpack 빌드는 통과했으며 Production Vercel 로그로 배포 빌드 방식을 확인한다.
- 운영 회귀·배포 확인 결과는 `IAS-2B-TEST-RESULTS.md`, `IAS-2B-DEPLOYMENT-REPORT.md`, `IAS-2B-PRODUCTION-SMOKE-TEST.md`에 함께 반영한다.

## 배포 상태

Git commit, push, Vercel Production 배포, 실제 도메인 smoke test 완료 후 commit/배포 ID/결과와 최종 판정을 기입한다.
