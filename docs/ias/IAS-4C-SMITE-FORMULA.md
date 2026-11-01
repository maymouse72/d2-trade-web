# IAS-4-C Smite Formula Validation

## Supported formula

For equipment IAS `I`, weapon speed modifier `WSM`, item IAS conversion `IEIAS`, effective IAS `EIAS`, animation speed `V`, and final animation frames `F`:

```text
IEIAS = floor(120 × I / (120 + I))
EIAS  = clamp(IEIAS − WSM, −85, 75)
V     = floor(256 × (100 + EIAS) / 100)
F     = ceil(256 × (12 − 0) / V) − 1
```

The S1 animation data supplies 12 FPD and speed 256; the `−1` final-frame convention is corroborated by the published Smite table. The formula is implemented only in the Smite engine and checked against a fixed threshold table. It is not copied from Zeal's multi-hit sequence formula.

## Fixed reference rows

| Weapon | WSM | IAS breakpoints → frames | Supported IAS maximum |
|---|---:|---|---:|
| Crystal Sword | 0 | 0→11, 11→10, 26→9, 48→8, 86→7, 180→6 | 200 |
| Phase Blade | -30 | 0→9, 5→8, 24→7, 65→6 | 72 |
| War Hammer | +20 | 0→15, 2→14, 7→13, 15→12, 24→11, 40→10, 63→9, 99→8, 168→7, 395→6 | 456 |

Tradia interactive outputs at 0 IAS: Crystal Sword 11 frames, Phase Blade 9, War Hammer 15. Its weapon-specific threshold rows match the published Smite table. The support maxima are the smallest integer IAS values that reach the EIAS 75 ceiling for each WSM: 200, 72 and 456. Values above those caps add no verified attack-speed range and are rejected.

## Interpretation limits

This is the full 12-FPD attack animation length, not a measured hit frame, recovery time, repeated Smite interval, or time-to-damage. Attack event slot 7 is preserved as source evidence but is not exposed as an empirically measured hit timestamp. Supported inputs assume Paladin human form, shield equipped, listed one-handed weapon, no Fanaticism or other speed modifiers, no A2, and no non-Smiter class.
