# IAS-5-C-3-R Regression Results

IAS calculation logic was not edited during C3-R. The permitted IAS-only Playwright spec was expanded after reviewing the user's successful screenshot, to cover the missing requested boundaries and unsupported B/C skill options.

| Check | Result |
|---|---|
| IAS suite | PASS, 61/61 |
| Existing Barbarian / Paladin Golden expectations | Covered by the 61 passing IAS tests; existing Golden source hash unchanged |
| TypeScript | PASS when run alone after build generation completed. One concurrent run overlapped `.next/types` generation and reported missing files; the sequential rerun passed. |
| ESLint | PASS |
| Legend Sword / Zweihander browser outputs | Not observed in browser due network gate. Existing unit Golden verification remains in place; no browser PASS claimed. |
| B/C blocked state | Existing unit test verifies dual-wield, Double Swing, Frenzy, and Whirlwind do not expose numeric frames; PASS within IAS suite |
| Browser regression (Paladin/Zeal, 1HS, Colossal Sword, job/weapon changes) | PASS in final Desktop and Mobile run |
| C3 boundaries (72h IAS 7/83; 9fb IAS 99) | PASS in final Desktop and Mobile run |
| Unsupported B/C selector entries | PASS in final browser run; unit-level no-numeric-result guard passes |
| New weapon breakpoint table and keyboard stepper | PASS in final browser run |

The C3-R scope changed only the IAS Playwright spec and the six C3-R reports. No Playwright configuration, calculator engine, UI, or Golden data changed.
