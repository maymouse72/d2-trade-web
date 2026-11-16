import Link from 'next/link';
import SiteFrame from '../../SiteFrame';
import GameInfoNavigation from '../GameInfoNavigation';
import GuideDirectory from './GuideDirectory';
import styles from './leveling-guides.module.css';

export const metadata = {
  title: '직업별 맨땅 공략집 | 디아블로2 주고받고',
  description: '장비 지원 없이 시작하는 디아블로 II 레저렉션 직업별 맨땅 육성 가이드입니다.',
};

export default function LevelingGuidesPage() {
  return (
    <SiteFrame active="game-info">
      <GameInfoNavigation active="leveling-guides" />
      <section className={styles.page}>
        <nav aria-label="위치" className={styles.breadcrumb}>
          <Link href="/game-info">게임 정보</Link><span aria-hidden="true">›</span><span aria-current="page">직업별 맨땅 공략집</span>
        </nav>
        <header className={styles.directoryHero}>
          <span className={styles.eyebrow}>GAME INFO · START FROM SCRATCH</span>
          <h1>직업별 맨땅 공략집</h1>
          <p>아이템 지원 없이 노멀부터 헬까지! 직업을 선택해 육성 공략을 확인하세요.</p>
        </header>
        <GuideDirectory />
      </section>
    </SiteFrame>
  );
}
