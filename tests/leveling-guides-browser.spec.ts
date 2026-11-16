import { expect, test } from '@playwright/test';

test('profession leveling guide directory and articles render without layout or console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/game-info/leveling-guides');
  await expect(page.getByRole('heading', { name: '직업별 맨땅 공략집' })).toBeVisible();
  await expect(page.getByRole('link', { name: /원소술사/ })).toHaveAttribute('href', '/game-info/leveling-guides/sorceress');
  await expect(page.getByRole('link', { name: /성기사/ })).toHaveAttribute('href', '/game-info/leveling-guides/paladin');
  await expect(page.getByText('준비 중')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /야만용사/ })).toHaveAttribute('href', '/game-info/leveling-guides/barbarian');
  await expect(page.getByRole('link', { name: /악마술사/ })).toHaveAttribute('href', '/game-info/leveling-guides/warlock');
  await expect(page.getByRole('navigation', { name: '게임 정보 메뉴' })).toContainText('직업별 맨땅 공략집');

  const pageWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);

  await page.goto('/game-info/leveling-guides/sorceress');
  await expect(page.getByRole('heading', { name: '원소술사 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('17 + 23 + 3 = 43포인트');
  await expect(page.locator('article')).toContainText('FCR 63%');
  await expect(page.locator('table').first()).toBeVisible();
  const sorceressWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(sorceressWidth.content).toBeLessThanOrEqual(sorceressWidth.viewport);

  await page.goto('/game-info/leveling-guides/paladin');
  await expect(page.getByRole('heading', { name: '성기사 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('총합: 24 + 15 + 4 = 43포인트');
  await expect(page.locator('article')).toContainText('집중 오라');
  await expect(page.getByText('Codex 개발 작업 지시', { exact: false })).toHaveCount(0);
  const paladinWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(paladinWidth.content).toBeLessThanOrEqual(paladinWidth.viewport);
  expect(errors).toEqual([]);
});

test('Amazon and Druid guides are searchable, linked, complete, and mobile-safe', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/game-info/leveling-guides');
  await page.getByRole('searchbox', { name: '직업 검색' }).fill('자벨마');
  await expect(page.getByRole('link', { name: /아마존/ })).toHaveAttribute('href', '/game-info/leveling-guides/amazon');
  await expect(page.getByRole('link', { name: /드루이드/ })).toHaveCount(0);

  await page.goto('/game-info/leveling-guides/amazon');
  await expect(page.getByRole('heading', { name: '아마존 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('맹독 투창');
  await expect(page.locator('article')).toContainText('합계');
  await expect(page.locator('article')).toContainText('96');
  await expect(page.locator('article a[href="/runewords#runeword-70"]')).toHaveText('잠행 룬워드 도감');
  await page.getByText('목차 보기').click();
  await page.getByRole('link', { name: /7\. 레벨 41~85/ }).click();
  await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe('#7-레벨-41-85-투자-순서');

  await page.goto('/game-info/leveling-guides/druid');
  await expect(page.getByRole('heading', { name: '드루이드 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('까마귀');
  await expect(page.locator('article')).toContainText('FCR');
  await expect(page.locator('article')).toContainText('68%');
  await expect(page.locator('article a[href="/runewords#runeword-69"]')).toHaveText('잎새 룬워드 도감');
  await page.getByRole('checkbox').first().check();
  await expect(page.getByRole('status').filter({ hasText: '완료 1 /' })).toBeVisible();

  const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(width.content).toBeLessThanOrEqual(width.viewport);
  expect(errors).toEqual([]);

  await page.getByRole('link', { name: '← 직업별 공략 목록' }).click();
  await expect(page.getByRole('heading', { name: '직업별 맨땅 공략집' })).toBeVisible();
});

test('necromancer and assassin guides expose searchable pages, verified skills, checklists, and runeword links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/game-info/leveling-guides');
  await page.getByRole('searchbox', { name: '직업 검색' }).fill('조폭넥');
  await expect(page.getByRole('link', { name: /강령술사/ })).toHaveAttribute('href', '/game-info/leveling-guides/necromancer');
  await expect(page.getByRole('link', { name: /암살자/ })).toHaveCount(0);

  await page.goto('/game-info/leveling-guides/necromancer');
  await expect(page.getByRole('heading', { name: '강령술사 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('70~120%');
  await expect(page.locator('article')).toContainText('총합');
  await expect(page.locator('article')).not.toContainText('검증 요구');
  const necroChecklist = page.getByRole('checkbox').first();
  await necroChecklist.check();
  await expect(page.getByRole('status').filter({ hasText: '완료 1 /' })).toBeVisible();
  await expect(page.locator('article')).not.toContainText('Codex 개발 작업 지시');

  await page.goto('/game-info/leveling-guides/assassin');
  await expect(page.getByRole('heading', { name: '암살자 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('레벨 40에는 최대 17포인트');
  await expect(page.locator('article')).not.toContainText('검증 요구');
  await expect(page.getByRole('row').filter({ hasText: '번개 파수기' }).last()).toContainText('20');
  await expect(page.locator('article')).not.toContainText('`n| 85');
  await expect(page.locator('article a[href="/runewords#runeword-69"]')).toHaveText('잎새 룬워드 도감');
  await page.getByRole('checkbox').first().check();
  await expect(page.getByRole('status').filter({ hasText: '완료 1 /' })).toBeVisible();
  await page.getByText('목차 보기').click();
  await page.getByRole('link', { name: /6\. 첫 스킬 초기화/ }).click();
  await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe('#6-첫-스킬-초기화-레벨-40');

  const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(width.content).toBeLessThanOrEqual(width.viewport);
  expect(errors).toEqual([]);
});

test('guide runeword deep links identify the corresponding catalog card', async ({ page }) => {
  await page.goto('/runewords#runeword-69');
  await expect(page.locator('#runeword-69')).toBeVisible();
});

test('Barbarian and Warlock guides include verified builds, portraits, and shared mobility tip', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/game-info/leveling-guides');
  await page.getByRole('searchbox', { name: '직업 검색' }).fill('싱어 바바');
  await expect(page.getByRole('link', { name: /야만용사/ })).toHaveAttribute('href', '/game-info/leveling-guides/barbarian');
  await page.getByRole('searchbox', { name: '직업 검색' }).fill('워록');
  await expect(page.getByRole('link', { name: /악마술사/ })).toHaveAttribute('href', '/game-info/leveling-guides/warlock');

  await page.goto('/game-info/leveling-guides/barbarian');
  await expect(page.getByRole('heading', { name: '야만용사 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('이중 타격');
  await expect(page.locator('article')).toContainText('전장의 함성');
  await expect(page.locator('article')).toContainText('물리 면역');
  await expect(page.locator('article')).toContainText('총합');
  await expect(page.locator('article')).toContainText('43');
  await expect(page.getByRole('heading', { name: '순간이동 충전 지팡이 구매' })).toBeVisible();
  await expect(page.locator('header img')).toBeVisible();
  expect(await page.locator('header img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  await page.goto('/game-info/leveling-guides/warlock');
  await expect(page.getByRole('heading', { name: '악마술사 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('독기 볼트');
  await expect(page.locator('article')).toContainText('독기 사슬');
  await expect(page.locator('article')).toContainText('심연');
  await expect(page.locator('article')).toContainText('종말');
  await expect(page.locator('article')).toContainText('총합');
  await expect(page.locator('article')).toContainText('96');
  await expect(page.getByRole('heading', { name: '순간이동 충전 지팡이 구매' })).toBeVisible();
  await expect(page.locator('header img')).toBeVisible();
  expect(await page.locator('header img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByText('목차 보기').click();
  await page.getByRole('link', { name: /7\. 레벨 41~85/ }).click();
  await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toContain('85');

  const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(width.content).toBeLessThanOrEqual(width.viewport);
  expect(errors).toEqual([]);
});

test('shared Ormus teleport tip appears on every non-Sorceress guide and never on Sorceress', async ({ page }) => {
  await page.goto('/game-info/leveling-guides/sorceress');
  await expect(page.getByRole('heading', { name: '순간이동 충전 지팡이 구매' })).toHaveCount(0);

  for (const job of ['paladin', 'necromancer', 'assassin', 'amazon', 'druid', 'barbarian', 'warlock']) {
    await page.goto(`/game-info/leveling-guides/${job}`);
    await expect(page.getByRole('heading', { name: '순간이동 충전 지팡이 구매' })).toBeVisible();
    const tip = page.getByRole('complementary', { name: '순간이동 충전 지팡이 구매' });
    await expect(tip).toContainText('레벨 19~23');
    await expect(tip).toContainText('오르무스');
  }
});

test('all eight class portraits load on desktop and mobile layouts', async ({ page }) => {
  for (const job of ['sorceress', 'paladin', 'necromancer', 'assassin', 'amazon', 'druid', 'barbarian', 'warlock']) {
    await page.goto(`/game-info/leveling-guides/${job}`);
    const image = page.locator('header img');
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    const dimensions = await image.evaluate((element: HTMLImageElement) => ({ naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight }));
    expect(dimensions.naturalWidth).toBeGreaterThan(0);
    expect(dimensions.naturalHeight).toBeGreaterThan(0);
    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(width.content).toBeLessThanOrEqual(width.viewport);
  }
});
