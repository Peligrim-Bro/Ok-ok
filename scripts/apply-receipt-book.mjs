import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export function addReceiptBook(reader, root, assets) {
  const editions = [
    ['receipt', 'Квитанция на двоих', 'Камерный детектив', 5, 'Ее смена продолжалась.'],
    ['rain', 'Дождь на записи', 'Мистика', 4, 'ей действительно нечего было терять.'],
    ['change', 'Сдачу оставьте себе', 'Психологический триллер', 4, 'Смена была окончена.'],
    ['keys', 'Два одинаковых ключа', 'Детектив', 5, '«Черный список. Пожизненно».'],
    ['window', 'Окно без моря', 'Мистический триллер', 5, 'И он ни на что не собирался ее менять.'],
  ];
  const shelfEnd = '</article></section>';
  if (!reader.includes(shelfEnd) || reader.includes('id="receipt-card"')) throw Error('Book shelf insertion failed');
  mkdirSync(root + 'books', {recursive:true});
  const cards = [];
  const css = `
.receipt-card{display:grid;grid-template-columns:minmax(92px,155px) 1fr;gap:14px;align-items:start;margin-bottom:16px}
.receipt-card[hidden]{display:none}.receipt-card h2,.receipt-card p{margin:0 0 8px}
.receipt-cover{position:relative;aspect-ratio:3/4;border-radius:10px;overflow:hidden;background:#061d27}
.receipt-cover img{width:100%;height:100%;display:block;object-fit:cover}
.receipt-cover strong{position:absolute;inset:auto 0 0;padding:16px 7px 8px;background:linear-gradient(transparent,#06121cf5);font-size:clamp(.76rem,3vw,1rem);line-height:1.25}
.receipt-action{display:inline-flex;align-items:center;min-height:44px;padding:0 12px;border:1px solid #6dd8db;border-radius:12px}
@media(max-width:360px){.receipt-card{grid-template-columns:1fr}.receipt-card .receipt-cover{max-width:155px}}
`;
  for (const [slug, title, genre, count, ending] of editions) {
    const [annotation, ...lines] = readFileSync('books/' + slug + '.txt', 'utf8').trimEnd().split('\n');
    const chapters = lines.filter(line => /^Глава \d+\./.test(line));
    if (!annotation || chapters.length !== count || !chapters.every((line,i)=>line.startsWith('Глава '+(i+1)+'.')) || !lines.at(-1).endsWith(ending)) throw Error('Incomplete manuscript: ' + slug);
    const escape = text => text.replace(/[&<>]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[char]));
    const cover = '<div class="receipt-cover"><img src="/books/' + slug + '-cover.webp" alt=""><strong>' + title + '</strong></div>';
    const card = '<section id="' + slug + '-card" class="note receipt-card" lang="ru">' + cover +
      '<div><h2>' + title + '</h2><p>' + genre + ' · RU</p><p>' + escape(annotation) +
      '</p><a class="receipt-action" href="/books/' + slug + '.html">Читать</a></div></section>';
    const head = reader.slice(0, reader.indexOf('</head>')).replace(/<title>[^<]+<\/title>/, '<title>' + title + ' · OK-OK</title>');
    const story = lines.map(line => /^Глава \d+\./.test(line) ? '<h2>' + escape(line) + '</h2>' : '<p>' + escape(line) + '</p>').join('\n');
    copyFileSync('books/' + slug + '-cover.webp', root + 'books/' + slug + '-cover.webp');
    writeFileSync(root + 'books/' + slug + '.html', head + '<style>' + css + '.receipt-lead{max-width:155px;margin:16px 0}.receipt-story{font-size:1.1rem}.receipt-story h2{margin:2em 0 0.7em}.receipt-story h2:first-child{margin-top:0}</style></head><body><main><header><a class="receipt-action" href="/travel-reads.html">← К полке</a></header><h1>' + title + '</h1><p>' + genre + '</p><p>' + escape(annotation) + '</p><div class="receipt-lead">' + cover + '</div>' + (slug === 'receipt' ? '<img class="story-illustration" src="/books/receipt-shelf.webp" width="900" height="600" alt="Алиса у пустой полки номер 42">' : '') + '<article class="reader-story receipt-story">' + story + '</article><a class="receipt-action" href="/travel-reads.html">← К полке</a></main></body></html>');
    assets.push('books/' + slug + '.html','books/' + slug + '-cover.webp');
    cards.push(card);
  }
  copyFileSync('books/receipt-shelf.webp', root + 'books/receipt-shelf.webp');
  assets.push('books/receipt-shelf.webp');
  return reader.replace('</head>', '<style>' + css + '</style></head>')
    .replace(shelfEnd, shelfEnd + cards.join(''))
    .replace("activeFilter=b.dataset.filter;", "activeFilter=b.dataset.filter;document.querySelectorAll('.receipt-card').forEach(card=>card.hidden=!['all','adult'].includes(activeFilter));");
}
