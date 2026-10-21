// Offline editorial readiness, deliberately separate from runtime delivery evidence.
import {createHash} from 'node:crypto';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {POSTS,CHANNEL} from '../channel-posts.mjs';
import {validatePosts} from '../channel-publisher.mjs';

export function auditQueue(posts, now=Date.now(), readImage) {
  validatePosts(posts);
  const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const midnight=Date.parse(localDate+'T00:00:00+07:00');
  const future=posts.filter(p=>p.approved&&Date.parse(p.publishAt)>now);
  const missingSlots=[],collisions=[],missingImages=[],imageFilesMissing=[],imageDuplicates=[];
  for(let day=0;day<7;day++)for(const [hour,minute] of [[9,0],[14,0],[19,30],[20,30]]){
    const at=midnight+day*86400000+hour*3600000+minute*60000;
    if(at<=now)continue;
    const occupants=posts.filter(p=>p.approved&&Date.parse(p.publishAt)===at);
    if(!occupants.length)missingSlots.push(new Date(at).toISOString());
    if(occupants.length>1)collisions.push({at:new Date(at).toISOString(),ids:occupants.map(p=>p.id)});
  }
  for(const p of future)if(!p.photo)missingImages.push(p.id);
  const hashes=new Map();
  for(const p of posts.filter(p=>p.photo)){
    const bytes=readImage?.(p);
    if(!bytes){if(future.includes(p))imageFilesMissing.push(p.id);continue;}
    const digest=createHash('sha256').update(bytes).digest('hex');
    if(hashes.has(digest))imageDuplicates.push({ids:[hashes.get(digest),p.id],sha256:digest});
    else hashes.set(digest,p.id);
  }
  return {checkedAt:new Date(now).toISOString(),timeZone:'Asia/Bangkok',channel:CHANNEL,
    futurePosts:future.length,futurePhotos:future.filter(p=>p.photo).length,
    missingSlots,collisions,missingImages,imageFilesMissing,imageDuplicates,
    ready:![missingSlots,collisions,missingImages,imageFilesMissing,imageDuplicates].some(x=>x.length),
    delivery:{enabled:'unknown',chatId:'unknown',confirmedMessages:'unknown'},
    limits:['Source hashes detect identical files; crops/edits need original-source provenance and visual review.',
      'Approved queue entries and available images do not prove delivery or runtime enablement.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const index=process.argv.indexOf('--at');
  const now=index<0?Date.now():Date.parse(process.argv[index+1]);
  if(!Number.isFinite(now))throw Error('Invalid audit time');
  const report=auditQueue(POSTS,now,p=>{
    const path='channel-media/'+new URL(p.photo).pathname.split('/').pop();
    return existsSync(path)?readFileSync(path):null;
  });
  mkdirSync('quality-reports',{recursive:true});
  writeFileSync('quality-reports/channel-readiness.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  if(!report.ready)process.exitCode=1;
}
