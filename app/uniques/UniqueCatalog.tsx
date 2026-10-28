'use client';

import { useState } from 'react';
import Image from 'next/image';
import items from './data.json';
import styles from './uniques.module.css';

const pageSize = 24;
const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '');
const searchable = items.map(item => ({ item, text: normalize([item.name, item.english, item.legacy, item.base, item.baseEnglish, item.type, item.variant, ...item.aliases, ...item.options.map(option => option.text), ...item.optionGroups.flatMap(group => group.map(option => option.text))].join(' ')) }));

export default function UniqueCatalog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [tier, setTier] = useState('');
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const types = [...new Set(items.filter(item => !category || item.category === category).map(item => item.type))].sort((a,b) => a.localeCompare(b,'ko'));
  const filtered = searchable.filter(({item,text}) =>
    (!query.trim() || text.includes(normalize(query))) && (!category || item.category === category) &&
    (!type || item.type === type) && (!tier || item.tier === tier) && (!level || item.level <= Number(level))
  ).map(({item}) => item).sort((a,b) => (sort === 'level' ? a.level-b.level : 0) || a.name.localeCompare(b.name,'ko') || Number(a.id)-Number(b.id));
  const totalPages = Math.max(1, Math.ceil(filtered.length/pageSize));
  const currentPage = Math.min(page,totalPages);
  const visible = filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
  function reset() { setQuery('');setCategory('');setType('');setTier('');setLevel('');setSort('name');setPage(1); }
  return <section className={styles.catalog}>
    <header><h2>유니크 도감</h2><p>이름부터 옵션까지, 필요한 장비를 빠르게 찾아보세요.</p></header>
    <div className={styles.filters} aria-label="유니크 검색 조건">
      <label className={styles.search}>통합 검색<input type="search" value={query} placeholder="한글·영문 이름, 별칭, 옵션 검색 (예: 샤코, 조던, 시전 속도)" onChange={e=>{setQuery(e.target.value);setPage(1);}} /></label>
      <label>분류<select value={category} onChange={e=>{setCategory(e.target.value);setType('');setPage(1);}}><option value="">전체 분류</option>{['무기','방어구','장신구·기타'].map(value=><option key={value}>{value}</option>)}</select></label>
      <label>장비 종류<select value={type} onChange={e=>{setType(e.target.value);setPage(1);}}><option value="">전체 장비</option>{types.map(value=><option key={value}>{value}</option>)}</select></label>
      <label>기본 장비 등급<select value={tier} onChange={e=>{setTier(e.target.value);setPage(1);}}><option value="">전체 등급</option>{['노멀','익셉셔널','엘리트','기타'].map(value=><option key={value}>{value}</option>)}</select></label>
      <label>최대 요구 레벨<input type="number" value={level} min="1" max="99" placeholder="제한 없음" onChange={e=>{setLevel(e.target.value);setPage(1);}} /></label>
      <label>정렬<select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="name">이름순</option><option value="level">레벨 낮은 순</option></select></label>
      <button type="button" onClick={reset}>전체 초기화</button>
    </div>
    <p className={styles.result} role="status">전체 {items.length}개 중 <strong>{filtered.length}개</strong> · {currentPage} / {totalPages} 페이지{category && ` · ${category}`}{type && ` · ${type}`}{tier && ` · ${tier}`}{level && ` · ${level}레벨 이하`}</p>
    <div className={styles.list}>
      {visible.map(item=><article className={styles.card} key={item.id}>
        <div className={styles.heading}>
          <div className={styles.picture}>{item.image ? <Image src={item.image} alt={item.name} width={80} height={100} unoptimized /> : <span>이미지<br />미확보</span>}</div>
          <div><p className={styles.tag}>{item.type} · {item.tier}</p><h3>{item.name}</h3>{item.name !== item.english && <p className={styles.english}>{item.english}</p>}{item.variant && <p className={styles.variant}>{item.variant}</p>}<p className={styles.base}>{item.base}</p></div>
        </div>
        <dl className={styles.requirements}><div><dt>요구 레벨</dt><dd>{item.level}</dd></div><div><dt>필요 힘</dt><dd>{item.strength || '—'}</dd></div><div><dt>필요 민첩</dt><dd>{item.dexterity || '—'}</dd></div></dl>
        <ul className={styles.summary}>{item.options.slice(0,3).map((option,index)=><li key={index}>{option.text}{option.variable && <span className={styles.variable}> (변동)</span>}</li>)}</ul>
        <details><summary>전체 옵션 · 기본 성능 보기</summary>
          <ul className={styles.options}>{item.options.map((option,index)=><li key={index}>{option.text}{option.variable && <span className={styles.variable}> (변동)</span>}</li>)}</ul>
          {item.optionGroups.map((group, groupIndex) => <div className={styles.optionGroup} key={groupIndex}><h4>추가 옵션 {groupIndex + 1} · 아래 중 하나</h4><ul className={styles.options}>{group.map((option, index) => <li key={index}>{option.text}{option.variable && <span className={styles.variable}> (변동)</span>}</li>)}</ul></div>)}
          {item.baseStats.length>0 && <div className={styles.baseStats}><h4>기본 아이템 성능</h4>{item.baseStats.map(stat=><p key={stat}>{stat}</p>)}<p>위 수치는 옵션 적용 전 기본값입니다. 최종 피해·방어력은 옵션에 따라 달라집니다.</p></div>}
          <p className={styles.note}>{item.requirementsNote}</p>
          {item.availability && <p className={styles.note}>{item.availability}</p>}
          {(item.legacy || item.aliases.length>0) && <p className={styles.note}>구명칭·별칭: {[item.legacy,...item.aliases].filter(Boolean).join(' · ')}</p>}
          {item.imageSource && <a className={styles.source} href={item.imageSource} target="_blank" rel="noreferrer">공식 가이드 이미지 출처 ↗</a>}
        </details>
      </article>)}
    </div>
    {filtered.length===0 && <div className={styles.empty}><p>조건에 맞는 유니크 아이템이 없습니다.</p><button type="button" onClick={reset}>검색 조건 초기화</button></div>}
    <nav className={styles.pagination} aria-label="유니크 목록 페이지"><button disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>이전</button><span>{currentPage} / {totalPages}</span><button disabled={currentPage>=totalPages} onClick={()=>setPage(currentPage+1)}>다음</button></nav>
    <footer className={styles.footer}>
      <p>수집 기준: D2R 3.3.93847 데이터 · 2026-10-27 확인. 무지개 자락 주얼은 속성·발동 조건별로 구분했습니다. 퀘스트 아이템과 미사용·중복 내부 항목은 제외했습니다.</p>
      <p>일부 신규 아이템과 기술은 영문으로 표시됩니다. 이미지 미확보 항목은 안내 문구로 표시합니다. 실제 게임의 패치·확장팩에 따라 옵션과 획득 가능 여부가 달라질 수 있습니다.</p>
      <p>데이터: <a href="https://github.com/blizzhackers/d2data" target="_blank" rel="noreferrer">d2data</a> · 한글 이름: <a href="https://github.com/SeonEngineer/D2R" target="_blank" rel="noreferrer">D2R 언어 자료</a> · 이미지: <a href="https://classic.battle.net/diablo2exp/items/uniques.shtml" target="_blank" rel="noreferrer">The Arreat Summit</a>. Diablo II 및 게임 이미지의 권리는 Blizzard Entertainment에 있습니다. 비공식 팬 사이트입니다.</p>
    </footer>
  </section>;
}
