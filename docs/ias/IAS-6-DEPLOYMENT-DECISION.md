# IAS-6 Deployment Decision

**Decision: PASS / DEPLOYED.**

The calculator exposes 64 selectable skills/modes across all seven target classes. The reproducible audit evaluates 22,946 declared legal numeric candidates; 22,792 return numbers (22 VERIFIED, 22,770 REFERENCE_BASED), while 154 mixed-WSM Assassin Dragon Claw combinations remain `CONFLICTED`. The metric is limited to the declared, registry-backed candidate set. The separate generated skill matrix and weapon audit enumerate limitations and unsupported catalog-code reasons.

Verification completed: IAS unit tests 132/132, TypeScript PASS, ESLint PASS, Webpack production build PASS (12 routes), and Playwright 14/14 across Desktop Chrome and Mobile Chrome 390×844. The browser tests include the newly added fixed 23-frame Dragon Flight result and Barbarian Double Throw's dual-weapon IAS controls. Console/page errors and horizontal-overflow assertions passed.

Known exclusions remain explicit: Barbarian dual-wield normal attack (public sources do not establish an off-hand cycle), intermediate Frenzy charge states, Double Swing beyond the recorded reference pairs, some dual-claw/skill modifiers, and live-game verification. No numerical result is fabricated for the conflicted path.

User approval was received on 2026-11-11. Commit `5ee6e587f6c4622a4749f4a633239a8a1385821e` was pushed to `main`; Vercel Production deployment `dpl_EAFGNEjew4FhmLoYGdBf1wjYBUxn` reached `READY`. The `www.d2jugobatgo.com` alias resolves to this deployment. The production IAS calculator route returned HTTP 200 and its HTML includes the seven-class selector and IAS calculator UI. No rollback was needed. Unrelated pre-existing dirty workspace files remain unstaged and untouched.
