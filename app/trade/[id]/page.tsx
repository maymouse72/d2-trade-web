// app/trade/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TradeDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tradeId = resolvedParams?.id;
  
  const router = useRouter();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 💡 댓글 관리를 위한 인터넷 금고 상태 장치들
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

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

  // 2. 💡 실시간 댓글 목록 가져오기 함수
  const fetchComments = async () => {
    if (!tradeId) return;
    // 'trade_comments' 테이블에서 현재 매물 id와 일치하는 댓글을 최신순으로 긁어옵니다.
    const { data, error } = await supabase
      .from('trade_comments') 
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  // 3. 페이지 진입 시 매물과 댓글을 동시에 최초 1회 감지
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([fetchTradeDetail(), fetchComments()]);
      setLoading(false);
    };
    initPage();
  }, [tradeId]);

  // 4. 💡 댓글 금고 전송 (Supabase Insert) 함수
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요!');
      return;
    }

    setCommentSubmitting(true);
    const { error } = await supabase
      .from('trade_comments') // 사장님의 Supabase 댓글 테이블 명칭
      .insert([
        {
          trade_id: tradeId,
          content: newComment,
        }
      ]);
    setCommentSubmitting(false);

    if (error) {
      // 💡 만약 테이블이 없어서 에러가 난다면 유저에게 알림을 주고 콘솔에 표기합니다.
      console.error('댓글 등록 에러:', error);
      alert(`댓글 등록 실패: Supabase에 'trade_comments' 테이블이 생성되어 있는지 확인이 필요합니다.`);
    } else {
      setNewComment(''); // 입력창 청소
      fetchComments(); // 댓글 목록 실시간 새로고침
    }
  };

  const handleCopyRoomName = () => {
    if (!trade) return;
    navigator.clipboard.writeText(trade.room_name).then(() => {
      alert(`인게임 방제 [ ${trade.room_name} ] 가 클립보드에 복사되었습니다! 배틀넷에 붙여넣기 하세요.`);
    });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A059', fontWeight: 'bold' }}>
        호라드림 함에서 매물 정보를 감지하는 중...
      </div>
    );
  }

  if (!trade) return null;

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', color: '#DCDCDC', padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#141414', border: '2px solid #8C6D3B', padding: '28px', borderRadius: '8px', boxShadow: '0 20px 25px rgba(0,0,0,0.5)' }}>
        
        <button onClick={() => router.push('/')} style={{ backgroundColor: 'transparent', border: 'none', color: '#777777', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', padding: 0 }} className="hover:text-white transition-colors">
          ← 거래소 목록으로 돌아가기
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid #222222', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <span style={{ color: '#C5A059', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#0A0A0A', padding: '3px 8px', borderRadius: '4px', border: '1px solid #222222' }}>
              {trade.game_mode === 'standard' ? '스탠다드' : '래더 시즌'}
            </span>
            <h2 style={{ color: '#C76C2E', fontSize: '24px', fontWeight: 'bold', margin: '12px 0 0 0' }}>{trade.item_name_ko}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#C5A059', fontSize: '18px', fontWeight: 'extrabold', backgroundColor: '#0A0A0A', padding: '6px 14px', borderRadius: '4px', border: '1px solid #8C6D3B', display: 'inline-block' }}>
              {trade.price_rune}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#AAAAAA', fontWeight: 'bold', marginBottom: '8px' }}>아이템 세부 옵션</label>
          <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222', padding: '16px', borderRadius: '4px', minHeight: '80px', lineHeight: '1.6', fontSize: '14px', wordBreak: 'break-all' }}>
            {trade.item_description || '상세 옵션 설명이 등록되지 않은 매물입니다.'}
          </div>
        </div>

        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #8C6D3B', padding: '16px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: '#777777', fontWeight: 'bold', marginBottom: '4px' }}>인게임 방 정보</span>
            <span style={{ color: '#22FF22', fontSize: '15px', fontFamily: 'monospace', fontWeight: 'bold' }}>{trade.room_name}</span>
          </div>
          <button onClick={handleCopyRoomName} style={{ backgroundColor: '#C5A059', color: '#0A0A0A', border: 'none', padding: '10px 18px', fontSize: '13px', fontWeight: 'extrabold', borderRadius: '4px', cursor: 'pointer' }} className="hover:bg-[#B48F48] transition-colors">
            방제 복사
          </button>
        </div>

        {/* 💡 실시간 흥정 댓글 구역 연동 마감 */}
        <div style={{ borderTop: '2px dashed #333333', paddingTop: '24px' }}>
          <h3 style={{ color: '#C76C2E', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            실시간 흥정 댓글 ({comments.length})
          </h3>
          
          {/* 댓글 입력 폼 */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="익명 흥정 댓글을 입력하세요 (예: 1오움 룬에 네고 되나요?)" 
              style={{ flexGrow: 1, height: '40px', padding: '0 12px', backgroundColor: '#0A0A0A', border: '1px solid #8C6D3B', color: '#FFF', borderRadius: '4px', fontSize: '13px', outline: 'none' }} 
            />
            <button 
              onClick={handleCommentSubmit}
              disabled={commentSubmitting}
              style={{ backgroundColor: '#1A1A1A', border: '1px solid #8C6D3B', color: '#FFF', padding: '0 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {commentSubmitting ? '등록중..' : '등록'}
            </button>
          </div>

          {/* 댓글 리스트 출력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((item: any) => (
              <div key={item.id} style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222', padding: '12px 16px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666666', marginBottom: '6px' }}>
                  <span style={{ color: '#8C6D3B', fontWeight: 'bold' }}>익명의 디아러</span>
                  <span>{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#DDD', wordBreak: 'break-all' }}>{item.content}</p>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <p style={{ textAlign: 'center', color: '#444444', fontSize: '12px', margin: '24px 0' }}>아직 등록된 실시간 흥정 제안이 없습니다.</p>
          )}
        </div>

      </div>
    </div>
  );
}