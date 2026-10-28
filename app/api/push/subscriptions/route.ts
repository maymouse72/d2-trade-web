import { configured, database, failure, reply } from '../store';
import { deviceId, digest, PushError, readBody, requestRateKey, sameOrigin, subscriptionValue, validId } from '../validation';

export const runtime = 'nodejs';
export async function GET() {
  return reply({ enabled: configured(), publicKey: configured() ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : null });
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const owner = deviceId(request);
    const body = await readBody(request);
    const tradeId = validId(body.tradeId);
    const db = database();
    const keys = requestRateKey(request, owner);
    for (const [index, key] of keys.entries()) {
      const { data: allowed, error } = await db.rpc('consume_push_rate', { p_key: key, p_limit: index === 0 ? 240 : 30 });
      if (error) throw error;
      if (!allowed) throw new PushError(429, '요청이 많습니다. 1분 후 다시 시도해 주세요.');
    }
    if (body.action === 'status') {
      const { data, error } = await db.from('push_watches').select('trade_id').eq('device_id', owner).eq('trade_id', tradeId).maybeSingle();
      if (error) throw error;
      return reply({ success: true, subscribed: Boolean(data) });
    }
    if (body.action === 'unsubscribe') {
      const { error } = await db.from('push_watches').delete().eq('device_id', owner).eq('trade_id', tradeId);
      if (error) throw error;
      return reply({ success: true, subscribed: false });
    }
    if (body.action !== 'subscribe') throw new PushError(400, '지원하지 않는 요청입니다.');
    const subscription = subscriptionValue(body.subscription);
    const { error } = await db.rpc('register_push_watch', {
      p_device: owner, p_trade: tradeId, p_endpoint_hash: digest(subscription.endpoint), p_subscription: subscription,
    });
    if (error) {
      if (error.message.includes('watch_limit')) throw new PushError(429, '기기당 최대 50개 매물까지 알림을 받을 수 있습니다.');
      if (error.message.includes('endpoint_owned')) throw new PushError(409, '브라우저 구독을 초기화한 뒤 다시 신청해 주세요.');
      if (error.message.includes('trade_unavailable')) throw new PushError(404, '알림을 신청할 수 없는 매물입니다.');
      throw error;
    }
    return reply({ success: true, subscribed: true });
  } catch (error) { return failure(error); }
}
