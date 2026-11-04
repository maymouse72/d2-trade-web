# IAS-5-C-1 자동 테스트 결과

## 기준선

- IAS-5-C-1 시작 전 `npm run test:ias`: 57/57 PASS.
- COF-derived original Golden JSON SHA-1 object IDs are unchanged; `git hash-object` matches `HEAD` for all 11 tracked `lib/ias/data/*.json` files.

## 구현 후

- `npm run test:ias`: 58/58 PASS (57 baseline + 1 test case; Barbarian suite covers five source WSMs and 1,017 total input IAS values)
- `npx tsc --noEmit`: PASS
- `npm run lint`: PASS
- `npx next build --webpack`: PASS (Next.js 16.4.3, webpack; static generation 12/12)
- `npm run test:ias:browser` (local desktop + mobile): 2/2 PASS
- Production smoke: 운영 URL PC·모바일 2/2 PASS

Barbarian tests verify all breakpoints at N−1/N, full supported IAS ranges, per-weapon limits, invalid/missing WSM, A2 rejection, no modifiers, current/next breakpoint output, and Paladin regressions.
