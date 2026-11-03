# IAS-5 테스트 결과

## 기준선

기존 테스트 기준은 구현 전 `npm run test:ias` 53/53 PASS였다.

## IAS-5 구현 후

- `npm run test:ias`: 57/57 PASS (53 기존 + 4 신규 테스트 블록)
- Barbarian IAS 0–200 전수: 공개 WSM 0 breakpoint 구간과 프레임 일치
- 미검증 무기, A2, 비인간형, IAS 201, 외부 보정, 타 직업의 Barbarian 스킬: 숫자 차단
- 기존 Paladin Golden/일반 공격 회귀: PASS
- `npx tsc --noEmit`: PASS
- `npm run lint`: PASS
- `npx next build --webpack`: PASS, Next.js 16.4.3 / webpack; IAS 페이지 정적 생성 완료
- `npm run test:ias:browser` local: desktop 1365×900 PASS, mobile 390×844 PASS; 콘솔 오류/가로 넘침 없음
- Production `IAS_BASE_URL=https://www.d2jugobatgo.com npm run test:ias:browser`: desktop/mobile 2/2 PASS; 콘솔 오류/가로 넘침 없음

완료 전 수치는 실제 명령 출력으로 갱신한다.
