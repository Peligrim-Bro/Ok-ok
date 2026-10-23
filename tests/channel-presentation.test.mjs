import {test} from 'node:test';
import assert from 'node:assert/strict';
import {channelPresentation,channelText} from '../channel-presentation.mjs';
import {BRAND} from '../brand-copy.mjs';
import {POSTS} from '../channel-posts.mjs';

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
