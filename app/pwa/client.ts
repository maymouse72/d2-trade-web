const TOKEN_KEY = 'd2-push-device-v1';
let registration: Promise<ServiceWorkerRegistration> | undefined;

export function pushSupported() {
  return window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
export function deviceToken(create = false) {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token && create) {
    token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}
export async function ensureWorker() {
  if (!registration) {
    registration = navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(error => { registration = undefined; throw error; });
  }
  await registration;
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([navigator.serviceWorker.ready, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('알림 준비가 지연됩니다. 새로고침 후 다시 시도해 주세요.')),10000); })]);
  } finally { clearTimeout(timer!); }
}
export function applicationKey(value: string) {
  const binary = atob(value.replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}
export async function subscriptionRequest(action: 'status' | 'subscribe' | 'unsubscribe', tradeId: string, subscription?: PushSubscription) {
  const token = deviceToken(action === 'subscribe');
  if (!token) return { subscribed: false };
  const response = await fetch('/api/push/subscriptions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-push-device': token },
    body: JSON.stringify({ action, tradeId, subscription: subscription?.toJSON() }), signal: AbortSignal.timeout(12000),
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || '알림 설정을 저장하지 못했습니다.');
  return result as { subscribed: boolean };
}
