# IAS-3-B 테스트 결과

검증일: 2026-11-01 (KST)

## 자동 검증

| 명령/검사 | 결과 |
|---|---|
| `npm run test:ias` | PASS — 19/19, 실패 0 |
| A1 Golden Dataset | PASS — Crystal Sword 201 + Phase Blade 201 + War Hammer 318 = 총 720 IAS 입력행 |
| A2 차단 | PASS — 세 무기 UNVERIFIED, 미검증 입력/애니메이션은 결과 숫자와 breakpoint 행을 반환하지 않음 |
| `npx tsc --noEmit` | PASS — 단독 실행 오류 없음 |
| `npm run lint` | PASS — ESLint 종료 코드 0 |
| `npx next build --webpack` | PASS — Next.js 16.4.3 Webpack 빌드, 12개 경로 생성 완료 |

빌드 시 샌드박스 내부 `.next/server/app` 생성은 과거 EPERM이 있었으나, 이번 최종 실행은 승인된 로컬 실행 환경에서 성공했다. `next.config.mjs`, ACL 및 운영 설정은 변경하지 않았다.

## 브라우저 및 기존 기능

- PC Chrome 2560×1215: A1 무기별 표본, IAS 범위와 잘못된 입력, 증감 버튼, 도움말, A2 결과/표 차단 및 A1 복귀를 확인했다.
- 모바일 390×844: 넘침 없음, 선택/입력/버튼 조작 및 결과 표시, A2 경고와 결과 차단을 확인했다.
- IAS 계산기 console: 신규 error/warning 없음.
- 기존 거래 목록/상세/댓글, 경험치, 게임 정보 이동, 룬워드/유니크/세트 페이지: 로컬에서 읽기 전용 확인 완료.
- 기존 광역 페이지 탐색에서 Supabase GoTrueClient 중복 인스턴스와 uniques/sets 이미지 비율 경고를 관찰했다. IAS 페이지의 오류로 확인되지는 않았다.
- Production deployment `dpl_5QN7npzeqeSvwDRpMy3yDbsDM65j` READY 후 운영 데스크톱에서 Crystal Sword 40→11, Phase Blade 54→8, War Hammer 316→9 및 317→8을 확인했다. 318은 317로 제한됐고, A2는 숫자/표를 차단했다. IAS console error/warning은 비어 있었다.
- 운영 거래 목록·상세·댓글(기존 댓글 1건), 경험치, 룬워드/유니크/세트 페이지를 읽기 전용으로 재확인했다. Production 모바일 390×844에서 가로 overflow 없음, War Hammer IAS 316→9프레임, A2 결과/표 차단, console error/warning 없음까지 확인했다.

세부 결과는 `IAS-3B1-BROWSER-TEST-RESULTS.md` 및 `IAS-3B1-REGRESSION-RESULTS.md`에 기록한다. Production 스모크 결과는 배포 완료 뒤 `IAS-3B1-DEPLOYMENT-REPORT.md`에 기입한다.
