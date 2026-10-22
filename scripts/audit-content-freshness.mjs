import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {Script} from 'node:vm';
const context={};new Script(readFileSync('content-freshness.js','utf8')).runInNewContext(context);
const {state,limits}=context.OKOK_FRESHNESS;
const index=process.argv.indexOf('--at');
const checkedAt=Date.now(),reference=index<0?checkedAt:Date.parse(process.argv[index+1]);
if(!Number.isFinite(reference))throw Error('Invalid freshness audit reference time');
const editorial=JSON.parse(readFileSync('content/editorial.json','utf8'));
const services=JSON.parse(readFileSync('content/services.json','utf8'));
const newsReviewed=editorial.news===null?null:editorial.verifiedAt;
const records=[{kind:'news',id:'digest',file:'content/editorial.json',reviewed:newsReviewed,...state('news',newsReviewed,reference)},
 ...services.providers.map(p=>({kind:'services',id:p.id,file:'content/services.json',reviewed:p.reviewed??services.reviewed,...state('services',p.reviewed??services.reviewed,reference)}))];
const report={checkedAt:new Date(checkedAt).toISOString(),referenceTime:new Date(reference).toISOString(),timeZone:'Asia/Bangkok',limits,records,
 due:records.filter(r=>r.status==='due').map(r=>r.id),unknown:records.filter(r=>r.status==='unknown').map(r=>r.id),
 limitation:'Offline age checks do not fetch sources, verify facts, update dates or prove future automation execution.'};
mkdirSync('quality-reports',{recursive:true});
writeFileSync('quality-reports/content-freshness.json',JSON.stringify(report,null,2)+'\n');
console.log('Content freshness: '+report.due.length+' due for review, '+report.unknown.length+' unconfirmed dates. Report: quality-reports/content-freshness.json');
