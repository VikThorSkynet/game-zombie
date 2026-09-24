import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BALANCE, WaveDirector, GameEvents, FieldJournal, readRecords, enemyHealth, enemyDamage, enemySpeed, areaTravelReason,
    ArmorState, ScrapWallet, GeneratorNetwork, DogAttack, waveProfile, stepFog, RARITIES, rarityOf, rarityUpgrade, rollRarity, weaponMultiplier, killReward } from '../game-systems.mjs';

test('journal contracts are finite, optional, equipment-aware and pay only once',()=>{
    const j=new FieldJournal();j.offer(1);assert.equal(j.contract.type,'melee');assert.equal(j.accept(false),false);assert(j.accept());
    const kill=(id,extra={})=>j.kill({enemyId:id,wave:1,cause:'melee',reward:125,...extra});
    assert.equal(kill(0,{reward:0}),0);assert.equal(j.contract.progress,0);
    assert.equal(kill(1),0);assert.equal(kill(1),0);assert.equal(kill(2,{cause:'bullet'}),0);
    assert.equal(kill(3,{wave:2}),0);assert.equal(kill(4),0);assert.equal(kill(5),300);assert.equal(kill(6),0);
    assert.equal(j.completed,1);j.offer(1);assert.equal(j.contract.status,'completed');
    j.offer(4,'normal',false);assert.equal(j.contract.type,'kills');j.accept();j.finish();assert.equal(j.contract.status,'failed');
    j.offer(6);assert.equal(j.contract.type,'head');j.accept();j.abandon();assert.equal(j.accept(),false);
    j.offer(5,'dogs');assert.equal(j.contract.type,'kills');j.finish();assert.equal(j.contract.status,'expired');
    assert(j.discover('gate','Gate'));assert(!j.discover('gate','Duplicate'));assert.equal(j.entries.length,1);
    j.reset();assert.equal(j.completed,0);assert.equal(j.entries.length,0);assert.equal(j.contract,null);
});
test('records reject corrupt, negative, non-integer and unsafe stored values',()=>{
    for(const value of ['{broken','null','[]','{"wave":-1,"kills":1.5,"challenges":"9"}'])assert.deepEqual(readRecords(value),{wave:0,kills:0,challenges:0});
    assert.deepEqual(readRecords('{"wave":8,"kills":100,"challenges":2}'),{wave:8,kills:100,challenges:2});
});

test('area travel requires unlocked passage, intermission and no active action or objective',()=>{
    const valid={phase:'intermission',unlocked:true,objective:false,busy:false};
    assert.equal(areaTravelReason(valid),'');
    for(const change of [{phase:'combat'},{unlocked:false},{objective:true},{busy:true}])assert.notEqual(areaTravelReason({...valid,...change}),'');
});

test('special schedule has no adjacent events and caps finite dog populations',()=>{
    let lastDog=0,lastSpecial=0;
    for(let n=1;n<=100;n++) {
        const p=waveProfile(n,24);
        if(p.kind!=='normal'){assert(n-lastSpecial>1);lastSpecial=n;}
        if(p.kind==='dogs') {
            assert(lastDog?[5,6].includes(n-lastDog):n===5);lastDog=n;
            assert(p.cap>=4&&p.cap<=8&&p.total>=p.cap&&p.total<=24);
        }
        if(p.kind==='fog'){assert(n>=8);assert(p.cap<24);assert.equal(p.fogDensity,.05);}
        const d=new WaveDirector(24);d.start(n,p);
        let count=0;while(count<p.total){assert.equal(d.step(1,0),'spawn');d.acknowledgeSpawn(true);count++;}
        assert.equal(d.step(1,1),null);assert.equal(d.step(1,0),'completed');
        assert.equal(d.step(10,0),'next');assert.equal(d.step(1,0),null);
        d.reset();assert.equal(d.maxActive,24);assert.equal(d.profile,null);
    }
    assert.equal(waveProfile(8).kind,'fog');
    assert.equal(stepFog(.006,.05,1),.014);
    assert.equal(stepFog(.006,.05,100),.05);
    assert.equal(stepFog(.05,.006,100),.006);
    assert.equal(stepFog(.02,.05,3,false),.02);
});

test('dog telegraphs, attacks once, recovers and freezes when paused',()=>{
    const a=new DogAttack();a.step(1,3,false);assert.equal(a.phase,'pursue');
    a.step(0,3,true);assert.equal(a.phase,'windup');assert.equal(a.consumeHit(),false);
    a.step(1,3,true,false);assert.equal(a.remaining,.7);
    a.step(.69,3,true);assert.equal(a.phase,'windup');
    a.step(.02,3,true);assert.equal(a.phase,'lunge');
    assert(a.consumeHit());assert.equal(a.consumeHit(),false);
    a.step(.36,3,true);assert.equal(a.phase,'recover');assert.equal(a.consumeHit(),false);
    a.step(.96,3,true);assert.equal(a.phase,'pursue');
    a.step(0,3,true);a.recover();assert.equal(a.phase,'recover');
});

