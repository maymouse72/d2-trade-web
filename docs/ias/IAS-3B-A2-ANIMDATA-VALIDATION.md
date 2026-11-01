# IAS-3-B A2 AnimData/COF 원본 검증

## 판정 요약

기준 빌드는 `3.3.93847`이다. `C:\IAS-Validation-Temp`의 기존 추출 파일을 재사용했으며 CASC 추출은 반복하지 않았다. 원본 레코드와 COF 구조는 재확인했지만, 이 데이터만으로 실제 런타임에서 A2가 선택되는지 또는 A2의 시작 프레임 규칙이 A1과 같은지는 입증되지 않는다.

## 파일 출처 및 SHA-256

| 파일 | SHA-256 |
|---|---|
| `animdata.d2` | `61EA70EDE691E88A4BF375D872668D74D6CDCA4ED5235034188ED1EB0D1E8EE5` |
| `eanimdata.d2` | `C910E23DA67DE84D5D0295159C2725778FCE53AF3A819B3D989E71005420113C` |
| `paa11hs.cof` | `0447C43CEA898812DAD91E1F815C08CC6F5E68094CB767C3BEA9682C8FA2A855` |
| `paa21hs.cof` | `1F771BF18D40770AADF9BE7907587C171862B2F5BA976F8BBB2B552A9BEFC532` |
| `weapons.txt` | `B0890901F87FD42FCB474CE835B6E1A9FE1E66DBAB4E7C2F236A3D9C3224F923` |
| Parsed JSON | `902fdc4e20f2c118125df19c9da7e117bab29b6ffd4be21571ed052813148473` |

## 레코드 확인

| 필드 | A1 `PAA11HS` | A2 `PAA21HS` | 판정 |
|---|---:|---:|---|
| `animdata.d2` bucket / offset | 207 / 396032 | 208 / 398116 | 식별자와 레코드 경계 확인 |
| `eanimdata.d2` bucket / offset | 207 / 382112 | 208 / 384196 | 식별자와 레코드 경계 확인 |
| FPD | 15 | 15 | 원본 필드 일치 |
| AnimationSpeed | 256 | 256 | 원본 필드 일치 |
| pad | 0 | 0 | 원본 필드 일치 |
| Action event slot / raw code | 7 / 1 | 7 / 1 | 원본 바이트 동일; 의미 해석은 파서에 의존 |
| COF layers / FPD / directions | 9 / 15 / 16 | 9 / 15 / 16 | 헤더 값 일치 |
| COF frame table | slot 7만 1, 나머지 0 | slot 7만 1, 나머지 0 | 바이트 배열 일치 |
| COF layer-type 순서 | `5,2,3,1,8,4,0,9,7` | `3,5,2,1,8,0,4,9,7` | 구성 차이 확인 |

AnimData 전체는 3,661개, eAnimData 전체는 3,531개 레코드로 파싱되었고 두 파일 모두 정확한 끝 경계에서 종료됐다. COF의 우선순위 바이트가 달랐으나, 문서화되지 않은 바이트 의미를 추정하지 않았다.

## 검증 경계

- 원본에서 확인: A1/A2 식별자, 프레임 길이·속도 필드, COF 프레임/방향 수 및 frame table 바이트.
- 파서 해석: action event slot/code의 이름과 의미.
- 원본에서 확인 불가: 명시적 `StartingFrame` 필드. 이 자료에는 해당 이름이나 직접 대응 필드가 확인되지 않았다.
- 미확인: D2R 런타임의 A1/A2 선택 조건, 공격마다 선택되는지, 타격 등록 시점, A2의 실제 StartingFrame 적용.

따라서 A2 계산에서 StartingFrame=0을 직접 검증된 값으로 취급하지 않는다. 외부 공식만으로 만든 A2 후보 표는 [독립 근거 보고서](IAS-3B-A2-INDEPENDENT-EVIDENCE.md) 및 CSV에 후보로만 기록한다.
