const TOKEN_KEY = 'd2-push-device-v1';
let registration: Promise<ServiceWorkerRegistration> | undefined;

export class PushClientError extends Error {
  constructor(public code: string, message: string, public status?: number) { super(message); }
}
export function pushSupported() {
  return window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
export function deviceToken(create = false) {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (token && !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new PushClientError('token', '기기 정보가 일치하지 않습니다. 기존 구독을 삭제하지 않고 설정 확인을 중단했습니다.');
    if (!token && create) {
      token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch (error) {
    if (error instanceof PushClientError) throw error;
    throw new PushClientError('storage', '브라우저 저장소에 접근할 수 없습니다. 사이트 저장소 설정을 확인해 주세요.');
  }
}
async function bounded<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new PushClientError('worker-timeout', '앱 준비 시간이 초과됐습니다. 잠시 후 상태를 다시 확인해 주세요.')), 10000);
    })]);
  } finally { clearTimeout(timer); }
}
export async function registerWorker() {
  if (!registration) {
    registration = bounded(navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }))
      .catch(error => { registration = undefined; throw error; });
  }
  return registration;
}
export async function ensureWorker() {
  try {
    await registerWorker();
    return await bounded(navigator.serviceWorker.ready);
  } catch (error) {
    if (error instanceof PushClientError) throw error;
    throw new PushClientError('worker', '앱을 준비하지 못했습니다. 상태를 다시 확인해 주세요.');
  }
}
export function applicationKey(value: string) {
  try {
    const binary = atob(value.replace(/-/g,'+').replace(/_/g,'/'));
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  } catch { throw new PushClientError('config', '알림 공개 키 형식을 확인하지 못했습니다.'); }
}
async function apiResponse(response: Response) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const messages: Record<number, string> = {
      503: '알림 기능이 비활성화됐거나 서버가 준비되지 않았습니다. 해제 요청도 처리되지 않을 수 있습니다.',
      409: '기존 브라우저 구독과 기기 정보가 충돌합니다. 기존 구독을 유지하고 설정 확인을 중단했습니다.',
      429: '요청이 많습니다. 잠시 기다린 뒤 다시 확인해 주세요.',
      401: '기기 확인 정보가 일치하지 않습니다.',
    };
    throw new PushClientError('http', messages[response.status] || result?.message || '알림 요청을 처리하지 못했습니다.', response.status);
  }
  if (!result || typeof result !== 'object') throw new PushClientError('response', '서버 응답을 확인하지 못했습니다.');
  return result;
}
async function request(input: RequestInfo, init: RequestInit) {
  try { return await apiResponse(await fetch(input, { ...init, signal: AbortSignal.timeout(12000) })); }
  catch (error) {
    if (error instanceof PushClientError) throw error;
    throw new PushClientError('network', '네트워크 오류 또는 응답 지연으로 알림 상태를 확인하지 못했습니다.');
  }
}
export async function pushConfiguration(): Promise<{ enabled: boolean; publicKey: string | null }> {
  const result = await request('/api/push/subscriptions', { cache: 'no-store' });
  if (typeof result.enabled !== 'boolean' || (result.enabled && typeof result.publicKey !== 'string')) throw new PushClientError('response', '알림 설정 응답이 올바르지 않습니다.');
  return { enabled: result.enabled, publicKey: result.publicKey };
}
export async function subscriptionRequest(action: 'status' | 'subscribe' | 'unsubscribe', tradeId: string, subscription?: PushSubscription) {
  const token = deviceToken(action === 'subscribe');
  if (!token) throw new PushClientError('token', '이 기기의 확인 정보가 없습니다. 서버 구독 상태를 확정할 수 없습니다.');
  const result = await request('/api/push/subscriptions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-push-device': token },
    body: JSON.stringify({ action, tradeId, subscription: subscription?.toJSON() }),
  });
  if (!result.success || typeof result.subscribed !== 'boolean') throw new PushClientError('response', result.message || '알림 설정을 확인하지 못했습니다.');
  return result as { subscribed: boolean };
}
