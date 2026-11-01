# IAS-4A-1 — Paladin 스킬 원본 레코드

빌드 3.3.93847의 로컬 `skills.txt`를 `skilldesc.txt`와 키 조인해 확인했다. 아래 값은 필요한 열만 전사했으며 전체 Blizzard 표를 복제하지 않는다. 빈 값은 원본 필드가 비어 있음을 뜻한다.

| 기술 | *Id | skilldesc 키 | class | anim | seqtrans | seqnum | UseAttackRate | requiresweapon | itypea1 | 관련 계산 |
|---|---:|---|---|---|---|---|---:|---|---|---|
| Sacrifice | 96 | `sacrifice` | pal | A1 | A1 | 2 | 1 | (blank) | mele | `calc1=ln12+skill('Redemption'.blvl)*par8+skill('Fanaticism'.blvl)*par7`; `calc2=max(par6,par5-lvl/par3)` |
| Vengeance | 111 | `vengeance` | pal | A1 | A1 | (blank) | 1 | (blank) | mele | `calc1/2/3`는 화염/냉기/번개 피해 비율 계산 |
| Conversion | 116 | `conversion` | pal | A1 | A1 | (blank) | 1 | (blank) | mele | `calc3=0`, 설명 키 `Attack Speed %`; `calc1=dm34` |
| Attack | 0 | (baseline) | (general) | A1 | A1 | (blank) | 1 | (blank) | weap | 기본 공격 레코드 |

원본 세 필드 모두 `anim=A1`; `plrmode.txt`는 `Attack1`을 코드 `A1`로 매핑한다. 기술 레코드는 공격 시퀀스 `SQ`가 아닌 일반 공격 애니메이션으로 매핑된다. Sacrifice에 `seqnum=2` 값이 있어도 해당 행의 `anim=A1`과 함께 읽어야 하며, SQ 플레이어 시퀀스로 단정하지 않는다. 일반 파일 가이드가 설명하는 `seqnum`의 SQ 전용 사용 규칙과도 부합한다.

## skilldesc 연결

`skilldesc.txt`는 `skilldesc` 키로 연결된다. 해당 표에 애니메이션/프레임 필드는 없다.

| skilldesc key | UI 위치 | 이름 문자열 키 | 설명 문자열 키 |
|---|---|---|---|
| sacrifice | page 1, row 1, col 1 | `skillname96` | `skillld96` |
| vengeance | page 1, row 4, col 1 | `skillname111` | `skillld111` |
| conversion | page 1, row 5, col 1 | `skillname116` | `skillld116` |

기술별 스킬 속도 보정은 `skills.txt`의 별도 필드로 확인되지 않았다. Vengeance 피해 계산식을 IAS 보정으로 해석하지 않는다. Conversion의 `calc3=0`은 설명상 공격 속도 비율 0으로 대응한다. 이 해석 범위는 게임 런타임 역공학이 아니라 표 필드·표시 키에 한정된다.

## 무기 표 연결

로컬 `weapons.txt`의 코드/유형/공격 클래스/기본 속도: Crystal Sword `crs`, `swor`, `1hs`, 빈 speed(기존 검증은 WSM 0); Phase Blade `7cr`, `swor`, `1hs`, -30; War Hammer `whm`, `hamm`, `1hs`, +20. 기존 weapon speed 가공 및 Golden Dataset은 유지한다.