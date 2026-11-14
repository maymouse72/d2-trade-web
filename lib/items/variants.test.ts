import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidItemContext, resolveItemVariant, type ItemVariant } from './variants.ts';

const base = { value: 'legacy' };
const variant: ItemVariant<typeof base> = {
  id: 'rotw-34-ladder', patchFrom: '3.4', gameEras: ['RotW'], onlineStates: ['Online'], ladderStates: ['Ladder'],
  availability: 'AVAILABLE', properties: { value: 'updated' }, sourceUrl: 'https://example.invalid', sourceCheckedAt: '2026-11-14', evidence: 'official patch',
};

test('mode contexts reject impossible online/offline ladder combinations', () => {
  assert.equal(isValidItemContext({ gameEra: 'RotW', onlineState: 'Online', ladderState: 'Ladder', patch: '3.4' }), true);
  assert.equal(isValidItemContext({ gameEra: 'RotW', onlineState: 'Offline', ladderState: 'NotApplicable', patch: '3.4' }), true);
  assert.equal(isValidItemContext({ gameEra: 'RotW', onlineState: 'Offline', ladderState: 'Ladder', patch: '3.4' }), false);
});

test('resolver selects only a matching verified variant and does not apply RotW values to legacy eras', () => {
  const ladder = resolveItemVariant(base, [variant], { gameEra: 'RotW', onlineState: 'Online', ladderState: 'Ladder', patch: '3.4' });
  assert.equal(ladder.availability, 'AVAILABLE');
  assert.equal(ladder.properties?.value, 'updated');
  const nonladder = resolveItemVariant(base, [variant], { gameEra: 'RotW', onlineState: 'Online', ladderState: 'NonLadder', patch: '3.4' });
  assert.equal(nonladder.properties?.value, 'legacy');
  assert.equal(nonladder.versionLabel, 'RotW 3.3 기준 · 3.4 변경 항목 아님');
  const lod = resolveItemVariant(base, [variant], { gameEra: 'LoD', onlineState: 'Online', ladderState: 'Ladder', patch: 'legacy' });
  assert.equal(lod.availability, 'REVIEW');
  assert.equal(lod.properties, null);
});

test('resolver blocks ambiguous variants instead of picking the first', () => {
  const ambiguous = { ...variant, id: 'second' };
  const result = resolveItemVariant(base, [variant, ambiguous], { gameEra: 'RotW', onlineState: 'Online', ladderState: 'Ladder', patch: '3.4' });
  assert.equal(result.availability, 'REVIEW');
  assert.equal(result.properties, null);
});

test('resolver explicitly reports unavailable and review outcomes', () => {
  const unavailable: ItemVariant<typeof base> = { ...variant, ladderStates: ['NonLadder'], availability: 'UNAVAILABLE', properties: undefined };
  const blocked = resolveItemVariant(base, [unavailable], { gameEra: 'RotW', onlineState: 'Online', ladderState: 'NonLadder', patch: '3.4' });
  assert.equal(blocked.availability, 'UNAVAILABLE');
  assert.equal(blocked.properties, null);
  const review: ItemVariant<typeof base> = { ...variant, ladderStates: ['Ladder'], availability: 'REVIEW', properties: undefined };
  const needsReview = resolveItemVariant(base, [review], { gameEra: 'RotW', onlineState: 'Online', ladderState: 'Ladder', patch: '3.4' });
  assert.equal(needsReview.availability, 'REVIEW');
  assert.equal(needsReview.properties, null);
});

test('3.3 variants do not silently carry into 3.4 without an explicit 3.4 variant', () => {
  const oldOnly = { ...variant, patchFrom: '3.3' as const };
  const result = resolveItemVariant(base, [oldOnly], { gameEra: 'RotW', onlineState: 'Online', ladderState: 'Ladder', patch: '3.4' });
  assert.equal(result.variantId, undefined);
  assert.equal(result.versionLabel, 'RotW 3.3 기준 · 3.4 변경 항목 아님');
});
