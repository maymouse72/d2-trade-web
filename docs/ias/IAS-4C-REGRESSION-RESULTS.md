# IAS-4-C Existing Service Regression Results

Read-only production routes were opened in Chrome on 2026-11-01. No forms were submitted and no service data was changed.

| Route | Result |
|---|---|
| `/` | PASS — marketplace shell and listing cards loaded |
| `/trade/18` | PASS — detail loaded; existing comment section rendered (0 proposals currently shown) |
| `/game-info` | PASS — route resolves to the experience information page |
| `/game-info/experience` | PASS — level 45 recommendation and efficiency table rendered |
| `/game-info/ias-calculator` | PASS — current production calculator route loaded |
| `/runewords` | PASS — runeword entries rendered |
| `/uniques` | PASS — 415-item catalog rendered |
| `/sets` | PASS — 34-set catalog rendered |

These checks establish route/render availability, not correctness of every record or write workflow. Protected areas and their data were not edited. Production page console was not used as a pre-deployment gate for new Smite code because the deployed build does not yet contain this change.
