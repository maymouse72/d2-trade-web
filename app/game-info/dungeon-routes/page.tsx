import SiteFrame from '../../SiteFrame';
import GameInfoNavigation from '../GameInfoNavigation';
import RouteGuide from './RouteGuide';

export const metadata = { title: '디아블로2 던전 길찾기 가이드 | D2 주고받고' };

export default function Page() {
  return <SiteFrame active="game-info"><GameInfoNavigation active="dungeon-routes" /><RouteGuide /></SiteFrame>;
}
