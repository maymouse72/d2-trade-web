# ITEM-34-B — Review Items

1. **415 vs 424 uniques:** The prior ITEM-34-A inventory says the 415-row source excludes six quest items and three inactive/older rows, which can account for the nine-row difference. However, those nine external rows have not been individually matched to an authoritative row list. Do not add them without that reconciliation. Reference: `docs/ITEM-34-A-DATA-INVENTORY.md`.
2. **Legacy item generation time:** A current patch does not establish the option version of an already-owned item. The UI models documented mode availability and catalog defaults; it does not claim to identify the generation time of a user's item.
3. **Classic and LoD:** The stored source data is RotW 3.3 and no complete mode-specific legacy snapshots were available. These presets remain REVIEW and suppress applicable current options.
4. **Eight new 3.3 runewords:** Patch 3.4 Non-Ladder and Offline availability remains REVIEW until an authoritative source explicitly confirms each unlock.
5. **Rogue's Bow:** Official wording confirms +1–3 to either Cold Arrow or Fire Arrow. The choice is represented; any roll mechanics or further conditions not stated by the source remain unclaimed.
6. **Browser gate:** Desktop and mobile browser execution could not reach the local server from the automation environment. Obtain the six-case browser result or an operator's manual desktop/mobile check before deployment approval.

No scope blocker remains for the implementation and automated data/unit checks. The browser verification and 415/424 row-by-row reconciliation remain review tasks.

