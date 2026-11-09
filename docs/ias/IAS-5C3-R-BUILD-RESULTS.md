# IAS-5-C-3-R Build Results

Date: 2026-11-09.

| Check | Result |
|---|---|
| `npm run test:ias` | PASS, 61/61 |
| `npx tsc --noEmit` | PASS on sequential rerun. Initial parallel run overlapped `.next/types` regeneration and failed with transient TS6053 missing generated files. |
| `npm run lint` | PASS |
| `npx next build --webpack` restricted run | EPERM creating `.next/server/app/game-info.segments/game-info` during static generation |
| Webpack with previously approved execution method | PASS; all 12 static pages generated and routes finalized |
| Existing Golden integrity | PASS; the pre-C3 baseline source hash remains `8ECDC0F2EC30C5A7FE95CD5F69EABA434FE4FC9C3DC448AD4A7D3183A724A8BF`; prior rows unchanged |
| `git diff --check` | PASS |

No `.next` directory was deleted, no persistent configuration was changed, and no user files were cleaned up.
