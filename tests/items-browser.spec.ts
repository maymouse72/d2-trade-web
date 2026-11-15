import { expect, test } from '@playwright/test';

const pages = [
  { path: '/runewords', heading: '룬워드 도감' },
  { path: '/uniques', heading: '유니크 도감' },
  { path: '/sets', heading: '세트 도감' },
] as const;

for (const route of pages) {
  test(`${route.path}: simplified catalog UI, interactions, and responsive layout`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(route.path);
    await expect(page.getByRole('heading', { name: route.heading })).toBeVisible();
    await expect(page.getByText('게임 모드 · 패치')).toHaveCount(0);
    await expect(page.getByText('데이터가 확인되지 않은 모드는 REVIEW로 표시합니다.')).toHaveCount(0);
    await expect(page.getByText(/확인됨|REVIEW|UNAVAILABLE|RotW 3\.3 기준|3\.4 변경 항목 아님|공식 패치 근거|공식 가이드 이미지 출처|원본 JSON의 RotW/)).toHaveCount(0);

    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible();
    await expect(cards.locator('a')).toHaveCount(0);

    if (route.path === '/uniques') {
      await page.getByLabel('분류').selectOption('무기');
      await page.getByLabel('정렬').selectOption('level');
      await expect(page.getByRole('status')).toContainText('무기');
      const search = page.getByPlaceholder(/한글·영문 이름/);
      await search.fill("Dimoak's Hew");
      const card = page.locator('article').filter({ hasText: "Dimoak's Hew" });
      await expect(card).toContainText('피해 +100~150%');
      await expect(card).not.toContainText('피해 +100%');
      await search.fill('Serpent Lord');
      const serpent = page.locator('article').filter({ hasText: 'Serpent Lord' });
      await serpent.getByText('전체 옵션 · 기본 성능 보기').click();
      await expect(serpent).toContainText('공격 속도 +15%');
      await search.fill('Ethereal Edge');
      const ethereal = page.locator('article').filter({ hasText: 'Ethereal Edge' });
      await expect(ethereal).toContainText('공격 속도 +40%');
      await search.fill("Executioner's Justice");
      const executioner = page.locator('article').filter({ hasText: "Executioner's Justice" });
      await executioner.getByText('전체 옵션 · 기본 성능 보기').click();
      await expect(executioner).toContainText('13레벨 Amplify Damage');
      await search.fill("Rogue's Bow");
      const rogue = page.locator('article').filter({ hasText: "Rogue's Bow" });
      await expect(rogue).toContainText('냉기 화살 +1~3');
      await expect(rogue).toContainText('화염 화살 +1~3');
      await search.fill('Bloodletter');
      const bloodletter = page.locator('article').filter({ hasText: 'Bloodletter' });
      await expect(bloodletter).toBeVisible();
      await expect(bloodletter).toContainText('공격 속도 +20%');
    } else if (route.path === '/sets') {
      const classFilter = page.getByLabel('주요 직업');
      const firstClass = await classFilter.locator('option').nth(1).getAttribute('value');
      await classFilter.selectOption(firstClass || '');
      await page.getByLabel('정렬').selectOption('level');
      await expect(page.getByRole('status')).toContainText('세트');
      await page.getByRole('button', { name: '전체 초기화' }).click();
      const search = page.getByPlaceholder(/세트·아이템 이름/);
      await search.fill("Isenhart's Armory");
      const card = page.locator('article').filter({ hasText: "Isenhart's Armory" });
      await expect(card).toBeVisible();
      await card.getByText('구성 아이템 · 세트 효과 보기').click();
      await expect(card).toContainText('달리기/걷기 속도 +30%');
      await expect(card).toContainText('타격 회복 속도 +25%');
      await search.fill('Angelic Raiment');
      const angelic = page.locator('article').filter({ hasText: 'Angelic Raiment' });
      await angelic.getByText('구성 아이템 · 세트 효과 보기').click();
      await expect(angelic).toContainText('빙결 지속시간 절반으로 감소');
    } else {
      await page.getByLabel('소켓 수').selectOption('5');
      await page.getByLabel('정렬').selectOption('level');
      await expect(page.getByRole('status')).toContainText('5소켓');
      const search = page.getByPlaceholder(/이름·영문명·옵션·룬/);
      await search.fill('Eternity');
      const card = page.locator('article').filter({ hasText: 'Eternity' });
      await expect(card).toBeVisible();
      await card.getByText('옵션 보기').click();
      await expect(card).toContainText('+300~390%');
      await expect(card).toContainText('미사일 무기');
      await page.getByLabel('장비 종류').selectOption('근접 무기 및 미사일 무기');
      await expect(card).toBeVisible();
      await page.getByRole('button', { name: '전체 초기화' }).click();
      await search.fill('Mania');
      const mania = page.locator('article').filter({ hasText: 'Mania' });
      await expect(mania).toBeVisible();
      await expect(mania.getByText('옵션 보기')).toBeVisible();
      await mania.getByText('옵션 보기').click();
      await expect(mania).not.toContainText('검토 필요');
      await expect(mania).not.toContainText('옵션을 적용하지 않습니다');
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `${route.path} horizontal overflow`).toBe(false);
    expect(errors, `${route.path} browser errors`).toEqual([]);
  });
}
