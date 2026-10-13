'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // 💡 3부 연동을 위한 라우터 내비게이션 임포트
import { createClient } from '@supabase/supabase-js';
import PostModal from './PostModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function MarketHome() {
  const router = useRouter(); // 💡 라우터 제어 장치 활성화
  const [trades, setTrades] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  // 💡 [무한 루프 완벽 박멸의 핵심 치트키]
  useEffect(() => {
    fetchTrades();
  }, []); 

  // 💡 [화면 크기 감지 센서 완벽 격리 부속품]
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1400);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const formatTime = (createdAt: string) => {
    try {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();
      const diffMinutes = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return '방금 전';
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}시간 전`;
      
      return `${createdDate.getMonth() + 1}/${createdDate.getDate()}`;
    } catch (e) {
      return '방금 전';
    }
  };

  const adBannerStyle = {
    position: 'fixed' as const,
    top: '160px',
    width: '150px',
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

  const emailStyle = {
    display: 'block',
    color: '#22FF22',
    fontSize: '13px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    wordBreak: 'break-all' as const,
    letterSpacing: '0.3px',
    lineHeight: '1.4',
    marginTop: '6px'
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', color: '#DCDCDC', padding: '24px', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* 왼쪽 광고 배너 */}
      {!isMobile && (
        <div style={{ ...adBannerStyle, left: '30px' }}>
          <h4 style={{ color: '#C76C2E', margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>광고주 모집</h4>
          <p style={{ color: '#777777', fontSize: '12px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            디아블로2<br />실시간 마켓<br />배너 광고 구역
          </p>
          <div style={{ borderTop: '1px solid #33 whispers', paddingTop: '16px', width: '100%' }}>
            <span style={{ display: 'block', color: '#C5A059', fontSize: '12px', fontWeight: 'bold' }}>문의 이메일</span>
            <span style={emailStyle}>maymouse72<br />@gmail.com</span>
          </div>
        </div>
      )}

      {/* 오른쪽 광고 배너 */}
      {!isMobile && (
        <div style={{ ...adBannerStyle, right: '30px' }}>
          <h4 style={{ color: '#C76C2E', margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>AD ZONE</h4>
          <p style={{ color: '#777777', fontSize: '12px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            24시간<br />잠들지 않는<br />트레이드 스페이스
          </p>
          <div style={{ borderTop: '1px solid #333', paddingTop: '16px', width: '100%' }}>
            <span style={{ display: 'block', color: '#C5A059', fontSize: '12px', fontWeight: 'bold' }}>AD INQUIRY</span>
            <span style={emailStyle}>maymouse72<br />@gmail.com</span>
          </div>
        </div>
      )}

      {/* 중앙 메인 매물 게시판 본체 */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <h1 style={{ color: '#C76C2E', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px', margin: '32px 0' }}>
          DIABLO II REALTIME MARKET
        </h1>

        <div style={{ backgroundColor: '#141414', border: '1px solid #8C6D3B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '4px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <p style={{ color: '#777777', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>카드를 터치하면 상세페이지로 이동하며 방 정보를 확인합니다.</p>
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
              onClick={() => router.push(`/trade/${trade.id}`)} // 💡 [핵심 교체] 클릭 시 상세페이지 라우팅으로 다이렉트 송신!
              style={{ backgroundColor: '#141414', border: '2px solid #8C6D3B', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 15px rgba(0,0,0,0.5)', cursor: 'pointer' }}
              className="hover:border-[#C5A059] transition-all" // 미세한 호버 효과 추가
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
                <p style={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', color: '#C5A059', fontSize: '12px', fontWeight: 'bold', padding: '6px', margin: 0, textAlign: 'center' }}>
                  상세 정보 및 방제 보러가기 →
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