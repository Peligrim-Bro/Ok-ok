// Build dependency: three@0.180.0 and esbuild. Runtime uses the checked-in bundle.
// npx esbuild oki-3d-source.mjs --bundle --minify --format=iife --target=es2020 --outfile=oki-3d.js --legal-comments=inline
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
/* Procedural, genuinely three-dimensional OKI. No external textures or CDN. */
window.OKI3D={mount(host,options){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{return null;}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,30);
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);renderer.transmissionResolutionScale=.5;
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.6;room.dispose();pmrem.dispose();
 host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label',options.label||'OKI 3D');renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=options.interactive?0:-1;
 const root=new THREE.Group();scene.add(root);
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const geometry=g=>{geometries.add(g);return g;};
 const mat=params=>{const m=new THREE.MeshPhysicalMaterial(params);materials.add(m);return m;};
 const cyan=mat({color:0x73e8ff,roughness:.15,metalness:.12,clearcoat:1,clearcoatRoughness:.08,transmission:.52,thickness:.35,ior:1.4,emissive:0x1394bd,emissiveIntensity:.22});
 const pink=mat({color:0xff58bf,roughness:.14,metalness:.12,clearcoat:1,transmission:.23,thickness:.2,emissive:0xff329d,emissiveIntensity:.25});
 const headMat=mat({color:0xffa5d8,roughness:.08,metalness:.05,clearcoat:1,transmission:.52,thickness:.65,ior:1.35,emissive:0x892965,emissiveIntensity:.1});
 const hairMat=mat({color:0xda84f0,roughness:.15,metalness:.1,clearcoat:1,transmission:.35,thickness:.25,emissive:0xb433d4,emissiveIntensity:.15});
 const white=mat({color:0xffffff,roughness:.13,clearcoat:1});const pupil=mat({color:0x162147,roughness:.18,clearcoat:1});const iris=mat({color:0x19afca,roughness:.18,metalness:.3,clearcoat:1});
 const mouthMat=mat({color:0x7d184b,roughness:.35});const tongueMat=mat({color:0xff82a7,roughness:.3,clearcoat:1});
 const glow=new THREE.MeshBasicMaterial({color:0xffa4e1});materials.add(glow);const cyanGlow=new THREE.MeshBasicMaterial({color:0x7cf3ff});materials.add(cyanGlow);
 const ball=geometry(new THREE.SphereGeometry(1,32,24));
 function sphere(parent,m,x,y,z,sx,sy=sx,sz=sx){const o=new THREE.Mesh(ball,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
 function tube(parent,points,r,m){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(geometry(new THREE.TubeGeometry(curve,Math.max(12,points.length*9),r,8,false)),m);parent.add(o);return o;}
 function ring(parent,x,y,z,r,m,rotation=0){const o=new THREE.Mesh(geometry(new THREE.TorusGeometry(r,.045,10,36)),m);o.position.set(x,y,z);o.rotation.x=rotation;parent.add(o);return o;}
 function limb(parent,a,b,r){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),o=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(r,Math.max(.01,va.distanceTo(vb)-r*2),6,12)),cyan);o.position.copy(va.clone().add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.clone().sub(va).normalize());parent.add(o);return o;}
 const baby=options.stage===0;host.dataset.lifeStage=String(options.stage);host.dataset.characterHeight=baby?'2.0':options.stage===1?'2.85':'3.4';const body=new THREE.Group();root.add(body);const childScale=baby?.55:options.stage===1?.78:1;body.scale.setScalar(childScale);
 sphere(body,cyan,0,1.7,0,.37,.48,.26);sphere(body,cyan,0,1.18,0,.31,.19,.23);ring(body,0,1.34,0,.29,cyanGlow,Math.PI/2);
 sphere(body,pink,0,2.18,0,.13,.13,.14);ring(body,0,2.15,0,.13,pink,Math.PI/2);
 const heart=sphere(body,pink,0,1.78,.11,.12,.13,.1);sphere(body,glow,0,1.78,.21,.053);
 // Badge is a small 3D disk; canvas texture is generated locally.
 const badgeCanvas=document.createElement('canvas');badgeCanvas.width=badgeCanvas.height=128;const bc=badgeCanvas.getContext('2d');bc.clearRect(0,0,128,128);bc.fillStyle='#635ce2';bc.beginPath();bc.arc(64,64,56,0,Math.PI*2);bc.fill();bc.strokeStyle='#b2efff';bc.lineWidth=6;bc.stroke();bc.fillStyle='#fff';bc.font='bold 52px sans-serif';bc.textAlign='center';bc.textBaseline='middle';bc.fillText('OK',64,67);const badgeTex=new THREE.CanvasTexture(badgeCanvas);textures.add(badgeTex);const badgeMat=new THREE.MeshBasicMaterial({map:badgeTex,transparent:true});materials.add(badgeMat);const badge=new THREE.Mesh(geometry(new THREE.CircleGeometry(.12,32)),badgeMat);badge.position.set(.13,1.82,.263);body.add(badge);
 tube(body,[[-.25,1.98,.12],[-.33,1.80,.16],[-.26,1.48,.14]],.014,cyanGlow);tube(body,[[.25,1.98,.12],[.33,1.80,.16],[.26,1.48,.14]],.014,cyanGlow);
 const legs=baby?[[-.18,.65,0,-.55,.4,.85],[.18,.65,0,.55,.4,.85]]:[[-.18,1.14,0,-.3,.32,.07],[.18,1.14,0,.38,.32,.02]];if(baby){body.position.y=-.08;for(const mesh of body.children){if(mesh.position.y>1||mesh.geometry?.type==='TubeGeometry')mesh.position.y-=.43;}}
 for(const l of legs){const a=l.slice(0,3),b=l.slice(3);if(baby){const knee=[b[0]*.7,.45,.43];limb(body,a,knee,.13);limb(body,knee,b,.12);sphere(body,cyan,...knee,.14);}else limb(body,a,b,.1);sphere(body,pink,...a,.13,.1,.13);sphere(body,pink,b[0],b[1],b[2],.14,.08,.14);ring(body,b[0],b[1],b[2],.12,glow,Math.PI/2);const shoe=sphere(body,cyan,b[0],baby?.33:.16,baby?1:.15,.22,baby?.19:.12,.27);if(baby){shoe.rotation.x=-.65;sphere(body,pink,b[0],.30,1.22,.16,.15,.027);}}
 // Hands have five separated rounded fingers and a thumb, visible from every side.
 function hand(parent,x,y,z,rotation){const h=new THREE.Group();h.position.set(x,y,z);h.rotation.z=rotation;parent.add(h);sphere(h,pink,0,0,0,.14,.16,.07);for(let i=0;i<4;i++){const px=(i-1.5)*.065;limbFinger(h,[px,.1,0],[px*1.5,.3+(i===1||i===2?.04:0),.005],.034);}limbFinger(h,[-.1,.01,0],[-.24,.12,.02],.044);ring(h,0,-.14,0,.105,glow,Math.PI/2);return h;}
 function limbFinger(parent,a,b,r){tube(parent,[a,b],r,pink);sphere(parent,pink,...b,r);}
 const armLeft=new THREE.Group();body.add(armLeft);limb(armLeft,[-.3,1.95,0],[-.7,1.64,.03],.085);limb(armLeft,[-.7,1.64,.03],[-.95,1.47,.1],.09);sphere(armLeft,pink,-.32,1.95,0,.14,.15,.13);sphere(armLeft,cyan,-.7,1.64,.03,.12);hand(armLeft,-1.02,1.43,.1,2.35);
 const wave=new THREE.Group();wave.position.set(.3,1.95,0);body.add(wave);limb(wave,[0,0,0],[.35,.19,.03],.09);limb(wave,[.35,.19,.03],[.62,.56,.05],.085);sphere(wave,pink,0,0,0,.14,.15,.13);sphere(wave,cyan,.35,.19,.03,.115);hand(wave,.66,.72,.05,-.22);
 if(baby){armLeft.position.y=-.43;wave.position.y-=.43;}const head=new THREE.Group();root.add(head);head.position.y=baby?1.37:childScale*2.18+.57;head.scale.setScalar(baby?.79:options.stage===1?.89:.96);root.userData.stage=options.stage;
 sphere(head,headMat,0,0,0,.66,.65,.6);
 sphere(head,pink,-.66,-.01,0,.135,.16,.12);sphere(head,pink,.66,-.01,0,.135,.16,.12);
 // Glowing contours are curved geometry on the actual surface, not a billboard.
 const forehead=[];for(let i=0;i<=32;i++){const a=-.1+i*Math.PI*1.2/32;forehead.push([Math.cos(a)*.665,Math.sin(a)*.655,.06]);}tube(head,forehead,.007,glow);
 const eyes=[];
 for(const x of [-.24,.24]){const group=new THREE.Group();group.position.set(x,.055,.516);head.add(group);sphere(group,white,0,0,0,.17,.205,.065);sphere(group,iris,0,-.01,.057,.111,.135,.035);sphere(group,pupil,0,-.018,.09,.067,.093,.022);sphere(group,white,-.027,.036,.112,.024,.024,.009);sphere(group,white,.034,-.062,.112,.01,.01,.007);eyes.push(group);
 tube(head,[[x-.12,.30,.48],[x-.02,.34,.53],[x+.11,.30,.48]],.023,glow);
 }
 // Small natural nose and subtle translucent blush: no red ball or painted cheeks.
 sphere(head,headMat,0,-.12,.595,.054,.045,.032);const blush=mat({color:0xffb4d7,roughness:.3,transmission:.65,thickness:.03,transparent:true,opacity:.35});sphere(head,blush,-.37,-.17,.492,.095,.048,.012);sphere(head,blush,.37,-.17,.492,.095,.048,.012);
 const smile=new THREE.Group();head.add(smile);sphere(smile,mouthMat,0,-.335,.506,.15,.068,.018);sphere(smile,tongueMat,0,-.36,.529,.083,.022,.011);tube(smile,[[-.145,-.30,.537],[0,-.31,.553],[.145,-.30,.537]],.014,glow);
 if(options.gender==='girl'){
  // A volumetric bob around the BACK and SIDES of the head, with a swept fringe.
  const backHair=sphere(head,hairMat,0,.06,-.12,.74,.70,.54);backHair.name='girl-bob-back';
  for(const side of [-1,1]){sphere(head,hairMat,side*.61,-.055,.06,.15,.50,.28);tube(head,[[side*.48,.50,.29],[side*.70,.20,.25],[side*.72,-.23,.20],[side*.61,-.49,.21]],.024,glow);}
  tube(head,[[-.39,.49,.30],[-.14,.67,.24],[.19,.60,.38],[.36,.38,.50]],.092,hairMat);
  for(const x of [-.24,.24])for(let i=0;i<3;i++){const xx=x+(i-1)*.065;tube(head,[[xx,.21,.562],[xx+(x<0?-.04:.04),.29,.54]],.011,pupil);}
 }else{
  const curl=tube(head,[[-.17,.59,.15],[.01,.69,.20],[.19,.80,.13],[.15,.91,.08],[.045,.86,.075],[.085,.77,.14]],.061,pink);curl.name='boy-curl';tube(head,[[-.16,.61,.20],[.03,.72,.25],[.17,.82,.18]],.012,glow);
 }
 const platform=new THREE.Mesh(geometry(new THREE.CylinderGeometry(1.14,1.18,.05,64)),mat({color:0x25213d,roughness:.2,metalness:.55,clearcoat:1}));platform.position.y=.025;scene.add(platform);ring(scene,0,.06,0,1.14,cyanGlow,Math.PI/2);
 const key=new THREE.DirectionalLight(0xffffff,2.7);key.position.set(-2,4,5);scene.add(key);const fill=new THREE.DirectionalLight(0x65dfff,2);fill.position.set(3,2,-2);scene.add(fill);const rim=new THREE.DirectionalLight(0xff79d2,3);rim.position.set(-3,3,-3);scene.add(rim);scene.add(new THREE.AmbientLight(0xb4a6fa,.8));
 const center=new THREE.Vector3(0,1.85,0);camera.position.set(.15,1.95,6.7);const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(center);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.dampingFactor=.12;controls.minPolarAngle=.65;controls.maxPolarAngle=2.15;controls.enabled=!!options.interactive;controls.rotateSpeed=.7;
 if(options.pose){const r=6.7,pol=options.pose.polar,az=options.pose.azimuth;camera.position.set(r*Math.sin(pol)*Math.sin(az),center.y+r*Math.cos(pol),r*Math.sin(pol)*Math.cos(az));}
 controls.update();
 let disposed=false,frame=0,last=0,needs=true,moving=false,currentMood=options.mood||'happy',currentSkin=options.skin||'neon';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function paint(mood,skin){currentMood=mood;currentSkin=skin;const palette=skin==='aurora'?[0xb099ff,0xef97ef]:skin==='sunset'?[0xffbb77,0xff89b9]:[0x42d7ff,0xff65cc];cyan.color.setHex(mood==='sleep'||mood==='tired'?0x83add5:mood==='quiet'||mood==='hungry'?0xb093ef:palette[0]);pink.color.setHex(palette[1]);headMat.color.setHex(mood==='sleep'||mood==='tired'?0xb1bce8:mood==='quiet'||mood==='hungry'?0xd3b0eb:palette[1]);headMat.emissive.setHex(palette[1]);headMat.emissiveIntensity=mood==='happy'?.13:.04;eyes.forEach(o=>o.scale.y=mood==='sleep'?.08:1);smile.scale.y=mood==='hungry'?.55:1;needs=true;}
 paint(currentMood,currentSkin);
 const abort=new AbortController();renderer.domElement.addEventListener('keydown',e=>{if(!options.interactive||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();const az=controls.getAzimuthalAngle()+(e.key==='ArrowLeft'?-.18:e.key==='ArrowRight'?.18:0),pol=THREE.MathUtils.clamp(controls.getPolarAngle()+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.65,2.15),r=6.7;if(e.key==='Home')camera.position.set(.15,1.95,6.7);else camera.position.set(r*Math.sin(pol)*Math.sin(az),center.y+r*Math.cos(pol),r*Math.sin(pol)*Math.cos(az));controls.update();needs=true;},{signal:abort.signal});
 controls.addEventListener('start',()=>{moving=true;host.dataset.dragging='true';});controls.addEventListener('end',()=>{moving=false;host.dataset.dragging='false';if(options.onPose)options.onPose({azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle()});});controls.addEventListener('change',()=>{needs=true;if(options.interactive&&options.onPose)options.onPose({azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle()});});
 function resize(){const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();needs=true;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function draw(time){if(disposed)return;frame=requestAnimationFrame(draw);if(document.hidden||time-last<33)return;last=time;controls.update();if(!reduce&&!moving){root.position.y=Math.sin(time*.0018)*.014;wave.rotation.z=currentMood==='sleep'?0:Math.sin(time*.002)*.025;const beat=1+Math.sin(time*.003)*.06;heart.scale.set(.12*beat,.13*beat,.1*beat);if(currentMood!=='sleep'){const blink=time%5900>5700;eyes.forEach(o=>o.scale.y=blink?.12:1);}needs=true;}if(needs){renderer.render(scene,camera);needs=false;host.dataset.ready='true';host.dataset.azimuth=controls.getAzimuthalAngle().toFixed(3);}}
 frame=requestAnimationFrame(draw);
 return {update:paint,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();abort.abort();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}};
window.dispatchEvent(new Event('oki3dready'));
