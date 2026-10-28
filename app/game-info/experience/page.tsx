import SiteFrame from '../../SiteFrame';
import ExperienceExplorer from './ExperienceExplorer';

export const metadata = {
  title: '경험치 효율 조회 | 디아블로2 주고받고',
  description: '캐릭터 레벨별 난이도·액트 참고 효율을 비교하세요. 첨부 자료 기준이며 실제 경험치 수령률과 다릅니다.',
};

export default function Page() {
  return <SiteFrame active="experience"><ExperienceExplorer /></SiteFrame>;
}
