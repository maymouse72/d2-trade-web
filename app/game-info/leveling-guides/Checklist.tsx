'use client';

import { useState } from 'react';
import styles from './leveling-guides.module.css';

export default function Checklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  return (
    <div className={styles.checklist} role="group" aria-label="육성 체크리스트">
      {items.map((item, index) => (
        <label className={styles.checkItem} key={`${index}-${item}`}>
          <input
            type="checkbox"
            checked={checked.has(index)}
            onChange={(event) => setChecked((previous) => {
              const next = new Set(previous);
              if (event.target.checked) next.add(index);
              else next.delete(index);
              return next;
            })}
          />
          <span>{item}</span>
        </label>
      ))}
      <p className={styles.checkProgress} role="status">완료 {checked.size} / {items.length}</p>
    </div>
  );
}
