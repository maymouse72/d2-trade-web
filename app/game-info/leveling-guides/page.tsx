import Link from 'next/link';
import SiteFrame from '../../SiteFrame';
import GameInfoNavigation from '../GameInfoNavigation';
import styles from './leveling-guides.module.css';

export const metadata = {
  title: '직업별 맨땅 공략집 | 디아블로2 주고받고',
  description: '장비 지원 없이 시작하는 디아블로 II 레저렉션 직업별 맨땅 육성 가이드입니다.',
};

const classes = [
  { name: '원소술사', icon: '❄️', route: '/game-info/leveling-guides/sorceress', path: '화염구 → 얼음 보주', available: true },
  { name: '성기사', icon: '🛡️', route: '/game-info/leveling-guides/paladin', path: '신성한 불꽃 → 축복받은 망치', available: true },
  { name: '강령술사', icon: '💀', path: '해골 소환 → 시체 폭발' },
  { name: '암살자', icon: '⚡', path: '화염 덫 → 번개 덫' },
  { name: '아마존', icon: '🏹', path: '투창 · 번개 육성' },
  { name: '드루이드', icon: '🌪️', path: '화염 → 바람' },
  { name: '야만용사', icon: '⚔️', path: '근접 · 함성 육성' },
  { name: '악마술사', icon: '🔮', path: 'RotW 전용 · 추후 검토' },
];

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
        <div className={styles.classGrid}>
          {classes.map((characterClass) => characterClass.available ? (
            <Link className={`${styles.classCard} ${styles.available}`} href={characterClass.route!} key={characterClass.name}>
              <span aria-hidden="true" className={styles.classIcon}>{characterClass.icon}</span>
              <span className={styles.classText}><strong>{characterClass.name}</strong><small>{characterClass.path}</small></span>
              <span className={styles.cardArrow} aria-hidden="true">→</span>
            </Link>
          ) : (
            <div aria-disabled="true" className={styles.classCard} key={characterClass.name}>
              <span aria-hidden="true" className={styles.classIcon}>{characterClass.icon}</span>
              <span className={styles.classText}><strong>{characterClass.name}</strong><small>{characterClass.path}</small></span>
              <span className={styles.comingSoon}>준비 중</span>
            </div>
          ))}
        </div>
        <p className={styles.directoryNote}>현재 원소술사와 성기사 공략을 제공합니다. 나머지 직업은 검토 후 추가할 예정입니다.</p>
      </section>
    </SiteFrame>
  );
}
