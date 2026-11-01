# IAS-4-A-2 최종 보고

## 최종 판정: PASS / DEPLOYED

### 구현
희생(Sacrifice), 복수(Vengeance), 전향(Conversion)을 Paladin human one-handed A1 single-hit 조건과 기존 표의 범위에서 활성화했다. Zeal/Smite, A2, 추가 skill/aura IAS는 계산하지 않는다. 9 metadata-bound 그룹, 2,160 derived rows가 기존 A1 Golden과 일치한다. 기술별 독립 인게임 프레임 실측이 아님을 UI와 근거 문서에 표시했다.

### 자동·화면 검증
IAS 자동 테스트 26/26, TypeScript, ESLint, Webpack Production build PASS. Vercel Production Turbopack build도 성공. PC 화면과 콘솔 PASS. 390×844 모바일에서 문서 가로 넘침 0px, 조작/결과/기준표 및 모바일 콘솔 PASS. War Hammer 운영 계산: 316→9프레임, 317→8프레임, 318은 317로 제한.

### Git / Vercel
커밋 `67c0b2cd308058ebfa82dd7165334f9dd1888320`을 `origin/main`에 push했다. Production 배포 `dpl_7GTHWiCNWvokAmq33yqktMkkgCRA` READY, `www.d2jugobatgo.com` alias 연결. 운영 홈 거래 목록, 매물 `/trade/18` 및 댓글 표시, 경험치/게임 정보, 도감 경로 모두 정상(HTTP 200). 운영 데이터는 읽기만 했다. 롤백 없음.

### Computer Use 주소 판별 제한
원인은 Windows Chrome 네이티브 창의 화면/제목 판독이 현재 탭 URL을 신뢰할 수 있을 정도로 제공하지 못한 것이다. Codex Chrome 브라우저 연결의 탭 메타데이터 또는 정확한 URL을 명시해 여는 Codex 내장 브라우저를 사용하면 검증이 가능했다. 로컬 서버는 별도의 네트워크 격리 문제로 sandbox에서 loopback이 차단되어 승인된 로컬 서버 실행 권한이 필요했다. Chrome/안전 설정 변경이나 보호 제한 우회는 필요하지 않았다.

### 제한 및 미해결
기술별 게임 내 프레임을 독립 캡처하지 않았으므로 결과는 기존 A1 기대값으로부터 파생된 범위 검증이다. A2, Zeal/Smite, 추가 IAS modifier 및 반복 입력 공격 cadence는 미지원. 거래 상세 콘솔에는 앱 수정과 무관한 Supabase GoTrueClient 중복 경고 한 건이 있었으며 IAS 페이지 오류/경고는 없었다. Turbopack 로컬 정체 이력은 별도 항목이며 이번 Vercel Production 빌드는 성공했다.
