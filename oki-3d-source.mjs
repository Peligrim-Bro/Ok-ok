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
  const centerOpacity=shell===pink?.62:shell===cyan?.48:.43;
  shell.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float shellEdge=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.0);
diffuseColor.a=mix(${centerOpacity.toFixed(2)},0.96,shellEdge);
vec3 shellReflection=reflect(-normalize(vViewPosition),normalize(normal));
float softStrip=pow(max(0.0,dot(shellReflection,normalize(vec3(-0.65,0.8,0.9)))),18.0);
float coolStrip=pow(max(0.0,dot(shellReflection,normalize(vec3(0.85,0.15,0.65)))),28.0);
outgoingLight+=emissive*(0.48+shellEdge*0.7)+diffuse*(shellEdge*0.9+0.13)+vec3(1.0,0.75,0.95)*softStrip*2.3+vec3(0.25,0.85,1.0)*coolStrip*1.8;
#include <opaque_fragment>`);};
  shell.customProgramCacheKey=()=> 'oki-fresnel-shell-v101-'+centerOpacity;
 }
 const white=mat({color:0xe9efff,roughness:.13,clearcoat:1});const pupil=mat({color:0x08182d,roughness:.055,clearcoat:1}),iris=mat({color:0x29cce9,roughness:.09,clearcoat:1,emissive:0x0096c8,emissiveIntensity:.16});
 const mouthMat=mat({color:0x7d184b,roughness:.35});const tongueMat=mat({color:0xff82a7,roughness:.3,clearcoat:1});
 const glow=new THREE.MeshBasicMaterial({color:new THREE.Color(1,.18,.7),toneMapped:false});materials.add(glow);const cyanGlow=new THREE.MeshBasicMaterial({color:new THREE.Color(.12,.9,1),toneMapped:false});materials.add(cyanGlow);
 const haloMat=color=>{const m=new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color(color)}},vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 tint;varying vec3 vN;varying vec3 vV;void main(){float edge=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.);gl_FragColor=vec4(tint,edge*.55);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});materials.add(m);return m;};const pinkHalo=haloMat(0xff2ebd),blueHalo=haloMat(0x00d5ff);
 const softHalos=new Map();
 function halo(mesh,m){const shell=new THREE.Mesh(mesh.geometry,m);shell.scale.setScalar(1.025);mesh.add(shell);
  if(!softHalos.has(m)){const soft=m.clone();soft.fragmentShader=soft.fragmentShader.replace('edge*.55','edge*.11');materials.add(soft);softHalos.set(m,soft);}
  const haze=new THREE.Mesh(mesh.geometry,softHalos.get(m));haze.scale.setScalar(1.075);mesh.add(haze);
 }
 const ball=geometry(new THREE.SphereGeometry(1,48,32));
 const faceGeometry=geometry(ball.clone()),facePositions=faceGeometry.attributes.position;
 for(let i=0;i<facePositions.count;i++){const x=facePositions.getX(i),y=facePositions.getY(i),z=facePositions.getZ(i);const cheeks=1+.05*Math.exp(-Math.pow((y+.28)/.24,2));const jaw=y<-.45?1-.12*((-y-.45)/.55):1;facePositions.setXYZ(i,x*cheeks*jaw,y,z);}
 faceGeometry.computeVertexNormals();
 function sphere(parent,m,x,y,z,sx,sy=sx,sz=sx){const o=new THREE.Mesh(m===headMat?faceGeometry:ball,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);if(m===cyan||m===headMat||m===hairMat||m===pink)halo(o,m===cyan?blueHalo:pinkHalo);return o;}
 function tube(parent,points,r,m){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(geometry(new THREE.TubeGeometry(curve,Math.max(12,points.length*9),r,16,false)),m);parent.add(o);if(m===hairMat||m===pink)halo(o,pinkHalo);return o;}
 function ring(parent,x,y,z,r,m,rotation=0){const o=new THREE.Mesh(geometry(new THREE.TorusGeometry(r,.045,10,36)),m);o.position.set(x,y,z);o.rotation.x=rotation;parent.add(o);return o;}
 function limb(parent,a,b,r){
  const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),length=va.distanceTo(vb);
  const profile=[];for(let i=0;i<=24;i++){const t=i/24;profile.push(new THREE.Vector2(r*Math.pow(Math.sin(Math.PI*t),.48)*(1+.12*Math.sin(Math.PI*t)),(t-.5)*length));}
  const o=new THREE.Mesh(geometry(new THREE.LatheGeometry(profile,32)),cyan);o.position.copy(va.clone().add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.clone().sub(va).normalize());parent.add(o);halo(o,blueHalo);
  const points=[];for(let i=0;i<=12;i++){const t=.16+i*.68/12;points.push([r*Math.pow(Math.sin(Math.PI*t),.48)*.7,(t-.5)*length,r*Math.pow(Math.sin(Math.PI*t),.48)*.8]);}tube(o,points,.009,cyanGlow);
  return o;
 }
 const baby=options.stage===0,child=options.stage===1;
 // Growth changes head-to-body proportions, not just overall scale.
 const childScale=baby?.50:child?.70:1.02,headScale=baby?.78:child?.94:.98;
 host.dataset.lifeStage=String(options.stage);host.dataset.characterHeight=baby?'2.1':child?'3.0':'3.85';host.dataset.headBodyRatio=(headScale/childScale).toFixed(3);
 const body=new THREE.Group();root.add(body);body.scale.setScalar(childScale);
 sphere(body,cyan,0,1.7,0,.395,.39,.30);sphere(body,cyan,0,1.18,0,.31,.19,.23);ring(body,0,1.34,0,.29,pink,Math.PI/2);
 sphere(body,pink,0,2.18,0,.11,.07,.12);ring(body,0,2.15,0,.115,pink,Math.PI/2);
 const heartShape=new THREE.Shape();heartShape.moveTo(0,-.9);heartShape.bezierCurveTo(-1.6,.1,-1.15,1.25,0,.55);heartShape.bezierCurveTo(1.15,1.25,1.6,.1,0,-.9);
 const heart=new THREE.Mesh(geometry(new THREE.ExtrudeGeometry(heartShape,{depth:.3,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.13,bevelThickness:.13,curveSegments:16})),pink);heart.position.set(0,1.73,.16);heart.scale.set(.12,.13,.1);body.add(heart);
 const heartLight=new THREE.MeshBasicMaterial({color:0xffbd82,transparent:true,opacity:.38,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});materials.add(heartLight);sphere(body,heartLight,0,1.73,.18,.14,.15,.12);sphere(body,glow,0,1.73,.21,.043);
 // Badge is a small 3D disk; canvas texture is generated locally.
 const badgeCanvas=document.createElement('canvas');badgeCanvas.width=badgeCanvas.height=128;const bc=badgeCanvas.getContext('2d');bc.clearRect(0,0,128,128);bc.fillStyle='#635ce2';bc.beginPath();bc.arc(64,64,56,0,Math.PI*2);bc.fill();bc.strokeStyle='#b2efff';bc.lineWidth=6;bc.stroke();bc.fillStyle='#fff';bc.font='bold 52px sans-serif';bc.textAlign='center';bc.textBaseline='middle';bc.fillText('OK',64,67);const badgeTex=new THREE.CanvasTexture(badgeCanvas);textures.add(badgeTex);const badgeMat=new THREE.MeshBasicMaterial({map:badgeTex,transparent:true});materials.add(badgeMat);const badge=new THREE.Mesh(geometry(new THREE.CircleGeometry(.12,32)),badgeMat);badge.position.set(.10,1.82,.319);body.add(badge);
 tube(body,[[-.25,1.98,.12],[-.33,1.80,.16],[-.26,1.48,.14]],.014,cyanGlow);tube(body,[[.25,1.98,.12],[.33,1.80,.16],[.26,1.48,.14]],.014,cyanGlow);
 const legs=baby?[
  {hip:[-.18,.65,0],knee:[-.406,.45,.43],ankle:[-.58,.37,.92]},
  {hip:[.18,.65,0],knee:[.406,.45,.43],ankle:[.58,.37,.92]}
 ]:[
  {hip:[-.18,1.14,0],knee:[-.27,.73,.025],ankle:[-.30,.32,.07]},
  options.gender==='girl'?{hip:[.18,1.14,0],knee:[.40,.78,.02],ankle:[.59,.44,.16],raised:true}:{hip:[.18,1.14,0],knee:[.32,.73,.025],ankle:[.38,.32,.02]}
 ];
 if(baby){body.position.y=-.08;for(const mesh of body.children){if(mesh.position.y>1||mesh.geometry?.type==='TubeGeometry')mesh.position.y-=.43;}}
 for(const {hip:a,knee,ankle:b,raised} of legs){
  limb(body,a,knee,baby?.13:.14);limb(body,knee,b,baby?.12:.115);sphere(body,cyan,...knee,.14);
  sphere(body,pink,...a,.13,.1,.13);sphere(body,pink,...b,.14,.08,.14);ring(body,...b,.12,glow,Math.PI/2);
  // Every shoe follows its own ankle; the lifted leg retains a full-length shin.
  const shoe=sphere(body,cyan,b[0],baby?.33:b[1]-.14,baby?1:b[2]+.10,.24,baby?.19:.14,.29);
  if(raised){shoe.rotation.z=-.32;shoe.rotation.x=-.10;}
  if(baby){shoe.rotation.x=-.65;sphere(body,pink,b[0],.30,1.22,.16,.15,.027);}
 }
 // Hands have five separated rounded fingers and a thumb, visible from every side.
 function hand(parent,x,y,z,rotation){const h=new THREE.Group();h.position.set(x,y,z);h.rotation.z=rotation;h.scale.setScalar(1.15);parent.add(h);sphere(h,pink,0,0,0,.14,.16,.07);for(let i=0;i<4;i++){const px=(i-1.5)*.065;limbFinger(h,[px,.1,0],[px*1.5,.28+(i===1||i===2?.04:0),.015],.042);}limbFinger(h,[-.1,.01,0],[-.24,.12,.02],.044);ring(h,0,-.14,0,.105,pink,Math.PI/2);ring(h,0,-.17,0,.115,glow,Math.PI/2);return h;}
 function limbFinger(parent,a,b,r){tube(parent,[a,b],r,pink);sphere(parent,pink,...b,r);}
 const armLeft=new THREE.Group();armLeft.position.set(-.3,1.95,0);body.add(armLeft);limb(armLeft,[0,0,0],[-.4,-.31,.03],.085);limb(armLeft,[-.4,-.31,.03],[-.65,-.48,.1],.09);sphere(armLeft,pink,-.02,0,0,.14,.15,.13);sphere(armLeft,cyan,-.4,-.31,.03,.12);hand(armLeft,-.72,-.52,.1,2.35);
 const wave=new THREE.Group();wave.position.set(.3,1.95,0);body.add(wave);wave.rotation.z=options.gender==='girl'?.18:0;limb(wave,[0,0,0],[.35,.19,.03],.09);limb(wave,[.35,.19,.03],[.62,.56,.05],.085);sphere(wave,pink,0,0,0,.14,.15,.13);sphere(wave,cyan,.35,.19,.03,.115);hand(wave,.66,.72,.05,-.22);
 let diaperMat=null;if(baby){diaperMat=mat({color:0xe6e2ff,roughness:.45,clearcoat:.35});const diaper=sphere(body,diaperMat,0,.74,.07,.33,.20,.27);diaper.name='baby-diaper';sphere(body,pink,-.27,.78,.13,.06,.04,.07);sphere(body,pink,.27,.78,.13,.06,.04,.07);armLeft.position.y-=.43;armLeft.rotation.z=-.25;wave.position.y-=.43;}else if(options.gender==='girl'){armLeft.position.x=.3;armLeft.scale.x=-1;wave.position.x=-.3;wave.scale.x=-1;body.rotation.z=-.075;}
 const headPivot=new THREE.Group();root.add(headPivot);const head=new THREE.Group();headPivot.add(head);body.updateMatrixWorld(true);
 const neckAnchor=body.localToWorld(new THREE.Vector3(0,baby?1.75:2.18,0));
 headPivot.position.copy(neckAnchor);headPivot.rotation.z=body.rotation.z;head.position.y=headScale*.625-.04;
 head.scale.setScalar(headScale);root.userData.stage=options.stage;
 sphere(head,headMat,0,0,0,.745,.625,.61);
 sphere(head,pink,-.71,-.025,.04,.145,.16,.13);sphere(head,pink,.71,-.025,.04,.145,.16,.13);
 // Glowing contours are curved geometry on the actual surface, not a billboard.
 const forehead=[];for(let i=0;i<=32;i++){const a=-.1+i*Math.PI*1.2/32;forehead.push([Math.cos(a)*.725,Math.sin(a)*.638,.06]);}tube(head,forehead,.012,glow);
 const eyes=[],closedEyes=[],joyEyes=[],gaze=[],brows=[];
 for(const x of [-.265,.265]){const group=new THREE.Group();group.position.set(x,.07,.56);group.rotation.z=x<0?-.1:.1;head.add(group);sphere(group,white,0,0,0,.195,.207,.075);sphere(group,iris,0,-.01,.057,.143,.159,.046);sphere(group,pupil,0,-.018,.09,.103,.121,.036);sphere(group,white,-.035,.045,.131,.034,.034,.012);sphere(group,white,.04,-.059,.131,.014,.014,.009);eyes.push(group);
 gaze.push(group.children.filter(o=>o.material===iris||o.material===pupil||o.material===white&&o.position.z>.1));
 const lid=new THREE.Group();lid.position.copy(group.position);lid.rotation.copy(group.rotation);head.add(lid);tube(lid,[[-.14,.025,.10],[0,-.022,.12],[.14,.025,.10]],.012,pupil);closedEyes.push(lid);lid.visible=false;
 const joyLid=new THREE.Group();joyLid.position.copy(group.position);head.add(joyLid);tube(joyLid,[[-.145,-.035,.10],[-.08,.045,.12],[0,.065,.13],[.08,.045,.12],[.145,-.035,.10]],.017,pupil);joyEyes.push(joyLid);joyLid.visible=false;
 if(options.gender==='girl')for(let i=0;i<3;i++){const xx=(i-1)*.06;tube(group,[[xx,.175,.055],[xx+(x<0?-.025:.025),.225,.055]],.008,pupil);tube(lid,[[xx,-.005,.115],[xx+(x<0?-.025:.025),-.044,.112]],.007,pupil);}
 if(options.gender==='girl')for(let i=0;i<2;i++)tube(joyLid,[[x<0?-.11:.11,-.005+i*.025,.12],[x<0?-.17:.17,.025+i*.04,.12]],.007,pupil);
 const brow=new THREE.Group();brow.position.set(x,.30,.50);head.add(brow);tube(brow,[[-.12,0,-.02],[-.09,.04,.01],[.02,.045,.035],[.11,.01,0]],.019,glow);brows.push(brow);
 }
 // Rounded pink facial volumes from the owner's reference, attached in 3D.
 const blush=mat({...glass,color:0xffa0d7,attenuationColor:0xffc9e8,emissive:0xea2589,emissiveIntensity:.35,opacity:.84});
 sphere(head,blush,0,-.11,.63,.105,.087,.09);
 const cheeks=[sphere(head,blush,-.43,-.17,.505,.16,.115,.105),sphere(head,blush,.43,-.17,.505,.16,.115,.105)];
 const smile=new THREE.Group();head.add(smile);const smileShape=new THREE.Shape();smileShape.moveTo(-.22,0);smileShape.quadraticCurveTo(0,-.32,.22,0);smileShape.quadraticCurveTo(0,-.045,-.22,0);const mouth=new THREE.Mesh(geometry(new THREE.ExtrudeGeometry(smileShape,{depth:.012,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2,curveSegments:24})),mouthMat);mouth.position.set(0,-.29,.543);smile.add(mouth);sphere(smile,tongueMat,0,-.423,.57,.11,.035,.014);tube(smile,[[-.22,-.29,.547],[0,-.312,.57],[.22,-.29,.547]],.009,pink);
 const thoughtMouth=new THREE.Group();head.add(thoughtMouth);sphere(thoughtMouth,mouthMat,.035,-.32,.565,.035,.044,.014);const lipPoints=[];for(let i=0;i<=32;i++){const a=i*Math.PI*2/32;lipPoints.push([.035+Math.cos(a)*.039,-.32+Math.sin(a)*.048,.581]);}tube(thoughtMouth,lipPoints,.007,tongueMat);thoughtMouth.visible=false;
 // A separate articulated thinking pose is fitted to the face, for every age.
 const thoughtArm=new THREE.Group();head.add(thoughtArm);const thoughtSide=!baby&&options.gender==='girl'?-1:1;
 const ta=[thoughtSide*.25,-.88,0],te=[thoughtSide*.63,-.78,.24],tw=[thoughtSide*.44,-.42,.66];
 limb(thoughtArm,ta,te,.075);limb(thoughtArm,te,tw,.068);sphere(thoughtArm,pink,...ta,.10);sphere(thoughtArm,cyan,...te,.085);sphere(thoughtArm,pink,...tw,.09,.10,.055);
 for(let i=0;i<3;i++)sphere(thoughtArm,pink,tw[0]+thoughtSide*(i-1)*.04,tw[1]+.015,tw[2]+.05,.026,.048,.025);
 tube(thoughtArm,[[tw[0]-thoughtSide*.04,tw[1]+.05,.70],[thoughtSide*.32,-.34,.72],[thoughtSide*.23,-.26,.72]],.027,pink);thoughtArm.visible=false;
 // Reference archive: joyful eyes are upward arcs, hands support both cheeks.
 const joyArms=new THREE.Group();head.add(joyArms);joyArms.visible=false;
 for(const side of [-1,1]){const shoulder=[side*.25,-.88,0],elbow=[side*.60,-.72,.24],wrist=[side*.45,-.37,.66];limb(joyArms,shoulder,elbow,.075);limb(joyArms,elbow,wrist,.068);sphere(joyArms,pink,...shoulder,.10);sphere(joyArms,cyan,...elbow,.085);sphere(joyArms,pink,...wrist,.115,.075,.06);for(let i=0;i<4;i++)sphere(joyArms,pink,side*.45+(i-1.5)*.042,-.315,.68,.025,.04,.027);}
 // Sleep uses its own bilateral pose in body coordinates; no mirrored wave rotation.
 const sleepArms=new THREE.Group();body.add(sleepArms);sleepArms.visible=false;const sleepShoulderY=baby?1.52:1.95;
 for(const side of [-1,1]){const shoulder=[side*.3,sleepShoulderY,0],elbow=[side*.43,sleepShoulderY-.30,.18],wrist=[side*.11,sleepShoulderY-.37,.48];limb(sleepArms,shoulder,elbow,.085);limb(sleepArms,elbow,wrist,.08);sphere(sleepArms,pink,...shoulder,.13);sphere(sleepArms,cyan,...elbow,.11);sphere(sleepArms,pink,...wrist,.105,.07,.065);for(let i=0;i<3;i++)sphere(sleepArms,pink,side*(.08+i*.04),sleepShoulderY-.34,.53,.027,.045,.024);}
 const calmMouth=new THREE.Group();head.add(calmMouth);tube(calmMouth,[[-.10,-.31,.58],[0,-.342,.59],[.10,-.31,.58]],.009,mouthMat);calmMouth.visible=false;
 if(options.gender==='girl'){
  // Open-backed translucent bob, rounded locks and a swept fringe; no helmet.
  const bob=new THREE.Mesh(geometry(new THREE.SphereGeometry(1,40,28,Math.PI,Math.PI)),hairMat);bob.scale.set(.79,.70,.65);bob.position.set(0,.015,-.02);bob.name='girl-bob-back';head.add(bob);halo(bob,pinkHalo);
  for(const side of [-1,1])for(let i=0;i<2;i++){
   const z=.02+i*.12,x=side*(.55+i*.018);
   tube(head,[[side*.30,.58,z-.12],[side*.58,.42,z],[side*.75,.03,z+.035],[side*.74,-.34,z+.02],[side*.59,-.43,z+.06]],.10-i*.022,hairMat);
  }
  for(const side of [-1,1])tube(head,[[side*.33,.61,.29],[side*.65,.40,.31],[side*.79,.0,.32],[side*.75,-.33,.34],[side*.60,-.45,.36]],.013,glow);
  tube(head,[[-.37,.49,.34],[-.18,.63,.39],[.04,.61,.49],[.24,.45,.54],[.27,.30,.53]],.065,hairMat);
  tube(head,[[-.13,.59,.44],[.07,.59,.53],[.23,.43,.57],[.21,.34,.56]],.042,pink);
 }else{
  // Broad swept curl from the supplied character, with a curled tip rather than a thin antenna.
  const curl=tube(head,[[-.30,.57,.29],[-.12,.59,.42],[.10,.65,.40],[.23,.74,.31],[.22,.83,.23],[.13,.89,.20],[.055,.83,.24],[.11,.78,.31]],.082,hairMat);curl.rotation.z=-.13;curl.name='boy-curl';
  tube(head,[[-.26,.62,.35],[-.10,.65,.48],[.10,.72,.46],[.18,.78,.36]],.016,glow);
 }
 host.dataset.floating='true';
 const key=new THREE.DirectionalLight(0xf2e7ff,3.4);key.position.set(-2,4,5);scene.add(key);const fill=new THREE.DirectionalLight(0x65dfff,1.5);fill.position.set(3,2,-2);scene.add(fill);const rim=new THREE.DirectionalLight(0xff38b7,2.5);rim.position.set(-3,3,-3);scene.add(rim);scene.add(new THREE.AmbientLight(0xaba3de,.65));
 const modelBounds=new THREE.Box3().setFromObject(root),modelSize=modelBounds.getSize(new THREE.Vector3());
 const center=modelBounds.getCenter(new THREE.Vector3());center.y+=.04;
 let cameraDistance=6.7;
 camera.position.set(.15,center.y+.10,6.7);const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(center);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.dampingFactor=.12;controls.minPolarAngle=.65;controls.maxPolarAngle=2.15;controls.enabled=!!options.interactive;controls.rotateSpeed=.7;
 if(options.pose){const r=6.7,pol=options.pose.polar,az=options.pose.azimuth;camera.position.set(r*Math.sin(pol)*Math.sin(az),center.y+r*Math.cos(pol),r*Math.sin(pol)*Math.cos(az));}
 controls.update();
 let disposed=false,frame=0,last=0,needs=true,moving=false,currentMood=options.mood||'happy',currentSkin=options.skin||'neon';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function setEyesClosed(closed){const joyful=currentMood==='happy';eyes.forEach(o=>o.visible=!closed&&!joyful);closedEyes.forEach(o=>o.visible=closed&&!joyful);joyEyes.forEach(o=>o.visible=joyful);}
 function setExpression(mood){const thinking=['quiet','hungry'].includes(mood),resting=['sleep','tired'].includes(mood);smile.visible=!thinking&&!resting;calmMouth.visible=resting;sleepArms.visible=resting;thoughtMouth.visible=thinking;thoughtArm.visible=thinking;joyArms.visible=mood==='happy';wave.visible=!thinking&&!resting&&mood!=='happy';armLeft.visible=!resting&&mood!=='happy';smile.scale.set(resting?.75:1.12,resting?.35:1.08,1);smile.position.y=resting?0:.025;cheeks.forEach(c=>{c.position.y=thinking?-.18:resting?-.17:-.13;});brows.forEach((b,i)=>{b.position.y=thinking?(i===0?.37:.28):resting?.29:.34;b.rotation.z=thinking?(i===0?-.26:.22):resting?0:(i===0?.08:-.08);});headPivot.rotation.z=body.rotation.z+(thinking?-.12:resting?.04:0);host.dataset.expression=thinking?'think':resting?'calm':'happy';}
 function paint(mood,skin,hygiene=options.hygiene??85){if(diaperMat)diaperMat.color.setHex(hygiene<35?0xe2cde1:0xe6e2ff);currentMood=mood;currentSkin=skin;const palette=skin==='aurora'?[0xb099ff,0xef97ef]:skin==='sunset'?[0xffbb77,0xff89b9]:[0x00c9ed,0xff64cf];cyan.emissive.setHex(palette[0]);cyan.emissiveIntensity=.09;cyan.color.set(mood==='sleep'||mood==='tired'?0xabc5ff:mood==='quiet'||mood==='hungry'?0xc5b4fa:new THREE.Color(palette[0]).lerp(new THREE.Color(0xffffff),.18));pink.color.set(new THREE.Color(palette[1]).lerp(new THREE.Color(0xffffff),.25));headMat.color.set(mood==='sleep'||mood==='tired'?0xbacbff:mood==='quiet'||mood==='hungry'?0xd6b8f6:new THREE.Color(palette[1]).lerp(new THREE.Color(0xffffff),.25));headMat.emissive.setHex(palette[1]);headMat.emissiveIntensity=mood==='happy'?.09:.05;setEyesClosed(mood==='sleep');setExpression(mood);needs=true;}
 paint(currentMood,currentSkin);
 const abort=new AbortController();renderer.domElement.addEventListener('keydown',e=>{if(!options.interactive||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();const az=controls.getAzimuthalAngle()+(e.key==='ArrowLeft'?-.18:e.key==='ArrowRight'?.18:0),pol=THREE.MathUtils.clamp(controls.getPolarAngle()+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.65,2.15),r=cameraDistance;if(e.key==='Home')camera.position.set(center.x,center.y+.10,cameraDistance);else camera.position.set(r*Math.sin(pol)*Math.sin(az),center.y+r*Math.cos(pol),r*Math.sin(pol)*Math.cos(az));controls.update();needs=true;},{signal:abort.signal});
 controls.addEventListener('start',()=>{moving=true;host.dataset.dragging='true';});controls.addEventListener('end',()=>{moving=false;host.dataset.dragging='false';if(options.onPose)options.onPose({azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle()});});controls.addEventListener('change',()=>{needs=true;if(options.interactive&&options.onPose)options.onPose({azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle()});});
 function resize(){const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;const halfFov=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5));cameraDistance=Math.max(modelSize.y/(2*halfFov),Math.max(modelSize.x,modelSize.z)/(2*halfFov*camera.aspect))*1.16;const direction=camera.position.clone().sub(controls.target).normalize();controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,cameraDistance);camera.updateProjectionMatrix();controls.update();needs=true;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function draw(time){if(disposed)return;frame=requestAnimationFrame(draw);if(document.hidden||time-last<(options.interactive?33:66))return;last=time;controls.update();
  // Reference pack's expressive poses, applied to real shoulder pivots.
  const resting=['sleep','tired'].includes(currentMood),thinking=['hungry','quiet'].includes(currentMood);
  const waveTarget=baby?-.65:resting?-1.5:thinking?.35:(options.gender==='girl'?.18:0);
  const leftTarget=resting?.5:thinking?-.35:(baby?-.25:0);
  wave.visible=!thinking&&!resting&&currentMood!=='happy';armLeft.visible=!resting&&currentMood!=='happy';sleepArms.visible=resting;thoughtArm.visible=thinking;joyArms.visible=currentMood==='happy';
  wave.rotation.z=THREE.MathUtils.lerp(wave.rotation.z,waveTarget+(!reduce&&!moving&&!resting&&!thinking?Math.sin(time*.003)*.13:0),.1);
  armLeft.rotation.z=THREE.MathUtils.lerp(armLeft.rotation.z,leftTarget+(!reduce&&!moving?Math.sin(time*.0016)*.04:0),.1);
  wave.rotation.x=THREE.MathUtils.lerp(wave.rotation.x,baby?0:thinking?.45:resting?.25:0,.1);
  host.dataset.expression=resting?'calm':thinking?'think':currentMood==='happy'?'joy':'wave';needs=true;
  // Quiet/thinking look raises the pupils; sleep keeps its closed eyes.
  for(const pair of gaze)for(const part of pair){const highlight=part.material===white;const bx=highlight?(part.scale.x>.02?-.035:.04):0,by=highlight?(part.scale.x>.02?.045:-.059):part.material===iris?-.01:-.018;part.position.x=THREE.MathUtils.lerp(part.position.x,bx+(thinking?.026:0),.12);part.position.y=THREE.MathUtils.lerp(part.position.y,by+(thinking?.040:0),.12);}
  if(!reduce&&!moving){root.position.y=.06+Math.sin(time*.0018)*.07;root.rotation.z=Math.sin(time*.0011)*.025;headPivot.rotation.z=body.rotation.z+(thinking?-.12:resting?.04:0)+Math.sin(time*.0015)*.04;const beat=1+Math.sin(time*.003)*.06;heart.scale.set(.12*beat,.13*beat,.1*beat);}
  setEyesClosed(currentMood==='sleep'||(!reduce&&time%5900>5760));
  if(needs){renderer.render(scene,camera);needs=false;host.dataset.ready='true';host.dataset.azimuth=controls.getAzimuthalAngle().toFixed(3);}}
 frame=requestAnimationFrame(draw);
 return {update:paint,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();abort.abort();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}};
window.dispatchEvent(new Event('oki3dready'));
