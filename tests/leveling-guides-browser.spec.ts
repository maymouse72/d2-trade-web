import { expect, test } from '@playwright/test';

test('profession leveling guide directory and articles render without layout or console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/game-info/leveling-guides');
  await expect(page.getByRole('heading', { name: '직업별 맨땅 공략집' })).toBeVisible();
  await expect(page.getByRole('link', { name: /원소술사/ })).toHaveAttribute('href', '/game-info/leveling-guides/sorceress');
  await expect(page.getByRole('link', { name: /성기사/ })).toHaveAttribute('href', '/game-info/leveling-guides/paladin');
  await expect(page.getByText('준비 중')).toHaveCount(6);
  await expect(page.getByRole('navigation', { name: '게임 정보 메뉴' })).toContainText('직업별 맨땅 공략집');

  const pageWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);

  await page.goto('/game-info/leveling-guides/sorceress');
  await expect(page.getByRole('heading', { name: '원소술사 맨땅 육성 공략' })).toBeVisible();
  await expect(page.locator('article')).toContainText('총 43포인트');
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
