# IAS-4-C Implementation Report

Implemented Smite as a dedicated `SMITE`/Skill 97/S1 registry entry and isolated calculation engine. The engine applies diminishing returns, weapon WSM and the 12-FPD Smite formula, then withholds numbers unless both EIAS and frames match the independent fixed Golden row. Supported WSM values remain attached to the three verified one-handed weapons.

UI enables Smite, applies per-weapon IAS caps (Crystal Sword 200, Phase Blade 72, War Hammer 456), displays the S1 attack-animation length and breakpoint table, and states the shield-equipped assumption. No shield subtype selector is shown because the inspected source and reference tables expose no subtype speed input. Zeal's hit-count control remains limited to Zeal. A1/A2 and skill/aura IAS limitations remain enforced.

Changed implementation files are confined to `app/game-info/ias-calculator/IASCalculator.tsx` and `lib/ias/` Smite registry/policy/engine/Golden/UI types/tests. Protected service, data and configuration areas were not modified. See the test, browser and regression reports for gates. No real gameplay timing capture was performed.
