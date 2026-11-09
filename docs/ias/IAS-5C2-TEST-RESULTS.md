# IAS-5-C-2 Test Results

- IAS unit suite: **59/59 PASS** (58 existing tests preserved plus one Track A test covering IAS 0–200, every published threshold, unsupported weapon/mode, and IAS 201 rejection).
- TypeScript `npx tsc --noEmit`: **PASS**.
- ESLint `npm run lint`: **PASS**.
- Webpack production build: **PASS** using temporary isolated `distDir` `.next-ias5c2-build`, run with approved elevated execution after restricted writes returned EPERM. All application routes compiled/prerendered; settings and temporary output restored/removed.
- Playwright: **2/2 PASS** on Chrome Desktop 1365×900 and Mobile 390×844. Test covers Colossal Sword two-hand 20 frames at IAS 0; 19 frames at IAS 2; BAA12HS evidence; IAS 201 constrained to 200 and 10 frames; existing calculator regression; no page/console errors or horizontal overflow.
- Existing prior Golden files were not edited.

> Recovery update: this preliminary report is superseded by [IAS-5C-2 Recovery Summary](IAS-5C2-RECOVERY-SUMMARY.md) and the ten IAS-5C2-* recovery reports. Track A is now verified for 7fb two-hand mode; B/C remain blocked. See the recovery reports for final test/build/browser results and deployment decision.
