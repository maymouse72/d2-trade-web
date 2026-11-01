# IAS-4-B-2 Browser Results

## Local PC validation

The extension-attached Chrome tab's URL was read from the browser tab inventory before interaction. Local route: `http://localhost:3001/game-info/ias-calculator`.

- Zeal level 1 produced 2 hits; Crystal Sword at 0 IAS returned a 21-frame sequence.
- Zeal level 4 produced 5 hits; Phase Blade 24 IAS returned 29 frames, with first/follow event at 5 frames, final event at frame 25, and final animation remainder 9 frames.
- Phase Blade 72 IAS reached the 24-frame five-hit sequence and the 0–72 supported range.
- War Hammer IAS 317 and 456 returned Zeal results at EIAS 67 and 75 respectively.
- Level 20 remained capped at 5 hits.
- Pasting 500 IAS into the War Hammer equipment field clamped to 456.
- Invalid decimal input did not display a numerical result.
- Unsupported A2 and unsupported skill combinations returned no calculation. Sacrifice, Vengeance, and Conversion continued to return their supported A1 results.
- Local browser console error list was empty.

## Mobile validation

At 390 × 844 CSS pixels, the page and body measured 375px wide, with no horizontal page overflow. The weapon, skill, skill-level, IAS fields, and adjustment buttons were operable. The Zeal result remained legible; the six-column breakpoint table used its own horizontal scroll region without widening the page. Mobile screenshots were captured through the attached browser tab API after the regular screenshot path timed out.

## Production validation

After deployment `dpl_6ntYAikPWmeRSn5YfBEZj6CD16B6` reached READY, the production calculator was opened in attached Chrome. Crystal Sword 0 IAS returned 21 frames for 2 hits. Phase Blade 24 IAS returned 14 frames for 2 hits; entering 200 was constrained to 72, returning 12 frames. War Hammer 317 IAS returned 13 frames for 2 hits and 28 frames for 5 hits; 318 IAS remained valid (the Zeal cap is 456), and 456 IAS returned 12 frames for 2 hits and 24 frames for 5 hits. Production console errors: none.

Production mobile viewport 390 × 844 had 375px body/document width and no page-level overflow. IAS fields and buttons remained usable and the breakpoint table stayed within its own horizontal scroll area. A production mobile screenshot was captured.