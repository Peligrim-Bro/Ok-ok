import base from './cloudflare-telegram-worker.mjs';
export {AdsStore} from './cloudflare-telegram-worker.mjs';
import {weatherResponse} from './weather-service.mjs';
import {channelWebhook,runChannelQueue} from './channel-publisher.mjs';
export {ChannelPublisher} from './channel-publisher.mjs';
export default {
 ...base,
 async fetch(request,env,ctx){
  if(new URL(request.url).pathname==='/api/weather')return weatherResponse(request,caches.default);
  const channelResponse=await channelWebhook(request,env);
  if(channelResponse)return channelResponse;
  return base.fetch(request,env,ctx);
 },
 async scheduled(event,env,ctx){ctx.waitUntil(runChannelQueue(env));}
};
