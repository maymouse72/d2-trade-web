# IAS-4-D-2 + IAS-4-E Deployment Report

- Windows Chrome address-confidence obstacle: resolved for automated verification by adding isolated Playwright Chrome testing with an explicit local URL and desktop/mobile projects. The restricted existing Chrome window is not accessed.
- Deployment status: **DEPLOYED**.
- Release commit: `87a6132e4bab49a3f473207dfa82b937dfd04975` (`feat(ias): localize weapons and add validated Fanaticism`), pushed to `origin/main`.
- Vercel Production deployment: `dpl_6N3RQVQ5prgv1TYomwCUcxwbMiFB`, state `READY`, source commit matches the release commit.
- Production aliases include `www.d2jugobatgo.com`, `d2jugobatgo.com`, and the project Vercel domains; `aliasError` is null.
- Production IAS browser smoke: **2/2 PASS** in isolated Chrome (desktop and mobile 390×844); calculations, support-state filter, zero overflow, no console/page errors.
- Local gates: IAS 52/52, TypeScript PASS, ESLint PASS, Webpack build PASS, Playwright desktop and mobile 390×844 PASS, no console/page errors, no horizontal overflow.
- Production smoke is limited to the IAS route and the explicitly requested checks; trade/experience/PWA services were not rechecked because impact analysis found no shared runtime dependency.
- No DB, env, PWA/Push or unrelated service configuration changed.
