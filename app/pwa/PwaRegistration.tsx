'use client';

import { useEffect } from 'react';
import { ensureWorker } from './client';

export default function PwaRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.isSecureContext) {
      ensureWorker().catch(() => console.warn('앱 기능을 준비하지 못했습니다. 온라인 거래 기능은 계속 이용할 수 있습니다.'));
    }
  }, []);
  return null;
}
