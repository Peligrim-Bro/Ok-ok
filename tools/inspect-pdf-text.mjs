/* Render multilingual text as a bitmap so jsPDF standard fonts do not turn Thai/Cyrillic into question marks. */
export function pdfTextImage(text,{width=1000,fontSize=24,maxLines=4}={}){
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d');
 const lines=[];
 const source=String(text||'').split(/\r?\n/);
 ctx.font=fontSize+'px system-ui, sans-serif';
 for(const paragraph of source){
  let current='';
  for(const word of paragraph.split(/\s+/)){
   if(ctx.measureText(current?current+' '+word:word).width>width-32&&current){lines.push(current);current=word}else current=current?current+' '+word:word;
  }
  lines.push(current);
 }
 const shown=lines.slice(0,maxLines);
 canvas.width=width;canvas.height=Math.max(40,shown.length*(fontSize+12)+12);
 const c=canvas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,canvas.width,canvas.height);
 c.fillStyle='#111827';c.font=fontSize+'px system-ui, sans-serif';c.textBaseline='top';
 shown.forEach((line,i)=>c.fillText(line,12,8+i*(fontSize+12),width-24));
 return {dataUrl:canvas.toDataURL('image/png'),ratio:canvas.height/canvas.width};
}
