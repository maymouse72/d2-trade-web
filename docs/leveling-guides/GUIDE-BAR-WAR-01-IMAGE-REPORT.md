# GUIDE-BAR-WAR-01 직업 이미지 보고서

## 원본 및 분리

- 원본: 사용자가 제공한 `a_clean_transparent_background_composite_of_eight.png` (2172×724, 투명도 포함)
- 좌→우 캐릭터 순서대로 8개 독립 이미지로 분리했습니다.
- 인물의 발끝·효과 장식이 보존되도록 각 인물 좌우 경계를 분리했고, 원본 알파 채널을 유지했습니다.
- WebP로 변환했으며 개별 리사이즈로 캐릭터의 원본 세로 비율을 유지했습니다.

| 직업 | 경로 | 픽셀 | 용량 |
|---|---|---:|---:|
| 원소술사 | `public/images/leveling-guides/sorceress.webp` | 272×724 | 78,054 B |
| 성기사 | `public/images/leveling-guides/paladin.webp` | 260×724 | 66,326 B |
| 강령술사 | `public/images/leveling-guides/necromancer.webp` | 268×724 | 71,306 B |
| 암살자 | `public/images/leveling-guides/assassin.webp` | 285×724 | 64,588 B |
| 아마존 | `public/images/leveling-guides/amazon.webp` | 265×724 | 76,248 B |
| 드루이드 | `public/images/leveling-guides/druid.webp` | 298×724 | 85,814 B |
| 야만용사 | `public/images/leveling-guides/barbarian.webp` | 257×724 | 58,312 B |
| 악마술사 | `public/images/leveling-guides/warlock.webp` | 267×724 | 79,560 B |
| **합계** |  |  | **580,208 B** |

## 적용 및 화면 확인

- 각 공략 히어로에서 Next Image로 표시하고 intrinsic size를 제공해 레이아웃 이동을 줄였습니다.
- PC에서는 오른쪽 세로 이미지, 모바일에서는 텍스트 아래 이미지로 배치하고 원본 비율을 `object-fit: contain`으로 유지합니다.
- 모든 8개 파일을 투명 알파 포함 WebP로 확인하고 연락표(contact sheet)로 분리 경계를 육안 점검했습니다.
- Playwright의 데스크톱 및 390×844 모바일 프로젝트에서 8개 페이지 각각 `naturalWidth > 0`, 세로 크기, 가로 넘침을 확인했습니다.
- 브라우저 이미지 테스트: PC·모바일 각각 통과.
