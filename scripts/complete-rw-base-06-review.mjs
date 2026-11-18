import { readFileSync, writeFileSync } from 'node:fs';

const basePath = 'lib/runeword-bases/base-items.json';
const recommendationPath = 'lib/runeword-bases/practical-recommendations.json';
const bases = JSON.parse(readFileSync(basePath, 'utf8'));
const recommendations = JSON.parse(readFileSync(recommendationPath, 'utf8'));
const runewords = JSON.parse(readFileSync('app/runewords/data.json', 'utf8'));

// Evidence-backed practical candidates for the 64 rows previously held for REVIEW.
// Reasons avoid unmeasured DPS, breakpoint, or exact socket-outcome claims.
const review = {
  2: [['broad-sword',['leveling'],'저레벨에 구하기 쉬운 검 계열로 강철의 공격 속도와 상처 악화 옵션을 활용합니다.']],
  3: [['crystal-sword',['leveling'],'낮은 단계에 제작해 생명력 흡수와 강한 타격 옵션을 이용하기 편한 검입니다.'],['berserker-axe',['endgame'],'후반 도끼 숙련을 활용하면서 강한 타격 옵션을 살리는 선택입니다.','높은 능력치 요구치와 정확한 2소켓 확보를 확인하세요.']],
  5: [['bone-shield',['leveling'],'2소켓 방패에 기술과 시전 속도 옵션을 더하는 육성용 선택입니다.'],['sacred-targe',['endgame'],'성기사 전용 저항 베이스에 시전용 방패 옵션을 더할 수 있습니다.','성기사 전용이며 정확한 2소켓과 요구치를 확인하세요.']],
  6: [['mask',['leveling'],'초중반에 구할 수 있는 일반 투구로 방어·자원 보조 옵션을 활용합니다.']],
  7: [['mask',['leveling'],'초반에 쉽게 구하는 투구로 저렴한 룬 조합을 활용하기 좋습니다.'],['shako',['endgame'],'2소켓을 수용하는 투구 대안으로 방어와 능력치 보조를 얻습니다.','엘리트 베이스의 요구치와 정확한 2소켓을 확인하세요.']],
  8: [['greater-talons',['leveling'],'암살자 클러의 기술 자동 옵션을 살려 귀감의 저항과 원소 피해를 활용합니다.','원하는 암살자 기술 자동 옵션을 확인하세요.'],['runic-talons',['endgame'],'후반 클러 기술 자동 옵션을 노릴 때 사용할 수 있는 엘리트 선택입니다.','요구치와 자동 부여 기술을 확인하세요.']],
  11: [['berserker-axe',['endgame'],'도끼 전용 피해 옵션을 살리고 한손 도끼 운용을 원하는 선택입니다.','높은 능력치 요구치와 정확한 4소켓을 확인하세요.'],['legendary-mallet',['endgame'],'해머 계열에서 원소 피해와 생명력 흡수 옵션을 활용합니다.','양손 운용과 높은 요구치를 확인하세요.']],
  12: [['gnarled-staff',['leveling'],'소서리스 전용 기술이 붙은 육성용 스태프를 골라 에너지 보호막 옵션을 활용합니다.','제작 전 자동 부여 기술을 확인하세요.'],['archon-staff',['endgame'],'원하는 소서리스 기술 자동 옵션을 갖춘 후반 스태프 대안입니다.','기술 자동 옵션과 요구치를 확인하세요.']],
  13: [['mage-plate',['leveling','endgame'],'소서리스 기술과 화염 저항을 쓰면서 갑옷 힘 요구 부담을 줄이는 선택입니다.','정확한 3소켓을 확보하세요.'],['dusk-shroud',['endgame'],'갑옷 방어력을 중시하는 후반 대안입니다.','캐릭터 및 용병의 요구치를 각각 확인하세요.']],
  14: [['demonhead',['endgame'],'화염 기술과 적 화염 저항 감소를 활용하는 후반 투구 베이스입니다.','정확한 3소켓과 요구치를 확인하세요.']],
  17: [['mask',['leveling'],'화염 저항과 생명력 옵션을 초중반 투구 슬롯에서 활용할 수 있습니다.'],['demonhead',['endgame'],'화염 저항 보완이 필요한 후반 캐릭터용 투구 선택입니다.','정확한 3소켓과 요구치를 확인하세요.']],
  20: [['phase-blade',['endgame'],'무기 내구도를 소모하지 않는 검 베이스에서 맹독의 독 피해 옵션을 활용합니다.'],['scourge',['endgame'],'메이스 계열 베이스에서 독 피해를 쓰는 대안입니다.','정확한 3소켓과 요구치를 확인하세요.']],
  21: [['crystal-sword',['leveling'],'육성 단계에서 명예의 생명력 흡수와 처치 후 자원 회복을 이용하기 쉽습니다.'],['caduceus',['endgame'],'성기사 전용 기술 자동 옵션을 가진 셉터에서 명예 옵션을 활용합니다.','원하는 기술 자동 옵션을 확인하세요.']],
  26: [['phase-blade',['endgame'],'무기 내구도 관리 없이 후반 근접 전투 옵션을 활용하는 검입니다.'],['berserker-axe',['endgame'],'도끼 숙련을 사용하는 캐릭터의 후반 선택입니다.','높은 요구치와 정확한 2소켓을 확인하세요.']],
  27: [['mask',['leveling'],'초중반 투구에 생명력 흡수와 피해 감소 옵션을 더하는 선택입니다.'],['demonhead',['endgame'],'후반 투구 슬롯에서 생명력 흡수와 피해 감소를 활용합니다.','정확한 3소켓과 요구치를 확인하세요.']],
  29: [['dusk-shroud',['endgame'],'갑옷 슬롯을 골드·마법 아이템 발견 목적에 사용하기 좋은 후반 베이스입니다.','캐릭터 힘 요구치와 정확한 3소켓을 확인하세요.']],
  30: [['phase-blade',['endgame'],'내구도 관리 없이 분노의 공격 속도와 출혈 계열 옵션을 이용하는 검입니다.'],['berserker-axe',['endgame'],'도끼 숙련과 근접 전투 옵션을 함께 쓰려는 후반 선택입니다.','요구치와 내구도를 확인하세요.']],
  31: [['phase-blade',['endgame'],'내구도 소모가 없는 검으로 한손 운용하며 야만용사 전투 기술과 생명력 흡수를 활용합니다.','민첩 136 요구치와 아이템 레벨 41 이상에서 6소켓을 확보하세요.'],['colossus-blade',['endgame'],'후반 양손 검 운용에서 룬워드의 생명력 흡수와 공격 옵션을 활용합니다.','양손 운용과 아이템 레벨 41 이상에서 6소켓을 확보하세요.']],
  34: [['dusk-shroud',['endgame'],'드루이드 기술 옵션을 갑옷 슬롯에 더하면서 후반 방어구로 운용합니다.','정확한 3소켓과 요구치를 확인하세요.']],
  35: [['mage-plate',['endgame'],'강령술사 기술 옵션을 사용하면서 갑옷의 힘 요구 부담을 낮춥니다.','정확한 3소켓을 확보하세요.'],['dusk-shroud',['endgame'],'방어력과 강령술사 기술 옵션을 함께 원하는 후반 대안입니다.','요구치와 정확한 3소켓을 확인하세요.']],
  37: [['hunters-bow',['leveling'],'초반에 구하기 쉬운 활로 이동·공격 보조 옵션을 얻습니다.']],
  38: [['hunters-bow',['leveling'],'활 기술 보너스를 활용하는 아마존 육성용 일반 활입니다.'],['grand-matron-bow',['endgame'],'아마존 전용 활 기술 자동 옵션을 살리는 후반 선택입니다.','아마존 전용이며 원하는 기술 자동 옵션을 확인하세요.']],
  46: [['divine-scepter',['leveling'],'성기사 기술 자동 옵션을 확인해 초중반 번개 피해와 저항 보조를 활용합니다.','정확한 4소켓과 자동 기술을 확인하세요.'],['caduceus',['endgame'],'성기사 전용 기술 자동 옵션을 더 중시하는 후반 셉터입니다.','요구치와 자동 기술을 확인하세요.']],
  47: [['dusk-shroud',['endgame'],'자동 수리 옵션과 저항·피해 감소를 갑옷 슬롯에서 활용하는 선택입니다.','정확한 2소켓을 확인하세요.'],['archon-plate',['endgame'],'방어력을 중시하는 후반 갑옷 대안입니다.','높은 요구치와 정확한 2소켓을 확인하세요.']],
  48: [['breast-plate',['leveling'],'야만용사 기술 옵션을 갑옷에 더하면서 낮은 등급 베이스를 활용합니다.','정확한 3소켓을 확보하세요.'],['mage-plate',['endgame'],'갑옷의 힘 부담을 관리하며 야만용사 기술 옵션을 활용합니다.','정확한 3소켓을 확보하세요.']],
  49: [['crystal-sword',['leveling'],'초반 검에 출혈과 적 회복 방해 옵션을 더하는 저비용 선택입니다.'],['phase-blade',['endgame'],'무기 내구도 관리 없이 적 회복 방해와 출혈 옵션을 활용합니다.','정확한 3소켓을 확보하세요.']],
  51: [['berserker-axe',['endgame'],'광신 오라와 변신 기술 보너스, 곰 소환 충전을 도끼 한손 운용에 활용합니다.','높은 요구치와 정확한 5소켓을 확인하세요.'],['caduceus',['endgame'],'성기사 전용 셉터에서 광신 오라와 강한 타격 옵션을 활용합니다.','높은 요구치와 정확한 5소켓을 확인하세요.']],
  52: [['flail',['leveling'],'강한 타격 옵션을 초중반 메이스 계열에서 활용하는 선택입니다.','정확한 3소켓을 확인하세요.']],
  53: [['dusk-shroud',['endgame','mercenary'],'저항과 피해 감소를 갑옷 슬롯에서 쓰며 용병 장비로도 활용할 수 있습니다.','용병용은 에테리얼을 고려하고 정확한 3소켓을 확인하세요.']],
  54: [['grand-matron-bow',['endgame'],'아마존 전용 활 기술과 냉기 오라를 직접 활용하는 후반 선택입니다.','원하는 활 기술 자동 옵션을 확인하세요.'],['blade-bow',['mercenary'],'1막 용병이 장착 가능한 활 베이스에서 냉기 오라를 제공합니다.','용병 장비의 공격 속도와 요구치를 확인하세요.']],
  55: [['phase-blade',['endgame'],'내구도 소모 없는 검에서 피격 시 저주 발동과 기술 옵션을 활용합니다.'],['runic-talons',['endgame'],'암살자 클러 기술 자동 옵션과 저주 발동을 함께 활용할 수 있습니다.','정확한 3소켓과 기술 자동 옵션을 확인하세요.']],
  56: [['breast-plate',['leveling'],'낮은 등급 갑옷에서 저항 옵션을 갖춘 2소켓 연기를 제작합니다.'],['dusk-shroud',['endgame','mercenary'],'후반 캐릭터나 용병의 저항 보완용 갑옷으로 활용합니다.','용병용은 에테리얼을 고려하세요.']],
  57: [['phase-blade',['endgame'],'열정의 광신 효과와 열의 기술을 내구도 소모 없는 검에서 활용합니다.'],['berserker-axe',['endgame'],'도끼 숙련 캐릭터가 열정의 공격 기술을 쓰는 후반 대안입니다.','요구치와 내구도를 확인하세요.']],
  61: [['phase-blade',['endgame'],'강한 타격과 방어력 무시 옵션을 내구도 소모 없는 검에서 활용합니다.'],['berserker-axe',['endgame'],'도끼 숙련과 강한 타격 옵션을 함께 쓰는 후반 선택입니다.','정확한 4소켓과 요구치를 확인하세요.']],
  62: [['crystal-sword',['leveling'],'초반 검에 악마·언데드 대상 피해 옵션을 더하는 육성용 선택입니다.'],['caduceus',['endgame'],'성기사 전용 기술 자동 옵션을 살리는 셉터 대안입니다.','원하는 기술 자동 옵션을 확인하세요.']],
  64: [['dusk-shroud',['endgame'],'생명력·저항과 능력치 옵션을 갑옷 슬롯에서 활용하는 후반 베이스입니다.','정확한 3소켓을 확보하세요.']],
  65: [['dusk-shroud',['endgame'],'성기사 기술과 생명력 회복 옵션을 후반 갑옷 슬롯에서 활용합니다.','정확한 3소켓을 확보하세요.']],
  66: [['phase-blade',['endgame'],'내구도 관리 없이 냉기 피해와 적 둔화 옵션을 검에 담습니다.'],['scourge',['endgame'],'메이스 계열에서 냉기 피해와 적 둔화 옵션을 활용합니다.','정확한 4소켓과 요구치를 확인하세요.']],
  69: [['gnarled-staff',['leveling'],'화염 기술 보너스가 붙은 낮은 단계 스태프에 잎새를 제작합니다.','화염 기술 자동 옵션을 확인하세요.'],['war-staff',['endgame'],'화염 기술 자동 옵션을 활용하는 스태프 대안입니다.','워 스태프는 노멀 등급이며 정확한 2소켓을 확인하세요.']],
  71: [['mask',['leveling'],'낮은 등급 투구에 모든 기술과 번개 저항 보조를 더합니다.'],['shako',['endgame'],'2소켓 투구에서 모든 기술과 번개 저항 보조를 활용합니다.','정확한 2소켓과 요구치를 확인하세요.']],
  72: [['mask',['leveling'],'냉기 저항과 피해 감소를 초중반 투구 슬롯에서 확보합니다.'],['demonhead',['endgame'],'후반 투구 슬롯에서 냉기 저항과 피해 감소를 활용합니다.','정확한 3소켓을 확인하세요.']],
  73: [['phase-blade',['endgame'],'내구도 소모 없이 신성한 화염과 강타 옵션을 근접 전투에 활용합니다.'],['berserker-axe',['endgame'],'도끼 숙련을 사용하는 캐릭터의 후반 근접 베이스입니다.','정확한 4소켓과 요구치를 확인하세요.']],
  74: [['hunters-bow',['leveling'],'활 기술 보너스와 원소 피해를 초중반 아마존 육성에 활용합니다.'],['blade-bow',['mercenary'],'1막 용병이 착용 가능한 활로 원소 피해와 발키리 소환 옵션을 제공합니다.','용병 요구치와 공격 속도를 확인하세요.']],
  77: [['demonhead',['endgame'],'관통과 마나 흡수 옵션을 후반 투구 슬롯에서 활용합니다.','정확한 3소켓과 요구치를 확인하세요.'],['bone-visage',['endgame'],'후반 투구 슬롯에서 관통과 마나 흡수 옵션을 활용하는 대안입니다.','정확한 3소켓과 요구치를 확인하세요.']],
  78: [['matriarchal-bow',['endgame'],'아마존 전용 활 기술 자동 옵션과 저주 발동을 활용합니다.','아마존 전용이며 자동 기술을 확인하세요.'],['blade-bow',['mercenary'],'1막 용병이 장착 가능한 활에서 저주 발동과 피해 옵션을 사용합니다.','용병 세팅의 요구치와 공격 속도를 확인하세요.']],
  80: [['phase-blade',['endgame'],'저주 발동과 성기사의 성역 오라를 내구도 소모 없는 검에서 활용합니다.'],['caduceus',['endgame'],'성기사 기술 자동 옵션과 성역 오라를 함께 활용하는 셉터 선택입니다.','정확한 3소켓과 자동 기술을 확인하세요.']],
  81: [['dusk-shroud',['endgame','mercenary'],'가시 오라와 독 피해 보너스를 갑옷 슬롯에서 활용합니다.','용병용은 에테리얼을 고려하세요.'],['archon-plate',['endgame'],'캐릭터가 힘을 투자해 방어력을 중시할 때 선택할 수 있습니다.','요구치와 정확한 4소켓을 확인하세요.']],
  82: [['mask',['leveling'],'초중반 투구 슬롯에서 모든 기술과 변신 저주 발동을 활용합니다.'],['bone-visage',['endgame'],'후반 투구에 모든 기술과 변신 저주 발동을 담는 선택입니다.','정확한 3소켓과 요구치를 확인하세요.']],
  84: [['phase-blade',['endgame'],'정전기장 발동과 적 저항 감소를 내구도 소모 없는 검에서 활용합니다.'],['thresher',['mercenary'],'용병용 폴암에서 정전기장 발동과 적 저항 감소를 지원합니다.','정확한 3소켓과 용병 요구치를 확인하세요.']],
  86: [['mask',['leveling','mercenary'],'정화 오라와 생존 보조 옵션을 초중반 투구에서 활용합니다.'],['demonhead',['mercenary'],'용병의 저주·독 대응을 위한 정화 오라 투구 선택입니다.','정확한 3소켓과 용병 요구치를 확인하세요.']],
  87: [['crystal-sword',['endgame'],'저항과 공격 보조 옵션을 검에 담고 조드 룬을 절약하는 비에테리얼 선택입니다.','아이템 레벨 41 이상에서 정확한 6소켓을 확보하세요.'],['phase-blade',['endgame'],'내구도 관리 없이 침묵의 저항과 공격 보조 옵션을 활용합니다.','아이템 레벨 41 이상에서 정확한 6소켓을 확보하세요.']],
  88: [['wolf-head',['endgame'],'드루이드 전용 펠트의 기술 자동 옵션으로 변신 빌드의 핵심 기술을 보완합니다.','원하는 기술 자동 옵션을 확인하고 아이템 레벨 26 이상에서 3소켓을 확보하세요.'],['blood-spirit',['endgame'],'엘리트 펠트 중 요구 힘이 비교적 낮고 원하는 드루이드 기술 자동 옵션을 노릴 수 있습니다.','요구 힘 86과 아이템 레벨 26 이상에서 3소켓을 확보하세요.']],
  90: [['breast-plate',['leveling'],'갑옷 힘 요구 부담을 줄인 채 이동·공격 보조 옵션을 사용합니다.','정확한 3소켓을 확인하세요.'],['mage-plate',['endgame'],'낮은 갑옷 힘 요구치로 이동·공격 보조 옵션을 유지합니다.','게임 모드 제작 가능 여부를 확인하세요.']],
  92: [['thresher',['endgame','mercenary'],'폴암에서 파괴의 원소 발동과 강한 타격 옵션을 용병에 활용합니다.','정확한 5소켓과 용병 요구치를 확인하세요.'],['colossus-sword',['endgame'],'양손 검으로 파괴의 원소 발동과 강한 타격 옵션을 활용합니다.','양손 운용과 정확한 5소켓을 확인하세요.']],
  93: [['thresher',['endgame','mercenary'],'용병 폴암에 빙결 오라와 공격 옵션을 제공하는 선택입니다.','정확한 5소켓과 용병 요구치를 확인하세요.'],['thunder-maul',['endgame'],'양손 해머 베이스에서 빙결 오라와 강한 타격 옵션을 활용합니다.','높은 요구치와 아이템 레벨 41 이상 조건을 확인하세요.']],
  94: [['mage-plate',['leveling','endgame'],'아마존 기술과 생존 옵션을 갑옷 슬롯에서 쓰면서 힘 부담을 낮춥니다.','정확한 3소켓을 확보하세요.']],
  95: [['dusk-shroud',['endgame','mercenary'],'강타·상처 악화와 저항 옵션을 갑옷 슬롯에서 활용합니다.','용병용은 에테리얼을 고려하세요.']],
  96: [['runic-talons',['endgame'],'암살자의 훨윈드와 클러 기술 자동 옵션을 함께 살리는 선택입니다.','원하는 암살자 기술 자동 옵션을 확인하세요.'],['greater-talons',['endgame'],'클러 기술 자동 옵션을 고를 수 있는 대안입니다.','정확한 3소켓과 기술 자동 옵션을 확인하세요.']],
  97: [['mask',['leveling'],'냉기 흡수와 빙결 방지를 초중반 투구에서 활용합니다.'],['bone-visage',['endgame'],'후반 투구 슬롯에서 빙결 방지와 냉기 흡수 옵션을 얻습니다.','정확한 3소켓과 요구치를 확인하세요.']],
  98: [['mage-plate',['leveling','endgame'],'악마술사 기술과 착용 조건 감소를 갑옷에 담으면서 힘 부담을 조절합니다.','RotW 제작 가능 모드를 확인하세요.'],['dusk-shroud',['endgame'],'악마술사 기술과 피해 증가를 후반 갑옷에 담는 선택입니다.','정확한 3소켓과 제작 가능 모드를 확인하세요.']],
  99: [['mask',['leveling'],'시전 속도와 모든 기술 옵션을 초중반 투구 슬롯에서 활용합니다.','RotW 제작 가능 모드를 확인하세요.'],['demonhead',['endgame'],'시전 속도와 모든 기술 옵션을 후반 투구 슬롯에서 활용합니다.','정확한 3소켓과 제작 가능 모드를 확인하세요.']],
  100: [['kris',['leveling'],'단검 기술 자동 옵션을 확인하며 의식의 공격·생명력 흡수 옵션을 이용합니다.','정확한 3소켓과 자동 부여 기술을 확인하세요.'],['legend-spike',['endgame'],'후반 단검 베이스에서 공격 속도와 피해 옵션을 활용합니다.','정확한 3소켓과 요구치를 확인하세요.']],
  101: [['bone-shield',['leveling'],'낮은 등급 일반 방패에 이동 속도·저항·생존 옵션을 담습니다.','마법서 베이스가 아닌 일반 방패입니다. 정확한 2소켓을 확인하세요.'],['sacred-targe',['endgame'],'성기사 전용 저항 방패에서 경계의 막기·저항 옵션을 활용합니다.','성기사 전용이며 정확한 2소켓을 확인하세요.']],
  102: [['kris',['leveling'],'단검 기술 자동 옵션과 파괴 불가·시전 속도 옵션을 함께 활용합니다.','RotW 제작 가능 모드와 정확한 3소켓을 확인하세요.'],['legend-spike',['endgame'],'단검의 자동 기술 옵션과 공허의 파괴 불가·기술 옵션을 활용합니다.','자동 기술과 요구치, 제작 가능 모드를 확인하세요.']],
};

