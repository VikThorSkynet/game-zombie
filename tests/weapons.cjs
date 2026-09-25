module.exports=async(page,assert,quality)=>{
    const checks=await page.evaluate(()=>{
        const q=qa,T=q.THREE,results=[];
        // Isolate target-range damage from world cover; wall checks remain in smoke/progression.
        const blockers=q.bulletBlockers.splice(0);
        try{
            for(const id of Object.keys(q.WEAPON_STATS))for(const pap of [false,true])for(const distance of [5,20,50]){
                q.resetGame();q.controls.isLocked=true;
                const w=q.weapons[0];w.configId=id;w.rarity=id==='ray_gun'?0:2;w.packapunched=pap;
                const cfg=q.weaponConfigs[id];q.createZombie(new T.Vector3(0,0,-distance));
                const target=q.zombies.at(-1);target.userData.health=1e6;
                q.camera.position.set(0,1.8,0);q.camera.lookAt(0,1.4,-distance);q.scene.updateMatrixWorld(true);
                const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(),q.camera);
                const hit=ray.intersectObjects(q.zombieHitMeshes,false).find(h=>h.object.userData.parentZombie===target);
                let event;const off=q.gameEvents.on('enemyDamaged',e=>event=e);
                if(id==='ray_gun')q.fireLaser(cfg.damageHead,cfg.damageBody,0,cfg.penetration);
                else q.fireBullet(cfg.damageHead,cfg.damageBody,0,cfg.penetration,false,false);
                off();
                const expected=(event?.headshot?cfg.damageHead:cfg.damageBody)*q.weaponMultiplier(w)*q.weaponRangeMultiplier(id,hit.distance);
                if(!event||Math.abs(event.amount-expected)>1e-6)throw Error(id+' range damage '+distance);
                // Real supply purchase: exact price, correct capacity, no charge when full.
                w.ammoInMag=0;w.reserveAmmo=0;const price=q.weaponAmmoPrice(w);q.score=price;
                q.interactSupply(q.ammoStations[0]);
                const mag=Math.ceil(cfg.magSize*(pap?q.BALANCE.upgrades.magazine:1));
                if(q.score!==0||w.ammoInMag!==mag||w.reserveAmmo!==mag*4)throw Error(id+' refill');
                q.score=price;q.interactSupply(q.ammoStations[0]);if(q.score!==price)throw Error('full refill charged');
                w.ammoInMag=0;w.reserveAmmo=0;q.score=price-1;q.interactSupply(q.ammoStations[0]);
                if(q.score!==price-1||w.ammoInMag!==0)throw Error('unaffordable refill');
                results.push({id,pap,distance});
            }
            // Penetration consumes distinct targets, including upgraded energy shots.
            for(const id of ['sniper','ray_gun']){
                q.resetGame();q.controls.isLocked=true;q.weapons[0].configId=id;
                const cfg=q.weaponConfigs[id],targets=[];
                for(let i=0;i<4;i++){q.createZombie(new T.Vector3(0,0,-5-i*3));const z=q.zombies.at(-1);z.userData.health=1e6;targets.push(z);}
                q.camera.lookAt(0,1.4,-30);q.scene.updateMatrixWorld(true);
                if(id==='ray_gun')q.fireLaser(cfg.damageHead,cfg.damageBody,0,cfg.penetration);
                else q.fireBullet(cfg.damageHead,cfg.damageBody,0,cfg.penetration,false,false);
                if(targets.filter(z=>z.userData.health<1e6).length!==cfg.penetration)throw Error(id+' penetration');
            }
            // Exercise the actual trigger, not just the single-ray helpers.
            for(const id of Object.keys(q.WEAPON_STATS)){
                q.resetGame();q.controls.isLocked=true;
                const w=q.weapons[0],cfg=q.weaponConfigs[id];w.configId=id;w.ammoInMag=cfg.magSize;
                q.createZombie(new T.Vector3(0,0,-5));q.zombies.at(-1).userData.health=1e6;
                q.camera.lookAt(0,1.4,-5);q.scene.updateMatrixWorld(true);
                let hits=0,shots=0;const offHit=q.gameEvents.on('enemyDamaged',()=>hits++),offShot=q.gameEvents.on('weaponFired',()=>shots++);
                const random=Math.random;
                try{Math.random=()=>.5;q.shoot();q.shoot();}finally{Math.random=random;offHit();offShot();}
                if(shots!==1||hits!==cfg.pellets||w.ammoInMag!==cfg.magSize-1)throw Error(id+' trigger/pellets/cooldown');
            }
            return results.length;
        }finally{q.bulletBlockers.push(...blockers);q.resetGame();q.controls.isLocked=false;}
    });
    assert.equal(checks,36);console.log(JSON.stringify({quality,p3DamageAndPurchases:checks,penetration:true}));
};
