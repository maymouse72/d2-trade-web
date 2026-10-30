'use client';

import { useEffect, useState } from 'react';
import { registerWorker } from './client';

type Phase = 'initial' | 'active' | 'installing' | 'waiting' | 'updated' | 'error';
export default function PwaRegistration() {
  const [phase, setPhase] = useState<Phase>('initial');
  const [dismissed, setDismissed] = useState(false);
  const [instructions, setInstructions] = useState(false);
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    let disposed = false;
    let hadController = Boolean(navigator.serviceWorker.controller);
    let observed: ServiceWorkerRegistration | undefined;
    const workers = new Map<ServiceWorker, () => void>();
    const show = (next: Phase) => { if (!disposed) { setPhase(next); setDismissed(false); } };
    const watch = () => {
      const worker = observed?.installing;
      if (!worker || workers.has(worker)) return;
      show(navigator.serviceWorker.controller ? 'installing' : 'initial');
      const change = () => {
        if (worker.state === 'installed') show(observed?.waiting && navigator.serviceWorker.controller ? 'waiting' : 'active');
        else if (worker.state === 'redundant') show('error');
      };
      workers.set(worker, change); worker.addEventListener('statechange', change); change();
    };
    const changed = () => { show(hadController ? 'updated' : 'active'); hadController = true; }; // Never reload a tab or touch another tab's form.
    navigator.serviceWorker.addEventListener('controllerchange', changed);
    void registerWorker().then(reg => {
      if (disposed) return;
      observed = reg; reg.addEventListener('updatefound', watch);
      if (reg.waiting && navigator.serviceWorker.controller) show('waiting');
      else if (reg.active) show('active');
      watch();
    }).catch(() => show('error'));
    return () => {
      disposed = true;
      observed?.removeEventListener('updatefound', watch);
      navigator.serviceWorker.removeEventListener('controllerchange', changed);
      for (const [worker, change] of workers) worker.removeEventListener('statechange', change);
    };
  }, []);
  if (dismissed || phase === 'initial' || phase === 'active') return null;
  const message = phase === 'waiting' ? '새 버전이 준비되었습니다. 모든 탭과 설치 앱에서 작성·저장 중인 작업을 먼저 마쳐 주세요.' : phase === 'installing' ? '새 앱 버전을 준비하고 있습니다. 현재 작업을 계속할 수 있습니다.' : phase === 'updated' ? '앱 업데이트가 적용됐습니다. 이 화면은 자동 새로고침하지 않았습니다. 작업을 마친 뒤 직접 다시 열어 주세요.' : '앱 업데이트를 확인하지 못했습니다. 온라인 거래는 계속 이용할 수 있습니다. 작업을 마친 뒤 다시 열어 주세요.';
  return <aside aria-label="앱 업데이트" style={{ padding: 12, borderBottom: '1px solid #8c6d3b', background: '#18150e' }}>
    <p role="status">{message}</p>
    <button type="button" onClick={() => setDismissed(true)}>나중에</button>{' '}
    {phase === 'waiting' && <button type="button" onClick={() => setInstructions(true)}>업데이트 방법 보기</button>}
    {instructions && <p>다른 탭의 작성 상태는 확인할 수 없습니다. 모든 작업의 저장 완료를 확인한 후 이 사이트의 탭과 설치 앱을 모두 닫고 다시 열어 주세요. 버튼은 강제 활성화나 새로고침을 수행하지 않습니다.</p>}
  </aside>;
}
