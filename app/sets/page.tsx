import SiteFrame from '../SiteFrame';
import SetCatalog from './SetCatalog';

export const metadata = { title: '세트 도감 | 디아블로2 주고받고', description: '세트 구성 아이템과 개별 옵션, 부분 및 전체 착용 효과를 찾아보세요.' };

export default function Page() {
  return <SiteFrame active="sets"><SetCatalog /></SiteFrame>;
}
