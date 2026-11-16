import Link from 'next/link';
import sorceressContent from './content/sorceress.json';
import paladinContent from './content/paladin.json';
import styles from './leveling-guides.module.css';

type GuideKey = 'sorceress' | 'paladin';

const guides: Record<GuideKey, { title: string; className: string; summary: string; content: string }> = {
  sorceress: {
    title: '원소술사 맨땅 육성 공략',
    className: '소서리스',
    summary: '화염구로 시작해 얼음 보주와 함께 헬 바알까지 진행하는 무자본 육성 루트입니다.',
    content: sorceressContent,
  },
  paladin: {
    title: '성기사 맨땅 육성 공략',
    className: '팔라딘',
    summary: '신성한 불꽃과 열의로 시작해 축복받은 망치 빌드로 전환하는 육성 가이드입니다.',
    content: paladinContent,
  },
};

function slug(text: string) {
  return text
    .toLocaleLowerCase('ko-KR')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '') || 'section';
}

function inline(text: string, keyPrefix: string) {
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  return text.split(tokenPattern).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>;
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const external = /^https?:\/\//i.test(href);
      return <a key={key} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{label}</a>;
    }
    if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function isTableRow(line: string) {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}

function cells(line: string) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
}

function isTableDivider(line: string) {
  return isTableRow(line) && cells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseBlocks(markdown: string) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const output = [];
  const usedSlugs = new Map<string, number>();

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    if (/^---+$/.test(line)) { output.push(<hr key={`hr-${index}`} />); index += 1; continue; }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].replace(/\*\*/g, '');
      const base = slug(title);
      const occurrence = usedSlugs.get(base) ?? 0;
      usedSlugs.set(base, occurrence + 1);
      const id = occurrence ? `${base}-${occurrence + 1}` : base;
      const content = inline(title, `heading-${index}`);
      if (level === 1) output.push(<h2 id={id} key={`heading-${index}`}>{content}</h2>);
      else if (level === 2) output.push(<h3 id={id} key={`heading-${index}`}>{content}</h3>);
      else output.push(<h4 id={id} key={`heading-${index}`}>{content}</h4>);
      index += 1;
      continue;
    }

    if (isTableRow(line) && index + 1 < lines.length && isTableDivider(lines[index + 1].trim())) {
      const header = cells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && isTableRow(lines[index].trim())) { rows.push(cells(lines[index])); index += 1; }
      output.push(
        <div className={styles.tableWrap} key={`table-${index}`} role="region" aria-label={`${header[0] ?? '공략'} 표`} tabIndex={0}>
          <table>
            <thead><tr>{header.map((cell, cellIndex) => <th key={cellIndex} scope="col">{inline(cell, `th-${index}-${cellIndex}`)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{header.map((_, cellIndex) => <td key={cellIndex}>{inline(row[cellIndex] ?? '', `td-${index}-${rowIndex}-${cellIndex}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }

    const unordered = line.match(/^[-*+]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const items = [];
      while (index < lines.length) {
        const itemLine = lines[index].trim();
        const itemMatch = isOrdered ? itemLine.match(/^\d+[.)]\s+(.+)$/) : itemLine.match(/^[-*+]\s+(.+)$/);
        if (!itemMatch) break;
        const text = itemMatch[1].replace(/^\[([ xX])\]\s*/, '');
        items.push(<li key={`li-${index}`}>{inline(text, `li-${index}`)}</li>);
        index += 1;
      }
      output.push(isOrdered ? <ol key={`list-${index}`}>{items}</ol> : <ul key={`list-${index}`}>{items}</ul>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s+/.test(lines[index].trim()) && !/^---+$/.test(lines[index].trim()) && !isTableRow(lines[index].trim()) && !/^[-*+]\s+/.test(lines[index].trim()) && !/^\d+[.)]\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(<p key={`p-${index}`}>{inline(paragraph.join(' '), `p-${index}`)}</p>);
  }
  return output;
}

function makeToc(markdown: string) {
  const usedSlugs = new Map<string, number>();
  return markdown.split(/\r?\n/).flatMap((line) => {
    const heading = line.match(/^(#{1,2})\s+(.+)$/);
    if (!heading) return [];
    const title = heading[2].replace(/\*\*/g, '');
    const base = slug(title);
    const occurrence = usedSlugs.get(base) ?? 0;
    usedSlugs.set(base, occurrence + 1);
    return [{ id: occurrence ? `${base}-${occurrence + 1}` : base, title, level: heading[1].length }];
  });
}

export default function GuideContent({ guideKey }: { guideKey: GuideKey }) {
  const guide = guides[guideKey];
  const toc = makeToc(guide.content);
  return (
    <div className={styles.page}>
      <nav aria-label="위치" className={styles.breadcrumb}>
        <Link href="/game-info">게임 정보</Link><span aria-hidden="true">›</span>
        <Link href="/game-info/leveling-guides">직업별 맨땅 공략집</Link><span aria-hidden="true">›</span>
        <span aria-current="page">{guide.className}</span>
      </nav>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>ROT W · PATCH 3.4 · SOLO / NO-TRADE</span>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <p className={styles.versionNote}>맨땅 · 솔로 플레이 · 아이템 지원 없음 · 2026년 11월 기준</p>
      </header>
      <details className={styles.toc}>
        <summary>목차 보기 <span>{toc.length}개 항목</span></summary>
        <ol>{toc.map((item) => <li className={item.level === 2 ? styles.tocSubitem : undefined} key={item.id}><a href={`#${item.id}`}>{item.title}</a></li>)}</ol>
      </details>
      <article className={styles.article}>{parseBlocks(guide.content)}</article>
      <div className={styles.articleFooter}><Link href="/game-info/leveling-guides">← 직업별 공략 목록</Link></div>
    </div>
  );
}
