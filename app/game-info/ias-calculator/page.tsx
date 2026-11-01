import SiteFrame from '../../SiteFrame';
import IASCalculator from './IASCalculator';

export const metadata = {
  title: '디아블로2 레저렉션 공속 계산기 | 디아블로2 주고받고',
  description: '성기사의 검증된 무기별 공속 증가 수치와 공격 동작 전체 길이를 확인합니다.',
};

export default function Page() {
  return <SiteFrame active="game-info"><IASCalculator /></SiteFrame>;
}
