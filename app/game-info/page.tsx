import Link from 'next/link';
import SiteFrame from '../SiteFrame';
import GameInfoNavigation from './GameInfoNavigation';
import styles from './game-info.module.css';

export const metadata = {
  title: '게임 정보 | 디아블로2 주고받고',
  description: '디아블로2 레저렉션의 경험치 정보와 공속 계산기를 확인하세요.',
};

export default function Page() {
  return (
    <SiteFrame active="game-info">
      <section className={styles.hub} aria-labelledby="game-info-title">
        <p className={styles.eyebrow}>DIABLO II · GAME INFO</p>
        <h2 id="game-info-title">게임 정보</h2>
        <p className={styles.intro}>디아블로2 레저렉션의 참고 정보와 계산 도구를 확인하세요.</p>
        <GameInfoNavigation />
        <div className={styles.cards}>
          <Link href="/game-info/experience" className={styles.card}>
            <span className={styles.cardLabel}>REFERENCE</span>
            <strong>경험치 정보</strong>
            <span>캐릭터 레벨에 맞는 난이도·액트별 참고 효율을 확인합니다.</span>
            <span className={styles.cardAction}>경험치 정보 보기 <span aria-hidden="true">→</span></span>
          </Link>
          <Link href="/game-info/ias-calculator" className={styles.card}>
            <span className={styles.cardLabel}>CALCULATOR</span>
            <strong>공속 계산기</strong>
            <span>검증된 성기사 크리스탈 소드 A1 기준 IAS 프레임을 확인합니다.</span>
            <span className={styles.cardAction}>공속 계산기 열기 <span aria-hidden="true">→</span></span>
          </Link>
        </div>
      </section>
    </SiteFrame>
  );
}
