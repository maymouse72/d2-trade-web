# IAS-4-A-2 파생 Golden 검증

## 출처와 분류
기존 Crystal Sword, Phase Blade, War Hammer Paladin A1 Golden 720행은 수정하지 않았다. 기술 파생 파일 `lib/ias/data/paladin-a1-skill-derived-golden.json`은 각 무기 행을 Sacrifice(96), Vengeance(111), Conversion(116)에 매핑한 9개 그룹, 총 2,160행이다. 따라서 `DERIVED_RANGE_VALIDATION`이며 별도 인게임 실측 Golden으로 표현하지 않는다.

## 재현성
생성기: `node lib/ias/scripts/generate-skill-derived-golden.mjs`.
생성 데이터 SHA-256: `08c709e81ef34a0ca9adfe2378bb6ff333cd1091deba89d729ced49639dd8258`.
원본 파일 SHA-256:
- CRS: `39e8b8046482a7bbf4c0bb7ebc6fc52f83954df657193ddf5bdc275a3937a4d2`
- Phase Blade: `45a22b763c7ca12b6a438dc355b3b1e2a52a6879897e4e6439f63e5068141fbb`
- War Hammer: `6014cdb7559e965d97d714ccb7d1671947bd2cf3680ab08911d1202401fca8c0`
- 추출 `skills.txt`: `56944cb6b6b0f3c57f7b690977987a732afeafc961fa9dc969e7796e54c93f3f`
- 추출 `skilldesc.txt`: `cdf11c518eab9fe678616a237fc64b28cea5ea51649ec641a14e09b06ea34b38`
- 추출 `plrmode.txt`: `23106da08603bc215624e2837f3990b5ed4b5521bbe8b4a80b0ea6b6502fb8e3`

## 결과
테스트는 9그룹/2,160행의 고유성, 원본 해시 연결, 전체 계산기 결과 일치 및 경계값을 확인했다. 26/26 테스트 통과. 이 결과는 표의 재생성·엔진 일치를 검증하며 실제 게임에서 기술별 타격 타이밍을 측정했다는 뜻은 아니다.
