import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './SiteFrame.module.css';

export default function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside aria-label="왼쪽 광고" className={`fixed-ad-banner fixed-left-box ${styles.ad}`}>
        <h4 className="ad-title">광고주 모집</h4>
        <p className="ad-text-muted">디아블로2<br />실시간 마켓<br />배너 광고 구역</p>
        <div className="ad-footer-divider"><span className="ad-label">문의 이메일</span><span className="ad-email-text">maymouse72<br />@gmail.com</span></div>
      </aside>
      <aside aria-label="오른쪽 광고" className={`fixed-ad-banner fixed-right-box ${styles.ad}`}>
        <h4 className="ad-title">AD ZONE</h4>
        <p className="ad-text-muted">24시간<br />잠들지 않는<br />트레이드 스페이스</p>
        <div className="ad-footer-divider"><span className="ad-label">AD INQUIRY</span><span className="ad-email-text">maymouse72<br />@gmail.com</span></div>
      </aside>
      <div className={`center-board-container ${styles.board}`}>
        <header>
          <div className="welcome-banner-text">D2 주고받고(://d2jugobatgo.com) 사이트 방문을 환영합니다!!</div>
          <h1 className="main-platform-title">DIABLO II REALTIME MARKET</h1>
          <nav aria-label="주요 메뉴" className={styles.nav}>
            <Link href="/" className="market-button market-button-primary">거래소</Link>
            <Link href="/runewords" className="market-button market-button-refresh">룬워드 도감</Link>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
