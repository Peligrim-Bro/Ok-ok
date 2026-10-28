// Compatibility entry point for the existing Cloudflare Preview deploy command.
// This branch contains the Oki House preview, not the archived portal experiment.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve,relative} from 'node:path';

export const HOUSE_BRANCH='feature/oki-house-prototype-20261028';
const ACCOUNT='0e2b94a71684b818b68119ad0bf5ae51';
export function prepareHousePreview(root=process.cwd()){
 const html=readFileSync(resolve(root,'site/public/oki-house.html'),'utf8');
 if(!html.includes('okok-oki-house-v2')||!html.includes('<title>Дом Оки'))throw Error('house_preview_build_required');
 const directory=resolve(root,'.oki-house-preview');
 mkdirSync(resolve(directory,'public'),{recursive:true});
 for(const name of ['oki-house.html','oki-game.svg'])copyFileSync(resolve(root,'site/public',name),resolve(directory,'public',name));
 const config={name:'ok-ok',main:'../scripts/oki-house-preview-worker.mjs',compatibility_date:'2026-10-02',
  assets:{directory:'./public',binding:'ASSETS',run_worker_first:true,html_handling:'none'},previews:{}};
 const configPath=resolve(directory,'wrangler.json');
 writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
 return relative(root,configPath);
}
export function runHousePreview({env=process.env,prepare=prepareHousePreview,run=spawnSync,write=console.log}={}){
 const emit=result=>write('OKI_HOUSE_PREVIEW '+result);
 if(env.WORKERS_CI!=='1'||env.WORKERS_CI_BRANCH!==HOUSE_BRANCH){emit('refused_non_preview_branch');return 1;}
 if(env.CLOUDFLARE_ACCOUNT_ID&&env.CLOUDFLARE_ACCOUNT_ID!==ACCOUNT){emit('refused_unexpected_account');return 1;}
 // Use the credential selected in Workers Builds. The archived portal secret
 // must never override it for this game branch.
 const token=env.CLOUDFLARE_API_TOKEN;
 if(typeof token!=='string'||!token||token.trim()!==token||/[\r\n]/.test(token)){emit('preview_credential_unavailable');return 1;}
 try{
  const configPath=prepare();
  emit('using_workers_builds_credential');
  emit('starting_static_game_preview');
  const result=run('npx',['--yes','wrangler@4.151.3','preview','--config',configPath],
   {stdio:'inherit',env:{...env,CLOUDFLARE_ACCOUNT_ID:ACCOUNT}});
  return Number.isInteger(result.status)?result.status:1;
 }catch{emit('failed_no_secret_details');return 1;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)process.exitCode=runHousePreview();