const pending = [];
const baseById = new Map(bases.items.map((item) => [item.id, item]));
const fromSpec = (spec) => spec.map(([baseItemId, purposes, reason, condition]) => ({
  baseItemId, purposes, reason, ...(condition ? { condition } : {}),
}));
for (const [id, specs] of Object.entries(review)) {
  recommendations[id] = fromSpec(specs);
}
// The 4-socket armor recipes cannot use Mage Plate (3-socket cap); earlier reports counted these hidden UI candidates as public.
for (const id of ['22', '68']) recommendations[id] = recommendations[id].filter((entry) => entry.baseItemId !== 'mage-plate');
// Rhyme has exactly two sockets; use the Normal Small Shield for low requirements.
recommendations['1'] = fromSpec([
  ['small-shield',['leveling'],'낮은 등급과 요구 능력치의 2소켓 방패로 각운의 결빙 방지와 저항을 활용합니다.'],
  ['sacred-targe',['endgame'],'성기사 전용 저항 베이스에 각운의 결빙 방지와 저항 옵션을 더합니다.','성기사 전용이며 정확한 2소켓과 요구치를 확인하세요.'],
]);
// Obsession is six sockets. War Staff is Normal and can reach six sockets at ilvl 26+.
recommendations['79'] = fromSpec([
  ['war-staff',['endgame'],'노멀 등급 스태프에 소서리스 기술 자동 옵션을 살려 집착을 제작할 수 있습니다.','아이템 레벨 26 이상에서 6소켓 조건을 충족하는지 확인하세요.'],
  ['archon-staff',['endgame'],'엘리트 스태프에 원하는 소서리스 기술 자동 옵션을 살릴 수 있습니다.','정확한 6소켓과 기술 자동 옵션을 확인하세요.'],
]);
// Death grants Indestructible, so an ethereal base is viable when the base is otherwise appropriate.
recommendations['76'] = fromSpec([
  ['colossus-blade',['endgame'],'파괴 불가 옵션으로 에테리얼 양손 검의 내구도 문제를 막으며 근접 피해를 활용합니다.','양손 운용과 요구치를 확인하세요.'],
  ['berserker-axe',['endgame'],'파괴 불가 옵션을 활용해 에테리얼 도끼를 한손으로 운용할 수 있습니다.','도끼 숙련과 요구치를 확인하세요.'],
]);
// Avoid implying unmeasured IAS/DPS superiority; recommendations use direct option/base facts.
const reasonCorrections = {
  9: { 0: '폴암에 균열의 원소 발동 옵션을 담아 근접 시전 빌드에 활용합니다.' },
  10: ['2막 용병에게 집중 오라를 제공하는 폴암 베이스입니다.','엘리트 폴암을 용병용 집중 오라 베이스로 활용합니다.','스피어 분류 베이스로 용병에게 집중 오라를 제공하는 대안입니다.'],
  19: { 0: '무기 내구도 관리 없이 마지막 소원의 근접 발동 옵션을 활용합니다.' },
  24: ['암살자 전용 클러의 원하는 기술 자동 옵션을 살리는 베이스입니다.','엘리트 클러의 암살자 기술 자동 옵션을 활용하는 선택입니다.'],
  25: ['2막 용병의 선고 오라를 위한 폴암 베이스로 활용합니다.','용병용 엘리트 폴암에서 선고 오라를 활용하는 대안입니다.','용병이 착용 가능한 폴암에서 선고 오라를 활용합니다.','스피어 분류 베이스로 용병에게 선고 오라를 제공합니다.'],
  43: ['용병 폴암에 강타와 마법부여 발동 옵션을 활용합니다.','엘리트 폴암에서 강타와 마법부여 발동 옵션을 활용합니다.','스피어 분류 용병 무기에 강타와 마법부여 발동 옵션을 담습니다.'],
  67: { 1: '무기 내구도 관리 없이 인내의 무기 옵션을 활용합니다.' },
  44: { 0: '무기 내구도 관리 없이 슬픔의 추가 피해 옵션을 활용합니다.' },
  31: { 0: '내구도 소모가 없는 검으로 한손 운용하며 야만용사 전투 기술과 생명력 흡수를 활용합니다.' },
  57: { 0: '내구도 소모 없는 검에서 열의·광폭화 기술과 공격 속도 옵션을 활용합니다.', 1: '도끼 숙련 캐릭터가 열의·광폭화 기술과 공격 속도 옵션을 활용하는 후반 대안입니다.' },
  74: { 1: '1막 용병이 장착해 원기 오라와 세 종류의 원소 피해를 활용하는 활 베이스입니다.' },
  91: { 0: '무기 내구도 관리 없이 투지의 이동·공격 옵션을 활용합니다.', 1: '암살자 클러의 기술 자동 옵션과 투지의 이동·공격 옵션을 활용합니다.' },
};
for (const [id, reasons] of Object.entries(reasonCorrections)) {
  const current = recommendations[id];
  if (!current) throw new Error(`Missing recommendation row for ${id}`);
  const updates = Array.isArray(reasons) ? Object.fromEntries(reasons.map((reason, index) => [index, reason])) : reasons;
  for (const [index, reason] of Object.entries(updates)) {
    if (!current[Number(index)]) throw new Error(`Missing recommendation index ${index} for ${id}`);
    current[Number(index)].reason = reason;
  }
}

for (const [id, entries] of Object.entries(recommendations)) {
  if (!entries.length) throw new Error(`${id}: empty reviewed recommendation`);
  const row = runewords.find((item) => String(item.id) === id);
  for (const entry of entries) {
    const base = baseById.get(entry.baseItemId);
    if (!base) throw new Error(`${id}: unknown base ${entry.baseItemId}`);
    const requiredBand = base.socketLimitsByItemLevel?.find((band) => band.maxSockets >= row.sockets);
    if (requiredBand?.minItemLevel > 1 && !new RegExp(`아이템\\s*레벨\\s*${requiredBand.minItemLevel}\\s*이상`).test(entry.condition || '')) {
      entry.condition = [entry.condition, `아이템 레벨 ${requiredBand.minItemLevel} 이상에서 ${row.sockets}소켓을 확보하세요.`].filter(Boolean).join(' ');
    }
  }
}
if (Object.keys(review).length !== 64 || pending.length !== 0) throw new Error('Expected 64 curated and no pending review rows.');
writeFileSync(recommendationPath, `${JSON.stringify(recommendations, null, 2)}\n`);
writeFileSync('lib/runeword-bases/pending-review.json', `${JSON.stringify({ runewordIds: pending, reasons: {} }, null, 2)}\n`);
