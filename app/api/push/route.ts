import webpush from 'web-push';
import { database, failure, reply } from './store';
import { authorizeWebhook, PushError, readBody, subscriptionValue, validId } from './validation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    authorizeWebhook(request, process.env.PUSH_WEBHOOK_SECRET);
    const body = await readBody(request);
    if (body.type !== 'INSERT' || body.schema !== 'public' || body.table !== 'trade_comments') throw new PushError(400, '댓글 등록 이벤트만 허용합니다.');
    const commentId = validId(body.record?.id);
    const tradeId = validId(body.record?.trade_id);
    const db = database();
    const { data: comment, error } = await db.from('trade_comments').select('id,trade_id,content,created_at').eq('id', commentId).eq('trade_id', tradeId).maybeSingle();
    if (error) throw error;
    if (!comment) throw new PushError(404, '댓글을 찾을 수 없습니다.');
    const age = Date.now() - Date.parse(comment.created_at);
    if (!Number.isFinite(age) || age < -60000 || age > 86400000) throw new PushError(422, '알림 이벤트의 유효 시간이 지났습니다.');
    const { data: watches, error: watchError } = await db.from('push_watches').select('device_id').eq('trade_id', tradeId);
    if (watchError) throw watchError;
    webpush.setVapidDetails('mailto:maymouse72@gmail.com', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
    const payload = JSON.stringify({ title: '디아블로2 주고받고 · 새 흥정 댓글', body: String(comment.content).slice(0,160), url: `/trade/${tradeId}`, tag: `trade-${tradeId}` });
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    for (let offset = 0; offset < (watches?.length || 0); offset += 10) {
      const results = await Promise.allSettled(watches!.slice(offset, offset + 10).map(async watch => {
        const { data: claimed, error: claimError } = await db.rpc('claim_push_delivery', { p_comment: commentId, p_device: watch.device_id });
        if (claimError) { failed++; return; }
        if (!claimed) { skipped++; return; }
        const { data: device, error: deviceError } = await db.from('push_devices').select('subscription').eq('device_id', watch.device_id).maybeSingle();
        if (deviceError || !device) { failed++; return; }
        let status: 'sent' | 'retry' | 'expired' = 'sent';
        try { await webpush.sendNotification(subscriptionValue(device.subscription), payload, { TTL: 3600, timeout: 10000 }); }
        catch (error) {
          const code = (error as { statusCode?: number }).statusCode;
          status = code === 404 || code === 410 ? 'expired' : 'retry';
        }
        if (status === 'expired') {
          const { error: removeError } = await db.from('push_devices').delete().eq('device_id', watch.device_id);
          if (removeError) failed++; else skipped++;
          return;
        }
        const { error: saveError } = await db.from('push_deliveries').update({ status, lease_until: new Date().toISOString() }).eq('comment_id', commentId).eq('device_id', watch.device_id);
        if (status === 'retry' || saveError) failed++; else sent++;
      }));
      failed += results.filter(result => result.status === 'rejected').length;
    }
    return reply({ success: failed === 0, sent, failed, skipped }, failed ? 503 : 200);
  } catch (error) { return failure(error); }
}
