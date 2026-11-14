import type { ResolvedItem } from '../../lib/items/variants';
import styles from './mode-selector.module.css';

export default function VariantNotice({ result, sourceLabel = '공식 패치 근거' }: { result: ResolvedItem<object>; sourceLabel?: string }) {
  const label = result.availability === 'AVAILABLE' ? '확인됨' : result.availability === 'UNAVAILABLE' ? '이용 불가' : '검토 필요';
  return <aside className={`${styles.notice} ${styles[result.availability.toLowerCase()]}`} aria-label={`데이터 상태: ${label}`}>
    <div><strong>{label}</strong><span>{result.versionLabel}</span></div>
    <p>{result.message}</p>
    {result.sourceUrl && <a href={result.sourceUrl} target="_blank" rel="noreferrer">{sourceLabel} ↗</a>}
  </aside>;
}
