'use client';

import { useMemo, useState } from 'react';
import { constrainIASInput, getCalculatorViewModel, getWeaponBreakpoints } from '../../../lib/ias/ui-model';
import { IAS_WEAPONS } from '../../../lib/ias/weapons';
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
  const selectedWeapon = IAS_WEAPONS[weaponCode];
  const maxIAS = selectedWeapon?.maxIAS ?? 317;
  const animationLabel = animation === 'A2' ? '기본 공격 동작 2 (A2)' : '기본 공격 동작 1 (A1)';
  const model = useMemo(() => getCalculatorViewModel(ias, { characterClass, weaponCode, animation }), [ias, characterClass, weaponCode, animation]);
  const result = model.status === 'SUPPORTED' ? model.result : null;
  const breakpointRows = characterClass === 'PALADIN' ? getWeaponBreakpoints(weaponCode, animation as 'A1' | 'A2') : [];
  const statusMessage = model.status === 'INVALID_INPUT'
    ? model.reason
    : model.status === 'UNVERIFIED'
      ? animation === 'A2'
        ? 'A2는 독립 검증 자료가 부족해 계산 결과를 제공하지 않습니다.'
        : '현재 선택한 조합은 검증 중이므로 계산 결과를 제공하지 않습니다.'
      : model.status === 'UNSUPPORTED'
        ? '현재 지원하지 않는 직업 또는 공격 유형입니다.'
        : null;
  const animationDescription = animation === 'A2'
    ? '게임 내부에 기록된 또 다른 기본 공격 동작입니다. A1과 별도로 검증된 경우에만 계산 결과를 표시합니다.'
    : 'A1은 게임 내부에 기록된 기본 공격 동작 1입니다. 실제 게임에서 어떤 공격 동작이 사용되는지는 이 계산기가 판별하지 않습니다.';

  function adjustIAS(delta: number) {
    const current = /^(0|[1-9]\d*)$/.test(ias) ? Number(ias) : 0;
    setIAS(String(Math.max(0, Math.min(maxIAS, current + delta))));
  }

  function handleIASChange(value: string) {
    setIAS(constrainIASInput(value, maxIAS));
  }

  return (
    <section className={styles.calculator} aria-labelledby="ias-title">
      <p className={styles.breadcrumb}>게임 정보 <span aria-hidden="true">›</span> 공속 계산기</p>
      <GameInfoNavigation active="ias-calculator" />
      <div className={styles.heading}><h2 id="ias-title">디아블로2 레저렉션 공속 계산기</h2><span className={styles.badge}>시험 운영</span></div>
      <p className={styles.intro}>장비에 붙은 공격 속도 증가 수치를 합산해, 선택한 무기의 공격 동작 전체 길이를 확인할 수 있습니다.</p>
      <p className={styles.notice}>이 계산기는 선택한 공격 동작의 전체 애니메이션 길이를 보여줍니다. 실제 게임에서 A1과 A2가 선택되는 규칙이나 평균 공격 속도는 계산하지 않습니다. 스킬, 오라, 버프, 디버프의 공격 속도 효과도 포함하지 않습니다.</p>

      <div className={styles.layout}>
        <section className={styles.controls} aria-labelledby="conditions-title">
          <h3 id="conditions-title">계산 조건</h3>
          <label className={styles.field} htmlFor="ias-class"><span>직업</span>
            <select id="ias-class" value={characterClass} onChange={event => setCharacterClass(event.target.value)}>
              {classes.map(([id, name]) => <option key={id} value={id}>{name}{id === 'PALADIN' ? '' : ' · 준비 중'}</option>)}
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-weapon"><span>무기</span>
            <select id="ias-weapon" value={weaponCode} onChange={event => { const code = event.target.value; setWeaponCode(code); const limit = IAS_WEAPONS[code]?.maxIAS ?? 317; if (Number(ias) > limit) setIAS(String(limit)); }}>
              {weapons.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-animation"><span>기준 공격 동작</span>
            <select id="ias-animation" value={animation} onChange={event => setAnimation(event.target.value)}>
              <option value="A1">기본 공격 동작 1 (A1)</option><option value="A2">기본 공격 동작 2 (A2) · 검증 중</option>
            </select>
          </label>
          <p className={styles.hint}>{animationDescription}</p>
          <div className={styles.iasField}>
            <label htmlFor="total-ias">공격 속도 증가 합계 (IAS)</label>
            <div className={styles.stepper}>
              <button type="button" aria-label="공격 속도 증가 1 감소" disabled={Number(ias) <= 0} onClick={() => adjustIAS(-1)}>−1</button>
              <input id="total-ias" type="number" min="0" max={maxIAS} step="1" inputMode="numeric" value={ias} aria-describedby="ias-hint ias-range" aria-invalid={model.status === 'INVALID_INPUT'} onChange={event => handleIASChange(event.target.value)} />
              <span>IAS</span>
              <button type="button" aria-label="공격 속도 증가 1 증가" disabled={Number(ias) >= maxIAS} onClick={() => adjustIAS(1)}>+1</button>
              <button type="button" aria-label="공격 속도 증가 10 증가" disabled={Number(ias) >= maxIAS} onClick={() => adjustIAS(10)}>+10</button>
            </div>
            <p id="ias-hint" className={styles.hint}>무기와 다른 장비에 붙은 공격 속도 증가 수치를 합산해 입력하세요. 예를 들어 무기 20%와 장갑 20%라면 40을 입력합니다. 숫자만 입력합니다.</p>
            <p id="ias-range" className={styles.hint}>선택한 무기의 검증 범위: 0~{maxIAS} IAS</p>
          </div>
          {statusMessage ? <p className={styles.error} role="status">{statusMessage}</p> : null}
        </section>

        <section className={styles.results} aria-labelledby="result-title" aria-live="polite" aria-atomic="true">
          <h3 id="result-title">계산 결과</h3>
          {result ? <>
            <p className={styles.resultMeta}>성기사 · 인간형 · {selectedWeapon?.name} · {animationLabel} · 공격 속도 증가 합계 {result.totalIAS} IAS</p>
            <p className={styles.resultMeta}>선택한 공격 동작의 전체 애니메이션 길이입니다. 실제 타격 판정 시점이나 연속 공격의 정확한 주기를 뜻하지 않습니다.</p>
            <p className={styles.frameValue}><strong>{result.fullAnimationFrames}</strong><span>프레임</span></p>
            <dl className={styles.stats}>
              <div><dt>공격 동작 전체 길이</dt><dd>{result.fullAnimationFrames}프레임</dd></div>
              <div><dt>현재 적용되는 공속 기준</dt><dd>{result.currentBreakpoint} IAS</dd></div>
              <div><dt>다음 프레임 감소에 필요한 공속</dt><dd>{result.nextBreakpoint === null ? '검증 범위 내 다음 기준 없음' : `${result.nextBreakpoint} IAS`}</dd></div>
              <div><dt>다음 단계까지 필요한 공속 증가</dt><dd>{result.requiredAdditionalIAS === null ? '검증 범위 내 다음 단계 없음' : `${result.requiredAdditionalIAS} IAS`}</dd></div>
            </dl>
            {result.nextBreakpoint === null ? <p className={styles.lastStep}>현재 이 무기의 검증된 공속 범위에서 다음 프레임 감소 기준은 확인되지 않았습니다.</p> : null}
          </> : <p className={styles.empty}>지원되는 조건을 선택하면 검증된 결과를 표시합니다.</p>}
        </section>
      </div>

      <section className={styles.tableSection} aria-labelledby="table-title">
        <div className={styles.tableHeading}><h3 id="table-title">{animation === 'A2' ? '검증 중인 공속 기준표' : '검증된 공속 기준표'}</h3><p>성기사 · {selectedWeapon?.name ?? '선택 무기'} · {animationLabel}</p></div>
        <details className={styles.explanation}><summary>공속 기준(브레이크포인트)이란?</summary><p>공격 속도 증가 수치를 높여도 프레임이 매번 줄어드는 것은 아닙니다. 특정 수치에 도달해야 공격 동작의 전체 프레임이 한 단계 감소합니다. 이 기준값을 브레이크포인트라고 합니다.</p></details>
        {breakpointRows.length > 0 ? <>
        <p className={styles.hint}>강조된 행은 현재 수치가 포함된 프레임 구간의 시작 기준값입니다.</p>
        <div className={styles.tableWrap}>
          <table>
            <caption className={styles.srOnly}>성기사 {selectedWeapon?.name} {animationLabel}의 공속 기준값과 전체 프레임</caption>
            <thead><tr><th scope="col">공속 기준값 (IAS)</th><th scope="col">공격 동작 전체 길이</th><th scope="col">공속 증가 수치 구간</th></tr></thead>
            <tbody>{breakpointRows.map((row, index) => {
              const next = breakpointRows[index + 1] ? breakpointRows[index + 1].ias - 1 : maxIAS;
              const isCurrent = result?.currentBreakpoint === row.ias;
              return <tr key={row.ias} className={isCurrent ? styles.currentRow : undefined} aria-current={isCurrent ? 'true' : undefined}>
                <th scope="row">{row.ias} IAS{isCurrent ? <span className={styles.currentBadge}>현재</span> : null}</th>
                <td>{row.fullAnimationFrames}프레임</td><td>{row.ias}~{next} IAS</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <p className={styles.footnote}>이 표는 선택한 무기의 독립 검증 범위까지만 표시합니다. 범위 바깥의 게임 전체 기준을 의미하지 않습니다.</p>
        </> : <p className={styles.empty}>선택한 조합은 아직 독립 검증되지 않아 기준표를 표시하지 않습니다.</p>}
      </section>
    </section>
  );
}
