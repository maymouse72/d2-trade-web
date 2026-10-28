# PWA 개선 — 운영 연결 순서

현재 코드는 `feature/pwa-reliability` 브랜치에 있다. 운영 사이트/DB에는 아직 반영하지 않았다. 기존 익명 거래·댓글 작성 구조는 유지하고 **사용자가 직접 신청한 매물의 댓글만 해당 기기로 알림**을 보낸다. 매물 작성자 전용 알림이 아니다. 신청한 사람이 직접 쓴 댓글도 수신 대상에 포함된다.

## 1. 구독 저장소 준비

대상 Supabase 프로젝트: **D2TradeServer** (`dzttxnsqarwkslxnvypt`).

같은 폴더의 `pwa-setup.sql`을 먼저 검토한 뒤 Supabase SQL Editor에서 한 번 실행한다. 새 테이블 네 개와 서버 전용 함수 세 개를 추가한다. 기존 `trades`, `trade_comments` 테이블·정책은 변경하지 않는다. 구독 테이블은 RLS를 켜고 브라우저의 anon/authenticated 접근을 차단한다. 서버용 키만 접근한다. 재실행 오류를 무시하거나 기존 테이블을 삭제해서 해결하지 않는다.

실행 후 다음 읽기 전용 SQL로 접근 제한을 확인한다.

```sql
select tablename, rowsecurity
from pg_tables
where schemaname='public' and tablename like 'push_%';

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name like 'push_%'
and grantee in ('anon','authenticated');
```

첫 쿼리는 새 테이블 네 개의 rowsecurity=true, 두 번째는 결과 0행이어야 한다. 새 함수 세 개의 EXECUTE도 service_role만 허용한다. 운영 적용 후 보안 Advisor를 다시 확인한다.

## 2. 서버 환경변수 연결

Vercel 프로젝트 → Settings → Environment Variables에서 설정한다. 값은 채팅이나 Git 파일에 붙여넣지 않는다. 미리보기 환경은 테스트용 DB와 키로 분리한다.

| 이름 | 설정 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 기존 대상 프로젝트 URL 유지 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 기존 공개 키 유지 |
| `VAPID_PRIVATE_KEY` | 위 공개 키와 짝인 기존 비밀 키 유지 |
| `SUPABASE_SECRET_KEY` | Supabase 프로젝트의 서버용 Secret key. 공개 키/anon key를 넣지 않음 |
| `PUSH_WEBHOOK_SECRET` | 이 사이트 알림 연결 전용으로 생성한 예측 불가능한 32바이트 이상의 난수. Supabase 웹훅에도 같은 값을 사용 |
| `PUSH_ENABLED` | SQL과 연결 준비 완료 후 `true` |

서버용 키와 웹훅 비밀값에는 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. Supabase 서버 키를 웹훅 인증용으로 재사용하지 않는다. VAPID 키를 새로 생성하거나 기존 키를 삭제할 필요는 없다.

미설정 상태에서는 UI가 ‘알림 준비 중’으로 표시되고 발송/저장 API가 닫힌다. 상태 확인 GET 응답에는 비밀값이나 구독 주소가 없다. 환경변수 변경은 새 배포부터 반영된다.

## 3. 댓글 웹훅 설정

Supabase Database → Webhooks에서 새 웹훅을 준비한다.

- 이름: `d2_trade_comment_push`
- 테이블: `public.trade_comments`
- 이벤트: **INSERT만**
- 방식: HTTP POST
- URL: `https://www.d2jugobatgo.com/api/push`
- 헤더: `Content-Type: application/json`
- 헤더: `Authorization: Bearer ` 뒤에 2단계의 **PUSH_WEBHOOK_SECRET 실제 값**
- 응답 대기 시간은 여러 기기 발송과 네트워크 지연을 고려하여 설정한다. 단순 기본 1초 설정은 피한다. 최종 수신 테스트에서 시간 초과 여부를 확인한다.

점검 시 이 테이블의 기존 트리거는 0개였다. 작업 시점에 다른 웹훅이 추가되어 있으면 중복 생성하지 말고 먼저 확인한다. 웹훅 비밀값이 포함된 트리거 정의나 DB 덤프를 공개하지 않는다.

새 코드 배포 이후 웹훅을 활성화한다. API는 인증 헤더와 실제 DB의 댓글 ID·매물 번호·등록 시각을 검증하며, 브라우저가 임의 본문/URL을 보내 발송할 수 없다. 과거 24시간을 넘은 이벤트는 거절한다.

## 4. Git 배포

