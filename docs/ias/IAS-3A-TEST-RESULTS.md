# IAS-3-A 검증 결과

실행 환경: Next.js 16.4.3, 2026-11-01.

| 검사 | 결과 |
|---|---|
| `npm run test:ias` | 통과: 19 tests, 실패 0. golden 데이터 519개 정수 IAS 행과 경계 및 입력 상한 검증 포함 |
| `npx tsc --noEmit` | 통과 |
| `npm run lint` | 통과 |
| `npx next build --webpack` | 통과: 컴파일, TypeScript, 정적 페이지 12/12 생성. IAS 계산기 및 기존 라우트 포함 |
| Turbopack 프로덕션 빌드 | 실행하지 않음. 기존 정체 이력에 따라 Webpack 사용 |

최종 실행에서 IAS 테스트 19/19, TypeScript, ESLint, Webpack Production 빌드가 모두 통과했습니다. 첫 sandbox 빌드의 `.next` 디렉터리 생성이 EPERM으로 차단됐지만, 권한 확인 후 승인된 로컬 빌드로 성공했습니다.

로컬 PC 브라우저에서 Crystal Sword 0/40/152와 201 입력 제한, Phase Blade 0/8/24/54/200과 201 입력 제한을 확인했습니다. War Hammer 0/168/316/317 결과도 확인했으며, 316은 9프레임, 317은 8프레임입니다. War Hammer 318/319는 직접 입력·키보드 입력·붙여넣기 모두 317로 제한됐습니다. 무기 변경 시 입력 상한과 브레이크포인트 표가 함께 갱신됐습니다. +1/−1/+10 버튼, 음수·소수 입력 오류, 미지원 직업 및 A2 결과 차단도 확인했습니다.

기존 기능은 로컬에서 거래 목록, 거래 상세 `/trade/16`의 댓글 1건, 경험치 페이지, 게임 정보 메뉴를 읽기 전용으로 확인했습니다.

Chrome의 공식 browser capability API를 사용해 로컬 Production 서버에서 390×844 responsive 검증을 완료했습니다. 브라우저 `innerWidth=390`, `innerHeight=844`; 문서 `scrollWidth=375`, `clientWidth=375`이며 가로 넘침은 없습니다. 모바일에서 무기 선택, IAS 직접 입력, +1/−1 버튼, 계산 결과와 표 표시를 확인했습니다. War Hammer IAS 316/317은 9/8프레임입니다. Chrome 탭 Console error/warning은 동작 확인 후 0건입니다.

자동 및 PC·모바일 검증 게이트 통과. Vercel 신규 Production 배포와 운영 스모크 테스트 결과는 배포 완료 후 추가 기록합니다.
