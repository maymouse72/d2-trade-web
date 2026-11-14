'use client';

import { MODE_PRESETS, type ModePresetId } from './mode-presets';
import styles from './mode-selector.module.css';

export default function ModeSelector({ value, onChange, id = 'item-mode' }: { value: ModePresetId; onChange: (value: ModePresetId) => void; id?: string }) {
  return <label className={styles.mode} htmlFor={id}>
    <span>게임 모드 · 패치</span>
    <select id={id} value={value} onChange={(event) => onChange(event.target.value as ModePresetId)}>
      {MODE_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
    </select>
    <small>데이터가 확인되지 않은 모드는 REVIEW로 표시합니다.</small>
  </label>;
}
