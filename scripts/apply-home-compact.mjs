import { readFileSync, writeFileSync } from 'node:fs';

const path = 'site/public/index.html';
let page = readFileSync(path, 'utf8');
if (!page.includes('id="home-compact-style"')) {
  const start = page.indexOf('    function renderHome() {');
  const end = page.indexOf('    function renderList() {', start);
  if (start < 0 || end < 0) throw new Error('Home render boundaries missing');
  let home = page.slice(start, end);
  const replace = (from, to) => {
    if (!home.includes(from)) throw new Error('Home compact anchor missing: ' + from);
    home = home.replace(from, to);
  };
  replace('${partnersHTML()}', '');
  replace('<section class="trust">\n          <h3>${t().trustTitle}</h3>', '<details class="home-fold"><summary>${t().trustTitle}</summary><section class="trust">');
  replace('<div class="trust-grid">${trustHTML()}</div>\n        </section>', '<div class="trust-grid">${trustHTML()}</div>\n        </section></details>');
  replace('list.map(cardHTML)', 'list.slice(0, 6).map(cardHTML)');
  replace('<p class="hint">${t().install}</p>', '<button class="btn ghost home-all" type="button" data-open-list="1">${lang === "ru" ? "Все места" : lang === "th" ? "สถานที่ทั้งหมด" : "All places"} · ${list.length}</button>\n        <p class="hint">${t().install}</p>');
  page = page.slice(0, start) + home + page.slice(end);
  // Remove the retired trip section everywhere, retaining individual partner actions.
  const partnerStart = page.indexOf('    function partnersHTML() {');
  const partnerEnd = page.indexOf('    function openPartner(id) {', partnerStart);
  if (partnerStart < 0 || partnerEnd < 0) throw new Error('Partner section boundaries missing');
  page = page.slice(0, partnerStart) + '    function partnersHTML() { return ""; }\n' + page.slice(partnerEnd);
  page = page.replace('<img src="${p.photo}" alt="${p.name}" />', '<img src="${p.photo}" alt="${p.name}" loading="lazy" decoding="async" />');
  page = page.replace('</head>', `<style id="home-compact-style">
    .home-fold{margin:0 0 12px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
    .home-fold>summary{padding:14px;cursor:pointer;font-weight:700;font-size:14px;min-height:44px;box-sizing:border-box}
    .home-fold>summary:focus-visible{outline:2px solid var(--mint);outline-offset:3px;border-radius:12px}
    .home-fold>.partners,.home-fold>.trust{margin:0;padding:0 14px 14px;border:0;background:transparent}
    .home-fold>.partners>h3{display:none}
    .home-all{width:100%;margin:12px 0}
    .news-track{align-items:stretch}
    .news-card{flex:0 0 min(78%,320px);box-sizing:border-box;padding:10px 12px}
    .news-card p{font-size:12px;line-height:1.4}
    @media(min-width:700px){.news-card{flex-basis:280px}}
  </style></head>`);
  writeFileSync(path, page);
}
console.log('Compact home: six places, expandable resources, lazy images.');
