# IAS-5-C-1 최종 보고서

## 현재 검증 결과

- 조사한 주요 무기 5종 (Crystal Sword 포함); 74개 spawnable explicit-WSM 1hs records screened.
- 신규 VERIFIED: 4종 — Long Sword (-10), Phase Blade (-30), Military Pick (-10), War Hammer (+20); all A1 `BAA11HS` / 1hs.
- COF: Barbarian `baa11hs.cof`/`baa21hs.cof` 확보 및 확인.
- Golden: 35 breakpoint rows total, 28 new; 1,017 integer IAS result comparisons; all earlier IAS Golden JSON hashes unchanged.
- Auto tests: 58/58, TypeScript PASS, ESLint PASS, Webpack build PASS.
- Local browser: desktop 1365×900 and mobile 390×844 PASS (2/2); no browser/page console errors and no mobile horizontal overflow.

## 최종 판정

Git/push and Vercel Production checks are pending. Final result can be PASS/DEPLOYED only if every required gate passes. Otherwise keep PARTIAL/NOT DEPLOYED and state the blocked gate.
