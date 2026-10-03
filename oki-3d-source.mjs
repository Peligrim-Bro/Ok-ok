// Build dependency: three@0.180.0 and esbuild. Runtime uses the checked-in bundle.
// npx esbuild oki-3d-source.mjs --bundle --minify --format=iife --target=es2020 --outfile=oki-3d.js --legal-comments=inline
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/* Procedural, genuinely three-dimensional OKI. No external textures or CDN. */
window.OKI3D={mount(host,options){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{return null;}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,30);
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);renderer.transmissionResolutionScale=.5;
 // Soft colored environment removes the square white studio reflections.
 const ec=document.createElement('canvas');ec.width=512;ec.height=256;const ex=ec.getContext('2d');ex.fillStyle='#100c25';ex.fillRect(0,0,512,256);for(const [x,y,r,c] of [[80,70,100,'#00c9ff'],[390,95,100,'#ff159f'],[240,30,65,'#aaa8ef'],[260,200,80,'#321566']]){const gradient=ex.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,c);gradient.addColorStop(1,'rgba(0,0,0,0)');ex.fillStyle=gradient;ex.fillRect(0,0,512,256);}const environmentTexture=new THREE.CanvasTexture(ec);environmentTexture.mapping=THREE.EquirectangularReflectionMapping;environmentTexture.colorSpace=THREE.SRGBColorSpace;const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromEquirectangular(environmentTexture);scene.environment=env.texture;scene.environmentIntensity=1.6;environmentTexture.dispose();pmrem.dispose();

 host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label',options.label||'OKI 3D');renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=options.interactive?0:-1;
 const root=new THREE.Group();scene.add(root);
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const geometry=g=>{geometries.add(g);return g;};
 const mat=params=>{const m=new THREE.MeshPhysicalMaterial(params);materials.add(m);return m;};
 // Fresnel shell: a clear center with substantial reflective edges, rather than uniform ghosting.
 const glass={roughness:.075,metalness:.08,clearcoat:1,clearcoatRoughness:.045,transmission:0,transparent:true,depthWrite:false,opacity:.9,ior:1.4,emissiveIntensity:.09};
 const cyan=mat({...glass,color:0xb1f3ff,attenuationColor:0xc4f7ff,emissive:0x00a2cf});
 const pink=mat({...glass,color:0xffb4e6,attenuationColor:0xffdaf2,emissive:0xff329d,opacity:.52});
 const headMat=mat({...glass,color:0xffcaee,attenuationColor:0xffe5f6,emissive:0xff64cf,opacity:.38});
 const hairMat=mat({...glass,color:0xffb4e6,attenuationColor:0xffdaf2,emissive:0xff64cf,opacity:.46});
 for(const shell of [cyan,pink,headMat,hairMat]){
  shell.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float shellEdge=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.0);
