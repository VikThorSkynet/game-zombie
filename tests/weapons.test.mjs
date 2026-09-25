import test from 'node:test';
import assert from 'node:assert/strict';
import {WEAPON_STATS,weaponRangeMultiplier,weaponAmmoPrice,weaponMultiplier,BALANCE,RARITIES} from '../game-systems.mjs';
test('range retains close impact, falls continuously and has a bounded floor',()=>{
    for(const [id,w] of Object.entries(WEAPON_STATS)){
        assert(Object.isFrozen(w));
        assert.equal(weaponRangeMultiplier(id,0),1);
        assert.equal(weaponRangeMultiplier(id,w.falloffStart),1);
        assert(Math.abs(weaponRangeMultiplier(id,w.falloffEnd)-w.minDamage)<1e-9);
        let previous=1;
        for(let distance=0;distance<=220;distance++){const value=weaponRangeMultiplier(id,distance);assert(value<=previous&&value>=w.minDamage-1e-9);previous=value;}
    }
    assert.equal(weaponRangeMultiplier('sniper',150),1);
    assert.equal(weaponRangeMultiplier('shotgun',28),.25);
});
test('weapon choices trade close cadence, range, penetration and ammunition cost',()=>{
    const w=WEAPON_STATS;
    assert(w.smg.damageBody/w.smg.fireRate>w.assault_rifle.damageBody/w.assault_rifle.fireRate);
    assert(w.smg.damageBody*weaponRangeMultiplier('smg',50)/w.smg.fireRate<w.assault_rifle.damageBody*weaponRangeMultiplier('assault_rifle',50)/w.assault_rifle.fireRate);
    assert(w.sniper.damageHead>w.ray_gun.damageHead);
    assert.equal(w.sniper.penetration,3);assert.equal(w.ray_gun.penetration,2);
    assert(w.shotgun.spread>w.smg.spread&&w.shotgun.adsSpread>w.smg.adsSpread);
    assert(weaponAmmoPrice({configId:'pistol'})<weaponAmmoPrice({configId:'smg'}));
    assert(weaponAmmoPrice({configId:'ray_gun'})>weaponAmmoPrice({configId:'sniper'}));
});
test('rarity and PaP scale damage without bypassing distance or the special category',()=>{
    for(const id of Object.keys(WEAPON_STATS))for(let rarity=0;rarity<RARITIES.length;rarity++){
        const w={configId:id,rarity,packapunched:true};
        assert.equal(weaponMultiplier(w),(id==='ray_gun'?1:RARITIES[rarity].multiplier)*BALANCE.upgrades.damage);
        assert(weaponAmmoPrice(w)>weaponAmmoPrice({...w,packapunched:false}));
        const near=WEAPON_STATS[id].damageBody*weaponMultiplier(w);
        assert(near*weaponRangeMultiplier(id,50)<=near);
    }
});
