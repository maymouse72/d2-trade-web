'use client';

import { useState } from 'react';
import Image from 'next/image';
import records from './data.json';
import styles from './sets.module.css';

const pageSize = 8;
const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '');
const searchable = records.map(set => ({ set, text: normalize([set.name,set.english,set.legacy,...set.aliases,...set.full.map(option=>option.text),...set.partial.flatMap(group=>group.options.map(option=>option.text)),...set.pieces.flatMap(piece=>[piece.name,piece.english,piece.legacy,piece.base,piece.type,...piece.options.map(option=>option.text),...piece.bonuses.flatMap(group=>group.options.map(option=>option.text))])].join(' ')) }));
const classes = [...new Set(records.map(set=>set.className))].sort((a,b)=>a.localeCompare(b,'ko'));
const types = [...new Set(records.flatMap(set=>set.pieces.map(piece=>piece.type)))].sort((a,b)=>a.localeCompare(b,'ko'));
type Option = { text: string; variable: boolean };

function Options({ options }: { options: Option[] }) {
  return <ul className={styles.options}>{options.map((option,index)=><li key={index}>{option.text}{option.variable && <span className={styles.variable}> (변동)</span>}</li>)}</ul>;
}

export default function SetCatalog() {
  const [query,setQuery]=useState('');
  const [className,setClassName]=useState('');
  const [type,setType]=useState('');
  const [level,setLevel]=useState('');
  const [sort,setSort]=useState('name');
  const [page,setPage]=useState(1);
  const filtered=searchable.filter(({set,text})=>(!query.trim()||text.includes(normalize(query)))&&(!className||set.className===className)&&(!type||set.pieces.some(piece=>piece.type===type))&&(!level||set.level<=Number(level))).map(({set})=>set).sort((a,b)=>(sort==='level'?a.level-b.level:0)||a.name.localeCompare(b.name,'ko'));
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const currentPage=Math.min(page,totalPages);
  const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
  function reset(){setQuery('');setClassName('');setType('');setLevel('');setSort('name');setPage(1);}
  return <section className={styles.catalog}>
    <header><h2>세트 도감</h2><p>구성 아이템부터 조합 효과까지, 한 세트를 한눈에 확인하세요.</p></header>
    <div className={styles.filters} aria-label="세트 검색 조건">
      <label className={styles.search}>통합 검색<input type="search" value={query} placeholder="세트·아이템 이름, 별칭, 옵션 검색 (예: 탈셋, 시곤, 시전 속도)" onChange={e=>{setQuery(e.target.value);setPage(1);}} /></label>
      <label>주요 직업<select value={className} onChange={e=>{setClassName(e.target.value);setPage(1);}}><option value="">전체</option>{classes.map(value=><option key={value}>{value}</option>)}</select></label>
      <label>포함 장비<select value={type} onChange={e=>{setType(e.target.value);setPage(1);}}><option value="">전체 장비</option>{types.map(value=><option key={value}>{value}</option>)}</select></label>
      <label>전체 착용 레벨 이하<input type="number" min="1" max="99" placeholder="제한 없음" value={level} onChange={e=>{setLevel(e.target.value);setPage(1);}} /></label>
      <label>정렬<select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="name">이름순</option><option value="level">전체 착용 레벨 낮은 순</option></select></label>
      <button type="button" onClick={reset}>전체 초기화</button>
    </div>
    <p className={styles.result} role="status">전체 {records.length}세트 · 구성 아이템 {records.reduce((sum,set)=>sum+set.pieces.length,0)}개 중 <strong>{filtered.length}세트</strong> · {currentPage} / {totalPages} 페이지</p>
    <p className={styles.note}>전체 착용 레벨은 구성 아이템 중 가장 높은 요구 레벨입니다. 주요 직업은 분류를 위한 안내이며 모든 구성품의 착용 제한을 뜻하지 않습니다.</p>
    <div className={styles.list}>{visible.map(set=><article className={styles.set} key={set.id}>
      <div className={styles.setHeading}><div><h3>{set.name}</h3>{set.name!==set.english && <p className={styles.english}>{set.english}</p>}</div><span>{set.pieces.length}개 구성</span></div>
      <p className={styles.meta}>{set.className} · 전체 착용 Lv. {set.level}</p>
      <ul className={styles.members}>{set.pieces.map(piece=><li key={piece.id}><span className={styles.thumb}>{piece.image?<Image src={piece.image} alt={piece.name} width={42} height={58} unoptimized />:<span>이미지<br />미확보</span>}</span><div><span className={styles.memberName}>{piece.name}</span><span className={styles.memberMeta}>{piece.type} · {piece.base} · Lv. {piece.level}</span></div></li>)}</ul>
      <details className={styles.setDetails}><summary>구성 아이템 · 세트 효과 보기</summary>
        <section className={styles.effectSection} aria-label={`${set.name} 세트 효과`}>
          <h4>착용 개수별 효과</h4>
          <p className={styles.note}>개수별 효과는 누적되며, 전체 착용 시 아래의 추가 효과도 함께 적용됩니다.</p>
          {set.partial.length?set.partial.map(group=><div className={styles.bonus} key={group.count}><h5>{group.count}개 이상 착용</h5><Options options={group.options} /></div>):<p className={styles.note}>별도의 부분 세트 공통 효과가 없습니다. 구성품별 추가 효과를 확인하세요.</p>}
          <div className={`${styles.bonus} ${styles.complete}`}><h5>전체 {set.pieces.length}개 착용 시 추가 효과</h5><Options options={set.full} /></div>
        </section>
        <section className={styles.pieces} aria-label={`${set.name} 구성품 상세`}><h4>구성 아이템 상세</h4>{set.pieces.map(piece=><details className={styles.piece} key={piece.id}>
          <summary>{piece.name} <span>· Lv. {piece.level}</span></summary>
          {piece.name!==piece.english && <p className={styles.english}>{piece.english}</p>}
          <p className={styles.note}>{piece.base} · {piece.type} · {piece.tier}</p>
          <dl className={styles.requirements}><div><dt>요구 레벨</dt><dd>{piece.level}</dd></div><div><dt>필요 힘</dt><dd>{piece.strength||'—'}</dd></div><div><dt>필요 민첩</dt><dd>{piece.dexterity||'—'}</dd></div></dl>
          <h5>개별 아이템 옵션</h5><Options options={piece.options} />
          {piece.bonuses.map((group,index)=><div className={styles.bonus} key={index}><h5>{group.condition} · 이 아이템에 추가</h5><Options options={group.options} /></div>)}
          {piece.baseStats.length>0&&<div className={styles.baseStats}><h5>옵션 적용 전 기본 성능</h5>{piece.baseStats.map(stat=><p key={stat}>{stat}</p>)}</div>}
          <p className={styles.note}>최종 피해·방어력과 업그레이드 후 착용 조건은 달라질 수 있습니다.</p>
          {piece.availability&&<p className={styles.note}>{piece.availability}</p>}
          {piece.legacy&&<p className={styles.note}>구명칭: {piece.legacy}</p>}
          {piece.imageSource&&<a href={piece.imageSource} target="_blank" rel="noreferrer" className={styles.source}>공식 가이드 이미지 출처 ↗</a>}
        </details>)}</section>
      </details>
    </article>)}</div>
    {!filtered.length&&<div className={styles.empty}><p>조건에 맞는 세트가 없습니다.</p><button onClick={reset}>검색 조건 초기화</button></div>}
    <nav aria-label="세트 목록 페이지" className={styles.pagination}><button disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>이전</button><span>{currentPage} / {totalPages}</span><button disabled={currentPage>=totalPages} onClick={()=>setPage(currentPage+1)}>다음</button></nav>
    <footer className={styles.footer}><p>2026-10-28 수집 · 활성 세트 데이터 기준. 일부 신규 세트는 영문 이름과 이미지 미확보 안내로 표시됩니다. 패치·확장팩·시즌에 따라 옵션과 획득 조건이 달라질 수 있습니다.</p><p>수치: <a href="https://github.com/blizzhackers/d2data" target="_blank" rel="noreferrer">d2data</a> · 한글 이름 대조: <a href="https://github.com/SeonEngineer/D2R" target="_blank" rel="noreferrer">D2R 언어 자료</a> · 이미지: <a href="https://classic.battle.net/diablo2exp/items/sets/sets7.shtml" target="_blank" rel="noreferrer">The Arreat Summit</a>. Diablo II 및 게임 이미지의 권리는 Blizzard Entertainment에 있습니다. 비공식 팬 사이트입니다.</p></footer>
  </section>;
}
