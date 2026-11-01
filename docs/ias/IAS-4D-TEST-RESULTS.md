# IAS-4-D — automated test and build results

| Check | Result | Notes |
|---|---|---|
| `npm run test:ias` | PASS — **46/46** | Existing IAS suites plus 8 catalog checks and Long Sword boundaries; zero failures |
| `npx tsc --noEmit` | PASS | No diagnostics |
| `npm run lint` | PASS | Final run has no errors or warnings |
| `npx next build --webpack` | PASS | Compiled, type-checked, prerendered 12 routes, build traces collected |

The first ordinary Webpack build attempt failed at `.next/static/...` with `EPERM`. Per the project's prior approved local-run procedure, the same build was rerun in the authorized local execution context and passed. No Next configuration or security setting was changed.

Golden checks:

- Crystal Sword A1: 201 rows retained.
- Phase Blade A1: 201 rows retained.
- War Hammer A1: 318 rows retained.
- Sacrifice/Vengeance/Conversion derived vectors: 2,160 retained.
- Zeal: 3,564 pre-existing rows unchanged, plus 572 Long Sword rows = 4,136.
- Smite: 731 rows and all prior boundary tests retained.
- Long Sword independent Zeal transitions: all 9 thresholds and first/final frame pairs match.
- Catalog tests: 306 unique coded rows, no duplicate key, missing WSM remains null, search and all filters compose, known Long Sword source fields match.

The task base was local/remote `main` SHA `33d88c13be04a845e5cfc5a423f47297412e854f`. No commit was created.
