# IAS-4-B-2 Existing Service Regression Results

Read-only checks were made on `https://www.d2jugobatgo.com` before deployment. No trade, comment, account, database, environment, PWA, or push state was modified.

| Existing area | Result |
|---|---|
| Trade list `/` | PASS; populated cards rendered |
| Trade detail and comments | PASS; opened existing trade `/trade/18`; the comments area rendered and showed 0 comments |
| Runeword catalog `/runewords` | PASS; catalog and filters rendered |
| Unique catalog `/uniques` | PASS; catalog and filters rendered |
| Set catalog `/sets` | PASS; catalog and filters rendered |
| Game information `/game-info` | PASS; experience navigation and data rendered |
| Experience `/game-info/experience` | PASS; level recommendation and information rendered |
| IAS calculator route | PASS; page rendered |

Production browser console error list was empty. The detail page stated that server push is inactive/being prepared; this existing status was only observed, and no subscription setting was changed.

All required read-only regression routes were rendered. The detail page was opened by selecting an existing trade card; no comments or records were created.
