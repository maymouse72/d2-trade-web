# IAS-5-C-1 브라우저 결과

Playwright project runs the existing separate Chrome profile at desktop 1365×900 and mobile 390×844. It checks the five verified Barbarian weapon options, per-weapon IAS/frame changes and breakpoint table, A2/missing-WSM blocking, class switching, legacy Paladin Fanaticism/Zeal/Smite behavior, Korean/English search, console errors, and horizontal overflow.

- Local desktop 1365×900: PASS
- Local mobile 390×844: PASS
- Browser/page console errors: 두 환경 모두 0
- Horizontal overflow: 모바일 viewport에서 `scrollWidth <= clientWidth` PASS
- Production smoke: 배포 후 실행 예정
