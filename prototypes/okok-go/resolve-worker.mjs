// Standalone Cloudflare Worker proof of concept. NOT deployed or routed in production.
// Explicit allowlist and manual redirects prevent arbitrary URL fetches (SSRF).
const allowed = host => host === 'maps.app.goo.gl' || host === 'goo.gl' || host === 'www.google.com' || host === 'google.com' || /^www\.google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host);
export function pointFrom(url) {
  const valid = (a,b) => Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a)<=90&&Math.abs(b)<=180;
  // Explicit destination pin wins over viewport centre. Never treat @ or ll as a pin.
  const pin = url.pathname.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const candidates = pin ? [pin.slice(1).join(',')] : [];
  candidates.push(...['destination','query','q'].map(key=>url.searchParams.get(key)).filter(Boolean));
  for(const value of candidates){
    const m=value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if(m&&valid(+m[1],+m[2]))return {lat:+m[1],lng:+m[2]};
  }
  return null;
}
export default {async fetch(request){
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
  if(request.method!=='POST')return json({error:'method_not_allowed'},405);
  if(Number(request.headers.get('content-length'))>4096)return json({error:'too_large'},413);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'unsupported_media_type'},415);
  let raw;try{raw=await request.text()}catch{return json({error:'invalid_body'},400)}
  if(new TextEncoder().encode(raw).length>4096)return json({error:'too_large'},413);
  let body;try{body=JSON.parse(raw)}catch{return json({error:'invalid_json'},400)}
  if(typeof body?.url!=='string'||body.url.length>2048)return json({error:'invalid_url'},400);
  let url;try{url=new URL(body.url)}catch{return json({error:'invalid_url'},400)}
  for(let hop=0;hop<5;hop++){
    if(url.protocol!=='https:'||url.username||url.password||url.port||!allowed(url.hostname))return json({error:'unsupported_host'},400);
    const direct=pointFrom(url);if(direct)return json({...direct,source:'url',needsConfirmation:true});
    if(!['maps.app.goo.gl','goo.gl'].includes(url.hostname)&&!url.pathname.startsWith('/maps'))return json({error:'unsupported_path'},400);
    let response;try{response=await fetch(url.toString(),{method:'GET',redirect:'manual',headers:{'accept':'text/html'},signal:AbortSignal.timeout(4500)})}catch{return json({error:'lookup_failed'},502)}
    await response.body?.cancel();
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
