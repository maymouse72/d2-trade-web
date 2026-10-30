'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { applicationKey, deviceToken, ensureWorker, pushConfiguration, pushSupported, subscriptionRequest } from './client';
import styles from './pwa.module.css';

type Snapshot = {
  stage: 'checking' | 'worker' | 'ready' | 'unsupported' | 'disabled' | 'error';
  permission?: NotificationPermission;
  browser?: boolean;
  watch: 'unknown' | 'on' | 'off';
  tokenLost?: boolean;
};
const initial: Snapshot = { stage: 'checking', watch: 'unknown' };
export default function TradeNotifications({ tradeId }: { tradeId: string }) {
  const [snapshot, setSnapshot] = useState<Snapshot>(initial);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const alive = useRef(false);
  const locked = useRef(false);
  const epoch = useRef(0);
  const check = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    const generation = epoch.current;
    const current = () => alive.current && generation === epoch.current;
    const next: Snapshot = { stage: 'checking', watch: 'unknown' };
    if (current()) { setBusy(true); setMessage(''); setSnapshot(next); }
    try {
      if (!pushSupported()) { next.stage = 'unsupported'; return; }
      next.permission = Notification.permission;
      const config = await pushConfiguration();
      if (!config.enabled) { next.stage = 'disabled'; return; }
      next.stage = 'worker'; if (current()) setSnapshot({ ...next });
      const worker = await ensureWorker();
      const subscription = await worker.pushManager.getSubscription();
      next.browser = Boolean(subscription);
      const token = deviceToken();
      next.tokenLost = Boolean(subscription && !token);
      if (token) {
        const status = await subscriptionRequest('status', tradeId);
        next.watch = status.subscribed ? 'on' : 'off';
      } else if (!subscription) {
        // No local identity: do not claim any previous server watch was deleted.
        next.watch = 'unknown';
      }
      next.stage = 'ready';
    } catch (error) {
      next.stage = 'error';
      if (current()) setMessage(error instanceof Error ? error.message : '알림 상태 확인에 실패했습니다.');
    } finally {
      locked.current = false;
      if (current()) { setSnapshot({ ...next }); setBusy(false); }
    }
  }, [tradeId]);
  useEffect(() => {
    alive.current = true;
    const generation = epoch.current;
    // Defer the initial read; cleanup cancels it under Strict Mode as well.
    const timer = setTimeout(() => { void check(); }, 0);
    return () => { clearTimeout(timer); alive.current = false; epoch.current = generation + 1; };
  }, [check]);

  async function toggle(repair = false) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setMessage('');
    const generation = epoch.current;
    const current = () => alive.current && generation === epoch.current;
    const wasOn = snapshot.watch === 'on' && !repair;
    try {
      if (wasOn) {
        const result = await subscriptionRequest('unsubscribe', tradeId);
        if (result.subscribed) throw new Error('서버에서 해제를 확인하지 못했습니다.');
        if (current()) { setSnapshot(s => ({ ...s, watch: 'off' })); setMessage('이 매물의 알림만 해제했습니다. 다른 매물과 브라우저 구독은 유지됩니다.'); }
        return;
      }
      // Direct click permission request, before any asynchronous server reads.
      const permission = await Notification.requestPermission();
      if (current()) setSnapshot(s => ({ ...s, permission }));
      if (permission !== 'granted') throw new Error('알림 권한이 허용되지 않았습니다. 브라우저 설정을 확인해 주세요.');
      const config = await pushConfiguration();
      if (!config.enabled || !config.publicKey) throw new Error('알림 기능이 비활성화됐거나 서버가 준비되지 않았습니다.');
      const worker = await ensureWorker();
      let subscription = await worker.pushManager.getSubscription();
      if (subscription && !deviceToken()) throw new Error('브라우저 구독은 있지만 기기 정보가 없습니다. 다른 매물 보호를 위해 자동 초기화하지 않았습니다.');
      deviceToken(true);
      const status = await subscriptionRequest('status', tradeId);
      // Keep the actual watch state even when browser-subscription repair fails.
      if (current()) setSnapshot(s => ({ ...s, watch: status.subscribed ? 'on' : 'off' }));
      subscription ||= await worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(config.publicKey) });
      if (current()) setSnapshot(s => ({ ...s, browser: true }));
      const result = await subscriptionRequest('subscribe', tradeId, subscription);
      if (!result.subscribed) throw new Error('서버에서 구독 저장을 확인하지 못했습니다.');
      if (current()) { setSnapshot({ stage: 'ready', permission, browser: true, watch: 'on' }); setMessage('이 기기의 이 매물 알림 설정을 저장했습니다.'); }
    } catch (error) {
      if (current()) setSnapshot(s => ({ ...s, stage: 'error', watch: 'unknown' }));
      if (current()) setMessage(`${wasOn ? '해제에 실패했습니다. 서버 상태는 다시 확인해 주세요. ' : '구독 저장을 완료하지 못했습니다. '}${error instanceof Error ? error.message : '다시 시도해 주세요.'}`);
    } finally { locked.current = false; if (current()) setBusy(false); }
  }
  const permissionText = snapshot.permission === 'denied' ? '알림 권한 거부' : snapshot.permission === 'granted' ? '알림 권한 허용' : '알림 권한 미요청';
  const ready = snapshot.stage === 'ready';
  const canSubscribe = ready && !snapshot.tokenLost && snapshot.permission !== 'denied';
  return <section className={styles.panel} aria-label="매물별 댓글 알림" aria-busy={busy}>
    <h3>이 매물의 새 댓글 알림</h3><p>신청한 기기와 매물별로 설정합니다.</p>
    <p role="status">{snapshot.stage === 'checking' ? '서버 알림 설정 확인 중…' : snapshot.stage === 'worker' ? '앱 준비 중…' : snapshot.stage === 'unsupported' ? '이 브라우저에서는 Push를 지원하지 않습니다. iPhone·iPad는 홈 화면에 추가한 앱에서 확인하세요.' : snapshot.stage === 'disabled' ? '서버 알림 기능이 비활성화됐거나 준비 중입니다. 구독·해제 처리가 제한됩니다. 기존 구독 해제 여부를 확인한 것은 아닙니다.' : snapshot.stage === 'error' ? '알림 상태를 확정하지 못했습니다. 해제 완료로 처리하지 않았습니다.' : `${permissionText} · 브라우저 구독 ${snapshot.browser ? '있음' : '없음'} · 서버 매물 알림 ${snapshot.watch === 'on' ? '등록 확인' : snapshot.watch === 'off' ? '미등록 확인' : '확인 안 됨'}`}</p>
    {snapshot.tokenLost && <p>기기 정보가 없지만 브라우저 구독은 남아 있습니다. 기존 구독을 자동으로 삭제하지 않습니다.</p>}
    {ready && snapshot.watch === 'on' && (!snapshot.browser || snapshot.permission !== 'granted') && <p>서버 등록은 남아 있지만 이 브라우저의 알림 수신 준비는 완료되지 않았습니다.</p>}
    <div className={styles.row}>
      {ready && <button type="button" className={styles.button} onClick={() => { void toggle(); }} disabled={busy || (snapshot.watch !== 'on' && !canSubscribe)} aria-pressed={snapshot.watch === 'on'}>{busy ? '처리 중…' : snapshot.watch === 'on' ? '이 매물 알림 해제' : '이 매물 알림 신청·재시도'}</button>}
      {ready && snapshot.watch === 'on' && snapshot.permission === 'granted' && !snapshot.tokenLost && <button type="button" className={styles.button} disabled={busy} onClick={() => { void toggle(true); }}>이 기기 알림 수신 다시 준비</button>}
      <button type="button" className={styles.button} disabled={busy} onClick={() => { void check(); }}>알림 상태 다시 확인</button>
    </div>
    <p role="status" className={styles.message}>{message}</p>
    <details><summary>설치 및 알림 이용 안내</summary><p>Android·PC는 브라우저 메뉴에서 앱 설치를 선택하세요. iPhone·iPad는 공유 → 홈 화면에 추가 후 앱을 여세요. 상태 재확인은 저장·해제를 하지 않습니다. 신청 실패 시 브라우저 구독이 남을 수 있으며 다시 신청하면 재사용합니다. 권한·기기 정보를 잃었을 때 다른 매물을 위해 전체 구독을 자동 삭제하지 않습니다.</p></details>
  </section>;
}
