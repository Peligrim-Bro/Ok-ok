const {test,expect}=require('@playwright/test');
const captions={ru:['Перейти к оплате','Проверить по TXID','Сумма перевода не совпадает'],en:['Continue to payment','Check by TXID','Transfer amount does not match'],th:['ไปชำระเงิน','ตรวจด้วย TXID','ยอดโอนไม่ตรง']};
async function prepare(page,lang,legacy=false,theme='dark'){
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});
 await page.addInitScript(({lang,legacy})=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');if(legacy)localStorage.setItem('ok-ad-order',JSON.stringify({id:'1234567890',token:'test-token'}));},{lang,legacy});
 const now=Date.now();let paid=false;
 const order={id:'1234567890',token:'test-token',amount:legacy===true?'15.00':'15.37',address:'TOfflineTestWalletNotForPayment',network:'TRC20',coin:'USDT',hours:24,title:'Cafe test',text:'Fresh breakfast and coffee every morning',label:'@cafetest',createdAt:now,graceEnd:now+86400000,startsAt:now,views:0,clicks:0};
 await page.route('**/api/ads/**',async route=>{
  const action=new URL(route.request().url()).pathname.split('/').pop();let body;
  if(action==='list')body={slots:3,price:'15.00',minAmount:'15.01',maxAmount:'15.99',hours:24,ads:[],free:3,t:now};
  else if(action==='create')body=order;
  else if(action==='status')body={...order,status:paid?'live':'pending',startAt:now,endAt:now+86400000};
  else if(action==='txid')body={...order,status:'pending',result:{ok:false,code:'tx_amount'}};
  else body={ok:true};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#okAds .okad.free')).toHaveCount(1);
 await expect(page.locator('#okAds .okad.free')).toBeVisible();
 await expect(page.locator('#okAds')).not.toContainText(/USDT|Платн|Paid|เสียเงิน/);
 await expect(page.locator('#okAds .okad-example, #okAds .okad-event, #okAds > .btn.call')).toHaveCount(0);
 if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
 const invitation=page.locator('#okAds .okad.free');
 await expect(invitation).toContainText({ru:'Объявление, поздравление или просто привет.',en:'An announcement, a celebration, or just a hello.',th:'ประกาศ คำอวยพร หรือแค่ทักทายกัน'}[lang]);
 await expect(invitation).not.toContainText(/бизнес|своём деле|business|ธุรกิจ/i);
 expect(await invitation.evaluate(n=>getComputedStyle(n).display)).toBe('grid');
 await invitation.screenshot({path:`quality-reports/invitation-${lang}-${theme}.png`});
 await page.setViewportSize({width:320,height:568});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await invitation.screenshot({path:`quality-reports/invitation-small-${lang}-${theme}.png`});
 await page.setViewportSize({width:390,height:844});
 await invitation.click();
 return {paid:()=>{paid=true}};
}
for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])test(`invoice and exact-payment explanation ${lang} ${theme}`,async({page})=>{
 await prepare(page,lang,false,theme);
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 const dlg=page.locator('#okAdDialog');
 await expect(dlg).toContainText('15.01–15.99 USDT');
 await dlg.locator('input[maxlength="40"]').fill('Cafe test');await dlg.locator('textarea').fill('Fresh breakfast and coffee every morning');await dlg.locator('input[maxlength="200"]').fill('@cafetest');await dlg.locator('input[type="checkbox"]').check();
 await dlg.getByRole('button',{name:new RegExp(captions[lang][0])}).click();
 await expect(dlg.locator('.okad-amount')).toHaveText('15.37 USDT');
 await expect(dlg).not.toContainText('if the amount is not below');
 await page.screenshot({path:`quality-reports/payment-${lang}-${theme}.png`});
 await dlg.locator('details summary').click();await dlg.locator('input[placeholder="TXID (64)"]').fill('a'.repeat(64));await dlg.getByRole('button',{name:captions[lang][1],exact:true}).click();
 await expect(dlg).toContainText(captions[lang][2]);
 await dlg.evaluate(el=>el.scrollTop=el.scrollHeight);await expect(dlg.locator('.okad-x')).toBeVisible();await dlg.locator('.okad-x').click();await expect(dlg).not.toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('a legacy fixed-price invoice offers reconciliation instead of another transfer',async({page})=>{
 await prepare(page,'ru',true);const dlg=page.locator('#okAdDialog');await expect(dlg).toContainText('Старый счёт');await expect(dlg).toContainText('не платите повторно');await expect(dlg.locator('.okad-amount')).toHaveCount(0);await expect(dlg.locator('a[href="https://t.me/Khan_Timur"]')).toBeVisible();await page.screenshot({path:'quality-reports/payment-legacy.png'});
});
test('a pending invoice changes to published after automatic status matching',async({page})=>{
 const control=await prepare(page,'en','current');
 await expect(page.locator('#okAdDialog .okad-amount')).toHaveText('15.37 USDT');
 control.paid();await expect(page.locator('#okAdDialog')).toContainText('Your ad is live',{timeout:12000});
});
