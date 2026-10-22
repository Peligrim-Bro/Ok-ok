/* Calendar review age, not a guarantee of current facts. No network or storage. */
(()=>{
  const limits={news:1,services:30};
  const day=86400000;
  function dateDay(value){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const time=Date.parse(value+'T00:00:00Z');
    return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===value?time/day:null;
  }
  function localDate(now){
    if(!Number.isFinite(now))return null;
    try{
      const parts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
      return parts.year+'-'+parts.month+'-'+parts.day;
    }catch{return null;}
  }
  function state(kind,reviewed,now=Date.now()){
    const current=dateDay(localDate(now)),previous=dateDay(reviewed);
    if(!Object.hasOwn(limits,kind)||current===null||previous===null||previous>current)return {status:'unknown',ageDays:null};
    const ageDays=current-previous;
    return {status:ageDays>limits[kind]?'due':'dated',ageDays};
  }
  const words={
    ru:{news:'Подборка проверена',services:'Снимок источника',unknown:'Дата проверки не подтверждена. Откройте первоисточник.',newsDue:'Подборку пора обновить. Сверьте сведения с первоисточником.',servicesDue:'Данные старше 30 дней. Перед обращением уточните условия у исполнителя.'},
    en:{news:'Digest reviewed',services:'Source snapshot',unknown:'Review date is unconfirmed. Check the original source.',newsDue:'This digest is due for an update. Check the original source.',servicesDue:'Data is over 30 days old. Confirm current terms with the provider.'},
    th:{news:'ตรวจสอบข่าวแล้ว',services:'ข้อมูลจากแหล่งอ้างอิง',unknown:'ยังยืนยันวันที่ตรวจสอบไม่ได้ โปรดดูแหล่งข้อมูลต้นฉบับ',newsDue:'ถึงเวลาอัปเดตข่าวชุดนี้ โปรดตรวจสอบกับแหล่งข้อมูลต้นฉบับ',servicesDue:'ข้อมูลเกิน 30 วัน โปรดยืนยันเงื่อนไขปัจจุบันกับผู้ให้บริการ'}
  };
  function html(kind,reviewed,lang,now=Date.now()){
    if(!Object.hasOwn(limits,kind))return '';
    const result=state(kind,reviewed,now),w=words[lang]||words.ru;
    // Only validated ISO dates and fixed translations enter markup.
    const date=dateDay(reviewed)===null?'':reviewed;
    const label=result.status==='unknown'?w.unknown:w[kind]+' · '+date;
    const note=result.status==='due'?'<span class="freshness-note">'+w[kind+'Due']+'</span>':'';
    return '<p class="hint content-freshness" data-freshness-kind="'+kind+'" data-reviewed="'+date+'" data-freshness-state="'+result.status+'">'+label+note+'</p>';
  }
  function refresh(){
    for(const node of document.querySelectorAll('[data-freshness-kind]')){
      const markup=html(node.dataset.freshnessKind,node.dataset.reviewed,document.documentElement.lang);
      if(markup&&node.outerHTML!==markup){const template=document.createElement('template');template.innerHTML=markup;node.replaceWith(template.content.firstElementChild);}
    }
  }
  globalThis.OKOK_FRESHNESS=Object.freeze({state,html,limits:Object.freeze(limits)});
  if(typeof document!=='undefined'){
    let timer;
    const update=()=>{
      clearTimeout(timer);refresh();
      const now=Date.now(),today=localDate(now);
      const delay=today?Date.parse(today+'T00:00:00+07:00')+day-now+1000:3600000;
      timer=setTimeout(update,Math.max(1000,Math.min(day+1000,delay)));
    };
    addEventListener('pageshow',update);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  }
})();
