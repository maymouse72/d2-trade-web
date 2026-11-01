# IAS-4B-2 Zeal Formula

## Inputs and transforms

```text
itemEIAS = floor(120 × totalIAS / (120 + totalIAS))
effectiveEIAS = clamp(itemEIAS − weaponWSM, −85, 75)
animationSpeed = floor(256 × (100 + effectiveEIAS) / 100)
firstAttackFrames = ceil(256 × actionFrame / animationSpeed)
followUpFrames = ceil(256 × actionFrame / animationSpeed)
finalAttackFrames = ceil(256 × framesPerDirection / animationSpeed) − 1
hitCount = min(skillLevel + 1, 5), with minimum 2
totalSequenceFrames = firstAttackFrames + (hitCount − 2) × followUpFrames + finalAttackFrames
```

Supported values are 15 frames per direction and action frame 7. Weapon WSM values are 0 (Crystal Sword), −30 (Phase Blade), and +20 (War Hammer).

## Zeal-specific supported IAS bounds

Bounds stop at the first IAS that reaches the documented EIAS ceiling of 75 for the selected WSM. They are not the legacy single-hit caps.

| Weapon | WSM | Maximum supported IAS |
|---|---:|---:|
| Crystal Sword | 0 | 360 |
| Phase Blade | −30 | 72 |
| War Hammer | +20 | 456 |

For IAS beyond a cap, the UI constrains input to the cap. The calculation returns values only when a corresponding fixed-reference row is present and agrees.

## Sequence semantics

The output distinguishes first action event, subsequent event interval, final action event, final animation remainder, and total sequence duration. The final attack duration is reported as the complete remaining animation duration; its event frame is reported separately. Fractional and invalid inputs do not yield a result.

The full formula and table rows are covered by `zeal.test.ts` and the generated Golden vectors. Published basis: [Amazon Basin](https://www.theamazonbasin.com/wiki/index.php/Zeal_attack_speed) and [D2R.org](https://d2r.org/tools/breakpoints/paladin).
