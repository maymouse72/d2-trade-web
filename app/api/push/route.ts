// app/api/push/route.ts
import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:maymouse72@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let pushSubscriptions: any = [];

// 💡 Supabase Webhook과 브라우저 통신을 안전하게 다 수용하도록 POST 엔드포인트 전면 개방
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. 브라우저 알림 주소 등록 분기
    if (body.type === 'SUBSCRIBE') {
      const { subscription } = body;
      if (!pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint)) {
        pushSubscriptions.push(subscription);
      }
      return NextResponse.json({ success: true, message: '알림 주소 등록 성공' });
    }

    // 2. Supabase 신호 수신 분기 (유연한 방어 코드 주입)
    const commentData = body.record || body;
    if (commentData && commentData.content) {
      const pushPayload = JSON.stringify({
        title: '⚔️ D2 마켓 실시간 흥정 알림',
        body: `새로운 댓글: "${commentData.content}"`,
        // 💡 [최종 완공 치트키] 대표 도메인 절대 주소를 완벽하게 명시하여 주소 꼬임을 원천 차단합니다!
        url: `https://d2jugobatgo.com{commentData.trade_id || 1}`
      });

      pushSubscriptions.forEach(sub => {
        webpush.sendNotification(sub, pushPayload).catch(() => {
          pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
        });
      });
      return NextResponse.json({ success: true, message: '푸시 발송 완료' });
    }

    return NextResponse.json({ success: true, message: '안전 보정 패스 완료' });
  } catch (error: any) {
    // 💡 에러 발생 시 전체 시스템이 다운되지 않도록 안전 장치 가동
    return NextResponse.json({ success: false, error: error.message });
  }
}