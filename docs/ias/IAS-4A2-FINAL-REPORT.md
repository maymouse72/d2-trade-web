# IAS-4-A-2 최종 보고

## 현재 최종 판정: PASS / DEPLOYMENT PENDING

### 구현·검증
Sacrifice, Vengeance, Conversion을 Paladin human one-handed A1 single-hit 조건과 기존 표의 범위에서 활성화했다. 9개 metadata-bound 그룹, 2,160 derived rows 전부 기존 Golden 행과 일치한다. 실제 게임에서 기술별 프레임을 독립 캡처한 결과가 아니며 A2·Zeal·Smite·추가 IAS modifier는 차단한다.

자동 테스트 26/26, TypeScript, ESLint, Webpack Production build, 로컬 PC 브라우저, 모바일 390×844 브라우저·콘솔 검증 통과. 자세한 주소 판별 문제 해결과 브라우저 결과는 `IAS-4A2-BROWSER-TEST-RESULTS.md`에 기록했다.

### 운영 배포
운영 도메인은 현재 이전 Production을 가리킨다. 승인된 배포 조건은 충족했으며 IAS-4-A-2만 선별 staging한 뒤 커밋/push한다. 새 Production READY 및 도메인 alias, 운영 계산·서비스 회귀 확인 이후 이 문서 판정을 `PASS / DEPLOYED`로 갱신한다.

### 제한
게임 내 기술별 동작의 독립 프레임 측정, A2 선택 규칙과 연속 입력 주기는 지원하지 않는다. Turbopack 정체 문제는 미해결 별도 항목이다.
