import base from './cloudflare-telegram-worker.mjs';
export {AdsStore} from './cloudflare-telegram-worker.mjs';
import {weatherResponse} from './weather-service.mjs';
export default {
 ...base,
 async fetch(request,env,ctx){
  if(new URL(request.url).pathname==='/api/weather')return weatherResponse(request,caches.default);
  return base.fetch(request,env,ctx);
 }
};
