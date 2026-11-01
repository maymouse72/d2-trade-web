# D2 주고받고 — IAS-3-A 최종 보고서

작성일: 2026-11-01

## 결과

IAS 계산 엔진과 계산기 UI에 Phase Blade 및 War Hammer의 성기사 A1 검증 범위를 추가했습니다. Crystal Sword 지원과 데이터는 유지했습니다. 사용 화면은 IAS, A1, breakpoint, frame의 의미를 한국어로 풀어 쓰고, 장비 IAS 합산 방법과 무기별 검증 상한을 안내합니다.

## 검증 판정 및 경계

- Crystal Sword: 기존 VERIFIED A1 데이터 0–200 IAS, 201행 유지.
- Phase Blade: VERIFIED 성기사 인간형 A1, 0–200 IAS, 201행.
- War Hammer: VERIFIED 성기사 인간형 A1, 0–317 IAS, 318행. 316 IAS는 9프레임, 317 IAS는 8프레임, 318은 상한 밖으로 거부.
- A2, 다른 직업/공격 유형, 스킬/오라/버프 효과, 실제 타격 시점과 연속 공격 입력 주기는 이 결과로 검증되지 않습니다.

판정은 D2R 원본 `weapons.txt`, `animdata.d2`, COF 클래스 및 공격 이벤트 정보와 독립 공개 Paladin 1 Handed Swing breakpoint 표를 함께 사용했습니다. 기준표는 IAS 엔진 공식으로 자체 생성하지 않았습니다. [Amazon Basin Paladin attack speed](https://theamazonbasin.com/wiki/index.php?title=Paladin_attack_speed), 빌드 기록 교차 확인: [D2R.org Paladin breakpoints](https://d2r.org/tools/breakpoints/paladin). 원본 파일 해시는 `lib/ias/data/evidence.json`에 기록했습니다.

## 구현 및 자동 검증

주요 엔진 파일은 `lib/ias/`이며 사용자 화면은 `app/game-info/ias-calculator/`에 있습니다. 데이터셋 보고서 및 개별 검증 보고서는 같은 `docs/ias/` 폴더에 둡니다.

- IAS 자동 테스트: 19/19 PASS; 확장된 519개 PB/WHM 정수 IAS 값과 무기별 경계, 입력 상한 제한 포함.
- TypeScript: PASS.
- Lint: PASS.
- Webpack 프로덕션 빌드: PASS, 정적 라우트 12/12 생성.
- 로컬 PC 브라우저에서 Crystal Sword 0/40/152 및 201 입력 제한, Phase Blade 0/8/24/54/200 및 201 입력 제한, War Hammer 0/168/316/317과 318/319 제한을 확인했습니다. War Hammer 초과값은 직접 입력·키보드 입력·붙여넣기 모두 317로 제한됐습니다. 무기 전환 시 최대값과 표 동시 변경, +1/−1/+10 버튼, 음수·소수 입력 오류, 미지원 직업/A2 결과 차단과 용어 설명도 확인했습니다.
- 로컬에서 거래 목록, 거래 ID 16의 댓글 목록, 경험치 페이지 및 게임 정보 메뉴를 읽기 전용으로 확인했습니다.
- 연결된 브라우저 제어 API는 390×844 뷰포트 설정과 콘솔 로그 조회를 제공하지 않아 해당 항목은 미검증입니다. Production 도메인 기능 회귀와 신규 배포 후 smoke test도 실행하지 않았습니다.

## 작업 트리와 배포

기준 HEAD는 `c3f14eca4050cb3c7433fbb4099fb9cd0b89e17b` (`main`)입니다. `git fetch origin main`으로 최신 원격을 확인했고, `origin/main`도 같은 커밋이라 충돌은 없습니다. IAS-3-A 구현과 보고서는 로컬 변경 상태입니다. 기존 미커밋 IAS-2B 보고서 5개는 별도 수정 상태로 보존했으며 커밋에 넣지 않았습니다. 앞서 있었던 FETCH_HEAD 접근 오류는 sandbox에서 `.git` 내부 갱신 권한이 제한된 것이 원인이었고 권한 승인으로 fetch를 완료했습니다.

Vercel 프로젝트 `d2-trade-web-6e47`의 기존 Production 배포 `dpl_8RY8fDtvvgMT25KiNemUdgeotm33`은 READY이며, SHA는 기준 커밋 `c3f14eca4050cb3c7433fbb4099fb9cd0b89e17b`입니다. Vercel alias 응답에 `www.d2jugobatgo.com`이 이 기존 배포 alias로 열거되어 있습니다.

**최종 판정: PARTIAL / DEPLOYMENT BLOCKED. Commit: 없음. Push: 없음. 새 Production 배포: 하지 않음.** 모바일 390×844 및 브라우저 콘솔 검증이 미완료여서 배포 조건을 충족하지 못했습니다. 롤백은 수행하지 않았습니다. 수동 모바일/콘솔 확인 절차는 `IAS-3A-FINAL-DEPLOYMENT-GATE.md`에 기록했습니다.
