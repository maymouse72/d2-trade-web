'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PostModal from './PostModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function MarketHome() {
  const router = useRouter();
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

  useEffect(() => {
    fetchTrades();
  }, []); 

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

  return (
    // 💡 디아블로 감성의 칠흑 배경 + 무료 다크 판타지 전사/악마 그래픽 백그라운드 블렌딩 연출
    <div className="relative min-h-screen bg-[#030303] text-[#DCDCDC] p-6 font-sans overflow-x-hidden bg-[url('https://unsplash.com')] bg-cover bg-center bg-fixed bg-blend-color-burn">
      
      {/* 백그라운드 디아블로풍 다크 암막 레이어 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/90 via-[#050505]/95 to-[#030303]/90 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-[900px] mx-auto">
        
        {/* 왼쪽 광고 배너 (Tailwind 완전 리팩토링) */}
        {!isMobile && (
          <div className="fixed top-[160px] left-[30px] w-[150px] h-[500px] bg-[#141414] border-2 border-dashed border-[#8C6D3B] rounded-md p-5 flex flex-col justify-center items-center text-center shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            <h4 className="text-[#C76C2E] m-0 mb-4 text-base font-bold tracking-wider">광고주 모집</h4>
            <p className="text-[#777777] text-xs leading-relaxed m-0 mb-6">디아블로2<br />실시간 마켓<br />배너 광고 구역</p>
            <div className="border-t border-gray-800 pt-4 w-full">
              <span className="block text-[#C5A059] text-xs font-bold mb-1">문의 이메일</span>
              <span className="block text-[#22FF22] text-xs font-mono font-bold break-all leading-normal">maymouse72<br />@gmail.com</span>
            </div>
          </div>
        )}

        {/* 오른쪽 광고 배너 (Tailwind 완전 리팩토링) */}
        {!isMobile && (
          <div className="fixed top-[160px] right-[30px] w-[150px] h-[500px] bg-[#141414] border-2 border-dashed border-[#8C6D3B] rounded-md p-5 flex flex-col justify-center items-center text-center shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            <h4 className="text-[#C76C2E] m-0 mb-4 text-base font-bold tracking-wider">AD ZONE</h4>
            <p className="text-[#777777] text-xs leading-relaxed m-0 mb-6">24시간<br />잠들지 않는<br />트레이드 스페이스</p>
            <div className="border-t border-gray-800 pt-4 w-full">
              <span className="block text-[#C5A059] text-xs font-bold mb-1">AD INQUIRY</span>
              <span className="block text-[#22FF22] text-xs font-mono font-bold break-all leading-normal">maymouse72<br />@gmail.com</span>
            </div>
          </div>
        )}

        {/* 상단 정식 사이트 레이블 */}
        <div className="text-[#C5A059] text-sm md:text-base font-bold text-center mt-6 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
          D2 주고받고(://d2jugobatgo.com) 사이트 방문을 환영합니다!!
        </div>

        {/* 고풍스러운 메인 타이틀 헤더 */}
        <h1 className="text-[#C76C2E] text-2xl md:text-3xl font-extrabold text-center tracking-[4px] mt-3 mb-8 drop-shadow-[0_4px_8px_rgba(0,0,0,1)] selection:bg-amber-900">
          DIABLO II REALTIME MARKET
        </h1>

        {/* 대시보드 제어 바 */}
        <div className="bg-[#141414] border border-[#8C6D3B] flex flex-col sm:flex-row justify-between items-center p-4 rounded-md mb-6 shadow-[0_4px_10px_rgba(0,0,0,0.5)] gap-4">
          <p className="text-[#888] text-xs md:text-sm font-semibold m-0 text-center sm:text-left">
            🛡️ 카드를 터치하면 상세페이지로 이동하며 실시간 네고 댓글을 확인합니다.
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={fetchTrades} disabled={loading} className="flex-1 sm:flex-none bg-[#1F1F1F] border border-[#8C6D3B] hover:border-[#C5A059] text-white px-4 py-2 text-xs font-bold rounded cursor-pointer transition-all active:scale-95 disabled:opacity-50">
              {loading ? '호라드림 감지중..' : '새로고침'}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none bg-gradient-to-b from-[#C5A059] to-[#9A7A3E] hover:from-[#Dbc281] hover:to-[#B48F48] text-[#0A0A0A] px-4 py-2 text-xs font-black rounded cursor-pointer border border-[#6E5325] shadow-md transition-all active:scale-95">
              내 매물 등록
            </button>
          </div>
        </div>

        {/* 아이템 매물 리스트 그리드 구역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trades && trades.map((trade: any) => (
            <div 
              key={trade.id} 
              onClick={() => router.push(`/trade/${trade.id}`)}
              className="group bg-[#111111]/90 border-2 border-[#8C6D3B] hover:border-[#C5A059] p-5 rounded-md flex flex-col justify-between shadow-[0_10px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_25px_rgba(197,160,89,0.15)] cursor-pointer transform hover:-translate-y-1 transition-all duration-200 relative overflow-hidden"
            >
              {/* 장식용 엔틱 코너 라인 효과 */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C5A059]/30 group-hover:border-[#C5A059]"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C5A059]/30 group-hover:border-[#C5A059]"></div>

              <div>
                <div className="flex justify-between items-start gap-2 mb-4">
                  <h3 className="text-[#C76C2E] group-hover:text-[#E2854A] text-base font-extrabold m-0 leading-snug tracking-wide transition-colors">
                    {trade.game_mode === 'standard' ? '스탠' : '래더'} · {trade.item_name_ko}
                  </h3>
                  <span className="text-[#C5A059] bg-[#030303] border border-[#2A2A2A] text-xs font-black px-2.5 py-1 rounded shadow-inner whitespace-nowrap">
                    {trade.price_rune}
                  </span>
                </div>
                <p className="bg-[#030303]/80 border border-[#1A1A1A] text-xs text-[#B0B0B0] p-3 rounded-md min-h-[64px] m-0 mb-4 break-all leading-relaxed font-mono">
                  {trade.item_description || '상세 옵션 설명이 명시되지 않은 전설 매물입니다.'}
                </p>
              </div>

              <div className="border-t border-[#222] pt-3 flex flex-col gap-2.5">
                <p className="bg-[#0A0A0A] border border-[#1F1F1F] group-hover:border-[#8C6D3B]/40 text-[#C5A059] text-xs font-bold py-1.5 m-0 text-center rounded transition-colors">
                  흥정 제안 및 방제 보러가기 →
                </p>
                <div className="flex justify-between items-center text-[11px] text-[#555] px-1 font-mono">
                  <span className="group-hover:text-[#888] transition-colors">{trade.battlenet_id}</span>
                  <span className="text-[#8C6D3B] font-bold">{formatTime(trade.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && (!trades || trades.length === 0) && (
          <p className="text-center text-[#555] my-24 text-sm font-bold tracking-wider">현재 성역에 활성화된 실시간 거래 매물이 존재하지 않습니다.</p>
        )}
      </div>

      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} submitting={submitting} />
    </div>
  );
}