# IAS-4-D-2 + IAS-4-E Browser Results

## Repeatable browser method

Windows Chrome address confidence is not required. After `npm run build:webpack`, `test:ias:browser` starts the built production server and an isolated Playwright-controlled Chrome instance, navigating directly to `http://127.0.0.1:4173/game-info/ias-calculator`. Setting `IAS_BASE_URL=https://www.d2jugobatgo.com` uses the same tests against Production and skips local server startup. `playwright.config.ts` pins desktop viewport 1365×900 and mobile viewport 390×844, and uses the machine's installed Chrome (`channel: chrome`). This is a separate supported browser session; it does not inspect or control the user's existing Chrome window. Running against `next start` also avoids the `.next` writes that previously collided between `next dev` and production builds.

Official Playwright documentation: [installation](https://playwright.dev/docs/intro), [device emulation](https://playwright.dev/docs/emulation), and [console events](https://playwright.dev/docs/api/class-page).

## Result

- Desktop Chrome: PASS.
- Mobile Chrome viewport 390×844: PASS.
- All 297 spawnable choices rendered by default.
- Korean category label and Korean name / English name searches resolve to the same weapon codes.
- All four support-state filters are present; non-Paladin class choices and class-exclusive weapon types are marked unsupported and do not return numeric results.
- Fanaticism level 20 produces a changed result; turning it off restores baseline; Zeal and Smite continue to render.
- `document.documentElement.scrollWidth <= clientWidth` at both viewports.
- No browser `console.error` or uncaught page errors observed.
- Production URL `https://www.d2jugobatgo.com/game-info/ias-calculator`: desktop **PASS**, mobile 390×844 **PASS** using the same assertions after deployment.

Manual physical-phone testing is not claimed; mobile result is browser device-viewport emulation. To test Production, set `IAS_BASE_URL=https://www.d2jugobatgo.com`; this bypasses only local `webServer` startup, not site protections or authentication.
