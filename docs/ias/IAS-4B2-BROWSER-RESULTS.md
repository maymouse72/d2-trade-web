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
- Browser console error list was empty.

## Mobile validation

At 390 × 844 CSS pixels, the page and body measured 375px wide, with no horizontal page overflow. The weapon, skill, skill-level, IAS fields, and adjustment buttons were operable. The Zeal result remained legible; the six-column breakpoint table used its own horizontal scroll region (459px content in a 312px viewport container), without widening the page. A mobile screenshot was captured through the attached browser tab API after the regular screenshot path timed out.

## Limits

PC and mobile interaction checks were performed on the local production server. The production site's existing page was reviewed read-only before deployment; post-deployment browser checks remain pending until a production deployment is created and ready.
