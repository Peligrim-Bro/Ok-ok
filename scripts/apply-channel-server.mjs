import {readFileSync,writeFileSync,mkdirSync,copyFileSync,statSync} from 'node:fs';
const path='wrangler-telegram.json';
const config=JSON.parse(readFileSync(path,'utf8'));
config.durable_objects.bindings.push({name:'CHANNEL_PUBLISHER',class_name:'ChannelPublisher'});
config.migrations.push({tag:'okok-channel-v1',new_sqlite_classes:['ChannelPublisher']});
config.triggers={...config.triggers,crons:[...new Set([...(config.triggers?.crons||[]),'*/15 * * * *'])]};
writeFileSync(path,JSON.stringify(config,null,2)+'\n');
console.log('Telegram channel: isolated, owner-enabled reviewed queue; payments preserved.');

// Reviewed comic assets: retained under versioned filenames, outside the UI.
import {POSTS} from '../channel-posts.mjs';
mkdirSync('site/public/assets/channel',{recursive:true});
for(const post of POSTS.filter(p=>p.photo)){
 const name=new URL(post.photo).pathname.split('/').pop();
 // Keep episode one as the public style reference; expired later episodes
 // remain archived in Git, while Telegram keeps their uploaded media.
 if(Date.parse(post.expiresAt)<=Date.now() && name!=='oki-comic-001-super-soup.jpg')continue;
 const source='channel-media/'+name;
 if(statSync(source).size>10000000)throw Error('Telegram photo exceeds 10 MB');
 copyFileSync(source,'site/public/assets/channel/'+name);
}
