# IAS-4-B-2 Test Results

## Automated test suite

`npm run test:ias`: **32/32 passed**, 0 failed.

The suite covers the pre-existing A1 calculator, existing Golden datasets, support restrictions, and six Zeal-focused tests. Zeal coverage includes registry support, all fixed formula rows and EIAS cells, 3,564 expanded vectors, hit-count progression, breakpoint reporting, unsupported combinations, and invalid inputs.

## Static checks and production build

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npx next build --webpack` | PASS; 12 static pages generated |

The Webpack production build required the already-authorized elevated local execution because the normal contained execution hit `EPERM` while creating `.next` children. The successful retry used the same project command and changed no Windows security settings. Turbopack was not used.

## Known non-failing output

Node emitted its existing `MODULE_TYPELESS_PACKAGE_JSON` warning while running the test files. The test command completed successfully; package module configuration was not changed for this work.