test('generators retain progress, finite budgets and unique rewards across activation order', () => {
    const g=new GeneratorNetwork();
    assert.equal(g.start(-1),false);assert.equal(g.openDoor(),false);
    for(const [order,id] of [2,0,1].entries()) {
        assert(g.start(id));assert.equal(g.start((id+1)%3),false);
        assert.equal(g.active.duration,[25,35,45][order]);
        assert.equal(g.step(5,false,0),null);assert.equal(g.active.elapsed,0);
        assert.equal(g.step(5,true,0,false),null);assert.equal(g.active.elapsed,0);
        assert.equal(g.step(1,true,0),'spawn');g.acknowledgeSpawn(false);
        assert.equal(g.active.spawned,0);
        const budget=g.active.budget;
        for(let n=0;n<budget;n++){assert.equal(g.step(3,true,n),'spawn');g.acknowledgeSpawn(true);}
        assert.equal(g.step(100,true,1),null);
        assert.equal(g.active.spawned,budget);
        assert.equal(g.step(0,true,0),'completed');assert.equal(g.step(100,true,0),null);
        assert.equal(g.start(id),false);
    }
    assert(g.openDoor());assert.equal(g.openDoor(),false);
    g.reset();assert.equal(g.completed.size,0);assert.equal(g.open,false);assert.equal(g.active,null);
});

test('spawning has a finite budget, honors simultaneous cap and retries failures without consuming a zombie', () => {
    const director = new WaveDirector(2);
    director.start(1);
    assert.equal(director.total, 7);
    assert.equal(director.step(0, 0), 'spawn');
    director.acknowledgeSpawn(false);
    assert.equal(director.spawned, 0);
    assert.equal(director.step(0.1, 0), null);
    assert.equal(director.step(0.15, 0), 'spawn');
    director.acknowledgeSpawn(true);
    assert.equal(director.step(1, 1), 'spawn');
    director.acknowledgeSpawn(true);
    assert.equal(director.step(100, 2), null);
    assert.equal(director.spawned, 2);
    for (let i = 2; i < 7; i++) {
        assert.equal(director.step(1, 1), 'spawn');
        director.acknowledgeSpawn(true);
    }
    director.acknowledgeSpawn(true);
    assert.equal(director.spawned, 7);
    assert.equal(director.step(1, 1), null, 'last live enemy blocks completion');
    assert.equal(director.step(1, 0), 'completed');
    assert.equal(director.remaining, 10);
    assert.equal(director.step(9, 0), null);
    assert.equal(director.step(1, 0), 'next');
    assert.equal(director.step(1, 0), null, 'next emitted only once');
});

test('pause, overlapping holds, skip and restart cannot advance a wave accidentally', () => {
    const director = new WaveDirector();
    director.start(1);
    assert.equal(director.skipIntermission(), false);
    assert.equal(director.step(20, 0, false), null);
    assert.equal(director.spawned, 0);
    director.holds.add('loading'); director.holds.add('menu');
    director.holds.delete('loading');
    assert.equal(director.step(20, 0), null);
    director.holds.clear();
    for (let i = 0; i < 7; i++) {
        assert.equal(director.step(1, 0), 'spawn'); director.acknowledgeSpawn(true);
    }
    director.advanceHolds.add('generator');
    assert.equal(director.step(30, 0), null);
    director.advanceHolds.delete('generator');
    assert.equal(director.step(0, 0), 'completed');
    const remaining = director.remaining;
    director.step(10, 0, false);
    assert.equal(director.remaining, remaining);
    director.advanceHolds.add('objective');
    assert.equal(director.skipIntermission(), false);
    director.advanceHolds.clear();
    assert.equal(director.skipIntermission(), true);
    assert.equal(director.step(0, 0), 'next');
    director.holds.add('loading'); director.advanceHolds.add('objective');
    director.reset(); director.start(1);
    assert.equal(director.holds.size + director.advanceHolds.size, 0);
    assert.equal(director.step(0, 0), 'spawn');
});

test('100 waves keep correct population totals and exactly one completion per wave', () => {
    const director = new WaveDirector(24);
    for (let round = 1; round <= 100; round++) {
        director.start(round);
        for (let i = 0; i < 4 + round * 3; i++) {
            assert.equal(director.step(1, 0), 'spawn');
            director.acknowledgeSpawn(true);
        }
        assert.equal(director.step(0, 0), 'completed');
        assert.equal(director.step(10, 0), 'next');
        assert.equal(director.step(10, 0), null);
    }
});

test('enemy health grows with progression without changing the speed cap', () => {
    const type = { speedBonus: 1.2 };
    assert.equal(enemyHealth(1), 112);
    assert.equal(enemyHealth(5), 160);
    assert.equal(enemyHealth(20, 2.2), Math.floor(160 * 1.12**15 * 2.2));
    assert(enemyHealth(21) / enemyHealth(20) < enemyHealth(20) / enemyHealth(19));
    assert.equal(enemyDamage(10, 2), 30);
    assert.equal(enemySpeed(15, type, 0.5), enemySpeed(100, type, 0.5));
    assert(enemySpeed(14, type, 0.5) < enemySpeed(15, type, 0.5));
    assert(Object.isFrozen(BALANCE.waves));
});

