export type GameEra = 'Classic' | 'LoD' | 'RotW';
export type OnlineState = 'Online' | 'Offline';
export type LadderState = 'Ladder' | 'NonLadder' | 'NotApplicable' | 'Unknown';
export type ItemAvailability = 'AVAILABLE' | 'UNAVAILABLE' | 'REVIEW';
export type ItemPatch = 'legacy' | '3.3' | '3.4';

export type ItemContext = {
  gameEra: GameEra;
  onlineState: OnlineState;
  ladderState: LadderState;
  patch: ItemPatch;
};

export type ItemVariant<TProperties extends object = Record<string, unknown>> = {
  id: string;
  patchFrom: ItemPatch;
  patchTo?: ItemPatch;
  gameEras: GameEra[];
  onlineStates: OnlineState[];
  ladderStates: LadderState[];
  availability: ItemAvailability;
  properties?: Partial<TProperties>;
  sourceUrl: string;
  sourceCheckedAt: string;
  evidence: string;
};

export type ResolvedItem<TProperties extends object> = {
  availability: ItemAvailability;
  properties: TProperties | null;
  previousProperties: TProperties;
  versionLabel: string;
  sourceUrl?: string;
  message: string;
  variantId?: string;
};

export function isValidItemContext(context: ItemContext): boolean {
  if (context.onlineState === 'Offline') return context.ladderState === 'NotApplicable';
  return context.ladderState === 'Ladder' || context.ladderState === 'NonLadder';
}

function patchMatches(variant: ItemVariant, patch: ItemPatch): boolean {
  if (variant.patchFrom !== patch) return false;
  if (!variant.patchTo) return true;
  const patchOrder: ItemPatch[] = ['legacy', '3.3', '3.4'];
  return patchOrder.indexOf(patch) <= patchOrder.indexOf(variant.patchTo);
}

export function resolveItemVariant<TProperties extends object>(
  baseProperties: TProperties,
  variants: ItemVariant[] | undefined,
  context: ItemContext,
): ResolvedItem<TProperties> {
  if (!isValidItemContext(context)) {
    return { availability: 'REVIEW', properties: null, previousProperties: baseProperties, versionLabel: '선택 조건 오류', message: '온라인/오프라인과 래더 조건 조합을 확인하세요.' };
  }

  if (context.gameEra !== 'RotW') {
    return { availability: 'REVIEW', properties: null, previousProperties: baseProperties, versionLabel: `${context.gameEra} 기준 미확인`, message: '저장된 원본은 RotW 3.3 데이터입니다. Classic/LoD 옵션은 별도 근거가 없어 적용하지 않습니다.' };
  }

  const candidates = (variants || []).filter((variant) =>
    patchMatches(variant, context.patch) &&
    variant.gameEras.includes(context.gameEra) &&
    variant.onlineStates.includes(context.onlineState) &&
    variant.ladderStates.includes(context.ladderState),
  );

  if (candidates.length > 1) {
    return { availability: 'REVIEW', properties: null, previousProperties: baseProperties, versionLabel: 'Variant 중복', message: '동일 조건에 여러 버전이 겹쳐 옵션 적용을 보류합니다.' };
  }

  const selected = candidates[0];
  if (selected) {
    const properties = selected.availability !== 'AVAILABLE'
      ? null
      : { ...baseProperties, ...(selected.properties || {}) } as TProperties;
    const message = selected.availability === 'AVAILABLE'
      ? selected.evidence
      : selected.availability === 'UNAVAILABLE'
        ? selected.evidence
        : `${selected.evidence} 확정 전에는 이 모드에 옵션을 적용하지 않습니다.`;
    return {
      availability: selected.availability,
      properties,
      previousProperties: baseProperties,
      versionLabel: `${selected.patchFrom} · ${context.onlineState === 'Offline' ? '오프라인' : context.ladderState === 'Ladder' ? '온라인 래더' : '온라인 비래더'}`,
      sourceUrl: selected.sourceUrl,
      message,
      variantId: selected.id,
    };
  }

  if (context.patch === 'legacy') {
    return { availability: 'REVIEW', properties: null, previousProperties: baseProperties, versionLabel: '패치 기준 미확인', message: '이 에라의 패치별 도감 데이터가 없습니다.' };
  }

  return {
    availability: 'AVAILABLE',
    properties: baseProperties,
    previousProperties: baseProperties,
    versionLabel: context.patch === '3.4' ? 'RotW 3.3 기준 · 3.4 변경 항목 아님' : 'RotW 3.3 기준',
    sourceUrl: 'https://github.com/blizzhackers/d2data',
    message: '원본 JSON의 RotW 3.3 값입니다. 공식 3.4 변경 목록에 없는 레코드에 한해 그대로 표시합니다.',
  };
}
