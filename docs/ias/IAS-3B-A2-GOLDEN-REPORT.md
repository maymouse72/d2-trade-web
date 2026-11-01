# IAS-3-B A2 Golden Dataset 판정

## 결과

- A2 Golden Dataset 추가: **0행**
- A2 상태: Crystal Sword, Phase Blade, War Hammer 모두 **UNVERIFIED**
- 기존 A1 Golden Dataset: **720행 보존** (201 + 201 + 318)
- A1 원본 JSON 파일은 수정하지 않았다.

## 승격 판단

각 무기의 A2 후보 계산은 동일한 AnimData 수치에 기존 공식을 대입하면 A1 후보와 같게 나온다. 하지만 StartingFrame 적용과 A2 런타임 선택이 독립 검증되지 않았고, A2 전용 공개 breakpoint 자료나 실측이 없으므로 해당 행들을 Golden으로 저장하지 않았다.

후보 계산은 [비교 CSV](IAS-3B-A2-BREAKPOINT-COMPARISON.csv)에 기록했다. CSV의 A2 프레임은 원본 필드와 가정된 공식으로 만든 **계산 후보**이며, 검증 결과가 아니다.
