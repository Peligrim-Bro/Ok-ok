import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const ACCOUNT='0e2b94a71684b818b68119ad0bf5ae51';
const BRANCH='experiment/portal-launch';
// Never log credentials, response bodies, API error messages or exception details.
export async function runPortalPreview({env=process.env,request=fetch,write=console.log,launch=()=>spawnSync('npx',['wrangler','preview'],{stdio:'inherit',env})}={}){
 const emit=record=>write('CF_DIAGNOSTIC '+JSON.stringify(record));
 if(env.WORKERS_CI!=='1'||env.WORKERS_CI_BRANCH!==BRANCH){emit({check:'branch_guard',result:'refused'});return 1;}
 const token=env.CLOUDFLARE_API_TOKEN;
 if(typeof token!=='string'||!token){emit({check:'credential',result:'not_available_in_preview_command'});return 1;}
 if(token.trim()!==token||/[\r\n]/.test(token)){emit({check:'credential',result:'unexpected_whitespace'});return 1;}
 if(env.CLOUDFLARE_ACCOUNT_ID&&env.CLOUDFLARE_ACCOUNT_ID!==ACCOUNT){emit({check:'account_guard',result:'unexpected_account'});return 1;}
 async function probe(check,path){
  try{
   const r=await request('https://api.cloudflare.com/client/v4'+path,{method:'GET',headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000),redirect:'error'});
   let body;try{body=await r.json();}catch{}
   const record={check,http:r.status,success:r.ok&&body?.success===true,codes:Array.isArray(body?.errors)?body.errors.map(e=>e.code).filter(Number.isFinite):[]};
   const retry=r.headers.get('retry-after');if(retry&&/^\d+$/.test(retry))record.retryAfterSeconds=Number(retry);
   const ray=r.headers.get('cf-ray');if(ray&&/^[a-z0-9-]{1,80}$/i.test(ray))record.ray=ray;
   if(check==='token_verify')record.tokenStatus=['active','disabled','expired'].includes(body?.result?.status)?body.result.status:'unknown';
   emit(record);return record;
  }catch{const record={check,result:'network_or_timeout',success:false};emit(record);return record;}
 }
 const verified=await probe('token_verify','/user/tokens/verify');
 if(!verified.success||verified.tokenStatus!=='active')return 1;
 const production=await probe('existing_worker_read','/accounts/'+ACCOUNT+'/workers/scripts/ok-ok/settings');
 if(!production.success)return 1;
 const preview=await probe('preview_api_read','/accounts/'+ACCOUNT+'/workers/workers/ok-ok');
 if(!preview.success)return 1;
 emit({check:'read_checks_complete',result:'starting_preview_only'});
 try{const result=await launch();return Number.isInteger(result?.status)?result.status:1;}catch{emit({check:'preview_process',result:'could_not_start'});return 1;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{process.exitCode=await runPortalPreview();}catch{console.error('CF_DIAGNOSTIC {"check":"diagnostic","result":"unexpected_failure"}');process.exitCode=1;}
}
