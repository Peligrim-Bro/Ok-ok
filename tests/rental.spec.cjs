const { test, expect } = require("@playwright/test");
test("rental calculation, independent apartments, validation, export and reload", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/rental.html");
  await expect(page.locator("#totals")).toContainText("36");
  await page.locator("#f-advance").fill("36000");
  await expect(page.locator("#totals")).toContainText("60");
  await page.locator("#tabB").click();
  await expect(page.locator("#f-rent")).toHaveValue("13000");
  await page.locator("#compare").click();
  await expect(page.locator("#comparisonBody")).toContainText("200");
  const download = page.waitForEvent("download");
  await page.locator("#export").click();
  expect((await download).suggestedFilename()).toBe("okok-rental.png");
  await expect(page.locator("#resultImage")).toBeVisible();
  await page.locator("#tabA").click();
  await page.locator("#f-rent").fill("-1");
  await expect(page.locator("#export")).toBeDisabled();
  await page.locator("#f-rent").fill("12000");
  await page.locator("summary").click();
  await page.locator("#f-powerUse").fill("");
  await expect(page.locator("#totals")).toContainText("Неполная");
  await page.reload();
  await page.locator("summary").click();
  await expect(page.locator("#f-powerUse")).toHaveValue("");
  expect(errors).toEqual([]);
});
for (const lang of ["ru", "en", "th"])
  for (const theme of ["dark", "light"])
    for (const [width, height] of [
      [390, 844],
      [844, 390],
      [768, 1024],
    ])
      test(`rental ${lang} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        // Viewport dimensions alone leave every env(safe-area-inset-*) at zero.
        // Override the browser's real env values, not a duplicate CSS rule.
        const insets = width === 390
          ? { top: 59, right: 0, bottom: 34, left: 0 }
          : width === 844
            ? { top: 0, right: 59, bottom: 21, left: 59 }
            : { top: 24, right: 0, bottom: 20, left: 0 };
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets });
        await page.addInitScript(
          ({ lang, theme }) => {
            localStorage.setItem("okok_lang", lang);
            localStorage.setItem("okok_rental_theme", theme);
          },
          { lang, theme },
        );
        await page.goto("/rental.html");
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        const home = await page.locator("#home").boundingBox();
        expect(home.y).toBeGreaterThanOrEqual(insets.top + 20);
        expect(home.x).toBeGreaterThanOrEqual(insets.left + 20);
        expect(home.height).toBeGreaterThanOrEqual(44);
        const language = await page.locator("#lang").boundingBox();
        expect(language.x + language.width).toBeLessThanOrEqual(width - insets.right - 20);
        await expect(page.locator("#home")).toBeInViewport();
        await page.locator("#compare").click();
        if (lang === "th") {
          const fonts = await page.evaluate(async () => { await document.fonts.load("16px OKOKThai", "คำนวณ"); return {family:getComputedStyle(document.documentElement).fontFamily, loaded:document.fonts.check("16px OKOKThai", "คำนวณ")}; });
          expect(fonts.family).toContain("OKOKThai");
          expect(fonts.loaded).toBeTruthy();
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBeTruthy();
        if (width === 390)
          await page.screenshot({
            path: `quality-reports/rental-${lang}-${theme}.png`,
            fullPage: true,
          });
      });

test("rental home remains reachable after rotation and returns home", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await cdp.send("Emulation.setSafeAreaInsetsOverride", {
    insets: { top: 59, right: 0, bottom: 34, left: 0 },
  });
  await page.goto("/rental.html");
  await page.locator("#export").scrollIntoViewIfNeeded();
  await page.setViewportSize({ width: 844, height: 390 });
  await cdp.send("Emulation.setSafeAreaInsetsOverride", {
    insets: { top: 0, right: 59, bottom: 21, left: 59 },
  });
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(async () => (await page.locator("#home").boundingBox()).x).toBeGreaterThanOrEqual(79);
  await page.screenshot({ path: "quality-reports/rental-safe-landscape.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await cdp.send("Emulation.setSafeAreaInsetsOverride", {
    insets: { top: 59, right: 0, bottom: 34, left: 0 },
  });
  await expect.poll(async () => (await page.locator("#home").boundingBox()).y).toBeGreaterThanOrEqual(79);
  await page.locator("#home").click();
  await expect(page).toHaveURL(/\/$/);
});
