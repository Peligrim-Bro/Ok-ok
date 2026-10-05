/* OK-OK: real 3D crossed beams. Render once; animate only background taps. */
(()=>{
'use strict';
const canvas=document.createElement('canvas');canvas.id='spatial-background';canvas.setAttribute('aria-hidden','true');canvas.dataset.background='hedgehogs-3d-v102';canvas.style.opacity='.9';canvas.style.filter='none';document.body.prepend(canvas);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saveData=!!navigator.connection?.saveData;
let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:true})}catch{}
let ctx=null,program=null,buffer=null,locations=null;
let W=0,H=0,figures=[],frame=0,last=0,theme='',draws=0;
const colors=[[.20,.76,.74],[.65,.47,.85],[.28,.54,.88],[.90,.67,.24],[.74,.43,.66]];
// Triangle geometry for three intersecting rectangular beams, with face normals.
const mesh=[];
function beam(sx,sy,sz){
 const faces=[[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],[[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],[[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],[[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],[[0,0,1],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]]],[[0,0,-1],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]]];
 for(const [n,points] of faces)for(const i of [0,1,2,0,2,3])mesh.push([points[i][0]*sx,points[i][1]*sy,points[i][2]*sz,...n]);
}
beam(1,.19,.19);beam(.19,1,.19);beam(.19,.19,1);
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s}
if(gl){try{
 program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform vec2 viewport;varying vec3 color;void main(){gl_Position=vec4(p.x/viewport.x*2.0-1.0,1.0-p.y/viewport.y*2.0,-p.z/160.0,1.0);float lit=.35+.65*max(0.0,dot(normalize(n),normalize(vec3(-.5,-.7,1.0))));color=c*lit;}');
 const fs=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 color;void main(){gl_FragColor=vec4(color,1.0);}');
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');gl.deleteShader(vs);gl.deleteShader(fs);
 buffer=gl.createBuffer();locations={p:gl.getAttribLocation(program,'p'),n:gl.getAttribLocation(program,'n'),c:gl.getAttribLocation(program,'c'),viewport:gl.getUniformLocation(program,'viewport')};gl.enable(gl.DEPTH_TEST);
 }catch{gl=null;}}
