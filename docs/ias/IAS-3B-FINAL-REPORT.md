# IAS-3-B 최종 보고

기준 일자: 2026-11-01 (KST)

## IAS-3-B-1: 배포 검증 진행

로컬 검증은 자동 테스트 19/19, TypeScript, ESLint, Webpack 프로덕션 빌드, PC/모바일 브라우저 및 읽기 전용 기존 서비스 회귀까지 통과했다. A1 Golden Dataset 720행을 유지하고, 세 무기의 A2는 UNVERIFIED로 숫자/표를 차단한다.

운영 배포 전 origin/main은 `c47e03214bb6fe7859c3f7eb017c5a936575b977`로 확인됐다. 최종 커밋, Production 배포 ID, READY 상태, 도메인 및 운영 스모크 결과는 [IAS-3B1-DEPLOYMENT-REPORT.md](./IAS-3B1-DEPLOYMENT-REPORT.md)에 업데이트한다.

## IAS-3-B-2: 조사 완료

공개 후보 계산기들을 살펴봤지만, Paladin 인간형 A2를 명시하고 D2R 빌드, 무기 클래스, StartingFrame 및 전체 애니메이션 프레임을 재현할 독립 근거는 확보하지 못했다. Tradia의 A1 경계 표본은 기존 A1 Golden과 일치했다. Warren 계산기 계열 사이트는 공유 계보로 묶었다. 자세한 비교와 데이터 출처는 [참고 계산기 검토](./IAS-3B2-REFERENCE-CALCULATOR-REVIEW.md), [근거 계보](./IAS-3B2-EVIDENCE-LINEAGE.md), [비교 CSV](./IAS-3B2-CALCULATOR-COMPARISON.csv), [후속 검증 계획](./IAS-3B2-VALIDATION-PLAN.md)을 참고한다.

**IAS-3-B-2 RESEARCH COMPLETE는 A2 VERIFIED를 뜻하지 않는다.** Crystal Sword, Phase Blade, War Hammer A2는 모두 UNVERIFIED이며 A2 Golden Dataset은 0행이다.
