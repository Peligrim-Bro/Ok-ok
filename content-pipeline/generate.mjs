import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const queue = JSON.parse(readFileSync('content-pipeline/drafts.json', 'utf8'));
if (queue.publishing_enabled !== false) throw new Error('Publishing must remain disabled');
if (!Array.isArray(queue.items)) throw new Error('Invalid draft queue');
const ids = new Set();
const today = new Date().toISOString().slice(0, 10);
const lines = ['# Editorial drafts — ' + today, '', 'STATUS: DRAFT ONLY. No publication or deployment.', ''];

const templates = {
  'travel-001': [
    '### Готовый черновик поста',
    'Как не потерять деньги при обмене валюты в Паттайе',
    '',
    'Перед обменом сравните не только цифры на табло, но и итоговую сумму, которую получите на руки. Курс может отличаться в зависимости от валюты, номинала купюр и конкретной точки.',
    '',
    '1. Уточните курс для вашей валюты и суммы.',
    '2. Спросите о комиссии и итоговой сумме в батах.',
    '3. Пересчитайте деньги до ухода от стойки.',
    '4. Не передавайте наличные незнакомым посредникам.',
    '',
    'На https://ok-ok.click собираем полезные места и сервисы для поездки. Актуальные условия уточняйте непосредственно перед обменом.',
    '',
    'FACT CHECK: Не заявлять о лучшем курсе без свежих подтверждений. Реферальные ссылки EX24 и Senate не изменять.'
  ],
  'travel-002': [
    '### Video script (DRAFT, English on-screen text only)',
    '0–4s: Approved Oki mascot in Pattaya. Text: PATTAYA PLANS?',
    '4–9s: Oki opens https://ok-ok.click on a phone. Text: CHECK BEFORE YOU GO',
    '9–15s: Oki points to the site. Text: MAKE YOUR TRIP OK — ok-ok.click',
    '',
    'VIDEO GATE: approved Oki reference required; preserve original mascot, no generic robot; English text only, including phone screen; visible exact ok-ok.click.',
    'DO NOT GENERATE VIDEO until the approved Oki reference is supplied.'
  ],
  'blog-001': [
    '### Готовый черновик поста',
    'Сайт для бизнеса от $199: что нужно решить до запуска',
    '',
    'Небольшому бизнесу не всегда нужен сложный сайт. Часто полезнее начать со страницы, где клиент быстро найдёт услуги, контакты и кнопку связи.',
    '',
    'Перед заказом определите: какое действие должен совершить посетитель; откуда придут клиенты; какие материалы уже готовы; кто будет обновлять информацию.',
    '',
    'Я помогаю небольшим компаниям запускать сайты и упрощать работу с заявками с помощью AI-инструментов и автоматизации.',
    '',
    'Стартовая стоимость — от $199. Итоговая цена и сроки зависят от объёма работ и интеграций. Напишите, чем занимается ваш бизнес и что нужно автоматизировать.',
    '',
    'FACT CHECK: Не обещать сроки, результаты по лидам или функции без согласования.'
  ]
};

for (const item of queue.items) {
  if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new Error('Invalid or duplicate draft id');
  ids.add(item.id);
  if (!['ok-ok', 'personal'].includes(item.channel)) throw new Error('Unknown channel: ' + item.channel);
  if (item.status !== 'idea') continue;
  if (typeof item.topic !== 'string' || !item.topic.trim()) throw new Error('Missing topic: ' + item.id);
  lines.push('## ' + item.id + ' — ' + item.topic, '', 'Channel: ' + item.channel, '');
  if (templates[item.id]) {
    lines.push(...templates[item.id]);
  } else {
    lines.push('### Outline (new topic requires editorial writing)', 'Problem → verified facts and sources → practical steps → call to action.');
    if (item.requires_visual_reference) lines.push('VIDEO GATE: approved Oki reference required; English text only; visible ok-ok.click.');
  }
  lines.push('', 'Approval: pending', '', '---', '');
}

mkdirSync('content-pipeline/generated', { recursive: true });
writeFileSync('content-pipeline/generated/latest.md', lines.join('\n') + '\n');
console.log('Generated ' + ids.size + ' review-only editorial drafts for ' + today);
