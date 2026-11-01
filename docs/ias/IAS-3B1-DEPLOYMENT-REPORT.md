# IAS-3-B-1 배포 게이트 보고서

작성일: 2026-11-01 (KST)

## 로컬 검증 상태

- IAS 자동 테스트: 19/19 PASS
- A1 Golden Dataset: Crystal Sword 201 + Phase Blade 201 + War Hammer 318 = 720행 유지
- A2 지원 정책: 세 무기 UNVERIFIED, 계산 숫자/브레이크포인트 차단 테스트 PASS
- TypeScript: `npx tsc --noEmit` PASS
- ESLint: `npm run lint` PASS, 종료 코드 0
- Webpack 빌드: `npx next build --webpack` PASS, 12개 경로 생성
- PC 및 모바일 브라우저: [IAS-3B1-BROWSER-TEST-RESULTS.md](./IAS-3B1-BROWSER-TEST-RESULTS.md) PASS
- 서비스 회귀: [IAS-3B1-REGRESSION-RESULTS.md](./IAS-3B1-REGRESSION-RESULTS.md) PASS

## Production 배포 및 운영 검증

IAS-3-B 커밋 `9693343859f8318382a35f1522f25f58afb8cfc6`를 origin/main에 push했고 자동 Production 배포 `dpl_5QN7npzeqeSvwDRpMy3yDbsDM65j`가 READY가 됐다. 배포 URL은 `https://d2-trade-web-6e47-q19a9v3ds-9904.vercel.app`이며 alias 목록에 `www.d2jugobatgo.com`과 apex가 포함되고 aliasError는 없었다. Vercel project 조회와 도메인 목록에서 `www.d2jugobatgo.com`은 verified production domain으로 확인했다.

운영 PC 브라우저에서 계산기와 회귀 경로를 확인했다. Crystal Sword IAS 40은 11프레임, Phase Blade IAS 54는 8프레임, War Hammer IAS 316은 9프레임, IAS 317은 8프레임이었다. War Hammer IAS 318 직접 입력은 317로 제한됐다. War Hammer A2는 독립 검증 안내를 보이고 결과 숫자와 기준표 행을 표시하지 않았다. IAS 페이지 console logs(error/warn)는 비어 있었다.

운영 거래 목록은 카드 4건을 표시했고 `/trade/16` 상세 및 기존 댓글 1건을 읽었다. 경험치 페이지와 `/runewords`, `/uniques`, `/sets`도 렌더링됐다. 댓글 작성이나 거래/DB 변경은 하지 않았다.

모바일 390×844는 로컬 브라우저에서 반응형 화면을 검증했다([브라우저 결과](./IAS-3B1-BROWSER-TEST-RESULTS.md)). 운영 데스크톱 브라우저에서 모바일 viewport override가 적용됐다고 확인할 수 없어, Production 모바일 실측은 미확인으로 구분한다.

Git fetch는 최초 샌드박스 권한 오류 후 승인된 로컬 실행에서 성공했다. origin/main과 HEAD는 커밋 전 동일한 `c47e03214bb6fe7859c3f7eb017c5a936575b977`였다. 기존 IAS-2B/3A 보고서 변경은 커밋에서 제외했다.

| 항목 | 결과 |
|---|---|
| IAS-3-B 커밋 | `9693343859f8318382a35f1522f25f58afb8cfc6` |
| Production deployment ID | `dpl_5QN7npzeqeSvwDRpMy3yDbsDM65j` |
| Production READY / 도메인 | PASS — READY, `www.d2jugobatgo.com` verified alias |
| 운영 스모크 테스트 | PASS — desktop IAS 계산/A2 차단, 거래 목록·상세·댓글·경험치·도감 |
| Production 모바일 viewport | 미확인; 로컬 390×844 검증은 PASS |

## 최종 판정

**IAS-3-B-1: PASS / DEPLOYED.** 필수 로컬 PC·모바일 검증, 자동 검사, 빌드, 기능 회귀, Production READY 및 운영 데스크톱 smoke test를 통과했다. A2 결과 차단은 유지된다.

**IAS-3-B-2: RESEARCH COMPLETE.** A2 독립 검증 근거는 미확보이며, 세 무기 상태는 UNVERIFIED다.

## 범위 제한

IAS-3-B-2는 조사 및 검증 계획만 포함한다. A2 계산 엔진 활성화, DB/인증/PWA/Push/운영 환경 설정 변경은 수행하지 않는다.
