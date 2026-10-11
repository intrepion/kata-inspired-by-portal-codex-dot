import {describe,it,expect} from 'vitest';
import {Vector3} from 'three';
import {frame,transformVector,transformPoint,crossing} from './gateway';
describe('linked gateway geometry',()=>{
 it('rotates falling velocity into horizontal launch with unchanged speed',()=>{
  const floor=frame('floor',[0,0,0],[0,1,0]); const wall=frame('wall',[-8,4,0],[1,0,0]);
  expect(transformVector(new Vector3(0,-18,0),floor,wall).toArray()).toEqual([18,0,0]);
 });
});
it('opposing walls preserve lateral offsets and face the player away from the destination',()=>{
 const a=frame('a',[0,1,0],[0,0,1]),b=frame('b',[10,1,0],[0,0,-1]);
 expect(transformPoint(new Vector3(.5,1.3,.2),a,b).toArray()).toEqual([10.5,1.3,.2]);
 expect(transformVector(new Vector3(0,0,-5),a,b).toArray()).toEqual([0,0,-5]);
});
it('floor to wall maps a known local offset and round trips any orientation',()=>{
 const a=frame('a',[0,0,0],[0,1,0]),b=frame('b',[5,3,0],[1,0,0]);
 expect(transformPoint(new Vector3(.2,.1,-.3),a,b).toArray()).toEqual([4.9,3.3,.2]);
 const point=new Vector3(2,4,-6),v=new Vector3(3,-17,2);
 expect(transformPoint(transformPoint(point,a,b),b,a).distanceTo(point)).toBeLessThan(1e-9);
 expect(transformVector(transformVector(v,a,b),b,a).distanceTo(v)).toBeLessThan(1e-9);
});
it('sweeps a high speed crossing and rejects reverse/backface and aperture edges',()=>{
 const p=frame('p',[0,1.2,0],[0,0,1]);
 expect(crossing(new Vector3(0,.9,2),new Vector3(0,.9,-3),p)?.toArray()).toEqual([0,.9,0]);
 expect(crossing(new Vector3(1,.9,2),new Vector3(1,.9,-3),p)).toBeNull();
 expect(crossing(new Vector3(0,.9,-2),new Vector3(0,.9,3),p)).toBeNull();
});
