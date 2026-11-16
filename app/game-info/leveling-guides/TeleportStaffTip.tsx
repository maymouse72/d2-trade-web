import type { GuideKey } from './GuideContent';
import styles from './leveling-guides.module.css';

const sharedTip = [
  '액트 3의 오르무스에게서 순간이동 충전 옵션이 붙은 지팡이를 구매할 수 있습니다. 캐릭터 레벨 19~23에 상점을 확인하면 착용 레벨을 아직 충족하지 않아 붉게 표시되는 지팡이를 찾기 쉽습니다.',
  '순간이동 충전 옵션인지 지팡이 설명을 확인하세요. 순간이동 기술에 직접 투자한 원소술사 전용 보너스와 충전 옵션은 다릅니다. 충전은 제한되어 있고, 소진 후에는 수리 비용이 들 수 있으니 위험 회피와 장애물 통과에 사용하세요.',
].join(' ');

const warlockNote = '악마술사는 18레벨에 배울 수 있는 Blade Warp가 별도의 이동 수단입니다. 따라서 충전 지팡이는 필수 장비가 아니며, 순간이동 충전을 추가로 활용하고 싶을 때 보완용으로 고려하세요.';

export default function TeleportStaffTip({ guideKey }: { guideKey: Exclude<GuideKey, 'sorceress'> }) {
  return (
    <aside className={styles.teleportTip} aria-labelledby="teleport-staff-tip-title">
      <span className={styles.tipEyebrow}>맨땅 필수 팁</span>
      <h2 id="teleport-staff-tip-title">순간이동 충전 지팡이 구매</h2>
      <p>{sharedTip}</p>
      {guideKey === 'warlock' && <p>{warlockNote}</p>}
    </aside>
  );
}
