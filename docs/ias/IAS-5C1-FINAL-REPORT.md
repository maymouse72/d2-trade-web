# IAS-5-C-1 최종 보고서

## 현재 검증 결과

- 조사한 주요 무기 5종 (Crystal Sword 포함); 74개 spawnable explicit-WSM 1hs records screened.
- 신규 VERIFIED: 4종 — Long Sword (-10), Phase Blade (-30), Military Pick (-10), War Hammer (+20); all A1 `BAA11HS` / 1hs.
- COF: Barbarian `baa11hs.cof`/`baa21hs.cof` 확보 및 확인.
- Golden: 35 breakpoint rows total, 28 new; 1,017 integer IAS result comparisons; all earlier IAS Golden JSON hashes unchanged.
- Auto tests: 58/58, TypeScript PASS, ESLint PASS, Webpack build PASS.
- Local browser: desktop 1365×900 and mobile 390×844 PASS (2/2); no browser/page console errors and no mobile horizontal overflow.

## 최종 판정

**PASS / DEPLOYED**

- Git commit: `d0c62bd4a59591a8d59ea96437f3a1d86b70b51e`
- Vercel Production deployment: `dpl_5dEHfqeQBv2BebsC6Jv4SoPgDe7F` — READY
- `www.d2jugobatgo.com` alias 연결 완료.
- 운영 PC·모바일 Playwright 스모크 테스트: 2/2 PASS, 콘솔 오류 없음, 모바일 가로 넘침 없음.
- 롤백: 없음.
- 미완료 사항: 없음. IAS-2B/IAS-3A 기존 보고서 편집과 `debug.log`는 이 작업 범위에서 제외되어 로컬에 보존.
