import { readFileSync, writeFileSync } from 'node:fs';
const path = 'site/public/index.html';
let html = readFileSync(path, 'utf8');
if (!html.includes('id="ok-card-reveal"')) {
  html = html.replace('</head>', `<style id="ok-card-reveal">
    @media(prefers-reduced-motion:no-preference){
      #app .card.ok-reveal-pending{opacity:0;translate:0 16px}
      #app .card.ok-reveal-in{animation:ok-card-rise 420ms cubic-bezier(.2,.75,.25,1) both}
      @keyframes ok-card-rise{from{opacity:0;translate:0 16px}to{opacity:1;translate:0 0}}
    }
  </style></head>`);
  html = html.replace('</body>', `<script>
  (()=>{
    const app=document.getElementById('app');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    if(!app||reduced.matches||!('IntersectionObserver' in window))return;
    const seen=new WeakSet();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const card=entry.target;
        card.classList.remove('ok-reveal-pending');
        card.classList.add('ok-reveal-in');
        observer.unobserve(card);
      });
    },{threshold:0,rootMargin:'0px 0px -20px 0px'});
    function scan(){
      app.querySelectorAll('.card').forEach(card=>{
        if(seen.has(card))return;
        seen.add(card);
        // Hide only offscreen cards; the first screen stays immediately readable.
        if(!reduced.matches&&card.getBoundingClientRect().top>=innerHeight){
          card.classList.add('ok-reveal-pending');observer.observe(card);
        }
      });
    }
    let frame=0;
    new MutationObserver(()=>{
      if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan()});
    }).observe(app,{childList:true,subtree:true});
    reduced.addEventListener('change',()=>{
      if(!reduced.matches)return;
      observer.disconnect();
      app.querySelectorAll('.ok-reveal-pending,.ok-reveal-in').forEach(card=>card.classList.remove('ok-reveal-pending','ok-reveal-in'));
    });
    scan();
  })();
  </script></body>`);
  writeFileSync(path,html);
}
console.log('Cards: offscreen reveal, no layout changes, reduced-motion respected.');
