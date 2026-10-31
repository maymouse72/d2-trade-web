'use client';

import { useMemo, useState } from 'react';
import { getCalculatorViewModel, IAS_BREAKPOINTS } from '../../../lib/ias/ui-model';
import GameInfoNavigation from '../GameInfoNavigation';
import styles from './ias-calculator.module.css';

const classes = [
  ['AMAZON', '아마존'], ['ASSASSIN', '암살자'], ['BARBARIAN', '야만용사'], ['DRUID', '드루이드'],
  ['NECROMANCER', '강령술사'], ['PALADIN', '성기사'], ['SORCERESS', '원소술사'], ['WARLOCK', '워록'],
] as const;
const weapons = [['crs', '크리스탈 소드 (Crystal Sword)'], ['7cr', '페이즈 블레이드 (Phase Blade)'], ['whm', '워 해머 (War Hammer)']] as const;

export default function IASCalculator() {
  const [characterClass, setCharacterClass] = useState('PALADIN');
  const [weaponCode, setWeaponCode] = useState('crs');
  const [animation, setAnimation] = useState('A1');
  const [ias, setIAS] = useState('0');
  const model = useMemo(() => getCalculatorViewModel(ias, { characterClass, weaponCode, animation }), [ias, characterClass, weaponCode, animation]);
  const result = model.status === 'SUPPORTED' ? model.result : null;
  const statusMessage = model.status === 'INVALID_INPUT'
    ? model.reason
    : model.status === 'UNVERIFIED'
      ? '현재 선택한 조합은 검증 중이므로 계산 결과를 제공하지 않습니다.'
      : model.status === 'UNSUPPORTED'
        ? '현재 지원하지 않는 직업 또는 공격 유형입니다.'
        : null;

  function adjustIAS(delta: number) {
    const current = /^(0|[1-9]\d*)$/.test(ias) ? Number(ias) : 0;
    setIAS(String(Math.max(0, Math.min(200, current + delta))));
  }

  return (
    <section className={styles.calculator} aria-labelledby="ias-title">
      <p className={styles.breadcrumb}>게임 정보 <span aria-hidden="true">›</span> 공속 계산기</p>
      <GameInfoNavigation active="ias-calculator" />
      <div className={styles.heading}><h2 id="ias-title">디아블로2 레저렉션 공속 계산기</h2><span className={styles.badge}>시험 운영</span></div>
      <p className={styles.intro}>IAS 수치에 따른 공격 애니메이션 프레임과 브레이크포인트를 확인할 수 있습니다.</p>
      <p className={styles.notice}>현재 시험 운영 버전은 성기사의 크리스탈 소드 일반 공격 A1 기준 애니메이션만 지원합니다. 표시되는 프레임은 전체 애니메이션 길이이며, 실제 타격 판정 시점이나 모든 일반 공격의 반복 주기를 의미하지 않습니다.</p>

      <div className={styles.layout}>
        <section className={styles.controls} aria-labelledby="conditions-title">
          <h3 id="conditions-title">계산 조건</h3>
          <label className={styles.field} htmlFor="ias-class"><span>직업</span>
            <select id="ias-class" value={characterClass} onChange={event => setCharacterClass(event.target.value)}>
              {classes.map(([id, name]) => <option key={id} value={id}>{name}{id === 'PALADIN' ? '' : ' · 준비 중'}</option>)}
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-weapon"><span>무기</span>
            <select id="ias-weapon" value={weaponCode} onChange={event => setWeaponCode(event.target.value)}>
              {weapons.map(([id, name], index) => <option key={id} value={id}>{name}{index === 0 ? '' : ' · 검증 중'}</option>)}
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-animation"><span>기준 애니메이션</span>
            <select id="ias-animation" value={animation} onChange={event => setAnimation(event.target.value)}>
              <option value="A1">A1 reference</option><option value="A2">A2 · 검증 중</option>
            </select>
          </label>
          <div className={styles.iasField}>
            <label htmlFor="total-ias">총 IAS</label>
            <div className={styles.stepper}>
              <button type="button" aria-label="IAS 1 감소" disabled={ias === '0'} onClick={() => adjustIAS(-1)}>−1</button>
              <input id="total-ias" type="number" min="0" max="200" step="1" inputMode="numeric" value={ias} aria-describedby="ias-range" aria-invalid={model.status === 'INVALID_INPUT'} onChange={event => setIAS(event.target.value)} />
              <span>IAS</span>
              <button type="button" aria-label="IAS 1 증가" disabled={ias === '200'} onClick={() => adjustIAS(1)}>+1</button>
              <button type="button" aria-label="IAS 10 증가" disabled={ias === '200'} onClick={() => adjustIAS(10)}>+10</button>
            </div>
            <p id="ias-range" className={styles.hint}>0~200 사이 정수 · 무기/장비 총 IAS만 반영합니다.</p>
          </div>
          {statusMessage ? <p className={styles.error} role="status">{statusMessage}</p> : null}
        </section>

        <section className={styles.results} aria-labelledby="result-title" aria-live="polite" aria-atomic="true">
          <h3 id="result-title">계산 결과</h3>
          {result ? <>
            <p className={styles.resultMeta}>성기사 · 인간형 · 크리스탈 소드 · A1 기준 애니메이션 · 총 IAS {result.totalIAS}</p>
            <p className={styles.frameValue}><strong>{result.fullAnimationFrames}</strong><span>프레임</span></p>
            <dl className={styles.stats}>
              <div><dt>전체 애니메이션</dt><dd>{result.fullAnimationFrames}프레임</dd></div>
              <div><dt>현재 브레이크포인트</dt><dd>{result.currentBreakpoint} IAS</dd></div>
              <div><dt>다음 브레이크포인트</dt><dd>{result.nextBreakpoint === null ? '현재 검증 범위에 없음' : `${result.nextBreakpoint} IAS`}</dd></div>
              <div><dt>다음 단계까지 추가 IAS</dt><dd>{result.requiredAdditionalIAS === null ? '현재 검증 범위에 없음' : `${result.requiredAdditionalIAS} IAS`}</dd></div>
            </dl>
            {result.nextBreakpoint === null ? <p className={styles.lastStep}>현재 검증된 IAS 0~200 범위에서 다음 브레이크포인트가 없습니다.</p> : null}
          </> : <p className={styles.empty}>지원되는 조건을 선택하면 검증된 결과를 표시합니다.</p>}
        </section>
      </div>

      <section className={styles.tableSection} aria-labelledby="table-title">
        <div className={styles.tableHeading}><h3 id="table-title">검증된 브레이크포인트</h3><p>Paladin · Crystal Sword · A1 reference</p></div>
        <p className={styles.hint}>강조된 행은 현재 IAS가 속한 프레임 구간의 시작점입니다.</p>
        <div className={styles.tableWrap}>
          <table>
            <caption className={styles.srOnly}>성기사 크리스탈 소드 A1 기준 애니메이션의 IAS별 전체 애니메이션 프레임</caption>
            <thead><tr><th scope="col">브레이크포인트 IAS</th><th scope="col">전체 애니메이션</th><th scope="col">IAS 구간</th></tr></thead>
            <tbody>{IAS_BREAKPOINTS.map((row, index) => {
              const next = (IAS_BREAKPOINTS[index + 1]?.ias ?? 201) - 1;
              const isCurrent = result?.currentBreakpoint === row.ias;
              return <tr key={row.ias} className={isCurrent ? styles.currentRow : undefined} aria-current={isCurrent ? 'true' : undefined}>
                <th scope="row">{row.ias} IAS{isCurrent ? <span className={styles.currentBadge}>현재</span> : null}</th>
                <td>{row.fullAnimationFrames}프레임</td><td>{row.ias}~{next} IAS</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <p className={styles.footnote}>IAS 152 이상은 현재 검증된 IAS 입력 범위 안에서 추가 브레이크포인트가 확인되지 않았습니다. 게임 전체의 브레이크포인트 한계를 의미하지 않습니다.</p>
      </section>
    </section>
  );
}
