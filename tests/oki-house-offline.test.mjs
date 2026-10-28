import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
for(const suffix of ['', '-en','-th'])for(const extension of ['','.html'])test('offline House navigation '+suffix+extension,async()=>{
 const handlers={};const path='/oki-house'+suffix+'.html';
 const self={location:{origin:'https://ok-ok.click'},addEventListener:(type,handler)=>{handlers[type]=handler;}};
 const cache={match:async key=>new Response(key===path?'HOUSE':'HOME')};
 new Script(readFileSync('site/public/sw.js','utf8')).runInNewContext({self,caches:cache,URL,Response,fetch:async()=>{throw Error('offline');}});
 let result;handlers.fetch({request:{url:'https://ok-ok.click/oki-house'+suffix+extension+'?embed=1',method:'GET',mode:'navigate'},respondWith:p=>{result=p;}});
 assert.equal(await (await result).text(),'HOUSE');
});
