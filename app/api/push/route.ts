import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:maymouse72@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let pushSubscriptions: any = [];

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

    // 2. Supabase 신호 수신 분기 및 www 경로 일치 완공
    const commentData = body.record || body;
    if (commentData && commentData.content) {
      const pushPayload = JSON.stringify({
        title: '⚔️ D2 마켓 실시간 흥정 알림',
        body: `새로운 댓글: "${commentData.content}"`,
        // 💡 [치유 핵심 2번] 가비아 대표 도메인 www 포워딩 주소 체계와 완벽하게 일치시켜 오류 유령을 완벽 박멸합니다!
        url: `https://www.d2jugobatgo.com/trade/${commentData.trade_id || 1}`
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
    return NextResponse.json({ success: false, error: error.message });
  }
}