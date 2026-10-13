// public/sw.js

// 💡 서버에서 푸시 신호가 날아오면 OS(안드로이드/iOS/윈도우) 시스템 알림창을 트리거합니다.
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '새로운 흥정 댓글이 도착했습니다!',
      icon: '/favicon.ico', // 알림창에 뜰 마켓 아이콘
      badge: '/favicon.ico',
      vibrate: [200, 100, 200], // 징~ 징~ 진동 효과
      data: {
        url: data.url || '/' // 알림 클릭 시 이동할 상세페이지 주소
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'D2 Realtime Market', options)
    );
  }
});

// 알림을 클릭하면 해당 매물 상세페이지 주소창으로 브라우저를 이동시킵니다.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});