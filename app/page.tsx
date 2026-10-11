'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import PostModal from './PostModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function Home() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 💡 [1시간 자동 차단 내장형] 서버 창고에서 딱 1시간 이내의 거래글만 긁어오는 광속 엔진
  const fetchTrades = async () => {
    setLoading(true);

    // 스마트폰/PC의 현재 시각에서 정확히 1시간(60분)을 뒤로 뺀 마지노선 시각 계산
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('status', 'active')
      // ⬇️ [백엔드 핵심 필터] 등록시각(created_at)이 '지금으로부터 1시간 전 시각'보다 큰(gt) 정품 최신 매물만 수집!
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

  const handleModalSubmit = async (formData) => {
    const { gameMode, battlenetId, itemBase, description, priceRune, roomInfo } = formData;

    if (!battlenetId || !itemBase || !priceRune || !roomInfo) {
      alert('필수 항목을 모두 입력해 주세요!');
      return;
    }

    if (!battlenetId.includes('#') || battlenetId.indexOf('#') === battlenetId.length - 1) {
      alert('올바른 배틀넷 ID 형식이 아닙니다!\n(예: 홍길동#1234 형태로 입력하세요)');
      return;
    }

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
      setIsModalOpen(false);
      fetchTrades();
    }
  };

  // 💡 [새로 추가된 핵심 웹 복사 기능] 카드를 누르면 클립보드에 인게임 방제를 주입하는 함수
  const handleCopyRoomName = (roomName) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(roomName)
        .then(() => {
          alert(`인게임 방제 [ ${roomName} ] 가 클립보드에 복사되었습니다!\n디아블로2 대기실 창에 바로 붙여넣기(Ctrl+V) 하세요.`);
        })
        .catch(() => {
          alert('복사에 실패했습니다. 수동으로 복사해 주세요.');
        });
    } else {
      // 구형 브라우저 우회 대응책
      const textArea = document.createElement("textarea");
      textArea.value = roomName;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert(`인게임 방제 [ ${roomName} ] 가 복사되었습니다!`);
      } catch (err) {
        alert('복사 실패');
      }
      document.body.removeChild(textArea);
    }
  };

  const formatTime = (createdAt) => {
    try {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();
      const diffMinutes = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffMinutes < 1) return '방금 전';
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      return `${createdDate.getMonth() + 1}/${createdDate.getDate()}`;
    } catch (e) {
      return '방금 전';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#DCDCDC] p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-2xl md:text-3xl font-bold text-center text-[#C76C2E] tracking-wider mb-8">
          DIABLO II REALTIME MARKET
        </h1>

        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-[#777777]">실시간 거래 매물 현황 (카드를 터치하면 방제가 자동 복사됩니다)</p>
          <div className="flex gap-2">
            <button onClick={fetchTrades} disabled={loading} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#8C6D3B] text-white text-xs md:text-sm rounded transition">
              {loading ? '로딩 중...' : '새로고침'}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-[#0A0A0A] text-xs md:text-sm font-bold rounded transition shadow-md">
              내 매물 등록
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trades.map((trade) => (
            // 💡 [클릭 이벤트 융합] 카드 전체 영역에 마우스 클릭 시 자동 복사 트리거 연결!
            <div 
              key={trade.id} 
              onClick={() => handleCopyRoomName(trade.room_name)}
              className="bg-[#141414] border border-[#8C6D3B] p-4 rounded flex flex-col justify-between shadow-lg cursor-pointer hover:border-[#C5A059] transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-[#C76C2E] pr-2 group-hover:text-[#E78C4E] transition-colors">
                    {trade.game_mode === 'standard' ? '[스탠] ' : '[래더] '}
                    {trade.item_name_ko}
                  </h3>
                  <span className="text-sm font-bold text-[#C5A059] shrink-0">{trade.price_rune}</span>
                </div>
                <p className="text-xs text-[#DCDCDC] mb-4 bg-[#0A0A0A] p-2 rounded min-h-[48px] border border-[#1A1A1A] break-all">
                  {trade.item_description || '상세 옵션 설명 없음'}
                </p>
              </div>

              <div className="border-t border-[#1A1A1A] pt-3 flex flex-col gap-1">
                <p className="text-xs font-bold text-[#00FF00]">
                  인게임 방제: <span className="underline select-all bg-[#1A1A1A] px-1 rounded text-[#22FF22]">{trade.room_name}</span>
                </p>
                <div className="flex justify-between items-center text-[10px] text-[#777777] mt-1">
                  <span>{trade.battlenet_id}</span>
                  <span className="text-[#8C6D3B] font-medium">{formatTime(trade.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && trades.length === 0 && (
          <p className="text-center text-[#555555] my-20">현재 활성화된 거래 매물이 없습니다.</p>
        )}
      </div>

      <PostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit} 
        submitting={submitting} 
      />
    </div>
  );
}