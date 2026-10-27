import SiteFrame from '../SiteFrame';
import UniqueCatalog from './UniqueCatalog';

export const metadata = { title: '유니크 도감 | D2 주고받고', description: '이름, 장비 종류, 등급, 레벨과 옵션으로 찾는 디아블로 II 유니크 아이템' };

export default function Page() {
  return <SiteFrame active="uniques"><UniqueCatalog /></SiteFrame>;
}
