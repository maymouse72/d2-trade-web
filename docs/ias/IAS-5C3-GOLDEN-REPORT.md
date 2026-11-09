# IAS-5C3 Golden Report

新增 Golden 행: **13** (72h Legend Sword 6, 9fb Zweihander 7). 모든 행은 D2R build `3.3.93847`, Barbarian / Human / A1 Normal Attack / two-handed / gear IAS 0이며, 표의 IAS는 무기 IAS다. 출처와 등급은 `lib/ias/barbarian-golden.ts`에 기록했다. 기존 Golden 데이터 행은 수정하지 않았다.

| Weapon | IAS breakpoints → full animation frames |
|---|---|
| 72h | 0→15, 7→14, 16→13, 30→12, 50→11, 83→10 |
| 9fb | 0→16, 4→15, 13→14, 23→13, 39→12, 60→11, 99→10 |

Both tables were observed in Warren1001 and compared with TrAdia sampled outputs; Amazon Basin's Barbarian 2HS material is the independent rule cross-check. The user-required existing Golden hash is preserved as the pre-change file hash: `lib/ias/barbarian-golden.ts` SHA-256 `8ECDC0F2EC30C5A7FE95CD5F69EABA434FE4FC9C3DC448AD4A7D3183A724A8BF`. This is a source-file hash, not a canonical serialized dataset hash. No C3 rows were added for B/C or 7gd.
