# IAS-6 Final Report

**Status:** REFERENCE-BASED MVP READY FOR USER APPROVAL · **Date:** 2026-11-11
**Branch / starting HEAD:** `main` / `ee7f053e19843118e9200d4df039ad2a28141002`

## Implemented

- Seven requested classes have selectable numeric or explicitly non-numeric IAS behavior.
- **64 selectable skills/modes:** Amazon 22, Assassin 12, Barbarian 11, Druid 9, Necromancer 2, Paladin 7, Sorceress 1. This includes 62 numeric-capable registry paths, Paladin Charge's distinct mode selection, and the explicitly `CONFLICTED` Barbarian dual-wield normal attack option.
- Amazon: normal, Jab, Impale 1HT/2HT tables, Fend, Strafe, bow/crossbow aliases with Immolation cadence, thrust aliases, and Throw-table skills.
- Assassin: normal; Tiger/Cobra/Phoenix Strike A1 aliases; three dual-claw charge-up sequences; symmetric Dragon Claw; Dragon Talon; fixed 23-frame Dragon Flight; Dragon Tail weapon-class timing; Trap Laying.
- Barbarian: verified and reference normal attacks; standard A1 skill aliases; bounded Double Swing; legal ordered-pair Frenzy; Double Throw dual-wield sequence; Whirlwind repeated-hit interval.
- Druid: Human/Werewolf/Werebear normal attacks, Werewolf Fury/Feral Rage/Rabies, Fire Claws, Maul charge IAS, and Hunger.
- Necromancer: normal A1 and Poison Dagger on eligible daggers.
- Paladin: existing verified attack skills plus Charge rush/melee modes.
- Catalog: 306 codes / 297 spawnable / 23 item types; source WSM present for 201 and absent for 105. Unknown WSM remains unknown unless an existing explicit resolution applies.

## Coverage calculation

`node --experimental-strip-types scripts/ias-coverage-audit.mjs` enumerates registered legal class × skill × weapon × hand-mode/form candidates and the ordered dual-wield pairs exposed by the UI. It evaluates zero IAS and skill level 1 through the calculator view-model.

- **22,946** candidate combinations: **22 VERIFIED**, **22,770 REFERENCE_BASED**, **154 CONFLICTED**; no unsupported/invalid/unverified candidates within this defined denominator.
- **22,792 / 22,946 = 99.33%** numeric results within that scoped candidate set.
- All 154 conflicts are mixed-WSM Assassin Dragon Claw pairs.
- **196/306 (64.05%)** catalog codes appear in at least one numeric candidate. The 110 uncovered codes reconcile as 9 non-spawnable and 101 unresolved-WSM records under the audit's primary exclusion precedence.
- `scripts/ias-skill-matrix.mjs` generates the 64-row skill/mode matrix with attack type, weapon categories, hand mode, inputs, engine module, references, status, and numeric-result availability.

This is scoped candidate coverage. It does not claim coverage of every D2R skill, every IAS/rank/modifier state, or every theoretically possible weapon pair.

## Verification

- `npm run test:ias`: **132/132 PASS**.
- `npx tsc --noEmit`: **PASS**.
- `npm run lint`: **PASS**.
- `npx next build --webpack`: **PASS**, all 12 routes generated. The sandboxed attempt hit Windows EPERM while creating a generated `.next` directory; rerunning with the approved workspace process permission passed without ACL/security changes.
- `npm run test:ias:browser -- --workers=1`: **14/14 PASS**, seven Desktop Chrome and seven Mobile Chrome 390×844 runs. New browser coverage verifies Dragon Flight's fixed result and Double Throw controls; console/page-error and horizontal-overflow assertions pass.
- Existing Golden expectations and the earlier IAS-5-C-3-R tests remain present in the full suite.

## Limitations

- Barbarian dual-wield normal attack stays visible but returns `CONFLICTED`; the source set does not establish its off-hand cycle. Frenzy intermediate charge states remain omitted.
- Double Swing remains limited to its two recorded weapon pairs and primary IAS; Whirlwind reports repeated interval, not startup/travel/hit confirmation.
- Dragon Claw mixed-WSM pairs remain blocked. Assassin Trap Laying excludes dual-claw aggregation and slow effects.
- Dragon Flight is a source-based fixed 23-frame result, not an in-game measurement. Double Throw is also source-based and does not claim gameplay verification.
- Casting-only skills, FCR, unmodeled movement cadence, unsupported aura/debuff combinations, and other unregistered class attack sequences remain out of scope. No live-game frame measurements were performed.
- Druid Werebear Fury remains excluded because Fury is Werewolf-only.

## Release decision

- IAS-6 milestone: **REFERENCE-BASED MVP READY FOR USER APPROVAL**.
- Git staging, commit, and push: **none**.
- Vercel Production deployment: **none**.
- Approval is requested before any Production action, as required by the work order.
- Rollback: not applicable.
- Existing unrelated dirty files were preserved and not staged.

Companion reports: Scope Matrix, Reference Sources, Engine Design, Weapon Coverage, Skill Coverage Matrix, Class Implementation, Reference Tests, Regression Results, Browser Results, and Deployment Decision.
