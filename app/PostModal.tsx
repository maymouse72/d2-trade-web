'use client';

import { useEffect, useState } from 'react';

export default function PostModal({ isOpen, onClose, onSubmit, submitting }: any) {
  const [gameMode, setGameMode] = useState('ladder');
  const [battlenetId, setBattlenetId] = useState('');
  const [itemBase, setItemBase] = useState('');
  const [description, setDescription] = useState('');
  const [priceRune, setPriceRune] = useState('');
  const [roomInfo, setRoomInfo] = useState('');

  const [allItems, setAllItems] = useState<string[]>();
  const [filteredItems, setFilteredItems] = useState<string[]>();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/diablo2_items_light.json')
      .then((res) => res.json())
      .then((data) => {
        const names: any = Array.from(new Set(data.map((item: any) => item.name_ko)));
        setAllItems(names);
      })
      .catch((err) => console.error('사전 로드 실패:', err));
  }, []);

  const handleItemChange = (e: any) => {
    const value = e.target.value;
    setItemBase(value);
    if (allItems && value.trim().length > 0) {
      const filtered = allItems.filter((name: string) => name.includes(value)).slice(0, 8);
      setFilteredItems(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    if (!battlenetId || !itemBase || !priceRune || !roomInfo) {
      alert('필수 항목을 모두 입력해 주세요!');
      return;
    }
    onSubmit({ gameMode, battlenetId, itemBase, description, priceRune, roomInfo });
  };

  if (!isOpen) return null;

  return (
    // 💡 [오타 완벽 교정] backdropFilter, justifyContent, borderRadius, textAlign을 웹 표준 규격 객체 문법으로 완벽 정돈 완료!
    <div className="fixed inset-0 p-4 z-50 bg-black/80" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#141414', border: '2px solid #8C6D3B', maxWidth: '450px', width: '100%', margin: '0 auto' }} className="p-6 rounded shadow-2xl relative text-[#DCDCDC]">
        
        {/* X 닫기 버튼 우측 상단 정위치 완료 */}
        <button type="button" onClick={onClose} className="absolute cursor-pointer transition-colors" style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'transparent', border: 'none', color: '#777777', fontSize: '20px', fontWeight: 'bold' }}>✕</button>
        <h2 style={{ color: '#C76C2E', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '1px' }}>NEW TRADE POST (WEB)</h2>
        
        <form onSubmit={handleFormSubmit} className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 게임 모드 선택 */}
          <div>
            <label className="block text-xs text-[#AAAAAA] mb-2 font-bold tracking-wide">게임 모드 선택</label>
            <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222', display: 'flex', gap: '24px', padding: '12px', borderRadius: '4px' }}>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="radio" checked={gameMode === 'ladder'} onChange={() => setGameMode('ladder')} className="w-4 h-4 accent-[#C5A059] cursor-pointer" /> 래더 (Ladder)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="radio" checked={gameMode === 'standard'} onChange={() => setGameMode('standard')} className="w-4 h-4 accent-[#C5A059] cursor-pointer" /> 스탠다드 (Standard)
              </label>
            </div>
          </div>

          {/* 배틀넷 ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-xs text-[#AAAAAA] font-bold tracking-wide">배틀넷 ID (Battle.net Tag)</label>
            <input type="text" value={battlenetId} onChange={(e) => setBattlenetId(e.target.value)} placeholder="예: 홍길동#1234" style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: '#0A0A0A', border: '2px solid #8C6D3B', color: '#FFFFFF', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', textAlign: 'left' }} />
          </div>

          {/* 아이템 베이스 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
            <label className="text-xs text-[#AAAAAA] font-bold tracking-wide">아이템 베이스 (자동완성 검색)</label>
            <input 
              type="text" value={itemBase} onChange={handleItemChange} 
              onFocus={() => itemBase && itemBase.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="예: 크리스탈 소드, 샤코" 
              style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: '#0A0A0A', border: '2px solid #8C6D3B', color: '#FFFFFF', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', textAlign: 'left' }}
            />
            {showDropdown && filteredItems && filteredItems.length > 0 && (
              <div style={{ backgroundColor: '#141414', border: '2px solid #8C6D3B', position: 'absolute', left: 0, right: 0, top: '70px', borderRadius: '4px', boxShadow: '0 20px 25px rgba(0,0,0,0.5)', zIndex: 100, maxHeight: '180px', overflowY: 'auto' }}>
                {filteredItems.map((name, index) => (
                  <div 
                    key={index} onClick={() => { setItemBase(name); setShowDropdown(false); }}
                    style={{ borderBottom: '1px solid #222222', padding: '10px 14px', textAlign: 'left', fontSize: '13px', color: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 상세 옵션 설명 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-xs text-[#AAAAAA] font-bold tracking-wide">상세 옵션 및 설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="자유롭게 상세 수치를 적어주세요." rows={3} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0A0A0A', border: '2px solid #8C6D3B', color: '#FFFFFF', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', textAlign: 'left', resize: 'none' }} />
          </div>

          {/* 희망 가격 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-xs text-[#AAAAAA] font-bold tracking-wide">희망 가격 (요구 룬 수량)</label>
            <input type="text" value={priceRune} onChange={(e) => setPriceRune(e.target.value)} placeholder="예: 2 베르, 자+로" style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: '#0A0A0A', border: '2px solid #8C6D3B', color: '#FFFFFF', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', textAlign: 'left' }} />
          </div>

          {/* 인게임 방 정보 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-xs text-[#AAAAAA] font-bold tracking-wide">인게임 방 정보 (방제 /// 패스워드)</label>
            <input type="text" value={roomInfo} onChange={(e) => setRoomInfo(e.target.value)} placeholder="예: dia-01 /// 1" style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: '#0A0A0A', border: '2px solid #8C6D3B', color: '#FFFFFF', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', textAlign: 'left' }} />
          </div>

          {/* 등록 버튼 */}
          <button type="submit" disabled={submitting} style={{ backgroundColor: submitting ? '#444444' : '#C5A059', color: '#0A0A0A', width: '100%', height: '48px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'extrabold', cursor: 'pointer', marginTop: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            {submitting ? '서버로 등록 중...' : '매물 등록하기 (1시간 유지)'}
          </button>
        </form>
      </div>
    </div>
  );
}