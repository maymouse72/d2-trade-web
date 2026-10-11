'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import PostModal from './PostModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function MarketHome() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
  }, []);

  const handleModalSubmit = async (formData: any) => {
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#DCDCDC] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#C76C2E] tracking-wider my-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          DIABLO II REALTIME MARKET
        </h1>

        <div className="flex justify-between items-center mb-6 bg-[#141414] p-4 border border-[#8C6D3B] rounded shadow-lg">
          <p className="text-xs md:text-sm text-[#777777] font-bold">카드를 터치하면 방제가 자동 복사됩니다</p>
          <div className="flex gap-2">
            <button onClick={fetchTrades} disabled={loading} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#8C6D3B] text-white text-xs md:text-sm rounded transition cursor-pointer font-bold">
              {loading ? '로딩 중...' : '새로고침'}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-[#0A0A0A] text-xs md:text-sm font-bold rounded transition shadow-md cursor-pointer">
              내 매물 등록
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trades.map((trade: any) => (
            <div key={trade.id} onClick={() => handleCopyRoomName(trade.room_name)} className="bg-[#141414] border-2 border-[#8C6D3B] hover:border-[#C5A059] p-4 rounded flex flex-col justify-between shadow-xl cursor-pointer transition-all duration-200 group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-bold text-[#C76C2E] group-hover:text-[#E78C4E] transition-colors">
                    {trade.game_mode === 'standard' ? '[스탠] ' : '[래더] '}
                    {trade.item_name_ko}
                  </h3>
                  <span className="text-sm font-bold text-[#C5A059] shrink-0 bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#1A1A1A]">{trade.price_rune}</span>
                </div>
                <p className="text-xs text-[#DCDCDC] mb-4 bg-[#0A0A0A] p-2.5 rounded border border-[#1A1A1A] min-h-[54px] break-all leading-relaxed">
                  {trade.item_description || '상세 옵션 설명 없음'}
                </p>
              </div>
              <div className="border-t border-[#222222] pt-3 flex flex-col gap-1.5">
                <p className="text-xs font-bold text-[#00FF00] bg-[#0A0A0A] p-1.5 rounded border border-[#1A1A1A]">
                  인게임 방제: <span className="underline select-all text-[#22FF22] font-mono ml-1">{trade.room_name}</span>
                </p>
                <div className="flex justify-between items-center text-[10px] text-[#666666] px-1 mt-0.5">
                  <span className="font-medium">{trade.battlenet_id}</span>
                  <span className="text-[#8C6D3B] font-bold">{formatTime(trade.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && trades.length === 0 && (
          <p className="text-center text-[#555555] my-24 text-sm font-medium">현재 활성화된 실시간 거래 매물이 없습니다.</p>
        )}
      </div>

      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} submitting={submitting} />
    </div>
  );
}