test('armor requires paid inventory, applies one plate only after active time and caps capacity', () => {
    const armor=new ArmorState();
    assert.equal(armor.start(),false);
    assert.equal(armor.buyPlate(149).ok,false);
    assert.equal(armor.reserve,0);
    assert.equal(armor.buyPlate(150).cost,150);
    assert(armor.start());assert.equal(armor.start(),false);
    armor.step(.5);armor.step(100,false);
    assert.equal(armor.reserve,1);assert.equal(armor.protection,0);
    assert.equal(armor.step(1),true);assert.equal(armor.step(1),false);
    assert.equal(armor.protection,50);assert.equal(armor.reserve,0);
    assert.equal(armor.start(),false);
    assert.equal(armor.upgrade(1499).ok,false);assert.equal(armor.tier,1);
    assert.equal(armor.upgrade(1500).cost,1500);assert.equal(armor.maximum,100);
    assert.equal(armor.protection,50,'upgrade does not grant free protection');
    assert.equal(armor.upgrade(3000).cost,3000);assert.equal(armor.maximum,150);
    assert.equal(armor.upgrade(9999).ok,false);
    for(let i=0;i<5;i++)assert(armor.buyPlate(150).ok);
    assert.equal(armor.buyPlate(150).ok,false);assert.equal(armor.reserve,5);
    armor.start();armor.step(.5);armor.cancel();assert.equal(armor.reserve,5);
    armor.start();armor.reset();armor.step(100);
    assert.deepEqual([armor.tier,armor.protection,armor.reserve,armor.remaining],[1,0,0,0]);
});

test('armor absorbs 60%, spills unabsorbed damage to health and breaks at depletion', () => {
    const armor=new ArmorState();armor.protection=50;
    assert.deepEqual(armor.absorb(50),{healthDamage:20,absorbed:30,broken:false});
    assert.deepEqual(armor.absorb(50),{healthDamage:30,absorbed:20,broken:true});
    assert.deepEqual(armor.absorb(50),{healthDamage:50,absorbed:0,broken:false});
    for(const invalid of [-1,NaN,Infinity,0])assert.equal(armor.absorb(invalid).healthDamage,0);
});

test('rarity purchases are incremental and preserve Pack-a-Punch; Ray Gun is excluded', () => {
    const w={configId:'pistol',rarity:0,packapunched:true};
    assert.equal(rarityUpgrade(w,99).ok,false);assert.equal(w.rarity,0);
    let sum=0;
    for(let i=1;i<5;i++){
        const result=rarityUpgrade(w,RARITIES[i].cost);assert(result.ok);sum+=result.cost;
        assert.equal(w.rarity,i);assert(w.packapunched);
        assert.equal(weaponMultiplier(w),RARITIES[i].multiplier*2.5);
    }
    assert.equal(sum,1200);assert.equal(rarityUpgrade(w,99999).ok,false);
    w.configId='ray_gun';assert.equal(rarityUpgrade(w,99999).ok,false);
    assert.equal(rarityOf(w).name,'Especial');assert.equal(weaponMultiplier(w),2.5);
});

test('box distribution improves with wave and cannot grant early legendary weapons', () => {
    for(let i=0;i<1000;i++){
        const roll=i/1000;
        const tiers=[1,5,10,15].map(round=>rollRarity(round,roll));
        assert(tiers[0]<=1&&tiers[1]<=2&&tiers[2]<=3&&tiers[3]<=4);
        assert(tiers.every((tier,j)=>j===0||tier>=tiers[j-1]));
    }
    assert.equal(rollRarity(15,.99),4);
});

test('reward skill bonus never stacks; scrap cannot be farmed past the round budget', () => {
    assert.equal(killReward('bullet',false),100);
    assert.equal(killReward('bullet',true),125);
    assert.equal(killReward('melee',true),125);
    assert.equal(killReward('melee',false,true),250);
    const wallet=new ScrapWallet();wallet.beginRound(1);
    for(let i=0;i<100;i++)wallet.awardKill();
    assert.equal(wallet.amount,90);wallet.beginRound(1);wallet.awardKill();assert.equal(wallet.amount,90);
    wallet.beginRound(2);assert.equal(wallet.awardKill(),3);assert.equal(wallet.amount,93);
    wallet.reset();assert.equal(wallet.amount,0);
});

test('event subscribers can unsubscribe; payloads are immutable and event name cannot be spoofed', () => {
    const bus = new GameEvents(), seen = [];
    const unsubscribe = bus.on('enemyKilled', event => seen.push(event));
    bus.emit('enemyKilled', { type: 'wrong', cause: 'melee', reward: 10 });
    unsubscribe(); bus.emit('enemyKilled', { cause: 'nuke' });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].type, 'enemyKilled');
    assert.equal(seen[0].cause, 'melee');
    assert(Object.isFrozen(seen[0]));
});
