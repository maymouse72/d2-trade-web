# IAS-4-E Fanaticism Formula

D2R `dm34` progression is implemented as:

```text
t = floor(110 × level / (level + 6))
SIAS = min(floor(t × (40 - 10) / 100) + 10, 40)
```

The resulting SIAS is added after gear IAS diminishing returns:

```text
IEIAS = floor(120 × TotalIAS / (120 + TotalIAS))
EIASraw = IEIAS + FanaticismSIAS - WSM
EIAS = clamp(EIASraw, -85, +75)
```

The same validated EIAS is fed into the existing A1, Zeal, or Smite animation formula. The three engines retain their distinct frame equations. Fanaticism off (level `0`) preserves the prior computation exactly. Generic unverified skill/buff/debuff IAS remains blocked.

Supported effective Fanaticism input is 1–60, inclusive, with off represented by 0. Level 20 is +35 SIAS; level 60 is +40 SIAS. Levels outside this range are rejected.

Formula source: D2R `skills.txt` (`dm34`, parameters 10 and 40) and [D2R IAS Calculations Reference](https://d2r-tools.com/ias/calculations). Animation formulas cross-checked against the independent Paladin frame references already used by the calculator.