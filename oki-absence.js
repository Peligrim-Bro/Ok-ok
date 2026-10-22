/* Seven days without a foreground visit. Browser-local, not a server clock. */
(()=>{
  const KEY='oki-life-v1',BACKUP='oki-loss-backup-v1',WEEK=7*86400000;
  const fresh={gender:'',careDays:0,careDay:'',careStreak:0,routineDay:'',routineLastDay:'',routine:{feed:false,clean:false,activity:false},food:82,mood:88,energy:76,hygiene:85,activity:80,xp:0,sleeping:false};
  let binding=null,lastTouch=0;
  const number=v=>Number.isSafeInteger(v)&&v>=0?v:0;
  function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch{return null;}}
  function transition(saved,now){
    const generation=number(saved.absenceGeneration),last=saved.absenceSeenAt;
    const known=Number.isFinite(last)&&last>0&&last<=now;
    const lost=known&&['boy','girl'].includes(saved.gender)&&now-last>=WEEK;
    return {lost,next:{...saved,...(lost?{...fresh,routine:{...fresh.routine}}:{}),...(lost?{last:now}:{}),absenceVersion:1,absenceSeenAt:now,absenceGeneration:generation+(lost?1:0),absenceLostAt:lost?now:number(saved.absenceLostAt)}};
  }
  function beforeSave(state){
    const saved=read();
    if(saved&&number(saved.absenceGeneration)>number(state.absenceGeneration))return false;
    if(saved&&number(saved.absenceGeneration)===number(state.absenceGeneration)&&Number.isFinite(saved.absenceSeenAt))state.absenceSeenAt=Math.max(state.absenceSeenAt||0,saved.absenceSeenAt);
    if(state.gender)state.absenceLostAt=0;
    return true;
  }
  function visit(force=false){
    if(!binding||document.hidden)return;
    const now=Date.now();if(!Number.isFinite(now)||now<=0||(!force&&now-lastTouch>=0&&now-lastTouch<60000))return;
    const {state,reload,changed}=binding,saved=read();
    const moved=saved&&number(saved.absenceGeneration)>number(state.absenceGeneration);
    if(saved)reload();
    const result=transition({...saved,...state,absenceSeenAt:saved?.absenceSeenAt,absenceGeneration:saved?.absenceGeneration,absenceLostAt:saved?.absenceLostAt},now);
    try{
      if(result.lost)localStorage.setItem(BACKUP,JSON.stringify({lostAt:now,generation:number(saved?.absenceGeneration),pet:Object.fromEntries(Object.keys(fresh).map(k=>[k,state[k]]))}));
      localStorage.setItem(KEY,JSON.stringify(result.next));
    }catch{return;}
    Object.assign(state,result.next);lastTouch=now;
    if(result.lost||moved)changed();
  }
  const text={
    ru:['Оки живёт 7 суток без посещения сайта. Заходи, чтобы не потерять его.','Этот Оки потерян','Тебя не было 7 суток. Выбери нового малыша. Кристаллы, купленные облики и доступ к магазину сохранены.'],
    en:['OKI survives 7 days without a site visit. Come back to keep your pet.','This OKI is gone','You were away for 7 days. Choose a new baby. Your crystals, purchased looks and shop access are saved.'],
    th:['โอกิอยู่ได้ 7 วันโดยไม่มีการเข้าชมเว็บไซต์ กลับมาเยี่ยมเพื่อไม่ให้เสียโอกิไป','โอกิตัวนี้จากไปแล้ว','คุณไม่ได้มาเยี่ยม 7 วัน เลือกโอกิตัวน้อยใหม่ได้ คริสตัล รูปลักษณ์ที่ซื้อ และสิทธิ์เข้าร้านค้ายังคงอยู่']
  };
  function notice(state,lang){const q=text[lang]||text.ru;return (state.absenceLostAt&&!state.gender?'<section class="ol-surprise ol-absence-notice" role="status"><strong>'+q[1]+'</strong><span>'+q[2]+'</span></section>':'')+'<p class="ol-fine ol-absence-rule">'+q[0]+'</p>';}
  function bind(state,reload,changed){
    binding={state,reload,changed};visit(true);
    addEventListener('pageshow',()=>visit(true));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)visit(true);});
    for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>visit(),{capture:true,passive:true});
    setInterval(()=>{if(!document.hidden&&document.hasFocus())visit();},60000);
  }
  globalThis.OKI_ABSENCE=Object.freeze({WEEK,transition,beforeSave,notice,bind});
})();
