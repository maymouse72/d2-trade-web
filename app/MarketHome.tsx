'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import PostModal from './PostModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function MarketHome() {
  const [trades, setTrades] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fetchTrades = async () => {
    setLoading(true);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('status', 'active')
      .gt('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1400);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  },);

  const handleModalSubmit = async (formData: any, resetFormFields: () => void) => {
    const { gameMode, battlenetId, itemBase, description, priceRune, roomInfo } = formData;
    setSubmitting(true);
    const { error } = await supabase.from('trades').insert([
      {
        battlenet_id: battlenetId,
        item_name_ko: itemBase,
        price_rune: priceRune,
        room_name: roomInfo,
        item_description: description,
        game_mode: gameMode,
      },
    ]);
    setSubmitting(false);

    if (error) {
      alert(`등록 실패: ${error.message}`);
    } else {
      alert('디아블로2 매물이 웹에서 실시간 등록되었습니다!');
      resetFormFields();
      setIsModalOpen(false);
      fetchTrades();
    }
  };

  const handleCopyRoomName = (roomName: string) => {
    navigator.clipboard.writeText(roomName).then(() => {
      alert(`인게임 방제 [ ${roomName} ] 가 클립보드에 복사되었습니다!`);
    });
  };

  const formatTime = (createdAt: string) => {
    try {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();
      const diffMinutes = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return '방금 전';
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      return `${createdDate.getMonth() + 1}/${createdDate.getDate()}`;
    } catch (e) {
      return '방금 전';
    }
  };

  const adBannerStyle = {
    position: 'fixed' as const,
    top: '160px',
    width: '150px', // 💡 이메일 확장을 위해 배너 가로폭을 10px 더 여유롭게 미세 조정!
    height: '500px',
    backgroundColor: '#141414',
    border: '2px dashed #8C6D3B',
    borderRadius: '6px',
    padding: '20px 10px',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
    boxShadow: '0 10px 20px rgba(0,0,0,0.7)',
  };

  // 💡 [초강력 가독성 이메일 전용 스타일 비서 서랍]
  const emailStyle = {
    display: 'block',
    color: '#22FF22',
    fontSize: '13px',            // 💡 기존 10px에서 13px로 대폭 확장 시인성 극대화!
    fontFamily: 'monospace',
    fontWeight: 'bold',
    wordBreak: 'break-all' as const,
    letterSpacing: '0.3px',       // 글자 간격을 넓혀 알아보기 편하게 정돈
    lineHeight: '1.4',
    marginTop: '6px'
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', color: '#DCDCDC', padding: '24px', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* 왼쪽 광고주 모집 배너 기둥 */}
      {!isMobile && (
        <div style={{ ...adBannerStyle, left: '30px' }}>
          <h4 style={{ color: '#C76C2E', margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>광고주 모집</h4>
          <p style={{ color: '#777777', fontSize: '12px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            디아블로2<br />실시간 마켓<br />배너 광고 구역
          </p>
          <div style={{ borderTop: '1px solid #333', paddingTop: '16px', width: '100%' }}>
            <span style={{ display: 'block', color: '#C5A059', fontSize: '12px', fontWeight: 'bold' }}>문의 이메일</span>
            {/* 💡 정품 확대 서체 적용 완료! */}
            <span style={emailStyle}>maymouse72<br />@gmail.com</span>
          </div>
        </div>
      )}

      {/* 오른쪽 광고주 모집 배너 기둥 */}
      {!isMobile && (
        <div style={{ ...adBannerStyle, right: '30px' }}>
          <h4 style={{ color: '#C76C2E', margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>AD ZONE</h4>
          <p style={{ color: '#777777', fontSize: '12px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            24시간<br />잠들지 않는<br />트레이드 스페이스
          </p>
          <div style={{ borderTop: '1px solid #333', paddingTop: '16px', width: '100%' }}>
            <span style={{ display: 'block', color: '#C5A059', fontSize: '12px', fontWeight: 'bold' }}>AD INQUIRY</span>
            {/* 💡 정품 확대 서체 적용 완료! */}
            <span style={emailStyle}>maymouse72<br />@gmail.com</span>
          </div>
        </div>
      )}

      {/* 중앙 메인 매물 게시판 본체 방 구역 */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <h1 style={{ color: '#C76C2E', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px', margin: '32px 0' }}>
          DIABLO II REALTIME MARKET
        </h1>

        <div style={{ backgroundColor: '#141414', border: '1px solid #8C6D3B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '4px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <p style={{ color: '#777777', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>카드를 터치하면 방제가 자동 복사됩니다</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={fetchTrades} disabled={loading} style={{ backgroundColor: '#1A1A1A', border: '1px solid #8C6D3B', color: '#FFFFFF', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? '로딩 중...' : '새로고침'}
            </button>
            <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#C5A059', color: '#0A0A0A', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              내 매물 등록
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {trades && trades.map((trade: any) => (
            <div 
              key={trade.id} 
              onClick={() => handleCopyRoomName(trade.room_name)} 
              style={{ backgroundColor: '#141414', border: '2px solid #8C6D3B', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', justify_content: 'space-between', boxShadow: '0 10px 15px rgba(0,0,0,0.5)', cursor: 'pointer' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <h3 style={{ color: '#C76C2E', fontSize: '16px', fontWeight: 'bold', margin: 0, paddingRight: '8px' }}>
                    {trade.game_mode === 'standard' ? '[스탠] ' : '[래더] '}
                    {trade.item_name_ko}
                  </h3>
                  <span style={{ color: '#C5A059', backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', fontSize: '13px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    {trade.price_rune}
                  </span>
                </div>
                <p style={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', fontSize: '12px', color: '#DCDCDC', padding: '10px', borderRadius: '4px', minHeight: '54px', margin: '0 0 16px 0', wordBreak: 'break-all', lineHeight: '1.5' }}>
                  {trade.item_description || '상세 옵션 설명 없음'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #222222', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', color: '#00FF00', fontSize: '12px', fontWeight: 'bold', padding: '6px', margin: 0 }}>
                  인게임 방제: <span style={{ color: '#22FF22', textDecoration: 'underline', fontFamily: 'monospace', marginLeft: '4px' }}>{trade.room_name}</span>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#666666', padding: '0 4px', marginTop: '2px' }}>
                  <span>{trade.battlenet_id}</span>
                  <span style={{ color: '#8C6D3B', fontWeight: 'bold' }}>{formatTime(trade.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && (!trades || trades.length === 0) && (
          <p style={{ textAlign: 'center', color: '#555555', margin: '96px 0', fontSize: '14px', fontWeight: 'bold' }}>현재 활성화된 실시간 거래 매물이 없습니다.</p>
        )}
      </div>

      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} submitting={submitting} />
    </div>
  );
}