import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PushError } from './validation';

export function configured() {
  return Boolean(process.env.PUSH_ENABLED === 'true' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && (process.env.PUSH_WEBHOOK_SECRET?.length || 0) >= 32);
}
export function database() {
  if (!configured()) throw new PushError(503, '알림 서버 설정이 필요합니다.');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(10000) }) },
  });
}
export function reply(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function failure(error: unknown) {
  const known = error instanceof PushError;
  if (!known) console.error('Push storage or delivery operation failed.');
  return reply({ success: false, message: known ? error.message : '알림 처리를 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, known ? error.status : 503);
}
