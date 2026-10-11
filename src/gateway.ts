import {Matrix4,Vector3} from 'three';
export type Panel={id:string; center:Vector3; normal:Vector3; right:Vector3; up:Vector3; width:number; height:number; backing:string};
export function frame(id:string,center:number[],normal:number[],backing=id):Panel{
 const n=new Vector3(...normal).normalize();
 const up=Math.abs(n.y)>.9?new Vector3(0,0,-1):new Vector3(0,1,0);
 const right=new Vector3().crossVectors(up,n).normalize();
 return {id,center:new Vector3(...center),normal:n,right,up:new Vector3().crossVectors(n,right),width:1.05,height:1.45,backing};
}
export function transformVector(v:Vector3,a:Panel,b:Panel):Vector3{
 return b.right.clone().multiplyScalar(-v.dot(a.right)).addScaledVector(b.up,v.dot(a.up)).addScaledVector(b.normal,-v.dot(a.normal));
}
export function transformPoint(v:Vector3,a:Panel,b:Panel):Vector3{return transformVector(v.clone().sub(a.center),a,b).add(b.center);}
export function frameMatrix(p:Panel):Matrix4{return new Matrix4().makeBasis(p.right,p.up,p.normal).setPosition(p.center);}
export function extent(axis:Vector3,radius=.28,halfHeight=.85){return radius*(Math.abs(axis.x)+Math.abs(axis.z))+halfHeight*Math.abs(axis.y);}
export function fits(point:Vector3,p:Panel,radius=.28,halfHeight=.85){
 const d=point.clone().sub(p.center);return Math.abs(d.dot(p.right))+extent(p.right,radius,halfHeight)<p.width && Math.abs(d.dot(p.up))+extent(p.up,radius,halfHeight)<p.height;
}
export function crossing(from:Vector3,to:Vector3,p:Panel,radius=.28,halfHeight=.85):Vector3|null{
 const d0=from.clone().sub(p.center).dot(p.normal),d1=to.clone().sub(p.center).dot(p.normal);
 if(d0<=0||d1>0)return null;
 const hit=from.clone().lerp(to,d0/(d0-d1));return fits(hit,p,radius,halfHeight)?hit:null;
}
