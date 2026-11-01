# IAS-4-D — deployment report

## Git and Vercel

- Task base local/origin `main`: `33d88c13be04a845e5cfc5a423f47297412e854f`.
- IAS-4-D commit: `ecc64f4983f08ec80b97c2b759e059d8cf7e1d13` (`feat(ias): expand Paladin weapon catalog and validated weapon support`).
- Push to `origin/main`: successful; remote main was rechecked immediately before the push and still matched the task base.
- Vercel project: `d2-trade-web-6e47` (`prj_kiBEIv1IOSotE8DlHwIvtVyMNQ4f`).
- Production deployment: `dpl_QVvsa9u6DdXghYgwsbzMhE5bKpyz`.
- State: **READY**; Git source `main` matches the IAS-4-D commit.
- Alias: `www.d2jugobatgo.com` is attached; `aliasError` is null.
- Rollback: **not performed**.

The previous Production deployment was `dpl_BJRFNLn1LAu5kuhM2z1c6DGxRwTk` at the task base SHA.

## Build environment note

Ordinary local Webpack build attempts failed creating nested `.next` output directories with `EPERM`, including after the development server was stopped. The same `npx next build --webpack` passed with approved elevated local execution. This isolates the failure to the restricted local build execution context; no application or Next.js configuration change was needed.

## Production smoke checks

Authenticated read-only Vercel fetches returned HTTP 200 for the IAS calculator, homepage, runewords, uniques, sets, and experience pages. The IAS calculator HTML contains the 306-record catalog filter, Long Sword (`lsd`), and Zeal controls. These are server response checks, not interactive browser checks.

The user checked the page directly on a phone and confirmed no layout breakage. Exact 390×844 viewport instrumentation and browser-console review remain **NOT VERIFIED**. The homepage response showed the client-side trade-card loading placeholder, so trade detail/comments and PWA interactions remain **NOT VERIFIED**. No production database, environment variables, domain settings, PWA, or push settings were changed.

The user explicitly authorized deployment after the phone check. Deployment completed with these remaining checks disclosed; overall verification is **PARTIAL / DEPLOYED**, not PASS.
