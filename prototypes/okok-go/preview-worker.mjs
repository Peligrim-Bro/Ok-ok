import resolver from './resolve-worker.mjs';
export default {
 async fetch(request, env, ctx) {
  const url=new URL(request.url);
  if(url.pathname==='/api/resolve') {
   const origin=request.headers.get('Origin');
   if(origin && origin!==url.origin) return new Response('Forbidden',{status:403});
   return resolver.fetch(request);
  }
  if(url.pathname==='/' || url.pathname==='/index.html') {
   const assetUrl=new URL('/index.html',request.url);
   return env.ASSETS.fetch(new Request(assetUrl,request));
  }
  return env.ASSETS.fetch(request);
 }
};
