/* Curated discovery, not booking or a quality guarantee. No personal data in events. */
(()=>{
  const DATA=__SERVICE_DATA__;
  const $=id=>document.getElementById(id);
  const tr=(ru,en,th)=>document.documentElement.lang==='th'?th:document.documentElement.lang==='en'?en:ru;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let section='all',lastView='',screen='home',serviceOpener=null;
  const signal=(name,detail)=>window.dispatchEvent(new CustomEvent('okok:catalogue',{detail:{name,...detail}}));
  const attribution=()=>tr('При обращении скажите: «Нашёл вас на OK-OK.click». Это помогает развитию проекта.','When contacting them, say: “I found you on OK-OK.click.” It helps the project grow.','เมื่อติดต่อ โปรดบอกว่า “พบคุณจาก OK-OK.click” เพื่อช่วยสนับสนุนโครงการ');
  const message=()=>tr('Здравствуйте! Нашёл вас на OK-OK.click.','Hello! I found you on OK-OK.click.','สวัสดี พบคุณจาก OK-OK.click');
  window.okokAttribution=attribution;
  window.okokContactMessage=message;
  function requestPhrase(p){
    return 'Hello! I found you on OK-OK.click. '+(p.category==='bikes'
      ? 'Could you confirm the model, total rental price, deposit, insurance exclusions and delivery cost, please?'
      : 'Could you send the full quote, required documents, timeline and refund terms, please?');
  }
  function serviceExtras(p){
    const bikes=p.category==='bikes';
    const translation=bikes
      ? tr('Здравствуйте! Нашёл вас на OK-OK.click. Подтвердите, пожалуйста, модель, полную стоимость аренды, залог, исключения страховки и цену доставки.','', 'สวัสดี พบคุณจาก OK-OK.click กรุณายืนยันรุ่นรถ ค่าเช่ารวม เงินมัดจำ ข้อยกเว้นประกัน และค่าจัดส่ง')
      : tr('Здравствуйте! Нашёл вас на OK-OK.click. Пришлите, пожалуйста, полную смету, список документов, сроки и условия возврата.','', 'สวัสดี พบคุณจาก OK-OK.click กรุณาส่งค่าใช้จ่ายทั้งหมด รายการเอกสาร ระยะเวลา และเงื่อนไขคืนเงิน');
    const checks=bikes
      ? [tr('Зафиксируйте состояние байка и комплектность при передаче.','Record the bike’s condition and included equipment at handover.','บันทึกสภาพรถและอุปกรณ์เมื่อรับรถ'),tr('Получите письменные условия возврата залога и действий при повреждении.','Get written terms for deposit refunds and damage handling.','ขอเงื่อนไขคืนเงินมัดจำและขั้นตอนเมื่อรถเสียหายเป็นลายลักษณ์อักษร'),tr('Уточните место и время возврата, доплаты и контакт при проблеме.','Confirm return location and time, extra charges and a contact for problems.','ยืนยันสถานที่และเวลาคืนรถ ค่าใช้จ่ายเพิ่มเติม และผู้ติดต่อเมื่อมีปัญหา')]
      : [tr('Попросите разделить смету на сборы и услуги исполнителя.','Ask for a quote separating fees from service charges.','ขอใบเสนอราคาที่แยกค่าธรรมเนียมและค่าบริการ'),tr('Уточните порядок передачи и возврата оригиналов документов.','Confirm how original documents will be handed over and returned.','ยืนยันวิธีส่งมอบและรับเอกสารต้นฉบับคืน'),tr('Получите письменно, что включено в услугу и что происходит при отказе.','Get written details of what is included and what happens if the application is refused.','ขอรายละเอียดเป็นลายลักษณ์อักษรว่าบริการรวมอะไรและจะดำเนินการอย่างไรหากคำขอถูกปฏิเสธ')];
    return '<section class="service-help" aria-labelledby="servicePhraseTitle"><h3 id="servicePhraseTitle">'+tr('Готовая фраза для обращения','Ready-to-send enquiry','ข้อความสำหรับสอบถาม')+'</h3><label class="hint" for="servicePhrase">'+tr('Текст на английском','English text','ข้อความภาษาอังกฤษ')+'</label><textarea id="servicePhrase" readonly rows="5" spellcheck="false">'+esc(requestPhrase(p))+'</textarea>'+(translation?'<p class="hint">'+esc(translation)+'</p>':'')+'<button type="button" class="btn ghost" id="serviceCopyPhrase">'+tr('Скопировать фразу','Copy enquiry','คัดลอกข้อความ')+'</button><p id="serviceCopyStatus" role="status" aria-live="polite"></p><details class="service-checklist"><summary>'+tr('Что уточнить до обращения','Before contacting them','สิ่งที่ควรสอบถามก่อนติดต่อ')+'</summary><ul>'+checks.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></details></section>';
  }
  function openProvider(id){
    const p=DATA.providers.find(p=>p.id===id);if(!p)return;
    serviceOpener=document.activeElement;
    const link=(href,label,channel)=>'<a class="btn ghost" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer" data-provider="'+p.id+'" data-contact-channel="'+channel+'">'+label+'</a>';
    $('sheet').innerHTML='<div class="service-heading"><h2>'+esc(p.name)+'</h2><button class="lang" id="closeSheet" type="button" aria-label="'+tr('Закрыть','Close','ปิด')+'">×</button></div><div class="pad"><p>'+esc(p.text[document.documentElement.lang]||p.text.en)+'</p><p class="muted">'+esc(p.rating?'★ '+p.rating+' · '+p.platform:p.platform)+'</p><p class="hint">'+tr('Снимок источника','Source snapshot','ข้อมูลจากแหล่งอ้างอิง')+' · '+DATA.reviewed+'</p><p>'+tr(p.category==='bikes'?'До аренды уточните модель, залог, страховые исключения, доставку и ответственность за повреждения. Условия согласуйте письменно.':'До оплаты запросите полную смету, сроки, перечень документов и условия возврата. Решение по визе принимает уполномоченный орган, не агентство.',p.category==='bikes'?'Before renting, confirm the model, deposit, insurance exclusions, delivery and damage liability in writing.':'Before paying, request a full quote, timeline, document checklist and refund terms. Visa decisions belong to the relevant authority, not the agency.',p.category==='bikes'?'ก่อนเช่า ยืนยันรุ่นรถ เงินมัดจำ ข้อยกเว้นประกัน ค่าจัดส่ง และความรับผิดชอบความเสียหายเป็นลายลักษณ์อักษร':'ก่อนชำระ ขอค่าใช้จ่ายทั้งหมด ระยะเวลา รายการเอกสาร และเงื่อนไขคืนเงิน การอนุมัติวีซ่าเป็นหน้าที่ของหน่วยงานที่มีอำนาจ ไม่ใช่เอเจนซี่')+'</p><p class="service-attribution">'+attribution()+'</p><div class="actions">'+(p.website?link(p.website,tr('Сайт и контакты','Website & contacts','เว็บไซต์และช่องทางติดต่อ'),'website'):'')+(p.phone?link('https://wa.me/'+p.phone+'?text='+encodeURIComponent(message()),'WhatsApp','whatsapp'):'')+link(p.reviews,tr('Отзывы и источник','Reviews & source','รีวิวและแหล่งอ้างอิง'),'reviews')+'</div>'+serviceExtras(p)+'</div>';
    $('sheet').classList.add('open');history.pushState({view:'sheet',id:p.id},'');
    $('closeSheet').onclick=()=>history.back();$('closeSheet').focus({preventScroll:true});
    const copyButton=$('serviceCopyPhrase'),phrase=$('servicePhrase'),status=$('serviceCopyStatus');
    let copying=false;
    const active=()=>$('sheet').classList.contains('open')&&$('servicePhrase')===phrase;
    copyButton.onclick=async()=>{
      if(copying)return;
      copying=true;copyButton.setAttribute('aria-busy','true');
      try{
        if(!navigator.clipboard?.writeText)throw Error('clipboard_unavailable');
        await navigator.clipboard.writeText(phrase.value);
        if(active())status.textContent=tr('Фраза скопирована.','Enquiry copied.','คัดลอกข้อความแล้ว');
      }catch{
        if(active()){
          phrase.focus({preventScroll:true});phrase.select();phrase.setSelectionRange(0,phrase.value.length);
          status.textContent=tr('Не удалось скопировать автоматически. Выделите текст и выберите «Скопировать».','Automatic copying is unavailable. Select the text and choose Copy.','คัดลอกอัตโนมัติไม่ได้ เลือกข้อความแล้วกดคัดลอก');
        }
      }finally{copying=false;copyButton.removeAttribute('aria-busy');}
    };
    signal('provider_open',{provider_id:id,category:p.category,city:'pattaya'});
  }
  window.okokScreen=(tab,city)=>{
    screen=tab;
    $('moreBtn').setAttribute('aria-label',tr('Ещё','More','เพิ่มเติม'));
    $('moreClose').setAttribute('aria-label',tr('Закрыть','Close','ปิด'));
    let navHost=$('serviceNav');if(!navHost){navHost=document.createElement('div');navHost.id='serviceNav';$('searchBar').after(navHost);}navHost.hidden=tab!=='list';
    if(tab!=='list'){lastView='';return;}
    const key=city+':'+section;
    if(key!==lastView){signal('catalogue_view',{category:section,city});lastView=key;}
    const app=$('app');
    const nav='<div class="service-tabs" role="group" aria-label="'+tr('Раздел мест','Place category','หมวดสถานที่')+'">'+[['all',tr('Все','All','ทั้งหมด')],['bikes',tr('Байки','Bikes','มอเตอร์ไซค์')],['visas',tr('Визы','Visas','วีซ่า')]].map(([id,name])=>'<button class="btn ghost" type="button" data-service-section="'+id+'" aria-pressed="'+(section===id)+'">'+name+'</button>').join('')+'</div>';
    navHost.innerHTML=nav;
    if(section==='all')return;
    $('homeFilters').hidden=true;
    $('searchBar').style.display='flex';
    const q=$('q').value.trim().toLowerCase();
    const list=DATA.providers.filter(p=>p.category===section&&[p.name,...Object.values(p.text)].join(' ').toLowerCase().includes(q));
    app.innerHTML='<h2>'+tr(section==='bikes'?'Байк для своих маршрутов':'Визовые услуги',section==='bikes'?'A bike for your plans':'Visa services',section==='bikes'?'รถสำหรับทริปของคุณ':'บริการวีซ่า')+'</h2><p class="hint">'+tr('Редакционная подборка, не рейтинг и не личная проверка. Оценки могут измениться.','An editorial shortlist, not a ranking or personal inspection. Ratings may change.','รายชื่อคัดเลือก ไม่ใช่การจัดอันดับหรือการตรวจสอบด้วยตนเอง คะแนนอาจเปลี่ยนแปลง')+'</p>'+(city!=='pattaya'?'<div class="empty">'+tr('Подборка этого города ещё готовится. Места Паттайи здесь не показываем.','This city’s shortlist is being prepared. Pattaya providers are not shown here.','กำลังจัดเตรียมรายชื่อเมืองนี้ ไม่แสดงผู้ให้บริการพัทยาที่นี่')+'</div>':'<div class="service-grid">'+list.map(p=>'<article class="service-card"><span class="service-icon" aria-hidden="true">'+(section==='bikes'?'🛵':'🛂')+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.text[document.documentElement.lang]||p.text.en)+'</p>'+(p.rating?'<p class="service-rating">★ '+esc(p.rating)+' <small>'+esc(p.platform)+'</small></p>':'<p class="hint">'+tr('Отзывы — по ссылке в карточке','Review source inside','ดูแหล่งรีวิวในรายละเอียด')+'</p>')+'<button class="btn ghost" type="button" data-provider-open="'+p.id+'">'+tr('Подробнее и контакты','Details & contacts','รายละเอียดและติดต่อ')+' ↗</button></article>').join('')+'</div>'+(list.length?'':'<p class="empty">'+tr('Ничего не найдено','No matches','ไม่พบข้อมูล')+'</p>'));
  };
  $('moreBtn').onclick=()=>{const open=$('headerMore').hidden;$('headerMore').hidden=!open;$('moreBtn').setAttribute('aria-expanded',String(open));if(open)$('headerMore').querySelector('button').focus({preventScroll:true});};
  const closeMore=()=>{$('headerMore').hidden=true;$('moreBtn').setAttribute('aria-expanded','false');};
  $('moreClose').onclick=()=>{closeMore();$('moreBtn').focus({preventScroll:true});};
  document.addEventListener('click',e=>{
    if(!e.target.closest('#moreBtn,#headerMore')||e.target.closest('#headerMore button'))closeMore();
    const s=e.target.closest('[data-service-section]');
    if(s){section=s.dataset.serviceSection;window.okokRestoreView('list');document.querySelector('[data-service-section="'+section+'"]').focus({preventScroll:true});}
    const p=e.target.closest('[data-provider-open]');if(p)openProvider(p.dataset.providerOpen);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('headerMore').hidden){closeMore();$('moreBtn').focus();}else if(e.key==='Escape'&&$('sheet').classList.contains('open')&&$('sheet').querySelector('.service-heading')){e.preventDefault();history.back();}});
  window.addEventListener('okok:city-change',()=>{section='all';lastView='';});
  window.addEventListener('popstate',()=>{if(serviceOpener&&!$('sheet').classList.contains('open')){serviceOpener.focus({preventScroll:true});serviceOpener=null;}});
  document.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const panel=!$('headerMore').hidden?$('headerMore'):$('sheet').classList.contains('open')&&$('sheet').querySelector('.service-heading')?$('sheet'):null;
    if(!panel)return;
    const focusable=Array.from(panel.querySelectorAll('button:not(:disabled),a[href],textarea,summary')).filter(n=>n.getClientRects().length),first=focusable[0],last=focusable.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  });
  window.okokScreen(screen,document.documentElement.dataset.city||'pattaya');
})();
