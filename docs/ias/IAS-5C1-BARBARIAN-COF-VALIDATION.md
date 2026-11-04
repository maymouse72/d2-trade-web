# IAS-5-C-1 Barbarian COF 원본 검증

## 확보

- D2R product `osi`, version `3.3.93847`, branch `kr`.
- 기존 합법 설치 경로를 CASCConsole `1.0.240` local storage mode로 읽었고, `data/data/global/chars/ba/cof/*.cof`만 별도 OS 임시 디렉터리에 추출했다.
- 게임 설치 파일은 수정하지 않았다. 추출 COF 바이너리는 저장소에 추가하지 않았다.
- 대상 추출 폴더: `%LOCALAPPDATA%\Temp\IAS-5C1-COF-afc5ea69122d4ae2970f0a55167a2850\data\data\global\chars\ba\cof` (환경상 절대 위치 `C:\Users\김용규\AppData\Local\Temp\IAS-5C1-COF-afc5ea69122d4ae2970f0a55167a2850\...`).

## COF 레코드

| COF | bytes | SHA-256 | layers / FPD / directions | frame event bytes |
|---|---:|---|---|---|
| `baa11hs.cof` | 2,429 | `95E5A8918405E94BB2BFD23AAEC6A3E981A4D72C32ED00FF06BD3CF457C1EB00` | 9 / 16 / 16 | slot 7 raw value 1; all other slots 0 |
| `baa21hs.cof` | 2,429 | `06FAC607B72A71D4946677E2D16B271EC9C13401F7D6DB8E5BF4BB41F775D749` | 9 / 16 / 16 | slot 7 raw value 1; all other slots 0 |
| `baa11ht.cof` | 2,429 | `218BE013FDD2B551081F4CA5E6326460B9FD889E2E7D1B90D003392525536BF4` | 9 / 16 / 16 | slot 7 raw value 1 |
| `baa11ss.cof` | 2,429 | `6A981074D7BAEDA0B14569972509F4238606B826E81978F16CCF5394525B81D2` | 9 / 16 / 16 | slot 7 raw value 1 |

`baa11hs.cof`와 `baa21hs.cof`의 9 layer 각각에 weapon class `1hs`가 기록되어 있다. A1/A2의 layer ordering은 서로 다르므로 전체 레이어 바이트 배열을 동일하다고 취급하지 않았다. `baa11ht`는 `1ht` layer도 포함하며 `baa11ss`는 `1ss` layer를 포함하므로 이들을 `1hs` 조합의 근거로 사용하지 않는다.

COF event raw value 1은 AnimData format parser에서 Attack code로 분류되고, event slot 7은 공개 FrameDataActionFlag 7과 맞는다. 이는 리소스의 attack event 확인이며 실제 게임 피해 등록 시점 실측 주장은 아니다.
