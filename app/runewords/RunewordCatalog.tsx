'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import records from './data.json';
import runeFiles from './runes.json';
import styles from './catalog.module.css';

const equipment = [...new Set(records.map(row => row.equipment))].sort((a, b) => a.localeCompare(b, 'ko'));
const runes = [...new Set(records.flatMap(row => row.runes))].sort((a, b) => a.localeCompare(b, 'ko'));
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
    <div className={styles.shell}>
      <aside aria-label="왼쪽 광고" className={`fixed-ad-banner fixed-left-box ${styles.adBanner}`}>
        <h4 className="ad-title">광고주 모집</h4>
        <p className="ad-text-muted">디아블로2<br />실시간 마켓<br />배너 광고 구역</p>
        <div className="ad-footer-divider"><span className="ad-label">문의 이메일</span><span className="ad-email-text">maymouse72<br />@gmail.com</span></div>
      </aside>
      <aside aria-label="오른쪽 광고" className={`fixed-ad-banner fixed-right-box ${styles.adBanner}`}>
        <h4 className="ad-title">AD ZONE</h4>
        <p className="ad-text-muted">24시간<br />잠들지 않는<br />트레이드 스페이스</p>
        <div className="ad-footer-divider"><span className="ad-label">AD INQUIRY</span><span className="ad-email-text">maymouse72<br />@gmail.com</span></div>
      </aside>
      <main className={`center-board-container ${styles.catalog}`}>
      <div className="welcome-banner-text">D2 주고받고(://d2jugobatgo.com) 사이트 방문을 환영합니다!!</div>
      <h1 className="main-platform-title">DIABLO II REALTIME MARKET</h1>
      <nav aria-label="주요 메뉴" style={{ display: "flex", gap: 12, marginBottom: 24 }}><Link href="/" className="market-button market-button-refresh">거래소</Link><Link href="/runewords" aria-current="page" className="market-button market-button-primary">룬워드 도감</Link></nav>
      <header className={styles.catalogHeader}><h2>룬워드 도감</h2><p>필요한 장비와 룬을 선택하고, 나에게 맞는 조합을 찾아보세요.</p></header>
      <section className={styles.filters} aria-label="룬워드 검색 조건">
        <label className={styles.search}>통합 검색<input type="search" placeholder="이름·영문명·옵션·룬 검색" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label>장비 종류<select value={base} onChange={e => setBase(e.target.value)}><option value="">전체 장비</option>{equipment.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>소켓 수<select value={sockets} onChange={e => setSockets(e.target.value)}><option value="">전체 소켓</option>{[2,3,4,5,6].map(value => <option key={value} value={value}>{value}소켓</option>)}</select></label>
        <label>최대 요구 레벨<input type="number" min="1" max="99" placeholder="제한 없음" value={level} onChange={e => setLevel(e.target.value)} /></label>
        <label>포함 룬<select value={rune} onChange={e => setRune(e.target.value)}><option value="">전체 룬</option>{runes.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>정렬<select value={sort} onChange={e => setSort(e.target.value)}><option value="name">이름순</option><option value="level">레벨 낮은 순</option><option value="sockets">소켓 적은 순</option></select></label>
        <button type="button" onClick={reset}>전체 초기화</button>
      </section>
      <div className={styles.result} role="status">전체 {records.length}개 중 <strong>{visible.length}개</strong>{base && ` · ${base}`}{sockets && ` · ${sockets}소켓`}{level && ` · ${level}레벨 이하`}{rune && ` · ${rune} 포함`}</div>
      <p className={styles.note}>룬은 왼쪽부터 표시된 순서대로 장착하세요. 요구 레벨과 옵션은 제공된 엑셀 기준이며, 게임 버전·모드별 제작 조건은 별도 확인이 필요합니다.</p>
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
      </main>
    </div>
  );
}
