# IAS-4-D — existing service regression results

## Production read-only HTTP check

Authenticated Vercel fetches of the public production pages returned HTTP **200 OK** for:

- `/` (homepage / trade landing route)
- `/runewords`
- `/uniques`
- `/sets`
- `/game-info/experience`
- `/game-info/ias-calculator`

These responses confirm that the server-rendered route documents are available on the currently deployed production build. They are read-only checks and do not exercise client-side navigation or data mutations.

## Scope not verified

- Trade detail and comment display were not opened interactively.
- Homepage trade cards and comment queries were not verified in-browser.
- PWA install/offline/service-worker behavior was not interacted with.
- No production DB, account, comment, or trading record was changed.

Local Webpack build lists the existing homepage, experience, runewords, unique, set, trade-detail, push API, and IAS routes. It does not by itself prove their live interactive behavior. Regression gate is **PARTIAL**, not PASS.
