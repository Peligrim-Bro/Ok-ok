import {test} from 'node:test';
import assert from 'node:assert/strict';
import {channelPresentation,channelText} from '../channel-presentation.mjs';
import {BRAND} from '../brand-copy.mjs';
import {POSTS} from '../channel-posts.mjs';

test('separate copy actions keep exact payloads and merge with source/site links',()=>{
 const url='https://ok-ok.click/?ref=keep';
 const p={text:'🌴 Hello!\nNo chilli, please.\nCould we have the bill, please?\n'+url,
  copyText:'No chilli, please.',topics:['Фразы','Ресторан'],
  copyButtons:[{label:'Поздороваться',text:'Hello!'},{label:'Без чили',text:'No chilli, please.'},{label:'Попросить счёт',text:'Could we have the bill, please?'}],
  buttons:[{text:'Сайт',url}]};
 const rows=channelPresentation(p).reply_markup.inline_keyboard;
 assert.equal(rows.length,4);
 assert.deepEqual(rows.slice(0,3).map(r=>r[0]),p.copyButtons.map(b=>({text:b.label,copy_text:{text:b.text}})));
 assert.equal(rows[3][0].url,url);
 assert.equal(rows.flat().filter(b=>b.text==='Скопировать фразу').length,0);
});
test('reviewed quiz source selects the repeated phrase without changing its hidden answer',()=>{
 const p=POSTS.find(p=>p.id==='okok-bill-quiz-20261028');
 const before=p.text,view=channelPresentation(p),copy=view.reply_markup.inline_keyboard[0][0];
 assert.equal(copy.text,'Попросить счёт');assert.equal(copy.copy_text.text,'Could we have the bill, please?');
 const spoiler=view.entities.find(e=>e.type==='spoiler');
 assert.equal(before.slice(spoiler.offset,spoiler.offset+spoiler.length),p.copyButtons[0].source);
 assert.equal(p.text,before);
 assert.throws(()=>channelPresentation({...p,copyButtons:[{label:'Счёт',text:copy.copy_text.text}]}));
 assert.throws(()=>channelPresentation({...p,copyButtons:[{...p.copyButtons[0],source:'Absent answer'}]}));
});
test('malformed or conflicting copy actions are rejected before sending',()=>{
 const p={text:'Hello!\nGoodbye!',copyText:'Hello!'};
 const good={label:'Привет',text:'Hello!'};
 for(const copyButtons of [[],[null],[{...good,label:''}],[{...good,label:'x'.repeat(41)}],[{...good,label:'bad\nlabel'}],[{...good,text:'absent'}],[{...good,text:'x'.repeat(257)}],[{...good,callback_data:'x'}],[good,good],Array(4).fill(good),[{label:'Пока',text:'Goodbye!'}]])assert.throws(()=>channelPresentation({...p,copyButtons}));
 assert.equal(channelPresentation({...p,copyButtons:[good]}).reply_markup.inline_keyboard[0][0].copy_text.text,'Hello!');
});
test('reviewed queue has nine purpose buttons in seven entries and preserves topic footers',()=>{
 const entries=POSTS.filter(p=>p.copyButtons);
 assert.equal(entries.length,7);assert.equal(entries.flatMap(p=>p.copyButtons).length,9);
 for(const p of entries){const r=channelPresentation(p);assert.equal(r.reply_markup.inline_keyboard.filter(row=>row[0].copy_text).length,p.copyButtons.length);assert(r.entities.some(e=>e.type==='hashtag'));}
 const spice=entries.find(p=>p.id==='okok-english-spice-20261023');
 assert.deepEqual(spice.copyButtons.map(b=>b.text),['No chilli, please.','Not too spicy, please.']);
});

test('all reviewed entries have short, explicit topics; universal restaurant phrases are not meal-specific',()=>{
 assert.equal(POSTS.length,48);
 for(const post of POSTS)assert(post.topics.length>=2&&post.topics.length<=3);
 const spice=POSTS.find(p=>p.id==='okok-english-spice-20261023');
 assert.deepEqual(spice.topics,['Фразы','Английский','Ресторан']);
 assert(!spice.topics.some(t=>['Завтрак','Обед','Ужин'].includes(t)));
});
test('hashtags remain clickable UTF-16 entities after branding, with original hidden/copy/link content intact',()=>{
 const url='https://ok-ok.click/?ref=preserve&lang=ru';
 const p={text:'🌴 Фраза\nHello!\nОтвет\n'+url,brandCTA:'share',topics:['Фразы','Английский','Приветствия'],copyText:'Hello!',buttons:[{text:'Сайт',url}],formatting:[{type:'spoiler',text:'Ответ'}]};
 const text=channelText(p),r=channelPresentation(p);
 assert(text.endsWith('#Фразы #Английский #Приветствия'));
 const tags=r.entities.filter(e=>e.type==='hashtag');assert.equal(tags.length,3);
 assert.deepEqual(tags.map(e=>text.slice(e.offset,e.offset+e.length)),['#Фразы','#Английский','#Приветствия']);
 assert(tags.every(e=>e.offset>text.indexOf(BRAND.ru.motto)));
 assert.equal(r.entities[0].offset,p.text.indexOf('Ответ'));
 assert.equal(r.reply_markup.inline_keyboard[0][0].copy_text.text,'Hello!');
 assert.equal(r.reply_markup.inline_keyboard[1][0].url,url);
});
test('invalid, duplicated or already appended topic tags are rejected',()=>{
 for(const topics of [[],['Фразы','Фразы'],['invent'],['Фразы','Английский','Ресторан','Ужин'],'Фразы'])assert.throws(()=>channelPresentation({text:'Post',topics}));
 assert.throws(()=>channelText({text:'Post #Фразы',topics:['Фразы']}));
 assert.equal(channelText({text:'Legacy'}),'Legacy');
});

