# IAS-6 Browser Results

**Result: PASS · 2026-11-11 · 14/14 Playwright runs.**

Command: `npm run test:ias:browser -- --workers=1`, using the production Webpack build on a local loopback server.

| Browser profile | Runs | Result |
|---|---:|---|
| Desktop Chrome | 7 | 7 passed |
| Mobile Chrome, 390×844 | 7 | 7 passed |
| Total | 14 | 14 passed |

The new browser case selects Assassin Dragon Flight and verifies the fixed 23-frame result, disabled IAS input, and visible no-IAS note. It then selects Barbarian Double Throw and verifies the off-hand weapon selector, separate off-hand IAS control, equipment IAS maximum, and rendered result. Both cases pass on desktop and 390×844 mobile.

The wider suite covers all seven classes, normal attacks and registered skill sequences, the explicit Barbarian dual-normal conflict state, Charge rush/melee modes, browser console/page errors, and mobile horizontal overflow. No console/page errors or horizontal overflow were found in the assertions. These local browser checks do not validate live-game attack events or Production services.
