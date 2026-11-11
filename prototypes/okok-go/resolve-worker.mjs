// Standalone Cloudflare Worker proof of concept. NOT deployed or routed in production.
// Explicit allowlist and manual redirects prevent arbitrary URL fetches (SSRF).
const allowed = host => host === 'maps.app.goo.gl' || host === 'goo.gl' || host === 'www.google.com' || host === 'google.com' || /^www\.google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host);
function pointFrom(url) {
  const candidates = [url.searchParams.get('destination'),url.searchParams.get('query'),url.searchParams.get('q'),url.searchParams.get('ll'),url.pathname,url.hash].filter(Boolean);
  for (const candidate of candidates) {
    const s = candidate;
    const match = s.match(/(?:!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+))|(?:@|^|[^\d.-])(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/);
    if (!match) continue;
    const lat=Number(match[1]??match[3]), lng=Number(match[2]??match[4]);
    if(Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180)return {lat,lng};
  }
  return null;
}
export default {async fetch(request){
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
  if(request.method!=='POST')return json({error:'method_not_allowed'},405);
  if(Number(request.headers.get('content-length'))>4096)return json({error:'too_large'},413);
  let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400)}
  if(typeof body?.url!=='string'||body.url.length>2048)return json({error:'invalid_url'},400);
  let url;try{url=new URL(body.url)}catch{return json({error:'invalid_url'},400)}
  for(let hop=0;hop<5;hop++){
    if(url.protocol!=='https:'||url.username||url.password||url.port||!allowed(url.hostname))return json({error:'unsupported_host'},400);
    const direct=pointFrom(url);if(direct)return json({...direct,source:'url',needsConfirmation:true});
    let response;try{response=await fetch(url.toString(),{method:'GET',redirect:'manual',headers:{'accept':'text/html'},signal:AbortSignal.timeout(4500)})}catch{return json({error:'lookup_failed'},502)}
    if(response.status>=300&&response.status<400){
      const location=response.headers.get('location');if(!location)return json({error:'missing_redirect'},422);
      try{url=new URL(location,url)}catch{return json({error:'invalid_redirect'},422)}
      continue;
    }
    // Do not scrape page text or infer a pin from viewport center.
    return json({error:'coordinates_not_available',hint:'Paste coordinates or a Google Maps URL containing an explicit pin'},422);
  }
  return json({error:'too_many_redirects'},422);
}};
