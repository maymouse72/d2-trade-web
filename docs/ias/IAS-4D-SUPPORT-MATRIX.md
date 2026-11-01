# IAS-4-D — calculator support matrix

Support is a character + skill + animation + weapon combination. Catalog presence does not activate calculation. The UI and runtime both block non-VERIFIED combinations from numeric output.

| Skill / mode | Existing VERIFIED weapons | New VERIFIED weapons | IAS limits |
|---|---|---|---|
| Normal attack / A1 | Crystal Sword (`crs`), Phase Blade (`7cr`), War Hammer (`whm`) | — | existing per-weapon limits |
| Sacrifice / A1 | `crs`, `7cr`, `whm` | — | existing per-weapon limits |
| Vengeance / A1 | `crs`, `7cr`, `whm` | — | existing per-weapon limits |
| Conversion / A1 | `crs`, `7cr`, `whm` | — | existing per-weapon limits |
| Zeal / A1 | `crs`, `7cr`, `whm` | Long Sword (`lsd`) | Long Sword 0–142; existing weapon-specific ranges retained |
| Smite / S1 | `crs`, `7cr`, `whm` | — | existing weapon-specific limits retained |
| Any A2 combination | — | — | UNVERIFIED; no number shown |

Across the six selectable Paladin skills and 306 coded catalog entries: **19 VERIFIED**, **0 PROVISIONAL**, **1,817 UNVERIFIED**, **0 CONFLICTED**, **0 UNSUPPORTED**. Remaining rows are UNVERIFIED because the evidence set does not justify a stronger status; no unsupported status was guessed from WSM or a catalog category.

Long Sword is verified for Zeal only. Normal attack, Sacrifice, Vengeance, Conversion, and Smite remain blocked for it. Other catalog entries remain blocked unless separately registered and validated. Invalid numeric inputs remain `INVALID_INPUT`, not a weapon support status.
