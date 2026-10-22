import {test} from 'node:test';
import assert from 'node:assert/strict';
import {POSTS} from '../channel-posts.mjs';
import {channelPresentation} from '../channel-presentation.mjs';

test('reviewed queue has one complete bold heading and preserves every exact site link',()=>{
  const batch=POSTS.filter(p=>Date.parse(p.publishAt)>=Date.parse('2026-10-22T14:00:00+07:00'));
  assert.equal(batch.length,26);
  for(const p of batch){
    const presentation=channelPresentation(p), heading=p.text.split('\n')[0];
    assert.equal(presentation.entities.filter(e=>e.type==='bold'&&e.offset===0&&e.length===heading.length).length,1,p.id);
    const site=p.text.match(/https:\/\/ok-ok\.click\/[^\s]*/)?.[0];
    if(site)assert.equal(presentation.reply_markup.inline_keyboard.flat().filter(b=>b.url===site).length,1,p.id);
    if(p.photo)assert(p.text.length<=1024,p.id);
  }
});

test('copy phrases and source buttons remain useful alongside shared site buttons',()=>{
  const expected={
    'okok-english-spice-20261023':'No chilli, please.',
    'okok-menu-units-20261025':'How much is it altogether?',
    'okok-written-address-20261028':'Could you write down the address, please?'
  };
  for(const [id,phrase] of Object.entries(expected)){
    const p=POSTS.find(p=>p.id===id), buttons=channelPresentation(p).reply_markup.inline_keyboard.flat();
    assert.equal(buttons.find(b=>b.copy_text)?.copy_text.text,phrase);
    assert(buttons.some(b=>b.url?.startsWith('https://ok-ok.click/')));
  }
  const museum=POSTS.find(p=>p.id==='okok-art-in-paradise-20261026');
  assert.equal(channelPresentation(museum).reply_markup.inline_keyboard.flat().filter(b=>b.url).length,2);
});

test('28 October ordinary slots are complete and never borrow an old comic',()=>{
  const posts=POSTS.filter(p=>p.publishAt.startsWith('2026-10-28'));
  assert.deepEqual(posts.map(p=>p.publishAt.slice(11,16)),['09:00','14:00','19:30']);
  for(const p of posts){assert.equal(p.approved,true);assert.equal(Date.parse(p.expiresAt)-Date.parse(p.publishAt),3*3600000);}
  assert.equal(new Set(POSTS.map(p=>p.id)).size,POSTS.length);
});
