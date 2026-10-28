const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'tests',testMatch:'oki-house.spec.cjs',timeout:30000,
 use:{baseURL:'http://127.0.0.1:4173',hasTouch:true,isMobile:true,trace:'retain-on-failure'},
 projects:[{name:'house-chromium',use:{browserName:'chromium',launchOptions:{args:['--no-sandbox']}}},{name:'house-webkit',use:{browserName:'webkit'}}],
 webServer:{command:'node scripts/serve-quality.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
 reporter:[['list'],['html',{outputFolder:'playwright-house-report',open:'never'}]]
});
