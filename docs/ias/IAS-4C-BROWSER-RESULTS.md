# IAS-4-C Browser Results

Tested local production build at `http://127.0.0.1:3014/game-info/ias-calculator` in Chrome.

| Scenario | Result |
|---|---|
| Select Smite | PASS — enabled; S1 and shield condition shown |
| Crystal Sword at 0 IAS | PASS — 11 frames; table begins 0→11 and 11→10 |
| Phase Blade at 65 IAS | PASS — 6 frames; range capped at 72 |
| War Hammer at 395 IAS | PASS — 6 frames; table's final breakpoint is 395 |
| Enter War Hammer 457 | PASS — input constrained to 456 |
| Weapon change | PASS — range, result and breakpoint rows update together |
| Mobile 390×844 | PASS — viewport 390×844; document/body width 375px; no horizontal overflow |
| Browser console | PASS — no warning/error entries recorded during this local session |

The displayed frame is explicitly labeled as the full Smite S1 animation length, not a measured strike timestamp. Test screenshot was inspected at the mobile viewport. This is local browser verification; production IAS smoke test is pending the production deployment gate.
