'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { TradeFormValues } from './trade-types';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TradeFormValues, resetFormFields: () => void) => void | Promise<void>;
  submitting: boolean;
}

export default function PostModal({ isOpen, onClose, onSubmit, submitting }: PostModalProps) {
  const [gameMode, setGameMode] = useState<TradeFormValues['gameMode']>('ladder');
  const [battlenetId, setBattlenetId] = useState('');
  const [itemBase, setItemBase] = useState('');
  const [description, setDescription] = useState('');
  const [priceRune, setPriceRune] = useState('');
  const [roomInfo, setRoomInfo] = useState('');

  // 💡 [타입 버그 해결] 단순 string이 아니라 배열([]) 형태로 변수방을 명확하게 선언합니다!
  const [allItems, setAllItems] = useState<string[]>([]);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/diablo2_items_light.json')
      .then((res) => res.json())
      .then((data: { name_ko: string }[]) => {
        const names = Array.from(new Set(data.map((item) => item.name_ko)));
        setAllItems(names);
      })
      .catch((err) => console.error('사전 로드 실패:', err));
  }, []);

  const handleItemChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  // 💡 [자동 청소기 비서 엔진] 등록 성공 신호를 받으면 칸을 싹 치워주는 함수 보따리
  const resetFormFields = () => {
    setItemBase('');
    setDescription('');
    setPriceRune('');
    setRoomInfo('');
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!battlenetId || !itemBase || !priceRune || !roomInfo) {
      alert('필수 항목을 모두 입력해 주세요!');
      return;
    }
    // 부모 비서(MarketHome)에게 청소기 함수(resetFormFields)를 함께 동봉해서 넘겨줍니다!
    onSubmit({ gameMode, battlenetId, itemBase, description, priceRune, roomInfo }, resetFormFields);
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    height: '44px',
    padding: '10px 14px',
    backgroundColor: '#0A0A0A',
    border: '2px solid #8C6D3B',
    color: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    textAlign: 'left' as const,
  };

  return (
    <div className="fixed inset-0 p-4 z-50 bg-black/80" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#141414', border: '2px solid #8C6D3B', width: '90%', maxWidth: '440px', padding: '28px 24px 24px 24px', borderRadius: '8px', boxSizing: 'border-box', position: 'relative', boxShadow: '0 20px 25px rgba(0,0,0,0.5)' }}>
        
        <button 
          type="button" 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'transparent', border: 'none', color: '#777777', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', outline: 'none', padding: 0, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <h2 style={{ color: '#C76C2E', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginTop: '4px', marginBottom: '24px', letterSpacing: '1px' }}>
          NEW TRADE POST (WEB)
        </h2>
        
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#AAAAAA', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '0.5px' }}>게임 모드 선택</label>
            <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222', display: 'flex', gap: '24px', padding: '12px', borderRadius: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: '#DCDCDC' }}>
                <input type="radio" checked={gameMode === 'ladder'} onChange={() => setGameMode('ladder')} style={{ accentColor: '#C5A059', cursor: 'pointer' }} /> 래더 (Ladder)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: '#DCDCDC' }}>
                <input type="radio" checked={gameMode === 'standard'} onChange={() => setGameMode('standard')} style={{ accentColor: '#C5A059', cursor: 'pointer' }} /> 스탠다드 (Standard)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#AAAAAA', fontWeight: 'bold' }}>배틀넷 ID (Battle.net Tag)</label>
            <input type="text" value={battlenetId} onChange={(e) => setBattlenetId(e.target.value)} placeholder="예: 홍길동#1234" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
            <label style={{ fontSize: '12px', color: '#AAAAAA', fontWeight: 'bold' }}>아이템 베이스 (자동완성 검색)</label>
            <input 
              type="text" value={itemBase} onChange={handleItemChange} 
              onFocus={() => itemBase && itemBase.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="예: 크리스탈 소드, 샤코" style={inputStyle}
            />
            {showDropdown && filteredItems && filteredItems.length > 0 && (
              <div style={{ backgroundColor: '#141414', border: '2px solid #8C6D3B', position: 'absolute', left: 0, right: 0, top: '70px', borderRadius: '4px', boxShadow: '0 20px 25px rgba(0,0,0,0.5)', zIndex: 100, maxHeight: '180px', overflowY: 'auto' }}>
                {filteredItems.map((name, index) => (
                  <div 
                    key={index} onClick={() => { setItemBase(name); setShowDropdown(false); }}
                    style={{ borderBottom: '1px solid #222222', padding: '10px 14px', textAlign: 'left', fontSize: '13px', color: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold' }}
                    className="hover:bg-[#C5A059] hover:text-[#0A0A0A]"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#AAAAAA', fontWeight: 'bold' }}>상세 옵션 및 설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="자유롭게 상세 수치를 적어주세요." rows={3} style={{ ...inputStyle, height: 'auto', resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#AAAAAA', fontWeight: 'bold' }}>희망 가격 (요구 룬 수량)</label>
            <input type="text" value={priceRune} onChange={(e) => setPriceRune(e.target.value)} placeholder="예: 2 베르, 자+로" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#AAAAAA', fontWeight: 'bold' }}>인게임 방 정보 (방제 /// 패스워드)</label>
            <input type="text" value={roomInfo} onChange={(e) => setRoomInfo(e.target.value)} placeholder="예: dia-01 /// 1" style={inputStyle} />
          </div>

          <button type="submit" disabled={submitting} style={{ backgroundColor: submitting ? '#444444' : '#C5A059', color: '#0A0A0A', width: '100%', height: '48px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'extrabold', cursor: 'pointer', marginTop: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            {submitting ? '서버로 등록 중...' : '매물 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
