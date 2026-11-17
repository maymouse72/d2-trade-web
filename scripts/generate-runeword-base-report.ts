import { readFileSync, writeFileSync } from 'node:fs';
import type { Runeword } from '../app/runewords/catalog.ts';
import { DEFAULT_MODE_PRESET, MODE_PRESETS, getModeContext } from '../app/item-catalog/mode-presets.ts';
import { resolveItemVariant, type ItemVariant } from '../lib/items/variants.ts';
import { BASE_ITEMS, getBaseRecommendations, validateBaseRecommendationData, type BasePurpose } from '../lib/runeword-bases/index.ts';

const purposeNames: Record<BasePurpose, string> = { leveling: '맨땅·육성', endgame: '최종 장비', mercenary: '용병' };
const records = JSON.parse(readFileSync('app/runewords/data.json', 'utf8')) as Runeword[];
const context = getModeContext(DEFAULT_MODE_PRESET);
const modeLabel = MODE_PRESETS.find((preset) => preset.id === DEFAULT_MODE_PRESET)?.label || DEFAULT_MODE_PRESET;
const errors = validateBaseRecommendationData(records);
const summaries = records.map((row) => {
  const result = resolveItemVariant(row, row.variants as ItemVariant[] | undefined, context);
  const current = result.properties || row;
  const recommendations = getBaseRecommendations({ ...current, id: row.id });
  return { row, current, recommendations };
});
const recommendationCount = summaries.reduce((sum, row) => sum + row.recommendations.length, 0);

const lines = [
  '# RW-BASE-02 — 추천 베이스 데이터 보고서',
  '',
  `- 기준 모드: ${modeLabel}`,
  `- 도감 표시 레코드: ${records.length}개 / 베이스 추천 연결: ${recommendationCount}건`,
  `- 정규화 베이스 후보 카탈로그: ${BASE_ITEMS.length}개 (전체 게임 베이스 목록이 아닌 검증 후보 subset)`,
  `- 자동 호환성 검사: ${errors.length ? `FAIL (${errors.length})` : 'PASS (장비 분류·최대 소켓·ID·목적)'}`,
  '',
  '## 선정 및 판정 기준',
  '',
  '- 각 도감 레코드의 활성 Variant 장비 유형과 소켓 수를 먼저 확인하고, 명시적 후보 우선순위와 장비 계층을 함께 적용합니다.',
  '- `(NO)/(EX)/(EL)`은 베이스 등급입니다. 아이템 품질을 뜻하지 않습니다. 룬워드 제작 시에는 해당 룬워드의 정확한 소켓 수를 가진 일반 베이스를 사용해야 합니다.',
  '- 후보 카탈로그의 최대 소켓은 해당 베이스가 게임 규칙상 가질 수 있는 상한입니다. 아이템 레벨에 따른 개별 라주크 소켓 수나 소켓 획득 확률을 보장하지 않습니다. 필요한 소켓은 큐브 소켓 생성 결과도 확인해야 합니다.',
  '- `맨땅·육성`, `최종 장비`, `용병`은 추천 용도 분류입니다. 힘·민첩·방어력·공격 속도·거래 가치가 전부 최적화된 순위는 아닙니다.',
  '- 정확한 장비 유형과 소켓 호환성이 없는 후보는 추천에서 제외합니다. 아마존 전용 활/창은 용병 용도에서 제외합니다.',
  '',
  '## 룬워드별 추천',
  '',
];

for (const { row, current, recommendations } of summaries) {
  lines.push(`### ${row.id}. ${row.name} — ${current.equipment}, ${current.sockets}소켓`);
  for (const { baseItem, purposes, reason } of recommendations) {
    lines.push(`- **${baseItem.nameKo} (${baseItem.tier})**${baseItem.classRestriction ? ` · ${baseItem.classRestriction} 전용` : ''} — ${purposes.map((purpose) => purposeNames[purpose]).join(' / ')}: ${reason}`);
  }
  lines.push('');
}

