> **후속 상태 (IAS-4-A-2):** 이 문서는 IAS-4-A 또는 초기 분석 당시의 판정을 기록합니다. 현재 구현·지원 범위·배포 판정은 [IAS-4-A-2 최종 보고](IAS-4A2-FINAL-REPORT.md)와 관련 IAS-4-A-2 보고서를 기준으로 확인하세요.

# IAS-4-A — Paladin Skill Animation Mapping

**Date:** 2026-11-01
**D2R build target:** 3.3.93847
**Decision:** new skills remain PROVISIONAL; their numeric outputs are blocked.

## Mapping

| UI skill | Skill ID | Candidate animation | Evidence status | Engine status | Reason |
|---|---:|---|---|---|---|
| Normal Attack | Not a `skills.txt` player skill row in this mapping | A1 (legacy selectable A2 diagnostic) | VERIFIED for existing A1 | SUPPORTED for A1 only | Existing 720-row A1 Golden Dataset and previous independent IAS validation remain intact. A2 remains UNVERIFIED. |
| Sacrifice | Not read from the local build row | A1 / weapon normal attack candidate | PROVISIONAL | UNVERIFIED | D2R.org's build 3.3.93847 mechanic page calls it a weapon attack and derives frames from `animdata.d2`; the local `skills.txt` row with `anim`, `seqtrans`, `UseAttackRate`, and related fields is absent, so the candidate cannot be tied to the exact local game table. |
| Vengeance | Not read from the local build row | A1 / weapon normal attack candidate | PROVISIONAL | UNVERIFIED | Same evidence limit as Sacrifice. D2R.org exposes Vengeance `*Id 111`, but not the relevant animation columns on the public mechanics page. |
| Conversion | Not read from the local build row | A1 / weapon normal attack candidate | PROVISIONAL | UNVERIFIED | D2R.org describes an ordinary melee weapon attack and publishes frames derived from the game's animation data; the exact local skills row is missing. |
| Zeal | Not extracted | Sequence / rollback investigation required | UNVERIFIED | UNSUPPORTED | IAS-4-B scope; not enabled. |
| Smite | Not extracted | Dedicated animation investigation required | UNVERIFIED | UNSUPPORTED | IAS-4-C scope; not enabled. |

## Animation fields requiring original-row verification

For Sacrifice, Vengeance and Conversion, the project does not claim exact `anim`, `seqtrans`, `seqnum`, `UseAttackRate`, weapon-class selection, `StartingFrame`, `AnimationSpeed`, FPD, action frame, or skill IAS modifiers. The required local `skills.txt` and `skilldesc.txt` files were not present in `C:\IAS-Validation-Temp\02-raw-extracted\data`; the available extracts include AnimData/COF artifacts used by earlier A1/A2 work, not these skill rows.

D2R.org describes its dataset as read from installed CASC tables for build 3.3.93847 and its Sacrifice, Vengeance and Conversion pages identify one-swing frames as derived from `animdata.d2` and the class attack animation. D2R Tools independently documents these three among skills using the weapon's normal attack animation. These are strong public leads, but they do not substitute for preserving and checking the exact build row in this project. Accordingly, no new Golden data or numbers are enabled.

## Input calculation policy

For existing single-weapon A1 support, weapon IAS + off-weapon IAS is summed and passed to the unchanged A1 calculation. This additive policy does not validate skill IAS, aura IAS, debuffs, dual wielding, or unverified skills. All unsupported or unverified combinations return no frame, EIAS, breakpoint, or table.

## Sources

- D2R.org [Sacrifice mechanics](https://d2r.org/mechanics/sacrifice), [Vengeance mechanics](https://d2r.org/mechanics/vengeance), [Conversion mechanics](https://d2r.org/mechanics/conversion), and [sources and method](https://d2r.org/data/sources).
- D2R Tools [IAS calculations reference](https://d2r-tools.com/ias/calculations) and [skills.txt schema](https://d2r-tools.com/data/skills).
- Local prior evidence: `docs/ias/IAS-3B-A2-ANIMDATA-VALIDATION.md`, `docs/ias/IAS-3B-A2-INDEPENDENT-EVIDENCE.md`; existing A1 golden JSON in `lib/ias/data/`.
