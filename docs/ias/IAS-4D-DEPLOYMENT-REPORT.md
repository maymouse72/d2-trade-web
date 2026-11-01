# IAS-4-D — deployment gate

## Git and Vercel state

- Local branch: `main`
- Task-base local HEAD: `33d88c13be04a845e5cfc5a423f47297412e854f`
- Read-only origin check: `origin/main` also returned `33d88c13be04a845e5cfc5a423f47297412e854f`.
- Pre-existing unrelated modified IAS-2B/IAS-3A reports and untracked `debug.log` were preserved; none was staged.
- IAS-4-D changes are being staged selectively; unrelated reports and `debug.log` remain excluded.
- The user confirmed the phone layout displays without breakage and explicitly authorized deployment.

The last known Production deployment at task start was `dpl_BJRFNLn1LAu5kuhM2z1c6DGxRwTk`, state READY, source commit `33d88c13be04a845e5cfc5a423f47297412e854f`; aliases included `www.d2jugobatgo.com`. That is the existing deployment, not IAS-4-D.

## Build environment note

The unprivileged production build failed twice while creating nested `.next` output directories with `EPERM`, including after the development server had been stopped. Re-running the same `npx next build --webpack` with the approved elevated local build permission completed successfully. This isolates the failure to the restricted local build execution context; no application or Next.js configuration change was needed.

## Deployment status

The exact 390×844 viewport and browser console remain independently unverified. The user checked the site on a phone, reported no layout breakage, and explicitly authorized deployment. Interactive trade-detail/comment and PWA checks remain unverified; read-only route responses had previously returned HTTP 200 for the homepage, runewords, uniques, sets, experience, and IAS calculator. Record the commit, deployment ID, READY state, aliases, and production smoke results here after deployment.
