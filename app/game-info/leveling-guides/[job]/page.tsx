import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteFrame from '../../../SiteFrame';
import GameInfoNavigation from '../../GameInfoNavigation';
import GuideContent from '../GuideContent';

const supportedJobs = ['sorceress', 'paladin', 'necromancer', 'assassin', 'amazon', 'druid', 'barbarian', 'warlock'] as const;
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
    amazon: '아마존 맨땅 육성 공략',
    druid: '드루이드 맨땅 육성 공략',
    barbarian: '야만용사 맨땅 육성 공략',
    warlock: '악마술사 맨땅 육성 공략',
  };
  if (!supportedJobs.includes(job as Job)) return { title: '공략을 찾을 수 없습니다 | 디아블로2 주고받고' };
  const seoTitles: Record<Job, string> = {
    sorceress: `${titles.sorceress} | 디아블로2 주고받고`,
    paladin: `${titles.paladin} | 디아블로2 주고받고`,
    necromancer: '디아블로2 강령술사 맨땅 공략 | 조폭넥 노멀부터 헬까지 | 디아블로2 주고받고',
    assassin: '디아블로2 암살자 맨땅 공략 | 트랩씬 노멀부터 헬까지 | 디아블로2 주고받고',
    amazon: '디아블로2 아마존 맨땅 공략 | 독 투창부터 번개 자벨마까지 | 디아블로2 주고받고',
    druid: '디아블로2 드루이드 맨땅 공략 | 화염부터 엘리드루까지 | 디아블로2 주고받고',
    barbarian: '디아블로2 야만용사 맨땅 공략 | 이중 타격부터 싱어 바바까지 | 디아블로2 주고받고',
    warlock: '디아블로2 악마술사 맨땅 공략 | RotW 워록 노멀부터 헬까지 | 디아블로2 주고받고',
  };
  const descriptions: Record<Job, string> = {
    sorceress: 'RotW 패치 3.4 기준, 아이템 지원 없이 헬 바알까지 진행하는 직업별 육성 공략입니다.',
    paladin: 'RotW 패치 3.4 기준, 아이템 지원 없이 헬 바알까지 진행하는 직업별 육성 공략입니다.',
    necromancer: 'RotW 패치 3.4 기준 조폭넥 가이드. 해골 전사와 시체 폭발로 진행하는 맨땅 육성 공략입니다.',
    assassin: 'RotW 패치 3.4 기준 트랩씬 가이드. 화염 덫에서 번개 파수기·죽음 파수기로 전환하는 맨땅 공략입니다.',
    amazon: 'RotW 패치 3.4 기준 자벨마 가이드. 맹독 투창·역병 투창으로 시작해 번개의 격노와 전류의 일격으로 전환합니다.',
    druid: 'RotW 패치 3.4 기준 엘리드루 가이드. 화염폭풍·균열에서 회오리바람과 허리케인으로 전환하는 맨땅 공략입니다.',
    barbarian: 'RotW 패치 3.4 기준 싱어 바바 가이드. 이중 타격과 광분으로 시작해 전장의 함성으로 헬 바알까지 진행합니다.',
    warlock: 'RotW 패치 3.4 악마술사 가이드. 독기 볼트와 독기 사슬에서 심연·종말 혼합 빌드로 이어지는 맨땅 공략입니다.',
  };
  return {
    title: seoTitles[job as Job],
    description: descriptions[job as Job],
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
