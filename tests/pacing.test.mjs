import test from 'node:test';
import assert from 'node:assert/strict';
import {BOSS_PHASES,bossAttackHits,campaignThreatRound,ContainmentCampaign,WaveDirector,waveProfile,DogAttack,BALANCE} from '../game-systems.mjs';
test('boss phases have distinct readable danger regions and a safe annulus centre',()=>{
    assert(bossAttackHits(1,0));assert(!bossAttackHits(1,3));
    assert(!bossAttackHits(2,0));assert(!bossAttackHits(2,2.49));assert(bossAttackHits(2,2.5));assert(!bossAttackHits(2,6));
    assert(bossAttackHits(3,4.9));assert(!bossAttackHits(3,5));
    for(const p of BOSS_PHASES){assert(p.windup>=1.5);assert(p.recovery>=2);assert(Object.isFrozen(p));}
});
test('campaign reinforcements stay bounded across early, late and invalid wave input',()=>{
    for(const [input,expected] of [[1,5],[7,7],[10,10],[100,10],[Infinity,5],[NaN,5]])assert.equal(campaignThreatRound(input),expected);
});
test('phase health stays fixed and pause cannot spend the shield',()=>{
    const c=new ContainmentCampaign();c.stage='ready';c.start(true);
    const hp=c.health;c.step(60,false);assert.equal(c.health,hp);assert.equal(c.shield,2);
    c.step(2,true);assert.equal(c.hit(999999),800);assert.equal(c.health,1600);
    assert.equal(c.hit(999999),0);c.step(2,true);assert.equal(c.hit(999999),800);
});
test('wave scheduling retries failures without consuming reinforcements or bursting',()=>{
    for(const round of [1,5,8,10,15,20,100]){
        const w=new WaveDirector(24);w.start(round,waveProfile(round,24));
        w.acknowledgeSpawn(false);assert.equal(w.spawned,0);
        assert.equal(w.step(100,0),'spawn');w.acknowledgeSpawn(true);assert.equal(w.spawned,1);
        assert.equal(w.step(0,0),null);const timer=w.spawnTimer;w.step(20,0,false);assert.equal(w.spawnTimer,timer);
    }
    const dog=new DogAttack();dog.step(0,4,true);dog.step(10,4,true,false);assert.equal(dog.remaining,BALANCE.dogs.windup);
});
