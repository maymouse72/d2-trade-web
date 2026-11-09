# IAS-5C3 Track C — Whirlwind

상태: **BLOCKED**, no numeric support enabled.

The [official 2.4.3 notes](https://news.blizzard.com/en-us/article/23814050/diablo-ii-resurrected-patch-2-4-3-now-live) state that Whirlwind was changed to include IAS from all gear and changed dual-wield frame handling. Thus older [Amazon Basin Whirlwind](https://theamazonbasin.com/wiki/index.php/Whirlwind) cadence rules cannot be treated as current D2R truth. Warren's public issue tracker contains reports about possible Whirlwind combination/timing inaccuracies ([#38](https://github.com/Warren1001/IAS_Calculator/issues/38), [#42](https://github.com/Warren1001/IAS_Calculator/issues/42)). TrAdia output alone does not resolve this conflict.

| Scenario | Result |
|---|---|
| 1HS / 2HS / dual-wield, IAS changes | No complete matched and independently confirmed cadence matrix |
| First hit vs subsequent intervals | Not validated for current build |
| Reference discrepancy/risk | Legacy rule superseded; calculator issues leave uncertainty |
| Implementation | Blocked; no numeric result or Golden rows |

Minimal reproduction: use a fixed target and build 3.3.93847; record first and subsequent hit-event frames for one-handed, two-handed, equal dual, and mixed dual setups; repeat with weapon IAS and gear IAS varied separately and with swapped hands. Compare only after confirming the exact current patch rules.

Reference calculators: [TrAdia](https://tradia.me/en/diablo2/weapon_speed_calculator), [Warren1001](https://warren1001.github.io/IAS_Calculator/).
