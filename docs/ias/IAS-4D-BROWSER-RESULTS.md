# IAS-4-D — browser results

## Local PC browser

The local production build opened at `http://localhost:3001/game-info/ias-calculator` in the connected Chrome tab while the tab address was visible to the browser tool.

| Check | Result |
|---|---|
| IAS calculator route loads | PASS |
| Catalog displays 306 coded rows / 297 selectable spawnable rows | PASS |
| Search `Long Sword` narrows the list to one row | PASS |
| Search-selected Long Sword shows code `lsd`, WSM -10, one-handed, UNVERIFIED for Normal attack | PASS |
| Long Sword Normal attack blocks numbers and displays the explicit Korean unverified explanation | PASS |
| Changing skill to Zeal marks Long Sword VERIFIED and displays its 0–142 range | PASS |
| Zeal IAS 0: five-hit sequence 41 frames; table 0 IAS → 7 first/follow-up, 13 final | PASS |
| Zeal IAS 142: five-hit sequence 24 frames; EIAS 75; no further verified breakpoint | PASS |
| Full breakpoint table shows the 9 independently matched IAS transitions | PASS |
| Browser console errors | **NOT VERIFIED**; native Chrome address validation stopped the approved Windows browser helper |
| Search/category/handedness/support filters by interactive mouse/keyboard | PARTIAL; pure filter behavior is covered by automated tests, full visual filter sequence not completed |

The tool stopped when switching from the controlled tab into the native Chrome window because it could not establish the current address with sufficient confidence. No browser or address-verification restriction was bypassed.

## Mobile

The user checked the page directly on a phone and confirmed that it displayed without layout breakage. This is recorded as a **user-confirmed mobile visual check**. Exact 390×844 viewport dimensions, keyboard input, scrolling, and a measured horizontal-overflow check were not independently observed by the agent.

## Overall

PC functional spot checks: **PASS for tested paths**. Mobile appearance: **user-confirmed PASS**. Browser console: **NOT VERIFIED**. The Windows browser helper stopped because it could not establish the active Chrome URL with sufficient confidence; no restriction was bypassed.
