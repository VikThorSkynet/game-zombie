import test from 'node:test';
import assert from 'node:assert/strict';
import {MetricHistogram,PlaytestMetrics,GPUFrameTimer} from '../telemetry.mjs';
test('frame percentiles retain stalls and report overflow',()=>{
    const h=new MetricHistogram();for(let n=1;n<=100;n++)h.add(n);h.add(NaN);
    assert.deepEqual(h.report(),{samples:100,medianMs:50,p95Ms:95,meanMs:50.5,maxMs:100,over50ms:50,overflow10s:0});
    h.add(12000);assert.equal(h.report().overflow10s,1);
});
test('shot accuracy deduplicates pellets and penetration, excludes melee, keeps weapon totals',()=>{
    const m=new PlaytestMetrics();m.event({type:'weaponFired',weapon:'shotgun'});
    for(let n=0;n<8;n++)m.event({type:'enemyDamaged',cause:'bullet',headshot:true});
    for(let n=0;n<2;n++)m.event({type:'enemyKilled',cause:'bullet'});
    m.endShot();m.event({type:'enemyDamaged',cause:'melee'});
    m.event({type:'weaponFired',weapon:'pistol'});m.endShot();
    const r=m.report();assert.equal(r.totals.accuracy,.5);assert.equal(r.totals.shotsPerFirearmKill,1);assert.equal(r.weapons.shotgun.hitShots,1);assert.equal(r.weapons.shotgun.kills,2);
});
test('economy, wave clock, death and reset remain independent of truncated event log',()=>{
    const m=new PlaytestMetrics();m.event({type:'waveStarted',wave:1,kind:'normal'});m.tick(60,45);
    m.event({type:'waveCompleted'});m.event({type:'doorOpened',wave:1});m.tick(10,10);m.event({type:'doorOpened',wave:2});
    for(let n=0;n<6000;n++)m.event({type:'income',currency:'points',amount:100});
    m.event({type:'purchase',currency:'points',item:'ammo',cost:250});
    m.event({type:'playerDamaged',cause:'dog-lunge',lostHealth:100});m.event({type:'gameEnded',outcome:'death',wave:2});m.tick(50,50);
    const r=m.report();assert.equal(r.activeSeconds,70);assert.equal(r.simulationSeconds,55);assert.equal(r.waves[0].durationSeconds,60);assert.equal(r.milestones.gate.wave,1);assert.equal(r.economy.points.earned,600000);assert.equal(r.economy.points.spent,250);assert.equal(r.lastDamage.cause,'dog-lunge');assert.equal(r.events.length,5000);assert(r.droppedEvents>0);
    r.economy.points.earned=0;assert.equal(m.report().economy.points.earned,600000);m.reset();assert.equal(m.report().totals.deaths,0);assert.equal(m.report().activeSeconds,0);
});
test('performance windows reset independently and retain resolution/resource extremes',()=>{
    const m=new PlaytestMetrics();m.tick(30,30);m.event({type:'income',currency:'points',amount:100});
    for(const width of [1920,960,1440])m.frame('city:normal',16,3,{calls:20,triangles:100,width,height:1080,geometries:12});
    assert.deepEqual(m.report().performance['city:normal'].ranges.width,{min:960,max:1920});
    m.clearPerformance();assert.equal(m.report().metadata.performanceStartActiveSeconds,30);assert.deepEqual(m.report().performance,{});assert.equal(m.report().economy.points.earned,100);
});
test('GPU queries do not read pending results, discard disjoint work and release objects',()=>{
    let ready=false,disjoint=false,deleted=0,reads=0;const seen=[];
    const gl={QUERY_RESULT_AVAILABLE:1,QUERY_RESULT:2,getExtension:()=>({GPU_DISJOINT_EXT:3,TIME_ELAPSED_EXT:4}),createQuery:()=>({}),isContextLost:()=>false,getParameter:()=>disjoint,beginQuery(){},endQuery(){},deleteQuery(){deleted++;},getQueryParameter(q,key){if(key===1)return ready;reads++;return 2500000;}};
    const t=new GPUFrameTimer(gl,(...args)=>seen.push(args));const window={};t.end(t.begin('city',window));t.poll();assert.equal(reads,0);
    ready=true;t.poll();assert.deepEqual(seen,[['city',2.5,window]]);assert.equal(deleted,1);
    t.counter=0;t.end(t.begin('boss',window));disjoint=true;t.poll();assert.equal(t.discarded,1);assert.equal(seen.length,1);assert.equal(deleted,2);
    disjoint=false;t.counter=0;t.end(t.begin('menu',window));t.clear();assert.equal(deleted,3);assert.equal(t.pending.length,0);
    assert.equal(new GPUFrameTimer({getExtension:()=>null},()=>{}).begin('none',window),null);
});
