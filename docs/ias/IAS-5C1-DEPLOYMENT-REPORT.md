# IAS-5-C-1 배포 보고서

- 기준 HEAD/origin: `260fad414d0da68fac7d120b45aefd5bb13e3f0f`
- Vercel project: `d2-trade-web-6e47`
- Existing production before this release: IAS-5 report commit `260fad4`.
- Existing user changes: IAS-2B/IAS-3A report edits and `debug.log`; preserve and exclude.
- Feature commit: `d0c62bd4a59591a8d59ea96437f3a1d86b70b51e` (`feat(ias): add verified Barbarian normal attack weapons`)
- Production deployment: `dpl_5dEHfqeQBv2BebsC6Jv4SoPgDe7F`, READY
- Domain alias: `www.d2jugobatgo.com` attached to the new deployment; aliasError is null.
- Production smoke: Playwright desktop 1365×900 and mobile 390×844 both PASS (2/2); console/page errors 0, mobile horizontal overflow absent.
- Push: `origin/main` advanced from `260fad4` to `d0c62bd` successfully. Pre-existing IAS-2B/IAS-3A document edits and `debug.log` were excluded and remain in the working tree.
