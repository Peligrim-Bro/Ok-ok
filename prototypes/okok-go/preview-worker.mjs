import resolver from './resolve-worker.mjs';
export default {
 async fetch(request, env, ctx) {
  const url=new URL(request.url);
  if(url.pathname==='/api/resolve') {
   const origin=request.headers.get('Origin');
   if(origin && origin!==url.origin) return new Response('Forbidden',{status:403});
   if(env.RESOLVE_LIMITER){const {success}=await env.RESOLVE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});if(!success)return new Response(JSON.stringify({error:'rate_limited'}),{status:429,headers:{'content-type':'application/json','retry-after':'60','cache-control':'no-store'}});}
   return resolver.fetch(request);
  }
  if(url.pathname==='/' || url.pathname==='/index.html') {
   const assetUrl=new URL('/index.html',request.url);
   return env.ASSETS.fetch(new Request(assetUrl,request));
  }
  return env.ASSETS.fetch(request);
 }
};
