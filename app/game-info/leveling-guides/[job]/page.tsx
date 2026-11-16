import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteFrame from '../../../SiteFrame';
import GameInfoNavigation from '../../GameInfoNavigation';
import GuideContent from '../GuideContent';

const supportedJobs = ['sorceress', 'paladin', 'necromancer', 'assassin'] as const;
type Job = (typeof supportedJobs)[number];

export function generateStaticParams() {
  return supportedJobs.map((job) => ({ job }));
}
export async function generateMetadata({ params }: { params: Promise<{ job: string }> }): Promise<Metadata> {
  const { job } = await params;
  const titles: Record<Job, string> = {
    sorceress: '원소술사 맨땅 육성 공략',
    paladin: '성기사 맨땅 육성 공략',
    necromancer: '강령술사 맨땅 육성 공략',
    assassin: '암살자 맨땅 육성 공략',
  };
  if (!supportedJobs.includes(job as Job)) return { title: '공략을 찾을 수 없습니다 | 디아블로2 주고받고' };
  return {
    title: job === 'necromancer'
      ? '디아블로2 강령술사 맨땅 공략 | 조폭넥 노멀부터 헬까지 | 디아블로2 주고받고'
      : job === 'assassin'
        ? '디아블로2 암살자 맨땅 공략 | 트랩씬 노멀부터 헬까지 | 디아블로2 주고받고'
        : `${titles[job as Job]} | 디아블로2 주고받고`,
    description: job === 'necromancer'
      ? 'RotW 패치 3.4 기준 조폭넥 가이드. 해골 전사와 시체 폭발로 진행하는 맨땅 육성 공략입니다.'
      : job === 'assassin'
        ? 'RotW 패치 3.4 기준 트랩씬 가이드. 화염 덫에서 번개 파수기·죽음 파수기로 전환하는 맨땅 공략입니다.'
        : 'RotW 패치 3.4 기준, 아이템 지원 없이 헬 바알까지 진행하는 직업별 육성 공략입니다.',
  };
}

export default async function LevelingGuidePage({ params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  if (!supportedJobs.includes(job as Job)) notFound();
  return (
    <SiteFrame active="game-info">
      <GameInfoNavigation active="leveling-guides" />
      <GuideContent guideKey={job as Job} />
    </SiteFrame>
  );
}
