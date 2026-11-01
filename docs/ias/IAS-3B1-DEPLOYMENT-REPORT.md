# IAS-3-B-1 배포 게이트 보고서

작성일: 2026-11-01 (KST)

## 검증 상태

- IAS 자동 테스트: 19/19 PASS
- A1 Golden Dataset: Crystal Sword 201 + Phase Blade 201 + War Hammer 318 = 720행 유지
- A2 지원 정책: 세 무기 UNVERIFIED, 계산 숫자/브레이크포인트 차단 테스트 PASS
- TypeScript: `npx tsc --noEmit` PASS
- ESLint: `npm run lint` 실행 완료 (결과는 최종 실행 기록에 반영)
- Webpack 빌드: `npx next build --webpack` PASS, 12개 경로 생성
- PC 및 모바일 브라우저: [IAS-3B1-BROWSER-TEST-RESULTS.md](./IAS-3B1-BROWSER-TEST-RESULTS.md) PASS
- 서비스 회귀: [IAS-3B1-REGRESSION-RESULTS.md](./IAS-3B1-REGRESSION-RESULTS.md) PASS

## Production 기준 상태 및 다음 단계

검증 시점의 Vercel Production은 배포 `dpl_8VCd1z9AH1rYHfr7ixttkYd2Jec2`, 커밋 `c47e03214bb6fe7859c3f7eb017c5a936575b977`, 상태 READY였다. `www.d2jugobatgo.com`은 해당 프로젝트의 verified production domain이다. 이는 IAS-3-B 변경이 아직 배포됐다는 뜻은 아니다.

Git fetch는 최초 샌드박스 권한 오류 후 승인된 로컬 실행에서 성공했다. push 전 `origin/main` SHA 및 스테이징 diff를 재확인한다. 최종 커밋/배포/운영 스모크 테스트 결과는 완료 후 아래 표에 기록한다.

| 항목 | 결과 |
|---|---|
| IAS-3-B 커밋 | 대기 |
| Production deployment ID | 대기 |
| Production READY / 도메인 | 대기 |
| 운영 스모크 테스트 | 대기 |

## 범위 제한

IAS-3-B-2는 조사 및 검증 계획만 포함한다. A2 계산 엔진 활성화, DB/인증/PWA/Push/운영 환경 설정 변경은 수행하지 않는다.
