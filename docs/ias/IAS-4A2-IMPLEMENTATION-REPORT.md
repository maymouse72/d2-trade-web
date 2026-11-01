# IAS-4-A-2 구현 보고

## 범위
D2R 3.3.93847 Paladin 인간형 한손 무기의 A1 단타 조건에서 희생(Sacrifice, 96), 복수(Vengeance, 111), 전향(Conversion, 116)을 활성화했다. Zeal/Smite와 A2, 기술·오라 추가 IAS 등은 계산을 차단한다.

## 데이터와 구현
- 기존 A1 Golden 원본 720행은 그대로 보존했다. 기술별 데이터는 3무기×3기술 9그룹, 2,160행이며 기존 A1 원본에서 파생된 범위 일치 검증 자료다. 개별 기술의 독립 인게임 측정값은 아니다.
- `lib/ias/scripts/generate-skill-derived-golden.mjs`에서 파생 파일과 `lib/ias/data/evidence.json`의 버전·해시·원본 출처를 재생성한다.
- 계산 엔진은 지원 스킬별 파생 기대값을 확인하고, UI 기준표도 같은 기술 데이터에서 생성한다.
- 안내문에 검증 범위와 제한을 표시하고, A2 진단 선택 시 계산 숫자와 기준표를 숨긴다.

## 검증·배포 결과
IAS 자동 테스트 26/26, TypeScript, ESLint, `npx next build --webpack` 통과. Vercel Production 배포 `dpl_7GTHWiCNWvokAmq33yqktMkkgCRA` (커밋 `67c0b2cd308058ebfa82dd7165334f9dd1888320`) READY이며 `www.d2jugobatgo.com` alias를 연결했다. 운영 War Hammer 316→9프레임, 317→8프레임, 318→317 상한, PC UI와 콘솔을 확인했다. 모바일 390×844는 최종 로컬 Production build에서 확인했다.

상세 결과는 `IAS-4A2-TEST-RESULTS.md`, `IAS-4A2-BROWSER-TEST-RESULTS.md`, `IAS-4A2-REGRESSION-RESULTS.md`, `IAS-4A2-DEPLOYMENT-REPORT.md`를 참고한다.
