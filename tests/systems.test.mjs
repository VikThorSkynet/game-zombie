import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BALANCE, WaveDirector, GameEvents, enemyHealth, enemyDamage, enemySpeed,
    ArmorState, ScrapWallet, RARITIES, rarityOf, rarityUpgrade, rollRarity, weaponMultiplier, killReward } from '../game-systems.mjs';

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
