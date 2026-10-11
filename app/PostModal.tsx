'use client';

import { useEffect, useState } from 'react';

export default function PostModal({ isOpen, onClose, onSubmit, submitting }) {
  const [gameMode, setGameMode] = useState('ladder');
  const [battlenetId, setBattlenetId] = useState('');
  const [itemBase, setItemBase] = useState('');
  const [description, setDescription] = useState('');
  const [priceRune, setPriceRune] = useState('');
  const [roomInfo, setRoomInfo] = useState('');

  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // 웹 폴더의 public 창고에서 한글 사전을 안전하게 스트리밍 로드
  useEffect(() => {
    fetch('/diablo2_items_light.json')
      .then((res) => res.json())
      .then((data) => {
        const names = Array.from(new Set(data.map((item: any) => item.name_ko)));
        setAllItems(names);
      })
      .catch((err) => console.error('사전 로드 실패:', err));
  }, []);

  // 자판을 칠 때마다 실시간으로 8개만 압축 필터링하는 엔진
  const handleItemChange = (e) => {
    const value = e.target.value;
    setItemBase(value);

    if (value.trim().length > 0) {
      const filtered = allItems
        .filter((name: string) => name.includes(value))
        .slice(0, 8);
      setFilteredItems(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({ gameMode, battlenetId, itemBase, description, priceRune, roomInfo });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#141414] border-2 border-[#8C6D3B] w-full max-w-md p-6 rounded-lg shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-3 right-4 text-xl text-[#777777] hover:text-white">✕</button>
        <h2 className="text-xl font-bold text-center text-[#C76C2E] mb-6 tracking-wide">NEW TRADE POST (WEB)</h2>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#DCDCDC] mb-1.5 font-medium">게임 모드 선택</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" checked={gameMode === 'ladder'} onChange={() => setGameMode('ladder')} className="accent-[#C5A059]" /> 래더 (Ladder)
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" checked={gameMode === 'standard'} onChange={() => setGameMode('standard')} className="accent-[#C5A059]" /> 스탠다드 (Standard)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#DCDCDC] mb-1 font-medium">배틀넷 ID (Battle.net Tag)</label>
            <input type="text" value={battlenetId} onChange={(e) => setBattlenetId(e.target.value)} placeholder="예: 홍길동#1234" className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#8C6D3B] text-white rounded text-sm outline-none focus:border-[#C5A059]" />
          </div>

          <div className="relative">
            <label className="block text-xs text-[#DCDCDC] mb-1 font-medium">아이템 베이스 (자동완성 검색)</label>
            <input 
              type="text" value={itemBase} onChange={handleItemChange} 
              onFocus={() => itemBase.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="예: 크리스탈 소드, 샤코" 
              className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#8C6D3B] text-white rounded text-sm outline-none focus:border-[#C5A059]" 
            />
            {showDropdown && filteredItems.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-[#141414] border border-[#8C6D3B] rounded shadow-2xl z-50 max-h-48 overflow-y-auto">
                {filteredItems.map((name, index) => (
                  <div 
                    key={index} onClick={() => { setItemBase(name); setShowDropdown(false); }}
                    className="px-3 py-1.5 text-xs text-left text-white hover:bg-[#C5A059] hover:text-[#0A0A0A] cursor-pointer font-medium border-b border-[#1A1A1A] last:border-b-0 transition-colors"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-[#DCDCDC] mb-1 font-medium">상세 옵션 및 설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="자유롭게 상세 수치를 적어주세요." rows={3} className="w-full p-3 bg-[#0A0A0A] border border-[#8C6D3B] text-white rounded text-sm outline-none focus:border-[#C5A059] resize-none" />
          </div>

          <div>
            <label className="block text-xs text-[#DCDCDC] mb-1 font-medium">희망 가격 (요구 룬 수량)</label>
            <input type="text" value={priceRune} onChange={(e) => setPriceRune(e.target.value)} placeholder="예: 2 베르, 자+로" className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#8C6D3B] text-white rounded text-sm outline-none focus:border-[#C5A059]" />
          </div>

          <div>
            <label className="block text-xs text-[#DCDCDC] mb-1 font-medium">인게임 방 정보 (방제 /// 패스워드)</label>
            <input type="text" value={roomInfo} onChange={(e) => setRoomInfo(e.target.value)} placeholder="예: dia-01 /// 1" className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#8C6D3B] text-white rounded text-sm outline-none focus:border-[#C5A059]" />
          </div>

          <button type="submit" disabled={submitting} className="w-full h-11 bg-[#C5A059] disabled:bg-[#555555] text-[#0A0A0A] font-bold rounded transition text-sm shadow-md mt-2">
            {submitting ? '서버로 등록 중...' : '매물 등록하기 (1시간 유지)'}
          </button>
        </form>
      </div>
    </div>
  );
}