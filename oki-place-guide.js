// Optional browser-only guide. No timers, services or persistent state of its own.
(()=>{
  const words={ru:['Оки, помоги выбрать','Назад','Ещё варианты'],en:['Oki, help me choose','Back','More ideas'],th:['โอกิ ช่วยเลือกหน่อย','ย้อนกลับ','ไอเดียเพิ่มเติม']};
  function pick(places,category,time,excluded,minutes,family,offset=0){
    const pool=places.filter(p=>p.category===category&&minutes(p)<=time&&!excluded.includes(p.id)&&family(p));
    const start=offset%pool.length;
    return pool.slice(start,start+3);
  }
  function mount(){
    const panel=document.getElementById('spinCard');
    if(!panel||panel.querySelector('.oki-guide'))return;
    const c=words[lang]||words.en,w=HW(),root=document.createElement('details');
    root.className='oki-guide';root.innerHTML='<summary>✨ '+c[0]+'</summary><div class="oki-guide-body"></div>';
    panel.querySelector('.holiday-filters').before(root);
    const body=root.lastElementChild;let category='',time=0,offset=0;
    const choices=(key,items)=>items.map(([value,label])=>'<button type="button" class="btn ghost" data-guide-'+key+'="'+value+'">'+label+'</button>').join('');
    const back=()=>choices('back',[['1',c[1]]]);
    function render(focus=false){
      let cards=[];
      if(!category)body.innerHTML='<fieldset><legend>1 · '+w.choose+'</legend>'+choices('category',[['food',w.food],['sights',w.sights]])+'</fieldset>';
      else if(!time)body.innerHTML='<fieldset><legend>2 · '+w.time+'</legend>'+choices('time',[[60,w.hour],[240,w.half],[480,w.day]])+'</fieldset>'+back();
      else{
        const excluded=holidayState.seen.concat(holidayState.visited),family=p=>!holidayFamily||p.category==='food'||HOLIDAY_FAMILY.includes(p.id.replace('t20-',''));
        cards=pick(HOLIDAY_PLACES,category,time,excluded,holidayMinutes,family,offset);
        body.innerHTML='<h3 tabindex="-1">'+w[category]+' · '+w[{60:'hour',240:'half',480:'day'}[time]]+'</h3><p class="hint">'+w.planning+'</p><div class="oki-guide-results">'+(cards.length?cards.map(holidayCard).join(''):'<p>'+w.remaining+': 0</p>')+'</div>'+(cards.length?choices('more',[['1',c[2]]]):'')+back();
        holidayBind(body);
      }
      if(focus)body.querySelector('h3,button')?.focus({preventScroll:true});
    }
    body.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.guideCategory){category=b.dataset.guideCategory;render(true);}
      else if(b.dataset.guideTime){time=+b.dataset.guideTime;render(true);}
      else if(b.dataset.guideBack){if(time)time=0;else category='';offset=0;render(true);}
      else if(b.dataset.guideMore){offset=body.querySelectorAll('.holiday-result').length<3?0:offset+3;render(true);}
    });
    panel.addEventListener('click',event=>{const b=event.target.closest('[data-holiday-filter]');if(b){root.hidden=b.dataset.holidayFilter==='saved';root.open=false;}});
    render();
  }
  window.OKOK_GUIDE=Object.freeze({mount,pick});
})();