1~3의 설정 준비가 완료된 뒤 다음 명령을 순서대로 실행한다. 오류가 있으면 다음 줄로 진행하지 않는다.

```powershell
cd D:\06.dia\d2-trade-web
git switch feature/pwa-reliability
git add app/api/push app/pwa app/layout.tsx "app/trade/[id]/page.tsx" public/manifest.json public/sw.js public/offline.html public/icons ops
git commit -m "PWA 설치 및 매물별 푸시 알림 안정화"
git switch main
git merge --ff-only feature/pwa-reliability
git push origin main
```

기존 미커밋 `app/SiteFrame.module.css`, `tsconfig.json`은 대상에서 제외했다. 패키지와 lock 파일은 변경하지 않았다.

## 5. 최종 두 기기 확인

승인된 테스트 매물에서 진행한다. 테스트 댓글과 실제 알림은 이 단계에서만 전송한다.

1. 기존 사이트 탭/앱을 모두 닫고 다시 열어 새 서비스 워커가 활성화되도록 한다. 강제로 캐시나 구독을 삭제할 필요는 없다.
2. Android/PC 앱 설치 및 아이콘 확인. iOS/iPadOS는 홈 화면에 추가한 앱에서 알림 신청.
3. 기기 A가 매물 X에서 ‘이 매물 알림 받기’를 누르고 권한 허용 → 서버 저장 완료 안내 확인.
4. A 앱을 닫고 B에서 X에 테스트 댓글 작성 → A 알림 수신 → 누르면 X 상세 이동 확인.
5. A가 신청하지 않은 매물 Y의 댓글은 A에게 가지 않는지 확인.
6. X 알림 해제 후 X의 새 댓글은 수신하지 않는지 확인. 다른 신청 매물은 유지되어야 한다.
7. 재배포/서버 재시작 후 구독 유지, 새로고침 후 실제 상태 복구 확인.
8. 인터넷 연결을 끊고 페이지 새로고침 → 연결 안내 확인. 이전 매물을 최신 정보처럼 보여주지 않아야 한다.

상태/API 응답의 sent는 푸시 서비스가 요청을 받아들였다는 의미다. 기기 절전·권한·OS 설정까지 포함한 수신 성공은 두 기기로 확인해야 한다. 기존 메모리 기반 전체 알림 구독은 이관할 수 없으며 매물별로 다시 신청한다.

## 실패 처리와 운영 범위

- 같은 댓글/기기에 대한 발송 이력을 DB에 보관해 중복 호출을 막는다. 처리 중 요청의 임대 시간은 60초다.
- 404/410 만료 구독만 제거한다. 429·네트워크·서버 오류 등은 구독을 유지하고 retry 상태를 남긴다.
- 재호출 시 미완료 기기만 재시도한다. 자동 재시도 스케줄러는 이번에 추가하지 않았다. 실패한 웹훅은 결과를 확인해 재호출해야 한다. 대량 구독/자동 복구가 필요하면 별도 큐·재시도 작업이 다음 단계다.
- 발송 성공 직후 DB 이력 저장만 실패하면 재시도 중 알림이 중복될 가능성은 남는다. 완전한 1회 수신을 보장하지 않는다.
- 기기당 최대 50개 매물. DB 기반 분당 요청 제한은 기기 30회·Vercel에서 확인한 IP당 240회다. 원본 IP는 저장하지 않는다. Vercel 외 환경은 신뢰할 IP 프록시가 확인되지 않아 전체 공통 한도를 적용한다.
- 기기 식별용 난수는 브라우저 localStorage에, 그 해시와 구독 정보는 서버에 보관한다. 사이트 데이터를 삭제하면 재신청이 필요하다. 추적·광고용 식별자가 아니다.
- 서버용 키/웹훅 인증이 잘못되면 기존 거래 쓰기까지 막는 구조가 아니다. 알림 API만 실패한다.
- 긴급 중단: `PUSH_ENABLED=false`로 재배포하고 댓글 웹훅을 비활성화한다. 기존 테이블을 삭제하거나 기존 익명 거래 정책을 임의 변경하지 않는다.

## 별도 확인이 필요한 기존 보안 항목

`public.trades`는 RLS가 꺼져 있다. 운영 Supabase Advisor에서도 확인했다. 현재 익명 거래의 읽기·등록 권한 설계가 필요하므로 이번 개선에서 임의로 켜지 않았다. 단순히 RLS를 활성화하면 현재 거래 기능이 막힐 수 있다. [Supabase RLS 안내](https://supabase.com/docs/guides/database/postgres/row-level-security)

참고: [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks), [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Vercel 요청 헤더](https://vercel.com/docs/headers/request-headers).
