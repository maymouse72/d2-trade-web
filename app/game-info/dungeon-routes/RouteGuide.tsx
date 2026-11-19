'use client';

import { useState } from 'react';
import Image from 'next/image';
import routes from '../../../lib/dungeon-routes/routes.json';
import styles from './routes.module.css';

const directions: Record<string,string> = { LEFT: '왼쪽 우선', RIGHT: '오른쪽 우선', STRAIGHT: '직진 우선', VARIABLE: '구간별 상이', UNKNOWN: '확인 필요' };
const references: Record<string,string> = { ENTRANCE_TILE: '입구 타일', WAYPOINT_TILE: '웨이포인트 타일', GENERAL: '일반 탐색' };

export default function RouteGuide() {
  const [act, setAct] = useState(1);
  const [id, setId] = useState(routes[0].id);
  const choices = routes.filter(route => route.act === act);
  const route = choices.find(item => item.id === id) ?? choices[0];
  const first = route?.segments[0];
  return <section className={styles.guide}>
    <h1>디아블로2 던전 길찾기 가이드</h1>
    <p>던전의 입구와 웨이포인트를 기준으로 다음 층을 찾는 방향 규칙과 탐색 방법을 안내합니다.</p>
    <div className={styles.acts} role="group" aria-label="액트 선택">{[1,2,3,4,5].map(n => <button key={n} aria-pressed={act === n} onClick={() => setAct(n)}>Act {n}</button>)}</div>
    {route ? <div className={styles.layout}>
      <aside aria-label="던전 선택">{choices.map(r => <button key={r.id} aria-pressed={r.id === route.id} onClick={() => setId(r.id)}>{r.name} · {r.boss}</button>)}</aside>
      <article><h2>{route.name} · {route.boss}</h2>
        <strong>{references[first.reference]} 기준 · {directions[first.direction]}</strong>
        <p>{route.start}</p>
        <figure><a href={route.diagram} target="_blank" rel="noreferrer"><Image src={route.diagram} width={360} height={208} alt={route.name+' '+references[first.reference]+' 기준 '+directions[first.direction]+' 방향 도식 확대'} /></a>
        <figcaption>방향 이해를 위한 예시 도식이며 실제 게임 지형과 다를 수 있습니다.</figcaption></figure>
        <h3>층별 탐색 순서</h3><ol>{route.segments.map(s => <li key={s.from}><b>{s.from} → {s.to}</b><br/>{s.confidence === 'UNVERIFIED' ? '확인 필요 · 갈림길로 돌아가 아직 지나지 않은 통로를 차례로 살펴보세요.' : references[s.reference]+'을 빠져나가는 방향을 기준으로 '+directions[s.direction]+'인 출구 구조를 찾으세요. (커뮤니티 요령)'}</li>)}<li>{route.finish}</li></ol>
        <h3>탐색 시 주의</h3><p>방향은 계단이 있는 타일로 들어가는 방향입니다. 화면에서 계단이 놓인 위치나 따라가야 할 벽을 뜻하지 않습니다. 층이 바뀌면 기준을 다시 잡으세요.</p>
        <h3>참고 자료</h3>{route.sources.map((url,i) => <a key={url} href={url}>{['Map Reading · 층별 방향표','MrLlamaSC · 타일 판독 시연'][i]}</a>)}
      </article></div> : <p>해당 액트의 길찾기 정보는 추후 추가될 예정입니다.</p>}
  </section>;
}
