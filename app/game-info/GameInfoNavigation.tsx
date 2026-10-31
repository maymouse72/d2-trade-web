import Link from 'next/link';
import styles from './game-info.module.css';

type GameInfoSection = 'experience' | 'ias-calculator' | null;

export default function GameInfoNavigation({ active = null }: { active?: GameInfoSection }) {
  return (
    <nav aria-label="게임 정보 메뉴" className={styles.subnav}>
      <Link href="/game-info/experience" aria-current={active === 'experience' ? 'page' : undefined} className={active === 'experience' ? styles.activeLink : styles.link}>
        경험치 정보
      </Link>
      <Link href="/game-info/ias-calculator" aria-current={active === 'ias-calculator' ? 'page' : undefined} className={active === 'ias-calculator' ? styles.activeLink : styles.link}>
        공속 계산기
      </Link>
    </nav>
  );
}
