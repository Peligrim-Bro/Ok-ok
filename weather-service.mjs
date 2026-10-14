// Weather data from MET Norway (CC BY 4.0); adapted into visual conditions.
const cities={pattaya:[12.9236,100.8825],phuket:[7.8804,98.3923],bangkok:[13.7563,100.5018]};
const memory=new Map(),pending=new Map();
export function normalizeForecast(data,now=Date.now()){
 const list=data?.properties?.timeseries;
 const updated=Date.parse(data?.properties?.meta?.updated_at);
 if(!Array.isArray(list)||!Number.isFinite(updated)||now-updated>48*3600e3||updated>now+3600e3)throw Error('Invalid forecast');
 const point=list.filter(p=>Date.parse(p.time)<=now).at(-1);
 if(!point||now-Date.parse(point.time)>90*60e3)throw Error('Stale forecast');
 const code=point.data?.next_1_hours?.summary?.symbol_code;
 if(typeof code!=='string')throw Error('Missing current-hour conditions');
 const weather=code.includes('thunder')?'storm':code.includes('rain')||code.includes('sleet')?'rain':code.includes('fog')?'fog':code.startsWith('clearsky')||code.startsWith('fair')?'clear':code.includes('cloud')?'cloud':'unknown';
 const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hourCycle:'h23',timeZone:'Asia/Bangkok'}).format(now));
 return {weather,is_day:code.endsWith('_night')?0:code.endsWith('_day')?1:hour>=6&&hour<18?1:0,wind_speed_10m:Number(point.data.instant?.details?.wind_speed)||0,time:point.time,modelUpdatedAt:data.properties.meta.updated_at};
}
export async function weatherResponse(request,cache,fetcher=fetch,now=Date.now()){
 const u=new URL(request.url),city=u.searchParams.get('city');
 const reply=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store'}});
 if(request.method!=='GET')return reply({error:'method_not_allowed'},405);
 if(!Object.hasOwn(cities,city||''))return reply({error:'invalid_city'},400);
 const key=new Request('https://ok-ok.click/internal/weather/'+city);
 try{
  let saved=memory.get(city);
  if(!saved&&cache){const hit=await cache.match(key);if(hit)saved=await hit.json()}
  if(!saved||saved.expires<=now){
   if(!pending.has(city))pending.set(city,(async()=>{
    const [lat,lon]=cities[city];
    const headers={'User-Agent':'OK-OK-weather/1.0 https://ok-ok.click/'};
    if(saved?.modified)headers['If-Modified-Since']=saved.modified;
    const upstream=await fetcher(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,{headers,signal:AbortSignal.timeout(7000)});
    if(upstream.status!==304&&!upstream.ok)throw Error('Weather unavailable');
    const data=upstream.status===304?saved?.data:await upstream.json();if(!data)throw Error('No cached forecast');
    normalizeForecast(data,now);
    const expires=Math.max(now+60e3,Date.parse(upstream.headers.get('expires'))||now+15*60e3);
    const next={data,expires,modified:upstream.headers.get('last-modified')||saved?.modified};
    memory.set(city,next);
    if(cache)await cache.put(key,Response.json(next,{headers:{'cache-control':'public,max-age='+Math.ceil((expires-now)/1000)}}));
    return next;
   })().finally(()=>pending.delete(city)));
   saved=await pending.get(city);
  }
  return reply({current:normalizeForecast(saved.data,now),city,source:'MET Norway',sourceUrl:'https://api.met.no/doc/Locationforecast',license:'https://creativecommons.org/licenses/by/4.0/'});
 }catch(_){return reply({error:'weather_unavailable'},503)}
}
