# IAS-4-D — Golden Dataset report

## New Long Sword Zeal coverage

- Game build: `3.3.93847`; class: Paladin; skill ID: 106; animation: A1; weapon: `lsd`; WSM: -10.
- Range: 0–142 IAS; hit count: 2–5.
- New rows: **572** (`143 IAS values × 4 hit counts`). These are reference-table expansions, not 572 independent observations.
- Independent boundary rows: **9**, at IAS `0, 7, 8, 18, 35, 42, 60, 109, 142`; all displayed first/final animation frames match the model.
- Evidence status is stored in `paladin-zeal-golden.json` as `REFERENCE_TABLE_EXPANSION`, with a separate `INDEPENDENT_BREAKPOINT_CROSS_CHECK` reference object.

## Existing Golden preservation

`paladin-zeal-golden.json` baseline SHA-256 at the task base was `674723c43214e1ce83872d596a27062107cc2160762a188b7ef2c026ce91bd19`. The expanded file SHA-256 is `b1d104e5be3f733f7f0fb37b70b9a77d778cd7fc25071d1579f268fa61578629`.

The three pre-existing datasets were compared object-for-object with the task-base version: **all 3,564 existing rows are unchanged**. New total: **4,136 rows**, adding only the Long Sword 572-row dataset.

Other protected dataset hashes remain as recorded before this task:

| Dataset | SHA-256 |
|---|---|
| Crystal Sword A1 | `39E8B8046482A7BBF4C0BB7EBC6FC52F83954DF657193DDF5BDC275A3937A4D2` |
| Phase Blade A1 | `45A22B763C7CA12B6A438DC355B3B1E2A52A6879897E4E6439F63E5068141FBB` |
| War Hammer A1 | `6014CDB7559E965D97D714CCB7D1671947BD2CF3680AB08911D1202401FCA8C0` |
| Skill-derived A1 | `08C709E81EF34A0CA9ADFE237BB6FF333CD1091DEBA89D729CED49639DD8258` |

The Long Sword IAS=0 five-hit sequence is 41 frames; at IAS=142 it is 24 frames. The table cross-check is not a substitute for in-game measurement.
