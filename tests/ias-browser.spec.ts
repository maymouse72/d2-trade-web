import { expect, test } from "@playwright/test";

test("localized weapon selector, Fanaticism outputs, and console", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", error => pageErrors.push(error.message));

    await page.goto("/game-info/ias-calculator");
    await expect(page.getByRole("heading", { name: "디아블로2 레저렉션 공속 계산기" })).toBeVisible();
    const weapon = page.locator("#ias-weapon");
    await expect(weapon.locator("option")).toHaveCount(297);
    await expect(page.getByRole("option", { name: "검", exact: true })).toHaveCount(1);

    const search = page.locator("#ias-weapon-search");
    await search.fill("크리스탈 소드");
    await expect(weapon.locator("option")).toHaveCount(1);
    await expect(weapon.locator("option")).toContainText("crs");
    await search.fill("phase blade");
    await expect(weapon.locator("option").filter({ hasText: "7cr" })).toHaveCount(1);
    await search.fill("");

    const resultValue = page.getByRole("region", { name: "계산 결과" }).locator("strong");
    await page.locator("#fanaticism-level").selectOption("20");
    await expect(resultValue).toBeVisible();
    const fanaticismFrames = await resultValue.innerText();
    await page.locator("#fanaticism-level").selectOption("0");
    const baselineFrames = await resultValue.innerText();
    expect(fanaticismFrames).not.toBe(baselineFrames);

    await page.locator("#ias-skill").selectOption("ZEAL");
    await page.locator("#fanaticism-level").selectOption("20");
    await expect(resultValue).toBeVisible();
    await page.locator("#ias-skill").selectOption("SMITE");
    await expect(resultValue).toBeVisible();

    const supportState = page.locator("#ias-weapon-support");
    await expect(supportState.locator("option")).toHaveCount(5);
    await page.locator("#ias-class").selectOption("AMAZON");
    await supportState.selectOption("UNSUPPORTED");
    await expect(weapon.locator("option").first()).toContainText("지원 불가");
    await expect(resultValue).toHaveCount(0);

    await page.locator("#ias-class").selectOption("BARBARIAN");
    await supportState.selectOption("ALL");
    await expect(page.locator("#fanaticism-level")).toHaveCount(0);
    await expect(page.locator("#ias-skill")).toHaveValue("BARBARIAN_NORMAL_ATTACK");
    await expect(page.locator("#ias-weapon option:checked")).toContainText("crs");
    await expect(resultValue).toHaveText("15");
    await page.locator("summary").filter({ hasText: "일반 공격 A1/A2 애니메이션 진단" }).click();
    await page.locator("#ias-animation").selectOption("A2");
    await expect(resultValue).toHaveCount(0);
    await page.locator("#ias-animation").selectOption("A1");
    await expect(resultValue).toHaveText("15");
    await page.locator("#weapon-ias").fill("9");
    await expect(resultValue).toHaveText("14");
    await page.locator("#ias-weapon").selectOption("lsd");
    await expect(resultValue).toHaveText("14");
    await expect(page.getByRole("rowheader").first()).toBeVisible();
    await page.locator("#ias-weapon").selectOption("mpi");
    await expect(resultValue).toHaveText("14");
    await page.locator("#ias-weapon").selectOption("7cr");
    await expect(resultValue).toHaveText("12");
    await page.locator("#weapon-ias").fill("5");
    await expect(resultValue).toHaveText("11");
    await page.locator("#ias-weapon").selectOption("whm");
    await expect(resultValue).toHaveText("20");
    await page.locator("#weapon-ias").fill("250");
    await expect(resultValue).toHaveText("9");
    await page.locator("#ias-weapon-search").fill("phase blade");
    await page.locator("#ias-weapon-search").fill("hand axe");
    await page.locator("#ias-weapon").selectOption("hax");
    await expect(resultValue).toHaveCount(0);
    await page.locator("#ias-class").selectOption("PALADIN");
    await expect(page.locator("#ias-skill")).toHaveValue("NORMAL_ATTACK");
    await expect(page.locator("#fanaticism-level")).toHaveValue("0");

    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
});
