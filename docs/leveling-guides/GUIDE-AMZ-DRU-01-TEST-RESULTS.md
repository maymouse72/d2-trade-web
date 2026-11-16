# GUIDE-AMZ-DRU-01 테스트 결과

## 자동 검증

| 검사 | 결과 | 내용 |
|---|---|---|
| `npm run test:guides` | PASS | 9/9. Amazon/Druid snapshots, 선행·레벨상한, 퀘스트 보상, 초기화 후 레벨별 progression 검증 |
| `npx tsc --noEmit` | PASS | 오류 없음 |
| `npm run lint` | PASS | ESLint 오류 없음 |
| `npx next build --webpack` | PASS | Next.js 16.4.3, Webpack. Amazon/Druid 포함 정적 페이지 생성 완료 |

## 브라우저

| 프로젝트 | 결과 | 확인 항목 |
|---|---|---|
| Desktop Chrome 1365×900 | PASS | 목록, 페이지 렌더, 검색, 목차 앵커, 체크리스트, 룬워드 anchor, 기존 페이지, 콘솔, 가로 넘침 |
| Mobile Chrome 390×844 | PASS | 같은 기능 및 가로 넘침 없음 |
| Playwright 로컬 전체 | PASS | 8/8 |
| Production `www.d2jugobatgo.com` | PASS | 8/8, Desktop + 390×844, 신규 페이지 및 기존 공략 회귀 |

테스트 시 기본 포트 4173에는 이전 앱 버전이 남아 있어 최신 UI를 반영하지 않았습니다. 이를 발견해 새 Webpack 산출물을 4175 포트에 분리 실행하고, `IAS_BASE_URL`을 지정해 전체 suite를 재검증했습니다. 최초 실패는 구버전 서버 재사용과 테스트 assertion/브라우저 history 전제의 문제였으며 최종 suite에서는 해소했습니다.

첫 일반 권한 프로덕션 빌드에서 `.next/server/app/game-info/leveling-guides` 생성 시 `EPERM`이 발생했습니다. 같은 Webpack 빌드를 권한 있는 실행으로 다시 수행해 통과했고, 앱 소스·설정을 바꾸지 않았습니다. Amazon/Druid 경로를 포함한 정적 페이지 19/19가 생성됐습니다.

## 범위

- 기존 소서리스·팔라딘·강령술사·암살자 공략 회귀 포함
- 데스크톱과 모바일 테스트에서 browser console error·page exception 없음
- 룬워드 deep link와 상세 페이지 목록 돌아가기 링크 확인
- Vercel Production runtime `error`/`fatal` log 조회 (배포 ID 기준, 최근 15분): 로그 없음
