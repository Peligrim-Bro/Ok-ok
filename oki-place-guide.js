// Optional browser-only guide. No timers, services or persistent state of its own.
(()=>{
  document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="'+import.meta.url.replace('.js','.css')+'">');
  const words={ru:['Оки, помоги выбрать','Назад','Ещё варианты'],en:['Oki, help me choose','Back','More ideas'],th:['โอกิ ช่วยเลือกหน่อย','ย้อนกลับ','ไอเดียเพิ่มเติม']};
  function pick(items,cat,time,skip,mins,fits,offset=0){
    const pool=items.filter(p=>p.category===cat&&mins(p)<=time&&!skip.includes(p.id)&&fits(p));
    const start=offset%pool.length;
    return pool.slice(start,start+3);
  }
  function mount(){
    const panel=document.querySelector('#spinMask.on #spinCard');
    if(!panel||panel.querySelector('.oki-guide'))return;
    const c=words[lang]||words.en,w=HW(),root=document.createElement('details');
    root.className='oki-guide';root.innerHTML='<summary>✨ '+c[0]+'</summary><div class="oki-guide-body"></div>';
    root.hidden=holidayView==='saved';
    const filters=panel.querySelector('.holiday-filters');filters.before(root);
    const body=root.lastElementChild;let cat='',time=0,offset=0;
    const choices=(key,items)=>items.map(([value,label])=>'<button type="button" class="btn ghost" data-guide-'+key+'="'+value+'">'+label+'</button>').join('');
    const back=()=>choices('back',[['1',c[1]]]);
    function render(focus=false){
      let cards=[];
      if(!cat)body.innerHTML='<fieldset><legend>1 · '+w.choose+'</legend>'+choices('category',[['food',w.food],['sights',w.sights]])+'</fieldset>';
      else if(!time)body.innerHTML='<fieldset><legend>2 · '+w.time+'</legend>'+choices('time',[[60,w.hour],[240,w.half],[480,w.day]])+'</fieldset>'+back();
      else{
        const excluded=holidayState.seen.concat(holidayState.visited),family=p=>!holidayFamily||p.category==='food'||HOLIDAY_FAMILY.includes(p.id.replace('t20-',''));
        cards=pick(HOLIDAY_PLACES,cat,time,excluded,holidayMinutes,family,offset);
        body.innerHTML='<h3 tabindex="-1">'+w[cat]+' · '+w[{60:'hour',240:'half',480:'day'}[time]]+'</h3><p class="hint">'+w.planning+'</p><div class="oki-guide-results">'+(cards.length?cards.map(holidayCard).join(''):'<p>'+w.remaining+': 0</p>')+'</div>'+(cards.length?choices('more',[['1',c[2]]]):'')+back();
        holidayBind(body);
      }
      if(focus)body.querySelector('h3,button')?.focus({preventScroll:true});
    }
    body.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.guideCategory){cat=b.dataset.guideCategory;render(true);}
      else if(b.dataset.guideTime){time=+b.dataset.guideTime;render(true);}
      else if(b.dataset.guideBack){if(time)time=0;else cat='';offset=0;render(true);}
      else if(b.dataset.guideMore){offset=body.querySelectorAll('.holiday-result').length<3?0:offset+3;render(true);}
    });
    filters.addEventListener('click',event=>{const b=event.target.closest('[data-holiday-filter]');if(b){root.hidden=b.dataset.holidayFilter==='saved';root.open=false;}});
    render();
  }
  window.OKOK_GUIDE=Object.freeze({mount,pick});
})();
