# IAS-5-A + IAS-5-B 최종 결과

## 판정

필수 로컬 검증 PASS; Git/Vercel 단계 완료 후 PASS / DEPLOYED 여부를 확정한다.

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
- Git Commit, Vercel Deployment ID/READY, 도메인/Production 스모크: 작업 후 기록
- 제한: 로컬 추출물에 Barbarian COF가 없어 COF의 레이어/이벤트 직접 확인은 하지 않았고, 게임 내 실제 타격 시점도 측정하지 않았다. 공개 IAS frame table과 빌드별 animation label, 로컬 `weapons.txt` 해석을 조합한 단일 WSM 0 지원 조합이다.
