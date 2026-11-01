# IAS-4-D — final report

## Final status: PARTIAL / DEPLOYED

### Completed

- D2R source analysis: 307 original rows; 306 coded catalog entries; zero duplicate coded keys; zero dangling type references; 105 coded records have unknown WSM and remain null.
- Catalog UI: 306 registered, 297 spawnable/selectable by default; search and type/handedness/support filters; source WSM, code, hand form, and current combination state displayed.
- New VERIFIED weapon: **1** — Long Sword (`lsd`), WSM -10.
- New VERIFIED weapon/skill combination: **1** — Paladin Zeal A1, 0–142 IAS, 2–5 hit count.
- Other registered skill combinations: **0 PROVISIONAL**, **1,817 UNVERIFIED**, **0 CONFLICTED**, **0 UNSUPPORTED**. They remain blocked because the available evidence does not justify enabling them.
- New Golden rows: **572**, marked as fixed-reference expansions; 9 independent breakpoint rows cross-check the formula.
- Pre-existing Zeal rows: 3,564 unchanged; full dataset expanded from 3,564 to 4,136 rows.
- Automated tests: **46/46 PASS**; TypeScript PASS; ESLint PASS; Webpack Production build PASS. Unprivileged local build attempts hit `.next` directory `EPERM`; the same build passed with approved elevated local execution, without configuration changes.
- Local PC interaction spot-checks pass for search, unverified calculation blocking, Long Sword Zeal, and IAS 0/142 results.
- Read-only production routes returned HTTP 200 for homepage, runewords, uniques, sets, experience, and IAS calculator. The IAS response contains Long Sword (`lsd`) and Zeal controls.

### Not completed

- The user checked the page on a phone and confirmed no layout breakage. Exact 390×844 viewport instrumentation and browser-console review remain NOT VERIFIED.
- Interactive trade detail/comments and PWA regression: NOT VERIFIED. The homepage response showed the client-side loading placeholder for trade cards.
- Git commit/push: `ecc64f4983f08ec80b97c2b759e059d8cf7e1d13` — pushed to `origin/main`.
- Vercel Production: `dpl_QVvsa9u6DdXghYgwsbzMhE5bKpyz` — **READY**, source SHA matches, `www.d2jugobatgo.com` alias attached, no alias error.
- Production smoke: six routes returned HTTP 200. Interactive calculator and browser console were not inspected on Production.
- Rollback: **No**.

### Gate reason

The approved Windows browser helper could not verify the native Chrome address with sufficient confidence, so the browser console and exact viewport could not be inspected. No policy restriction was bypassed. The user supplied the phone visual result directly and authorized deployment. Deployment completed, but these checks remain unverified; therefore the overall result is PARTIAL rather than PASS.

See the source, catalog, compatibility, support, Golden, implementation, test, browser, regression, and deployment reports in this directory for detailed evidence.
