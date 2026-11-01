# IAS-4B-2 Zeal Golden Dataset

## Dataset lineage

- Fixed input: `lib/ias/data/paladin-zeal-1hs-reference.json`
- Fixed source: published Paladin 1HS Zeal First/Follow/Last reference table
- Generator: `lib/ias/scripts/generate-zeal-golden.mjs`
- Expanded output: `lib/ias/data/paladin-zeal-golden.json`
- Generator inputs: three weapon WSM values and the Zeal hit counts 2–5

## Coverage

The generated data contains 3,564 vectors: every integer IAS from 0 through each weapon's Zeal-specific cap, for all four hit counts. Each row records the EIAS state, first/follow/final frame components, hit count, and sequence total. The 64 fixed source rows cover all integer EIAS from −85 to 75.

## Validation

- Fixed table rows compared: 64/64 match
- Integer EIAS cells checked: 161/161 match
- Expanded IAS/hit-count vectors: 3,564/3,564 generated and checked
- Missing or conflicting runtime row: calculation refuses to return numeric results
- Existing single-hit Golden files: unchanged in this change

Regenerate with `node lib/ias/scripts/generate-zeal-golden.mjs`. The generation script is deterministic and reports a mismatch by source EIAS before output is accepted.
