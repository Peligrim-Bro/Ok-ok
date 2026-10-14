import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const queue = JSON.parse(readFileSync('content-pipeline/drafts.json','utf8'));
if (queue.publishing_enabled !== false) throw new Error('Publishing must remain disabled');
const today = new Date().toISOString().slice(0,10);
const dir = 'content-pipeline/generated';
mkdirSync(dir,{recursive:true});
const lines = ['# Editorial drafts — '+today,'','STATUS: DRAFT ONLY. No publication or deployment.',''];
for (const item of queue.items) {
  if (item.status !== 'idea') continue;
  lines.push('## '+item.id+' — '+item.topic,'','Channel: '+item.channel,'');
  if(item.channel === 'ok-ok'){
    lines.push('Working angle: practical Pattaya travel advice.','Source check: REQUIRED before factual claims.','Call to action: https://ok-ok.click');
  } else {
    lines.push('Working angle: a practical checklist for business owners.','Offer reference: website launch from $199; scope must be confirmed.');
  }
  if(item.requires_visual_reference) lines.push('VIDEO GATE: approved Oki reference required; English text only; visible ok-ok.click.');
  lines.push('','Draft outline:','- Opening: explain the reader problem without unsupported claims.','- Body: add verified specifics and sources before publication.','- Ending: invite readers to check details.','','Approval: pending','','---','');
}
writeFileSync(dir+'/latest.md',lines.join('\n')+'\n');
console.log('Generated draft-only editorial outline for '+today);
