> **후속 상태 (IAS-4-A-2):** 이 문서는 IAS-4-A 또는 초기 분석 당시의 판정을 기록합니다. 현재 구현·지원 범위·배포 판정은 [IAS-4-A-2 최종 보고](IAS-4A2-FINAL-REPORT.md)와 관련 IAS-4-A-2 보고서를 기준으로 확인하세요.

# IAS-4-A — UI Changes

- Replaced the primary A1/A2 selector with a Paladin attack-skill selector: Normal Attack, Sacrifice, Vengeance and Conversion selectable; Zeal and Smite disabled as planned.
- Added separate weapon IAS and off-weapon equipment IAS fields, a visible combined IAS total and equipment IAS stepper controls.
- Preserved the existing total-IAS UI-model API for callers/tests.
- Added a collapsed advanced Normal Attack A1/A2 diagnostic area. A2 still returns no numbers or breakpoint table; it is not an active game-skill mapping.
- On an unverified skill, the current result panel and breakpoint table are removed and a Korean verification reason is shown. Switching back to Normal Attack restores the correct A1 result for the current weapon and IAS.
- Kept existing black/gold visual styling, responsive single-column layout and semantic labels.
- Skill states are sourced from `lib/ias/skills.ts`, avoiding separate UI and engine status definitions.

## Browser review

PC browser: verified split 20/20 gives total IAS 40; Sacrifice/Vengeance/Conversion switches suppress prior frames and table; switching back restores Normal Attack; Phase Blade at IAS 40 shows 9 frames and the 24 IAS current threshold.

Mobile browser viewport: 390×844; weapon and skill selection, numeric input, status output, and scrolling verified. `document.documentElement.scrollWidth` and `document.body.scrollWidth` were 375 CSS pixels, below the 390-pixel viewport. Further checks are in the test report.
