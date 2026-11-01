> **후속 상태 (IAS-4-A-2):** 이 문서는 IAS-4-A 또는 초기 분석 당시의 판정을 기록합니다. 현재 구현·지원 범위·배포 판정은 [IAS-4-A-2 최종 보고](IAS-4A2-FINAL-REPORT.md)와 관련 IAS-4-A-2 보고서를 기준으로 확인하세요.

# IAS-4-A — Skill Evidence Review

**Build:** D2R 3.3.93847. **Review result:** three skill mappings PROVISIONAL; no new Golden rows.

## Evidence by skill

| Skill | Game-table identity / attack evidence | Animation / speed evidence | Independent check | Result |
|---|---|---|---|---|
| Sacrifice | D2R.org's current-build page identifies the Paladin level-1 single melee weapon attack and states that it is a weapon hit. The local `skills.txt` row is unavailable. | D2R.org says its per-swing frames are derived from build 3.3.93847 `animdata.d2` and the class attack animation. D2R Tools classifies Sacrifice as using the weapon normal attack animation. | D2R.org's published animation derivation and D2R Tools' category agree, but exact local skill-row fields and local extraction hash are unavailable. | PROVISIONAL; engine output blocked. |
| Vengeance | D2R.org identifies Paladin skill `*Id 111`, one melee weapon attack, from its current-build game table. Local row unavailable. | Same derived class-attack frames and D2R Tools standard-skill classification. Exact local `anim` and `UseAttackRate` fields unverified. | Public sources agree at category level; exact build-specific local-row check remains missing. | PROVISIONAL; engine output blocked. |
| Conversion | D2R.org identifies a single melee weapon hit from its current-build table. Local row unavailable. | D2R.org publishes frames derived from `animdata.d2`; D2R Tools classifies Conversion as normal weapon attack animation. Exact local row unavailable. | Public sources agree at category level, but cannot bind evidence to the project's own extracted build row. | PROVISIONAL; engine output blocked. |

## Source independence and limits

D2R.org states that it reads game tables and `animdata.d2` from installed CASC storage for build 3.3.93847, with stated re-pull comparison on 2026-10-15. Its skill mechanics pages publish a rule-derived attack frame table and cite the Amazon Basin attack-speed rule. D2R Tools lists standard-attack skill categories and credits the original reverse-engineered IAS calculator source. Those pages are useful cross-checks but are not counted as three independent implementations. Warren1001 and Icy Veins explicitly share calculator credits and are treated as one related lineage, not independent proof.

The local original-data folder was inspected. It contains the prior animation extracts and parsed artifacts, but no `skills.txt` or `skilldesc.txt`. Since the main request requires original D2R data plus independent calculation grounds and forbids assuming identical animation from matching calculators, this report does not promote the three candidates to VERIFIED. No skill-specific animation frame, action frame, SIAS value, or game-mode switch is inferred.

## Evidence needed to promote a skill

1. Preserve the exact build 3.3.93847 `skills.txt` and `skilldesc.txt` rows with source URL/path, extraction timestamp, hash, row key and relevant columns.
2. Verify the player's `anim`, `seqtrans`, `seqnum`, `UseAttackRate`, attack functions, weapon requirements and any speed modifiers against `PlrMode.txt`/engine semantics.
3. Link selected mode to the Paladin/weapon-class `animdata.d2` entry, including starting frame, animation speed, FPD and action frame.
4. Independently recompute the frame formula and compare breakpoint boundaries against a source lineage that does not derive from the same calculator.
5. Add skill-specific test vectors and only then generate separate skill Golden rows.

## Source links

- [D2R.org sources and method](https://d2r.org/data/sources)
- [Sacrifice](https://d2r.org/mechanics/sacrifice), [Vengeance](https://d2r.org/mechanics/vengeance), [Conversion](https://d2r.org/mechanics/conversion)
- [D2R.org Paladin breakpoints](https://d2r.org/tools/breakpoints/paladin)
- [D2R Tools IAS calculations](https://d2r-tools.com/ias/calculations)
- [skills.txt field guide](https://d2r-tools.com/data/skills)
