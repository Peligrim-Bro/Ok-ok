/* Local-only IndexedDB persistence for INSPECT. */
const DB='OK_OK_InspectDB',STORE='inspection_store',KEY='app_data';
function openDb(){
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined')return reject(new Error('IndexedDB unavailable'));
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('IndexedDB error'));
 });
}
async function operation(mode,value){
 const db=await openDb();
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
  const req=mode==='readonly'?store.get(KEY):store.put(value,KEY);
  let result;
  req.onsuccess=()=>{result=req.result};
  req.onerror=()=>reject(req.error);
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error||new Error('Transaction failed'));
  tx.onabort=()=>reject(tx.error||new Error('Transaction aborted'));
 })}finally{db.close()}
}
export const loadInspection=()=>operation('readonly');
export const saveInspection=data=>operation('readwrite',data);
