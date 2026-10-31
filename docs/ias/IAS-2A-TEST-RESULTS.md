# IAS-2A Test Results

Executed on Node.js 24.21.0, TypeScript 5.9.3, Next.js 16.4.3.

| Check | Result | Detail |
|---|---|---|
| IAS unit tests | PASS | 12 tests passed, 0 failed. Covers malformed values, policy, formula intermediates, Golden coverage, boundaries, next breakpoint, unsupported-result nulling, and deterministic output. |
| Golden comparison | PASS | All 201 integer IAS inputs (0–200) matched independently table-expanded expected frames. |
| TypeScript | PASS | `npx tsc --noEmit` exit 0. |
| ESLint | PASS | `npm run lint` exit 0. |
| Production build | PASS | `npx next build --webpack` compiled and generated all 10 static pages plus dynamic routes. |
| Default build backend | INTERRUPTED | `npm run build` selected Turbopack and remained without new output for over two minutes; it was stopped. The Webpack production build then passed. |
| Existing site regression | PASS | Production build completed; existing route list was generated: `/`, `/api/push`, `/api/push/subscriptions`, `/game-info/experience`, `/runewords`, `/sets`, `/trade/[id]`, `/uniques`. No existing route source was edited. |
| Protected files | PASS | `git status` contains only `package.json`, `tsconfig.json`, new `lib/ias`, and new `docs/ias`. Experience calculator and service files are unchanged. |
| Deployment/database | NOT DONE | No commit, push, Vercel deployment, or Supabase change. |

The Node test runner emits a benign `MODULE_TYPELESS_PACKAGE_JSON` warning because the project intentionally remains without a package-wide `type: module` setting. Tests still pass and no global module-mode change was made.
