const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests',timeout:30000,workers:1,use:{baseURL:'http://127.0.0.1:4173',serviceWorkers:'allow',launchOptions:{args:['--no-sandbox']}},webServer:{command:'node scripts/serve-quality.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},reporter:[['list'],['html',{open:'never'}]]});
