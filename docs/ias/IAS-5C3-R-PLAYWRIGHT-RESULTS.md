# IAS-5-C-3-R Playwright Results

Status: **PASS**. The user's latest screenshot confirms the final test revision passed in ordinary Windows PowerShell (**2 passed, 4.1s**).

| Environment/project | Result |
|---|---|
| Desktop Chrome 1365×900 | PASS, one spec (2.2s). |
| Mobile Chrome 390×844 | PASS, one spec (2.2s). |
| User command summary | `npm run test:ias:browser`; `Running 2 tests using 2 workers`; `2 passed (4.1s)`. |
| Console / page errors | The executed test asserts empty console and page-error arrays; PASS for the screenshot's test revision. |
| Horizontal overflow | The executed test asserts document scroll width does not exceed viewport width; PASS for the screenshot's test revision. |
| New weapon values | PASS on screenshot revision: 72h IAS 0→15, 7→14, 83→10; 9fb IAS 0→16, 4→15, 99→10. IAS 201 is constrained to 200 and yields 10 frames for 72h. |
| Breakpoint table (new weapons) | PASS: visible table rows and active breakpoint updates are asserted. |
| IAS stepper accessibility | PASS: accessible name, visibility, enabled state, keyboard focus, and Enter activation are asserted. |
| Unsupported B/C UI | PASS on screenshot revision: dual-wield normal attack, Double Swing, Frenzy, and Whirlwind skill options are absent. Unit coverage additionally asserts they return no numeric frames. |
| Previous Codex environment attempts | `ERR_NETWORK_ACCESS_DENIED` / `connect EACCES 127.0.0.1:4173`; these reflect the constrained runner, not the user's normal PowerShell environment. |

The runner distinction is documented in [network diagnosis](IAS-5C3-R-NETWORK-DIAGNOSIS.md). No timeout was increased and no network policy was bypassed.
