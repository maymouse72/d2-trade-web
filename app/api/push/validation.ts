import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

export class PushError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function validId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') throw new PushError(400, '올바른 번호가 필요합니다.');
  const id = String(value ?? '');
  if (!/^[1-9]\d{0,14}$/.test(id)) throw new PushError(400, '올바른 매물 또는 댓글 번호가 필요합니다.');
  return id;
}
export function requestRateKey(request: Request, owner: string) {
  // Vercel overwrites this header. Do not trust arbitrary forwarded headers on other hosts.
  const forwarded = process.env.VERCEL === '1' ? (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() : '';
  const address = isIP(forwarded) ? forwarded : 'shared';
  const secret = process.env.PUSH_WEBHOOK_SECRET || '';
  return [createHmac('sha256', secret).update(`ip:${address}`).digest('hex'), digest(`device:${owner}`)];
}
export function deviceId(request: Request) {
  const token = request.headers.get('x-push-device') || '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new PushError(401, '기기 확인 정보가 필요합니다.');
  return digest(token);
}
export function sameOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new PushError(403, '같은 사이트에서 요청해 주세요.');
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new PushError(415, 'JSON 요청이 필요합니다.');
}
export function authorizeWebhook(request: Request, secret: string | undefined) {
  if (!secret || secret.length < 32) throw new PushError(503, '알림 서버 설정이 필요합니다.');
  const supplied = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  if (!timingSafeEqual(Buffer.from(digest(supplied)), Buffer.from(digest(expected)))) throw new PushError(401, '허용되지 않은 알림 요청입니다.');
}
export async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new PushError(400, '요청 내용이 필요합니다.');
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 16384) { await reader.cancel(); throw new PushError(413, '요청이 너무 큽니다.'); }
    chunks.push(value);
  }
  try { const body = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); return body; }
  catch { throw new PushError(400, '요청 형식을 확인해 주세요.'); }
}
export function subscriptionValue(value: unknown) {
  if (!value || typeof value !== 'object') throw new PushError(400, '구독 정보가 필요합니다.');
  const sub = value as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (typeof sub.endpoint !== 'string' || sub.endpoint.length > 2048) throw new PushError(400, '구독 주소가 올바르지 않습니다.');
  let url: URL;
  try { url = new URL(sub.endpoint); } catch { throw new PushError(400, '구독 주소가 올바르지 않습니다.'); }
  const allowed = url.hostname === 'fcm.googleapis.com' || url.hostname === 'updates.push.services.mozilla.com' ||
    url.hostname === 'web.push.apple.com' || url.hostname.endsWith('.notify.windows.com');
  if (!allowed || url.protocol !== 'https:' || url.port || url.username || url.password || url.hash) throw new PushError(400, '지원하는 브라우저의 푸시 주소가 아닙니다.');
  const { p256dh, auth } = sub.keys || {};
  if (typeof p256dh !== 'string' || typeof auth !== 'string' || !/^[\w-]+={0,2}$/.test(p256dh) || !/^[\w-]+={0,2}$/.test(auth) || Buffer.from(p256dh, 'base64url').length !== 65 || Buffer.from(p256dh, 'base64url')[0] !== 4 || Buffer.from(auth, 'base64url').length !== 16) throw new PushError(400, '구독 키가 올바르지 않습니다.');
  return { endpoint: sub.endpoint, keys: { p256dh, auth } };
}
