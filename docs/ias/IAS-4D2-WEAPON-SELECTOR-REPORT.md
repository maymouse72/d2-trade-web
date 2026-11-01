# IAS-4-D-2 Weapon Selector Report

- Selector order: character, attack skill, weapon category, main weapon, search, calculation support state, handedness, remaining controls.
- Default view contains all 297 spawnable weapons; 306 source records remain in catalog, including non-spawnable records which are not default options.
- Labels show Korean and English name, source code, WSM and current skill-combination state.
- Filters include all / calculation supported / pending verification / verification conflict / unsupported, weapon category and handedness.
- Calculation is still gated by the engine support policy. A listed weapon is not thereby treated as supported.
- Search and 297-option list verified with automated IAS tests and desktop/mobile Playwright tests.
- Conflicted state is available for future evidence reconciliation; no current combination is designated conflicted. Class-exclusive weapons for the Paladin and all weapons for other classes show unsupported. Unsupported combinations yield no numeric result.
