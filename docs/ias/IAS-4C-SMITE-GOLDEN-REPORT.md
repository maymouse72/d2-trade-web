# IAS-4-C Smite Golden Dataset Report

Golden data is a fixed published threshold table expanded into complete supported integer IAS ranges; expected frame counts do not call the production calculation formula. Each expanded row contains IAS, EIAS, expectedFrames and breakpoint. Dataset metadata records build 3.3.93847, Skill ID 97, S1, weapon code, WSM, IAS range, evidence source and verification status.

| Weapon | WSM | IAS rows | Fixed breakpoints | Range |
|---|---:|---:|---:|---:|
| Crystal Sword | 0 | 201 | 6 | 0–200 |
| Phase Blade | -30 | 73 | 4 | 0–72 |
| War Hammer | +20 | 457 | 10 | 0–456 |
| **Total** | | **731** | **20** | |

Source rows are the D2X2ch published Smite table, cross-checked at build 93847 against Tradia interactive output and original D2R weapon/animation records. Golden table values are held separately from the frame formula. All 731 calculated results and EIAS values match.

Existing Golden SHA-256 checks before and after IAS-4-C implementation:

| Dataset | SHA-256 |
|---|---|
| Crystal Sword A1 | `39E8B8046482A7BBF4C0BB7EBC6FC52F83954DF657193DDF5BDC275A3937A4D2` |
| Phase Blade A1 | `45A22B763C7CA12B6A438DC355B3B1E2A52A6879897E4E6439F63E5068141FBB` |
| War Hammer A1 | `6014CDB7559E965D97D714CCB7D1671947BD2CF3680AB08911D1202401FCA8C0` |
| Derived Paladin skill vectors | `08C709E81EF34A0CA9ADFE2378BB6FF333CD1091DEBA89D729CED49639DD8258` |
| Paladin Zeal | `674723C43214E1CE83872D596A27062107CC2160762A188B7EF2C026CE91BD19` |

All existing hashes match their pre-change values; no existing Golden file was edited.
