# GUIDE-AMZ-DRU-01 구현 기록

## 페이지 및 메뉴

- `/game-info/leveling-guides/amazon`: 아마존 자벨마 공략 및 검색 메타데이터
- `/game-info/leveling-guides/druid`: 드루이드 엘리드루 공략 및 검색 메타데이터
- 기존 동적 상세 경로 `generateStaticParams`에 두 직업을 추가해 정적 렌더링
- 직업 목록에서 두 카드를 활성 링크로 바꾸고 검색어에 한국어·영문·빌드 별칭을 등록
- 안내 문구를 현재 제공하는 여섯 직업에 맞게 조정

## 구현 파일

- `app/game-info/leveling-guides/GuideDirectory.tsx`
- `app/game-info/leveling-guides/GuideContent.tsx`
- `app/game-info/leveling-guides/[job]/page.tsx`
- `app/game-info/leveling-guides/content/amazon.json`
- `app/game-info/leveling-guides/content/druid.json`
- `lib/leveling-guides/skill-builds.ts`
- `tests/guide-skill-validation.test.ts`
- `tests/leveling-guides-browser.spec.ts`
- `docs/leveling-guides/GUIDE-AMZ-DRU-01-{CONTENT-REVIEW,SKILL-VALIDATION,IMPLEMENTATION,TEST-RESULTS,FINAL-REPORT}.md`

## 공통 기능 재사용

상세 화면, breadcrumb, 검색, 목차, Markdown 표·링크 렌더링, 체크리스트, responsive table wrapper를 기존 GuideContent에 연결했습니다. 기존 직업 JSON과 본문은 수정하지 않았습니다. 룬워드 도감 원본 데이터는 변경하지 않고 기존 ID anchor에 연결했습니다.

## 기술 검증기

Amazon/Druid 실제 기술 레벨·선행 조건 데이터와 40·85레벨 빌드를 `skill-builds.ts`에 추가했습니다. progression step에 `unspentPoints`를 선택적으로 허용해 레벨 5 저장 포인트도 합계와 함께 검증합니다. 기존 캐릭터 공략 검증도 유지합니다.

## 변경 제한 확인

거래·IAS 엔진·아이템 도감 데이터·Supabase·PWA/Push·환경 변수를 변경하지 않았습니다. 원래 워킹 트리에 있던 IAS 및 ITEM-34-A 미커밋 자료는 이번 작업 변경에 포함하지 않습니다.
