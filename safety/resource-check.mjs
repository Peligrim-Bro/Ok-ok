// Pure matching only: this module does not fetch submitted URLs or assess honesty.
export function normalizeBusiness(value){return String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
export function findBusinesses(records,input){
 const raw=String(input).trim().slice(0,200);if(!raw)return {records:[],invalid:false};
 if(/^(?:[a-z][a-z0-9+.-]*:|www\.)/i.test(raw)||/^[a-z0-9.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(raw)){
  let u;try{u=new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw)?raw:'https://'+raw);}catch{return {records:[],invalid:true};}
  if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return {records:[],invalid:true};
  const host=u.hostname.replace(/^www\./,'').toLowerCase();let path;try{path=decodeURIComponent(u.pathname).replace(/\/$/,'').toLowerCase()}catch{return {records:[],invalid:true}};
  return {invalid:false,records:records.filter(r=>[r.website,r.source.url,r.rating?.url].filter(Boolean).some(address=>{const a=new URL(address);const ap=decodeURIComponent(a.pathname).replace(/\/$/,'').toLowerCase();return a.hostname.replace(/^www\./,'').toLowerCase()===host&&(host==='google.com'?ap===path&&a.search===u.search:ap===path||(!host.endsWith('canva.site')&&ap===''));}))};
 }
 const tokens=normalizeBusiness(raw).split(' ').filter(Boolean);
 return {invalid:false,records:records.filter(r=>{const aliases=[r.name,...r.aliases].map(normalizeBusiness);return aliases.some(s=>tokens.every(t=>(s+' pattaya паттайя พัทยา').includes(t)));})};
}
export function reportAge(date,today){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!/^\d{4}-\d{2}-\d{2}$/.test(today||''))return null;
 const a=Date.parse(date+'T00:00:00Z'),b=Date.parse(today+'T00:00:00Z');
 if(!Number.isFinite(a)||!Number.isFinite(b)||new Date(a).toISOString().slice(0,10)!==date||a>b)return null;
 return Math.floor((b-a)/86400000);
}
