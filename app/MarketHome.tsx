'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PostModal from './PostModal';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dzttxnsqarwksbxnvypt.supabase.co';
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
    <div className="layout-body-wrapper">
      
      {/* 왼쪽 광고 배너 기둥 */}
      {!isMobile && (
        <div className="fixed-ad-banner fixed-left-box">
          <h4 className="ad-title">광고주 모집</h4>
          <p className="ad-text-muted">디아블로2<br />실시간 마켓<br />배너 광고 구역</p>
          <div className="ad-footer-divider">
            <span className="ad-label">문의 이메일</span>
            <span className="ad-email-text">maymouse72<br />@gmail.com</span>
          </div>
        </div>
      )}

      {/* 오른쪽 광고 배너 기둥 */}
      {!isMobile && (
        <div className="fixed-ad-banner fixed-right-box">
          <h4 className="ad-title">AD ZONE</h4>
          <p className="ad-text-muted">24시간<br />잠들지 않는<br />트레이드 스페이스</p>
          <div className="ad-footer-divider">
            <span className="ad-label">AD INQUIRY</span>
            <span className="ad-email-text">maymouse72<br />@gmail.com</span>
          </div>
        </div>
      )}

      {/* 중앙 메인 트레이드 제어판 */}
      <div className="center-board-container">
        
        <div className="welcome-banner-text">
          D2 주고받고(://d2jugobatgo.com) 사이트 방문을 환영합니다!!
        </div>

        <h1 className="main-platform-title">
          DIABLO II REALTIME MARKET
        </h1>

        <nav aria-label="주요 메뉴" style={{ display: "flex", gap: 12, marginBottom: 24 }}><Link href="/" aria-current="page" className="market-button market-button-primary">거래소</Link><Link href="/runewords" className="market-button market-button-refresh">룬워드 도감</Link></nav>

        {/* 컨트롤 유틸리티 대시보드 */}
        <div className="market-toolbar">
          <p className="market-toolbar-copy">
            🔮 카드를 터치하면 상세페이지로 이동하며 실시간 네고 댓글을 확인합니다.
          </p>
          <div className="market-toolbar-actions">
            <button onClick={fetchTrades} disabled={loading} className="market-button market-button-refresh">
              {loading ? '로딩 중...' : '새로고침'}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="market-button market-button-primary">
              내 매물 등록
            </button>
          </div>
        </div>

        {/* 성역의 실시간 아이템 카드 트레이드 그리드 */}
        <div className="grid">
          {trades && trades.map((trade: any) => (
            <div 
              key={trade.id} 
              onClick={() => router.push(`/trade/${trade.id}`)}
              className="trade-card"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-4">
                  <h3>
                    {trade.game_mode === 'standard' ? '스탠' : '래더'} · {trade.item_name_ko}
                  </h3>
                  <span className="trade-price">
                    {trade.price_rune}
                  </span>
                </div>
                <p className="trade-description">
                  {trade.item_description || '상세 옵션 설명이 등록되지 않은 전설 매물입니다.'}
                </p>
              </div>

              <div className="trade-card-footer">
                <p className="trade-card-action">
                  흥정 제안 및 방제 보러가기 →
                </p>
                <div className="trade-card-meta">
                  <span>{trade.battlenet_id}</span>
                  <span>{formatTime(trade.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && (!trades || trades.length === 0) && (
          <p className="text-center text-sm font-bold tracking-wider my-24 text-[#555555]">현재 성역에 활성화된 실시간 거래 매물이 존재하지 않습니다.</p>
        )}
      </div>

      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} submitting={submitting} />
    </div>
  );
}
