// app/trade/[id]/page.tsx

import React from 'react';
import Link from 'next/link';

// [인터넷 금고 가상 데이터] 
// 추후 DB나 API 연동 시 이 부분을 fetch 요청으로 대체합니다.
const mockTradeVault = [
  { id: '1', title: '샤코 (Harlequin Crest)', price: '200 룬', seller: '독넥장인', desc: '급처합니다. 내구도 풀옵션' },
  { id: '2', title: '수수께끼 (Enigma) 메이지플레이트', price: '진오움룬 + @', seller: '팔라딘킹', desc: '15방상 작, 묻지마급 가격' },
  { id: '3', title: '무한 (Infinity) 싸이드', price: '베르룬 2개', seller: '체라소서', desc: '라깎 -55% 최상급 매물' },
];

interface PageProps {
  params: Promise<{ id: string }> | { id: string }; // Next.js 버전에 따른 호환성 처리
}

export default async function TradeDetailPage({ params }: PageProps) {
  // 1. 동적 라우팅 파라미터에서 고유 id 추출 (인터넷 금고 열쇠)
  const resolvedParams = await params;
  const itemId = resolvedParams.id;

  // 2. 인터넷 금고에서 id와 일치하는 매물 찾기 (전송 및 대조)
  const itemDetail = mockTradeVault.find((trade) => trade.id === itemId);

  // 3. 만약 금고에 없는 id라면 예외 처리
  if (!itemDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold text-red-500 mb-4">존재하지 않거나 삭제된 매물입니다.</h2>
        <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition">
          메인 마켓으로 돌아가기
        </Link>
      </div>
    );
  }

  // 4. 금고 전송 완료 성공 UI 렌더링
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 flex flex-col items-center">
      {/* 상세페이지 상단 헤더 */}
      <header className="w-full max-w-2xl flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
        <h1 className="text-xl font-extrabold text-yellow-500 tracking-wide">
          DIABLO II REALTIME MARKET
        </h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition">
          ← 목록으로
        </Link>
      </header>

      {/* 메인 상세 정보 카드 (인터넷 금고 데이터 수신함) */}
      <main className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        {/* 상단 장식 라인 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-amber-500"></div>

        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-mono text-gray-500">ITEM NO. #{itemDetail.id}</span>
          <span className="bg-amber-950 text-amber-400 border border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            거래 대기중
          </span>
        </div>

        <h2 className="text-2xl font-bold text-amber-100 mb-2">{itemDetail.title}</h2>
        
        <div className="grid grid-cols-2 gap-4 my-6 bg-gray-950 p-4 rounded-lg border border-gray-850">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">요구 가격</p>
            <p className="text-lg font-bold text-yellow-400 mt-1">{itemDetail.price}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">판매자 사장님</p>
            <p className="text-lg font-medium text-gray-200 mt-1">{itemDetail.seller}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">상세 설명</p>
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 min-h-[100px] text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {itemDetail.desc}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex gap-3">
          <button 
            onClick={() => alert('방제가 복사되었습니다! 게임 내에서 접속하세요.')}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-gray-950 font-bold rounded-lg transition-all shadow-md transform active:scale-[0.98]"
          >
            트레이드 방제 복사하기
          </button>
        </div>
      </main>

      {/* 하단 푸터 고정 */}
      <footer className="mt-8 text-xs text-gray-600">
        © 금별아빠 Realtime Trade Space. All rights reserved.
      </footer>
    </div>
  );
}