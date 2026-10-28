// Static-only game preview: never import the production backend or its storage.
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
  if(url.pathname==='/')return Response.redirect(new URL('/oki-house.html',url),302);
  if(!['/oki-house.html','/oki-game-v2.webp','/oki-walk-v1.webp','/oki-actions-v1.webp'].includes(url.pathname))return new Response('Not found',{status:404});
  return env.ASSETS.fetch(request);
 }
};