diffuseColor.a=mix(0.24,0.94,shellEdge);
outgoingLight+=diffuse*shellEdge*0.65;
#include <opaque_fragment>`);};
  shell.customProgramCacheKey=()=> 'oki-fresnel-shell-v99';
 }
 const white=mat({color:0xe9efff,roughness:.13,clearcoat:1});const pupil=mat({color:0x08182d,roughness:.055,clearcoat:1}),iris=mat({color:0x29cce9,roughness:.09,clearcoat:1,emissive:0x0096c8,emissiveIntensity:.16});
 const mouthMat=mat({color:0x7d184b,roughness:.35});const tongueMat=mat({color:0xff82a7,roughness:.3,clearcoat:1});
 const glow=new THREE.MeshBasicMaterial({color:new THREE.Color(1,.18,.7),toneMapped:false});materials.add(glow);const cyanGlow=new THREE.MeshBasicMaterial({color:new THREE.Color(.12,.9,1),toneMapped:false});materials.add(cyanGlow);
 const haloMat=color=>{const m=new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color(color)}},vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 tint;varying vec3 vN;varying vec3 vV;void main(){float edge=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.);gl_FragColor=vec4(tint,edge*.55);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});materials.add(m);return m;};const pinkHalo=haloMat(0xff2ebd),blueHalo=haloMat(0x00d5ff);
 function halo(mesh,m){const shell=new THREE.Mesh(mesh.geometry,m);shell.scale.setScalar(1.025);mesh.add(shell);}
 const ball=geometry(new THREE.SphereGeometry(1,48,32));
 function sphere(parent,m,x,y,z,sx,sy=sx,sz=sx){const o=new THREE.Mesh(ball,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);if(m===cyan||m===headMat||m===hairMat||m===pink)halo(o,m===cyan?blueHalo:pinkHalo);return o;}
 function tube(parent,points,r,m){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(geometry(new THREE.TubeGeometry(curve,Math.max(12,points.length*9),r,16,false)),m);parent.add(o);if(m===hairMat||m===pink)halo(o,pinkHalo);return o;}
 function ring(parent,x,y,z,r,m,rotation=0){const o=new THREE.Mesh(geometry(new THREE.TorusGeometry(r,.045,10,36)),m);o.position.set(x,y,z);o.rotation.x=rotation;parent.add(o);return o;}
 function limb(parent,a,b,r){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),o=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(r,Math.max(.01,va.distanceTo(vb)-r*2),6,12)),cyan);o.position.copy(va.clone().add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.clone().sub(va).normalize());parent.add(o);halo(o,blueHalo);return o;}
 const baby=options.stage===0;host.dataset.lifeStage=String(options.stage);host.dataset.characterHeight=baby?'2.0':options.stage===1?'2.85':'3.4';const body=new THREE.Group();root.add(body);const childScale=baby?.55:options.stage===1?.78:1;body.scale.setScalar(childScale);
 sphere(body,cyan,0,1.7,0,.38,.43,.29);sphere(body,cyan,0,1.18,0,.31,.19,.23);ring(body,0,1.34,0,.29,cyanGlow,Math.PI/2);
 sphere(body,pink,0,2.18,0,.13,.13,.14);ring(body,0,2.15,0,.13,pink,Math.PI/2);
 const heart=sphere(body,pink,0,1.78,.11,.12,.13,.1);sphere(body,glow,0,1.78,.21,.053);
 // Badge is a small 3D disk; canvas texture is generated locally.
 const badgeCanvas=document.createElement('canvas');badgeCanvas.width=badgeCanvas.height=128;const bc=badgeCanvas.getContext('2d');bc.clearRect(0,0,128,128);bc.fillStyle='#635ce2';bc.beginPath();bc.arc(64,64,56,0,Math.PI*2);bc.fill();bc.strokeStyle='#b2efff';bc.lineWidth=6;bc.stroke();bc.fillStyle='#fff';bc.font='bold 52px sans-serif';bc.textAlign='center';bc.textBaseline='middle';bc.fillText('OK',64,67);const badgeTex=new THREE.CanvasTexture(badgeCanvas);textures.add(badgeTex);const badgeMat=new THREE.MeshBasicMaterial({map:badgeTex,transparent:true});materials.add(badgeMat);const badge=new THREE.Mesh(geometry(new THREE.CircleGeometry(.12,32)),badgeMat);badge.position.set(.10,1.82,.319);body.add(badge);
 tube(body,[[-.25,1.98,.12],[-.33,1.80,.16],[-.26,1.48,.14]],.014,cyanGlow);tube(body,[[.25,1.98,.12],[.33,1.80,.16],[.26,1.48,.14]],.014,cyanGlow);
 // Curved front highlights follow each limb in model space.
 for(const side of [-1,1]){
  tube(body,[[side*.19,1.06,.13],[side*.26,.87,.15],[side*.30,.73,.14]],.012,cyanGlow);
  tube(body,[[side*.30,.65,.13],[side*.32,.49,.15],[side*.33,.35,.15]],.009,cyanGlow);
 }
 const legs=baby?[[-.18,.65,0,-.58,.37,.92],[.18,.65,0,.58,.37,.92]]:[[-.18,1.14,0,-.3,.32,.07],[.18,1.14,0,options.gender==='girl'?.62:.38,options.gender==='girl'?.62:.32,options.gender==='girl'?.15:.02]];if(baby){body.position.y=-.08;for(const mesh of body.children){if(mesh.position.y>1||mesh.geometry?.type==='TubeGeometry')mesh.position.y-=.43;}}
 for(const l of legs){const a=l.slice(0,3),b=l.slice(3);if(baby){const knee=[b[0]*.7,.45,.43];limb(body,a,knee,.13);limb(body,knee,b,.12);sphere(body,cyan,...knee,.14);}else{const knee=[b[0],.72,options.gender==='girl'&&b[0]>0?.18:.015];limb(body,a,knee,.14);limb(body,knee,b,.115);sphere(body,cyan,...knee,.13);}sphere(body,pink,...a,.13,.1,.13);sphere(body,pink,b[0],b[1],b[2],.14,.08,.14);ring(body,b[0],b[1],b[2],.12,glow,Math.PI/2);const shoe=sphere(body,cyan,b[0],baby?.33:(options.gender==='girl'&&b[0]>0?.46:.16),baby?1:(options.gender==='girl'&&b[0]>0?.37:.15),.22,baby?.19:.12,.27);if(!baby&&options.gender==='girl'&&b[0]>0)shoe.rotation.z=-.4;if(baby){shoe.rotation.x=-.65;sphere(body,pink,b[0],.30,1.22,.16,.15,.027);}}
 // Hands have five separated rounded fingers and a thumb, visible from every side.
 function hand(parent,x,y,z,rotation){const h=new THREE.Group();h.position.set(x,y,z);h.rotation.z=rotation;parent.add(h);sphere(h,pink,0,0,0,.14,.16,.07);for(let i=0;i<4;i++){const px=(i-1.5)*.065;limbFinger(h,[px,.1,0],[px*1.5,.3+(i===1||i===2?.04:0),.005],.034);}limbFinger(h,[-.1,.01,0],[-.24,.12,.02],.044);ring(h,0,-.14,0,.105,glow,Math.PI/2);return h;}
 function limbFinger(parent,a,b,r){tube(parent,[a,b],r,pink);sphere(parent,pink,...b,r);}
 const armLeft=new THREE.Group();armLeft.position.set(-.3,1.95,0);body.add(armLeft);limb(armLeft,[0,0,0],[-.4,-.31,.03],.085);limb(armLeft,[-.4,-.31,.03],[-.65,-.48,.1],.09);sphere(armLeft,pink,-.02,0,0,.14,.15,.13);sphere(armLeft,cyan,-.4,-.31,.03,.12);hand(armLeft,-.72,-.52,.1,2.35);
 const wave=new THREE.Group();wave.position.set(.3,1.95,0);body.add(wave);wave.rotation.z=options.gender==='girl'?.18:0;limb(wave,[0,0,0],[.35,.19,.03],.09);limb(wave,[.35,.19,.03],[.62,.56,.05],.085);sphere(wave,pink,0,0,0,.14,.15,.13);sphere(wave,cyan,.35,.19,.03,.115);hand(wave,.66,.72,.05,-.22);
 let diaperMat=null;if(baby){diaperMat=mat({color:0xe6e2ff,roughness:.45,clearcoat:.35});const diaper=sphere(body,diaperMat,0,.74,.07,.33,.20,.27);diaper.name='baby-diaper';sphere(body,pink,-.27,.78,.13,.06,.04,.07);sphere(body,pink,.27,.78,.13,.06,.04,.07);armLeft.position.y-=.43;armLeft.rotation.z=-.25;wave.position.y-=.43;}else if(options.gender==='girl'){armLeft.position.x=.3;armLeft.scale.x=-1;wave.position.x=-.3;wave.scale.x=-1;body.rotation.z=-.075;}
 const head=new THREE.Group();root.add(head);head.position.y=baby?1.37:childScale*2.18+.57;head.scale.setScalar(baby?.79:options.stage===1?.89:.96);root.userData.stage=options.stage;
 sphere(head,headMat,0,0,0,.69,.64,.6);
 sphere(head,pink,-.66,-.01,0,.135,.16,.12);sphere(head,pink,.66,-.01,0,.135,.16,.12);
 // Glowing contours are curved geometry on the actual surface, not a billboard.
 const forehead=[];for(let i=0;i<=32;i++){const a=-.1+i*Math.PI*1.2/32;forehead.push([Math.cos(a)*.665,Math.sin(a)*.655,.06]);}tube(head,forehead,.012,glow);
 const eyes=[],gaze=[];
 for(const x of [-.24,.24]){const group=new THREE.Group();group.position.set(x,.07,.558);head.add(group);sphere(group,white,0,0,0,.19,.225,.065);sphere(group,iris,0,-.01,.057,.131,.157,.035);sphere(group,pupil,0,-.018,.09,.085,.112,.022);sphere(group,white,-.027,.036,.112,.024,.024,.009);sphere(group,white,.034,-.062,.112,.01,.01,.007);eyes.push(group);
 gaze.push(group.children.filter(o=>o.material===iris||o.material===pupil));
 tube(head,[[x-.12,.30,.48],[x-.02,.36,.53],[x+.11,.30,.48]],.027,glow);
 }
 // Rounded pink facial volumes from the owner's reference, attached in 3D.
 const blush=mat({...glass,color:0xffa0d7,attenuationColor:0xffc9e8,emissive:0xea2589,opacity:.78});
 sphere(head,blush,0,-.12,.615,.095,.085,.085);
 sphere(head,blush,-.40,-.19,.49,.145,.10,.07);sphere(head,blush,.40,-.19,.49,.145,.10,.07);
 const smile=new THREE.Group();head.add(smile);const smileShape=new THREE.Shape();smileShape.moveTo(-.22,0);smileShape.quadraticCurveTo(0,-.29,.22,0);smileShape.quadraticCurveTo(0,-.045,-.22,0);const mouth=new THREE.Mesh(geometry(new THREE.ShapeGeometry(smileShape,24)),mouthMat);mouth.position.set(0,-.29,.543);smile.add(mouth);sphere(smile,tongueMat,0,-.405,.56,.11,.028,.012);tube(smile,[[-.22,-.29,.547],[0,-.312,.57],[.22,-.29,.547]],.009,pink);
 if(options.gender==='girl'){
  // Open-backed translucent bob, rounded locks and a swept fringe; no helmet.
  const bob=new THREE.Mesh(geometry(new THREE.SphereGeometry(1,40,28,Math.PI,Math.PI)),hairMat);bob.scale.set(.73,.69,.62);bob.position.set(0,.015,-.02);bob.name='girl-bob-back';head.add(bob);
  for(const side of [-1,1])for(let i=0;i<3;i++){
   const z=.06+i*.12,x=side*(.55+i*.018);
   tube(head,[[side*.30,.58,z-.12],[side*.58,.42,z],[side*.70,.03,z+.035],[side*.69,-.34,z+.02],[side*.54,-.43,z+.06]],.075-i*.008,hairMat);
  }
  tube(head,[[-.37,.49,.34],[-.18,.63,.39],[.04,.61,.49],[.24,.45,.54],[.27,.30,.53]],.065,hairMat);
  tube(head,[[-.13,.59,.44],[.07,.59,.53],[.23,.43,.57],[.21,.34,.56]],.042,pink);
  for(const x of [-.24,.24])for(let i=0;i<3;i++){const xx=x+(i-1)*.065;tube(head,[[xx,.25,.59],[xx+(x<0?-.04:.04),.32,.58]],.009,pupil);}
 }else{
  // Broad swept curl from the supplied character, with a curled tip rather than a thin antenna.
  const curl=tube(head,[[-.30,.57,.29],[-.12,.59,.42],[.10,.65,.40],[.23,.79,.31],[.22,.92,.23],[.13,.98,.20],[.055,.91,.24],[.11,.84,.31]],.082,hairMat);curl.name='boy-curl';
  tube(head,[[-.26,.62,.35],[-.10,.65,.48],[.10,.72,.46],[.18,.83,.36]],.012,glow);
 }
 host.dataset.floating='true';
 const key=new THREE.DirectionalLight(0xf2e7ff,3.4);key.position.set(-2,4,5);scene.add(key);const fill=new THREE.DirectionalLight(0x65dfff,1.5);fill.position.set(3,2,-2);scene.add(fill);const rim=new THREE.DirectionalLight(0xff38b7,2.5);rim.position.set(-3,3,-3);scene.add(rim);scene.add(new THREE.AmbientLight(0xaba3de,.65));
 const center=new THREE.Vector3(0,1.85,0);
 camera.position.set(.15,1.95,6.7);const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(center);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.dampingFactor=.12;controls.minPolarAngle=.65;controls.maxPolarAngle=2.15;controls.enabled=!!options.interactive;controls.rotateSpeed=.7;
 if(options.pose){const r=6.7,pol=options.pose.polar,az=options.pose.azimuth;camera.position.set(r*Math.sin(pol)*Math.sin(az),center.y+r*Math.cos(pol),r*Math.sin(pol)*Math.cos(az));}
 controls.update();
 let disposed=false,frame=0,last=0,needs=true,moving=false,currentMood=options.mood||'happy',currentSkin=options.skin||'neon';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function paint(mood,skin,hygiene=options.hygiene??85){if(diaperMat)diaperMat.color.setHex(hygiene<35?0xe2cde1:0xe6e2ff);currentMood=mood;currentSkin=skin;const palette=skin==='aurora'?[0xb099ff,0xef97ef]:skin==='sunset'?[0xffbb77,0xff89b9]:[0x00c9ed,0xff64cf];cyan.emissive.setHex(palette[0]);cyan.emissiveIntensity=.09;cyan.color.set(mood==='sleep'||mood==='tired'?0xabc5ff:mood==='quiet'||mood==='hungry'?0xc5b4fa:new THREE.Color(palette[0]).lerp(new THREE.Color(0xffffff),.3));pink.color.set(new THREE.Color(palette[1]).lerp(new THREE.Color(0xffffff),.25));headMat.color.set(mood==='sleep'||mood==='tired'?0xbacbff:mood==='quiet'||mood==='hungry'?0xd6b8f6:new THREE.Color(palette[1]).lerp(new THREE.Color(0xffffff),.4));headMat.emissive.setHex(palette[1]);headMat.emissiveIntensity=mood==='happy'?.09:.05;eyes.forEach(o=>o.scale.y=mood==='sleep'?.08:1);smile.scale.y=mood==='hungry'?.55:1;needs=true;}
 paint(currentMood,currentSkin);
 const abort=new AbortController();renderer.domElement.addEventListener('keydown',e=>{if(!options.interactive||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();const az=controls.getAzimuthalAngle()+(e.key==='ArrowLeft'?-.18:e.key==='ArrowRight'?.18:0),pol=THREE.MathUtils.clamp(controls.getPolarAngle()+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.65,2.15),r=6.7;if(e.key==='Home')camera.position.set(.15,1.95,6.7);else camera.position.set(r*Math.sin(pol)*Math.sin(az),center.y+r*Math.cos(pol),r*Math.sin(pol)*Math.cos(az));controls.update();needs=true;},{signal:abort.signal});
 controls.addEventListener('start',()=>{moving=true;host.dataset.dragging='true';});controls.addEventListener('end',()=>{moving=false;host.dataset.dragging='false';if(options.onPose)options.onPose({azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle()});});controls.addEventListener('change',()=>{needs=true;if(options.interactive&&options.onPose)options.onPose({azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle()});});
 function resize(){const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();needs=true;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function draw(time){if(disposed)return;frame=requestAnimationFrame(draw);if(document.hidden||time-last<(options.interactive?33:66))return;last=time;controls.update();
  // Reference pack's expressive poses, applied to real shoulder pivots.
  const resting=['sleep','tired'].includes(currentMood),thinking=['hungry','quiet'].includes(currentMood);
  const waveTarget=resting?-1.5:thinking?.35:(options.gender==='girl'?.18:0);
  const leftTarget=resting?.5:thinking?-.35:(baby?-.25:0);
  wave.rotation.z=THREE.MathUtils.lerp(wave.rotation.z,waveTarget+(!reduce&&!moving&&!resting?Math.sin(time*.003)*.13:0),.1);
  armLeft.rotation.z=THREE.MathUtils.lerp(armLeft.rotation.z,leftTarget+(!reduce&&!moving?Math.sin(time*.0016)*.04:0),.1);
  wave.rotation.x=THREE.MathUtils.lerp(wave.rotation.x,thinking?.45:resting?.25:0,.1);
  host.dataset.expression=resting?'calm':thinking?'think':'wave';needs=true;
  // Quiet/thinking look raises the pupils; sleep keeps its closed eyes.
  for(const pair of gaze)for(const part of pair){part.position.x=THREE.MathUtils.lerp(part.position.x,thinking?.028:0,.12);const base=part.material===iris?-.01:-.018;part.position.y=THREE.MathUtils.lerp(part.position.y,base+(thinking?.035:0),.12);}
  if(!reduce&&!moving){root.position.y=.06+Math.sin(time*.0018)*.07;root.rotation.z=Math.sin(time*.0011)*.025;head.rotation.z=Math.sin(time*.0015)*.04;const beat=1+Math.sin(time*.003)*.06;heart.scale.set(.12*beat,.13*beat,.1*beat);if(currentMood!=='sleep'){const blink=time%5900>5700;eyes.forEach(o=>o.scale.y=blink?.12:1);}}
  if(needs){renderer.render(scene,camera);needs=false;host.dataset.ready='true';host.dataset.azimuth=controls.getAzimuthalAngle().toFixed(3);}}
 frame=requestAnimationFrame(draw);
 return {update:paint,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();abort.abort();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}};
window.dispatchEvent(new Event('oki3dready'));
