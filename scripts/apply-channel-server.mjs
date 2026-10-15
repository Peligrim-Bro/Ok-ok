import {readFileSync,writeFileSync} from 'node:fs';
const path='wrangler-telegram.json';
const config=JSON.parse(readFileSync(path,'utf8'));
config.durable_objects.bindings.push({name:'CHANNEL_PUBLISHER',class_name:'ChannelPublisher'});
config.migrations.push({tag:'okok-channel-v1',new_sqlite_classes:['ChannelPublisher']});
config.triggers={...config.triggers,crons:[...new Set([...(config.triggers?.crons||[]),'*/15 * * * *'])]};
writeFileSync(path,JSON.stringify(config,null,2)+'\n');
console.log('Telegram channel: isolated, owner-enabled reviewed queue; payments preserved.');
