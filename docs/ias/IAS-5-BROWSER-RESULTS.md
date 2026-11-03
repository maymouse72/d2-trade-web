# IAS-5 브라우저 검증 결과

Playwright 설정은 별도 Chrome 세션으로 데스크톱 1365×900, 모바일 390×844를 실행하며 로컬 Production Build를 대상으로 한다. 테스트는 IAS 페이지에서 직업/스킬 전환, Barbarian 0 IAS→15f, IAS 9→14f, 미검증 Phase Blade 차단, Paladin 복귀와 광신 초기화, 콘솔 오류, 가로 넘침을 확인한다.

## 실행 결과

- Production build: PASS (`next build --webpack`)
- Playwright desktop Chrome 1365×900: PASS
- Playwright mobile Chrome 390×844: PASS
- Barbarian 0 IAS→15f, IAS 9→14f: PASS
- 미검증 Phase Blade 차단 및 Paladin 복귀/광신 0 초기화: PASS
- 한국어/영어 무기 검색, 카탈로그 297 선택 가능 무기, 기존 Paladin 광신/열의/강타: PASS
- 콘솔 오류 및 pageerror: 없음
- 수평 넘침: 없음 (desktop/mobile 모두 document scrollWidth ≤ clientWidth)
- 첫 시도: 기존 지원 상태 필터가 `UNSUPPORTED`인 상태에서 무기 선택을 시도해 시간 초과. 테스트가 필터를 `ALL`로 초기화하도록 보완한 뒤 두 프로젝트 모두 통과.
- 수동/사용자 Chrome 조작은 수행하지 않으며 테스트용 별도 Chrome을 사용한다.
