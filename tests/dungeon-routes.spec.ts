import { expect, test } from '@playwright/test';
import routes from '../lib/dungeon-routes/routes.json';

test('액트별 길찾기, 도식 및 게임 정보 메뉴', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/game-info');
  await page.getByRole('link', {name:'던전 길찾기'}).click();
  await expect(page).toHaveURL(/dungeon-routes$/);
  expect(new Set(routes.map(r => r.id)).size).toBe(routes.length);
  for (const route of routes) {
    await page.getByRole('button', {name:'Act '+route.act}).click();
    await page.getByRole('button', {name:route.name+' · '+route.boss}).click();
    const article = page.locator('article').filter({has:page.getByRole('heading',{name:route.name+' · '+route.boss})});
    await expect(article).toBeVisible();
    expect(route.sources.every(url => url.startsWith('https://')) && route.sources.length > 0).toBeTruthy();
    const expected = {tower:['입구 타일','왼쪽 우선',4],catacombs:['웨이포인트 타일','오른쪽 우선',1],durance:['웨이포인트 타일','왼쪽 우선',1],worldstone:['웨이포인트 타일','오른쪽 우선',1]}[route.id]!;
    await expect(article.locator('strong')).toHaveText(expected[0]+' 기준 · '+expected[1]);
    await expect(article.locator('li').filter({hasText:'커뮤니티 요령'})).toHaveCount(Number(expected[2]));
    for (const segment of route.segments) {
      expect(segment.from && segment.to).toBeTruthy();
      if (segment.confidence === 'UNVERIFIED') {
        expect(segment.direction).toBe('UNKNOWN');
        await expect(article.locator('li').filter({hasText:segment.from+' → '+segment.to})).toContainText('확인 필요');
      }
    }
    const img = article.getByRole('img');
    await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const response = await page.request.get(route.diagram);
    expect(response.ok()).toBeTruthy();
    expect(await page.evaluate(xml => {
      const doc = new DOMParser().parseFromString(xml,'image/svg+xml');
      return !doc.querySelector('parsererror') && ['svg[viewBox]','title','desc','#start','#target','path'].every(s => doc.querySelector(s));
    }, await response.text())).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const boxes = await page.locator('section button').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().toJSON()));
    for (const [i,a] of boxes.entries()) for (const b of boxes.slice(i+1)) {
      expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top).toBeTruthy();
    }
    if (route.id === 'tower') await page.screenshot({path:testInfo.outputPath('tower.png'),fullPage:true});
  }
  for (const act of [2,4]) {
    await page.getByRole('button',{name:'Act '+act}).click();
    await expect(page.getByText('해당 액트의 길찾기 정보는 추후 추가될 예정입니다.')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('기존 거래소와 도감 화면', async ({page}) => {
  for (const [path,label] of [['/','내 매물 등록'],['/runewords','룬워드 도감'],['/uniques','유니크 도감'],['/sets','세트 도감']]) {
    expect((await page.goto(path))?.ok()).toBeTruthy();
    await expect(page.getByText(label,{exact:true}).first()).toBeVisible();
  }
});
