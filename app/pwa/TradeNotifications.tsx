'use client';

import { useEffect, useState } from 'react';
import { applicationKey, deviceToken, ensureWorker, pushSupported, subscriptionRequest } from './client';
import styles from './pwa.module.css';

type State = 'checking' | 'off' | 'on' | 'busy' | 'unsupported' | 'setup';

export default function TradeNotifications({ tradeId }: { tradeId: string }) {
  const [state, setState] = useState<State>('checking');
  const [message, setMessage] = useState('');
  const [publicKey, setPublicKey] = useState('');
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!pushSupported()) { if (!cancelled) setState('unsupported'); return; }
      try {
        const response = await fetch('/api/push/subscriptions', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('알림 설정을 불러오지 못했습니다.');
        const config = await response.json();
        if (!config.enabled) { if (!cancelled) setState('setup'); return; }
        if (!cancelled) setPublicKey(config.publicKey);
        const worker = await ensureWorker();
        const subscription = await worker.pushManager.getSubscription();
        let subscribed = false;
        if (subscription && deviceToken()) {
          const status = await subscriptionRequest('status', tradeId);
          // Re-register only an existing watch; never subscribe to a new trade without a user action.
          if (status.subscribed && Notification.permission === 'granted') {
            await subscriptionRequest('subscribe', tradeId, subscription);
            subscribed = true;
          }
        }
        if (!cancelled) setState(subscribed ? 'on' : 'off');
      } catch {
        if (!cancelled) { setState('off'); setMessage('알림 상태를 확인하지 못했습니다. 다시 시도해 주세요.'); }
      }
    }
    void check();
    return () => { cancelled = true; };
  }, [tradeId]);

  async function toggle() {
    const wasOn = state === 'on';
    setState('busy'); setMessage('');
    try {
      if (wasOn) {
        await subscriptionRequest('unsubscribe', tradeId);
        setState('off'); setMessage('이 매물의 알림을 해제했습니다. 다른 매물의 설정은 유지됩니다.');
        return;
      }
      // Permission request remains directly tied to the click (required on iOS).
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('브라우저 알림이 허용되지 않았습니다. 사이트 설정에서 알림을 허용해 주세요.');
      if (!publicKey) throw new Error('알림 서버를 확인하지 못했습니다. 새로고침 후 다시 시도해 주세요.');
      const worker = await ensureWorker();
      let subscription = await worker.pushManager.getSubscription();
      if (!deviceToken() && subscription) { await subscription.unsubscribe(); subscription = null; }
      // Create the local device token before subscribing so blocked storage causes no orphan subscription.
      deviceToken(true);
      subscription ||= await worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(publicKey) });
      await subscriptionRequest('subscribe', tradeId, subscription);
      setState('on'); setMessage('이 기기로 이 매물의 새 댓글 알림을 받습니다.');
    } catch (error) {
      setState(wasOn ? 'on' : 'off');
      setMessage(error instanceof Error ? error.message : '알림 설정을 완료하지 못했습니다.');
    }
  }

  return <section className={styles.panel} aria-label="매물별 댓글 알림">
    <div className={styles.row}><div><h3>이 매물의 새 댓글 알림</h3><p>알림을 신청한 이 기기에만 보내드립니다.</p></div>
      <button type="button" className={styles.button} onClick={toggle} disabled={!['off','on'].includes(state)} aria-pressed={state === 'on'}>
        {state === 'on' ? '알림 해제' : state === 'busy' ? '처리 중…' : state === 'checking' ? '확인 중…' : state === 'setup' ? '알림 준비 중' : state === 'unsupported' ? '알림 지원 안내' : '이 매물 알림 받기'}
      </button></div>
    <p role="status" className={styles.message}>{message || (state === 'on' ? '이 매물 알림이 설정되어 있습니다.' : state === 'setup' ? '서버 연결을 준비하고 있습니다. 거래 기능은 정상 이용할 수 있습니다.' : state === 'unsupported' ? '지원 브라우저에서 열어 주세요. iPhone·iPad는 홈 화면에 추가한 앱에서 알림을 신청할 수 있습니다.' : '브라우저 알림 허용 후 이 매물의 알림을 신청할 수 있습니다.')}</p>
    <details><summary>설치 및 알림 이용 안내</summary><p>Android·PC는 브라우저 메뉴에서 앱 설치를 선택하세요. iPhone·iPad는 공유 → 홈 화면에 추가 후 앱을 열어 알림을 신청하세요. 기기나 브라우저마다 따로 설정하며, 사이트 데이터를 삭제하면 재신청이 필요합니다. 오프라인에서는 거래 내역을 표시하지 않습니다.</p></details>
  </section>;
}
