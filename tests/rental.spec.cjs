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
        await page.addInitScript(
          ({ lang, theme }) => {
            localStorage.setItem("okok_lang", lang);
            localStorage.setItem("okok_rental_theme", theme);
          },
          { lang, theme },
        );
        await page.goto("/rental.html");
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await page.locator("#compare").click();
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
