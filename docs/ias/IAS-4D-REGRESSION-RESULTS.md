# IAS-4-D — existing service regression results

## Production read-only HTTP check

After IAS-4-D deployment `dpl_QVvsa9u6DdXghYgwsbzMhE5bKpyz` became READY, authenticated Vercel fetches of the public production pages returned HTTP **200 OK** for:

- `/` (homepage / trade landing route)
- `/runewords`
- `/uniques`
- `/sets`
- `/game-info/experience`
- `/game-info/ias-calculator`

These responses confirm that the server-rendered route documents are available on the currently deployed production build. They are read-only checks and do not exercise client-side navigation or data mutations.

The production IAS calculator response includes the catalog search, Long Sword (`lsd`), Zeal controls, and the 306-record category option. The homepage server response returned its route successfully but still showed the client-side trade-card loading placeholder during this fetch.

## Scope not verified

- Trade detail and comment display were not opened interactively; no usable trade ID was present in the server-rendered homepage response.
- Homepage trade cards and comment queries were not verified in a live browser.
- PWA install/offline/service-worker behavior was not interacted with.
- No production DB, account, comment, or trading record was changed.

Local Webpack build lists the existing homepage, experience, runewords, unique, set, trade-detail, push API, and IAS routes. It does not by itself prove their live interactive behavior. Regression gate is **PARTIAL**, not PASS. No production DB, account, comment, trade, or PWA setting was changed.
