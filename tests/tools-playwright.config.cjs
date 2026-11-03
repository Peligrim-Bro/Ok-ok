const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'.',testMatch:'tools-browser.spec.mjs',timeout:30000,workers:1,reporter:'list',
 projects:[
  {name:'chromium-mobile',use:{browserName:'chromium',viewport:{width:390,height:844},launchOptions:{args:['--no-sandbox']}}},
  {name:'webkit-mobile',use:{browserName:'webkit',viewport:{width:390,height:844},isMobile:true,hasTouch:true}}
 ]
});
