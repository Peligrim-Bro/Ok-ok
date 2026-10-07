const {test,expect}=require('@playwright/test');
test('home filter choices survive folding, catalogue and city navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 await page.goto('/');await page.locator('#installClose').click();
 await page.locator('#homeFiltersToggle').click();
 await expect(page.locator('#filters')).toBeVisible();
 const category=page.locator('#filters [data-cat]').first();
 const value=await category.getAttribute('data-cat');await category.click();
 await expect(page.locator('#filters [data-cat="'+value+'"]').first()).toHaveClass(/on/);
 await expect(page.locator('#homeFilters')).toHaveAttribute('open');
 await page.locator('#homeFiltersToggle').click();await expect(page.locator('#filters')).not.toBeVisible();
 await page.locator('#homeFiltersToggle').press('Enter');await expect(page.locator('#filters')).toBeVisible();
 await page.locator('nav.tab [data-tab="list"]').click();await expect(page.locator('#filters')).toBeVisible();
 await page.locator('nav.tab [data-tab="home"]').click();await expect(page.locator('#filters')).not.toBeVisible();
 await page.locator('#homeFiltersToggle').click();await expect(page.locator('#filters [data-cat="'+value+'"]').first()).toHaveClass(/on/);
 await page.locator('#cityPicker [data-city="phuket"]').click();await expect(page.locator('#homeFilters')).not.toBeVisible();
 await page.locator('#cityPicker [data-city="pattaya"]').click();await expect(page.locator('#homeFiltersToggle')).toBeVisible();
});
