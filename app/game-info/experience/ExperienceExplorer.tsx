'use client';

import { useRef, useState } from 'react';
import { bucket, columns, difficulties, highest, metadata, normalizeLevel, recommendedRange, rows, winners, type Filter } from './experience';
import styles from './experience.module.css';

const filters: { id: Filter; name: string }[] = [{ id: 'all', name: '전체' }, ...difficulties];
const legend = [['highest', '90~100%'], ['high', '70~89%'], ['medium', '40~69%'], ['low', '10~39%'], ['lowest', '0~9%']] as const;

export default function ExperienceExplorer() {
  const [level, setLevel] = useState(45);
  const [input, setInput] = useState('45');
  const [filter, setFilter] = useState<Filter>('all');
  const selectedRow = useRef<HTMLTableRowElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const row = rows[level - 1];
  const visibleDifficulties = filter === 'all' ? difficulties : difficulties.filter(difficulty => difficulty.id === filter);
  const visibleColumns = columns.filter(column => filter === 'all' || column.id === filter);
  const best = highest(row);
  const recommended = winners(row);
  const incomplete = row.values.some(value => value === null);

  function selectLevel(value: number) {
    const next = normalizeLevel(value, level);
    setLevel(next);
    setInput(String(next));
  }

  function changeInput(value: string) {
    setInput(value);
    const number = Number(value);
    if (value !== '' && Number.isInteger(number) && number >= 1 && number <= 99) setLevel(number);
  }

  function jumpToSelected() {
    const container = viewport.current;
    const target = selectedRow.current;
    if (!container || !target) return;
    container.scrollTop += target.getBoundingClientRect().top - container.getBoundingClientRect().top - 90;
  }

  return (
    <section className={styles.explorer} aria-labelledby="experience-title">
      <p className={styles.breadcrumb}>게임 정보 <span aria-hidden="true">›</span> 경험치 효율 조회</p>
      <div className={styles.heading}><h2 id="experience-title">경험치 효율 조회</h2><span className={styles.badge}>참고 자료</span></div>
      <p className={styles.intro}>내 레벨에 맞는 난이도와 액트를 비교해 보세요.</p>

      <div className={styles.controls}>
        <div className={styles.inputLine}>
          <label htmlFor="character-level">캐릭터 레벨</label>
          <input id="character-level" type="number" min="1" max="99" step="1" inputMode="numeric" value={input}
            onChange={event => changeInput(event.target.value)} onBlur={() => selectLevel(input.trim() === '' ? level : Number(input))}
            onKeyDown={event => { if (event.key === 'Enter') selectLevel(input.trim() === '' ? level : Number(input)); }} />
          <span className={styles.muted}>1~99레벨</span>
        </div>
        <label className={styles.srOnly} htmlFor="level-slider">슬라이더로 캐릭터 레벨 선택</label>
        <input id="level-slider" className={styles.slider} type="range" min="1" max="99" step="1" value={level}
          aria-valuetext={`${level}레벨`} onChange={event => selectLevel(Number(event.target.value))} />
        <div className={styles.rangeEnds}><span>1</span><span>50</span><span>99</span></div>
      </div>

      <div className={styles.recommendation} aria-live="polite" aria-atomic="true">
        <p className={styles.eyebrow}>{level}레벨 · 전체 난이도 기준</p>
        {level === 99 ? <><h3>최대 레벨에 도달했습니다</h3><p>추가 육성 추천은 제공하지 않습니다. 아래 표에서 참고 자료의 수치를 확인할 수 있습니다.</p></> :
          <><h3>{incomplete ? '확인된 값 중 추천' : '자료 기준 추천'}{recommended.length > 1 ? ' · 공동 최고' : ''}</h3>
            {recommended.length ? <ul className={styles.recommendedList}>{recommended.map(column => <li key={column.index}>
              <strong>{column.name} Act {column.act}</strong><span>추천 구간 {recommendedRange(level, column.index)}</span>
            </li>)}</ul> : <p>확인된 수치가 없어 추천할 수 없습니다.</p>}
            {best !== null ? <p className={styles.score}>참고 효율 <strong>{best}%</strong></p> : null}
            <p className={styles.muted}>첨부 표의 최고값 기준이며, 같은 액트가 최고인 연속 구간을 함께 안내합니다.</p>
          </>}
      </div>

      <p className={styles.notice}>첨부 경험치 표를 옮긴 참고 자료입니다. 실제 시간당 경험치나 최종 경험치 수령률을 뜻하지 않습니다. 테러존·파티·처치 속도는 반영하지 않습니다.</p>
      <div className={styles.filterBar} role="group" aria-label="경험치 표 난이도 필터">
        {filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} className={filter === item.id ? styles.activeFilter : styles.filter} onClick={() => setFilter(item.id)}>{item.name}</button>)}
      </div>
      <h3 className={styles.subheading}>{level}레벨 · {filters.find(item => item.id === filter)?.name} 액트별 참고 효율</h3>
      <div className={styles.actCards}>{visibleColumns.map(column => <div key={column.index} className={styles.actCard}>
        <span>{column.name} Act {column.act}</span><strong className={styles[bucket(row.values[column.index])]}>{row.values[column.index] === null ? '확인 필요' : `${row.values[column.index]}%`}</strong>
        {level < 99 && row.values[column.index] !== null && row.values[column.index] === best ? <small>★ 전체 기준 최고</small> : null}
      </div>)}</div>

      <div className={styles.tableHeading}><h3 className={styles.subheading}>전체 레벨 경험치 표</h3><button type="button" className={styles.filter} onClick={jumpToSelected}>선택 레벨로 이동</button></div>
      <div className={styles.legend} aria-label="참고 효율 색상 범례">{legend.map(([name, text]) => <span key={name}><i className={styles[name]} aria-hidden="true" />{text}</span>)}<span>★ 해당 행의 전체 기준 최고</span></div>
      <p id="table-help" className={styles.muted}>레벨 버튼을 누르면 추천이 바뀝니다. 표 안에서 위아래·좌우로 스크롤할 수 있습니다. ★는 실제 사냥 속도를 뜻하지 않습니다.</p>
      <div className={styles.tableViewport} ref={viewport} role="region" aria-label="레벨별 경험치 효율 표" aria-describedby="table-help" tabIndex={0}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>캐릭터 1~99레벨의 난이도 및 액트별 참고 효율. 단위 퍼센트. 작성 버전 및 계산 방식 미확인.</caption>
          <thead><tr><th rowSpan={2} scope="col" className={styles.corner}>레벨</th>{visibleDifficulties.map(difficulty => <th key={difficulty.id} colSpan={5} scope="colgroup">{difficulty.name}</th>)}</tr>
            <tr>{visibleColumns.map(column => <th key={column.index} scope="col">Act {column.act}</th>)}</tr></thead>
          <tbody>{rows.map(chartRow => {
            const max = highest(chartRow);
            return <tr key={chartRow.level} ref={chartRow.level === level ? selectedRow : undefined} className={chartRow.level === level ? styles.selected : undefined}>
              <th scope="row"><button type="button" aria-label={`${chartRow.level}레벨 선택`} aria-pressed={chartRow.level === level} onClick={() => selectLevel(chartRow.level)}>{chartRow.level}</button></th>
              {visibleColumns.map(column => {
                const value = chartRow.values[column.index];
                const isBest = value !== null && value === max;
                return <td key={column.index} className={styles[bucket(value)]} aria-label={`${chartRow.level}레벨 ${column.name} Act ${column.act}: ${value === null ? '확인 필요' : `${value}%`}${isBest ? ', 표의 최고값' : ''}`}>
                  {value === null ? '—' : `${value}%`}{isBest ? <span className={styles.star} aria-hidden="true">★</span> : null}
                </td>;
              })}
            </tr>;
          })}</tbody>
        </table>
      </div>
      <details className={styles.sources}><summary>자료 출처와 추천 기준</summary>
        <ul>
          <li>운영자 제공 「경험치 테이블.png」를 전사했습니다. 작성 게임 버전과 액트별 집계 방식은 확인되지 않았습니다.</li>
          <li>표는 일반 지역의 참고 비교용입니다. 70레벨 이후 별도 경험치 감소, 몬스터 구성과 실제 사냥 조건을 반영한 최종 계산표가 아닙니다.</li>
          <li>추천은 표시된 15개 셀의 최고값이며 동률을 모두 표시합니다. 난이도 필터를 바꿔도 전체 기준 추천은 유지됩니다. 추천 구간은 공동 최고가 되는 연속 레벨로 산출합니다.</li>
          <li>원문 하단 요약보다 셀 값을 우선합니다. 예: 43레벨 나이트메어 Act 1·2 공동 93%, 83레벨 헬 Act 3·4 공동 99%. 99레벨은 최대 레벨 안내를 표시합니다.</li>
          <li>표의 ‘평균 경험치’ 행은 집계 기준 미상으로 비교 화면에서 제외했습니다. 불명확한 수치를 확인하면 ‘확인 필요’로 관리합니다.</li>
        </ul>
        <p><a href="https://classic.battle.net/diablo2exp/basics/experience.shtml" target="_blank" rel="noreferrer">Blizzard 경험치 설명</a> · <a href="https://news.blizzard.com/de-de/article/23827590/patch-2-5-fuer-diablo-ii-resurrected-ist-jetzt-live" target="_blank" rel="noreferrer">Blizzard 테러존 안내</a></p>
        <p className={styles.muted}>자료 버전 {metadata.datasetVersion} · 전사일 {metadata.checkedAt} · 계산 방식 미검증</p>
      </details>
    </section>
  );
}
