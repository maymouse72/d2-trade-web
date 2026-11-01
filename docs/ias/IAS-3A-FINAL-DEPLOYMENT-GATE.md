# IAS-3-A 최종 배포 게이트 결과

날짜: 2026-11-01

## 판정: 검증 통과 — 배포 진행 중

필수 자동 검증은 통과했습니다. IAS 테스트 19/19, TypeScript, lint, Webpack production build 모두 PASS입니다. `origin/main` fetch 후 원격 HEAD는 작업 기준과 같은 `c3f14eca4050cb3c7433fbb4099fb9cd0b89e17b`로 확인했습니다.

로컬 PC Chrome에서 수정 후 동작을 재검증했습니다. War Hammer 316은 9프레임, 317은 8프레임이며 318·319 직접 입력, 319 키보드 입력 및 붙여넣기는 모두 317로 제한됐습니다. Phase Blade와 Crystal Sword 201도 각각 200으로 제한됐고, War Hammer에서 317로 설정 후 Phase Blade로 바꿀 때 200으로 내려갔습니다. +1/−1/+10 버튼, IAS 0/168 결과, 음수·소수 입력 오류, 미지원 직업/A2 결과 차단, 무기별 기준표 갱신도 확인했습니다.

기존 기능은 로컬 Production 빌드에서 거래 목록, 거래 상세 및 댓글이 표시되는 매물 ID 16, 경험치 정보 화면과 게임 정보 메뉴 링크를 읽기 전용으로 확인했습니다. 운영 도메인에서는 회귀 검수를 수행하지 않았습니다.

PC는 일반 데스크톱 뷰포트에서 검증했습니다. 연결된 Chrome의 공식 browser capability API에서 viewport override와 탭 콘솔 로그 기능을 확인해 390×844 검사를 완료했습니다. `innerWidth=390`, `innerHeight=844`, 문서 `scrollWidth=375`, `clientWidth=375`로 가로 넘침은 없었습니다. 모바일에서 무기 선택, IAS 직접 입력, +1/−1 버튼, 계산 결과 및 브레이크포인트 표를 확인했습니다. War Hammer 316/317은 각각 9/8프레임이며 Phase Blade의 최대 입력 상한은 200입니다. Console error/warning은 0건입니다.

## Vercel 현재 상태

- 프로젝트: `d2-trade-web-6e47` (`prj_kiBEIv1IOSotE8DlHwIvtVyMNQ4f`)
- 기존 Production: READY, `dpl_8RY8fDtvvgMT25KiNemUdgeotm33`
- 기존 Production 소스: `c3f14eca4050cb3c7433fbb4099fb9cd0b89e17b`
- Vercel alias 목록에는 `www.d2jugobatgo.com`이 기존 Production deployment의 alias로 표시됨.
- IAS-3-A 변경은 아래 검증을 통과해 commit/push 및 Production 배포를 진행합니다.
- 신규 Production 배포와 운영 스모크 테스트는 아직 대기 중입니다.
- Rollback 없음.

PC·모바일 및 브라우저 콘솔 필수 검증을 통과했습니다. 자동 검증도 모두 통과했고 `origin/main`은 기준 HEAD와 일치합니다. IAS-3-A 관련 파일만 commit/push하며, 신규 Production READY와 운영 URL 스모크 테스트 결과를 확인한 뒤 이 보고서의 최종 상태를 기록합니다.

## 사용자 수동 확인 절차

390×844 Chrome viewport에서 확인한 측정값: `innerWidth=390`, `innerHeight=844`, `documentElement.scrollWidth=375`, `clientWidth=375`, 가로 overflow 없음. 계산 동작 후 Chrome 탭 콘솔 error/warning 0건.
