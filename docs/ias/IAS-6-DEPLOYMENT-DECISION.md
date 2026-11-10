# IAS-6 Deployment Decision

**Decision: REFERENCE-BASED MVP READY FOR USER APPROVAL.**

The calculator exposes 64 selectable skills/modes across all seven target classes. The reproducible audit evaluates 22,946 declared legal numeric candidates; 22,792 return numbers (22 VERIFIED, 22,770 REFERENCE_BASED), while 154 mixed-WSM Assassin Dragon Claw combinations remain `CONFLICTED`. The metric is limited to the declared, registry-backed candidate set. The separate generated skill matrix and weapon audit enumerate limitations and unsupported catalog-code reasons.

Verification completed: IAS unit tests 132/132, TypeScript PASS, ESLint PASS, Webpack production build PASS (12 routes), and Playwright 14/14 across Desktop Chrome and Mobile Chrome 390×844. The browser tests include the newly added fixed 23-frame Dragon Flight result and Barbarian Double Throw's dual-weapon IAS controls. Console/page errors and horizontal-overflow assertions passed.

Known exclusions remain explicit: Barbarian dual-wield normal attack (public sources do not establish an off-hand cycle), intermediate Frenzy charge states, Double Swing beyond the recorded reference pairs, some dual-claw/skill modifiers, and live-game verification. No numerical result is fabricated for the conflicted path.

No Git stage/commit/push or Vercel Production deployment was performed. The IAS-6 work order requires user approval before Production. Existing unrelated dirty reports and workspace changes remain unstaged and untouched.
