# IAS-3-A Golden Dataset 보고서

세 검증 데이터셋을 `D2R-3.3.93847-IAS-3A` 기준으로 관리합니다.

| 무기 | 데이터 파일 | 행 수 | 검증 범위 | SHA-256 |
|---|---|---:|---|---|
| Crystal Sword (`crs`) | `paladin-crs-a1-golden.json` | 201 | A1, IAS 0–200 | `39e8b8046482a7bbf4c0bb7ebc6fc52f83954df657193ddf5bdc275a3937a4d2` |
| Phase Blade (`7cr`) | `paladin-7cr-a1-golden.json` | 201 | A1, IAS 0–200 | `45a22b763c7ca12b6a438dc355b3b1e2a52a6879897e4e6439f63e5068141fbb` |
| War Hammer (`whm`) | `paladin-whm-a1-golden.json` | 318 | A1, IAS 0–317 | `6014cdb7559e965d97d714ccb7d1671947bd2cf3680ab08911d1202401fca8c0` |

Phase Blade와 War Hammer의 예상 프레임은 공개 성기사 1 Handed Swing 표의 breakpoint 행을 전사해 각 정수 IAS 구간으로 확장했습니다. 생성기는 원본 기존 Crystal Sword 데이터를 덮어쓰지 않습니다. 엔진 산출값을 기대 데이터로 되돌려 쓰지 않으며, 테스트가 각 행을 비교합니다. 빌드 및 원본 추출 파일 해시는 `lib/ias/data/evidence.json`에 남겼습니다.

War Hammer의 317은 검증 범위 상한입니다. 318 이상의 행은 없으며 엔진은 거부합니다.
