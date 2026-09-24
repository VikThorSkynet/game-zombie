module.exports=async function(page,assert,quality,releaseTag) {
    const result=await page.evaluate(async()=>{
        const q=qa,T=q.THREE,c={};
        const approach=()=>{const portal=q.areaPortals[0];q.camera.position.copy(portal.position).add(new T.Vector3(0,1.8,-2));q.controls.isLocked=true;return portal;};
        const unlock=()=>{for(let n=0;n<3;n++)q.generatorNetwork.completed.add(n);q.generatorNetwork.openDoor();q.setContainmentDoor(true);};
        const interval=()=>{q.waveDirector.phase='intermission';q.waveDirector.remaining=7.5;};
        const snapshot=()=>JSON.stringify({health:q.health,score:q.score,armor:[q.armor.tier,q.armor.protection,q.armor.reserve],scrap:q.scrap.amount,
            weapons:q.weapons.map(w=>[w.configId,w.ammoInMag,w.reserveAmmo,w.rarity,w.packapunched,w.model.uuid]),slot:q.currentWeaponIndex,perks:q.perks,bonuses:q.bonuses,
            wave:[q.waveDirector.number,q.waveDirector.phase,q.waveDirector.remaining,q.waveDirector.spawned],generators:[...q.generatorNetwork.completed],door:q.generatorNetwork.open});
        q.resetGame();let portal=approach();interval();c.locked=!await q.travelArea(portal);
        unlock();q.startWave(3);portal=approach();c.combat=!await q.travelArea(portal);
        interval();q.generatorNetwork.active={id:0};c.objective=!await q.travelArea(portal);q.generatorNetwork.active=null;
        q.armor.reserve=1;q.startArmorPlate();c.busy=!await q.travelArea(portal);q.armor.cancel();
        q.score=20000;for(const p of q.perkMachines){q.camera.position.copy(p.mesh.position).add(new T.Vector3(0,1.8,3));q.interact();}
        c.perksPurchased=q.perks.every(Boolean);portal=approach();q.applyPowerup('double_points');
        q.applyDamage(17);q.score=1234;q.scrap.amount=231;q.armor.tier=2;q.armor.protection=37;q.armor.reserve=2;
        q.weapons[0].rarity=3;q.weapons[0].packapunched=true;q.weapons[0].ammoInMag=7;
        q.spawnPowerup(new T.Vector3(4,0,141),'max_ammo');const drop=q.powerups.at(-1),life=drop.userData.life;
        const before=snapshot(),city=q.scene,colliders=q.staticColliders.length;
        const pending=q.travelArea(portal);c.loading=q.areaRuntime.loading&&q.waveDirector.holds.has('area-loading');
        q.updateWave(100);c.freeze=q.waveDirector.remaining===7.5;c.duplicate=!await q.travelArea(portal);
        c.enter=await pending;
        c.preserved=snapshot()===before;
        c.separate=q.areaRuntime.active==='installation'&&q.scene!==city&&q.camera.parent===q.scene&&q.generators.length===0&&q.ammoStations.length===1;
        c.walls=q.isPositionBlocked(22,0,.65)&&q.isPositionBlocked(0,30,.65)&&!q.isPositionBlocked(0,0,.65);
        c.paths=q.findNavigationPath(new T.Vector3(0,0,25),new T.Vector3(0,0,-26),.65).length>0;
        c.spawns=Array.from({length:30},()=>q.getSpawnPosition()).every(p=>p&&Math.abs(p.x)<22&&Math.abs(p.z)<30&&p.distanceTo(q.camera.position)>=20);
        c.paused=!q.controls.isLocked&&!q.waveDirector.holds.has('area-loading');
        portal=approach();c.return=await q.travelArea(portal);
        c.city=snapshot()===before&&q.scene===city&&q.staticColliders.length===colliders&&q.powerups.includes(drop)&&drop.userData.life===life&&q.generators.length===3;
        const samples=[];
        for(let n=0;n<6;n++) {
            await q.travelArea(approach());await q.travelArea(approach());q.renderScene();
            samples.push({...q.renderer.info.memory});
        }
        c.bounded=q.areaRuntime.cache.size===2&&samples.slice(1).every(m=>m.geometries<=samples[0].geometries&&m.textures<=samples[0].textures);
        c.sameState=snapshot()===before;
        // Failure during first construction must restore the original world and interaction graph.
        q.resetGame();unlock();interval();portal=approach();const original=q.areaRuntime.prepare,old=q.scene,pos=q.camera.position.clone();
        q.areaRuntime.prepare=target=>{original(target);throw new Error('Simulated area construction failure');};
        c.failure=!await q.travelArea(portal)&&q.scene===old&&q.areaRuntime.active==='city'&&q.camera.position.equals(pos)&&!q.areaRuntime.loading&&q.generators.length===3;
        q.areaRuntime.prepare=original;
        await q.travelArea(approach());
        // Run real spawns and navigation inside, then exercise special-round spawns too.
        q.controls.isLocked=true;q.startWave(4);
        for(let n=0;n<8;n++)q.updateWave(1);
        c.interiorCombat=q.zombies.length>0&&q.zombies.every(z=>Math.abs(z.position.x)<22&&Math.abs(z.position.z)<30);
        for(let n=0;n<20;n++)q.updateZombies(.05);
        for(const z of [...q.zombies])q.killZombie(z,{awardScore:false,allowPowerup:false});
        q.startWave(5);for(let n=0;n<6;n++)q.updateWave(1);
        c.dogs=q.zombies.length===4&&q.zombies.every(z=>z.userData.isDog);
        q.resetGame();c.reset=q.areaRuntime.active==='city'&&q.areaRuntime.cache.size===0&&!q.areaRuntime.loading&&q.areaPortals.length===1&&q.generators.length===3&&!q.generatorNetwork.open;
        unlock();interval();portal=approach();const canceled=q.travelArea(portal);q.resetGame();
        c.cancel=!await canceled&&q.areaRuntime.active==='city'&&!q.areaRuntime.loading&&!q.waveDirector.holds.size;
        unlock();interval();approach();document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));
        c.keyboard=q.areaRuntime.loading;
        while(q.areaRuntime.loading)await new Promise(resolve=>requestAnimationFrame(resolve));
        c.keyboard=c.keyboard&&q.areaRuntime.active==='installation';
        q.resetGame();q.controls.isLocked=false;return {checks:c,memory:samples};
    });
    assert(Object.values(result.checks).every(Boolean),JSON.stringify({quality,areas:result}));console.log(JSON.stringify({quality,areas:result}));
    if(process.env.QA_SCREENSHOTS) {
        await page.evaluate(async()=>{
            const q=qa,T=q.THREE;q.resetGame();for(let n=0;n<3;n++)q.generatorNetwork.completed.add(n);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
            q.waveDirector.phase='intermission';q.waveDirector.remaining=7.5;q.camera.position.set(0,1.8,143);q.controls.isLocked=true;
            await q.travelArea(q.areaPortals[0]);q.camera.position.set(4,1.8,21);q.camera.lookAt(0,1,-18);
            q.updateUI();q.updateWeapon(0);document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';q.renderScene();
        });
        await page.screenshot({path:require('node:path').join(process.env.QA_SCREENSHOTS,`${releaseTag}-installation-${quality}.png`)});
        await page.evaluate(()=>qa.resetGame());
    }
};
