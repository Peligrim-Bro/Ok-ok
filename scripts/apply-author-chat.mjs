import {readFileSync,writeFileSync} from 'node:fs';
const path='site/public/index.html';
let html=readFileSync(path,'utf8');
const anchor='<main class="wrap" id="app"></main>';
if(!html.includes(anchor))throw Error('Author chat: app anchor missing');
html=html.replace(anchor,`<div class="wrap author-contact"><button class="btn" id="authorChatButton" type="button" aria-haspopup="dialog">Написать автору</button></div>
${anchor}
<dialog id="authorChatDialog" aria-labelledby="authorChatTitle">
 <div class="author-chat-heading"><h2 id="authorChatTitle"></h2><button class="btn" id="authorChatClose" type="button">×</button></div>
 <p id="authorChatLead"></p>
 <div class="author-chat-topics"></div>
 <p id="authorChatStatus" role="status" aria-live="polite"></p>
 <a id="authorChatFallback" href="https://tawk.to/chat/6ac5e0bddd1f0034bfdc8335/1k4afbpev" target="_blank" rel="noopener" hidden></a>
</dialog>`);
html=html.replace('</head>','<style id="okok-author-chat-style">'+readFileSync('author-chat.css','utf8')+'</style>\n</head>');
html=html.replace('</body>','<script id="okok-author-chat">'+readFileSync('author-chat.js','utf8')+'</script>\n</body>');
writeFileSync(path,html);
console.log('PASS: author chat, lazy tawk.to, localized contact and topics');
