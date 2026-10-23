// Optional, explicitly reviewed presentation. Plain text stays the dedup identity.
import {BRAND,brandSignature} from './brand-copy.mjs';
import {topicTags} from './channel-topics.mjs';
const fail = () => { throw Error('invalid_channel_presentation'); };
export function channelText(post){
 let text=post.text;
 if(post.brandCTA!==undefined){
  if(typeof text!=='string'||text.includes(BRAND.ru.motto))return fail();
  text+='\n\n'+brandSignature(post.brandCTA);
 }
 const tags=topicTags(post);
 if(tags.length){
  if(typeof text!=='string'||tags.some(tag=>text.includes(tag)))return fail();
  text+='\n\n'+tags.join(' ');
 }
 return text;
}
function uniqueSpan(text, phrase) {
  if (typeof phrase !== 'string' || !phrase.trim()) return fail();
  const offset = text.indexOf(phrase);
  if (offset < 0 || text.indexOf(phrase, offset + 1) !== -1) return fail();
  return {offset, length: phrase.length}; // Telegram uses UTF-16, as JS does.
}
export function channelPresentation(post) {
  const composed=channelText(post); // Preserve legacy spans; tags go after the signature.
  const result = {}, rows = [];
  if (post.copyText !== undefined) {
    if (typeof post.copyText !== 'string' || post.copyText.length > 256) return fail();
    uniqueSpan(post.text, post.copyText);
    if(post.copyButtons===undefined)rows.push([{text: 'Скопировать фразу', copy_text: {text: post.copyText}}]);
  }
  if(post.copyButtons!==undefined){
    if(!Array.isArray(post.copyButtons)||post.copyButtons.length<1||post.copyButtons.length>3)return fail();
    const labels=new Set(),phrases=new Set();
    for(const button of post.copyButtons){
      if(!button||Object.keys(button).some(k=>!['label','text','source'].includes(k))||
        typeof button.label!=='string'||!button.label.trim()||button.label.length>40||/[\r\n\t]/.test(button.label)||
        typeof button.text!=='string'||!button.text.trim()||button.text.length>256||
        labels.has(button.label)||phrases.has(button.text))return fail();
      // A reviewed source disambiguates a phrase repeated in quiz choices/answer.
      // It is not sent to Telegram; formatting still addresses the original body.
      const source=button.source===undefined?post.text:button.source;
      if(button.source!==undefined)uniqueSpan(post.text,source);
      uniqueSpan(source,button.text);
      labels.add(button.label);phrases.add(button.text);
      rows.push([{text:button.label,copy_text:{text:button.text}}]);
    }
    if(post.copyText!==undefined&&!phrases.has(post.copyText))return fail();
  }
  if (post.buttons !== undefined) {
    if (!Array.isArray(post.buttons) || post.buttons.length > 6) return fail();
    for (const button of post.buttons) {
      if (!button || Object.keys(button).some(k => !['text', 'url'].includes(k)) ||
          typeof button.text !== 'string' || !button.text.trim() || button.text.length > 64 ||
          typeof button.url !== 'string' || !post.text.includes(button.url)) return fail();
      let url; try { url = new URL(button.url); } catch { return fail(); }
      if (url.protocol !== 'https:' || url.username || url.password) return fail();
      rows.push([{text: button.text, url: button.url}]); // Preserve exact referral/UTM URL.
    }
  }
  if (rows.length) result.reply_markup = {inline_keyboard: rows};
  if (post.formatting !== undefined) {
    if (!Array.isArray(post.formatting) || post.formatting.length > 20) return fail();
    const entities = post.formatting.map(item => {
      if (!item || Object.keys(item).some(k => !['type', 'text'].includes(k)) ||
          !['bold', 'spoiler', 'expandable_blockquote'].includes(item.type)) return fail();
      const span = uniqueSpan(post.text, item.text);
      if (item.type === 'expandable_blockquote' &&
          ((span.offset && post.text[span.offset - 1] !== '\n') ||
           (span.offset + span.length < post.text.length && post.text[span.offset + span.length] !== '\n'))) return fail();
      return {type: item.type, ...span};
    }).sort((a, b) => a.offset - b.offset);
    // Deliberately disallow nesting, so a footer cannot leak into a hidden answer.
    for (let i = 1; i < entities.length; i++) {
      if (entities[i].offset < entities[i - 1].offset + entities[i - 1].length) return fail();
    }
    if (entities.length) result.entities = entities;
  }
  const tags=topicTags(post);
  if(tags.length){
    let offset=composed.length-tags.join(' ').length;
    result.entities=[...(result.entities||[]),...tags.map(tag=>{
      const entity={type:'hashtag',offset,length:tag.length};offset+=tag.length+1;return entity;
    })];
  }
  return result;
}
