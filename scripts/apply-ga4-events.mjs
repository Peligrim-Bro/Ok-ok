import { readFileSync, writeFileSync } from 'node:fs';

const indexPath='site/public/index.html';
let html=readFileSync(indexPath,'utf8');

const tracker=String.raw`
<script id="ok-ga4-events-v1">
(()=> {
  if(window.__OKOK_GA4_EVENTS__) return;
  window.__OKOK_GA4_EVENTS__=true;
  const send=(name,params={})=>{
    if(typeof window.gtag!=='function') return;
    window.gtag('event',name,{...params,transport_type:'beacon'});
  };
  const clean=s=>String(s||'').trim().replace(/\s+/g,' ').slice(0,100);
  const lang=()=>clean(document.documentElement.lang||localStorage.getItem('lang')||'ru');
  const partnerFromHref=href=>{
    try{
      const u=new URL(href,location.href),h=u.hostname.toLowerCase();
      if(h.includes('12go.asia'))return '12go';
      if(h.includes('klook.com'))return 'klook';
      if(h.includes('airalo.com'))return 'airalo';
      if(h.includes('t.me')&&/SenateExchange/i.test(u.href))return 'senate_exchange';
    }catch{}
    return '';
  };
  document.addEventListener('click',e=>{
    const el=e.target.closest?.('a,button,[role="button"]');
    if(!el)return;
    const text=clean(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent);
    const href=el.href||el.getAttribute?.('href')||'';
    const partner=partnerFromHref(href)||clean(el.dataset?.okPartner);
    const placement=clean(el.dataset?.okPlacement);
    const tab=clean(el.dataset?.tab);
    const bag=(text+' '+(el.id||'')+' '+(typeof el.className==='string'?el.className:'')).toLowerCase();
    const base={ui_language:lang()};
    if(partner)send('partner_click',{...base,partner,placement:placement||'unknown'});
    if(tab)send('navigation_click',{...base,tab});
    if(/любим|favorite|favourite|сохран|save|บันทึก/.test(bag))send('favorite_action',{...base,label:text});
    if(/выбор дня|куда сегодня|roulette|wheel|spin|สุ่ม/.test(bag))send('daily_pick_action',{...base,label:text});
    if(/объяв|advert|promot|okad|โฆษณา/.test(bag))send('ads_action',{...base,label:text});
    if(/oki|оки|โอกิ/.test(bag))send('oki_action',{...base,label:text});
    if(/map|карт|карта|แผนที่/.test(bag))send('map_action',{...base,label:text});
    if(/поддержать автора|support the author|สนับสนุนผู้เขียน/.test(bag))send('support_author_click',base);
  },{capture:true,passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden')send('page_hide',{ui_language:lang(),page_path:location.pathname});
  },{passive:true});
})();
</script>`;

if(!html.includes('ok-ga4-events-v1')){
  if(!html.includes('</body>'))throw new Error('Public page body missing for GA4 events');
  html=html.replace('</body>',tracker+'\n</body>');
  writeFileSync(indexPath,html);
}
console.log('GA4 interaction events ready: partners, navigation, favorites, daily pick, ads, OKI, map, support.');
