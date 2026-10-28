const OFFLINE_CACHE = 'd2-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then(cache => cache.add(OFFLINE_URL)));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('d2-offline-') && key !== OFFLINE_CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
// Never cache trading pages, comments, API responses or user data.
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(async () =>
    (await caches.match(OFFLINE_URL)) || new Response('인터넷 연결을 확인해 주세요.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  ));
});
function safePath(value) {
  try {
    const url = new URL(value || '/', self.location.origin);
    return url.origin === self.location.origin && (url.pathname === '/' || /^\/trade\/[1-9]\d*$/.test(url.pathname)) ? url.pathname : '/';
  } catch { return '/'; }
}
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* Show a safe fallback for malformed payloads. */ }
  if (!data || typeof data !== 'object') data = {};
  event.waitUntil(self.registration.showNotification(typeof data.title === 'string' ? data.title : '디아블로2 주고받고', {
    body: typeof data.body === 'string' ? data.body : '신청한 매물에 새 댓글이 도착했습니다.',
    icon: '/icons/icon-192.png', badge: '/icons/icon-192.png',
    tag: typeof data.tag === 'string' ? data.tag : 'trade-comment',
    data: { url: safePath(data.url) }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(safePath(event.notification.data?.url), self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async windows => {
    const existing = windows.find(client => client.url === target);
    if (existing && 'focus' in existing) return existing.focus();
    return self.clients.openWindow(target);
  }));
});