test('legacy plain content is unchanged and HTML-like text stays literal',()=>{
 assert.deepEqual(channelPresentation({text:'A < B & C > D'}),{});
});
test('brand signature is outside existing entities and preserves original text, copy and URLs',()=>{
 const url='https://ok-ok.click/?utm_source=telegram&ref=keep';
 const p={text:'🌴 Заголовок\nA useful phrase\nОтвет\n'+url,brandCTA:'rate',copyText:'A useful phrase',buttons:[{text:'Сайт',url}],formatting:[{type:'spoiler',text:'Ответ'}]};
 const original=p.text,out=channelText(p),presentation=channelPresentation(p);
 assert.equal(p.text,original);assert(out.startsWith(original+'\n\n'));
 assert(out.endsWith(BRAND.ru.cta.rate+'\n'+BRAND.ru.motto));
 assert.equal(out.split(BRAND.ru.motto).length,2);
 for(const e of presentation.entities)assert(e.offset+e.length<=original.length);
 assert.equal(presentation.reply_markup.inline_keyboard[0][0].copy_text.text,p.copyText);
 assert.equal(presentation.reply_markup.inline_keyboard[1][0].url,url);
});
test('all contextual signatures are explicit; unknown or duplicate branding is rejected',()=>{
 for(const brandCTA of ['rate','share','warn'])assert(channelText({text:'Post',brandCTA}).includes(BRAND.ru.cta[brandCTA]));
 assert.equal(channelText({text:'Historical post'}),'Historical post');
 assert.throws(()=>channelText({text:'Post',brandCTA:'invent'}));
 assert.throws(()=>channelText({text:BRAND.ru.motto,brandCTA:'share'}));
});
test('copying requires one exact, unambiguous phrase within the post',()=>{
 for(const p of [{text:'hello',copyText:'absent'},{text:'hello hello',copyText:'hello'},{text:'hello',copyText:''},{text:'x'.repeat(257),copyText:'x'.repeat(257)},{text:'hello',copyText:['hello']}])assert.throws(()=>channelPresentation(p));
 assert.equal(channelPresentation({text:'x'.repeat(256),copyText:'x'.repeat(256)}).reply_markup.inline_keyboard.length,1);
});
test('links preserve referral bytes and merge with copying, never callback buttons',()=>{
 const url='https://t.me/SenateExchange_bot?start=fi10072';
 const p={text:'Show this phrase\n'+url,copyText:'Show this phrase',buttons:[{text:'Открыть условия',url}]};
 const rows=channelPresentation(p).reply_markup.inline_keyboard;
 assert.equal(rows.length,2);assert.equal(rows[1][0].url,url);
 for(const bad of [{text:'x',url:'javascript:alert(1)'},{text:'x',url:'https://other.example/'},{text:'x',url,callback_data:'x'}])assert.throws(()=>channelPresentation({...p,buttons:[bad]}));
});
test('three answers are three independent spoiler entities; footer remains visible',()=>{
 const p={text:'🌴 Вопрос\nПервый ответ\nВторой ответ\nТретий ответ\nhttps://ok-ok.click/',formatting:['Первый ответ','Второй ответ','Третий ответ'].map(text=>({type:'spoiler',text}))};
 const {entities}=channelPresentation(p);assert.equal(entities.length,3);
 for(const e of entities)assert.equal(p.text.slice(e.offset,e.offset+e.length).includes('https:'),false);
 assert.equal(entities[0].offset,p.text.indexOf('Первый'));
});
test('expandable explanations use full lines and reject overlapping or ambiguous spans',()=>{
 const p={text:'Главное\nПодробное пояснение\nИсточник: https://ok-ok.click/',formatting:[{type:'expandable_blockquote',text:'Подробное пояснение'}]};
 assert.equal(channelPresentation(p).entities[0].type,'expandable_blockquote');
 assert.throws(()=>channelPresentation({...p,formatting:[{type:'expandable_blockquote',text:'пояснение'}]}));
 assert.throws(()=>channelPresentation({...p,formatting:[...p.formatting,{type:'spoiler',text:'пояснение'}]}));
});
