import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Race, idleInput } from '../src/race.js';
test('throttle builds speed continuously; brakes stop the motorcycle', () => {
 const race = new Race(0); race.start();
 for(let i=0;i<600;i++) race.update(1/60,{...idleInput,throttle:true});
 assert.ok(race.speed>40); assert.ok(race.distance>200);
 for(let i=0;i<180;i++) race.update(1/60,{...idleInput,brake:true});
 assert.equal(race.speed,0);
});
function active(stage=0){const r=new Race(stage);r.start();for(let i=0;i<181;i++)r.update(1/60,idleInput);return r}
function advance(r:Race,seconds:number,input=idleInput){for(let i=0;i<seconds*120;i++)r.update(1/120,input)}
test('countdown gates controls and pause freezes the complete simulation',()=>{
 const r=new Race(0);r.start();r.update(.2,{...idleInput,throttle:true});assert.equal(r.distance,0);
 advance(r,3);assert.equal(r.phase,'racing');r.paused=true;const before=JSON.stringify(r);r.update(.2,{...idleInput,throttle:true});assert.equal(JSON.stringify(r),before);
});
test('continuous steering has intermediate positions and shoulder slows the bike',()=>{
 const r=active();r.speed=50;advance(r,.2,{...idleInput,steer:1,throttle:true});assert.ok(r.x>.1&&r.x<.5);
 const roadSpeed=r.speed;r.x=1.2;advance(r,.3,{...idleInput,throttle:true});assert.ok(r.speed<roadSpeed);
});
test('curves exert a stronger outward force at racing speed',()=>{
 const slow=active(),fast=active();slow.distance=fast.distance=400;slow.speed=10;fast.speed=60;
 advance(slow,.2);advance(fast,.2);assert.ok(fast.x>slow.x+.03);
});
test('punch hits only nearby riders; stamina depletion knocks a rival down',()=>{
 const r=active();r.rivals.forEach(v=>{v.distance=1000});const victim=r.rivals[0];victim.distance=2;victim.x=.26;victim.speed=0;victim.attack=50;
 advance(r,.1,{...idleInput,punch:true});assert.equal(r.hits,1);assert.ok(victim.stamina<70);
 advance(r,1.1,{...idleInput,punch:true});assert.ok(victim.down>0);assert.ok(r.hits>=3);
 const hits=r.hits;advance(r,1,{...idleInput,punch:true});assert.equal(r.hits,hits);
});
test('kick pushes an adjacent rival away; distant attacks miss',()=>{
 const r=active();r.rivals.forEach(v=>{v.distance=900});const victim=r.rivals[0];victim.distance=2;victim.x=.3;victim.speed=0;victim.attack=50;
 advance(r,.02,{...idleInput,kick:true});assert.ok(victim.x>.6);assert.ok(victim.stamina>99);
 victim.distance=500;advance(r,1,{...idleInput,punch:true});assert.equal(r.hits,1);
});
test('nearby rivals attack and exhausted rider stamina causes a fall',()=>{
 const r=active();r.rivals.forEach(v=>{v.distance=1000});const attacker=r.rivals[0];attacker.distance=1;attacker.x=.25;attacker.speed=0;attacker.attack=0;r.stamina=10;
 advance(r,.05);assert.equal(r.phase,'crashed');assert.equal(r.crashes,1);
});
test('traffic collision ejects rider; brake holds return; automatic remount has protection',()=>{
 const r=active();r.rivals.forEach(v=>v.distance=1000);r.speed=45;r.cars[0].distance=3;r.cars[0].x=0;r.cars[0].speed=0;
 advance(r,.05);assert.equal(r.phase,'crashed');assert.equal(r.trafficHits,1);assert.equal(r.condition,78);
 advance(r,1.5);assert.equal(r.phase,'returning');const distance=r.distance;
 advance(r,1,{...idleInput,brake:true});assert.equal(r.distance,distance);
 advance(r,3);assert.equal(r.phase,'racing');assert.ok(r.invulnerable>0);assert.equal(r.stamina>=80,true);
});
test('five crashes wreck the bike and stop further movement',()=>{
 const r=active();for(let i=0;i<5;i++){r.invulnerable=0;r.phase='racing';r.crash('test collision')}
 assert.equal(r.phase,'wrecked');const distance=r.distance;advance(r,3,{...idleInput,throttle:true});assert.equal(r.distance,distance);
});
test('nitro uses one charge per press and grants a limited speed burst',()=>{
 const r=active();r.speed=40;advance(r,2,{...idleInput,throttle:true,nitro:true});assert.equal(r.nitroCharges,2);assert.ok(r.speed>60);
 advance(r,1,{...idleInput,throttle:true,nitro:true});assert.equal(r.nitroCharges,2);assert.ok(r.speed<=60);
 advance(r,.1);advance(r,.1,{...idleInput,nitro:true});assert.equal(r.nitroCharges,1);
});
import { parseSave, freshSave, recordResult, elevation, roadCenter } from '../src/race.js';
test('finishing freezes placement by crossing order and unlocks only top-three results',()=>{
 const r=active();r.distance=r.track.length-1;r.speed=50;r.rivals.forEach((v,i)=>{v.distance=i<2?r.track.length:0;v.finishTime=i<2?0:null});
 advance(r,.1,{...idleInput,throttle:true});assert.equal(r.phase,'finished');assert.equal(r.finishPlace,3);
 const saved=recordResult(freshSave(),r);assert.equal(saved.unlocked,1);assert.equal(saved.medals[0],true);assert.ok(saved.best[0]!>0);
 const before=r.distance;advance(r,3,{...idleInput,throttle:true});assert.equal(r.distance,before);
 r.finishPlace=4;assert.equal(recordResult(freshSave(),r).unlocked,0);
});
test('save parser tolerates corruption and round-trips completed progress',()=>{
 assert.deepEqual(parseSave('{oops'),freshSave());assert.deepEqual(parseSave(null),freshSave());
 const s={version:1 as const,unlocked:2,medals:[true,true,false],best:[80,90,null]};assert.deepEqual(parseSave(JSON.stringify(s)),s);
 const malformed=parseSave('{"version":1,"unlocked":999,"best":[-10,"oops"],"medals":["true"]}');assert.equal(malformed.unlocked,2);assert.equal(malformed.best[0],null);assert.equal(malformed.medals[0],false);
});
test('routes contain actual curved and elevated sections; new races reset transient state',()=>{
 assert.notEqual(elevation(400),elevation(800));assert.notEqual(roadCenter(400),roadCenter(800));
 const r=new Race(1);assert.equal(r.condition,100);assert.equal(r.hits,0);assert.equal(r.nitroCharges,3);assert.equal(r.phase,'grid');
});
test('bounded normal-input ride can reach the finish, without teleporting',()=>{
 const r=active();for(let t=0;t<160*120&&!['finished','wrecked'].includes(r.phase);t++){
  // Feedback steering is normal input through the same interface as keyboard control.
  const danger=r.cars.find(c=>c.distance-r.distance>0&&c.distance-r.distance<75);
  const target=danger?(danger.x>0?-.2:.2):0;
  r.update(1/120,{...idleInput,throttle:true,steer:Math.max(-1,Math.min(1,(target-r.x)*4)),punch:true,nitro:r.distance>1800&&r.distance<1800.5});
 }
 assert.equal(r.phase,'finished');assert.ok(r.time<160);assert.ok(r.distance===r.track.length);
});
