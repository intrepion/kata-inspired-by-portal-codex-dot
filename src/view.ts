import * as T from 'three';
import {frameMatrix,transformPoint,transformVector,type Panel} from './gateway';
import {Simulation} from './simulation';
const palette={cyan:0x64e7f5,amber:0xffbf60};
export class View{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(72,1,.045,160);world=new T.Group();portalMeshes:T.Mesh[]=[];targets:T.WebGLRenderTarget[]=[];cube:T.Group|null=null;switchMesh:T.Mesh|null=null;door:T.Group|null=null;materials:T.Material[]=[];reduced=false;
 constructor(public canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.setClearColor(0x10212a);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.scene.fog=new T.Fog(0x10212a,25,70);this.scene.add(new T.HemisphereLight(0xc0e8ed,0x34414b,2.4));const sun=new T.DirectionalLight(0xffe7ca,3);sun.position.set(5,14,8);this.scene.add(sun);this.scene.add(this.world);this.resize();
 }
 resize(){const w=innerWidth,h=innerHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();for(const rt of this.targets)if(rt)rt.setSize(Math.floor(w*.65),Math.floor(h*.65));}
 private material(color:number,emissive=0){const m=new T.MeshStandardMaterial({color,roughness:.68,metalness:.25,emissive,emissiveIntensity:1.3});this.materials.push(m);return m;}
 private mesh(g:T.BufferGeometry,m:T.Material,p:T.Vector3){const mesh=new T.Mesh(g,m);mesh.position.copy(p);this.world.add(mesh);return mesh;}
 private label(text:string,color='#c4dce0',size=1.6){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!;ctx.clearRect(0,0,1024,256);ctx.font='600 58px monospace';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,512,145);const texture=new T.CanvasTexture(c);const mat=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});this.materials.push(mat);return new T.Mesh(new T.PlaneGeometry(size*4,size),mat);}
 private orient(mesh:T.Object3D,p:Panel){mesh.quaternion.setFromRotationMatrix(frameMatrix(p));}
 build(s:Simulation){
  this.world.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose();m.dispose();});}});this.world.clear();this.materials=[];for(const t of this.targets)if(t)t.dispose();this.targets=[];this.portalMeshes=[];this.cube=null;this.switchMesh=null;
  const wall=this.material(0x253c48),floor=this.material(0x46565c),platform=this.material(0x344a53);
  for(const solid of s.level.solids){const size=solid.max.clone().sub(solid.min),center=solid.max.clone().add(solid.min).multiplyScalar(.5);this.mesh(new T.BoxGeometry(size.x,size.y,size.z),solid.kind==='wall'?wall:solid.kind==='platform'?platform:floor,center);
   if(solid.kind!=='wall'){const grid=new T.GridHelper(Math.max(size.x,size.z),Math.ceil(Math.max(size.x,size.z)),0x708389,0x536970);grid.position.set(center.x,solid.max.y+.006,center.z);grid.scale.set(size.x/Math.max(size.x,size.z),1,size.z/Math.max(size.x,size.z));this.world.add(grid);}
  }
  for(const p of s.level.panels){
   const panel=this.mesh(new T.BoxGeometry(2.6,3.45,.035),this.material(0xc6d3c9),p.center.clone().addScaledVector(p.normal,-.02));this.orient(panel,p);
   const border=this.mesh(new T.BoxGeometry(2.85,3.7,.018),this.material(0x163441),p.center.clone().addScaledVector(p.normal,-.045));this.orient(border,p);
   for(const offset of [-1,1]){const strip=this.mesh(new T.BoxGeometry(.06,3,.055),this.material(0x70a6a8,0x2a484d),p.center.clone().addScaledVector(p.right,offset*1.19).addScaledVector(p.normal,.01));this.orient(strip,p);}
   const tag=this.label(`SEAM ${p.id}`,'#effffc',.3);tag.position.copy(p.center).addScaledVector(p.up,2.05).addScaledVector(p.normal,.06);this.orient(tag,p);this.world.add(tag);
   const light=new T.PointLight(0x9fdae7,18,9,2);light.position.copy(p.center).addScaledVector(p.normal,2);this.world.add(light);
  }
  const exit=s.level.exit;this.door=new T.Group();this.door.position.set(exit.x,exit.y-.85,exit.z);this.world.add(this.door);
  const gateMaterial=this.material(0x387c68,0x36c5a3);for(const x of [-.85,.85]){const pole=new T.Mesh(new T.BoxGeometry(.13,2.7,.13),gateMaterial);pole.position.set(x,1.35,0);this.door.add(pole);}const lintel=new T.Mesh(new T.BoxGeometry(1.83,.13,.13),gateMaterial);lintel.position.y=2.7;this.door.add(lintel);
  const sign=this.label('RELAY EXIT','#92ffcd',.28);sign.position.copy(exit).add(new T.Vector3(0,2,0));this.world.add(sign);
  if(s.level.switch){this.switchMesh=this.mesh(new T.CylinderGeometry(1,1,.16,48),this.material(0x9b7241,0x4c3010),s.level.switch);const tag=this.label('POWER RECEIVER','#ffe1aa',.2);tag.rotation.x=-Math.PI/2;tag.position.copy(s.level.switch).add(new T.Vector3(0,.09,1.4));this.world.add(tag);}
  if(s.cube){this.cube=new T.Group();const core=new T.Mesh(new T.BoxGeometry(.86,.86,.86),this.material(0xd7c3a3));this.cube.add(core);const edges=new T.LineSegments(new T.EdgesGeometry(core.geometry),new T.LineBasicMaterial({color:0x1d3940}));this.cube.add(edges);for(const axis of ['x','y','z'] as const){for(const d of [-1,1]){const disc=new T.Mesh(new T.CylinderGeometry(.18,.18,.02,6),this.material(0x92cbd0,0x428d95));disc.position[axis]=.44*d;if(axis==='x')disc.rotation.z=Math.PI/2;if(axis==='z')disc.rotation.x=Math.PI/2;this.cube.add(disc);}}this.world.add(this.cube);}
  const title=this.label(`${s.level.concept}  ·  PARALLAX`, '#91aeb4',.6);title.position.set(0,10,-11.6);this.world.add(title);
  const stars=new T.BufferGeometry();const positions=[];for(let i=0;i<180;i++){positions.push(Math.sin(i*83.17)*45,12+((i*17)%31),Math.cos(i*12.73)*45);}stars.setAttribute('position',new T.Float32BufferAttribute(positions,3));this.world.add(new T.Points(stars,new T.PointsMaterial({color:0x7598a2,size:.06})));
  this.refreshPortals(s);
 }
 refreshPortals(s:Simulation){
  for(const mesh of this.portalMeshes){this.world.remove(mesh);mesh.geometry.dispose();mesh.material instanceof T.Material&&mesh.material.dispose();}
  this.portalMeshes=[];this.targets.forEach(t=>t.dispose());this.targets=[];
  for(let i=0;i<2;i++){
   const p=s.portals[i];if(!p)continue;const rt=new T.WebGLRenderTarget(Math.floor(innerWidth*.65),Math.floor(innerHeight*.65));this.targets[i]=rt;
   const uniforms={view:{value:rt.texture},resolution:{value:new T.Vector2()},linked:{value:!!s.portals[1-i]},tint:{value:new T.Color(i===0?palette.cyan:palette.amber)}};
   const mat=new T.ShaderMaterial({uniforms,vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D view;uniform vec2 resolution;uniform bool linked;uniform vec3 tint;void main(){vec2 uv=gl_FragCoord.xy/resolution;vec3 c=linked?texture2D(view,uv).rgb:tint*.14;gl_FragColor=vec4(c,1.);}',side:T.DoubleSide});
   const shape=new T.Shape();if(i===0){shape.absellipse(0,0,p.width,p.height,0,Math.PI*2,false,0);}else{shape.moveTo(-p.width,-p.height*.65);shape.lineTo(-p.width*.65,-p.height);shape.lineTo(p.width*.65,-p.height);shape.lineTo(p.width,-p.height*.65);shape.lineTo(p.width,p.height*.65);shape.lineTo(p.width*.65,p.height);shape.lineTo(-p.width*.65,p.height);shape.lineTo(-p.width,p.height*.65);shape.closePath();}
   const mesh=new T.Mesh(new T.ShapeGeometry(shape,64),mat);mesh.position.copy(p.center).addScaledVector(p.normal,.045);this.orient(mesh,p);mesh.userData.slot=i;this.world.add(mesh);this.portalMeshes.push(mesh);
   // Ring belongs to the surface group, so replacement disposes it together.
   const points=shape.getPoints(80).map(v=>new T.Vector3(v.x,v.y,.005));const ring=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points,true),128,.045,8,true),new T.MeshBasicMaterial({color:i===0?palette.cyan:palette.amber}));mesh.add(ring);
  }
 }
 render(s:Simulation,yaw:number,pitch:number){
  this.camera.position.copy(s.player.position).add(new T.Vector3(0,.55,0));this.camera.rotation.set(pitch,yaw,0,'YXZ');this.camera.updateMatrixWorld();
  if(this.cube&&s.cube){this.cube.position.copy(s.cube.position);this.cube.rotation.y=.2;}
  if(this.switchMesh)(this.switchMesh.material as T.MeshStandardMaterial).emissive.set(s.switchActive?0x2fa786:0x4c3010);
  if(this.door)this.door.visible=!s.level.switch||s.switchActive;
  const viewCamera=new T.PerspectiveCamera();viewCamera.copy(this.camera);const size=this.renderer.getDrawingBufferSize(new T.Vector2());
  for(const mesh of this.portalMeshes){const i=mesh.userData.slot as number;const src=s.portals[i],dst=s.portals[1-i];const mat=mesh.material as T.ShaderMaterial;mat.uniforms.resolution.value.copy(size);if(!src||!dst)continue;
   viewCamera.position.copy(transformPoint(this.camera.position,src,dst));const look=transformVector(this.camera.getWorldDirection(new T.Vector3()),src,dst);viewCamera.up.copy(transformVector(new T.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),src,dst));viewCamera.lookAt(viewCamera.position.clone().add(look));viewCamera.updateMatrixWorld();
   for(const surface of this.portalMeshes)surface.visible=false;
   this.renderer.clippingPlanes=[new T.Plane(dst.normal.clone(),-dst.normal.dot(dst.center)-.025)];this.renderer.setRenderTarget(this.targets[i]);this.renderer.render(this.scene,viewCamera);
   this.renderer.setRenderTarget(null);this.renderer.clippingPlanes=[];for(const surface of this.portalMeshes)surface.visible=true;
  }
  this.renderer.render(this.scene,this.camera);
 }
}
