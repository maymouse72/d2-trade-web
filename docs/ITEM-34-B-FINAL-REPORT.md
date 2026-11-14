# ITEM-34-B — Final Report

**Decision: PASS / READY FOR DEPLOYMENT APPROVAL**

## Implemented

- Added mode-aware variants and resolver for Classic/LoD/RotW, online/offline, Ladder/Non-Ladder, and patch 3.3/3.4.
- Updated all 18 patch 3.4 unique variants; added the nine 3.3 unique Non-Ladder availability conditions and explicit Rogue's Bow choice group.
- Added Isenhart's Armory and Angelic Raiment mode variants.
- Added Eternity's 3.4 data variant; kept eight 3.3 runewords Ladder-only unless evidence confirms more.
- Added shared mode controls and version/status/source notices to `/runewords`, `/uniques`, and `/sets` without duplicating records.
- Preserved 102 runeword rows / 99 logical names, 415 unique rows, 34 sets / 135 pieces, and existing IDs.

## Verification

- Item data/resolver tests: 13/13 PASS.
- Existing IAS tests: 132/132 PASS.
- TypeScript: PASS.
- ESLint: PASS.
- Webpack production build: PASS (12 routes generated). It required local build write permission after sandboxed `.next` directory creation returned EPERM.
- Desktop/Mobile browser tests: PASS (6/6). The latest attached run passed Runewords, Uniques, and Sets in Desktop Chrome and Mobile Chrome 390×844, including overflow and page/console error assertions.
- Production URL and existing trade/PWA flows: not modified and not browser-tested in this task.

## Deployment

No commit, push, Vercel deployment, database change, or environment-variable change was made. The required automated and browser gates have passed. Requesting user approval to commit and push ITEM-34-B changes and deploy them to Vercel Production.

See the companion `ITEM-34-B-*.md` reports for data changes, model, catalog-specific results, tests, browser status, and review items.

