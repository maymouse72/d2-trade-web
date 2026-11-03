# IAS-5-B 야만용사 원본 데이터 및 독립 기준 검증

## 게임 빌드와 로컬 원본

로컬 추출 매니페스트는 D2R `3.3.93847`, branch `kr` (확인일 2026-11-01 KST)다. 파일들은 읽기 전용으로 조회했다.

| 파일 | SHA-256 |
|---|---|
| `02-raw-extracted/data/data/global/excel/weapons.txt` | `B0890901F87FD42FCB474CE835B6E1A9FE1E66DBAB4E7C2F236A3D9C3224F923` |
| `02-raw-extracted/data/data/global/excel/itemtypes.txt` | `AE957ABDE89A2D0276A55FEFFA809E0CCBDAF82F65C6EAED9443B886B960E26A` |
| `02-raw-extracted/data/data/global/animdata.d2` | `61EA70EDE691E88A4BF375D872668D74D6CDCA4ED5235034188ED1EB0D1E8EE5` |
| `02-raw-extracted/data/data/global/eanimdata.d2` | `C910E23DA67DE84D5D0295159C2725778FCE53AF3A819B3D989E71005420113C` |
| `03-skills-extracted/data/data/global/excel/plrmode.txt` | `23106DA08603BC215624E2837F3990B5ED4B5521BBE8B4A80B0EA6B6502FB8E3` |
| `03-skills-extracted/data/data/global/excel/skills.txt` | `56944CB6B6B0F3C57F7B690977987A732AFEAFC961FA9DC969E7796E54C93F3F` |
| `03-skills-extracted/data/data/global/excel/skilldesc.txt` | `CDF11C518EAB9FE678616A237FC64B28CEA5EA51649EC641A14E09B06EA34B38` |

`weapons.txt`에서 `crs`는 `wclass=1hs`, `speed` 공란이다. IAS 프로젝트의 기존 원장에서는 해당 무기의 resolved WSM을 0으로 기록하고 기존 Paladin Golden이 WSM 0 공개 표와 일치한다. 이는 원본 레코드의 공란을 독립 수치로 재해석한 것이 아니라 기존 검증된 무기 해석을 재사용한 범위다. `plrmode.txt`에는 A1 공격 모드가 정의되어 있다.

## 독립 자료

[D2R.org Barbarian breakpoints](https://d2r.org/tools/breakpoints/barbarian)는 build 3.3.93847의 야만용사 One-handed swing WSM 0 표에서 IAS 0–8→15f, 9–17→14f, 18–29→13f, 30–47→12f, 48–74→11f, 75–124→10f, 125+→9f를 게시한다. 같은 자료는 애니메이션 클래스 `BAA11HS`, 16 frames per direction, speed 256을 표시하고 `animdata.d2` 기반 산출 및 표 대조 방식을 설명한다.

야만용사 COF 파일은 기존 추출 디렉터리에 없었다. 따라서 COF 바이너리의 레이어 순서/공격 이벤트 또는 게임 내 실제 타격 시점을 검증했다고 주장하지 않는다. 이번 VERIFIED 범위는 공개 기준이 명시한 BAA11HS one-handed swing, WSM 0 조합에 제한한다. 빈 `speed` 필드의 해석이나 애니메이션 연결을 독립적으로 확정할 수 없는 다른 무기는 모두 차단한다.
