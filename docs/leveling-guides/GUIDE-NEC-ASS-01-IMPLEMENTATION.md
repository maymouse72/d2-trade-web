# GUIDE-NEC-ASS-01 — 구현 내용

## 추가·수정 파일

- `app/game-info/leveling-guides/content/necromancer.json`, `assassin.json`: 검토 후 수정한 원고.
- `app/game-info/leveling-guides/GuideDirectory.tsx`: 8개 직업 카드의 기존 구성을 유지하면서 별칭 검색을 추가하고, 신규 공략 두 개를 연결.
- `app/game-info/leveling-guides/[job]/page.tsx`: 두 정적 페이지, 고유 메타데이터를 추가.
- `app/game-info/leveling-guides/GuideContent.tsx`: 기존 공통 기사 렌더러를 재사용하고 목차 ID 및 체크리스트 렌더링 연결.
- `app/game-info/leveling-guides/Checklist.tsx`: 키보드 사용이 가능한 진행 체크리스트 및 완료 수 표시.
- `app/game-info/leveling-guides/leveling-guides.module.css`: 검색·체크리스트 스타일을 기존 반응형 디자인에 추가.
- `app/runewords/RunewordCatalog.tsx`: 안정적인 내부 ID를 카드에 노출해 두 공략에서 정확한 룬워드 항목으로 이동.
- `lib/leveling-guides/skill-builds.ts`, `tests/guide-skill-validation.test.ts`: 스킬 투자 검증 로직과 데이터 테스트.
- `tests/leveling-guides-browser.spec.ts`, `package.json`: PC·390×844 브라우저 테스트 및 `test:guides`, `test:guides:browser` 스크립트.

## 메뉴·도감 연계

기존 `/game-info/leveling-guides` 메뉴 경로를 그대로 사용하며 강령술사·암살자 카드를 활성화했습니다. 룬워드 링크는 프로젝트 도감 ID를 사용합니다: 잠행 70, 전승 71, 영혼 검 59, 영혼 방패 60, 잎새 69, 통찰 89, 연기 56, 순백 42.

## 변경하지 않은 범위

룬워드 원본 데이터, IAS 계산 엔진, 거래소, Supabase, PWA/Push 및 환경변수는 수정하지 않았습니다. 기존 소서리스·성기사 원고도 수정하지 않았습니다.
