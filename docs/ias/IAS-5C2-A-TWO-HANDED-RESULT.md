# IAS-5-C-2-A Two-Handed Result

## Track result: PASS for one configuration

| Weapon | Code | D2R WSM | Equip mode | Animation | COF | Independent reference | Enabled |
|---|---|---:|---|---|---|---|---|
| Colossal Sword | `7fb` | +10 | Barbarian two-hand mode (`2handedwclass=2hs`; separate from its 1hs mode) | A1 / BAA12HS, FPD 18, speed 256, starting frame 0, attack slot 8 | `baa12hs.cof` extracted, SHA256 `284AD34056AB6F5B09C19720820BDFA0ECD3F35EE85372FA77AA418F6D056336` | Amazon Basin Barbarian 2-Handed Swing, WSM +10 column | Yes, two-hand mode only |

Calculation uses the established item IAS diminishing-return conversion and WSM EIAS adjustment, with the profile's 18 frames per direction. It is checked against the independently published frame threshold vector, not its own generated output. Colossal Sword one-hand mode is not included by this registration.

| IAS | 0 | 2 | 6 | 11 | 20 | 29 | 42 | 58 | 83 | 120 | 194 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames | 20 | 19 | 18 | 17 | 16 | 15 | 14 | 13 | 12 | 11 | 10 |

Support range 0–200 IAS. The 194 threshold reaches the table's 10-frame row; 195–200 retain 10 frames. IAS 201 is rejected. Exact boundary and all intermediate integers were tested. No claim is made for other 2HS/2HT/staff families.

Reference: [Amazon Basin Barbarian attack speed table](https://www.theamazonbasin.com/wiki/index.php/Barbarian_attack_speed), 2-Handed Swing section; local D2R 3.3.93847 weapons.txt and extracted aa12hs.cof provide the weapon/mode-specific mapping.
