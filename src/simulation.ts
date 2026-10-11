import {Box3,Ray,Vector3} from 'three';
import {crossing,extent,fits,transformPoint,transformVector,type Panel} from './gateway';
import {chambers,type Chamber,type Solid} from './levels';
export type Body={position:Vector3;velocity:Vector3;radius:number;halfHeight:number;grounded:boolean;guard:string|null;cooldown:number};
export type Input={wish:Vector3;jump?:boolean};
const makeBody=(position:Vector3,radius=.28,halfHeight=.85):Body=>({position:position.clone(),velocity:new Vector3(),radius,halfHeight,grounded:false,guard:null,cooldown:0});
export class Simulation{
 level:Chamber;player:Body;cube:Body|null;portals:[Panel|null,Panel|null]=[null,null];forward=new Vector3(0,0,-1);held=false;switchActive=false;complete=false;crossings=0;respawns=0;lastEvent='';
 constructor(public index:number){this.level=chambers[index];this.player=makeBody(this.level.spawn);this.cube=this.level.cube?makeBody(this.level.cube,.43,.43):null;}
 reset(){const clean=new Simulation(this.index);Object.assign(this,clean);}
 rayTarget(origin:Vector3,direction:Vector3):{panel:Panel|null;distance:number}{
  let nearest:Panel|null=null,distance=60;const ray=new Ray(origin,direction.clone().normalize());
  for(const p of this.level.panels){const denominator=ray.direction.dot(p.normal);if(denominator>=-.0001)continue;const t=p.center.clone().sub(origin).dot(p.normal)/denominator;if(t<0||t>=distance)continue;const point=ray.at(t,new Vector3()).sub(p.center);if(Math.abs(point.dot(p.right))<1.28&&Math.abs(point.dot(p.up))<1.68){distance=t;nearest=p;}}
  if(!nearest)return{panel:null,distance};
  for(const solid of this.activeSolids()){const hit=ray.intersectBox(new Box3(solid.min,solid.max),new Vector3());if(hit&&origin.distanceTo(hit)<distance-.08)return{panel:null,distance};}
  if(this.cube&&!this.held){const hit=ray.intersectBox(this.bodyBox(this.cube),new Vector3());if(hit&&origin.distanceTo(hit)<distance-.08)return{panel:null,distance};}
  return{panel:nearest,distance};
 }
 place(slot:0|1,origin:Vector3,direction:Vector3):string{
  const p=this.rayTarget(origin,direction).panel;if(!p)return 'Aim at a marked pale panel';
  if(this.portals[1-slot]?.id===p.id)return 'Panel already occupied';
  const output=p.center.clone().addScaledVector(p.normal,extent(p.normal)+.12);
  if(this.blocked(output,.28,.85,p.backing))return 'Destination blocked';
  this.portals[slot]=p;return 'Gateway linked';
 }
 private activeSolids():Solid[]{return this.level.solids;}
 private bodyBox(body:Body){const size=new Vector3(body.radius,body.halfHeight,body.radius);return new Box3(body.position.clone().sub(size),body.position.clone().add(size));}
 private blocked(point:Vector3,radius:number,height:number,except?:string){const body=makeBody(point,radius,height),bounds=this.bodyBox(body);return this.activeSolids().some(s=>s.id!==except&&bounds.intersectsBox(new Box3(s.min,s.max)));}
 private aperture(body:Body,solid:Solid,point:Vector3){if(!this.portals[0]||!this.portals[1])return false;return this.portals.some(p=>p&&!(p.id===body.guard&&body.cooldown>0)&&p.backing===solid.id&&fits(point,p,body.radius,body.halfHeight)&&Math.abs(point.clone().sub(p.center).dot(p.normal))<extent(p.normal,body.radius,body.halfHeight)+.2);}
 private integrate(body:Body,dt:number){
  body.cooldown=Math.max(0,body.cooldown-dt);const from=body.position.clone();let to=from.clone().addScaledVector(body.velocity,dt);body.grounded=false;
  if(this.portals[0]&&this.portals[1])for(let i=0;i<2;i++){
   const source=this.portals[i]!,dest=this.portals[1-i]!;
   if(source.id===body.guard&&body.cooldown>0)continue;
   const hit=crossing(from,to,source,body.radius,body.halfHeight);if(!hit)continue;
   const mappedHit=transformPoint(hit,source,dest);const output=mappedHit.clone().addScaledVector(dest.normal,extent(dest.normal,body.radius,body.halfHeight)+.08);
   if(this.blocked(output,body.radius,body.halfHeight,dest.backing)){body.velocity.addScaledVector(source.normal,-body.velocity.dot(source.normal));to.copy(from);this.lastEvent='Exit obstructed — clear the destination';break;}
   to=output.add(transformVector(to.clone().sub(hit),source,dest));body.velocity.copy(transformVector(body.velocity,source,dest));body.position.copy(to);body.guard=dest.id;body.cooldown=.12;
   if(body===this.player){this.forward.copy(transformVector(this.forward,source,dest)).normalize();this.crossings++;this.lastEvent='Crossing complete';}
   return;
  }
  // Resolve each swept substep axis independently; speed is capped so a step cannot cross a wall's full thickness.
  for(const axis of ['x','z','y'] as const){body.position[axis]=to[axis];for(const solid of this.activeSolids()){
   if(this.aperture(body,solid,body.position))continue;
   if(axis!=='y'&&body.position.y-body.halfHeight>=solid.max.y-.01)continue;
   if(!this.bodyBox(body).intersectsBox(new Box3(solid.min,solid.max)))continue;
   const half=axis==='y'?body.halfHeight:body.radius;
   if(body.velocity[axis]>0)body.position[axis]=solid.min[axis]-half-.001;
   else if(body.velocity[axis]<0){body.position[axis]=solid.max[axis]+half+.001;if(axis==='y')body.grounded=true;}
   else{body.position[axis]=from[axis];}
   body.velocity[axis]=0;
  }}
 }
 step(seconds:number,input:Input={wish:new Vector3()}){
  if(this.complete)return;const count=Math.ceil(Math.min(seconds,.25)*120),dt=Math.min(seconds,.25)/Math.max(count,1);
  for(let n=0;n<count;n++){
   const b=this.player;const grounded=b.grounded;const acceleration=grounded?32:7;
   for(const axis of ['x','z'] as const){const wish=input.wish[axis]*5.2;if(grounded||input.wish.lengthSq()>.01){const delta=wish-b.velocity[axis];b.velocity[axis]+=Math.sign(delta)*Math.min(Math.abs(delta),acceleration*dt);}}
   if(input.jump&&grounded&&n===0){b.velocity.y=6.2;b.grounded=false;}
   b.velocity.y=Math.max(-35,b.velocity.y-18*dt);b.velocity.clampLength(0,40);this.integrate(b,dt);
   if(b.position.y<-9){b.position.copy(this.level.spawn);b.velocity.set(0,0,0);b.guard=null;b.cooldown=0;this.respawns++;this.lastEvent='Recovered at chamber start';if(this.held&&this.cube)this.cube.position.copy(b.position);}
   if(this.cube){if(this.held){this.cube.position.copy(b.position).addScaledVector(this.forward,.95);this.cube.position.y=Math.max(b.position.y-.15,b.position.y+this.forward.y*.95);this.cube.velocity.copy(b.velocity);}else{this.cube.velocity.y=Math.max(-35,this.cube.velocity.y-18*dt);if(this.cube.grounded){this.cube.velocity.x*=.9;this.cube.velocity.z*=.9;}this.integrate(this.cube,dt);if(this.cube.position.y<-9){this.cube=makeBody(this.level.cube!,.43,.43);this.lastEvent='Cube recovered';}}}
   this.switchActive=!!(this.cube&&!this.held&&this.level.switch&&Math.hypot(this.cube.position.x-this.level.switch.x,this.cube.position.z-this.level.switch.z)<.9&&Math.abs(this.cube.position.y-this.level.switch.y-.32)<.35);
   const e=this.level.exit;this.complete=Math.hypot(b.position.x-e.x,b.position.z-e.z)<1.1&&Math.abs(b.position.y-e.y)<1.15&&(!this.level.switch||this.switchActive);
  }
 }
 interact():string{
  if(!this.cube)return 'No relay cube in reach';
  if(this.held){const drop=this.player.position.clone().addScaledVector(this.forward,1.15);drop.y=Math.max(drop.y,this.player.position.y-this.player.halfHeight+.445);if(this.blocked(drop,.43,.43))return 'No room to set down the cube';this.cube.position.copy(drop);this.cube.velocity.set(0,0,0);this.held=false;return 'Cube released';}
  if(this.player.position.distanceTo(this.cube.position)>2.2)return 'Move closer to the cube';
  const ray=new Ray(this.player.position,this.cube.position.clone().sub(this.player.position).normalize());for(const s of this.activeSolids()){const hit=ray.intersectBox(new Box3(s.min,s.max),new Vector3());if(hit&&hit.distanceTo(this.player.position)<this.player.position.distanceTo(this.cube.position)-.5)return 'Cube is behind a wall';}
  this.held=true;return 'Cube secured — E to release';
 }
}
export function readProgress(raw:string|null):number{try{const x=JSON.parse(raw??'null');return x?.version===1&&Number.isInteger(x.unlocked)&&x.unlocked>=0&&x.unlocked<=5?x.unlocked:0;}catch{return 0;}}
export function saveProgress(unlocked:number):string{return JSON.stringify({version:1,unlocked:Math.max(0,Math.min(5,Math.floor(unlocked)))});}
