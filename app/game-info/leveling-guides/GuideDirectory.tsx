'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import styles from './leveling-guides.module.css';

const classes = [
  { name: '원소술사', icon: '❄️', route: '/game-info/leveling-guides/sorceress', path: '화염구 → 얼음 보주', terms: '소서리스 Sorceress' },
  { name: '성기사', icon: '🛡️', route: '/game-info/leveling-guides/paladin', path: '신성한 불꽃 → 축복받은 망치', terms: '팔라딘 Paladin' },
  { name: '강령술사', icon: '💀', route: '/game-info/leveling-guides/necromancer', path: '해골 소환 → 시체 폭발', terms: '네크로맨서 네크 Necromancer 조폭넥 해골 되살리기 피해 증폭' },
  { name: '암살자', icon: '⚡', route: '/game-info/leveling-guides/assassin', path: '화염 덫 → 번개 덫', terms: '어쌔신 Assassin 트랩씬 번개 파수기 죽음 파수기' },
  { name: '아마존', icon: '🏹', route: '/game-info/leveling-guides/amazon', path: '독 투창 → 번개 자벨마', terms: 'Amazon 자벨린 자벨마 맨땅 번개의 격노 역병 투창' },
  { name: '드루이드', icon: '🌪️', route: '/game-info/leveling-guides/druid', path: '화염 → 바람 엘리드루', terms: 'Druid 엘리드루 Tornado 허리케인 회오리바람' },
  { name: '야만용사', icon: '⚔️', path: '근접 · 함성 육성', terms: '바바리안 Barbarian' },
  { name: '악마술사', icon: '🔮', path: 'RotW 전용 · 추후 검토', terms: 'Warlock' },
];

export default function GuideDirectory() {
  const [query, setQuery] = useState('');
  const filteredClasses = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ko-KR');
    if (!normalized) return classes;
    return classes.filter((item) => `${item.name} ${item.path} ${item.terms}`.toLocaleLowerCase('ko-KR').includes(normalized));
  }, [query]);

  return (
    <>
      <label className={styles.directorySearch}>
        직업 검색
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="강령술사, 네크로맨서, 조폭넥…" />
      </label>
      <div className={styles.classGrid}>
        {filteredClasses.map((characterClass) => characterClass.route ? (
          <Link className={`${styles.classCard} ${styles.available}`} href={characterClass.route} key={characterClass.name}>
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
      {filteredClasses.length === 0 && <p className={styles.directoryNote} role="status">검색 결과가 없습니다.</p>}
      <p className={styles.directoryNote}>원소술사·성기사·강령술사·암살자·아마존·드루이드 공략을 제공합니다. 나머지 직업은 검토 후 추가할 예정입니다.</p>
    </>
  );
}
