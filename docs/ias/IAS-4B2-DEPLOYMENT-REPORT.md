# IAS-4-B-2 Deployment Report

## Deployment status

**DEPLOYED.** IAS-4-B-2 source and generated dataset passed automated tests, TypeScript, lint, and the Webpack production build. Local and production PC/mobile browser checks passed. Existing trade detail and comments, catalogs, experience information, and navigation were reviewed read-only.

## Repository and deployment

- Branch: `main`
- Baseline HEAD and `origin/main`: `5bb9653952f9aed0fc234dc29020e2597c17704e`
- IAS-4-B-2 commit: `a85f05d08b0065722ee31452b595fae59dc7b651`
- Production deployment ID: `dpl_6ntYAikPWmeRSn5YfBEZj6CD16B6`
- Production state: READY
- Production aliases: `www.d2jugobatgo.com`, `d2jugobatgo.com` (redirects to www), and Vercel project aliases
- Production browser smoke: PASS; console errors none
- Rollback: not needed

## Preserved local changes

Unrelated IAS-2B and IAS-3A report edits and the untracked `debug.log` were excluded from the commit. Existing A1 Golden datasets were unchanged.

## Outcome

The push triggered the Vercel Production build; no duplicate deployment was created. Production smoke tests confirmed the Zeal selector, supported weapon caps, sequence output, existing read-only routes, and mobile layout.