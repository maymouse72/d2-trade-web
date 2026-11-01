# IAS-4A-1 — 원본 데이터 발견 및 추출 기록

- 기준일: 2026-11-01
- 대상 게임 빌드: D2R 3.3.93847 (`.build.info`, branch `kr`)
- 프로젝트 HEAD: `8b19f3b0aebe15b169f2d0ec7af962eed8afd98f`
- 작업 범위: 원본 자료 확인 및 검증 문서 작성. 애플리케이션 코드·테스트·기존 Golden Dataset·Git 이력은 변경하지 않음.

## 발견 및 추출

기존 `C:\IAS-Validation-Temp\02-raw-extracted`에는 `skills.txt`, `skilldesc.txt`가 없었다. 설치된 D2R와 기존 CASCConsole을 사용해 필요한 세 파일만 로컬 추출했다. `--online` 옵션은 사용하지 않았고 도구 로그는 `Online: False`, `Loaded osi 3.3.93847`을 기록한다. 원본 표는 저장소에 복사하지 않았다.

| 파일 | 크기 | SHA-256 | 사용 |
|---|---:|---|---|
| `data/data/global/excel/skills.txt` | 270,115 B | `56944CB6B6B0F3C57F7B690977987A732AFEAFC961FA9DC969E7796E54C93F3F` | 스킬 ID, anim, seqtrans, UseAttackRate, 계산식 확인 |
| `data/data/global/excel/skilldesc.txt` | 95,092 B | `CDF11C518EAB9FE678616A237FC64B28CEA5EA51649EC641A14E09B06EA34B38` | 기술 설명/표시 문자열 조인 확인 |
| `data/data/global/excel/plrmode.txt` | 302 B | `23106DA08603BC215624E2837F3990B5ED4B5521BBE8B4A80B0EA6B6502FB8E3` | `Attack1`/`A1` 토큰 대응 확인 |

대상 설치 `C:\Program Files (x86)\Diablo II Resurrected`; `D2R.exe` 파일 버전 3.3.93847, SHA-256 `E1F5436E3D9687F644EF16938B1B183D1FDEF434F18CF66D852CF68F48CC8936`. 추출 도구 CASCConsole 1.0.240, SHA-256 `EBE3E3F8C880424C10CBA82B9D1527D16128EF2DF2CC84C9A8583DB25143021E`.

## 실행 재현

```powershell
CASCConsole.exe --mode Pattern --eparam 'data/data/global/excel/skills.txt' --dest 'C:\IAS-Validation-Temp\03-skills-extracted' --locale koKR --product osi --storage 'C:\Program Files (x86)\Diablo II Resurrected'
```

같은 명령에서 `skills.txt`를 각각 `skilldesc.txt`, `plrmode.txt`로 바꿔 두 나머지 파일을 추출했다. 결과 경로는 `C:\IAS-Validation-Temp\03-skills-extracted\data\data\global\excel\`이다. `skills.txt`는 429 데이터 행/296열, `skilldesc.txt`는 263행/111열이며, 공개 테이블 인덱스와 행·열 수가 일치한다.

## 기존 자료와 구분

이미 추출된 `animdata.d2`, `eanimdata.d2`, COF 및 `weapons.txt`를 재추출하지 않았다. 이전 로그와 해시는 `IAS-3B-A2-ANIMDATA-VALIDATION.md` 및 `IAS-3B-A2-INDEPENDENT-EVIDENCE.md`에 있다. 새 원본은 임시 추출 디렉터리에만 남기고 Git에 넣지 않는다.