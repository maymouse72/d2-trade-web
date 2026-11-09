# IAS-5-C-2 Impact Analysis

Changed application scope: Barbarian class skill registry, Barbarian animation-profile calculation, breakpoint lookup, and IAS/browser tests. The existing one-hand registry and its frame table remain unchanged. No global layout, authentication, database, trade, comments, experience, runewords/sets, PWA or Push code was modified.

The IAS suite, TypeScript, lint, production Webpack build and calculator PC/mobile browser suite were run. Trade and non-IAS pages were omitted because changed code is isolated to the calculator registry/engine/UI model and IAS test paths; there was no shared route/layout or data change. Existing user-modified reports and `debug.log` were not staged or rewritten.

> Recovery update: this preliminary report is superseded by [IAS-5C-2 Recovery Summary](IAS-5C2-RECOVERY-SUMMARY.md) and the ten IAS-5C2-* recovery reports. Track A is now verified for 7fb two-hand mode; B/C remain blocked. See the recovery reports for final test/build/browser results and deployment decision.
