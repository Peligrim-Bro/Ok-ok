const BUSINESS_DATA=__BUSINESS_REPORTS__;
__RESOURCE_CHECK_HELPERS__
const checkToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const checkDate=value=>new Intl.DateTimeFormat(lang,{calendar:'gregory',timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value+'T00:00:00Z'));
function checkEl(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function checkLink(text,url){const a=checkEl('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function updateCheckLabels(){
 $('check-input').placeholder=t('checkPlaceholder');
 $('check-coverage').textContent=t('checkCoverage')+' · '+BUSINESS_DATA.records.length;
 document.querySelectorAll('#check [data-t]').forEach(e=>e.textContent=t(e.dataset.t));
}
function renderCheck(){
 updateCheckLabels();
 const id=location.hash.startsWith('#check/')?location.hash.slice(7):'';
 const r=BUSINESS_DATA.records.find(r=>r.id===id);
 $('check-report').hidden=!r;$('check-search').hidden=!!r;
 if(id&&!r){$('check-status').textContent=t('checkMissing');$('check-results').replaceChildren();return;}
 if(r){renderBusinessReport(r);return;}
 if($('check-input').value.trim())searchBusinesses();
}
function searchBusinesses(){
 const input=$('check-input').value.trim();const found=findBusinesses(BUSINESS_DATA.records,input);
 $('check-results').replaceChildren();
 if(!input){$('check-status').textContent=t('checkEmpty');return;}
 if(found.invalid){$('check-status').textContent=t('checkInvalid');return;}
 if(!found.records.length){
  $('check-status').textContent=t('checkMissing');
  const box=checkEl('div',undefined,'panel');box.append(checkEl('p',t('checkUnknown')));
  const q=input+' Pattaya';box.append(checkLink(t('checkMaps'),'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q)),checkEl('span',' · '),checkLink(t('checkWeb'),'https://www.google.com/search?q='+encodeURIComponent(q)));
  $('check-results').append(box);return;
 }
 $('check-status').textContent=t('checkChoose')+' · '+found.records.length;
 for(const r of found.records){const a=checkEl('a',undefined,'panel business-match');a.href='#check/'+r.id;a.append(checkEl('strong',r.name),checkEl('small',t('checkPattaya')+' · '+t('checkCategory_'+r.category)),checkEl('span',t('checkOpen')+' →'));$('check-results').append(a);}
}
function renderBusinessReport(r){
 const box=$('check-report');box.replaceChildren();
 const back=checkEl('a',t('checkBack'),'button');back.href='#check';
 const heading=checkEl('h2',r.name);heading.id='business-report-title';heading.tabIndex=-1;
 box.append(back,heading,checkEl('p',t('checkPattaya')+' · '+t('checkCategory_'+r.category),'muted'));
 const sourceDate=r.source.reviewed,age=reportAge(sourceDate,checkToday());
 box.append(checkEl('p',(!navigator.onLine?t('checkOffline')+' · ':'')+t('checkSourceDate')+': '+checkDate(sourceDate)+(age===null||age>30?' · '+t('checkStale'):''),'report-stamp'));
 box.append(checkEl('p',t('checkScope'),'notice'));
 const facts=checkEl('section',undefined,'panel');facts.append(checkEl('h3',t('checkFacts')),checkEl('p',l(r.fact)),checkLink(t(r.source.kind==='business'?'checkBusinessSource':'checkCatalogueSource'),r.source.url));
 if(r.licenceClaim){facts.append(checkEl('p',t('checkLicenceClaim')+(r.licenceClaim==='self-declared'?'':': '+r.licenceClaim),'muted'),checkEl('p',t('checkLicenceUnverified'),'fineprint'));}
 box.append(facts);
 if(r.attention){const attention=checkEl('section',undefined,'panel');attention.append(checkEl('h3',t('checkAttention')),checkEl('p',l(r.attention)),checkLink(t('checkBusinessSource'),r.source.url));box.append(attention);}
 const reviews=checkEl('section',undefined,'panel');reviews.append(checkEl('h3',t('checkReviews')));
 if(r.rating){reviews.append(checkEl('p',r.rating.value?'★ '+r.rating.value+' · '+r.rating.platform:t('checkNoRating')),checkEl('p',t('checkSnapshot')+': '+checkDate(r.rating.reviewed)+(reportAge(r.rating.reviewed,checkToday())>30?' · '+t('checkStale'):''),'muted'),checkLink(r.rating.platform,r.rating.url));}
 else reviews.append(checkEl('p',t('checkNoRating')));
 reviews.append(checkEl('p',t('checkReviewsLimit'),'fineprint'));box.append(reviews);
 const unknown=checkEl('section',undefined,'panel');unknown.append(checkEl('h3',t('checkNotChecked')));
 const list=checkEl('ul');for(const key of ['checkRegistry','checkComplaints',r.category==='schools'?'checkSchoolUnknown':r.category==='bikes'?'checkBikeUnknown':'checkVisaUnknown'])list.append(checkEl('li',t(key)));unknown.append(list);box.append(unknown);
 const ask=checkEl('section',undefined,'panel');ask.append(checkEl('h3',t('checkQuestions')));
 const phrase=checkEl('textarea');phrase.id='business-phrase';phrase.readOnly=true;phrase.rows=4;phrase.setAttribute('aria-label','English');
 // Phrase UI translations are shown separately; copy always uses the exact visible English.
 phrase.value=UI['checkPhrase_'+r.category].en;
 ask.append(phrase,checkEl('p',UI['checkPhrase_'+r.category][lang],'muted'));
 const copy=checkEl('button',t('checkCopy'));copy.id='business-copy';copy.type='button';const status=checkEl('p','');status.id='business-copy-status';status.setAttribute('role','status');
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(phrase.value);status.textContent=t('copied')}catch{status.textContent=t('checkCopyFallback');phrase.focus();phrase.select()}};
 ask.append(copy,status);box.append(ask);
 const share=checkEl('button',t('checkShare'));share.id='business-share';share.type='button';
 const shareStatus=checkEl('p','');shareStatus.id='business-share-status';shareStatus.setAttribute('role','status');
 const linkField=checkEl('textarea');linkField.id='business-share-link';linkField.readOnly=true;linkField.hidden=true;linkField.setAttribute('aria-label',t('manual'));
 share.onclick=async()=>{const u=new URL(location.href);u.search='?lang='+lang;u.hash='check/'+r.id;try{if(navigator.share){await navigator.share({title:r.name+' · OK-OK',url:u.href});return}}catch(e){if(e.name==='AbortError')return}try{await navigator.clipboard.writeText(u.href);shareStatus.textContent=t('copied')}catch{linkField.value=u.href;linkField.hidden=false;shareStatus.textContent=t('manual');linkField.focus();linkField.select()}};
 box.append(share,shareStatus,linkField);
}
$('check-form').onsubmit=e=>{e.preventDefault();searchBusinesses()};
$('tab-check').onclick=()=>{location.hash='check';show('check');renderCheck()};
$('language').addEventListener('change',()=>{if(location.hash.startsWith('#check'))renderCheck()});
window.addEventListener('online',()=>{if(location.hash.startsWith('#check'))renderCheck()});
window.addEventListener('offline',()=>{if(location.hash.startsWith('#check'))renderCheck()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&location.hash.startsWith('#check'))renderCheck()});
