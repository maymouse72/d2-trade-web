// app/api/push/route.ts
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// [암호화 기지국 설정] 앞서 발급받은 키를 시스템에 주입합니다.
webpush.setVapidDetails(
  'mailto:maymouse72@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// 💡 전 세계 유저들의 알림 구독 열쇠(Subscription)들을 저장할 가상 임시 저장소
// (추후 고도화 시 데이터베이스 테이블에 유저별로 매핑하여 저장하는 것이 좋습니다.)
let pushSubscriptions: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. 상세페이지 브라우저에서 알림 주소를 등록하러 온 경우 (구독 정보 저장)
    if (body.type === 'SUBSCRIBE') {
      const { subscription } = body;
      if (!pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint)) {
        pushSubscriptions.push(subscription);
      }
      return NextResponse.json({ success: true, message: '알림 구독 주소 등록 성공!' });
    }

    // 2. Supabase Webhook이 댓글 감지 신호를 보낸 경우 (진짜 푸시 발송 트리거)
    // Supabase Webhook은 테이블에 insert가 일어나면 { record: { content, trade_id } } 형태로 신호를 쏩니다.
    if (body.type === 'INSERT' || body.record) {
      const commentData = body.record;
      
      // 발송할 푸시 알림 알맹이 명세서 구성
      const pushPayload = JSON.stringify({
        title: '⚔️ D2 마켓 실시간 흥정 알림',
        body: `새로운 댓글: "${commentData.content}"`,
        url: `/trade/${commentData.trade_id}` // 알림 클릭 시 해당 매물방으로 다이렉트 워프
      });

      // 가동 중인 모든 디바이스 기지로 푸시 폭탄 투하!
      const sendPromises = pushSubscriptions.map(sub => 
        webpush.sendNotification(sub, pushPayload).catch(err => {
          console.error('만료된 디바이스 주소 청소:', err);
          // 더 이상 유효하지 않은 기지 주소는 배열에서 자동 탈락시킵니다.
          pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
        })
      );

      await Promise.all(sendPromises);
      return NextResponse.json({ success: true, message: '실시간 푸시 알림 발송 완료!' });
    }

    return NextResponse.json({ success: false, message: '올바르지 않은 요청 포맷입니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}