# IAS-5-A + IAS-5-B 최종 결과

## 판정

**PASS / DEPLOYED** — 필수 자동/브라우저 검증, commit/push, Production READY 및 운영 smoke test 완료.

## 구현 범위

- 다중 직업 레지스트리와 독립 계산 분기: 구현
- 신규 VERIFIED 무기: 최대 1종 (`crs`)
- 신규 VERIFIED 조합: 최대 1개 (Barbarian Human Normal Attack A1, BAA11HS, WSM 0, no modifier)
- 독립 Golden: 7 breakpoint rows; IAS 0–200 전수 비교
- 기존 Paladin engine/Golden: 보존

## 결과/배포

- IAS 자동 테스트: 57/57 PASS
- TypeScript / ESLint / `next build --webpack`: PASS
- Playwright PC 1365×900 / 모바일 390×844: PASS, 콘솔 오류/가로 넘침 없음
- 구현 Git Commit: `61b7d3eb2c054b9b36046be4e5b16846c0b6ff49` (origin/main)
- Vercel Production: `dpl_2hYt88xNjwGWsamFqxZ9k1vFz5Dy`, READY
- `www.d2jugobatgo.com` alias: verified and attached
- 운영 스모크: desktop/mobile PASS; Barbarian 0 IAS→15f, 9 IAS→14f; 미검증 무기 차단; Paladin 복귀 PASS; no console errors/horizontal overflow
- 제한: 로컬 추출물에 Barbarian COF가 없어 COF의 레이어/이벤트 직접 확인은 하지 않았고, 게임 내 실제 타격 시점도 측정하지 않았다. 공개 IAS frame table과 빌드별 animation label, 로컬 `weapons.txt` 해석을 조합한 단일 WSM 0 지원 조합이다.
