# IAS-5C3 Track B — Dual Wield / Double Swing

상태: **BLOCKED**, no numeric support enabled.

The reference interfaces expose primary/secondary weapons and hand IAS fields, but the required matched matrix (same WSM, mixed WSM, swap, primary-only IAS, secondary-only IAS, Double Swing) was not fully recorded with matched conditions on both calculators. An interface's available inputs do not establish correct hand selection or attack event order. Amazon Basin documents legacy hand/order behavior, but it does not establish current D2R behavior for every skill. The C2 source review also found that COF presence does not establish per-hit timing.

| Requirement | Result |
|---|---|
| Primary/offhand ordering and swap rules | Not sufficiently confirmed for activation |
| WSM aggregation by hand and skill | Not established for supported build |
| Double Swing event-to-hand sequence | Not independently verified |
| Implementation | None; guarded as unsupported and tested to return no numeric frames |

No external outputs were counted as a complete B comparison set. Minimal game reproduction when resuming: record both weapon IDs/slots and IAS=0; test equal and mixed WSM; swap slots; then vary only primary IAS, only secondary IAS; repeat Double Swing. Capture frame-by-frame first and subsequent hit events on a fixed target in D2R build 3.3.93847. Compare against both calculators under the identical inputs.

References: [Amazon Basin Two weapons](https://theamazonbasin.com/wiki/index.php/Two_weapons), [Warren1001](https://warren1001.github.io/IAS_Calculator/), [TrAdia](https://tradia.me/en/diablo2/weapon_speed_calculator).
