# IAS-4-D-2 Localization Report

## Source and method

- Installed D2R build: `3.3.93847`, Korean branch `kr`.
- Source: `data/data/local/lng/strings/item-names.json`, extracted read-only from the installed client.
- SHA-256: `843FF48C26AEFA6EFED7995B486E2E53553A802AE4AF9A52C2B367FEA302525A`.
- Join rule: localization `Key` equals the three-character `weapons.txt` code. No names were guessed or translated manually.

## Coverage

- Weapon name matches: 306 / 306; Korean values present: 306; untranslated: 0.
- Display: Korean name followed by the official English string; source catalog name/code remain intact.
- Search indexes Korean name, official English name, source name, code, raw type and Korean type label; whitespace trimmed and case-insensitive.
- Type labels: 23 / 23 mapped using the candidate Korean labels in the task. No standalone D2R category localization table was found in the extracted name/UI string files; labels are therefore explicitly UI mappings, not claimed to be official game strings.
- The eight English localization strings differing from source row spelling are displayed from the localization record while source names remain unchanged.

## Validation

Automated catalog tests verify 306 mappings, 297 spawnable items, Korean/English/code searches, and localized `Sword` label. Browser tests run at desktop and 390×844 mobile in Playwright Chrome.