if(!gl){const fallback=document.createElement('canvas');fallback.id=canvas.id;fallback.dataset.background=canvas.dataset.background;fallback.setAttribute('aria-hidden','true');fallback.style.cssText=canvas.style.cssText;canvas.replaceWith(fallback);ctx=fallback.getContext('2d');canvas.dataset.fallback='true';}
const surface=gl?canvas:document.getElementById('spatial-background');
function matrix(f){const [a,b,c]=f.rot.map(v=>[Math.cos(v),Math.sin(v)]);return [(v)=>{const y=v[1]*a[0]-v[2]*a[1],z=v[1]*a[1]+v[2]*a[0],x=v[0]*b[0]+z*b[1],zz=-v[0]*b[1]+z*b[0];return [x*c[0]-y*c[1],x*c[1]+y*c[0],zz]}][0]}
function seed(){
 const cols=Math.max(4,Math.ceil(W/72)),rows=Math.ceil(H/70),cellW=W/cols,cellH=H/rows;
 figures=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)figures.push({x:(x+.35+Math.random()*.5)*cellW,y:(y+.25+Math.random()*.55)*cellH,z:Math.random()*14,size:14+Math.random()*17,color:colors[(x+y*3)%colors.length],rot:[Math.random()*6.28,Math.random()*6.28,Math.random()*6.28],vx:0,vy:0,spin:0});
}
function resize(){W=innerWidth;H=innerHeight;const d=Math.min(devicePixelRatio||1,1.25);surface.width=Math.round(W*d);surface.height=Math.round(H*d);surface.style.width=W+'px';surface.style.height=H+'px';if(gl)gl.viewport(0,0,surface.width,surface.height);else if(ctx)ctx.setTransform(d,0,0,d,0,0);seed();requestDraw()}
function render(){
 if(!gl&&!ctx)return;
 const light=document.documentElement.dataset.theme==='light',vertices=[],triangles=[];
 for(const f of figures){const rotate=matrix(f),color=f.color.map(c=>light?c*.72:c);
  for(let i=0;i<mesh.length;i++){const v=mesh[i],p=rotate(v),n=rotate(v.slice(3)),position=[f.x+p[0]*f.size,f.y+p[1]*f.size,f.z+p[2]*f.size];vertices.push(...position,...n,...color);if(ctx)triangles.push({position,n,color});}
 }
 if(gl){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);for(const [key,offset] of [['p',0],['n',12],['c',24]]){gl.enableVertexAttribArray(locations[key]);gl.vertexAttribPointer(locations[key],3,gl.FLOAT,false,36,offset)}gl.uniform2f(locations.viewport,W,H);gl.drawArrays(gl.TRIANGLES,0,vertices.length/9)}
 else{ctx.clearRect(0,0,W,H);const faces=[];for(let i=0;i<triangles.length;i+=3)faces.push(triangles.slice(i,i+3));faces.sort((a,b)=>a.reduce((s,v)=>s+v.position[2],0)-b.reduce((s,v)=>s+v.position[2],0));for(const face of faces){const {n,color}=face[0],lit=.35+.65*Math.max(0,(-.5*n[0]-.7*n[1]+n[2])/Math.hypot(.5,.7,1));ctx.fillStyle='rgb('+color.map(c=>Math.round(c*lit*255)).join(',')+')';ctx.beginPath();face.forEach((v,i)=>ctx[i?'lineTo':'moveTo'](v.position[0],v.position[1]));ctx.closePath();ctx.fill();}}
 surface.dataset.renders=String(++draws);surface.dataset.renderer=gl?'webgl':'canvas-3d';
}
function requestDraw(){if(!document.hidden&&!frame)frame=requestAnimationFrame(tick)}
function tick(now){frame=0;if(document.hidden)return;const step=Math.min(2.5,(now-last)/16.67||1);last=now;let active=false;
 for(const f of figures){if(reduced.matches||saveData){f.vx=f.vy=f.spin=0;continue}if(Math.abs(f.vx)+Math.abs(f.vy)+Math.abs(f.spin)<.025){f.vx=f.vy=f.spin=0;continue}active=true;f.x=Math.max(f.size,Math.min(W-f.size,f.x+f.vx*step));f.y=Math.max(f.size,Math.min(H-f.size,f.y+f.vy*step));f.rot[0]+=f.spin*step;f.rot[1]+=f.spin*.7*step;f.rot[2]+=f.spin*.4*step;const damping=Math.pow(.88,step);f.vx*=damping;f.vy*=damping;f.spin*=damping;}
 render();if(active)requestDraw();else last=0;
}
document.addEventListener('pointerdown',e=>{
 if(reduced.matches||saveData||e.target.closest('button,a,input,select,textarea,summary,header,nav,.card,.news-card,.okad,[role="dialog"],.install-mask,.sheet,.spatial-hero'))return;
 let moved=false;for(const f of figures){const dx=f.x-e.clientX,dy=f.y-e.clientY,d=Math.hypot(dx,dy);if(d>135)continue;const strength=(1-d/135)*5;f.vx=(dx/(d||1)||.5)*strength;f.vy=(dy/(d||1)||.3)*strength;f.spin=(Math.random()-.5)*.18; moved=true;}if(moved)requestDraw();
},{passive:true});
new MutationObserver(()=>{const next=document.documentElement.dataset.theme;if(next===theme)return;theme=next;requestDraw()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
reduced.addEventListener('change',()=>requestDraw());document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}else requestDraw()});
surface.addEventListener('webglcontextlost',e=>{e.preventDefault();if(frame)cancelAnimationFrame(frame);frame=0;surface.style.display='none'});
addEventListener('resize',resize,{passive:true});resize();
})();
/* Preserve tactile button feedback. */
document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,.btn,.chip,a[role="button"],nav.tab a');if(!el)return;el.classList.remove('ok-press');void el.offsetWidth;el.classList.add('ok-press');setTimeout(()=>el.classList.remove('ok-press'),480)},{passive:true});
