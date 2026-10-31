import SiteFrame from '../../SiteFrame';
import IASCalculator from './IASCalculator';

export const metadata = {
  title: '디아블로2 레저렉션 공속 계산기 | 디아블로2 주고받고',
  description: '성기사 크리스탈 소드 A1 기준 애니메이션의 전체 프레임과 IAS 브레이크포인트를 확인합니다.',
};

export default function Page() {
  return <SiteFrame active="game-info"><IASCalculator /></SiteFrame>;
}
