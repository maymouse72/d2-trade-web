import Link from 'next/link';
import Image from 'next/image';
import sorceressContent from './content/sorceress.json';
import paladinContent from './content/paladin.json';
import necromancerContent from './content/necromancer.json';
import assassinContent from './content/assassin.json';
import amazonContent from './content/amazon.json';
import druidContent from './content/druid.json';
import barbarianContent from './content/barbarian.json';
import warlockContent from './content/warlock.json';
import Checklist from './Checklist';
import TeleportStaffTip from './TeleportStaffTip';
import styles from './leveling-guides.module.css';

export type GuideKey = 'sorceress' | 'paladin' | 'necromancer' | 'assassin' | 'amazon' | 'druid' | 'barbarian' | 'warlock';

const guides: Record<GuideKey, { title: string; className: string; summary: string; imageAlt: string; content: string }> = {
  sorceress: {
    title: '원소술사 맨땅 육성 공략',
    className: '소서리스',
    summary: '화염구로 시작해 얼음 보주와 함께 헬 바알까지 진행하는 무자본 육성 루트입니다.',
    imageAlt: '화염과 푸른 마력을 다루는 원소술사',
    content: sorceressContent,
  },
  paladin: {
    title: '성기사 맨땅 육성 공략',
    className: '팔라딘',
    summary: '신성한 불꽃과 열의로 시작해 축복받은 망치 빌드로 전환하는 육성 가이드입니다.',
    imageAlt: '방패와 갑옷을 갖춘 성기사',
    content: paladinContent,
  },
  necromancer: {
    title: '강령술사 맨땅 육성 공략',
    className: '강령술사 · 네크로맨서',
    summary: '해골 전사로 첫 시체를 만들고 피해 증폭과 시체 폭발로 헬 바알까지 진행하는 조폭넥 가이드입니다.',
    imageAlt: '해골과 망령을 거느린 강령술사',
    content: necromancerContent,
  },
  assassin: {
    title: '암살자 맨땅 육성 공략',
    className: '암살자 · 어쌔신',
    summary: '화염 덫으로 노멀을 진행한 뒤 번개 파수기와 죽음 파수기를 사용하는 트랩씬 가이드입니다.',
    imageAlt: '두 칼날을 든 어두운 복장의 암살자',
    content: assassinContent,
  },
  amazon: {
    title: '아마존 맨땅 육성 공략',
    className: '아마존 · 자벨마',
    summary: '맹독 투창과 역병 투창으로 시작해 번개의 격노·전류의 일격 자벨마로 전환하는 솔로 가이드입니다.',
    imageAlt: '창과 투창을 든 아마존 전사',
    content: amazonContent,
  },
  druid: {
    title: '드루이드 맨땅 육성 공략',
    className: '드루이드 · 엘리드루',
    summary: '화염폭풍과 균열로 진행한 뒤 회오리바람·허리케인을 사용하는 엘리드루로 전환합니다.',
    imageAlt: '늑대 동료와 푸른 원소 마력을 다루는 드루이드',
    content: druidContent,
  },
  barbarian: {
    title: '야만용사 맨땅 육성 공략',
    className: '야만용사 · 바바리안',
    summary: '이중 타격과 광분으로 초반을 지나 전장의 함성을 쓰는 싱어 바바로 헬 바알에 도전합니다.',
    imageAlt: '도끼를 든 야만용사 전사',
    content: barbarianContent,
  },
  warlock: {
    title: '악마술사 맨땅 육성 공략',
    className: '악마술사 · 워록',
    summary: 'RotW 혼돈 계열의 독기 기술로 시작해 심연과 종말을 함께 사용하는 마법 피해 빌드입니다.',
    imageAlt: '마도서와 보랏빛 악마 마력을 든 악마술사',
    content: warlockContent,
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
      const items: { text: string }[] = [];
      let hasCheckboxes = false;
      while (index < lines.length) {
        const itemLine = lines[index].trim();
        const itemMatch = isOrdered ? itemLine.match(/^\d+[.)]\s+(.+)$/) : itemLine.match(/^[-*+]\s+(.+)$/);
        if (!itemMatch) break;
        const checkbox = itemMatch[1].match(/^\[([ xX])\]\s*(.+)$/);
        if (checkbox) hasCheckboxes = true;
        items.push({ text: checkbox ? checkbox[2] : itemMatch[1] });
        index += 1;
      }
      if (hasCheckboxes) {
        output.push(<Checklist key={`checklist-${index}`} items={items.map((item) => item.text)} />);
      } else {
        const listItems = items.map((item, itemIndex) => <li key={`li-${index}-${itemIndex}`}>{inline(item.text, `li-${index}-${itemIndex}`)}</li>);
        output.push(isOrdered ? <ol key={`list-${index}`}>{listItems}</ol> : <ul key={`list-${index}`}>{listItems}</ul>);
      }
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
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
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
  const toc = makeToc(guide.content).filter((item) => item.level <= 2);
  const imageSrc = `/images/leveling-guides/${guideKey}.webp`;
  return (
    <div className={styles.page}>
      <nav aria-label="위치" className={styles.breadcrumb}>
        <Link href="/game-info">게임 정보</Link><span aria-hidden="true">›</span>
        <Link href="/game-info/leveling-guides">직업별 맨땅 공략집</Link><span aria-hidden="true">›</span>
        <span aria-current="page">{guide.className}</span>
      </nav>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>ROT W · PATCH 3.4 · SOLO / NO-TRADE</span>
          <h1>{guide.title}</h1>
          <p>{guide.summary}</p>
          <p className={styles.versionNote}>맨땅 · 솔로 플레이 · 아이템 지원 없음 · 2026년 11월 기준</p>
        </div>
        <div className={styles.heroImageFrame}>
          <Image className={styles.heroImage} src={imageSrc} width={300} height={724} sizes="(max-width: 640px) 180px, 240px" alt={guide.imageAlt} preload />
        </div>
      </header>
      {guideKey !== 'sorceress' && <TeleportStaffTip guideKey={guideKey} />}
      <details className={styles.toc}>
        <summary>목차 보기 <span>{toc.length}개 항목</span></summary>
        <ol>{toc.map((item) => <li className={item.level === 2 ? styles.tocSubitem : undefined} key={item.id}><a href={`#${item.id}`}>{item.title}</a></li>)}</ol>
      </details>
      <article className={styles.article}>{parseBlocks(guide.content)}</article>
      <div className={styles.articleFooter}><Link href="/game-info/leveling-guides">← 직업별 공략 목록</Link></div>
    </div>
  );
}
