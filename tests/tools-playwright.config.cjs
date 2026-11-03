const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'.',testMatch:'tools-browser.spec.mjs',timeout:20000,workers:1,reporter:'list',use:{browserName:'chromium',viewport:{width:390,height:844},launchOptions:{args:['--no-sandbox']}}});
