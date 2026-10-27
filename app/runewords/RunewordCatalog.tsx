'use client';

import { useState } from 'react';
import SiteFrame from '../SiteFrame';
import Image from 'next/image';
import records from './data.json';
import runeFiles from './runes.json';
import styles from './catalog.module.css';

const equipment = [...new Set(records.map(row => row.equipment))].sort((a, b) => a.localeCompare(b, 'ko'));
const runes = '엘 엘드 티르 네프 에드 아이드 탈 랄 오르트 주울 앰 솔 샤엘 돌 헬 이오 룸 코 팔 렘 풀 우움 말 이스트 굴 벡스 오움 로 수르 베르 자 참 조드'.split(' ');
const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, '');

export default function RunewordCatalog() {
  const [query, setQuery] = useState('');
  const [base, setBase] = useState('');
  const [sockets, setSockets] = useState('');
  const [level, setLevel] = useState('');
  const [rune, setRune] = useState('');
  const [sort, setSort] = useState('name');
  const visible = records.filter(row =>
    (!query || normalize([row.name, row.base, row.runes.join(' '), row.options].join(' ')).includes(normalize(query))) &&
    (!base || row.equipment === base) && (!sockets || row.sockets === Number(sockets)) &&
    (!level || row.level <= Number(level)) && (!rune || row.runes.includes(rune))
  ).sort((a, b) => sort === 'level' ? a.level - b.level || a.id - b.id : sort === 'sockets' ? a.sockets - b.sockets || a.id - b.id : a.name.localeCompare(b.name, 'ko'));
  function reset() { setQuery(''); setBase(''); setSockets(''); setLevel(''); setRune(''); setSort('name'); }
  return (
    <SiteFrame active="runewords">
      <section className={styles.catalog}>
      <header className={styles.catalogHeader}><h2>룬워드 도감</h2><p>필요한 장비와 룬을 선택하고, 나에게 맞는 조합을 찾아보세요.</p></header>
      <section className={styles.filters} aria-label="룬워드 검색 조건">
        <label className={styles.search}>통합 검색<input type="search" placeholder="이름·영문명·옵션·룬 검색" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label>장비 종류<select value={base} onChange={e => setBase(e.target.value)}><option value="">전체 장비</option>{equipment.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>소켓 수<select value={sockets} onChange={e => setSockets(e.target.value)}><option value="">전체 소켓</option>{[2,3,4,5,6].map(value => <option key={value} value={value}>{value}소켓</option>)}</select></label>
        <label>최대 요구 레벨<input type="number" min="1" max="99" placeholder="제한 없음" value={level} onChange={e => setLevel(e.target.value)} /></label>
        <label>포함 룬<select value={rune} onChange={e => setRune(e.target.value)}><option value="">전체 룬</option>{runes.map((value, index) => <option key={value} value={value}>{index + 1}. {value}</option>)}</select></label>
        <label>정렬<select value={sort} onChange={e => setSort(e.target.value)}><option value="name">이름순</option><option value="level">레벨 낮은 순</option><option value="sockets">소켓 적은 순</option></select></label>
        <button type="button" onClick={reset}>전체 초기화</button>
      </section>
      <div className={styles.result} role="status">전체 {records.length}개 중 <strong>{visible.length}개</strong>{base && ` · ${base}`}{sockets && ` · ${sockets}소켓`}{level && ` · ${level}레벨 이하`}{rune && ` · ${rune} 포함`}</div>
      <p className={styles.note}>룬은 왼쪽부터 표시된 순서대로 장착하세요.</p>
      <div className={styles.list}>
        {visible.map(row => <article key={row.id} className={styles.card}>
          <div className={styles.heading}><h2>{row.name}</h2><span>Lv. {row.level}</span></div>
          <p className={styles.base}>{row.equipment} · {row.sockets}소켓</p>
          <ol className={styles.runes} aria-label="룬 장착 순서">{row.runes.map((name, index) => <li key={`${row.id}-${index}`}><span className={styles.order}>{index + 1}</span><Image src={`/runes/${runeFiles[name as keyof typeof runeFiles]}.gif`} alt={`${name} 룬`} width={28} height={28} unoptimized /><span>{name}</span></li>)}</ol>
          <details><summary>옵션 보기</summary><p className={styles.options}>{row.options}</p></details>
        </article>)}
      </div>
      {visible.length === 0 && <div className={styles.empty}><p>조건에 맞는 룬워드가 없습니다.</p><button onClick={reset}>검색 조건 초기화</button></div>}
      <footer className={styles.footer}>룬 이미지: <a href="https://classic.battle.net/diablo2exp/items/runes.shtml" target="_blank" rel="noreferrer">Blizzard Entertainment · The Arreat Summit</a>. Diablo II 및 게임 이미지의 권리는 Blizzard Entertainment에 있습니다. 본 사이트는 비공식 팬 사이트입니다.</footer>
      </section>
    </SiteFrame>
  );
}