lines.push(
  '## 제외 후보·수동 확인 항목',
  '',
  '- 장비 분류가 맞지 않거나 최대 소켓이 필요한 수보다 낮은 베이스는 제외합니다. 검·도끼·메이스·클럽·해머·폴암·스피어·셉터·스태프·활/쇠뇌·원드·클러·대거를 별도 분류로 검증합니다.',
  '- 용병은 베이스 카탈로그의 장착 가능 막 정보를 가진 일반 장비만 `용병`으로 표시하며, 직업 전용 베이스는 제외합니다.',
  '- 게임 내에서 각 후보를 직접 제작해 보는 수동 실기 검증은 수행하지 않았습니다. 사용 전 게임 데이터 기준으로 확인했으며, 특정 빌드의 최적 베이스 판단은 별도 검토 대상입니다.',
  '- 전체 베이스 아이템 목록을 복제하지 않고, 현재 데이터 구조에서 호환 후보를 검증할 수 있는 부분 집합을 사용합니다. 추후 후보 확장은 이 보고서의 리스트와 테스트를 갱신해야 합니다.',
  '',
  '## 데이터 출처',
  '',
  '- [D2R 3.4.95032 Base Items](https://d2r.org/data/items) 및 [Compendium / 게임 테이블 기준](https://d2r.org/data/items/compendium)',
  '- [소켓 수와 아이템 레벨 규칙](https://d2r.org/mechanics/sockets)',
  '- [Blizzard Arreat Summit 룬워드 제작 규칙](https://classic.battle.net/diablo2exp/items/runewords.shtml)',
  '- 프로젝트 원본 `app/runewords/data.json`의 룬워드 명칭·조합·Variant 구조는 수정하지 않았습니다.',
  '',
);

writeFileSync('docs/runewords/RW-BASE-02-DATA-REPORT.md', lines.join('\n'));
const report = [
  '# RW-BASE-04 — 추천 베이스 데이터 검증',
  '',
  `- 검증 시각: ${new Date().toISOString()}`,
  `- 활성 모드: ${modeLabel}`,
  `- 룬워드 도감 레코드: ${records.length}`,
  `- 추천이 연결된 레코드: ${summaries.filter((row) => row.recommendations.length > 0).length}`,
  `- 추천 베이스 연결 수: ${recommendationCount}`,
  `- 베이스 후보 수: ${BASE_ITEMS.length}`,
  `- 자동 검증 결과: ${errors.length ? `FAIL (${errors.length})` : 'PASS'}`,
  '',
  '## 검사 범위',
  '',
  '- 추천 룬워드 ID 및 베이스 ID 존재, 베이스 카탈로그 ID 중복, 한 룬워드 안의 중복 추천',
  '- 활성 장비 유형 및 필요 소켓 수와 베이스 유형/최대 가능 소켓의 호환성',
  '- NO/EX/EL 값과 필수 표시 문구(이유·목적), 1~5개 추천 범위',
  '- 추천 우선순위에 기록된 베이스 ID와 룬워드 ID 연결',
  '- 용병 용도는 장착 가능 막 정보가 있고 직업 전용이 아닌 베이스에만 표시',
  '- 저장된 모든 Variant의 장비 유형/소켓 조합에 호환 후보가 존재하고 개별 추천도 호환됨',
  '',
  '## 결과',
  '',
  ...(errors.length ? errors.map((error) => `- FAIL: ${error}`) : ['- 모든 자동 검사 통과: 장비 유형 오류 0, 소켓 상한 오류 0, 등급 오류 0, 알 수 없는 ID 0, 용병 자격 오류 0.']),
  '',
  '## 수동 확인 제한',
  '',
  '- 자동 검증은 베이스가 게임 규칙상 필요한 소켓 수를 가질 수 있는지 검사합니다. 특정 아이템 레벨에서 라주크가 부여하는 소켓 수, 큐브 확률, 실제 제작 UI는 자동 PASS로 간주하지 않습니다.',
  '- 전체 게임 베이스 목록 대신 60개 안팎의 선정 후보 subset을 사용합니다. 가능한 모든 대체 베이스의 포괄성은 보증하지 않습니다.',
  '- 각 추천을 실제 게임 클라이언트에서 제작하는 수동 검증은 미수행입니다.',
  '- RotW 3.4 기본 표시를 검사했습니다. Classic/LoD 및 모든 온라인/오프라인 Variant의 배포용 검증은 각 모드별 제작 가능 목록이 준비된 뒤 별도 수행해야 합니다.',
  '',
  '## 참고 자료',
  '',
  '- [D2R 3.4.95032 Base Items](https://d2r.org/data/items), [소켓 규칙](https://d2r.org/mechanics/sockets), [Blizzard 룬워드 규칙](https://classic.battle.net/diablo2exp/items/runewords.shtml)',
  '',
].join('\n');
writeFileSync('docs/runewords/RW-BASE-04-VALIDATION.md', report);
if (errors.length) {
  throw new Error(errors.join('\n'));
}
