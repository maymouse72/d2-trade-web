import { expect, test } from '@playwright/test';

const pages = [
  { path: '/runewords', heading: '룬워드 도감', modeId: 'runeword-item-mode' },
  { path: '/uniques', heading: '유니크 도감', modeId: 'unique-item-mode' },
  { path: '/sets', heading: '세트 도감', modeId: 'set-item-mode' },
] as const;

for (const route of pages) {
  test(`${route.path}: mode controls, catalog interactions, and responsive layout`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(route.path);
    await expect(page.getByRole('heading', { name: route.heading })).toBeVisible();
    const mode = page.locator(`#${route.modeId}`);
    await expect(mode).toHaveValue('rotw-ladder-34');
    await expect(page.getByText('확인됨').first()).toBeVisible();

    if (route.path === '/uniques') {
      await page.getByLabel('분류').selectOption('무기');
      await page.getByLabel('정렬').selectOption('level');
      await expect(page.getByRole('status')).toContainText('무기');
      const search = page.getByPlaceholder(/한글·영문 이름/);
      await search.fill("Dimoak's Hew");
      const card = page.locator('article').filter({ hasText: "Dimoak's Hew" });
      await expect(card).toContainText('피해 +100~150%');
      await mode.selectOption('rotw-ladder-33');
      await expect(card).toContainText('피해 +100%');
      await expect(card).not.toContainText('피해 +100~150%');
      await mode.selectOption('rotw-ladder-34');
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
      await mode.selectOption('rotw-nonladder-34');
      await expect(page.locator('article').filter({ hasText: 'Bloodletter' })).toContainText('패치 3.4부터');
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
      await mode.selectOption('rotw-nonladder-34');
      await expect(card).toContainText('RotW 3.3 기준');
      await search.fill('Angelic Raiment');
      const angelic = page.locator('article').filter({ hasText: 'Angelic Raiment' });
      await mode.selectOption('rotw-nonladder-34');
      await expect(angelic).toContainText('3.4 패치부터');
      await mode.selectOption('rotw-offline-34');
      await expect(angelic).toContainText('검토 필요');
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
      await mode.selectOption('rotw-nonladder-34');
      await page.getByRole('button', { name: '전체 초기화' }).click();
      await search.fill('Mania');
      const mania = page.locator('article').filter({ hasText: 'Mania' });
      await expect(mania).toContainText('검토 필요');
      await expect(mania).toContainText('옵션을 적용하지 않습니다');
      await expect(mania.getByText(/타격 시 5% 확률로 1 레벨 폭발적인 속도 시전/)).toBeHidden();
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `${route.path} horizontal overflow`).toBe(false);
    expect(errors, `${route.path} browser errors`).toEqual([]);
  });
}
