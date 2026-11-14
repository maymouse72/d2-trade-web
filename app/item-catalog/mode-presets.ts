import type { ItemContext } from '../../lib/items/variants';

export const MODE_PRESETS = [
  { id: 'rotw-ladder-34', label: 'RotW · 온라인 래더 · 3.4', context: { gameEra: 'RotW', onlineState: 'Online', ladderState: 'Ladder', patch: '3.4' } },
  { id: 'rotw-nonladder-34', label: 'RotW · 온라인 비래더 · 3.4', context: { gameEra: 'RotW', onlineState: 'Online', ladderState: 'NonLadder', patch: '3.4' } },
  { id: 'rotw-offline-34', label: 'RotW · 오프라인 · 3.4', context: { gameEra: 'RotW', onlineState: 'Offline', ladderState: 'NotApplicable', patch: '3.4' } },
  { id: 'rotw-ladder-33', label: 'RotW · 온라인 래더 · 3.3', context: { gameEra: 'RotW', onlineState: 'Online', ladderState: 'Ladder', patch: '3.3' } },
  { id: 'rotw-nonladder-33', label: 'RotW · 온라인 비래더 · 3.3', context: { gameEra: 'RotW', onlineState: 'Online', ladderState: 'NonLadder', patch: '3.3' } },
  { id: 'rotw-offline-33', label: 'RotW · 오프라인 · 3.3', context: { gameEra: 'RotW', onlineState: 'Offline', ladderState: 'NotApplicable', patch: '3.3' } },
  { id: 'lod-ladder', label: 'LoD · 온라인 래더 · 데이터 확인 필요', context: { gameEra: 'LoD', onlineState: 'Online', ladderState: 'Ladder', patch: 'legacy' } },
  { id: 'lod-nonladder', label: 'LoD · 온라인 비래더 · 데이터 확인 필요', context: { gameEra: 'LoD', onlineState: 'Online', ladderState: 'NonLadder', patch: 'legacy' } },
  { id: 'lod-offline', label: 'LoD · 오프라인 · 데이터 확인 필요', context: { gameEra: 'LoD', onlineState: 'Offline', ladderState: 'NotApplicable', patch: 'legacy' } },
  { id: 'classic-ladder', label: 'Classic · 온라인 래더 · 데이터 확인 필요', context: { gameEra: 'Classic', onlineState: 'Online', ladderState: 'Ladder', patch: 'legacy' } },
  { id: 'classic-nonladder', label: 'Classic · 온라인 비래더 · 데이터 확인 필요', context: { gameEra: 'Classic', onlineState: 'Online', ladderState: 'NonLadder', patch: 'legacy' } },
  { id: 'classic-offline', label: 'Classic · 오프라인 · 데이터 확인 필요', context: { gameEra: 'Classic', onlineState: 'Offline', ladderState: 'NotApplicable', patch: 'legacy' } },
] as const satisfies ReadonlyArray<{ id: string; label: string; context: ItemContext }>;

export type ModePresetId = typeof MODE_PRESETS[number]['id'];
export const DEFAULT_MODE_PRESET: ModePresetId = 'rotw-ladder-34';
export function getModeContext(id: ModePresetId): ItemContext {
  return MODE_PRESETS.find((preset) => preset.id === id)?.context || MODE_PRESETS[0].context;
}
