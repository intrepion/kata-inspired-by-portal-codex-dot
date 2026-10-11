import {it,expect} from 'vitest';
import {Vector3} from 'three';
import {Simulation} from './simulation';
it('a ray selects the nearest eligible panel and rejects a second gateway on it',()=>{
 const s=new Simulation(0);const origin=new Vector3(-3,1.2,6),dir=new Vector3(-1,0,0);
 expect(s.place(0,origin,dir)).toBe('Gateway linked');
 expect(s.place(1,origin,dir)).toBe('Panel already occupied');
 expect(s.portals[1]).toBe(null);
});
it('invalid and occluded placement leaves the current gateway intact',()=>{
 const s=new Simulation(1);s.place(0,new Vector3(-3,1.2,6),new Vector3(-1,0,0));
 expect(s.place(0,new Vector3(0,1.4,7),new Vector3(0,0,-1))).toBe('Aim at a marked pale panel');
 expect(s.portals[0]?.id).toBe('A');
});
it('a player crosses a wall gateway, retains speed and cannot immediately bounce',()=>{
 const s=new Simulation(0);s.place(0,new Vector3(-3,1.2,6),new Vector3(-1,0,0));s.place(1,new Vector3(-3,1.2,-6),new Vector3(-1,0,0));
 s.player.position.set(-9.4,.9,6);s.player.velocity.set(-25,0,0);s.forward.set(-1,0,0);s.step(.04);
 expect(s.crossings).toBe(1);expect(s.player.position.z).toBeCloseTo(-6);expect(s.player.velocity.x).toBeGreaterThan(23);expect(s.forward.x).toBe(1);
 s.step(.05);expect(s.crossings).toBe(1);
});
it('a high speed floor entry launches toward the shelf',()=>{
 const s=new Simulation(3);const a=s.level.panels[0],b=s.level.panels[1];
 s.place(0,new Vector3(-3,8,-2),new Vector3(0,-1,0));s.place(1,new Vector3(-3,5,0),b.center.clone().sub(new Vector3(-3,5,0)).normalize());
 expect(s.portals[0]).toBe(a);expect(s.portals[1]).toBe(b);
 s.player.position.set(-3,.3,-2);s.player.velocity.set(0,-30,0);s.step(.02);
 expect(s.crossings).toBe(1);expect(s.player.velocity.x).toBeGreaterThan(29);expect(s.player.position.y).toBeCloseTo(4.2,1);
});
it('reset rebuilds every mutable chamber field and malformed saves are ignored',async()=>{
 const {readProgress,saveProgress}=await import('./simulation');const s=new Simulation(2);s.held=true;s.switchActive=true;s.complete=true;s.crossings=7;s.player.position.set(3,20,3);s.cube!.position.set(0,-3,0);s.portals[0]=s.level.panels[0];s.reset();
 expect(s.player.position.toArray()).toEqual([-3,.86,7]);expect(s.cube!.position.toArray()).toEqual([-6,.46,-7]);expect([s.held,s.switchActive,s.complete]).toEqual([false,false,false]);expect(s.portals).toEqual([null,null]);expect(s.crossings).toBe(0);
 for(const raw of ['broken','{"version":1,"unlocked":99}','{"version":1,"unlocked":1.5}','{"version":2,"unlocked":3}'])expect(readProgress(raw)).toBe(0);
 expect(readProgress(saveProgress(4))).toBe(4);
});
it('a cube powers the receiver only when released and the exit requires its power',()=>{
 const s=new Simulation(2);s.player.position.copy(s.level.switch!).add(new Vector3(0,.75,0));s.cube!.position.copy(s.level.switch!).add(new Vector3(0,.33,0));s.step(.1);expect(s.switchActive).toBe(true);expect(s.interact()).toContain('secured');s.step(.01);expect(s.switchActive).toBe(false);
 s.player.position.copy(s.level.exit);s.step(.01);expect(s.complete).toBe(false);
 s.held=false;s.cube!.position.copy(s.level.switch!).add(new Vector3(0,.33,0));s.cube!.velocity.set(0,0,0);s.step(.1);expect(s.complete).toBe(true);
});
it('settling after a crossing stays on the destination floor instead of treating the floor as a side wall',()=>{
 const s=new Simulation(0);s.place(0,new Vector3(-3,1.2,6),new Vector3(-1,0,0));s.place(1,new Vector3(-3,1.2,-6),new Vector3(-1,0,0));s.player.position.set(-9.4,.851,6);s.player.velocity.set(-5,-.15,0);s.step(.1);s.step(.15);expect(s.player.position.z).toBeCloseTo(-6);expect(s.player.position.x).toBeGreaterThan(-9.5);expect(s.player.position.y).toBeCloseTo(.851);
});
it('reversing during the destination guard cannot enter the backing wall',()=>{
 const s=new Simulation(0);s.place(0,new Vector3(-3,1.2,6),new Vector3(-1,0,0));s.place(1,new Vector3(-3,1.2,-6),new Vector3(-1,0,0));s.player.position.set(-9.4,.9,6);s.player.velocity.set(-25,0,0);s.step(.02);expect(s.crossings).toBe(1);s.player.velocity.set(-25,0,0);s.step(.05);expect(s.crossings).toBe(1);expect(s.player.position.x).toBeGreaterThan(-9.48);
});
it('looking down while setting down a held cube leaves it above the floor',()=>{
 const s=new Simulation(4);s.player.position.set(-5,.851,7);expect(s.interact()).toContain('secured');s.forward.set(0,-.8,-.6);expect(s.interact()).toBe('Cube released');s.step(.1);expect(s.cube!.position.y).toBeGreaterThanOrEqual(.43);
});
