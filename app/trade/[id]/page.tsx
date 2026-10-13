'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dzttxnsqarwkslxnvypt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TradeDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tradeId = resolvedParams?.id ? String(resolvedParams.id).trim() : '';
  
  const router = useRouter();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<any>();
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 1. 매물 상세 정보 가져오기
  const fetchTradeDetail = async () => {
    if (!tradeId) return;
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (!error && data) {
      setTrade(data);
    } else {
      alert('존재하지 않거나 마감된 매물입니다.');
      router.push('/');
    }
  };

  // 2. 실시간 댓글 목록 가져오기 함수
  const fetchComments = async () => {
    if (!tradeId) return;
    const { data, error } = await supabase
      .from('trade_comments') 
      .select('*')
      .eq('trade_id', Number(tradeId))
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  // 3. PWA 알림 권한 상태 관리 장치
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          if (Notification.permission === 'granted') {
            setIsSubscribed(true);
          }
        })
        .catch((err) => console.error('서비스 워커 오작동:', err));
    }
  }, []);

  // 4. 유저 알림 권한 요청 및 Vercel 기지국 등록
  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 실시간 알림 기능을 지원하지 않습니다.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          });

          await fetch('https://www.d2jugobatgo.com/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'SUBSCRIBE', subscription: sub })
          });

          setIsSubscribed(true);
          alert('실시간 흥정 알림 채널 개통 완료!');
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      alert('알림 권한이 거부되었습니다. 자물쇠 아이콘을 눌러 허용해주세요.');
    }
  };

  // 페이지 최초 진입 시 데이터 흡입
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([fetchTradeDetail(), fetchComments()]);
      setLoading(false);
    };
    initPage();
  }, [tradeId]);

  // 5. 댓글 금고 전송 함수
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요!');
      return;
    }

    setCommentSubmitting(true);
    
    const { error } = await supabase
      .from('trade_comments')
      .insert([
        {
          trade_id: Number(tradeId),
          content: newComment.trim(),
        }
      ]);
      
    setCommentSubmitting(false);

    if (error) {
      alert(`댓글 등록 실패 사유: ${error.message}`);
    } else {
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification('⚔️ D2 마켓 실시간 흥정 알림', {
            body: `내가 등록한 매물에 새 댓글이 달렸습니다: "${newComment.trim()}"`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'comment-alert',
            vibrate:[200, 100, 200],
            data: {
              url: `https://www.d2jugobatgo.com/trade/${tradeId}`
            }
          } as NotificationOptions);
        });
      }

      setNewComment('');
      fetchComments();
    }
  };

  const handleCopyRoomName = () => {
    if (!trade) return;
    navigator.clipboard.writeText(trade.room_name).then(() => {
      alert('인게임 방제가 복사되었습니다!');
    });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#030303', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A059', fontWeight: 'bold', letterSpacing: '2px' }}>
        ⚡ 호라드림 함에서 전설 매물 옵션을 해독하는 중...
      </div>
    );
  }

  // 💡 [정밀 분할 기준선] 이 바로 아래에 2부 하반신 소스를 연달아 복사해 붙여넣으시면 끝납니다!
  if (!trade) return null;
    return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030303', color: '#DCDCDC', padding: '40px 16px', fontFamily: 'sans-serif', position: 'relative' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: 'rgba(20, 20, 20, 0.95)', border: '2px solid #8C6D3B', padding: '32px', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.95)' }}>
        
        <button onClick={() => router.push('/')} style={{ backgroundColor: 'transparent', border: 'none', color: '#777777', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0 }}>
          ← 디아2 마켓 거래소 목록으로 돌아가기
        </button>

        {/* PWA 실시간 알림 가동 대시보드 배너 */}
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #C76C2E', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ color: '#C76C2E', fontSize: '14px', fontWeight: 'bold', display: 'block', letterSpacing: '0.5px' }}>🔥 PWA 흥정 푸시 알림 가동 시스템</span>
            <span style={{ color: '#777777', fontSize: '11px', display: 'block', marginTop: '4px' }}>상대방이 흥정 제안 댓글을 쓰는 즉시 스마트폰/PC에 실시간 알림이 울립니다.</span>
          </div>
          <button 
            onClick={handleRequestNotification}
            disabled={isSubscribed}
            style={{ 
              backgroundColor: isSubscribed ? '#1A1A1A' : '#C76C2E', 
              color: isSubscribed ? '#555555' : '#0A0A0A', 
              border: isSubscribed ? '1px solid #222' : 'none', 
              padding: '8px 14px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              borderRadius: '4px', 
              cursor: isSubscribed ? 'default' : 'pointer' 
            }}
          >
            {isSubscribed ? '● 실시간 작동중' : '알림 활성화'}
          </button>
        </div>

        {/* 아이템 대형 타이틀 및 요구가격 */}
        {/* 💡 [오타 정밀 교정 구역] textSpacing을 letterSpacing 문법으로 완벽 고정 완공! */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2A2A2A', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <span style={{ color: '#C5A059', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#0A0A0A', border: '1px solid #222', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
              {trade.game_mode === 'standard' ? 'Standard Mode' : 'Ladder Season'}
            </span>
            <h2 style={{ color: '#C76C2E', fontSize: '24px', fontWeight: 'bold', margin: '12px 0 0 0', letterSpacing: '0.5px' }}>
              {trade.item_name_ko}
            </h2>
          </div>
          <div>
            <span style={{ color: '#C5A059', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#0A0A0A', border: '2px solid #8C6D3B', padding: '6px 16px', borderRadius: '4px' }}>
              💰 {trade.price_rune}
            </span>
          </div>
        </div>

        {/* 상세 아이템 정보 디스플레이 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#888888', fontWeight: 'bold', marginBottom: '8px' }}>Item Attributes (아이템 세부 옵션)</label>
          <div style={{ backgroundColor: '#030303', border: '1px solid #222222', padding: '16px', borderRadius: '4px', minHeight: '96px', lineHeight: '1.6', fontSize: '14px', fontFamily: 'monospace', color: '#DDDDDD' }}>
            {trade.item_description || '상세 옵션 설명이 등록되지 않은 전설 아이템 매물입니다.'}
          </div>
        </div>

        {/* 배틀넷 방제 복사 제어소 */}
        <div style={{ backgroundColor: '#0A0A0A', border: '2px solid #8C6D3B', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: '#666666', fontWeight: 'bold', marginBottom: '4px' }}>Battle.net Room Info (방 정보)</span>
            <span style={{ color: '#22FF22', fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>{trade.room_name}</span>
          </div>
          <button onClick={handleCopyRoomName} style={{ backgroundColor: '#C5A059', color: '#0A0A0A', border: 'none', padding: '10px 18px', fontSize: '13px', fontWeight: 'bold', borderRadius: '4px' }}>
            방제 복사하기
          </button>
        </div>

        {/* 흥정 타임라인 댓글 시스템 */}
        <div style={{ borderTop: '2px dashed #262626', paddingTop: '24px' }}>
          {/* 💡 [오타 정밀 교정 구역] tracking을 letterSpacing 자바스크립트 표준 문법으로 각인 완공! */}
          <h3 style={{ color: '#C76C2E', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
            ⚔️ 성역의 실시간 흥정 및 네고 제안 ({comments ? comments.length : 0})
          </h3>
          
          {/* 댓글 입력 트랙 */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'center' }}>
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="익명 흥정 제안을 입력하세요 (예: 1오움 룬에 네고 가능한가요?)" 
              style={{ flexGrow: 1, height: '40px', padding: '0 12px', backgroundColor: '#030303', border: '1px solid #8C6D3B', color: '#FFFFFF', borderRadius: '4px', fontSize: '13px', outline: 'none' }} 
            />
            <button 
              onClick={handleCommentSubmit}
              disabled={commentSubmitting}
              style={{ height: '40px', backgroundColor: '#1F1F1F', border: '1px solid #8C6D3B', color: '#FFFFFF', padding: '0 20px', fontSize: '14px', fontWeight: 'bold', borderRadius: '4px' }}
            >
              {commentSubmitting ? '전송중..' : '제안'}
            </button>
          </div>

          {/* 실시간 타임라인 출력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments && comments.map((item: any) => (
              <div key={item.id} style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222', padding: '12px 16px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#555555', marginBottom: '6px' }}>
                  <span style={{ color: '#8C6D3B', fontWeight: 'bold' }}>🛡️ 익명의 성역 디아러</span>
                  <span>{new Date(item.created_at).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#CCCCCC', wordBreak: 'break-all', lineHeight: '1.5' }}>{item.content}</p>
              </div>
            ))}
          </div>

          {(!comments || comments.length === 0) && (
            <p style={{ textAlign: 'center', color: '#444444', fontSize: '12px', margin: '24px 0', letterSpacing: '0.5px' }}>아직 접수된 실시간 흥정 및 네고 제안이 없습니다.</p>
          )}
        </div>

      </div>
    </div>
  );
}