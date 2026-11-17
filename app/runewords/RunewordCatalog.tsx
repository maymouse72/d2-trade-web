'use client';

import { useState } from 'react';
import SiteFrame from '../SiteFrame';
import Image from 'next/image';
import { records, equipment, filterRecords, countKinds } from './catalog';
import runeFiles from './runes.json';
import styles from './catalog.module.css';
import { DEFAULT_MODE_PRESET, getModeContext } from '../item-catalog/mode-presets';
import { resolveItemVariant, type ItemVariant } from '../../lib/items/variants';
import { getBaseRecommendations, type BasePurpose } from '../../lib/runeword-bases';

const runes = '엘 엘드 티르 네프 에드 아이드 탈 랄 오르트 주울 앰 솔 샤엘 돌 헬 이오 룸 코 팔 렘 풀 우움 말 이스트 굴 벡스 오움 로 수르 베르 자 참 조드'.split(' ');
const purposeNames: Record<BasePurpose, string> = { leveling: '맨땅·육성', endgame: '최종 장비', mercenary: '용병' };
const equipmentTypeNames: Record<string, string> = {
  bodyArmor: '갑옷', helm: '투구', shield: '방패', paladinShield: '성기사 방패', necromancerShield: '강령술사 방패', warlockBook: '악마술사 마법서',
  sword: '검', axe: '도끼', mace: '메이스', club: '클럽', hammer: '해머', polearm: '폴암', spear: '스피어', staff: '스태프', bow: '보우', crossbow: '크로스보우', wand: '원드', claw: '클러', dagger: '대거', scepter: '셉터',
};

function recommendationGroup(baseItem: { equipmentTypes: string[] }) {
  const type = baseItem.equipmentTypes.find((value) => value === 'paladinShield' || value === 'necromancerShield' || value === 'warlockBook') || baseItem.equipmentTypes[0];
  return equipmentTypeNames[type] || type;
}

export default function RunewordCatalog() {
  const [query, setQuery] = useState('');
  const [base, setBase] = useState('');
  const [sockets, setSockets] = useState('');
  const [level, setLevel] = useState('');
  const [rune, setRune] = useState('');
  const [sort, setSort] = useState('name');
  const context = getModeContext(DEFAULT_MODE_PRESET);
  const visible = filterRecords({ query, base, sockets, level, rune, sort });
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
      <div className={styles.result} role="status">전체 {countKinds(records)}종 · 장비별 {records.length}개 항목 중 <strong>{countKinds(visible)}종 · {visible.length}개 항목</strong>{base && ` · ${base}`}{sockets && ` · ${sockets}소켓`}{level && ` · ${level}레벨 이하`}{rune && ` · ${rune} 포함`}</div>
      <p className={styles.note}>룬은 왼쪽부터 표시된 순서대로 장착하세요.<br />불사조·영혼·인내는 제작 장비에 따라 옵션이 달라, 장비별로 나누어 표시합니다.<br />악마술사의 군림 신규 룬워드 5종을 포함합니다. 표시 레벨보다 재료 장비의 요구 레벨이 높으면 재료 기준을 따릅니다.</p>
      <div className={styles.list}>
        {visible.map(row => {const result=resolveItemVariant(row,row.variants as ItemVariant[]|undefined,context);const current=result.properties || row;const baseRecommendations=getBaseRecommendations({ ...current, id: row.id });const groupedRecommendations = baseRecommendations.reduce<Record<string, typeof baseRecommendations>>((groups, recommendation) => {const group = recommendationGroup(recommendation.baseItem); (groups[group] ||= []).push(recommendation); return groups;}, {});return <article id={`runeword-${row.id}`} key={row.id} className={styles.card}>
          <div className={styles.heading}><h2>{row.name}</h2><span>Lv. {row.level}</span></div>
          <p className={styles.base}>{current.equipment} · {current.sockets}소켓{row.edition && ` · ${row.edition}`}</p>
          <ol className={styles.runes} aria-label="룬 장착 순서">{current.runes.map((name, index) => <li key={`${row.id}-${index}`}><span className={styles.order}>{index + 1}</span><Image src={`/runes/${runeFiles[name as keyof typeof runeFiles]}.gif`} alt={`${name} 룬`} width={28} height={28} unoptimized /><span>{name}</span></li>)}</ol>
          <details><summary>옵션 및 추천 베이스 보기</summary>
            <section className={styles.recommendations} aria-label={`${row.name} 추천 베이스`}>
              <h3>추천 베이스 아이템</h3>
              {Object.entries(groupedRecommendations).map(([group, recommendations]) => <div className={styles.recommendationGroup} key={group} aria-label={`${group} 추천 베이스`}>
              <h4>{group}</h4><ul>{recommendations.map(({ baseItem, purposes, reason }) => <li key={baseItem.id}>
                <div className={styles.recommendationHeading}><strong>{baseItem.nameKo} ({baseItem.tier})</strong>{baseItem.classRestriction && <span>{baseItem.classRestriction} 전용</span>}</div>
                <p>{reason}</p><div className={styles.purposes}>{purposes.map(purpose => <span key={purpose}>{purposeNames[purpose]}</span>)}</div>
              </li>)}</ul></div>)}
            </section>
            <p className={styles.options}>{current.options}</p>{current.base!==row.base&&<p className={styles.base}>기본 장비 조건: {current.base}</p>}
          </details>
        </article>})}
      </div>
      {visible.length === 0 && <div className={styles.empty}><p>조건에 맞는 룬워드가 없습니다.</p><button onClick={reset}>검색 조건 초기화</button></div>}
      <footer className={styles.footer}>룬 이미지: <a href="https://classic.battle.net/diablo2exp/items/runes.shtml" target="_blank" rel="noreferrer">Blizzard Entertainment · The Arreat Summit</a>. Diablo II 및 게임 이미지의 권리는 Blizzard Entertainment에 있습니다. 본 사이트는 비공식 팬 사이트입니다.</footer>
      </section>
    </SiteFrame>
  );
}
