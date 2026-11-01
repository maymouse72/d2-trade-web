'use client';

import { useMemo, useState } from 'react';
import { constrainIASInput, getCalculatorViewModelFromParts, getWeaponBreakpoints, getZealBreakpoints, getZealHitCountFromSkillLevel } from '../../../lib/ias/ui-model';
import { IAS_WEAPONS } from '../../../lib/ias/weapons';
import { IAS_SKILLS } from '../../../lib/ias/skills';
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
  const [skill, setSkill] = useState('NORMAL_ATTACK');
  const [animation, setAnimation] = useState('A1');
  const [weaponIAS, setWeaponIAS] = useState('0');
  const [offWeaponIAS, setOffWeaponIAS] = useState('0');
  const [skillLevel, setSkillLevel] = useState(4);
  const hitCount = getZealHitCountFromSkillLevel(skillLevel) ?? 5;
  const selectedWeapon = IAS_WEAPONS[weaponCode];
  const selectedSkill = IAS_SKILLS[skill as keyof typeof IAS_SKILLS];
  const maxIAS = skill === 'ZEAL' ? (selectedSkill.iasRange?.[weaponCode]?.max ?? 0) : (selectedWeapon?.maxIAS ?? 317);
  const weaponIASMax = Math.max(0, maxIAS - (Number(offWeaponIAS) || 0));
  const equipmentIASMax = Math.max(0, maxIAS - (Number(weaponIAS) || 0));
  const totalIAS = (Number(weaponIAS) || 0) + (Number(offWeaponIAS) || 0);
  const selectedAnimation = skill === 'NORMAL_ATTACK' ? animation : 'A1';
  const currentAnimation = skill === 'NORMAL_ATTACK' ? selectedAnimation : selectedSkill.animationMode;
  const model = useMemo(() => getCalculatorViewModelFromParts(weaponIAS, offWeaponIAS, { characterClass, weaponCode, animation: selectedAnimation, skill, hitCount }), [weaponIAS, offWeaponIAS, characterClass, weaponCode, skill, selectedAnimation, hitCount]);
  const result = model.status === 'SUPPORTED' ? model.result : null;
  const breakpointRows = characterClass === 'PALADIN' ? getWeaponBreakpoints(weaponCode, selectedAnimation as 'A1' | 'A2', skill as keyof typeof IAS_SKILLS, hitCount) : [];
  const zealBreakpointRows = skill === 'ZEAL' ? getZealBreakpoints(weaponCode, hitCount) : [];
  const statusMessage = model.status === 'INVALID_INPUT'
    ? model.reason
    : model.status === 'UNVERIFIED'
      ? model.reason
      : model.status === 'UNSUPPORTED'
        ? '현재 지원하지 않는 직업 또는 공격 유형입니다.'
        : null;

  function adjustIAS(delta: number) {
    const current = /^(0|[1-9]\d*)$/.test(offWeaponIAS) ? Number(offWeaponIAS) : 0;
    setOffWeaponIAS(String(Math.max(0, Math.min(maxIAS - (Number(weaponIAS) || 0), current + delta))));
  }

  function handleIASChange(value: string, field: 'weapon' | 'equipment') {
    if (field === 'weapon') setWeaponIAS(constrainIASInput(value, weaponIASMax));
    else setOffWeaponIAS(constrainIASInput(value, equipmentIASMax));
  }

  function handleSkillChange(nextSkill: string) {
    const nextLimit = nextSkill === 'ZEAL'
      ? (IAS_SKILLS.ZEAL.iasRange?.[weaponCode]?.max ?? 0)
      : (selectedWeapon?.maxIAS ?? 317);
    const nextWeaponIAS = Math.min(Number(weaponIAS) || 0, nextLimit);
    setSkill(nextSkill);
    setWeaponIAS(String(nextWeaponIAS));
    setOffWeaponIAS(String(Math.min(Number(offWeaponIAS) || 0, nextLimit - nextWeaponIAS)));
  }

  return (
    <section className={styles.calculator} aria-labelledby="ias-title">
      <p className={styles.breadcrumb}>게임 정보 <span aria-hidden="true">›</span> 공속 계산기</p>
      <GameInfoNavigation active="ias-calculator" />
      <div className={styles.heading}><h2 id="ias-title">디아블로2 레저렉션 공속 계산기</h2><span className={styles.badge}>시험 운영</span></div>
      <p className={styles.intro}>지원하는 성기사 공격 스킬과 한손 무기의 공격 속도 기준값 및 공격 동작 전체 길이를 확인할 수 있습니다.</p>
      <p className={styles.notice}>현재 계산은 성기사 인간형과 검증된 한손 A1 공격에 한정됩니다. 광신 등 추가 속도 보정과 A2는 지원하지 않습니다. 열의 결과는 공개된 Paladin 1HS Zeal 기준표와 D2R 원본 데이터에 대조했으며, 게임 내 타격 프레임 실측값은 아닙니다.</p>

      <div className={styles.layout}>
        <section className={styles.controls} aria-labelledby="conditions-title">
          <h3 id="conditions-title">계산 조건</h3>
          <label className={styles.field} htmlFor="ias-class"><span>직업</span>
            <select id="ias-class" value={characterClass} onChange={event => setCharacterClass(event.target.value)}>
              {classes.map(([id, name]) => <option key={id} value={id}>{name}{id === 'PALADIN' ? '' : ' · 준비 중'}</option>)}
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-weapon"><span>무기</span>
            <select id="ias-weapon" value={weaponCode} onChange={event => { const code = event.target.value; setWeaponCode(code); const limit = skill === 'ZEAL' ? (IAS_SKILLS.ZEAL.iasRange?.[code]?.max ?? 0) : (IAS_WEAPONS[code]?.maxIAS ?? 317); const weaponPart = Math.min(Number(weaponIAS) || 0, limit); setWeaponIAS(String(weaponPart)); setOffWeaponIAS(String(Math.min(Number(offWeaponIAS) || 0, limit - weaponPart))); }}>
              {weapons.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label className={styles.field} htmlFor="ias-skill"><span>공격 스킬</span>
            <select id="ias-skill" value={skill} onChange={event => handleSkillChange(event.target.value)}>
              {Object.values(IAS_SKILLS).filter(entry => entry.selectable).map(entry => <option key={entry.code} value={entry.code}>{entry.label}{entry.supportStatus === 'SUPPORTED' ? '' : ' · 검증 중'}</option>)}
              {Object.values(IAS_SKILLS).filter(entry => !entry.selectable).map(entry => <option key={entry.code} value={entry.code} disabled>{entry.label} · 준비 중</option>)}
            </select>
          </label>
          {skill === 'ZEAL' ? <label className={styles.field} htmlFor="zeal-skill-level"><span>열의 기술 레벨</span>
            <select id="zeal-skill-level" value={skillLevel} onChange={event => setSkillLevel(Number(event.target.value))}>
              {Array.from({length: 20}, (_, index) => index + 1).map(level => <option key={level} value={level}>{level}레벨 · 최대 {Math.min(level + 1, 5)}회</option>)}
            </select>
          </label> : null}
          <details className={styles.explanation}>
            <summary>일반 공격 A1/A2 애니메이션 진단</summary>
            <label className={styles.diagnosticField} htmlFor="ias-animation">진단용 애니메이션 모드
              <select id="ias-animation" value={animation} onChange={event => setAnimation(event.target.value)}>
                <option value="A1">기본 공격 동작 1 (A1)</option>
                <option value="A2">기본 공격 동작 2 (A2) · 검증 중</option>
              </select>
            </label>
            <p>A1/A2는 내부 애니메이션 식별자입니다. 일반 공격을 선택했을 때 진단에만 사용하며, A2는 독립 검증 자료가 없어 계산 숫자와 기준표를 표시하지 않습니다.</p>
          </details>
          <details className={styles.explanation}>
            <summary>선택 스킬의 검증 근거</summary>
            <p>D2R 빌드 {selectedSkill.gameBuild} · {selectedSkill.skillId === 0 ? '일반 공격' : `skills.txt Skill ID ${selectedSkill.skillId}`} · 애니메이션 {currentAnimation ?? '미검증'}</p>
            <p>{selectedSkill.evidenceNote}</p>
            <p>지원 무기: {selectedSkill.supportedWeapons.map(code => IAS_WEAPONS[code]?.name).filter(Boolean).join(', ') || '없음'} · 게임 내 실측: {selectedSkill.gameplayTestStatus === 'NOT_TESTED' ? '미수행' : '수행'}</p>
            <p>{selectedSkill.evidenceScope}</p>
          </details>
          <div className={styles.iasField}>
            <label>공격 속도 증가 입력</label>
            <div className={styles.splitInputs}>
              <label htmlFor="weapon-ias">무기 IAS<input id="weapon-ias" type="number" min="0" max={weaponIASMax} step="1" inputMode="numeric" value={weaponIAS} onChange={event => handleIASChange(event.target.value, 'weapon')} /></label>
              <label htmlFor="equipment-ias">무기 외 장비 IAS<input id="equipment-ias" type="number" min="0" max={equipmentIASMax} step="1" inputMode="numeric" value={offWeaponIAS} onChange={event => handleIASChange(event.target.value, 'equipment')} /></label>
            </div>
            <p className={styles.hint}>공격 속도 증가 합계 (IAS): {totalIAS}</p>
            <div className={styles.stepper}>
              <span>장비 IAS 조정</span>
              <button type="button" aria-label="장비 IAS 1 감소" disabled={Number(offWeaponIAS) <= 0} onClick={() => adjustIAS(-1)}>−1</button>
              <button type="button" aria-label="장비 IAS 1 증가" disabled={totalIAS >= maxIAS} onClick={() => adjustIAS(1)}>+1</button>
              <button type="button" aria-label="장비 IAS 10 증가" disabled={totalIAS >= maxIAS} onClick={() => adjustIAS(10)}>+10</button>
            </div>
            <p id="ias-range" className={styles.hint}>선택한 {selectedSkill.label}·무기의 검증 범위: 0~{maxIAS} IAS{skill === 'ZEAL' ? ' (EIAS 75 상한)' : ''}</p>
            {skill === 'ZEAL' ? <p className={styles.hint}>원본 공식은 최소 타격 수 2회에서 시작해 기술 레벨에 따라 늘어나며 최대 5회입니다. 실제 타격 수는 대상과 전투 상황에 따라 달라질 수 있습니다. 열의는 action frame 이후 동작을 되감고, 마지막 공격은 전체 동작을 마칩니다.</p> : null}
          </div>
          {statusMessage ? <p className={styles.error} role="status">{statusMessage}</p> : null}
        </section>

        <section className={styles.results} aria-labelledby="result-title" aria-live="polite" aria-atomic="true">
          <h3 id="result-title">계산 결과</h3>
          {result ? <>
            <p className={styles.resultMeta}>성기사 · 인간형 · {selectedSkill.label} · {selectedWeapon?.name} · {currentAnimation} · 공격 속도 증가 합계 {result.totalIAS} IAS</p>
            {result.zealSequence ? <p className={styles.resultMeta}>고정 Paladin 1HS Zeal 표와 일치한 연속 공격 시퀀스입니다. 이벤트 프레임은 표의 action frame 산출값이며 게임 내 실측값은 아닙니다.</p>
              : <p className={styles.resultMeta}>선택한 공격 동작의 전체 애니메이션 길이입니다. 실제 타격 판정 시점이나 연속 공격의 정확한 주기를 뜻하지 않습니다.</p>}
            <p className={styles.frameValue}><strong>{result.zealSequence?.totalSequenceFrames ?? result.fullAnimationFrames}</strong><span>프레임</span></p>
            <dl className={styles.stats}>
              {result.zealSequence ? <>
                <div><dt>유효 타격 횟수</dt><dd>{result.zealSequence.hitCount}회</dd></div>
                <div><dt>첫 타격 이벤트까지</dt><dd>{result.zealSequence.firstHitFrame}프레임</dd></div>
                <div><dt>후속 타격 간격</dt><dd>{result.zealSequence.subsequentHitFrames}프레임</dd></div>
                <div><dt>마지막 타격 이벤트</dt><dd>{result.zealSequence.finalHitFrame}프레임</dd></div>
                <div><dt>마지막 공격 동작 구간</dt><dd>{result.zealSequence.finalAttackFrames}프레임</dd></div>
                <div><dt>전체 열의 시퀀스</dt><dd>{result.zealSequence.totalSequenceFrames}프레임</dd></div>
              </> : <div><dt>공격 동작 전체 길이</dt><dd>{result.fullAnimationFrames}프레임</dd></div>}
              <div><dt>현재 적용되는 공속 기준</dt><dd>{result.currentBreakpoint} IAS</dd></div>
              <div><dt>다음 프레임 감소에 필요한 공속</dt><dd>{result.nextBreakpoint === null ? '검증 범위 내 다음 기준 없음' : `${result.nextBreakpoint} IAS`}</dd></div>
              <div><dt>다음 단계까지 필요한 공속 증가</dt><dd>{result.requiredAdditionalIAS === null ? '검증 범위 내 다음 단계 없음' : `${result.requiredAdditionalIAS} IAS`}</dd></div>
            </dl>
            {result.nextBreakpoint === null ? <p className={styles.lastStep}>현재 이 무기의 검증된 공속 범위에서 다음 프레임 감소 기준은 확인되지 않았습니다.</p> : null}
          </> : <p className={styles.empty}>지원되는 조건을 선택하면 검증된 결과를 표시합니다.</p>}
        </section>
      </div>

      <section className={styles.tableSection} aria-labelledby="table-title">
        <div className={styles.tableHeading}><h3 id="table-title">{selectedAnimation === 'A2' ? '검증 중인 공속 기준표' : skill === 'ZEAL' ? `열의 ${hitCount}회 공격 기준표` : '검증된 공속 기준표'}</h3><p>성기사 · {selectedSkill.label} · {selectedWeapon?.name ?? '선택 무기'} · {currentAnimation ?? selectedAnimation}</p></div>
        <details className={styles.explanation}><summary>공속 기준(브레이크포인트)이란?</summary><p>공격 속도 증가 수치를 높여도 프레임이 매번 줄어드는 것은 아닙니다. 특정 수치에 도달해야 공격 동작의 전체 프레임이 한 단계 감소합니다. 이 기준값을 브레이크포인트라고 합니다.</p></details>
        {breakpointRows.length > 0 ? <>
        <p className={styles.hint}>강조된 행은 현재 수치가 포함된 프레임 구간의 시작 기준값입니다.</p>
        <div className={styles.tableWrap}>
          <table>
          <caption className={styles.srOnly}>성기사 {selectedSkill.label} {selectedWeapon?.name} {currentAnimation}의 공속 기준값과 프레임</caption>
            {skill === 'ZEAL' ? <>
              <thead><tr><th scope="col">기준 IAS</th><th scope="col">첫 공격</th><th scope="col">후속 간격</th><th scope="col">마지막 동작</th><th scope="col">전체 시퀀스</th><th scope="col">IAS 구간</th></tr></thead>
              <tbody>{zealBreakpointRows.map((row, index) => {
                const next = zealBreakpointRows[index + 1] ? zealBreakpointRows[index + 1].ias - 1 : maxIAS;
                const isCurrent = result?.currentBreakpoint === row.ias;
                return <tr key={row.ias} className={isCurrent ? styles.currentRow : undefined} aria-current={isCurrent ? 'true' : undefined}>
                  <th scope="row">{row.ias} IAS{isCurrent ? <span className={styles.currentBadge}>현재</span> : null}</th><td>{row.firstAttackFrames}프레임</td><td>{row.followUpAttackFrames}프레임</td><td>{row.finalAttackFrames}프레임</td><td>{row.totalSequenceFrames}프레임</td><td>{row.ias}~{next} IAS</td>
                </tr>;
              })}</tbody>
            </> : <>
            <thead><tr><th scope="col">공속 기준값 (IAS)</th><th scope="col">공격 동작 전체 길이</th><th scope="col">공속 증가 수치 구간</th></tr></thead>
            <tbody>{breakpointRows.map((row, index) => {
              const next = breakpointRows[index + 1] ? breakpointRows[index + 1].ias - 1 : maxIAS;
              const isCurrent = result?.currentBreakpoint === row.ias;
              return <tr key={row.ias} className={isCurrent ? styles.currentRow : undefined} aria-current={isCurrent ? 'true' : undefined}>
                <th scope="row">{row.ias} IAS{isCurrent ? <span className={styles.currentBadge}>현재</span> : null}</th>
                <td>{row.fullAnimationFrames}프레임</td><td>{row.ias}~{next} IAS</td>
              </tr>;
            })}</tbody></>}
          </table>
        </div>
        <p className={styles.footnote}>이 표는 선택한 무기의 독립 검증 범위까지만 표시합니다. 범위 바깥의 게임 전체 기준을 의미하지 않습니다.</p>
        </> : <p className={styles.empty}>{statusMessage ?? '선택한 조합은 검증된 결과를 제공하지 않습니다.'}</p>}
      </section>
    </section>
  );
}
